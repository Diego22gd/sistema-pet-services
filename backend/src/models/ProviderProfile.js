import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema(
  {
    Lunes: {
      open: { type: String, default: "" },
      close: { type: String, default: "" },
    },
    Martes: {
      open: { type: String, default: "" },
      close: { type: String, default: "" },
    },
    Miércoles: {
      open: { type: String, default: "" },
      close: { type: String, default: "" },
    },
    Jueves: {
      open: { type: String, default: "" },
      close: { type: String, default: "" },
    },
    Viernes: {
      open: { type: String, default: "" },
      close: { type: String, default: "" },
    },
    Sábado: {
      open: { type: String, default: "" },
      close: { type: String, default: "" },
    },
    Domingo: {
      open: { type: String, default: "" },
      close: { type: String, default: "" },
    },
  },
  { _id: false }
);

const providerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // 🟦 Información del proveedor
    bio: {
      type: String,
      default: "",
      trim: true,
    },

    experience: {
      type: Number,
      default: 0,
    },

    // Lista simple de servicios disponibles
    services: {
      type: [String],
      default: [],
    },

    // Dirección física del negocio
    address: {
      type: String,
      default: "",
    },

    // 🟩 Horarios por día
    schedule: {
      type: scheduleSchema,
      default: () => ({}),
    },

    // 🟨 Rating promedio
    rating: {
      type: Number,
      default: 0,
    },

    // 🟧 Imágenes (URL)
    images: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const ProviderProfile = mongoose.model("ProviderProfile", providerProfileSchema);

export default ProviderProfile;
