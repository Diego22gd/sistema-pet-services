import express from "express";
import {
  getProviders,
  createProvider,
  updateProvider,
  deleteProvider,
  pauseSubscription,
  resumeSubscription,
  renewSubscription,
} from "../controllers/adminProviders.controller.js";

const router = express.Router();

router.get("/", getProviders);
router.post("/", createProvider);
router.put("/:id", updateProvider);
router.delete("/:id", deleteProvider);
router.put("/:id/pause", pauseSubscription);
router.put("/:id/resume", resumeSubscription);
router.put("/:id/renew", renewSubscription);

export default router;
