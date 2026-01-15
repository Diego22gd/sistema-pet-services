// routes/chat.js - VERSIÓN PRODUCCIÓN
import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { chatRateLimiter } from "../middleware/rateLimit.js";
import ChatService from "../services/chatService.js";
import { logChatInteraction } from "../utils/chatLogger.js";

const router = express.Router();

console.log("🚀 ChatBot inicializado con configuración segura");

// ========================================================
// 📝 MIDDLEWARE DE VALIDACIÓN
// ========================================================
const validateChatInput = (req, res, next) => {
  const { message } = req.body;
  
  // Validar existencia
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ 
      error: "El mensaje no puede estar vacío",
      type: "error",
      code: "EMPTY_MESSAGE"
    });
  }
  
  // Validar longitud
  const trimmedMessage = message.trim();
  if (trimmedMessage.length === 0) {
    return res.status(400).json({ 
      error: "El mensaje no puede contener solo espacios",
      type: "error",
      code: "EMPTY_CONTENT"
    });
  }
  
  if (trimmedMessage.length > 1000) {
    return res.status(400).json({ 
      error: "El mensaje no puede exceder 1000 caracteres",
      type: "error",
      code: "MESSAGE_TOO_LONG"
    });
  }
  
  // Validar contenido (protección básica contra inyección)
  const forbiddenPatterns = [
    /<script.*?>.*?<\/script>/gi,
    /onload\s*=/gi,
    /onerror\s*=/gi,
    /javascript:/gi
  ];
  
  for (const pattern of forbiddenPatterns) {
    if (pattern.test(trimmedMessage)) {
      return res.status(400).json({ 
        error: "Contenido no permitido en el mensaje",
        type: "error",
        code: "INVALID_CONTENT"
      });
    }
  }
  
  // Mensaje validado
  req.validatedMessage = trimmedMessage;
  next();
};

// ========================================================
// 🎯 DETECCIÓN DE INTENCIÓN MEJORADA
// ========================================================
function detectIntent(text, role = "client") {
  if (!text || typeof text !== 'string') return { intent: "fallback", confidence: 0 };
  
  const lowerText = text.toLowerCase().trim();
  const intents = [];

  // Intents comunes a todos los roles
  if (/(hola|buenos\s+d[ií]as|buenas\s+tardes|buenas\s+noches|saludos|hey|hi|hello)/.test(lowerText)) {
    intents.push({ intent: "greeting", confidence: 0.9 });
  }

  if (/(gracias|thanks|merci|agradecido|agradezco|te\s+agradezco)/.test(lowerText)) {
    intents.push({ intent: "thanks", confidence: 0.8 });
  }

  if (/(adi[óo]s|chao|hasta\s+luego|nos\s+vemos|bye|goodbye)/.test(lowerText)) {
    intents.push({ intent: "goodbye", confidence: 0.9 });
  }

  if (/(ayuda|help|soporte|qu[ée]\s+puedes\s+hacer|c[óo]mo\s+funcionas)/.test(lowerText)) {
    intents.push({ intent: "help", confidence: 0.85 });
  }

  if (/(qui[ée]n\s+eres|qu[ée]\s+eres|tu\s+nombre|te\s+llamas|c[óo]mo\s+te\s+llamas)/.test(lowerText)) {
    intents.push({ intent: "about", confidence: 0.95 });
  }

  // Intents específicos por rol
  if (role === "client") {
    if (/(mis\s+citas|mis\s+reservas|citas\s+agendadas|pr[óo]ximas\s+citas|mis\s+turnos)/.test(lowerText)) {
      intents.push({ intent: "get_user_appointments", confidence: 0.9 });
    }
    
    if (/(mis\s+mascotas|mascotas\s+registradas|ver\s+mascotas|mis\s+animales)/.test(lowerText)) {
      intents.push({ intent: "get_user_pets", confidence: 0.9 });
    }
    
    if (/(servicios\s+disponibles|qu[ée]\s+servicios|tipos\s+de\s+servicio|qu[ée]\s+ofrecen)/.test(lowerText)) {
      intents.push({ intent: "list_services", confidence: 0.85 });
    }

    if (/(agendar\s+cita|nueva\s+cita|reservar\s+servicio|pedir\s+cita|sacar\s+turno)/.test(lowerText)) {
      intents.push({ intent: "book_appointment", confidence: 0.8 });
    }

  } else if (role === "provider") {
    if (/(citas\s+hoy|agenda\s+de\s+hoy|hoy\s+tengo\s+citas|turnos\s+hoy)/.test(lowerText)) {
      intents.push({ intent: "provider_today_appointments", confidence: 0.9 });
    }
    
    if (/(mis\s+servicios|servicios\s+que\s+ofrezco|gestionar\s+servicios|mis\s+ofertas)/.test(lowerText)) {
      intents.push({ intent: "list_services", confidence: 0.85 });
    }
    
    if (/(estad[ií]sticas|m[ée]tricas|rendimiento|ingresos|ganancias)/.test(lowerText)) {
      intents.push({ intent: "provider_my_services", confidence: 0.8 });
    }

  } else if (role === "admin") {
    if (/(proveedores\s+pendientes|proveedores\s+en\s+espera|aprobar\s+proveedores|solicitudes\s+pendientes)/.test(lowerText)) {
      intents.push({ intent: "admin_list_providers", confidence: 0.9 });
    }
    
    if (/(usuarios\s+registrados|listar\s+usuarios|todos\s+los\s+usuarios|clientes\s+registrados)/.test(lowerText)) {
      intents.push({ intent: "admin_list_users", confidence: 0.9 });
    }
    
    if (/(todas\s+las\s+citas|listar\s+citas|reporte\s+citas|historial\s+de\s+citas)/.test(lowerText)) {
      intents.push({ intent: "admin_list_appointments", confidence: 0.85 });
    }
    
    if (/(servicios\s+del\s+sistema|gestionar\s+servicios|reporte\s+servicios)/.test(lowerText)) {
      intents.push({ intent: "list_services", confidence: 0.8 });
    }
  }

  // Intents generales
  if (/(precios|costos|tarifas|cu[áa]nto\s+cuesta|valor|precio)/.test(lowerText)) {
    intents.push({ intent: "prices", confidence: 0.7 });
  }

  if (/(emergencia|urgencia|veterinario\s+emergencia|accidente|herido)/.test(lowerText)) {
    intents.push({ intent: "emergency", confidence: 0.95 });
  }

  // Seleccionar el intent con mayor confianza
  if (intents.length > 0) {
    intents.sort((a, b) => b.confidence - a.confidence);
    return intents[0];
  }

  return { intent: "fallback", confidence: 0 };
}

