// routes/chat.js
import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import User from "../models/User.js";
import Pet from "../models/Pet.js";
import Service from "../models/Service.js";
import Appointment from "../models/Appointment.js";

const router = express.Router();

// -----------------------------------------
// 🔥 CONFIGURACIÓN GEMINI
// -----------------------------------------
const GEMINI_API_KEY = "AIzaSyCnIqF1IP6Loh8YqBDJq-I08ulrec6_OPY";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

console.log("🔑 Inicializando ChatBot con Google Gemini...");

// -----------------------------------------
// SYSTEM PROMPT MEJORADO POR ROL
// -----------------------------------------
function getSystemPrompt(role) {
  const basePrompt = `Eres PetBot, un asistente virtual especializado en servicios de mascotas.

CONTEXTO DE LA APLICACIÓN:
- Plataforma: PetServices - aplicación web de servicios para mascotas
- Servicios: veterinaria, peluquería, paseos, guardería, entrenamiento, spa, vacunación

INSTRUCCIONES GENERALES:
1. Responde en español de Venezuela, de manera amable y cercana
2. Usa emojis relevantes para hacer la conversación más amigable
3. Sé conciso pero útil - máximo 150 palabras por respuesta
4. Si tienes datos específicos del usuario, úsalos para personalizar tu respuesta
5. Si no tienes información, sé honesto y ofrece alternativas
6. Mantén un tono profesional pero accesible
7. Fomenta la interacción preguntando si necesita más ayuda

NO INVENTES información. Si no sabes algo, di "No tengo esa información específica" y ofrece ayudar con otras cosas.`;

  const roleSpecificPrompts = {
    client: `
FUNCIONALIDADES PARA CLIENTES:
- Ver y gestionar mascotas registradas
- Consultar citas agendadas
- Ver servicios disponibles
- Agendar nuevas citas
- Información de precios y emergencias

El cliente puede preguntar sobre:
• "Mis mascotas" - ver sus mascotas registradas
• "Mis citas" - consultar citas agendadas  
• "Servicios disponibles" - ver catálogo de servicios
• "Agendar cita" - proceso para reservar
• "Precios" - información de costos
• "Emergencias" - protocolos de urgencia`,

    provider: `
FUNCIONALIDADES PARA PROVEEDORES:
- Gestionar agenda y citas del día
- Ver citas pendientes y confirmadas
- Consultar historial de servicios
- Gestionar servicios ofrecidos
- Ver estadísticas de negocio

El proveedor puede preguntar sobre:
• "Citas hoy" - agenda del día actual
• "Mis servicios" - servicios que ofrece
• "Citas pendientes" - citas por confirmar
• "Estadísticas" - métricas de negocio
• "Ingresos" - información financiera`,

    admin: `
FUNCIONALIDADES PARA ADMINISTRADORES:
- Gestionar usuarios del sistema
- Aprobar/rechazar proveedores
- Ver todas las citas del sistema
- Gestionar servicios globalmente
- Reportes y estadísticas generales
- Monitoreo del sistema

El administrador puede preguntar sobre:
• "Proveedores pendientes" - solicitudes por aprobar
• "Usuarios registrados" - lista de todos los usuarios
• "Todas las citas" - citas del sistema completo
• "Reportes" - estadísticas generales
• "Servicios del sistema" - gestión global de servicios`
  };

  return basePrompt + (roleSpecificPrompts[role] || roleSpecificPrompts.client);
}

