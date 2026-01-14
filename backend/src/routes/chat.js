import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import User from "../models/User.js";
import Pet from "../models/Pet.js";
import Business from "../models/Business.js"; // Cambiado de Service a Business
import Appointment from "../models/Appointment.js";

const router = express.Router();

// ============================================
// 🔧 CONFIGURACIÓN GEMINI
// ============================================

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.warn("⚠️  ADVERTENCIA: Sin API Key. Usando respuestas predefinidas.");
}

const GEMINI_MODEL = 'gemini-1.5-flash';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

// ============================================
// 🚀 FUNCIÓN PARA LLAMAR A GEMINI
// ============================================

async function callGeminiAPI(prompt, role = "client") {
  if (!GEMINI_API_KEY) {
    return getFallbackResponse("general", role);
  }

  try {
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
          maxOutputTokens: 500,
        }
      }),
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      throw new Error(`API error ${response.status}`);
    }

    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() 
      || getFallbackResponse("general", role);
    
  } catch (error) {
    console.error("❌ Error en callGeminiAPI:", error.message);
    return getFallbackResponse("general", role);
  }
}

// ============================================
// 🛡️ RESPUESTAS PREDEFINIDAS ACTUALIZADAS
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

    provider: {
      general: `¡Hola! Soy PetBot, tu asistente para proveedores. 💼

Te ayudo con:
• 📊 Tu perfil de comercio
• 📅 Agenda y citas programadas
• 👥 Gestión de clientes
• 💰 Estadísticas de ingresos
• ⭐ Reseñas y calificaciones

¿Qué necesitas gestionar hoy?`,

      provider_today_appointments: `📅 **Citas de Hoy**

Consulta tus citas del día en el panel de proveedor, sección "Agenda del Día".

¿Necesitas ayuda para gestionar alguna cita específica?`
    },

    admin: {
      general: `¡Hola! Soy PetBot, asistente administrativo. 👨‍💼

Áreas de gestión:
• 👥 Usuarios y comercios registrados
• ✅ Aprobación de solicitudes
• 📊 Reportes del sistema
• ⚙️ Configuración de la plataforma
• 🛡️ Moderación y seguridad

¿Qué área necesitas revisar?`
    }
  };

  const roleResponses = responses[role] || responses.client;
  return roleResponses[intent] || roleResponses.general;
}

// ============================================
// 📊 FUNCIONES CON DATOS REALES (ACTUALIZADAS)
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

// ============================================
// 📍 FUNCIONES ESPECÍFICAS PARA COMERCIOS
// ============================================

async function getBusinessesList(user) {
  try {
    const businesses = await Business.find({
      status: "active",
      approved: true,
      isDeleted: { $ne: true }
    })
    .select('name categories description averageServicePrice address')
    .limit(6)
    .sort({ rating: -1, views: -1 })
    .lean();

    if (businesses.length === 0) {
      return `Actualmente no hay comercios disponibles. Los administradores están trabajando para añadir nuevos proveedores.`;
    }

    let response = `🏪 **Encontré ${businesses.length} comercios disponibles:**\n\n`;
    
    businesses.forEach((business, index) => {
      response += `${index + 1}. **${business.name}**\n`;
      
      // Mostrar categorías
      if (business.categories && business.categories.length > 0) {
        const categories = business.categories.slice(0, 2);
        response += `   📍 ${categories.join(', ')}\n`;
      }
      
      // Descripción breve
      if (business.description) {
        const shortDesc = business.description.substring(0, 60);
        response += `   📝 ${shortDesc}...\n`;
      }
      
      // Precio promedio si existe
      if (business.averageServicePrice > 0) {
        response += `   💰 Precio promedio: $${business.averageServicePrice.toFixed(2)}\n`;
      }
      
      // Dirección breve
      if (business.address) {
        const shortAddr = business.address.substring(0, 40);
        response += `   🏠 ${shortAddr}\n`;
      }
      
      response += `\n`;
    });

    response += `\n🔍 **Para buscar más opciones:**\n`;
    response += `• Ve a "Buscar Comercios" en el menú principal\n`;
    response += `• Filtra por categoría o ubicación\n`;
    response += `• Contacta directamente a los comercios\n`;
    
    return response;
    
  } catch (error) {
    console.error("Error obteniendo comercios:", error);
    return `No puedo cargar la lista de comercios en este momento. Intenta más tarde o busca manualmente en la plataforma.`;
  }
}

