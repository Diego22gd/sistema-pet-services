import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import User from "../models/User.js";
import Pet from "../models/Pet.js";
import Business from "../models/Business.js";
import Appointment from "../models/Appointment.js";

const router = express.Router();

// ============================================
// 🔧 CONFIGURACIÓN CORREGIDA PARA GEMINI
// ============================================

// Obtener API Key de múltiples fuentes posibles
const GEMINI_API_KEY = 
  process.env.GEMINI_API_KEY || 
  process.env.GOOGLE_AI_KEY || 
  process.env.GOOGLE_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn("⚠️  ADVERTENCIA: No se encontró API Key de Gemini. El chatbot usará respuestas predefinidas.");
} else {
  console.log("✅ API Key de Gemini configurada");
  console.log("🔑 Longitud de la key:", GEMINI_API_KEY.length);
  console.log("📝 Key (inicio):", GEMINI_API_KEY.substring(0, 10) + "...");
}

// **MODELO CORREGIDO** - Sin "models/" al inicio
const GEMINI_MODEL = "gemini-1.5-flash"; // ✅ CORRECTO
// Alternativas válidas:
// - gemini-1.5-pro (mejor calidad)
// - gemini-pro (legacy)

console.log("🤖 Modelo configurado:", GEMINI_MODEL);

// **URL CORREGIDA** - Formato correcto
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

// ============================================
// 🚀 FUNCIÓN CORREGIDA PARA LLAMAR A GEMINI
// ============================================