// -----------------------------------------
// Helper: Gemini API call
// -----------------------------------------
async function askPetBot(userMessage, context = "", role = "client") {
  if (!GEMINI_API_KEY) {
    return "🔐 **Configuración requerida**: API Key de Gemini no configurada.";
  }

  if (!userMessage || typeof userMessage !== 'string') {
    return "Por favor, envía un mensaje válido.";
  }

  try {
    const systemPrompt = getSystemPrompt(role);
    const fullPrompt = context ? 
      `${systemPrompt}\n\n--- CONTEXTO ACTUAL ---\n${context}\n\n--- PREGUNTA DEL USUARIO ---\n${userMessage}` : 
      `${systemPrompt}\n\n--- PREGUNTA DEL USUARIO ---\n${userMessage}`;

    console.log(`🔗 Enviando solicitud a Gemini API para rol: ${role}`);
    
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: fullPrompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return `❌ **Error de API** (${response.status}): Por favor, intenta más tarde.`;
    }

    const data = await response.json();

    // Validación de respuesta
    if (!data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      return getFallbackResponse("general", role);
    }

    const responseText = data.candidates[0].content.parts[0].text.trim();
    return responseText || getFallbackResponse("general", role);

  } catch (error) {
    console.error("❌ Error en askPetBot:", error.message);
    return getFallbackResponse("general", role);
  }
}

// -----------------------------------------
// Helper: Respuestas de fallback POR ROL
// -----------------------------------------
function getFallbackResponse(intent = "general", role = "client") {
  const responses = {
    client: {
      general: `¡Hola! Soy PetBot, tu asistente virtual para servicios de mascotas. 🐾

Como **cliente**, puedo ayudarte con:
• 📅 Tus citas agendadas
• 🐕 Tus mascotas registradas  
• 🛎️ Servicios disponibles
• 💰 Información de precios
• 🏥 Emergencias veterinarias

¿En qué puedo asistirte hoy?`,

      list_services: `🛎️ **Servicios Disponibles para Clientes**

Tenemos una amplia variedad de servicios para tus mascotas:

**🏥 Servicios Médicos**
• Consulta veterinaria • Vacunación • Urgencias 24/7

**✂️ Estética y Cuidado**  
• Baño y peluquería • Corte de uñas • Spa mascota

**🎯 Entrenamiento**
• Adiestramiento básico • Corrección de conducta

**🏠 Cuidado Diario**
• Guardería • Paseos • Visitas a domicilio

¿Te interesa agendar alguno de estos servicios? 😊`
    },

    provider: {
      general: `¡Hola! Soy PetBot, tu asistente para la gestión de servicios. 💼

Como **proveedor**, puedo ayudarte con:
• 📊 Citas de hoy y agenda
• 🛎️ Tus servicios ofrecidos
• 📈 Estadísticas de negocio
• 👥 Gestión de clientes
• 💰 Información de ingresos

¿En qué área necesitas ayuda?`,

      list_services: `🛎️ **Tus Servicios como Proveedor**

Puedes gestionar los servicios que ofreces a través del panel de proveedor.

**Funcionalidades disponibles:**
• Agregar nuevos servicios
• Editar servicios existentes
• Gestionar disponibilidad
• Actualizar precios y descripciones
• Ver rendimiento de servicios

¿Necesitas ayuda con la gestión de algún servicio específico?`
    },

    admin: {
      general: `¡Hola! Soy PetBot, tu asistente administrativo. 👨‍💼

Como **administrador**, puedo ayudarte con:
• 👥 Gestión de usuarios y proveedores
• 📋 Aprobación de solicitudes
• 📊 Reportes del sistema
• 🛎️ Gestión global de servicios
• ⚙️ Monitoreo de la plataforma

¿Qué área del sistema necesitas gestionar?`,

      list_services: `🛎️ **Gestión Global de Servicios**

Como administrador, puedes gestionar todos los servicios del sistema:

**Funcionalidades disponibles:**
• Ver todos los servicios activos
• Aprobar/rechazar nuevos servicios
• Gestionar categorías
• Monitorear rendimiento
• Reportes de servicios más populares

¿Necesitas revisar algún aspecto específico de los servicios?`
    }
  };

  const roleResponses = responses[role] || responses.client;
  return roleResponses[intent] || roleResponses.general;
}

