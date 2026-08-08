import api from "./client";

export const getMaintenanceStaffMeta = () => api.get("/maintenance-staff/meta").then((r) => r.data);
export const getMaintenanceStaffStats = () => api.get("/maintenance-staff/stats").then((r) => r.data);
export const getNextMaintenanceStaffId = () => api.get("/maintenance-staff/next-id").then((r) => r.data);
export const listMaintenanceStaff = (params = {}) => api.get("/maintenance-staff", { params }).then((r) => r.data);
export const createMaintenanceStaff = (data) => api.post("/maintenance-staff", data).then((r) => r.data);
export const updateMaintenanceStaff = (id, data) => api.put(`/maintenance-staff/${id}`, data).then((r) => r.data);
export const deleteMaintenanceStaff = (id) => api.delete(`/maintenance-staff/${id}`).then((r) => r.data);
