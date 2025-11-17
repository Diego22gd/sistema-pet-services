import Provider from "../models/Provider.js";

// Obtener todos los proveedores
export const getProviders = async (req, res) => {
  try {
    const providers = await Provider.find();
    res.json(providers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching providers", error });
  }
};

// Crear un nuevo proveedor
export const createProvider = async (req, res) => {
  try {
    const { name, email, phone, serviceType } = req.body;

    const expirationDate = new Date();
    expirationDate.setMonth(expirationDate.getMonth() + 1);

    const provider = new Provider({
      name,
      email,
      phone,
      serviceType,
      subscription: {
        type: "Monthly",
        startDate: new Date(),
        expirationDate,
      },
    });

    await provider.save();
    res.status(201).json(provider);
  } catch (error) {
    res.status(500).json({ message: "Error creating provider", error });
  }
};

// Actualizar un proveedor
export const updateProvider = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Provider.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Provider not found" });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating provider", error });
  }
};

// Eliminar un proveedor
export const deleteProvider = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Provider.findByIdAndDelete(id);
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
    const provider = await Provider.findByIdAndUpdate(id, { paused: true }, { new: true });
    res.json(provider);
  } catch (error) {
    res.status(500).json({ message: "Error pausing subscription", error });
  }
};

// Reanudar suscripción
export const resumeSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const provider = await Provider.findByIdAndUpdate(id, { paused: false }, { new: true });
    res.json(provider);
  } catch (error) {
    res.status(500).json({ message: "Error resuming subscription", error });
  }
};

// Renovar suscripción (agrega un mes)
export const renewSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const provider = await Provider.findById(id);
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
