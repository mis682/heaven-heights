import api from "./client";

export const createMilestoneSubmission = (payload) => api.post("/milestone/submissions", payload).then((r) => r.data);

export const listMilestoneSubmissions = (params = {}) =>
  api.get("/milestone/submissions", { params }).then((r) => r.data);

export const getMilestoneSubmission = (id) => api.get(`/milestone/submissions/${id}`).then((r) => r.data);
