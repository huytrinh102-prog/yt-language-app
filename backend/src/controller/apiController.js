import loginRegisterService from "../service/LoginRegisterService.js";
import jwt from "jsonwebtoken";

const refreshCookieOptions = () => {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "None" : "Lax",
    path: "/api/v1/refresh-token",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  };
};

const clearRefreshCookieOptions = () => {
  const { maxAge, ...options } = refreshCookieOptions();
  return options;
};

const setRefreshCookie = (res, user) => {
  if (!process.env.jwtRefreshKey) return;
  if (!user?.id) return;
  const refresh_token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.jwtRefreshKey,
    { expiresIn: "30d" },
  );
  res.cookie("refresh_token", refresh_token, refreshCookieOptions());
};

const clearRefreshCookie = (res) => {
  res.clearCookie("refresh_token", clearRefreshCookieOptions());
};
const handleRefreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) {
      return res.status(401).json({ EC: 1, EM: "No refresh token", DT: "" });
    }
    if (!process.env.jwtRefreshKey) {
      return res
        .status(500)
        .json({ EC: 1, EM: "Missing jwtRefreshKey", DT: "" });
    }

    const decoded = jwt.verify(refreshToken, process.env.jwtRefreshKey);
    const data = await loginRegisterService.RefreshByUserId(decoded?.id);
    return res.status(200).json({
      EM: data.EM,
      EC: data.EC,
      DT: data.DT,
    });
  } catch (error) {
    console.log(error);
    return res.status(401).json({ EC: 1, EM: "Invalid refresh token", DT: "" });
  }
};

const testApi = (req, res) => {
  return res.status(200).json({
    data: "oke",
    name: "yu",
  });
};
const handleRegister = async (req, res) => {
  try {
    if (!req.body.email || !req.body.password || !req.body.phone) {
      return res.status(200).json({
        EM: "Missing required parameters",
        EC: 1,
        DT: "",
      });
    }
    if (String(req.body.password || "").length < 8) {
      return res.status(200).json({
        EM: "Your password must have at least 8 characters",
        EC: 1,
        DT: "",
      });
    }
    let data = await loginRegisterService.Register(req.body);
    return res.status(200).json({
      EM: data.EM,
      EC: data.EC,
      DT: "",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      EM: "Error from sever",
      EC: "-1",
      DT: "",
    });
  }
};
const handleLogin = async (req, res) => {
  try {
    let data = await loginRegisterService.Login(req.body);
    if (data && +data.EC === 0) {
      setRefreshCookie(res, data?.DT?.user);
    }
    return res.status(200).json({
      EM: data.EM,
      EC: data.EC,
      DT: data.DT,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      EM: "Error from sever",
      EC: "-1",
      DT: "",
    });
  }
};
const handleLogout = async (req, res) => {
  clearRefreshCookie(res);
  return res.status(200).json({
    EM: "Logout success",
    EC: 0,
    DT: "",
  });
};

const handleLoginGoogle = async (req, res) => {
  try {
    let { token } = req.body;
    let data = await loginRegisterService.googleLogin(token);
    if (data && +data.EC === 0) {
      setRefreshCookie(res, data?.DT?.user);
    }
    return res.status(200).json({
      EM: data.EM,
      EC: data.EC,
      DT: data.DT,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      EM: "Error from sever",
      EC: "-1",
      DT: "",
    });
  }
};

// reset password
const handleForgotPassword = async (req, res) => {
  const data = await loginRegisterService.forgotPassword(req.body.email);
  return res.status(200).json({
    EM: data.EM,
    EC: data.EC,
    DT: data.DT,
  });
};

const handleResetPassword = async (req, res) => {
  const data = await loginRegisterService.resetPassword(
    req.body.token,
    req.body.newPassword,
  );

  return res.status(200).json({
    EM: data.EM,
    EC: data.EC,
    DT: data.DT,
  });
};
export default {
  testApi,
  handleRegister,
  handleLogin,
  handleLogout,
  handleRefreshToken,
  handleLoginGoogle,
  handleForgotPassword,
  handleResetPassword,
};
