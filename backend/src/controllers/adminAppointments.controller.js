import Appointment from "../models/Appointment.js";
import User from "../models/User.js";

// Obtener TODAS las citas (solo admin)
export const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("userId", "name lastname email phone")       // cliente
      .populate("providerId", "name businessName serviceType email phone"); // proveedor

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Error getting appointments", error });
  }
};

// Actualizar cita
export const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await Appointment.findByIdAndUpdate(id, req.body, { new: true })
      .populate("userId", "name lastname email phone")
      .populate("providerId", "name businessName serviceType email phone");

    if (!updated)
      return res.status(404).json({ message: "Appointment not found" });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating appointment", error });
  }
};

// Eliminar cita
export const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Appointment.findByIdAndDelete(id);
    if (!deleted)
      return res.status(404).json({ message: "Appointment not found" });

    res.json({ message: "Appointment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting appointment", error });
  }
};
