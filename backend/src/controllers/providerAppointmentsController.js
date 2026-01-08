// controllers/providerAppointmentsController.js
import Appointment from "../models/Appointment.js";
import User from "../models/User.js";
import Pet from "../models/Pet.js";
import Service from "../models/Service.js";

// ======================================================
// 📌 Obtener todas las citas del proveedor
// ======================================================
export const getProviderAppointments = async (req, res) => {
  console.log('🔔 Petición GET /provider/appointments recibida');
  console.log('👤 Proveedor ID:', req.user?._id);
  console.log('👤 Role:', req.user?.role);
  
  try {
    // Verificar que el usuario sea proveedor
    if (!req.user || (req.user.role !== 'provider' && req.user.role !== 'admin')) {
      console.log('❌ Usuario no autorizado:', req.user?.role);
      return res.status(403).json({
        success: false,
        message: "Acceso denegado. Solo proveedores pueden ver estas citas"
      });
    }

    console.log('🔍 Buscando citas para proveedor:', req.user._id);
    
    // Construir query de búsqueda - SOLO por providerId para simplificar
    const query = { providerId: req.user._id };
    console.log('📋 Query:', JSON.stringify(query));

    // Obtener datos por separado sin populate complejo
    const appointments = await Appointment.find(query)
      .select('_id userId petId serviceId date time status notes serviceName servicePrice serviceDuration businessName businessAddress businessPhone createdAt updatedAt cancelledAt completedAt rescheduledAt')
      .sort({ date: -1, time: -1 })
      .lean();

    console.log(`✅ ${appointments.length} citas encontradas`);

    // Si no hay citas, retornar array vacío
    if (appointments.length === 0) {
      console.log('📤 No hay citas, enviando array vacío');
      return res.json([]);
    }

    // Obtener IDs únicos para populate
    const userIds = [...new Set(appointments.map(a => a.userId).filter(id => id))];
    const petIds = [...new Set(appointments.map(a => a.petId).filter(id => id))];
    const serviceIds = [...new Set(appointments.map(a => a.serviceId).filter(id => id))];

    console.log(`👥 ${userIds.length} usuarios, 🐾 ${petIds.length} mascotas, ⚙️ ${serviceIds.length} servicios`);

    // Obtener datos poblados por separado
    const [users, pets, services] = await Promise.all([
      User.find({ _id: { $in: userIds } })
        .select('_id name lastname email phone')
        .lean(),
      Pet.find({ _id: { $in: petIds } })
        .select('_id name type breed age')
        .lean(),
      Service.find({ _id: { $in: serviceIds } })
        .select('_id name description price duration')
        .lean()
    ]);

    // Crear mapas para búsqueda rápida
    const userMap = users.reduce((map, user) => {
      map[user._id.toString()] = user;
      return map;
    }, {});

    const petMap = pets.reduce((map, pet) => {
      map[pet._id.toString()] = pet;
      return map;
    }, {});

    const serviceMap = services.reduce((map, service) => {
      map[service._id.toString()] = service;
      return map;
    }, {});

    // Construir respuesta combinando datos
    const processedAppointments = appointments.map(appt => {
      const appointment = {
        _id: appt._id,
        userId: userMap[appt.userId?.toString()] || { _id: appt.userId },
        petId: petMap[appt.petId?.toString()] || { _id: appt.petId },
        serviceId: serviceMap[appt.serviceId?.toString()] || { _id: appt.serviceId },
        date: appt.date,
        time: appt.time,
        status: appt.status || 'pendiente',
        notes: appt.notes || '',
        serviceName: appt.serviceName || '',
        servicePrice: appt.servicePrice || 0,
        serviceDuration: appt.serviceDuration || 60,
        businessName: appt.businessName || '',
        businessAddress: appt.businessAddress || '',
        businessPhone: appt.businessPhone || '',
        createdAt: appt.createdAt,
        updatedAt: appt.updatedAt
      };

      // Agregar campos opcionales solo si existen
      if (appt.cancelledAt) appointment.cancelledAt = appt.cancelledAt;
      if (appt.completedAt) appointment.completedAt = appt.completedAt;
      if (appt.rescheduledAt) appointment.rescheduledAt = appt.rescheduledAt;

      return appointment;
    });

    console.log('📤 Enviando', processedAppointments.length, 'citas procesadas');
    
    res.json(processedAppointments);

  } catch (err) {
    console.error("❌ Error obteniendo citas del proveedor:", err);
    console.error("❌ Mensaje:", err.message);
    
    res.status(500).json({
      success: false,
      message: "Error del servidor al obtener citas",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// ======================================================
// 📌 Obtener cita específica del proveedor
// ======================================================
export const getProviderAppointmentById = async (req, res) => {
  console.log('🔔 Petición GET /provider/appointments/:id recibida');
  console.log('📌 ID solicitado:', req.params.id);
  console.log('👤 Proveedor ID:', req.user?._id);
  
  try {
    // Verificar que el usuario sea proveedor
    if (!req.user || (req.user.role !== 'provider' && req.user.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: "Acceso denegado"
      });
    }

    // Buscar la cita del proveedor
    const query = { 
      _id: req.params.id,
      providerId: req.user._id 
    };

    const appointment = await Appointment.findOne(query)
      .select('_id userId petId serviceId date time status notes serviceName servicePrice serviceDuration businessName businessAddress businessPhone createdAt updatedAt cancelledAt completedAt rescheduledAt')
      .lean();

    if (!appointment) {
      console.log('❌ Cita no encontrada o no autorizada');
      return res.status(404).json({
        success: false,
        message: "Cita no encontrada"
      });
    }

    // Obtener datos relacionados
    const [user, pet, service] = await Promise.all([
      User.findById(appointment.userId).select('name lastname email phone').lean(),
      Pet.findById(appointment.petId).select('name type breed age').lean(),
      Service.findById(appointment.serviceId).select('name description price duration').lean()
    ]);

    const processedAppointment = {
      _id: appointment._id,
      userId: user ? { ...user, _id: appointment.userId } : { _id: appointment.userId },
      petId: pet ? { ...pet, _id: appointment.petId } : { _id: appointment.petId },
      serviceId: service ? { ...service, _id: appointment.serviceId } : { _id: appointment.serviceId },
      date: appointment.date,
      time: appointment.time,
      status: appointment.status,
      notes: appointment.notes || '',
      serviceName: appointment.serviceName || '',
      servicePrice: appointment.servicePrice || 0,
      serviceDuration: appointment.serviceDuration || 60,
      businessName: appointment.businessName || '',
      businessAddress: appointment.businessAddress || '',
      businessPhone: appointment.businessPhone || '',
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt
    };

    if (appointment.cancelledAt) processedAppointment.cancelledAt = appointment.cancelledAt;
    if (appointment.completedAt) processedAppointment.completedAt = appointment.completedAt;
    if (appointment.rescheduledAt) processedAppointment.rescheduledAt = appointment.rescheduledAt;

    console.log('✅ Cita encontrada:', appointment._id);
    
    res.json({
      success: true,
      appointment: processedAppointment
    });

  } catch (err) {
    console.error("❌ Error obteniendo cita del proveedor:", err);
    
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "ID de cita inválido"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Error del servidor al obtener la cita"
    });
  }
};

// ======================================================
// 📌 Actualizar estado de una cita
// ======================================================
export const updateAppointmentStatus = async (req, res) => {
  console.log('🔔 Petición PUT /provider/appointments/:id recibida');
  console.log('📌 ID cita:', req.params.id);
  console.log('📦 Body:', req.body);
  console.log('👤 Proveedor ID:', req.user?._id);
  
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: "El estado es requerido"
      });
    }

    // Validar estado
    const validStatuses = ['pendiente', 'confirmada', 'cancelada', 'completada', 'reprogramada'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Estado inválido. Debe ser uno de: ${validStatuses.join(', ')}`
      });
    }

    // Buscar la cita
    const query = { 
      _id: req.params.id,
      providerId: req.user._id
    };

    const appointment = await Appointment.findOne(query);

    if (!appointment) {
      console.log('❌ Cita no encontrada o no autorizada');
      return res.status(404).json({
        success: false,
        message: "Cita no encontrada o no tienes permisos"
      });
    }

    // Validar transición de estado
    const validTransitions = {
      'pendiente': ['confirmada', 'cancelada'],
      'confirmada': ['completada', 'cancelada', 'reprogramada'],
      'reprogramada': ['confirmada', 'cancelada', 'completada'],
      'completada': [],
      'cancelada': []
    };

    const currentStatus = appointment.status;
    if (validTransitions[currentStatus] && !validTransitions[currentStatus].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `No se puede cambiar de ${currentStatus} a ${status}`
      });
    }

    // Actualizar estado
    appointment.status = status;
    appointment.updatedAt = new Date();
    
    // Agregar timestamp según el estado
    if (status === 'cancelada') {
      appointment.cancelledAt = new Date();
    } else if (status === 'completada') {
      appointment.completedAt = new Date();
    } else if (status === 'reprogramada') {
      appointment.rescheduledAt = new Date();
    }
    
    await appointment.save();

    console.log('✅ Estado de cita actualizado:', appointment._id);
    
    res.json({
      success: true,
      message: `✅ Cita ${status} correctamente`,
      appointment: {
        _id: appointment._id,
        status: appointment.status,
        updatedAt: appointment.updatedAt
      }
    });

  } catch (err) {
    console.error("❌ Error actualizando estado de cita:", err);
    
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "ID de cita inválido"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Error del servidor al actualizar estado"
    });
  }
};

// ======================================================
// 📌 Crear cita manualmente
// ======================================================
export const createManualAppointment = async (req, res) => {
  console.log('🔔 Petición POST /provider/appointments recibida');
  console.log('📦 Body:', JSON.stringify(req.body, null, 2));
  console.log('👤 Proveedor ID:', req.user?._id);
  
  try {
    const {
      userId,
      petId,
      serviceId,
      date,
      time,
      notes
    } = req.body;

    // Validación de campos obligatorios
    const requiredFields = ['userId', 'petId', 'serviceId', 'date', 'time'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Campos obligatorios faltantes: ${missingFields.join(', ')}`
      });
    }

    // 1. Verificar que el usuario/cliente existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario/cliente no encontrado"
      });
    }

    // 2. Verificar que la mascota existe y pertenece al usuario
    const pet = await Pet.findOne({ _id: petId, owner: userId });
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: "Mascota no encontrada o no pertenece al usuario"
      });
    }

    // 3. Verificar servicio
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Servicio no encontrado"
      });
    }

    // 4. Verificar que el proveedor tiene acceso al servicio
    let hasPermission = false;
    
    // Si el servicio tiene providerId y coincide con el proveedor actual
    if (service.providerId && service.providerId.toString() === req.user._id.toString()) {
      hasPermission = true;
    }
    
    // Si el usuario tiene businesses y el servicio pertenece a uno de ellos
    if (req.user.businesses && Array.isArray(req.user.businesses) && 
        service.businessId && req.user.businesses.includes(service.businessId.toString())) {
      hasPermission = true;
    }
    
    if (!hasPermission && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para crear citas para este servicio"
      });
    }

    // 5. Verificar que no haya conflicto de horario para el usuario
    const existingAppointment = await Appointment.findOne({
      userId,
      date,
      time,
      status: { $nin: ['cancelada', 'completada'] }
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: "El usuario ya tiene una cita en ese horario"
      });
    }

    // 6. Preparar datos para la cita
    const appointmentData = {
      userId,
      petId,
      serviceId,
      providerId: req.user._id,
      businessId: service.businessId || null,
      date,
      time,
      notes: notes || '',
      serviceName: service.name,
      servicePrice: service.price,
      serviceDuration: service.duration,
      businessName: service.businessName || '',
      businessAddress: service.businessAddress || '',
      businessPhone: service.businessPhone || '',
      status: "pendiente",
      createdAt: new Date(),
      createdBy: req.user._id
    };

    // 7. Crear la cita
    const appointment = await Appointment.create(appointmentData);

    // 8. Construir respuesta
    const populatedAppointment = {
      _id: appointment._id,
      userId: {
        _id: user._id,
        name: user.name,
        lastname: user.lastname,
        email: user.email,
        phone: user.phone
      },
      petId: {
        _id: pet._id,
        name: pet.name,
        type: pet.type,
        breed: pet.breed,
        age: pet.age
      },
      serviceId: {
        _id: service._id,
        name: service.name,
        description: service.description,
        price: service.price,
        duration: service.duration
      },
      date: appointment.date,
      time: appointment.time,
      status: appointment.status,
      notes: appointment.notes,
      serviceName: appointment.serviceName,
      servicePrice: appointment.servicePrice,
      serviceDuration: appointment.serviceDuration,
      businessName: appointment.businessName,
      businessAddress: appointment.businessAddress,
      businessPhone: appointment.businessPhone,
      createdAt: appointment.createdAt
    };

    console.log('✅ Cita creada exitosamente por proveedor. ID:', appointment._id);
    
    // 9. Respuesta exitosa
    res.status(201).json({
      success: true,
      message: "✅ Cita creada exitosamente",
      appointment: populatedAppointment
    });

  } catch (err) {
    console.error("❌ Error creando cita manualmente:", err);
    
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: "Error de validación",
        errors: errors
      });
    }
    
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "ID inválido proporcionado",
        field: err.path
      });
    }
    
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Ya existe una cita con estos datos"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Error interno del servidor al crear la cita"
    });
  }
};

