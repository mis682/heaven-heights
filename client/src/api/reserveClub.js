import api from "./client";

export const createReserveClubSubmission = (formData) =>
  api.post("/reserve-club/submissions", formData, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data);

export const listReserveClubSubmissions = (params = {}) => api.get("/reserve-club/submissions", { params }).then((r) => r.data);

export const getReserveClubSubmission = (id) => api.get(`/reserve-club/submissions/${id}`).then((r) => r.data);
