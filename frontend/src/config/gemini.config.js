// config/gemini.config.js
export const GEMINI_CONFIG = {
  // API Key desde variables de entorno
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_KEY,
  
  // URL base con validación
  baseUrl: "https://generativelanguage.googleapis.com/v1beta",
  
  // Modelo configurable
  model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
  
  // Configuración de generación
  generationConfig: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 1024,
  },
  
  // Timeout y reintentos
  timeout: 25000,
  maxRetries: 2,
  
  // Rate limiting
  rateLimit: {
    requestsPerMinute: 15,
    requestsPerHour: 200
  }
};

// Validar configuración
export function validateConfig() {
  if (!GEMINI_CONFIG.apiKey) {
    throw new Error("GEMINI_API_KEY no está configurada en las variables de entorno");
  }
  return true;
}