import api from "./client";

export const listGuards = (params = {}) => api.get("/guards", { params }).then((r) => r.data);
export const createGuard = (data) => api.post("/guards", data).then((r) => r.data);
export const updateGuard = (id, data) => api.put(`/guards/${id}`, data).then((r) => r.data);
export const deleteGuard = (id) => api.delete(`/guards/${id}`).then((r) => r.data);
export const bulkImportGuards = (file) => {
  const form = new FormData();
  form.append("file", file);
  return api.post("/guards/bulk-import", form, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data);
};
