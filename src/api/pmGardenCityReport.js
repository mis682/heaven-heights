import api, { apiOrigin } from "./client";

export const getPmGardenCityReportMeta = () => api.get("/pm-garden-city-report/meta").then((r) => r.data);

export const getPmGardenCityReportByDate = (formNumber, date) =>
  api.get("/pm-garden-city-report/by-date", { params: { formNumber, date } }).then((r) => r.data);

export const savePmGardenCityReportDraft = (data) => api.post("/pm-garden-city-report/draft", data).then((r) => r.data);

export const submitPmGardenCityReport = (id) => api.post(`/pm-garden-city-report/${id}/submit`).then((r) => r.data);

export const unlockPmGardenCityReport = (id) => api.post(`/pm-garden-city-report/${id}/unlock`).then((r) => r.data);

export const getPmGardenCityReport = (id) => api.get(`/pm-garden-city-report/${id}`).then((r) => r.data);

export const listSubmittedPmGardenCityReports = (params = {}) =>
  api.get("/pm-garden-city-report/submitted", { params }).then((r) => r.data);

export const pmGardenCityReportExportUrl = (id) => `${apiOrigin}/api/pm-garden-city-report/${id}/export`;
export const pmGardenCityReportExportPdfUrl = (id) => `${apiOrigin}/api/pm-garden-city-report/${id}/export-pdf`;
