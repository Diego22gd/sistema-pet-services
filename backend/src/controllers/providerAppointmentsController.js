import Appointment from "../models/Appointment.js";


// ================================================
// GET — Todas las citas del proveedor logueado
// ================================================
export const getProviderAppointments = async (req, res) => {
  try {
    const providerId = req.user._id; // viene del token

    const appointments = await Appointment.find({ providerId })
      .populate("userId", "name lastname email")
      .populate("petId", "name")
      .populate("serviceId", "name")
      .sort({ date: 1 });

    res.status(200).json(appointments);
  } catch (error) {
    console.error("Error fetching provider appointments:", error);
    res.status(500).json({ message: "Error al obtener las citas del proveedor" });
  }
};


// ================================================
// PUT — Cambiar el estado de una cita
// ================================================
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "confirmed", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Estado inválido" });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: "Cita no encontrada" });
    }

    res.status(200).json(appointment);
  } catch (error) {
    console.error("Error updating appointment:", error);
    res.status(500).json({ message: "Error al actualizar el estado de la cita" });
  }
};


// ================================================
// POST — Crear cita manualmente (el proveedor la crea)
// ================================================
export const createManualAppointment = async (req, res) => {
  try {
    const providerId = req.user._id; // viene del token

    const { userId, petId, serviceId, date, time } = req.body;

    if (!userId || !petId || !serviceId || !date || !time) {
      return res.status(400).json({
        message: "Todos los campos son obligatorios"
      });
    }

    const newAppointment = new Appointment({
      providerId,
      userId,
      petId,
      serviceId,
      date,
      time,
      status: "pending"
    });

    await newAppointment.save();

    res.status(201).json({
      message: "Cita creada exitosamente",
      appointment: newAppointment
    });
  } catch (error) {
    console.error("Error creating appointment:", error);
    res.status(500).json({ message: "Error al crear la cita" });
  }
};
