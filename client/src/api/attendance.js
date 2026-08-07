import api from "./client";

export const getAttendanceStats = (params = {}) => api.get("/attendance/stats", { params }).then((r) => r.data);
export const listAttendance = (params = {}) => api.get("/attendance", { params }).then((r) => r.data);
export const markAttendance = (data) => api.post("/attendance", data).then((r) => r.data);
export const updateAttendance = (id, data) => api.put(`/attendance/${id}`, data).then((r) => r.data);
export const deleteAttendance = (id) => api.delete(`/attendance/${id}`).then((r) => r.data);
