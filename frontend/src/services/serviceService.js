import axios from 'axios'

const API_URL = 'http://localhost:5000/api/services' // Cambia según tu backend

const getAuthHeader = () => {
  const user = JSON.parse(localStorage.getItem('user'))
  if (user && user.token) {
    return { headers: { Authorization: `Bearer ${user.token}` } }
  }
  return {}
}

const getAllServices = async () => {
  try {
    const response = await axios.get(API_URL, getAuthHeader())
    return response.data
  } catch (error) {
    console.error('Error obteniendo servicios:', error)
    throw error
  }
}

const getServiceById = async (serviceId) => {
  try {
    const response = await axios.get(`${API_URL}/${serviceId}`, getAuthHeader())
    return response.data
  } catch (error) {
    console.error('Error obteniendo servicio:', error)
    throw error
  }
}

const createService = async (serviceData) => {
  try {
    const response = await axios.post(API_URL, serviceData, getAuthHeader())
    return response.data
  } catch (error) {
    console.error('Error creando servicio:', error)
    throw error
  }
}

const updateService = async (serviceId, updatedData) => {
  try {
    const response = await axios.put(`${API_URL}/${serviceId}`, updatedData, getAuthHeader())
    return response.data
  } catch (error) {
    console.error('Error actualizando servicio:', error)
    throw error
  }
}

const deleteService = async (serviceId) => {
  try {
    const response = await axios.delete(`${API_URL}/${serviceId}`, getAuthHeader())
    return response.data
  } catch (error) {
    console.error('Error eliminando servicio:', error)
    throw error
  }
}

export default {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService
}
