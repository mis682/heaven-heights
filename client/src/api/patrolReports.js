import api from "./client";

export const getPatrolReportMeta = (projectSlug) =>
  api.get("/patrol-reports/meta", { params: { projectSlug } }).then((r) => r.data);
export const getPatrolCheckpointProof = (params) => api.get("/patrol-reports/proof", { params }).then((r) => r.data);
export const getPatrolReportByDate = (projectId, date) =>
  api.get("/patrol-reports/by-date", { params: { projectId, date } }).then((r) => r.data);
export const savePatrolReportDraft = (data) => api.post("/patrol-reports/draft", data).then((r) => r.data);
export const submitPatrolReport = (id) => api.post(`/patrol-reports/${id}/submit`).then((r) => r.data);
export const unlockPatrolReport = (id) => api.post(`/patrol-reports/${id}/unlock`).then((r) => r.data);
export const getPatrolReport = (id) => api.get(`/patrol-reports/${id}`).then((r) => r.data);
export const listSubmittedPatrolReports = (params = {}) =>
  api.get("/patrol-reports/submitted", { params }).then((r) => r.data);
export const exportPatrolReportUrl = (id, baseURL) => `${baseURL}/api/patrol-reports/${id}/export`;
export const exportPatrolReportPdfUrl = (id, baseURL) => `${baseURL}/api/patrol-reports/${id}/export-pdf`;
