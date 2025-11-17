// backend/routes/providerAppointmentsRoutes.js
import express from "express";
import {
  getProviderAppointments,
  updateAppointmentStatus,
  createManualAppointment
} from "../controllers/providerAppointmentsController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/:providerId", protect, getProviderAppointments);
router.put("/:id", protect, updateAppointmentStatus);
router.post("/", protect, createManualAppointment);

export default router;
