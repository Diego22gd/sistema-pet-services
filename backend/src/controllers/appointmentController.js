// backend/controllers/appointments.controller.js

import Appointment from "../models/Appointment.js";
import Service from "../models/Service.js";
import {
  notifyAppointment,
  notifyCancel,
  notifyReschedule
} from "./notificationsController.js";

// 📅 Obtener citas de un usuario
export const getAppointmentsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const appts = await Appointment.find({ user: userId })
      .populate("pet", "name type")
      .populate("service", "name price description")
      .sort({ date: 1, time: 1 });

    return res.json(appts);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error obteniendo citas" });
  }
};

// ➕ Crear cita
export const createAppointment = async (req, res) => {
  try {
    const userId = req.user._id; // 🔥 Ahora siempre viene del token
    const { petId, serviceId, date, time } = req.body;

    if (!petId || !serviceId || !date || !time) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    // ✔ Obtener servicio correctamente
    const service = await Service.findById(serviceId);

    if (!service) {
      return res.status(404).json({ message: "Servicio no encontrado" });
    }

    if (!service.providerId) {
      return res.status(400).json({ message: "El servicio no tiene proveedor asignado" });
    }

    const providerId = service.providerId;

    // ✔ Crear cita
    const appt = new Appointment({
      user: userId,
      pet: petId,
      service: serviceId,
      date,
      time,
      status: "pendiente"
    });

    await appt.save();

    const customerName = req.user?.name || "Cliente";

    notifyAppointment(providerId, customerName, service.name);

    return res.status(201).json(appt);

  } catch (err) {
    console.error("ERROR createAppointment:", err);
    return res.status(500).json({ message: "Error creando cita" });
  }
};

// ❌ Cancelar cita
export const cancelAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const appt = await Appointment.findById(appointmentId)
      .populate("service")
      .populate("user");

    if (!appt)
      return res.status(404).json({ message: "Cita no encontrada" });

    const updated = await Appointment.findByIdAndUpdate(
      appointmentId,
      { status: "cancelada" },
      { new: true }
    );

    const providerId = appt.service?.providerId;
    const customerName = appt.user?.name || "Cliente";

    notifyCancel(providerId, customerName, appt.service?.name);

    return res.json(updated);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error al cancelar cita" });
  }
};

// 🔁 Reprogramar cita
export const rescheduleAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { date, time } = req.body;

    if (!date || !time)
      return res.status(400).json({ message: "Fecha y hora requeridas" });

    const appt = await Appointment.findById(appointmentId)
      .populate("service")
      .populate("user");

    if (!appt)
      return res.status(404).json({ message: "Cita no encontrada" });

    const updated = await Appointment.findByIdAndUpdate(
      appointmentId,
      { date, time, status: "reprogramada" },
      { new: true }
    );

    const providerId = appt.service?.providerId;
    const customerName = appt.user?.name || "Cliente";

    notifyReschedule(providerId, customerName, appt.service?.name);

    return res.json(updated);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error reprogramando cita" });
  }
};

// 🔍 Obtener una cita por ID
export const getAppointmentById = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const appt = await Appointment.findById(appointmentId)
      .populate("pet", "name type")
      .populate("service", "name price description")
      .populate("user", "name email");

    if (!appt)
      return res.status(404).json({ message: "Cita no encontrada" });

    return res.json(appt);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error obteniendo cita" });
  }
};
