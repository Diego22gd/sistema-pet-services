import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import User from "../models/User.js";
import Pet from "../models/Pet.js";
import Service from "../models/Service.js";
import Appointment from "../models/Appointment.js";
import Business from "../models/Business.js"; // Importar modelo de negocio

const router = express.Router();

// ============================================
// 🔧 CONFIGURACIÓN OPTIMIZADA PARA RENDER (PRODUCCIÓN)
// ============================================

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const RENDER_TIMEOUT = 10000; // 10 segundos timeout para Render (evitar 503)
const NODE_ENV = process.env.NODE_ENV || "development";

if (!GEMINI_API_KEY) {
  console.warn("⚠️  ADVERTENCIA: No se encontró API Key para Gemini. El chatbot usará respuestas predefinidas.");
} else {
  console.log("✅ ChatBot configurado para producción en Render");
  console.log(`✅ Entorno: ${NODE_ENV}`);
}

// Modelo ligero para producción
const GEMINI_MODEL = NODE_ENV === 'production' ? 'gemini-1.5-flash' : 'gemini-1.5-flash-latest';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

// ============================================
// 🚀 FUNCIÓN OPTIMIZADA PARA PRODUCCIÓN
// ============================================

async function callGeminiAPI(prompt, role = "client", businessContext = null) {
  // Respuesta inmediata si no hay API key
  if (!GEMINI_API_KEY) {
    return getFallbackResponse("general", role, businessContext);
  }

  try {
    console.log(`🤖 Llamando a Gemini (${GEMINI_MODEL}) para ${role}...`);
    
    // Timeout específico para Render (evitar 503 Service Unavailable)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), RENDER_TIMEOUT);

    // Construir contexto de negocio si existe
    let businessInfo = "";
    if (businessContext) {
      businessInfo = `\nCONTEXTO DEL NEGOCIO ACTUAL:\n• Nombre: ${businessContext.name}\n• Servicios: ${businessContext.services || 'No especificado'}\n• Descripción: ${businessContext.description || 'No disponible'}\n`;
    }

    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt + businessInfo }]
        }],
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 400, // Más reducido para producción
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH", 
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text().catch(() => "No error text");
      console.error(`❌ Gemini API error ${response.status}`);
      
      // Fallback inteligente basado en código de error
      if (response.status === 429) {
        return "⚠️ **El servicio de IA está muy ocupado.** Te muestro información del sistema mientras tanto.";
      }
      
      if (response.status === 403 || response.status === 401) {
        return "🔐 **Configuración requerida.** Contacta al administrador para configurar el servicio de IA.";
      }
      
      throw new Error(`API error ${response.status}`);
    }

    const data = await response.json();
    
    // Validar y limpiar respuesta
    if (!data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.warn("⚠️  Respuesta inesperada de Gemini");
      return getFallbackResponse("general", role, businessContext);
    }
    
    let responseText = data.candidates[0].content.parts[0].text.trim();
    
    // Limpieza optimizada
    responseText = responseText
      .replace(/\*\*\*/g, '**')
      .replace(/#{3,}/g, '##')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    
    return responseText || getFallbackResponse("general", role, businessContext);
    
  } catch (error) {
    console.error("❌ Error en callGeminiAPI:", error.name);
    
    if (error.name === 'AbortError') {
      return "⏰ **Tiempo de espera agotado.** Usando información del sistema. Puedes consultar directamente en tu panel.";
    }
    
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return "🌐 **Sin conexión a IA.** Mostrando información local del sistema.";
    }
    
    return getFallbackResponse("general", role, businessContext);
  }
}

// ============================================
// 🏢 FUNCIONES DE NEGOCIO (BUSINESS)
// ============================================

async function getBusinessContext(userId, role) {
  try {
    if (role === "provider") {
      // Para proveedores, obtener su negocio
      const business = await Business.findOne({ owner: userId })
        .select('name description services contactInfo status')
        .lean();
      
      if (business) {
        return {
          name: business.name,
          description: business.description,
          services: Array.isArray(business.services) ? business.services.join(', ') : business.services,
          contactInfo: business.contactInfo,
          status: business.status
        };
      }
    } else if (role === "client") {
      // Para clientes, obtener información de negocios disponibles
      const activeBusinesses = await Business.countDocuments({ status: "approved" });
      return {
        activeBusinesses,
        context: `Hay ${activeBusinesses} negocios aprobados en el sistema.`
      };
    }
    
    return null;
  } catch (error) {
    console.error("❌ Error obteniendo contexto de negocio:", error.message);
    return null;
  }
}

