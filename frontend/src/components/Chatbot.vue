<template>
  <!-- ChatBot Container -->
  <div class="chatbot-container">
    <!-- Botón flotante -->
    <button
      @click="toggleChat"
      class="chatbot-toggle"
      :class="{ 'has-notification': !isOpen && hasNewMessage }"
    >
      <img 
        :src="botAvatar"
        class="w-12 h-12 object-contain rounded-full"
        alt="PetBot"
      />
      <!-- Indicador de notificación -->
      <div v-if="!isOpen && hasNewMessage" class="notification-dot"></div>
    </button>

    <!-- Ventana del Chat -->
    <transition name="chat-window">
      <div
        v-if="isOpen"
        class="chatbot-window"
      >
        <!-- Header con info de negocio -->
        <div class="chatbot-header">
          <img 
            :src="botAvatar"
            class="chatbot-avatar"
            alt="PetBot"
          />
          <div class="chatbot-info">
            <h3>{{ botName }}</h3>
            <p class="chatbot-subtitle">{{ getRoleDescription() }}</p>
            <p v-if="businessInfo" class="chatbot-business">
              <span class="business-badge">{{ businessInfo }}</span>
            </p>
          </div>
          <button 
            @click="toggleChat" 
            class="close-btn"
            title="Cerrar chat"
          >
            ×
          </button>
        </div>

        <!-- Área de mensajes -->
        <div ref="messagesContainer" class="chatbot-messages">
          <!-- Mensaje de bienvenida solo al abrir -->
          <div v-if="showWelcome" class="welcome-message">
            <div class="welcome-bubble">
              <h4>👋 ¡Hola {{ userName }}!</h4>
              <p>{{ getWelcomeMessage() }}</p>
              <div class="welcome-features">
                <div v-for="feature in welcomeFeatures" :key="feature" class="feature-item">
                  <span class="feature-icon">✓</span>
                  <span>{{ feature }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Historial de mensajes -->
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
              <div class="message-content" v-html="formatMessage(msg.text)"></div>
              <div 
                :class="msg.sender === 'me' ? 'message-time-user' : 'message-time-bot'"
                class="message-time"
              >
                {{ msg.time }}
              </div>
            </div>
          </div>

          <!-- Indicador de typing -->
          <div v-if="isLoading" class="typing-indicator">
            <div class="typing-bubble">
              <div class="typing-dots">
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
              </div>
              <span class="typing-text">{{ botName }} está escribiendo...</span>
            </div>
          </div>

          <!-- Sugerencia rápida después de mensaje de bot -->
          <div v-if="showSuggestion && !isLoading" class="suggestion-container">
            <p class="suggestion-text">¿Te interesa alguna de estas opciones?</p>
            <div class="suggestion-buttons">
              <button
                v-for="suggestion in quickSuggestions"
                :key="suggestion"
                @click="sendQuick(suggestion)"
                class="suggestion-button"
              >
                {{ suggestion }}
              </button>
            </div>
          </div>
        </div>

        <!-- Botones rápidos CON SCROLL HORIZONTAL -->
        <div v-if="quickOptions.length > 0" class="quick-buttons-container">
          <div class="quick-buttons-wrapper">
            <div class="quick-buttons-scroll" ref="quickButtonsScroll">
              <button
                v-for="q in quickOptions"
                :key="q"
                @click="sendQuick(q)"
                :disabled="isLoading"
                class="quick-button"
              >
                {{ q }}
              </button>
            </div>
            <!-- Flechas de navegación -->
            <button 
              v-if="showScrollArrows" 
              @click="scrollQuickButtons(-100)"
              class="scroll-button scroll-left"
              title="Desplazar izquierda"
            >
              ‹
            </button>
            <button 
              v-if="showScrollArrows" 
              @click="scrollQuickButtons(100)"
              class="scroll-button scroll-right"
              title="Desplazar derecha"
            >
              ›
            </button>
          </div>
        </div>

        <!-- Área de input -->
        <div class="input-container">
          <input
            v-model="userInput"
            @keyup.enter="sendMessage"
            @input="handleInput"
            :disabled="isLoading"
            :placeholder="getInputPlaceholder()"
            class="message-input"
            maxlength="500"
            ref="messageInput"
          />
          <div class="input-actions">
            <button
              v-if="userInput"
              @click="clearInput"
              class="clear-button"
              title="Limpiar"
            >
              ✕
            </button>
            <button
              @click="sendMessage"
              :disabled="isLoading || !userInput.trim()"
              class="send-button"
              :class="{ 'loading': isLoading }"
              title="Enviar mensaje"
            >
              <svg v-if="!isLoading" class="send-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
              </svg>
              <div v-else class="loading-spinner"></div>
            </button>
          </div>
        </div>

        <!-- Footer con info del sistema -->
        <div class="chatbot-footer">
          <div class="footer-info">
            <span class="footer-text">
              🤖 {{ botName }} v2.0 • 
              <span class="status-dot" :class="connectionStatus"></span>
              {{ connectionText }}
            </span>
            <span class="footer-text" v-if="businessInfo">
              🏢 {{ businessInfo }}
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
import { useBusinessStore } from "@/stores/businessStore";

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
      userName: "",
      businessInfo: "",
      showWelcome: true,
      showSuggestion: false,
      connectionStatus: "connected", // connected, connecting, disconnected
      connectionText: "Conectado",
      quickSuggestions: [],
      chatHistory: [],
      botName: "PetBot AI",
      botAvatar: "/petbot.png",
      // Cache para respuestas rápidas
      quickCache: {},
      // Timeout para sugerencias
      suggestionTimeout: null
    };
  },
  computed: {
    quickOptions() {
      // Opciones diferentes según el rol del usuario
      const optionsByRole = {
        client: [
          "Buscar negocios", 
          "Mis citas", 
          "Mis mascotas", 
          "Agendar cita",
          "Servicios disponibles",
          "Emergencias",
          "Contactar negocio",
          "Precios"
        ],
        provider: [
          "Mi negocio",
          "Citas hoy",
          "Estadísticas",
          "Agregar servicio",
          "Clientes recientes",
          "Configurar horarios",
          "Reportes",
          "Promocionar"
        ],
        admin: [
          "Negocios pendientes",
          "Usuarios totales",
          "Reportes sistema",
          "Aprobar negocios",
          "Estadísticas globales",
          "Monitoreo",
          "Backup",
          "Configuración"
        ]
      };
      
      return optionsByRole[this.userRole] || optionsByRole.client;
    },
    
    welcomeFeatures() {
      const features = {
        client: [
          "Buscar negocios locales",
          "Agendar citas rápidas",
          "Gestionar tus mascotas",
          "Ver reseñas y valoraciones",
          "Soporte 24/7 para emergencias"
        ],
        provider: [
          "Gestión de citas automática",
          "Estadísticas en tiempo real",
          "Perfil de negocio personalizado",
          "Comunicación con clientes",
          "Reportes de ingresos"
        ],
        admin: [
          "Panel de control completo",
          "Gestión de usuarios y negocios",
          "Reportes detallados",
          "Sistema de aprobaciones",
          "Monitoreo del sistema"
        ]
      };
      return features[this.userRole] || features.client;
    }
  },
  methods: {
    async initializeChat() {
      try {
        this.connectionStatus = "connecting";
        this.connectionText = "Conectando...";
        
        const userStore = useUserStore();
        const businessStore = useBusinessStore();
        
        // Obtener información del usuario
        this.userRole = userStore.user?.role || "client";
        this.userName = userStore.user?.name || "Usuario";
        
        // Obtener información del negocio si es proveedor
        if (this.userRole === "provider" && businessStore.currentBusiness) {
          this.businessInfo = businessStore.currentBusiness.name;
          this.botName = `${this.businessInfo} Assistant`;
          this.botAvatar = businessStore.currentBusiness.logo || "/petbot2.png";
        } else if (this.userRole === "admin") {
          this.botName = "Admin PetBot";
          this.botAvatar = "/admin-bot.png";
        }
        
        // Cargar historial del chat si existe
        this.loadChatHistory();
        
        // Verificar conexión
        await this.checkConnection();
        
        this.connectionStatus = "connected";
        this.connectionText = "Conectado";
        
      } catch (error) {
        console.error("Error inicializando chat:", error);
        this.connectionStatus = "disconnected";
        this.connectionText = "Modo offline";
        this.showOfflineMessage();
      }
    },

    async checkConnection() {
      try {
        // Verificar si estamos online
        const online = navigator.onLine;
        if (!online) {
          throw new Error("Sin conexión a internet");
        }
        
        // Verificar conexión con el backend
        const response = await axios.get("/api/chat/health", {
          timeout: 5000
        });
        
        return response.data.status === "operational";
      } catch (error) {
        console.warn("Modo offline activado:", error.message);
        return false;
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

    getWelcomeMessage() {
      const messages = {
        client: `Bienvenido a PetServices. Encuentra los mejores servicios para tu mascota y agenda citas fácilmente.`,
        provider: `Gestiona tu negocio de mascotas de manera eficiente. Controla citas, servicios y clientes desde un solo lugar.`,
        admin: `Supervisa y gestiona toda la plataforma PetServices. Controla usuarios, negocios y configuración del sistema.`
      };
      return messages[this.userRole] || messages.client;
    },

    getInputPlaceholder() {
      const placeholders = {
        client: "Busca negocios, pregunta por servicios, agenda citas...",
        provider: "Consulta tu negocio, citas, estadísticas...",
        admin: "Gestiona usuarios, negocios, reportes..."
      };
      return placeholders[this.userRole] || "Escribe tu mensaje...";
    },

    toggleChat() {
      this.isOpen = !this.isOpen;
      if (this.isOpen && this.messages.length === 0) {
        this.addWelcomeMessage();
      }
      this.hasNewMessage = false;
      
      this.$nextTick(() => {
        this.scrollToBottom();
        this.checkScrollButtons();
        
        // Enfocar el input cuando se abre
        if (this.isOpen && this.$refs.messageInput) {
          this.$refs.messageInput.focus();
        }
      });
    },

    addWelcomeMessage() {
      const welcomeMessages = {
        client: `¡Hola ${this.userName}! 👋 Soy ${this.botName}, tu asistente personal para servicios de mascotas.

**Como cliente, puedo ayudarte con:**
• 🏢 Buscar negocios locales calificados
• 📅 Agendar y gestionar citas fácilmente
• 🐾 Registrar y cuidar la info de tus mascotas
• ⭐ Ver reseñas y valoraciones de proveedores
• 🆘 Soporte para emergencias veterinarias

¿En qué puedo asistirte hoy?`,

        provider: `¡Hola ${this.userName}! 💼 Soy ${this.botName}, tu asistente de negocio.

**Para tu negocio "${this.businessInfo}", puedo ayudarte con:**
• 📊 Estadísticas y reportes de rendimiento
• 📅 Gestión automática de tu agenda de citas
• 👥 Comunicación directa con tus clientes
• 📈 Estrategias para promocionar tus servicios
• 💰 Seguimiento de ingresos y pagos

¿Qué área de tu negocio quieres optimizar hoy?`,

        admin: `¡Hola ${this.userName}! 👨‍💼 Soy ${this.botName}, tu asistente administrativo.

**Como administrador, gestiono:**
• 🏢 Aprobación y supervisión de negocios
• 👥 Control completo de usuarios del sistema
• 📈 Reportes detallados de toda la plataforma
• ⚙️ Configuración y mantenimiento del sistema
• 🔒 Seguridad y permisos de acceso

¿Qué funcionalidad administrativa necesitas?`
      };

      const message = welcomeMessages[this.userRole] || welcomeMessages.client;
      this.addMessage("bot", message);
      
      // Mostrar sugerencias después de 2 segundos
      this.showSuggestion = true;
      this.quickSuggestions = this.getQuickSuggestions();
    },

    getQuickSuggestions() {
      const suggestions = {
        client: ["¿Cómo encuentro negocios?", "Quiero agendar una cita", "Tengo una emergencia"],
        provider: ["Ver citas de hoy", "Cómo mejorar mi perfil", "Agregar nuevo servicio"],
        admin: ["Negocios pendientes", "Reporte de usuarios", "Estadísticas del mes"]
      };
      return suggestions[this.userRole] || suggestions.client;
    },

    showOfflineMessage() {
      const offlineMessage = `⚠️ **Modo Offline Activado**

Estás usando el modo offline. Algunas funciones pueden estar limitadas.

Funciones disponibles:
• Consulta información básica del sistema
• Revisa tus mensajes guardados
• Accede a guías y tutoriales

**Consejo:** Conéctate a internet para funciones completas de IA.`;

      this.addMessage("bot", offlineMessage);
    },

    async sendMessage() {
      if (!this.userInput.trim() || this.isLoading) return;

      const text = this.userInput.trim();
      this.addMessage("me", text);
      this.userInput = "";
      this.isLoading = true;
      this.showSuggestion = false;

      // Verificar cache primero
      const cachedResponse = this.checkCache(text);
      if (cachedResponse) {
        setTimeout(() => {
          this.addMessage("bot", cachedResponse);
          this.isLoading = false;
          this.showSuggestionsAfterResponse();
        }, 500);
        return;
      }

      try {
        const token = localStorage.getItem("token");
        
        if (!token) {
          throw new Error("No hay token de autenticación");
        }

        const res = await axios.post(
          "/api/chat",
          { message: text },
          { 
            headers: { 
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            },
            timeout: 15000 // 15 segundos timeout para producción
          }
        );

        if (res.data.error) {
          throw new Error(res.data.error);
        }

        // Guardar en cache si es respuesta útil
        if (res.data.type === "text" && !res.data.reply.includes("Error")) {
          this.addToCache(text, res.data.reply);
        }

        this.addMessage("bot", res.data.reply || "Lo siento, no pude generar una respuesta.");
        
        // Mostrar sugerencias después de la respuesta
        this.showSuggestionsAfterResponse();

      } catch (error) {
        console.error("Chat error:", error);
        
        let errorMessage = "❌ Error al conectar con el servidor.";
        
        if (error.code === 'ECONNABORTED') {
          errorMessage = "⏰ **Tiempo de espera agotado.** El servidor está tardando en responder. Intenta de nuevo o usa el modo offline.";
        } else if (error.response?.status === 401) {
          errorMessage = "🔐 **Sesión expirada.** Por favor, inicia sesión nuevamente.";
        } else if (error.message.includes("network")) {
          errorMessage = "🌐 **Sin conexión.** Activando modo offline. Algunas funciones están limitadas.";
          this.connectionStatus = "disconnected";
          this.connectionText = "Modo offline";
        } else if (error.response?.status === 429) {
          errorMessage = "🚫 **Demasiadas solicitudes.** Por favor, espera unos minutos antes de intentar de nuevo.";
        }

        this.addMessage("bot", errorMessage);
        
      } finally {
        this.isLoading = false;
        this.scrollToBottom();
        this.saveChatHistory();
      }
    },

    addMessage(sender, text) {
      const message = {
        sender,
        text,
        time: this.getCurrentTime(),
        timestamp: Date.now()
      };
      
      this.messages.push(message);
      this.hasNewMessage = !this.isOpen;
      
      // Auto-scroll
      this.$nextTick(() => {
        this.scrollToBottom();
      });
    },

    sendQuick(text) {
      this.userInput = text;
      this.sendMessage();
      
      // Ocultar sugerencias
      this.showSuggestion = false;
      if (this.suggestionTimeout) {
        clearTimeout(this.suggestionTimeout);
      }
    },

    handleInput() {
      // Mostrar sugerencias dinámicas basadas en input
      if (this.userInput.length > 2 && !this.isLoading) {
        // Podrías implementar sugerencias en tiempo real aquí
      }
    },

    clearInput() {
      this.userInput = "";
      if (this.$refs.messageInput) {
        this.$refs.messageInput.focus();
      }
    },

    scrollToBottom() {
      const container = this.$refs.messagesContainer;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
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
        minute: '2-digit',
        hour12: true
      });
    },

    formatMessage(text) {
      if (!text) return '';
      
      // Mejor formato para producción
      return text
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-blue-700 dark:text-blue-300">$1</strong>')
        .replace(/\!\!(.*?)\!\!/g, '<span class="text-red-600 font-medium">$1</span>')
        .replace(/##(.*?)##/g, '<div class="bg-blue-50 dark:bg-blue-900/20 p-2 rounded my-2">$1</div>')
        // Emojis como íconos
        .replace(/👋/g, '<span class="inline-block mr-1 animate-wave">👋</span>')
        .replace(/🏢/g, '<span class="inline-block mr-1">🏢</span>')
        .replace(/📅/g, '<span class="inline-block mr-1">📅</span>')
        .replace(/🐾/g, '<span class="inline-block mr-1">🐾</span>')
        .replace(/⭐/g, '<span class="inline-block mr-1 text-yellow-500">⭐</span>')
        .replace(/⚠️/g, '<span class="inline-block mr-1 text-yellow-500">⚠️</span>')
        .replace(/❌/g, '<span class="inline-block mr-1 text-red-500">❌</span>')
        .replace(/✅/g, '<span class="inline-block mr-1 text-green-500">✅</span>');
    },

    // Cache simple para respuestas frecuentes
    checkCache(query) {
      const normalized = query.toLowerCase().trim();
      const cacheKey = Object.keys(this.quickCache).find(key => 
        normalized.includes(key) || key.includes(normalized)
      );
      return cacheKey ? this.quickCache[cacheKey] : null;
    },

    addToCache(query, response) {
      const normalized = query.toLowerCase().trim();
      // Solo cachear si la respuesta es útil y no es un error
      if (response && !response.includes("Error") && !response.includes("Lo siento")) {
        this.quickCache[normalized.substring(0, 50)] = response;
        
        // Limitar tamaño del cache
        const keys = Object.keys(this.quickCache);
        if (keys.length > 20) {
          delete this.quickCache[keys[0]];
        }
      }
    },

    showSuggestionsAfterResponse() {
      this.suggestionTimeout = setTimeout(() => {
        this.showSuggestion = true;
        this.quickSuggestions = this.getQuickSuggestions();
      }, 1000);
    },

    // Guardar historial en localStorage
    saveChatHistory() {
      try {
        const history = {
          messages: this.messages.slice(-50), // Guardar últimas 50 mensajes
          lastUpdated: Date.now(),
          userRole: this.userRole
        };
        localStorage.setItem('petbot_chat_history', JSON.stringify(history));
      } catch (error) {
        console.warn("No se pudo guardar historial:", error);
      }
    },

    loadChatHistory() {
      try {
        const saved = localStorage.getItem('petbot_chat_history');
        if (saved) {
          const history = JSON.parse(saved);
          // Solo cargar si es del mismo rol y menos de 1 día
          if (history.userRole === this.userRole && 
              Date.now() - history.lastUpdated < 24 * 60 * 60 * 1000) {
            this.messages = history.messages;
            this.showWelcome = false; // No mostrar bienvenida si hay historial
          }
        }
      } catch (error) {
        console.warn("No se pudo cargar historial:", error);
      }
    }
  },

  watch: {
    isOpen(newVal) {
      if (newVal) {
        this.$nextTick(() => {
          this.scrollToBottom();
          this.checkScrollButtons();
          
          // Enfocar input cuando se abre
          if (this.$refs.messageInput) {
            setTimeout(() => {
              this.$refs.messageInput.focus();
            }, 300);
          }
        });
      }
    },

    messages: {
      handler() {
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      },
      deep: true
    },

    connectionStatus(newStatus) {
      const statusTexts = {
        connected: "✅ Conectado",
        connecting: "🔄 Conectando...",
        disconnected: "🌐 Modo offline"
      };
      this.connectionText = statusTexts[newStatus] || "Desconocido";
    }
  },

  mounted() {
    // Inicializar chat
    this.initializeChat();
    
    // Verificar scroll después de que se rendericen los botones
    this.$nextTick(() => {
      setTimeout(() => {
        this.checkScrollButtons();
      }, 100);
    });

    // Escuchar cambios de conexión
    window.addEventListener('online', () => {
      this.connectionStatus = "connected";
      this.connectionText = "Conectado";
    });
    
    window.addEventListener('offline', () => {
      this.connectionStatus = "disconnected";
      this.connectionText = "Modo offline";
    });

    // También verificar cuando cambia el tamaño de la ventana
    window.addEventListener('resize', this.checkScrollButtons);
    
    // Escuchar tecla Escape para cerrar chat
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.toggleChat();
      }
    });
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.checkScrollButtons);
    window.removeEventListener('online', () => {});
    window.removeEventListener('offline', () => {});
    document.removeEventListener('keydown', () => {});
    
    // Limpiar timeouts
    if (this.suggestionTimeout) {
      clearTimeout(this.suggestionTimeout);
    }
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

