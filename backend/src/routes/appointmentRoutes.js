// backend/routes/appointments.routes.js
import express from "express";
import {
  getAppointmentsByUser,
  createAppointment,
  cancelAppointment,
  rescheduleAppointment,
  getAppointmentById
} from "../controllers/appointmentController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Obtener todas las citas de un usuario
router.get("/user/:userId", protect, getAppointmentsByUser);

// Obtener una cita específica
router.get("/:appointmentId", protect, getAppointmentById);

// Crear una cita
router.post("/", protect, createAppointment);

// Cancelar una cita
router.put("/:appointmentId/cancel", protect, cancelAppointment);

// Reprogramar una cita
router.put("/:appointmentId/reschedule", protect, rescheduleAppointment);

export default router;
