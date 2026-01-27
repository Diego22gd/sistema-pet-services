import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import User from "../models/User.js";
import Pet from "../models/Pet.js";
import Business from "../models/Business.js";
import Appointment from "../models/Appointment.js";
import mongoose from "mongoose";

const router = express.Router();

// ============================================
// 🚀 CONFIGURACIÓN GEMINI
// ============================================

const GEMINI_API_KEY = "AIzaSyC_0mKWjKub2CUzXO5MJXI45e_UxYZASuQ";
const GEMINI_MODEL = "gemini-2.5-flash"; // Modelo más estable
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models";

console.log("🤖 ======= PETBOT CON GEMINI INICIADO =======");

// ============================================
// 🔌 CLIENTE GEMINI API
// ============================================

class GeminiClient {
  static async generateText(prompt, systemInstruction = null, temperature = 0.7) {
    try {
      console.log(`🧠 Enviando a Gemini: "${prompt.substring(0, 100)}..."`);
      
      const url = `${GEMINI_API_URL}/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
      
      const requestBody = {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: temperature,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      };

      // Añadir instrucción del sistema si se proporciona
      if (systemInstruction) {
        requestBody.systemInstruction = {
          parts: [{
            text: systemInstruction
          }]
        };
      }

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Error de Gemini:", errorData);
        throw new Error(`Gemini API error: ${response.status} - ${JSON.stringify(errorData.error || errorData)}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const text = data.candidates[0].content.parts[0].text;
        console.log(`✅ Respuesta de Gemini recibida (${text.length} caracteres)`);
        return text;
      } else {
        throw new Error("Respuesta de Gemini inválida");
      }
    } catch (error) {
      console.error("❌ Error en GeminiClient:", error.message);
      return null;
    }
  }

  // Método para análisis avanzado de contexto
  static async analyzeWithContext(userMessage, userData, userRole) {
    const systemPrompt = `Eres PetBot, el asistente virtual inteligente de PetServices. Tu especialidad es todo lo relacionado con mascotas y servicios veterinarios.

DATOS DEL USUARIO:
- Nombre: ${userData?.name || 'Usuario'}
- Rol: ${userRole}
- Estadísticas: ${JSON.stringify(userData?.stats || {})}

INSTRUCCIONES:
1. Sé amable, profesional y útil
2. Usa emojis apropiados (🐕 🐈 🏥 🛁 🏪 ⭐)
3. Mantén respuestas concisas pero informativas
4. Si el usuario es cliente, enfócate en servicios para mascotas
5. Si es proveedor, enfócate en gestión de negocio
6. Si es admin, enfócate en gestión del sistema
7. Proporciona información precisa sobre mascotas

RESPONDE EN ESPAÑOL y usa markdown simple para formato.`;

    const fullPrompt = `Usuario (${userRole}) dice: "${userMessage}"

Basándote en el contexto y tu conocimiento sobre mascotas, proporciona una respuesta útil y personalizada.`;

    return await this.generateText(fullPrompt, systemPrompt, 0.3);
  }
}

// ============================================
// 📊 SISTEMA DE DATOS
// ============================================

class DataManager {
  // Obtener perfil básico del usuario
  static async getUserProfile(userId) {
    try {
      console.log(`🔍 Obteniendo perfil para: ${userId}`);
      
      const user = await User.findById(userId)
        .select('name email role phone address businessName serviceType avatar')
        .lean();
      
      if (!user) {
        console.log('❌ Usuario no encontrado');
        return null;
      }
      
      console.log(`✅ Usuario: ${user.name} (${user.role})`);
      
      // Obtener datos según rol
      let stats = {};
      let additionalData = {};
      
      switch (user.role) {
        case 'client':
          stats = await this.getClientStats(userId);
          additionalData = await this.getClientData(userId);
          break;
        
        case 'provider':
          stats = await this.getProviderStats(userId);
          additionalData = await this.getProviderData(userId);
          break;
        
        case 'admin':
          stats = await this.getAdminStats();
          additionalData = await this.getAdminData();
          break;
      }
      
      return {
        ...user,
        stats,
        ...additionalData
      };
    } catch (error) {
      console.error('❌ Error en getUserProfile:', error.message);
      return null;
    }
  }

  // Estadísticas para clientes
  static async getClientStats(userId) {
    try {
      console.log(`📊 Estadísticas cliente: ${userId}`);
      
      const [totalAppointments, totalPets, favoriteCount] = await Promise.all([
        Appointment.countDocuments({ userId }),
        Pet.countDocuments({ owner: userId }),
        User.findById(userId).then(user => user?.favoriteBusinesses?.length || 0)
      ]);
      
      const upcomingAppointments = await Appointment.countDocuments({ 
        userId, 
        status: { $in: ['pendiente', 'confirmada'] },
        date: { $gte: new Date().toISOString().split('T')[0] }
      });
      
      const totalSpentResult = await Appointment.aggregate([
        { $match: { 
          userId: new mongoose.Types.ObjectId(userId), 
          status: 'completada' 
        }},
        { $group: { _id: null, total: { $sum: '$servicePrice' } } }
      ]);
      
      return {
        totalAppointments: totalAppointments || 0,
        upcomingAppointments: upcomingAppointments || 0,
        totalPets: totalPets || 0,
        favoriteCount: favoriteCount || 0,
        totalSpent: totalSpentResult[0]?.total || 0
      };
    } catch (error) {
      console.error('❌ Error en getClientStats:', error.message);
      return {};
    }
  }

