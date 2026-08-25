import api from "./client";

export const createGCClubSubmission = (formData) =>
  api.post("/gc-club/submissions", formData, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data);

export const listGCClubSubmissions = (params = {}) => api.get("/gc-club/submissions", { params }).then((r) => r.data);

export const getGCClubSubmission = (id) => api.get(`/gc-club/submissions/${id}`).then((r) => r.data);
