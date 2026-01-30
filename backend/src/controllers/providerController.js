import User from "../models/User.js";

// Obtener todos los proveedores
export const getProviders = async (req, res) => {
  try {
    const providers = await User.find({ role: "provider" }).select("-password");
    res.json(providers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching providers", error });
  }
};

// Crear un proveedor
export const createProvider = async (req, res) => {
  try {
    const { name, email, phone, serviceType, password, rif, businessName, birthdate, address, isActive } = req.body;

    const expirationDate = new Date();
    expirationDate.setMonth(expirationDate.getMonth() + 1);

    const provider = await User.create({
      name,
      email,
      phone,
      serviceType,
      password, // Asegúrate de que el modelo maneje el hash
      rif: rif || "",
      businessName: businessName || "",
      birthdate: birthdate || null,
      address: address || "",
      isActive: isActive !== undefined ? isActive : true, // Por defecto activo
      role: "provider",
      subscription: {
        type: "Monthly",
        startDate: new Date(),
        expirationDate,
        paused: false,
      },
    });

    // Excluir la contraseña en la respuesta
    const providerResponse = provider.toObject();
    delete providerResponse.password;

    res.status(201).json(providerResponse);
  } catch (error) {
    console.error("Error creating provider:", error);
    res.status(500).json({ 
      message: "Error creating provider", 
      error: error.message,
      details: error.errors || "Validation error"
    });
  }
};

// Actualizar proveedor
export const updateProvider = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    // Si se envía password vacío, eliminarlo del update
    if (updateData.password === "" || updateData.password === null) {
      delete updateData.password;
    }
    
    // Actualizar fecha de modificación
    updateData.updatedAt = new Date();
    
    const updated = await User.findByIdAndUpdate(id, updateData, { 
      new: true,
      runValidators: true 
    }).select("-password");
    
    if (!updated) {
      return res.status(404).json({ 
        success: false,
        message: "Proveedor no encontrado" 
      });
    }

    res.json({
      success: true,
      message: "Proveedor actualizado exitosamente",
      provider: updated
    });
  } catch (error) {
    console.error("Error updating provider:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al actualizar el proveedor", 
      error: error.message 
    });
  }
};

// Eliminar proveedor
export const deleteProvider = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await User.findByIdAndDelete(id);
    
    if (!deleted) {
      return res.status(404).json({ 
        success: false,
        message: "Proveedor no encontrado" 
      });
    }

    res.json({ 
      success: true,
      message: "Proveedor eliminado exitosamente" 
    });
  } catch (error) {
    console.error("Error deleting provider:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al eliminar el proveedor", 
      error: error.message 
    });
  }
};

// Pausar suscripción
export const pauseSubscription = async (req, res) => {
  try {
    const { id } = req.params;

    const provider = await User.findByIdAndUpdate(
      id,
      { 
        "subscription.paused": true,
        updatedAt: new Date()
      },
      { new: true }
    ).select("-password");

    if (!provider) {
      return res.status(404).json({ 
        success: false,
        message: "Proveedor no encontrado" 
      });
    }

    res.json({
      success: true,
      message: "Suscripción pausada exitosamente",
      provider
    });
  } catch (error) {
    console.error("Error pausing subscription:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al pausar la suscripción", 
      error: error.message 
    });
  }
};

// Reanudar suscripción
export const resumeSubscription = async (req, res) => {
  try {
    const { id } = req.params;

    const provider = await User.findByIdAndUpdate(
      id,
      { 
        "subscription.paused": false,
        updatedAt: new Date()
      },
      { new: true }
    ).select("-password");

    if (!provider) {
      return res.status(404).json({ 
        success: false,
        message: "Proveedor no encontrado" 
      });
    }

    res.json({
      success: true,
      message: "Suscripción reanudada exitosamente",
      provider
    });
  } catch (error) {
    console.error("Error resuming subscription:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al reanudar la suscripción", 
      error: error.message 
    });
  }
};

