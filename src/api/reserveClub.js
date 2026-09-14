import api from "./client";

export const createReserveClubSubmission = (payload) => api.post("/reserve-club/submissions", payload).then((r) => r.data);

export const listReserveClubSubmissions = (params = {}) => api.get("/reserve-club/submissions", { params }).then((r) => r.data);

export const getReserveClubSubmission = (id) => api.get(`/reserve-club/submissions/${id}`).then((r) => r.data);
