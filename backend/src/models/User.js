import mongoose from "mongoose";

// --- Subdocumento de suscripción (igual que en Provider) ---
const subscriptionSchema = new mongoose.Schema({
  type: { type: String, default: "Monthly" },
  startDate: { type: Date, default: Date.now },
  expirationDate: { type: Date },
  paused: { type: Boolean, default: false },
});

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

    // PROVEEDOR
    businessName: {
      type: String,
      trim: true,
    },
    serviceType: {
      type: String,
      trim: true,
    },

    // ROLE
    role: {
      type: String,
      enum: ["client", "provider", "admin"],
      default: "client",
    },

    // 🚀 **SUBSCRIPTION**
    subscription: {
      type: subscriptionSchema,
      default: {},
    },

    // ===================== CAMPOS PARA COMERCIOS =====================
    favoriteBusinesses: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business'
    }],
    
    recentlyViewedBusinesses: [{
      business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business'
      },
      viewedAt: {
        type: Date,
        default: Date.now
      }
    }],

    // Mascotas del usuario
    pets: [{
      name: { type: String, required: true },
      type: { 
        type: String, 
        enum: ["dog", "cat", "bird", "fish", "reptile", "small_mammal", "other"] 
      },
      breed: { type: String },
      age: { type: Number },
      weight: { type: Number },
      medicalNotes: { type: String },
      createdAt: { type: Date, default: Date.now }
    }],

    // Campos adicionales
    avatar: {
      type: String,
      default: ""
    },
    
    isActive: {
      type: Boolean,
      default: true
    },
    
    lastLogin: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;