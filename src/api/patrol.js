import api from "./client";

export const createPatrolSubmission = (payload) => api.post("/patrol/submissions", payload).then((r) => r.data);

export const getPatrolSummary = (params = {}) => api.get("/patrol/summary", { params }).then((r) => r.data);
export const listPatrolSubmissions = (params = {}) => api.get("/patrol/submissions", { params }).then((r) => r.data);
export const getPatrolSubmission = (id) => api.get(`/patrol/submissions/${id}`).then((r) => r.data);
