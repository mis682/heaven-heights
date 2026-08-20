import api from "./client";

export const loginRequest = (name, role, password) =>
  api.post("/auth/login", { name, role, password }).then((r) => r.data);

// Resolves to true/false rather than throwing, so a network hiccup doesn't
// look like an invalidated session — only an explicit server "no" logs out.
export const verifySession = (token) =>
  api
    .post("/auth/verify", { token })
    .then(() => true)
    .catch((err) => (err.response?.status === 401 ? false : true));
