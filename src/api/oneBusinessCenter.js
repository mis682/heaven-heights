import api from "./client";

export const createOneBusinessCenterSubmission = (payload) =>
  api.post("/one-business-center/submissions", payload).then((r) => r.data);

export const listOneBusinessCenterSubmissions = (params = {}) =>
  api.get("/one-business-center/submissions", { params }).then((r) => r.data);

export const getOneBusinessCenterSubmission = (id) => api.get(`/one-business-center/submissions/${id}`).then((r) => r.data);
