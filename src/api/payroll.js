import api, { apiOrigin } from "./client";

export const getPayrollMeta = () => api.get("/payroll/meta").then((r) => r.data);

export const getCompanyPayroll = (company, month, year) =>
  api.get(`/payroll/${encodeURIComponent(company)}`, { params: { month, year } }).then((r) => r.data);

export const payrollExcelUrl = (company, month, year) =>
  `${apiOrigin}/api/payroll/${encodeURIComponent(company)}/excel?month=${month}&year=${year}`;

export const payrollPdfUrl = (company, month, year, download) =>
  `${apiOrigin}/api/payroll/${encodeURIComponent(company)}/pdf?month=${month}&year=${year}${download ? "&download=1" : ""}`;
