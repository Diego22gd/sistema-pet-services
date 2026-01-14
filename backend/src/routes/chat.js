import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import User from "../models/User.js";
import Pet from "../models/Pet.js";
import Business from "../models/Business.js";
import Appointment from "../models/Appointment.js";

const router = express.Router();

// ============================================
// 🔧 CONFIGURACIÓN GEMINI - VERSIÓN CORRECTA
// ============================================

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.warn("⚠️  ADVERTENCIA: Sin API Key. Usando respuestas predefinidas.");
}

// SOLUCIÓN DEFINITIVA: Usar v1alpha para modelos nuevos
const GEMINI_MODEL = 'gemini-1.5-flash'; // Vuelve al modelo original
// Usar v1alpha en lugar de v1beta
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1alpha/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

// ============================================
// 🚀 FUNCIÓN PARA LLAMAR A GEMINI - VERSIÓN CORREGIDA
// ============================================

async function callGeminiAPI(prompt, role = "client") {
  if (!GEMINI_API_KEY) {
    console.log("ℹ️  Usando respuesta predefinida (sin API Key)");
    return getFallbackResponse("general", role);
  }

  try {
    console.log(`🤖 Enviando prompt a Gemini (${GEMINI_MODEL})...`);
    console.log(`🔗 URL: ${GEMINI_API_URL.replace(GEMINI_API_KEY, '***')}`);
    console.log(`📝 Prompt length: ${prompt.length} characters`);
    
    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
          topP: 0.8,
          topK: 40
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH", 
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
      signal: AbortSignal.timeout(30000) // 30 segundos
    });

    console.log(`📡 Respuesta de Gemini: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Error API Gemini (${response.status}):`, errorText.substring(0, 500));
      
      // Manejar errores específicos
      if (response.status === 404) {
        // Intentar con v1beta como fallback
        console.log("🔄 Intentando con API v1beta como fallback...");
        return await tryAlternativeAPI(prompt, role);
      } else if (response.status === 403) {
        throw new Error(`API Key inválida o sin permisos. Verifica GEMINI_API_KEY.`);
      } else if (response.status === 429) {
        throw new Error(`Límite de tasa excedido. Espera un momento.`);
      } else if (response.status === 400) {
        throw new Error(`Solicitud incorrecta: ${errorText.substring(0, 150)}`);
      } else {
        throw new Error(`API error ${response.status}: ${errorText.substring(0, 200)}`);
      }
    }

    const data = await response.json();
    
    if (!data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.warn("⚠️  Respuesta de Gemini vacía o mal formada");
      
      // Verificar si hay bloqueo por seguridad
      if (data?.promptFeedback?.blockReason) {
        console.warn(`🚫 Bloqueado por: ${data.promptFeedback.blockReason}`);
        return "Lo siento, no puedo responder a esa solicitud por razones de seguridad. ¿Puedes reformular tu pregunta?";
      }
      
      return getFallbackResponse("general", role);
    }
    
    const reply = data.candidates[0].content.parts[0].text.trim();
    console.log(`✅ Respuesta recibida (${reply.length} caracteres)`);
    return reply;
    
  } catch (error) {
    console.error("❌ Error en callGeminiAPI:", error.message);
    
    // Mejor manejo de errores específicos
    if (error.name === 'AbortError') {
      return "⏰ La solicitud tardó demasiado. Intenta nuevamente con una pregunta más específica.";
    } else if (error.message.includes('API Key')) {
      console.error("🔑 ERROR: Verifica GEMINI_API_KEY en variables de entorno");
      return getFallbackResponse("general", role);
    }
    
    return getFallbackResponse("general", role);
  }
}

// Función de fallback para intentar con v1beta
async function tryAlternativeAPI(prompt, role) {
  try {
    console.log("🔄 Probando con API v1beta...");
    
    // Lista de modelos compatibles con v1beta
    const betaModels = [
      'gemini-1.0-pro',
      'gemini-pro',
      'gemini-1.5-pro'
    ];
    
    for (const model of betaModels) {
      const betaUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
      console.log(`   Probando modelo: ${model}`);
      
      try {
        const response = await fetch(betaUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt.substring(0, 1000) }] }],
            generationConfig: { maxOutputTokens: 500 }
          }),
          signal: AbortSignal.timeout(10000)
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
            console.log(`✅ Modelo ${model} funciona con v1beta`);
            // Actualizar configuración para futuras llamadas
            GEMINI_MODEL = model;
            GEMINI_API_URL = betaUrl;
            return data.candidates[0].content.parts[0].text.trim();
          }
        }
      } catch (e) {
        console.log(`   Modelo ${model} falló: ${e.message}`);
      }
    }
    
    throw new Error("Ningún modelo compatible encontrado");
    
  } catch (error) {
    console.error("❌ Fallback también falló:", error.message);
    return getFallbackResponse("general", role);
  }
}

