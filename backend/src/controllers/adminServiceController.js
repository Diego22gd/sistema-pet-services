import Service from "../models/Service.js";
import ProviderService from "../models/ProviderService.js";

// Obtener todos los servicios
export const getAllServices = async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    res.json(services);
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({ message: "Error fetching services" });
  }
};

// Crear servicio (Admin)
export const createService = async (req, res) => {
  try {
    const { name, description, price, providerName } = req.body;

    if (!name || !description || price === undefined)
      return res.status(400).json({ message: "Missing required fields" });

    const service = await Service.create({
      name,
      description,
      price,
      providerName: providerName || "Admin",
      providerId: null,
      status: "approved"
    });

    res.status(201).json(service);
  } catch (error) {
    console.error("Error creating service:", error);
    res.status(500).json({ message: "Error creating service" });
  }
};

// Editar servicio + sincronización
export const updateService = async (req, res) => {
  try {
    const id = req.params.id;
    const updates = req.body;

    // Actualizar servicio principal
    const service = await Service.findByIdAndUpdate(id, updates, { new: true });
    if (!service) return res.status(404).json({ message: "Service not found" });

    // Si es un servicio creado por un proveedor → sincronizar
    if (service.providerServiceId) {
      await ProviderService.findByIdAndUpdate(service.providerServiceId, {
        name: updates.name,
        description: updates.description,
        price: updates.price,
        status: updates.status
      });
    }

    res.json(service);
  } catch (error) {
    console.error("Error updating service:", error);
    res.status(500).json({ message: "Error updating service" });
  }
};

// Eliminar servicio
export const deleteService = async (req, res) => {
  try {
    const id = req.params.id;

    const service = await Service.findByIdAndDelete(id);
    if (!service) return res.status(404).json({ message: "Service not found" });

    // Si está vinculado a ProviderService → eliminar allá también
    if (service.providerServiceId) {
      await ProviderService.findByIdAndDelete(service.providerServiceId);
    }

    res.json({ message: "Service deleted successfully" });
  } catch (error) {
    console.error("Error deleting service:", error);
    res.status(500).json({ message: "Error deleting service" });
  }
};