// ============================================
// 📝 RESPUESTAS PREDEFINIDAS CON CONTEXTO DE NEGOCIO
// ============================================

function getFallbackResponse(intent = "general", role = "client", businessContext = null) {
  const responses = {
    client: {
      general: businessContext ? 
        `¡Hola! Soy PetBot, tu asistente. 🐾

En el sistema hay ${businessContext.activeBusinesses || 'varios'} negocios disponibles.

Puedo ayudarte con:
• Buscar servicios por tipo
• Ver negocios cercanos
• Agendar citas
• Información de mascotas

¿Qué necesitas?` : 
        `¡Hola! Soy PetBot, tu asistente de mascotas. 🐾

Puedo ayudarte con:
• Encontrar servicios para tu mascota
• Ver negocios disponibles
• Agendar citas
• Información de cuidados

¿En qué te ayudo?`,

      list_services: `🛎️ **Servicios Disponibles**

Los negocios ofrecen servicios como:
• 🏥 Veterinaria y consultas
• ✂️ Estética y peluquería
• 🎯 Entrenamiento
• 🏠 Guardería y cuidado

Usa el buscador para encontrar negocios específicos.`,

      find_business: `🏢 **Encontrar Negocios**

Para encontrar negocios:
1. Ve a "Negocios" en el menú
2. Filtra por tipo de servicio
3. Revisa valoraciones y disponibilidad

¿Buscas algún servicio en particular?`
    },

    provider: {
      general: businessContext ? 
        `¡Hola! Soy PetBot, tu asistente para negocios. 💼

Tu negocio: **${businessContext.name}**
Estado: ${businessContext.status === 'approved' ? '✅ Aprobado' : '⏳ Pendiente'}

Te ayudo con:
• Gestión de citas
• Estadísticas
• Configuración de servicios
• Información de clientes

¿Qué área gestionamos hoy?` : 
        `¡Hola! Soy PetBot, asistente para proveedores. 💼

Te ayudo con:
• Configurar tu negocio
• Gestionar servicios
• Ver citas y agenda
• Reportes y estadísticas

¿Necesitas ayuda para configurar algo?`,

      business_stats: businessContext ? 
        `📊 **Estadísticas de tu Negocio**

Negocio: ${businessContext.name}
Servicios: ${businessContext.services || 'Por configurar'}
Contacto: ${businessContext.contactInfo || 'No disponible'}

Ve al panel de proveedor para ver estadísticas completas.` : 
        `📊 **Estadísticas de Negocio**

Configura tu negocio primero para acceder a estadísticas detalladas.`,

      manage_services: `🛠️ **Gestionar Servicios**

Para gestionar servicios:
1. Ve a "Mis Servicios"
2. Agrega nuevos servicios
3. Configura precios y horarios
4. Actualiza disponibilidad

¿Necesitas ayuda con algún paso específico?`
    },

    admin: {
      general: `¡Hola! Soy PetBot, asistente administrativo. 👨‍💼

Áreas de gestión:
• Negocios y proveedores
• Usuarios del sistema
• Reportes globales
• Configuración de plataforma

¿Qué área administrativa necesitas?`,

      business_approvals: `✅ **Aprobación de Negocios**

Para aprobar negocios:
1. Revisa "Negocios Pendientes"
2. Verifica documentación
3. Aprueba o rechaza con comentarios
4. Notifica al proveedor

¿Tienes preguntas sobre algún caso específico?`,

      system_reports: `📈 **Reportes del Sistema**

Reportes disponibles:
• Nuevos negocios (últimos 30 días)
• Citas agendadas
• Ingresos totales
• Usuarios activos

Genera reportes desde el panel de administración.`
    }
  };

  const roleResponses = responses[role] || responses.client;
  return roleResponses[intent] || roleResponses.general;
}

