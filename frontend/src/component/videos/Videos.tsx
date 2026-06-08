import "./Videos.scss";
import { useEffect, useState, type ChangeEvent } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  CreateVideo,
  DeleteVideo,
  GetLanguages,
  GetVideos,
  UpdateVideo,
} from "../../services/ServiceApi";
import type {
  UserLanguage,
  VideoItem,
  VideoPayload,
} from "../../utils/types/video";
import VideoCard from "./VideoCard";
import VideoFormModal from "./VideoFormModal";

const Videos = () => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [languages, setLanguages] = useState<UserLanguage[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);

  const { languageId = "" } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const currentLanguageId = Number(languageId);
  const currentLanguage = languages.find(
    (language) => language.id === currentLanguageId,
  );
  const currentPage = Number(searchParams.get("page") ?? 1) || 1;
  const keyword = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "id,desc";

  const fetchLanguages = async () => {
    const res = await GetLanguages();

    if (res && +res.EC === 0) {
      setLanguages(res.DT || []);
    }
  };

  const fetchVideos = async () => {
    if (!currentLanguageId) return;

    const res = await GetVideos(currentPage, 6, keyword, sort, currentLanguageId);

    if (res && +res.EC === 0) {
      setVideos(res.DT.videos || []);
      setTotalPages(res.DT.totalPages || 1);
    }
  };

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
    const timeout = setTimeout(() => {
      fetchVideos();
    }, 250);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLanguageId, currentPage, keyword, sort]);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchParams({ page: "1", search: e.target.value, sort });
  };

  const handleSubmitVideo = async (data: VideoPayload) => {
    if (!data.languageId) {
      toast.error("Please choose a language folder");
      return;
    }
    if (!data.youtubeVideoId.trim()) {
      toast.error("YouTube Video ID is required");
      return;
    }

    const res = editingVideo
      ? await UpdateVideo(editingVideo.id, data)
      : await CreateVideo(data);

    if (res && +res.EC === 0) {
      toast.success(res.EM);
      setShowModal(false);
      setEditingVideo(null);
      fetchVideos();
      fetchLanguages();
    } else {
      toast.error(res?.EM || "Save video failed");
    }
  };

  const handleDeleteVideo = async (video: VideoItem) => {
    const ok = window.confirm(`Delete this video? ${video.title}`);
    if (!ok) return;

    const res = await DeleteVideo(video.id);

    if (res && +res.EC === 0) {
      toast.success(res.EM);
      fetchVideos();
      fetchLanguages();
    } else {
      toast.error(res?.EM || "Delete video failed");
    }
  };

  const goToPage = (page: number) => {
    setSearchParams({ page: String(page), search: keyword, sort });
  };

  return (
    <main className="videos-page">
      <div className="container">
        <div className="videos-header">
          <div>
            <button
              className="btn btn-sm btn-outline-secondary mb-3"
              onClick={() => navigate("/videos")}
            >
              Back to folders
            </button>
            <h1>{currentLanguage?.name || "Language Videos"}</h1>
            <p>{currentLanguage?.description || "Saved lessons in this folder."}</p>
          </div>

          <button
            className="btn btn-primary"
            onClick={() => {
              setEditingVideo(null);
              setShowModal(true);
            }}
          >
            + Add video
          </button>
        </div>

        <div className="videos-toolbar">
          <input
            className="form-control videos-search"
            placeholder="Search title, channel, or video ID..."
            value={keyword}
            onChange={handleSearchChange}
          />

          <button
            className="btn btn-outline-secondary"
            onClick={() =>
              setSearchParams({ page: "1", search: "", sort: "id,desc" })
            }
          >
            Reset
          </button>
        </div>

        <div className="video-list">
          {videos.length > 0 ? (
            videos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                onOpen={(item) => navigate(`/videos/watch/${item.id}`)}
                onEdit={(item) => {
                  setEditingVideo(item);
                  setShowModal(true);
                }}
                onDelete={handleDeleteVideo}
              />
            ))
          ) : (
            <div className="videos-empty">
              <p>No videos in this folder yet.</p>
              <button
                className="btn btn-primary mt-3"
                onClick={() => {
                  setEditingVideo(null);
                  setShowModal(true);
                }}
              >
                Add first video
              </button>
            </div>
          )}
        </div>

        <nav className="videos-footer" aria-label="Videos pagination">
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
                  key={`page-${page}`}
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

      <VideoFormModal
        key={editingVideo?.id || `create-video-${currentLanguageId}`}
        show={showModal}
        languages={languages}
        currentLanguageId={currentLanguageId}
        editingVideo={editingVideo}
        onClose={() => {
          setShowModal(false);
          setEditingVideo(null);
        }}
        onSubmit={handleSubmitVideo}
      />
    </main>
  );
};

export default Videos;
