import axios from "axios";
import { pushAxiosNotification } from "../contexts/axiosNotify";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000",
  withCredentials: false,
});

// Request interceptor for adding access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor for refresh logic
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    // Trigger global toast notification
    pushAxiosNotification(error);

    const originalRequest = error.config;

    // Prevent refresh
    if (
      originalRequest.url.includes("/auth/login") ||
      originalRequest.url.includes("/auth/refresh")
    ) {
      return Promise.reject(error);
    }

    //  Token refresh logic
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");
        const res = await api.post("/auth/refresh", {
          refresh_token: refreshToken,
        });

        const { access_token } = res.data;

        // Save new token
        localStorage.setItem("access_token", access_token);

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed and Log out
        localStorage.clear();
        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
