import express from "express";
import { getApprovedServices } from "../controllers/clientServiceController.js";

const router = express.Router();

router.get("/", getApprovedServices);

export default router;
