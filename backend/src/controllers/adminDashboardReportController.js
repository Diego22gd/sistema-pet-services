// controllers/adminDashboardReportController.js
import User from "../models/User.js";
import Appointment from "../models/Appointment.js";
import Business from "../models/Business.js";
import Service from "../models/Service.js";
import mongoose from "mongoose";

// ======================================================
// 📊 OBTENER DATOS GENERALES DEL DASHBOARD
// ======================================================
export const getOverviewData = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Acceso denegado. Solo administradores pueden ver reportes"
      });
    }

    console.log('📊 Obteniendo datos de overview para admin dashboard');

    // Obtener fecha actual y hace 30 días
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Obtener estadísticas en paralelo para mejor rendimiento
    const [
      totalClients,
      totalProviders,
      totalBusinesses,
      clientsThisMonth,
      providersThisMonth,
      businessesThisMonth,
      totalAppointments,
      appointmentsThisMonth,
      appointmentsByStatus
    ] = await Promise.all([
      // Total de clientes
      User.countDocuments({ role: 'client', isDeleted: { $ne: true } }),
      
      // Total de proveedores
      User.countDocuments({ 
        role: 'provider', 
        isDeleted: { $ne: true },
        'subscription.expirationDate': { $gte: now } // Suscripción activa
      }),
      
      // Total de comercios aprobados
      Business.countDocuments({ 
        approved: true, 
        status: 'active',
        isDeleted: { $ne: true }
      }),
      
      // Clientes registrados este mes
      User.countDocuments({ 
        role: 'client', 
        createdAt: { $gte: firstDayOfMonth },
        isDeleted: { $ne: true }
      }),
      
      // Proveedores registrados este mes
      User.countDocuments({ 
        role: 'provider', 
        createdAt: { $gte: firstDayOfMonth },
        isDeleted: { $ne: true }
      }),
      
      // Comercios aprobados este mes
      Business.countDocuments({ 
        approved: true,
        approvedAt: { $gte: firstDayOfMonth },
        status: 'active',
        isDeleted: { $ne: true }
      }),
      
      // Total de citas
      Appointment.countDocuments({}),
      
      // Citas este mes
      Appointment.countDocuments({
        createdAt: { $gte: firstDayOfMonth }
      }),
      
      // Citas por estado
      Appointment.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ])
    ]);

    // Calcular ingresos mensuales (suscripciones de proveedores)
    const providersWithSubscription = await User.countDocuments({ 
      role: 'provider', 
      isDeleted: { $ne: true },
      'subscription.expirationDate': { $gte: now },
      paused: { $ne: true } // No contar proveedores pausados
    });

    const monthlyRevenue = providersWithSubscription * 100; // $100 por proveedor/mes

    // Obtener servicios populares (top 5)
    const popularServices = await Appointment.aggregate([
      {
        $match: {
          status: { $nin: ['cancelada'] }
        }
      },
      {
        $group: {
          _id: "$serviceName",
          count: { $sum: 1 },
          totalRevenue: { $sum: "$servicePrice" }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Obtener tendencia de citas últimos 6 meses
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrend = await Appointment.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 },
          revenue: { $sum: "$servicePrice" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 6 }
    ]);

    // Formatear datos para el frontend
    const formattedMonthlyTrend = monthlyTrend.map(item => {
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      return {
        month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
        count: item.count,
        revenue: item.revenue || 0
      };
    });

    // Convertir appointmentsByStatus a objeto
    const statusCounts = {
      pendiente: 0,
      confirmada: 0,
      cancelada: 0,
      completada: 0,
      reprogramada: 0
    };

    appointmentsByStatus.forEach(stat => {
      const status = stat._id.toLowerCase();
      if (statusCounts.hasOwnProperty(status)) {
        statusCounts[status] = stat.count;
      }
    });

    // Formatear servicios populares
    const formattedServices = popularServices.map(service => ({
      name: service._id || 'Servicio no especificado',
      appointments: service.count,
      revenue: service.totalRevenue || 0
    }));

    console.log('✅ Datos de overview obtenidos exitosamente');

    res.json({
      success: true,
      data: {
        // Estadísticas principales
        stats: {
          totalClients,
          totalProviders,
          totalBusinesses,
          clientsThisMonth,
          providersThisMonth,
          businessesThisMonth,
          totalAppointments,
          appointmentsThisMonth,
          monthlyRevenue
        },
        // Datos para gráficos
        charts: {
          appointmentsByStatus: statusCounts,
          popularServices: formattedServices,
          monthlyTrend: formattedMonthlyTrend
        },
        // Metadatos
        metadata: {
          lastUpdated: new Date(),
          month: now.toLocaleString('es-ES', { month: 'long', year: 'numeric' }),
          currency: 'USD'
        }
      }
    });

  } catch (error) {
    console.error('❌ Error obteniendo datos de overview:', error);
    res.status(500).json({
      success: false,
      message: "Error del servidor al obtener datos del dashboard",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ======================================================
// 📅 OBTENER DATOS DE CITAS PARA REPORTES
// ======================================================
export const getAppointmentsReportData = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Acceso denegado"
      });
    }

    console.log('📅 Obteniendo datos de citas para reportes');

    const { period = 'month' } = req.query;
    let startDate, endDate;

    const now = new Date();
    
    // Definir periodo según parámetro
    switch (period) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    endDate = new Date(now);

    // 1. Distribución de citas por estado
    const appointmentsDistribution = await Appointment.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalRevenue: { $sum: "$servicePrice" }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // 2. Tendencia mensual de citas (últimos 12 meses)
    const twelveMonthsAgo = new Date(now);
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);

    const monthlyAppointmentsTrend = await Appointment.aggregate([
      {
        $match: {
          date: { $gte: twelveMonthsAgo, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" }
          },
          count: { $sum: 1 },
          revenue: { $sum: "$servicePrice" },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completada"] }, 1, 0] }
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ["$status", "cancelada"] }, 1, 0] }
          }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // 3. Citas por día de la semana
    const appointmentsByDay = await Appointment.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $addFields: {
          dayOfWeek: { $dayOfWeek: "$date" }
        }
      },
      {
        $group: {
          _id: "$dayOfWeek",
          count: { $sum: 1 },
          revenue: { $sum: "$servicePrice" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // 4. Top proveedores por citas
    const topProviders = await Appointment.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
          providerId: { $ne: null }
        }
      },
      {
        $group: {
          _id: "$providerId",
          count: { $sum: 1 },
          revenue: { $sum: "$servicePrice" },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completada"] }, 1, 0] }
          }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "provider"
        }
      },
      {
        $unwind: "$provider"
      },
      {
        $project: {
          _id: 1,
          count: 1,
          revenue: 1,
          completed: 1,
          providerName: "$provider.name",
          providerEmail: "$provider.email"
        }
      }
    ]);

    // Formatear datos para el frontend
    const formattedDistribution = appointmentsDistribution.map(item => ({
      status: item._id,
      count: item.count,
      revenue: item.totalRevenue || 0
    }));

    const formattedTrend = monthlyAppointmentsTrend.map(item => {
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      return {
        month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
        total: item.count,
        completed: item.completed,
        cancelled: item.cancelled,
        revenue: item.revenue || 0
      };
    });

    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const formattedByDay = appointmentsByDay.map(item => ({
      day: dayNames[item._id - 1] || `Día ${item._id}`,
      count: item.count,
      revenue: item.revenue || 0
    }));

    console.log('✅ Datos de citas obtenidos exitosamente');

    res.json({
      success: true,
      data: {
        distribution: formattedDistribution,
        trend: formattedTrend,
        byDay: formattedByDay,
        topProviders,
        period: {
          start: startDate,
          end: endDate,
          type: period
        }
      }
    });

  } catch (error) {
    console.error('❌ Error obteniendo datos de citas:', error);
    res.status(500).json({
      success: false,
      message: "Error del servidor al obtener datos de citas",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ======================================================
// 🏢 OBTENER DATOS DE COMERCIOS PARA REPORTES
// ======================================================
export const getBusinessesReportData = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Acceso denegado"
      });
    }

    console.log('🏢 Obteniendo datos de comercios para reportes');

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // 1. Total de proveedores y comercios
    const totalProviders = await User.countDocuments({ 
      role: 'provider', 
      isDeleted: { $ne: true }
    });

    const totalBusinesses = await Business.countDocuments({ 
      isDeleted: { $ne: true }
    });

    // 2. Proveedores activos (con suscripción vigente)
    const activeProviders = await User.countDocuments({ 
      role: 'provider', 
      isDeleted: { $ne: true },
      'subscription.expirationDate': { $gte: now },
      paused: { $ne: true }
    });

    // 3. Proveedores registrados este mes
    const newProvidersThisMonth = await User.countDocuments({ 
      role: 'provider', 
      createdAt: { $gte: firstDayOfMonth },
      isDeleted: { $ne: true }
    });

    // 4. Comercios aprobados este mes
    const newBusinessesThisMonth = await Business.countDocuments({ 
      approved: true,
      approvedAt: { $gte: firstDayOfMonth },
      status: 'active',
      isDeleted: { $ne: true }
    });

    // 5. Distribución de comercios por categoría
    const businessesByCategory = await Business.aggregate([
      {
        $match: {
          isDeleted: { $ne: true },
          status: 'active'
        }
      },
      {
        $unwind: "$categories"
      },
      {
        $group: {
          _id: "$categories",
          count: { $sum: 1 },
          totalViews: { $sum: "$views" },
          averageRating: { $avg: "$rating" }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // 6. Top comercios por vistas
    const topBusinessesByViews = await Business.find({ 
      isDeleted: { $ne: true },
      status: 'active'
    })
    .select('name category views rating totalAppointments totalRevenue image')
    .sort({ views: -1 })
    .limit(10)
    .lean();

    // 7. Comercios pendientes de aprobación
    const pendingBusinesses = await Business.countDocuments({ 
      approved: false,
      isDeleted: { $ne: true }
    });

    // 8. Comercios destacados
    const featuredBusinesses = await Business.countDocuments({ 
      featured: true,
      isDeleted: { $ne: true },
      status: 'active'
    });

    console.log('✅ Datos de comercios obtenidos exitosamente');

    res.json({
      success: true,
      data: {
        summary: {
          totalProviders,
          totalBusinesses,
          activeProviders,
          newProvidersThisMonth,
          newBusinessesThisMonth,
          pendingBusinesses,
          featuredBusinesses
        },
        byCategory: businessesByCategory,
        topBusinesses: topBusinessesByViews.map(business => ({
          ...business,
          image: business.image || getDefaultBusinessImage(business.category)
        })),
        metadata: {
          lastUpdated: new Date(),
          activeSubscriptionPrice: 100 // $100 por mes
        }
      }
    });

  } catch (error) {
    console.error('❌ Error obteniendo datos de comercios:', error);
    res.status(500).json({
      success: false,
      message: "Error del servidor al obtener datos de comercios",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ======================================================
// 💰 OBTENER DATOS DE INGRESOS PARA REPORTES
// ======================================================
export const getRevenueReportData = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Acceso denegado"
      });
    }

    console.log('💰 Obteniendo datos de ingresos para reportes');

    const now = new Date();
    const currentYear = now.getFullYear();
    const firstDayOfYear = new Date(currentYear, 0, 1);

    // 1. Ingresos por suscripciones (últimos 12 meses)
    const monthlySubscriptionRevenue = await getMonthlySubscriptionRevenue();

    // 2. Ingresos por citas (últimos 12 meses)
    const monthlyAppointmentRevenue = await Appointment.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(currentYear - 1, 0, 1) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          revenue: { $sum: "$servicePrice" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 12 }
    ]);

    // 3. Ingresos totales este año
    const yearlyRevenue = await Appointment.aggregate([
      {
        $match: {
          createdAt: { $gte: firstDayOfYear },
          status: { $nin: ['cancelada'] }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$servicePrice" },
          totalAppointments: { $sum: 1 }
        }
      }
    ]);

    // 4. Ingresos por categoría de servicio
    const revenueByServiceCategory = await Appointment.aggregate([
      {
        $match: {
          createdAt: { $gte: firstDayOfYear },
          status: { $nin: ['cancelada'] }
        }
      },
      {
        $group: {
          _id: "$serviceName",
          revenue: { $sum: "$servicePrice" },
          count: { $sum: 1 }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 }
    ]);

    // 5. Top proveedores por ingresos generados
    const topProvidersByRevenue = await Appointment.aggregate([
      {
        $match: {
          createdAt: { $gte: firstDayOfYear },
          status: { $nin: ['cancelada'] },
          providerId: { $ne: null }
        }
      },
      {
        $group: {
          _id: "$providerId",
          revenue: { $sum: "$servicePrice" },
          appointments: { $sum: 1 }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "provider"
        }
      },
      {
        $unwind: "$provider"
      },
      {
        $project: {
          _id: 1,
          revenue: 1,
          appointments: 1,
          providerName: "$provider.name",
          providerEmail: "$provider.email"
        }
      }
    ]);

    // 6. Métricas de crecimiento
    const lastYear = currentYear - 1;
    const lastYearRevenue = await Appointment.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(lastYear, 0, 1),
            $lt: new Date(currentYear, 0, 1)
          },
          status: { $nin: ['cancelada'] }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$servicePrice" }
        }
      }
    ]);

    const currentYearRevenue = yearlyRevenue[0]?.totalRevenue || 0;
    const previousYearRevenue = lastYearRevenue[0]?.totalRevenue || 0;
    const growthRate = previousYearRevenue > 0 
      ? ((currentYearRevenue - previousYearRevenue) / previousYearRevenue) * 100 
      : 100;

    // Combinar ingresos de suscripciones y citas
    const combinedMonthlyRevenue = combineMonthlyRevenue(
      monthlySubscriptionRevenue,
      monthlyAppointmentRevenue
    );

    console.log('✅ Datos de ingresos obtenidos exitosamente');

    res.json({
      success: true,
      data: {
        monthlyRevenue: combinedMonthlyRevenue,
        yearlySummary: {
          currentYear: {
            revenue: currentYearRevenue,
            appointments: yearlyRevenue[0]?.totalAppointments || 0
          },
          previousYear: {
            revenue: previousYearRevenue
          },
          growthRate: parseFloat(growthRate.toFixed(2))
        },
        byService: revenueByServiceCategory,
        topProviders: topProvidersByRevenue,
        subscriptionMetrics: {
          activeSubscriptions: monthlySubscriptionRevenue[monthlySubscriptionRevenue.length - 1]?.activeSubscriptions || 0,
          monthlyRevenuePerProvider: 100,
          totalMonthlyRevenue: (monthlySubscriptionRevenue[monthlySubscriptionRevenue.length - 1]?.activeSubscriptions || 0) * 100
        }
      }
    });

  } catch (error) {
    console.error('❌ Error obteniendo datos de ingresos:', error);
    res.status(500).json({
      success: false,
      message: "Error del servidor al obtener datos de ingresos",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ======================================================
// 📄 GENERAR REPORTE PDF DE INGRESOS
// ======================================================
export const generateRevenuePDF = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Acceso denegado"
      });
    }

    console.log('📄 Generando reporte PDF de ingresos');

    const { month, year } = req.query;
    const targetMonth = month ? parseInt(month) : new Date().getMonth() + 1;
    const targetYear = year ? parseInt(year) : new Date().getFullYear();

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    // 1. Obtener ingresos del mes especificado
    const monthlyRevenue = await Appointment.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $nin: ['cancelada'] }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$servicePrice" },
          totalAppointments: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completada"] }, 1, 0] }
          }
        }
      }
    ]);

    // 2. Ingresos por suscripción del mes
    const activeProviders = await User.countDocuments({
      role: 'provider',
      isDeleted: { $ne: true },
      'subscription.expirationDate': { $gte: endDate },
      paused: { $ne: true }
    });

    const subscriptionRevenue = activeProviders * 100;

    // 3. Ingresos por día del mes
    const dailyRevenue = await Appointment.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $nin: ['cancelada'] }
        }
      },
      {
        $group: {
          _id: { $dayOfMonth: "$createdAt" },
          revenue: { $sum: "$servicePrice" },
          appointments: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // 4. Top servicios del mes
    const topServices = await Appointment.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $nin: ['cancelada'] }
        }
      },
      {
        $group: {
          _id: "$serviceName",
          revenue: { $sum: "$servicePrice" },
          appointments: { $sum: 1 }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 }
    ]);

    // 5. Top proveedores del mes
    const topProviders = await Appointment.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $nin: ['cancelada'] },
          providerId: { $ne: null }
        }
      },
      {
        $group: {
          _id: "$providerId",
          revenue: { $sum: "$servicePrice" },
          appointments: { $sum: 1 }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "provider"
        }
      },
      {
        $unwind: "$provider"
      },
      {
        $project: {
          _id: 1,
          revenue: 1,
          appointments: 1,
          providerName: "$provider.name"
        }
      }
    ]);

    const totalRevenue = (monthlyRevenue[0]?.totalRevenue || 0) + subscriptionRevenue;
    const totalAppointments = monthlyRevenue[0]?.totalAppointments || 0;

    // Preparar datos para el PDF
    const reportData = {
      month: getMonthName(targetMonth),
      year: targetYear,
      summary: {
        totalRevenue,
        appointmentRevenue: monthlyRevenue[0]?.totalRevenue || 0,
        subscriptionRevenue,
        totalAppointments,
        completedAppointments: monthlyRevenue[0]?.completed || 0,
        activeProviders
      },
      dailyRevenue,
      topServices,
      topProviders,
      generatedAt: new Date(),
      generatedBy: req.user.name || 'Administrador'
    };

    console.log('✅ Datos para PDF obtenidos exitosamente');

    // En una implementación real, aquí generarías el PDF con una librería como pdfkit
    // Por ahora devolvemos los datos para que el frontend pueda generar el PDF
    res.json({
      success: true,
      message: "Datos listos para generar PDF",
      data: reportData,
      downloadUrl: `/api/admin/reports/revenue-pdf/download?month=${targetMonth}&year=${targetYear}`
    });

  } catch (error) {
    console.error('❌ Error generando reporte PDF:', error);
    res.status(500).json({
      success: false,
      message: "Error del servidor al generar reporte PDF",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ======================================================
// 🔧 FUNCIONES AUXILIARES
// ======================================================

// Función para obtener ingresos mensuales por suscripciones
async function getMonthlySubscriptionRevenue() {
  const now = new Date();
  const twelveMonthsAgo = new Date(now);
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
  twelveMonthsAgo.setDate(1);

  const monthlyData = [];
  
  for (let i = 0; i < 12; i++) {
    const monthStart = new Date(twelveMonthsAgo);
    monthStart.setMonth(twelveMonthsAgo.getMonth() + i);
    
    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1);
    monthEnd.setDate(0);
    monthEnd.setHours(23, 59, 59);

    // Contar proveedores activos en ese mes
    const activeProviders = await User.countDocuments({
      role: 'provider',
      isDeleted: { $ne: true },
      'subscription.expirationDate': { $gte: monthEnd },
      paused: { $ne: true }
    });

    monthlyData.push({
      month: monthStart.getMonth() + 1,
      year: monthStart.getFullYear(),
      activeSubscriptions: activeProviders,
      revenue: activeProviders * 100
    });
  }

  return monthlyData;
}

// Función para combinar ingresos de suscripciones y citas
function combineMonthlyRevenue(subscriptionData, appointmentData) {
  const combined = [];
  
  subscriptionData.forEach(sub => {
    const appointment = appointmentData.find(
      app => app._id.month === sub.month && app._id.year === sub.year
    );
    
    combined.push({
      month: sub.month,
      year: sub.year,
      monthName: getMonthName(sub.month),
      subscriptionRevenue: sub.revenue,
      appointmentRevenue: appointment?.revenue || 0,
      totalRevenue: sub.revenue + (appointment?.revenue || 0),
      appointments: appointment?.count || 0,
      activeSubscriptions: sub.activeSubscriptions
    });
  });

  return combined;
}

// Función para obtener nombre del mes
function getMonthName(monthNumber) {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  return months[monthNumber - 1] || '';
}

// Función auxiliar para imagen por defecto
function getDefaultBusinessImage(category) {
  const images = {
    'Veterinaria': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTNmOGZkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzEwYjk4MSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPjxpPnN0ZXRob3Njb3BlPC9pPjwvdGV4dD48L3N2Zz4=',
    'Peluquería': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBlZGZhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzhiNmJmNSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPjxpPnNjaXNzb3JzPC9pPjwvdGV4dD48L3N2Zz4=',
    'Guardería': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmOGUzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iI2Y1OTkyNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPjxpPmhvdXNlPC9pPjwvdGV4dD48L3N2Zz4=',
    'default': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmZGY1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzY2NjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlbiA6KDwvdGV4dD48L3N2Zz4='
  };
  
  return images[category] || images.default;
}

// ======================================================
// 📊 EXPORTACIONES
// ======================================================
export default {
  getOverviewData,
  getAppointmentsReportData,
  getBusinessesReportData,
  getRevenueReportData,
  generateRevenuePDF
};