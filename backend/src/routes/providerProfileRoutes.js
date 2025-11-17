import express from "express";
import {
  getProviderProfile,
  createProviderProfile,
  updateProviderProfile,
} from "../controllers/providerProfileController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Obtener perfil de proveedor
router.get("/:id", protect, getProviderProfile);

// Crear perfil de proveedor
router.post("/", protect, createProviderProfile);

// Actualizar perfil de proveedor
router.put("/:id", protect, updateProviderProfile);

export default router;
