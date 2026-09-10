import api from "./api";

export const patientService = {
  list: () => api.get("/patients"),
  search: (query) => api.get("/patients/search", { params: { query } }),
  getById: (id) => api.get(`/patients/${id}`),
  create: (payload) => api.post("/patients", payload),
  update: (id, payload) => api.put(`/patients/${id}`, payload),
  remove: (id) => api.delete(`/patients/${id}`),
};
