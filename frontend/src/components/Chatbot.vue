<template>
  <!-- ChatBot Container -->
  <div class="chatbot-container">
    <!-- Mensaje FIJO arriba del botón (Siempre visible cuando el chat está cerrado) -->
    <div 
      v-if="!isOpen" 
      class="fixed-help-message"
      @click="toggleChat"
    >
      <div class="fixed-message-content">
        <span class="fixed-text">¿Necesitas ayuda?</span>
        <span class="fixed-subtext">¡Haz clic para chatear!</span>
      </div>
      <div class="fixed-arrow"></div>
    </div>

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
          <div class="input-wrapper">
            <input
              v-model="userInput"
              @keyup.enter="sendMessage"
              :disabled="isLoading"
              :placeholder="getInputPlaceholder()"
              class="message-input"
              maxlength="500"
            />
            <button
              @click="sendMessage"
              :disabled="isLoading || !userInput.trim()"
              class="send-button"
              title="Enviar mensaje"
            >
              <svg v-if="!isLoading" class="send-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
              </svg>
              <div v-else class="loading-spinner"></div>
            </button>
          </div>
          <div v-if="userInput.length > 0" class="char-counter">
            {{ userInput.length }}/500
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
      userRole: "client"
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

    toggleChat() {
      this.isOpen = !this.isOpen;
      if (this.isOpen && this.messages.length === 0) {
        this.addWelcomeMessage();
      }
      this.hasNewMessage = false;
      this.$nextTick(() => {
        this.scrollToBottom();
        this.checkScrollButtons();
      });
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
      if (!this.userInput.trim() || this.isLoading) return;

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

        const apiUrl = this.apiBaseUrl 
          ? `${this.apiBaseUrl}/api/chat`
          : '/api/chat';

        const res = await axios.post(
          apiUrl,
          { message: text },
          { 
            headers: { 
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            },
            timeout: 30000
          }
        );

        if (res.data.error) {
          throw new Error(res.data.error);
        }

        this.messages.push({
          sender: "bot",
          text: res.data.reply || "Lo siento, no pude generar una respuesta.",
          time: this.getCurrentTime()
        });

      } catch (error) {
        console.error("Chat error:", error);
        
        let errorMessage = "❌ Error al conectar con PetBot.";
        
        if (error.response?.status === 401) {
          errorMessage = "🔐 Por favor, inicia sesión nuevamente.";
        } else if (error.response?.status === 400) {
          errorMessage = "📝 Por favor, escribe un mensaje válido.";
        } else if (error.code === 'ECONNABORTED') {
          errorMessage = "⏰ El servicio está tardando en responder. Intenta nuevamente.";
        } else if (error.message.includes("token")) {
          errorMessage = "🔐 Sesión expirada. Por favor, inicia sesión nuevamente.";
        } else if (error.message.includes("Network Error") || error.code === 'ERR_NETWORK') {
          errorMessage = `🌐 **Error de conexión.**\n\nVerifica tu conexión a internet o intenta más tarde.`;
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
        .replace(/🛡️/g, '<span class="inline-block mr-1">🛡️</span>');
    },

    applyEmergencyPatch() {
      if (window.CHATBOT_PATCH_APPLIED) return;
      
      console.log('🔧 Aplicando parche de emergencia para API...');
      
      const isProduction = window.location.hostname.includes('onrender.com') && 
                          !window.location.hostname.includes('localhost');
      
      if (isProduction) {
        const originalXHROpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function(method, url, async, user, pass) {
          if (typeof url === 'string') {
            if (url.includes('localhost:4000')) {
              url = url.replace('http://localhost:4000', '');
            }
            if (url.includes('localhost:10000')) {
              url = url.replace('http://localhost:10000', '');
            }
          }
          return originalXHROpen.call(this, method, url, async, user, pass);
        };
      }
      
      window.CHATBOT_PATCH_APPLIED = true;
    }
  },

  watch: {
    isOpen(newVal) {
      if (newVal) {
        this.$nextTick(() => {
          this.scrollToBottom();
          this.checkScrollButtons();
        });
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
    this.userRole = this.getUserRole();
    
    this.applyEmergencyPatch();
    
    this.$nextTick(() => {
      setTimeout(() => {
        this.checkScrollButtons();
      }, 100);
    });

    window.addEventListener('resize', this.checkScrollButtons);
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.checkScrollButtons);
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

/* =========================================== */
/* MENSAJE FIJO ARRIBA DEL BOTÓN (NUNCA DESAPARECE) */
/* =========================================== */
.fixed-help-message {
  position: absolute;
  bottom: 75px;
  left: 10px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  border-radius: 20px;
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
  padding: 14px 18px;
  width: 220px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  z-index: 1001;
  animation: fixed-float 3s ease-in-out infinite;
}

.fixed-help-message:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 12px 30px rgba(59, 130, 246, 0.4);
  background: linear-gradient(135deg, #1d4ed8, #3b82f6);
}

.fixed-message-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.fixed-text {
  font-weight: 700;
  font-size: 14px;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.fixed-subtext {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
  opacity: 0.9;
}

.fixed-arrow {
  position: absolute;
  bottom: -10px;
  left: 25px;
  width: 20px;
  height: 20px;
  background: #3b82f6;
  transform: rotate(45deg);
  border-bottom-right-radius: 4px;
}

/* Animación para el mensaje fijo */
@keyframes fixed-float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

/* Botón flotante */
.chatbot-toggle {
  width: 65px;
  height: 65px;
  border-radius: 50%;
  background: white;
  border: 3px solid #3b82f6;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.chatbot-toggle:hover {
  transform: scale(1.15) rotate(5deg);
  box-shadow: 0 10px 30px rgba(59, 130, 246, 0.4);
  border-color: #1d4ed8;
}

.chatbot-toggle.pulse-animation {
  animation: pulse-button 2s infinite;
}

@keyframes pulse-button {
  0% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7), 0 6px 20px rgba(0, 0, 0, 0.2);
  }
  70% {
    box-shadow: 0 0 0 12px rgba(59, 130, 246, 0), 0 6px 20px rgba(0, 0, 0, 0.2);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0), 0 6px 20px rgba(0, 0, 0, 0.2);
  }
}