  // Datos para clientes
  static async getClientData(userId) {
    try {
      const [appointments, pets] = await Promise.all([
        Appointment.find({ userId })
          .populate('petId', 'name type')
          .populate('businessId', 'name categories')
          .sort({ date: -1 })
          .limit(5)
          .lean(),
        Pet.find({ owner: userId })
          .select('name type breed age')
          .sort({ createdAt: -1 })
          .limit(5)
          .lean()
      ]);
      
      return {
        appointments: appointments || [],
        pets: pets || []
      };
    } catch (error) {
      console.error('❌ Error en getClientData:', error);
      return {};
    }
  }

  // Estadísticas para proveedores
  static async getProviderStats(userId) {
    try {
      const business = await Business.findOne({ provider: userId }).lean();
      if (!business) return {};
      
      const [
        totalAppointments,
        todayAppointments,
        pendingAppointments,
        completedAppointments,
        totalRevenue
      ] = await Promise.all([
        Appointment.countDocuments({ providerId: userId }),
        Appointment.countDocuments({ 
          providerId: userId,
          date: new Date().toISOString().split('T')[0]
        }),
        Appointment.countDocuments({ providerId: userId, status: 'pendiente' }),
        Appointment.countDocuments({ providerId: userId, status: 'completada' }),
        Appointment.aggregate([
          { $match: { 
            providerId: new mongoose.Types.ObjectId(userId), 
            status: 'completada' 
          }},
          { $group: { _id: null, total: { $sum: '$servicePrice' } } }
        ])
      ]);
      
      return {
        businessName: business.name,
        totalAppointments: totalAppointments || 0,
        todayAppointments: todayAppointments || 0,
        pendingAppointments: pendingAppointments || 0,
        completedAppointments: completedAppointments || 0,
        totalRevenue: totalRevenue[0]?.total || 0,
        rating: business.rating || 0,
        views: business.views || 0
      };
    } catch (error) {
      console.error('❌ Error en getProviderStats:', error);
      return {};
    }
  }

  // Datos para proveedores
  static async getProviderData(userId) {
    try {
      const [business, appointments] = await Promise.all([
        Business.findOne({ provider: userId })
          .select('name categories description services')
          .lean(),
        Appointment.find({ providerId: userId })
          .populate('userId', 'name')
          .populate('petId', 'name type')
          .sort({ date: 1 })
          .limit(10)
          .lean()
      ]);
      
      return {
        business: business || null,
        appointments: appointments || [],
        serviceCount: business?.services?.length || 0
      };
    } catch (error) {
      console.error('❌ Error en getProviderData:', error);
      return {};
    }
  }

  // Estadísticas para administradores
  static async getAdminStats() {
    try {
      const [
        totalUsers,
        totalProviders,
        totalClients,
        totalBusinesses,
        pendingBusinesses,
        totalAppointments,
        todayAppointments
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: 'provider' }),
        User.countDocuments({ role: 'client' }),
        Business.countDocuments(),
        Business.countDocuments({ status: 'pending', approved: false }),
        Appointment.countDocuments(),
        Appointment.countDocuments({ 
          date: new Date().toISOString().split('T')[0] 
        })
      ]);
      
      return {
        totalUsers: totalUsers || 0,
        totalProviders: totalProviders || 0,
        totalClients: totalClients || 0,
        totalBusinesses: totalBusinesses || 0,
        pendingBusinesses: pendingBusinesses || 0,
        totalAppointments: totalAppointments || 0,
        todayAppointments: todayAppointments || 0
      };
    } catch (error) {
      console.error('❌ Error en getAdminStats:', error);
      return {};
    }
  }

  // Datos para administradores
  static async getAdminData() {
    try {
      const [recentUsers, pendingApprovals, recentAppointments] = await Promise.all([
        User.find()
          .select('name email role createdAt')
          .sort({ createdAt: -1 })
          .limit(5)
          .lean(),
        Business.find({ status: 'pending', approved: false })
          .select('name categories provider createdAt')
          .populate('provider', 'name email')
          .limit(5)
          .lean(),
        Appointment.find()
          .populate('userId', 'name')
          .populate('businessId', 'name')
          .sort({ createdAt: -1 })
          .limit(5)
          .lean()
      ]);
      
      return {
        recentUsers: recentUsers || [],
        pendingApprovals: pendingApprovals || [],
        recentAppointments: recentAppointments || []
      };
    } catch (error) {
      console.error('❌ Error en getAdminData:', error);
      return {};
    }
  }

  // Buscar comercios
  static async searchBusinesses(query, filters = {}) {
    try {
      const searchFilters = {
        status: 'active',
        approved: true,
        ...filters
      };
      
      if (query) {
        return await Business.find({
          ...searchFilters,
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { categories: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } }
          ]
        })
        .select('name categories description rating averageServicePrice')
        .limit(10)
        .lean();
      } else {
        return await Business.find(searchFilters)
          .select('name categories description rating averageServicePrice')
          .sort({ rating: -1 })
          .limit(10)
          .lean();
      }
    } catch (error) {
      console.error('❌ Error en searchBusinesses:', error);
      return [];
    }
  }
}

// ============================================
// 🎯 DETECCIÓN DE INTENCIONES
// ============================================

