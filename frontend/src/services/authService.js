import axios from 'axios'

const API_URL = 'http://localhost:5000/api/auth' // Cambia según tu backend

const register = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/register`, userData)
    return response.data
  } catch (error) {
    console.error('Error en registro:', error)
    throw error
  }
}

const login = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/login`, credentials)
    // Guardar token y datos de usuario en localStorage
    if (response.data.token) {
      localStorage.setItem('user', JSON.stringify(response.data))
    }
    return response.data
  } catch (error) {
    console.error('Error en login:', error)
    throw error
  }
}

const logout = () => {
  localStorage.removeItem('user')
}

export default {
  register,
  login,
  logout
}
