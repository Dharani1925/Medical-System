import api from "./api";

export const appointmentService = {
  list: (params) => api.get("/appointments", { params }),
  getById: (id) => api.get(`/appointments/${id}`),
  create: (payload) => api.post("/appointments", payload),
  update: (id, payload) => api.put(`/appointments/${id}`, payload),
  updateStatus: (id, status) => api.put(`/appointments/${id}/status`, { status }),
  remove: (id) => api.delete(`/appointments/${id}`),
};

export const queueService = {
  get: (date) => api.get("/queue", { params: date ? { date } : {} }),
  updateStatus: (id, status) => api.put(`/queue/${id}/status`, { status }),
};
