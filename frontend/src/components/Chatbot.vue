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
      showHelpBubble: true,
      bubbleHidden: false
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

    // ✅ Computada para obtener la URL base dinámica
    apiBaseUrl() {
      // Si estamos en desarrollo local (localhost)
      if (window.location.hostname === 'localhost' || 
          window.location.hostname === '127.0.0.1') {
        return 'http://localhost:4000';
      }
      
      // Si estamos en Render (mismo dominio para frontend y backend)
      // Usamos URL relativa cuando están en el mismo dominio
      if (window.location.hostname.includes('onrender.com')) {
        return ''; // URL relativa - mismo dominio
      }
      
      // Por defecto, usar el mismo dominio
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
      this.showHelpBubble = false;
      this.$nextTick(() => {
        this.scrollToBottom();
        this.checkScrollButtons();
      });
    },

    hideBubble() {
      this.showHelpBubble = false;
      this.bubbleHidden = true;
      // Guardar preferencia en localStorage
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

        console.log('🌐 Conectando a API...');
        console.log('Base URL:', this.apiBaseUrl || '(URL relativa)');
        
        // ✅ SOLUCIÓN DEFINITIVA: Construir URL correctamente
        const apiUrl = this.apiBaseUrl 
          ? `${this.apiBaseUrl}/api/chat`
          : '/api/chat'; // URL relativa cuando están en el mismo dominio

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

        // Mostrar burbuja de ayuda después de un tiempo si no está abierto
        if (!this.isOpen && !this.bubbleHidden) {
          setTimeout(() => {
            this.showBubble();
          }, 5000);
        }

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

    // ✅ Aplicar parche de emergencia para URLs incorrectas
    applyEmergencyPatch() {
      if (window.CHATBOT_PATCH_APPLIED) return;
      
      console.log('🔧 Aplicando parche de emergencia para API...');
      
      const isProduction = window.location.hostname.includes('onrender.com') && 
                          !window.location.hostname.includes('localhost');
      
      if (isProduction) {
        console.log('🚀 Detectado entorno Render en producción');
        
        const originalXHROpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function(method, url, async, user, pass) {
          if (typeof url === 'string') {
            const originalUrl = url;
            
            if (url.includes('localhost:4000')) {
              url = url.replace('http://localhost:4000', '');
              console.log('🔧 URL corregida:', originalUrl, '→', url || '(URL relativa)');
            }
            
            if (url.includes('localhost:10000')) {
              url = url.replace('http://localhost:10000', '');
              console.log('🔧 URL corregida:', originalUrl, '→', url || '(URL relativa)');
            }
          }
          return originalXHROpen.call(this, method, url, async, user, pass);
        };
        
        console.log('✅ Parche de emergencia aplicado para producción');
      }
      
      window.CHATBOT_PATCH_APPLIED = true;
    },

    // Mostrar burbuja de ayuda después de un tiempo
    scheduleHelpBubble() {
      if (this.bubbleHidden) return;
      
      setTimeout(() => {
        if (!this.isOpen && !this.bubbleHidden) {
          this.showHelpBubble = true;
        }
      }, 3000); // Mostrar después de 3 segundos
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
      } else {
        // Programar mostrar burbuja después de cerrar el chat
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
    // Obtener el rol del usuario al montar el componente
    this.userRole = this.getUserRole();
    
    // Verificar si el usuario ocultó la burbuja anteriormente
    const bubbleHidden = localStorage.getItem('chatbot_bubble_hidden');
    if (bubbleHidden === 'true') {
      this.bubbleHidden = true;
      this.showHelpBubble = false;
    }
    
    // ✅ Aplicar parche de emergencia al cargar
    this.applyEmergencyPatch();
    
    // Programar mostrar burbuja de ayuda
    this.scheduleHelpBubble();
    
    // Verificar scroll después de que se rendericen los botones
    this.$nextTick(() => {
      setTimeout(() => {
        this.checkScrollButtons();
      }, 100);
    });

    // También verificar cuando cambia el tamaño de la ventana
    window.addEventListener('resize', this.checkScrollButtons);

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
    window.removeEventListener('resize', this.checkScrollButtons);
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

/* Ventana del chat - POSICIÓN MÁS ALTA */
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
}

/* Dark mode support */
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
  
  .quick-buttons-container {
    background: #111827;
    border-color: #374151;
  }
  
  .quick-button {
    background: #374151;
    border-color: #4b5563;
    color: #f9fafb;
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
}
</style>