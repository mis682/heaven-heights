import api, { apiOrigin } from "./client";

export const getPmRegalGardenReportMeta = () => api.get("/pm-regal-garden-report/meta").then((r) => r.data);

export const getPmRegalGardenReportByDate = (formNumber, date, unitNo) =>
  api.get("/pm-regal-garden-report/by-date", { params: { formNumber, date, unitNo } }).then((r) => r.data);

export const savePmRegalGardenReportDraft = (data) => api.post("/pm-regal-garden-report/draft", data).then((r) => r.data);

export const submitPmRegalGardenReport = (id) => api.post(`/pm-regal-garden-report/${id}/submit`).then((r) => r.data);

export const unlockPmRegalGardenReport = (id) => api.post(`/pm-regal-garden-report/${id}/unlock`).then((r) => r.data);

export const getPmRegalGardenReport = (id) => api.get(`/pm-regal-garden-report/${id}`).then((r) => r.data);

export const listSubmittedPmRegalGardenReports = (params = {}) =>
  api.get("/pm-regal-garden-report/submitted", { params }).then((r) => r.data);

export const pmRegalGardenReportExportUrl = (id) => `${apiOrigin}/api/pm-regal-garden-report/${id}/export`;
export const pmRegalGardenReportExportPdfUrl = (id, layout = "classic") =>
  `${apiOrigin}/api/pm-regal-garden-report/${id}/export-pdf${layout === "card" ? "?layout=card" : ""}`;

export const getPmRegalGardenKpi = (from, to, formNumber) =>
  api.get("/pm-regal-garden-report/kpi", { params: { from, to, formNumber: formNumber || undefined } }).then((r) => r.data.rows);

export const pmRegalGardenKpiPdfUrl = (from, to, formNumber) =>
  `${apiOrigin}/api/pm-regal-garden-report/kpi/export-pdf?from=${from}&to=${to}${formNumber ? `&formNumber=${formNumber}` : ""}`;
