// src/api/api.js
import axios from "axios";

// ✅ URL base de tu backend
const API = axios.create({
  baseURL: "http://localhost:4000/api", // ajusta el puerto si es distinto
});

// ✅ Interceptor para añadir el token automáticamente
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ===============================
// 🔹 ENDPOINTS DE SERVICIOS
// ===============================

// Crear un servicio (proveedor o admin)
export const createService = (data) => API.post("/services", data);

// Obtener servicios (admin = todos, provider = propios)
export const getServices = () => API.get("/services");

// Actualizar servicio
export const updateService = (id, data) => API.put(`/services/${id}`, data);

// Eliminar servicio
export const deleteService = (id) => API.delete(`/services/${id}`);

// Cambiar estado del servicio (solo admin)
export const changeServiceStatus = (id, status) =>
  API.patch(`/services/${id}/status`, { status });

// ===============================
// 🔹 ENDPOINTS DE USUARIO
// ===============================
export const registerUser = (data) => API.post("/users/register", data);
export const loginUser = (data) => API.post("/users/login", data);

export default API;