function detectIntent(text, role = "client") {
  if (!text || typeof text !== 'string') return "fallback";
  
  const lowerText = text.toLowerCase().trim();

  // Intenciones generales
  if (/(hola|buenos|buenas|saludos)/i.test(lowerText)) return "greeting";
  if (/(gracias|thank)/i.test(lowerText)) return "thanks";
  if (/(adiós|chao|bye)/i.test(lowerText)) return "goodbye";
  if (/(ayuda|help|soporte)/i.test(lowerText)) return "help";
  if (/(qu[ií]n eres|qu[eé] eres)/i.test(lowerText)) return "about";

  // Intenciones de cliente
  if (role === 'client') {
    if (/(comercios|negocios|veterinarias|peluquerías|guarderías)/i.test(lowerText)) 
      return "list_businesses";
    if (/(mis citas|citas.*programadas)/i.test(lowerText)) 
      return "my_appointments";
    if (/(mis mascotas|mascotas registradas)/i.test(lowerText)) 
      return "get_user_pets";
    if (/(agendar|reservar).*(cita|consulta)/i.test(lowerText)) 
      return "book_appointment";
    if (/(precio|costos|cu[aá]nto cuesta)/i.test(lowerText)) 
      return "prices";
    if (/(emergencia|urgencia|accidente)/i.test(lowerText)) 
      return "emergency";
    if (/(favoritos|guardados|me gusta)/i.test(lowerText)) 
      return "favorites";
  }

  // Intenciones de proveedor
  if (role === 'provider') {
    if (/(citas.*hoy|agenda.*hoy)/i.test(lowerText)) 
      return "provider_appointments";
    if (/(estad[ií]sticas|m[eé]tricas)/i.test(lowerText)) 
      return "provider_stats";
    if (/(mis servicios|servicios.*ofrezco)/i.test(lowerText)) 
      return "provider_services";
    if (/(ingresos|ganancias|ventas)/i.test(lowerText)) 
      return "provider_revenue";
  }

  // Intenciones de administrador
  if (role === 'admin') {
    if (/(comercios.*pendientes|aprobar.*comercio)/i.test(lowerText)) 
      return "admin_businesses";
    if (/(usuarios|clientes|proveedores)/i.test(lowerText)) 
      return "admin_users";
    if (/(reportes|estad[ií]sticas.*sistema)/i.test(lowerText)) 
      return "admin_reports";
    if (/(panel|dashboard)/i.test(lowerText)) 
      return "admin_dashboard";
  }

  // Si no coincide con ninguna intención específica, usar Gemini
  return "gemini_analysis";
}

// ============================================
// 🤖 GENERADOR DE RESPUESTAS HÍBRIDO
// ============================================

class ResponseGenerator {
  static async generateResponse(intent, user, userData, message = "") {
    const { name, role } = user;
    
    try {
      // Intenciones que usan Gemini
      if (intent === "gemini_analysis") {
        console.log(`🧠 Usando Gemini para análisis de: "${message.substring(0, 50)}..."`);
        
        const geminiResponse = await GeminiClient.analyzeWithContext(
          message,
          userData,
          role
        );
        
        if (geminiResponse) {
          return geminiResponse;
        } else {
          // Fallback a respuestas locales si Gemini falla
          console.log("⚠️ Gemini falló, usando fallback");
          return this.getFallbackResponse(role, name);
        }
      }
      
      // Intenciones que manejan respuestas locales rápidas
      switch (intent) {
        case "greeting":
          return `¡Hola ${name}! 👋 Soy PetBot, tu asistente inteligente de PetServices. ¿En qué puedo ayudarte hoy?`;
        
        case "thanks":
          return `¡De nada ${name}! 😊 Es un placer ayudarte. Siempre estoy aquí para lo que necesites.`;
        
        case "goodbye":
          return `¡Hasta luego ${name}! 🐾 Que tengas un excelente día. ¡Vuelve pronto!`;
        
        case "help":
          return this.getHelpMessage(role, name);
        
        case "about":
          return `🤖 **Soy PetBot**, el asistente virtual inteligente de PetServices.\n\nEstoy potenciado por Gemini AI para brindarte:\n• 🏪 Recomendaciones personalizadas de comercios\n• 📅 Asistencia inteligente para citas\n• 🐾 Consejos personalizados para tus mascotas\n• 💰 Análisis de precios y servicios\n• 🚨 Guía en emergencias veterinarias\n\n¡Pregúntame lo que quieras!`;
        
        // Para otras intenciones específicas, usar respuestas locales
        case "list_businesses":
          return await this.generateBusinessesResponse(message, userData);
        
        case "my_appointments":
          return this.generateAppointmentsResponse(userData, name);
        
        case "get_user_pets":
          return this.generatePetsResponse(userData, name);
        
        case "book_appointment":
          return `📅 **Para agendar una cita:**\n\n1. Ve a "Buscar Comercios"\n2. Selecciona un servicio\n3. Elige fecha y hora disponible\n4. Completa los datos de tu mascota\n5. Confirma la reserva\n\n💡 *¿Quieres que te recomiende algunos comercios?*`;
        
        case "prices":
          // Usar Gemini para dar respuestas más detalladas sobre precios
          const pricePrompt = `El usuario ${name} pregunta sobre precios de servicios veterinarios. Usuario es ${role}. Datos: ${JSON.stringify(userData?.stats || {})}. Proporciona información detallada sobre precios de servicios para mascotas, incluyendo rangos aproximados y factores que afectan el costo.`;
          const priceResponse = await GeminiClient.generateText(pricePrompt, "Eres un experto en precios de servicios veterinarios y para mascotas. Proporciona información útil y precisa.");
          return priceResponse || this.getLocalPriceResponse();
        
        case "emergency":
          return `🚨 **EMERGENCIA VETERINARIA**\n\n**Contactos inmediatos:**\n• Línea 24/7: 1-800-PET-HELP\n• Tu veterinario de confianza\n\n**Síntomas de emergencia:**\n• Dificultad para respirar\n• Sangrado abundante\n• Convulsiones\n• Ingesta de venenos\n• Trauma grave\n\n**⚠️ ACUDA INMEDIATAMENTE A UNA CLÍNICA VETERINARIA**`;
        
        case "favorites":
          return this.generateFavoritesResponse(userData, name);
        
        // Respuestas para proveedores
        case "provider_appointments":
          return this.generateProviderAppointments(userData, name);
        
        case "provider_stats":
          return this.generateProviderStats(userData, name);
        
        case "provider_services":
          return `🛎️ **Tus servicios:**\n\n${this.formatProviderServices(userData)}`;
        
        case "provider_revenue":
          return this.generateProviderRevenue(userData, name);
        
        // Respuestas para administradores
        case "admin_businesses":
          return this.generateAdminBusinesses(userData, name);
        
        case "admin_users":
          return this.generateAdminUsers(userData, name);
        
        case "admin_reports":
          return this.generateAdminReports(userData, name);
        
        case "admin_dashboard":
          return this.generateAdminDashboard(userData, name);
        
        // Fallback
        default:
          // Usar Gemini para respuestas genéricas
          const defaultPrompt = `Usuario: ${name} (${role}) dice: "${message}". Datos del usuario: ${JSON.stringify(userData?.stats || {})}. Responde de manera útil y amigable sobre temas de mascotas.`;
          const defaultResponse = await GeminiClient.generateText(defaultPrompt, "Eres un asistente especializado en mascotas y servicios veterinarios.");
          return defaultResponse || this.getFallbackResponse(role, name);
      }
    } catch (error) {
      console.error('Error generando respuesta:', error);
      return `😔 **Ocurrió un error.** Por favor, intenta nuevamente. Error: ${error.message}`;
    }
  }
  
