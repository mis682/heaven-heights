import api, { apiOrigin } from "./client";

export const lookupStaffByEmployeeId = (employeeId) =>
  api.get(`/attendance-scan/lookup/${encodeURIComponent(employeeId)}`).then((r) => r.data);

export const submitAttendanceScan = (data, photo) => {
  const form = new FormData();
  Object.entries(data).forEach(([k, v]) => form.append(k, v ?? ""));
  if (photo) form.append("photo", photo);
  return api.post("/attendance-scan", form, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data);
};

export const listAttendanceScanRecords = (params = {}) =>
  api.get("/attendance-scan/records", { params }).then((r) => r.data);

export const deleteAttendanceScanRecord = (id) => api.delete(`/attendance-scan/${id}`).then((r) => r.data);

export const getTeamAttendanceSummary = (params = {}) =>
  api.get("/attendance-scan/team-summary", { params }).then((r) => r.data);

function toQueryString(params) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") qs.append(k, v);
  });
  return qs.toString();
}

export const teamAttendanceExportExcelUrl = (params) =>
  `${apiOrigin}/api/attendance-scan/team-summary/export?${toQueryString(params)}`;

export const teamAttendanceExportPdfUrl = (params) =>
  `${apiOrigin}/api/attendance-scan/team-summary/export-pdf?${toQueryString(params)}`;
