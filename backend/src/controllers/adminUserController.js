// controllers/adminUserController.js
import User from "../models/User.js";

// 📍 Obtener todos los usuarios
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "name email role isActive createdAt lastname phone businessName serviceType");
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
};

// 📍 Actualizar usuario
export const updateUser = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updatedUser) return res.status(404).json({ message: "User not found" });
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Error updating user", error: error.message });
  }
};

// 📍 Eliminar usuario
export const deleteUser = async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Error deleting user", error: error.message });
  }
};

// 📍 Bloquear/Desbloquear usuario
export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Toggling status for user ID:", id);
    
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    
    // Alternar el estado
    user.isActive = !user.isActive;
    user.lastLogin = new Date(); // Actualizar última actividad
    
    await user.save();
    
    console.log(`User ${user.email} status changed to: ${user.isActive ? 'active' : 'blocked'}`);
    
    res.status(200).json({
      success: true,
      message: user.isActive ? "Usuario activado exitosamente" : "Usuario bloqueado exitosamente",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error("Error toggling user status:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al cambiar el estado del usuario", 
      error: error.message 
    });
  }
};

// 📍 Alternativa: Cambiar estado específico
export const changeUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ 
        message: "El campo isActive debe ser un booleano" 
      });
    }
    
    const user = await User.findByIdAndUpdate(
      id,
      { isActive, lastLogin: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    
    res.status(200).json({
      success: true,
      message: isActive ? "Usuario activado exitosamente" : "Usuario bloqueado exitosamente",
      user
    });
  } catch (error) {
    console.error("Error changing user status:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al cambiar el estado del usuario", 
      error: error.message 
    });
  }
};