import axios from "axios";
import {
  isCustomerAuthenticated,
  isManagerAuthenticated,
  logout,
} from "../auth/session";

const getCorrelationId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `cid-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
  withCredentials: true,
  withXSRFToken: true,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
});

api.interceptors.request.use((config) => {
  config.headers = config.headers || {};

  if (!config.headers["X-Correlation-Id"]) {
    config.headers["X-Correlation-Id"] = getCorrelationId();
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const requestUrl = error.config?.url || "";
      const skipAuthHandling = Boolean(error.config?.meta?.skipAuthHandling);

      if (skipAuthHandling) {
        return Promise.reject(error);
      }

      const isSessionProbe = requestUrl.includes("/auth/me");
      const hasLocalSession = isManagerAuthenticated() || isCustomerAuthenticated();

      if (status === 401) {
        if (isSessionProbe || !hasLocalSession) {
          return Promise.reject(error);
        }

        logout("/home");
        return Promise.reject(error);
      }

      if (status === 403) {
        if (isManagerAuthenticated()) {
          window.location.href = "/painel";
          return Promise.reject(error);
        }

        if (isCustomerAuthenticated()) {
          window.location.href = "/dashboard";
          return Promise.reject(error);
        }

        logout("/home");
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);

export default api;

