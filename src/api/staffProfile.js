import api from "./client";

export const getStaffProfile = (employeeId) =>
  api.get(`/staff-profile/${encodeURIComponent(employeeId)}`).then((r) => r.data);

export const updateStaffProfile = (employeeId, data) =>
  api.put(`/staff-profile/${encodeURIComponent(employeeId)}`, data).then((r) => r.data);
