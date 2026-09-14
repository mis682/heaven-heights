import api from "./client";

export const getFireMockDrillMeta = () => api.get("/fire-mock-drill/meta").then((r) => r.data);

export const listFireMockDrills = (params = {}) => api.get("/fire-mock-drill", { params }).then((r) => r.data);

export const getFireMockDrill = (id) => api.get(`/fire-mock-drill/${id}`).then((r) => r.data);

// `urls` carries whatever already-uploaded Cloudinary URLs this submission
// has (panelPhoto, reportAttachment, checklistAttachments, videoUrls) — the
// files themselves went straight from the browser to Cloudinary before this
// is ever called, so this is a small JSON payload, not a file upload.
export const createFireMockDrill = (data, urls) => api.post("/fire-mock-drill", { ...data, ...urls }).then((r) => r.data);

export const updateFireMockDrill = (id, data, urls) =>
  api.put(`/fire-mock-drill/${id}`, { ...data, ...urls }).then((r) => r.data);

export const deleteFireMockDrill = (id) => api.delete(`/fire-mock-drill/${id}`).then((r) => r.data);
