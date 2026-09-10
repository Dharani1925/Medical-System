import api from "./api";

export const doctorService = {
  list: () => api.get("/doctors"),
  getById: (id) => api.get(`/doctors/${id}`),
  create: (payload) => api.post("/doctors", payload),
  update: (id, payload) => api.put(`/doctors/${id}`, payload),
};

export const receptionistService = {
  list: () => api.get("/receptionists"),
  create: (payload) => api.post("/receptionists", payload),
  update: (id, payload) => api.put(`/receptionists/${id}`, payload),
};

export const userService = {
  list: (role) => api.get("/users", { params: role ? { role } : {} }),
  update: (id, payload) => api.put(`/users/${id}`, payload),
};
