// src/services/appointmentService.js
import API from "@/api/api";

// Obtener todas las citas del usuario logueado
export const getByUser = () => API.get("/appointments/user/me");

// Crear una cita
export const create = (data) => API.post("/appointments", data);

// Cancelar una cita
export const cancel = (id) => API.patch(`/appointments/${id}/cancel`);

// Reprogramar una cita
export const reschedule = (id, date, time) =>
  API.patch(`/appointments/${id}/reschedule`, { date, time });

// Obtener cita por ID
export const getById = (id) => API.get(`/appointments/${id}`);

export default { getByUser, create, cancel, reschedule, getById };
