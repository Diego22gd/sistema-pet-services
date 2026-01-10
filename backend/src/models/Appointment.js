// models/Appointment.js - VERSIÓN CORREGIDA
import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    petId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Pet", 
      required: true 
    },
    // CAMBIO IMPORTANTE: serviceId ahora es opcional
    serviceId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Service", 
      required: false // Cambiado de true a false
    },
    providerId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    },
    businessId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Business" 
    },

    date: { 
      type: String, 
      required: true 
    },
    time: { 
      type: String, 
      required: true 
    },

    notes: { 
      type: String, 
      default: "" 
    },

    // Asegurar que estos campos estén siempre disponibles
    serviceName: { 
      type: String, 
      required: true, // Añadir required para servicio embebido
      default: "Servicio" 
    },
    servicePrice: { 
      type: Number, 
      required: true, // Añadir required para servicio embebido
      default: 0 
    },
    serviceDuration: { 
      type: Number, 
      required: true, // Añadir required para servicio embebido
      default: 60 
    },

    businessName: { 
      type: String, 
      default: "" 
    },
    businessAddress: { 
      type: String, 
      default: "" 
    },
    businessPhone: { 
      type: String, 
      default: "" 
    },

    // Campo para identificar servicios embebidos
    isEmbeddedService: {
      type: Boolean,
      default: false
    },

    // Estados en español para consistencia con el controlador
    status: {
      type: String,
      enum: [
        "pendiente",
        "confirmada", 
        "cancelada",
        "completada",
        "reprogramada"
      ],
      default: "pendiente"
    },

    // Historial de cambios de estado
    statusHistory: [{
      from: String,
      to: String,
      changedAt: Date,
      changedBy: mongoose.Schema.Types.ObjectId,
      changedByRole: String,
      reason: String
    }],

    previousDate: { 
      type: String 
    },
    previousTime: { 
      type: String 
    },
    rescheduleReason: { 
      type: String, 
      default: "" 
    },

    // Timestamps de acciones
    cancelledAt: { 
      type: Date 
    },
    rescheduledAt: { 
      type: Date 
    },
    completedAt: { 
      type: Date 
    },

    // Usuarios que realizaron acciones
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    createdByRole: {
      type: String,
      enum: ["user", "admin", "provider"],
      default: "user"
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    updatedByRole: {
      type: String,
      enum: ["user", "admin", "provider"]
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    rescheduledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    // Campo para compatibilidad con versiones anteriores
    appointmentCreatedAt: { 
      type: Date, 
      default: Date.now 
    }
  },
  { 
    timestamps: true 
  }
);

// Índices para mejor rendimiento
appointmentSchema.index({ userId: 1, date: 1, time: 1 });
appointmentSchema.index({ userId: 1, status: 1 });
appointmentSchema.index({ providerId: 1, date: 1, status: 1 });
appointmentSchema.index({ businessId: 1, date: 1 });
appointmentSchema.index({ serviceId: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ date: 1 });

// Middleware pre-save para asegurar datos mínimos
appointmentSchema.pre('save', function(next) {
  // Si es servicio embebido, asegurar que tengamos nombre de servicio
  if (this.isEmbeddedService && (!this.serviceName || this.serviceName === '')) {
    this.serviceName = 'Servicio embebido';
  }
  
  // Asegurar precios y duraciones válidas
  if (!this.servicePrice || this.servicePrice < 0) {
    this.servicePrice = 0;
  }
  
  if (!this.serviceDuration || this.serviceDuration <= 0) {
    this.serviceDuration = 60;
  }
  
  next();
});

// Método para validar si se puede crear la cita
appointmentSchema.statics.canCreateAppointment = async function(userId, petId, date, time) {
  const existingAppointment = await this.findOne({
    userId,
    date,
    time,
    status: { $nin: ['cancelada', 'completada'] }
  });
  
  return !existingAppointment;
};

// Método para cambiar estado con validación
appointmentSchema.methods.changeStatus = function(newStatus, changedBy, changedByRole, reason = '') {
  const validTransitions = {
    'pendiente': ['confirmada', 'cancelada'],
    'confirmada': ['completada', 'cancelada', 'reprogramada'],
    'reprogramada': ['confirmada', 'cancelada', 'completada'],
    'completada': [],
    'cancelada': []
  };
  
  const currentStatus = this.status;
  
  if (!validTransitions[currentStatus]) {
    throw new Error(`Estado actual "${currentStatus}" no tiene transiciones definidas`);
  }
  
  if (!validTransitions[currentStatus].includes(newStatus)) {
    throw new Error(`No se puede cambiar de "${currentStatus}" a "${newStatus}"`);
  }
  
  // Actualizar estado
  this.status = newStatus;
  
  // Registrar historial
  if (!this.statusHistory) {
    this.statusHistory = [];
  }
  
  this.statusHistory.push({
    from: currentStatus,
    to: newStatus,
    changedAt: new Date(),
    changedBy,
    changedByRole,
    reason
  });
  
  // Setear timestamps según el estado
  const now = new Date();
  if (newStatus === 'cancelada') {
    this.cancelledAt = now;
    this.cancelledBy = changedBy;
  } else if (newStatus === 'completada') {
    this.completedAt = now;
    this.completedBy = changedBy;
  } else if (newStatus === 'reprogramada') {
    this.rescheduledAt = now;
    this.rescheduledBy = changedBy;
  }
  
  return this;
};

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;