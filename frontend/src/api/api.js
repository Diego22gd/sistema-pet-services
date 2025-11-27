// src/api/api.js
import axios from "axios";

// ======================================
// ⚙️ CONFIGURACIÓN BASE DEL CLIENTE AXIOS
// ======================================
const API = axios.create({
  baseURL: "http://localhost:4000/api", 
});

// ======================================
// 🔐 INTERCEPTOR: AGREGA TOKEN A TODAS LAS PETICIONES
// ======================================
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// =======================================================
// 🐾 PETS — Mascotas del usuario (lo usa Services.vue)
// =======================================================
export const getUserPets = () => API.get("/pets");   // <-- IMPORTANTE

// =======================================================
// 🛎️ APPOINTMENTS — Reservas
// =======================================================
export const createAppointment = (data) => API.post("/appointments", data);

export const getAppointmentsByUser = (userId) =>
  API.get(`/appointments/user/${userId}`);

export const cancelAppointment = (appointmentId) =>
  API.patch(`/appointments/${appointmentId}/cancel`);

export const rescheduleAppointment = (appointmentId, data) =>
  API.patch(`/appointments/${appointmentId}/reschedule`, data);

export const getAppointmentById = (appointmentId) =>
  API.get(`/appointments/${appointmentId}`);

// =======================================================
// 🧼 SERVICES — Servicios para mascotas
// =======================================================
export const createService = (data) => API.post("/services", data);
export const getAllServices = () => API.get("/services");

// Para vista cliente
export const getClientServices = () => API.get("/client/services");

export const updateService = (id, data) => API.put(`/services/${id}`, data);
export const deleteService = (id) => API.delete(`/services/${id}`);
export const changeServiceStatus = (id, status) =>
  API.patch(`/services/${id}/status`, { status });

// =======================================================
// 👤 AUTENTICACIÓN
// =======================================================
export const registerUser = (data) => API.post("/users/register", data);
export const loginUser = (data) => API.post("/users/login", data);

// Default export
export default API;
