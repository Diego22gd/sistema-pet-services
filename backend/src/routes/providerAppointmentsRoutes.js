import express from "express";
import {
  getProviderAppointments,
  updateAppointmentStatus,
  createManualAppointment
} from "../controllers/providerAppointmentsController.js";

import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Obtener todas las citas del proveedor
router.get("/", protect, getProviderAppointments);

// Actualizar estado de una cita
router.put("/:id", protect, updateAppointmentStatus);

// Crear cita manualmente
router.post("/", protect, createManualAppointment);

export default router;