// ============================================
// 📊 FUNCIONES CON DATOS REALES OPTIMIZADAS
// ============================================

async function generateResponseWithData(intent, user, userMessage = "") {
  const { role, _id: userId } = user;
  
  // Obtener contexto de negocio
  const businessContext = await getBusinessContext(userId, role);
  
  try {
    switch (role) {
      case "provider":
        return await generateProviderResponse(intent, user, businessContext);
      
      case "admin":
        return await generateAdminResponse(intent, user);
      
      default: // client
        return await generateClientResponse(intent, user, businessContext);
    }
  } catch (error) {
    console.error(`❌ Error en generateResponseWithData:`, error.message);
    return getFallbackResponse(intent, role, businessContext);
  }
}

async function generateClientResponse(intent, user, businessContext) {
  const { name, _id: userId } = user;
  
  switch (intent) {
    case "find_business": {
      try {
        const businesses = await Business.find({ status: "approved" })
          .select('name services description rating')
          .limit(5)
          .lean();

        if (businesses.length === 0) {
          return `Actualmente no hay negocios activos. Pronto tendremos nuevos proveedores.`;
        }

        let response = `Encontré ${businesses.length} negocios aprobados:\n\n`;
        
        businesses.forEach((business, index) => {
          response += `${index + 1}. **${business.name}**\n`;
          if (business.services) {
            const services = Array.isArray(business.services) ? 
              business.services.slice(0, 3).join(', ') : 
              business.services.substring(0, 60);
            response += `   Servicios: ${services}\n`;
          }
          if (business.rating) response += `   Valoración: ${business.rating} ⭐\n`;
          response += `\n`;
        });

        response += `\n¿Te interesa algún negocio en particular?`;
        return response;
      } catch (error) {
        return `Usa el buscador de negocios para encontrar proveedores cerca de ti.`;
      }
    }

    case "get_user_appointments": {
      try {
        const appointments = await Appointment.find({ userId })
          .populate({
            path: "serviceId",
            select: "name",
            populate: {
              path: "businessId",
              select: "name"
            }
          })
          .populate("petId", "name")
          .limit(3)
          .sort({ date: -1 })
          .lean();

        if (appointments.length === 0) {
          return `No tienes citas agendadas. ¡Busca negocios y agenda tu primera cita!`;
        }

        let response = `Tus últimas citas:\n\n`;
        
        appointments.forEach((appt, index) => {
          const businessName = appt.serviceId?.businessId?.name || 'Negocio no disponible';
          response += `${index + 1}. **${appt.serviceId?.name || 'Servicio'}**\n`;
          response += `   Negocio: ${businessName}\n`;
          response += `   Mascota: ${appt.petId?.name || 'No especificada'}\n`;
          response += `   Estado: ${appt.status}\n\n`;
        });

        return response;
      } catch (error) {
        return `Revisa tus citas en el panel de usuario para información actualizada.`;
      }
    }

    case "get_user_pets": {
      try {
        const pets = await Pet.find({ owner: userId })
          .select('name type breed')
          .limit(4)
          .lean();

        if (pets.length === 0) {
          return `¡Registra tu primera mascota para acceder a todos los servicios!`;
        }

        let response = `Tus mascotas registradas:\n\n`;
        
        pets.forEach((pet, index) => {
          response += `${index + 1}. **${pet.name}**\n`;
          response += `   Tipo: ${pet.type || 'No especificado'}\n`;
          if (pet.breed) response += `   Raza: ${pet.breed}\n`;
          response += `\n`;
        });

        response += `\n¿Quieres agendar una cita para alguna?`;
        return response;
      } catch (error) {
        return `Gestiona tus mascotas desde "Mis Mascotas" en tu perfil.`;
      }
    }

    default:
      return getFallbackResponse(intent, "client", businessContext);
  }
}

