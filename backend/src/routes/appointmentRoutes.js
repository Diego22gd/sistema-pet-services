// routes/appointmentRoutes.js
import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  createAppointment,
  getAppointmentsByUser,
  getAppointmentById,
  cancelAppointment,
  rescheduleAppointment,
   getAppointmentStats,
   getAvailableHours 
} from "../controllers/appointmentController.js";

const router = express.Router();
router.get("/hours/available", getAvailableHours);
router.post("/", protect, createAppointment);
router.get("/user/me", protect, getAppointmentsByUser);
router.get("/stats", getAppointmentStats);   
router.get("/:id", protect, getAppointmentById);

// Cancelar cita
router.patch("/:id/cancel", protect, cancelAppointment);

// Reprogramar cita
router.patch("/:id/reschedule", protect, rescheduleAppointment);

export default router;
