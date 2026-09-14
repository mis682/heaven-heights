import api from "./client";

export const createRegalGardenClubSubmission = (formData) =>
  api.post("/regal-garden-club/submissions", formData, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data);

export const listRegalGardenClubSubmissions = (params = {}) => api.get("/regal-garden-club/submissions", { params }).then((r) => r.data);

export const getRegalGardenClubSubmission = (id) => api.get(`/regal-garden-club/submissions/${id}`).then((r) => r.data);
