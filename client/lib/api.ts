import axios from "axios";
import Cookies from "js-cookie";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Request Interceptor: Attach JWT Bearer Token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Helper function to normalize _id to id recursively across response objects
const normalizeData = (data: any): any => {
  if (Array.isArray(data)) {
    return data.map(normalizeData);
  }
  if (data && typeof data === "object") {
    const copy: any = { ...data };
    if (copy._id && !copy.id) {
      copy.id = copy._id;
    }
    for (const key of Object.keys(copy)) {
      if (copy[key] && typeof copy[key] === "object") {
        copy[key] = normalizeData(copy[key]);
      }
    }
    return copy;
  }
  return data;
};

// Response Interceptor: Normalize MongoDB _id to id and handle 401 Unauthorized globally
api.interceptors.response.use(
  (response) => {
    if (response.data) {
      response.data = normalizeData(response.data);
    }
    return response;
  },
  (error) => {
    // 401 Unauthorized handling: Clear invalid session token
    if (error.response && error.response.status === 401) {
      if (typeof window !== "undefined") {
        const isAuthRoute = window.location.pathname.includes("/login") || window.location.pathname.includes("/intro");
        if (!isAuthRoute) {
          Cookies.remove("token", { path: "/" });
          Cookies.remove("role", { path: "/" });
          localStorage.removeItem("trishul_user");
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