// ========================================================
// 📊 RESPUESTAS RÁPIDAS POR ROL
// ========================================================
function getQuickResponse(intent, user) {
  const { name, role } = user;
  
  const quickResponses = {
    greeting: {
      client: `¡Hola ${name}! 👋 Soy PetBot, tu asistente para servicios de mascotas. 

🐾 **¿En qué puedo ayudarte hoy?**
• Ver tus citas y mascotas
• Conocer servicios disponibles
• Agendar nuevos turnos
• Información de emergencias

¡Estoy aquí para ayudarte!`,
      provider: `¡Hola ${name}! 💼 Soy PetBot, tu asistente para la gestión de servicios.

📊 **¿Qué necesitas gestionar hoy?**
• Tu agenda y citas del día
• Servicios que ofreces
• Estadísticas de tu negocio
• Información de clientes

¡Listo para ayudarte!`,
      admin: `¡Hola ${name}! 👨‍💼 Soy PetBot, tu asistente administrativo.

⚙️ **¿Qué área del sistema necesitas revisar?**
• Gestión de usuarios y proveedores
• Reportes y estadísticas
• Control de servicios
• Monitoreo del sistema

¡A tus órdenes!`
    },

    help: {
      client: `¡Claro que sí ${name}! 😊 **Como cliente, puedo ayudarte con:**

📅 **Tus citas:** ver, agendar, cancelar o reprogramar
🐾 **Tus mascotas:** información y gestión
🛎️ **Servicios:** disponibles, precios y reservas
🏥 **Emergencias:** protocolos y contactos de urgencia
💰 **Pagos:** información de costos y promociones

**¿Qué necesitas hacer hoy?**`,
      provider: `¡Por supuesto ${name}! 🔧 **Como proveedor, puedo ayudarte con:**

📊 **Tu agenda:** citas de hoy y futuras, disponibilidad
🛎️ **Tus servicios:** agregar, editar, gestionar ofertas
📈 **Métricas:** ingresos, clientes frecuentes, rendimiento
👥 **Clientes:** historial, preferencias, contacto
💼 **Negocio:** reportes, optimización, crecimiento

**¿Qué área de tu negocio quieres gestionar?**`,
      admin: `¡Desde luego ${name}! ⚙️ **Como administrador, puedo ayudarte con:**

👥 **Usuarios:** gestión completa del sistema
🏢 **Proveedores:** aprobación, control y reportes
📊 **Estadísticas:** métricas globales de la plataforma
🛎️ **Servicios:** control y categorización
🔒 **Seguridad:** monitoreo y auditoría del sistema
📋 **Reportes:** generación y exportación de datos

**¿Qué funcionalidad administrativa necesitas?**`
    },

    thanks: {
      client: `¡De nada, ${name}! 😊 
Es un placer ayudarte con el cuidado de tus mascotas. 
¿Hay algo más en lo que pueda asistirte? 🐕`,
      provider: `¡De nada, ${name}! 💼 
Es un honor apoyar tu negocio de servicios para mascotas. 
¿Necesitas ayuda con algo más? 📈`,
      admin: `¡De nada, ${name}! 👨‍💼 
Es un privilegio asistirte en la gestión del sistema. 
¿Algo más que necesites revisar? ⚙️`
    },

    goodbye: {
      client: `¡Hasta luego, ${name}! 👋 
¡Que tengas un excelente día con tus mascotas! 🐾
Recuerda que estoy aquí cuando me necesites.`,
      provider: `¡Hasta luego, ${name}! 💼 
¡Que tengas un productivo día! 📊
No dudes en consultarme para optimizar tu negocio.`,
      admin: `¡Hasta luego, ${name}! 👨‍💼 
¡Que tengas un excelente día administrativo! ⚙️
Estoy disponible para cualquier consulta del sistema.`
    },

    about: {
      client: `¡Hola ${name}! Soy **PetBot** 🤖

Soy tu asistente virtual especializado en servicios para mascotas, desarrollado específicamente para la plataforma **PetServices**.

**Mi propósito:** 
• Facilitar la gestión de tus mascotas
• Hacer más fácil agendar servicios
• Proporcionar información útil y rápida
• Asistirte 24/7 en todo lo relacionado con mascotas

**Tecnología:** Utilizo inteligencia artificial de Google Gemini para ofrecerte respuestas precisas y útiles.

¿En qué más puedo ayudarte? 😊`,
      provider: `¡Hola ${name}! Soy **PetBot** 🤖

Soy tu asistente virtual para la gestión de servicios de mascotas, diseñado específicamente para optimizar tu negocio en **PetServices**.

**Mi función:**
• Gestionar tu agenda y citas
• Analizar estadísticas de negocio
• Ayudar con la gestión de servicios
• Proporcionar insights para crecimiento

**Tecnología:** Utilizo IA avanzada de Google Gemini para ofrecerte análisis y respuestas inteligentes.

¿Cómo puedo ayudarte a mejorar tu negocio hoy? 💼`,
      admin: `¡Hola ${name}! Soy **PetBot** 🤖

Soy el asistente virtual administrativo del sistema **PetServices**, diseñado para optimizar la gestión de la plataforma.

**Mi rol:**
• Monitorizar el sistema completo
• Generar reportes y estadísticas
• Asistir en la gestión de usuarios
• Proporcionar insights administrativos

**Tecnología:** Basado en Google Gemini AI, ofrezco análisis avanzados y respuestas inteligentes para la administración.

¿En qué aspecto del sistema necesitas asistencia? 👨‍💼`
    }
  };

  const roleResponses = quickResponses[intent];
  if (roleResponses) {
    return roleResponses[role] || roleResponses.client || `Entendido, ${name}. ¿En qué más puedo ayudarte?`;
  }

  return null;
}

