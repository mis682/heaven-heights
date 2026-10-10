import api from "./client";

export const createMaintenanceUniformSubmission = (payload) =>
  api.post("/maintenance-uniform/submissions", payload).then((r) => r.data);

export const listMaintenanceUniformSubmissions = (params = {}) =>
  api.get("/maintenance-uniform/submissions", { params }).then((r) => r.data);

export const getMaintenanceUniformSubmission = (id) =>
  api.get(`/maintenance-uniform/submissions/${id}`).then((r) => r.data);
