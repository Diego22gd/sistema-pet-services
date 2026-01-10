// controllers/notificationsController.js
import Notification from "../models/notifications.js";
import Appointment from "../models/Appointment.js";
import User from "../models/User.js";

// ======================================================
// 📌 Obtener notificaciones del proveedor ACTUAL (usando token)
// ======================================================
export const getMyNotifications = async (req, res) => {
  try {
    console.log('🔔 Petición GET /api/notifications/me recibida');
    console.log('👤 Usuario autenticado ID:', req.user._id);
    console.log('👤 Rol del usuario:', req.user.role);
    
    // Verificar que el usuario sea proveedor
    if (req.user.role !== 'provider') {
      return res.status(403).json({
        success: false,
        message: "Acceso denegado. Solo proveedores pueden ver notificaciones"
      });
    }
    
    // Usar el ID del usuario autenticado
    const providerId = req.user._id;
    
    console.log(`📊 Buscando notificaciones para proveedor: ${providerId}`);
    
    const notifications = await Notification.find({ providerId })
      .populate('appointmentId', 'date time serviceName petId userId status')
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 })
      .lean();

    console.log(`📊 Encontradas ${notifications.length} notificaciones`);

    // Formatear fecha y estructura
    const formattedNotifications = notifications.map(notif => ({
      _id: notif._id,
      type: notif.type,
      title: notif.title,
      message: notif.message,
      read: notif.read,
      createdAt: notif.createdAt,
      date: formatDate(notif.createdAt),
      appointmentId: notif.appointmentId ? {
        _id: notif.appointmentId._id,
        date: notif.appointmentId.date,
        time: notif.appointmentId.time,
        serviceName: notif.appointmentId.serviceName,
        status: notif.appointmentId.status,
        userId: notif.appointmentId.userId
      } : null,
      userId: notif.userId ? {
        _id: notif.userId._id,
        name: notif.userId.name,
        email: notif.userId.email,
        phone: notif.userId.phone
      } : null,
      metadata: notif.metadata || {}
    }));

    console.log(`✅ ${formattedNotifications.length} notificaciones formateadas`);
    
    res.json({
      success: true,
      count: formattedNotifications.length,
      notifications: formattedNotifications
    });

  } catch (error) {
    console.error("❌ Error obteniendo notificaciones:", error);
    res.status(500).json({
      success: false,
      message: "Error del servidor al obtener notificaciones",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ======================================================
// 📌 Obtener notificaciones por providerId (para admin o el mismo proveedor)
// ======================================================
export const getProviderNotifications = async (req, res) => {
  try {
    const { providerId } = req.params;
    
    console.log(`🔔 Petición GET /api/notifications/provider/${providerId} recibida`);
    console.log(`👤 Provider ID solicitado: ${providerId}`);
    console.log(`👤 Usuario autenticado ID: ${req.user._id}, Rol: ${req.user.role}`);
    
    // Verificar que el usuario sea admin o el mismo proveedor
    if (req.user.role !== 'admin' && req.user._id.toString() !== providerId) {
      return res.status(403).json({
        success: false,
        message: "No autorizado para ver estas notificaciones"
      });
    }

    const notifications = await Notification.find({ providerId })
      .populate('appointmentId', 'date time serviceName petId status')
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 })
      .lean();

    // Formatear fecha
    const formattedNotifications = notifications.map(notif => ({
      ...notif,
      date: formatDate(notif.createdAt)
    }));

    console.log(`✅ ${formattedNotifications.length} notificaciones encontradas para proveedor ${providerId}`);
    
    res.json({
      success: true,
      count: formattedNotifications.length,
      notifications: formattedNotifications
    });

  } catch (error) {
    console.error("❌ Error obteniendo notificaciones del proveedor:", error);
    res.status(500).json({
      success: false,
      message: "Error del servidor",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ======================================================
// 📌 Marcar notificación como leída
// ======================================================
export const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    console.log(`📝 Marcando notificación ${notificationId} como leída`);
    
    const notification = await Notification.findById(notificationId);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notificación no encontrada"
      });
    }

    // Verificar que pertenece al proveedor o es admin
    if (req.user.role !== 'admin' && req.user._id.toString() !== notification.providerId.toString()) {
      return res.status(403).json({
        success: false,
        message: "No autorizado para modificar esta notificación"
      });
    }

    notification.read = true;
    await notification.save();

    console.log(`✅ Notificación ${notificationId} marcada como leída`);
    
    res.json({
      success: true,
      message: "Notificación marcada como leída",
      notification: {
        _id: notification._id,
        read: notification.read
      }
    });

  } catch (error) {
    console.error("❌ Error marcando notificación como leída:", error);
    res.status(500).json({
      success: false,
      message: "Error del servidor"
    });
  }
};

