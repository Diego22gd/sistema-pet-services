// routes/chat.js - Versión para Render
import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import User from "../models/User.js";
import Pet from "../models/Pet.js";
import Service from "../models/Service.js";
import Appointment from "../models/Appointment.js";
import Business from "../models/Business.js";

const router = express.Router();

// ============================================
// 🔧 CONFIGURACIÓN PARA RENDER
// ============================================

// API Key desde variables de entorno (configurar en Render Dashboard)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_KEY;

if (!GEMINI_API_KEY) {
  console.warn("⚠️  ADVERTENCIA: No se encontró GEMINI_API_KEY. El chatbot usará respuestas predefinidas.");
} else {
  console.log("✅ ChatBot configurado con API Key");
}

// Modelo económico para producción
const GEMINI_MODEL = "gemini-1.5-flash-latest";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// ============================================
// 🚀 FUNCIÓN OPTIMIZADA PARA RENDER
// ============================================

async function callGeminiAPI(prompt, role = "client") {
  if (!GEMINI_API_KEY) {
    return getFallbackResponse("general", role);
  }

  try {
    console.log(`🤖 Llamando a Gemini...`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
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
          maxOutputTokens: 800,
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
      console.error(`❌ Gemini API error ${response.status}`);
      
      if (response.status === 429) {
        return "⚠️ **El servicio está muy ocupado.** Por favor, intenta de nuevo en unos minutos.";
      }
      
      if (response.status === 403) {
        return "🔐 **Error de autenticación.** Por favor, verifica la configuración de API Key.";
      }
      
      return getFallbackResponse("general", role);
    }

    const data = await response.json();
    
    if (!data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      return getFallbackResponse("general", role);
    }
    
    return data.candidates[0].content.parts[0].text.trim();
    
  } catch (error) {
    console.error("❌ Error en callGeminiAPI:", error.message);
    
    if (error.name === 'AbortError') {
      return "⏰ **Tiempo de espera agotado.** Intenta nuevamente.";
    }
    
    return getFallbackResponse("general", role);
  }
}

// ============================================
// 📝 RESPUESTAS PREDEFINIDAS (FALLBACK)
// ============================================

function getFallbackResponse(intent = "general", role = "client") {
  const responses = {
    client: {
      general: `¡Hola! Soy PetBot, tu asistente de PetServices. 🐾

Puedo ayudarte con:
• **Mis Mascotas** - Ver y gestionar tus mascotas registradas
• **Mis Citas** - Consultar y agendar citas
• **Negocios** - Encontrar veterinarias, peluquerías, guarderías
• **Servicios** - Ver servicios disponibles y precios
• **Emergencias** - Información de contacto urgente

¿En qué te puedo ayudar hoy?`,

      list_services: `🛎️ **Servicios Disponibles**

En PetServices encontrarás:
• 🏥 **Veterinaria** - Consultas, vacunas, cirugías, emergencias
• ✂️ **Estética** - Baño, corte de pelo, limpieza dental, spa
• 🏠 **Guardería** - Cuidado diurno y nocturno, paseos
• 🎯 **Entrenamiento** - Adiestramiento básico y avanzado
• 🚑 **Emergencias** - Servicio 24/7 para urgencias

¿Qué tipo de servicio necesitas?`,

      list_businesses: `🏢 **Negocios Disponibles**

Puedo ayudarte a encontrar:
• **Veterinarias** - Clínicas y hospitales veterinarios
• **Peluquerías** - Estéticas y spas para mascotas
• **Guarderías** - Hoteles y cuidados diarios
• **Entrenadores** - Adiestradores profesionales
• **Tiendas** - Alimentos y accesorios

¿Qué tipo de negocio buscas? O dime tu ubicación para buscar cerca.`,

      get_user_pets: `🐾 **Tus Mascotas**

Ve a la sección "Mis Mascotas" en tu perfil para:
• Ver todas tus mascotas registradas
• Agregar nueva mascota
• Actualizar información
• Ver historial médico

¿Necesitas ayuda para registrar una nueva mascota?`,

      get_user_appointments: `📅 **Tus Citas**

En la sección "Mis Citas" puedes:
• Ver todas tus citas agendadas
• Cancelar o reagendar citas
• Ver detalles de cada cita
• Calificar el servicio recibido

¿Quieres agendar una nueva cita?`,

      prices: `💰 **Precios y Tarifas**

Los precios varían según:
• Tipo de servicio
• Tamaño de la mascota
• Duración del servicio
• Negocio específico

Para ver precios exactos:
1. Busca el tipo de servicio que necesitas
2. Selecciona un negocio
3. Verás los precios en su perfil

Ejemplo de rangos:
• Consulta veterinaria: $20 - $50
• Baño y corte: $25 - $70
• Guardería diaria: $15 - $40`,

      emergency: `🚑 **Emergencias Veterinarias**

En caso de emergencia:

**Contacta inmediatamente:**
• 📞 Emergencias PetServices: 1-800-PET-HELP
• 📱 Tu veterinario de confianza
• 🏥 Hospital veterinario más cercano

**Síntomas de emergencia:**
• Dificultad para respirar
• Sangrado abundante
• Convulsiones
• Intoxicación
• Trauma por accidente

**¿Qué hacer?**
1. Mantén la calma
2. Contacta emergencias
3. Sigue sus instrucciones
4. Prepára para traslado`
    },

    provider: {
      general: `¡Hola! Soy PetBot, tu asistente para proveedores. 💼

Te ayudo con:
• 📊 **Mi Negocio** - Ver y editar información
• 📅 **Agenda** - Citas de hoy y futuras
• 🛎️ **Servicios** - Gestionar servicios ofrecidos
• 👥 **Clientes** - Información de clientes
• 💰 **Reportes** - Estadísticas e ingresos

¿Qué área necesitas gestionar?`,

      provider_today_appointments: `📅 **Citas de Hoy**

Ve a tu panel de proveedor > Agenda para:
• Ver todas las citas programadas hoy
• Confirmar asistencia de clientes
• Actualizar estados
• Ver detalles completos

¿Necesitas ayuda con alguna cita específica?`,

      provider_business_info: `🏢 **Tu Negocio**

En la gestión de tu negocio puedes:
• Editar información (nombre, descripción, contacto)
• Actualizar horarios de atención
• Agregar/editar servicios ofrecidos
• Subir fotos y logo
• Ver calificaciones y reseñas

¿Qué información necesitas actualizar?`
    },

    admin: {
      general: `¡Hola! Soy PetBot, asistente administrativo. 👨‍💼

Áreas que puedo gestionar:
• 👥 **Usuarios** - Gestión de clientes y proveedores
• 🏢 **Negocios** - Aprobación y monitoreo
• 📊 **Reportes** - Estadísticas del sistema
• ⚙️ **Configuración** - Ajustes generales
• 🛡️ **Moderación** - Reportes y quejas

¿Qué área administrativa necesitas revisar?`,

      admin_list_businesses: `🏢 **Gestión de Negocios**

En el panel de administración > Negocios:
• Ver todos los negocios registrados
• Aprobar/rechazar solicitudes
• Suspender negocios
• Ver reportes de actividad
• Monitorear calificaciones

Actualmente tienes X negocios pendientes de aprobación.`
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
        return await generateProviderResponse(intent, user, userMessage);
      
      case "admin":
        return await generateAdminResponse(intent, user, userMessage);
      
      default: // client
        return await generateClientResponse(intent, user, userMessage);
    }
  } catch (error) {
    console.error(`❌ Error en generateResponseWithData:`, error.message);
    return `Lo siento, hubo un error al procesar tu solicitud. Por favor, intenta nuevamente.`;
  }
}

