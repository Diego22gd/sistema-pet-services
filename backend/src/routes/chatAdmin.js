// src/routes/chatAdmin.js
import express from "express";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import User from "../models/User.js";
import Service from "../models/Service.js";
import Appointment from "../models/Appointment.js";

const router = express.Router();

// Middleware: solo admin puede acceder
router.use(protect, authorizeRoles("admin"));

// -----------------------------------------
// Listar proveedores pendientes
// -----------------------------------------
router.get("/providers-pending", async (req, res) => {
  try {
    const providers = await User.find({ role: "provider", status: "pending" });
    res.json({
      type: "list",
      title: "Proveedores en Espera de Aprobación",
      items: providers.map(p => ({
        name: p.name,
        business: p.businessName,
        email: p.email,
        id: p._id
      }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener proveedores" });
  }
});

// -----------------------------------------
// Listar todos los usuarios
// -----------------------------------------
router.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json({
      type: "table",
      title: "Usuarios Registrados",
      columns: ["Nombre", "Email", "Rol"],
      rows: users.map(u => [u.name, u.email, u.role])
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
});

// -----------------------------------------
// Listar todos los servicios
// -----------------------------------------
router.get("/services", async (req, res) => {
  try {
    const services = await Service.find();
    res.json({
      type: "cards",
      title: "Servicios Disponibles",
      cards: services.map(s => ({
        title: s.name,
        description: s.description,
        price: s.price,
        provider: s.providerName
      }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener servicios" });
  }
});

// -----------------------------------------
// Listar todas las citas
// -----------------------------------------
router.get("/appointments", async (req, res) => {
  try {
    const appointments = await Appointment.find().populate("userId providerId petId");
    res.json({
      type: "timeline",
      title: "Citas Registradas",
      events: appointments.map(a => ({
        label: `${a.date} ${a.time}`,
        description: `${a.userId?.name || "Usuario"} con ${a.providerId?.businessName || a.providerId?.name || "Proveedor"}`
      }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener citas" });
  }
});

export default router;