async function getServicesList(user) {
  try {
    // Obtener comercios activos
    const businesses = await Business.find({
      status: "active",
      approved: true,
      isDeleted: { $ne: true },
      'services.isActive': true
    })
    .select('name services')
    .limit(5)
    .lean();

    if (businesses.length === 0) {
      return `Actualmente no hay servicios disponibles. Los proveedores están actualizando sus ofertas.`;
    }

    let response = `🛎️ **Servicios disponibles en comercios activos:**\n\n`;
    let serviceCount = 0;
    
    businesses.forEach((business, bizIndex) => {
      if (business.services && business.services.length > 0) {
        const activeServices = business.services.filter(s => s.isActive !== false);
        
        if (activeServices.length > 0) {
          response += `**${bizIndex + 1}. ${business.name}:**\n`;
          
          activeServices.slice(0, 3).forEach((service, svcIndex) => {
            serviceCount++;
            response += `   ◦ **${service.name}**`;
            if (service.price) response += ` - $${service.price}`;
            if (service.description) {
              const shortDesc = service.description.substring(0, 40);
              response += `\n     ${shortDesc}...`;
            }
            response += `\n`;
          });
          
          response += `\n`;
        }
      }
    });

    if (serviceCount === 0) {
      return `Los comercios están actualizando sus servicios. Revisa más tarde o contacta directamente a los comercios.`;
    }

    response += `\n💡 **Para más detalles:**\n`;
    response += `• Visita el perfil de cada comercio\n`;
    response += `• Contacta al proveedor para cotizaciones\n`;
    response += `• Agenda citas directamente desde la plataforma\n`;
    
    return response;
    
  } catch (error) {
    console.error("Error obteniendo servicios:", error);
    return `Los comercios ofrecen diversos servicios como veterinaria, peluquería, guardería y más. Explora cada comercio para ver sus servicios específicos.`;
  }
}

async function getUserAppointments(userId) {
  try {
    const appointments = await Appointment.find({ userId })
      .populate("petId", "name")
      .populate({
        path: "businessId", // Cambiado de serviceId a businessId
        select: "name categories"
      })
      .limit(5)
      .sort({ date: -1 })
      .lean();

    if (appointments.length === 0) {
      return `No tienes citas agendadas. ¿Te gustaría buscar comercios y agendar una cita?`;
    }

    let response = `📅 **Tus últimas ${appointments.length} citas:**\n\n`;
    
    appointments.forEach((appt, index) => {
      response += `${index + 1}. **${appt.businessId?.name || 'Comercio'}**\n`;
      if (appt.businessId?.categories) {
        response += `   🏷️ ${appt.businessId.categories[0] || 'Servicio'}\n`;
      }
      response += `   🐾 ${appt.petId?.name || 'Mascota'}\n`;
      response += `   📆 ${appt.date ? new Date(appt.date).toLocaleDateString('es-VE') : 'Por confirmar'}\n`;
      response += `   ⏰ ${appt.time || 'Horario por confirmar'}\n`;
      response += `   📊 Estado: ${appt.status}\n\n`;
    });

    return response;
  } catch (error) {
    console.error("Error obteniendo citas:", error);
    return `Revisa tus citas en el panel de usuario para información actualizada.`;
  }
}

async function getUserPets(userId) {
  try {
    const pets = await Pet.find({ owner: userId })
      .select('name type breed age')
      .limit(5)
      .lean();

    if (pets.length === 0) {
      return `No tienes mascotas registradas. ¡Registra tu primera mascota desde "Mis Mascotas" en tu perfil!`;
    }

    let response = `🐾 **Tus ${pets.length} mascotas registradas:**\n\n`;
    
    pets.forEach((pet, index) => {
      response += `${index + 1}. **${pet.name}**\n`;
      response += `   🐕 Tipo: ${pet.type || 'No especificado'}\n`;
      if (pet.breed) response += `   🧬 Raza: ${pet.breed}\n`;
      if (pet.age) response += `   📅 Edad: ${pet.age}\n`;
      response += `\n`;
    });

    response += `🔧 **Puedes:**\n`;
    response += `• Agregar más mascotas\n`;
    response += `• Editar información\n`;
    response += `• Ver historial de cada mascota\n`;
    
    return response;
  } catch (error) {
    console.error("Error obteniendo mascotas:", error);
    return `Accede a "Mis Mascotas" en tu perfil para gestionar toda la información.`;
  }
}

