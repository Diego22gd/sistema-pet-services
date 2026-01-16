// server/routes/chatbotRoutes.js
import express from 'express';
import chatbotController from '../controllers/chatbotController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Middleware específico para chatbot
const chatbotMiddleware = (req, res, next) => {
  console.log(`🤖 Chatbot API Request: ${req.method} ${req.path}`);
  console.log(`   User ID: ${req.user?.id}, Role: ${req.user?.role}`);
  next();
};

// ===================== RUTAS PÚBLICAS DEL CHATBOT =====================

// Procesar mensaje del chatbot (requiere autenticación)
router.post('/chat', 
  protect, 
  chatbotMiddleware,
  chatbotController.processMessage
);

// Obtener sugerencias de preguntas frecuentes
router.get('/suggestions', 
  protect, 
  chatbotMiddleware,
  chatbotController.getSuggestions
);

// Limpiar sesión de chat
router.post('/clear-session', 
  protect, 
  chatbotMiddleware,
  chatbotController.clearSession
);

// ===================== RUTAS PARA ADMINISTRADORES =====================

// Obtener estadísticas del chatbot (solo administradores)
router.get('/stats', 
  protect, 
  authorizeRoles('admin'),
  chatbotController.getChatbotStats
);

// Obtener todas las sesiones activas (solo administradores)
router.get('/sessions', 
  protect, 
  authorizeRoles('admin'),
  (req, res) => {
    try {
      const sessions = Array.from(chatbotController.chatSessions.values())
        .map(session => ({
          id: session.id,
          userId: session.userId,
          userRole: session.userRole,
          messageCount: session.messageCount,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt,
          lastMessage: session.lastMessage?.substring(0, 50) + '...',
          queryType: session.queryType
        }))
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

      res.json({
        success: true,
        total: sessions.length,
        sessions,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error obteniendo sesiones:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener sesiones'
      });
    }
  }
);

// Limpiar sesiones antiguas (solo administradores)
router.post('/cleanup', 
  protect, 
  authorizeRoles('admin'),
  (req, res) => {
    try {
      const beforeCount = chatbotController.chatSessions.size;
      chatbotController.cleanOldSessions();
      const afterCount = chatbotController.chatSessions.size;
      const cleanedCount = beforeCount - afterCount;

      res.json({
        success: true,
        message: `Limpieza completada. Sesiones eliminadas: ${cleanedCount}`,
        stats: {
          before: beforeCount,
          after: afterCount,
          cleaned: cleanedCount
        }
      });
    } catch (error) {
      console.error('Error en limpieza de sesiones:', error);
      res.status(500).json({
        success: false,
        error: 'Error al limpiar sesiones'
      });
    }
  }
);

// ===================== RUTAS DE SALUD Y MONITOREO =====================

// Health check del chatbot
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'petbot-chatbot',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    features: {
      sessions: chatbotController.chatSessions.size,
      memory: process.memoryUsage()
    }
  });
});

// Información de la API del chatbot
router.get('/info', (req, res) => {
  res.json({
    name: 'PetBot Chatbot API',
    description: 'API de inteligencia artificial para el asistente virtual PetBot',
    version: '1.0.0',
    endpoints: {
      chat: 'POST /api/chatbot/chat - Procesar mensaje del usuario',
      suggestions: 'GET /api/chatbot/suggestions - Obtener sugerencias',
      stats: 'GET /api/chatbot/stats - Estadísticas (admin)',
      sessions: 'GET /api/chatbot/sessions - Sesiones activas (admin)',
      health: 'GET /api/chatbot/health - Estado del servicio'
    },
    capabilities: [
      'Procesamiento de lenguaje natural',
      'Acceso a base de datos según rol',
      'Gestión de sesiones de chat',
      'Respuestas contextuales personalizadas'
    ]
  });
});

// ===================== RUTAS DE PRUEBA Y DESARROLLO =====================

// Ruta de prueba para verificar integración
router.get('/test', protect, (req, res) => {
  res.json({
    success: true,
    message: 'ChatBot API funcionando correctamente',
    user: {
      id: req.user.id,
      role: req.user.role,
      name: req.user.name
    },
    timestamp: new Date().toISOString(),
    sessionCount: chatbotController.chatSessions.size
  });
});

// Ruta para probar análisis de consultas (solo desarrollo)
if (process.env.NODE_ENV === 'development') {
  router.post('/test-analyze', protect, async (req, res) => {
    try {
      const { message } = req.body;
      const userRole = req.user.role;
      
      if (!message) {
        return res.status(400).json({ error: 'El mensaje es requerido' });
      }

      const queryType = chatbotController.analyzeQuery(message, userRole);
      const suggestions = chatbotController.generateSuggestions(queryType, userRole);

      res.json({
        message,
        userRole,
        detectedQueryType: queryType,
        suggestions,
        analysis: {
          length: message.length,
          words: message.split(/\s+/).length,
          hasQuestion: /[¿?]/.test(message)
        }
      });
    } catch (error) {
      console.error('Error en análisis de prueba:', error);
      res.status(500).json({ error: 'Error en análisis' });
    }
  });
}

// ===================== MANEJO DE ERRORES =====================

// Ruta no encontrada
router.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    message: `La ruta ${req.method} ${req.path} no existe en el chatbot API`,
    availableRoutes: [
      'POST /api/chatbot/chat',
      'GET /api/chatbot/suggestions',
      'POST /api/chatbot/clear-session',
      'GET /api/chatbot/health',
      'GET /api/chatbot/info'
    ]
  });
});

// Manejo global de errores
router.use((error, req, res, next) => {
  console.error('❌ Error en ruta de chatbot:', error);
  
  res.status(error.status || 500).json({
    error: 'Error interno del servidor en el chatbot',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Por favor, intenta más tarde',
    timestamp: new Date().toISOString()
  });
});

export default router;