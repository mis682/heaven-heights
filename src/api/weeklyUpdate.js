import api from "./client";

export const createWeeklyUpdateSubmission = (payload) => api.post("/weekly-update/submissions", payload).then((r) => r.data);

export const listWeeklyUpdateSubmissions = (params = {}) =>
  api.get("/weekly-update/submissions", { params }).then((r) => r.data);

export const getWeeklyUpdateSubmission = (id) => api.get(`/weekly-update/submissions/${id}`).then((r) => r.data);
