import api from "./client";

export const getVehicleMeta = () => api.get("/vehicle/meta").then((r) => r.data);

export const createVehicleRide = (data) => api.post("/vehicle", data).then((r) => r.data);

export const listVehicleSubmissions = (params = {}) => api.get("/vehicle/submissions", { params }).then((r) => r.data);

export const getVehicleDailyReport = (params = {}) => api.get("/vehicle/daily-report", { params }).then((r) => r.data);
