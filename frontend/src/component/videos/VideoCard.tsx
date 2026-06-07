import type { VideoItem } from "../../utils/types/video";

type VideoCardProps = {
  video: VideoItem;
  onOpen: (video: VideoItem) => void;
  onEdit: (video: VideoItem) => void;
  onDelete: (video: VideoItem) => void;
};

const formatDuration = (seconds: number) => {
  if (!seconds) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
};

const VideoCard = ({ video, onOpen, onEdit, onDelete }: VideoCardProps) => {
  return (
    <article className="video-card">
      <div className="video-thumb">
        {video.thumbnailUrl ? (
          <img src={video.thumbnailUrl} alt={video.title} />
        ) : (
          <span>No thumbnail</span>
        )}
      </div>

      <div className="video-info">
        <h2>{video.title || "Untitled video"}</h2>

        <div className="video-meta">
          <span>{video.channelTitle || "Unknown channel"}</span>
          <span>{formatDuration(video.durationSeconds)}</span>
          <span>{video.youtubeVideoId}</span>
        </div>

        <p>{video.description || "No description."}</p>

        <div className="video-actions">
          <button
            className="btn btn-sm btn-primary"
            onClick={() => onOpen(video)}
          >
            Open
          </button>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => onEdit(video)}
          >
            Edit
          </button>
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={() => onDelete(video)}
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
};

export default VideoCard;