async function generateClientResponse(intent, user, userMessage) {
  const { name, _id: userId } = user;
  
  switch (intent) {
    case "list_services": {
      try {
        const services = await Service.find({ status: "active" })
          .populate("business", "name rating")
          .select('name description basePrice duration business')
          .limit(10)
          .lean();

        if (services.length === 0) {
          return `Actualmente no hay servicios disponibles. Los proveedores estarán agregando servicios pronto.`;
        }

        let response = `🔍 **Encontré ${services.length} servicios disponibles:**\n\n`;
        
        services.forEach((service, index) => {
          response += `**${index + 1}. ${service.name}**\n`;
          if (service.business?.name) {
            response += `   🏢 ${service.business.name}`;
            if (service.business.rating) response += ` ⭐ ${service.business.rating}`;
            response += `\n`;
          }
          if (service.description) response += `   📝 ${service.description.substring(0, 80)}${service.description.length > 80 ? '...' : ''}\n`;
          if (service.basePrice) response += `   💰 Desde: $${service.basePrice}\n`;
          if (service.duration) response += `   ⏱️ Duración: ${service.duration} min\n`;
          response += `\n`;
        });

        response += `\n¿Te interesa algún servicio en particular o prefieres ver negocios específicos?`;
        return response;
      } catch (error) {
        return getFallbackResponse("list_services", "client");
      }
    }

    case "list_businesses": {
      try {
        // Extraer tipo de negocio del mensaje
        let category = null;
        const lowerMessage = userMessage.toLowerCase();
        
        if (lowerMessage.includes('veterinaria') || lowerMessage.includes('veterinario') || lowerMessage.includes('clínica')) {
          category = 'Veterinaria';
        } else if (lowerMessage.includes('peluquería') || lowerMessage.includes('estética') || lowerMessage.includes('spa')) {
          category = 'Estética';
        } else if (lowerMessage.includes('guardería') || lowerMessage.includes('hotel') || lowerMessage.includes('cuidado')) {
          category = 'Cuidado';
        } else if (lowerMessage.includes('entrenamiento') || lowerMessage.includes('adiestramiento')) {
          category = 'Entrenamiento';
        }

        const query = { status: "approved" };
        if (category) query.category = category;

        const businesses = await Business.find(query)
          .select('name description category address city rating services businessHours')
          .populate("services", "name")
          .limit(8)
          .lean();

        if (businesses.length === 0) {
          return category 
            ? `No encontré ${category.toLowerCase()}s aprobadas en este momento. Prueba con otra categoría o revisa más tarde.`
            : `No hay negocios disponibles en este momento. Prueba más tarde.`;
        }

        let response = category 
          ? `🏥 **${category}s Disponibles (${businesses.length}):**\n\n`
          : `🏢 **Negocios Disponibles (${businesses.length}):**\n\n`;
        
        businesses.forEach((business, index) => {
          response += `**${index + 1}. ${business.name}**\n`;
          response += `   📍 ${business.address}, ${business.city}\n`;
          response += `   🏷️ ${business.category}`;
          if (business.rating) response += ` ⭐ ${business.rating}/5\n`;
          if (business.services && business.services.length > 0) {
            response += `   🛎️ Servicios: ${business.services.slice(0, 3).map(s => s.name).join(', ')}`;
            if (business.services.length > 3) response += `, +${business.services.length - 3} más`;
            response += `\n`;
          }
          response += `\n`;
        });

        response += `\n¿Quieres ver más detalles de algún negocio en particular?`;
        return response;
      } catch (error) {
        console.error("Error list_businesses:", error);
        return getFallbackResponse("list_businesses", "client");
      }
    }

    case "search_business": {
      try {
        const searchTerm = userMessage.toLowerCase().replace(/buscar|negocio|empresa|proveedor/gi, '').trim();
        
        if (!searchTerm || searchTerm.length < 3) {
          return `Por favor, especifica mejor tu búsqueda. Ejemplo: "buscar veterinaria en Caracas" o "peluquería canina".`;
        }

        const businesses = await Business.find({
          status: "approved",
          $or: [
            { name: { $regex: searchTerm, $options: 'i' } },
            { description: { $regex: searchTerm, $options: 'i' } },
            { category: { $regex: searchTerm, $options: 'i' } },
            { address: { $regex: searchTerm, $options: 'i' } },
            { city: { $regex: searchTerm, $options: 'i' } }
          ]
        })
        .select('name description category address city rating services')
        .populate("services", "name price")
        .limit(6)
        .lean();

        if (businesses.length === 0) {
          return `🔍 No encontré negocios que coincidan con "${searchTerm}".\n\nPrueba con:\n• Otros términos de búsqueda\n• Una categoría específica (veterinaria, peluquería, etc.)\n• O ver todos los negocios disponibles`;
        }

        let response = `🔍 **Resultados para "${searchTerm}" (${businesses.length}):**\n\n`;
        
        businesses.forEach((business, index) => {
          response += `**${index + 1}. ${business.name}**\n`;
          response += `   📍 ${business.address}, ${business.city}\n`;
          response += `   🏷️ ${business.category}`;
          if (business.rating) response += ` ⭐ ${business.rating}/5\n`;
          
          if (business.services && business.services.length > 0) {
            const serviceNames = business.services.slice(0, 2).map(s => s.name).join(', ');
            response += `   🛎️ ${serviceNames}`;
            if (business.services.length > 2) response += `, +${business.services.length - 2} más`;
            response += `\n`;
          }
          response += `\n`;
        });

        response += `\n¿De cuál negocio te gustaría ver más detalles o servicios?`;
        return response;
      } catch (error) {
        console.error("Error search_business:", error);
        return `Lo siento, hubo un error en la búsqueda. Intenta nuevamente.`;
      }
    }

    case "get_business_details": {
      try {
        // Extraer nombre del negocio
        const businessName = userMessage.toLowerCase()
          .replace(/(ver|detalles|información|servicios de|negocio)\s+/gi, '')
          .trim();

        if (!businessName || businessName.length < 3) {
          return `Por favor, especifica el nombre del negocio que quieres ver.`;
        }

        const business = await Business.findOne({
          status: "approved",
          name: { $regex: businessName, $options: 'i' }
        })
        .populate({
          path: "services",
          select: 'name description basePrice duration',
          match: { status: "active" }
        })
        .populate("owner", "name email phone")
        .lean();

        if (!business) {
          return `No encontré el negocio "${businessName}". Verifica el nombre o prueba buscando de nuevo.`;
        }

        let response = `🏢 **${business.name}**\n\n`;
        response += `📍 **Dirección:** ${business.address}, ${business.city}\n`;
        if (business.phone) response += `📞 **Teléfono:** ${business.phone}\n`;
        if (business.email) response += `📧 **Email:** ${business.email}\n`;
        if (business.category) response += `🏷️ **Categoría:** ${business.category}\n`;
        if (business.rating) response += `⭐ **Rating:** ${business.rating}/5\n`;
        
        if (business.description) {
          response += `\n📝 **Descripción:**\n${business.description}\n`;
        }

        // Horarios
        if (business.businessHours) {
          response += `\n🕐 **Horarios:**\n`;
          const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
          days.forEach(day => {
            const dayLower = day.toLowerCase();
            if (business.businessHours[dayLower]?.open) {
              response += `   ${day}: ${business.businessHours[dayLower].open} - ${business.businessHours[dayLower].close || 'Cerrado'}\n`;
            }
          });
        }

        // Servicios
        if (business.services && business.services.length > 0) {
          response += `\n🛎️ **Servicios (${business.services.length}):**\n`;
          business.services.forEach((service, index) => {
            response += `\n${index + 1}. **${service.name}**\n`;
            if (service.description) response += `   ${service.description}\n`;
            if (service.basePrice) response += `   💰 Precio: $${service.basePrice}\n`;
            if (service.duration) response += `   ⏱️ Duración: ${service.duration} minutos\n`;
          });
        } else {
          response += `\nℹ️ Este negocio aún no tiene servicios publicados.`;
        }

        response += `\n\n¿Te gustaría agendar una cita con ${business.name} o ver otros negocios similares?`;
        return response;
      } catch (error) {
        console.error("Error get_business_details:", error);
        return `No pude cargar los detalles del negocio. Intenta nuevamente.`;
      }
    }

    case "get_user_appointments": {
      try {
        const appointments = await Appointment.find({ userId })
          .populate("petId", "name")
          .populate({
            path: "serviceId",
            populate: {
              path: "business",
              select: "name"
            }
          })
          .sort({ date: -1 })
          .limit(5)
          .lean();

        if (appointments.length === 0) {
          return `📅 No tienes citas agendadas.\n\n¿Te gustaría agendar tu primera cita? Puedo ayudarte a encontrar servicios o negocios.`;
        }

        let response = `📅 **Tus últimas ${appointments.length} citas:**\n\n`;
        
        appointments.forEach((appt, index) => {
          const apptDate = appt.date ? new Date(appt.date).toLocaleDateString('es-VE', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }) : 'Fecha por confirmar';

          response += `**${index + 1}. ${appt.serviceId?.name || 'Servicio'}**\n`;
          response += `   🏢 ${appt.serviceId?.business?.name || 'Negocio no especificado'}\n`;
          response += `   🐾 Mascota: ${appt.petId?.name || 'No especificada'}\n`;
          response += `   📅 Fecha: ${apptDate}\n`;
          if (appt.time) response += `   ⏰ Hora: ${appt.time}\n`;
          response += `   📋 Estado: ${this.getStatusEmoji(appt.status)} ${appt.status}\n`;
          response += `\n`;
        });

        response += `\nVe a "Mis Citas" en tu perfil para gestionarlas todas.`;
        return response;
      } catch (error) {
        console.error("Error get_user_appointments:", error);
        return `No pude cargar tus citas. Revisa en tu panel de usuario.`;
      }
    }

    case "get_user_pets": {
      try {
        const pets = await Pet.find({ owner: userId })
          .select('name type breed age weight medicalNotes')
          .sort({ createdAt: -1 })
          .limit(5)
          .lean();

        if (pets.length === 0) {
          return `🐾 No tienes mascotas registradas.\n\n¡Registra tu primera mascota! Ve a "Mis Mascotas" en tu perfil y haz clic en "Agregar Mascota".`;
        }

        let response = `🐾 **Tus ${pets.length} mascotas registradas:**\n\n`;
        
        pets.forEach((pet, index) => {
          response += `**${index + 1}. ${pet.name}**\n`;
          if (pet.type) response += `   🐕 Tipo: ${pet.type}\n`;
          if (pet.breed) response += `   🧬 Raza: ${pet.breed}\n`;
          if (pet.age) response += `   🎂 Edad: ${pet.age} años\n`;
          if (pet.weight) response += `   ⚖️ Peso: ${pet.weight} kg\n`;
          response += `\n`;
        });

        response += `\nVe a "Mis Mascotas" para ver toda la información, agregar nuevas o editar las existentes.`;
        return response;
      } catch (error) {
        console.error("Error get_user_pets:", error);
        return `No pude cargar la información de tus mascotas. Intenta desde tu perfil.`;
      }
    }

    default:
      return getFallbackResponse(intent, "client");
  }
}

