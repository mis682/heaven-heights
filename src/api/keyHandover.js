import api from "./client";

export const getKeyHandoverMeta = () => api.get("/key-handover/meta").then((r) => r.data);

export const createKeyHandover = (data) => api.post("/key-handover", data).then((r) => r.data);

export const listKeyHandover = () => api.get("/key-handover").then((r) => r.data);

export const setKeyHandoverOutTime = (id, outTime) => api.patch(`/key-handover/${id}/out-time`, { outTime }).then((r) => r.data);

export const updateKeyHandover = (id, data) => api.put(`/key-handover/${id}`, data).then((r) => r.data);

export const deleteKeyHandover = (id) => api.delete(`/key-handover/${id}`).then((r) => r.data);
