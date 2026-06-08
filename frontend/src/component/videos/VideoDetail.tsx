import "./Videos.scss";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaBookOpen,
  FaClock,
  FaLanguage,
  FaListUl,
  FaRegStickyNote,
  FaSyncAlt,
  FaTimes,
  FaTrash,
  FaYoutube,
} from "react-icons/fa";
import { toast } from "react-toastify";
import {
  CreateVideoNote,
  CreateVideoVocabulary,
  DeleteVideoNote,
  DeleteVideoVocabulary,
  GetVideoById,
  ImportVideoTranscript,
  SaveManualTranscript,
  SyncVideoYoutube,
  UpdateVideoNote,
  UpdateVideoProgress,
  UpdateVideoVocabulary,
} from "../../services/ServiceApi";
import type {
  NoteItem,
  TranscriptItem,
  TranscriptSegment,
  VideoItem,
  VideoProgressItem,
  VocabularyItem,
} from "../../utils/types/video";

type PageStatus = "loading" | "success" | "error";

type YoutubePlayer = {
  destroy: () => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  pauseVideo?: () => void;
  playVideo?: () => void;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
};

type YoutubePlayerEvent = {
  data: number;
  target: YoutubePlayer;
};

declare global {
  interface Window {
    YT?: {
      Player: new (
        elementId: string,
        config: {
          videoId: string;
          playerVars?: Record<string, string | number>;
          events?: {
            onReady?: (event: YoutubePlayerEvent) => void;
            onStateChange?: (event: YoutubePlayerEvent) => void;
          };
        },
      ) => YoutubePlayer;
      PlayerState?: {
        ENDED: number;
        PAUSED: number;
        PLAYING: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

let youtubeApiPromise: Promise<void> | null = null;

const loadYoutubeIframeApi = () => {
  if (window.YT?.Player) return Promise.resolve();

  if (!youtubeApiPromise) {
    youtubeApiPromise = new Promise((resolve) => {
      const previousCallback = window.onYouTubeIframeAPIReady;

      window.onYouTubeIframeAPIReady = () => {
        previousCallback?.();
        resolve();
      };

      if (!document.getElementById("youtube-iframe-api")) {
        const script = document.createElement("script");
        script.id = "youtube-iframe-api";
        script.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(script);
      }
    });
  }

  return youtubeApiPromise;
};

const formatDuration = (seconds?: number) => {
  if (!seconds) return "0:00";

  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${String(mins).padStart(2, "0")}:${String(secs).padStart(
      2,
      "0",
    )}`;
  }

  return `${mins}:${String(secs).padStart(2, "0")}`;
};

const extractYoutubeVideoId = (value: string) => {
  const input = value.trim();

  if (!input) return "";

  try {
    const url = new URL(input);

    if (url.hostname.includes("youtu.be")) {
      return url.pathname.split("/").filter(Boolean)[0] || "";
    }

    if (url.searchParams.get("v")) {
      return url.searchParams.get("v") || "";
    }

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

const getInitialNoteForm = () => ({
  content: "",
  timeSec: "",
});

const getInitialVocabularyForm = () => ({
  word: "",
  meaning: "",
  example: "",
});

const normalizeTranscriptSegment = (value: unknown): TranscriptSegment | null => {
  if (!value || typeof value !== "object") return null;

  const segment = value as {
    duration?: unknown;
    start?: unknown;
    text?: unknown;
  };
  const text = String(segment.text || "").trim();

  if (!text) return null;

  return {
    start: Number(segment.start || 0),
    duration: Number(segment.duration || 0),
    text,
  };
};

const isTranscriptSegment = (
  value: TranscriptSegment | null,
): value is TranscriptSegment => Boolean(value);

const normalizeTranscriptSegments = (
  value: TranscriptItem["segments"],
): TranscriptSegment[] => {
  if (Array.isArray(value)) {
    return value.map(normalizeTranscriptSegment).filter(isTranscriptSegment);
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;

      if (Array.isArray(parsed)) {
        return parsed.map(normalizeTranscriptSegment).filter(isTranscriptSegment);
      }
    } catch {
      return [];
    }
  }

  return [];
};

const cleanTranscriptWord = (value: string) => {
  return value.replace(/[^\p{L}\p{N}'-]/gu, "").trim();
};

const splitTranscriptText = (text: string) => {
  return text.split(/(\s+)/);
};

const VideoDetail = () => {
  const [video, setVideo] = useState<VideoItem | null>(null);
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([]);
  const [progress, setProgress] = useState<VideoProgressItem | null>(null);
  const [status, setStatus] = useState<PageStatus>("loading");
  const [noteForm, setNoteForm] = useState(getInitialNoteForm);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [vocabularyForm, setVocabularyForm] = useState(
    getInitialVocabularyForm,
  );
  const [editingVocabularyId, setEditingVocabularyId] = useState<number | null>(
    null,
  );
  const [transcriptLanguage, setTranscriptLanguage] = useState("");
  const [manualTranscript, setManualTranscript] = useState("");
  const [showTranscriptPanel, setShowTranscriptPanel] = useState(true);
  const [isSyncingYoutube, setIsSyncingYoutube] = useState(false);
  const [isImportingTranscript, setIsImportingTranscript] = useState(false);
  const [isSavingTranscript, setIsSavingTranscript] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [playerDurationSeconds, setPlayerDurationSeconds] = useState(0);

  const { id = "" } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const playerRef = useRef<YoutubePlayer | null>(null);
  const lastSavedProgressRef = useRef(0);
  const appliedStartTimeRef = useRef("");
  const vocabularyPanelRef = useRef<HTMLElement | null>(null);
  const vocabularyWordInputRef = useRef<HTMLInputElement | null>(null);

  const videoId = Number(id);
  const hasValidVideoId = Number.isFinite(videoId) && videoId > 0;
  const startTimeSec = Number(searchParams.get("t") || 0) || 0;
  const youtubeId = useMemo(
    () => extractYoutubeVideoId(video?.youtubeVideoId || ""),
    [video?.youtubeVideoId],
  );
  const playerElementId = video?.id ? `youtube-player-${video.id}` : "";
  const watchUrl = youtubeId ? `https://www.youtube.com/watch?v=${youtubeId}` : "";
  const activeTranscript = transcripts[0];
  const transcriptSegments = useMemo(
    () => normalizeTranscriptSegments(activeTranscript?.segments),
    [activeTranscript?.segments],
  );
  const durationSeconds = video?.durationSeconds || playerDurationSeconds || 0;
  const progressPercent =
    durationSeconds > 0
      ? Math.min(100, Math.round(((progress?.watchedSeconds || 0) / durationSeconds) * 100))
      : 0;

  const applyVideoData = useCallback((nextVideo: VideoItem) => {
    setVideo(nextVideo);
    setTranscripts(nextVideo.transcripts || []);
    setNotes(nextVideo.notes || []);
    setVocabulary(nextVideo.vocabularyItems || []);
    setProgress(nextVideo.progress?.[0] || null);
    setPlayerDurationSeconds(nextVideo.durationSeconds || 0);
    setTranscriptLanguage(
      nextVideo.languageFolder?.code || nextVideo.language || "",
    );
  }, []);

  const getCurrentPlayerTime = useCallback(() => {
    return Math.round(
      playerRef.current?.getCurrentTime() || progress?.watchedSeconds || 0,
    );
  }, [progress?.watchedSeconds]);

  const saveProgress = useCallback(
    async (
      watchedSeconds = getCurrentPlayerTime(),
      completed = false,
      silent = false,
      knownDurationSeconds = 0,
    ) => {
      if (!video?.id) return;

      const nextDurationSeconds =
        knownDurationSeconds || playerDurationSeconds || video.durationSeconds || 0;

      const res = await UpdateVideoProgress(video.id, {
        watchedSeconds,
        completed,
        durationSeconds: nextDurationSeconds || undefined,
      });

      if (res && +res.EC === 0 && res.DT) {
        lastSavedProgressRef.current = watchedSeconds;
        setProgress(res.DT);
        if (!silent) toast.success(res.EM);
      } else if (!silent) {
        toast.error(res?.EM || "Cannot save progress");
      }
    },
    [getCurrentPlayerTime, playerDurationSeconds, video],
  );

  useEffect(() => {
    let ignore = false;

    if (!hasValidVideoId) {
      return;
    }

    void (async () => {
      setStatus("loading");

      try {
        const res = await GetVideoById(videoId);

        if (ignore) return;

        if (res && +res.EC === 0 && res.DT) {
          applyVideoData(res.DT);
          setStatus("success");
          return;
        }

        setStatus("error");
        toast.error(res?.EM || "Video not found");
      } catch {
        if (!ignore) {
          setStatus("error");
        }
      }

      return;
    })();

    return () => {
      ignore = true;
    };
  }, [applyVideoData, hasValidVideoId, videoId]);

  useEffect(() => {
    if (!youtubeId || !playerElementId || status !== "success") return;

    let destroyed = false;

    void loadYoutubeIframeApi().then(() => {
      if (destroyed || !window.YT?.Player) return;

      playerRef.current?.destroy();
      setPlayerReady(false);
      setPlayerDurationSeconds(video?.durationSeconds || 0);

      playerRef.current = new window.YT.Player(playerElementId, {
        videoId: youtubeId,
        playerVars: {
          modestbranding: 1,
          rel: 0,
        },
        events: {
          onReady: (event) => {
            playerRef.current = event.target;
            const playerDuration = Math.round(event.target.getDuration() || 0);
            if (playerDuration > 0) {
              setPlayerDurationSeconds(playerDuration);
            }
            setPlayerReady(true);
          },
          onStateChange: (event) => {
            const playerState = window.YT?.PlayerState;
            if (!playerState || !video?.id) return;

            if (
              event.data === playerState.PAUSED ||
              event.data === playerState.ENDED
            ) {
              const watchedSeconds = Math.round(event.target.getCurrentTime());
              const playerDuration = Math.round(event.target.getDuration() || 0);
              if (playerDuration > 0) {
                setPlayerDurationSeconds(playerDuration);
              }
              const completed = event.data === playerState.ENDED;
              void saveProgress(watchedSeconds, completed, true, playerDuration);
            }
          },
        },
      });
    });

    return () => {
      destroyed = true;
      playerRef.current?.destroy();
      playerRef.current = null;
      setPlayerReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerElementId, status, youtubeId]);

  useEffect(() => {
    if (!playerReady || !video?.id) return;

    if (startTimeSec > 0) {
      const startKey = `${video.id}-${startTimeSec}`;

      if (appliedStartTimeRef.current !== startKey) {
        appliedStartTimeRef.current = startKey;
        playerRef.current?.seekTo(startTimeSec, true);
      }
    }

    const interval = window.setInterval(() => {
      const watchedSeconds = Math.round(playerRef.current?.getCurrentTime() || 0);
      const playerDuration = Math.round(playerRef.current?.getDuration() || 0);

      if (playerDuration > 0) {
        setPlayerDurationSeconds(playerDuration);
      }

      if (
        watchedSeconds > 0 &&
        Math.abs(watchedSeconds - lastSavedProgressRef.current) >= 15
      ) {
        void saveProgress(watchedSeconds, false, true, playerDuration);
      }
    }, 15000);

    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerReady, startTimeSec, video?.id]);

  const goBack = () => {
    if (video?.languageId) {
      navigate(`/videos/languages/${video.languageId}`);
      return;
    }

    navigate("/videos");
  };

  const handleSyncYoutube = async () => {
    if (!video?.id) return;

    setIsSyncingYoutube(true);

    try {
      const res = await SyncVideoYoutube(video.id);

      if (res && +res.EC === 0 && res.DT) {
        setVideo(res.DT);
        toast.success(res.EM);
      } else {
        toast.error(res?.EM || "Cannot sync YouTube info");
      }
    } finally {
      setIsSyncingYoutube(false);
    }
  };

  const handleImportTranscript = async () => {
    if (!video?.id) return;

    setIsImportingTranscript(true);

    try {
      const res = await ImportVideoTranscript(video.id, transcriptLanguage);

      if (res && +res.EC === 0 && res.DT) {
        setTranscripts((current) => [
          res.DT,
          ...current.filter((item) => item.id !== res.DT.id),
        ]);
        toast.success(res.EM);
      } else {
        toast.error(res?.EM || "Cannot import transcript");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsImportingTranscript(false);
    }
  };

  const handleSaveManualTranscript = async () => {
    if (!video?.id) return;

    if (!manualTranscript.trim()) {
      toast.error("Transcript content is required");
      return;
    }

    setIsSavingTranscript(true);

    try {
      const res = await SaveManualTranscript(video.id, {
        language: transcriptLanguage,
        rawText: manualTranscript,
      });

      if (res && +res.EC === 0 && res.DT) {
        setTranscripts((current) => [
          res.DT,
          ...current.filter((item) => item.id !== res.DT.id),
        ]);
        setManualTranscript("");
        toast.success(res.EM);
      } else {
        toast.error(res?.EM || "Cannot save transcript");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsSavingTranscript(false);
    }
  };

  const handleTranscriptClick = (segment: TranscriptSegment) => {
    playerRef.current?.seekTo(segment.start, true);
    playerRef.current?.playVideo?.();
  };

  const handleUseTranscriptForVocabulary = (
    segment: TranscriptSegment,
    wordFromClick = "",
  ) => {
    const selectedText = window.getSelection()?.toString().trim() || "";
    const word =
      wordFromClick ||
      (segment.text.includes(selectedText) ? selectedText : "");

    setEditingVocabularyId(null);
    setVocabularyForm((current) => ({
      ...current,
      word,
      example: segment.text,
    }));

    window.requestAnimationFrame(() => {
      vocabularyPanelRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      vocabularyWordInputRef.current?.focus();
    });
  };

  const handleUseCurrentTime = () => {
    setNoteForm((current) => ({
      ...current,
      timeSec: String(getCurrentPlayerTime()),
    }));
  };

  const handleSubmitNote = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!video?.id) return;
    if (!noteForm.content.trim()) {
      toast.error("Note content is required");
      return;
    }

    const payload = {
      content: noteForm.content,
      timeSec: Number(noteForm.timeSec || getCurrentPlayerTime()) || 0,
    };
    const res = editingNoteId
      ? await UpdateVideoNote(editingNoteId, payload)
      : await CreateVideoNote(video.id, payload);

    if (res && +res.EC === 0 && res.DT) {
      setNotes((current) => {
        const nextNotes = editingNoteId
          ? current.map((item) => (item.id === res.DT.id ? res.DT : item))
          : [...current, res.DT];

        return [...nextNotes].sort((a, b) => a.timeSec - b.timeSec);
      });
      setEditingNoteId(null);
      setNoteForm(getInitialNoteForm());
      toast.success(res.EM);
    } else {
      toast.error(res?.EM || "Cannot save note");
    }
  };

  const handleEditNote = (note: NoteItem) => {
    setEditingNoteId(note.id);
    setNoteForm({
      content: note.content,
      timeSec: String(note.timeSec),
    });
  };

  const handleDeleteNote = async (noteId: number) => {
    const ok = window.confirm("Delete this note?");
    if (!ok) return;

    const res = await DeleteVideoNote(noteId);

    if (res && +res.EC === 0) {
      setNotes((current) => current.filter((item) => item.id !== noteId));
      toast.success(res.EM);
    } else {
      toast.error(res?.EM || "Cannot delete note");
    }
  };

  const handleSubmitVocabulary = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!video?.id) return;
    if (!vocabularyForm.word.trim()) {
      toast.error("Vocabulary word is required");
      return;
    }

    const payload = {
      ...vocabularyForm,
      language: video.languageFolder?.code || video.language || "",
      status: "new",
    };
    const res = editingVocabularyId
      ? await UpdateVideoVocabulary(editingVocabularyId, payload)
      : await CreateVideoVocabulary(video.id, payload);

    if (res && +res.EC === 0 && res.DT) {
      setVocabulary((current) =>
        editingVocabularyId
          ? current.map((item) => (item.id === res.DT.id ? res.DT : item))
          : [res.DT, ...current],
      );
      setEditingVocabularyId(null);
      setVocabularyForm(getInitialVocabularyForm());
      toast.success(res.EM);
    } else {
      toast.error(res?.EM || "Cannot save vocabulary");
    }
  };

  const handleEditVocabulary = (item: VocabularyItem) => {
    setEditingVocabularyId(item.id);
    setVocabularyForm({
      word: item.word,
      meaning: item.meaning || "",
      example: item.example || "",
    });
  };

  const handleDeleteVocabulary = async (vocabularyId: number) => {
    const ok = window.confirm("Delete this vocabulary item?");
    if (!ok) return;

    const res = await DeleteVideoVocabulary(vocabularyId);

    if (res && +res.EC === 0) {
      setVocabulary((current) =>
        current.filter((item) => item.id !== vocabularyId),
      );
      toast.success(res.EM);
    } else {
      toast.error(res?.EM || "Cannot delete vocabulary");
    }
  };

  return (
    <main className="videos-page video-detail-page">
      <div className="container">
        <div className="video-detail-topbar">
          <button className="btn btn-outline-secondary" onClick={goBack}>
            <FaArrowLeft />
            <span>Back</span>
          </button>

          <div className="video-detail-actions">
            <button
              className="btn btn-outline-primary"
              disabled={!video || isSyncingYoutube}
              onClick={handleSyncYoutube}
            >
              <FaSyncAlt />
              <span>{isSyncingYoutube ? "Syncing" : "Sync YouTube"}</span>
            </button>

            {watchUrl && (
              <a
                className="btn btn-danger"
                href={watchUrl}
                rel="noreferrer"
                target="_blank"
              >
                <FaYoutube />
                <span>YouTube</span>
              </a>
            )}
          </div>
        </div>

        {(hasValidVideoId ? status : "error") === "loading" && (
          <section className="videos-empty">
            <p>Loading video...</p>
          </section>
        )}

        {(hasValidVideoId ? status : "error") === "error" && (
          <section className="videos-empty">
            <p>Video not found.</p>
            <button
              className="btn btn-primary mt-3"
              onClick={() => navigate("/videos")}
            >
              Back to folders
            </button>
          </section>
        )}

        {(hasValidVideoId ? status : "error") === "success" && video && (
          <div className="video-detail-layout">
            <section className="video-watch-area">
              <div className="video-player">
                {youtubeId ? (
                  <div id={playerElementId} className="youtube-player-node" />
                ) : (
                  <div className="video-player-empty">
                    <FaYoutube />
                    <span>No video ID</span>
                  </div>
                )}
              </div>

              <div className="video-detail-main">
                <div>
                  <h1>{video.title || "Untitled video"}</h1>
                  <div className="video-meta">
                    <span>{video.channelTitle || "Unknown channel"}</span>
                    <span>{formatDuration(durationSeconds)}</span>
                    <span>{youtubeId || video.youtubeVideoId}</span>
                  </div>
                </div>

                <p>{video.description || "No description."}</p>
              </div>

              <section className="study-panel wide notes-study-panel">
                <div className="study-panel-title">
                  <FaRegStickyNote />
                  <h2>Notes</h2>
                </div>

                <form className="study-form" onSubmit={handleSubmitNote}>
                  <div className="study-form-row">
                    <input
                      className="form-control"
                      min={0}
                      placeholder="Time"
                      type="number"
                      value={noteForm.timeSec}
                      onChange={(e) =>
                        setNoteForm({ ...noteForm, timeSec: e.target.value })
                      }
                    />
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={handleUseCurrentTime}
                    >
                      Current
                    </button>
                  </div>

                  <textarea
                    className="form-control"
                    placeholder="Write a note for this moment..."
                    rows={3}
                    value={noteForm.content}
                    onChange={(e) =>
                      setNoteForm({ ...noteForm, content: e.target.value })
                    }
                  />

                  <div className="study-form-actions">
                    {editingNoteId && (
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={() => {
                          setEditingNoteId(null);
                          setNoteForm(getInitialNoteForm());
                        }}
                      >
                        Cancel edit
                      </button>
                    )}
                    <button className="btn btn-primary" type="submit">
                      {editingNoteId ? "Save note" : "Add note"}
                    </button>
                  </div>
                </form>

                {notes.length > 0 ? (
                  <div className="detail-notes">
                    {notes.map((note) => (
                      <article className="detail-note" key={note.id}>
                        <button
                          className="detail-time-btn"
                          onClick={() =>
                            handleTranscriptClick({
                              start: note.timeSec,
                              duration: 0,
                              text: note.content,
                            })
                          }
                        >
                          {formatDuration(note.timeSec)}
                        </button>
                        <p>{note.content}</p>
                        <div className="detail-inline-actions">
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => handleEditNote(note)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteNote(note.id)}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="study-empty">No notes yet.</p>
                )}
              </section>
            </section>

            <aside className="video-study-sidebar">
              <section className="study-panel folder-study-panel">
                <div className="study-panel-title">
                  <FaLanguage />
                  <h2>Folder</h2>
                </div>

                <div className="folder-summary">
                  <span
                    style={{
                      backgroundColor: video.languageFolder?.color || "#4f46e5",
                    }}
                  />
                  <div>
                    <strong>
                      {video.languageFolder?.name || video.language || "Language"}
                    </strong>
                    <p>{video.languageFolder?.description || "Saved lesson"}</p>
                  </div>
                </div>
              </section>

              <section className="study-panel compact progress-study-panel">
                <div className="study-panel-title">
                  <FaClock />
                  <h2>Progress</h2>
                </div>

                <div
                  aria-label="Video progress"
                  aria-valuemax={100}
                  aria-valuemin={0}
                  aria-valuenow={progressPercent}
                  className="video-progress"
                  role="progressbar"
                >
                  <div
                    className="video-progress-fill"
                    style={{
                      width: `${progressPercent}%`,
                    }}
                  />
                </div>

                <div className="progress-meta">
                  <span>{formatDuration(progress?.watchedSeconds || 0)}</span>
                  <span>{progressPercent}%</span>
                </div>

                <div className="study-form-actions">
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => saveProgress()}
                  >
                    Save progress
                  </button>
                  <button
                    className="btn btn-sm btn-success"
                    onClick={() =>
                      saveProgress(durationSeconds || getCurrentPlayerTime(), true)
                    }
                  >
                    Complete
                  </button>
                </div>
              </section>

              {showTranscriptPanel && (
                <section className="study-panel transcript-study-panel">
                  <div className="study-panel-title">
                    <FaBookOpen />
                    <h2>Transcript</h2>
                    <button
                      aria-label="Hide transcript"
                      className="panel-icon-btn"
                      onClick={() => setShowTranscriptPanel(false)}
                    >
                      <FaTimes />
                    </button>
                  </div>

                  <div className="study-form-row transcript-actions">
                    <input
                      className="form-control"
                      placeholder="en, ja, vi..."
                      value={transcriptLanguage}
                      onChange={(e) => setTranscriptLanguage(e.target.value)}
                    />
                    <button
                      className="btn btn-outline-primary"
                      disabled={isImportingTranscript}
                      onClick={handleImportTranscript}
                    >
                      {isImportingTranscript ? "Importing" : "Import"}
                    </button>
                  </div>

                  <details className="manual-transcript-form">
                    <summary>Paste transcript manually</summary>
                    <div className="manual-transcript-body">
                      <textarea
                        className="form-control"
                        onChange={(e) => setManualTranscript(e.target.value)}
                        placeholder="Paste transcript..."
                        rows={4}
                        value={manualTranscript}
                      />
                      <button
                        className="btn btn-primary"
                        disabled={isSavingTranscript}
                        onClick={handleSaveManualTranscript}
                      >
                        {isSavingTranscript ? "Saving" : "Save"}
                      </button>
                    </div>
                  </details>

                  {transcriptSegments.length > 0 ? (
                    <div className="detail-list transcript-list">
                      {transcriptSegments.map((segment, index) => (
                        <article
                          className="transcript-segment"
                          key={`${segment.start}-${index}`}
                        >
                          <button
                            className="transcript-time"
                            onClick={() => handleTranscriptClick(segment)}
                          >
                            {formatDuration(segment.start)}
                          </button>
                          <div className="transcript-text transcript-clickable-text">
                            {splitTranscriptText(segment.text).map(
                              (part, partIndex) => {
                                const word = cleanTranscriptWord(part);

                                if (!word) {
                                  return (
                                    <span key={`${segment.start}-${partIndex}`}>
                                      {part}
                                    </span>
                                  );
                                }

                                return (
                                  <button
                                    className="transcript-inline-word"
                                    key={`${segment.start}-${partIndex}-${word}`}
                                    onClick={() =>
                                      handleUseTranscriptForVocabulary(
                                        segment,
                                        word,
                                      )
                                    }
                                  >
                                    {part}
                                  </button>
                                );
                              },
                            )}
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <p className="study-empty">
                      No transcript yet. Import captions from YouTube if this video has
                      captions.
                    </p>
                  )}
                </section>
              )}

              <section className="study-panel vocab-study-panel" ref={vocabularyPanelRef}>
                <div className="study-panel-title">
                  <FaListUl />
                  <h2>Vocabulary</h2>
                  {!showTranscriptPanel && (
                    <button
                      className="btn btn-sm btn-outline-primary panel-title-btn"
                      onClick={() => setShowTranscriptPanel(true)}
                    >
                      <FaBookOpen />
                      <span>Transcript</span>
                    </button>
                  )}
                </div>

                <form className="study-form" onSubmit={handleSubmitVocabulary}>
                  <input
                    className="form-control"
                    placeholder="Word or phrase"
                    ref={vocabularyWordInputRef}
                    value={vocabularyForm.word}
                    onChange={(e) =>
                      setVocabularyForm({
                        ...vocabularyForm,
                        word: e.target.value,
                      })
                    }
                  />
                  <input
                    className="form-control"
                    placeholder="Meaning"
                    value={vocabularyForm.meaning}
                    onChange={(e) =>
                      setVocabularyForm({
                        ...vocabularyForm,
                        meaning: e.target.value,
                      })
                    }
                  />
                  <textarea
                    className="form-control"
                    placeholder="Example sentence"
                    rows={2}
                    value={vocabularyForm.example}
                    onChange={(e) =>
                      setVocabularyForm({
                        ...vocabularyForm,
                        example: e.target.value,
                      })
                    }
                  />

                  <div className="study-form-actions">
                    {editingVocabularyId && (
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={() => {
                          setEditingVocabularyId(null);
                          setVocabularyForm(getInitialVocabularyForm());
                        }}
                      >
                        Cancel edit
                      </button>
                    )}
                    <button className="btn btn-primary" type="submit">
                      {editingVocabularyId ? "Save word" : "Add word"}
                    </button>
                  </div>
                </form>

                {vocabulary.length > 0 ? (
                  <div className="vocab-list">
                    {vocabulary.map((item) => (
                      <article className="vocab-item" key={item.id}>
                        <div>
                          <strong>{item.word}</strong>
                          <p>{item.meaning || "No meaning yet."}</p>
                          {item.example && <small>{item.example}</small>}
                        </div>
                        <div className="detail-inline-actions">
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => handleEditVocabulary(item)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteVocabulary(item.id)}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="study-empty">No vocabulary saved yet.</p>
                )}
              </section>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
};

export default VideoDetail;
