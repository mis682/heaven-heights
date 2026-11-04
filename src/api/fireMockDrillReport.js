import api, { apiOrigin } from "./client";

export const getFireMockDrillReportMeta = () => api.get("/fire-mock-drill-report/meta").then((r) => r.data);

export const getFireMockDrillSubmissionFor = (projectName, date) =>
  api.get("/fire-mock-drill-report/submission-for", { params: { projectName, date } }).then((r) => r.data);

export const getFireMockDrillReportByDate = (projectName, date) =>
  api.get("/fire-mock-drill-report/by-date", { params: { projectName, date } }).then((r) => r.data);

export const saveFireMockDrillReportDraft = (data) => api.post("/fire-mock-drill-report/draft", data).then((r) => r.data);

export const submitFireMockDrillReport = (id) => api.post(`/fire-mock-drill-report/${id}/submit`).then((r) => r.data);

export const unlockFireMockDrillReport = (id) => api.post(`/fire-mock-drill-report/${id}/unlock`).then((r) => r.data);

export const getFireMockDrillReport = (id) => api.get(`/fire-mock-drill-report/${id}`).then((r) => r.data);

export const listSubmittedFireMockDrillReports = (params = {}) =>
  api.get("/fire-mock-drill-report/submitted", { params }).then((r) => r.data);

export const fireMockDrillReportExportUrl = (id) => `${apiOrigin}/api/fire-mock-drill-report/${id}/export`;
export const fireMockDrillReportExportPdfUrl = (id, layout = "classic") =>
  `${apiOrigin}/api/fire-mock-drill-report/${id}/export-pdf${layout === "card" ? "?layout=card" : ""}`;

export const getFireMockDrillKpi = (from, to, projectName) =>
  api.get("/fire-mock-drill-report/kpi", { params: { from, to, projectName: projectName || undefined } }).then((r) => r.data.rows);

export const fireMockDrillKpiPdfUrl = (from, to, projectName) =>
  `${apiOrigin}/api/fire-mock-drill-report/kpi/export-pdf?from=${from}&to=${to}${projectName ? `&projectName=${encodeURIComponent(projectName)}` : ""}`;
