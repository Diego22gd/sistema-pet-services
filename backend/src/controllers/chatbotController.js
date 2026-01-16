// server/controllers/chatbotController.js (VERSIÓN CORREGIDA)
import Business from '../models/Business.js';
import Appointment from '../models/Appointment.js';
import User from '../models/User.js';
import Pet from '../models/Pet.js';
import mongoose from 'mongoose';

class ChatbotController {
  // Almacenamiento de sesiones de chat
  chatSessions = new Map();

  // Procesar mensaje del chatbot
  async processMessage(req, res) {
    try {
      console.log("🔍 Headers recibidos:", req.headers);
      console.log("🔍 User en request:", req.user);
      
      const { message, sessionId } = req.body;
      
      // Verificar que req.user existe
      if (!req.user || !req.user._id) {
        console.error("❌ ERROR: req.user no está definido");
        return res.status(401).json({ 
          error: 'Usuario no autenticado',
          reply: 'Por favor, inicia sesión para usar el chatbot.'
        });
      }
      
      const userId = req.user._id.toString();
      const userRole = req.user.role || 'client';

      if (!message || !message.trim()) {
        return res.status(400).json({ 
          error: 'El mensaje es requerido',
          reply: 'Por favor, escribe un mensaje para que pueda ayudarte.'
        });
      }

      console.log(`🤖 Chatbot request - User: ${userId}, Role: ${userRole}, Message: "${message}"`);

      // Obtener o crear sesión de chat
      const session = this.getOrCreateSession(userId, sessionId);
      
      // Obtener datos del usuario
      const user = await User.findById(userId).select('name email role pets favoriteBusinesses');
      
      if (!user) {
        return res.status(404).json({
          error: 'Usuario no encontrado',
          reply: 'No se pudo encontrar tu información. Por favor, inicia sesión nuevamente.'
        });
      }

      // Determinar el tipo de consulta
      const queryType = this.analyzeQuery(message, userRole);
      console.log(`🔍 Tipo de consulta detectado: ${queryType}`);
      
      // Obtener datos relevantes según el tipo de consulta
      const contextData = await this.getRelevantData(queryType, userId, userRole);
      
      // Generar respuesta basada en reglas
      const reply = this.generateRuleBasedResponse(queryType, contextData, user, userRole);
      
      // Generar sugerencias
      const suggestions = this.generateSuggestions(queryType, userRole);

      // Actualizar sesión
      this.updateSession(session, {
        userId,
        userRole,
        lastMessage: message,
        lastResponse: reply,
        queryType,
        timestamp: new Date(),
        messageCount: session.messageCount + 1
      });

      res.json({ 
        reply,
        queryType,
        sessionId: session.id,
        suggestions,
        timestamp: new Date().toISOString(),
        userRole
      });

    } catch (error) {
      console.error('❌ Error en chatbot:', error);
      console.error('Stack trace:', error.stack);
      
      // Respuesta de error amigable
      let errorReply = '❌ **Lo siento, ha ocurrido un error**\n\n';
      errorReply += 'No pude procesar tu mensaje en este momento. ';
      errorReply += 'Por favor, intenta nuevamente en unos momentos.\n\n';
      errorReply += 'Si el problema persiste, contacta a soporte técnico.';
      
      res.status(500).json({ 
        error: error.message || 'Error al procesar el mensaje',
        reply: errorReply
      });
    }
  }

  // Manejo de sesiones de chat
  getOrCreateSession(userId, sessionId = null) {
    console.log(`🔍 getOrCreateSession - userId: ${userId}, sessionId: ${sessionId}`);
    
    if (sessionId && this.chatSessions.has(sessionId)) {
      const session = this.chatSessions.get(sessionId);
      console.log(`📂 Sesión encontrada: ${sessionId}`);
      return session;
    }

    const newSession = {
      id: sessionId || `session_${userId}_${Date.now()}`,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      messageCount: 0,
      conversationHistory: [],
      context: {}
    };

    console.log(`🆕 Nueva sesión creada: ${newSession.id}`);
    this.chatSessions.set(newSession.id, newSession);
    
    // Limpiar sesiones antiguas (más de 24 horas)
    this.cleanOldSessions();
    
    return newSession;
  }

