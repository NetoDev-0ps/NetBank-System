import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const csrfClient = axios.create({
  baseURL,
  withCredentials: true,
  withXSRFToken: true,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
});

let csrfPromise = null;

export async function ensureCsrfToken({ forceRefresh = false } = {}) {
  if (forceRefresh) {
    csrfPromise = null;
  }

  if (!csrfPromise) {
    csrfPromise = csrfClient
      .get("/auth/csrf", {
        meta: { skipAuthHandling: true },
      })
      .catch((error) => {
        csrfPromise = null;
        throw error;
      });
  }

  return csrfPromise;
}
