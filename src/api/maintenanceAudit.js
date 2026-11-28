import api from "./client";

export const getMaintenanceAuditMeta = () => api.get("/maintenance-audit/meta").then((r) => r.data);

export const createMaintenanceAuditSubmission = (formData) =>
  api.post("/maintenance-audit", formData, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data);

export const listMaintenanceAuditSubmissions = (params = {}) =>
  api.get("/maintenance-audit/submissions", { params }).then((r) => r.data);
