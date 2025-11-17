import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },

    providerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    providerName: { type: String, default: "Admin" },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "paused"],
      default: "approved",
    },

    providerServiceId: { type: mongoose.Schema.Types.ObjectId, ref: "ProviderService", default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Service", serviceSchema);
