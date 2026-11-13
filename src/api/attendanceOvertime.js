import api from "./client";

export const getOvertimeList = (params = {}) => api.get("/attendance-overtime", { params }).then((r) => r.data);

export const setOvertime = (data) => api.put("/attendance-overtime", data).then((r) => r.data);
