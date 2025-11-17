import Service from "../models/Service.js";

export const getApprovedServices = async (req, res) => {
  try {
    const services = await Service.find({ status: "approved" })
      .select("name description price providerName providerId status");

    res.json(services);
  } catch (error) {
    console.error("Error cargando servicios:", error);
    res.status(500).json({ message: "Error cargando servicios" });
  }
};

