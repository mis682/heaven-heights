import api, { apiOrigin } from "./client";

export const getGCClubReportMeta = () => api.get("/gc-club-report/meta").then((r) => r.data);

export const getGCClubReportByDate = (formNumber, date) =>
  api.get("/gc-club-report/by-date", { params: { formNumber, date } }).then((r) => r.data);

export const saveGCClubReportDraft = (data) => api.post("/gc-club-report/draft", data).then((r) => r.data);

export const submitGCClubReport = (id) => api.post(`/gc-club-report/${id}/submit`).then((r) => r.data);

export const unlockGCClubReport = (id) => api.post(`/gc-club-report/${id}/unlock`).then((r) => r.data);

export const getGCClubReport = (id) => api.get(`/gc-club-report/${id}`).then((r) => r.data);

export const listSubmittedGCClubReports = (params = {}) => api.get("/gc-club-report/submitted", { params }).then((r) => r.data);

export const gcClubReportExportUrl = (id) => `${apiOrigin}/api/gc-club-report/${id}/export`;
export const gcClubReportExportPdfUrl = (id) => `${apiOrigin}/api/gc-club-report/${id}/export-pdf`;
