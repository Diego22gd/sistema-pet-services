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
      required: [true, "El apellido es obligatorio"],
      trim: true,
    },
    cedula: {
      type: String,
      trim: true,
      unique: false,
      index: true,
      sparse: true, // Permite valores null/undefined en índices únicos
    },
    rif: {
      type: String,
      trim: true,
      unique: false,
      index: true,
      sparse: true,
    },
    phone: {
      type: String,
      required: [true, "El teléfono es obligatorio"],
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
      match: [/^\S+@\S+\.\S+$/, "Por favor ingresa un email válido"],
    },
    password: {
      type: String,
      required: [true, "La contraseña es obligatoria"],
      minlength: [8, "La contraseña debe tener al menos 8 caracteres"],
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
      required: true,
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
    },

    // Verificación de email
    emailVerified: {
      type: Boolean,
      default: false
    },

    // Token para verificación de email
    emailVerificationToken: {
      type: String
    },

    // Token para reset de contraseña
    resetPasswordToken: {
      type: String
    },

    resetPasswordExpires: {
      type: Date
    }
  },
  {
    timestamps: true,
  }
);

// Índice compuesto para evitar duplicados en cédula/RIF por rol
userSchema.index({ cedula: 1, role: 1 }, { 
  unique: true, 
  sparse: true,
  partialFilterExpression: { cedula: { $exists: true, $ne: null } }
});

userSchema.index({ rif: 1, role: 1 }, { 
  unique: true, 
  sparse: true,
  partialFilterExpression: { rif: { $exists: true, $ne: null } }
});

const User = mongoose.model("User", userSchema);

export default User;