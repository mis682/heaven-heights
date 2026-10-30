import api from "./client";

export const createSchoolSubmission = (payload) => api.post("/school/submissions", payload).then((r) => r.data);

export const listSchoolSubmissions = (params = {}) =>
  api.get("/school/submissions", { params }).then((r) => r.data);

export const getSchoolSubmission = (id) => api.get(`/school/submissions/${id}`).then((r) => r.data);
