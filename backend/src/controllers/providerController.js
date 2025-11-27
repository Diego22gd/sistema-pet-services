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
    const { name, email, phone, serviceType } = req.body;

    const expirationDate = new Date();
    expirationDate.setMonth(expirationDate.getMonth() + 1);

    const provider = await User.create({
      name,
      email,
      phone,
      serviceType,
      role: "provider",
      subscription: {
        type: "Monthly",
        startDate: new Date(),
        expirationDate,
      },
    });

    res.status(201).json(provider);
  } catch (error) {
    res.status(500).json({ message: "Error creating provider", error });
  }
};

// Actualizar proveedor
export const updateProvider = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await User.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Provider not found" });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating provider", error });
  }
};

// Eliminar proveedor
export const deleteProvider = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Provider not found" });

    res.json({ message: "Provider deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting provider", error });
  }
};

// Pausar suscripción
export const pauseSubscription = async (req, res) => {
  try {
    const { id } = req.params;

    const provider = await User.findByIdAndUpdate(
      id,
      { paused: true },
      { new: true }
    );

    res.json(provider);
  } catch (error) {
    res.status(500).json({ message: "Error pausing subscription", error });
  }
};

// Reanudar suscripción
export const resumeSubscription = async (req, res) => {
  try {
    const { id } = req.params;

    const provider = await User.findByIdAndUpdate(
      id,
      { paused: false },
      { new: true }
    );

    res.json(provider);
  } catch (error) {
    res.status(500).json({ message: "Error resuming subscription", error });
  }
};

// Renovar suscripción
export const renewSubscription = async (req, res) => {
  try {
    const { id } = req.params;

    const provider = await User.findById(id);
    if (!provider) return res.status(404).json({ message: "Provider not found" });

    const expiration = new Date(provider.subscription.expirationDate);
    expiration.setMonth(expiration.getMonth() + 1);

    provider.subscription.expirationDate = expiration;

    await provider.save();

    res.json(provider);
  } catch (error) {
    res.status(500).json({ message: "Error renewing subscription", error });
  }
};
