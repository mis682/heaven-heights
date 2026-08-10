import api from "./client";

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