// ============================================
// 🛡️ RESPUESTAS PREDEFINIDAS (sin cambios)
// ============================================

function getFallbackResponse(intent = "general", role = "client") {
  const responses = {
    client: {
      general: `¡Hola! Soy PetBot, tu asistente de PetServices. 🐾

Puedo ayudarte con:
• 📍 Buscar comercios y servicios
• 📅 Agendar y ver tus citas
• 🐕 Gestionar tus mascotas
• 💰 Consultar precios
• 🏥 Emergencias veterinarias

¿En qué te puedo ayudar hoy?`,

      list_businesses: `🏪 **Comercios Disponibles**

En PetServices tenemos diversos comercios especializados:
• 🏥 Clínicas veterinarias
• ✂️ Peluquerías caninas/felinas
• 🏨 Guarderías y hoteles
• 🛍️ Tiendas de mascotas
• 🐾 Servicios de entrenamiento
• 🚗 Transporte especializado

¿Qué tipo de comercio te interesa buscar?`,

      list_services: `🛎️ **Servicios Ofrecidos**

Los comercios en PetServices ofrecen:
• Consultas veterinarias generales
• Vacunación y desparasitación
• Estética y peluquería
• Guardería diurna/nocturna
• Adiestramiento básico/avanzado
• Transporte puerta a puerta
• Venta de alimentos y accesorios
• Spa y cuidados especiales

¿Necesitas más información de algún servicio en particular?`,

      get_user_pets: `🐾 **Tus Mascotas**

Para ver y gestionar tus mascotas registradas, ve a la sección "Mis Mascotas" en tu perfil.

¿Necesitas ayuda para registrar una nueva mascota?`,

      prices: `💰 **Información de Precios**

Los precios varían según:
• Tipo de servicio/comercio
• Complejidad del servicio
• Tamaño de la mascota
• Ubicación geográfica
• Experiencia del proveedor

Para precios exactos, te recomiendo:
1. Buscar comercios en tu área
2. Contactar directamente al proveedor
3. Solicitar cotización personalizada

¿Te ayudo a buscar algún comercio específico?`
    },
    // ... (resto de respuestas predefinidas igual que antes)
  };
  
  const roleResponses = responses[role] || responses.client;
  return roleResponses[intent] || roleResponses.general;
}

// ============================================
// 🎯 DETECCIÓN DE INTENCIONES (sin cambios)
// ============================================

function detectIntent(text, role = "client") {
  if (!text || typeof text !== 'string') return "fallback";
  
  const lowerText = text.toLowerCase().trim();
  
  // Intents básicos
  if (/(hola|buenos|buenas|saludos)/i.test(lowerText)) return "greeting";
  if (/(gracias|thank|merci)/i.test(lowerText)) return "thanks";
  if (/(adiós|chao|bye|nos vemos)/i.test(lowerText)) return "goodbye";
  if (/(ayuda|help|soporte)/i.test(lowerText)) return "help";
  if (/(quién eres|qué eres|tu nombre)/i.test(lowerText)) return "about";
  
  // Intents para clientes
  if (role === "client") {
    if (/(comercios|negocios|tiendas|veterinarias|peluquer[ií]as)/i.test(lowerText)) return "list_businesses";
    if (/(servicios|qué ofrecen|tipos de servicio)/i.test(lowerText)) return "list_services";
    if (/(mis citas|citas agendadas|próximas citas)/i.test(lowerText)) return "get_user_appointments";
    if (/(mis mascotas|mascotas registradas)/i.test(lowerText)) return "get_user_pets";
    if (/(agendar cita|nueva cita|reservar)/i.test(lowerText)) return "book_appointment";
    if (/(precios|costos|tarifas|cuánto cuesta)/i.test(lowerText)) return "prices";
    if (/(emergencia|urgencia|veterinario emergencia)/i.test(lowerText)) return "emergency";
  }
  
  // Intents para proveedores
  else if (role === "provider") {
    if (/(citas hoy|agenda hoy|hoy tengo)/i.test(lowerText)) return "provider_today_appointments";
    if (/(mi comercio|perfil comercio|mi negocio)/i.test(lowerText)) return "provider_business";
  }
  
  // Intents para administradores
  else if (role === "admin") {
    if (/(comercios|negocios registrados|todos los comercios)/i.test(lowerText)) return "admin_list_businesses";
    if (/(proveedores pendientes|aprobar proveedores)/i.test(lowerText)) return "admin_pending_businesses";
    if (/(usuarios|listar usuarios)/i.test(lowerText)) return "admin_list_users";
  }
  
  return "fallback";
}