// -----------------------------------------
// Helper: Generar respuestas con datos reales POR ROL
// -----------------------------------------
async function generateResponseWithData(intent, user, userMessage = "") {
  const { name, role, _id: userId } = user;
  
  // Respuestas específicas por rol
  switch (role) {
    case "provider":
      return await generateProviderResponse(intent, user, userMessage);
    
    case "admin":
      return await generateAdminResponse(intent, user, userMessage);
    
    default: // client
      return await generateClientResponse(intent, user, userMessage);
  }
}

// -----------------------------------------
// Helper: Respuestas para CLIENTES
// -----------------------------------------
async function generateClientResponse(intent, user, userMessage) {
  const { name, _id: userId } = user;
  
  switch (intent) {
    case "list_services": {
      const services = await Service.find({ status: "approved" })
        .sort({ name: 1 })
        .limit(15)
        .lean();

      if (services.length === 0) {
        return `🛎️ Hola ${name}, actualmente no hay servicios disponibles.\n\nPor favor, intenta más tarde. 📞`;
      }

      let servicesText = `🛎️ **SERVICIOS DISPONIBLES** (${services.length})\n\n`;
      
      services.forEach((service, index) => {
        servicesText += `${index + 1}. **${service.name}**\n`;
        servicesText += `   📝 ${service.description || 'Servicio profesional'}\n`;
        servicesText += `   💰 ${service.price || 'Consultar precio'}\n`;
        servicesText += `   🏢 ${service.providerName || 'Proveedor certificado'}\n\n`;
      });

      servicesText += `¿Te interesa agendar alguno de estos servicios ${name}? 😊`;
      return servicesText;
    }

    case "get_user_appointments": {
      const appointments = await Appointment.find({ userId })
        .populate("petId")
        .populate("serviceId")
        .populate("providerId")
        .sort({ date: 1, time: 1 })
        .limit(8)
        .lean();

      if (appointments.length === 0) {
        return `📅 Hola ${name}, no tienes citas agendadas.\n\n¿Te gustaría agendar una nueva cita? 🐕`;
      }

      let appointmentsText = `📅 **TUS PRÓXIMAS CITAS** (${appointments.length})\n\n`;
      
      appointments.forEach((appt, index) => {
        const date = appt.date ? new Date(appt.date).toLocaleDateString('es-VE') : "Fecha por definir";
        
        appointmentsText += `${index + 1}. **${appt.serviceId?.name || 'Servicio'}**\n`;
        appointmentsText += `   🐾 Mascota: ${appt.petId?.name || 'No especificada'}\n`;
        appointmentsText += `   📅 ${date} 🕒 ${appt.time || 'Por confirmar'}\n`;
        appointmentsText += `   👨‍💼 ${appt.providerId?.businessName || appt.providerId?.name || 'Proveedor'}\n`;
        appointmentsText += `   📊 ${getStatusEmoji(appt.status)} ${appt.status}\n\n`;
      });

      return appointmentsText;
    }

    case "get_user_pets": {
      const pets = await Pet.find({ owner: userId })
        .sort({ name: 1 })
        .lean();

      if (pets.length === 0) {
        return `🐾 Hola ${name}, no tienes mascotas registradas.\n\nRegistra tu primera mascota para comenzar! 📝`;
      }

      let petsText = `🐾 **TUS MASCOTAS** (${pets.length})\n\n`;
      
      pets.forEach((pet, index) => {
        petsText += `${index + 1}. **${pet.name}**\n`;
        petsText += `   🐕 ${pet.type || 'Tipo no especificado'}\n`;
        if (pet.breed) petsText += `   🧬 ${pet.breed}\n`;
        if (pet.age) petsText += `   📅 ${pet.age} años\n`;
        petsText += `\n`;
      });

      petsText += "¿Necesitas gestionar alguna de tus mascotas? 😊";
      return petsText;
    }

    default:
      return getFallbackResponse(intent, "client");
  }
}

