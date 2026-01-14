import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import User from "../models/User.js";
import Pet from "../models/Pet.js";
import Business from "../models/Business.js";
import Appointment from "../models/Appointment.js";

const router = express.Router();

// ============================================
// 🔧 CONFIGURACIÓN GEMINI - ACTUALIZADA
// ============================================

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.warn("⚠️  ADVERTENCIA: Sin API Key. Usando respuestas predefinidas.");
}

// CAMBIO: Usar modelo compatible con v1beta
// Opciones compatibles: gemini-1.5-pro, gemini-1.0-pro, gemini-pro
const GEMINI_MODEL = 'gemini-1.5-pro'; // Cambiado a modelo compatible
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

// ============================================
// 🚀 FUNCIÓN PARA LLAMAR A GEMINI - ACTUALIZADA
// ============================================

async function callGeminiAPI(prompt, role = "client") {
  if (!GEMINI_API_KEY) {
    console.log("ℹ️  Usando respuesta predefinida (sin API Key)");
    return getFallbackResponse("general", role);
  }

  try {
    console.log(`🤖 Enviando prompt a Gemini (${GEMINI_MODEL})...`);
    console.log(`🔗 URL: ${GEMINI_API_URL.replace(GEMINI_API_KEY, '***')}`);
    
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
          maxOutputTokens: 1000, // Aumentado para respuestas más completas
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
      signal: AbortSignal.timeout(20000) // 20 segundos
    });

    console.log(`📡 Respuesta de Gemini: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Error API Gemini (${response.status}):`, errorText.substring(0, 300));
      
      // Manejar errores específicos
      if (response.status === 404) {
        throw new Error(`Modelo ${GEMINI_MODEL} no encontrado. Prueba con 'gemini-pro' o 'gemini-1.0-pro'.`);
      } else if (response.status === 403) {
        throw new Error(`API Key inválida o sin permisos. Verifica GEMINI_API_KEY en Render.`);
      } else if (response.status === 429) {
        throw new Error(`Límite de tasa excedido. Espera un momento.`);
      } else if (response.status === 400) {
        throw new Error(`Solicitud incorrecta: ${errorText.substring(0, 150)}`);
      } else {
        throw new Error(`API error ${response.status}: ${errorText.substring(0, 150)}`);
      }
    }

    const data = await response.json();
    
    if (!data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.warn("⚠️  Respuesta de Gemini vacía o mal formada:", JSON.stringify(data).substring(0, 200));
      
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
      return "⏰ La solicitud a Gemini tardó demasiado. Intenta nuevamente con una pregunta más específica.";
    } else if (error.message.includes('API Key')) {
      console.error("🔑 ERROR: Verifica GEMINI_API_KEY en variables de entorno de Render");
      return "🔑 Configuración de API incompleta. El asistente está usando respuestas predefinidas.";
    } else if (error.message.includes('Modelo')) {
      console.error(`🤖 ERROR: Modelo ${GEMINI_MODEL} no disponible`);
      return `🤖 Configuración de modelo incorrecta. Usando respuestas predefinidas.`;
    } else if (error.message.includes('400')) {
      return "📝 Error en la solicitud. ¿Podrías reformular tu pregunta?";
    }
    
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

¿Te ayudo a buscar algún comercio específico?`,

      book_appointment: `📅 **Agendar una Cita**

Para agendar una cita:
1. Busca comercios en tu área
2. Selecciona el comercio que prefieras
3. Revisa los servicios disponibles
4. Elige fecha y hora
5. Confirma tu cita

