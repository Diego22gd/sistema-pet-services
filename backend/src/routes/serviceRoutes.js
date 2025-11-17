import express from "express";
import {
  createService,
  getServices,
  getPendingServices,
  approveService,
  updateService,
  deleteService,
  getMyServices, // 👈 nuevo
} from "../controllers/serviceController.js";

import { protect } from "../middlewares/authMiddleware.js";
import { requireRole } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Obtener servicios propios (provider)
router.get("/my-services", protect, requireRole("provider", "admin"), getMyServices);


// Crear servicio (admin o provider)
router.post("/", protect, requireRole("admin", "provider"), createService);

// Listar servicios aprobados
router.get("/", protect, getServices);

// Listar pendientes (solo admin)
router.get("/pending", protect, requireRole("admin"), getPendingServices);

// Aprobar (solo admin)
router.put("/approve/:id", protect, requireRole("admin"), approveService);

// Editar / eliminar (propio o admin)
router.put("/:id", protect, requireRole("admin", "provider"), updateService);
router.delete("/:id", protect, requireRole("admin", "provider"), deleteService);

export default router;
