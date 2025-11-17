import User from "../models/User.js";
import Appointment from "../models/Appointment.js";
import Subscription from "../models/Subscription.js";
import moment from "moment";

export const getDashboardStats = async (req, res) => {
  try {
    // Solo admins pueden acceder
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Acceso denegado" });
    }

    const clients = await User.countDocuments({ role: "client" });
    const providers = await User.countDocuments({ role: "provider" });

    const today = moment().startOf("day");
    const tomorrow = moment(today).endOf("day");

    const appointmentsToday = await Appointment.countDocuments({
      date: { $gte: today.toDate(), $lte: tomorrow.toDate() },
    });

    const subscriptionsActive = await Subscription.countDocuments({ status: "active" });

    // Citas por día en la última semana
    const startOfWeek = moment().startOf("week");
    const endOfWeek = moment().endOf("week");

    const appointments = await Appointment.aggregate([
      {
        $match: { date: { $gte: startOfWeek.toDate(), $lte: endOfWeek.toDate() } },
      },
      {
        $group: {
          _id: { $dayOfWeek: "$date" },
          count: { $sum: 1 },
        },
      },
    ]);

    const weekDays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    const appointmentsPerDay = weekDays.map((day, i) => {
      const found = appointments.find((a) => a._id === i + 1);
      return found ? found.count : 0;
    });

    res.json({
      clients,
      providers,
      appointmentsToday,
      subscriptionsActive,
      appointmentsPerDay,
    });
  } catch (error) {
    console.error("Error obteniendo estadísticas del dashboard:", error);
    res.status(500).json({ message: "Error al obtener estadísticas" });
  }
};
