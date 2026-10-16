import api from "./client";

export const createEdenGardenSubmission = (payload) => api.post("/eden-garden/submissions", payload).then((r) => r.data);

export const listEdenGardenSubmissions = (params = {}) =>
  api.get("/eden-garden/submissions", { params }).then((r) => r.data);

export const getEdenGardenSubmission = (id) => api.get(`/eden-garden/submissions/${id}`).then((r) => r.data);