  static getHelpMessage(role, name) {
    const helpMessages = {
      client: `¡Claro ${name}! 🤖\n\n**Como cliente, puedo ayudarte con:**\n\n🔍 **BUSCAR SERVICIOS**\n• Veterinarias, peluquerías, guarderías\n• Tiendas de mascotas\n• Entrenadores profesionales\n\n📅 **GESTIONAR CITAS**\n• Agendar nuevas citas\n• Ver citas programadas\n• Cancelar o reprogramar\n\n🐾 **TUS MASCOTAS**\n• Ver mascotas registradas\n• Agregar nueva mascota\n• Información médica\n\n⭐ **FAVORITOS**\n• Guardar comercios favoritos\n• Ver recomendaciones\n\n💰 **INFORMACIÓN**\n• Precios y costos\n• Promociones\n\n🚨 **EMERGENCIAS**\n• Contactos de urgencia\n• Primeros auxilios\n\n**¿Con qué necesitas ayuda?**`,
      
      provider: `¡Claro ${name}! 💼\n\n**Como proveedor, puedo ayudarte con:**\n\n📅 **AGENDA Y CITAS**\n• Ver agenda del día\n• Próximas citas\n• Gestionar disponibilidad\n\n📊 **ESTADÍSTICAS**\n• Métricas de tu negocio\n• Ingresos y ganancias\n• Crecimiento mensual\n\n👥 **CLIENTES**\n• Clientes recurrentes\n• Historial por cliente\n• Comunicación directa\n\n⚙️ **CONFIGURACIÓN**\n• Actualizar servicios\n• Modificar precios\n• Cambiar horarios\n\n📈 **CRECIMIENTO**\n• Promociones\n• Marketing\n• Expansión de servicios\n\n**¿Qué área necesitas gestionar?**`,
      
      admin: `¡Claro ${name}! 👨‍💼\n\n**Como administrador, puedo ayudarte con:**\n\n👥 **USUARIOS**\n• Gestión de usuarios\n• Estadísticas de crecimiento\n• Actividad del sistema\n\n🏢 **COMERCIOS**\n• Aprobar/rechazar comercios\n• Supervisar actividad\n• Verificar información\n\n📊 **SISTEMA**\n• Métricas de plataforma\n• Reportes y análisis\n• Monitoreo en tiempo real\n\n🛡️ **SEGURIDAD**\n• Logs del sistema\n• Detección de anomalías\n• Backup de datos\n\n**¿Qué área necesitas supervisar?**`
    };
    
    return helpMessages[role] || helpMessages.client;
  }
  
  static getLocalPriceResponse() {
    return `💰 **Información de precios:**\n\nLos precios varían según:\n• 🐕 Tamaño y raza de la mascota\n• 🏢 Tipo de servicio\n• 📍 Ubicación\n• 👨‍⚕️ Experiencia del proveedor\n\n**Rangos aproximados:**\n• Consulta veterinaria: $20-$60\n• Baño y corte: $15-$90\n• Guardería diurna: $15-$50\n• Entrenamiento: $30-$120/sesión\n\n💡 **Consejo:** Contacta directamente al comercio para cotización exacta.`;
  }
  
