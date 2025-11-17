// backend/src/models/Subscription.js
import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  plan: {
    type: String,
    enum: ["basic", "premium", "enterprise"],
    default: "basic",
  },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  status: {
    type: String,
    enum: ["active", "expired", "cancelled"],
    default: "active",
  },
  price: { type: Number, default: 0 },
});

export default mongoose.model("Subscription", subscriptionSchema);
