import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { ResetPassword as ResetPasswordApi } from "../../services/ServiceApi";
import "../login.scss";
const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  const handleSubmit = async () => {
    if (!token) {
      toast.error("Reset token is missing");
      return;
    }
    if (!newPassword) {
      toast.error("Please enter new password");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must have at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Confirm password does not match");
      return;
    }
    setIsSaving(true);
    try {
      const res = await ResetPasswordApi(token, newPassword);
      if (res.EC === 0) {
        toast.success(res.EM);
        navigate("/login");
      } else {
        toast.error(res.EM);
      }
    } finally {
      setIsSaving(false);
    }
  };
  if (!token) {
    return (
      <main className="auth-page login-container">
        <div className="auth-form-side login-left">
          <div className="login-left-wrap">
            <div className="auth-card login-left-content">
              <div className="auth-card-header">
                <span>Invalid link</span>
                <h2>Reset link is missing</h2>
              </div>

              <Link className="btn btn-primary" to="/forgot-password">
                Request new reset link
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }
  return (
    <main className="auth-page login-container">
      <div className="auth-intro login-right d-none d-md-flex">
        <div className="login-right-content">
          <div className="brand">LinguaTube</div>
          <h1>Create a new password.</h1>
          <p>Your new password must have at least 8 characters.</p>
        </div>
      </div>

      <div className="auth-form-side login-left">
        <div className="login-left-wrap">
          <form
            className="auth-card login-left-content"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <div className="auth-card-header">
              <span>Password reset</span>
              <h2>New password</h2>
            </div>

            <input
              type="password"
              className="form-control"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <input
              type="password"
              className="form-control"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Reset password"}
            </button>

            <Link className="forgot-password text-center" to="/login">
              Back to login
            </Link>
          </form>
        </div>
      </div>
    </main>
  );
};
export default ResetPassword;
