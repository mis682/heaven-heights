import axios from "axios";
import { trackRequestStart, trackRequestEnd } from "./wakeupStatus";

// In production the backend serves the built frontend from the same origin,
// so requests should be relative ("") unless VITE_API_URL overrides it.
const baseURL = import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? "http://localhost:5000" : "");

const api = axios.create({ baseURL: `${baseURL}/api` });

api.interceptors.request.use((config) => {
  trackRequestStart();
  try {
    const stored = JSON.parse(localStorage.getItem("hh_auth_user") || "null");
    if (stored?.token) config.headers.Authorization = `Bearer ${stored.token}`;
  } catch {
    /* ignore malformed storage */
  }
  return config;
});
api.interceptors.response.use(
  (response) => {
    trackRequestEnd();
    return response;
  },
  (error) => {
    trackRequestEnd();
    return Promise.reject(error);
  }
);

// Ping immediately on load so a sleeping free-tier backend starts waking up
// right away, instead of only after the user's first real action.
api.get("/health").catch(() => {});

export const apiOrigin = baseURL;
export const uploadsBaseURL = baseURL;
export default api;
