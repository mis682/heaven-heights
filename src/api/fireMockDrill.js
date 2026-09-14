import api from "./client";

export const getFireMockDrillMeta = () => api.get("/fire-mock-drill/meta").then((r) => r.data);

export const listFireMockDrills = (params = {}) => api.get("/fire-mock-drill", { params }).then((r) => r.data);

export const getFireMockDrill = (id) => api.get(`/fire-mock-drill/${id}`).then((r) => r.data);

function buildForm(data, files = {}) {
  const form = new FormData();
  Object.entries(data).forEach(([k, v]) => form.append(k, v ?? ""));
  if (files.panelPhoto) form.append("panelPhoto", files.panelPhoto);
  if (files.reportAttachment) form.append("reportAttachment", files.reportAttachment);
  if (files.checklistAttachments) files.checklistAttachments.forEach((f) => form.append("checklistAttachments", f));
  if (files.videoUrls) form.append("videoUrls", JSON.stringify(files.videoUrls));
  return form;
}

export const createFireMockDrill = (data, files) =>
  api
    .post("/fire-mock-drill", buildForm(data, files), { headers: { "Content-Type": "multipart/form-data" } })
    .then((r) => r.data);

export const updateFireMockDrill = (id, data, files) =>
  api
    .put(`/fire-mock-drill/${id}`, buildForm(data, files), { headers: { "Content-Type": "multipart/form-data" } })
    .then((r) => r.data);

export const deleteFireMockDrill = (id) => api.delete(`/fire-mock-drill/${id}`).then((r) => r.data);
