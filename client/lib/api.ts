import axios, { InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";
import loadingService from "./LoadingService";

// Extend Axios module interfaces to support custom options & request tracking
declare module "axios" {
  export interface AxiosRequestConfig {
    showGlobalLoader?: boolean;
    requestId?: string;
  }
  export interface InternalAxiosRequestConfig {
    showGlobalLoader?: boolean;
    requestId?: string;
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Request Interceptor: Attach JWT Bearer Token & notify LoadingService
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = Cookies.get("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Generate unique request ID unless explicitly opted out
    if (config.showGlobalLoader !== false) {
      const requestId = `req_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
      config.requestId = requestId;
      loadingService.startRequest(requestId);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
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

// Response Interceptor: Normalize MongoDB _id to id, finish LoadingService request, and handle 401
api.interceptors.response.use(
  (response) => {
    const reqId = (response.config as any)?.requestId;
    if (reqId) {
      loadingService.finishRequest(reqId);
    }

    if (response.data) {
      response.data = normalizeData(response.data);
    }
    return response;
  },
  (error) => {
    const reqId = (error.config as any)?.requestId;
    if (reqId) {
      loadingService.finishRequest(reqId);
    }

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