async function generateProviderResponse(intent, user, userMessage) {
  const { name, _id: userId } = user;
  
  switch (intent) {
    case "provider_today_appointments": {
      try {
        const today = new Date().toISOString().split('T')[0];
        const appointments = await Appointment.find({
          providerId: userId,
          date: today,
          status: { $in: ['pending', 'confirmed', 'in_progress'] }
        })
          .populate("userId", "name email phone")
          .populate("petId", "name")
          .populate("serviceId", "name basePrice")
          .sort({ time: 1 })
          .lean();

        if (appointments.length === 0) {
          return `📅 No tienes citas agendadas para hoy.\n\nRecomendaciones:\n• Revisa tu disponibilidad\n• Actualiza tus servicios\n• Promociona tu negocio`;
        }

        let response = `📅 **Tus citas de hoy (${appointments.length}):**\n\n`;
        
        appointments.forEach((appt, index) => {
          response += `**${index + 1}. ${appt.serviceId?.name || 'Servicio'}**\n`;
          response += `   👤 Cliente: ${appt.userId?.name || 'No especificado'}\n`;
          if (appt.userId?.phone) response += `   📞 Teléfono: ${appt.userId.phone}\n`;
          response += `   🐾 Mascota: ${appt.petId?.name || 'No especificada'}\n`;
          if (appt.time) response += `   ⏰ Hora: ${appt.time}\n`;
          response += `   📋 Estado: ${this.getStatusEmoji(appt.status)} ${appt.status}\n`;
          if (appt.serviceId?.basePrice) response += `   💰 Precio: $${appt.serviceId.basePrice}\n`;
          response += `\n`;
        });

        response += `\nVe a tu panel de proveedor > Agenda para gestionar todas tus citas.`;
        return response;
      } catch (error) {
        console.error("Error provider_today_appointments:", error);
        return `No pude cargar tu agenda de hoy. Revisa en tu panel de proveedor.`;
      }
    }

    case "provider_business_info": {
      try {
        const business = await Business.findOne({ owner: userId })
          .select('name description category address status rating services createdAt')
          .populate("services", "name basePrice status")
          .lean();

        if (!business) {
          return `🏢 No tienes un negocio registrado.\n\nPara registrar tu negocio:\n1. Ve a tu panel de proveedor\n2. Haz clic en "Registrar Negocio"\n3. Completa el formulario\n4. Espera aprobación`;
        }

        let response = `🏢 **Tu Negocio: ${business.name}**\n\n`;
        response += `📋 **Estado:** ${business.status === 'approved' ? '✅ Aprobado' : business.status === 'pending' ? '⏳ Pendiente' : '❌ Rechazado'}\n`;
        response += `🏷️ **Categoría:** ${business.category || 'No especificada'}\n`;
        response += `📍 **Dirección:** ${business.address || 'No especificada'}\n`;
        if (business.rating) response += `⭐ **Rating:** ${business.rating}/5\n`;
        response += `📅 **Registrado:** ${new Date(business.createdAt).toLocaleDateString('es-VE')}\n`;

        if (business.description) {
          response += `\n📝 **Descripción:**\n${business.description}\n`;
        }

        if (business.services && business.services.length > 0) {
          const activeServices = business.services.filter(s => s.status === 'active');
          const inactiveServices = business.services.filter(s => s.status !== 'active');
          
          response += `\n🛎️ **Servicios (${business.services.length}):**\n`;
          response += `   ✅ Activos: ${activeServices.length}\n`;
          response += `   ⏸️ Inactivos: ${inactiveServices.length}\n`;
          
          if (activeServices.length > 0) {
            response += `\n**Servicios Activos:**\n`;
            activeServices.slice(0, 5).forEach((service, index) => {
              response += `${index + 1}. ${service.name}`;
              if (service.basePrice) response += ` - $${service.basePrice}`;
              response += `\n`;
            });
            if (activeServices.length > 5) response += `... y ${activeServices.length - 5} más\n`;
          }
        } else {
          response += `\nℹ️ **No tienes servicios registrados.**\nAgrega servicios desde la gestión de tu negocio.`;
        }

        response += `\n\nVe a tu panel para editar información, agregar servicios o ver estadísticas.`;
        return response;
      } catch (error) {
        console.error("Error provider_business_info:", error);
        return `No pude cargar la información de tu negocio. Revisa en tu panel de proveedor.`;
      }
    }

    default:
      return getFallbackResponse(intent, "provider");
  }
}

