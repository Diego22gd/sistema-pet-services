import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
  type: { type: String, default: "Monthly" },
  startDate: { type: Date, default: Date.now },
  expirationDate: { type: Date },
});

const providerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  serviceType: { type: String, required: true },
  paused: { type: Boolean, default: false },
  subscription: { type: subscriptionSchema, default: {} },
});

export default mongoose.model("Provider", providerSchema);