  static async generateBusinessesResponse(message, userData) {
    try {
      let businesses = [];
      
      // Extraer término de búsqueda del mensaje
      const searchTerm = message.toLowerCase().includes('veterinaria') ? 'veterinaria' :
                        message.toLowerCase().includes('peluqueria') ? 'peluqueria' :
                        message.toLowerCase().includes('guarderia') ? 'guarderia' :
                        '';
      
      if (searchTerm) {
        businesses = await DataManager.searchBusinesses(searchTerm);
      } else {
        businesses = await DataManager.searchBusinesses('');
      }
      
      if (businesses.length === 0) {
        return `🔍 **No encontré comercios.**\n\nIntenta con términos como:\n• "veterinarias"\n• "peluquerías caninas"\n• "guarderías para perros"\n• "tiendas de mascotas"`;
      }
      
      let response = `🏢 **Encontré ${businesses.length} comercios:**\n\n`;
      
      businesses.slice(0, 5).forEach((business, index) => {
        response += `${index + 1}. **${business.name}**\n`;
        if (business.categories?.length) {
          response += `   📍 ${business.categories.join(', ')}\n`;
        }
        if (business.rating) {
          response += `   ⭐ ${business.rating.toFixed(1)}/5.0\n`;
        }
        if (business.averageServicePrice > 0) {
          response += `   💰 Desde $${business.averageServicePrice.toFixed(2)}\n`;
        }
        response += `\n`;
      });
      
      if (businesses.length > 5) {
        response += `\n🔍 **Para ver más:** Usa la función de búsqueda en la app.`;
      }
      
      return response;
    } catch (error) {
      console.error('Error generando respuesta de comercios:', error);
      return `🏢 **Comercios disponibles:**\n\nPuedes buscar por:\n• Veterinarias\n• Peluquerías caninas\n• Guarderías\n• Entrenadores\n• Tiendas de mascotas\n\n💡 **Consejo:** Usa los filtros en "Buscar Comercios" para resultados más específicos.`;
    }
  }
  
  static generateAppointmentsResponse(userData, name) {
    if (!userData?.appointments || userData.appointments.length === 0) {
      return `📅 **${name}, no tienes citas registradas.**\n\n¿Te gustaría agendar una cita? Puedo ayudarte a encontrar el servicio perfecto.`;
    }
    
    let response = `📅 **Tus citas recientes (${userData.appointments.length}):**\n\n`;
    
    userData.appointments.forEach((appointment, index) => {
      const petName = appointment.petId?.name || 'Mascota';
      const businessName = appointment.businessId?.name || 'Comercio';
      
      response += `${index + 1}. **${petName}** - ${businessName}\n`;
      response += `   📅 ${appointment.date} a las ${appointment.time}\n`;
      response += `   🛎️ ${appointment.serviceName || 'Servicio'}\n`;
      response += `   📍 ${appointment.status}\n`;
      
      if (index < userData.appointments.length - 1) {
        response += `\n`;
      }
    });
    
    const upcoming = userData.stats?.upcomingAppointments || 0;
    if (upcoming > 0) {
      response += `\n📊 **Tienes ${upcoming} cita(s) próximas.**`;
    }
    
    return response;
  }
  
  static generatePetsResponse(userData, name) {
    if (!userData?.pets || userData.pets.length === 0) {
      return `🐾 **${name}, no tienes mascotas registradas.**\n\n**Para agregar una mascota:**\n1. Ve a tu perfil → "Mis Mascotas"\n2. Haz clic en "Agregar Mascota"\n3. Completa la información\n4. ¡Listo!`;
    }
    
    let response = `🐾 **Tus mascotas (${userData.pets.length}):**\n\n`;
    
    userData.pets.forEach((pet, index) => {
      response += `${index + 1}. **${pet.name}**\n`;
      response += `   🐕 ${pet.type || 'Mascota'}\n`;
      if (pet.breed) response += `   🧬 ${pet.breed}\n`;
      if (pet.age) response += `   📅 ${pet.age} años\n`;
      response += `\n`;
    });
    
    return response;
  }
  
  static generateFavoritesResponse(userData, name) {
    const favoriteCount = userData?.stats?.favoriteCount || 0;
    
    if (favoriteCount === 0) {
      return `⭐ **${name}, no tienes comercios favoritos.**\n\n**Para agregar favoritos:**\n1. Busca un comercio que te guste\n2. Haz clic en el corazón ❤️\n3. ¡Listo! Aparecerá en tus favoritos.`;
    }
    
    return `⭐ **Tienes ${favoriteCount} comercio(s) en favoritos.**\n\n**Para ver tus favoritos:**\n1. Ve a tu perfil\n2. Selecciona "Mis Favoritos"\n3. Explora tus comercios guardados\n\n💡 **Consejo:** Los favoritos te ayudan a acceder rápidamente a tus lugares preferidos.`;
  }
  
