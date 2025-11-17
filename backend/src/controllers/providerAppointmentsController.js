import Appointment from "../models/Appointment.js";

// Obtener citas del proveedor
export const getProviderAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      providerId: req.params.providerId
    }).populate("clientId", "name");

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cambiar estado
export const updateAppointmentStatus = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Cita no encontrada" });
    }

    appointment.status = req.body.status;
    await appointment.save();

    res.json({ message: "Estado actualizado", appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Crear cita manualmente
export const createManualAppointment = async (req, res) => {
  try {
    const newAppointment = await Appointment.create(req.body);
    res.status(201).json(newAppointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
