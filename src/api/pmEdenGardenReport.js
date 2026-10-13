import api, { apiOrigin } from "./client";

export const getPmEdenGardenReportMeta = () => api.get("/pm-eden-garden-report/meta").then((r) => r.data);

export const getPmEdenGardenReportByDate = (formNumber, date) =>
  api.get("/pm-eden-garden-report/by-date", { params: { formNumber, date } }).then((r) => r.data);

export const savePmEdenGardenReportDraft = (data) => api.post("/pm-eden-garden-report/draft", data).then((r) => r.data);

export const submitPmEdenGardenReport = (id) => api.post(`/pm-eden-garden-report/${id}/submit`).then((r) => r.data);

export const unlockPmEdenGardenReport = (id) => api.post(`/pm-eden-garden-report/${id}/unlock`).then((r) => r.data);

export const getPmEdenGardenReport = (id) => api.get(`/pm-eden-garden-report/${id}`).then((r) => r.data);

export const listSubmittedPmEdenGardenReports = (params = {}) =>
  api.get("/pm-eden-garden-report/submitted", { params }).then((r) => r.data);

export const pmEdenGardenReportExportUrl = (id) => `${apiOrigin}/api/pm-eden-garden-report/${id}/export`;
export const pmEdenGardenReportExportPdfUrl = (id) => `${apiOrigin}/api/pm-eden-garden-report/${id}/export-pdf`;
