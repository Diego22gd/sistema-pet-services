import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { connectDB } from "./src/config/db.js";

import userRoutes from "./src/routes/userRoutes.js";
import serviceRoutes from "./src/routes/serviceRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import adminClientsRoutes from "./src/routes/adminClients.routes.js";
import adminProvidersRoutes from "./src/routes/adminProviders.routes.js";
import adminAppointmentsRoutes from "./src/routes/adminAppointments.routes.js";
import adminReportRoutes from "./src/routes/adminReportRoutes.js";
import adminServiceRoutes from "./src/routes/adminServiceRoutes.js";
import adminUsersRoutes from "./src/routes/adminUsersRoutes.js";


import providerProfileRoutes from "./src/routes/providerProfileRoutes.js";
import providerAppointmentsRoutes from "./src/routes/providerAppointmentsRoutes.js";
import providerServicesRoutes from "./src/routes/providerServicesRoutes.js";
import petRoutes from "./src/routes/petRoutes.js";
import clientServiceRoutes from "./src/routes/clientServiceRoutes.js"
import appointmentsRoutes from "./src/routes/appointmentRoutes.js";

const app = express();

// CORS
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());

// DB
connectDB();

// Rutas públicas
app.use("/api/users", userRoutes);
app.use("/api/services", serviceRoutes);

// Admin
app.use("/api/admin", adminRoutes);
app.use("/api/admin/clients", adminClientsRoutes);
app.use("/api/admin/providers", adminProvidersRoutes);
app.use("/api/admin/appointments", adminAppointmentsRoutes);
app.use("/api/admin/reports", adminReportRoutes);
app.use("/api/admin/services", adminServiceRoutes);
app.use("/api/admin/users", adminUsersRoutes);

// Provider (CORREGIDO)
app.use("/api/provider/profile", providerProfileRoutes);
app.use("/api/provider/appointments", providerAppointmentsRoutes);
app.use("/api/provider-services", providerServicesRoutes);
app.use("/api/client/services", clientServiceRoutes);
app.use("/api/pets", petRoutes);
app.use("/api/appointments", appointmentsRoutes);
// Root
app.get("/", (req, res) => {
  res.send("API Pet Services funcionando 🐾");
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));
