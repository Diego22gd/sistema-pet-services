// services/chatService.js
import { GEMINI_CONFIG, validateConfig } from '@/config/gemini.config';
import User from '@/models/User';
import Pet from '@/models/Pet';
import Service from '@/models/Service';
import Appointment from '@/models/Appointment';

export class ChatService {
  constructor() {
    validateConfig();
    this.apiUrl = `${GEMINI_CONFIG.baseUrl}/models/${GEMINI_CONFIG.model}:generateContent?key=${GEMINI_CONFIG.apiKey}`;
  }

  async generateResponse(userMessage, user, context = "") {
    try {
      // 1. Detectar intención
      const intent = this.detectIntent(userMessage, user.role);
      
      // 2. Generar respuesta con datos si es necesario
      const dataResponse = await this.generateDataResponse(intent, user);
      if (dataResponse) return dataResponse;
      
      // 3. Usar Gemini para respuestas complejas
      return await this.callGeminiAPI(userMessage, user, context);
      
    } catch (error) {
      console.error("ChatService error:", error);
      return this.getFallbackResponse(error, user.role);
    }
  }

  async callGeminiAPI(userMessage, user, context = "") {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), GEMINI_CONFIG.timeout);

    try {
      const prompt = this.buildPrompt(userMessage, user, context);
      
      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: GEMINI_CONFIG.generationConfig
        }),
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      return this.parseGeminiResponse(data);

    } catch (error) {
      clearTimeout(timeout);
      throw error;
    }
  }

  buildPrompt(userMessage, user, context) {
    const systemPrompt = this.getSystemPrompt(user.role);
    return `${systemPrompt}\n\nUsuario: ${user.name} (${user.role})\n${context ? `Contexto: ${context}\n` : ''}Consulta: ${userMessage}`;
  }

  // ... otros métodos del servicio
}

export default new ChatService();