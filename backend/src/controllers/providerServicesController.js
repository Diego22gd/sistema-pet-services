import ProviderService from "../models/ProviderService.js";
import Service from "../models/Service.js";

// Obtener servicios del proveedor
export const getProviderServices = async (req, res) => {
  try {
    const services = await ProviderService.find({ providerId: req.user._id });
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Crear servicio del proveedor
export const createProviderService = async (req, res) => {
  try {
    const newService = await ProviderService.create({
      providerId: req.user._id,
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      status: "pending"
    });

    await Service.create({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      providerId: req.user._id,
      providerName: req.user.name,
      status: "pending",
      providerServiceId: newService._id
    });

    res.status(201).json(newService);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Editar servicio
export const updateProviderService = async (req, res) => {
  try {
    const updated = await ProviderService.findOneAndUpdate(
      { _id: req.params.id, providerId: req.user._id },
      req.body,
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ message: "Service not found" });

    await Service.findOneAndUpdate(
      { providerServiceId: req.params.id },
      {
        name: updated.name,
        description: updated.description,
        price: updated.price
      }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Eliminar servicio
export const deleteProviderService = async (req, res) => {
  try {
    const deleted = await ProviderService.findOneAndDelete({
      _id: req.params.id,
      providerId: req.user._id
    });

    if (!deleted)
      return res.status(404).json({ message: "Service not found" });

    await Service.findOneAndDelete({ providerServiceId: req.params.id });

    res.json({ message: "Service deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Pausar servicio
export const pauseService = async (req, res) => {
  try {
    const updated = await ProviderService.findOneAndUpdate(
      { _id: req.params.id, providerId: req.user._id },
      { status: "paused" },
      { new: true }
    );

    await Service.findOneAndUpdate(
      { providerServiceId: req.params.id },
      { status: "paused" }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Reanudar servicio
export const resumeService = async (req, res) => {
  try {
    const updated = await ProviderService.findOneAndUpdate(
      { _id: req.params.id, providerId: req.user._id },
      { status: "approved" },
      { new: true }
    );

    await Service.findOneAndUpdate(
      { providerServiceId: req.params.id },
      { status: "approved" }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
