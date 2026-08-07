import api from "./client";

export const createPatrolSubmission = (formData) =>
  api.post("/patrol/submissions", formData, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data);

export const listPatrolSubmissions = (params = {}) => api.get("/patrol/submissions", { params }).then((r) => r.data);
export const getPatrolSubmission = (id) => api.get(`/patrol/submissions/${id}`).then((r) => r.data);
