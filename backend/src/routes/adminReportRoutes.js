import express from "express";
import {
  getOverview,
  getAppointmentsStats,
  getServiceStats,
} from "../controllers/adminReportController.js";

const router = express.Router();

router.get("/overview", getOverview);
router.get("/appointments", getAppointmentsStats);
router.get("/services", getServiceStats);

export default router;
