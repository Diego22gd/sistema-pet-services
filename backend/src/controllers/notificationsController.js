import Notification from "../models/notifications.js";

export const getNotifications = async (req, res) => {
  try {
    const providerId = req.user.id;

    const notifications = await Notification
      .find({ providerId })
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error obteniendo notificaciones" });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findById(id);
    if (!notification) return res.status(404).json({ message: "No encontrada" });

    notification.read = true;
    await notification.save();

    res.json({ message: "Marcada como leída" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error actualizando" });
  }
};

export const notifyAppointment = async (providerId, clientName, petName) => {
  await Notification.create({
    providerId,
    type: "appointment",
    title: "Nueva cita reservada",
    message: `${clientName} reservó una cita para ${petName}.`
  });
};

export const notifyCancel = async (providerId, clientName, petName) => {
  await Notification.create({
    providerId,
    type: "cancel",
    title: "Cita cancelada",
    message: `${clientName} canceló la cita de ${petName}.`
  });
};

export const notifyReschedule = async (providerId, clientName, petName) => {
  await Notification.create({
    providerId,
    type: "reschedule",
    title: "Cita reprogramada",
    message: `${clientName} reprogramó la cita para ${petName}.`
  });
};


export const notifyServiceApproved = async (providerId) => {
  await Notification.create({
    providerId,
    type: "approval",
    title: "Servicio aprobado",
    message: "Uno de tus servicios fue aprobado por el administrador."
  });
};