async function getProviderAppointments(providerId) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const appointments = await Appointment.find({
      providerId,
      date: today,
      status: { $in: ['pending', 'confirmed'] }
    })
      .populate("userId", "name")
      .populate("petId", "name")
      .populate("businessId", "name")
      .limit(10)
      .lean();

    if (appointments.length === 0) {
      return `No tienes citas agendadas para hoy. ¡Es buen momento para actualizar tu perfil de comercio!`;
    }

    let response = `📊 **Tienes ${appointments.length} citas hoy:**\n\n`;
    
    appointments.forEach((appt, index) => {
      response += `${index + 1}. **${appt.businessId?.name || 'Servicio'}**\n`;
      response += `   👤 Cliente: ${appt.userId?.name || 'Sin nombre'}\n`;
      response += `   🐾 Mascota: ${appt.petId?.name || 'Sin nombre'}\n`;
      response += `   ⏰ Hora: ${appt.time || 'Por confirmar'}\n`;
      response += `   📊 Estado: ${appt.status}\n\n`;
    });

    return response;
  } catch (error) {
    console.error("Error obteniendo citas proveedor:", error);
    return `Revisa tu agenda en el panel de proveedor para información actualizada.`;
  }
}

async function getAllBusinessesStats() {
  try {
    const totalBusinesses = await Business.countDocuments({ isDeleted: { $ne: true } });
    const activeBusinesses = await Business.countDocuments({ 
      status: 'active', 
      approved: true,
      isDeleted: { $ne: true }
    });
    const pendingBusinesses = await Business.countDocuments({ 
      status: 'pending',
      isDeleted: { $ne: true }
    });

    return `📊 **Estadísticas de Comercios:**\n\n` +
           `• Total registrados: ${totalBusinesses}\n` +
           `• Activos y aprobados: ${activeBusinesses}\n` +
           `• Pendientes de aprobación: ${pendingBusinesses}\n\n` +
           `Revisa el panel de administración para más detalles y gestión.`;
  } catch (error) {
    console.error("Error obteniendo stats:", error);
    return `Consulta el panel de administración para ver el estado de los comercios.`;
  }
}

// ============================================
// 🎯 DETECCIÓN DE INTENCIONES ACTUALIZADA
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
// 🚀 ENDPOINT PRINCIPAL
// ============================================

router.post("/", protect, async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { message } = req.body;
    const { role, name, _id: userId } = req.user;

    // Validación
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
// 📊 ENDPOINTS ADICIONALES
// ============================================

// Health check
router.get("/health", protect, (req, res) => {
  res.json({
    status: "operational",
    service: "PetBot Chat Service",
    userRole: req.user.role,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Diagnóstico
router.get("/diagnostic", protect, async (req, res) => {
  try {
    // Contar comercios disponibles
    const activeBusinesses = await Business.countDocuments({
      status: 'active',
      approved: true,
      isDeleted: { $ne: true }
    });

    const stats = {
      platform: {
        activeBusinesses,
        aiConfigured: !!GEMINI_API_KEY,
        model: GEMINI_MODEL
      },
      user: {
        name: req.user.name,
        role: req.user.role
      },
      system: {
        environment: process.env.NODE_ENV,
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

// ============================================
// 📍 ENDPOINT ESPECÍFICO PARA COMERCIOS
// ============================================

router.get("/businesses", protect, async (req, res) => {
  try {
    const { category, limit = 10 } = req.query;
    const { role } = req.user;

    // Solo clientes y admins pueden ver comercios
    if (role !== "client" && role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "No tienes permiso para ver comercios"
      });
    }

    const query = {
      status: "active",
      approved: true,
      isDeleted: { $ne: true }
    };

    if (category) {
      query.$or = [
        { category: category },
        { categories: category }
      ];
    }

    const businesses = await Business.find(query)
      .select('name categories description address phone email averageServicePrice rating')
      .limit(parseInt(limit))
      .sort({ rating: -1, featured: -1 })
      .lean();

    res.json({
      success: true,
      count: businesses.length,
      data: businesses
    });

  } catch (error) {
    console.error("Error en /businesses:", error);
    res.status(500).json({
      success: false,
      error: "Error obteniendo comercios"
    });
  }
});

export default router;