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

export const setAttendanceOverride = (data) => api.post("/attendance-scan/override", data).then((r) => r.data);

export const clearAttendanceOverride = (employeeId, date) =>
  api.delete("/attendance-scan/override", { params: { employeeId, date } }).then((r) => r.data);

// These exports now require login (Attendance:View permission), so a plain
// <a href> link to the backend URL no longer works — a direct browser
// navigation carries no Authorization header. Fetching as a blob through the
// authenticated axios client (which does attach it) and saving that blob
// ourselves gets the download without exposing the Bearer token in a URL.
async function downloadBlob(path, params, filename) {
  const response = await api.get(path, { params, responseType: "blob" });
  const blobUrl = URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(blobUrl);
}

export const downloadTeamAttendanceExcel = ({ month, year, search }) =>
  downloadBlob("/attendance-scan/team-summary/export", { month, year, search }, `team-attendance-${year}-${String(month).padStart(2, "0")}.xlsx`);

export const downloadTeamAttendancePdf = ({ month, year, search }) =>
  downloadBlob(
    "/attendance-scan/team-summary/export-pdf",
    { month, year, search },
    `team-attendance-${year}-${String(month).padStart(2, "0")}.pdf`
  );
