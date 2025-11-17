// routes/adminAppointments.routes.js
import express from "express";
import {
  getAppointments,
  updateAppointmentStatus,
  deleteAppointment,
} from "../controllers/adminAppointments.controller.js";

const router = express.Router();

router.get("/", getAppointments);
router.put("/:id/status", updateAppointmentStatus);
router.delete("/:id", deleteAppointment);

export default router;
