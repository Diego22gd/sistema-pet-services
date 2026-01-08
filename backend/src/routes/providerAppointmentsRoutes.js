import express from "express";
import {
  getProviderAppointments,
  updateAppointmentStatus,
  createManualAppointment,
  getProviderStats,
  getProviderAppointmentsAlt,
  getProviderAppointmentById,
  rescheduleProviderAppointment
} from "../controllers/providerAppointmentsController.js";

import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Obtener todas las citas del proveedor
router.get("/", protect, getProviderAppointments);
router.get("/alt", protect, getProviderAppointmentsAlt);
router.get("/:id", protect, getProviderAppointmentById);
router.get("/provider/stats", protect, getProviderStats);

// Actualizar estado de una cita
router.put("/:id", protect, updateAppointmentStatus);

// Reprogramar cita
router.patch("/:id/reschedule", protect, rescheduleProviderAppointment);

// Crear cita manualmente
router.post("/", protect, createManualAppointment);

export default router; 