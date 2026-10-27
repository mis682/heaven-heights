import api, { apiOrigin } from "./client";

export const getPmGardenCityReportMeta = () => api.get("/pm-garden-city-report/meta").then((r) => r.data);

export const getPmGardenCityReportByDate = (formNumber, date, unitNo) =>
  api.get("/pm-garden-city-report/by-date", { params: { formNumber, date, unitNo } }).then((r) => r.data);

export const savePmGardenCityReportDraft = (data) => api.post("/pm-garden-city-report/draft", data).then((r) => r.data);

export const submitPmGardenCityReport = (id) => api.post(`/pm-garden-city-report/${id}/submit`).then((r) => r.data);

export const unlockPmGardenCityReport = (id) => api.post(`/pm-garden-city-report/${id}/unlock`).then((r) => r.data);

export const getPmGardenCityReport = (id) => api.get(`/pm-garden-city-report/${id}`).then((r) => r.data);

export const listSubmittedPmGardenCityReports = (params = {}) =>
  api.get("/pm-garden-city-report/submitted", { params }).then((r) => r.data);

export const pmGardenCityReportExportUrl = (id) => `${apiOrigin}/api/pm-garden-city-report/${id}/export`;
export const pmGardenCityReportExportPdfUrl = (id, layout = "classic") =>
  `${apiOrigin}/api/pm-garden-city-report/${id}/export-pdf${layout === "card" ? "?layout=card" : ""}`;

export const getPmGardenCityKpi = (from, to, formNumber) =>
  api.get("/pm-garden-city-report/kpi", { params: { from, to, formNumber: formNumber || undefined } }).then((r) => r.data.rows);

export const pmGardenCityKpiPdfUrl = (from, to, formNumber) =>
  `${apiOrigin}/api/pm-garden-city-report/kpi/export-pdf?from=${from}&to=${to}${formNumber ? `&formNumber=${formNumber}` : ""}`;
