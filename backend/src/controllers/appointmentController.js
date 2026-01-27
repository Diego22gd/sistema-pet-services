// controllers/appointmentController.js - VERSIÓN CORREGIDA PARA VENEZUELA
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
// 📌 FUNCIÓN AUXILIAR: Obtener fecha actual en Venezuela
// ======================================================
const getCurrentVenezuelaDate = () => {
  // Venezuela está en UTC-4 (o UTC-4:30 para algunos periodos)
  const now = new Date();
  // Ajustar a UTC-4 (4 horas menos que UTC)
  const venezuelaOffset = -4 * 60; // -4 horas en minutos
  const localTime = now.getTime() + (now.getTimezoneOffset() * 60000);
  const venezuelaTime = new Date(localTime + (venezuelaOffset * 60000));
  return venezuelaTime;
};

// ======================================================
// 📌 FUNCIÓN AUXILIAR: Formatear fecha para Venezuela
// ======================================================
const formatDateForVenezuela = (dateString) => {
  // Si ya está en formato YYYY-MM-DD, devolverlo tal cual
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }
  
  // Si es un objeto Date, convertirlo a YYYY-MM-DD en hora Venezuela
  const date = new Date(dateString);
  const venezuelaDate = new Date(date.getTime() - (4 * 60 * 60 * 1000));
  
  const year = venezuelaDate.getFullYear();
  const month = String(venezuelaDate.getMonth() + 1).padStart(2, '0');
  const day = String(venezuelaDate.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

// ======================================================
// 📌 Crear cita (VERSIÓN COMPLETA CORREGIDA)
// ======================================================
export const createAppointment = async (req, res) => {
  console.log('🔔 Petición POST /appointments recibida');
  console.log('📦 Body completo:', JSON.stringify(req.body, null, 2));
  console.log('👤 Usuario autenticado ID:', req.user?._id);
  console.log('🇻🇪 Ajustando para zona horaria de Venezuela (UTC-4)');
  
  try {
    const { 
      petId, 
      serviceId, 
      providerId,
      businessId,
      date,  // Esto viene como string "YYYY-MM-DD" del frontend
      time,
      notes,
      serviceName,
      servicePrice,
      serviceDuration,
      businessName,
      businessAddress,
      businessPhone
    } = req.body;

    console.log('📅 Fecha recibida del frontend:', date);
    console.log('🕒 Hora recibida del frontend:', time);

    // ============ VALIDACIONES INICIALES ============
    
    // 1. Validar campos obligatorios
    const requiredFields = ['petId', 'serviceId', 'date', 'time'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: `Campos obligatorios faltantes: ${missingFields.join(', ')}` 
      });
    }

    // 2. Validar formato de fecha (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      console.log('❌ Formato de fecha inválido:', date);
      return res.status(400).json({ 
        success: false,
        message: "Formato de fecha inválido. Use YYYY-MM-DD" 
      });
    }

    // 3. Validar formato de hora (HH:MM)
    const timeRegex = /^\d{2}:\d{2}$/;
    if (!timeRegex.test(time)) {
      console.log('❌ Formato de hora inválido:', time);
      return res.status(400).json({ 
        success: false,
        message: "Formato de hora inválido. Use HH:MM" 
      });
    }

    // ============ VALIDACIÓN DE FECHA PARA VENEZUELA ============
    
    // 4. Obtener fecha actual en Venezuela
    const nowVenezuela = getCurrentVenezuelaDate();
    const todayVenezuela = new Date(nowVenezuela);
    todayVenezuela.setHours(0, 0, 0, 0);
    
    // 5. Parsear la fecha seleccionada (en hora Venezuela)
    const [year, month, day] = date.split('-').map(Number);
    
    // IMPORTANTE: Crear la fecha interpretándola como hora Venezuela
    // Esto evita que se convierta a UTC y pierda un día
    const selectedDateVenezuela = new Date(year, month - 1, day, 0, 0, 0);
    
    console.log('🌍 Información de zona horaria:');
    console.log('   Hoy en Venezuela:', todayVenezuela.toISOString());
    console.log('   Fecha seleccionada (parseada):', selectedDateVenezuela.toISOString());
    console.log('   Fecha seleccionada (string):', date);

    // 6. Verificar que la fecha no sea en el pasado
    if (selectedDateVenezuela < todayVenezuela) {
      console.log('❌ Fecha en el pasado para Venezuela');
      return res.status(400).json({ 
        success: false,
        message: "No se pueden crear citas en fechas pasadas" 
      });
    }

    // 7. Verificar que no sea más de 3 meses en el futuro
    const maxDate = new Date(todayVenezuela);
    maxDate.setMonth(maxDate.getMonth() + 3);
    
    if (selectedDateVenezuela > maxDate) {
      console.log('❌ Fecha demasiado futura:', date);
      return res.status(400).json({ 
        success: false,
        message: "No se pueden reservar citas con más de 3 meses de anticipación" 
      });
    }

    // ============ VALIDACIONES DE DATOS ============

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

    // 2. Verificar servicio
    let service = null;
    let business = null;
    
    try {
      service = await Service.findById(serviceId);
      if (service) {
        console.log('✅ Servicio encontrado en BD:', service.name);
        
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
      service = {
        _id: serviceId,
        name: serviceName || 'Servicio personalizado',
        price: servicePrice || 0,
        duration: serviceDuration || 60,
        providerId: providerId || null,
        businessId: businessId || null
      };
    }

    // ============ VALIDACIÓN DE CONFLICTOS ============

    // 3. Validar que no haya conflicto de horario
    // USAR LA FECHA COMO STRING para evitar problemas de zona horaria
    const existingAppointment = await Appointment.findOne({
      userId: req.user._id,
      date: date, // Usar el string directamente
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

    // 4. Validar que no haya conflicto en el mismo negocio
    if (businessId) {
      const businessConflict = await Appointment.findOne({
        businessId,
        date: date,
        time,
        status: { $nin: ['cancelada', 'completada'] }
      });

      if (businessConflict) {
        console.log('❌ Hora no disponible en el negocio:', date, time);
        return res.status(400).json({ 
          success: false,
          message: "Este horario ya no está disponible en el negocio" 
        });
      }
    }

    // ============ CREAR LA CITA ============

    // 5. Preparar datos para crear la cita
    const appointmentData = {
      userId: req.user._id,
      petId,
      serviceId,
      providerId: providerId || service?.providerId || null,
      businessId: businessId || service?.businessId || null,
      date: date, // Guardar como STRING para evitar problemas de zona horaria
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
      createdAt: new Date(),
      
      // Campos adicionales para tracking
      createdBy: req.user._id,
      createdByRole: 'user',
      
      // Marcar si es servicio embebido
      isEmbeddedService: !service?._id,
      
      // Añadir timestamp de Venezuela para referencia
      venezuelaCreatedAt: getCurrentVenezuelaDate()
    };

    console.log('📝 Creando cita con datos:', {
      fecha: appointmentData.date,
      hora: appointmentData.time,
      servicio: appointmentData.serviceName,
      mascota: pet.name,
      negocio: appointmentData.businessName
    });
    
    // 6. Crear la cita
    const appointment = await Appointment.create(appointmentData);

    console.log('✅ Cita creada exitosamente. ID:', appointment._id);
    console.log('📅 Fecha guardada:', appointment.date);
    console.log('🕒 Hora guardada:', appointment.time);
    console.log('🇻🇪 Hora de creación en Venezuela:', appointment.venezuelaCreatedAt);
    
    // ============ NOTIFICACIONES ============

    // 7. 🔔 CREAR NOTIFICACIÓN PARA EL PROVEEDOR
    if (appointment.providerId) {
      console.log(`📨 Creando notificación para proveedor: ${appointment.providerId}`);
      await notifyAppointmentCreated(appointment);
      console.log('✅ Notificación creada exitosamente');
    } else {
      console.log('ℹ️ No hay proveedor asignado, omitiendo notificación');
    }

    // ============ RESPUESTA EXITOSA ============

    // 8. Respuesta exitosa
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
        createdAt: appointment.createdAt,
        formattedDate: formatDateForDisplay(appointment.date) // Para mostrar al usuario
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
// 📌 Función auxiliar: Formatear fecha para mostrar
// ======================================================
const formatDateForDisplay = (dateString) => {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  
  // Formatear en español para Venezuela
  return date.toLocaleDateString('es-VE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
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
      .sort({ date: -1, time: -1 });

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
      formattedDate: formatDateForDisplay(appt.date), // Fecha formateada
      
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
      userId: req.user._id
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
        formattedDate: formatDateForDisplay(appointment.date),
        
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

    // Verificar si ya pasó la fecha (usando fecha Venezuela)
    const appointmentDate = new Date(appointment.date + 'T00:00:00');
    const todayVenezuela = getCurrentVenezuelaDate();
    todayVenezuela.setHours(0, 0, 0, 0);
    
    if (appointmentDate < todayVenezuela) {
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
        cancelledAt: appointment.cancelledAt,
        formattedDate: formatDateForDisplay(appointment.date)
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

    // Validar formato de fecha
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({ 
        success: false,
        message: "Formato de fecha inválido. Use YYYY-MM-DD" 
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

    // Validar nueva fecha no en el pasado (Venezuela)
    const todayVenezuela = getCurrentVenezuelaDate();
    todayVenezuela.setHours(0, 0, 0, 0);
    
    const newDate = new Date(date + 'T00:00:00');
    if (newDate < todayVenezuela) {
      return res.status(400).json({ 
        success: false,
        message: "No se puede reprogramar a una fecha pasada" 
      });
    }

    // Verificar nuevo horario no conflictivo
    const existingAppointment = await Appointment.findOne({
      userId: req.user._id,
      date,
      time,
      _id: { $ne: req.params.id },
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
        rescheduledAt: appointment.rescheduledAt,
        formattedDate: formatDateForDisplay(appointment.date)
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
// 📌 Obtener estadísticas de citas
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

    const todayVenezuela = getCurrentVenezuelaDate();
    todayVenezuela.setHours(0, 0, 0, 0);
    const todayString = todayVenezuela.toISOString().split('T')[0];

    const totalAppointments = await Appointment.countDocuments({ userId: req.user._id });
    const upcomingAppointments = await Appointment.countDocuments({
      userId: req.user._id,
      status: { $in: ['pendiente', 'confirmada'] },
      date: { $gte: todayString }
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
// 📌 Obtener horas disponibles (VERSIÓN MEJORADA)
// ======================================================
export const getAvailableHours = async (req, res) => {
  console.log('🔔 Petición GET /appointments/hours/available recibida');
  console.log('📦 Query params:', req.query);
  console.log('🇻🇪 Usando zona horaria de Venezuela');
  
  try {
    const { date, businessId, serviceId } = req.query;
    
    // Validar parámetros requeridos
    if (!date || !businessId) {
      console.log('❌ Faltan parámetros requeridos');
      return res.status(400).json({
        success: false,
        message: 'Se requieren fecha (date) y ID del negocio (businessId)',
        receivedParams: req.query
      });
    }
    
    // Validar formato de fecha (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      console.log('❌ Formato de fecha inválido:', date);
      return res.status(400).json({
        success: false,
        message: 'Formato de fecha inválido. Usa YYYY-MM-DD'
      });
    }
    
    // Verificar que la fecha no sea en el pasado (Venezuela)
    const todayVenezuela = getCurrentVenezuelaDate();
    todayVenezuela.setHours(0, 0, 0, 0);
    
    const selectedDate = new Date(date + 'T00:00:00');
    if (selectedDate < todayVenezuela) {
      console.log('❌ Fecha en el pasado para Venezuela:', date);
      return res.status(400).json({
        success: false,
        message: 'No se pueden consultar horas para fechas pasadas'
      });
    }
    
    // Buscar horas ya reservadas
    const query = {
      businessId: businessId,
      date: date, // Comparar como string
      status: { $nin: ['cancelada', 'completada'] }
    };
    
    if (serviceId && serviceId.length >= 12) {
      query.serviceId = serviceId;
    }
    
    console.log('🔍 Query para buscar citas:', query);
    
    const appointments = await Appointment.find(query).select('time');
    const bookedHours = appointments.map(appt => appt.time);
    
    console.log('⏰ Horas reservadas encontradas:', bookedHours);
    
    // Generar horas disponibles (9am a 6pm, saltando 1pm)
    const availableHours = [
      "09:00", "10:00", "11:00", "12:00", 
      "14:00", "15:00", "16:00", "17:00", "18:00"
    ].map(time => ({
      time: time,
      isBooked: bookedHours.includes(time),
      displayTime: `${time} (hora Venezuela)`
    }));
    
    console.log('✅ Horas disponibles generadas:', availableHours.length);
    
    // Respuesta exitosa
    res.json({
      success: true,
      message: 'Horas disponibles obtenidas correctamente',
      date: date,
      businessId: businessId,
      serviceId: serviceId || null,
      totalHours: availableHours.length,
      bookedHours: bookedHours,
      availableHours: availableHours,
      timezone: 'America/Caracas (UTC-4)'
    });
    
  } catch (err) {
    console.error('❌ Error en getAvailableHours:', err);
    console.error('Stack trace:', err.stack);
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener horas disponibles',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// ======================================================
// 📌 Exportar funciones adicionales
// ======================================================
export const updateAppointmentStatus = async (req, res) => {
  // ... (mantener tu código existente)
};

const updateStatusAndNotify = async (appointmentId, status, userId, reason = '') => {
  // ... (mantener tu código existente)
};

export const checkNotificationsForProvider = async (providerId) => {
  // ... (mantener tu código existente)
};

// ======================================================
// 📌 Función auxiliar: Generar horas por defecto
// ======================================================
const generateDefaultHours = (bookedHours) => {
  const defaultHours = [
    "09:00", "10:00", "11:00", "12:00", 
    "14:00", "15:00", "16:00", "17:00", "18:00"
  ];
  
  return defaultHours.map(time => ({
    time: time,
    isBooked: bookedHours.includes(time),
    displayTime: time
  }));
};