import db from "../models/index.cjs";
import { Op } from "sequelize";
import youtubeService from "./youtubeService.js";

const toPositiveInteger = (value, fallback = 0) => {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) return fallback;
  return Math.round(number);
};

const parseTimeToSeconds = (value = "") => {
  const parts = String(value)
    .split(":")
    .map((part) => Number(part));

  if (parts.some((part) => !Number.isFinite(part))) return 0;

  return parts.reduce((total, part) => total * 60 + part, 0);
};

const parseManualTranscript = (rawText = "") => {
  const lines = String(rawText)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const timedSegments = lines
    .map((line) => {
      const match = line.match(
        /^\[?((?:\d{1,2}:)?\d{1,2}:\d{2}(?:\.\d+)?)\]?\s+(.+)$/,
      );

      if (!match) return null;

      return {
        start: Math.round(parseTimeToSeconds(match[1])),
        duration: 4,
        text: match[2].trim(),
      };
    })
    .filter(Boolean);

  if (timedSegments.length) {
    return timedSegments.map((segment, index) => ({
      ...segment,
      duration: Math.max(
        1,
        (timedSegments[index + 1]?.start || segment.start + 4) - segment.start,
      ),
    }));
  }

  return lines.map((text, index) => ({
    start: index * 5,
    duration: 5,
    text,
  }));
};

const findUserVideo = async (videoId, userId, options = {}) => {
  return db.Video.findOne({
    where: {
      id: videoId,
      createdByUserId: userId,
    },
    ...options,
  });
};

const getYoutubeMetadata = async (input) => {
  try {
    const metadata = await youtubeService.getYoutubeMetadata(input);
    return { EM: "Get YouTube metadata success", EC: 0, DT: metadata };
  } catch (error) {
    console.log(error);
    return {
      EM: "Cannot get YouTube metadata",
      EC: 1,
      DT: "",
    };
  }
};

const syncYoutubeMetadata = async (videoId, userId) => {
  try {
    const video = await findUserVideo(videoId, userId);

    if (!video) {
      return { EM: "Video not found", EC: 1, DT: "" };
    }

    const metadata = await youtubeService.getYoutubeMetadata(video.youtubeVideoId);

    await video.update({
      youtubeVideoId: metadata.youtubeVideoId || video.youtubeVideoId,
      title: metadata.title || video.title,
      description: metadata.description || video.description,
      thumbnailUrl: metadata.thumbnailUrl || video.thumbnailUrl,
      channelTitle: metadata.channelTitle || video.channelTitle,
      durationSeconds: metadata.durationSeconds || video.durationSeconds,
      language: video.language || metadata.language,
    });

    return { EM: "Sync YouTube metadata success", EC: 0, DT: video };
  } catch (error) {
    console.log(error);
    return { EM: "Cannot sync YouTube metadata", EC: 1, DT: "" };
  }
};

const importTranscript = async (videoId, userId, language = "") => {
  try {
    const video = await findUserVideo(videoId, userId);

    if (!video) {
      return { EM: "Video not found", EC: 1, DT: "" };
    }

    const transcriptData = await youtubeService.fetchYoutubeTranscript(
      video.youtubeVideoId,
      language || video.language,
    );

    if (!transcriptData.segments.length) {
      return {
        EM: "No YouTube captions found for this video",
        EC: 1,
        DT: "",
      };
    }

    const transcriptLanguage = transcriptData.language || language || "default";
    const [transcript, created] = await db.Transcript.findOrCreate({
      where: {
        videoId: video.id,
        language: transcriptLanguage,
      },
      defaults: {
        videoId: video.id,
        language: transcriptLanguage,
        source: transcriptData.source,
        segments: transcriptData.segments,
        rawText: transcriptData.rawText,
      },
    });

    if (!created) {
      await transcript.update({
        source: transcriptData.source,
        segments: transcriptData.segments,
        rawText: transcriptData.rawText,
      });
    }

    return {
      EM: "Import transcript success",
      EC: 0,
      DT: transcript,
    };
  } catch (error) {
    console.log(error);
    return {
      EM: error?.message
        ? `Cannot import YouTube transcript: ${error.message}`
        : "Cannot import YouTube transcript",
      EC: 1,
      DT: "",
    };
  }
};