async function generateProviderResponse(intent, user, businessContext) {
  const { name, _id: userId } = user;
  
  switch (intent) {
    case "business_stats": {
      try {
        // Estadísticas del negocio
        const business = await Business.findOne({ owner: userId }).lean();
        
        if (!business) {
          return `Primero configura tu negocio para ver estadísticas. Ve a "Mi Negocio" en tu panel.`;
        }

        // Contar citas
        const totalAppointments = await Appointment.countDocuments({
          "serviceId.businessId": business._id
        });
        
        const recentAppointments = await Appointment.countDocuments({
          "serviceId.businessId": business._id,
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Últimos 30 días
        });

        return `📊 **Estadísticas de ${business.name || 'tu negocio'}**\n\n` +
               `• Citas totales: ${totalAppointments}\n` +
               `• Citas (30 días): ${recentAppointments}\n` +
               `• Estado: ${business.status === 'approved' ? '✅ Activo' : '⏳ Pendiente'}\n` +
               `\nPara reportes detallados, ve a "Estadísticas" en tu panel.`;
      } catch (error) {
        return `Revisa las estadísticas en tu panel de proveedor para información actualizada.`;
      }
    }

    case "provider_today_appointments": {
      try {
        const today = new Date().toISOString().split('T')[0];
        
        // Obtener negocio del proveedor
        const business = await Business.findOne({ owner: userId }).select('_id').lean();
        
        if (!business) {
          return `Configura tu negocio primero para gestionar citas.`;
        }

        // Buscar citas a través de servicios del negocio
        const services = await Service.find({ businessId: business._id }).select('_id');
        const serviceIds = services.map(s => s._id);

        const appointments = await Appointment.find({
          serviceId: { $in: serviceIds },
          date: today,
          status: { $in: ['pending', 'confirmed'] }
        })
          .populate("userId", "name")
          .populate("petId", "name")
          .populate("serviceId", "name")
          .limit(8)
          .lean();

        if (appointments.length === 0) {
          return `No tienes citas agendadas para hoy. ¡Es buen momento para promocionar tus servicios!`;
        }

        let response = `Tienes ${appointments.length} citas hoy:\n\n`;
        
        appointments.forEach((appt, index) => {
          response += `${index + 1}. **${appt.serviceId?.name || 'Servicio'}**\n`;
          response += `   Cliente: ${appt.userId?.name || 'No especificado'}\n`;
          response += `   Mascota: ${appt.petId?.name || 'No especificada'}\n`;
          response += `   Hora: ${appt.time || 'Por confirmar'}\n\n`;
        });

        return response;
      } catch (error) {
        return `Revisa tu agenda diaria en el panel de proveedor.`;
      }
    }

    default:
      return getFallbackResponse(intent, "provider", businessContext);
  }
}

async function generateAdminResponse(intent, user) {
  switch (intent) {
    case "business_approvals": {
      try {
        const pendingBusinesses = await Business.countDocuments({ status: "pending" });
        const activeBusinesses = await Business.countDocuments({ status: "approved" });

        return `🏢 **Gestión de Negocios**\n\n` +
               `• Negocios pendientes: ${pendingBusinesses}\n` +
               `• Negocios aprobados: ${activeBusinesses}\n` +
               `\nRevisa "Negocios Pendientes" en el panel de administración.`;
      } catch (error) {
        return `Accede al panel de administración para gestionar negocios.`;
      }
    }

    case "system_reports": {
      try {
        // Estadísticas rápidas
        const [totalUsers, totalBusinesses, totalAppointments] = await Promise.all([
          User.countDocuments(),
          Business.countDocuments({ status: "approved" }),
          Appointment.countDocuments()
        ]);

        return `📈 **Reporte Rápido del Sistema**\n\n` +
               `• Usuarios totales: ${totalUsers}\n` +
               `• Negocios activos: ${totalBusinesses}\n` +
               `• Citas totales: ${totalAppointments}\n` +
               `\nPara reportes detallados, genera exportaciones desde el panel de admin.`;
      } catch (error) {
        return `Genera reportes completos desde el panel de administración.`;
      }
    }

    default:
      return getFallbackResponse(intent, "admin");
  }
}

// ============================================
// 🎯 DETECCIÓN DE INTENCIONES MEJORADA
// ============================================

