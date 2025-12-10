<template>
  <!-- ChatBot Container -->
  <div class="chatbot-container">
    <!-- Mensaje de ayuda flotante -->
    <transition name="help-message">
      <div v-if="!isOpen" class="help-bubble">
        <div class="help-text">¿Necesitas ayuda?</div>
        <div class="help-arrow"></div>
      </div>
    </transition>

    <!-- Botón flotante -->
    <button
      @click="toggleChat"
      class="chatbot-toggle"
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
      showHelpBubble: true
    };
  },
  computed: {
    quickOptions() {
      // Opciones diferentes según el rol del usuario
      const optionsByRole = {
        client: [
          "Mis citas", 
          "Mis mascotas", 
          "Servicios disponibles", 
          "Agendar cita",
          "Precios",
          "Emergencias",
          "Vacunación",
          "Peluquería"
        ],
        provider: [
          "Citas hoy",
          "Mis servicios",
          "Estadísticas",
          "Ingresos",
          "Clientes",
          "Agenda",
          "Servicios activos",
          "Reportes"
        ],
        admin: [
          "Proveedores pendientes",
          "Usuarios registrados",
          "Todas las citas",
          "Reportes sistema",
          "Servicios globales",
          "Estadísticas",
          "Aprobaciones",
          "Monitoreo"
        ]
      };
      
      return optionsByRole[this.userRole] || optionsByRole.client;
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
        client: "Pregunta sobre tus mascotas, citas o servicios...",
        provider: "Consulta tu agenda, servicios o estadísticas...",
        admin: "Consulta usuarios, proveedores o reportes del sistema..."
      };
      return placeholders[this.userRole] || "Escribe tu mensaje...";
    },

    toggleChat() {
      this.isOpen = !this.isOpen;
      if (this.isOpen && this.messages.length === 0) {
        this.addWelcomeMessage();
        this.showHelpBubble = false;
      } else if (!this.isOpen) {
        // Mostrar el mensaje de ayuda después de cerrar el chat
        setTimeout(() => {
          this.showHelpBubble = true;
        }, 2000);
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
• 📅 Tus citas y reservas
• 🐾 Información de tus mascotas  
• 🛎️ Servicios disponibles
• 💰 Precios y promociones
• 🏥 Emergencias veterinarias

¿En qué puedo ayudarte hoy?`,

        provider: `¡Hola! 💼 Soy PetBot, tu asistente para la gestión de servicios.

Como **proveedor**, puedo ayudarte con:
• 📊 Tu agenda y citas del día
• 🛎️ Gestión de tus servicios
• 📈 Estadísticas de negocio
• 👥 Información de clientes
• 💰 Reportes de ingresos

¿Qué área de tu negocio necesitas gestionar?`,

        admin: `¡Hola! 👨‍💼 Soy PetBot, tu asistente administrativo.

Como **administrador**, puedo ayudarte con:
• 👥 Gestión de usuarios del sistema
• 🏢 Aprobación de proveedores
• 📊 Reportes y estadísticas globales
• 🛎️ Control de servicios
• ⚙️ Monitoreo de la plataforma

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

        const res = await axios.post(
          "http://localhost:4000/api/chat",
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
        .replace(/⚙️/g, '<span class="inline-block mr-1">⚙️</span>');
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
      },
      deep: true
    }
  },

  mounted() {
    // Obtener el rol del usuario al montar el componente
    this.userRole = this.getUserRole();
    
    // Verificar scroll después de que se rendericen los botones
    this.$nextTick(() => {
      setTimeout(() => {
        this.checkScrollButtons();
      }, 100);
    });

    // También verificar cuando cambia el tamaño de la ventana
    window.addEventListener('resize', this.checkScrollButtons);

    // Ocultar el mensaje de ayuda después de 8 segundos
    setTimeout(() => {
      this.showHelpBubble = false;
    }, 8000);
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

/* Mensaje de ayuda flotante */
.help-bubble {
  position: absolute;
  bottom: 70px;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  color: #3b82f6;
  padding: 10px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 2px solid #3b82f6;
  white-space: nowrap;
  animation: float 3s ease-in-out infinite;
  z-index: 1001;
}

.help-bubble::before {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 8px solid transparent;
  border-top-color: white;
}

.help-bubble::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 10px solid transparent;
  border-top-color: #3b82f6;
  margin-top: -2px;
  z-index: -1;
}

.help-text {
  position: relative;
  z-index: 2;
}

@keyframes float {
  0%, 100% {
    transform: translateX(-50%) translateY(0);
  }
  50% {
    transform: translateX(-50%) translateY(-5px);
  }
}

.help-message-enter-active {
  transition: all 0.3s ease;
}

.help-message-leave-active {
  transition: all 0.5s ease;
}

.help-message-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(10px);
}

.help-message-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-10px);
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

/* Ventana del chat - POSICIÓN MÁS ALTA */
.chatbot-window {
  position: fixed;
  bottom: 90px; /* Más arriba que antes */
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
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
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

/* Botones rápidos MEJORADO CON SCROLL HORIZONTAL */
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
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

.quick-buttons-scroll::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
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
</style>