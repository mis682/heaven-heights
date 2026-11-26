import api from "./client";

export const createSilverEstateOfficeSubmission = (payload) => api.post("/silver-estate-office/submissions", payload).then((r) => r.data);

export const listSilverEstateOfficeSubmissions = (params = {}) =>
  api.get("/silver-estate-office/submissions", { params }).then((r) => r.data);

export const getSilverEstateOfficeSubmission = (id) => api.get(`/silver-estate-office/submissions/${id}`).then((r) => r.data);
