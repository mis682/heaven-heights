import api from "./client";

export const listProjects = (params = {}) => api.get("/projects", { params }).then((r) => r.data);
export const getProjectBySlug = (slug) => api.get(`/projects/${slug}`).then((r) => r.data);
