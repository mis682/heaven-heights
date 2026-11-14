import api, { apiOrigin } from "./client";

export const getPayrollMeta = () => api.get("/payroll/meta").then((r) => r.data);

export const getDesignationPayroll = (designation, month, year) =>
  api.get(`/payroll/${encodeURIComponent(designation)}`, { params: { month, year } }).then((r) => r.data);

export const payrollExcelUrl = (designation, month, year) =>
  `${apiOrigin}/api/payroll/${encodeURIComponent(designation)}/excel?month=${month}&year=${year}`;

export const payrollPdfUrl = (designation, month, year, download) =>
  `${apiOrigin}/api/payroll/${encodeURIComponent(designation)}/pdf?month=${month}&year=${year}${download ? "&download=1" : ""}`;
