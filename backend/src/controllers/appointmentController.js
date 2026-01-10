// controllers/appointmentController.js
import Appointment from "../models/Appointment.js";
import Pet from "../models/Pet.js";
import Service from "../models/Service.js";
import Business from "../models/Business.js";
import { 
  notifyAppointmentCreated, 
  notifyAppointmentCancelled,
  notifyAppointmentRescheduled 
} from "./notificationsController.js";

// ======================================================
// 📌 Crear cita (VERSIÓN ACTUALIZADA CON NOTIFICACIONES)
// ======================================================
export const createAppointment = async (req, res) => {
  console.log('🔔 Petición POST /appointments recibida');
  console.log('📦 Body completo:', JSON.stringify(req.body, null, 2));
  console.log('👤 Usuario autenticado ID:', req.user?._id);
  
  try {
    const { 
      petId, 
      serviceId, 
      providerId,
      businessId,
      date, 
      time,
      notes,
      serviceName,
      servicePrice,
      serviceDuration,
      businessName,
      businessAddress,
      businessPhone
    } = req.body;

    // Validación de campos obligatorios
    const requiredFields = ['petId', 'serviceId', 'date', 'time'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: `Campos obligatorios faltantes: ${missingFields.join(', ')}` 
      });
    }

    // 1. Verificar mascota pertenece al usuario
    const pet = await Pet.findOne({ _id: petId, owner: req.user._id });
    if (!pet) {
      console.log('❌ Mascota no encontrada o no pertenece al usuario');
      return res.status(404).json({ 
        success: false,
        message: "Mascota no encontrada" 
      });
    }
    console.log('✅ Mascota verificada:', pet.name);

    // 2. Verificar servicio (puede venir de diferentes fuentes)
    let service = null;
    let business = null;
    
    // Intentar obtener el servicio de la BD
    try {
      service = await Service.findById(serviceId);
      if (service) {
        console.log('✅ Servicio encontrado en BD:', service.name);
        
        // Si hay businessId, obtener info del negocio
        if (service.businessId || businessId) {
          const bizId = businessId || service.businessId;
          business = await Business.findById(bizId).select('name address phone');
          if (business) {
            console.log('✅ Negocio encontrado:', business.name);
          }
        }
      }
    } catch (error) {
      console.log('ℹ️ Servicio no encontrado en BD, usando datos del frontend');
      // Si no existe en BD, usar datos del frontend
      service = {
        _id: serviceId,
        name: serviceName || 'Servicio personalizado',
        price: servicePrice || 0,
        duration: serviceDuration || 60,
        providerId: providerId || null,
        businessId: businessId || null
      };
    }

    // 3. Validar que no haya conflicto de horario
    const existingAppointment = await Appointment.findOne({
      userId: req.user._id,
      date,
      time,
      status: { $nin: ['cancelada', 'completada'] }
    });

    if (existingAppointment) {
      console.log('❌ Conflicto de horario - Ya existe una cita en:', date, time);
      return res.status(400).json({ 
        success: false,
        message: "Ya tienes una cita agendada para ese horario" 
      });
    }

    // 4. Preparar datos para crear la cita
    const appointmentData = {
      userId: req.user._id,
      petId,
      serviceId,
      providerId: providerId || service?.providerId || null,
      businessId: businessId || service?.businessId || null,
      date,
      time,
      notes: notes || '',
      
      // Información del servicio
      serviceName: serviceName || service?.name || 'Servicio',
      servicePrice: servicePrice || service?.price || 0,
      serviceDuration: serviceDuration || service?.duration || 60,
      
      // Información del negocio
      businessName: businessName || business?.name || '',
      businessAddress: businessAddress || business?.address || '',
      businessPhone: businessPhone || business?.phone || '',
      
      // Estado
      status: "pendiente",
      createdAt: new Date()
    };

    console.log('📝 Creando cita con datos:', appointmentData);
    
    // 5. Crear la cita
    const appointment = await Appointment.create(appointmentData);

    console.log('✅ Cita creada exitosamente. ID:', appointment._id);
    
    // 6. 🔔 CREAR NOTIFICACIÓN PARA EL PROVEEDOR
    if (appointment.providerId) {
      console.log(`📨 Creando notificación para proveedor: ${appointment.providerId}`);
      await notifyAppointmentCreated(appointment);
      console.log('✅ Notificación creada exitosamente');
    } else {
      console.log('ℹ️ No hay proveedor asignado, omitiendo notificación');
    }

    // 7. Respuesta exitosa
    res.status(201).json({
      success: true,
      message: "✅ Cita creada exitosamente",
      appointment: {
        _id: appointment._id,
        date: appointment.date,
        time: appointment.time,
        status: appointment.status,
        serviceName: appointment.serviceName,
        servicePrice: appointment.servicePrice,
        serviceDuration: appointment.serviceDuration,
        businessName: appointment.businessName,
        businessAddress: appointment.businessAddress,
        businessPhone: appointment.businessPhone,
        notes: appointment.notes,
        createdAt: appointment.createdAt
      }
    });

  } catch (err) {
    console.error("❌ Error detallado en createAppointment:", err);
    console.error("Stack trace:", err.stack);
    
    // Manejo de errores específicos
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
    
    // Error general del servidor
    res.status(500).json({ 
      success: false,
      message: "Error interno del servidor al crear la cita",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// ======================================================
// 📌 Obtener citas del usuario (ACTUALIZADO)
// ======================================================
export const getAppointmentsByUser = async (req, res) => {
  console.log('🔔 Petición GET /appointments/user/me recibida');
  console.log('👤 Usuario:', req.user._id);
  
  try {
    const appointments = await Appointment.find({ userId: req.user._id })
      .populate("petId", "name type breed")
      .populate("serviceId", "name description price duration providerName")
      .populate("providerId", "name email phone")
      .populate("businessId", "name address phone email")
      .sort({ date: -1, time: -1 }); // Ordenar por fecha y hora más reciente

    // Mapear para tener una estructura consistente
    const mappedAppointments = appointments.map(appt => ({
      _id: appt._id,
      date: appt.date,
      time: appt.time,
      status: appt.status,
      notes: appt.notes,
      serviceName: appt.serviceName,
      servicePrice: appt.servicePrice,
      serviceDuration: appt.serviceDuration,
      businessName: appt.businessName,
      businessAddress: appt.businessAddress,
      businessPhone: appt.businessPhone,
      createdAt: appt.createdAt,
      
      // Relaciones populadas
      pet: appt.petId ? { 
        _id: appt.petId._id, 
        name: appt.petId.name, 
        type: appt.petId.type,
        breed: appt.petId.breed 
      } : null,
      
      service: appt.serviceId ? { 
        _id: appt.serviceId._id, 
        name: appt.serviceId.name, 
        description: appt.serviceId.description, 
        price: appt.serviceId.price,
        duration: appt.serviceId.duration,
        providerName: appt.serviceId.providerName 
      } : null,
      
      provider: appt.providerId ? { 
        _id: appt.providerId._id, 
        name: appt.providerId.name, 
        email: appt.providerId.email,
        phone: appt.providerId.phone 
      } : null,
      
      business: appt.businessId ? { 
        _id: appt.businessId._id, 
        name: appt.businessId.name, 
        address: appt.businessId.address,
        phone: appt.businessId.phone,
        email: appt.businessId.email
      } : null
    }));

    console.log(`✅ ${mappedAppointments.length} citas encontradas para el usuario`);
    
    res.json({
      success: true,
      count: mappedAppointments.length,
      appointments: mappedAppointments
    });

  } catch (err) {
    console.error("❌ Error obteniendo citas:", err);
    res.status(500).json({ 
      success: false,
      message: "Error obteniendo citas" 
    });
  }
};

// ======================================================
// 📌 Obtener cita por ID (ACTUALIZADO)
// ======================================================
export const getAppointmentById = async (req, res) => {
  console.log('🔔 Petición GET /appointments/:id recibida');
  console.log('📌 ID solicitado:', req.params.id);
  console.log('👤 Usuario:', req.user._id);
  
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      userId: req.user._id // Solo el dueño puede ver su cita
    })
      .populate("petId", "name type breed age")
      .populate("serviceId", "name description price duration providerName")
      .populate("providerId", "name email phone")
      .populate("businessId", "name address phone email website");

    if (!appointment) {
      console.log('❌ Cita no encontrada o no autorizada');
      return res.status(404).json({ 
        success: false,
        message: "Cita no encontrada" 
      });
    }

    console.log('✅ Cita encontrada:', appointment._id);
    
    res.json({
      success: true,
      appointment: {
        _id: appointment._id,
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
        createdAt: appointment.createdAt,
        updatedAt: appointment.updatedAt,
        
        pet: appointment.petId ? {
          _id: appointment.petId._id,
          name: appointment.petId.name,
          type: appointment.petId.type,
          breed: appointment.petId.breed,
          age: appointment.petId.age
        } : null,
        
        service: appointment.serviceId ? {
          _id: appointment.serviceId._id,
          name: appointment.serviceId.name,
          description: appointment.serviceId.description,
          price: appointment.serviceId.price,
          duration: appointment.serviceId.duration,
          providerName: appointment.serviceId.providerName
        } : null,
        
        provider: appointment.providerId ? {
          _id: appointment.providerId._id,
          name: appointment.providerId.name,
          email: appointment.providerId.email,
          phone: appointment.providerId.phone
        } : null,
        
        business: appointment.businessId ? {
          _id: appointment.businessId._id,
          name: appointment.businessId.name,
          address: appointment.businessId.address,
          phone: appointment.businessId.phone,
          email: appointment.businessId.email,
          website: appointment.businessId.website
        } : null
      }
    });

  } catch (err) {
    console.error("❌ Error obteniendo cita:", err);
    
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
// 📌 Cancelar cita (ACTUALIZADO CON NOTIFICACIONES)
// ======================================================
export const cancelAppointment = async (req, res) => {
  console.log('🔔 Petición PATCH /appointments/:id/cancel recibida');
  console.log('📌 ID cita a cancelar:', req.params.id);
  console.log('👤 Usuario:', req.user._id);
  
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!appointment) {
      console.log('❌ Cita no encontrada o no autorizada');
      return res.status(404).json({ 
        success: false,
        message: "Cita no encontrada" 
      });
    }

    // Verificar si ya está cancelada
    if (appointment.status === 'cancelada') {
      return res.status(400).json({ 
        success: false,
        message: "La cita ya está cancelada" 
      });
    }

    // Verificar si ya pasó la fecha
    const appointmentDate = new Date(appointment.date);
    const today = new Date();
    if (appointmentDate < today) {
      return res.status(400).json({ 
        success: false,
        message: "No se puede cancelar una cita pasada" 
      });
    }

    // Cancelar la cita
    appointment.status = "cancelada";
    appointment.cancelledAt = new Date();
    appointment.cancelledBy = req.user._id;
    await appointment.save();

    console.log('✅ Cita cancelada exitosamente:', appointment._id);
    
    // 🔔 CREAR NOTIFICACIÓN DE CANCELACIÓN
    if (appointment.providerId) {
      console.log(`📨 Creando notificación de cancelación para proveedor: ${appointment.providerId}`);
      await notifyAppointmentCancelled(appointment, req.user._id, 'Cancelada por el cliente');
      console.log('✅ Notificación de cancelación creada');
    }

    res.json({
      success: true,
      message: "✅ Cita cancelada correctamente",
      appointment: {
        _id: appointment._id,
        status: appointment.status,
        cancelledAt: appointment.cancelledAt
      }
    });

  } catch (err) {
    console.error("❌ Error cancelando cita:", err);
    res.status(500).json({ 
      success: false,
      message: "Error del servidor al cancelar la cita" 
    });
  }
};

