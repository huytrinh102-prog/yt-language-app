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

const emptyProfile: ProfilePayload = {
  username: "",
  phone: "",
  sex: "MALE",
  avatarUrl: "",
  avatarPublicId: "",
};

const Profile = () => {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const [form, setForm] = useState<ProfilePayload>(emptyProfile);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) return;

    const nextForm = {
      username: user.username || "",
      phone: user.phone || "",
      sex: user.sex || "MALE",
      avatarUrl: user.avatarUrl || "",
      avatarPublicId: user.avatarPublicId || "",
    };

    setForm(nextForm);
    setAvatarPreview(nextForm.avatarUrl);
    setAvatarFile(null);
  }, [user]);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

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

      if (avatarFile) {
        const signRes = await GetSignAvatar();
        const uploaded = await uploadToCloudinary(signRes.DT, avatarFile);

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
        setAvatarFile(null);
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
      <section className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Profile avatar" />
            ) : (
              <FaUserCircle />
            )}
          </div>

          <div className="profile-title">
            <h1>Profile</h1>
            <p>{user?.email}</p>
          </div>
        </div>

        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="profile-upload">
            <label htmlFor="profile-avatar" className="profile-upload-button">
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

          <div className="profile-grid">
            <div className="profile-field">
              <label className="form-label">Username</label>
              <input
                className="form-control"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Your username"
              />
            </div>

            <div className="profile-field">
              <label className="form-label">Phone</label>
              <input
                className="form-control"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Your phone number"
              />
            </div>

            <div className="profile-field">
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

            <div className="profile-field">
              <label className="form-label">Email</label>
              <input
                className="form-control"
                value={user?.email || ""}
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
