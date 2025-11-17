// frontend/src/services/appointmentService.js
import api from "@/api/api";

export default {
  async getByUser(userId) {
    const resp = await api.get(`/appointments/user/${userId}`);
    return resp.data;
  },
  async getById(appointmentId) {
    const resp = await api.get(`/appointments/${appointmentId}`);
    return resp.data;
  },
  async create(payload) {
    const resp = await api.post(`/appointments`, payload);
    return resp.data;
  },
  async cancel(appointmentId) {
    const resp = await api.put(`/appointments/${appointmentId}/cancel`);
    return resp.data;
  },
  async reschedule(appointmentId, date, time) {
    const resp = await api.put(`/appointments/${appointmentId}/reschedule`, { date, time });
    return resp.data;
  }
};
