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
      :class="{ 'pulse-animation': !isOpen && hasNewMessage }"
    >
      <img 
        src="/petbot.png"
        class="w-12 h-12 object-contain rounded-full"
        alt="PetBot"
      />
      <!-- Indicador de notificación -->
      <div v-if="!isOpen && hasNewMessage" class="notification-dot"></div>
    </button>

    <!-- Ventana del Chat - Posición más alta -->
    <transition name="chat-window">
      <div
        v-if="isOpen"
        class="chatbot-window"
      >
        <!-- Header -->
        <div class="chatbot-header">
          <img 
            src="/petbot2.png"
            class="chatbot-avatar"
            alt="PetBot"
          />
          <div class="chatbot-info">
            <h3>PetBot AI</h3>
            <p>{{ getRoleDescription() }}</p>
            <span v-if="serviceStatus !== 'online'" class="service-status">
              {{ getServiceStatusText() }}
            </span>
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
              <span class="typing-text">PetBot está escribiendo...</span>
            </div>
          </div>

          <!-- Mensaje de estado del servicio -->
          <div v-if="serviceStatus !== 'online' && messages.length > 0" class="service-status-message">
            <div class="status-bubble">
              <span v-if="serviceStatus === 'checking'">🔄 Verificando servicio...</span>
              <span v-if="serviceStatus === 'offline'">🔴 Servicio temporalmente no disponible</span>
              <span v-if="serviceStatus === 'error'">⚠️ Error de conexión</span>
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
                :disabled="isLoading || serviceStatus !== 'online'"
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
            :disabled="isLoading || serviceStatus !== 'online'"
            :placeholder="getInputPlaceholder()"
            class="message-input"
            maxlength="500"
          />
          <button
            @click="sendMessage"
            :disabled="isLoading || !userInput.trim() || serviceStatus !== 'online'"
            class="send-button"
            :title="serviceStatus !== 'online' ? 'Servicio no disponible' : 'Enviar mensaje'"
          >
            <svg v-if="!isLoading" class="send-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
            </svg>
            <div v-else class="loading-spinner"></div>
          </button>
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
      serviceStatus: "checking", // checking | online | offline | error
      lastStatusCheck: null
    };
  },
  computed: {
    quickOptions() {
      const optionsByRole = {
        client: [
          "Buscar comercios", 
          "Servicios disponibles", 
          "Mis citas", 
          "Mis mascotas", 
          "Agendar cita",
          "Precios generales",
          "Emergencias",
          "Cómo funciona"
        ],
        provider: [
          "Mi comercio",
          "Citas hoy",
          "Mi agenda",
          "Estadísticas",
          "Mis ingresos",
          "Clientes recientes",
          "Actualizar servicios",
          "Reportes"
        ],
        admin: [
          "Comercios pendientes",
          "Usuarios registrados",
          "Todas las citas",
          "Reportes del sistema",
          "Estadísticas globales",
          "Aprobar comercios",
          "Monitoreo",
          "Soporte"
        ]
      };
      
      return optionsByRole[this.userRole] || optionsByRole.client;
    },

    // ✅ URL base dinámica - SIMPLIFICADA
    apiBaseUrl() {
      // En desarrollo: localhost
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:4000';
      }
      // En producción: usar URL relativa
      return '';
    },

    // ✅ URL para POST de chat
    chatApiUrl() {
      return `${this.apiBaseUrl}/api/chat`;
    },

    // ✅ URL para GET de status
    chatStatusUrl() {
      return `${this.apiBaseUrl}/api/chat/status`;
    }
  },
  methods: {
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

    getServiceStatusText() {
      const statusTexts = {
        checking: "🔄 Conectando...",
        online: "✅ En línea",
        offline: "🔴 Offline",
        error: "⚠️ Error"
      };
      return statusTexts[this.serviceStatus] || "";
    },

    getInputPlaceholder() {
      if (this.serviceStatus !== 'online') {
        return "Servicio temporalmente no disponible...";
      }
      
      const placeholders = {
        client: "Pregunta sobre comercios, servicios o tus mascotas...",
        provider: "Consulta tu comercio, agenda o estadísticas...",
        admin: "Consulta comercios, usuarios o reportes del sistema..."
      };
      return placeholders[this.userRole] || "Escribe tu mensaje...";
    },

    toggleChat() {
      this.isOpen = !this.isOpen;
      if (this.isOpen && this.messages.length === 0) {
        this.addWelcomeMessage();
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

Como **cliente**, puedo ayudarte con:
• 🏪 Buscar comercios cercanos  
• 🛎️ Servicios disponibles
• 📅 Tus citas y reservas
• 🐾 Información de tus mascotas  
• 💰 Precios y promociones
• 🏥 Emergencias veterinarias

¿En qué puedo ayudarte hoy?`,

        provider: `¡Hola! 💼 Soy PetBot, tu asistente para la gestión de tu comercio.

Como **proveedor**, puedo ayudarte con:
• 📊 Gestión de tu perfil de comercio
• 📅 Agenda y citas del día
• 📈 Estadísticas de tu negocio
• 👥 Información de clientes
• 💰 Reportes de ingresos
• ⭐ Reseñas y calificaciones

¿Qué área de tu negocio necesitas gestionar?`,

        admin: `¡Hola! 👨‍💼 Soy PetBot, tu asistente administrativo.

Como **administrador**, puedo ayudarte con:
• 🏪 Gestión de comercios registrados
• 👥 Usuarios del sistema
• ✅ Aprobación de solicitudes
• 📊 Reportes y estadísticas globales
• ⚙️ Monitoreo de la plataforma
• 🛡️ Seguridad y soporte

¿Qué funcionalidad administrativa necesitas?`
      };

      const message = welcomeMessages[this.userRole] || welcomeMessages.client;
      this.messages.push({ 
        sender: "bot", 
        text: message,
        time: this.getCurrentTime()
      });
    },

    async sendMessage() {
      if (!this.userInput.trim() || this.isLoading || this.serviceStatus !== 'online') return;

      const text = this.userInput.trim();
      this.messages.push({ 
        sender: "me", 
        text: text,
        time: this.getCurrentTime()
      });
      this.userInput = "";
      this.isLoading = true;

      try {
        const token = localStorage.getItem("token");
        
        if (!token) {
          throw new Error("No hay token de autenticación");
        }

        console.log('🌐 Enviando mensaje POST a:', this.chatApiUrl);
        console.log('📝 Mensaje:', text.substring(0, 50) + '...');
        
        // ✅ USAR AXIOS CON POST - MÉTODO CORRECTO
        const res = await axios.post(
          this.chatApiUrl,
          { message: text },
          { 
            headers: { 
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            },
            timeout: 30000 // 30 segundos
          }
        );

        console.log('✅ Respuesta recibida. Status:', res.status);
        
        // Verificar estructura de respuesta
        if (!res.data || typeof res.data !== 'object') {
          throw new Error("Respuesta inválida del servidor");
        }

        let botReply = "";
        
        if (res.data.success !== false && res.data.reply) {
          botReply = res.data.reply;
        } else if (res.data.error) {
          botReply = `⚠️ **Error:** ${res.data.error}`;
        } else {
          botReply = "🤖 Recibí tu mensaje, pero no obtuve una respuesta válida.";
        }

        this.messages.push({
          sender: "bot",
          text: botReply,
          time: this.getCurrentTime()
        });

        // Actualizar estado a online si fue exitoso
        if (this.serviceStatus !== 'online') {
          this.serviceStatus = 'online';
        }

        if (!this.isOpen && !this.bubbleHidden) {
          setTimeout(() => {
            this.showBubble();
          }, 5000);
        }

      } catch (error) {
        console.error("❌ Error en chat:", error);
        
        let errorMessage = "";
        
        if (error.response) {
          // Error con respuesta del servidor
          const { status, data } = error.response;
          
          switch(status) {
            case 401:
              errorMessage = "🔐 **Sesión expirada.** Por favor, inicia sesión nuevamente.";
              break;
            case 404:
              errorMessage = "🔍 **Endpoint no encontrado.** Verifica la URL del servicio.";
              this.serviceStatus = 'offline';
              break;
            case 405:
              errorMessage = "⚠️ **Método incorrecto.** El backend espera POST, no GET.";
              this.serviceStatus = 'error';
              break;
            case 500:
              errorMessage = "⚙️ **Error del servidor.** Nuestro equipo está trabajando en solucionarlo.";
              this.serviceStatus = 'error';
              break;
            default:
              errorMessage = `⚠️ **Error ${status}:** ${data?.error || 'Error del servidor'}`;
          }
        } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
          errorMessage = "⏰ **Tiempo de espera agotado.** El servicio está respondiendo lentamente.";
        } else if (error.message.includes("Network Error") || error.code === 'ERR_NETWORK') {
          errorMessage = "🌐 **Error de conexión.** Verifica tu conexión a internet.";
          this.serviceStatus = 'offline';
        } else if (error.message.includes("token")) {
          errorMessage = "🔐 **Sesión expirada.** Por favor, inicia sesión nuevamente.";
        } else {
          errorMessage = "🤖 **Lo siento, ocurrió un error inesperado.** Intenta nuevamente en unos momentos.";
          this.serviceStatus = 'error';
        }

        this.messages.push({
          sender: "bot",
          text: errorMessage,
          time: this.getCurrentTime()
        });

      } finally {
        this.isLoading = false;
        this.scrollToBottom();
      }
    },

    sendQuick(text) {
      this.userInput = text;
      this.sendMessage();
    },

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
      
      return text
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
        .replace(/•/g, '•')
        .replace(/📅/g, '<span class="inline-block mr-1">📅</span>')
        .replace(/🐾/g, '<span class="inline-block mr-1">🐾</span>')
        .replace(/🛎️/g, '<span class="inline-block mr-1">🛎️</span>')
        .replace(/💰/g, '<span class="inline-block mr-1">💰</span>')
        .replace(/🏥/g, '<span class="inline-block mr-1">🏥</span>')
        .replace(/📊/g, '<span class="inline-block mr-1">📊</span>')
        .replace(/👥/g, '<span class="inline-block mr-1">👥</span>')
        .replace(/⚙️/g, '<span class="inline-block mr-1">⚙️</span>')
        .replace(/🏪/g, '<span class="inline-block mr-1">🏪</span>')
        .replace(/⭐/g, '<span class="inline-block mr-1">⭐</span>')
        .replace(/🛡️/g, '<span class="inline-block mr-1">🛡️</span>')
        .replace(/👋/g, '<span class="inline-block mr-1">👋</span>')
        .replace(/💼/g, '<span class="inline-block mr-1">💼</span>')
        .replace(/👨‍💼/g, '<span class="inline-block mr-1">👨‍💼</span>')
        .replace(/✅/g, '<span class="inline-block mr-1">✅</span>')
        .replace(/⚠️/g, '<span class="inline-block mr-1">⚠️</span>')
        .replace(/🔐/g, '<span class="inline-block mr-1">🔐</span>')
        .replace(/🌐/g, '<span class="inline-block mr-1">🌐</span>')
        .replace(/⏰/g, '<span class="inline-block mr-1">⏰</span>')
        .replace(/🔍/g, '<span class="inline-block mr-1">🔍</span>')
        .replace(/⚙️/g, '<span class="inline-block mr-1">⚙️</span>')
        .replace(/🔄/g, '<span class="inline-block mr-1">🔄</span>')
        .replace(/🔴/g, '<span class="inline-block mr-1">🔴</span>');
    },

    scheduleHelpBubble() {
      if (this.bubbleHidden) return;
      
      setTimeout(() => {
        if (!this.isOpen && !this.bubbleHidden) {
          this.showHelpBubble = true;
        }
      }, 3000);
    },

    async checkServiceStatus() {
      try {
        console.log('🔍 Verificando estado del servicio de chat...');
        
        // Verificar endpoint público
        try {
          console.log('📡 Probando GET a:', this.chatStatusUrl);
          const statusRes = await axios.get(this.chatStatusUrl, { 
            timeout: 5000 
          });
          
          if (statusRes.data.status === 'online') {
            console.log('✅ Servicio en línea');
            this.serviceStatus = 'online';
            this.lastStatusCheck = new Date();
            return true;
          }
        } catch (statusError) {
          console.log('⚠️ Status check falló:', statusError.message);
          
          // NO intentar GET a /api/chat - eso causará error 405
          this.serviceStatus = 'offline';
        }
        
        return false;
      } catch (error) {
        console.error('❌ Error verificando estado:', error.message);
        this.serviceStatus = 'error';
        return false;
      }
    },

    // ✅ REMOVER monitoreo de peticiones GET - ya está resuelto en el backend
    // No necesitamos interceptar peticiones GET, el backend ya las maneja
  },

  watch: {
    isOpen(newVal) {
      if (newVal) {
        this.$nextTick(() => {
          this.scrollToBottom();
          this.checkScrollButtons();
        });
        this.showHelpBubble = false;
        
        // Si el servicio no está disponible, mostrar mensaje
        if (this.serviceStatus !== 'online' && this.messages.length === 1) {
          const statusMessage = {
            checking: "🔄 **Conectando al servicio...**\n\nEsperando respuesta del servidor de chat.",
            offline: "🔴 **Servicio no disponible**\n\nEl chatbot está temporalmente fuera de línea. Intenta más tarde.",
            error: "⚠️ **Error de conexión**\n\nNo se pudo conectar con el servicio de chat."
          };
          
          this.messages.push({
            sender: "bot",
            text: statusMessage[this.serviceStatus] || "El servicio de chat no está disponible.",
            time: this.getCurrentTime()
          });
        }
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
    },

    userRole(newRole) {
      if (this.isOpen && this.messages.length > 0) {
        if (this.messages[0].sender === 'bot' && this.messages[0].text.includes('Soy PetBot')) {
          this.messages.splice(0, 1);
        }
        this.addWelcomeMessage();
      }
    },

    serviceStatus(newStatus) {
      console.log('🔄 Estado del servicio cambiado a:', newStatus);
      
      // Si cambia a online, actualizar el placeholder
      if (newStatus === 'online' && this.isOpen) {
        this.$nextTick(() => {
          const input = this.$el.querySelector('.message-input');
          if (input) {
            input.placeholder = this.getInputPlaceholder();
          }
        });
      }
    }
  },

  mounted() {
    // Obtener el rol del usuario
    this.userRole = this.getUserRole();
    
    // Verificar si el usuario ocultó la burbuja anteriormente
    const bubbleHidden = localStorage.getItem('chatbot_bubble_hidden');
    if (bubbleHidden === 'true') {
      this.bubbleHidden = true;
      this.showHelpBubble = false;
    }
    
    // Verificar estado del servicio
    this.checkServiceStatus();
    
    // Programar verificación periódica cada 30 segundos
    this.statusCheckInterval = setInterval(() => {
      if (this.serviceStatus !== 'online') {
        this.checkServiceStatus();
      }
    }, 30000);
    
    // Programar mostrar burbuja de ayuda
    this.scheduleHelpBubble();
    
    // Verificar scroll
    this.$nextTick(() => {
      setTimeout(() => {
        this.checkScrollButtons();
      }, 100);
    });

    // Event listeners
    window.addEventListener('resize', this.checkScrollButtons);

    document.addEventListener('click', (event) => {
      const chatbotContainer = this.$el;
      const helpBubble = chatbotContainer?.querySelector('.help-bubble');
      
      if (helpBubble && 
          !helpBubble.contains(event.target) && 
          !chatbotContainer.querySelector('.chatbot-toggle').contains(event.target)) {
        this.hideBubble();
      }
    });

    // Escuchar cambios en el store de usuario
    const userStore = useUserStore();
    this.userStoreUnsubscribe = userStore.$subscribe((mutation, state) => {
      if (state.user?.role !== this.userRole) {
        this.userRole = state.user?.role || "client";
      }
    });

    console.log('🤖 ChatBot inicializado');
    console.log('📡 Endpoint POST:', this.chatApiUrl);
    console.log('📡 Endpoint Status (GET):', this.chatStatusUrl);
    console.log('👤 Rol usuario:', this.userRole);
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.checkScrollButtons);
    document.removeEventListener('click', this.hideBubble);
    
    if (this.statusCheckInterval) {
      clearInterval(this.statusCheckInterval);
    }
    
    if (this.userStoreUnsubscribe) {
      this.userStoreUnsubscribe();
    }
  }
};
</script>

<style scoped>
/* Todos los estilos CSS se mantienen igual que en tu archivo */
.chatbot-container {
  position: fixed;
  bottom: 20px;
  left: 20px;
  z-index: 1000;
}

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

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

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

.chatbot-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  position: relative;
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
  display: flex;
  align-items: center;
  gap: 8px;
}

.chatbot-info p {
  font-size: 12px;
  opacity: 0.9;
  margin: 2px 0 0 0;
}

.service-status {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.2);
  margin-left: 8px;
  font-weight: 500;
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
  padding: 12px 16px;
  border-radius: 18px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.message-user {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
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

.message-content :deep(strong) {
  font-weight: 600;
}

.message-content :deep(em) {
  font-style: italic;
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

.service-status-message {
  display: flex;
  justify-content: center;
  margin-top: 8px;
}

.status-bubble {
  background: #fef3c7;
  border: 1px solid #f59e0b;
  color: #92400e;
  padding: 8px 12px;
  border-radius: 12px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

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
}

.quick-button:hover:not(:disabled) {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
}

.quick-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  background: #f3f4f6;
  color: #9ca3af;
}

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

.input-container {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border-top: 1px solid #e5e7eb;
  background: white;
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
}

.message-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.message-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f9fafb;
}

.send-button {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  border: none;
  border-radius: 12px;
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

.send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  background: #9ca3af;
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
}

@media (prefers-color-scheme: dark) {
  .help-bubble {
    background: #1f2937;
    border-color: #374151;
    color: white;
  }
  
  .bubble-arrow {
    background: #1f2937;
    border-color: #374151;
  }
  
  .bubble-text {
    color: #f9fafb;
  }
  
  .bubble-subtext {
    color: #d1d5db;
  }
  
  .bubble-close {
    background: #374151;
    color: #d1d5db;
  }
  
  .bubble-close:hover {
    background: #ef4444;
    color: white;
  }
  
  .chatbot-toggle {
    background: #1f2937;
    border-color: #374151;
  }
  
  .chatbot-window {
    background: #1f2937;
    border-color: #374151;
  }
  
  .chatbot-messages {
    background: linear-gradient(to bottom, #111827, #1f2937);
  }
  
  .message-bot {
    background: #374151;
    border-color: #4b5563;
    color: #f9fafb;
  }
  
  .typing-bubble {
    background: #374151;
    border-color: #4b5563;
  }
  
  .typing-text {
    color: #d1d5db;
  }
  
  .status-bubble {
    background: #451a03;
    border-color: #9a3412;
    color: #fdba74;
  }
  
  .quick-buttons-container {
    background: #111827;
    border-color: #374151;
  }
  
  .quick-button {
    background: #374151;
    border-color: #4b5563;
    color: #f9fafb;
  }
  
  .quick-button:disabled {
    background: #1f2937;
    color: #6b7280;
  }
  
  .scroll-button {
    background: #374151;
    border-color: #4b5563;
    color: #f9fafb;
  }
  
  .input-container {
    background: #1f2937;
    border-color: #374151;
  }
  
  .message-input {
    background: #374151;
    border-color: #4b5563;
    color: #f9fafb;
  }
  
  .message-input:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
  }
  
  .send-button:disabled {
    background: #4b5563;
  }
}
</style>