import mongoose from "mongoose";

const providerServiceSchema = new mongoose.Schema(
  {
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "paused"],
      default: "pending",
    }
  },
  { timestamps: true }
);

export default mongoose.model("ProviderService", providerServiceSchema);
