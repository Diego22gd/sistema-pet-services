// Configuración de API para producción/desarrollo
const API_CONFIG = {
  // En desarrollo usa localhost, en producción usa ruta relativa
  baseURL: import.meta.env.VITE_API_BASE_URL || 
    (import.meta.env.MODE === 'production' ? '/api' : 'http://localhost:4000/api'),
  
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
};

// Función para verificar conexión
export const checkApiHealth = async () => {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}/health`);
    return response.ok;
  } catch (error) {
    console.error('API Health check failed:', error);
    return false;
  }
};

export default API_CONFIG;