import { useState, type FormEvent } from "react";
import { toast } from "react-toastify";
import { FetchYoutubeMetadata } from "../../services/ServiceApi";
import type {
  UserLanguage,
  VideoItem,
  VideoPayload,
} from "../../utils/types/video";

const getInitialForm = (
  editingVideo: VideoItem | null,
  currentLanguageId: number,
): VideoPayload => {
  if (!editingVideo) {
    return {
      languageId: currentLanguageId,
      youtubeVideoId: "",
      title: "",
      description: "",
      thumbnailUrl: "",
      channelTitle: "",
      durationSeconds: 0,
      language: "",
    };
  }

  return {
    languageId: editingVideo.languageId,
    youtubeVideoId: editingVideo.youtubeVideoId,
    title: editingVideo.title,
    description: editingVideo.description || "",
    thumbnailUrl: editingVideo.thumbnailUrl || "",
    channelTitle: editingVideo.channelTitle || "",
    durationSeconds: editingVideo.durationSeconds || 0,
    language: editingVideo.language || "",
  };
};

type VideoFormModalProps = {
  show: boolean;
  languages: UserLanguage[];
  currentLanguageId: number;
  editingVideo: VideoItem | null;
  onClose: () => void;
  onSubmit: (data: VideoPayload) => Promise<void>;
};

const VideoFormModal = ({
  show,
  languages,
  currentLanguageId,
  editingVideo,
  onClose,
  onSubmit,
}: VideoFormModalProps) => {
  const [form, setForm] = useState<VideoPayload>(() =>
    getInitialForm(editingVideo, currentLanguageId),
  );
  const [isFetchingYoutube, setIsFetchingYoutube] = useState(false);

  if (!show) return null;

  const handleFetchYoutube = async () => {
    if (!form.youtubeVideoId.trim()) {
      toast.error("Paste YouTube URL or video ID first");
      return;
    }

    setIsFetchingYoutube(true);

    try {
      const res = await FetchYoutubeMetadata(form.youtubeVideoId);

      if (res && +res.EC === 0 && res.DT) {
        setForm({
          ...form,
          youtubeVideoId: res.DT.youtubeVideoId || form.youtubeVideoId,
          title: res.DT.title || form.title,
          description: res.DT.description || form.description,
          thumbnailUrl: res.DT.thumbnailUrl || form.thumbnailUrl,
          channelTitle: res.DT.channelTitle || form.channelTitle,
          durationSeconds: res.DT.durationSeconds || form.durationSeconds,
          language: res.DT.language || form.language,
        });
        toast.success("YouTube info loaded");
      } else {
        toast.error(res?.EM || "Cannot fetch YouTube info");
      }
    } finally {
      setIsFetchingYoutube(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await onSubmit(form);
  };

  return (
    <div className="modal show d-block video-modal" tabIndex={-1}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">
                {editingVideo ? "Edit video" : "Add video"}
              </h5>
              <button type="button" className="btn-close" onClick={onClose} />
            </div>

            <div className="modal-body">
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label">Language folder</label>
                  <select
                    className="form-select"
                    value={form.languageId || ""}
                    onChange={(e) =>
                      setForm({ ...form, languageId: Number(e.target.value) })
                    }
                  >
                    <option value="">Choose folder</option>
                    {languages.map((language) => (
                      <option key={language.id} value={language.id}>
                        {language.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label">YouTube Video ID</label>
                  <div className="input-group">
                    <input
                      className="form-control"
                      value={form.youtubeVideoId}
                      disabled={!!editingVideo}
                      onChange={(e) =>
                        setForm({ ...form, youtubeVideoId: e.target.value })
                      }
                    />
                    <button
                      className="btn btn-outline-secondary"
                      disabled={!!editingVideo || isFetchingYoutube}
                      type="button"
                      onClick={handleFetchYoutube}
                    >
                      {isFetchingYoutube ? "Loading" : "Auto"}
                    </button>
                  </div>
                </div>

                <div className="col-12">
                  <label className="form-label">Title</label>
                  <input
                    className="form-control"
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label">Channel</label>
                  <input
                    className="form-control"
                    value={form.channelTitle}
                    onChange={(e) =>
                      setForm({ ...form, channelTitle: e.target.value })
                    }
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label">Duration seconds</label>
                  <input
                    className="form-control"
                    type="number"
                    value={form.durationSeconds}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        durationSeconds: Number(e.target.value),
                      })
                    }
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">Thumbnail URL</label>
                  <input
                    className="form-control"
                    value={form.thumbnailUrl}
                    onChange={(e) =>
                      setForm({ ...form, thumbnailUrl: e.target.value })
                    }
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={onClose}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {editingVideo ? "Save changes" : "Create video"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VideoFormModal;