  static generateProviderAppointments(userData, name) {
    const today = userData?.stats?.todayAppointments || 0;
    const pending = userData?.stats?.pendingAppointments || 0;
    
    let response = `📅 **${name}, tu agenda hoy:**\n\n`;
    response += `• Citas para hoy: ${today}\n`;
    response += `• Pendientes de confirmar: ${pending}\n`;
    
    if (userData?.appointments?.length > 0) {
      const todayAppointments = userData.appointments.filter(a => 
        a.date === new Date().toISOString().split('T')[0]
      ).slice(0, 3);
      
      if (todayAppointments.length > 0) {
        response += `\n**Próximas citas de hoy:**\n`;
        todayAppointments.forEach((app, idx) => {
          response += `${idx + 1}. ${app.time} - ${app.userId?.name || 'Cliente'}\n`;
        });
      }
    }
    
    return response;
  }
  
  static generateProviderStats(userData, name) {
    const stats = userData?.stats || {};
    
    let response = `📊 **${name}, estadísticas de tu negocio:**\n\n`;
    response += `• Total citas: ${stats.totalAppointments || 0}\n`;
    response += `• Completadas: ${stats.completedAppointments || 0}\n`;
    response += `• Ingresos totales: $${stats.totalRevenue?.toFixed(2) || '0.00'}\n`;
    response += `• Calificación: ⭐ ${stats.rating?.toFixed(1) || '0'}/5.0\n`;
    response += `• Vistas: ${stats.views || 0}\n`;
    
    return response;
  }
  
  static formatProviderServices(userData) {
    if (!userData?.business?.services || userData.business.services.length === 0) {
      return "Aún no has agregado servicios.\n\n**Para agregar servicios:**\n1. Ve a tu perfil de comercio\n2. Selecciona 'Mis Servicios'\n3. Haz clic en 'Agregar Servicio'\n4. Completa la información";
    }
    
    let response = "";
    userData.business.services.slice(0, 5).forEach((service, index) => {
      if (service.isActive !== false) {
        response += `${index + 1}. **${service.name}**\n`;
        response += `   💰 $${service.price}\n`;
        if (service.description) {
          response += `   📝 ${service.description.substring(0, 50)}...\n`;
        }
        response += `\n`;
      }
    });
    
    const activeCount = userData.business.services.filter(s => s.isActive !== false).length;
    response += `\n**Total servicios activos:** ${activeCount}`;
    
    return response;
  }
  
  static generateProviderRevenue(userData, name) {
    const revenue = userData?.stats?.totalRevenue || 0;
    const avgPerAppointment = userData?.stats?.totalAppointments > 0 ? 
      revenue / userData.stats.totalAppointments : 0;
    
    let response = `💰 **${name}, ingresos de tu negocio:**\n\n`;
    response += `• Ingresos totales: **$${revenue.toFixed(2)}**\n`;
    response += `• Citas totales: ${userData?.stats?.totalAppointments || 0}\n`;
    response += `• Promedio por cita: **$${avgPerAppointment.toFixed(2)}**\n`;
    
    if (userData?.stats?.todayAppointments > 0) {
      const estimatedToday = avgPerAppointment * userData.stats.todayAppointments;
      response += `• Estimado hoy: **$${estimatedToday.toFixed(2)}**\n`;
    }
    
    return response;
  }
  
  static generateAdminBusinesses(userData, name) {
    const pending = userData?.stats?.pendingBusinesses || 0;
    const total = userData?.stats?.totalBusinesses || 0;
    
    let response = `🏢 **${name}, comercios del sistema:**\n\n`;
    response += `• Total comercios: ${total}\n`;
    response += `• Pendientes de aprobación: **${pending}**\n`;
    response += `• Activos: ${total - pending}\n`;
    
    if (userData?.pendingApprovals?.length > 0) {
      response += `\n**Últimos pendientes:**\n`;
      userData.pendingApprovals.slice(0, 3).forEach((business, index) => {
        const daysAgo = Math.floor((new Date() - new Date(business.createdAt)) / (1000 * 60 * 60 * 24));
        response += `${index + 1}. ${business.name} (hace ${daysAgo} días)\n`;
      });
      
      if (pending > 3) {
        response += `\n... y ${pending - 3} más`;
      }
    }
    
    return response;
  }
  
  static generateAdminUsers(userData, name) {
    const stats = userData?.stats || {};
    
    let response = `👥 **${name}, usuarios del sistema:**\n\n`;
    response += `• Total usuarios: ${stats.totalUsers || 0}\n`;
    response += `• Proveedores: ${stats.totalProviders || 0}\n`;
    response += `• Clientes: ${stats.totalClients || 0}\n`;
    response += `• Citas totales: ${stats.totalAppointments || 0}\n`;
    response += `• Citas hoy: ${stats.todayAppointments || 0}\n`;
    
    if (userData?.recentUsers?.length > 0) {
      response += `\n**Últimos registrados:**\n`;
      userData.recentUsers.slice(0, 3).forEach((user, index) => {
        const roleEmoji = user.role === 'provider' ? '💼' : user.role === 'admin' ? '👨‍💼' : '👤';
        response += `${index + 1}. ${roleEmoji} ${user.name} (${user.role})\n`;
      });
    }
    
    return response;
  }
  
  static generateAdminReports(userData, name) {
    return `📊 **${name}, reportes del sistema:**\n\n**Métricas principales:**\n• Usuarios totales: ${userData?.stats?.totalUsers || 0}\n• Comercios totales: ${userData?.stats?.totalBusinesses || 0}\n• Citas hoy: ${userData?.stats?.todayAppointments || 0}\n\n**Reportes disponibles:**\n1. Crecimiento de usuarios\n2. Actividad de comercios\n3. Métricas de citas\n4. Ingresos del sistema\n5. Satisfacción de usuarios\n\n**Para reportes completos:**\nAccede al panel administrativo → "Reportes"`;
  }
  
