import api from "./api";

export const consultationService = {
  create: (payload) => api.post("/consultations", payload),
  getByPatient: (patientId) => api.get(`/consultations/patient/${patientId}`),
  getByDoctor: (doctorId) => api.get(`/consultations/doctor/${doctorId}`),
  getById: (id) => api.get(`/consultations/${id}`),
  update: (id, payload) => api.put(`/consultations/${id}`, payload),
};