// ============================================
// 📊 FUNCIONES CON DATOS (sin cambios)
// ============================================

async function generateResponseWithData(intent, user, userMessage = "") {
  const { name, role, _id: userId } = user;
  
  try {
    switch (intent) {
      case "list_businesses":
        return await getBusinessesList(user);
      case "list_services":
        return await getServicesList(user);
      case "get_user_appointments":
        return await getUserAppointments(userId);
      case "get_user_pets":
        return await getUserPets(userId);
      case "provider_today_appointments":
        return await getProviderAppointments(userId);
      case "admin_list_businesses":
        return await getAllBusinessesStats();
      default:
        return getFallbackResponse(intent, role);
    }
  } catch (error) {
    console.error(`❌ Error en generateResponseWithData:`, error.message);
    return getFallbackResponse(intent, role);
  }
}

// ... (funciones getBusinessesList, getServicesList, etc. - sin cambios)

// ============================================
// 🚀 ENDPOINT PRINCIPAL (optimizado)
// ============================================

router.post("/", protect, async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { message } = req.body;
    const { role, name, _id: userId } = req.user;
    
    if (!message || !message.trim()) {
      return res.json({
        success: false,
        reply: "Por favor, escribe un mensaje válido.",
        type: "error"
      });
    }
    
    const text = message.trim();
    const intent = detectIntent(text, role);
    
    console.log(`💬 Chat [${role}] ${name}: "${text.substring(0, 50)}..." -> ${intent}`);
    
    // Respuestas rápidas
    const quickResponses = {
      greeting: `¡Hola ${name}! 👋 Soy PetBot, ¿en qué puedo ayudarte?`,
      thanks: `¡De nada! 😊 ¿Algo más en lo que pueda asistirte?`,
      goodbye: `¡Hasta luego ${name}! Que tengas un excelente día. 🐾👋`,
      help: `¡Claro! Puedo ayudarte con información de comercios, servicios, tus mascotas, citas y más. ¿Qué necesitas específicamente?`,
      about: `¡Hola! Soy PetBot 🤖, el asistente virtual de PetServices. Te ayudo a encontrar comercios, agendar citas, gestionar tus mascotas y resolver dudas sobre la plataforma.`
    };
    
    if (quickResponses[intent]) {
      return res.json({
        success: true,
        reply: quickResponses[intent],
        type: "text",
        intent,
        responseTime: Date.now() - startTime
      });
    }
    
    // Intents que requieren datos
    const dataIntents = ["list_businesses", "list_services", "get_user_appointments", 
                         "get_user_pets", "provider_today_appointments", 
                         "admin_list_businesses", "prices", "emergency"];
    
    if (dataIntents.includes(intent)) {
      try {
        const reply = await generateResponseWithData(intent, req.user, text);
        return res.json({
          success: true,
          reply,
          type: "text",
          intent,
          hasData: true,
          responseTime: Date.now() - startTime
        });
      } catch (dbError) {
        console.error("❌ Error DB en chat:", dbError);
        return res.json({
          success: true,
          reply: getFallbackResponse(intent, role),
          type: "text",
          intent,
          responseTime: Date.now() - startTime
        });
      }
    }
    
    // Intents que usan IA
    if (["book_appointment", "fallback", "provider_business", "admin_pending_businesses"].includes(intent)) {
      try {
        const systemPrompt = `Eres PetBot, asistente de PetServices. Usuario (${role}: ${name}) pregunta: "${text}"
        
        Rol del usuario: ${role}
        Responde en español, claro y conciso. Si no sabes algo, di "No tengo esa información, pero puedo ayudarte con..."
        
        Respuesta:`;
        
        console.log(`🤖 Enviando a Gemini (intent: ${intent})...`);
        const aiReply = await callGeminiAPI(systemPrompt, role);
        
        return res.json({
          success: true,
          reply: aiReply,
          type: "text",
          intent,
          responseTime: Date.now() - startTime
        });
      } catch (aiError) {
        console.error("❌ Error IA:", aiError);
        return res.json({
          success: true,
          reply: getFallbackResponse("general", role),
          type: "text",
          intent,
          responseTime: Date.now() - startTime
        });
      }
    }
    
    // Fallback final
    return res.json({
      success: true,
      reply: getFallbackResponse("general", role),
      type: "text",
      intent: "fallback",
      responseTime: Date.now() - startTime
    });
    
  } catch (error) {
    console.error("❌ Error crítico en /chat:", error);
    return res.json({
      success: false,
      reply: "😔 **Lo siento, hubo un error inesperado.** Por favor, intenta de nuevo en unos momentos.",
      type: "error",
      responseTime: Date.now() - startTime
    });
  }
});

