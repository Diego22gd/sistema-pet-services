// routes/adminUserRoutes.js
import express from "express";
import { 
  getAllUsers, 
  updateUser, 
  deleteUser, 
  toggleUserStatus,
  changeUserStatus 
} from "../controllers/adminUserController.js";

const router = express.Router();

// 🔹 Obtener todos los usuarios
router.get("/", getAllUsers);

// 🔹 Actualizar un usuario
router.put("/:id", updateUser);

// 🔹 Eliminar un usuario
router.delete("/:id", deleteUser);

// 🔹 Bloquear/Desbloquear un usuario (toggle)
router.patch("/:id/toggle-status", toggleUserStatus);

// 🔹 Cambiar estado específico (opcional)
router.patch("/:id/status", changeUserStatus);

export default router;