// ======================================================
// 📌 Marcar todas como leídas
// ======================================================
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const { providerId } = req.params;
    
    console.log(`📝 Marcando todas las notificaciones como leídas para proveedor ${providerId}`);
    
    // Verificar que el usuario sea el proveedor o admin
    if (req.user.role !== 'admin' && req.user._id.toString() !== providerId) {
      return res.status(403).json({
        success: false,
        message: "No autorizado"
      });
    }

    const result = await Notification.updateMany(
      { providerId, read: false },
      { $set: { read: true } }
    );

    console.log(`✅ ${result.modifiedCount} notificaciones marcadas como leídas`);
    
    res.json({
      success: true,
      message: `Se marcaron ${result.modifiedCount} notificaciones como leídas`,
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    console.error("❌ Error marcando notificaciones como leídas:", error);
    res.status(500).json({
      success: false,
      message: "Error del servidor"
    });
  }
};

// ======================================================
// 📌 Obtener contador de notificaciones no leídas
// ======================================================
export const getUnreadCount = async (req, res) => {
  try {
    const { providerId } = req.params;
    
    console.log(`🔢 Obteniendo contador de no leídas para proveedor ${providerId}`);
    
    // Verificar que el usuario sea el proveedor o admin
    if (req.user.role !== 'admin' && req.user._id.toString() !== providerId) {
      return res.status(403).json({
        success: false,
        message: "No autorizado"
      });
    }

    const count = await Notification.countDocuments({
      providerId,
      read: false
    });

    console.log(`✅ ${count} notificaciones no leídas encontradas`);
    
    res.json({
      success: true,
      unreadCount: count
    });

  } catch (error) {
    console.error("❌ Error obteniendo contador de notificaciones:", error);
    res.status(500).json({
      success: false,
      message: "Error del servidor"
    });
  }
};

// ======================================================
// 📌 Crear notificación (para usar desde otros controladores)
// ======================================================
export const createNotification = async (data) => {
  try {
    const {
      providerId,
      type,
      title,
      message,
      appointmentId,
      userId,
      metadata = {}
    } = data;

    console.log(`📨 Creando notificación para proveedor ${providerId}: ${title}`);

    const notification = await Notification.create({
      providerId,
      type,
      title,
      message,
      appointmentId,
      userId,
      metadata,
      read: false,
      createdAt: new Date()
    });

    console.log(`✅ Notificación creada: ${notification._id}`);
    return notification;
    
  } catch (error) {
    console.error("❌ Error creando notificación:", error);
    return null;
  }
};

// ======================================================
// 📌 Notificar creación de cita
// ======================================================
export const notifyAppointmentCreated = async (appointment) => {
  try {
    // Si no hay proveedor, no crear notificación
    if (!appointment.providerId) {
      console.log('ℹ️ No hay providerId en la cita, omitiendo notificación');
      return null;
    }

    // Obtener usuario y mascota para el mensaje
    const user = await User.findById(appointment.userId).select('name email');
    const pet = await import("../models/Pet.js")
      .then(mod => mod.default)
      .then(Pet => Pet.findById(appointment.petId).select('name'));

    const message = `${user?.name || 'Cliente'} ha agendado una cita para ${pet?.name || 'su mascota'} el ${appointment.date} a las ${appointment.time}`;

    const notification = await createNotification({
      providerId: appointment.providerId,
      type: "appointment_created",
      title: "📅 Nueva cita agendada",
      message: message,
      appointmentId: appointment._id,
      userId: appointment.userId,
      metadata: {
        appointmentDate: appointment.date,
        appointmentTime: appointment.time,
        serviceName: appointment.serviceName,
        petName: pet?.name,
        userName: user?.name,
        appointmentStatus: appointment.status
      }
    });

    return notification;
    
  } catch (error) {
    console.error("❌ Error notificando creación de cita:", error);
    return null;
  }
};

