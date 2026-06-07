import { useState, type FormEvent } from "react";
import type { LanguagePayload, UserLanguage } from "../../utils/types/video";

const getInitialForm = (
  editingLanguage: UserLanguage | null,
): LanguagePayload => {
  if (!editingLanguage) {
    return {
      name: "",
      code: "",
      description: "",
      color: "#2563eb",
    };
  }

  return {
    name: editingLanguage.name,
    code: editingLanguage.code || "",
    description: editingLanguage.description || "",
    color: editingLanguage.color || "#2563eb",
  };
};

type LanguageFormModalProps = {
  show: boolean;
  editingLanguage: UserLanguage | null;
  onClose: () => void;
  onSubmit: (data: LanguagePayload) => Promise<void>;
};

const LanguageFormModal = ({
  show,
  editingLanguage,
  onClose,
  onSubmit,
}: LanguageFormModalProps) => {
  const [form, setForm] = useState<LanguagePayload>(() =>
    getInitialForm(editingLanguage),
  );

  if (!show) return null;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await onSubmit(form);
  };

  return (
    <div className="modal show d-block video-modal" tabIndex={-1}>
      <div className="modal-dialog">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">
                {editingLanguage ? "Edit folder" : "Create folder"}
              </h5>
              <button type="button" className="btn-close" onClick={onClose} />
            </div>

            <div className="modal-body">
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label">Language name</label>
                  <input
                    className="form-control"
                    placeholder="English"
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label">Code</label>
                  <input
                    className="form-control"
                    placeholder="en"
                    value={form.code}
                    onChange={(e) =>
                      setForm({ ...form, code: e.target.value })
                    }
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label">Color</label>
                  <input
                    className="form-control form-control-color"
                    type="color"
                    value={form.color}
                    onChange={(e) =>
                      setForm({ ...form, color: e.target.value })
                    }
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Listening and speaking practice"
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
                {editingLanguage ? "Save changes" : "Create folder"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LanguageFormModal;
