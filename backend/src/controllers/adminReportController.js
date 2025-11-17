import Appointment from "../models/Appointment.js";
import User from "../models/User.js";
import Provider from "../models/Provider.js";

// 📊 Resumen general
export const getOverview = async (req, res) => {
  try {
    const clients = await User.countDocuments({ role: "client" });
    const providers = await Provider.countDocuments();

    // citas del mes actual
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
    const appointments = await Appointment.countDocuments({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
    });

    // estimación del ingreso (por ejemplo, 50 USD por cita completada)
    const completedAppointments = await Appointment.countDocuments({ status: "Confirmada" });
    const revenue = completedAppointments * 50;

    res.json({
      clients,
      providers,
      appointments,
      revenue,
    });
  } catch (error) {
    console.error("Error loading overview:", error);
    res.status(500).json({ message: "Error loading overview data" });
  }
};

// 📈 Estado de las citas
export const getAppointmentsStats = async (req, res) => {
  try {
    const pending = await Appointment.countDocuments({ status: "Pendiente" });
    const confirmed = await Appointment.countDocuments({ status: "Confirmada" });
    const rescheduled = await Appointment.countDocuments({ status: "Reprogramada" });
    const cancelled = await Appointment.countDocuments({ status: "Cancelada" });

    res.json({ pending, confirmed, rescheduled, cancelled });
  } catch (error) {
    console.error("Error loading appointment stats:", error);
    res.status(500).json({ message: "Error loading appointment stats" });
  }
};

// 💅 Servicios más solicitados
export const getServiceStats = async (req, res) => {
  try {
    const services = await Appointment.aggregate([
      { $match: { serviceName: { $exists: true, $ne: "" } } },
      {
        $group: {
          _id: "$serviceName",
          count: { $sum: 1 },
        },
      },
      { $project: { service: "$_id", count: 1, _id: 0 } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.json(services);
  } catch (error) {
    console.error("Error loading service stats:", error);
    res.status(500).json({ message: "Error loading service stats" });
  }
};
