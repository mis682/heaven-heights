import api, { apiOrigin } from "./client";

export const getGardenCityReportMeta = () => api.get("/garden-city-patrol-report/meta").then((r) => r.data);

export const getGardenCityReportByDate = (date) =>
  api.get("/garden-city-patrol-report/by-date", { params: { date } }).then((r) => r.data);

export const saveGardenCityReportDraft = (data) =>
  api.post("/garden-city-patrol-report/draft", data).then((r) => r.data);

export const submitGardenCityReport = (id) =>
  api.post(`/garden-city-patrol-report/${id}/submit`).then((r) => r.data);

export const unlockGardenCityReport = (id) =>
  api.post(`/garden-city-patrol-report/${id}/unlock`).then((r) => r.data);

export const getGardenCityReport = (id) => api.get(`/garden-city-patrol-report/${id}`).then((r) => r.data);

export const listSubmittedGardenCityReports = (params = {}) =>
  api.get("/garden-city-patrol-report/submitted", { params }).then((r) => r.data);

export const gardenCityReportExportUrl = (id) => `${apiOrigin}/api/garden-city-patrol-report/${id}/export`;
export const gardenCityReportExportPdfUrl = (id) => `${apiOrigin}/api/garden-city-patrol-report/${id}/export-pdf`;