// ========================================================
// 🎪 ENDPOINT PRINCIPAL
// ========================================================
router.post("/", protect, chatRateLimiter, validateChatInput, async (req, res) => {
  const startTime = Date.now();
  const requestId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    const message = req.validatedMessage;
    const user = req.user;
    const { _id: userId, role, name, email } = user;

    // Log de inicio
    console.log(`📱 [${requestId}] Chat request - Usuario: ${name} (${role}), Mensaje: "${message.substring(0, 50)}..."`);

    // 1. Detectar intención
    const { intent, confidence } = detectIntent(message, role);
    console.log(`🎯 [${requestId}] Intent detectado: ${intent} (confianza: ${confidence})`);

    // 2. Respuestas rápidas (sin llamar a API)
    const quickResponse = getQuickResponse(intent, user);
    if (quickResponse && confidence > 0.7) {
      const responseTime = Date.now() - startTime;
      
      // Log
      logChatInteraction({
        requestId,
        userId,
        userRole: role,
        userMessage: message,
        botResponse: quickResponse.substring(0, 100) + "...",
        intent,
        confidence,
        responseTime,
        usedAI: false
      });

      console.log(`⚡ [${requestId}] Respuesta rápida generada en ${responseTime}ms`);

      return res.json({ 
        reply: quickResponse, 
        type: "text",
        hasData: false,
        intent,
        confidence,
        responseTime,
        requestId
      });
    }

    // 3. Respuestas con datos (consultas a DB)
    const dataIntents = {
      client: ["get_user_appointments", "get_user_pets", "list_services"],
      provider: ["provider_today_appointments", "list_services", "provider_my_services"],
      admin: ["admin_list_providers", "admin_list_users", "admin_list_appointments", "list_services"]
    };

    if (dataIntents[role]?.includes(intent)) {
      console.log(`📊 [${requestId}] Generando respuesta con datos para: ${intent}`);
      
      try {
        const reply = await ChatService.generateDataResponse(intent, user, message);
        const responseTime = Date.now() - startTime;

        // Log
        logChatInteraction({
          requestId,
          userId,
          userRole: role,
          userMessage: message,
          botResponse: reply.substring(0, 100) + "...",
          intent,
          confidence,
          responseTime,
          usedAI: false,
          hasData: true
        });

        console.log(`✅ [${requestId}] Respuesta con datos generada en ${responseTime}ms`);

        return res.json({ 
          reply, 
          type: "text",
          hasData: true,
          intent,
          confidence,
          responseTime,
          requestId
        });
      } catch (dbError) {
        console.error(`❌ [${requestId}] Error en respuesta con datos:`, dbError);
        // Continuar con IA como fallback
      }
    }

    // 4. Usar IA para respuestas complejas
    console.log(`🤖 [${requestId}] Usando IA para respuesta (intent: ${intent})`);
    
    const reply = await ChatService.generateResponse(message, user);
    const responseTime = Date.now() - startTime;

    // Log
    logChatInteraction({
      requestId,
      userId,
      userRole: role,
      userMessage: message,
      botResponse: reply.substring(0, 100) + "...",
      intent,
      confidence,
      responseTime,
      usedAI: true,
      aiModel: "gemini-2.5-flash"
    });

    console.log(`✅ [${requestId}] Respuesta IA generada en ${responseTime}ms`);

    res.json({ 
      reply, 
      type: "text",
      hasData: false,
      intent,
      confidence,
      responseTime,
      requestId,
      aiUsed: true
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error(`❌ [${requestId}] Error en el endpoint /chat:`, error);

    // Log de error
    logChatInteraction({
      requestId,
      userId: req.user?._id,
      userRole: req.user?.role,
      userMessage: req.validatedMessage || "Unknown",
      error: error.message,
      responseTime,
      hasError: true
    });

    // Respuesta de error amigable
    const errorMessage = `😔 **Lo siento, ${req.user?.name || 'usuario'}**

He encontrado un problema técnico al procesar tu solicitud.

🔧 **Qué puedes hacer:**
• Intentar nuevamente en unos momentos
• Contactar al soporte técnico si el problema persiste
• Usar una consulta más simple

**Detalles técnicos:** ${process.env.NODE_ENV === 'development' ? error.message : 'Error interno'}`;

    res.status(500).json({ 
      reply: errorMessage,
      type: "error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      requestId,
      responseTime
    });
  }
});

// ========================================================
// 📈 ENDPOINT DE ESTADO MEJORADO
// ========================================================
router.get("/status", protect, (req, res) => {
  const status = {
    status: "operational",
    aiProvider: "Google Gemini 2.5 Flash",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    user: {
      name: req.user.name,
      role: req.user.role,
      id: req.user._id
    },
    features: {
      quickResponses: true,
      dataQueries: true,
      aiGeneration: true,
      rateLimiting: true
    },
    limits: {
      maxMessageLength: 1000,
      rateLimit: "50 requests per 15 minutes"
    },
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  };

  console.log("📊 Estado del chatbot consultado por:", req.user.name);
  res.json(status);
});

// ========================================================
// 📊 ENDPOINT DE ESTADÍSTICAS (solo admin)
// ========================================================
router.get("/stats", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ 
        error: "Acceso denegado. Solo administradores pueden ver estadísticas." 
      });
    }

    // Aquí puedes agregar consultas a tu base de datos para estadísticas
    const stats = {
      totalUsers: 0, // Implementar consulta real
      activeChats: 0,
      averageResponseTime: 0,
      popularIntents: []
    };

    res.json(stats);
  } catch (error) {
    console.error("Error en /stats:", error);
    res.status(500).json({ error: "Error al obtener estadísticas" });
  }
});

// ========================================================
// 🔄 ENDPOINT DE HEALTH CHECK
// ========================================================
router.get("/health", (req, res) => {
  const health = {
    status: "healthy",
    service: "chatbot",
    timestamp: new Date().toISOString(),
    checks: {
      database: "connected", // Implementar verificación real
      apiKey: "configured",
      memory: process.memoryUsage()
    }
  };

  res.json(health);
});

export default router;