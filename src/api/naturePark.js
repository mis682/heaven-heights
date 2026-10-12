import api from "./client";

export const createNatureParkSubmission = (payload) => api.post("/nature-park/submissions", payload).then((r) => r.data);

export const listNatureParkSubmissions = (params = {}) =>
  api.get("/nature-park/submissions", { params }).then((r) => r.data);

export const getNatureParkSubmission = (id) => api.get(`/nature-park/submissions/${id}`).then((r) => r.data);
