import api, { apiOrigin } from "./client";

export const getEdenGardenReportMeta = () => api.get("/eden-garden-report/meta").then((r) => r.data);

export const getEdenGardenReportByDate = (formNumber, date) =>
  api.get("/eden-garden-report/by-date", { params: { formNumber, date } }).then((r) => r.data);

export const saveEdenGardenReportDraft = (data) => api.post("/eden-garden-report/draft", data).then((r) => r.data);

export const submitEdenGardenReport = (id) => api.post(`/eden-garden-report/${id}/submit`).then((r) => r.data);

export const unlockEdenGardenReport = (id) => api.post(`/eden-garden-report/${id}/unlock`).then((r) => r.data);

export const getEdenGardenReport = (id) => api.get(`/eden-garden-report/${id}`).then((r) => r.data);

export const listSubmittedEdenGardenReports = (params = {}) =>
  api.get("/eden-garden-report/submitted", { params }).then((r) => r.data);

export const edenGardenReportExportUrl = (id) => `${apiOrigin}/api/eden-garden-report/${id}/export`;
export const edenGardenReportExportPdfUrl = (id, layout = "classic") =>
  `${apiOrigin}/api/eden-garden-report/${id}/export-pdf${layout === "card" ? "?layout=card" : ""}`;

export const getEdenGardenKpi = (from, to, formNumber) =>
  api.get("/eden-garden-report/kpi", { params: { from, to, formNumber: formNumber || undefined } }).then((r) => r.data.rows);

export const edenGardenKpiPdfUrl = (from, to, formNumber) =>
  `${apiOrigin}/api/eden-garden-report/kpi/export-pdf?from=${from}&to=${to}${formNumber ? `&formNumber=${formNumber}` : ""}`;
