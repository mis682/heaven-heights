import api from "./client";

export const createSampleApartmentSubmission = (payload) =>
  api.post("/sample-apartment/submissions", payload).then((r) => r.data);

export const listSampleApartmentSubmissions = (params = {}) =>
  api.get("/sample-apartment/submissions", { params }).then((r) => r.data);

export const getSampleApartmentSubmission = (id) => api.get(`/sample-apartment/submissions/${id}`).then((r) => r.data);