.notification-dot {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 14px;
  height: 14px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  border-radius: 50%;
  border: 2px solid white;
  animation: pulse 1.5s infinite;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.8; }
}

/* Ventana del chat */
.chatbot-window {
  position: fixed;
  bottom: 90px;
  left: 20px;
  width: 380px;
  height: 520px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.25);
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  backdrop-filter: blur(10px);
}

/* Header */
.chatbot-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.chatbot-avatar {
  width: 45px;
  height: 45px;
  object-fit: contain;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.8);
  background: white;
  padding: 2px;
}

.chatbot-info {
  flex: 1;
}

.chatbot-info h3 {
  font-weight: bold;
  font-size: 16px;
  margin: 0;
  letter-spacing: 0.5px;
}

.chatbot-info p {
  font-size: 12px;
  opacity: 0.9;
  margin: 2px 0 0 0;
  font-weight: 400;
}

.close-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(5px);
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg) scale(1.1);
}

/* Área de mensajes */
.chatbot-messages {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  background: linear-gradient(to bottom, #f8fafc, #ffffff);
  display: flex;
  flex-direction: column;
  gap: 16px;
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
  max-width: 82%;
  padding: 14px 18px;
  border-radius: 22px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
  position: relative;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.message-user {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  border-bottom-right-radius: 8px;
  margin-left: auto;
}

.message-bot {
  background: white;
  color: #1f2937;
  border: 1px solid #e5e7eb;
  border-bottom-left-radius: 8px;
  margin-right: auto;
}

.message-content {
  font-size: 14px;
  line-height: 1.5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.message-content >>> strong {
  font-weight: 600;
}

.message-content >>> em {
  font-style: italic;
}

.message-time {
  font-size: 11px;
  margin-top: 6px;
  text-align: right;
  opacity: 0.7;
  font-weight: 500;
}

.message-time-user {
  color: rgba(255, 255, 255, 0.85);
}

.message-time-bot {
  color: #6b7280;
}

/* Typing indicator */
.typing-indicator {
  display: flex;
  justify-content: flex-start;
  margin-top: 4px;
}

.typing-bubble {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 22px;
  border-bottom-left-radius: 8px;
  padding: 14px 18px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.typing-dots {
  display: flex;
  gap: 5px;
}

.dot {
  width: 7px;
  height: 7px;
  background: #3b82f6;
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
    transform: translateY(-5px);
    opacity: 1;
  }
}

.typing-text {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

/* Botones rápidos */
.quick-buttons-container {
  padding: 14px 16px;
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
  gap: 10px;
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
  padding: 10px 16px;
  background: white;
  border: 1.5px solid #d1d5db;
  border-radius: 14px;
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  min-width: max-content;
  letter-spacing: 0.3px;
}

.quick-button:hover:not(:disabled) {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.quick-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
}

/* Botones de scroll */
.scroll-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 28px;
  height: 28px;
  background: white;
  border: 1.5px solid #d1d5db;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  color: #374151;
  cursor: pointer;
  z-index: 10;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  backdrop-filter: blur(5px);
}

.scroll-button:hover {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
  transform: translateY(-50%) scale(1.1);
}

.scroll-left {
  left: -12px;
}

.scroll-right {
  right: -12px;
}

/* Input area */
.input-container {
  padding: 16px;
  border-top: 1px solid #e5e7eb;
  background: white;
  flex-shrink: 0;
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
}

.message-input {
  flex: 1;
  padding: 14px 16px;
  padding-right: 50px;
  border: 2px solid #d1d5db;
  border-radius: 16px;
  font-size: 14px;
  outline: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.5;
}

.message-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
}

.message-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #f9fafb;
}

.send-button {
  position: absolute;
  right: 8px;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  border: none;
  border-radius: 12px;
  color: white;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.send-button:hover:not(:disabled) {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
  background: linear-gradient(135deg, #1d4ed8, #3b82f6);
}

.send-button:active:not(:disabled) {
  transform: scale(0.95);
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
  transform: rotate(0deg);
  transition: transform 0.2s ease;
}

.send-button:hover:not(:disabled) .send-icon {
  transform: rotate(-5deg);
}

.loading-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid white;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.char-counter {
  font-size: 11px;
  color: #6b7280;
  text-align: right;
  margin-top: 6px;
  font-weight: 500;
  opacity: 0.7;
}

/* Animaciones */
.chat-window-enter-active,
.chat-window-leave-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.chat-window-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.9);
}

.chat-window-leave-to {
  opacity: 0;
  transform: translateY(30px) scale(0.9);
}

/* Scroll personalizado */
.chatbot-messages::-webkit-scrollbar {
  width: 6px;
}

.chatbot-messages::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 10px;
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
    bottom: 15px;
    left: 15px;
  }
  
  .fixed-help-message {
    width: 200px;
    left: 5px;
    bottom: 70px;
    padding: 12px 16px;
  }
  
  .chatbot-window {
    width: calc(100vw - 40px);
    max-width: 380px;
    left: 15px;
    bottom: 80px;
    height: 500px;
    border-radius: 18px;
  }
  
  .chatbot-toggle {
    width: 60px;
    height: 60px;
  }
  
  .message-bubble {
    max-width: 88%;
    padding: 12px 16px;
  }
  
  .quick-button {
    padding: 9px 14px;
    font-size: 11px;
  }
  
  .message-input {
    padding: 12px 14px;
    padding-right: 46px;
    font-size: 13px;
  }
  
  .send-button {
    width: 36px;
    height: 36px;
    right: 6px;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .fixed-help-message {
    background: linear-gradient(135deg, #1e40af, #1e3a8a);
    border-color: rgba(255, 255, 255, 0.1);
  }
  
  .fixed-arrow {
    background: #1e40af;
  }
  
  .chatbot-toggle {
    background: #1f2937;
    border-color: #3b82f6;
  }
  
  .chatbot-window {
    background: #1f2937;
    border-color: #374151;
  }
  
  .chatbot-header {
    background: linear-gradient(135deg, #1e40af, #1e3a8a);
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
  
  .quick-buttons-container {
    background: #111827;
    border-color: #374151;
  }
  
  .quick-button {
    background: #374151;
    border-color: #4b5563;
    color: #f9fafb;
  }
  
  .quick-button:hover:not(:disabled) {
    background: #3b82f6;
    border-color: #3b82f6;
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
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.25);
  }
  
  .char-counter {
    color: #9ca3af;
  }
  
  .chatbot-messages::-webkit-scrollbar-thumb {
    background: #4b5563;
  }
  
  .chatbot-messages::-webkit-scrollbar-thumb:hover {
    background: #6b7280;
  }
}
</style>