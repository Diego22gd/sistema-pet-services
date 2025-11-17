import express from "express";
import {
  getProviderServices,
  createProviderService,
  updateProviderService,
  deleteProviderService,
  pauseService,
  resumeService
} from "../controllers/providerServicesController.js";

import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Rutas protegidas y solo proveedor
router.use(protect, authorizeRoles("provider"));

router.get("/", getProviderServices);
router.post("/", createProviderService);
router.put("/:id", updateProviderService);
router.delete("/:id", deleteProviderService);
router.put("/:id/pause", pauseService);
router.put("/:id/resume", resumeService);

export default router;
