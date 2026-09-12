import api, { apiOrigin } from "./client";

export const getRegalGardenClubReportMeta = () => api.get("/regal-garden-club-report/meta").then((r) => r.data);

export const getRegalGardenClubReportByDate = (formNumber, date) =>
  api.get("/regal-garden-club-report/by-date", { params: { formNumber, date } }).then((r) => r.data);

export const saveRegalGardenClubReportDraft = (data) => api.post("/regal-garden-club-report/draft", data).then((r) => r.data);

export const submitRegalGardenClubReport = (id) => api.post(`/regal-garden-club-report/${id}/submit`).then((r) => r.data);

export const unlockRegalGardenClubReport = (id) => api.post(`/regal-garden-club-report/${id}/unlock`).then((r) => r.data);

export const getRegalGardenClubReport = (id) => api.get(`/regal-garden-club-report/${id}`).then((r) => r.data);

export const listSubmittedRegalGardenClubReports = (params = {}) =>
  api.get("/regal-garden-club-report/submitted", { params }).then((r) => r.data);

export const regalGardenClubReportExportUrl = (id) => `${apiOrigin}/api/regal-garden-club-report/${id}/export`;
export const regalGardenClubReportExportPdfUrl = (id) => `${apiOrigin}/api/regal-garden-club-report/${id}/export-pdf`;