async function generateAdminResponse(intent, user, userMessage) {
  const { name, _id: userId } = user;
  
  switch (intent) {
    case "admin_list_businesses": {
      try {
        const pendingCount = await Business.countDocuments({ status: "pending" });
        const approvedCount = await Business.countDocuments({ status: "approved" });
        const rejectedCount = await Business.countDocuments({ status: "rejected" });
        const suspendedCount = await Business.countDocuments({ status: "suspended" });

        const recentBusinesses = await Business.find({})
          .select('name category status createdAt')
          .sort({ createdAt: -1 })
          .limit(5)
          .lean();

        let response = `🏢 **Panel de Negocios - Admin**\n\n`;
        response += `📊 **Estadísticas:**\n`;
        response += `   ⏳ Pendientes: ${pendingCount}\n`;
        response += `   ✅ Aprobados: ${approvedCount}\n`;
        response += `   ❌ Rechazados: ${rejectedCount}\n`;
        response += `   ⚠️ Suspendidos: ${suspendedCount}\n`;
        response += `   📈 Total: ${pendingCount + approvedCount + rejectedCount + suspendedCount}\n\n`;

        if (recentBusinesses.length > 0) {
          response += `🆕 **Negocios Recientes:**\n`;
          recentBusinesses.forEach((business, index) => {
            const statusIcon = business.status === 'approved' ? '✅' : 
                             business.status === 'pending' ? '⏳' : 
                             business.status === 'rejected' ? '❌' : '⚠️';
            response += `${index + 1}. ${statusIcon} ${business.name} (${business.category})\n`;
          });
        }

        response += `\nVe al panel de administración > Negocios para gestionar aprobaciones, suspensiones y ver reportes completos.`;
        return response;
      } catch (error) {
        console.error("Error admin_list_businesses:", error);
        return `No pude cargar las estadísticas de negocios. Revisa el panel de administración.`;
      }
    }

    case "admin_dashboard": {
      try {
        // Estadísticas generales
        const userStats = await User.aggregate([
          { $group: { _id: "$role", count: { $sum: 1 } } }
        ]);

        const appointmentStats = await Appointment.aggregate([
          { 
            $group: { 
              _id: "$status", 
              count: { $sum: 1 },
              totalRevenue: { $sum: "$totalPrice" }
            } 
          }
        ]);

        const businessStats = await Business.aggregate([
          { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        let response = `📊 **Dashboard Administrativo**\n\n`;
        
        response += `👥 **Usuarios:**\n`;
        userStats.forEach(stat => {
          const roleName = stat._id === 'client' ? '👤 Clientes' : 
                          stat._id === 'provider' ? '🏢 Proveedores' : 
                          stat._id === 'admin' ? '👨‍💼 Admins' : '❓ Otros';
          response += `   ${roleName}: ${stat.count}\n`;
        });

        response += `\n🏢 **Negocios:**\n`;
        const businessMap = {};
        businessStats.forEach(stat => businessMap[stat._id] = stat.count);
        response += `   ⏳ Pendientes: ${businessMap.pending || 0}\n`;
        response += `   ✅ Aprobados: ${businessMap.approved || 0}\n`;
        response += `   ❌ Rechazados: ${businessMap.rejected || 0}\n`;

        response += `\n📅 **Citas:**\n`;
        const appointmentMap = {};
        let totalRevenue = 0;
        appointmentStats.forEach(stat => {
          appointmentMap[stat._id] = stat.count;
          totalRevenue += stat.totalRevenue || 0;
        });
        response += `   ✅ Completadas: ${appointmentMap.completed || 0}\n`;
        response += `   ⏳ Pendientes: ${appointmentMap.pending || 0}\n`;
        response += `   📅 Confirmadas: ${appointmentMap.confirmed || 0}\n`;
        if (totalRevenue > 0) response += `   💰 Ingresos totales: $${totalRevenue}\n`;

        response += `\n🔍 **Acciones rápidas:**\n`;
        response += `• Revisar negocios pendientes\n`;
        response += `• Ver reportes del sistema\n`;
        response += `• Monitorear actividad\n`;
        response += `• Configurar parámetros\n`;

        return response;
      } catch (error) {
        console.error("Error admin_dashboard:", error);
        return `No pude cargar el dashboard. Revisa el panel de administración.`;
      }
    }

    default:
      return getFallbackResponse(intent, "admin");
  }
}

// Función auxiliar para emojis de estado
function getStatusEmoji(status) {
  const emojis = {
    pending: '⏳',
    confirmed: '✅',
    cancelled: '❌',
    completed: '🏁',
    in_progress: '🔄',
    no_show: '🚫'
  };
  return emojis[status] || '📋';
}

// ============================================
// 🎯 DETECCIÓN DE INTENCIONES MEJORADA
// ============================================

function detectIntent(text, role = "client") {
  if (!text || typeof text !== 'string') return "fallback";
  
  const lowerText = text.toLowerCase().trim();

  // Intents básicos
  if (/(hola|buenos|buenas|saludos|hello|hi)/i.test(lowerText)) return "greeting";
  if (/(gracias|thank|thanks|agradezco)/i.test(lowerText)) return "thanks";
  if (/(adiós|chao|bye|nos vemos|hasta luego)/i.test(lowerText)) return "goodbye";
  if (/(ayuda|help|soporte|asistencia)/i.test(lowerText)) return "help";
  if (/(quién eres|qué eres|tu nombre|presentate)/i.test(lowerText)) return "about";

  // Intents de negocios
  if (/(buscar|encontrar|ver|listar).*(negocio|empresa|proveedor|veterinaria|peluquería|guardería)/i.test(lowerText)) return "search_business";
  if (/(negocio|empresa|proveedor).*(detalles|información|servicios|horarios)/i.test(lowerText) || 
      /(ver|detalles de|información de).*(negocio|empresa)/i.test(lowerText)) return "get_business_details";
  if (/(negocios|empresas|proveedores|veterinarias|peluquerías|guarderías)/i.test(lowerText) && 
      !/(mi|mis|mío|mía)/i.test(lowerText)) return "list_businesses";

  // Intents de servicios
  if (/(servicios|qué ofrecen|qué hay|opciones).*(mascota|perro|gato)/i.test(lowerText) || 
      /(tipos de|clases de).*servicio/i.test(lowerText)) return "list_services";

  // Intents por rol
  if (role === "client") {
    if (/(mis citas|citas agendadas|próximas citas|historial.*citas)/i.test(lowerText)) return "get_user_appointments";
    if (/(mis mascotas|mascotas registradas|mis perros|mis gatos)/i.test(lowerText)) return "get_user_pets";
    if (/(agendar|reservar|solicitar).*(cita|consulta|servicio)/i.test(lowerText)) return "book_appointment";
  } 
  else if (role === "provider") {
    if (/(citas hoy|agenda hoy|hoy tengo|hoy.*citas)/i.test(lowerText)) return "provider_today_appointments";
    if (/(mi negocio|negocio mío|información.*negocio|datos.*empresa)/i.test(lowerText)) return "provider_business_info";
  }
  else if (role === "admin") {
    if (/(negocios|proveedores).*(pendientes|aprobar|revisar)/i.test(lowerText)) return "admin_list_businesses";
    if (/(dashboard|panel|estadísticas|métricas|reportes)/i.test(lowerText)) return "admin_dashboard";
  }

  // Intents generales
  if (/(precio|costos|tarifas|cuánto cuesta|valor)/i.test(lowerText)) return "prices";
  if (/(emergencia|urgencia|accidente|enfermo|grave)/i.test(lowerText)) return "emergency";
  if (/(contacto|teléfono|email|correo|ubicación)/i.test(lowerText)) return "contact";
  if (/(cómo funciona|uso|utilizar|tutorial|guía)/i.test(lowerText)) return "how_to";

  return "fallback";
}

// ============================================
// 🚀 ENDPOINT PRINCIPAL - OPTIMIZADO PARA RENDER
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

    console.log(`💬 [${role}] ${name}: "${text.substring(0, 50)}..." → ${intent}`);

    // Respuestas rápidas predefinidas
    const quickResponses = {
      greeting: `¡Hola ${name}! 👋 Soy PetBot, tu asistente virtual de PetServices.\n\n¿En qué puedo ayudarte hoy?`,
      thanks: `¡De nada! 😊 Es un placer ayudarte.\n\n¿Hay algo más en lo que pueda asistirte?`,
      goodbye: `¡Hasta luego ${name}! Que tengas un excelente día. 🐾\n\nRecuerda que estoy aquí para ayudarte cuando lo necesites.`,
      help: `¡Claro! Te ayudo con:\n\n📋 **Información:** Negocios, servicios, precios\n🐾 **Gestión:** Tus mascotas y citas\n🏢 **Negocios:** Búsqueda y detalles\n🚑 **Emergencias:** Contactos urgentes\n\n¿Qué necesitas específicamente?`,
      about: `🤖 **Soy PetBot**, el asistente virtual de PetServices.\n\nMi propósito es ayudarte a:\n• Encontrar los mejores servicios para tus mascotas\n• Gestionar tus citas y mascotas\n• Conectar con negocios de confianza\n• Resolver dudas sobre el sistema\n\n¿En qué puedo asistirte?`
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
    const dataIntents = [
      "list_services", 
      "list_businesses", 
      "search_business",
      "get_business_details",
      "get_user_appointments", 
      "get_user_pets", 
      "provider_today_appointments", 
      "provider_business_info",
      "admin_list_businesses",
      "admin_dashboard"
    ];
    
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
        console.error("❌ Error DB:", dbError.message);
        
        // Respuesta de error amigable
        let errorReply = `😔 Lo siento, hubo un problema al procesar tu solicitud.\n\n`;
        errorReply += `**Posibles soluciones:**\n`;
        errorReply += `• Intenta nuevamente en un momento\n`;
        errorReply += `• Revisa tu conexión a internet\n`;
        errorReply += `• Si el problema persiste, contacta a soporte\n`;
        
        return res.json({
          success: true,
          reply: errorReply,
          type: "error",
          intent,
          responseTime: Date.now() - startTime
        });
      }
    }

    // Intents que usan IA (respuesta inmediata + procesamiento async)
    if (["book_appointment", "prices", "emergency", "contact", "how_to", "fallback"].includes(intent)) {
      
      // Respuesta inmediata
      const initialResponse = {
        success: true,
        reply: "🤔 **Procesando tu consulta...**\n\nUn momento mientras busco la mejor información para ti.",
        type: "processing",
        intent,
        responseTime: Date.now() - startTime
      };

      res.json(initialResponse);

      // Procesamiento async en segundo plano
      setTimeout(async () => {
        try {
          const systemPrompt = `Eres PetBot, asistente virtual de PetServices. Usuario: ${name} (${role}). 
Pregunta: "${text}"
Contexto: Sistema de gestión para servicios de mascotas.

Instrucciones:
1. Responde en español, tono amigable pero profesional
2. Máximo 3 párrafos
3. Usa emojis relevantes 🐾🏥✂️
4. Si no sabes algo, sugiere alternativas
5. Evita información inventada

Datos disponibles:
• Sistema con clientes, proveedores y administradores
• Negocios: veterinarias, peluquerías, guarderías
• Servicios varían por negocio
• Precios dependen del servicio y negocio`;

          const aiReply = await callGeminiAPI(systemPrompt, role);
          
          console.log(`✅ IA completada para ${intent} (${Date.now() - startTime}ms)`);
          
        } catch (aiError) {
          console.error("❌ Error IA async:", aiError.message);
        }
      }, 0);

      return;
    }

    // Fallback final
    const fallbackReply = `🤔 No estoy seguro de entender completamente.\n\n**Puedo ayudarte con:**\n• 🔍 Búsqueda de negocios y servicios\n• 📅 Gestión de citas y mascotas\n• 💰 Información de precios\n• 🚑 Contactos de emergencia\n• 📋 Tutoriales y guías\n\n¿Podrías reformular tu pregunta o elegir una de estas opciones?`;
    
    return res.json({
      success: true,
      reply: fallbackReply,
      type: "text",
      intent: "fallback",
      responseTime: Date.now() - startTime
    });

  } catch (error) {
    console.error("❌ Error crítico en chat:", error);
    
    const errorReply = `😔 **Lo siento, ocurrió un error inesperado.**\n\n**Por favor:**\n1. Intenta nuevamente en unos minutos\n2. Verifica tu conexión a internet\n3. Si el problema persiste, contacta a soporte\n\n**Error técnico:** ${error.message.substring(0, 100)}`;
    
    return res.json({
      success: false,
      reply: errorReply,
      type: "error",
      responseTime: Date.now() - startTime
    });
  }
});

