import api from "./client";

export const getHousekeepingStats = () => api.get("/housekeeping/stats").then((r) => r.data);
export const listHousekeepingTasks = (params = {}) => api.get("/housekeeping", { params }).then((r) => r.data);
export const createHousekeepingTask = (data) => api.post("/housekeeping", data).then((r) => r.data);
export const updateHousekeepingTask = (id, data, photo) => {
  if (photo) {
    const form = new FormData();
    Object.entries(data).forEach(([k, v]) => form.append(k, v));
    form.append("photo", photo);
    return api.put(`/housekeeping/${id}`, form, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data);
  }
  return api.put(`/housekeeping/${id}`, data).then((r) => r.data);
};
export const deleteHousekeepingTask = (id) => api.delete(`/housekeeping/${id}`).then((r) => r.data);
