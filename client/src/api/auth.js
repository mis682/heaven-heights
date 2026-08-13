import api from "./client";

export const loginRequest = (name, role, password) =>
  api.post("/auth/login", { name, role, password }).then((r) => r.data);
