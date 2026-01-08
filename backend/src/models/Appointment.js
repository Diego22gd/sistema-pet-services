// models/Appointment.js - VERSIÓN EN ESPAÑOL
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
    serviceId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Service", 
      required: true 
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

    serviceName: { 
      type: String, 
      default: "Servicio" 
    },
    servicePrice: { 
      type: Number, 
      default: 0 
    },
    serviceDuration: { 
      type: Number, 
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

    cancelledAt: { 
      type: Date 
    },
    rescheduledAt: { 
      type: Date 
    },
    completedAt: { 
      type: Date 
    },

    appointmentCreatedAt: { 
      type: Date, 
      default: Date.now 
    }
  },
  { 
    timestamps: true 
  }
);

// Índices
appointmentSchema.index({ userId: 1, date: 1, time: 1 });
appointmentSchema.index({ userId: 1, status: 1 });

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;