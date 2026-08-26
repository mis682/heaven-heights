import api, { apiOrigin } from "./client";

export const getReserveClubReportMeta = () => api.get("/reserve-club-report/meta").then((r) => r.data);

export const getReserveClubReportByDate = (formNumber, date) =>
  api.get("/reserve-club-report/by-date", { params: { formNumber, date } }).then((r) => r.data);

export const saveReserveClubReportDraft = (data) => api.post("/reserve-club-report/draft", data).then((r) => r.data);

export const submitReserveClubReport = (id) => api.post(`/reserve-club-report/${id}/submit`).then((r) => r.data);

export const unlockReserveClubReport = (id) => api.post(`/reserve-club-report/${id}/unlock`).then((r) => r.data);

export const getReserveClubReport = (id) => api.get(`/reserve-club-report/${id}`).then((r) => r.data);

export const listSubmittedReserveClubReports = (params = {}) =>
  api.get("/reserve-club-report/submitted", { params }).then((r) => r.data);

export const reserveClubReportExportUrl = (id) => `${apiOrigin}/api/reserve-club-report/${id}/export`;
export const reserveClubReportExportPdfUrl = (id) => `${apiOrigin}/api/reserve-club-report/${id}/export-pdf`;