async function callGeminiAPI(prompt, role = "client") {
  if (!GEMINI_API_KEY) {
    console.log("📝 Usando respuesta predefinida (sin API Key)");
    return getFallbackResponse("general", role);
  }

  try {
    console.log(`🤖 Llamando a Gemini (${GEMINI_MODEL})...`);
    
    // Intentar primero con v1beta (funciona para la mayoría)
    let apiVersion = "v1beta";
    let apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
    
    console.log(`🔗 URL de prueba: ${apiUrl.replace(GEMINI_API_KEY, '***')}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(apiUrl, {
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
          }
        ]
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    console.log(`📡 Respuesta Gemini: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Error Gemini (${response.status}):`, errorText.substring(0, 200));
      
      if (response.status === 404) {
        // Intentar con modelo alternativo
        console.log("🔄 Probando con modelo alternativo gemini-pro...");
        const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;
        
        const fallbackResponse = await fetch(fallbackUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt.substring(0, 1000) }] }],
            generationConfig: { maxOutputTokens: 500 }
          }),
          signal: AbortSignal.timeout(8000)
        });
        
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          if (fallbackData?.candidates?.[0]?.content?.parts?.[0]?.text) {
            console.log("✅ Usando modelo alternativo gemini-pro");
            return fallbackData.candidates[0].content.parts[0].text.trim();
          }
        }
        
        throw new Error(`Modelo ${GEMINI_MODEL} no encontrado. API Key: ${GEMINI_API_KEY ? "Configurada" : "No configurada"}`);
      }
      
      if (response.status === 403) {
        throw new Error(`API Key inválida o sin permisos.`);
      }
      
      if (response.status === 429) {
        throw new Error(`Límite de tasa excedido. Demasiadas solicitudes.`);
      }
      
      throw new Error(`API error ${response.status}: ${errorText.substring(0, 100)}`);
    }

    const data = await response.json();
    
    if (!data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.warn("⚠️  Respuesta de Gemini vacía o mal formada");
      return getFallbackResponse("general", role);
    }
    
    const reply = data.candidates[0].content.parts[0].text.trim();
    console.log(`✅ Respuesta recibida (${reply.length} caracteres)`);
    return reply;
    
  } catch (error) {
    console.error("❌ Error en callGeminiAPI:", error.message);
    
    // Manejo específico de errores
    if (error.name === 'AbortError') {
      return "⏰ **Tiempo de espera agotado.** El servicio está respondiendo lentamente. Intenta nuevamente.";
    }
    
    if (error.message.includes('Modelo') || error.message.includes('404')) {
      return `🤖 **Error de configuración:** El modelo de IA no está disponible. Verifica que tu API Key sea válida y esté correctamente configurada.`;
    }
    
    if (error.message.includes('API Key')) {
      return `🔐 **Error de autenticación:** La API Key de Google AI no es válida o ha expirado. Verifica tus credenciales.`;
    }
    
    return getFallbackResponse("general", role);
  }
}

// ============================================
// 🛡️ RESPUESTAS PREDEFINIDAS (FALLBACK)
// ============================================

function getFallbackResponse(intent = "general", role = "client") {
  const responses = {
    client: {
      general: `¡Hola! Soy PetBot, tu asistente de PetServices. 🐾

**Puedo ayudarte con:**
• 🏢 **Comercios** - Veterinarias, peluquerías, guarderías
• 🛎️ **Servicios** - Consultas, baños, entrenamiento
• 📅 **Citas** - Agendar y ver tus reservas
• 🐾 **Mascotas** - Gestionar tus mascotas registradas
• 💰 **Precios** - Consultar tarifas y promociones
• 🚑 **Emergencias** - Contactos de urgencia

**¿Qué necesitas hoy?**`,

      list_businesses: `🏢 **Comercios Disponibles**

En PetServices encontrarás:

**🏥 Veterinarias:**
• Clínicas generales y especializadas
• Servicios de emergencia 24/7
• Centros de diagnóstico
• Hospitalización

**✂️ Peluquerías Caninas:**
• Baño y secado profesional
• Corte de pelo por razas
• Limpieza dental y de oídos
• Spa y tratamientos especiales

**🏠 Guarderías:**
• Cuidado diurno y nocturno
• Paseos personalizados
• Áreas de juego supervisadas
• Alimentación especializada

**🎯 Entrenamiento:**
• Adiestramiento básico y avanzado
• Corrección de conductas
• Socialización
• Entrenamiento especializado

¿Qué tipo de comercio te interesa?`,

      list_services: `🛎️ **Catálogo de Servicios**

**🏥 Servicios Veterinarios:**
• Consulta general ($20-$50)
• Vacunación ($15-$40)
• Desparasitación ($10-$30)
• Cirugías ($100-$500+)
• Rayos X ($40-$120)
• Hospitalización ($50-$150/día)

**✂️ Servicios de Estética:**
• Baño básico ($15-$35)
• Corte completo ($25-$70)
• Corte de uñas ($10-$20)
• Limpieza dental ($20-$50)
• Corte higiénico ($15-$30)
• Spa mascota ($30-$80)

**🏠 Servicios de Cuidado:**
• Guardería diurna ($15-$40/día)
• Paseos ($10-$25/paseo)
• Visitas a domicilio ($20-$40/visita)
• Cuidado nocturno ($20-$50/noche)
• Transporte mascota ($15-$35/trayecto)

**🎯 Servicios de Entrenamiento:**
• Entrenamiento básico ($30-$80/sesión)
• Corrección conductas ($40-$100/sesión)
• Socialización ($25-$60/sesión)
• Entrenamiento avanzado ($50-$120/sesión)

¿Te interesa algún servicio en particular?`,

      get_user_pets: `🐾 **Tus Mascotas**

Para ver y gestionar tus mascotas:
1. Ve a tu perfil > "Mis Mascotas"
2. Haz clic en "Agregar Mascota" para registrar una nueva
3. Completa la información (nombre, tipo, raza, edad)
4. Guarda los cambios

**¿Necesitas ayuda específica?**
• Registrar una nueva mascota
• Actualizar información médica
• Ver historial de servicios
• Agregar notas importantes`,

      prices: `💰 **Información de Precios**

Los precios en PetServices varían según:

**Factores que influyen:**
• Tipo de servicio/comercio
• Tamaño y raza de la mascota
• Ubicación geográfica
• Experiencia del proveedor
• Duración del servicio

**Para obtener precios exactos:**
1. Busca comercios en tu área
2. Revisa sus perfiles y servicios
3. Contacta directamente para cotización
4. Agenda una consulta inicial

**Rangos aproximados:**
• Consulta veterinaria: $20 - $60
• Baño y corte: $25 - $80
• Guardería diaria: $15 - $50
• Entrenamiento básico: $30 - $100/sesión

¿Te ayudo a buscar algún comercio específico para cotizar?`,

      book_appointment: `📅 **Cómo Agendar una Cita**

**Pasos para agendar:**
1. **Busca comercios** - Encuentra proveedores en tu área
2. **Selecciona servicio** - Elige el servicio que necesitas
3. **Revisa disponibilidad** - Ve los horarios disponibles
4. **Completa información** - Datos de tu mascota y contacto
5. **Confirma cita** - Recibirás confirmación por email

**Recomendaciones:**
• Agenda con al menos 24 horas de anticipación
• Confirma la cita 2 horas antes
• Lleva el historial médico de tu mascota
• Puntualidad para mejores resultados

¿Te ayudo a buscar comercios disponibles para agendar?`,

      emergency: `🚑 **Emergencias Veterinarias**

**Contactos inmediatos:**
• 📞 Emergencias PetServices: 1-800-PET-HELP
• 📱 Tu veterinario de confianza
• 🏥 Hospital veterinario más cercano

**Síntomas de emergencia:**
• Dificultad para respirar
• Sangrado abundante
• Convulsiones o temblores
• Intoxicación o envenenamiento
• Trauma por accidente
• Vómito o diarrea persistentes
• Incapacidad para orinar

**¿Qué hacer?**
1. **Mantén la calma** - Tu mascota necesita que estés tranquilo
2. **Contacta emergencias** - Llama inmediatamente
3. **Sigue instrucciones** - Los profesionales te guiarán
4. **Prepára para traslado** - Ten lista el transportín
5. **Lleva documentos** - Historial médico, vacunas`

    },

    provider: {
      general: `¡Hola! Soy PetBot, tu asistente para proveedores. 💼

**Te ayudo con:**
• 🏢 **Mi Comercio** - Perfil, servicios, horarios
• 📅 **Agenda** - Citas del día y futuras
• 👥 **Clientes** - Información y contacto
• 💰 **Ingresos** - Reportes y estadísticas
• ⭐ **Calificaciones** - Reseñas y feedback

**¿Qué área necesitas gestionar hoy?**`,

      provider_today_appointments: `📅 **Gestión de Citas Hoy**

Para gestionar tus citas del día:
1. Ve a tu panel de proveedor
2. Accede a "Agenda del Día"
3. Verás todas las citas programadas
4. Puedes confirmar, cancelar o modificar

**Funcionalidades disponibles:**
• Ver detalles completos de cada cita
• Contactar directamente al cliente
• Actualizar estados (confirmada, completada, cancelada)
• Agregar notas y observaciones
• Enviar recordatorios automáticos

**¿Necesitas ayuda específica con alguna cita?**`
    },

    admin: {
      general: `¡Hola! Soy PetBot, asistente administrativo. 👨‍💼

**Áreas de gestión administrativa:**
• 👥 **Usuarios** - Clientes y proveedores registrados
• 🏢 **Comercios** - Aprobación y moderación
• 📊 **Reportes** - Estadísticas del sistema
• ⚙️ **Configuración** - Ajustes de plataforma
• 🛡️ **Seguridad** - Monitoreo y auditoría

**¿Qué área necesitas revisar?**`,

      admin_list_businesses: `🏢 **Panel de Administración - Comercios**

En el panel de administración puedes:

**Gestión de comercios:**
• Ver todos los comercios registrados
• Aprobar/rechazar solicitudes pendientes
• Suspender comercios por incumplimiento
• Modificar información básica
• Ver reportes de actividad

**Estadísticas:**
• Total de comercios registrados
• Comercios activos vs inactivos
• Comercios pendientes de aprobación
• Calificaciones promedio
• Ingresos generados

Ve al panel de administración > Comercios para acciones detalladas.`
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
    console.error(`❌ Error en generateResponseWithData (${intent}):`, error.message);
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
      return `Actualmente no hay comercios disponibles. Los administradores están trabajando para añadir nuevos proveedores.\n\n¿Te gustaría ser el primero en registrar tu comercio?`;
    }

    let response = `🏢 **Encontré ${businesses.length} comercios disponibles:**\n\n`;
    
    businesses.forEach((business, index) => {
      response += `${index + 1}. **${business.name}**\n`;
      
      if (business.categories && business.categories.length > 0) {
        const categories = business.categories.slice(0, 2);
        response += `   📍 ${categories.join(', ')}\n`;
      }
      
      if (business.description) {
        const shortDesc = business.description.substring(0, 60);
        response += `   📝 ${shortDesc}...\n`;
      }
      
      if (business.averageServicePrice > 0) {
        response += `   💰 Precio promedio: $${business.averageServicePrice.toFixed(2)}\n`;
      }
      
      if (business.address) {
        const shortAddr = business.address.substring(0, 40);
        response += `   🏠 ${shortAddr}\n`;
      }
      
      if (business.rating > 0) {
        response += `   ⭐ Calificación: ${business.rating.toFixed(1)}/5\n`;
      }
      
      response += `\n`;
    });

    response += `\n🔍 **Para buscar más opciones:**\n`;
    response += `• Ve a "Buscar Comercios" en el menú principal\n`;
    response += `• Filtra por categoría o ubicación\n`;
    response += `• Contacta directamente a los comercios\n`;
    response += `• Agenda citas desde sus perfiles\n`;
    
    return response;
    
  } catch (error) {
    console.error("Error obteniendo comercios:", error);
    return `No puedo cargar la lista de comercios en este momento. Intenta más tarde o busca manualmente en la plataforma.`;
  }
}

async function getServicesList(user) {
  try {
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
      return `Actualmente no hay servicios disponibles. Los proveedores están actualizando sus ofertas.\n\nPrueba más tarde o contacta directamente a los comercios.`;
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
    response += `• Compara precios y servicios\n`;
    
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
      return `No tienes citas agendadas. ¿Te gustaría buscar comercios y agendar una cita?\n\nPuedo ayudarte a encontrar servicios disponibles.`;
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

    response += `🔧 **Acciones disponibles:**\n`;
    response += `• Reagendar citas\n`;
    response += `• Cancelar citas\n`;
    response += `• Ver detalles completos\n`;
    response += `• Calificar el servicio\n`;
    
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
      return `No tienes mascotas registradas. ¡Registra tu primera mascota desde "Mis Mascotas" en tu perfil!\n\n**Pasos para registrar:**\n1. Ve a tu perfil\n2. Haz clic en "Mis Mascotas"\n3. Selecciona "Agregar Mascota"\n4. Completa la información\n5. Guarda los cambios`;
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
    response += `• Subir fotos\n`;
    
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
      return `No tienes citas agendadas para hoy. ¡Es buen momento para actualizar tu perfil de comercio!\n\n**Recomendaciones:**\n• Actualiza tus servicios\n• Sube nuevas fotos\n• Revisa tu disponibilidad\n• Promociona tu comercio`;
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

    response += `🔧 **Acciones recomendadas:**\n`;
    response += `• Confirmar asistencia de clientes\n`;
    response += `• Preparar materiales necesarios\n`;
    response += `• Revisar historial de mascotas\n`;
    response += `• Establecer recordatorios\n`;
    
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
    
    response += `**Acciones administrativas:**\n`;
    response += `• Revisar solicitudes pendientes\n`;
    response += `• Aprobar/rechazar comercios\n`;
    response += `• Modificar información\n`;
    response += `• Ver reportes detallados\n`;
    response += `• Monitorear actividad\n`;
    
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
  if (/(hola|buenos|buenas|saludos|hello|hi)/i.test(lowerText)) return "greeting";
  if (/(gracias|thank|thanks|agradezco)/i.test(lowerText)) return "thanks";
  if (/(adiós|chao|bye|nos vemos|hasta luego)/i.test(lowerText)) return "goodbye";
  if (/(ayuda|help|soporte|asistencia)/i.test(lowerText)) return "help";
  if (/(quién eres|qué eres|tu nombre|presentate)/i.test(lowerText)) return "about";

  // Intents específicos de comercios y servicios
  if (/(comercios|negocios|tiendas|veterinarias|peluquer[ií]as|guarder[ií]as)/i.test(lowerText)) 
    return "list_businesses";
  
  if (/(servicios|qué ofrecen|qué hay|opciones).*(mascota|perro|gato)/i.test(lowerText) || 
      /(tipos de|clases de).*servicio/i.test(lowerText)) 
    return "list_services";
  
  if (/(buscar|encontrar|necesito|quiero|dónde).*(veterinari|clínica|doctor|médico)/i.test(lowerText)) 
    return "search_veterinary";
  
  if (/(buscar|encontrar|necesito|quiero|dónde).*(peluquería|estética|baño|corte|spa|aseo)/i.test(lowerText)) 
    return "search_grooming";
  
  if (/(buscar|encontrar|necesito|quiero|dónde).*(guardería|hotel|cuidado|paseo|cuidador)/i.test(lowerText)) 
    return "search_care";

  // Intents por rol
  if (role === "client") {
    if (/(mis citas|citas agendadas|próximas citas|historial.*citas)/i.test(lowerText)) return "get_user_appointments";
    if (/(mis mascotas|mascotas registradas|mis perros|mis gatos)/i.test(lowerText)) return "get_user_pets";
    if (/(agendar|reservar|solicitar).*(cita|consulta|servicio)/i.test(lowerText)) return "book_appointment";
    if (/(precio|costos|tarifas|cuánto cuesta|valor)/i.test(lowerText)) return "prices";
    if (/(emergencia|urgencia|accidente|enfermo|grave)/i.test(lowerText)) return "emergency";
  }
  
  // Intents para proveedores
  else if (role === "provider") {
    if (/(citas hoy|agenda hoy|hoy tengo|hoy.*citas)/i.test(lowerText)) return "provider_today_appointments";
    if (/(mi comercio|negocio mío|información.*negocio|datos.*empresa)/i.test(lowerText)) return "provider_business";
  }
  
  // Intents para administradores
  else if (role === "admin") {
    if (/(comercios|negocios|proveedores).*(pendientes|aprobar|revisar)/i.test(lowerText)) return "admin_list_businesses";
    if (/(dashboard|panel|estadísticas|métricas|reportes)/i.test(lowerText)) return "admin_dashboard";
  }

  return "fallback";
}

// ============================================
// 🚀 ENDPOINT PRINCIPAL MEJORADO
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
      help: `¡Claro! Te ayudo con:\n\n📋 **Información:** Comercios, servicios, precios\n🐾 **Gestión:** Tus mascotas y citas\n🏢 **Comercios:** Búsqueda y detalles\n🚑 **Emergencias:** Contactos urgentes\n\n¿Qué necesitas específicamente?`,
      about: `🤖 **Soy PetBot**, el asistente virtual de PetServices.\n\nMi propósito es ayudarte a:\n• Encontrar los mejores servicios para tus mascotas\n• Gestionar tus citas y mascotas\n• Conectar con comercios de confianza\n• Resolver dudas sobre el sistema\n\n¿En qué puedo asistirte?`
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
      "list_businesses", 
      "list_services", 
      "get_user_appointments", 
      "get_user_pets", 
      "provider_today_appointments", 
      "admin_list_businesses",
      "search_veterinary",
      "search_grooming", 
      "search_care"
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

    // Intents que usan IA (búsquedas complejas, preguntas generales)
    if (["book_appointment", "prices", "emergency", "fallback", "provider_business"].includes(intent)) {
      
      try {
        const systemPrompt = `Eres PetBot, asistente virtual de PetServices.

Usuario: ${name} (${role})
Consulta: "${text}"

Contexto: Sistema de gestión para servicios de mascotas. Comercios: veterinarias, peluquerías, guarderías, entrenadores.

Instrucciones:
1. Responde en español, tono amigable pero profesional
2. Máximo 3 párrafos
3. Usa emojis relevantes 🐾🏥✂️
4. Si no sabes algo, sugiere alternativas
5. Evita información inventada

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
        console.error("❌ Error IA:", aiError.message);
        
        return res.json({
          success: true,
          reply: getFallbackResponse(intent, role),
          type: "text",
          intent,
          responseTime: Date.now() - startTime
        });
      }
    }

    // Fallback final
    const fallbackReply = `🤔 No estoy seguro de entender completamente.\n\n**Puedo ayudarte con:**\n• 🔍 Búsqueda de comercios y servicios\n• 📅 Gestión de citas y mascotas\n• 💰 Información de precios\n• 🚑 Contactos de emergencia\n• 📋 Tutoriales y guías\n\n¿Podrías reformular tu pregunta o elegir una de estas opciones?`;
    
    return res.json({
      success: true,
      reply: fallbackReply,
      type: "text",
      intent: "fallback",
      responseTime: Date.now() - startTime
    });

  } catch (error) {
    console.error("❌ Error crítico en chat:", error);
    
    const errorReply = `😔 **Lo siento, ocurrió un error inesperado.**\n\n**Por favor:**\n1. Intenta nuevamente en unos minutos\n2. Verifica tu conexión a internet\n3. Si el problema persiste, contacta a soporte`;
    
    return res.json({
      success: false,
      reply: errorReply,
      type: "error",
      responseTime: Date.now() - startTime
    });
  }
});

