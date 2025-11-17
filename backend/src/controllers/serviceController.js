// backend/controllers/serviceController.js
import Service from "../models/Service.js";
import User from "../models/User.js";

// ➕ Crear servicio
export const createService = async (req, res) => {
  try {
    const { name, shortDescription, fullDescription, price, serviceType, location, images } = req.body;
    const providerId = req.user.id;

    const service = await Service.create({
      name,
      shortDescription,
      fullDescription,
      price,
      serviceType,
      location,
      images,
      provider: providerId,
      approved: req.user.role === "admin" ? true : false,
    });

    res.status(201).json({
      message: "Servicio creado exitosamente",
      service,
    });
  } catch (error) {
    console.error("Error al crear servicio:", error);
    res.status(500).json({ message: "Error al crear servicio", error: error.message });
  }
};

// 📋 Obtener todos los servicios aprobados
export const getServices = async (req, res) => {
  try {
    const services = await Service.find({ approved: true }).populate("provider", "name lastname email");
    res.json(services);
  } catch (error) {
    console.error("Error al obtener servicios:", error);
    res.status(500).json({ message: "Error al obtener servicios", error: error.message });
  }
};

// 🕓 Obtener servicios pendientes (solo admin)
export const getPendingServices = async (req, res) => {
  try {
    const pending = await Service.find({ approved: false }).populate("provider", "name lastname email");
    res.json(pending);
  } catch (error) {
    console.error("Error al obtener servicios pendientes:", error);
    res.status(500).json({ message: "Error al obtener servicios pendientes", error: error.message });
  }
};

// ✅ Aprobar servicio (admin)
export const approveService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findById(id);
    if (!service) return res.status(404).json({ message: "Servicio no encontrado" });

    service.approved = true;
    await service.save();

    res.json({ message: "Servicio aprobado exitosamente", service });
  } catch (error) {
    console.error("Error al aprobar servicio:", error);
    res.status(500).json({ message: "Error al aprobar servicio", error: error.message });
  }
};

// 👨‍🔧 Obtener servicios del proveedor autenticado
export const getMyServices = async (req, res) => {
  try {
    const services = await Service.find({ provider: req.user.id });
    res.json(services);
  } catch (error) {
    console.error("Error al obtener mis servicios:", error);
    res.status(500).json({ message: "Error al obtener servicios", error: error.message });
  }
};

// ✏️ Actualizar servicio
export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findById(id);
    if (!service) return res.status(404).json({ message: "Servicio no encontrado" });

    if (service.provider.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "No tienes permiso para editar este servicio" });
    }

    const { name, shortDescription, fullDescription, price, serviceType, location, images } = req.body;

    Object.assign(service, {
      name,
      shortDescription,
      fullDescription,
      price,
      serviceType,
      location,
      images,
      approved: req.user.role === "admin" ? true : false,
    });

    await service.save();
    res.json({ message: "Servicio actualizado correctamente", service });
  } catch (error) {
    console.error("Error al actualizar servicio:", error);
    res.status(500).json({ message: "Error al actualizar servicio", error: error.message });
  }
};

// 🗑️ Eliminar servicio
export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findById(id);

    if (!service) return res.status(404).json({ message: "Servicio no encontrado" });

    if (service.provider.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "No tienes permiso para eliminar este servicio" });
    }

    await service.deleteOne();
    res.json({ message: "Servicio eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar servicio:", error);
    res.status(500).json({ message: "Error al eliminar servicio", error: error.message });
  }
};
