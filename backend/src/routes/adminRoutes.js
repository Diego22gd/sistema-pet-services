import express from "express";
import { getDashboardStats } from "../controllers/adminController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Dashboard del administrador
router.get("/dashboard", protect, getDashboardStats);

export default router;
