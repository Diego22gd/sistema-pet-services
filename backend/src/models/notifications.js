import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  providerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",  // Cambiar de "Provider" a "User"
    required: true 
  },
  type: { 
    type: String, 
    enum: ["appointment_created", "appointment_cancelled", "appointment_rescheduled", "appointment_updated", "system"], 
    required: true 
  },
  title: { 
    type: String, 
    required: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  appointmentId: {  // Agregar referencia a la cita
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment"
  },
  userId: {  // Usuario que generó la acción
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  read: { 
    type: Boolean, 
    default: false 
  },
  metadata: {  // Datos adicionales
    type: Object,
    default: {}
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Índices para mejor rendimiento
notificationSchema.index({ providerId: 1, read: 1 });
notificationSchema.index({ providerId: 1, createdAt: -1 });
notificationSchema.index({ appointmentId: 1 });

export default mongoose.model("Notification", notificationSchema);