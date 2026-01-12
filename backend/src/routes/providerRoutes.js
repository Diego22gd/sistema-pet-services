import express from "express";
import { getProviders } from "../controllers/providerController.js";
import providerAppointmentsRoutes from "./providerAppointmentsRoutes.js";
import providerReportsRoutes from "./providerReportsRoutes.js";

const router = express.Router();

router.get("/", getProviders);
router.use("/appointments", providerAppointmentsRoutes);
router.use("/reports", providerReportsRoutes); 

export default router;
