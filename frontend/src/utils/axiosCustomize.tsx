import axios from "axios";
import { toast } from "react-toastify";
import type { ApiResponse } from "./types/api";

let isRedirectingToLogin = false;
const productionApiUrl = "https://yt-language-backend.onrender.com/";
const localApiUrl = import.meta.env.VITE_API_URL || "http://localhost:8082/";
const baseURL =
  window.location.hostname === "localhost" ? localApiUrl : productionApiUrl;

const getServerMessage = (data: unknown) => {
  if (!data || typeof data !== "object") return "";

  const responseData = data as { EM?: unknown; message?: unknown };

  if (typeof responseData.EM === "string" && responseData.EM) {
    return responseData.EM;
  }

  if (typeof responseData.message === "string" && responseData.message) {
    return responseData.message;
  }

  return "";
};

const instance = axios.create({
  baseURL,
  timeout: 10000,
  withCredentials: true,
});

// =======================
// REQUEST INTERCEPTOR
// =======================
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");

  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }

  return config;
});

// =======================
// RESPONSE INTERCEPTOR
// =======================
instance.interceptors.response.use(
  (res) => res.data,

  async (error) => {
    const status = error.response?.status;
    const originalRequest = error.config;

    if (!error.response) {
      toast.error("Network error");
      return Promise.reject(error);
    }

    // =======================
    // AUTO REFRESH TOKEN
    // =======================
    if (
      status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("refresh-token") &&
      !originalRequest.url?.includes("logout") &&
      localStorage.getItem("auth_logged_out") !== "true"
    ) {
      originalRequest._retry = true;

      try {
        const refreshRes = await instance.post<
          ApiResponse<{ access_token: string }>,
          ApiResponse<{ access_token: string }>
        >("api/v1/refresh-token");

        if (refreshRes.EC === 0) {
          const newToken = refreshRes.DT.access_token;

          localStorage.setItem("access_token", newToken);

          originalRequest.headers = {
            ...originalRequest.headers,
            Authorization: `Bearer ${newToken}`,
          };

          return instance(originalRequest);
        }
      } catch {
        localStorage.removeItem("access_token");
        if (!isRedirectingToLogin && window.location.pathname !== "/login") {
          isRedirectingToLogin = true;
          toast.error("Session expired, please login again");
          window.location.href = "/login";
        }
      }
    }
    const messages: Record<number, string> = {
      400: "Bad request",
      401: "Unauthorized",
      403: "No permission",
      404: "Not found",
      500: "Server error",
    };
    if (status === 401) {
      return Promise.reject(error);
    }
    toast.error(
      getServerMessage(error.response.data) || messages[status] || "Unknown error",
    );

    return Promise.reject(error);
  },
);

export default instance;
