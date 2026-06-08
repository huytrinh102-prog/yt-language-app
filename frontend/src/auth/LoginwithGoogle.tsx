import { GoogleLogin } from "@react-oauth/google";

import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { loginSuccess } from "../redux/slices/authSlice";
import { LoginbyGoogle } from "../services/ServiceApi";

const LoginwithGoogle = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  return (
    <div>
      <GoogleLogin
        onSuccess={async (credentialResponse) => {
          try {
            const token = credentialResponse.credential;

            if (!token) {
              toast.error("Google token is missing");
              return;
            }
            const res = await LoginbyGoogle(token);
            if (res && +res.EC === 0) {
              localStorage.removeItem("auth_logged_out");
              localStorage.setItem("access_token", res.DT.access_token);
              dispatch(
                loginSuccess({
                  user: res.DT.user,
                  access_token: res.DT.access_token,
                }),
              );
              toast.success(res.EM);
              navigate("/users");
            } else {
              toast.error(res?.EM || "Login failed");
            }
          } catch (error) {
            const message =
              error instanceof Error
                ? error.message
                : "Login failed (network/server error)";

            toast.error(message);
          }
        }}
        onError={() => {
          toast.error("Login Failed");
        }}
      />
    </div>
  );
};

export default LoginwithGoogle;
