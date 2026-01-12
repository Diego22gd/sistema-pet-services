import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import User from "../models/User.js";
import Pet from "../models/Pet.js";
import Service from "../models/Service.js";
import Appointment from "../models/Appointment.js";

const router = express.Router();

// ============================================
// 🔧 CONFIGURACIÓN GEMINI PARA PRODUCCIÓN
// ============================================

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.DEEPSEEK_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn("⚠️  ADVERTENCIA: No se encontró API Key para Gemini. El chatbot usará respuestas predefinidas.");
} else {
  console.log("✅ ChatBot Gemini configurado para producción");
}

// Usar modelo gratuito y rápido para producción
const GEMINI_MODEL = process.env.NODE_ENV === 'production' ? 'gemini-1.5-flash' : 'gemini-1.5-flash';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

// ============================================
// 🚀 FUNCIÓN OPTIMIZADA PARA LLAMAR A GEMINI
// ============================================

async function callGeminiAPI(prompt, role = "client") {
  // Si no hay API key, usar respuestas predefinidas inmediatamente
  if (!GEMINI_API_KEY) {
    console.log("📝 Usando respuestas predefinidas (sin API Key)");
    return getFallbackResponse("general", role);
  }

  try {
    console.log(`🤖 Llamando a Gemini (${GEMINI_MODEL})...`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout en producción

    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 512, // Reducido para producción
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
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Gemini API error ${response.status}:`, errorText.substring(0, 200));
      
      // Fallback específico por código de error
      if (response.status === 429) {
        return "⚠️ **El servicio está muy ocupado en este momento.** Por favor, intenta de nuevo en unos minutos. Mientras tanto, puedo ayudarte con información básica del sistema.";
      }
      
      if (response.status === 403) {
        return "🔐 **Error de autenticación.** El chatbot necesita configuración adicional. Por favor, contacta al administrador del sistema.";
      }
      
      throw new Error(`API error ${response.status}`);
    }

    const data = await response.json();
    
    // Validar estructura de respuesta
    if (!data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.warn("⚠️  Respuesta inesperada de Gemini:", JSON.stringify(data).substring(0, 200));
      return getFallbackResponse("general", role);
    }
    
    const responseText = data.candidates[0].content.parts[0].text.trim();
    
    // Limpiar respuesta (remover markdown excesivo)
    const cleanResponse = responseText
      .replace(/\*\*\*/g, '**')  // Simplificar markdown
      .replace(/#{3,}/g, '')     // Remover encabezados muy grandes
      .trim();
    
    return cleanResponse || getFallbackResponse("general", role);
    
  } catch (error) {
    console.error("❌ Error en callGeminiAPI:", error.name, error.message);
    
    // Respuestas específicas por tipo de error
    if (error.name === 'AbortError') {
      return "⏰ **Se agotó el tiempo de espera.** El servicio está respondiendo lentamente. Por favor, reformula tu pregunta o intenta más tarde.";
    }
    
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return "🌐 **Problema de conexión.** No puedo contactar el servicio de IA en este momento. Usaré respuestas predefinidas.";
    }
    
    return getFallbackResponse("general", role);
  }
}

// ============================================
// 📝 SYSTEM PROMPT OPTIMIZADO PARA PRODUCCIÓN
// ============================================

function getSystemPrompt(role) {
  const basePrompt = `Eres PetBot, el asistente virtual oficial de PetServices. Responde en español de manera clara, concisa y útil.

INSTRUCCIONES CRÍTICAS:
1. Límite de 2-3 oraciones por respuesta
2. No uses markdown complejo, solo **negritas** para énfasis
3. Siempre sé honesto si no sabes algo
4. Mantén un tono profesional pero amigable
5. NO inventes funciones que no existen
6. Si preguntan por precios específicos, di "Los precios varían según el servicio"

CONTEXTO DE PETSERVICES:
• Sistema de gestión para servicios de mascotas
• Clientes pueden registrar mascotas y agendar citas
• Proveedores ofrecen servicios como veterinaria, peluquería, etc.
• Administradores gestionan el sistema completo

RESPONDE COMO: ${role === 'admin' ? 'Administrador del sistema' : role === 'provider' ? 'Proveedor de servicios' : 'Asistente para dueños de mascotas'}`;

  return basePrompt;
}

// ============================================
// 🛡️ RESPUESTAS PREDEFINIDAS (FALLBACK)
// ============================================

function getFallbackResponse(intent = "general", role = "client") {
  const responses = {
    client: {
      general: `¡Hola! Soy PetBot, tu asistente de PetServices. 🐾

Puedo ayudarte con:
• Ver tus mascotas registradas
• Consultar tus citas agendadas  
• Información de servicios disponibles
• Agendar nuevas citas

¿En qué te puedo asistir?`,

      list_services: `🛎️ **Servicios Disponibles**

En PetServices ofrecemos:
• 🏥 **Veterinaria**: Consultas, vacunas, emergencias
• ✂️ **Estética**: Baño, corte, spa para mascotas
• 🎯 **Entrenamiento**: Adiestramiento básico
• 🏠 **Cuidado**: Guardería, paseos, visitas

¿Te interesa alguno en particular?`,

      get_user_pets: `🐾 **Tus Mascotas**

Puedes ver y gestionar todas tus mascotas registradas desde la sección "Mis Mascotas" en tu perfil.

¿Necesitas ayuda para registrar una nueva mascota?`
    },

    provider: {
      general: `¡Hola! Soy PetBot, tu asistente para proveedores. 💼

Te ayudo con:
• Tu agenda y citas del día
• Gestión de servicios ofrecidos
• Estadísticas de tu negocio
• Información de clientes

¿Qué necesitas gestionar hoy?`,

      provider_today_appointments: `📅 **Citas de Hoy**

Puedes ver todas tus citas programadas para hoy en el panel de proveedor, sección "Agenda".

¿Necesitas ayuda para gestionar una cita específica?`
    },

    admin: {
      general: `¡Hola! Soy PetBot, asistente administrativo. 👨‍💼

Áreas que puedo gestionar:
• Usuarios y proveedores del sistema
• Aprobación de solicitudes pendientes
• Reportes y estadísticas globales
• Monitoreo del sistema

¿Qué área administrativa necesitas revisar?`
    }
  };

  const roleResponses = responses[role] || responses.client;
  return roleResponses[intent] || roleResponses.general;
}

// ============================================
// 📊 FUNCIONES CON DATOS REALES
// ============================================

async function generateResponseWithData(intent, user, userMessage = "") {
  const { name, role, _id: userId } = user;
  
  try {
    switch (role) {
      case "provider":
        return await generateProviderResponse(intent, user);
      
      case "admin":
        return await generateAdminResponse(intent, user);
      
      default: // client
        return await generateClientResponse(intent, user);
    }
  } catch (error) {
    console.error(`❌ Error en generateResponseWithData (${role}/${intent}):`, error.message);
    return getFallbackResponse(intent, role);
  }
}

async function generateClientResponse(intent, user) {
  const { name, _id: userId } = user;
  
  switch (intent) {
    case "list_services": {
      try {
        const services = await Service.find({ status: "approved" })
          .select('name description price providerName')
          .limit(8)
          .lean();

        if (services.length === 0) {
          return `Actualmente no hay servicios disponibles. Revisa más tarde o contacta a soporte.`;
        }

        let response = `Encontré ${services.length} servicios disponibles:\n\n`;
        
        services.forEach((service, index) => {
          response += `${index + 1}. **${service.name}**\n`;
          if (service.description) response += `   ${service.description.substring(0, 60)}...\n`;
          response += `\n`;
        });

        response += `\n¿Te interesa más información de algún servicio?`;
        return response;
      } catch (error) {
        return getFallbackResponse("list_services", "client");
      }
    }

    case "get_user_appointments": {
      try {
        const appointments = await Appointment.find({ userId })
          .populate("petId", "name")
          .populate("serviceId", "name")
          .limit(5)
          .sort({ date: -1 })
          .lean();

        if (appointments.length === 0) {
          return `No tienes citas agendadas. ¿Te gustaría agendar una nueva?`;
        }

        let response = `Tus últimas ${appointments.length} citas:\n\n`;
        
        appointments.forEach((appt, index) => {
          response += `${index + 1}. **${appt.serviceId?.name || 'Servicio'}**\n`;
          response += `   Mascota: ${appt.petId?.name || 'No especificada'}\n`;
          response += `   Fecha: ${appt.date ? new Date(appt.date).toLocaleDateString('es-VE') : 'Por confirmar'}\n`;
          response += `   Estado: ${appt.status}\n\n`;
        });

        return response;
      } catch (error) {
        return `No pude cargar tus citas en este momento. Revisa en tu panel de usuario.`;
      }
    }

    case "get_user_pets": {
      try {
        const pets = await Pet.find({ owner: userId })
          .select('name type breed age')
          .limit(5)
          .lean();

        if (pets.length === 0) {
          return `No tienes mascotas registradas. ¡Registra tu primera mascota desde tu perfil!`;
        }

        let response = `Tus ${pets.length} mascotas registradas:\n\n`;
        
        pets.forEach((pet, index) => {
          response += `${index + 1}. **${pet.name}**\n`;
          response += `   Tipo: ${pet.type || 'No especificado'}\n`;
          if (pet.breed) response += `   Raza: ${pet.breed}\n`;
          response += `\n`;
        });

        return response;
      } catch (error) {
        return `No pude cargar la información de tus mascotas. Intenta desde tu perfil.`;
      }
    }

    default:
      return getFallbackResponse(intent, "client");
  }
}

async function generateProviderResponse(intent, user) {
  const { name, _id: userId } = user;
  
  switch (intent) {
    case "provider_today_appointments": {
      try {
        const today = new Date().toISOString().split('T')[0];
        const appointments = await Appointment.find({
          providerId: userId,
          date: today,
          status: { $in: ['pending', 'confirmed'] }
        })
          .populate("userId", "name")
          .populate("petId", "name")
          .populate("serviceId", "name")
          .limit(10)
          .lean();

        if (appointments.length === 0) {
          return `No tienes citas agendadas para hoy. ¡Es buen momento para promocionar tus servicios!`;
        }

        let response = `Tienes ${appointments.length} citas hoy:\n\n`;
        
        appointments.forEach((appt, index) => {
          response += `${index + 1}. **${appt.serviceId?.name || 'Servicio'}**\n`;
          response += `   Cliente: ${appt.userId?.name || 'No especificado'}\n`;
          response += `   Hora: ${appt.time || 'Por confirmar'}\n`;
          response += `   Estado: ${appt.status}\n\n`;
        });

        return response;
      } catch (error) {
        return `No pude cargar tu agenda hoy. Revisa en tu panel de proveedor.`;
      }
    }

    default:
      return getFallbackResponse(intent, "provider");
  }
}

async function generateAdminResponse(intent, user) {
  switch (intent) {
    case "admin_list_providers": {
      try {
        const pendingCount = await User.countDocuments({
          role: "provider",
          status: "pending"
        });

        const approvedCount = await User.countDocuments({
          role: "provider", 
          status: "approved"
        });

        return `**Proveedores en el sistema:**\n• Pendientes: ${pendingCount}\n• Aprobados: ${approvedCount}\n\nRevisa el panel de administración para más detalles.`;
      } catch (error) {
        return `No pude cargar la información de proveedores. Revisa el panel de admin.`;
      }
    }

    default:
      return getFallbackResponse(intent, "admin");
  }
}

// ============================================
// 🎯 DETECCIÓN DE INTENCIONES (SIMPLIFICADA)
// ============================================

function detectIntent(text, role = "client") {
  if (!text || typeof text !== 'string') return "fallback";
  
  const lowerText = text.toLowerCase().trim();

  // Intents básicos
  if (/(hola|buenos|buenas|saludos)/.test(lowerText)) return "greeting";
  if (/(gracias|thank|merci)/.test(lowerText)) return "thanks";
  if (/(adiós|chao|bye|nos vemos)/.test(lowerText)) return "goodbye";
  if (/(ayuda|help|soporte)/.test(lowerText)) return "help";
  if (/(quién eres|qué eres|tu nombre)/.test(lowerText)) return "about";

  // Intents por rol
  if (role === "client") {
    if (/(mis citas|citas agendadas|próximas citas)/.test(lowerText)) return "get_user_appointments";
    if (/(mis mascotas|mascotas registradas)/.test(lowerText)) return "get_user_pets";
    if (/(servicios|qué servicios|tipos de servicio)/.test(lowerText)) return "list_services";
    if (/(agendar cita|nueva cita|reservar)/.test(lowerText)) return "book_appointment";
  } 
  else if (role === "provider") {
    if (/(citas hoy|agenda hoy|hoy tengo)/.test(lowerText)) return "provider_today_appointments";
    if (/(mis servicios|servicios que ofrezco)/.test(lowerText)) return "list_services";
  }
  else if (role === "admin") {
    if (/(proveedores pendientes|aprobar proveedores)/.test(lowerText)) return "admin_list_providers";
    if (/(usuarios|listar usuarios)/.test(lowerText)) return "admin_list_users";
  }

  // Intents generales
  if (/(precios|costos|tarifas|cuánto)/.test(lowerText)) return "prices";
  if (/(emergencia|urgencia|veterinario)/.test(lowerText)) return "emergency";

  return "fallback";
}

// ============================================
// 🚀 ENDPOINT PRINCIPAL OPTIMIZADO
// ============================================

router.post("/", protect, async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { message } = req.body;
    const { role, name, _id: userId } = req.user;

    // Validación rápida
    if (!message || !message.trim()) {
      return res.json({
        success: false,
        reply: "Por favor, escribe un mensaje válido.",
        type: "error"
      });
    }

    const text = message.trim();
    const intent = detectIntent(text, role);

    console.log(`💬 Chat [${role}] ${name}: "${text.substring(0, 30)}..." -> ${intent}`);

    // Procesamiento rápido con respuestas inmediatas para intents comunes
    const quickResponses = {
      greeting: `¡Hola ${name}! 👋 ¿En qué puedo ayudarte?`,
      thanks: `¡De nada! 😊 ¿Algo más en lo que pueda asistirte?`,
      goodbye: `¡Hasta luego ${name}! Que tengas un excelente día. 👋`,
      help: `¡Claro! Puedo ayudarte con información del sistema, tus mascotas, citas y más. ¿Qué necesitas específicamente?`
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

    // Intents que requieren datos de la base de datos
    const dataIntents = ["list_services", "get_user_appointments", "get_user_pets", 
                         "provider_today_appointments", "admin_list_providers"];
    
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
        // Fallback a respuesta predefinida
        return res.json({
          success: true,
          reply: getFallbackResponse(intent, role),
          type: "text",
          intent,
          responseTime: Date.now() - startTime
        });
      }
    }

    // Intents que usan IA (procesamiento asíncrono para no bloquear)
    if (["book_appointment", "prices", "emergency", "about", "fallback"].includes(intent)) {
      // Responder inmediatamente y procesar en segundo plano
      const initialResponse = {
        success: true,
        reply: "🤖 Procesando tu consulta...",
        type: "processing",
        intent,
        responseTime: Date.now() - startTime
      };

      // Enviar respuesta inmediata
      res.json(initialResponse);

      // Procesar IA en segundo plano (no bloqueante)
      setTimeout(async () => {
        try {
          const aiReply = await callGeminiAPI(
            `Usuario (${role} ${name}) pregunta: "${text}"`,
            role
          );
          
          console.log(`✅ IA procesada para ${name} (${intent}) en ${Date.now() - startTime}ms`);
          
          // Aquí podrías enviar la respuesta real via WebSocket o guardarla para que el frontend la recupere
          // Por ahora solo logueamos
          
        } catch (aiError) {
          console.error("❌ Error IA en background:", aiError);
        }
      }, 0);

      return;
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
// 📊 ENDPOINTS ADICIONALES
// ============================================

// Health check del chatbot
router.get("/health", protect, (req, res) => {
  res.json({
    status: "operational",
    service: "PetBot Chat Service",
    aiProvider: GEMINI_API_KEY ? "Google Gemini" : "Fallback Mode",
    model: GEMINI_MODEL,
    userRole: req.user.role,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Diagnóstico del chatbot
router.get("/diagnostic", protect, async (req, res) => {
  try {
    // Probar conexión a Gemini
    let geminiStatus = "not_configured";
    if (GEMINI_API_KEY) {
      try {
        const testResponse = await callGeminiAPI("Responde solo con 'OK'", req.user.role);
        geminiStatus = testResponse.includes("OK") ? "working" : "error";
      } catch (error) {
        geminiStatus = "error";
      }
    }

    // Estadísticas básicas
    const stats = {
      gemini: {
        configured: !!GEMINI_API_KEY,
        status: geminiStatus,
        model: GEMINI_MODEL
      },
      user: {
        name: req.user.name,
        role: req.user.role,
        id: req.user._id
      },
      system: {
        environment: process.env.NODE_ENV,
        nodeVersion: process.version,
        timestamp: new Date().toISOString()
      }
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    res.json({
      success: false,
      error: error.message
    });
  }
});

// Endpoint simple para pruebas
router.post("/test", async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.json({
        success: false,
        reply: "Mensaje requerido para prueba"
      });
    }

    const reply = await callGeminiAPI(`Prueba: ${message}`, "client");
    
    res.json({
      success: true,
      reply,
      test: true,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.json({
      success: false,
      reply: `Error en prueba: ${error.message}`,
      test: true
    });
  }
});

export default router;