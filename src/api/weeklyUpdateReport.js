import api, { apiOrigin } from "./client";

export const getWeeklyUpdateReportMeta = () => api.get("/weekly-update-report/meta").then((r) => r.data);

export const getWeeklyUpdateReportByDate = (formNumber, date) =>
  api.get("/weekly-update-report/by-date", { params: { formNumber, date } }).then((r) => r.data);

export const saveWeeklyUpdateReportDraft = (data) => api.post("/weekly-update-report/draft", data).then((r) => r.data);

export const submitWeeklyUpdateReport = (id) => api.post(`/weekly-update-report/${id}/submit`).then((r) => r.data);

export const unlockWeeklyUpdateReport = (id) => api.post(`/weekly-update-report/${id}/unlock`).then((r) => r.data);

export const getWeeklyUpdateReport = (id) => api.get(`/weekly-update-report/${id}`).then((r) => r.data);

export const listSubmittedWeeklyUpdateReports = (params = {}) =>
  api.get("/weekly-update-report/submitted", { params }).then((r) => r.data);

export const weeklyUpdateReportExportUrl = (id) => `${apiOrigin}/api/weekly-update-report/${id}/export`;
export const weeklyUpdateReportExportPdfUrl = (id, layout = "classic") =>
  `${apiOrigin}/api/weekly-update-report/${id}/export-pdf${layout === "card" ? "?layout=card" : ""}`;

export const getWeeklyUpdateKpi = (from, to, formNumber) =>
  api.get("/weekly-update-report/kpi", { params: { from, to, formNumber: formNumber || undefined } }).then((r) => r.data.rows);

export const weeklyUpdateKpiPdfUrl = (from, to, formNumber) =>
  `${apiOrigin}/api/weekly-update-report/kpi/export-pdf?from=${from}&to=${to}${formNumber ? `&formNumber=${formNumber}` : ""}`;
