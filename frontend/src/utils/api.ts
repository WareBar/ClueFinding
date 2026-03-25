import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        try {
          const response = await api.post("/auth/token/refresh/", {
            refresh: refreshToken,
          });

          const newAccessToken = response.data.access;
          localStorage.setItem("accessToken", newAccessToken);

          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

          return api(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          console.error("Refresh token failed:", refreshError);
          return Promise.reject(error);
        }
      } else {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        console.error("No refresh token available");
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default api;