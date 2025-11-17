import ProviderProfile from "../models/ProviderProfile.js";

// ===========================
// 🔹 Obtener perfil del proveedor
// ===========================
export const getProviderProfile = async (req, res) => {
  try {
    const profile = await ProviderProfile.findOne({ userId: req.params.id });

    if (!profile) {
      return res.status(404).json({ message: "Perfil no encontrado" });
    }

    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===========================
// 🔹 Crear perfil (solo si no existe)
// ===========================
export const createProviderProfile = async (req, res) => {
  try {
    const exists = await ProviderProfile.findOne({ userId: req.body.userId });

    if (exists) {
      return res.status(400).json({ message: "El perfil ya existe" });
    }

    const profile = await ProviderProfile.create(req.body);

    res.status(201).json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===========================
// 🔹 Actualizar perfil
// ===========================
export const updateProviderProfile = async (req, res) => {
  try {
    const profile = await ProviderProfile.findOne({ userId: req.params.id });

    if (!profile) {
      return res.status(404).json({ message: "Perfil no encontrado" });
    }

    Object.assign(profile, req.body); // Mezclar campos enviados
    const updated = await profile.save();

    res.json({
      message: "Perfil actualizado correctamente",
      profile: updated,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
