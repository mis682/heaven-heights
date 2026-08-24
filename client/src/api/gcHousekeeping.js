import api from "./client";

export const createGCHousekeepingSubmission = (formData) =>
  api.post("/gc-housekeeping/submissions", formData, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data);

export const listGCHousekeepingSubmissions = (params = {}) =>
  api.get("/gc-housekeeping/submissions", { params }).then((r) => r.data);

export const getGCHousekeepingSubmission = (id) => api.get(`/gc-housekeeping/submissions/${id}`).then((r) => r.data);
