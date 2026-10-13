import api from "./client";

export const createPmRegalGardenSubmission = (payload) => api.post("/pm-regal-garden/submissions", payload).then((r) => r.data);

export const listPmRegalGardenSubmissions = (params = {}) =>
  api.get("/pm-regal-garden/submissions", { params }).then((r) => r.data);

export const getPmRegalGardenSubmission = (id) => api.get(`/pm-regal-garden/submissions/${id}`).then((r) => r.data);
