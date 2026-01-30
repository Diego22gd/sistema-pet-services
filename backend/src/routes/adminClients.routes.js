import express from "express";
import {
  getClients,
  createClient,
  updateClient,
  deleteClient,
  toggleClientStatus,     // Nueva función
  changeClientStatus     // Nueva función
} from "../controllers/adminClientController.js";

const router = express.Router();

router.get("/", getClients);
router.post("/", createClient);
router.put("/:id", updateClient);
router.delete("/:id", deleteClient);

// Nuevas rutas para bloquear/desbloquear
router.patch("/:id/toggle-status", toggleClientStatus);     // Alternar estado
router.patch("/:id/status", changeClientStatus);           // Cambiar estado específico

export default router;