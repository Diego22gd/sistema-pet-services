import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import User from "../models/User.js";
import Pet from "../models/Pet.js";
import Business from "../models/Business.js";
import Appointment from "../models/Appointment.js";

const router = express.Router();

// ============================================
// 🔧 CONFIGURACIÓN GEMINI
// ============================================

const GEMINI_API_KEY = 
  process.env.GEMINI_API_KEY || 
  process.env.GOOGLE_AI_KEY || 
  process.env.GOOGLE_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn("⚠️  ADVERTENCIA: No se encontró API Key de Gemini. El chatbot usará respuestas predefinidas.");
} else {
  console.log("✅ API Key de Gemini configurada");
}

// Modelo de Gemini (gemini-pro es gratuito)
const GEMINI_MODEL = "gemini-pro";
console.log("🤖 Modelo configurado:", GEMINI_MODEL);

// ============================================
// 🚀 FUNCIÓN PARA LLAMAR A GEMINI
// ============================================

async function callGeminiAPI(prompt, userRole = "client") {
  if (!GEMINI_API_KEY) {
    console.log("📝 Usando respuesta predefinida (sin API Key)");
    return getFallbackResponse("general", userRole);
  }

  try {
    console.log(`🤖 Llamando a Gemini...`);
    
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
    
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
          maxOutputTokens: 1000,
          topP: 0.8,
          topK: 40,
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
      signal: AbortSignal.timeout(15000)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Error Gemini (${response.status}):`, errorText.substring(0, 200));
      throw new Error(`API error ${response.status}`);
    }

    const data = await response.json();
    
    if (!data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.warn("⚠️  Respuesta de Gemini vacía o mal formada");
      return getFallbackResponse("general", userRole);
    }
    
    const reply = data.candidates[0].content.parts[0].text.trim();
    console.log(`✅ Respuesta recibida (${reply.length} caracteres)`);
    return reply;
    
  } catch (error) {
    console.error("❌ Error en callGeminiAPI:", error.message);
    return getFallbackResponse("general", userRole);
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

async function getBusinessesList(user) {
  try {
    const businesses = await Business.find({
      status: "active",
      approved: true,
      isDeleted: { $ne: true }
    })
    .select('name categories description averageServicePrice address rating')
    .limit(3)
    .sort({ rating: -1 })
    .lean();

    if (businesses.length === 0) {
      return "Actualmente no hay comercios disponibles. ¿Te gustaría ser el primero en registrar tu comercio?";
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
      
      if (business.address) {
        const shortAddr = business.address.substring(0, 40);
        response += `   🏠 ${shortAddr}\n`;
      }
      
      if (business.rating > 0) {
        response += `   ⭐ Calificación: ${business.rating.toFixed(1)}/5\n`;
      }
      
      response += `\n`;
    });

    return response;
    
  } catch (error) {
    console.error("Error obteniendo comercios:", error);
    return "No puedo cargar la lista de comercios en este momento. Intenta más tarde.";
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

    return response;
  } catch (error) {
    console.error("Error obteniendo mascotas:", error);
    return "Accede a 'Mis Mascotas' en tu perfil para gestionar tu información.";
  }
}

// ============================================
// 🎯 DETECCIÓN DE INTENCIONES
// ============================================

function detectIntent(text, role = "client") {
  if (!text || typeof text !== 'string') return "general";
  
  const lowerText = text.toLowerCase().trim();

  // Intents básicos
  if (/(hola|buenos|buenas|saludos|hello|hi)/i.test(lowerText)) return "greeting";
  if (/(gracias|thank|thanks|agradezco)/i.test(lowerText)) return "thanks";
  if (/(adiós|chao|bye|nos vemos|hasta luego)/i.test(lowerText)) return "goodbye";
  if (/(ayuda|help|soporte|asistencia)/i.test(lowerText)) return "help";
  if (/(quién eres|qué eres|tu nombre|presentate)/i.test(lowerText)) return "about";

  // Intents específicos
  if (/(comercios|negocios|tiendas|veterinarias|peluquer[ií]as|guarder[ií]as)/i.test(lowerText)) 
    return "list_businesses";
  
  if (/(servicios|qué ofrecen|qué hay|opciones).*(mascota|perro|gato)/i.test(lowerText) || 
      /(tipos de|clases de).*servicio/i.test(lowerText)) 
    return "list_services";
  
  if (/(mis mascotas|mascotas registradas|mis perros|mis gatos)/i.test(lowerText)) 
    return "get_user_pets";
  
  if (/(precio|costos|tarifas|cuánto cuesta|valor)/i.test(lowerText)) 
    return "prices";
  
  if (/(agendar|reservar|solicitar).*(cita|consulta|servicio)/i.test(lowerText)) 
    return "book_appointment";
  
  if (/(emergencia|urgencia|accidente|enfermo|grave)/i.test(lowerText)) 
    return "emergency";

  // Intents para proveedores
  if (role === "provider") {
    if (/(citas hoy|agenda hoy|hoy tengo|hoy.*citas)/i.test(lowerText)) 
      return "provider_today_appointments";
  }
  
  // Intents para administradores
  if (role === "admin") {
    if (/(comercios|negocios|proveedores).*(pendientes|aprobar|revisar)/i.test(lowerText)) 
      return "admin_list_businesses";
  }

  return "general";
}

// ============================================
// 🚀 ENDPOINT PRINCIPAL DEL CHAT (POST)
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
    console.log(`💬 [${role}] ${name}: "${text.substring(0, 50)}..."`);

    // Detectar intención
    const intent = detectIntent(text, role);

    // Respuestas rápidas predefinidas
    const quickResponses = {
      greeting: `¡Hola ${name}! 👋 Soy PetBot, tu asistente virtual de PetServices.\n\n¿En qué puedo ayudarte hoy?`,
      thanks: `¡De nada ${name}! 😊 Es un placer ayudarte.\n\n¿Hay algo más en lo que pueda asistirte?`,
      goodbye: `¡Hasta luego ${name}! Que tengas un excelente día. 🐾\n\nRecuerda que estoy aquí para ayudarte cuando lo necesites.`,
      help: `¡Claro ${name}! Te ayudo con:\n\n📋 **Información:** Comercios, servicios, precios\n🐾 **Gestión:** Tus mascotas y citas\n🏢 **Comercios:** Búsqueda y detalles\n🚑 **Emergencias:** Contactos urgentes\n\n¿Qué necesitas específicamente?`,
      about: `🤖 **Soy PetBot**, el asistente virtual de PetServices.\n\nMi propósito es ayudarte a:\n• Encontrar los mejores servicios para tus mascotas\n• Gestionar tus citas y mascotas\n• Conectar con comercios de confianza\n• Resolver dudas sobre el sistema\n\n¿En qué puedo asistirte?`
    };

    // Si es una respuesta rápida, devolverla inmediatamente
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
    if (intent === "list_businesses") {
      const reply = await getBusinessesList(req.user);
      return res.json({
        success: true,
        reply,
        type: "text",
        intent,
        hasData: true,
        responseTime: Date.now() - startTime
      });
    }

    if (intent === "get_user_pets") {
      const reply = await getUserPets(userId);
      return res.json({
        success: true,
        reply,
        type: "text",
        intent,
        hasData: true,
        responseTime: Date.now() - startTime
      });
    }

    // Si es un intent con respuesta predefinida
    const predefinedIntents = [
      "list_services", "prices", "book_appointment", "emergency",
      "provider_today_appointments", "admin_list_businesses"
    ];

    if (predefinedIntents.includes(intent)) {
      const reply = getFallbackResponse(intent, role);
      return res.json({
        success: true,
        reply,
        type: "text",
        intent,
        responseTime: Date.now() - startTime
      });
    }

    // Si no es ninguna de las anteriores, usar Gemini
    console.log(`🤖 Usando Gemini para: "${text.substring(0, 50)}..."`);
    
    const systemPrompt = `Eres PetBot, asistente virtual de PetServices.

INFORMACIÓN DEL USUARIO:
• Nombre: ${name}
• Rol: ${role}
• Consulta: "${text}"

CONTEXTO DE PETSERVICES:
PetServices es una plataforma que conecta dueños de mascotas con proveedores de servicios:
1. 🏥 Veterinarias - Consultas, vacunas, emergencias
2. ✂️ Peluquerías - Baño, corte, spa para mascotas
3. 🏠 Guarderías - Cuidado diario, paseos, hotel
4. 🎯 Entrenadores - Adiestramiento, socialización

INSTRUCCIONES:
1. Responde en español con tono amigable y profesional
2. Usa emojis relevantes (🐾🏥✂️🏠💰📅)
3. Si el usuario pregunta por algo fuera del contexto de mascotas, redirige amablemente
4. Máximo 2 párrafos
5. No inventes información que no tengas
6. Si preguntan por precios, di que varían según el servicio y recomienda contactar comercios

RESPONDE COMO PETBOT:`;

    const geminiReply = await callGeminiAPI(systemPrompt, role);
    
    return res.json({
      success: true,
      reply: geminiReply,
      type: "text",
      intent: "ai_response",
      responseTime: Date.now() - startTime,
      geminiUsed: true
    });

  } catch (error) {
    console.error("❌ Error en chat:", error);
    
    const errorReply = `😔 **Lo siento, ocurrió un error inesperado.**\n\n**Por favor:**\n• Intenta nuevamente en unos minutos\n• Si el problema persiste, contacta a soporte`;
    
    return res.json({
      success: false,
      reply: errorReply,
      type: "error",
      responseTime: Date.now() - startTime
    });
  }
});

// ============================================
// 📡 ENDPOINTS DE DIAGNÓSTICO (GET)
// ============================================

// Endpoint público para verificar que el servicio está activo
router.get("/status", (req, res) => {
  res.json({
    status: "online",
    service: "PetBot Chat API",
    version: "2.0.0",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    gemini: {
      configured: !!GEMINI_API_KEY,
      model: GEMINI_MODEL,
      status: GEMINI_API_KEY ? "✅ Configurado" : "⚠️ Usando respuestas predefinidas"
    },
    endpoints: {
      chat: "POST /api/chat - Enviar mensajes (requiere autenticación)",
      status: "GET /api/chat/status - Verificar estado del servicio",
      health: "GET /api/chat/health - Verificar salud (requiere autenticación)"
    }
  });
});

// Health check con autenticación
router.get("/health", protect, (req, res) => {
  res.json({
    status: "healthy",
    service: "PetBot Chat API",
    version: "2.0.0",
    timestamp: new Date().toISOString(),
    user: {
      id: req.user._id,
      role: req.user.role,
      name: req.user.name
    },
    gemini: {
      configured: !!GEMINI_API_KEY,
      model: GEMINI_MODEL,
      keyPresent: GEMINI_API_KEY ? "✅ Presente" : "❌ No configurada"
    }
  });
});

// Test endpoint para Gemini
router.post("/test-gemini", protect, async (req, res) => {
  try {
    if (!GEMINI_API_KEY) {
      return res.json({
        success: false,
        message: "API Key de Gemini no configurada",
        suggestion: "Configura GEMINI_API_KEY en las variables de entorno"
      });
    }
    
    const testPrompt = "Eres PetBot. Responde solo con '✅ Gemini funcionando correctamente'";
    
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
    
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: testPrompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 50,
        }
      }),
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
      throw new Error(`API error ${response.status}`);
    }

    const data = await response.json();
    const geminiResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sin respuesta";
    
    res.json({
      success: true,
      message: "✅ Test de Gemini completado",
      geminiResponse,
      model: GEMINI_MODEL,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("Error en test Gemini:", error);
    res.json({
      success: false,
      message: `❌ Error en Gemini: ${error.message}`,
      model: GEMINI_MODEL,
      timestamp: new Date().toISOString()
    });
  }
});

// ============================================
// 🚫 MANEJAR MÉTODOS INCORRECTOS
// ============================================

// Capturar GET a /api/chat y dar mensaje informativo
router.get("/", (req, res) => {
  res.status(405).json({
    success: false,
    error: "Método no permitido",
    message: "Esta ruta solo acepta solicitudes POST para enviar mensajes",
    path: "/api/chat",
    method: "GET",
    allowed_methods: ["POST"],
    correct_usage: "POST /api/chat con { message: 'tu mensaje' } y header Authorization: Bearer <token>",
    alternative_endpoints: {
      status: "GET /api/chat/status",
      health: "GET /api/chat/health (requiere autenticación)"
    },
    timestamp: new Date().toISOString()
  });
});

// Manejar otros métodos HTTP no soportados
router.all("/", (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({
      success: false,
      error: "Método no permitido",
      message: `Método ${req.method} no soportado para esta ruta`,
      path: "/api/chat",
      method: req.method,
      allowed_methods: ["POST"],
      timestamp: new Date().toISOString()
    });
  }
});

export default router;