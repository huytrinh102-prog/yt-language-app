import { useState } from "react";
import "./login.scss";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { LoginUser } from "../services/ServiceApi.ts";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../redux/slices/authSlice";
import LoginwithGoogle from "./LoginwithGoogle";
const Login = () => {
  const [input, setInput] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handlegotoRegister = () => {
    navigate("/register");
  };

  const handleLogin = async () => {
    if (!input || !password) {
      toast.error("Please fill the form!");
      return;
    }
    const res = await LoginUser(input, password);
    if (res && +res?.EC === 0) {
      localStorage.removeItem("auth_logged_out");
      localStorage.setItem("access_token", res.DT.access_token);
      dispatch(
        loginSuccess({
          user: res.DT.user,
          access_token: res.DT.access_token,
        }),
      );
      toast.success(res.EM);
      navigate("/");
    } else {
      toast.error(res?.EM || "Login failed");
    }
  };

  return (
    <main className="auth-page login-container">
      <div className="auth-intro login-right d-none d-md-flex">
        <div className="login-right-content">
          <div className="brand">LinguaTube</div>
          <h1>Learn from real videos with less clutter.</h1>
          <p>
            Save YouTube lessons, keep transcripts beside the player, and turn
            new words into review cards.
          </p>
          <div className="auth-stats">
            <span>Videos</span>
            <span>Notes</span>
            <span>Vocabulary</span>
          </div>
        </div>
      </div>

      <div className="auth-form-side login-left">
        <div className="login-left-wrap">
          <div className="brand d-md-none">LinguaTube</div>
          <form
            className="auth-card login-left-content"
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
          >
            <div className="auth-card-header">
              <span>Welcome back</span>
              <h2>Sign in to continue</h2>
            </div>
            <input
              name="inputs"
              type="text"
              placeholder="Email or Phone number"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
              }}
              className="form-control"
            ></input>{" "}
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control"
            ></input>
            <button type="submit" className="btn btn-primary">
              Login
            </button>
            <Link className="forgot-password text-center" to="/forgot-password">
              Forgot your password?
            </Link>
            <hr></hr>
            <div className="text-center">
              <button
                type="button"
                onClick={() => handlegotoRegister()}
                className="btn btn-success"
              >
                Create new account
              </button>
            </div>
            <div className="d-flex justify-content-center">
              <LoginwithGoogle />
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};
export default Login;
