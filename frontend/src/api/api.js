import axios from "axios";
import API_CONFIG from "@/config/api";

// ======================================
// ⚙️ CONFIGURACIÓN BASE DEL CLIENTE AXIOS
// ======================================
const API = axios.create(API_CONFIG);

// ======================================
// 🔐 INTERCEPTOR: AGREGA TOKEN A TODAS LAS PETICIONES
// ======================================
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Interceptor para manejar errores
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// =======================================================
// 🐾 PETS — Mascotas del usuario (lo usa Services.vue)
// =======================================================
export const getUserPets = () => API.get("/pets");

// =======================================================
// 👑 ADMIN APPOINTMENTS — Panel de Administración de Citas
// =======================================================
export const getAllAppointmentsAdmin = () => API.get("/admin/appointments");
export const createAppointmentAsAdmin = (data) => 
  API.post("/admin/appointments", data);
export const getAppointmentFormDataComplete = () => 
  API.get("/admin/appointments/complete-form-data");
export const getAppointmentFormData = () => 
  API.get("/admin/appointments/form-data");
export const getClientPetsAdmin = (clientId) => 
  API.get(`/admin/appointments/clients/${clientId}/pets`);
export const getProviderBusinessesAdmin = (providerId) => 
  API.get(`/admin/appointments/providers/${providerId}/businesses`);
export const getBusinessServicesAdmin = (businessId) => 
  API.get(`/admin/appointments/businesses/${businessId}/services`);
export const getProviderServicesAdmin = (providerId) => 
  API.get(`/admin/appointments/providers/${providerId}/services`);
export const updateAppointmentStatusAdmin = (appointmentId, status) => 
  API.put(`/admin/appointments/${appointmentId}/status`, { status });
export const deleteAppointmentAdmin = (appointmentId) => 
  API.delete(`/admin/appointments/${appointmentId}`);
export const rescheduleAppointmentAdmin = (appointmentId, data) => 
  API.patch(`/admin/appointments/${appointmentId}/reschedule`, data);
export const getAppointmentStatsAdmin = () => 
  API.get("/admin/appointments/stats");

// =======================================================
// 🏬 ADMIN BUSINESSES — Panel de Administración de Comercios
// =======================================================
export const getAllBusinessesAdmin = (params) => 
  API.get("/admin/businesses", { params });
export const getPendingBusinesses = () => 
  API.get("/admin/businesses/pending");
export const approveBusiness = (id) => 
  API.patch(`/admin/businesses/${id}/approve`);
export const rejectBusiness = (id) => 
  API.patch(`/admin/businesses/${id}/reject`);
export const toggleFeaturedBusiness = (id) => 
  API.patch(`/admin/businesses/${id}/toggle-featured`);
export const changeBusinessStatus = (id, status) => 
  API.patch(`/admin/businesses/${id}/status`, { status });
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
export const getClientServices = () => API.get("/client/services");
export const updateService = (id, data) => API.put(`/services/${id}`, data);
export const deleteService = (id) => API.delete(`/services/${id}`);
export const changeServiceStatus = (id, status) =>
  API.patch(`/services/${id}/status`, { status });

// =======================================================
// 🏬 BUSINESSES — Comercios
// =======================================================
export const getBusinessesForUsers = (params) => 
  API.get("/businesses", { params });
export const getBusinessByIdForUser = (id) => 
  API.get(`/businesses/${id}`);
export const getBusinessById = (id) => 
  API.get(`/businesses/by-id/${id}`);
export const createBusiness = (data) => 
  API.post("/businesses", data);
export const updateBusiness = (id, data) => 
  API.put(`/businesses/${id}`, data);
export const deleteBusiness = (id) => 
  API.delete(`/businesses/${id}`);
export const getMyBusinesses = () => 
  API.get("/businesses/my-businesses");
export const getAvailableHours = (id, date) => 
  API.get(`/businesses/${id}/available-hours`, { params: { date } });
export const getUserFavoriteBusinesses = () => 
  API.get("/businesses/user/favorites");
export const toggleFavoriteBusiness = (id) => 
  API.post(`/businesses/user/favorites/${id}`);
export const removeFavoriteBusiness = (id) => 
  API.delete(`/businesses/user/favorites/${id}`);
export const getBusinessStatsPublic = () => 
  API.get("/businesses/stats");
export const getRecommendedBusinesses = (userId) => 
  API.get(`/businesses/recommended/${userId}`);
export const recordBusinessView = (id) => 
  API.post(`/businesses/${id}/record-view`);
export const getBusinessesForAppointment = (params) => 
  API.get("/businesses/appointment/available", { params });
export const getFeaturedBusinesses = () => 
  API.get("/businesses/featured");
export const getBusinessesByLocation = (params) => 
  API.get("/businesses/by-location", { params });
export const getBusinesses = (params) => 
  API.get("/businesses/all", { params });
export const incrementBusinessViews = (id) => 
  API.post(`/businesses/${id}/increment-views`);
export const searchBusinesses = (params) => 
  API.get("/businesses/search", { params });

// =======================================================
// 👤 AUTENTICACIÓN
// =======================================================
export const registerUser = (data) => API.post("/users/register", data);
export const loginUser = (data) => API.post("/users/login", data);
export const getCurrentUser = () => API.get("/users/me");
export const updateUserProfile = (data) => API.put("/users/profile", data);

// =======================================================
// 👥 USERS — Gestión de usuarios (admin)
// =======================================================
export const getAllUsers = (params) => 
  API.get("/admin/users", { params });
export const getUserById = (id) => 
  API.get(`/admin/users/${id}`);
export const updateUser = (id, data) => 
  API.put(`/admin/users/${id}`, data);
export const changeUserRole = (id, role) => 
  API.patch(`/admin/users/${id}/role`, { role });
export const changeUserStatus = (id, status) => 
  API.patch(`/admin/users/${id}/status`, { status });
export const deleteUser = (id) => 
  API.delete(`/admin/users/${id}`);

// =======================================================
// 📊 PROVEEDORES
// =======================================================
export const getBusinessStats = () => 
  API.get("/businesses/stats/provider");

// Default export
export default API;