// ======================================================
// 📌 Obtener estadísticas del proveedor
// ======================================================
export const getProviderStats = async (req, res) => {
  console.log('🔔 Petición GET /provider/appointments/stats recibida');
  console.log('👤 Proveedor ID:', req.user?._id);
  
  try {
    // Verificar que el usuario sea proveedor
    if (!req.user || (req.user.role !== 'provider' && req.user.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: "Acceso denegado. Solo proveedores pueden ver estas estadísticas"
      });
    }

    // Query para el proveedor
    const query = { providerId: req.user._id };

    // Obtener conteos por estado
    const stats = await Appointment.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$servicePrice" }
        }
      }
    ]);

    // Obtener conteos adicionales
    const totalAppointments = await Appointment.countDocuments(query);

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    const upcomingAppointments = await Appointment.countDocuments({
      ...query,
      status: { $in: ['pendiente', 'confirmada', 'reprogramada'] },
      date: { $gte: todayStr }
    });

    const todayAppointments = await Appointment.countDocuments({
      ...query,
      date: todayStr
    });

    // Obtener ingresos mensuales
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthlyStats = await Appointment.aggregate([
      {
        $match: {
          ...query,
          createdAt: { $gte: startOfMonth },
          status: { $in: ['completada', 'confirmada'] } // Solo citas completadas o confirmadas
        }
      },
      {
        $group: {
          _id: null,
          monthlyCount: { $sum: 1 },
          monthlyRevenue: { $sum: "$servicePrice" }
        }
      }
    ]);

    // Procesar estadísticas
    const statsObject = stats.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    res.json({
      success: true,
      stats: {
        total: totalAppointments,
        upcoming: upcomingAppointments,
        today: todayAppointments,
        byStatus: {
          pendiente: statsObject.pendiente || 0,
          confirmada: statsObject.confirmada || 0,
          cancelada: statsObject.cancelada || 0,
          completada: statsObject.completada || 0,
          reprogramada: statsObject.reprogramada || 0
        },
        totalRevenue: stats.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0),
        monthlyCount: monthlyStats[0]?.monthlyCount || 0,
        monthlyRevenue: monthlyStats[0]?.monthlyRevenue || 0
      }
    });

  } catch (err) {
    console.error("❌ Error obteniendo estadísticas del proveedor:", err);
    res.status(500).json({
      success: false,
      message: "Error obteniendo estadísticas"
    });
  }
};

