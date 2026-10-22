import api from "./client";

export const createHeadOfficeSubmission = (payload) => api.post("/head-office/submissions", payload).then((r) => r.data);

export const listHeadOfficeSubmissions = (params = {}) =>
  api.get("/head-office/submissions", { params }).then((r) => r.data);

export const getHeadOfficeSubmission = (id) => api.get(`/head-office/submissions/${id}`).then((r) => r.data);
