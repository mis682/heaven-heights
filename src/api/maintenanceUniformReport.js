import api, { apiOrigin } from "./client";

export const getMaintenanceUniformReportMeta = () => api.get("/maintenance-uniform-report/meta").then((r) => r.data);

export const getMaintenanceUniformStaffList = () => api.get("/maintenance-uniform-report/staff-list").then((r) => r.data);

export const getMaintenanceUniformReportByDate = (date) =>
  api.get("/maintenance-uniform-report/by-date", { params: { date } }).then((r) => r.data);

export const saveMaintenanceUniformReportDraft = (data) =>
  api.post("/maintenance-uniform-report/draft", data).then((r) => r.data);

export const submitMaintenanceUniformReport = (id) => api.post(`/maintenance-uniform-report/${id}/submit`).then((r) => r.data);

export const unlockMaintenanceUniformReport = (id) => api.post(`/maintenance-uniform-report/${id}/unlock`).then((r) => r.data);

export const getMaintenanceUniformReport = (id) => api.get(`/maintenance-uniform-report/${id}`).then((r) => r.data);

export const listSubmittedMaintenanceUniformReports = (params = {}) =>
  api.get("/maintenance-uniform-report/submitted", { params }).then((r) => r.data);

export const maintenanceUniformReportExportUrl = (id) => `${apiOrigin}/api/maintenance-uniform-report/${id}/export`;
export const maintenanceUniformReportExportPdfUrl = (id) => `${apiOrigin}/api/maintenance-uniform-report/${id}/export-pdf`;
