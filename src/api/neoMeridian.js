import api from "./client";

export const createNeoMeridianSubmission = (payload) => api.post("/neo-meridian/submissions", payload).then((r) => r.data);

export const listNeoMeridianSubmissions = (params = {}) =>
  api.get("/neo-meridian/submissions", { params }).then((r) => r.data);

export const getNeoMeridianSubmission = (id) => api.get(`/neo-meridian/submissions/${id}`).then((r) => r.data);
