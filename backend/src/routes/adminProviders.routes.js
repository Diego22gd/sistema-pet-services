import express from "express";
import {
  getProviders,
  createProvider,
  updateProvider,
  deleteProvider,
  renewSubscription,
  pauseSubscription,
  resumeSubscription,
  toggleProviderStatus,     // Nueva función importada
  changeProviderStatus     // Nueva función importada
} from "../controllers/providerController.js";

const router = express.Router();

router.get("/", getProviders);
router.post("/", createProvider);
router.put("/:id", updateProvider);
router.delete("/:id", deleteProvider);

router.put("/:id/pause", pauseSubscription);
router.put("/:id/resume", resumeSubscription);
router.put("/:id/renew", renewSubscription);

// Nuevas rutas para bloquear/desbloquear
router.patch("/:id/toggle-status", toggleProviderStatus);     // Alternar estado
router.patch("/:id/status", changeProviderStatus);           // Cambiar estado específico

export default router;