function detectIntent(text, role = "client") {
  if (!text || typeof text !== 'string') return "fallback";
  
  const lowerText = text.toLowerCase().trim();

  // Intents básicos
  if (/(hola|buenos|buenas|saludos|hi|hello)/.test(lowerText)) return "greeting";
  if (/(gracias|thank|thanks|agradecido)/.test(lowerText)) return "thanks";
  if (/(adiós|chao|bye|hasta luego|nos vemos)/.test(lowerText)) return "goodbye";
  if (/(ayuda|help|soporte|asistencia)/.test(lowerText)) return "help";
  if (/(quién eres|qué eres|tu nombre|presentate)/.test(lowerText)) return "about";

  // Intents específicos por rol
  if (role === "client") {
    if (/(mis citas|citas agendadas|próximas citas|reservas)/.test(lowerText)) return "get_user_appointments";
    if (/(mis mascotas|mascotas registradas|animales)/.test(lowerText)) return "get_user_pets";
    if (/(servicios|qué servicios|tipos de servicio)/.test(lowerText)) return "list_services";
    if (/(negocios|proveedores|empresas|tiendas)/.test(lowerText)) return "find_business";
    if (/(agendar cita|nueva cita|reservar|sacar hora)/.test(lowerText)) return "book_appointment";
  } 
  else if (role === "provider") {
    if (/(citas hoy|agenda hoy|hoy tengo|hoy agenda)/.test(lowerText)) return "provider_today_appointments";
    if (/(mis servicios|servicios que ofrezco|mis ofertas)/.test(lowerText)) return "list_services";
    if (/(negocio|mi negocio|empresa|mi empresa)/.test(lowerText)) return "business_stats";
    if (/(estadísticas|métricas|reportes|analítica)/.test(lowerText)) return "business_stats";
    if (/(gestionar|administrar|configurar)/.test(lowerText)) return "manage_services";
  }
  else if (role === "admin") {
    if (/(negocios pendientes|aprobar negocios|solicitudes negocio)/.test(lowerText)) return "business_approvals";
    if (/(usuarios|listar usuarios|clientes totales)/.test(lowerText)) return "admin_list_users";
    if (/(reportes|estadísticas sistema|métricas globales)/.test(lowerText)) return "system_reports";
  }

  // Intents generales
  if (/(precios|costos|tarifas|cuánto cuesta|valor)/.test(lowerText)) return "prices";
  if (/(emergencia|urgencia|veterinario|accidente)/.test(lowerText)) return "emergency";
  if (/(contacto|teléfono|email|dirección|ubicación)/.test(lowerText)) return "contact";

  return "fallback";
}

// ============================================
// 🚀 ENDPOINT PRINCIPAL OPTIMIZADO PARA RENDER
// ============================================

