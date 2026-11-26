import api, { apiOrigin } from "./client";

export const getSilverEstateOfficeReportMeta = () => api.get("/silver-estate-office-report/meta").then((r) => r.data);

export const getSilverEstateOfficeReportByDate = (formNumber, date) =>
  api.get("/silver-estate-office-report/by-date", { params: { formNumber, date } }).then((r) => r.data);

export const saveSilverEstateOfficeReportDraft = (data) => api.post("/silver-estate-office-report/draft", data).then((r) => r.data);

export const submitSilverEstateOfficeReport = (id) => api.post(`/silver-estate-office-report/${id}/submit`).then((r) => r.data);

export const unlockSilverEstateOfficeReport = (id) => api.post(`/silver-estate-office-report/${id}/unlock`).then((r) => r.data);

export const getSilverEstateOfficeReport = (id) => api.get(`/silver-estate-office-report/${id}`).then((r) => r.data);

export const listSubmittedSilverEstateOfficeReports = (params = {}) =>
  api.get("/silver-estate-office-report/submitted", { params }).then((r) => r.data);

export const silverEstateOfficeReportExportUrl = (id) => `${apiOrigin}/api/silver-estate-office-report/${id}/export`;
export const silverEstateOfficeReportExportPdfUrl = (id, layout = "classic") =>
  `${apiOrigin}/api/silver-estate-office-report/${id}/export-pdf${layout === "card" ? "?layout=card" : ""}`;

export const getSilverEstateOfficeKpi = (from, to, formNumber) =>
  api.get("/silver-estate-office-report/kpi", { params: { from, to, formNumber: formNumber || undefined } }).then((r) => r.data.rows);

export const silverEstateOfficeKpiPdfUrl = (from, to, formNumber) =>
  `${apiOrigin}/api/silver-estate-office-report/kpi/export-pdf?from=${from}&to=${to}${formNumber ? `&formNumber=${formNumber}` : ""}`;
