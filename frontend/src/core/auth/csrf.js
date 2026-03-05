import api from "../api/apiClient";

let csrfPromise = null;

export async function ensureCsrfToken({ forceRefresh = false } = {}) {
  if (forceRefresh) {
    csrfPromise = null;
  }

  if (!csrfPromise) {
    csrfPromise = api
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
