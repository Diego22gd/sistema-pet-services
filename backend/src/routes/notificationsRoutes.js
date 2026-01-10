// routes/notificationsRoutes.js
import express from "express";
import {
  getProviderNotifications,
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadCount
} from "../controllers/notificationsController.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js"; // CAMBIO AQUÍ

const router = express.Router();

// Aplicar autenticación a todas las rutas
router.use(protect); // CAMBIO AQUÍ

// Obtener notificaciones del proveedor actual (usando token)
router.get("/me", authorizeRoles('provider'), getMyNotifications); // CAMBIO AQUÍ

// Obtener notificaciones por providerId (para admin o el mismo proveedor)
router.get("/provider/:providerId", getProviderNotifications);

// Marcar notificación como leída
router.put("/:notificationId/read", markNotificationAsRead);

// Marcar todas como leídas
router.put("/provider/:providerId/read-all", markAllNotificationsAsRead);

// Obtener contador de no leídas
router.get("/provider/:providerId/unread-count", getUnreadCount);

export default router;