// ============================================
// 🔍 ENDPOINTS DE DIAGNÓSTICO
// ============================================

// Health check mejorado
router.get("/health", protect, (req, res) => {
  res.json({
    status: "healthy",
    service: "PetBot Chat API",
    version: "2.0.0",
    environment: process.env.NODE_ENV || "development",
    ai: {
      provider: GEMINI_API_KEY ? "Google Gemini" : "Fallback Mode",
      model: GEMINI_MODEL,
      configured: !!GEMINI_API_KEY,
      api_version: "v1beta"
    },
    features: ["Comercios", "Servicios", "Mascotas", "Citas", "IA"],
    user: {
      role: req.user.role,
      name: req.user.name
    },
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Diagnóstico completo del sistema
router.get("/diagnostic", protect, async (req, res) => {
  try {
    const stats = {
      gemini: {
        configured: !!GEMINI_API_KEY,
        key_length: GEMINI_API_KEY ? GEMINI_API_KEY.length : 0,
        model: GEMINI_MODEL,
        api_url: GEMINI_API_URL ? GEMINI_API_URL.replace(GEMINI_API_KEY, '***') : null
      },
      database: {
        users: await User.countDocuments({}),
        pets: await Pet.countDocuments({}),
        businesses: await Business.countDocuments({}),
        appointments: await Appointment.countDocuments({})
      },
      platform: {
        active_businesses: await Business.countDocuments({ 
          status: 'active', 
          approved: true,
          isDeleted: { $ne: true }
        }),
        pending_businesses: await Business.countDocuments({ 
          status: 'pending',
          isDeleted: { $ne: true }
        })
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
    console.error("Error en diagnóstico:", error);
    res.json({
      success: false,
      error: error.message
    });
  }
});

// Test endpoint para verificar conexión con Gemini
router.post("/test-gemini", protect, async (req, res) => {
  try {
    const { testMessage = "Hola, responde solo con '✅ Conexión exitosa'" } = req.body;
    
    if (!GEMINI_API_KEY) {
      return res.json({
        success: false,
        error: "API Key de Gemini no configurada",
        suggestion: "Configura GEMINI_API_KEY en las variables de entorno"
      });
    }
    
    console.log("🧪 Test de Gemini iniciado...");
    
    const prompt = `Eres PetBot. Usuario prueba: "${testMessage}"\n\nResponde solo con "✅ Conexión exitosa con Gemini. Modelo: ${GEMINI_MODEL}"`;
    
    const reply = await callGeminiAPI(prompt, "client");
    
    res.json({
      success: true,
      reply,
      model: GEMINI_MODEL,
      test: true,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("Error en test Gemini:", error);
    res.json({
      success: false,
      reply: `❌ Error en test: ${error.message}`,
      model: GEMINI_MODEL,
      test: true
    });
  }
});

// Endpoint simple para verificar modelos disponibles
router.get("/api-status", protect, (req, res) => {
  const apiStatus = {
    gemini: {
      configured: !!GEMINI_API_KEY,
      model: GEMINI_MODEL,
      status: GEMINI_API_KEY ? "Configurado" : "No configurado",
      api_url: "https://generativelanguage.googleapis.com/v1beta/"
    },
    known_models: [
      "gemini-1.5-flash",
      "gemini-1.5-pro", 
      "gemini-pro",
      "gemini-1.0-pro"
    ],
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString()
  };
  
  res.json({
    success: true,
    data: apiStatus
  });
});

// Endpoint público para status (sin auth)
router.get("/status", (req, res) => {
  res.json({
    status: "online",
    service: "PetBot Chat API",
    version: "2.0.0",
    time: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development"
  });
});

export default router;