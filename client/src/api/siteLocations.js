import api from "./client";

export const listSiteLocations = () => api.get("/site-locations").then((r) => r.data);

export const saveSiteLocation = (siteName, data) =>
  api.put(`/site-locations/${encodeURIComponent(siteName)}`, data).then((r) => r.data);