  updateSession(session, updates) {
    Object.assign(session, updates);
    session.updatedAt = new Date();
    
    // Agregar al historial
    session.conversationHistory.push({
      role: 'user',
      content: updates.lastMessage,
      timestamp: new Date()
    });
    
    if (updates.lastResponse) {
      session.conversationHistory.push({
        role: 'assistant',
        content: updates.lastResponse,
        timestamp: new Date()
      });
    }
    
    // Limitar historial a 50 mensajes
    if (session.conversationHistory.length > 50) {
      session.conversationHistory = session.conversationHistory.slice(-50);
    }
    
    this.chatSessions.set(session.id, session);
  }

  cleanOldSessions() {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    let cleanedCount = 0;
    
    for (const [sessionId, session] of this.chatSessions.entries()) {
      if (session.updatedAt < twentyFourHoursAgo) {
        this.chatSessions.delete(sessionId);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      console.log(`🧹 Sesiones limpiadas: ${cleanedCount}`);
    }
  }

  // Analizar el tipo de consulta
  analyzeQuery(message, userRole) {
    const messageLower = message.toLowerCase().trim();
    
    // Diccionario de palabras clave
    const keywordMap = {
      client: {
        appointments: ['cita', 'citas', 'reserva', 'agendar', 'programar', 'cancelar', 'confirmar', 'próxima', 'pendiente', 'historial'],
        pets: ['mascota', 'mascotas', 'perro', 'gato', 'animal', 'registrar', 'agregar', 'salud', 'vacuna'],
        businesses: ['comercio', 'comercios', 'veterinaria', 'peluquería', 'tienda', 'guardería', 'buscar', 'encontrar', 'servicio'],
        help: ['ayuda', 'cómo', 'qué', 'dónde', 'cuándo', 'funciona', 'tutorial'],
        emergency: ['emergencia', 'urgencia', 'accidente', 'enfermo', 'herido', 'vómito', 'sangra'],
        general: ['hola', 'buenos días', 'gracias', 'adiós']
      },
      provider: {
        business: ['comercio', 'negocio', 'perfil', 'actualizar', 'información', 'datos', 'contacto'],
        appointments: ['cita', 'citas', 'agenda', 'pendiente', 'confirmada', 'hoy', 'mañana', 'cliente'],
        statistics: ['estadística', 'ingreso', 'ganancia', 'cliente', 'reporte', 'métrica'],
        services: ['servicio', 'precio', 'tarifa', 'agregar', 'eliminar', 'actualizar']
      },
      admin: {
        users: ['usuario', 'usuarios', 'cliente', 'proveedor', 'registro', 'activar', 'desactivar'],
        businesses: ['comercio', 'solicitud', 'pendiente', 'aprobación', 'aprobar', 'rechazar'],
        system: ['sistema', 'estadística', 'global', 'métrica', 'actividad', 'monitoreo'],
        support: ['soporte', 'problema', 'queja', 'reclamo', 'ayuda']
      }
    };

    const roleKeywords = keywordMap[userRole] || keywordMap.client;
    
    // Calcular puntuación para cada tipo
    const scores = {};
    
    for (const [queryType, keywords] of Object.entries(roleKeywords)) {
      scores[queryType] = 0;
      
      for (const keyword of keywords) {
        if (messageLower.includes(keyword)) {
          scores[queryType] += 1;
        }
      }
    }
    
    // Encontrar el tipo con mayor puntuación
    let maxScore = 0;
    let detectedType = 'general';
    
    for (const [queryType, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        detectedType = queryType;
      }
    }
    
    return detectedType;
  }

  // Obtener datos relevantes
  async getRelevantData(queryType, userId, userRole) {
    const data = {
      queryType,
      userRole,
      timestamp: new Date().toISOString()
    };

    try {
      switch (userRole) {
        case 'client':
          Object.assign(data, await this.getClientData(queryType, userId));
          break;
        
        case 'provider':
          Object.assign(data, await this.getProviderData(queryType, userId));
          break;
        
        case 'admin':
          Object.assign(data, await this.getAdminData(queryType));
          break;
      }
    } catch (error) {
      console.error(`Error obteniendo datos para ${queryType}:`, error);
      data.error = error.message;
    }

    return data;
  }

  // Datos para clientes
  async getClientData(queryType, userId) {
    const data = {};
    
    try {
      const objectId = new mongoose.Types.ObjectId(userId);
      
      switch (queryType) {
        case 'appointments':
          const appointments = await Appointment.find({ 
            userId: objectId,
            status: { $nin: ['cancelada', 'completada'] }
          })
          .populate('petId', 'name type')
          .populate('businessId', 'name address')
          .sort({ date: 1, time: 1 })
          .limit(5);
          
          data.appointments = appointments;
          console.log(`📅 Citas encontradas: ${appointments.length}`);
          break;

        case 'pets':
          const pets = await Pet.find({ owner: objectId });
          data.pets = pets;
          console.log(`🐾 Mascotas encontradas: ${pets.length}`);
          break;

        case 'businesses':
          const businesses = await Business.find({ 
            approved: true, 
            status: 'active',
            isDeleted: { $ne: true }
          })
          .select('name category description address phone rating')
          .sort({ rating: -1 })
          .limit(6);
          
          data.businesses = businesses;
          console.log(`🏪 Comercios encontrados: ${businesses.length}`);
          break;
      }
    } catch (error) {
      console.error('Error en getClientData:', error);
      data.error = error.message;
    }

    return data;
  }

  // Datos para proveedores
  async getProviderData(queryType, userId) {
    const data = {};
    
    try {
      const objectId = new mongoose.Types.ObjectId(userId);
      const business = await Business.findOne({ provider: objectId });
      data.business = business;

      if (!business) {
        data.hasBusiness = false;
        return data;
      }

      data.hasBusiness = true;
      const businessId = business._id;

      switch (queryType) {
        case 'appointments':
          const today = new Date().toISOString().split('T')[0];
          
          const todayAppointments = await Appointment.find({
            businessId: businessId,
            date: today,
            status: { $in: ['pendiente', 'confirmada'] }
          })
          .populate('userId', 'name')
          .populate('petId', 'name')
          .sort({ time: 1 });

          data.todayAppointments = todayAppointments;
          console.log(`📅 Citas de hoy: ${todayAppointments.length}`);
          break;
      }
    } catch (error) {
      console.error('Error en getProviderData:', error);
      data.error = error.message;
    }

    return data;
  }

  // Datos para administradores
  async getAdminData(queryType) {
    const data = {};
    
    try {
      switch (queryType) {
        case 'users':
          const users = await User.find().select('name email role createdAt').limit(10);
          data.users = users;
          console.log(`👥 Usuarios encontrados: ${users.length}`);
          break;
          
        case 'businesses':
          const pendingBusinesses = await Business.find({
            approved: false,
            status: 'pending'
          }).limit(5);
          data.pendingBusinesses = pendingBusinesses;
          console.log(`🏪 Comercios pendientes: ${pendingBusinesses.length}`);
          break;
      }
    } catch (error) {
      console.error('Error en getAdminData:', error);
      data.error = error.message;
    }

    return data;
  }

  // Generar respuesta basada en reglas
  generateRuleBasedResponse(queryType, contextData, user, userRole) {
    const today = new Date().toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    let response = '';

    // Respuestas según rol y tipo de consulta
    switch (userRole) {
      case 'client':
        response = this.getClientResponse(queryType, contextData, user);
        break;
      
      case 'provider':
        response = this.getProviderResponse(queryType, contextData);
        break;
      
      case 'admin':
        response = this.getAdminResponse(queryType, contextData);
        break;
      
      default:
        response = this.getGeneralResponse(queryType, contextData);
    }

    // Si no hay respuesta específica, dar respuesta general
    if (!response) {
      response = this.getGeneralResponse(queryType, contextData);
    }

    return response;
  }

  // Respuestas para clientes
  getClientResponse(queryType, contextData, user) {
    let response = '';

    switch (queryType) {
      case 'appointments':
        if (contextData.appointments?.length > 0) {
          response = `📅 **Tus próximas citas:**\n\n`;
          
          contextData.appointments.forEach((app, index) => {
            response += `${index + 1}. **${app.date} ${app.time}** - ${app.serviceName}\n`;
            response += `   🏪 ${app.businessId?.name || app.businessName}\n`;
            if (app.petId?.name) response += `   🐾 ${app.petId.name}\n`;
            response += `   📍 Estado: ${app.status}\n\n`;
          });
          
          response += `💡 **¿Necesitas ayuda para:**\n`;
          response += `• Cancelar o reprogramar una cita\n`;
          response += `• Confirmar una cita pendiente\n`;
          response += `• Agendar una nueva cita\n`;
        } else {
          response = `📅 **No tienes citas programadas actualmente.**\n\n`;
          response += `Puedes agendar una nueva cita usando el buscador de comercios.\n\n`;
          response += `💡 **Tip:** Busca por tipo de servicio (veterinaria, peluquería, etc.) o ubicación.`;
        }
        break;

      case 'pets':
        if (contextData.pets?.length > 0) {
          response = `🐾 **Tus mascotas registradas:**\n\n`;
          
          contextData.pets.forEach((pet, index) => {
            response += `${index + 1}. **${pet.name}**\n`;
            response += `   🐕 Tipo: ${pet.type}\n`;
            if (pet.age) response += `   📅 Edad: ${pet.age} años\n`;
            response += `\n`;
          });
          
          response += `💡 **Puedes:**\n`;
          response += `• Agregar una nueva mascota\n`;
          response += `• Actualizar información\n`;
          response += `• Ver historial médico\n`;
        } else {
          response = `🐾 **Aún no tienes mascotas registradas.**\n\n`;
          response += `Registra tus mascotas para recibir recomendaciones personalizadas y mantener un historial completo.\n\n`;
          response += `**Para registrar:** Ve a "Mis Mascotas" en tu perfil.`;
        }
        break;

      case 'businesses':
        if (contextData.businesses?.length > 0) {
          response = `🏪 **Comercios recomendados:**\n\n`;
          
          contextData.businesses.forEach((biz, index) => {
            response += `${index + 1}. **${biz.name}**\n`;
            response += `   📍 ${biz.category}\n`;
            if (biz.rating > 0) response += `   ⭐ ${biz.rating}/5\n`;
            response += `   📞 ${biz.phone}\n`;
            response += `   🏠 ${biz.address.substring(0, 50)}...\n\n`;
          });
          
          response += `💡 **Para buscar:**\n`;
          response += `• Usa el buscador con filtros\n`;
          response += `• Filtra por categoría\n`;
          response += `• Ordena por calificación\n`;
        } else {
          response = `🏪 **Buscando comercios...**\n\n`;
          response += `Usa el buscador para encontrar servicios para tu mascota.\n\n`;
          response += `**Categorías disponibles:**\n`;
          response += `• Veterinarias\n• Peluquerías\n• Tiendas\n• Guarderías\n• Entrenamiento`;
        }
        break;

      case 'emergency':
        response = `🚨 **EMERGENCIA VETERINARIA**\n\n`;
        response += `**Si tu mascota necesita atención urgente:**\n\n`;
        response += `1. **Mantén la calma**\n`;
        response += `2. **Contacta inmediatamente** a una clínica de emergencias\n`;
        response += `3. **Describe los síntomas** claramente\n`;
        response += `4. **Sigue las instrucciones** del veterinario\n\n`;
        response += `🔍 **Busca "Veterinarias" en el buscador** para opciones cercanas.\n\n`;
        response += `⚠️ **Esta información es orientativa. En emergencia real, contacta a un profesional.**`;
        break;

      case 'help':
        response = `💡 **¿Cómo puedo ayudarte?**\n\n`;
        response += `Puedo asistirte con:\n\n`;
        response += `📅 **Citas:** Agenda, consulta, cancela\n`;
        response += `🐾 **Mascotas:** Registro, información\n`;
        response += `🏪 **Comercios:** Búsqueda, recomendaciones\n`;
        response += `💰 **Servicios:** Precios, disponibilidad\n`;
        response += `🏥 **Emergencias:** Primeros auxilios\n\n`;
        response += `**¿En qué necesitas ayuda específicamente?**`;
        break;

      default:
        response = `👋 **¡Hola${user?.name ? ' ' + user.name : ''}!** Soy PetBot, tu asistente para servicios de mascotas\n\n`;
        response += `Puedo ayudarte con:\n\n`;
        response += `📅 **Gestión de citas**\n`;
        response += `🐾 **Información de mascotas**\n`;
        response += `🏪 **Búsqueda de comercios**\n`;
        response += `💰 **Consultas de servicios**\n`;
        response += `🏥 **Orientación en emergencias**\n\n`;
        response += `**¿En qué puedo ayudarte hoy?**`;
    }

    return response;
  }

  // Respuestas para proveedores
  getProviderResponse(queryType, contextData) {
    let response = '';

    if (!contextData.hasBusiness) {
      response = `🏢 **Aún no tienes un comercio registrado.**\n\n`;
      response += `Para gestionar un comercio en nuestra plataforma:\n\n`;
      response += `1. Ve a "Mi Comercio" en tu panel\n`;
      response += `2. Completa el formulario de registro\n`;
      response += `3. Espera la aprobación del administrador\n`;
      response += `4. Comienza a recibir citas\n\n`;
      response += `**Beneficios:**\n`;
      response += `• Mayor visibilidad\n• Gestión de agenda\n• Estadísticas detalladas\n• Sistema de reseñas`;
      return response;
    }

    switch (queryType) {
      case 'appointments':
        if (contextData.todayAppointments?.length > 0) {
          response = `📅 **Citas de hoy (${new Date().toLocaleDateString('es-ES')}):**\n\n`;
          
          contextData.todayAppointments.forEach((app, index) => {
            response += `${index + 1}. **${app.time}** - ${app.serviceName}\n`;
            response += `   👤 ${app.userId?.name || 'Cliente'}\n`;
            response += `   🐾 ${app.petId?.name || 'Mascota'}\n`;
            response += `   📍 Estado: ${app.status}\n\n`;
          });
          
          response += `💡 **Acciones disponibles:**\n`;
          response += `• Confirmar citas pendientes\n`;
          response += `• Contactar clientes\n`;
          response += `• Ver agenda completa\n`;
        } else {
          response = `📅 **No tienes citas programadas para hoy.**\n\n`;
          response += `**Sugerencias:**\n`;
          response += `• Revisa tu disponibilidad\n`;
          response += `• Actualiza tus horarios\n`;
          response += `• Promociona tus servicios\n`;
        }
        break;

      case 'business':
        response = `🏢 **Información de tu comercio:**\n\n`;
        response += `**Nombre:** ${contextData.business?.name}\n`;
        response += `**Estado:** ${contextData.business?.status}\n`;
        response += `**Aprobado:** ${contextData.business?.approved ? '✅ Sí' : '⏳ Pendiente'}\n`;
        response += `**Dirección:** ${contextData.business?.address}\n`;
        response += `**Teléfono:** ${contextData.business?.phone}\n\n`;
        response += `💡 **Para actualizar:** Ve a "Mi Comercio" en tu panel.`;
        break;

      case 'statistics':
        response = `📊 **Estadísticas de tu negocio:**\n\n`;
        response += `Próximamente podrás ver:\n\n`;
        response += `• Ingresos totales y mensuales\n`;
        response += `• Número de citas por estado\n`;
        response += `• Clientes recurrentes\n`;
        response += `• Calificaciones y reseñas\n`;
        response += `• Visitas a tu perfil\n\n`;
        response += `🔧 **Esta función estará disponible pronto.**`;
        break;

      default:
        response = `👨‍💼 **Asistente para Proveedores**\n\n`;
        response += `Hola, puedo ayudarte con:\n\n`;
        response += `🏢 **Gestión de comercio**\n`;
        response += `📅 **Administración de citas**\n`;
        response += `📊 **Estadísticas de negocio**\n`;
        response += `💰 **Análisis de ingresos**\n`;
        response += `⭐ **Gestión de reputación**\n\n`;
        response += `**¿Qué área de tu negocio necesitas gestionar?**`;
    }

    return response;
  }

  // Respuestas para administradores
  getAdminResponse(queryType, contextData) {
    let response = '';

    switch (queryType) {
      case 'users':
        if (contextData.users?.length > 0) {
          response = `👥 **Usuarios registrados (últimos 10):**\n\n`;
          
          contextData.users.forEach((user, index) => {
            response += `${index + 1}. **${user.name}**\n`;
            response += `   📧 ${user.email}\n`;
            response += `   🏷️ ${user.role}\n`;
            response += `   📅 ${new Date(user.createdAt).toLocaleDateString('es-ES')}\n\n`;
          });
          
          response += `💡 **Acciones disponibles:**\n`;
          response += `• Ver todos los usuarios\n`;
          response += `• Filtrar por rol\n`;
          response += `• Activar/desactivar cuentas\n`;
          response += `• Ver actividad reciente\n`;
        } else {
          response = `👥 **Gestión de usuarios**\n\n`;
          response += `Como administrador, puedes:\n\n`;
          response += `• Ver todos los usuarios registrados\n`;
          response += `• Gestionar roles (cliente, proveedor, admin)\n`;
          response += `• Activar o desactivar cuentas\n`;
          response += `• Ver actividad de usuarios\n`;
          response += `• Contactar directamente con usuarios\n`;
        }
        break;

      case 'businesses':
        if (contextData.pendingBusinesses?.length > 0) {
          response = `🏪 **Comercios pendientes de aprobación:**\n\n`;
          
          contextData.pendingBusinesses.forEach((biz, index) => {
            response += `${index + 1}. **${biz.name}**\n`;
            response += `   📍 ${biz.category || 'Sin categoría'}\n`;
            response += `   📅 ${new Date(biz.createdAt).toLocaleDateString('es-ES')}\n\n`;
          });
          
          response += `💡 **Para gestionar:**\n`;
          response += `• Ve al panel de administración\n`;
          response += `• Revisa la información del comercio\n`;
          response += `• Aprueba o rechaza la solicitud\n`;
          response += `• Notifica al proveedor\n`;
        } else {
          response = `🏪 **Gestión de comercios**\n\n`;
          response += `Como administrador, puedes:\n\n`;
          response += `• Revisar nuevas solicitudes\n`;
          response += `• Aprobar o rechazar comercios\n`;
          response += `• Ver comercios activos/inactivos\n`;
          response += `• Gestionar categorías\n`;
          response += `• Resolver problemas reportados\n`;
        }
        break;

      default:
        response = `👨‍💼 **Asistente Administrativo**\n\n`;
        response += `Hola, puedo ayudarte con:\n\n`;
        response += `👥 **Gestión de usuarios**\n`;
        response += `🏪 **Aprobación de comercios**\n`;
        response += `📊 **Estadísticas del sistema**\n`;
        response += `⚙️ **Configuración de plataforma**\n`;
        response += `🛡️ **Monitoreo de seguridad**\n\n`;
        response += `**¿Qué funcionalidad administrativa necesitas?**`;
    }

    return response;
  }

  // Respuesta general
  getGeneralResponse(queryType, contextData) {
    return `🤖 **PetBot - Asistente Virtual**\n\n`;
  }

  // Generar sugerencias
  generateSuggestions(queryType, userRole) {
    const suggestionsMap = {
      client: {
        appointments: [
          '¿Cómo cancelo una cita?',
          '¿Qué documentos necesito para una cita?',
          '¿Puedo reprogramar una cita?',
          '¿Cómo veo mi historial de citas?'
        ],
        pets: [
          '¿Cómo agrego una nueva mascota?',
          '¿Qué vacunas son obligatorias?',
          '¿Cómo actualizo la información de mi mascota?',
          '¿Dónde encuentro comida para mi mascota?'
        ],
        businesses: [
          '¿Cómo filtro por ubicación?',
          '¿Qué comercios están abiertos ahora?',
          '¿Cómo veo las calificaciones?',
          '¿Puedo guardar comercios favoritos?'
        ],
        emergency: [
          '¿Qué hacer en caso de envenenamiento?',
          '¿Cómo dar primeros auxilios?',
          '¿Dónde están las clínicas 24 horas?',
          '¿Qué información llevar a emergencias?'
        ],
        help: [
          '¿Cómo funciona la plataforma?',
          '¿Cuáles son los pasos para agendar?',
          '¿Cómo contacto con soporte?',
          '¿Qué métodos de pago aceptan?'
        ],
        default: [
          '¿Cómo agendo una cita?',
          '¿Dónde encuentro veterinarias?',
          '¿Cómo registro mi mascota?',
          '¿Qué servicios están disponibles?'
        ]
      },
      provider: {
        appointments: [
          '¿Cómo confirmo una cita?',
          '¿Cómo contacto a un cliente?',
          '¿Cómo veo mi agenda completa?',
          '¿Cómo cancelo una cita?'
        ],
        business: [
          '¿Cómo actualizo mi información?',
          '¿Cómo agrego nuevos servicios?',
          '¿Cómo cambio mis horarios?',
          '¿Cómo subo fotos de mi comercio?'
        ],
        statistics: [
          '¿Cómo veo mis ingresos mensuales?',
          '¿Dónde veo las reseñas de clientes?',
          '¿Cómo mejoro mi calificación?',
          '¿Cómo aumento mi visibilidad?'
        ],
        default: [
          '¿Cómo promociono mi comercio?',
          '¿Cómo gestiono mis servicios?',
          '¿Cómo contacto con soporte?',
          '¿Cómo veo mis estadísticas?'
        ]
      },
      admin: {
        users: [
          '¿Cómo activo/desactivo un usuario?',
          '¿Dónde veo la actividad reciente?',
          '¿Cómo contacto a un usuario?',
          '¿Cómo veo el historial de un usuario?'
        ],
        businesses: [
          '¿Cómo apruebo un comercio?',
          '¿Qué criterios de aprobación debo usar?',
          '¿Cómo contacto a un proveedor?',
          '¿Cómo veo comercios reportados?'
        ],
        system: [
          '¿Dónde veo las estadísticas globales?',
          '¿Cómo monitoreo la actividad?',
          '¿Dónde están los logs del sistema?',
          '¿Cómo genero reportes?'
        ],
        default: [
          '¿Cómo gestiono usuarios?',
          '¿Cómo apruebo comercios?',
          '¿Dónde veo reportes?',
          '¿Cómo contacto con soporte técnico?'
        ]
      }
    };

    const roleMap = suggestionsMap[userRole] || suggestionsMap.client;
    return roleMap[queryType] || roleMap.default;
  }

  // Obtener sugerencias de preguntas frecuentes
  async getSuggestions(req, res) {
    try {
      console.log("🔍 getSuggestions - req.user:", req.user);
      
      if (!req.user || !req.user.role) {
        return res.status(401).json({
          success: false,
          error: 'Usuario no autenticado',
          suggestions: []
        });
      }

      const userRole = req.user.role;
      
      const suggestions = {
        client: [
          "¿Cómo agendo una cita para mi mascota?",
          "¿Dónde encuentro veterinarias cerca de mi ubicación?",
          "¿Cómo registro una nueva mascota en mi perfil?",
          "¿Cuáles son los precios promedio de los servicios?",
          "¿Qué hacer en caso de emergencia veterinaria?",
          "¿Cómo cancelo o reprogramo una cita?",
          "¿Dónde veo mis citas pendientes y confirmadas?",
          "¿Cómo encuentro guarderías o paseadores para mi mascota?"
        ],
        provider: [
          "¿Cómo actualizo la información de mi comercio?",
          "¿Dónde veo mis citas programadas para hoy?",
          "¿Cómo agrego un nuevo servicio a mi catálogo?",
          "¿Dónde consulto mis ingresos y estadísticas?",
          "¿Cómo confirmo o cancelo una cita de cliente?",
          "¿Qué estadísticas puedo ver de mi negocio?",
          "¿Cómo actualizo mis horarios de atención?",
          "¿Dónde veo las reseñas y calificaciones de clientes?"
        ],
        admin: [
          "¿Cuántos usuarios hay registrados en la plataforma?",
          "¿Cuántas solicitudes de comercios están pendientes de aprobación?",
          "¿Cómo apruebo o rechazo un nuevo comercio?",
          "¿Dónde veo las estadísticas globales del sistema?",
          "¿Cómo desactivo la cuenta de un usuario?",
          "¿Dónde consulto el reporte de actividad reciente?",
          "¿Cómo contacto directamente con un proveedor?",
          "¿Dónde veo las quejas o reportes de usuarios?"
        ]
      };

      const userSuggestions = suggestions[userRole] || suggestions.client;
      
      // Mezclar aleatoriamente y tomar 4 sugerencias
      const shuffled = [...userSuggestions].sort(() => 0.5 - Math.random());
      const selectedSuggestions = shuffled.slice(0, 4);

      res.json({
        success: true,
        suggestions: selectedSuggestions,
        role: userRole,
        count: selectedSuggestions.length
      });
      
    } catch (error) {
      console.error('Error obteniendo sugerencias:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error al obtener sugerencias',
        suggestions: []
      });
    }
  }