// -----------------------------------------
// Helper: Respuestas para PROVEEDORES
// -----------------------------------------
async function generateProviderResponse(intent, user, userMessage) {
  const { name, _id: userId } = user;
  
  switch (intent) {
    case "provider_today_appointments": {
      const today = new Date().toISOString().split('T')[0];
      const appointments = await Appointment.find({
        providerId: userId,
        date: today
      })
        .populate("userId", "name")
        .populate("petId")
        .populate("serviceId")
        .sort({ time: 1 })
        .lean();

      if (appointments.length === 0) {
        return `📊 Hola ${name}, no tienes citas agendadas para hoy (${today}).\n\n¡Es un buen día para promocionar tus servicios! 🎯`;
      }

      let appointmentsText = `📊 **TUS CITAS DE HOY** (${appointments.length})\n\n`;
      
      appointments.forEach((appt, index) => {
        appointmentsText += `${index + 1}. **${appt.serviceId?.name || 'Servicio'}**\n`;
        appointmentsText += `   🐾 ${appt.petId?.name || 'Mascota'}\n`;
        appointmentsText += `   🕒 ${appt.time || 'Hora por confirmar'}\n`;
        appointmentsText += `   👤 ${appt.userId?.name || 'Cliente'}\n`;
        appointmentsText += `   📊 ${getStatusEmoji(appt.status)} ${appt.status}\n\n`;
      });

      appointmentsText += `¡Que tengas un productivo día ${name}! 💼`;
      return appointmentsText;
    }

    case "list_services": {
      const services = await Service.find({ providerId: userId })
        .sort({ name: 1 })
        .lean();

      if (services.length === 0) {
        return `🛎️ Hola ${name}, no tienes servicios registrados.\n\nPuedes agregar servicios desde tu panel de proveedor. 📝`;
      }

      let servicesText = `🛎️ **TUS SERVICIOS** (${services.length})\n\n`;
      
      services.forEach((service, index) => {
        servicesText += `${index + 1}. **${service.name}**\n`;
        servicesText += `   📝 ${service.description || 'Sin descripción'}\n`;
        servicesText += `   💰 ${service.price || 'Consultar'}\n`;
        servicesText += `   📊 ${getStatusEmoji(service.status)} ${service.status}\n\n`;
      });

      servicesText += `¿Necesitas gestionar alguno de tus servicios? 🔧`;
      return servicesText;
    }

    case "provider_my_services": {
      const services = await Service.find({ providerId: userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

      const activeServices = services.filter(s => s.status === 'approved').length;
      const pendingServices = services.filter(s => s.status === 'pending').length;

      let servicesText = `📈 **ESTADÍSTICAS DE TUS SERVICIOS**\n\n`;
      servicesText += `• 🟢 Servicios activos: ${activeServices}\n`;
      servicesText += `• 🟡 Pendientes: ${pendingServices}\n`;
      servicesText += `• 📊 Total: ${services.length}\n\n`;

      if (services.length > 0) {
        servicesText += `**Servicios recientes:**\n`;
        services.slice(0, 3).forEach((service, index) => {
          servicesText += `${index + 1}. ${service.name} - ${service.status}\n`;
        });
      }

      return servicesText;
    }

    default:
      return getFallbackResponse(intent, "provider");
  }
}

// -----------------------------------------
// Helper: Respuestas para ADMINISTRADORES
// -----------------------------------------
async function generateAdminResponse(intent, user, userMessage) {
  const { name } = user;
  
  switch (intent) {
    case "admin_list_providers": {
      const pendingProviders = await User.find({
        role: "provider",
        status: "pending"
      })
        .select('name email businessName createdAt')
        .sort({ createdAt: -1 })
        .lean();

      const approvedProviders = await User.find({
        role: "provider", 
        status: "approved"
      }).countDocuments();

      let providersText = `🏢 **GESTIÓN DE PROVEEDORES**\n\n`;
      providersText += `• ⏳ Pendientes: ${pendingProviders.length}\n`;
      providersText += `• ✅ Aprobados: ${approvedProviders}\n\n`;

      if (pendingProviders.length > 0) {
        providersText += `**Proveedores pendientes:**\n`;
        pendingProviders.slice(0, 5).forEach((provider, index) => {
          providersText += `${index + 1}. ${provider.name} - ${provider.email}\n`;
        });
        providersText += `\nPuedes revisarlos en el panel de administración. 👨‍💼`;
      } else {
        providersText += `¡No hay proveedores pendientes de revisión! 🎉`;
      }

      return providersText;
    }

    case "admin_list_users": {
      const totalUsers = await User.countDocuments();
      const clients = await User.countDocuments({ role: "client" });
      const providers = await User.countDocuments({ role: "provider" });
      const admins = await User.countDocuments({ role: "admin" });

      let usersText = `👥 **ESTADÍSTICAS DE USUARIOS**\n\n`;
      usersText += `• 👤 Clientes: ${clients}\n`;
      usersText += `• 🏢 Proveedores: ${providers}\n`;
      usersText += `• 👨‍💼 Administradores: ${admins}\n`;
      usersText += `• 📊 Total: ${totalUsers}\n\n`;
      usersText += `Puedes gestionar usuarios desde el panel de administración. ⚙️`;

      return usersText;
    }

    case "admin_list_appointments": {
      const totalAppointments = await Appointment.countDocuments();
      const today = new Date().toISOString().split('T')[0];
      const todayAppointments = await Appointment.countDocuments({ date: today });
      const pendingAppointments = await Appointment.countDocuments({ status: "pending" });

      let appointmentsText = `📅 **REPORTE DE CITAS**\n\n`;
      appointmentsText += `• 📊 Total histórico: ${totalAppointments}\n`;
      appointmentsText += `• 📅 Hoy: ${todayAppointments}\n`;
      appointmentsText += `• ⏳ Pendientes: ${pendingAppointments}\n\n`;
      appointmentsText += `Puedes ver el detalle completo en el panel de administración. 📈`;

      return appointmentsText;
    }

    case "list_services": {
      const totalServices = await Service.countDocuments();
      const approvedServices = await Service.countDocuments({ status: "approved" });
      const pendingServices = await Service.countDocuments({ status: "pending" });

      let servicesText = `🛎️ **REPORTE DE SERVICIOS**\n\n`;
      servicesText += `• 📊 Total: ${totalServices}\n`;
      servicesText += `• ✅ Aprobados: ${approvedServices}\n`;
      servicesText += `• ⏳ Pendientes: ${pendingServices}\n\n`;
      servicesText += `Puedes gestionar servicios desde el panel de administración. 🔧`;

      return servicesText;
    }

    default:
      return getFallbackResponse(intent, "admin");
  }
}

// -----------------------------------------
// Helper: Emojis para estados
// -----------------------------------------
function getStatusEmoji(status) {
  const emojis = {
    'pending': '⏳',
    'confirmed': '✅',
    'completed': '🏁',
    'cancelled': '❌',
    'approved': '🟢',
    'rejected': '🔴'
  };
  return emojis[status] || '📝';
}

// -----------------------------------------
// Intent detection MEJORADO POR ROL
// -----------------------------------------
function detectIntent(text, role = "client") {
  if (!text || typeof text !== 'string') return "fallback";
  
  const lowerText = text.toLowerCase().trim();

  // Intents comunes a todos los roles
  if (/(hola|buenos\s+días|buenas\s+tardes|buenas\s+noches|saludos|hey)/.test(lowerText)) 
    return "greeting";

  if (/(gracias|thanks|merci|agradecido)/.test(lowerText)) 
    return "thanks";

  if (/(adiós|chao|hasta\s+luego|nos\s+vemos|bye)/.test(lowerText)) 
    return "goodbye";

  if (/(ayuda|help|soporte|qué\s+puedes\s+hacer)/.test(lowerText)) 
    return "help";

  if (/(quién\s+eres|qué\s+eres|tu\s+nombre|te\s+llamas)/.test(lowerText)) 
    return "about";

  // Intents específicos por rol
  if (role === "client") {
    if (/(mis\s+citas|mis\s+reservas|citas\s+agendadas|próximas\s+citas)/.test(lowerText)) 
      return "get_user_appointments";
    
    if (/(mis\s+mascotas|mascotas\s+registradas|ver\s+mascotas)/.test(lowerText)) 
      return "get_user_pets";
    
    if (/(servicios\s+disponibles|qué\s+servicios|tipos\s+de\s+servicio)/.test(lowerText)) 
      return "list_services";

    if (/(agendar\s+cita|nueva\s+cita|reservar\s+servicio)/.test(lowerText)) 
      return "book_appointment";

  } else if (role === "provider") {
    if (/(citas\s+hoy|agenda\s+de\s+hoy|hoy\s+tengo\s+citas)/.test(lowerText)) 
      return "provider_today_appointments";
    
    if (/(mis\s+servicios|servicios\s+que\s+ofrezco|gestionar\s+servicios)/.test(lowerText)) 
      return "list_services";
    
    if (/(estadísticas|métricas|rendimiento|ingresos)/.test(lowerText)) 
      return "provider_my_services";

  } else if (role === "admin") {
    if (/(proveedores\s+pendientes|proveedores\s+en\s+espera|aprobar\s+proveedores)/.test(lowerText)) 
      return "admin_list_providers";
    
    if (/(usuarios\s+registrados|listar\s+usuarios|todos\s+los\s+usuarios)/.test(lowerText)) 
      return "admin_list_users";
    
    if (/(todas\s+las\s+citas|listar\s+citas|reporte\s+citas)/.test(lowerText)) 
      return "admin_list_appointments";
    
    if (/(servicios\s+del\s+sistema|gestionar\s+servicios|reporte\s+servicios)/.test(lowerText)) 
      return "list_services";
  }

  // Intents generales
  if (/(precios|costos|tarifas|cuánto\s+cuesta)/.test(lowerText)) 
    return "prices";

  if (/(emergencia|urgencia|veterinario\s+emergencia)/.test(lowerText)) 
    return "emergency";

  return "fallback";
}

// -----------------------------------------
// MAIN ENDPOINT - COMPLETAMENTE POR ROLES
// -----------------------------------------
router.post("/", protect, async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { message } = req.body;
    const { _id: userId, role, name, email } = req.user;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ 
        error: "El mensaje no puede estar vacío",
        type: "error"
      });
    }

    const text = message.trim();
    const intent = detectIntent(text, role);

    console.log(`📱 Chat - Usuario: ${name}, Rol: ${role}, Intent: ${intent}`);

    // -----------------------------
    // RESPUESTAS RÁPIDAS POR ROL
    // -----------------------------
    switch (intent) {
      case "greeting":
        const roleGreetings = {
          client: `¡Hola ${name}! 👋 Soy PetBot, tu asistente para servicios de mascotas. ¿En qué puedo ayudarte hoy? 🐾`,
          provider: `¡Hola ${name}! 💼 Soy PetBot, tu asistente para la gestión de servicios. ¿Cómo puedo ayudarte con tu negocio? 📊`,
          admin: `¡Hola ${name}! 👨‍💼 Soy PetBot, tu asistente administrativo. ¿En qué área del sistema necesitas ayuda? ⚙️`
        };
        return res.json({ 
          reply: roleGreetings[role] || roleGreetings.client, 
          type: "text",
          hasData: false,
          intent: intent
        });

      case "help":
        const roleHelp = {
          client: `¡Claro que sí ${name}! 😊 **Como cliente, te ayudo con:**

🐾 **Tus mascotas** - información y gestión
📅 **Tus citas** - agendadas y próximas  
🛎️ **Servicios** - disponibles y precios
🏥 **Emergencias** - protocolos y contactos

¿En qué específicamente necesitas ayuda?`,

          provider: `¡Por supuesto ${name}! 🔧 **Como proveedor, te ayudo con:**

📊 **Tu agenda** - citas de hoy y futuras
🛎️ **Tus servicios** - gestión y estadísticas
📈 **Métricas** - rendimiento de negocio
👥 **Clientes** - información de reservas

¿Qué área de tu negocio necesitas gestionar?`,

          admin: `¡Desde luego ${name}! ⚙️ **Como administrador, te ayudo con:**

👥 **Usuarios** - gestión del sistema
🏢 **Proveedores** - aprobación y control
📊 **Reportes** - estadísticas globales
🛎️ **Servicios** - gestión completa
📅 **Citas** - monitoreo del sistema

¿Qué funcionalidad administrativa necesitas?`
        };
        return res.json({ 
          reply: roleHelp[role] || roleHelp.client, 
          type: "text",
          hasData: false,
          intent: intent
        });

      case "thanks":
        return res.json({ 
          reply: `¡De nada, ${name}! 😊 ¿Hay algo más en lo que pueda ayudarte?`, 
          type: "text",
          hasData: false,
          intent: intent
        });

      case "goodbye":
        const roleGoodbyes = {
          client: `¡Hasta luego, ${name}! 👋 ¡Que tengas un excelente día con tus mascotas! 🐾`,
          provider: `¡Hasta luego, ${name}! 💼 ¡Que tengas un productivo día! 📈`,
          admin: `¡Hasta luego, ${name}! 👨‍💼 ¡Que tengas un excelente día administrativo! ⚙️`
        };
        return res.json({ 
          reply: roleGoodbyes[role] || roleGoodbyes.client, 
          type: "text",
          hasData: false,
          intent: intent
        });
    }

    // -----------------------------
    // INTENTS CON DATOS REALES POR ROL
    // -----------------------------
    const dataIntents = {
      client: ["list_services", "get_user_appointments", "get_user_pets"],
      provider: ["list_services", "provider_today_appointments", "provider_my_services"],
      admin: ["list_services", "admin_list_providers", "admin_list_users", "admin_list_appointments"]
    };

    if (dataIntents[role]?.includes(intent)) {
      console.log(`📊 Generando respuesta con datos reales para ${role}: ${intent}`);
      
      const reply = await generateResponseWithData(intent, req.user, text);
      
      return res.json({ 
        reply, 
        type: "text",
        hasData: true,
        intent: intent
      });
    }

    // -----------------------------
    // INTENTS QUE USAN IA
    // -----------------------------
    const aiIntents = ["book_appointment", "prices", "emergency", "about"];
    if (aiIntents.includes(intent)) {
      console.log(`🤖 Usando IA para: ${intent}`);
      
      const reply = await askPetBot(text, "", role);
      
      return res.json({ 
        reply, 
        type: "text",
        hasData: false,
        intent: intent
      });
    }

    // -----------------------------
    // FALLBACK - CONSULTA GENERAL CON IA
    // -----------------------------
    console.log(`🤖 Usando IA para respuesta general`);
    const fallbackReply = await askPetBot(text, `Usuario: ${name} (${role})`, role);
    
    return res.json({ 
      reply: fallbackReply, 
      type: "text",
      hasData: false,
      intent: "fallback"
    });

  } catch (error) {
    console.error("❌ Error en el endpoint:", error.message);

    const errorReply = `😔 **Lo siento, ${req.user?.name || 'usuario'}**

He encontrado un problema técnico al procesar tu solicitud.

🔧 **Qué puedes hacer:**
• Intentar nuevamente en unos momentos
• Contactar al soporte técnico si el problema persiste

¡Estaré aquí cuando me necesites!`;

    return res.status(500).json({ 
      reply: errorReply,
      type: "error"
    });
  }
});

// -----------------------------------------
// ENDPOINT DE ESTADO
// -----------------------------------------
router.get("/status", protect, (req, res) => {
  const status = {
    status: "operational",
    aiProvider: "Google Gemini 2.5 Flash",
    user: {
      name: req.user.name,
      role: req.user.role,
      id: req.user._id
    },
    timestamp: new Date().toISOString()
  };

  console.log("📊 Estado del chatbot consultado por:", req.user.name);
  res.json(status);
});

export default router;