// ============================================
// 🔍 ENDPOINTS ADICIONALES
// ============================================

// Health check para Render
router.get("/health", protect, (req, res) => {
  res.json({
    status: "healthy",
    service: "PetBot Chat API",
    version: "2.0.0",
    environment: process.env.NODE_ENV || "development",
    ai: {
      provider: GEMINI_API_KEY ? "Google Gemini" : "Fallback Mode",
      model: GEMINI_MODEL,
      configured: !!GEMINI_API_KEY
    },
    features: ["Negocios", "Servicios", "Mascotas", "Citas", "IA"],
    user: {
      role: req.user.role,
      name: req.user.name
    },
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Diagnóstico del sistema
router.get("/diagnostic", protect, async (req, res) => {
  try {
    const stats = {
      gemini: {
        configured: !!GEMINI_API_KEY,
        key_length: GEMINI_API_KEY ? GEMINI_API_KEY.length : 0,
        model: GEMINI_MODEL
      },
      database: {
        users: await User.countDocuments({}),
        pets: await Pet.countDocuments({}),
        businesses: await Business.countDocuments({}),
        services: await Service.countDocuments({}),
        appointments: await Appointment.countDocuments({})
      },
      system: {
        node_version: process.version,
        memory: process.memoryUsage(),
        platform: process.platform,
        uptime: process.uptime()
      },
      user: {
        id: req.user._id,
        role: req.user.role,
        name: req.user.name
      }
    };

    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.json({
      success: false,
      error: error.message
    });
  }
});

// Endpoint para pruebas (sin autenticación)
router.post("/test", async (req, res) => {
  try {
    const { message, role = "client" } = req.body;
    
    if (!message) {
      return res.json({
        success: false,
        reply: "Por favor, incluye un mensaje en el cuerpo de la solicitud."
      });
    }

    console.log(`🧪 Test: "${message.substring(0, 50)}..."`);
    
    const testUser = {
      _id: "test_user",
      name: "Usuario de Prueba",
      role: role,
      email: "test@example.com"
    };

    const intent = detectIntent(message, role);
    let reply;

    if (intent === "greeting") {
      reply = `¡Hola Usuario de Prueba! 👋 Soy PetBot en modo test.\n\nMensaje recibido: "${message}"\n\nIntención detectada: ${intent}`;
    } else if (["list_services", "list_businesses"].includes(intent)) {
      reply = `🔍 **Resultado de prueba para: "${message}"**\n\nEn un entorno real, buscaría en la base de datos:\n• Negocios aprobados\n• Servicios activos\n• Información detallada\n\nIntención detectada: ${intent}`;
    } else {
      const systemPrompt = `[MODO PRUEBA] Eres PetBot. Responde a: "${message}"
Usuario: Usuario de Prueba (${role})
Contexto: Sistema de prueba - no hay datos reales`;
      
      reply = await callGeminiAPI(systemPrompt, role);
    }

    res.json({
      success: true,
      reply,
      test: true,
      intent,
      role,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.json({
      success: false,
      reply: `❌ Error en prueba: ${error.message}`,
      test: true
    });
  }
});

// Endpoint simple para monitoreo (sin auth)
router.get("/status", (req, res) => {
  res.json({
    status: "online",
    service: "PetBot Chat API",
    time: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

export default router;