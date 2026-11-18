import api from "./client";

export const getMaintenanceStaffInOutMeta = () => api.get("/maintenance-staff-in-out/meta").then((r) => r.data);

export const createMaintenanceStaffInOut = (data) => api.post("/maintenance-staff-in-out", data).then((r) => r.data);

export const listMaintenanceStaffInOut = () => api.get("/maintenance-staff-in-out").then((r) => r.data);

export const setMaintenanceStaffInOutOutTime = (id, outTime) =>
  api.patch(`/maintenance-staff-in-out/${id}/out-time`, { outTime }).then((r) => r.data);
