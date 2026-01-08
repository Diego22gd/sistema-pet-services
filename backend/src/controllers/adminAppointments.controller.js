// controllers/adminAppointmentsController.js
import Appointment from "../models/Appointment.js";
import User from "../models/User.js";
import Pet from "../models/Pet.js";
import Service from "../models/Service.js";
import Business from "../models/Business.js";

// ======================================================
// 📌 OBTENER TODAS LAS CITAS (ADMIN)
// ======================================================
export const getAllAppointmentsAdmin = async (req, res) => {
  console.log('🔔 Petición GET /admin/appointments recibida');
  
  try {
    // Verificar que el usuario sea admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Acceso denegado. Solo administradores pueden ver todas las citas"
      });
    }

    // Obtener todas las citas sin filtrar por proveedor
    const appointments = await Appointment.find({})
      .populate('userId', 'name lastname email phone')
      .populate('petId', 'name type breed age')
      .populate('serviceId', 'name description price duration')
      .populate('providerId', 'name email phone serviceType')
      .populate('businessId', 'name address phone category')
      .sort({ date: -1, time: -1 })
      .lean();

    console.log(`✅ ${appointments.length} citas encontradas para admin`);

    res.json({
      success: true,
      count: appointments.length,
      appointments
    });

  } catch (err) {
    console.error("❌ Error obteniendo citas para admin:", err);
    res.status(500).json({
      success: false,
      message: "Error del servidor al obtener citas"
    });
  }
};

