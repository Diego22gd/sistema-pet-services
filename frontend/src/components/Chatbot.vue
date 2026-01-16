<template>
  <!-- ChatBot Container -->
  <div class="chatbot-container">
    <!-- Mensaje tipo nube sobre el botón flotante -->
    <transition name="bubble">
      <div 
        v-if="!isOpen && showHelpBubble" 
        class="help-bubble"
        @click="toggleChat"
      >
        <div class="bubble-arrow"></div>
        <div class="bubble-content">
          <span class="bubble-text">¿Necesitas ayuda?</span>
          <span class="bubble-subtext">Pregúntame lo que necesites</span>
        </div>
        <button 
          @click.stop="hideBubble" 
          class="bubble-close"
          title="Cerrar"
        >
          ×
        </button>
      </div>
    </transition>

    <!-- Botón flotante -->
    <button
      @click="toggleChat"
      class="chatbot-toggle"
      :class="{ 
        'pulse-animation': !isOpen && hasNewMessage,
        'has-notification': !isOpen && hasNewMessage
      }"
    >
      <img 
        :src="getBotAvatar()"
        class="w-12 h-12 object-contain rounded-full"
        alt="PetBot"
      />
      <!-- Indicador de notificación -->
      <div v-if="!isOpen && hasNewMessage" class="notification-dot"></div>
      <!-- Indicador de estado -->
      <div class="status-indicator" :class="getStatusClass()"></div>
    </button>

    <!-- Ventana del Chat - Posición más alta -->
    <transition name="chat-window">
      <div
        v-if="isOpen"
        class="chatbot-window"
      >
        <!-- Header -->
        <div class="chatbot-header" :class="`role-${userRole}`">
          <img 
            :src="getBotAvatar()"
            class="chatbot-avatar"
            alt="PetBot"
          />
          <div class="chatbot-info">
            <h3>PetBot AI</h3>
            <p>{{ getRoleDescription() }}</p>
            <div class="chatbot-status">
              <span class="status-dot" :class="getStatusClass()"></span>
              <span class="status-text">{{ getStatusText() }}</span>
            </div>
          </div>
          <div class="header-actions">
            <button 
              @click="clearChat" 
              class="action-btn"
              title="Limpiar chat"
              v-if="messages.length > 1"
            >
              <svg class="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
            <button 
              @click="toggleChat" 
              class="close-btn"
              title="Cerrar chat"
            >
              ×
            </button>
          </div>
        </div>

        <!-- Área de mensajes -->
        <div ref="messagesContainer" class="chatbot-messages">
          <!-- Mensaje de bienvenida -->
          <div v-if="messages.length === 0" class="welcome-container">
            <div class="welcome-bubble">
              <div class="welcome-header">
                <img :src="getBotAvatar()" class="welcome-avatar" alt="PetBot">
                <div>
                  <h3>PetBot AI</h3>
                  <p>Tu asistente virtual</p>
                </div>
              </div>
              <div class="welcome-content">
                <p>¡Hola! Soy PetBot, tu asistente personal para todo lo relacionado con mascotas.</p>
                <div class="welcome-features">
                  <div class="feature" v-for="feature in getWelcomeFeatures()" :key="feature.icon">
                    <span class="feature-icon">{{ feature.icon }}</span>
                    <span class="feature-text">{{ feature.text }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Mensajes del chat -->
          <div
            v-for="(msg, index) in messages"
            :key="index"
            :class="msg.sender === 'me' ? 'message-right' : 'message-left'"
            class="message-container"
          >
            <div
              :class="msg.sender === 'me'
                ? 'message-user'
                : 'message-bot'"
              class="message-bubble"
            >
              <!-- Avatar para mensajes del bot -->
              <img 
                v-if="msg.sender === 'bot'" 
                :src="getBotAvatar()"
                class="message-avatar"
                alt="PetBot"
              />
              
              <div class="message-content-wrapper">
                <div class="message-content" v-html="formatMessage(msg.text)"></div>
                
                <!-- Acciones para mensajes específicos -->
                <div v-if="msg.actions && msg.sender === 'bot'" class="message-actions">
                  <button
                    v-for="action in msg.actions"
                    :key="action.label"
                    @click="handleAction(action)"
                    class="action-button"
                  >
                    {{ action.label }}
                  </button>
                </div>
                
                <div 
                  :class="msg.sender === 'me' ? 'message-time-user' : 'message-time-bot'"
                  class="message-time"
                >
                  {{ msg.time }}
                  <span v-if="msg.sender === 'me'" class="message-status">
                    <span v-if="msg.sending" class="sending">Enviando...</span>
                    <span v-else-if="msg.sent" class="sent">✓</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Indicador de typing -->
          <div v-if="isLoading" class="typing-indicator">
            <div class="typing-bubble">
              <img 
                :src="getBotAvatar()"
                class="typing-avatar"
                alt="PetBot"
              />
              <div class="typing-content">
                <div class="typing-dots">
                  <div class="dot"></div>
                  <div class="dot"></div>
                  <div class="dot"></div>
                </div>
                <span class="typing-text">PetBot está pensando...</span>
              </div>
            </div>
          </div>

          <!-- Sugerencias de preguntas -->
          <div v-if="showSuggestions && suggestions.length > 0" class="suggestions-container">
            <div class="suggestions-bubble">
              <div class="suggestions-header">
                <span class="suggestions-icon">💡</span>
                <span class="suggestions-title">Preguntas sugeridas</span>
              </div>
              <div class="suggestions-list">
                <button
                  v-for="suggestion in suggestions"
                  :key="suggestion"
                  @click="sendQuick(suggestion)"
                  :disabled="isLoading"
                  class="suggestion-button"
                >
                  {{ suggestion }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Botones rápidos CON SCROLL HORIZONTAL -->
        <div class="quick-buttons-container">
          <div class="quick-buttons-wrapper">
            <div class="quick-buttons-scroll" ref="quickButtonsScroll">
              <button
                v-for="q in quickOptions"
                :key="q"
                @click="sendQuick(q)"
                :disabled="isLoading"
                class="quick-button"
                :class="{ 'active': quickButtonActive === q }"
              >
                <span class="quick-icon">{{ getQuickIcon(q) }}</span>
                <span class="quick-text">{{ q }}</span>
              </button>
            </div>
            <!-- Flechas de navegación -->
            <button 
              v-if="showScrollArrows" 
              @click="scrollQuickButtons(-150)"
              class="scroll-button scroll-left"
              title="Desplazar izquierda"
            >
              ‹
            </button>
            <button 
              v-if="showScrollArrows" 
              @click="scrollQuickButtons(150)"
              class="scroll-button scroll-right"
              title="Desplazar derecha"
            >
              ›
            </button>
          </div>
        </div>

        <!-- Área de input -->
        <div class="input-container">
          <div class="input-wrapper">
            <input
              v-model="userInput"
              @keyup.enter="sendMessage"
              @keyup="handleKeyup"
              :disabled="isLoading"
              :placeholder="getInputPlaceholder()"
              class="message-input"
              maxlength="500"
              ref="messageInput"
            />
            
            <div class="input-actions">
              <span class="char-counter" :class="{ 'warning': userInput.length > 450 }">
                {{ userInput.length }}/500
              </span>
              <button
                @click="sendMessage"
                :disabled="isLoading || !userInput.trim()"
                class="send-button"
                :class="{ 'pulse': !isLoading && userInput.trim() }"
                title="Enviar mensaje"
              >
                <svg v-if="!isLoading" class="send-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                </svg>
                <div v-else class="loading-spinner"></div>
              </button>
            </div>
          </div>
        </div>

        <!-- Footer del chat -->
        <div class="chat-footer">
          <div class="footer-info">
            <span class="footer-text">
              PetBot AI • Respuestas generadas por IA
            </span>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import axios from "axios";
import { useUserStore } from "@/stores/userStore";

export default {
  name: "ChatBot",
  data() {
    return {
      isOpen: false,
      userInput: "",
      messages: [],
      isLoading: false,
      hasNewMessage: false,
      showScrollArrows: false,
      userRole: "client",
      showHelpBubble: true,
      bubbleHidden: false,
      showSuggestions: true,
      suggestions: [],
      quickButtonActive: null,
      
      // Estado del chat
      chatSessionId: null,
      isOnline: true,
      lastActivity: null
    };
  },
  computed: {
    quickOptions() {
      const optionsByRole = {
        client: [
          "📅 Mis citas", 
          "🐾 Mis mascotas", 
          "🏪 Buscar comercios", 
          "🛎️ Servicios", 
          "💰 Precios",
          "🏥 Emergencias",
          "❓ Cómo funciona",
          "📞 Contacto"
        ],
        provider: [
          "🏢 Mi comercio",
          "📅 Citas hoy",
          "📊 Estadísticas",
          "💰 Ingresos",
          "👥 Clientes",
          "⚙️ Servicios",
          "⭐ Reseñas",
          "📈 Reportes"
        ],
        admin: [
          "👥 Usuarios",
          "🏪 Comercios pendientes",
          "📊 Estadísticas sistema",
          "✅ Aprobar comercios",
          "📋 Todas las citas",
          "⚙️ Configuración",
          "🛡️ Seguridad",
          "📞 Soporte"
        ]
      };
      
      return optionsByRole[this.userRole] || optionsByRole.client;
    },

    // URL base dinámica
    apiBaseUrl() {
      if (window.location.hostname === 'localhost' || 
          window.location.hostname === '127.0.0.1') {
        return 'http://localhost:4000';
      }
      
      if (window.location.hostname.includes('onrender.com')) {
        return '';
      }
      
      return '';
    }
  },
  methods: {
    // ================ MÉTODOS DE USUARIO ================
    getUserRole() {
      try {
        const userStore = useUserStore();
        return userStore.user?.role || "client";
      } catch (error) {
        console.error("Error obteniendo rol:", error);
        return "client";
      }
    },

    getRoleDescription() {
      const descriptions = {
        client: "Asistente para clientes",
        provider: "Asistente para proveedores", 
        admin: "Asistente administrativo"
      };
      return descriptions[this.userRole] || "Asistente virtual";
    },

    getInputPlaceholder() {
      const placeholders = {
        client: "Pregunta sobre comercios, servicios o tus mascotas...",
        provider: "Consulta tu comercio, agenda o estadísticas...",
        admin: "Consulta comercios, usuarios o reportes del sistema..."
      };
      return placeholders[this.userRole] || "Escribe tu mensaje...";
    },

    // ================ MÉTODOS DE ESTADO ================
    getStatusClass() {
      return this.isOnline ? 'online' : 'offline';
    },

    getStatusText() {
      return this.isOnline ? 'En línea' : 'Desconectado';
    },

    getBotAvatar() {
      // Avatares por defecto - puedes cambiar las rutas según tus imágenes
      const avatars = {
        client: '/petbot-client.png',
        provider: '/petbot-provider.png',
        admin: '/petbot-admin.png'
      };
      // Si no tienes imágenes específicas, usa una por defecto
      return avatars[this.userRole] || '/petbot.png';
    },

    // ================ MÉTODOS DEL CHAT ================
    toggleChat() {
      this.isOpen = !this.isOpen;
      if (this.isOpen) {
        if (this.messages.length === 0) {
          this.addWelcomeMessage();
        }
        this.focusInput();
        this.loadSuggestions();
      }
      this.hasNewMessage = false;
      this.showHelpBubble = false;
      this.$nextTick(() => {
        this.scrollToBottom();
        this.checkScrollButtons();
      });
    },

    hideBubble() {
      this.showHelpBubble = false;
      this.bubbleHidden = true;
      localStorage.setItem('chatbot_bubble_hidden', 'true');
    },

    showBubble() {
      if (!this.bubbleHidden && !this.isOpen) {
        this.showHelpBubble = true;
      }
    },

    addWelcomeMessage() {
      const welcomeMessages = {
        client: `¡Hola! 👋 Soy PetBot, tu asistente para servicios de mascotas. 

**Como cliente, puedo ayudarte con:**

🏪 **Buscar comercios cercanos**
• Veterinarias, peluquerías, tiendas
• Filtra por categoría y ubicación
• Lee reseñas y calificaciones

📅 **Gestión de citas**
• Agenda nuevas citas
• Consulta tus citas pendientes
• Cancela o reprograma citas

🐾 **Información de mascotas**
• Registra tus mascotas
• Historial médico
• Consejos de cuidado

💰 **Precios y servicios**
• Compara precios
• Encuentra promociones
• Conoce los servicios disponibles

🏥 **Emergencias**
• Localiza veterinarias 24/7
• Primeros auxilos para mascotas
• Contactos de emergencia

💡 **Consejos útiles**
• Cuidado básico de mascotas
• Alimentación adecuada
• Entrenamiento y comportamiento

**¿En qué puedo ayudarte hoy?**`,

        provider: `¡Hola! 💼 Soy PetBot, tu asistente para la gestión de tu comercio.

**Como proveedor, puedo ayudarte con:**

🏢 **Gestión de comercio**
• Actualiza información de contacto
• Modifica horarios de atención
• Administra servicios y precios
• Sube fotos de tu establecimiento

📅 **Agenda y citas**
• Visualiza citas del día
• Confirma o cancela citas
• Gestiona tu disponibilidad
• Historial de citas completadas

📊 **Estadísticas**
• Ingresos totales y mensuales
• Número de citas por estado
• Clientes recurrentes
• Calificaciones y reseñas

👥 **Gestión de clientes**
• Información de contacto
• Historial de visitas
• Preferencias y necesidades
• Comunicación directa

💰 **Finanzas**
• Reportes de ingresos
• Análisis de rentabilidad
• Seguimiento de pagos
• Proyecciones de crecimiento

⭐ **Reputación**
• Monitorea reseñas
• Responde a comentarios
• Mejora tu calificación
• Promociona tu negocio

**¿Qué área de tu negocio necesitas gestionar?**`,

        admin: `¡Hola! 👨‍💼 Soy PetBot, tu asistente administrativo.

**Como administrador, puedo ayudarte con:**

👥 **Gestión de usuarios**
• Ver todos los usuarios registrados
• Filtrar por rol (cliente, proveedor)
• Activar/desactivar cuentas
• Ver actividad reciente

🏪 **Gestión de comercios**
• Revisar nuevas solicitudes
• Aprobar o rechazar comercios
• Ver comercios activos/inactivos
• Gestionar categorías

📊 **Estadísticas del sistema**
• Usuarios registrados totales
• Comercios activos
• Citas realizadas
• Actividad reciente
• Rendimiento de la plataforma

✅ **Moderación**
• Revisar reportes de usuarios
• Gestionar quejas
• Aplicar sanciones
• Mantener la calidad del servicio

⚙️ **Configuración**
• Ajustes de la plataforma
• Políticas y términos
• Configuración de notificaciones
• Integraciones con servicios

🛡️ **Seguridad**
• Monitoreo de actividad
• Detección de fraudes
• Protección de datos
• Cumplimiento normativo

**¿Qué funcionalidad administrativa necesitas?**`
      };

      const message = welcomeMessages[this.userRole] || welcomeMessages.client;
      this.messages.push({ 
        sender: "bot", 
        text: message,
        time: this.getCurrentTime(),
        actions: this.getWelcomeActions()
      });
    },

    getWelcomeFeatures() {
      const features = {
        client: [
          { icon: '🏪', text: 'Buscar comercios' },
          { icon: '📅', text: 'Agendar citas' },
          { icon: '🐾', text: 'Gestionar mascotas' },
          { icon: '💰', text: 'Comparar precios' },
          { icon: '🏥', text: 'Emergencias' },
          { icon: '💡', text: 'Consejos útiles' }
        ],
        provider: [
          { icon: '🏢', text: 'Gestionar comercio' },
          { icon: '📅', text: 'Administrar agenda' },
          { icon: '📊', text: 'Ver estadísticas' },
          { icon: '💰', text: 'Analizar ingresos' },
          { icon: '👥', text: 'Gestionar clientes' },
          { icon: '⭐', text: 'Mejorar reputación' }
        ],
        admin: [
          { icon: '👥', text: 'Gestionar usuarios' },
          { icon: '🏪', text: 'Aprobar comercios' },
          { icon: '📊', text: 'Estadísticas sistema' },
          { icon: '✅', text: 'Moderar contenido' },
          { icon: '⚙️', text: 'Configurar plataforma' },
          { icon: '🛡️', text: 'Monitorear seguridad' }
        ]
      };
      return features[this.userRole] || features.client;
    },

    getWelcomeActions() {
      return [
        { label: 'Ver tutorial', action: 'tutorial' },
        { label: 'Preguntas frecuentes', action: 'faq' },
        { label: 'Contactar soporte', action: 'support' }
      ];
    },

    handleAction(action) {
      switch (action.action) {
        case 'tutorial':
          this.sendMessageAction('¿Cómo funciona la plataforma?');
          break;
        case 'faq':
          this.sendMessageAction('¿Cuáles son las preguntas frecuentes?');
          break;
        case 'support':
          window.open('/support', '_blank');
          break;
      }
    },

    sendMessageAction(text) {
      this.userInput = text;
      this.sendMessage();
    },

    async sendMessage() {
      if (!this.userInput.trim() || this.isLoading) return;

      const text = this.userInput.trim();
      const messageId = Date.now();
      
      // Agregar mensaje del usuario con estado
      this.messages.push({ 
        id: messageId,
        sender: "me", 
        text: text,
        time: this.getCurrentTime(),
        sending: true,
        sent: false
      });
      
      const userMessage = text;
      this.userInput = "";
      this.isLoading = true;
      this.showSuggestions = false;

      try {
        const token = localStorage.getItem("token");
        
        if (!token) {
          throw new Error("No hay token de autenticación");
        }

        // Actualizar estado del mensaje
        const messageIndex = this.messages.findIndex(m => m.id === messageId);
        if (messageIndex !== -1) {
          this.messages[messageIndex].sending = false;
          this.messages[messageIndex].sent = true;
        }

        const apiUrl = this.apiBaseUrl 
          ? `${this.apiBaseUrl}/api/chatbot/chat`
          : '/api/chatbot/chat';

        const res = await axios.post(
          apiUrl,
          { 
            message: userMessage,
            sessionId: this.chatSessionId,
            timestamp: new Date().toISOString()
          },
          { 
            headers: { 
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            },
            timeout: 45000 // 45 segundos timeout
          }
        );

        if (res.data.error) {
          throw new Error(res.data.error);
        }

        // Guardar session ID si viene en la respuesta
        if (res.data.sessionId) {
          this.chatSessionId = res.data.sessionId;
        }

        this.messages.push({
          sender: "bot",
          text: res.data.reply || "Lo siento, no pude generar una respuesta.",
          time: this.getCurrentTime(),
          queryType: res.data.queryType
        });

        // Actualizar sugerencias
        if (res.data.suggestions) {
          this.suggestions = res.data.suggestions;
          this.showSuggestions = true;
        }

        // Mostrar burbuja de ayuda después de un tiempo
        if (!this.isOpen && !this.bubbleHidden) {
          setTimeout(() => {
            this.showBubble();
          }, 5000);
        }

      } catch (error) {
        console.error("Chat error:", error);
        
        let errorMessage = "❌ Error al conectar con PetBot.";
        
        if (error.response?.status === 401) {
          errorMessage = "🔐 **Sesión expirada**\n\nPor favor, inicia sesión nuevamente para continuar.";
          this.$router.push('/login');
        } else if (error.response?.status === 400) {
          errorMessage = "📝 **Mensaje inválido**\n\nPor favor, escribe un mensaje válido.";
        } else if (error.code === 'ECONNABORTED') {
          errorMessage = "⏰ **Tiempo de espera agotado**\n\nEl servicio está tardando en responder. Por favor, intenta nuevamente.";
        } else if (error.message.includes("Network Error")) {
          errorMessage = `🌐 **Error de conexión**\n\nVerifica tu conexión a internet o intenta más tarde.\n\n_Código de error: ${error.code || 'DESCONOCIDO'}_`;
        } else if (error.response?.status === 429) {
          errorMessage = "🚫 **Demasiadas solicitudes**\n\nPor favor, espera unos minutos antes de enviar otro mensaje.";
        } else if (error.response?.status === 503) {
          errorMessage = "🔧 **Servicio en mantenimiento**\n\nPetBot está siendo actualizado. Por favor, intenta más tarde.";
        }

        this.messages.push({
          sender: "bot",
          text: errorMessage,
          time: this.getCurrentTime(),
          actions: [
            { label: 'Reintentar', action: 'retry' },
            { label: 'Contactar soporte', action: 'support' }
          ]
        });

        // Revertir estado del mensaje del usuario
        const messageIndex = this.messages.findIndex(m => m.id === messageId);
        if (messageIndex !== -1) {
          this.messages[messageIndex].sending = false;
          this.messages[messageIndex].error = true;
        }
      } finally {
        this.isLoading = false;
        this.scrollToBottom();
        this.focusInput();
      }
    },

    sendQuick(text) {
      // Extraer solo el texto sin el emoji
      const cleanText = text.replace(/^[^\w\s]*\s*/, '');
      this.quickButtonActive = text;
      this.userInput = cleanText;
      this.sendMessage();
      
      // Resetear el estado activo después de un tiempo
      setTimeout(() => {
        this.quickButtonActive = null;
      }, 1000);
    },

    getQuickIcon(text) {
      // Extraer el emoji del texto
      const emojiMatch = text.match(/^[^\w\s]/);
      return emojiMatch ? emojiMatch[0] : '💬';
    },

    // ================ MÉTODOS DE UI ================
    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.messagesContainer;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      });
    },

    scrollQuickButtons(distance) {
      const container = this.$refs.quickButtonsScroll;
      if (container) {
        container.scrollLeft += distance;
      }
    },

    checkScrollButtons() {
      this.$nextTick(() => {
        const container = this.$refs.quickButtonsScroll;
        if (container) {
          this.showScrollArrows = container.scrollWidth > container.clientWidth;
        }
      });
    },

    getCurrentTime() {
      return new Date().toLocaleTimeString('es-VE', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    },

    formatMessage(text) {
      if (!text) return '';
      
      // Convertir URLs en enlaces
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const linkedText = text.replace(urlRegex, url => 
        `<a href="${url}" target="_blank" class="message-link">${url}</a>`
      );
      
      // Formatear texto con emojis y markdown básico
      return linkedText
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
        .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded">$1</code>')
        .replace(/#\s(.*?)(?=\n|$)/g, '<h3 class="text-lg font-bold mt-2 mb-1">$1</h3>')
        .replace(/•\s(.*?)(?=\n|$)/g, '<li class="ml-4">• $1</li>')
        .replace(/(\d+\.\s.*?)(?=\n|$)/g, '<li class="ml-4">$1</li>')
        .replace(/(🏪|🐾|📅|💰|🏥|💡|👥|⚙️|🛡️|⭐|📊|✅|👨‍💼|💼)/g, 
          '<span class="inline-block mr-1 text-lg">$1</span>');
    },

    // ================ MÉTODOS DE SUGERENCIAS ================
    async loadSuggestions() {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const apiUrl = this.apiBaseUrl 
          ? `${this.apiBaseUrl}/api/chatbot/suggestions`
          : '/api/chatbot/suggestions';

        const res = await axios.get(apiUrl, {
          headers: { 
            Authorization: `Bearer ${token}`
          }
        });

        if (res.data.suggestions) {
          this.suggestions = res.data.suggestions.slice(0, 4); // Mostrar solo 4
        }
      } catch (error) {
        console.error('Error cargando sugerencias:', error);
        // Sugerencias por defecto
        this.suggestions = this.getDefaultSuggestions();
      }
    },

    getDefaultSuggestions() {
      const defaults = {
        client: [
          "¿Cómo agendo una cita?",
          "¿Dónde encuentro veterinarias?",
          "¿Cómo agrego una mascota?",
          "¿Qué hacer en emergencia?"
        ],
        provider: [
          "¿Cómo actualizo mi comercio?",
          "¿Dónde veo mis citas?",
          "¿Cómo agrego un servicio?",
          "¿Dónde veo mis ingresos?"
        ],
        admin: [
          "¿Cuántos usuarios hay?",
          "¿Cuántas solicitudes pendientes?",
          "¿Cómo apruebo un comercio?",
          "¿Dónde veo estadísticas?"
        ]
      };
      return defaults[this.userRole] || defaults.client;
    },

    // ================ MÉTODOS DE UTILIDAD ================
    focusInput() {
      this.$nextTick(() => {
        const input = this.$refs.messageInput;
        if (input) {
          input.focus();
        }
      });
    },

    handleKeyup(event) {
      if (event.key === 'Escape') {
        this.userInput = '';
      }
    },

    clearChat() {
      if (confirm('¿Estás seguro de que quieres limpiar el chat? Esta acción no se puede deshacer.')) {
        this.messages = [];
        this.addWelcomeMessage();
      }
    },

    // ================ MÉTODOS DE CONEXIÓN ================
    checkConnection() {
      this.isOnline = navigator.onLine;
      
      if (!this.isOnline && this.isOpen) {
        this.messages.push({
          sender: "bot",
          text: "⚠️ **Sin conexión a internet**\n\nAlgunas funciones pueden no estar disponibles. Por favor, verifica tu conexión.",
          time: this.getCurrentTime()
        });
      }
    },

    // ================ MÉTODOS DE INICIALIZACIÓN ================
    scheduleHelpBubble() {
      if (this.bubbleHidden) return;
      
      setTimeout(() => {
        if (!this.isOpen && !this.bubbleHidden) {
          this.showHelpBubble = true;
        }
      }, 3000);
    }
  },

  watch: {
    isOpen(newVal) {
      if (newVal) {
        this.$nextTick(() => {
          this.scrollToBottom();
          this.checkScrollButtons();
        });
        this.showHelpBubble = false;
        this.loadSuggestions();
      } else {
        setTimeout(() => {
          if (!this.bubbleHidden) {
            this.scheduleHelpBubble();
          }
        }, 2000);
      }
    },

    messages: {
      handler() {
        this.$nextTick(() => {
          this.scrollToBottom();
        });
        if (!this.isOpen && this.messages.length > 0) {
          this.hasNewMessage = true;
        }
      },
      deep: true
    }
  },

  mounted() {
    // Obtener el rol del usuario
    this.userRole = this.getUserRole();
    
    // Verificar preferencias guardadas
    const bubbleHidden = localStorage.getItem('chatbot_bubble_hidden');
    if (bubbleHidden === 'true') {
      this.bubbleHidden = true;
      this.showHelpBubble = false;
    }
    
    // Programar mostrar burbuja de ayuda
    this.scheduleHelpBubble();
    
    // Verificar scroll después de que se rendericen los botones
    this.$nextTick(() => {
      setTimeout(() => {
        this.checkScrollButtons();
      }, 100);
    });

    // Event listeners
    window.addEventListener('resize', this.checkScrollButtons);
    window.addEventListener('online', this.checkConnection);
    window.addEventListener('offline', this.checkConnection);

    // Cerrar burbuja al hacer clic fuera
    document.addEventListener('click', (event) => {
      const chatbotContainer = this.$el;
      const helpBubble = chatbotContainer?.querySelector('.help-bubble');
      
      if (helpBubble && 
          !helpBubble.contains(event.target) && 
          !chatbotContainer.querySelector('.chatbot-toggle').contains(event.target)) {
        this.hideBubble();
      }
    });
  },

  beforeUnmount() {
    // Remover event listeners
    window.removeEventListener('resize', this.checkScrollButtons);
    window.removeEventListener('online', this.checkConnection);
    window.removeEventListener('offline', this.checkConnection);
    document.removeEventListener('click', this.hideBubble);
  }
};
</script>

