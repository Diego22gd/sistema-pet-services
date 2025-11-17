// backend/models/Appointment.js
import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true 
  },

  pet: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Pet",
    required: true 
  },

  service: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Service",
    required: true 
  },

  date: { 
    type: String, 
    required: true 
  },

  time: { 
    type: String, 
    required: true 
  },

  status: { 
    type: String, 
    enum: ["pendiente", "confirmada", "reprogramada", "cancelada"], 
    default: "pendiente" 
  },

  location: { type: String },

  details: { type: String },

  images: [{ type: String }],

  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

export default mongoose.model("Appointment", appointmentSchema);