// ======================================================
// 📌 CREAR CITA COMO ADMINISTRADOR
// ======================================================
export const createAppointmentAsAdmin = async (req, res) => {
  console.log('🔔 Petición POST /admin/appointments recibida');
  console.log('📦 Body:', JSON.stringify(req.body, null, 2));
  
  try {
    // Verificar que el usuario sea admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Acceso denegado. Solo administradores pueden crear citas manualmente"
      });
    }

    const {
      clientId,
      petId,
      providerId,
      businessId,
      serviceId,
      date,
      time,
      notes
    } = req.body;

    // Validar campos obligatorios
    const requiredFields = ['clientId', 'petId', 'serviceId', 'date', 'time'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Campos obligatorios faltantes: ${missingFields.join(', ')}`
      });
    }

    // 1. Verificar que el cliente existe
    const client = await User.findById(clientId);
    if (!client || client.role !== 'client') {
      return res.status(404).json({
        success: false,
        message: "Cliente no encontrado o no es un cliente válido"
      });
    }

    // 2. Verificar que la mascota existe y pertenece al cliente
    const pet = await Pet.findOne({ _id: petId, owner: clientId });
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: "Mascota no encontrada o no pertenece al cliente"
      });
    }

    // 3. Verificar servicio
    const service = await Service.findById(serviceId)
      .populate('providerId', 'name email')
      .populate('businessId', 'name address phone');

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Servicio no encontrado"
      });
    }

    // 4. Verificar proveedor (si se proporciona)
    let provider = null;
    if (providerId) {
      provider = await User.findById(providerId);
      if (!provider || provider.role !== 'provider') {
        return res.status(404).json({
          success: false,
          message: "Proveedor no encontrado o no es un proveedor válido"
        });
      }
      
      // Si el servicio tiene providerId, verificar que coincida
      if (service.providerId && service.providerId._id.toString() !== providerId) {
        console.warn('⚠️ Proveedor del servicio no coincide con el seleccionado');
      }
    } else if (service.providerId) {
      // Usar el provider del servicio si no se especificó uno
      providerId = service.providerId._id;
      provider = service.providerId;
    }

    // 5. Verificar negocio (si se proporciona)
    let business = null;
    if (businessId) {
      business = await Business.findById(businessId);
      if (!business) {
        return res.status(404).json({
          success: false,
          message: "Negocio no encontrado"
        });
      }
      
      // Verificar que el negocio pertenezca al proveedor si ambos están seleccionados
      if (providerId && business.provider && business.provider.toString() !== providerId) {
        return res.status(400).json({
          success: false,
          message: "El negocio seleccionado no pertenece al proveedor"
        });
      }
    } else if (service.businessId) {
      // Usar el negocio del servicio si no se especificó uno
      businessId = service.businessId._id;
      business = service.businessId;
    }

    // 6. Verificar que no haya conflicto de horario para el cliente
    const existingAppointment = await Appointment.findOne({
      userId: clientId,
      date,
      time,
      status: { $nin: ['cancelada', 'completada'] }
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: "El cliente ya tiene una cita en ese horario"
      });
    }

    // 7. Preparar datos para la cita
    const appointmentData = {
      userId: clientId,
      petId,
      serviceId,
      providerId: providerId || service.providerId?._id || null,
      businessId: businessId || service.businessId?._id || null,
      date,
      time,
      notes: notes || '',
      serviceName: service.name,
      servicePrice: service.price,
      serviceDuration: service.duration,
      businessName: business?.name || service.businessId?.name || '',
      businessAddress: business?.address || service.businessId?.address || '',
      businessPhone: business?.phone || service.businessId?.phone || '',
      status: "pendiente",
      createdAt: new Date(),
      createdBy: req.user._id,
      createdByRole: 'admin'
    };

    // 8. Crear la cita
    const appointment = await Appointment.create(appointmentData);

    // 9. Construir respuesta poblada
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('userId', 'name lastname email phone')
      .populate('petId', 'name type breed age')
      .populate('serviceId', 'name description price duration')
      .populate('providerId', 'name email phone serviceType')
      .populate('businessId', 'name address phone category');

    console.log('✅ Cita creada exitosamente por admin. ID:', appointment._id);
    
    res.status(201).json({
      success: true,
      message: "✅ Cita creada exitosamente",
      appointment: populatedAppointment
    });

  } catch (err) {
    console.error("❌ Error creando cita como admin:", err);
    
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
      message: "Error interno del servidor al crear la cita",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// ======================================================
// 📌 OBTENER DATOS PARA FORMULARIO DE ADMIN
// ======================================================
export const getAppointmentFormData = async (req, res) => {
  console.log('🔔 Petición GET /admin/appointments/form-data recibida');
  
  try {
    // Verificar que el usuario sea admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Acceso denegado. Solo administradores"
      });
    }

    // Obtener todos los datos necesarios para el formulario
    const [clients, providers, businesses, services] = await Promise.all([
      // Clientes
      User.find({ role: 'client' })
        .select('_id name lastname email phone')
        .sort({ name: 1 })
        .lean(),
      
      // Proveedores
      User.find({ role: 'provider' })
        .select('_id name email phone serviceType')
        .sort({ name: 1 })
        .lean(),
      
      // Negocios - ¡IMPORTANTE! Incluir provider
      Business.find({ approved: true, status: 'active' })
        .populate('provider', '_id name email') // Poblar provider
        .select('_id name address phone category provider')
        .sort({ name: 1 })
        .lean(),
      
      // Servicios - Incluir providerId y businessId
      Service.find({ isActive: true })
        .populate('providerId', '_id name email')
        .populate('businessId', '_id name address phone')
        .select('_id name description price duration providerId businessId')
        .sort({ name: 1 })
        .lean()
    ]);

    console.log(`✅ Datos obtenidos: ${clients.length} clientes, ${providers.length} proveedores, ${businesses.length} negocios, ${services.length} servicios`);

    res.json({
      success: true,
      formData: {
        clients,
        providers,
        businesses,
        services
      }
    });

  } catch (err) {
    console.error("❌ Error obteniendo datos para formulario:", err);
    res.status(500).json({
      success: false,
      message: "Error del servidor al obtener datos del formulario",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// ======================================================
// 📌 OBTENER MASCOTAS DE UN CLIENTE
// ======================================================
export const getClientPets = async (req, res) => {
  console.log('🔔 Petición GET /admin/clients/:clientId/pets recibida');
  console.log('👤 Cliente ID:', req.params.clientId);
  
  try {
    // Verificar que el usuario sea admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Acceso denegado"
      });
    }

    const { clientId } = req.params;

    // Verificar que el cliente existe
    const client = await User.findById(clientId);
    if (!client || client.role !== 'client') {
      return res.status(404).json({
        success: false,
        message: "Cliente no encontrado"
      });
    }

    // Obtener mascotas del cliente
    const pets = await Pet.find({ owner: clientId })
      .select('_id name type breed age owner')
      .sort({ name: 1 })
      .lean();

    console.log(`✅ ${pets.length} mascotas encontradas para cliente ${clientId}`);

    res.json({
      success: true,
      pets
    });

  } catch (err) {
    console.error("❌ Error obteniendo mascotas del cliente:", err);
    
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "ID de cliente inválido"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Error del servidor al obtener mascotas",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// ======================================================
// 📌 OBTENER NEGOCIOS DE UN PROVEEDOR
// ======================================================
export const getProviderBusinesses = async (req, res) => {
  console.log('🔔 Petición GET /admin/providers/:providerId/businesses recibida');
  console.log('👨‍⚕️ Proveedor ID:', req.params.providerId);
  
  try {
    // Verificar que el usuario sea admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Acceso denegado"
      });
    }

    const { providerId } = req.params;

    // Verificar que el proveedor existe
    const provider = await User.findById(providerId);
    if (!provider || provider.role !== 'provider') {
      return res.status(404).json({
        success: false,
        message: "Proveedor no encontrado"
      });
    }

    // Obtener negocios del proveedor
    const businesses = await Business.find({ 
      provider: providerId,
      approved: true,
      status: 'active'
    })
      .select('_id name category address phone')
      .sort({ name: 1 })
      .lean();

    console.log(`✅ ${businesses.length} negocios encontrados para proveedor ${providerId}`);

    res.json({
      success: true,
      businesses
    });

  } catch (err) {
    console.error("❌ Error obteniendo negocios del proveedor:", err);
    
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "ID de proveedor inválido"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Error del servidor al obtener negocios",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// ======================================================
// 📌 OBTENER SERVICIOS DE UN NEGOCIO
// ======================================================
export const getBusinessServices = async (req, res) => {
  console.log('🔔 Petición GET /admin/businesses/:businessId/services recibida');
  console.log('🏬 Negocio ID:', req.params.businessId);
  
  try {
    // Verificar que el usuario sea admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Acceso denegado"
      });
    }

    const { businessId } = req.params;

    // Verificar que el negocio existe
    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Negocio no encontrado"
      });
    }

    // Obtener servicios del negocio
    const services = await Service.find({ 
      businessId,
      isActive: true 
    })
      .populate('providerId', '_id name email')
      .select('_id name description price duration providerId')
      .sort({ name: 1 })
      .lean();

    console.log(`✅ ${services.length} servicios encontrados para negocio ${businessId}`);

    res.json({
      success: true,
      services
    });

  } catch (err) {
    console.error("❌ Error obteniendo servicios del negocio:", err);
    
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "ID de negocio inválido"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Error del servidor al obtener servicios",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// ======================================================
// 📌 OBTENER SERVICIOS DE UN PROVEEDOR
// ======================================================
export const getProviderServices = async (req, res) => {
  console.log('🔔 Petición GET /admin/providers/:providerId/services recibida');
  console.log('👨‍⚕️ Proveedor ID:', req.params.providerId);
  
  try {
    // Verificar que el usuario sea admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Acceso denegado"
      });
    }

    const { providerId } = req.params;

    // Verificar que el proveedor existe
    const provider = await User.findById(providerId);
    if (!provider || provider.role !== 'provider') {
      return res.status(404).json({
        success: false,
        message: "Proveedor no encontrado"
      });
    }

    // Obtener servicios del proveedor
    const services = await Service.find({ 
      providerId,
      isActive: true 
    })
      .populate('businessId', '_id name address')
      .select('_id name description price duration businessId')
      .sort({ name: 1 })
      .lean();

    console.log(`✅ ${services.length} servicios encontrados para proveedor ${providerId}`);

    res.json({
      success: true,
      services
    });

  } catch (err) {
    console.error("❌ Error obteniendo servicios del proveedor:", err);
    
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "ID de proveedor inválido"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Error del servidor al obtener servicios",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// ======================================================
// 📌 ACTUALIZAR ESTADO DE CITA (ADMIN)
// ======================================================
export const updateAppointmentStatusAdmin = async (req, res) => {
  console.log('🔔 Petición PUT /admin/appointments/:id/status recibida');
  console.log('📌 Cita ID:', req.params.id);
  console.log('📦 Estado:', req.body.status);
  
  try {
    // Verificar que el usuario sea admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Acceso denegado"
      });
    }

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

    // Buscar la cita (admin puede acceder a cualquier cita)
    const appointment = await Appointment.findById(id);

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
    appointment.updatedBy = req.user._id;
    appointment.updatedByRole = 'admin';
    
    // Agregar timestamp según el estado
    if (status === 'cancelada') {
      appointment.cancelledAt = new Date();
      appointment.cancelledBy = req.user._id;
    } else if (status === 'completada') {
      appointment.completedAt = new Date();
      appointment.completedBy = req.user._id;
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
      changedByRole: 'admin'
    });
    
    await appointment.save();

    console.log('✅ Estado de cita actualizado por admin:', appointment._id, `${previousStatus} → ${status}`);
    
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
// 📌 ELIMINAR CITA (ADMIN)
// ======================================================
export const deleteAppointmentAdmin = async (req, res) => {
  console.log('🔔 Petición DELETE /admin/appointments/:id recibida');
  console.log('📌 Cita ID a eliminar:', req.params.id);
  
  try {
    // Verificar que el usuario sea admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Acceso denegado"
      });
    }

    const { id } = req.params;

    // Buscar y eliminar la cita
    const appointment = await Appointment.findByIdAndDelete(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Cita no encontrada"
      });
    }

    console.log('✅ Cita eliminada por admin:', id);
    
    res.json({
      success: true,
      message: "✅ Cita eliminada correctamente",
      deletedAppointment: {
        _id: appointment._id,
        clientId: appointment.userId,
        date: appointment.date,
        time: appointment.time,
        status: appointment.status
      }
    });

  } catch (err) {
    console.error("❌ Error eliminando cita:", err);
    
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "ID de cita inválido"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Error del servidor al eliminar cita",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// ======================================================
// 📌 REPROGRAMAR CITA (ADMIN)
// ======================================================
export const rescheduleAppointmentAdmin = async (req, res) => {
  console.log('🔔 Petición PATCH /admin/appointments/:id/reschedule recibida');
  console.log('📌 Cita ID a reprogramar:', req.params.id);
  console.log('📦 Nuevos datos:', req.body);
  
  try {
    // Verificar que el usuario sea admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Acceso denegado"
      });
    }

    const { id } = req.params;
    const { date, time, reason } = req.body;

    if (!date || !time) {
      return res.status(400).json({
        success: false,
        message: "Fecha y hora son obligatorios para reprogramar"
      });
    }

    // Buscar la cita
    const appointment = await Appointment.findById(id)
      .populate('userId', '_id name email');

    if (!appointment) {
      console.log('❌ Cita no encontrada');
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
      _id: { $ne: id },
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
    const previousStatus = appointment.status;
    
    // Actualizar cita
    appointment.date = date;
    appointment.time = time;
    appointment.status = "reprogramada";
    appointment.rescheduledAt = new Date();
    appointment.rescheduledBy = req.user._id;
    appointment.rescheduleReason = reason || '';
    appointment.previousDate = previousDate;
    appointment.previousTime = previousTime;
    appointment.updatedAt = new Date();
    appointment.updatedBy = req.user._id;
    
    // Agregar al historial de cambios
    if (!appointment.statusHistory) {
      appointment.statusHistory = [];
    }
    
    appointment.statusHistory.push({
      from: previousStatus,
      to: 'reprogramada',
      changedAt: new Date(),
      changedBy: req.user._id,
      changedByRole: 'admin',
      reason: reason || 'Reprogramación administrativa'
    });
    
    await appointment.save();

    console.log('✅ Cita reprogramada por admin:', appointment._id);
    
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
        rescheduleReason: appointment.rescheduleReason
      }
    });

  } catch (err) {
    console.error("❌ Error reprogramando cita:", err);
    
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "ID de cita inválido"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Error del servidor al reprogramar la cita",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// ======================================================
// 📌 OBTENER ESTADÍSTICAS DE CITAS (ADMIN)
// ======================================================
export const getAppointmentStatsAdmin = async (req, res) => {
  console.log('🔔 Petición GET /admin/appointments/stats recibida');
  
  try {
    // Verificar que el usuario sea admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Acceso denegado"
      });
    }

    // Obtener estadísticas generales
    const totalAppointments = await Appointment.countDocuments({});
    
    // Estadísticas por estado
    const statsByStatus = await Appointment.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalRevenue: { $sum: "$servicePrice" }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Estadísticas por proveedor
    const statsByProvider = await Appointment.aggregate([
      {
        $match: { providerId: { $ne: null } }
      },
      {
        $group: {
          _id: "$providerId",
          count: { $sum: 1 },
          totalRevenue: { $sum: "$servicePrice" }
        }
      },
      { $sort: { count: -1 } },
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
          totalRevenue: 1,
          providerName: "$provider.name",
          providerEmail: "$provider.email"
        }
      }
    ]);

    // Estadísticas por mes (últimos 6 meses)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const statsByMonth = await Appointment.aggregate([
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
          totalRevenue: { $sum: "$servicePrice" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Estadísticas por día de la semana
    const statsByDay = await Appointment.aggregate([
      {
        $addFields: {
          dayOfWeek: { $dayOfWeek: "$date" }
        }
      },
      {
        $group: {
          _id: "$dayOfWeek",
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Mapear días de la semana
    const daysMap = {
      1: 'Domingo',
      2: 'Lunes',
      3: 'Martes',
      4: 'Miércoles',
      5: 'Jueves',
      6: 'Viernes',
      7: 'Sábado'
    };

    const formattedStatsByDay = statsByDay.map(stat => ({
      day: daysMap[stat._id] || `Día ${stat._id}`,
      count: stat.count
    }));

    // Total de ingresos
    const totalRevenue = statsByStatus.reduce((total, stat) => total + (stat.totalRevenue || 0), 0);

    console.log('✅ Estadísticas obtenidas para admin');

    res.json({
      success: true,
      stats: {
        totalAppointments,
        totalRevenue,
        byStatus: statsByStatus.reduce((acc, stat) => {
          acc[stat._id] = {
            count: stat.count,
            revenue: stat.totalRevenue || 0
          };
          return acc;
        }, {}),
        byProvider: statsByProvider,
        byMonth: statsByMonth,
        byDay: formattedStatsByDay,
        summary: {
          pending: statsByStatus.find(s => s._id === 'pendiente')?.count || 0,
          confirmed: statsByStatus.find(s => s._id === 'confirmada')?.count || 0,
          completed: statsByStatus.find(s => s._id === 'completada')?.count || 0,
          cancelled: statsByStatus.find(s => s._id === 'cancelada')?.count || 0,
          rescheduled: statsByStatus.find(s => s._id === 'reprogramada')?.count || 0
        }
      }
    });

  } catch (err) {
    console.error("❌ Error obteniendo estadísticas:", err);
    res.status(500).json({
      success: false,
      message: "Error del servidor al obtener estadísticas",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
