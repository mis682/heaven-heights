import api, { apiOrigin } from "./client";

export const getNatureParkReportMeta = () => api.get("/nature-park-report/meta").then((r) => r.data);

export const getNatureParkReportByDate = (formNumber, date) =>
  api.get("/nature-park-report/by-date", { params: { formNumber, date } }).then((r) => r.data);

export const saveNatureParkReportDraft = (data) => api.post("/nature-park-report/draft", data).then((r) => r.data);

export const submitNatureParkReport = (id) => api.post(`/nature-park-report/${id}/submit`).then((r) => r.data);

export const unlockNatureParkReport = (id) => api.post(`/nature-park-report/${id}/unlock`).then((r) => r.data);

export const getNatureParkReport = (id) => api.get(`/nature-park-report/${id}`).then((r) => r.data);

export const listSubmittedNatureParkReports = (params = {}) =>
  api.get("/nature-park-report/submitted", { params }).then((r) => r.data);

export const natureParkReportExportUrl = (id) => `${apiOrigin}/api/nature-park-report/${id}/export`;
export const natureParkReportExportPdfUrl = (id) => `${apiOrigin}/api/nature-park-report/${id}/export-pdf`;
