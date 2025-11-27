import express from "express";
import {
  getProviderAppointments,
  updateAppointmentStatus,
  createManualAppointment
} from "../controllers/providerAppointmentsController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect); // Todas requieren autenticación

router.get("/", getProviderAppointments); // ahora no necesita params
router.put("/:id", updateAppointmentStatus);
router.post("/", createManualAppointment);

export default router;
