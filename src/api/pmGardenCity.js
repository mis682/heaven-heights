import api from "./client";

export const createPmGardenCitySubmission = (payload) => api.post("/pm-garden-city/submissions", payload).then((r) => r.data);

export const listPmGardenCitySubmissions = (params = {}) =>
  api.get("/pm-garden-city/submissions", { params }).then((r) => r.data);

export const getPmGardenCitySubmission = (id) => api.get(`/pm-garden-city/submissions/${id}`).then((r) => r.data);
