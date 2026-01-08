// routes/adminAppointmentsRoutes.js
import express from "express";
import {
  getAllAppointmentsAdmin,
  createAppointmentAsAdmin,
  getAppointmentFormData,
  getClientPets,
  getProviderBusinesses,
  getBusinessServices,
  getProviderServices,
  updateAppointmentStatusAdmin,
  deleteAppointmentAdmin,
  rescheduleAppointmentAdmin,
  getAppointmentStatsAdmin
} from "../controllers/adminAppointments.controller.js";
import { protect,  authorizeRoles} from "../middlewares/authMiddleware.js";

const router = express.Router();

// Todas las rutas requieren autenticación y ser admin
router.use(protect);
router.use(authorizeRoles('admin')); 
router.get("/", getAllAppointmentsAdmin);

// Obtener datos para formulario
router.get("/form-data", getAppointmentFormData);

// Obtener estadísticas
router.get("/stats", getAppointmentStatsAdmin);

// Crear nueva cita
router.post("/", createAppointmentAsAdmin);

// Obtener mascotas de un cliente
router.get("/clients/:clientId/pets", getClientPets);

// Obtener negocios de un proveedor
router.get("/providers/:providerId/businesses", getProviderBusinesses);

// Obtener servicios de un negocio
router.get("/businesses/:businessId/services", getBusinessServices);

// Obtener servicios de un proveedor
router.get("/providers/:providerId/services", getProviderServices);

// Actualizar estado de cita
router.put("/:id/status", updateAppointmentStatusAdmin);

// Reprogramar cita
router.patch("/:id/reschedule", rescheduleAppointmentAdmin);

// Eliminar cita
router.delete("/:id", deleteAppointmentAdmin);

export default router;