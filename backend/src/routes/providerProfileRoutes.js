import express from "express";
import { 
  getProviderProfile,
  createProviderProfile,
  updateProviderProfile
} from "../controllers/providerProfileController.js";

import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Obtener perfil del proveedor (incluye datos del User)
router.get("/:id", protect, authorizeRoles("provider"), getProviderProfile);

// Crear perfil (solo una vez)
router.post("/", protect, authorizeRoles("provider"), createProviderProfile);

// Actualizar perfil + datos del usuario
router.put("/:id", protect, authorizeRoles("provider"), updateProviderProfile);

export default router;
