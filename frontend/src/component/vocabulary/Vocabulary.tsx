import "./Vocabulary.scss";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaCheckCircle,
  FaChevronLeft,
  FaChevronRight,
  FaClone,
  FaExternalLinkAlt,
  FaFilter,
  FaKeyboard,
  FaLayerGroup,
  FaPlay,
  FaRedoAlt,
  FaSearch,
  FaStar,
  FaVolumeUp,
} from "react-icons/fa";
import {
  GetLanguages,
  GetVideos,
  GetVocabulary,
  UpdateVideoVocabulary,
} from "../../services/ServiceApi";
import type {
  UserLanguage,
  VideoItem,
  VocabularyItem,
} from "../../utils/types/video";

type ReviewAction = "again" | "good" | "mastered";
type StudyScreen = "list" | "modes" | "flashcards";

type FlashcardDragState = {
  isDragging: boolean;
  startX: number;
  offsetX: number;
};

const flashcardSwipeThreshold = 120;

const statusLabels: Record<string, string> = {
  new: "New",
  learning: "Learning",
  mastered: "Mastered",
};

const addDays = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

const formatDate = (value?: string) => {
  if (!value) return "No review date";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
};

const Vocabulary = () => {
  const [items, setItems] = useState<VocabularyItem[]>([]);
  const [languages, setLanguages] = useState<UserLanguage[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [studyScreen, setStudyScreen] = useState<StudyScreen>("list");
  const [flashcardDrag, setFlashcardDrag] = useState<FlashcardDragState>({
    isDragging: false,
    startX: 0,
    offsetX: 0,
  });
  const flashcardLastDragOffsetRef = useRef(0);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const currentPage = Number(searchParams.get("page") || 1) || 1;
  const keyword = searchParams.get("search") || "";
  const status = searchParams.get("status") || "all";
  const sort = searchParams.get("sort") || "createdAt,desc";
  const languageId = searchParams.get("languageId") || "";
  const videoId = searchParams.get("videoId") || "";
  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedId) || items[0] || null,
    [items, selectedId],
  );
  const selectedIndex = selectedItem
    ? items.findIndex((item) => item.id === selectedItem.id)
    : -1;
  const availableVideos = languageId ? videos : [];
  const flashcardRotation = Math.max(
    -10,
    Math.min(10, flashcardDrag.offsetX / 18),
  );
  const flashcardDragOpacity = Math.max(
    0,
    Math.min(1, Math.abs(flashcardDrag.offsetX) / flashcardSwipeThreshold),
  );
  const flashcardDragDirection =
    flashcardDrag.offsetX > 0 ? "Previous" : "Next";

  const fetchVocabulary = async () => {
    setIsLoading(true);

    try {
      const res = await GetVocabulary(
        currentPage,
        10,
        keyword,
        status,
        sort,
        languageId,
        videoId,
      );

      if (res && +res.EC === 0) {
        const nextItems = res.DT.vocabulary || [];
        setItems(nextItems);
        setTotalPages(res.DT.totalPages || 1);
        setSelectedId((current) => {
          if (current && nextItems.some((item) => item.id === current)) {
            return current;
          }

          return nextItems[0]?.id || null;
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void fetchVocabulary();
    }, 250);

    return () => window.clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, keyword, status, sort, languageId, videoId]);

  useEffect(() => {
    let ignore = false;

    void GetLanguages().then((res) => {
      if (!ignore && res && +res.EC === 0) {
        setLanguages(res.DT || []);
      }
    });

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    if (!languageId) return;

    void GetVideos(1, 100, "", "id,desc", Number(languageId)).then((res) => {
      if (!ignore && res && +res.EC === 0) {
        setVideos(res.DT.videos || []);
      }
    });

    return () => {
      ignore = true;
    };
  }, [languageId]);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchParams({
      page: "1",
      search: e.target.value,
      status,
      sort,
      languageId,
      videoId,
    });
  };

  const updateFilter = (next: Partial<Record<string, string>>) => {
    const nextLanguageId = next.languageId ?? languageId;

    setSearchParams({
      page: "1",
      search: next.search ?? keyword,
      status: next.status ?? status,
      sort: next.sort ?? sort,
      languageId: nextLanguageId,
      videoId:
        next.videoId ??
        (next.languageId !== undefined && next.languageId !== languageId
          ? ""
          : videoId),
    });
  };

  const goToPage = (page: number) => {
    setSearchParams({
      page: String(page),
      search: keyword,
      status,
      sort,
      languageId,
      videoId,
    });
  };

  const openVideo = (item: VocabularyItem) => {
    if (!item.videoId) return;
    navigate(`/videos/watch/${item.videoId}`);
  };

  const selectItem = (item: VocabularyItem) => {
    setSelectedId(item.id);
    setShowAnswer(false);
  };

  const openStudyModes = (item?: VocabularyItem) => {
    if (!items.length) {
      toast.error("No vocabulary to study");
      return;
    }

    if (item) selectItem(item);
    setStudyScreen("modes");
  };

  const startFlashcards = () => {
    if (!selectedItem) {
      toast.error("Choose a word to study");
      return;
    }

    setShowAnswer(false);
    setStudyScreen("flashcards");
  };

  const moveStudyCard = (direction: 1 | -1) => {
    if (!items.length || selectedIndex < 0) return;

    const nextIndex = (selectedIndex + direction + items.length) % items.length;
    setSelectedId(items[nextIndex].id);
    setShowAnswer(false);
    setFlashcardDrag({ isDragging: false, startX: 0, offsetX: 0 });
  };

  const handleFlashcardPointerDown = (e: PointerEvent<HTMLElement>) => {
    if (studyScreen !== "flashcards") return;

    flashcardLastDragOffsetRef.current = 0;
    e.currentTarget.setPointerCapture(e.pointerId);
    setFlashcardDrag({
      isDragging: true,
      startX: e.clientX,
      offsetX: 0,
    });
  };

  const handleFlashcardPointerMove = (e: PointerEvent<HTMLElement>) => {
    if (!flashcardDrag.isDragging) return;

    const offsetX = e.clientX - flashcardDrag.startX;
    flashcardLastDragOffsetRef.current = Math.abs(offsetX);
    setFlashcardDrag((current) => ({
      ...current,
      offsetX: e.clientX - current.startX,
    }));
  };

  const handleFlashcardPointerEnd = (e: PointerEvent<HTMLElement>) => {
    if (!flashcardDrag.isDragging) return;

    e.currentTarget.releasePointerCapture(e.pointerId);
    flashcardLastDragOffsetRef.current = Math.abs(flashcardDrag.offsetX);

    if (Math.abs(flashcardDrag.offsetX) >= flashcardSwipeThreshold) {
      moveStudyCard(flashcardDrag.offsetX > 0 ? -1 : 1);
      return;
    }

    setFlashcardDrag({ isDragging: false, startX: 0, offsetX: 0 });
  };

  const toggleFlashcardAnswer = () => {
    if (flashcardLastDragOffsetRef.current > 8) {
      flashcardLastDragOffsetRef.current = 0;
      return;
    }

    setShowAnswer((value) => !value);
  };

  const handleFlashcardKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key !== "Enter" && e.key !== " ") return;

    e.preventDefault();
    toggleFlashcardAnswer();
  };

  const reviewItem = async (item: VocabularyItem, action: ReviewAction) => {
    const nextByAction = {
      again: {
        status: "learning",
        reviewAt: addDays(1),
      },
      good: {
        status: "learning",
        reviewAt: addDays(3),
      },
      mastered: {
        status: "mastered",
        reviewAt: addDays(14),
      },
    };
    const next = nextByAction[action];
    const res = await UpdateVideoVocabulary(item.id, {
      word: item.word,
      meaning: item.meaning,
      example: item.example,
      language: item.language,
      status: next.status,
      reviewAt: next.reviewAt,
      timesReviewed: (item.timesReviewed || 0) + 1,
    });

    if (res && +res.EC === 0 && res.DT) {
      setItems((current) =>
        current.map((currentItem) =>
          currentItem.id === res.DT.id
            ? { ...currentItem, ...res.DT }
            : currentItem,
        ),
      );
      setShowAnswer(false);
      if (studyScreen === "flashcards") {
        moveStudyCard(1);
      }
    } else {
      toast.error(res?.EM || "Cannot update vocabulary");
    }
  };

  return (
    <main className="vocabulary-page">
      <div className="container">
        <div className="vocabulary-header">
          <div>
            <h1>Vocabulary</h1>
            <p>Review saved words with flashcards and spaced practice.</p>
          </div>
          {studyScreen === "list" && (
            <button
              className="btn btn-primary vocabulary-study-main"
              disabled={!items.length}
              onClick={() => openStudyModes(selectedItem || undefined)}
            >
              <FaPlay />
              <span>Study</span>
            </button>
          )}
        </div>

        {studyScreen === "modes" && (
          <section className="study-mode-screen">
            <div className="study-screen-topbar">
              <button
                className="btn btn-outline-secondary"
                onClick={() => setStudyScreen("list")}
              >
                <FaChevronLeft />
                <span>Back to list</span>
              </button>
              <span>{items.length} words in this set</span>
            </div>

            <div className="study-mode-header">
              <p>Choose study mode</p>
              <h2>
                {selectedItem ? selectedItem.word : "Vocabulary practice"}
              </h2>
            </div>

            <div className="study-mode-grid">
              <button
                className="study-mode-card active"
                onClick={startFlashcards}
              >
                <FaClone />
                <strong>Flashcards</strong>
                <span>Flip cards, rate recall, and move through the set.</span>
              </button>
              <button className="study-mode-card" disabled>
                <FaKeyboard />
                <strong>Type answer</strong>
                <span>Practice typing the meaning from memory.</span>
              </button>
              <button className="study-mode-card" disabled>
                <FaVolumeUp />
                <strong>Listen recall</strong>
                <span>Review from video context and pronunciation.</span>
              </button>
            </div>
          </section>
        )}

        {studyScreen === "flashcards" && selectedItem && (
          <section className="flashcard-study-screen">
            <div className="study-screen-topbar">
              <button
                className="btn btn-outline-secondary"
                onClick={() => setStudyScreen("modes")}
              >
                <FaChevronLeft />
                <span>Study modes</span>
              </button>
              <span>
                {selectedIndex + 1} / {items.length}
              </span>
            </div>

            <div className="flashcard-stage">
              <button
                className="btn btn-outline-secondary flashcard-nav-btn"
                onClick={() => moveStudyCard(-1)}
              >
                <FaChevronLeft />
              </button>

              <article
                aria-label={
                  showAnswer ? "Hide flashcard answer" : "Show flashcard answer"
                }
                className={`flashcard hero draggable ${
                  showAnswer ? "show-answer" : ""
                } ${flashcardDrag.isDragging ? "is-dragging" : ""}`}
                role="button"
                style={{
                  transform: `translateX(${flashcardDrag.offsetX}px) rotate(${flashcardRotation}deg)`,
                }}
                tabIndex={0}
                onClick={toggleFlashcardAnswer}
                onKeyDown={handleFlashcardKeyDown}
                onPointerCancel={handleFlashcardPointerEnd}
                onPointerDown={handleFlashcardPointerDown}
                onPointerMove={handleFlashcardPointerMove}
                onPointerUp={handleFlashcardPointerEnd}
              >
                <div
                  aria-hidden="true"
                  className="flashcard-swipe-hint"
                  style={{ opacity: flashcardDragOpacity }}
                >
                  {flashcardDragDirection}
                </div>
                <div className="flashcard-front">
                  <span>Word</span>
                  <h2>{selectedItem.word}</h2>
                  <p>
                    {selectedItem.video?.languageFolder?.name || "Vocabulary"} ·{" "}
                    Reviewed {selectedItem.timesReviewed || 0}x
                  </p>
                </div>

                <div className="flashcard-answer">
                  <span>Meaning</span>
                  <h3>{selectedItem.meaning || "No meaning yet."}</h3>
                  <p>{selectedItem.example || "No example sentence yet."}</p>
                </div>
              </article>

              <button
                className="btn btn-outline-secondary flashcard-nav-btn"
                onClick={() => moveStudyCard(1)}
              >
                <FaChevronRight />
              </button>
            </div>

            <div className="flashcard-study-actions">
              <button
                className="btn btn-outline-primary"
                onClick={() => setShowAnswer((value) => !value)}
              >
                {showAnswer ? "Hide answer" : "Show answer"}
              </button>
              <button
                className="btn btn-outline-secondary"
                disabled={!selectedItem.videoId}
                onClick={() => openVideo(selectedItem)}
              >
                <FaExternalLinkAlt />
                <span>Open video</span>
              </button>
            </div>

            <div className="review-actions flashcard-review-actions">
              <button
                className="btn btn-outline-danger"
                onClick={() => reviewItem(selectedItem, "again")}
              >
                <FaRedoAlt />
                <span>Again</span>
              </button>
              <button
                className="btn btn-outline-primary"
                onClick={() => reviewItem(selectedItem, "good")}
              >
                <FaStar />
                <span>Good</span>
              </button>
              <button
                className="btn btn-success"
                onClick={() => reviewItem(selectedItem, "mastered")}
              >
                <FaCheckCircle />
                <span>Mastered</span>
              </button>
            </div>

            <div className="flashcard-source study-source">
              <strong>{selectedItem.video?.title || "No video linked"}</strong>
              <p>{selectedItem.video?.channelTitle || "Unknown channel"}</p>
            </div>
          </section>
        )}

        {studyScreen === "list" && (
          <>
            <div className="vocabulary-toolbar">
              <div className="vocabulary-search">
                <FaSearch />
                <input
                  className="form-control"
                  placeholder="Search word, meaning, example, video..."
                  value={keyword}
                  onChange={handleSearchChange}
                />
              </div>

              <div className="vocabulary-toolbar-actions">
                <select
                  className="form-select"
                  value={languageId}
                  onChange={(e) => updateFilter({ languageId: e.target.value })}
                >
                  <option value="">All folders</option>
                  {languages.map((language) => (
                    <option key={language.id} value={language.id}>
                      {language.name}
                    </option>
                  ))}
                </select>
                <select
                  className="form-select video-filter"
                  disabled={!languageId}
                  value={videoId}
                  onChange={(e) => updateFilter({ videoId: e.target.value })}
                >
                  <option value="">All videos</option>
                  {availableVideos.map((video) => (
                    <option key={video.id} value={video.id}>
                      {video.title || video.youtubeVideoId}
                    </option>
                  ))}
                </select>
                <select
                  className="form-select"
                  value={status}
                  onChange={(e) => updateFilter({ status: e.target.value })}
                >
                  <option value="all">All status</option>
                  <option value="new">New</option>
                  <option value="learning">Learning</option>
                  <option value="mastered">Mastered</option>
                </select>
                <select
                  className="form-select"
                  value={sort}
                  onChange={(e) => updateFilter({ sort: e.target.value })}
                >
                  <option value="createdAt,desc">Newest</option>
                  <option value="reviewAt,asc">Review soon</option>
                  <option value="word,asc">A-Z</option>
                  <option value="timesReviewed,desc">Most reviewed</option>
                </select>
                <button
                  className="btn btn-outline-secondary"
                  onClick={() =>
                    setSearchParams({
                      page: "1",
                      search: "",
                      status: "all",
                      sort: "createdAt,desc",
                      languageId: "",
                      videoId: "",
                    })
                  }
                >
                  <FaFilter />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            <div className="vocabulary-layout">
              <section className="vocabulary-list">
                {isLoading && items.length === 0 ? (
                  <div className="vocabulary-empty">Loading vocabulary...</div>
                ) : items.length > 0 ? (
                  items.map((item) => (
                    <article
                      className={`vocabulary-row ${
                        item.id === selectedItem?.id ? "active" : ""
                      }`}
                      key={item.id}
                    >
                      <button
                        className="vocabulary-row-main"
                        onClick={() => selectItem(item)}
                      >
                        <div>
                          <strong>{item.word}</strong>
                          <p>{item.meaning || "No meaning yet."}</p>
                          <small>
                            {item.video?.languageFolder?.name || "No folder"} ·{" "}
                            {item.video?.title || "No video"}
                          </small>
                        </div>
                      </button>
                      <span
                        className={`vocabulary-status ${item.status || "new"}`}
                      >
                        {statusLabels[item.status] || item.status || "New"}
                      </span>
                      <button
                        className="btn btn-outline-primary vocabulary-study-btn"
                        onClick={() => openStudyModes(item)}
                      >
                        <FaPlay />
                        <span>Study</span>
                      </button>
                    </article>
                  ))
                ) : (
                  <div className="vocabulary-empty">
                    <p>No vocabulary yet.</p>
                    <button
                      className="btn btn-primary mt-3"
                      onClick={() => navigate("/videos")}
                    >
                      Open videos
                    </button>
                  </div>
                )}

                <nav
                  className="vocabulary-footer"
                  aria-label="Vocabulary pagination"
                >
                  <ul className="pagination">
                    <li
                      className={`page-item ${currentPage <= 1 ? "disabled" : ""}`}
                    >
                      <button
                        className="page-link"
                        disabled={currentPage <= 1}
                        onClick={() => goToPage(currentPage - 1)}
                      >
                        &lt;
                      </button>
                    </li>

                    {Array.from({ length: totalPages || 1 }, (_, index) => {
                      const page = index + 1;

                      return (
                        <li
                          className={`page-item ${
                            page === currentPage ? "active" : ""
                          }`}
                          key={`vocab-page-${page}`}
                        >
                          <button
                            className="page-link"
                            onClick={() => goToPage(page)}
                          >
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
                        &gt;
                      </button>
                    </li>
                  </ul>
                </nav>
              </section>

              <aside className="study-launch-panel">
                {selectedItem ? (
                  <>
                    <div className="flashcard-meta">
                      <span
                        className={`vocabulary-status ${selectedItem.status || "new"}`}
                      >
                        {statusLabels[selectedItem.status] ||
                          selectedItem.status ||
                          "New"}
                      </span>
                      <span>Reviewed {selectedItem.timesReviewed || 0}x</span>
                      <span>{formatDate(selectedItem.reviewAt)}</span>
                    </div>

                    <div className="study-launch-copy">
                      <FaLayerGroup />
                      <span>Selected word</span>
                      <h2>{selectedItem.word}</h2>
                      <p>{selectedItem.meaning || "No meaning yet."}</p>
                    </div>

                    <div className="flashcard-actions">
                      <button
                        className="btn btn-primary"
                        onClick={() => openStudyModes()}
                      >
                        <FaPlay />
                        <span>Study selected</span>
                      </button>
                      <button
                        className="btn btn-outline-secondary"
                        disabled={!selectedItem.videoId}
                        onClick={() => openVideo(selectedItem)}
                      >
                        <FaExternalLinkAlt />
                        <span>Video</span>
                      </button>
                    </div>

                    <div className="flashcard-source">
                      <strong>
                        {selectedItem.video?.title || "No video linked"}
                      </strong>
                      <p>
                        {selectedItem.video?.channelTitle || "Unknown channel"}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="vocabulary-empty">
                    Choose a word to review.
                  </div>
                )}
              </aside>
            </div>
          </>
        )}
      </div>
    </main>
  );
};

export default Vocabulary;
