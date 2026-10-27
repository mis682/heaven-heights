import api, { apiOrigin } from "./client";

export const getMilestoneReportMeta = () => api.get("/milestone-report/meta").then((r) => r.data);

export const getMilestoneReportByDate = (formNumber, date) =>
  api.get("/milestone-report/by-date", { params: { formNumber, date } }).then((r) => r.data);

export const saveMilestoneReportDraft = (data) => api.post("/milestone-report/draft", data).then((r) => r.data);

export const submitMilestoneReport = (id) => api.post(`/milestone-report/${id}/submit`).then((r) => r.data);

export const unlockMilestoneReport = (id) => api.post(`/milestone-report/${id}/unlock`).then((r) => r.data);

export const getMilestoneReport = (id) => api.get(`/milestone-report/${id}`).then((r) => r.data);

export const listSubmittedMilestoneReports = (params = {}) =>
  api.get("/milestone-report/submitted", { params }).then((r) => r.data);

export const milestoneReportExportUrl = (id) => `${apiOrigin}/api/milestone-report/${id}/export`;
export const milestoneReportExportPdfUrl = (id) => `${apiOrigin}/api/milestone-report/${id}/export-pdf`;

export const getMilestoneKpi = (from, to, formNumber) =>
  api.get("/milestone-report/kpi", { params: { from, to, formNumber: formNumber || undefined } }).then((r) => r.data.rows);

export const milestoneKpiPdfUrl = (from, to, formNumber) =>
  `${apiOrigin}/api/milestone-report/kpi/export-pdf?from=${from}&to=${to}${formNumber ? `&formNumber=${formNumber}` : ""}`;
