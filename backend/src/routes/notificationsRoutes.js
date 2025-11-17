import express from "express";
import { authProvider } from "../middleware/authProvider.js";
import {
  getNotifications,
  markAsRead
} from "../controllers/notificationsController.js";

const router = express.Router();

router.get("/", authProvider, getNotifications);
router.put("/:id/read", authProvider, markAsRead);

export default router;
