import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { ForgotPassword as ForgotPasswordApi } from "../../services/ServiceApi";
import "../login.scss";
const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      {
        toast.error("Please enter your email");
      }
      return;
    }
    setIsSending(true);
    try {
      const res = await ForgotPasswordApi(email.trim());
      if (res?.EC === 0) {
        toast.success(res.EM);
      } else {
        toast.error(res.EM);
      }
    } finally {
      setIsSending(false);
    }
  };
  return (
    <main className="auth-page login-container">
      <div className="auth-intro login-right d-none d-md-flex">
        <div className="login-right-content">
          <div className="brand">LinguaTube</div>
          <h1>Reset your password.</h1>
          <p>Enter your email and we will send you a password reset link.</p>
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
              <h2>Forgot password</h2>
            </div>

            <input
              type="email"
              className="form-control"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSending}
            >
              {isSending ? "Sending..." : "Send reset link"}
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

export default ForgotPassword;
