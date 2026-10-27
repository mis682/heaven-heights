import api, { apiOrigin } from "./client";

export const getPmEdenGardenReportMeta = () => api.get("/pm-eden-garden-report/meta").then((r) => r.data);

export const getPmEdenGardenReportByDate = (formNumber, date, unitNo) =>
  api.get("/pm-eden-garden-report/by-date", { params: { formNumber, date, unitNo } }).then((r) => r.data);

export const savePmEdenGardenReportDraft = (data) => api.post("/pm-eden-garden-report/draft", data).then((r) => r.data);

export const submitPmEdenGardenReport = (id) => api.post(`/pm-eden-garden-report/${id}/submit`).then((r) => r.data);

export const unlockPmEdenGardenReport = (id) => api.post(`/pm-eden-garden-report/${id}/unlock`).then((r) => r.data);

export const getPmEdenGardenReport = (id) => api.get(`/pm-eden-garden-report/${id}`).then((r) => r.data);

export const listSubmittedPmEdenGardenReports = (params = {}) =>
  api.get("/pm-eden-garden-report/submitted", { params }).then((r) => r.data);

export const pmEdenGardenReportExportUrl = (id) => `${apiOrigin}/api/pm-eden-garden-report/${id}/export`;
export const pmEdenGardenReportExportPdfUrl = (id, layout = "classic") =>
  `${apiOrigin}/api/pm-eden-garden-report/${id}/export-pdf${layout === "card" ? "?layout=card" : ""}`;

export const getPmEdenGardenKpi = (from, to, formNumber) =>
  api.get("/pm-eden-garden-report/kpi", { params: { from, to, formNumber: formNumber || undefined } }).then((r) => r.data.rows);

export const pmEdenGardenKpiPdfUrl = (from, to, formNumber) =>
  `${apiOrigin}/api/pm-eden-garden-report/kpi/export-pdf?from=${from}&to=${to}${formNumber ? `&formNumber=${formNumber}` : ""}`;
