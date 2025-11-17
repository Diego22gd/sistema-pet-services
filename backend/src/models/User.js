import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      trim: true,
    },
    lastname: {
      type: String,
      trim: true,
    },
    cedula: {
      type: String,
      trim: true,
      unique: false,
    },
    phone: {
      type: String,
      trim: true,
    },
    birthdate: {
      type: Date,
    },
    address: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "El correo es obligatorio"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "La contraseña es obligatoria"],
      minlength: 6,
    },
    businessName: {
      type: String,
      trim: true,
    },
    serviceType: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ["client", "provider", "admin"],
      default: "client",
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
