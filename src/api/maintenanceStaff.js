import api, { apiOrigin } from "./client";

export const getMaintenanceStaffMeta = () => api.get("/maintenance-staff/meta").then((r) => r.data);
export const getMaintenanceStaffStats = (params = {}) => api.get("/maintenance-staff/stats", { params }).then((r) => r.data);
export const getNextMaintenanceStaffId = () => api.get("/maintenance-staff/next-id").then((r) => r.data);
export const listMaintenanceStaff = (params = {}) => api.get("/maintenance-staff", { params }).then((r) => r.data);

function toFormData(data, photo) {
  const form = new FormData();
  Object.entries(data).forEach(([k, v]) => form.append(k, v ?? ""));
  if (photo) form.append("photo", photo);
  return form;
}

export const createMaintenanceStaff = (data, photo) => {
  if (!photo) return api.post("/maintenance-staff", data).then((r) => r.data);
  return api
    .post("/maintenance-staff", toFormData(data, photo), { headers: { "Content-Type": "multipart/form-data" } })
    .then((r) => r.data);
};

export const updateMaintenanceStaff = (id, data, photo) => {
  if (!photo) return api.put(`/maintenance-staff/${id}`, data).then((r) => r.data);
  return api
    .put(`/maintenance-staff/${id}`, toFormData(data, photo), { headers: { "Content-Type": "multipart/form-data" } })
    .then((r) => r.data);
};

export const deleteMaintenanceStaff = (id) => api.delete(`/maintenance-staff/${id}`).then((r) => r.data);
export const idCardUrl = (id) => `${apiOrigin}/api/maintenance-staff/${id}/id-card`;
