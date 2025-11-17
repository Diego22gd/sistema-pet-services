import express from "express";
import {
  getAllServices,
  createService,
  updateService,
  deleteService
} from "../controllers/adminServiceController.js";

import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Solo admins pueden usar estas rutas
router.use(protect, authorizeRoles("admin"));

router.get("/", getAllServices);
router.post("/", createService);
router.put("/:id", updateService);
router.delete("/:id", deleteService);

export default router;
