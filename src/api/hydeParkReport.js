import api, { apiOrigin } from "./client";

export const getHydeParkReportMeta = () => api.get("/hyde-park-report/meta").then((r) => r.data);

export const getHydeParkReportByDate = (formNumber, date) =>
  api.get("/hyde-park-report/by-date", { params: { formNumber, date } }).then((r) => r.data);

export const saveHydeParkReportDraft = (data) => api.post("/hyde-park-report/draft", data).then((r) => r.data);

export const submitHydeParkReport = (id) => api.post(`/hyde-park-report/${id}/submit`).then((r) => r.data);

export const unlockHydeParkReport = (id) => api.post(`/hyde-park-report/${id}/unlock`).then((r) => r.data);

export const getHydeParkReport = (id) => api.get(`/hyde-park-report/${id}`).then((r) => r.data);

export const listSubmittedHydeParkReports = (params = {}) =>
  api.get("/hyde-park-report/submitted", { params }).then((r) => r.data);

export const hydeParkReportExportUrl = (id) => `${apiOrigin}/api/hyde-park-report/${id}/export`;
export const hydeParkReportExportPdfUrl = (id, layout = "classic") =>
  `${apiOrigin}/api/hyde-park-report/${id}/export-pdf${layout === "card" ? "?layout=card" : ""}`;

export const getHydeParkKpi = (from, to, formNumber) =>
  api.get("/hyde-park-report/kpi", { params: { from, to, formNumber: formNumber || undefined } }).then((r) => r.data.rows);

export const hydeParkKpiPdfUrl = (from, to, formNumber) =>
  `${apiOrigin}/api/hyde-park-report/kpi/export-pdf?from=${from}&to=${to}${formNumber ? `&formNumber=${formNumber}` : ""}`;
