import api from "./client";

export const getNightGuardMeta = () => api.get("/nightguard/meta").then((r) => r.data);

export const createNightGuardSubmission = (formData) =>
  api.post("/nightguard/submissions", formData, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data);

export const listNightGuardSubmissions = (params = {}) =>
  api.get("/nightguard/submissions", { params }).then((r) => r.data);

export const getOpenDraft = () => api.get("/nightguard/reports/open-draft").then((r) => r.data);
export const saveDraftReport = (data) => api.post("/nightguard/reports/draft", data).then((r) => r.data);
export const submitReport = (id) => api.post(`/nightguard/reports/${id}/submit`).then((r) => r.data);
export const unlockReport = (id) => api.post(`/nightguard/reports/${id}/unlock`).then((r) => r.data);
export const getReport = (id) => api.get(`/nightguard/reports/${id}`).then((r) => r.data);
export const listSubmittedReports = (params = {}) => api.get("/nightguard/reports/submitted", { params }).then((r) => r.data);
export const exportReportUrl = (id, baseURL) => `${baseURL}/api/nightguard/reports/${id}/export`;
export const exportReportPdfUrl = (id, baseURL) => `${baseURL}/api/nightguard/reports/${id}/export-pdf`;
