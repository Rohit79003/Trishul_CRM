import axios, { InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";
import loadingService from "./LoadingService";
import backendStatusService from "@/services/backendStatus";

// Extend Axios module interfaces to support custom options & request tracking
declare module "axios" {
  export interface AxiosRequestConfig {
    showGlobalLoader?: boolean;
    requestId?: string;
    _retry?: boolean;
  }
  export interface InternalAxiosRequestConfig {
    showGlobalLoader?: boolean;
    requestId?: string;
    _retry?: boolean;
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

// Request Interceptor: Attach JWT Bearer Token, queue requests if backend is sleeping, & notify LoadingService
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
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

    // If backend is sleeping & request is not health check, pause and wait until ready
    const isHealthEndpoint = config.url?.includes("/health");
    if (!isHealthEndpoint) {
      const currentStatus = backendStatusService.getState();
      if (currentStatus.isSleeping) {
        await backendStatusService.waitUntilReady();
      }
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

// Response Interceptor: Handle MongoDB _id normalization, network error retry queueing, and 401
api.interceptors.response.use(
  (response) => {
    const reqId = (response.config as any)?.requestId;
    if (reqId) {
      loadingService.finishRequest(reqId);
    }

    // Backend responded successfully: Mark backend as healthy
    const isHealthEndpoint = response.config.url?.includes("/health");
    if (!isHealthEndpoint && !backendStatusService.getState().isReady) {
      backendStatusService.checkHealth();
    }

    if (response.data) {
      response.data = normalizeData(response.data);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig;
    const reqId = originalRequest?.requestId;

    if (reqId) {
      loadingService.finishRequest(reqId);
    }

    // Detect server infrastructure / cold start / network drop errors
    const isNetworkError =
      error.code === "ERR_NETWORK" ||
      error.code === "ECONNABORTED" ||
      error.code === "ETIMEDOUT" ||
      !error.response ||
      error.response.status === 503 ||
      error.response.status === 504;

    const isHealthEndpoint = originalRequest?.url?.includes("/health");

    if (isNetworkError && !isHealthEndpoint) {
      // Signal backend service that backend is sleeping/waking up
      backendStatusService.markAsSleeping("Backend is starting up or temporarily unreachable");

      // Auto-retry queued request once backend becomes ready
      if (originalRequest && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          await backendStatusService.waitUntilReady();
          return await api(originalRequest);
        } catch (retryErr) {
          return Promise.reject(retryErr);
        }
      }
    }

    // 401 Unauthorized handling: Clear invalid session token
    if (error.response && error.response.status === 401) {
      if (typeof window !== "undefined") {
        const isAuthRoute =
          window.location.pathname.includes("/login") || window.location.pathname.includes("/intro");
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
