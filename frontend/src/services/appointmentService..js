import axios from 'axios'

const API_URL = 'http://localhost:5000/api/appointments' // Cambia según tu backend

const getAuthHeader = () => {
  const user = JSON.parse(localStorage.getItem('user'))
  if (user && user.token) {
    return { headers: { Authorization: `Bearer ${user.token}` } }
  }
  return {}
}

const getAllAppointments = async () => {
  try {
    const response = await axios.get(API_URL, getAuthHeader())
    return response.data
  } catch (error) {
    console.error('Error obteniendo citas:', error)
    throw error
  }
}

const getUserAppointments = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/user/${userId}`, getAuthHeader())
    return response.data
  } catch (error) {
    console.error('Error obteniendo citas del usuario:', error)
    throw error
  }
}

const createAppointment = async (appointmentData) => {
  try {
    const response = await axios.post(API_URL, appointmentData, getAuthHeader())
    return response.data
  } catch (error) {
    console.error('Error creando cita:', error)
    throw error
  }
}

const updateAppointment = async (appointmentId, updatedData) => {
  try {
    const response = await axios.put(`${API_URL}/${appointmentId}`, updatedData, getAuthHeader())
    return response.data
  } catch (error) {
    console.error('Error actualizando cita:', error)
    throw error
  }
}

const deleteAppointment = async (appointmentId) => {
  try {
    const response = await axios.delete(`${API_URL}/${appointmentId}`, getAuthHeader())
    return response.data
  } catch (error) {
    console.error('Error eliminando cita:', error)
    throw error
  }
}

export default {
  getAllAppointments,
  getUserAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment
}
