// controllers/adminAppointments.controller.js
import Appointment from "../models/Appointment.js";
import User from "../models/User.js";

// Obtener todas las citas (con datos del cliente y proveedor)
export const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("clientId", "name email")
      .populate("providerId", "name email service");

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener citas", error });
  }
};

// Cambiar estado de una cita
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await Appointment.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    )
      .populate("clientId", "name email")
      .populate("providerId", "name email service");

    if (!updated) return res.status(404).json({ message: "Cita no encontrada" });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar estado de la cita", error });
  }
};

// Eliminar cita
export const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Appointment.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Cita no encontrada" });
    res.json({ message: "Cita eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar cita", error });
  }
};
