import axios from "axios";
import { ensureCsrfToken } from "../auth/csrf";
import {
  isCustomerAuthenticated,
  isManagerAuthenticated,
  logout,
} from "../auth/session";

const MUTATING_METHODS = new Set(["post", "put", "patch", "delete"]);

const getCorrelationId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `cid-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};


const getXsrfCookieToken = () => {
  if (typeof document === "undefined") {
    return "";
  }

  const match = document.cookie
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith("XSRF-TOKEN="));

  if (!match) {
    return "";
  }

  const [, value] = match.split("=");
  return decodeURIComponent(value || "");
};
const hasCsrfCookie = () => {
  if (typeof document === "undefined") {
    return false;
  }

  return document.cookie
    .split(";")
    .some((cookie) => cookie.trim().startsWith("XSRF-TOKEN="));
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
  withCredentials: true,
  withXSRFToken: true,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
});

api.interceptors.request.use(async (config) => {
  const method = (config.method || "get").toLowerCase();
  const requestUrl = config.url || "";
  const skipCsrfBootstrap = Boolean(config.meta?.skipCsrfBootstrap);

  if (
    MUTATING_METHODS.has(method) &&
    !requestUrl.includes("/auth/csrf") &&
    !skipCsrfBootstrap &&
    !hasCsrfCookie()
  ) {
    try {
      await ensureCsrfToken();
    } catch {
      // erro de CSRF sera tratado no fluxo da request original
    }
  }

  config.headers = config.headers || {};

  if (MUTATING_METHODS.has(method)) {
    const xsrfToken = getXsrfCookieToken();
    if (xsrfToken) {
      config.headers["X-XSRF-TOKEN"] = xsrfToken;
      config.headers["X-CSRF-TOKEN"] = xsrfToken;
    }
  }

  if (!config.headers["X-Correlation-Id"]) {
    config.headers["X-Correlation-Id"] = getCorrelationId();
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      const status = error.response.status;
      const requestUrl = error.config?.url || "";
      const skipAuthHandling = Boolean(error.config?.meta?.skipAuthHandling);
      const method = (error.config?.method || "get").toLowerCase();
      const isMutating = MUTATING_METHODS.has(method);
      const csrfRetried = Boolean(error.config?.meta?.csrfRetried);

      if (skipAuthHandling) {
        return Promise.reject(error);
      }

      if (status === 403 && isMutating && !csrfRetried) {
        try {
          await ensureCsrfToken({ forceRefresh: true });

          return api.request({
            ...error.config,
            meta: {
              ...(error.config?.meta || {}),
              csrfRetried: true,
            },
          });
        } catch {
          // segue fluxo padrao de erro abaixo
        }
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
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);

export default api;

