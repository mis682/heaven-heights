import axios from "axios";

// In production the backend serves the built frontend from the same origin,
// so requests should be relative ("") unless VITE_API_URL overrides it.
const baseURL = import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? "http://localhost:5000" : "");

const api = axios.create({ baseURL: `${baseURL}/api` });

export const apiOrigin = baseURL;
export const uploadsBaseURL = baseURL;
export default api;
