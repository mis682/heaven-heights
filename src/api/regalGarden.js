import api from "./client";

export const createRegalGardenSubmission = (payload) => api.post("/regal-garden/submissions", payload).then((r) => r.data);

export const listRegalGardenSubmissions = (params = {}) =>
  api.get("/regal-garden/submissions", { params }).then((r) => r.data);

export const getRegalGardenSubmission = (id) => api.get(`/regal-garden/submissions/${id}`).then((r) => r.data);
