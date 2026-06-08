import "./Profile.scss";
import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { toast } from "react-toastify";
import { FaCamera, FaSave, FaUserCircle } from "react-icons/fa";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { loginSuccess } from "../../redux/slices/authSlice";
import {
  GetSignAvatar,
  UpdateProfile,
  uploadToCloudinary,
} from "../../services/ServiceApi";
import type { ProfilePayload } from "../../utils/types/user";

const defaultForm: ProfilePayload = {
  username: "",
  phone: "",
  sex: "MALE",
  avatarUrl: "",
  avatarPublicId: "",
};

const Profile = () => {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const [form, setForm] = useState<ProfilePayload>(defaultForm);
  const [preview, setPreview] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) return;

    const nextForm = {
      username: String(user.username || ""),
      phone: String(user.phone || ""),
      sex: String(user.sex || "MALE"),
      avatarUrl: String(user.avatarUrl || ""),
      avatarPublicId: String(user.avatarPublicId || ""),
    };

    setForm(nextForm);
    setPreview(nextForm.avatarUrl || "");
    setSelectedFile(null);
  }, [user]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!form.username.trim()) {
      toast.error("Username is required");
      return;
    }

    if (!form.phone.trim() || form.phone.trim().length < 8) {
      toast.error("Phone must have at least 8 digits");
      return;
    }

    setIsSaving(true);

    try {
      let payload: ProfilePayload = {
        ...form,
        username: form.username.trim(),
        phone: form.phone.trim(),
      };

      if (selectedFile) {
        const signature = await GetSignAvatar();
        const uploaded = await uploadToCloudinary(signature.DT, selectedFile);

        payload = {
          ...payload,
          avatarUrl: uploaded.secure_url || "",
          avatarPublicId: uploaded.public_id || "",
        };
      }

      const res = await UpdateProfile(payload);

      if (res && +res.EC === 0) {
        toast.success(res.EM);
        dispatch(
          loginSuccess({
            user: res.DT,
            access_token: localStorage.getItem("access_token") || "",
          }),
        );
        setSelectedFile(null);
      } else {
        toast.error(res?.EM || "Update profile failed");
      }
    } catch (error) {
      console.log(error);
      toast.error("Update profile failed");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="profile-page">
      <section className="profile-shell">
        <div className="profile-summary">
          <div className="profile-avatar">
            {preview ? (
              <img src={preview} alt="Profile avatar" />
            ) : (
              <FaUserCircle />
            )}
          </div>
          <div>
            <h1>Profile</h1>
            <p>{user?.email}</p>
          </div>
        </div>

        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="profile-upload">
            <label className="avatar-upload-btn" htmlFor="profile-avatar">
              <FaCamera />
              <span>Change avatar</span>
            </label>
            <input
              id="profile-avatar"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
            />
          </div>

          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label className="form-label">Username</label>
              <input
                className="form-control"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Your username"
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label">Phone</label>
              <input
                className="form-control"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Your phone number"
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label">Gender</label>
              <select
                className="form-select"
                name="sex"
                value={form.sex}
                onChange={handleChange}
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label">Email</label>
              <input
                className="form-control"
                value={String(user?.email || "")}
                disabled
              />
            </div>
          </div>

          <div className="profile-actions">
            <button className="btn btn-primary" type="submit" disabled={isSaving}>
              <FaSave />
              <span>{isSaving ? "Saving..." : "Save changes"}</span>
            </button>
          </div>
        </form>
      </section>
    </main>
  );
};

export default Profile;
