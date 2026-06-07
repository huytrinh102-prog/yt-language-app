import fetch from "node-fetch";
import { fetchTranscript as fetchTranscriptFromYoutube } from "youtube-transcript";

const YOUTUBE_API_URL = "https://www.googleapis.com/youtube/v3/videos";
const YOUTUBE_OEMBED_URL = "https://www.youtube.com/oembed";

const extractYoutubeVideoId = (value = "") => {
  const input = String(value).trim();

  if (!input) return "";

  try {
    const url = new URL(input);

    if (url.hostname.includes("youtu.be")) {
      return url.pathname.split("/").filter(Boolean)[0] || "";
    }

    const watchId = url.searchParams.get("v");
    if (watchId) return watchId;

    const pathParts = url.pathname.split("/").filter(Boolean);
    const markerIndex = pathParts.findIndex((part) =>
      ["embed", "shorts", "live"].includes(part),
    );

    if (markerIndex >= 0 && pathParts[markerIndex + 1]) {
      return pathParts[markerIndex + 1];
    }
  } catch {
    return input;
  }

  return input;
};

const parseIsoDurationToSeconds = (duration = "") => {
  const match = String(duration).match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);

  if (!match) return 0;

  const hours = Number(match[1] || 0);
  const minutes = Number(match[2] || 0);
  const seconds = Number(match[3] || 0);

  return hours * 3600 + minutes * 60 + seconds;
};

const pickThumbnail = (thumbnails = {}) => {
  return (
    thumbnails.maxres?.url ||
    thumbnails.standard?.url ||
    thumbnails.high?.url ||
    thumbnails.medium?.url ||
    thumbnails.default?.url ||
    ""
  );
};

const fetchJson = async (url) => {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    },
  });

  if (!response.ok) {
    throw new Error(`YouTube request failed: ${response.status}`);
  }

  return response.json();
};

const getMetadataFromDataApi = async (videoId) => {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) return null;

  const url = new URL(YOUTUBE_API_URL);
  url.searchParams.set("part", "snippet,contentDetails");
  url.searchParams.set("id", videoId);
  url.searchParams.set("key", apiKey);

  const json = await fetchJson(url.toString());
  const item = json.items?.[0];

  if (!item) return null;

  return {
    youtubeVideoId: videoId,
    title: item.snippet?.title || "",
    description: item.snippet?.description || "",
    thumbnailUrl: pickThumbnail(item.snippet?.thumbnails),
    channelTitle: item.snippet?.channelTitle || "",
    durationSeconds: parseIsoDurationToSeconds(item.contentDetails?.duration),
    language:
      item.snippet?.defaultAudioLanguage || item.snippet?.defaultLanguage || "",
  };
};

const getMetadataFromOembed = async (videoId) => {
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const url = new URL(YOUTUBE_OEMBED_URL);
  url.searchParams.set("url", videoUrl);
  url.searchParams.set("format", "json");

  const json = await fetchJson(url.toString());

  return {
    youtubeVideoId: videoId,
    title: json.title || "",
    description: "",
    thumbnailUrl: json.thumbnail_url || "",
    channelTitle: json.author_name || "",
    durationSeconds: 0,
    language: "",
  };
};

const getYoutubeMetadata = async (input) => {
  const videoId = extractYoutubeVideoId(input);

  if (!videoId) {
    throw new Error("Missing YouTube video id");
  }

  try {
    const dataApiMetadata = await getMetadataFromDataApi(videoId);
    if (dataApiMetadata) return dataApiMetadata;
  } catch (error) {
    console.log("YouTube Data API metadata failed:", error.message);
  }

  return getMetadataFromOembed(videoId);
};

const decodeHtmlEntities = (value = "") => {
  return String(value)
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
};

const normalizeTranscriptRows = (rows = [], fallbackLanguage = "") => {
  const usesMilliseconds = rows.some((row) => Number(row.duration || 0) > 1000);
  const unit = usesMilliseconds ? 1000 : 1;
  const segments = rows
    .map((row) => ({
      start: Math.round(Number(row.offset || 0) / unit),
      duration: Math.max(1, Math.round(Number(row.duration || 0) / unit)),
      text: String(row.text || "")
        .replace(/\s+/g, " ")
        .trim(),
    }))
    .filter((segment) => segment.text);

  return {
    language: rows.find((row) => row.lang)?.lang || fallbackLanguage || "",
    segments,
    rawText: segments.map((segment) => segment.text).join(" "),
  };
};