<style scoped>
.chatbot-container {
  position: fixed;
  bottom: 20px;
  left: 20px;
  z-index: 1000;
}

/* Mensaje tipo nube */
.help-bubble {
  position: absolute;
  bottom: 75px;
  left: 10px;
  background: white;
  border-radius: 18px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  padding: 12px 16px;
  width: 200px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
  z-index: 1001;
  animation: float 3s ease-in-out infinite;
}

.help-bubble:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  background: #f8fafc;
}

.bubble-arrow {
  position: absolute;
  bottom: -8px;
  left: 20px;
  width: 16px;
  height: 16px;
  background: white;
  transform: rotate(45deg);
  border-right: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
}

.bubble-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.bubble-text {
  font-weight: 600;
  font-size: 13px;
  color: #1f2937;
}

.bubble-subtext {
  font-size: 11px;
  color: #6b7280;
  opacity: 0.8;
}

.bubble-close {
  position: absolute;
  top: 6px;
  right: 8px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #f3f4f6;
  border: none;
  color: #6b7280;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.bubble-close:hover {
  background: #ef4444;
  color: white;
}

/* Animación flotante */
@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

/* Botón flotante */
.chatbot-toggle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: white;
  border: 2px solid #e2e8f0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.chatbot-toggle:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  border-color: #3b82f6;
}