  // Limpiar sesiones de chat
  async clearSession(req, res) {
    try {
      const { sessionId } = req.body;
      const userId = req.user._id.toString();

      if (sessionId && this.chatSessions.has(sessionId)) {
        const session = this.chatSessions.get(sessionId);
        
        // Verificar que la sesión pertenece al usuario
        if (session.userId !== userId) {
          return res.status(403).json({
            success: false,
            error: 'No tienes permisos para eliminar esta sesión'
          });
        }

        this.chatSessions.delete(sessionId);
      } else {
        // Limpiar todas las sesiones del usuario
        for (const [id, session] of this.chatSessions.entries()) {
          if (session.userId === userId) {
            this.chatSessions.delete(id);
          }
        }
      }

      res.json({
        success: true,
        message: 'Sesión limpiada exitosamente',
        remainingSessions: this.chatSessions.size
      });
      
    } catch (error) {
      console.error('Error limpiando sesión:', error);
      res.status(500).json({
        success: false,
        error: 'Error al limpiar la sesión'
      });
    }
  }

  // Obtener estadísticas del chatbot
  async getChatbotStats(req, res) {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'No autorizado'
        });
      }

      const stats = {
        totalSessions: this.chatSessions.size,
        activeLast24h: 0,
        byRole: {
          client: 0,
          provider: 0,
          admin: 0
        },
        performance: {
          successRate: '100%',
          errorsLast24h: 0
        }
      };

      // Calcular estadísticas de sesiones
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      for (const session of this.chatSessions.values()) {
        if (session.updatedAt > twentyFourHoursAgo) {
          stats.activeLast24h++;
        }
        
        if (session.userRole) {
          stats.byRole[session.userRole] = (stats.byRole[session.userRole] || 0) + 1;
        }
      }

      res.json({
        success: true,
        stats,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener estadísticas'
      });
    }
  }
}

export default new ChatbotController();