const fetchTranscriptWithPackage = async (videoId, language = "") => {
  const requestedLanguage = String(language || "").trim();
  const configs = requestedLanguage ? [{ lang: requestedLanguage }, undefined] : [undefined];
  let lastError = null;

  for (const config of configs) {
    try {
      const rows = await fetchTranscriptFromYoutube(videoId, config);

      if (rows.length) {
        return normalizeTranscriptRows(
          rows,
          config?.lang || requestedLanguage || "",
        );
      }
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError) {
    console.log("youtube-transcript failed:", lastError.message);
  }

  return null;
};

const parseJson = (value = "") => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const extractJsonValue = (input = "", startIndex = -1) => {
  if (startIndex < 0) return "";

  const openingChar = input[startIndex];
  const closingChar = openingChar === "{" ? "}" : "]";
  let depth = 0;
  let isInString = false;
  let isEscaped = false;

  for (let index = startIndex; index < input.length; index++) {
    const char = input[index];

    if (isEscaped) {
      isEscaped = false;
      continue;
    }

    if (char === "\\") {
      isEscaped = true;
      continue;
    }

    if (char === '"') {
      isInString = !isInString;
      continue;
    }

    if (isInString) continue;

    if (char === openingChar) depth++;
    if (char === closingChar) depth--;

    if (depth === 0) {
      return input.slice(startIndex, index + 1);
    }
  }

  return "";
};

const parsePlayerResponse = (html = "") => {
  const markerIndex = html.indexOf("ytInitialPlayerResponse");
  const objectStartIndex =
    markerIndex >= 0 ? html.indexOf("{", markerIndex) : -1;
  const playerResponse = parseJson(extractJsonValue(html, objectStartIndex));

  if (playerResponse) return playerResponse;

  const patterns = [
    /ytInitialPlayerResponse\s*=\s*({.+?});\s*<\/script>/s,
    /ytInitialPlayerResponse\s*=\s*({.+?});/s,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);

    if (match?.[1]) {
      const parsed = parseJson(match[1]);
      if (parsed) return parsed;
    }
  }

  return null;
};

const parseCaptionTracksFromHtml = (html = "") => {
  const keyIndex = html.indexOf('"captionTracks"');
  const arrayStartIndex = keyIndex >= 0 ? html.indexOf("[", keyIndex) : -1;
  const captionTracks = parseJson(extractJsonValue(html, arrayStartIndex));

  return Array.isArray(captionTracks) ? captionTracks : [];
};

const getCaptionTracks = async (videoId) => {
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const response = await fetch(watchUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });

  if (!response.ok) {
    throw new Error(`Cannot open YouTube watch page: ${response.status}`);
  }

  const html = await response.text();
  const playerResponse = parsePlayerResponse(html);

  return (
    playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks ||
    parseCaptionTracksFromHtml(html) ||
    []
  );
};

const chooseCaptionTrack = (tracks, requestedLanguage = "") => {
  const language = String(requestedLanguage || "").toLowerCase();

  if (language) {
    const exactTrack = tracks.find(
      (track) => String(track.languageCode || "").toLowerCase() === language,
    );
    if (exactTrack) return exactTrack;

    const prefixTrack = tracks.find((track) =>
      String(track.languageCode || "")
        .toLowerCase()
        .startsWith(language),
    );
    if (prefixTrack) return prefixTrack;
  }

  return (
    tracks.find((track) => track.kind !== "asr") ||
    tracks.find((track) => track.kind === "asr") ||
    tracks[0]
  );
};

const parseJson3Transcript = (json) => {
  return (json.events || [])
    .map((event) => {
      const text = (event.segs || [])
        .map((segment) => segment.utf8 || "")
        .join("")
        .replace(/\s+/g, " ")
        .trim();

      if (!text) return null;

      return {
        start: Math.round((event.tStartMs || 0) / 1000),
        duration: Math.round((event.dDurationMs || 0) / 1000),
        text,
      };
    })
    .filter(Boolean);
};

const parseXmlTranscript = (xml = "") => {
  const matches = [
    ...xml.matchAll(/<text start="([^"]+)" dur="([^"]*)".*?>(.*?)<\/text>/gs),
  ];

  return matches
    .map((match) => ({
      start: Math.round(Number(match[1] || 0)),
      duration: Math.round(Number(match[2] || 0)),
      text: decodeHtmlEntities(match[3] || "")
        .replace(/\s+/g, " ")
        .trim(),
    }))
    .filter((segment) => segment.text);
};

const fetchYoutubeTranscript = async (input, language = "") => {
  const videoId = extractYoutubeVideoId(input);

  if (!videoId) {
    throw new Error("Missing YouTube video id");
  }

  const packageTranscript = await fetchTranscriptWithPackage(videoId, language);

  if (packageTranscript?.segments.length) {
    return {
      youtubeVideoId: videoId,
      language: packageTranscript.language,
      source: "youtube-transcript",
      segments: packageTranscript.segments,
      rawText: packageTranscript.rawText,
    };
  }

  const tracks = await getCaptionTracks(videoId);

  if (!tracks.length) {
    return {
      youtubeVideoId: videoId,
      language: language || "",
      source: "youtube-caption",
      segments: [],
      rawText: "",
    };
  }

  const track = chooseCaptionTrack(tracks, language);
  const captionUrl = new URL(track.baseUrl);
  captionUrl.searchParams.set("fmt", "json3");

  let segments = [];

  try {
    const json = await fetchJson(captionUrl.toString());
    segments = parseJson3Transcript(json);
  } catch {
    captionUrl.searchParams.delete("fmt");
    const response = await fetch(captionUrl.toString());
    const xml = await response.text();
    segments = parseXmlTranscript(xml);
  }

  return {
    youtubeVideoId: videoId,
    language: track.languageCode || language || "",
    source: track.kind === "asr" ? "youtube-auto-caption" : "youtube-caption",
    segments,
    rawText: segments.map((segment) => segment.text).join(" "),
  };
};

export default {
  extractYoutubeVideoId,
  getYoutubeMetadata,
  fetchYoutubeTranscript,
};
