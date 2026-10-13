import api from "./client";

export const createPmEdenGardenSubmission = (payload) => api.post("/pm-eden-garden/submissions", payload).then((r) => r.data);

export const listPmEdenGardenSubmissions = (params = {}) =>
  api.get("/pm-eden-garden/submissions", { params }).then((r) => r.data);

export const getPmEdenGardenSubmission = (id) => api.get(`/pm-eden-garden/submissions/${id}`).then((r) => r.data);
