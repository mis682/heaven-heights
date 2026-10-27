import api, { apiOrigin } from "./client";

export const getRegalGardenReportMeta = () => api.get("/regal-garden-report/meta").then((r) => r.data);

export const getRegalGardenReportByDate = (formNumber, date) =>
  api.get("/regal-garden-report/by-date", { params: { formNumber, date } }).then((r) => r.data);

export const saveRegalGardenReportDraft = (data) => api.post("/regal-garden-report/draft", data).then((r) => r.data);

export const submitRegalGardenReport = (id) => api.post(`/regal-garden-report/${id}/submit`).then((r) => r.data);

export const unlockRegalGardenReport = (id) => api.post(`/regal-garden-report/${id}/unlock`).then((r) => r.data);

export const getRegalGardenReport = (id) => api.get(`/regal-garden-report/${id}`).then((r) => r.data);

export const listSubmittedRegalGardenReports = (params = {}) =>
  api.get("/regal-garden-report/submitted", { params }).then((r) => r.data);

export const regalGardenReportExportUrl = (id) => `${apiOrigin}/api/regal-garden-report/${id}/export`;
export const regalGardenReportExportPdfUrl = (id, layout = "classic") =>
  `${apiOrigin}/api/regal-garden-report/${id}/export-pdf${layout === "card" ? "?layout=card" : ""}`;

export const getRegalGardenKpi = (from, to, formNumber) =>
  api.get("/regal-garden-report/kpi", { params: { from, to, formNumber: formNumber || undefined } }).then((r) => r.data.rows);

export const regalGardenKpiPdfUrl = (from, to, formNumber) =>
  `${apiOrigin}/api/regal-garden-report/kpi/export-pdf?from=${from}&to=${to}${formNumber ? `&formNumber=${formNumber}` : ""}`;
