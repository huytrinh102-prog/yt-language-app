import "./Notes.scss";
import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaChevronDown,
  FaChevronRight,
  FaClock,
  FaExternalLinkAlt,
  FaSearch,
  FaTrash,
} from "react-icons/fa";
import { DeleteVideoNote, GetNotes } from "../../services/ServiceApi";
import type { NoteItem } from "../../utils/types/video";

type NoteGroup = {
  videoId: number;
  video: NoteItem["video"];
  notes: NoteItem[];
};

const NOTE_GROUPS_PER_PAGE = 6;
const NOTES_FETCH_LIMIT = 500;

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

const Notes = () => {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedVideoId, setExpandedVideoId] = useState<number | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const currentPage = Number(searchParams.get("page") || 1) || 1;
  const keyword = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "createdAt,desc";
  const groupedNotes = useMemo(() => {
    const groups = new Map<number, NoteGroup>();

    notes.forEach((note) => {
      const currentGroup = groups.get(note.videoId);

      if (currentGroup) {
        currentGroup.notes.push(note);
        return;
      }

      groups.set(note.videoId, {
        videoId: note.videoId,
        video: note.video,
        notes: [note],
      });
    });

    return Array.from(groups.values()).map((group) => ({
      ...group,
      notes: [...group.notes].sort((a, b) => a.timeSec - b.timeSec),
    }));
  }, [notes]);
  const totalPages = Math.max(
    1,
    Math.ceil(groupedNotes.length / NOTE_GROUPS_PER_PAGE),
  );
  const pagedNoteGroups = groupedNotes.slice(
    (currentPage - 1) * NOTE_GROUPS_PER_PAGE,
    currentPage * NOTE_GROUPS_PER_PAGE,
  );

  const fetchNotes = async () => {
    setIsLoading(true);

    try {
      const res = await GetNotes(1, NOTES_FETCH_LIMIT, keyword, sort);

      if (res && +res.EC === 0) {
        setNotes(res.DT.notes || []);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void fetchNotes();
    }, 250);

    return () => window.clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword, sort]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setSearchParams({
        page: String(totalPages),
        search: keyword,
        sort,
      });
    }
  }, [currentPage, keyword, setSearchParams, sort, totalPages]);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchParams({
      page: "1",
      search: e.target.value,
      sort,
    });
  };

  const handleSortChange = (value: string) => {
    setSearchParams({
      page: "1",
      search: keyword,
      sort: value,
    });
  };

  const handleDeleteNote = async (note: NoteItem) => {
    const ok = window.confirm("Delete this note?");
    if (!ok) return;

    const res = await DeleteVideoNote(note.id);

    if (res && +res.EC === 0) {
      toast.success(res.EM);
      setNotes((current) => current.filter((item) => item.id !== note.id));
    } else {
      toast.error(res?.EM || "Cannot delete note");
    }
  };

  const openNote = (note: NoteItem) => {
    navigate(`/videos/watch/${note.videoId}?t=${note.timeSec}`);
  };

  const toggleVideoNotes = (videoId: number) => {
    setExpandedVideoId((current) => (current === videoId ? null : videoId));
  };

  const goToPage = (page: number) => {
    setSearchParams({
      page: String(page),
      search: keyword,
      sort,
    });
  };

  return (
    <main className="notes-page">
      <div className="container">
        <div className="notes-header">
          <div>
            <h1>Notes</h1>
            <p>Review every saved note across your language videos.</p>
          </div>
        </div>

        <div className="notes-toolbar">
          <div className="notes-search">
            <FaSearch />
            <input
              className="form-control"
              placeholder="Search notes, videos, channels..."
              value={keyword}
              onChange={handleSearchChange}
            />
          </div>

          <div className="notes-toolbar-actions">
            <select
              className="form-select"
              value={sort}
              onChange={(e) => handleSortChange(e.target.value)}
            >
              <option value="createdAt,desc">Newest</option>
              <option value="createdAt,asc">Oldest</option>
              <option value="timeSec,asc">Time ascending</option>
              <option value="timeSec,desc">Time descending</option>
            </select>
            <button
              className="btn btn-outline-secondary"
              onClick={() =>
                setSearchParams({
                  page: "1",
                  search: "",
                  sort: "createdAt,desc",
                })
              }
            >
              Reset
            </button>
          </div>
        </div>

        <section className="notes-list">
          {isLoading && notes.length === 0 ? (
            <div className="notes-empty">Loading notes...</div>
          ) : notes.length > 0 ? (
            pagedNoteGroups.map((group) => {
              const isExpanded = expandedVideoId === group.videoId;
              const previewNotes = group.notes.slice(0, 2);
              const visibleNotes = isExpanded ? group.notes : previewNotes;
              const hiddenCount = Math.max(group.notes.length - previewNotes.length, 0);

              return (
                <article
                  className={`note-video-group ${isExpanded ? "is-expanded" : ""}`}
                  key={group.videoId}
                >
                  <button
                    className="note-video-summary"
                    onClick={() => toggleVideoNotes(group.videoId)}
                  >
                    <span className="note-thumb">
                      {group.video?.thumbnailUrl ? (
                        <img
                          src={group.video.thumbnailUrl}
                          alt={group.video.title || "Video thumbnail"}
                        />
                      ) : (
                        <span>No thumbnail</span>
                      )}
                    </span>

                    <span className="note-video-info">
                      <span className="note-expand-icon">
                        {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
                      </span>
                      <span className="note-title">
                        {group.video?.title || "Untitled video"}
                      </span>
                      <span className="note-meta">
                        <span>
                          {group.video?.channelTitle || "Unknown channel"}
                        </span>
                        {group.video?.languageFolder?.name && (
                          <span>{group.video.languageFolder.name}</span>
                        )}
                        <span>{group.notes.length} notes</span>
                      </span>
                    </span>
                  </button>

                  <div className="note-video-actions">
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => toggleVideoNotes(group.videoId)}
                    >
                      {isExpanded ? "Hide notes" : "View notes"}
                    </button>
                    <button
                      className="btn btn-sm btn-primary note-video-open"
                      onClick={() => openNote(group.notes[0])}
                    >
                      <FaExternalLinkAlt />
                      <span>Open video</span>
                    </button>
                  </div>

                  <div className="note-group-preview">
                    {visibleNotes.map((note) => (
                    <div className="note-group-item" key={note.id}>
                      <button className="note-time" onClick={() => openNote(note)}>
                        <FaClock />
                        <span>{formatDuration(note.timeSec)}</span>
                      </button>

                      <p>{note.content}</p>

                      <div className="note-actions">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => openNote(note)}
                        >
                          <FaExternalLinkAlt />
                          <span>Open</span>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteNote(note)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                  </div>

                  {!isExpanded && hiddenCount > 0 && (
                    <button
                      className="note-more-button"
                      onClick={() => toggleVideoNotes(group.videoId)}
                    >
                      View {hiddenCount} more notes
                    </button>
                  )}
                </article>
              );
            })
          ) : (
            <div className="notes-empty">
              <p>No notes yet.</p>
              <button
                className="btn btn-primary mt-3"
                onClick={() => navigate("/videos")}
              >
                Open videos
              </button>
            </div>
          )}
        </section>

        <nav className="notes-footer" aria-label="Notes pagination">
          <ul className="pagination">
            <li className={`page-item ${currentPage <= 1 ? "disabled" : ""}`}>
              <button
                className="page-link"
                disabled={currentPage <= 1}
                onClick={() => goToPage(currentPage - 1)}
              >
                &lt; Previous
              </button>
            </li>

            {Array.from({ length: totalPages || 1 }, (_, index) => {
              const page = index + 1;

              return (
                <li
                  className={`page-item ${page === currentPage ? "active" : ""}`}
                  key={`notes-page-${page}`}
                >
                  <button className="page-link" onClick={() => goToPage(page)}>
                    {page}
                  </button>
                </li>
              );
            })}

            <li
              className={`page-item ${
                currentPage >= totalPages ? "disabled" : ""
              }`}
            >
              <button
                className="page-link"
                disabled={currentPage >= totalPages}
                onClick={() => goToPage(currentPage + 1)}
              >
                Next &gt;
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </main>
  );
};

export default Notes;