const saveManualTranscript = async (videoId, userId, data = {}) => {
  try {
    const video = await findUserVideo(videoId, userId);

    if (!video) {
      return { EM: "Video not found", EC: 1, DT: "" };
    }

    const rawText = String(data.rawText || "").trim();

    if (!rawText) {
      return { EM: "Transcript content is required", EC: 1, DT: "" };
    }

    const segments = Array.isArray(data.segments)
      ? data.segments
      : parseManualTranscript(rawText);
    const transcriptLanguage = data.language || video.language || "manual";
    const [transcript, created] = await db.Transcript.findOrCreate({
      where: {
        videoId: video.id,
        language: transcriptLanguage,
      },
      defaults: {
        videoId: video.id,
        language: transcriptLanguage,
        source: "manual",
        segments,
        rawText,
      },
    });

    if (!created) {
      await transcript.update({
        source: "manual",
        segments,
        rawText,
      });
    }

    return { EM: "Save transcript success", EC: 0, DT: transcript };
  } catch (error) {
    console.log(error);
    return { EM: "Error from server...", EC: 1, DT: "" };
  }
};

const readTranscripts = async (videoId, userId) => {
  try {
    const video = await findUserVideo(videoId, userId);

    if (!video) {
      return { EM: "Video not found", EC: 1, DT: "" };
    }

    const transcripts = await db.Transcript.findAll({
      where: { videoId: video.id },
      order: [["createdAt", "DESC"]],
    });

    return { EM: "Get transcripts success", EC: 0, DT: transcripts };
  } catch (error) {
    console.log(error);
    return { EM: "Error from server...", EC: 1, DT: "" };
  }
};

const readNotes = async (videoId, userId) => {
  try {
    const video = await findUserVideo(videoId, userId);

    if (!video) {
      return { EM: "Video not found", EC: 1, DT: "" };
    }

    const notes = await db.Note.findAll({
      where: { videoId: video.id, userId },
      order: [
        ["timeSec", "ASC"],
        ["createdAt", "DESC"],
      ],
    });

    return { EM: "Get notes success", EC: 0, DT: notes };
  } catch (error) {
    console.log(error);
    return { EM: "Error from server...", EC: 1, DT: "" };
  }
};

const readAllNotes = async (
  userId,
  page = 1,
  limit = 10,
  search = "",
  sort = "createdAt,desc",
) => {
  try {
    const offset = (+page - 1) * +limit;
    const [field, order] = String(sort || "createdAt,desc").split(",");
    const sortableFields = new Set(["createdAt", "updatedAt", "timeSec"]);
    const sortField = sortableFields.has(field) ? field : "createdAt";
    const sortOrder = String(order || "desc").toUpperCase() === "ASC" ? "ASC" : "DESC";
    const whereCondition = {
      userId,
    };

    if (search) {
      whereCondition[Op.or] = [
        { content: { [Op.like]: `%${search}%` } },
        { "$video.title$": { [Op.like]: `%${search}%` } },
        { "$video.channelTitle$": { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await db.Note.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: db.Video,
          as: "video",
          attributes: [
            "id",
            "youtubeVideoId",
            "title",
            "thumbnailUrl",
            "channelTitle",
            "durationSeconds",
            "language",
            "languageId",
          ],
          required: true,
          where: {
            createdByUserId: userId,
          },
          include: [
            {
              model: db.UserLanguage,
              as: "languageFolder",
              attributes: ["id", "name", "code", "color"],
            },
          ],
        },
      ],
      offset,
      limit: +limit,
      order: [[sortField, sortOrder]],
    });

    return {
      EM: "Get notes success",
      EC: 0,
      DT: {
        totalRows: count,
        totalPages: Math.ceil(count / +limit),
        notes: rows,
      },
    };
  } catch (error) {
    console.log(error);
    return { EM: "Error from server...", EC: 1, DT: "" };
  }
};

const createNote = async (videoId, userId, data) => {
  try {
    const content = String(data.content || "").trim();

    if (!content) {
      return { EM: "Missing note content", EC: 1, DT: "" };
    }

    const video = await findUserVideo(videoId, userId);

    if (!video) {
      return { EM: "Video not found", EC: 1, DT: "" };
    }

    const note = await db.Note.create({
      videoId: video.id,
      userId,
      timeSec: toPositiveInteger(data.timeSec),
      content,
    });

    return { EM: "Create note success", EC: 0, DT: note };
  } catch (error) {
    console.log(error);
    return { EM: "Error from server...", EC: 1, DT: "" };
  }
};

