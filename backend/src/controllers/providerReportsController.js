// controllers/providerReportsController.js
import Appointment from "../models/Appointment.js";

export const getProviderReports = async (req, res) => {
  try {
    const providerId = req.user.id;

    // --- Estadísticas ---
    const completed = await Appointment.countDocuments({
      provider: providerId,
      status: "completed",
    });

    const cancelled = await Appointment.countDocuments({
      provider: providerId,
      status: "cancelled",
    });

    const pending = await Appointment.countDocuments({
      provider: providerId,
      status: "pending",
    });

    const revenueAgg = await Appointment.aggregate([
      { $match: { provider: providerId, status: "completed" } },
      { $group: { _id: null, total: { $sum: "$price" } } },
    ]);

    const revenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

    // --- Citas por mes (gráfico) ---
    const monthlyAgg = await Appointment.aggregate([
      {
        $match: {
          provider: providerId,
        },
      },
      {
        $group: {
          _id: { $month: "$date" },
          total: { $count: {} },
        },
      },
      { $sort: { "_id": 1 } },
    ]);

    const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio",
      "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    const monthlyData = Array(12).fill(0);
    monthlyAgg.forEach(item => {
      monthlyData[item._id - 1] = item.total;
    });

    return res.json({
      stats: {
        completed,
        cancelled,
        pending,
        revenue,
      },
      chart: {
        labels: months,
        data: monthlyData,
      },
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error obteniendo reportes" });
  }
};
