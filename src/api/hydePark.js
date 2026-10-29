import api from "./client";

export const createHydeParkSubmission = (payload) => api.post("/hyde-park/submissions", payload).then((r) => r.data);

export const listHydeParkSubmissions = (params = {}) =>
  api.get("/hyde-park/submissions", { params }).then((r) => r.data);

export const getHydeParkSubmission = (id) => api.get(`/hyde-park/submissions/${id}`).then((r) => r.data);
