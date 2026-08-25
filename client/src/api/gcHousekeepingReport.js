import api, { apiOrigin } from "./client";

export const getGCHousekeepingReportMeta = () => api.get("/gc-housekeeping-report/meta").then((r) => r.data);

export const getGCHousekeepingReportByDate = (date) =>
  api.get("/gc-housekeeping-report/by-date", { params: { date } }).then((r) => r.data);

export const saveGCHousekeepingReportDraft = (data) =>
  api.post("/gc-housekeeping-report/draft", data).then((r) => r.data);

export const submitGCHousekeepingReport = (id) => api.post(`/gc-housekeeping-report/${id}/submit`).then((r) => r.data);

export const unlockGCHousekeepingReport = (id) => api.post(`/gc-housekeeping-report/${id}/unlock`).then((r) => r.data);

export const getGCHousekeepingReport = (id) => api.get(`/gc-housekeeping-report/${id}`).then((r) => r.data);

export const listSubmittedGCHousekeepingReports = (params = {}) =>
  api.get("/gc-housekeeping-report/submitted", { params }).then((r) => r.data);

export const gcHousekeepingReportExportUrl = (id) => `${apiOrigin}/api/gc-housekeeping-report/${id}/export`;
export const gcHousekeepingReportExportPdfUrl = (id) => `${apiOrigin}/api/gc-housekeeping-report/${id}/export-pdf`;