// Renovar suscripción
export const renewSubscription = async (req, res) => {
  try {
    const { id } = req.params;

    const provider = await User.findById(id);
    
    if (!provider) {
      return res.status(404).json({ 
        success: false,
        message: "Proveedor no encontrado" 
      });
    }

    // Si no tiene suscripción, crear una nueva
    if (!provider.subscription) {
      const expirationDate = new Date();
      expirationDate.setMonth(expirationDate.getMonth() + 1);
      
      provider.subscription = {
        type: "Monthly",
        startDate: new Date(),
        expirationDate,
        paused: false,
      };
    } else {
      // Renovar la suscripción existente
      const expiration = new Date(provider.subscription.expirationDate || new Date());
      expiration.setMonth(expiration.getMonth() + 1);
      provider.subscription.expirationDate = expiration;
    }
    
    provider.updatedAt = new Date();
    await provider.save();

    const providerResponse = provider.toObject();
    delete providerResponse.password;

    res.json({
      success: true,
      message: "Suscripción renovada exitosamente",
      provider: providerResponse
    });
  } catch (error) {
    console.error("Error renewing subscription:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al renovar la suscripción", 
      error: error.message 
    });
  }
};

// BLOQUEAR/DESBLOQUEAR PROVEEDOR
export const toggleProviderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔧 Cambiando estado del proveedor ID: ${id}`);

    // Buscar el proveedor
    const provider = await User.findById(id);
    
    if (!provider) {
      console.log(`❌ Proveedor con ID ${id} no encontrado`);
      return res.status(404).json({ 
        success: false, 
        message: "Proveedor no encontrado" 
      });
    }

    console.log(`📊 Proveedor encontrado: ${provider.email}, Estado actual: ${provider.isActive}`);
    
    // Alternar el estado (true → false, false → true)
    // Si isActive es undefined, establecerlo como false (bloqueado)
    const newStatus = provider.isActive === undefined ? false : !provider.isActive;
    
    // Actualizar el proveedor
    const result = await User.updateOne(
      { _id: id },
      { 
        $set: { 
          isActive: newStatus,
          lastLogin: new Date(),
          updatedAt: new Date()
        } 
      }
    );

    if (result.modifiedCount === 0) {
      console.log(`⚠️ No se pudo actualizar el proveedor ${id}`);
      return res.status(400).json({
        success: false,
        message: "No se pudo cambiar el estado del proveedor"
      });
    }

    // Obtener el proveedor actualizado
    const updatedProvider = await User.findById(id).select("-password");
    
    console.log(`✅ Estado cambiado: ${provider.email} -> ${newStatus ? 'ACTIVO' : 'BLOQUEADO'}`);

    res.status(200).json({
      success: true,
      message: newStatus 
        ? "Proveedor activado exitosamente" 
        : "Proveedor bloqueado exitosamente",
      provider: updatedProvider
    });
  } catch (error) {
    console.error("❌ ERROR en toggleProviderStatus:", error);
    console.error("Stack trace:", error.stack);
    
    res.status(500).json({ 
      success: false,
      message: "Error interno del servidor al cambiar el estado",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Función alternativa para cambiar estado específico
export const changeProviderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    
    console.log(`🔧 Cambiando estado del proveedor ${id} a: ${isActive}`);
    
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ 
        success: false,
        message: "El campo isActive debe ser un booleano" 
      });
    }
    
    const provider = await User.findByIdAndUpdate(
      id,
      { 
        isActive, 
        lastLogin: new Date(),
        updatedAt: new Date() 
      },
      { 
        new: true, 
        runValidators: true 
      }
    ).select("-password");
    
    if (!provider) {
      return res.status(404).json({ 
        success: false,
        message: "Proveedor no encontrado" 
      });
    }
    
    res.status(200).json({
      success: true,
      message: isActive 
        ? "Proveedor activado exitosamente" 
        : "Proveedor bloqueado exitosamente",
      provider
    });
  } catch (error) {
    console.error("Error changing provider status:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al cambiar el estado del proveedor", 
      error: error.message 
    });
  }
};