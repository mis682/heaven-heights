import api, { apiOrigin } from "./client";

export const getSampleApartmentReportMeta = () => api.get("/sample-apartment-report/meta").then((r) => r.data);

export const getSampleApartmentReportByDate = (formNumber, date) =>
  api.get("/sample-apartment-report/by-date", { params: { formNumber, date } }).then((r) => r.data);

export const saveSampleApartmentReportDraft = (data) =>
  api.post("/sample-apartment-report/draft", data).then((r) => r.data);

export const submitSampleApartmentReport = (id) => api.post(`/sample-apartment-report/${id}/submit`).then((r) => r.data);

export const unlockSampleApartmentReport = (id) => api.post(`/sample-apartment-report/${id}/unlock`).then((r) => r.data);

export const getSampleApartmentReport = (id) => api.get(`/sample-apartment-report/${id}`).then((r) => r.data);

export const listSubmittedSampleApartmentReports = (params = {}) =>
  api.get("/sample-apartment-report/submitted", { params }).then((r) => r.data);

export const sampleApartmentReportExportUrl = (id) => `${apiOrigin}/api/sample-apartment-report/${id}/export`;
export const sampleApartmentReportExportPdfUrl = (id, layout = "classic") =>
  `${apiOrigin}/api/sample-apartment-report/${id}/export-pdf${layout === "card" ? "?layout=card" : ""}`;

export const getSampleApartmentKpi = (from, to, formNumber) =>
  api
    .get("/sample-apartment-report/kpi", { params: { from, to, formNumber: formNumber || undefined } })
    .then((r) => r.data.rows);

export const sampleApartmentKpiPdfUrl = (from, to, formNumber) =>
  `${apiOrigin}/api/sample-apartment-report/kpi/export-pdf?from=${from}&to=${to}${formNumber ? `&formNumber=${formNumber}` : ""}`;
