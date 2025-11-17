import express from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
} from "../controllers/userController.js";

import { protect } from "../middlewares/authMiddleware.js";
import { body } from "express-validator";

const router = express.Router();

/**
 * ✅ Registro de usuario
 */
router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("El nombre es obligatorio"),
    body("email").isEmail().withMessage("El correo es inválido"),
    body("password").isLength({ min: 6 }).withMessage("La contraseña debe tener al menos 6 caracteres"),
  ],
  registerUser
);

/**
 * ✅ Inicio de sesión
 */
router.post("/login", loginUser);

/**
 * ✅ Obtener datos del usuario autenticado
 * GET /api/users/:id
 */
router.get("/:id", protect, getUserProfile);

/**
 * ✅ Actualizar perfil del usuario
 * PUT /api/users/:id
 */
router.put("/:id", protect, updateUserProfile);

export default router;
