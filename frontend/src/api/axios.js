import axios from "axios";
import { pushAxiosNotification } from "../contexts/axiosNotify";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
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
    const originalRequest = error.config;

    // Handle login errors separately
    if (originalRequest.url.includes("/auth/login")) {
      return Promise.reject(error);
    }

    // Show notifications for ALL other API errors
    pushAxiosNotification(error);

    // Prevent refresh for refresh itself
    if (originalRequest.url.includes("/auth/refresh")) {
      return Promise.reject(error);
    }

    // Token refresh logic
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");
        const res = await api.post("/auth/refresh", {
          refresh_token: refreshToken,
        });

        const { access_token } = res.data;

        localStorage.setItem("access_token", access_token);

        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch {
        localStorage.clear();
        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
