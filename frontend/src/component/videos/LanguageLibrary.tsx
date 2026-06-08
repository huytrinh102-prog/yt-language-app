import "./Videos.scss";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  CreateLanguage,
  DeleteLanguage,
  GetLanguages,
  UpdateLanguage,
} from "../../services/ServiceApi";
import type { LanguagePayload, UserLanguage } from "../../utils/types/video";
import LanguageFormModal from "./LanguageFormModal";

const LanguageLibrary = () => {
  const [languages, setLanguages] = useState<UserLanguage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingLanguage, setEditingLanguage] = useState<UserLanguage | null>(
    null,
  );
  const navigate = useNavigate();

  const fetchLanguages = async () => {
    try {
      const res = await GetLanguages();

      if (res && +res.EC === 0) {
        setLanguages(res.DT || []);
      }
    } catch {
      setLanguages([]);
    }
  };

  useEffect(() => {
    let ignore = false;

    void GetLanguages().then((res) => {
      if (!ignore && res && +res.EC === 0) {
        setLanguages(res.DT || []);
      }
    }).catch(() => {
      if (!ignore) {
        setLanguages([]);
      }
    }).finally(() => {
      if (!ignore) {
        setIsLoading(false);
      }
    });

    return () => {
      ignore = true;
    };
  }, []);

  const handleSubmit = async (data: LanguagePayload) => {
    if (!data.name.trim()) {
      toast.error("Language name is required");
      return;
    }

    try {
      const res = editingLanguage
        ? await UpdateLanguage(editingLanguage.id, data)
        : await CreateLanguage(data);

      if (res && +res.EC === 0) {
        toast.success(res.EM);
        setShowModal(false);
        setEditingLanguage(null);
        await fetchLanguages();
      } else {
        toast.error(res?.EM || "Save folder failed");
      }
    } catch {
      // axios interceptor already handles the user-facing error.
    }
  };

  const handleDelete = async (language: UserLanguage) => {
    const ok = window.confirm(`Delete folder ${language.name}?`);
    if (!ok) return;

    setDeletingId(language.id);

    try {
      const res = await DeleteLanguage(language.id);

      if (res && +res.EC === 0) {
        toast.success(res.EM);
        await fetchLanguages();
      } else {
        toast.error(res?.EM || "Delete folder failed");
      }
    } catch {
      // axios interceptor already handles the user-facing error.
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="videos-page">
      <div className="container">
        <div className="videos-header">
          <div>
            <h1>Videos</h1>
            <p>Create language folders and organize your video lessons.</p>
          </div>

          <button
            className="btn btn-primary"
            onClick={() => {
              setEditingLanguage(null);
              setShowModal(true);
            }}
          >
            + New folder
          </button>
        </div>

        {isLoading ? (
          <div className="videos-empty">
            <p>Loading folders...</p>
          </div>
        ) : languages.length > 0 ? (
          <div className="language-grid">
            {languages.map((language) => (
              <article className="language-card" key={language.id}>
                <button
                  className="language-open"
                  onClick={() => navigate(`/videos/languages/${language.id}`)}
                >
                  <span
                    className="language-dot"
                    style={{ backgroundColor: language.color || "#2563eb" }}
                  />
                  <strong>{language.name}</strong>
                  <p>{language.description || "No description."}</p>
                  <span className="language-count">
                    {language.videos?.length || 0} videos
                  </span>
                </button>

                <div className="language-actions">
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => {
                      setEditingLanguage(language);
                      setShowModal(true);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    disabled={deletingId === language.id}
                    onClick={() => handleDelete(language)}
                  >
                    {deletingId === language.id ? "Deleting" : "Delete"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="videos-empty">
            <p>No language folders yet.</p>
            <button
              className="btn btn-primary mt-3"
              onClick={() => {
                setEditingLanguage(null);
                setShowModal(true);
              }}
            >
              Create your first folder
            </button>
          </div>
        )}
      </div>

      <LanguageFormModal
        key={editingLanguage?.id || "create-language"}
        show={showModal}
        editingLanguage={editingLanguage}
        onClose={() => {
          setShowModal(false);
          setEditingLanguage(null);
        }}
        onSubmit={handleSubmit}
      />
    </main>
  );
};

export default LanguageLibrary;
