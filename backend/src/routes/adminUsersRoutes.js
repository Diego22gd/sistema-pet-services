import express from "express";
import { getAllUsers, updateUser, deleteUser } from "../controllers/adminUserController.js";

const router = express.Router();

// 🔹 Obtener todos los usuarios (clientes, proveedores, admins)
router.get("/", getAllUsers);

// 🔹 Actualizar un usuario
router.put("/:id", updateUser);

// 🔹 Eliminar un usuario
router.delete("/:id", deleteUser);

export default router;
