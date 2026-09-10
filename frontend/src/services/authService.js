import api from "./api";

export const authService = {
  login: (email, password) => api.post("/auth/login", { email, password }),
  me: () => api.get("/auth/me"),
  registerStaff: (payload) => api.post("/auth/register", payload),
};
