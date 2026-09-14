import api from "./client";

export const createGCClubSubmission = (payload) => api.post("/gc-club/submissions", payload).then((r) => r.data);

export const listGCClubSubmissions = (params = {}) => api.get("/gc-club/submissions", { params }).then((r) => r.data);

export const getGCClubSubmission = (id) => api.get(`/gc-club/submissions/${id}`).then((r) => r.data);