const updateNote = async (id, userId, data) => {
  try {
    const note = await db.Note.findOne({
      where: { id, userId },
    });

    if (!note) {
      return { EM: "Note not found", EC: 1, DT: "" };
    }

    await note.update({
      content:
        data.content !== undefined ? String(data.content).trim() : note.content,
      timeSec:
        data.timeSec !== undefined
          ? toPositiveInteger(data.timeSec)
          : note.timeSec,
    });

    return { EM: "Update note success", EC: 0, DT: note };
  } catch (error) {
    console.log(error);
    return { EM: "Error from server...", EC: 1, DT: "" };
  }
};

const removeNote = async (id, userId) => {
  try {
    const note = await db.Note.findOne({
      where: { id, userId },
    });

    if (!note) {
      return { EM: "Note not found", EC: 1, DT: "" };
    }

    await note.destroy();

    return { EM: "Delete note success", EC: 0, DT: "" };
  } catch (error) {
    console.log(error);
    return { EM: "Error from server...", EC: 1, DT: "" };
  }
};

const readVocabulary = async (videoId, userId) => {
  try {
    const video = await findUserVideo(videoId, userId);

    if (!video) {
      return { EM: "Video not found", EC: 1, DT: "" };
    }

    const vocabulary = await db.VocabularyItem.findAll({
      where: { videoId: video.id, userId },
      order: [["createdAt", "DESC"]],
    });

    return { EM: "Get vocabulary success", EC: 0, DT: vocabulary };
  } catch (error) {
    console.log(error);
    return { EM: "Error from server...", EC: 1, DT: "" };
  }
};

const readAllVocabulary = async (
  userId,
  page = 1,
  limit = 12,
  search = "",
  status = "",
  sort = "createdAt,desc",
  languageId = "",
  videoId = "",
) => {
  try {
    const offset = (+page - 1) * +limit;
    const [field, order] = String(sort || "createdAt,desc").split(",");
    const sortableFields = new Set([
      "createdAt",
      "updatedAt",
      "word",
      "status",
      "reviewAt",
      "timesReviewed",
    ]);
    const sortField = sortableFields.has(field) ? field : "createdAt";
    const sortOrder = String(order || "desc").toUpperCase() === "ASC" ? "ASC" : "DESC";
    const whereCondition = {
      userId,
    };

    if (status && status !== "all") {
      whereCondition.status = status;
    }

    if (videoId) {
      whereCondition.videoId = videoId;
    }

    if (search) {
      whereCondition[Op.or] = [
        { word: { [Op.like]: `%${search}%` } },
        { meaning: { [Op.like]: `%${search}%` } },
        { example: { [Op.like]: `%${search}%` } },
        { "$video.title$": { [Op.like]: `%${search}%` } },
        { "$video.channelTitle$": { [Op.like]: `%${search}%` } },
      ];
    }

    const videoWhereCondition = {
      createdByUserId: userId,
    };

    if (languageId) {
      videoWhereCondition.languageId = languageId;
    }

    const { count, rows } = await db.VocabularyItem.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: db.Video,
          as: "video",
          attributes: [
            "id",
            "youtubeVideoId",
            "title",
            "thumbnailUrl",
            "channelTitle",
            "durationSeconds",
            "language",
            "languageId",
          ],
          required: Boolean(languageId || videoId || search),
          where: videoWhereCondition,
          include: [
            {
              model: db.UserLanguage,
              as: "languageFolder",
              attributes: ["id", "name", "code", "color"],
            },
          ],
        },
      ],
      offset,
      limit: +limit,
      order: [[sortField, sortOrder]],
    });

    return {
      EM: "Get vocabulary success",
      EC: 0,
      DT: {
        totalRows: count,
        totalPages: Math.ceil(count / +limit),
        vocabulary: rows,
      },
    };
  } catch (error) {
    console.log(error);
    return { EM: "Error from server...", EC: 1, DT: "" };
  }
};

