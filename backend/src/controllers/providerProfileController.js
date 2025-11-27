import ProviderProfile from "../models/ProviderProfile.js";
import User from "../models/User.js";

// ===========================
// 🔹 Obtener Perfil + Usuario
// ===========================
export const getProviderProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    let profile = await ProviderProfile.findOne({ userId });

    // Crear perfil vacío si no existe (solo una vez)
    if (!profile) {
      profile = await ProviderProfile.create({ userId });
    }

    res.json({ user, profile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===========================
// 🔹 Crear Perfil (solo si no existe)
// ===========================
export const createProviderProfile = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "Se requiere userId" });
    }

    const exists = await ProviderProfile.findOne({ userId });

    if (exists) {
      return res.status(400).json({ message: "El perfil ya existe" });
    }

    const allowedFields = [
      "userId",
      "bio",
      "experience",
      "services",
      "address",
      "schedule",
      "rating",
      "images"
    ];

    const sanitizedData = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) sanitizedData[field] = req.body[field];
    });

    const profile = await ProviderProfile.create(sanitizedData);

    res.status(201).json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===========================
// 🔹 Actualizar Perfil + Usuario
// ===========================
export const updateProviderProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    let profile = await ProviderProfile.findOne({ userId });

    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
    if (!profile) return res.status(404).json({ message: "Perfil no encontrado" });

    // ========================
    // Actualizar datos de User
    // ========================
    const userFields = ["name", "lastname", "phone", "businessName", "serviceType"];
    userFields.forEach(field => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    // ================================
    // Actualizar datos de ProviderProfile
    // ================================
    const profileFields = [
      "bio",
      "experience",
      "services",
      "address",
      "schedule",
      "rating",
      "images"
    ];

    profileFields.forEach(field => {
      if (req.body[field] !== undefined) {
        profile[field] = req.body[field];
      }
    });

    await user.save();
    await profile.save();

    res.json({
      message: "Perfil actualizado correctamente",
      user,
      profile
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
