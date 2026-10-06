import api, { apiOrigin } from "./client";

export const getOneBusinessCenterReportMeta = () => api.get("/one-business-center-report/meta").then((r) => r.data);

export const getOneBusinessCenterReportByDate = (formNumber, date) =>
  api.get("/one-business-center-report/by-date", { params: { formNumber, date } }).then((r) => r.data);

export const saveOneBusinessCenterReportDraft = (data) => api.post("/one-business-center-report/draft", data).then((r) => r.data);

export const submitOneBusinessCenterReport = (id) => api.post(`/one-business-center-report/${id}/submit`).then((r) => r.data);

export const unlockOneBusinessCenterReport = (id) => api.post(`/one-business-center-report/${id}/unlock`).then((r) => r.data);

export const getOneBusinessCenterReport = (id) => api.get(`/one-business-center-report/${id}`).then((r) => r.data);

export const listSubmittedOneBusinessCenterReports = (params = {}) =>
  api.get("/one-business-center-report/submitted", { params }).then((r) => r.data);

export const oneBusinessCenterReportExportUrl = (id) => `${apiOrigin}/api/one-business-center-report/${id}/export`;
export const oneBusinessCenterReportExportPdfUrl = (id) => `${apiOrigin}/api/one-business-center-report/${id}/export-pdf`;