  static generateAdminDashboard(userData, name) {
    const stats = userData?.stats || {};
    
    let response = `📋 **${name}, panel de control:**\n\n`;
    response += `**📈 ESTADO DEL SISTEMA**\n`;
    response += `• 👥 Usuarios: ${stats.totalUsers || 0}\n`;
    response += `• 🏢 Comercios: ${stats.totalBusinesses || 0}\n`;
    response += `• 📅 Citas hoy: ${stats.todayAppointments || 0}\n`;
    response += `• ⚠️ Pendientes: ${stats.pendingBusinesses || 0}\n`;
    
    if (userData?.recentAppointments?.length > 0) {
      response += `\n**📅 ACTIVIDAD RECIENTE**\n`;
      userData.recentAppointments.slice(0, 3).forEach((app, index) => {
        response += `${index + 1}. ${app.userId?.name || 'Usuario'} - ${app.businessId?.name || 'Comercio'}\n`;
      });
    }
    
    response += `\n**🎯 ACCIONES PRIORITARIAS:**\n`;
    if (stats.pendingBusinesses > 0) {
      response += `1. Revisar ${stats.pendingBusinesses} comercios pendientes\n`;
    }
    response += `2. Monitorear actividad del sistema\n`;
    response += `3. Verificar reportes de uso\n`;
    
    return response;
  }
  
  static getFallbackResponse(role, name) {
    const fallbackResponses = {
      client: `🤔 **${name}, no estoy seguro de entender.**\n\n**Como cliente, puedo ayudarte con:**\n\n🔍 **BUSCAR:**\n• "Buscar veterinarias"\n• "Encontrar peluquería"\n\n📅 **CITAS:**\n• "Agendar cita"\n• "Ver mis citas"\n\n🐾 **MASCOTAS:**\n• "Ver mis mascotas"\n• "Agregar mascota"\n\n💰 **INFORMACIÓN:**\n• "Precios de servicios"\n• "Costos"\n\n🚨 **EMERGENCIAS:**\n• "Ayuda de emergencia"\n\n**¿Puedes reformular o elegir una opción?**`,
      
      provider: `🤔 **${name}, no entendí completamente.**\n\n**Como proveedor, puedo ayudarte con:**\n\n📅 **AGENDA:**\n• "Citas de hoy"\n• "Próximas citas"\n\n📊 **ESTADÍSTICAS:**\n• "Ver estadísticas"\n• "Mis ingresos"\n\n👥 **CLIENTES:**\n• "Clientes recientes"\n• "Historial"\n\n⚙️ **CONFIGURACIÓN:**\n• "Mis servicios"\n• "Actualizar perfil"\n\n**¿Qué necesitas específicamente?**`,
      
      admin: `🤔 **${name}, no estoy seguro de qué necesitas.**\n\n**Como administrador, puedo ayudarte con:**\n\n🏢 **COMERCIOS:**\n• "Comercios pendientes"\n• "Aprobar comercios"\n\n👥 **USUARIOS:**\n• "Usuarios registrados"\n• "Estadísticas"\n\n📊 **SISTEMA:**\n• "Reportes del sistema"\n• "Panel de control"\n\n🛡️ **SEGURIDAD:**\n• "Logs del sistema"\n• "Monitoreo"\n\n**¿Qué área necesitas gestionar?**`
    };
    
    return fallbackResponses[role] || fallbackResponses.client;
  }
}

// ============================================
// 🚀 ENDPOINT PRINCIPAL
// ============================================

router.post("/", protect, async (req, res) => {
  console.log(`\n💬 ======= NUEVO MENSAJE CHAT =======`);
  
  try {
    const { message } = req.body;
    const user = req.user;
    const { role, name, _id: userId } = user;

    if (!message || !message.trim()) {
      return res.json({
        success: false,
        reply: "Por favor, escribe un mensaje.",
        type: "error"
      });
    }

    const text = message.trim();
    const intent = detectIntent(text, role);
    
    console.log(`👤 Usuario: ${name} (${role})`);
    console.log(`💭 Mensaje: "${text.substring(0, 60)}${text.length > 60 ? '...' : ''}"`);
    console.log(`🎯 Intención: ${intent}`);

    // Respuestas rápidas predefinidas
    const quickResponses = {
      greeting: `¡Hola ${name}! 👋 Soy PetBot, tu asistente inteligente de PetServices.`,
      thanks: `¡De nada ${name}! 😊 Es un placer ayudarte.`,
      goodbye: `¡Hasta luego ${name}! Que tengas un excelente día. 🐾`,
      help: `¡Claro ${name}! Te ayudo con:\n• Comercios y servicios\n• Citas y mascotas\n• Precios y emergencias\n\n¿Qué necesitas?`,
      about: `🤖 **Soy PetBot**, el asistente virtual inteligente de PetServices.`
    };

    if (quickResponses[intent]) {
      console.log(`📤 Enviando respuesta rápida`);
      return res.json({
        success: true,
        reply: quickResponses[intent],
        type: "text",
        intent,
        source: "local"
      });
    }

    // Obtener datos del usuario para contexto
    let userData = null;
    try {
      userData = await DataManager.getUserProfile(userId);
    } catch (error) {
      console.error(`⚠️ Error obteniendo datos:`, error.message);
    }

    // Generar respuesta usando el sistema híbrido
    const reply = await ResponseGenerator.generateResponse(intent, user, userData, text);
    
    console.log(`✅ Respuesta generada (${reply.length} caracteres)`);
    
    return res.json({
      success: true,
      reply: reply,
      type: "text",
      intent,
      source: intent === "gemini_analysis" ? "gemini" : "hybrid"
    });

  } catch (error) {
    console.error("❌ Error crítico en chat:", error);
    
    return res.json({
      success: false,
      reply: `😔 **Ocurrió un error.** Por favor, intenta nuevamente. Error: ${error.message}`,
      type: "error"
    });
  } finally {
    console.log(`💬 ======= FIN MENSAJE =======\n`);
  }
});

