import api from "./client";

export const getFireMockDrillMeta = () => api.get("/fire-mock-drill/meta").then((r) => r.data);

export const listFireMockDrills = (params = {}) => api.get("/fire-mock-drill", { params }).then((r) => r.data);

export const getFireMockDrill = (id) => api.get(`/fire-mock-drill/${id}`).then((r) => r.data);

function buildForm(data, files = {}) {
  const form = new FormData();
  Object.entries(data).forEach(([k, v]) => form.append(k, v ?? ""));
  if (files.panelPhoto) form.append("panelPhoto", files.panelPhoto);
  (files.videos || []).forEach((v) => form.append("videos", v));
  if (files.reportAttachment) form.append("reportAttachment", files.reportAttachment);
  return form;
}

export const createFireMockDrill = (data, files) =>
  api
    .post("/fire-mock-drill", buildForm(data, files), { headers: { "Content-Type": "multipart/form-data" } })
    .then((r) => r.data);

export const updateFireMockDrill = (id, data, files, keepVideos) => {
  const form = buildForm(data, files);
  if (keepVideos !== undefined) form.append("keepVideos", JSON.stringify(keepVideos));
  return api
    .put(`/fire-mock-drill/${id}`, form, { headers: { "Content-Type": "multipart/form-data" } })
    .then((r) => r.data);
};

export const deleteFireMockDrill = (id) => api.delete(`/fire-mock-drill/${id}`).then((r) => r.data);
