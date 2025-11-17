import api from "./api"; // tu instancia de axios ya configurada con baseURL y token

// 🔹 Servicios públicos (aprobados)
export const getServices = async () => {
  try {
    const res = await api.get("/services"); // GET /services
    return res.data;
  } catch (error) {
    console.error("Error al obtener servicios:", error);
    throw new Error(error.response?.data?.message || "Error al obtener servicios");
  }
};

// 🔹 Servicios pendientes (solo admin)
export const getPendingServices = async () => {
  try {
    const res = await api.get("/services/pending"); // GET /services/pending
    return res.data;
  } catch (error) {
    console.error("Error al obtener servicios pendientes:", error);
    throw new Error(error.response?.data?.message || "Error al obtener servicios pendientes");
  }
};

// 🔹 Crear servicio (admin o provider)
export const createService = async (serviceData) => {
  try {
    const res = await api.post("/services", serviceData);
    return res.data;
  } catch (error) {
    console.error("Error al crear servicio:", error);
    throw new Error(error.response?.data?.message || "Error al crear servicio");
  }
};

// 🔹 Obtener servicios propios (provider)
export const getMyServices = async () => {
  try {
    const res = await api.get("/services/my-services");
    return res.data;
  } catch (error) {
    console.error("Error al obtener mis servicios:", error);
    throw new Error(error.response?.data?.message || "Error al obtener mis servicios");
  }
};

// 🔹 Aprobar servicio (solo admin)
export const approveService = async (serviceId) => {
  try {
    const res = await api.put(`/services/approve/${serviceId}`);
    return res.data;
  } catch (error) {
    console.error("Error al aprobar servicio:", error);
    throw new Error(error.response?.data?.message || "Error al aprobar servicio");
  }
};

// 🔹 Editar servicio (propio o admin)
export const updateService = async (serviceId, serviceData) => {
  try {
    const res = await api.put(`/services/${serviceId}`, serviceData);
    return res.data;
  } catch (error) {
    console.error("Error al actualizar servicio:", error);
    throw new Error(error.response?.data?.message || "Error al actualizar servicio");
  }
};

// 🔹 Eliminar servicio (propio o admin)
export const deleteService = async (serviceId) => {
  try {
    const res = await api.delete(`/services/${serviceId}`);
    return res.data;
  } catch (error) {
    console.error("Error al eliminar servicio:", error);
    throw new Error(error.response?.data?.message || "Error al eliminar servicio");
  }
};