// ============================================
// 🔍 ENDPOINT DE PRUEBA GEMINI
// ============================================

router.post("/test-gemini", protect, async (req, res) => {
  try {
    const { message } = req.body;
    
    console.log(`🧪 Probando conexión con Gemini...`);
    
    // Prueba simple
    const testResponse = await GeminiClient.generateText(
      "Hola, responde con 'Gemini está funcionando correctamente' y tu versión de modelo.",
      "Eres un asistente de prueba."
    );

    if (testResponse) {
      return res.json({
        success: true,
        message: "✅ Gemini está conectado correctamente",
        response: testResponse,
        apiKey: GEMINI_API_KEY ? "✅ Presente" : "❌ Falta",
        model: GEMINI_MODEL,
        timestamp: new Date().toISOString()
      });
    } else {
      return res.json({
        success: false,
        error: "No se pudo obtener respuesta de Gemini",
        apiKey: GEMINI_API_KEY ? "✅ Presente" : "❌ Falta",
        model: GEMINI_MODEL
      });
    }
  } catch (error) {
    res.json({
      success: false,
      error: error.message,
      details: "Verifica que la API key sea válida y tengas acceso a internet",
      apiKey: GEMINI_API_KEY ? "✅ Presente" : "❌ Falta"
    });
  }
});

// ============================================
// 📊 ENDPOINTS ADICIONALES
// ============================================

// Health check mejorado
router.get("/health", protect, (req, res) => {
  res.json({
    status: "healthy",
    service: "PetBot Chat API con Gemini",
    version: "2.0",
    timestamp: new Date().toISOString(),
    user: {
      role: req.user.role,
      name: req.user.name,
      id: req.user._id
    },
    gemini: {
      apiKey: GEMINI_API_KEY ? "✅ Configurada" : "❌ Faltante",
      model: GEMINI_MODEL,
      url: GEMINI_API_URL,
      status: "active"
    },
    models: {
      User: "✅",
      Pet: "✅",
      Business: "✅",
      Appointment: "✅"
    },
    features: ["gemini_ai", "data_integration", "role_based_responses", "hybrid_system"]
  });
});

// Dashboard con info de Gemini
router.get("/dashboard", protect, async (req, res) => {
  try {
    const { _id: userId, role, name } = req.user;
    const userData = await DataManager.getUserProfile(userId);
    
    const dashboardData = {
      client: {
        summary: {
          pets: userData?.stats?.totalPets || 0,
          appointments: userData?.stats?.totalAppointments || 0,
          upcoming: userData?.stats?.upcomingAppointments || 0,
          favorites: userData?.stats?.favoriteCount || 0
        }
      },
      provider: {
        summary: {
          totalAppointments: userData?.stats?.totalAppointments || 0,
          todayAppointments: userData?.stats?.todayAppointments || 0,
          revenue: userData?.stats?.totalRevenue || 0,
          rating: userData?.stats?.rating || 0
        }
      },
      admin: {
        summary: {
          users: userData?.stats?.totalUsers || 0,
          businesses: userData?.stats?.totalBusinesses || 0,
          pending: userData?.stats?.pendingBusinesses || 0,
          appointments: userData?.stats?.totalAppointments || 0
        }
      }
    };
    
    res.json({
      success: true,
      user: { name, role, email: req.user.email },
      dashboard: dashboardData[role] || dashboardData.client,
      chat: {
        aiAvailable: true,
        model: GEMINI_MODEL,
        apiKeyConfigured: !!GEMINI_API_KEY,
        features: ["gemini_ai", "data_integration", "role_based_responses"],
        intents: ["greeting", "gemini_analysis", "help", "prices", "emergency"]
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test de conexión a modelos
router.get("/test/models", protect, async (req, res) => {
  try {
    const modelTests = {
      User: await User.countDocuments(),
      Pet: await Pet.countDocuments(),
      Business: await Business.countDocuments(),
      Appointment: await Appointment.countDocuments()
    };
    
    res.json({
      success: true,
      message: "Test de modelos completado",
      results: modelTests,
      allWorking: Object.values(modelTests).every(result => result !== undefined)
    });
  } catch (error) {
    res.json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

// Obtener datos específicos del usuario
router.get("/my-data", protect, async (req, res) => {
  try {
    const { _id: userId } = req.user;
    const userData = await DataManager.getUserProfile(userId);
    
    res.json({
      success: true,
      data: userData
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;