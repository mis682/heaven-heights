import api, { apiOrigin } from "./client";

export const getHeadOfficeReportMeta = () => api.get("/head-office-report/meta").then((r) => r.data);

export const getHeadOfficeReportByDate = (formNumber, date) =>
  api.get("/head-office-report/by-date", { params: { formNumber, date } }).then((r) => r.data);

export const saveHeadOfficeReportDraft = (data) => api.post("/head-office-report/draft", data).then((r) => r.data);

export const submitHeadOfficeReport = (id) => api.post(`/head-office-report/${id}/submit`).then((r) => r.data);

export const unlockHeadOfficeReport = (id) => api.post(`/head-office-report/${id}/unlock`).then((r) => r.data);

export const getHeadOfficeReport = (id) => api.get(`/head-office-report/${id}`).then((r) => r.data);

export const listSubmittedHeadOfficeReports = (params = {}) =>
  api.get("/head-office-report/submitted", { params }).then((r) => r.data);

export const headOfficeReportExportUrl = (id) => `${apiOrigin}/api/head-office-report/${id}/export`;
export const headOfficeReportExportPdfUrl = (id, layout = "classic") =>
  `${apiOrigin}/api/head-office-report/${id}/export-pdf${layout === "card" ? "?layout=card" : ""}`;

export const getHeadOfficeKpi = (from, to, formNumber) =>
  api.get("/head-office-report/kpi", { params: { from, to, formNumber: formNumber || undefined } }).then((r) => r.data.rows);

export const headOfficeKpiPdfUrl = (from, to, formNumber) =>
  `${apiOrigin}/api/head-office-report/kpi/export-pdf?from=${from}&to=${to}${formNumber ? `&formNumber=${formNumber}` : ""}`;