router.post("/", protect, async (req, res) => {
  const startTime = Date.now();
  
  // Configurar timeout específico para Render
  req.setTimeout(RENDER_TIMEOUT + 2000); // 12 segundos total

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

    // Respuestas inmediatas (sin DB/API)
    const quickResponses = {
      greeting: `¡Hola ${name}! 👋 ¿En qué puedo ayudarte?`,
      thanks: `¡De nada! 😊 ¿Algo más en lo que pueda asistirte?`,
      goodbye: `¡Hasta luego ${name}! Que tengas un excelente día. 👋`,
      help: `¡Claro! Puedo ayudarte con información del sistema, gestión de negocios, citas y más. ¿Qué necesitas específicamente?`,
      about: `Soy PetBot 🤖, tu asistente virtual para PetServices. Te ayudo con información del sistema, gestionar citas, encontrar negocios y más. ¿En qué te ayudo?`
    };

    if (quickResponses[intent]) {
      return res.json({
        success: true,
        reply: quickResponses[intent],
        type: "text",
        intent,
        responseTime: Date.now() - startTime,
        optimized: true
      });
    }

    // Intents con datos de DB (optimizados)
    const dataIntents = ["find_business", "get_user_appointments", "get_user_pets", 
                         "provider_today_appointments", "business_stats", 
                         "business_approvals", "system_reports"];
    
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
        console.error("❌ Error DB en chat:", dbError.message);
        // Fallback rápido
        return res.json({
          success: true,
          reply: getFallbackResponse(intent, role, null),
          type: "text",
          intent,
          responseTime: Date.now() - startTime
        });
      }
    }

    // Intents que usan IA (manejo asíncrono para no bloquear)
    if (["book_appointment", "prices", "emergency", "contact", "fallback"].includes(intent)) {
      // Respuesta inmediata con procesamiento en segundo plano
      const immediateResponse = {
        success: true,
        reply: "🤖 Procesando tu consulta...",
        type: "processing",
        intent,
        responseTime: Date.now() - startTime,
        willUpdate: true
      };

      res.json(immediateResponse);

      // Procesamiento asíncrono (no bloquea la respuesta)
      setImmediate(async () => {
        try {
          const businessContext = await getBusinessContext(userId, role);
          const aiReply = await callGeminiAPI(
            `Usuario (${role} ${name}) pregunta sobre "${text}"`,
            role,
            businessContext
          );
          
          console.log(`✅ IA procesada para ${name} en ${Date.now() - startTime}ms`);
          
          // Aquí podrías implementar WebSocket para enviar la actualización
          // Por ahora solo se registra en logs para producción
          
        } catch (aiError) {
          console.error("❌ Error IA en background:", aiError.message);
        }
      });

      return;
    }

    // Fallback final optimizado
    const businessContext = await getBusinessContext(userId, role);
    
    return res.json({
      success: true,
      reply: getFallbackResponse("general", role, businessContext),
      type: "text",
      intent: "fallback",
      responseTime: Date.now() - startTime
    });

  } catch (error) {
    console.error("❌ Error crítico en /chat:", error.message);
    
    // Respuesta de error amigable
    return res.json({
      success: false,
      reply: "😔 **Hubo un error temporal.** Por favor, intenta de nuevo en unos momentos o usa las funciones directas del sistema.",
      type: "error",
      responseTime: Date.now() - startTime
    });
  }
});

// ============================================
// 📊 ENDPOINTS ADICIONALES OPTIMIZADOS
// ============================================

// Health check optimizado para Render
router.get("/health", protect, (req, res) => {
  res.json({
    status: "operational",
    service: "PetBot Chat Service",
    environment: NODE_ENV,
    aiConfigured: !!GEMINI_API_KEY,
    timeout: RENDER_TIMEOUT,
    userRole: req.user.role,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Endpoint de diagnóstico ligero
router.get("/diagnostic", protect, async (req, res) => {
  try {
    const businessContext = await getBusinessContext(req.user._id, req.user.role);
    
    const stats = {
      user: {
        name: req.user.name,
        role: req.user.role
      },
      business: businessContext ? {
        hasBusiness: true,
        name: businessContext.name,
        status: businessContext.status
      } : { hasBusiness: false },
      system: {
        environment: NODE_ENV,
        geminiConfigured: !!GEMINI_API_KEY,
        timestamp: new Date().toISOString()
      }
    };

    res.json({
      success: true,
      data: stats,
      responseTime: Date.now() - Date.now()
    });

  } catch (error) {
    res.json({
      success: false,
      error: "Diagnóstico no disponible"
    });
  }
});

// Endpoint de prueba (sin autenticación para pruebas)
router.post("/test", async (req, res) => {
  try {
    const { message, role = "client" } = req.body;
    
    if (!message) {
      return res.json({
        success: false,
        reply: "Mensaje requerido para prueba"
      });
    }

    const reply = await callGeminiAPI(`Prueba [${role}]: ${message}`, role);
    
    res.json({
      success: true,
      reply,
      test: true,
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - Date.now()
    });

  } catch (error) {
    res.json({
      success: false,
      reply: `Error en prueba: ${error.message}`,
      test: true
    });
  }
});

// Webhook para recibir actualizaciones (útil para integraciones futuras)
router.post("/webhook", express.json(), (req, res) => {
  // Endpoint para recibir webhooks externos
  const { type, data } = req.body;
  
  console.log(`🔔 Webhook recibido: ${type}`);
  
  // Respuesta inmediata
  res.json({
    received: true,
    type,
    timestamp: new Date().toISOString()
  });
});

export default router;