.chatbot-toggle.pulse-animation {
  animation: pulse-button 2s infinite;
}

.chatbot-toggle.has-notification {
  border-color: #ef4444;
}

@keyframes pulse-button {
  0% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
  }
}

.status-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid white;
}

.status-indicator.online {
  background: #10b981;
}

.status-indicator.offline {
  background: #6b7280;
}

.notification-dot {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  background: #ef4444;
  border-radius: 50%;
  border: 2px solid white;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

/* Ventana del chat */
.chatbot-window {
  position: fixed;
  bottom: 90px;
  left: 20px;
  width: 380px;
  height: 520px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Header */
.chatbot-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  color: white;
}

.chatbot-header.role-client {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
}

.chatbot-header.role-provider {
  background: linear-gradient(135deg, #10b981, #047857);
}

.chatbot-header.role-admin {
  background: linear-gradient(135deg, #8b5cf6, #6d28d9);
}

.chatbot-avatar {
  width: 40px;
  height: 40px;
  object-fit: contain;
  border-radius: 50%;
  border: 2px solid white;
}

.chatbot-info {
  flex: 1;
}

.chatbot-info h3 {
  font-weight: bold;
  font-size: 14px;
  margin: 0;
}

.chatbot-info p {
  font-size: 12px;
  opacity: 0.9;
  margin: 0;
}

.chatbot-status {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.status-dot.online {
  background: #34d399;
}

.status-dot.offline {
  background: #9ca3af;
}

.status-text {
  font-size: 10px;
  opacity: 0.8;
}

.header-actions {
  display: flex;
  gap: 4px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.action-icon {
  width: 16px;
  height: 16px;
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

/* Bienvenida */
.welcome-container {
  padding: 16px;
}

.welcome-bubble {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.welcome-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.welcome-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid #3b82f6;
}

.welcome-content p {
  margin: 0 0 12px 0;
  color: #4b5563;
  font-size: 14px;
}

.welcome-features {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.feature {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px;
  background: #f9fafb;
  border-radius: 8px;
}

.feature-icon {
  font-size: 16px;
}

.feature-text {
  font-size: 11px;
  color: #374151;
}

/* Área de mensajes */
.chatbot-messages {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  background: linear-gradient(to bottom, #f8fafc, #ffffff);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-container {
  display: flex;
  width: 100%;
}

.message-right {
  justify-content: flex-end;
}

.message-left {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 85%;
  display: flex;
  gap: 8px;
}

.message-user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  margin-top: 4px;
}

.message-content-wrapper {
  flex: 1;
}

.message-content {
  padding: 12px 16px;
  border-radius: 18px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  font-size: 14px;
  line-height: 1.4;
}

.message-user .message-content {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  border-bottom-right-radius: 6px;
}

.message-bot .message-content {
  background: white;
  color: #1f2937;
  border: 1px solid #e5e7eb;
  border-bottom-left-radius: 6px;
}

.message-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.action-button {
  padding: 4px 12px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-button:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

.message-time {
  font-size: 11px;
  margin-top: 4px;
  text-align: right;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
}

.message-time-user {
  color: rgba(255, 255, 255, 0.8);
}

.message-time-bot {
  color: #6b7280;
}

.message-status .sending {
  font-size: 10px;
  opacity: 0.7;
}

.message-status .sent {
  color: #10b981;
}

.message-link {
  color: #3b82f6;
  text-decoration: underline;
}

.message-link:hover {
  color: #1d4ed8;
}

/* Typing indicator */
.typing-indicator {
  display: flex;
  justify-content: flex-start;
}

.typing-bubble {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  border-bottom-left-radius: 6px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.typing-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
}

.typing-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.typing-dots {
  display: flex;
  gap: 4px;
}

.dot {
  width: 6px;
  height: 6px;
  background: #6b7280;
  border-radius: 50%;
  animation: typing-bounce 1.4s infinite ease-in-out;
}

.dot:nth-child(2) {
  animation-delay: 0.16s;
}

.dot:nth-child(3) {
  animation-delay: 0.32s;
}

@keyframes typing-bounce {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  30% {
    transform: translateY(-4px);
    opacity: 1;
  }
}

.typing-text {
  font-size: 12px;
  color: #6b7280;
}

/* Sugerencias */
.suggestions-container {
  margin-top: 8px;
}

.suggestions-bubble {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.suggestions-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.suggestions-icon {
  font-size: 14px;
}

.suggestions-title {
  font-size: 12px;
  font-weight: 600;
  color: #374151;
}

.suggestions-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}

.suggestion-button {
  padding: 6px 10px;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 11px;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  white-space: normal;
  word-break: break-word;
}

.suggestion-button:hover:not(:disabled) {
  background: #e5e7eb;
  transform: translateY(-1px);
}

.suggestion-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Botones rápidos */
.quick-buttons-container {
  padding: 12px 16px;
  border-top: 1px solid #e5e7eb;
  background: #f8fafc;
  position: relative;
}

.quick-buttons-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.quick-buttons-scroll {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
  scroll-behavior: smooth;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.quick-buttons-scroll::-webkit-scrollbar {
  display: none;
}

.quick-button {
  flex-shrink: 0;
  padding: 8px 12px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  min-width: max-content;
  display: flex;
  align-items: center;
  gap: 4px;
}

.quick-button:hover:not(:disabled) {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
}

.quick-button.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.quick-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.quick-icon {
  font-size: 12px;
}

.quick-text {
  flex: 1;
}

/* Botones de scroll */
.scroll-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #374151;
  cursor: pointer;
  z-index: 10;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.scroll-button:hover {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.scroll-left {
  left: -8px;
}

.scroll-right {
  right: -8px;
}

/* Input area */
.input-container {
  border-top: 1px solid #e5e7eb;
  background: white;
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
}

.message-input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  font-size: 14px;
  outline: none;
  transition: all 0.2s ease;
  background: white;
  min-height: 36px;
}

.message-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.message-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.input-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.char-counter {
  font-size: 11px;
  color: #9ca3af;
  min-width: 40px;
}

.char-counter.warning {
  color: #ef4444;
}

.send-button {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  border: none;
  border-radius: 10px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.send-button:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.send-button.pulse:not(:disabled) {
  animation: send-pulse 2s infinite;
}

@keyframes send-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(59, 130, 246, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
  }
}

.send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.send-icon {
  width: 18px;
  height: 18px;
}

.loading-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid white;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Footer del chat */
.chat-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background: #f8fafc;
  border-top: 1px solid #e5e7eb;
}

.footer-info {
  flex: 1;
}

.footer-text {
  font-size: 10px;
  color: #6b7280;
}

/* Animaciones */
.chat-window-enter-active,
.chat-window-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.chat-window-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.chat-window-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.bubble-enter-active,
.bubble-leave-active {
  transition: all 0.3s ease;
}

.bubble-enter-from,
.bubble-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Scroll personalizado */
.chatbot-messages::-webkit-scrollbar {
  width: 6px;
}

.chatbot-messages::-webkit-scrollbar-track {
  background: transparent;
}

.chatbot-messages::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

.chatbot-messages::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Responsive */
@media (max-width: 480px) {
  .chatbot-container {
    bottom: 10px;
    left: 10px;
  }
  
  .chatbot-window {
    width: calc(100vw - 40px);
    max-width: 380px;
    left: 10px;
    bottom: 80px;
    height: 500px;
  }
  
  .help-bubble {
    width: 180px;
    left: 0;
  }
  
  .suggestions-list {
    grid-template-columns: 1fr;
  }
}
</style>