// ======================================================
// 📌 Notificar cancelación de cita
// ======================================================
export const notifyAppointmentCancelled = async (appointment, cancelledByUserId, reason = '') => {
  try {
    if (!appointment.providerId) {
      console.log('ℹ️ No hay providerId en la cita, omitiendo notificación');
      return null;
    }

    const cancelledByUser = await User.findById(cancelledByUserId).select('name email role');
    const pet = await import("../models/Pet.js")
      .then(mod => mod.default)
      .then(Pet => Pet.findById(appointment.petId).select('name'));

    let message = '';
    if (cancelledByUser?.role === 'admin') {
      message = `El administrador ha cancelado la cita del ${appointment.date} a las ${appointment.time}`;
    } else if (cancelledByUser?.role === 'provider') {
      message = `Tú has cancelado la cita del ${appointment.date} a las ${appointment.time}`;
    } else {
      message = `${cancelledByUser?.name || 'El cliente'} ha cancelado la cita del ${appointment.date} a las ${appointment.time}`;
    }

    if (reason) {
      message += `. Motivo: ${reason}`;
    }

    const notification = await createNotification({
      providerId: appointment.providerId,
      type: "appointment_cancelled",
      title: "❌ Cita cancelada",
      message: message,
      appointmentId: appointment._id,
      userId: cancelledByUserId,
      metadata: {
        appointmentDate: appointment.date,
        appointmentTime: appointment.time,
        serviceName: appointment.serviceName,
        petName: pet?.name,
        cancelledBy: cancelledByUser?.name,
        cancelledByRole: cancelledByUser?.role,
        reason: reason,
        cancelledAt: new Date()
      }
    });

    return notification;
    
  } catch (error) {
    console.error("❌ Error notificando cancelación de cita:", error);
    return null;
  }
};

// ======================================================
// 📌 Notificar reprogramación de cita
// ======================================================
export const notifyAppointmentRescheduled = async (appointment, rescheduledByUserId, previousDate, previousTime, reason = '') => {
  try {
    if (!appointment.providerId) {
      console.log('ℹ️ No hay providerId en la cita, omitiendo notificación');
      return null;
    }

    const rescheduledByUser = await User.findById(rescheduledByUserId).select('name email role');
    const pet = await import("../models/Pet.js")
      .then(mod => mod.default)
      .then(Pet => Pet.findById(appointment.petId).select('name'));

    let message = '';
    if (rescheduledByUser?.role === 'admin') {
      message = `El administrador ha reprogramado la cita de ${previousDate} ${previousTime} a ${appointment.date} ${appointment.time}`;
    } else if (rescheduledByUser?.role === 'provider') {
      message = `Has reprogramado la cita de ${previousDate} ${previousTime} a ${appointment.date} ${appointment.time}`;
    } else {
      message = `${rescheduledByUser?.name || 'El cliente'} ha reprogramado la cita de ${previousDate} ${previousTime} a ${appointment.date} ${appointment.time}`;
    }

    if (reason) {
      message += `. Motivo: ${reason}`;
    }

    const notification = await createNotification({
      providerId: appointment.providerId,
      type: "appointment_rescheduled",
      title: "🔄 Cita reprogramada",
      message: message,
      appointmentId: appointment._id,
      userId: rescheduledByUserId,
      metadata: {
        previousDate,
        previousTime,
        newDate: appointment.date,
        newTime: appointment.time,
        serviceName: appointment.serviceName,
        petName: pet?.name,
        rescheduledBy: rescheduledByUser?.name,
        rescheduledByRole: rescheduledByUser?.role,
        reason: reason
      }
    });

    return notification;
    
  } catch (error) {
    console.error("❌ Error notificando reprogramación de cita:", error);
    return null;
  }
};

// Función auxiliar para formatear fecha
const formatDate = (date) => {
  const now = new Date();
  const notificationDate = new Date(date);
  const diffMs = now - notificationDate;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Hace unos segundos';
  if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
  if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
  if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
  
  return notificationDate.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

export default {
  createNotification,
  notifyAppointmentCreated,
  notifyAppointmentCancelled,
  notifyAppointmentRescheduled,
  getMyNotifications,
  getProviderNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadCount
};