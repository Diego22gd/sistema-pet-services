// backend/routes/providerReportsRoutes.js
import { Router } from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { providerOnly } from "../middlewares/providerOnly.js";
import { getProviderReports } from "../controllers/providerReportsController.js";

const router = Router();

router.get("/reports", protect, providerOnly, getProviderReports);

export default router;
