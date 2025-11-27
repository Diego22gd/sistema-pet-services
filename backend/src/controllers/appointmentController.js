// controllers/appointmentController.js
import Appointment from "../models/Appointment.js";
import Pet from "../models/Pet.js";
import Service from "../models/Service.js";

// ======================================================
// 📌 Crear cita
// ======================================================
export const createAppointment = async (req, res) => {
  try {
    const { petId, serviceId, date, time } = req.body;

    if (!petId || !serviceId || !date || !time) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    // Mascota del usuario
    const pet = await Pet.findOne({ _id: petId, owner: req.user._id });
    if (!pet) return res.status(404).json({ message: "Mascota no encontrada" });

    // Servicio
    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ message: "Servicio no encontrado" });

    // Validar horario
    const existing = await Appointment.findOne({
      userId: req.user._id,
      date,
      time,
    });

    if (existing)
      return res.status(400).json({ message: "Ya tienes una cita en ese horario" });

    // Crear cita
    const appointment = await Appointment.create({
      userId: req.user._id,
      petId,
      serviceId,
      providerId: service.providerId || null, // ✅ evitar error si es undefined
      date,
      time,
      status: "pending",
    });

    res.status(201).json(appointment);

  } catch (err) {
    console.error("Error creando cita:", err);
    res.status(500).json({ message: "Error creando cita" });
  }
};

// ======================================================
// 📌 Obtener citas del usuario
// ======================================================
export const getAppointmentsByUser = async (req, res) => {
  try {
    const appointments = await Appointment.find({ userId: req.user._id })
      .populate("petId", "name type") // quitamos image
      .populate("serviceId", "name description price providerName")
      .populate("providerId", "name email");

    // Mapear para tener la misma estructura en frontend
    const mappedAppointments = appointments.map(appt => ({
      _id: appt._id,
      date: appt.date,
      time: appt.time,
      status: appt.status,
      pet: appt.petId ? { _id: appt.petId._id, name: appt.petId.name, type: appt.petId.type } : null,
      service: appt.serviceId ? { 
        _id: appt.serviceId._id, 
        name: appt.serviceId.name, 
        description: appt.serviceId.description, 
        price: appt.serviceId.price, 
        providerName: appt.serviceId.providerName 
      } : null,
      provider: appt.providerId ? { _id: appt.providerId._id, name: appt.providerId.name, email: appt.providerId.email } : null
    }));

    res.json(mappedAppointments);

  } catch (err) {
    console.error("Error obteniendo citas:", err);
    res.status(500).json({ message: "Error obteniendo citas" });
  }
};

// ======================================================
// 📌 Obtener cita por ID
// ======================================================
export const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("petId", "name type")
      .populate("serviceId", "name description price providerName")
      .populate("providerId", "name email");

    if (!appointment)
      return res.status(404).json({ message: "Cita no encontrada" });

    res.json(appointment);

  } catch (err) {
    console.error("Error obteniendo cita:", err);
    res.status(500).json({ message: "Error del servidor" });
  }
};

// ======================================================
// 📌 Cancelar cita
// ======================================================
export const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!appointment)
      return res.status(404).json({ message: "Cita no encontrada" });

    appointment.status = "cancelada";
    await appointment.save();

    res.json({ message: "Cita cancelada correctamente" });

  } catch (err) {
    console.error("Error cancelando cita:", err);
    res.status(500).json({ message: "Error del servidor" });
  }
};

// ======================================================
// 📌 Reprogramar cita
// ======================================================
export const rescheduleAppointment = async (req, res) => {
  try {
    const { date, time } = req.body;

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!appointment)
      return res.status(404).json({ message: "Cita no encontrada" });

    appointment.date = date;
    appointment.time = time;
    appointment.status = "reprogramada";

    await appointment.save();

    res.json({ message: "Cita reprogramada correctamente" });

  } catch (err) {
    console.error("Error reprogramando cita:", err);
    res.status(500).json({ message: "Error del servidor" });
  }
};
