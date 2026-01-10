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
// 👑 ADMIN APPOINTMENTS — Panel de Administración de Citas
// =======================================================
// Obtener todas las citas (admin)
export const getAllAppointmentsAdmin = () => API.get("/admin/appointments");

// Crear cita como administrador
export const createAppointmentAsAdmin = (data) => 
  API.post("/admin/appointments", data);

// Obtener datos completos para formulario de admin
export const getAppointmentFormDataComplete = () => 
  API.get("/admin/appointments/complete-form-data");

// Obtener datos básicos para formulario de admin (fallback)
export const getAppointmentFormData = () => 
  API.get("/admin/appointments/form-data");

// Obtener mascotas de un cliente específico
export const getClientPetsAdmin = (clientId) => 
  API.get(`/admin/appointments/clients/${clientId}/pets`);

// Obtener negocios de un proveedor
export const getProviderBusinessesAdmin = (providerId) => 
  API.get(`/admin/appointments/providers/${providerId}/businesses`);

// Obtener servicios de un negocio
export const getBusinessServicesAdmin = (businessId) => 
  API.get(`/admin/appointments/businesses/${businessId}/services`);

// Obtener servicios de un proveedor
export const getProviderServicesAdmin = (providerId) => 
  API.get(`/admin/appointments/providers/${providerId}/services`);

// Actualizar estado de cita (admin)
export const updateAppointmentStatusAdmin = (appointmentId, status) => 
  API.put(`/admin/appointments/${appointmentId}/status`, { status });

// Eliminar cita (admin)
export const deleteAppointmentAdmin = (appointmentId) => 
  API.delete(`/admin/appointments/${appointmentId}`);

// Reprogramar cita (admin)
export const rescheduleAppointmentAdmin = (appointmentId, data) => 
  API.patch(`/admin/appointments/${appointmentId}/reschedule`, data);

// Obtener estadísticas de citas (admin)
export const getAppointmentStatsAdmin = () => 
  API.get("/admin/appointments/stats");

// =======================================================
// 🏬 ADMIN BUSINESSES — Panel de Administración de Comercios
// =======================================================
// Obtener todos los comercios para admin
export const getAllBusinessesAdmin = (params) => 
  API.get("/admin/businesses", { params });

// Obtener comercios pendientes de aprobación
export const getPendingBusinesses = () => 
  API.get("/admin/businesses/pending");

// Aprobar comercio
export const approveBusiness = (id) => 
  API.patch(`/admin/businesses/${id}/approve`);

// Rechazar comercio
export const rejectBusiness = (id) => 
  API.patch(`/admin/businesses/${id}/reject`);

// Marcar/desmarcar como destacado
export const toggleFeaturedBusiness = (id) => 
  API.patch(`/admin/businesses/${id}/toggle-featured`);

// Cambiar estado de comercio
export const changeBusinessStatus = (id, status) => 
  API.patch(`/admin/businesses/${id}/status`, { status });

// Obtener estadísticas globales
export const getGlobalStats = () => 
  API.get("/admin/businesses/stats");

// =======================================================
// 🛎️ APPOINTMENTS — Reservas (usuarios)
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
// 🏬 BUSINESSES — Comercios
// =======================================================
// Obtener comercios públicos
export const getBusinessesForUsers = (params) => 
  API.get("/businesses", { params });

// Obtener comercio específico (público)
export const getBusinessByIdForUser = (id) => 
  API.get(`/businesses/${id}`);

// Obtener comercio (admin/proveedor)
export const getBusinessById = (id) => 
  API.get(`/businesses/by-id/${id}`);

// Crear comercio
export const createBusiness = (data) => 
  API.post("/businesses", data);

// Actualizar comercio
export const updateBusiness = (id, data) => 
  API.put(`/businesses/${id}`, data);

// Eliminar comercio
export const deleteBusiness = (id) => 
  API.delete(`/businesses/${id}`);

// Obtener comercios del proveedor autenticado
export const getMyBusinesses = () => 
  API.get("/businesses/my-businesses");

// Obtener horarios disponibles
export const getAvailableHours = (id, date) => 
  API.get(`/businesses/${id}/available-hours`, { params: { date } });

// Obtener comercios favoritos del usuario
export const getUserFavoriteBusinesses = () => 
  API.get("/businesses/user/favorites");

// Agregar/remover comercio de favoritos
export const toggleFavoriteBusiness = (id) => 
  API.post(`/businesses/user/favorites/${id}`);

// Eliminar comercio de favoritos
export const removeFavoriteBusiness = (id) => 
  API.delete(`/businesses/user/favorites/${id}`);

// Obtener estadísticas públicas
export const getBusinessStatsPublic = () => 
  API.get("/businesses/stats");

// Obtener recomendaciones
export const getRecommendedBusinesses = (userId) => 
  API.get(`/businesses/recommended/${userId}`);

// Registrar visita a comercio
export const recordBusinessView = (id) => 
  API.post(`/businesses/${id}/record-view`);

// Obtener comercios para reservar citas
export const getBusinessesForAppointment = (params) => 
  API.get("/businesses/appointment/available", { params });

// Obtener comercios destacados
export const getFeaturedBusinesses = () => 
  API.get("/businesses/featured");

// Obtener comercios por ubicación
export const getBusinessesByLocation = (params) => 
  API.get("/businesses/by-location", { params });

// Obtener todos los comercios (legacy)
export const getBusinesses = (params) => 
  API.get("/businesses/all", { params });

// Incrementar vistas de comercio
export const incrementBusinessViews = (id) => 
  API.post(`/businesses/${id}/increment-views`);

// =======================================================
// 👤 AUTENTICACIÓN
// =======================================================
export const registerUser = (data) => API.post("/users/register", data);
export const loginUser = (data) => API.post("/users/login", data);

// Obtener datos del usuario autenticado
export const getCurrentUser = () => API.get("/users/me");

// Actualizar perfil de usuario
export const updateUserProfile = (data) => API.put("/users/profile", data);

// =======================================================
// 👥 USERS — Gestión de usuarios (admin)
// =======================================================
// Obtener todos los usuarios (admin)
export const getAllUsers = (params) => 
  API.get("/admin/users", { params });

// Obtener usuario por ID
export const getUserById = (id) => 
  API.get(`/admin/users/${id}`);

// Actualizar usuario
export const updateUser = (id, data) => 
  API.put(`/admin/users/${id}`, data);

// Cambiar rol de usuario
export const changeUserRole = (id, role) => 
  API.patch(`/admin/users/${id}/role`, { role });

// Cambiar estado de usuario
export const changeUserStatus = (id, status) => 
  API.patch(`/admin/users/${id}/status`, { status });

// Eliminar usuario
export const deleteUser = (id) => 
  API.delete(`/admin/users/${id}`);

// =======================================================
// 📊 PROVEEDORES
// =======================================================
// Obtener estadísticas de comercios del proveedor
export const getBusinessStats = () => 
  API.get("/businesses/stats/provider");

// =======================================================
// 🔍 BÚSQUEDA AVANZADA
// =======================================================
export const searchBusinesses = (params) => 
  API.get("/businesses/search", { params });

// Default export
export default API;