/* Botón flotante */
.chatbot-toggle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border: 2px solid #e2e8f0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
  padding: 0;
}

.chatbot-toggle:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
  border-color: #3b82f6;
}

.chatbot-toggle.has-notification {
  animation: pulse-button 2s infinite;
}

@keyframes pulse-button {
  0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
  100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
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
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.7; }
  100% { transform: scale(1); opacity: 1; }
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
  backdrop-filter: blur(10px);
}

/* Header mejorado */
.chatbot-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  position: relative;
}

.chatbot-avatar {
  width: 40px;
  height: 40px;
  object-fit: contain;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: white;
  padding: 2px;
}

.chatbot-info {
  flex: 1;
  min-width: 0;
}

.chatbot-info h3 {
  font-weight: bold;
  font-size: 14px;
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chatbot-subtitle {
  font-size: 11px;
  opacity: 0.9;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chatbot-business {
  margin: 4px 0 0 0;
}

.business-badge {
  display: inline-block;
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
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
  flex-shrink: 0;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
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

/* Mensaje de bienvenida */
.welcome-message {
  margin-bottom: 8px;
}

.welcome-bubble {
  background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
  border: 1px solid #c7d2fe;
  border-radius: 12px;
  padding: 16px;
  animation: slide-in 0.3s ease-out;
}

@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.welcome-bubble h4 {
  margin: 0 0 8px 0;
  font-size: 15px;
  font-weight: 600;
  color: #374151;
}

.welcome-bubble > p {
  margin: 0 0 12px 0;
  font-size: 13px;
  color: #4b5563;
  line-height: 1.4;
}

.welcome-features {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #374151;
}

.feature-icon {
  width: 16px;
  height: 16px;
  background: #3b82f6;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  flex-shrink: 0;
}

/* Contenedor de mensajes */
.message-container {
  display: flex;
  width: 100%;
  animation: message-appear 0.2s ease-out;
}

@keyframes message-appear {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-right {
  justify-content: flex-end;
}

.message-left {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 85%;
  padding: 12px 16px;
  border-radius: 18px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  animation: bubble-appear 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes bubble-appear {
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.message-user {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  border-bottom-right-radius: 6px;
}

.message-bot {
  background: white;
  color: #1f2937;
  border: 1px solid #e5e7eb;
  border-bottom-left-radius: 6px;
}

.message-content {
  font-size: 14px;
  line-height: 1.4;
}

.message-time {
  font-size: 11px;
  margin-top: 4px;
  text-align: right;
}

.message-time-user {
  color: rgba(255, 255, 255, 0.8);
}

.message-time-bot {
  color: #6b7280;
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
  animation: typing-pulse 1.5s infinite;
}

@keyframes typing-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
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
.suggestion-container {
  margin-top: 8px;
  animation: slide-up 0.3s ease-out;
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.suggestion-text {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 8px;
  text-align: center;
}

.suggestion-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
}

.suggestion-button {
  padding: 6px 12px;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  font-size: 11px;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.suggestion-button:hover {
  background: #e5e7eb;
  transform: translateY(-1px);
}

/* Botones rápidos MEJORADOS */
.quick-buttons-container {
  padding: 12px 16px;
  border-top: 1px solid #e5e7eb;
  background: #f8fafc;
  position: relative;
  flex-shrink: 0;
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
}

.quick-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  border-color: #3b82f6;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.quick-button:active:not(:disabled) {
  transform: translateY(0);
}

.quick-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

/* Input area mejorada */
.input-container {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border-top: 1px solid #e5e7eb;
  background: white;
  flex-shrink: 0;
}

.message-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  font-size: 14px;
  outline: none;
  transition: all 0.2s ease;
  background: white;
  min-width: 0;
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
  gap: 4px;
}

.clear-button {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.clear-button:hover {
  background: #e5e7eb;
  color: #374151;
}

.send-button {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border: none;
  border-radius: 12px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.send-button:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.send-button.loading {
  background: linear-gradient(135deg, #94a3b8, #cbd5e1);
}

.send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.send-icon {
  width: 20px;
  height: 20px;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid white;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Footer */
.chatbot-footer {
  padding: 8px 16px;
  border-top: 1px solid #e5e7eb;
  background: #f8fafc;
  flex-shrink: 0;
}

.footer-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.footer-text {
  font-size: 10px;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 4px;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
}

.status-dot.connected {
  background: #10b981;
  animation: pulse-green 2s infinite;
}

@keyframes pulse-green {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.status-dot.connecting {
  background: #f59e0b;
  animation: pulse-yellow 1.5s infinite;
}

@keyframes pulse-yellow {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.status-dot.disconnected {
  background: #ef4444;
}

/* Animaciones de ventana */
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

/* Animación wave para emoji */
.animate-wave {
  display: inline-block;
  animation: wave 2s infinite;
  transform-origin: 70% 70%;
}

@keyframes wave {
  0% { transform: rotate(0deg); }
  10% { transform: rotate(14deg); }
  20% { transform: rotate(-8deg); }
  30% { transform: rotate(14deg); }
  40% { transform: rotate(-4deg); }
  50% { transform: rotate(10deg); }
  60% { transform: rotate(0deg); }
  100% { transform: rotate(0deg); }
}

/* Responsive */
@media (max-width: 640px) {
  .chatbot-container {
    bottom: 16px;
    left: 16px;
    right: 16px;
  }
  
  .chatbot-window {
    width: calc(100vw - 32px);
    left: 16px;
    right: 16px;
    max-width: 400px;
    margin: 0 auto;
  }
  
  .chatbot-toggle {
    width: 56px;
    height: 56px;
  }
  
  .chatbot-avatar {
    width: 36px;
    height: 36px;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .chatbot-window {
    background: #1f2937;
    border-color: #374151;
  }
  
  .chatbot-messages {
    background: linear-gradient(to bottom, #111827, #1f2937);
  }
  
  .message-bot {
    background: #374151;
    color: #f9fafb;
    border-color: #4b5563;
  }
  
  .message-user {
    background: linear-gradient(135deg, #2563eb, #7c3aed);
  }
  
  .quick-buttons-container {
    background: #111827;
    border-color: #374151;
  }
  
  .quick-button {
    background: #374151;
    color: #d1d5db;
    border-color: #4b5563;
  }
  
  .input-container {
    background: #1f2937;
    border-color: #374151;
  }
  
  .message-input {
    background: #374151;
    color: #f9fafb;
    border-color: #4b5563;
  }
  
  .message-input:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
  }
  
  .clear-button {
    background: #374151;
    color: #9ca3af;
    border-color: #4b5563;
  }
  
  .chatbot-footer {
    background: #111827;
    border-color: #374151;
  }
  
  .footer-text {
    color: #9ca3af;
  }
  
  .welcome-bubble {
    background: linear-gradient(135deg, #374151, #4b5563);
    border-color: #4b5563;
  }
  
  .suggestion-button {
    background: #374151;
    color: #d1d5db;
    border-color: #4b5563;
  }
  
  .typing-bubble {
    background: #374151;
    border-color: #4b5563;
  }
}
</style>