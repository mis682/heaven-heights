import api, { apiOrigin } from "./client";

export const getNeoMeridianReportMeta = () => api.get("/neo-meridian-report/meta").then((r) => r.data);

export const getNeoMeridianReportByDate = (formNumber, date) =>
  api.get("/neo-meridian-report/by-date", { params: { formNumber, date } }).then((r) => r.data);

export const saveNeoMeridianReportDraft = (data) => api.post("/neo-meridian-report/draft", data).then((r) => r.data);

export const submitNeoMeridianReport = (id) => api.post(`/neo-meridian-report/${id}/submit`).then((r) => r.data);

export const unlockNeoMeridianReport = (id) => api.post(`/neo-meridian-report/${id}/unlock`).then((r) => r.data);

export const getNeoMeridianReport = (id) => api.get(`/neo-meridian-report/${id}`).then((r) => r.data);

export const listSubmittedNeoMeridianReports = (params = {}) =>
  api.get("/neo-meridian-report/submitted", { params }).then((r) => r.data);

export const neoMeridianReportExportUrl = (id) => `${apiOrigin}/api/neo-meridian-report/${id}/export`;
export const neoMeridianReportExportPdfUrl = (id, layout = "classic") =>
  `${apiOrigin}/api/neo-meridian-report/${id}/export-pdf${layout === "card" ? "?layout=card" : ""}`;

export const getNeoMeridianKpi = (from, to, formNumber) =>
  api.get("/neo-meridian-report/kpi", { params: { from, to, formNumber: formNumber || undefined } }).then((r) => r.data.rows);

export const neoMeridianKpiPdfUrl = (from, to, formNumber) =>
  `${apiOrigin}/api/neo-meridian-report/kpi/export-pdf?from=${from}&to=${to}${formNumber ? `&formNumber=${formNumber}` : ""}`;
