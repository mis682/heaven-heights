import api from "./client";

export const createRegalGardenClubSubmission = (payload) =>
  api.post("/regal-garden-club/submissions", payload).then((r) => r.data);

export const listRegalGardenClubSubmissions = (params = {}) => api.get("/regal-garden-club/submissions", { params }).then((r) => r.data);

export const getRegalGardenClubSubmission = (id) => api.get(`/regal-garden-club/submissions/${id}`).then((r) => r.data);
