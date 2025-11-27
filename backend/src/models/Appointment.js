// models/Appointment.js
import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    petId: { type: mongoose.Schema.Types.ObjectId, ref: "Pet", required: true },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },

    date: { type: String, required: true },
    time: { type: String, required: true },

    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "rescheduled"],
      default: "pending"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Appointment", appointmentSchema);