// ============================================
// 🧪 ENDPOINT DE PRUEBA MEJORADO
// ============================================

router.post("/test-gemini", protect, async (req, res) => {
  try {
    console.log("🧪 Iniciando prueba de Gemini...");
    
    if (!GEMINI_API_KEY) {
      return res.json({
        success: false,
        error: "❌ API Key no configurada",
        suggestion: "Agrega GEMINI_API_KEY en las variables de entorno de Render"
      });
    }
    
    // Probar diferentes versiones de API
    const testCases = [
      { version: "v1alpha", model: "gemini-1.5-flash", description: "Modelo Flash con v1alpha" },
      { version: "v1beta", model: "gemini-1.0-pro", description: "Modelo Pro con v1beta" },
      { version: "v1beta", model: "gemini-pro", description: "Modelo básico con v1beta" },
      { version: "v1beta", model: "gemini-1.5-pro", description: "Modelo 1.5 Pro con v1beta" }
    ];
    
    const results = [];
    
    for (const testCase of testCases) {
      const testUrl = `https://generativelanguage.googleapis.com/${testCase.version}/models/${testCase.model}:generateContent?key=${GEMINI_API_KEY}`;
      
      console.log(`🔍 Probando: ${testCase.description}`);
      
      try {
        const response = await fetch(testUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: "Hola" }] }],
            generationConfig: { maxOutputTokens: 10 }
          }),
          signal: AbortSignal.timeout(5000)
        });
        
        results.push({
          version: testCase.version,
          model: testCase.model,
          status: response.status,
          ok: response.ok,
          description: testCase.description
        });
        
        if (response.ok) {
          console.log(`✅ ${testCase.model} funciona con ${testCase.version}`);
          break; // Detener en el primero que funcione
        } else {
          console.log(`❌ ${testCase.model} falló con ${testCase.version}: ${response.status}`);
        }
      } catch (error) {
        results.push({
          version: testCase.version,
          model: testCase.model,
          error: error.message,
          ok: false,
          description: testCase.description
        });
        console.log(`❌ Error probando ${testCase.model}: ${error.message}`);
      }
    }
    
    // Encontrar la primera configuración que funcione
    const workingConfig = results.find(r => r.ok);
    
    if (workingConfig) {
      return res.json({
        success: true,
        message: "✅ Configuración encontrada",
        recommendedConfig: {
          version: workingConfig.version,
          model: workingConfig.model,
          url: `https://generativelanguage.googleapis.com/${workingConfig.version}/models/${workingConfig.model}:generateContent?key=***`
        },
        allResults: results
      });
    } else {
      return res.json({
        success: false,
        error: "❌ Ninguna configuración funcionó",
        suggestion: "1. Verifica tu API Key 2. Prueba modelos más antiguos 3. Contacta a Google Cloud Support",
        allResults: results,
        apiKeyPresent: true,
        apiKeyLength: GEMINI_API_KEY.length
      });
    }
    
  } catch (error) {
    console.error("❌ Error en test:", error);
    return res.json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// 🔧 ENDPOINT PARA CONFIGURAR MODELO MANUALMENTE
// ============================================

router.post("/configure-model", protect, async (req, res) => {
  try {
    const { version = "v1alpha", model = "gemini-1.5-flash" } = req.body;
    
    const testUrl = `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
    
    console.log(`🔧 Probando configuración manual: ${version} + ${model}`);
    
    const response = await fetch(testUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Test" }] }],
        generationConfig: { maxOutputTokens: 10 }
      }),
      signal: AbortSignal.timeout(5000)
    });
    
    if (response.ok) {
      console.log(`✅ Configuración funciona: ${version}/${model}`);
      
      // Actualizar globalmente (en un caso real, guardarías esto en DB)
      GEMINI_MODEL = model;
      GEMINI_API_URL = testUrl;
      
      return res.json({
        success: true,
        message: `✅ Configuración actualizada a: ${model} (${version})`,
        config: {
          model,
          version,
          apiUrl: testUrl.replace(GEMINI_API_KEY, '***')
        }
      });
    } else {
      const errorText = await response.text();
      return res.json({
        success: false,
        error: `❌ Configuración no funciona: ${response.status}`,
        details: errorText.substring(0, 200)
      });
    }
    
  } catch (error) {
    console.error("❌ Error en configure-model:", error);
    return res.json({
      success: false,
      error: error.message
    });
  }
});

export default router;