// ======================================================
// 📌 Reprogramar cita (proveedor)
// ======================================================
export const rescheduleProviderAppointment = async (req, res) => {
  console.log('🔔 Petición PATCH /provider/appointments/:id/reschedule recibida');
  console.log('📌 ID cita a reprogramar:', req.params.id);
  console.log('📦 Nuevos datos:', req.body);
  console.log('👤 Proveedor ID:', req.user?._id);
  
  try {
    const { date, time, reason } = req.body;

    if (!date || !time) {
      return res.status(400).json({
        success: false,
        message: "Fecha y hora son obligatorios para reprogramar"
      });
    }

    // Verificar que el usuario sea proveedor
    if (!req.user || (req.user.role !== 'provider' && req.user.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: "Acceso denegado"
      });
    }

    // Buscar la cita
    const query = { 
      _id: req.params.id,
      providerId: req.user._id 
    };

    const appointment = await Appointment.findOne(query);

    if (!appointment) {
      console.log('❌ Cita no encontrada o no autorizada');
      return res.status(404).json({
        success: false,
        message: "Cita no encontrada"
      });
    }

    // Verificar que no esté cancelada
    if (appointment.status === 'cancelada') {
      return res.status(400).json({
        success: false,
        message: "No se puede reprogramar una cita cancelada"
      });
    }

    // Verificar que no esté completada
    if (appointment.status === 'completada') {
      return res.status(400).json({
        success: false,
        message: "No se puede reprogramar una cita completada"
      });
    }

    // Verificar nuevo horario no conflictivo para el usuario
    const existingAppointment = await Appointment.findOne({
      userId: appointment.userId,
      date,
      time,
      _id: { $ne: req.params.id },
      status: { $nin: ['cancelada', 'completada'] }
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: "El cliente ya tiene otra cita en ese horario"
      });
    }

    // Guardar datos anteriores para historial
    const previousDate = appointment.date;
    const previousTime = appointment.time;
    
    // Actualizar cita
    appointment.date = date;
    appointment.time = time;
    appointment.status = "reprogramada";
    appointment.rescheduledAt = new Date();
    appointment.rescheduleReason = reason || '';
    appointment.previousDate = previousDate;
    appointment.previousTime = previousTime;
    appointment.updatedAt = new Date();
    
    await appointment.save();

    console.log('✅ Cita reprogramada exitosamente:', appointment._id);
    
    res.json({
      success: true,
      message: "✅ Cita reprogramada correctamente",
      appointment: {
        _id: appointment._id,
        date: appointment.date,
        time: appointment.time,
        status: appointment.status,
        previousDate: appointment.previousDate,
        previousTime: appointment.previousTime,
        rescheduledAt: appointment.rescheduledAt
      }
    });

  } catch (err) {
    console.error("❌ Error reprogramando cita:", err);
    res.status(500).json({
      success: false,
      message: "Error del servidor al reprogramar la cita"
    });
  }
};

