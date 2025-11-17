import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema({
  open: { type: String, default: "" },
  close: { type: String, default: "" },
});

const providerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    businessName: { type: String, required: true },
    description: { type: String, default: "" },
    category: { type: String, required: true },

    phone: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, default: "" },

    schedule: {
      Lunes: scheduleSchema,
      Martes: scheduleSchema,
      Miércoles: scheduleSchema,
      Jueves: scheduleSchema,
      Viernes: scheduleSchema,
      Sábado: scheduleSchema,
      Domingo: scheduleSchema,
    },
  },
  { timestamps: true }
);

export default mongoose.model("ProviderProfile", providerProfileSchema);