const createVocabulary = async (videoId, userId, data) => {
  try {
    const word = String(data.word || "").trim();

    if (!word) {
      return { EM: "Missing vocabulary word", EC: 1, DT: "" };
    }

    const video = await findUserVideo(videoId, userId);

    if (!video) {
      return { EM: "Video not found", EC: 1, DT: "" };
    }

    const item = await db.VocabularyItem.create({
      videoId: video.id,
      userId,
      word,
      meaning: data.meaning || "",
      example: data.example || "",
      language: data.language || video.language || "",
      status: data.status || "new",
    });

    return { EM: "Create vocabulary success", EC: 0, DT: item };
  } catch (error) {
    console.log(error);
    return { EM: "Error from server...", EC: 1, DT: "" };
  }
};

const updateVocabulary = async (id, userId, data) => {
  try {
    const item = await db.VocabularyItem.findOne({
      where: { id, userId },
    });

    if (!item) {
      return { EM: "Vocabulary not found", EC: 1, DT: "" };
    }

    await item.update({
      word: data.word !== undefined ? String(data.word).trim() : item.word,
      meaning: data.meaning ?? item.meaning,
      example: data.example ?? item.example,
      language: data.language ?? item.language,
      status: data.status ?? item.status,
      reviewAt: data.reviewAt ?? item.reviewAt,
      timesReviewed: data.timesReviewed ?? item.timesReviewed,
    });

    return { EM: "Update vocabulary success", EC: 0, DT: item };
  } catch (error) {
    console.log(error);
    return { EM: "Error from server...", EC: 1, DT: "" };
  }
};

const removeVocabulary = async (id, userId) => {
  try {
    const item = await db.VocabularyItem.findOne({
      where: { id, userId },
    });

    if (!item) {
      return { EM: "Vocabulary not found", EC: 1, DT: "" };
    }

    await item.destroy();

    return { EM: "Delete vocabulary success", EC: 0, DT: "" };
  } catch (error) {
    console.log(error);
    return { EM: "Error from server...", EC: 1, DT: "" };
  }
};

const readProgress = async (videoId, userId) => {
  try {
    const video = await findUserVideo(videoId, userId);

    if (!video) {
      return { EM: "Video not found", EC: 1, DT: "" };
    }

    const [progress] = await db.VideoProgress.findOrCreate({
      where: {
        videoId: video.id,
        userId,
      },
      defaults: {
        videoId: video.id,
        userId,
        watchedSeconds: 0,
        completed: false,
      },
    });

    return { EM: "Get progress success", EC: 0, DT: progress };
  } catch (error) {
    console.log(error);
    return { EM: "Error from server...", EC: 1, DT: "" };
  }
};

const updateProgress = async (videoId, userId, data) => {
  try {
    const video = await findUserVideo(videoId, userId);

    if (!video) {
      return { EM: "Video not found", EC: 1, DT: "" };
    }

    const watchedSeconds = toPositiveInteger(data.watchedSeconds);
    const durationSeconds = toPositiveInteger(data.durationSeconds);
    const nextDurationSeconds = durationSeconds || video.durationSeconds || 0;
    const completed =
      data.completed !== undefined
        ? Boolean(data.completed)
        : nextDurationSeconds > 0 && watchedSeconds >= nextDurationSeconds * 0.9;

    if (durationSeconds > 0 && durationSeconds !== video.durationSeconds) {
      await video.update({ durationSeconds });
    }

    const [progress] = await db.VideoProgress.findOrCreate({
      where: {
        videoId: video.id,
        userId,
      },
      defaults: {
        videoId: video.id,
        userId,
        watchedSeconds,
        completed,
        lastWatchedAt: new Date(),
      },
    });

    await progress.update({
      watchedSeconds,
      completed,
      lastWatchedAt: new Date(),
    });

    return { EM: "Update progress success", EC: 0, DT: progress };
  } catch (error) {
    console.log(error);
    return { EM: "Error from server...", EC: 1, DT: "" };
  }
};

export default {
  getYoutubeMetadata,
  syncYoutubeMetadata,
  importTranscript,
  saveManualTranscript,
  readTranscripts,
  readNotes,
  readAllNotes,
  createNote,
  updateNote,
  removeNote,
  readVocabulary,
  readAllVocabulary,
  createVocabulary,
  updateVocabulary,
  removeVocabulary,
  readProgress,
  updateProgress,
};