// ======================================================
// 📌 Versión alternativa que ignora los virtuals problemáticos
// ======================================================
export const getProviderAppointmentsAlt = async (req, res) => {
  console.log('🔔 Petición GET /provider/appointments/alt recibida');
  
  try {
    // Verificar autenticación
    if (!req.user || (req.user.role !== 'provider' && req.user.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: "Acceso denegado"
      });
    }

    // Query simple
    const query = { providerId: req.user._id };
    
    // Usar aggregate para evitar problemas con virtuals
    const appointments = await Appointment.aggregate([
      { $match: query },
      { $sort: { date: -1, time: -1 } },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userData'
        }
      },
      {
        $lookup: {
          from: 'pets',
          localField: 'petId',
          foreignField: '_id',
          as: 'petData'
        }
      },
      {
        $lookup: {
          from: 'services',
          localField: 'serviceId',
          foreignField: '_id',
          as: 'serviceData'
        }
      },
      {
        $project: {
          _id: 1,
          date: 1,
          time: 1,
          status: 1,
          notes: 1,
          serviceName: 1,
          servicePrice: 1,
          serviceDuration: 1,
          businessName: 1,
          businessAddress: 1,
          businessPhone: 1,
          createdAt: 1,
          updatedAt: 1,
          cancelledAt: 1,
          completedAt: 1,
          rescheduledAt: 1,
          userId: { 
            $cond: {
              if: { $gt: [{ $size: "$userData" }, 0] },
              then: { $arrayElemAt: ['$userData', 0] },
              else: { _id: "$userId" }
            }
          },
          petId: { 
            $cond: {
              if: { $gt: [{ $size: "$petData" }, 0] },
              then: { $arrayElemAt: ['$petData', 0] },
              else: { _id: "$petId" }
            }
          },
          serviceId: { 
            $cond: {
              if: { $gt: [{ $size: "$serviceData" }, 0] },
              then: { $arrayElemAt: ['$serviceData', 0] },
              else: { _id: "$serviceId" }
            }
          }
        }
      },
      {
        $project: {
          _id: 1,
          date: 1,
          time: 1,
          status: 1,
          notes: 1,
          serviceName: 1,
          servicePrice: 1,
          serviceDuration: 1,
          businessName: 1,
          businessAddress: 1,
          businessPhone: 1,
          createdAt: 1,
          updatedAt: 1,
          cancelledAt: 1,
          completedAt: 1,
          rescheduledAt: 1,
          'userId._id': 1,
          'userId.name': 1,
          'userId.lastname': 1,
          'userId.email': 1,
          'userId.phone': 1,
          'petId._id': 1,
          'petId.name': 1,
          'petId.type': 1,
          'petId.breed': 1,
          'petId.age': 1,
          'serviceId._id': 1,
          'serviceId.name': 1,
          'serviceId.description': 1,
          'serviceId.price': 1,
          'serviceId.duration': 1
        }
      }
    ]);

    console.log(`✅ ${appointments.length} citas usando aggregate`);

    res.json(appointments);

  } catch (err) {
    console.error("❌ Error en versión alternativa:", err);
    res.status(500).json({
      success: false,
      message: "Error del servidor",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};