// ======================================================
// 📌 Reprogramar cita (ACTUALIZADO CON NOTIFICACIONES)
// ======================================================
export const rescheduleAppointment = async (req, res) => {
  console.log('🔔 Petición PATCH /appointments/:id/reschedule recibida');
  console.log('📌 ID cita a reprogramar:', req.params.id);
  console.log('📦 Nuevos datos:', req.body);
  console.log('👤 Usuario:', req.user._id);
  
  try {
    const { date, time, reason } = req.body;

    if (!date || !time) {
      return res.status(400).json({ 
        success: false,
        message: "Fecha y hora son obligatorios para reprogramar" 
      });
    }

    // Buscar la cita
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

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

    // Verificar nuevo horario no conflictivo
    const existingAppointment = await Appointment.findOne({
      userId: req.user._id,
      date,
      time,
      _id: { $ne: req.params.id }, // Excluir la cita actual
      status: { $nin: ['cancelada', 'completada'] }
    });

    if (existingAppointment) {
      return res.status(400).json({ 
        success: false,
        message: "Ya tienes otra cita en ese horario" 
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
    appointment.rescheduledBy = req.user._id;
    appointment.rescheduleReason = reason || '';
    appointment.previousDate = previousDate;
    appointment.previousTime = previousTime;
    
    await appointment.save();

    console.log('✅ Cita reprogramada exitosamente:', appointment._id);
    
    // 🔔 CREAR NOTIFICACIÓN DE REPROGRAMACIÓN
    if (appointment.providerId) {
      console.log(`📨 Creando notificación de reprogramación para proveedor: ${appointment.providerId}`);
      await notifyAppointmentRescheduled(appointment, req.user._id, previousDate, previousTime, reason);
      console.log('✅ Notificación de reprogramación creada');
    }
    
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
// 📌 Obtener estadísticas de citas (NUEVO)
// ======================================================
export const getAppointmentStats = async (req, res) => {
  console.log('🔔 Petición GET /appointments/stats recibida');
  console.log('👤 Usuario:', req.user._id);
  
  try {
    const stats = await Appointment.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$servicePrice" }
        }
      }
    ]);

    const totalAppointments = await Appointment.countDocuments({ userId: req.user._id });
    const upcomingAppointments = await Appointment.countDocuments({
      userId: req.user._id,
      status: { $in: ['pendiente', 'confirmada'] },
      date: { $gte: new Date().toISOString().split('T')[0] }
    });

    res.json({
      success: true,
      stats: {
        total: totalAppointments,
        upcoming: upcomingAppointments,
        byStatus: stats.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        totalSpent: stats.reduce((acc, curr) => acc + curr.totalAmount, 0)
      }
    });

  } catch (err) {
    console.error("❌ Error obteniendo estadísticas:", err);
    res.status(500).json({ 
      success: false,
      message: "Error obteniendo estadísticas" 
    });
  }
};

// ======================================================
// 📌 Actualizar estado de cita (CLIENTE)
// ======================================================
export const updateAppointmentStatus = async (req, res) => {
  console.log('🔔 Petición PUT /appointments/:id/status recibida');
  console.log('📌 Cita ID:', req.params.id);
  console.log('📦 Estado:', req.body.status);
  console.log('👤 Usuario:', req.user._id);
  
  try {
    const { id } = req.params;
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
    const appointment = await Appointment.findOne({
      _id: id,
      userId: req.user._id
    });

    if (!appointment) {
      return res.status(404).json({ 
        success: false,
        message: "Cita no encontrada" 
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

    // Guardar estado anterior para historial
    const previousStatus = appointment.status;
    
    // Actualizar estado
    appointment.status = status;
    appointment.updatedAt = new Date();
    
    // Agregar timestamp según el estado
    if (status === 'cancelada') {
      appointment.cancelledAt = new Date();
      appointment.cancelledBy = req.user._id;
    } else if (status === 'completada') {
      appointment.completedAt = new Date();
    } else if (status === 'reprogramada') {
      appointment.rescheduledAt = new Date();
      appointment.rescheduledBy = req.user._id;
    }
    
    // Guardar historial de cambios de estado
    if (!appointment.statusHistory) {
      appointment.statusHistory = [];
    }
    
    appointment.statusHistory.push({
      from: previousStatus,
      to: status,
      changedAt: new Date(),
      changedBy: req.user._id,
      changedByRole: 'client'
    });
    
    await appointment.save();

    console.log('✅ Estado de cita actualizado por cliente:', appointment._id, `${previousStatus} → ${status}`);
    
    // 🔔 NOTIFICAR AL PROVEEDOR SOBRE EL CAMBIO DE ESTADO
    if (appointment.providerId) {
      console.log(`📨 Notificando cambio de estado a proveedor: ${appointment.providerId}`);
      
      // Importar dinámicamente para evitar dependencia circular
      const { createNotification } = await import('./notificationsController.js');
      
      const message = `El cliente ha cambiado el estado de la cita del ${appointment.date} a las ${appointment.time} de ${previousStatus} a ${status}`;
      
      await createNotification({
        providerId: appointment.providerId,
        type: "appointment_updated",
        title: "✏️ Estado de cita actualizado",
        message: message,
        appointmentId: appointment._id,
        userId: req.user._id,
        metadata: {
          appointmentDate: appointment.date,
          appointmentTime: appointment.time,
          serviceName: appointment.serviceName,
          previousStatus,
          newStatus: status,
          changedAt: new Date()
        }
      });
      
      console.log('✅ Notificación de cambio de estado creada');
    }
    
    res.json({
      success: true,
      message: `✅ Cita ${status} correctamente`,
      appointment: {
        _id: appointment._id,
        status: appointment.status,
        previousStatus,
        updatedAt: appointment.updatedAt,
        statusHistory: appointment.statusHistory
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
      message: "Error del servidor al actualizar estado",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// ======================================================
// 📌 Función para actualizar estado y notificar
// ======================================================
const updateStatusAndNotify = async (appointmentId, status, userId, reason = '') => {
  try {
    const appointment = await Appointment.findById(appointmentId);
    
    if (!appointment) {
      throw new Error('Cita no encontrada');
    }
    
    const previousStatus = appointment.status;
    
    // Actualizar estado
    appointment.status = status;
    appointment.updatedAt = new Date();
    
    if (status === 'cancelada') {
      appointment.cancelledAt = new Date();
      appointment.cancelledBy = userId;
      appointment.cancellationReason = reason;
    } else if (status === 'completada') {
      appointment.completedAt = new Date();
    } else if (status === 'reprogramada') {
      appointment.rescheduledAt = new Date();
      appointment.rescheduledBy = userId;
    }
    
    // Guardar historial
    if (!appointment.statusHistory) {
      appointment.statusHistory = [];
    }
    
    appointment.statusHistory.push({
      from: previousStatus,
      to: status,
      changedAt: new Date(),
      changedBy: userId,
      changedByRole: 'system',
      reason: reason
    });
    
    await appointment.save();
    
    // Notificar al proveedor si hay cambio de estado
    if (appointment.providerId && previousStatus !== status) {
      // Importar dinámicamente
      const { createNotification } = await import('./notificationsController.js');
      
      const user = await import("../models/User.js")
        .then(mod => mod.default)
        .then(User => User.findById(userId).select('name role'));
      
      const message = `El estado de la cita del ${appointment.date} a las ${appointment.time} ha cambiado de ${previousStatus} a ${status}`;
      
      await createNotification({
        providerId: appointment.providerId,
        type: "appointment_updated",
        title: `📊 Estado actualizado: ${status}`,
        message: message,
        appointmentId: appointment._id,
        userId: userId,
        metadata: {
          appointmentDate: appointment.date,
          appointmentTime: appointment.time,
          serviceName: appointment.serviceName,
          previousStatus,
          newStatus: status,
          changedBy: user?.name || 'Sistema',
          changedByRole: user?.role || 'system',
          reason: reason,
          changedAt: new Date()
        }
      });
    }
    
    return appointment;
    
  } catch (error) {
    console.error('❌ Error en updateStatusAndNotify:', error);
    throw error;
  }
};

// ======================================================
// 📌 Función auxiliar para verificar notificaciones
// ======================================================
export const checkNotificationsForProvider = async (providerId) => {
  try {
    const Notification = await import("../models/notifications.js")
      .then(mod => mod.default);
    
    const count = await Notification.countDocuments({
      providerId,
      read: false
    });
    
    console.log(`🔔 Proveedor ${providerId} tiene ${count} notificaciones no leídas`);
    return count;
    
  } catch (error) {
    console.error('❌ Error verificando notificaciones:', error);
    return 0;
  }
};

// Exportar todas las funciones
export default {
  createAppointment,
  getAppointmentsByUser,
  getAppointmentById,
  cancelAppointment,
  rescheduleAppointment,
  getAppointmentStats,
  updateAppointmentStatus,
  updateStatusAndNotify,
  checkNotificationsForProvider
};