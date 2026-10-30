import api, { apiOrigin } from "./client";

export const getSchoolReportMeta = () => api.get("/school-report/meta").then((r) => r.data);

export const getSchoolReportByDate = (formNumber, date) =>
  api.get("/school-report/by-date", { params: { formNumber, date } }).then((r) => r.data);

export const saveSchoolReportDraft = (data) => api.post("/school-report/draft", data).then((r) => r.data);

export const submitSchoolReport = (id) => api.post(`/school-report/${id}/submit`).then((r) => r.data);

export const unlockSchoolReport = (id) => api.post(`/school-report/${id}/unlock`).then((r) => r.data);

export const getSchoolReport = (id) => api.get(`/school-report/${id}`).then((r) => r.data);

export const listSubmittedSchoolReports = (params = {}) =>
  api.get("/school-report/submitted", { params }).then((r) => r.data);

export const schoolReportExportUrl = (id) => `${apiOrigin}/api/school-report/${id}/export`;
export const schoolReportExportPdfUrl = (id, layout = "classic") =>
  `${apiOrigin}/api/school-report/${id}/export-pdf${layout === "card" ? "?layout=card" : ""}`;

export const getSchoolKpi = (from, to, formNumber) =>
  api.get("/school-report/kpi", { params: { from, to, formNumber: formNumber || undefined } }).then((r) => r.data.rows);

export const schoolKpiPdfUrl = (from, to, formNumber) =>
  `${apiOrigin}/api/school-report/kpi/export-pdf?from=${from}&to=${to}${formNumber ? `&formNumber=${formNumber}` : ""}`;