¿Te ayudo a buscar comercios para agendar tu cita?`
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

¿Necesitas ayuda para gestionar alguna cita específica?`,

      provider_business: `🏪 **Tu Comercio**

Gestiona tu comercio desde:
• Perfil del comercio (información, fotos)
• Servicios ofrecidos
• Horarios de atención
• Precios y promociones
• Disponibilidad

¿Qué aspecto de tu comercio quieres actualizar?`
    },

    admin: {
      general: `¡Hola! Soy PetBot, asistente administrativo. 👨‍💼

Áreas de gestión:
• 👥 Usuarios y comercios registrados
• ✅ Aprobación de solicitudes
• 📊 Reportes del sistema
• ⚙️ Configuración de la plataforma
• 🛡️ Moderación y seguridad

¿Qué área necesitas revisar?`,

      admin_pending_businesses: `⏳ **Comercios Pendientes**

Revisa los comercios pendientes de aprobación en el panel de administración.

Para cada comercio puedes:
• Ver detalles completos
• Aprobar o rechazar
• Solicitar información adicional
• Contactar al proveedor

¿Necesitas ayuda con algún caso específico?`
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
    .select('name categories description averageServicePrice address rating')
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
      
      // Calificación
      if (business.rating > 0) {
        response += `   ⭐ Calificación: ${business.rating.toFixed(1)}/5\n`;
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
    .select('name services rating')
    .limit(5)
    .sort({ rating: -1 })
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
          response += `**${bizIndex + 1}. ${business.name}**`;
          if (business.rating > 0) {
            response += ` ⭐ ${business.rating.toFixed(1)}`;
          }
          response += `:\n`;
          
          activeServices.slice(0, 3).forEach((service, svcIndex) => {
            serviceCount++;
            response += `   ◦ **${service.name}**`;
            if (service.price) response += ` - $${service.price}`;
            if (service.duration) response += ` (${service.duration} min)`;
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
        path: "businessId",
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
      .select('name type breed age medicalNotes')
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
      if (pet.medicalNotes) {
        const shortNotes = pet.medicalNotes.substring(0, 50);
        response += `   🏥 Notas: ${shortNotes}...\n`;
      }
      response += `\n`;
    });

    response += `🔧 **Puedes:**\n`;
    response += `• Agregar más mascotas\n`;
    response += `• Editar información\n`;
    response += `• Ver historial de cada mascota\n`;
    response += `• Agregar notas médicas\n`;
    
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
      .populate("userId", "name email")
      .populate("petId", "name")
      .populate("businessId", "name")
      .limit(10)
      .sort({ time: 1 })
      .lean();

    if (appointments.length === 0) {
      return `No tienes citas agendadas para hoy. ¡Es buen momento para actualizar tu perfil de comercio!`;
    }

    let response = `📊 **Tienes ${appointments.length} citas hoy:**\n\n`;
    
    appointments.forEach((appt, index) => {
      response += `${index + 1}. **${appt.businessId?.name || 'Servicio'}**\n`;
      response += `   👤 Cliente: ${appt.userId?.name || 'Sin nombre'}\n`;
      response += `   📧 Email: ${appt.userId?.email || 'No disponible'}\n`;
      response += `   🐾 Mascota: ${appt.petId?.name || 'Sin nombre'}\n`;
      response += `   ⏰ Hora: ${appt.time || 'Por confirmar'}\n`;
      response += `   📊 Estado: ${appt.status}\n`;
      if (appt.notes) {
        response += `   📝 Notas: ${appt.notes.substring(0, 40)}...\n`;
      }
      response += `\n`;
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
    
    // Obtener comercios recientes
    const recentBusinesses = await Business.find({ 
      isDeleted: { $ne: true }
    })
    .select('name status approved createdAt')
    .sort({ createdAt: -1 })
    .limit(3)
    .lean();

    let response = `📊 **Estadísticas de Comercios:**\n\n`;
    response += `• Total registrados: ${totalBusinesses}\n`;
    response += `• Activos y aprobados: ${activeBusinesses}\n`;
    response += `• Pendientes de aprobación: ${pendingBusinesses}\n\n`;
    
    if (recentBusinesses.length > 0) {
      response += `🆕 **Comercios recientes:**\n`;
      recentBusinesses.forEach((biz, index) => {
        response += `${index + 1}. ${biz.name} - ${biz.status} ${biz.approved ? '✅' : '⏳'}\n`;
      });
      response += `\n`;
    }
    
    response += `Revisa el panel de administración para más detalles y gestión.`;
    
    return response;
  } catch (error) {
    console.error("Error obteniendo stats:", error);
    return `Consulta el panel de administración para ver el estado de los comercios.`;
  }
}

// ============================================
// 🎯 DETECCIÓN DE INTENCIONES MEJORADA
// ============================================

function detectIntent(text, role = "client") {
  if (!text || typeof text !== 'string') return "fallback";
  
  const lowerText = text.toLowerCase().trim();

  // Intents básicos
  if (/(hola|buenos|buenas|saludos|hey|hello)/i.test(lowerText)) return "greeting";
  if (/(gracias|thank|merci|agradecido)/i.test(lowerText)) return "thanks";
  if (/(adiós|chao|bye|nos vemos|hasta luego)/i.test(lowerText)) return "goodbye";
  if (/(ayuda|help|soporte|asistencia|no entiendo)/i.test(lowerText)) return "help";
  if (/(quién eres|qué eres|tu nombre|presentate)/i.test(lowerText)) return "about";

  // Intents para clientes
  if (role === "client") {
    if (/(comercios|negocios|tiendas|veterinarias|peluquer[ií]as|proveedores|donde encuentro)/i.test(lowerText)) return "list_businesses";
    if (/(servicios|qué ofrecen|tipos de servicio|que hacen|opciones)/i.test(lowerText)) return "list_services";
    if (/(mis citas|citas agendadas|próximas citas|tengo cita|reservas)/i.test(lowerText)) return "get_user_appointments";
    if (/(mis mascotas|mascotas registradas|animales|perros|gatos)/i.test(lowerText)) return "get_user_pets";
    if (/(agendar cita|nueva cita|reservar|hacer cita|programar|sacar hora)/i.test(lowerText)) return "book_appointment";
    if (/(precios|costos|tarifas|cuánto cuesta|valor|dinero)/i.test(lowerText)) return "prices";
    if (/(emergencia|urgencia|veterinario emergencia|accidente|herido|enfermo)/i.test(lowerText)) return "emergency";
    if (/(cómo funciona|qué es petservices|para qué sirve|explicame)/i.test(lowerText)) return "how_it_works";
  }
  
  // Intents para proveedores
  else if (role === "provider") {
    if (/(citas hoy|agenda hoy|hoy tengo|para hoy|este día)/i.test(lowerText)) return "provider_today_appointments";
    if (/(mi comercio|perfil comercio|mi negocio|mi empresa|mi tienda)/i.test(lowerText)) return "provider_business";
    if (/(mis ingresos|ganancias|ventas|facturación|dinero ganado)/i.test(lowerText)) return "provider_earnings";
    if (/(clientes|mis clientes|usuarios atendidos)/i.test(lowerText)) return "provider_clients";
    if (/(reseñas|calificaciones|opiniones|comentarios)/i.test(lowerText)) return "provider_reviews";
  }
  
  // Intents para administradores
  else if (role === "admin") {
    if (/(comercios|negocios registrados|todos los comercios|proveedores)/i.test(lowerText)) return "admin_list_businesses";
    if (/(proveedores pendientes|aprobar proveedores|solicitudes|pendientes)/i.test(lowerText)) return "admin_pending_businesses";
    if (/(usuarios|listar usuarios|clientes registrados)/i.test(lowerText)) return "admin_list_users";
    if (/(reportes|estadísticas|métricas|analítica)/i.test(lowerText)) return "admin_reports";
    if (/(problemas|errores|incidencias|soporte técnico)/i.test(lowerText)) return "admin_issues";
  }

  // Intents generales adicionales
  if (/(contacto|teléfono|email|correo|dirección|dónde están)/i.test(lowerText)) return "contact";
  if (/(horarios|cuándo abren|disponibilidad)/i.test(lowerText)) return "schedule";

  return "fallback";
}

// ============================================
// 🚀 ENDPOINT PRINCIPAL - OPTIMIZADO
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

    console.log(`💬 Chat [${role}] ${name}: "${text.substring(0, 50)}..." -> ${intent}`);

    // Respuestas rápidas
    const quickResponses = {
      greeting: `¡Hola ${name}! 👋 Soy PetBot, tu asistente virtual de PetServices. ¿En qué puedo ayudarte hoy?`,
      thanks: `¡De nada ${name}! 😊 ¿Hay algo más en lo que pueda asistirte?`,
      goodbye: `¡Hasta luego ${name}! Que tengas un excelente día junto a tus mascotas. 🐾👋`,
      help: `¡Claro que sí ${name}! Puedo ayudarte con:
• Información de comercios y servicios
• Gestión de tus citas
• Información de tus mascotas
• Precios y disponibilidad
• Soporte general

¿Qué necesitas específicamente?`,
      about: `¡Hola! Soy PetBot 🤖, el asistente virtual de PetServices. 
Estoy aquí para ayudarte a encontrar los mejores servicios para tus mascotas, 
gestionar tus citas y resolver cualquier duda sobre la plataforma.

¿En qué puedo ayudarte hoy?`,
      how_it_works: `**📱 Cómo funciona PetServices:**

1. **Busca** comercios especializados cerca de ti
2. **Explora** servicios y precios
3. **Agenda** citas fácilmente
4. **Gestiona** tus mascotas en un solo lugar
5. **Califica** tu experiencia

Todo diseñado para hacerte la vida más fácil junto a tus mascotas. 🐕❤️`,
      contact: `**📞 Contacto PetServices:**

• 📧 Email: soporte@petservices.com
• 📱 Teléfono: +1 (555) 123-4567
• 🏢 Dirección: Av. Principal 123, Ciudad

**Horarios de atención:**
Lunes a Viernes: 9:00 AM - 6:00 PM
Sábados: 10:00 AM - 2:00 PM

¿En qué más puedo ayudarte?`,
      schedule: `**🕒 Horarios de atención:**

La mayoría de los comercios trabajan:
• Lunes a Viernes: 8:00 AM - 7:00 PM
• Sábados: 9:00 AM - 5:00 PM
• Algunos abren domingos: 10:00 AM - 2:00 PM

**Para horarios específicos:**
1. Busca el comercio que te interesa
2. Revisa su perfil completo
3. Contacta directamente para confirmar

¿Buscas algún tipo de comercio en particular?`
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
    const aiIntents = ["book_appointment", "fallback", "provider_business", 
                      "admin_pending_businesses", "provider_earnings", 
                      "provider_clients", "provider_reviews", "admin_reports",
                      "admin_issues", "admin_list_users"];
    
    if (aiIntents.includes(intent)) {
      try {
        // Crear prompt contextualizado
        let systemPrompt = `Eres PetBot, el asistente virtual de PetServices.
Usuario: ${name} (Rol: ${role})
Pregunta: "${text}"

Instrucciones:
• Responde en español claro y conciso
• Mantén un tono amigable y profesional
• Si no tienes la información, ofrece alternativas
• Enfócate en servicios para mascotas
• No inventes información que no tengas

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
      reply: "😔 **Lo siento, hubo un error inesperado.** Por favor, intenta de nuevo en unos momentos o contacta al soporte.",
      type: "error",
      responseTime: Date.now() - startTime
    });
  }
});

// ============================================
// 📊 ENDPOINTS DE DIAGNÓSTICO
// ============================================

// Health check mejorado
router.get("/health", protect, (req, res) => {
  const aiStatus = GEMINI_API_KEY ? {
    configured: true,
    model: GEMINI_MODEL,
    status: "configurado"
  } : {
    configured: false,
    status: "usando respuestas predefinidas"
  };
  
  res.json({
    status: "operational",
    service: "PetBot Chat Service",
    user: {
      name: req.user.name,
      role: req.user.role
    },
    ai: aiStatus,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    responseTime: Date.now()
  });
});

// Diagnóstico completo
router.get("/diagnostic", protect, async (req, res) => {
  try {
    // Contar comercios disponibles
    const activeBusinesses = await Business.countDocuments({
      status: 'active',
      approved: true,
      isDeleted: { $ne: true }
    });

    // Test de conexión a Gemini
    let geminiTest = { status: "not tested" };
    if (GEMINI_API_KEY) {
      try {
        const testResponse = await fetch(GEMINI_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: "Hola" }] }],
            generationConfig: { maxOutputTokens: 10 }
          }),
          signal: AbortSignal.timeout(5000)
        });
        geminiTest = {
          status: testResponse.ok ? "connected" : "error",
          statusCode: testResponse.status
        };
      } catch (error) {
        geminiTest = { status: "error", error: error.message };
      }
    }

    const stats = {
      platform: {
        activeBusinesses,
        totalUsers: await User.countDocuments(),
        totalPets: await Pet.countDocuments(),
        totalAppointments: await Appointment.countDocuments()
      },
      ai: {
        configured: !!GEMINI_API_KEY,
        model: GEMINI_MODEL,
        test: geminiTest,
        apiUrl: GEMINI_API_URL ? GEMINI_API_URL.replace(GEMINI_API_KEY, '***') : null
      },
      user: {
        name: req.user.name,
        role: req.user.role,
        id: req.user._id
      },
      system: {
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
        nodeVersion: process.version,
        memoryUsage: process.memoryUsage()
      }
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error("Error en diagnóstico:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// 📍 ENDPOINT PARA COMERCIOS
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
      .select('name categories description address phone email averageServicePrice rating services')
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

// ============================================
// 🧪 TEST ENDPOINT PARA GEMINI
// ============================================

router.post("/test-gemini", protect, async (req, res) => {
  try {
    const { testMessage = "Hola, ¿cómo estás?" } = req.body;
    
    if (!GEMINI_API_KEY) {
      return res.json({
        success: false,
        error: "API Key de Gemini no configurada en variables de entorno",
        suggestion: "Verifica la variable GEMINI_API_KEY en Render Dashboard",
        envCheck: process.env.GEMINI_API_KEY ? "PRESENTE" : "AUSENTE"
      });
    }
    
    console.log(`🧪 Test Gemini: Modelo ${GEMINI_MODEL}`);
    console.log(`🔗 URL: ${GEMINI_API_URL.replace(GEMINI_API_KEY, '***')}`);
    
    const testPrompt = `Eres PetBot, asistente de PetServices. Responde brevemente en español a: "${testMessage}"`;
    
    const startTime = Date.now();
    const response = await callGeminiAPI(testPrompt, "client");
    const responseTime = Date.now() - startTime;
    
    res.json({
      success: true,
      test: {
        message: testMessage,
        response: response,
        responseTime: `${responseTime}ms`,
        model: GEMINI_MODEL
      },
      configuration: {
        apiKeyPresent: !!GEMINI_API_KEY,
        apiKeyLength: GEMINI_API_KEY.length,
        model: GEMINI_MODEL,
        environment: process.env.NODE_ENV
      }
    });
    
  } catch (error) {
    console.error("Error en test-gemini:", error);
    res.json({
      success: false,
      error: error.message,
      suggestion: "Verifica: 1) API Key válida 2) Modelo compatible 3) Conexión a internet",
      modelAttempted: GEMINI_MODEL,
      availableModels: ["gemini-1.5-pro", "gemini-1.0-pro", "gemini-pro", "gemini-1.5-flash-latest"]
    });
  }
});

// ============================================
// 🔄 MODEL FALLBACK SYSTEM
// ============================================

router.get("/available-models", protect, async (req, res) => {
  // Lista de modelos compatibles con la API v1beta
  const compatibleModels = [
    { name: "gemini-1.5-pro", description: "Modelo Pro más reciente", recommended: true },
    { name: "gemini-1.0-pro", description: "Modelo Pro estable" },
    { name: "gemini-pro", description: "Modelo Pro básico" },
    { name: "gemini-1.5-flash-latest", description: "Flash más reciente" },
    { name: "gemini-1.5-flash", description: "Flash (puede requerir v1alpha)" }
  ];
  
  res.json({
    success: true,
    currentModel: GEMINI_MODEL,
    compatibleModels,
    apiVersion: "v1beta",
    note: "Algunos modelos pueden requerir diferentes versiones de API"
  });
});

export default router;