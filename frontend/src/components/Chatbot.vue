<template>
  <!-- ChatBot Container -->
  <div class="chatbot-container">
    <!-- Mensaje FIJO arriba del botón - SOLO POR 3 SEGUNDOS -->
    <div 
      v-if="!isOpen && showFixedMessage" 
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

    <!-- Ventana del Chat -->
    <transition name="chat-window">
      <div
        v-if="isOpen"
        class="chatbot-window"
        :class="{ 'is-expanded': isExpanded }"
      >
        <!-- Header -->
        <div class="chatbot-header">
          <img 
            src="/petbot2.png"
            class="chatbot-avatar"
            alt="PetBot"
          />
          <div class="chatbot-info">
            <h3>PetBot</h3>
            <p>{{ getRoleDescription() }}</p>
          </div>
          <button
            @click="toggleSize"
            class="expand-btn"
            :title="isExpanded ? 'Reducir chat' : 'Aumentar chat'"
          >
            {{ isExpanded ? '⤡' : '⤢' }}
          </button>
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
              <span class="typing-text">PetBot está pensando...</span>
            </div>
          </div>
        </div>

        <!-- Botones rápidos CON FLECHAS DE SCROLL -->
        <div class="quick-buttons-container">
          <div class="quick-buttons-wrapper">
            <!-- Flecha izquierda -->
            <button 
              v-if="showScrollArrows && canScrollLeft"
              @click="scrollQuickButtons(-1)"
              class="scroll-arrow scroll-arrow-left"
              title="Desplazar izquierda"
            >
              <svg class="arrow-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <!-- Contenedor con scroll -->
            <div 
              ref="quickButtonsScroll" 
              class="quick-buttons-scroll"
              @scroll="handleQuickButtonsScroll"
            >
              <button
                v-for="(q, index) in quickOptions"
                :key="index"
                @click="sendQuick(q)"
                :disabled="isLoading"
                class="quick-button"
                :title="q"
              >
                {{ q }}
              </button>
            </div>

            <!-- Flecha derecha -->
            <button 
              v-if="showScrollArrows && canScrollRight"
              @click="scrollQuickButtons(1)"
              class="scroll-arrow scroll-arrow-right"
              title="Desplazar derecha"
            >
              <svg class="arrow-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <!-- Indicador de scroll (puntos) -->
          <div v-if="showScrollArrows" class="scroll-indicator">
            <div 
              v-for="n in scrollPages"
              :key="n"
              :class="{ 'active': currentScrollPage === n }"
              class="scroll-dot"
            ></div>
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
      canScrollLeft: false,
      canScrollRight: false,
      currentScrollPage: 1,
      scrollPages: 1,
      isExpanded: false,
      userRole: "guest", // Default to guest
      isGuest: true, // Track if user is guest
      isAuthenticated: false,
      showFixedMessage: false,
      fixedMessageTimeout: null,
      lastRoutePath: null
    };
  },
  computed: {
    quickOptions() {
      const optionsByRole = {
        guest: [
          "¿Qué servicios ofrecen?",
          "Servicios disponibles",
          "¿Cuánto cuestan?",
          "Precios aproximados",
          "Ver comercios",
          "Encontrar veterinarias",
          "Peluquerías caninas",
          "Cómo agendar cita",
          "¿Cómo reservar?",
          "Mi mascota está enferma",
          "Emergencias veterinarias",
          "Consejos para mascotas",
          "¿Cómo me registro?",
          "Crear una cuenta",
          "Quiero iniciar sesión",
          "Iniciar sesión",
          "Ayuda",
          "Contacto"
        ],
        client: [
          "Buscar comercios", 
          "Servicios disponibles", 
          "Mis citas", 
          "Mis mascotas", 
          "Agendar cita",
          "Precios generales",
          "Emergencias",
          "Veterinarias cerca",
          "Peluquerías caninas",
          "Tienda de mascotas"
        ],
        provider: [
          "Mi comercio",
          "Citas hoy",
          "Mi agenda",
          "Estadísticas",
          "Mis ingresos",
          "Clientes recientes",
          "Actualizar servicios",
          "Mis reseñas",
          "Promociones",
          "Horarios"
        ],
        admin: [
          "Comercios pendientes",
          "Usuarios registrados",
          "Todas las citas",
          "Reportes del sistema",
          "Estadísticas globales",
          "Aprobar comercios",
          "Monitoreo",
          "Logs del sistema",
          "Soporte técnico",
          "Backup de datos"
        ]
      };
      
      return optionsByRole[this.userRole] || optionsByRole.guest;
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
    checkAuthentication() {
      try {
        const token = localStorage.getItem("token");
        this.isAuthenticated = !!token;
        return this.isAuthenticated;
      } catch (error) {
        console.error("Error checking authentication:", error);
        this.isAuthenticated = false;
        return false;
      }
    },

    getUserRole() {
      try {
        if (!this.checkAuthentication()) {
          this.isGuest = true;
          return "guest";
        }
        const userStore = useUserStore();
        if (userStore?.user?.role) {
          this.isGuest = false;
          return userStore.user.role;
        }
        this.isGuest = true;
        return "guest";
      } catch (error) {
        console.error("Error obteniendo rol:", error);
        this.isGuest = true;
        return "guest";
      }
    },

    getRoleDescription() {
      const descriptions = {
        guest: "Asistente virtual de PetServices",
        client: "Asistente para clientes",
        provider: "Asistente para proveedores", 
        admin: "Asistente administrativo"
      };
      return descriptions[this.userRole] || "Asistente virtual";
    },

    getInputPlaceholder() {
      const placeholders = {
      guest: "Pregunta sobre servicios, precios o cómo registrarte...",
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
      
      // Si se abre el chat, ocultar el mensaje flotante
      if (this.isOpen) {
        this.hideFixedMessage();
      }
      
      this.$nextTick(() => {
        this.checkQuickButtonsScroll();
      });
    },

    toggleSize() {
      this.isExpanded = !this.isExpanded;
      this.$nextTick(() => {
        this.checkQuickButtonsScroll();
      });
    },

    addWelcomeMessage() {
      const welcomeMessages = {
        guest: `¡Hola! 👋 Soy PetBot, tu asistente virtual de PetServices.

🐾 **Bienvenido a la plataforma líder en servicios para mascotas**

Como **visitante**, puedo ayudarte con:
• 📋 Información sobre servicios disponibles
• 💰 Consultar precios aproximados  
• 🏥 Encontrar veterinarias y peluquerías
• 🐕 Consejos básicos para el cuidado de mascotas
• 📱 Guía para registrarte y reservar

**Para reservar servicios necesitas una cuenta:**
👉 [Iniciar sesión](/login) | [Registrarse](/login)

¿En qué puedo ayudarte hoy?`,

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

      const message = welcomeMessages[this.userRole] || welcomeMessages.guest;
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
        
        // Determine API endpoint based on authentication
        const apiUrl = this.apiBaseUrl 
          ? `${this.apiBaseUrl}/api/chat${this.isGuest ? '/guest' : ''}`
          : `/api/chat${this.isGuest ? '/guest' : ''}`;

        const requestConfig = {
          timeout: 30000,
          headers: {
            "Content-Type": "application/json"
          }
        };

        // Only add auth header if not guest
        if (!this.isGuest && token) {
          requestConfig.headers.Authorization = `Bearer ${token}`;
        }

        const res = await axios.post(
          apiUrl,
          { message: text },
          requestConfig
        );

        if (res.data.error) {
          throw new Error(res.data.error);
        }

        // Procesar links en la respuesta
        let reply = res.data.reply || "Lo siento, no pude generar una respuesta.";
        
        // Convertir [text](/path) a links clicables
        reply = this.processLinks(reply);

        this.messages.push({
          sender: "bot",
          text: reply,
          time: this.getCurrentTime()
        });

      } catch (error) {
        console.error("Chat error:", error);
        
        let errorMessage = "❌ Error al conectar con PetBot.";
        
        if (error.response?.status === 401 && (this.isAuthenticated || !this.isGuest)) {
          errorMessage = "🔐 Sesión expirada. Por favor, inicia sesión nuevamente.\n\n👉 [Ir a Login](/login)";
        } else if (error.response?.status === 400) {
          errorMessage = "📝 Por favor, escribe un mensaje válido.";
        } else if (error.code === 'ECONNABORTED') {
          errorMessage = "⏰ El servicio está tardando en responder. Intenta nuevamente.";
        } else if (error.message.includes("token") && !this.isGuest) {
          errorMessage = "🔐 Sesión expirada. Por favor, inicia sesión nuevamente.\n\n👉 [Ir a Login](/login)";
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
      }
    },

    processLinks(text) {
      // Convertir [texto](/ruta) a elementos clicables en HTML
      return text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, linkText, path) => {
        return `<a href="#" onclick="event.preventDefault(); window.location.href='${path}';" style="color: #3b82f6; text-decoration: underline; font-weight: 600;">${linkText}</a>`;
      });
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

    scrollToNewMessageTop() {
      this.$nextTick(() => {
        const container = this.$refs.messagesContainer;
        if (!container) return;

        const messages = container.querySelectorAll('.message-container');
        const lastMessage = messages[messages.length - 1];
        if (!lastMessage) return;

        const containerTop = container.getBoundingClientRect().top;
        const messageTop = lastMessage.getBoundingClientRect().top;
        const offset = messageTop - containerTop + container.scrollTop;
        container.scrollTop = offset;
      });
    },

    // MÉTODOS PARA SCROLL HORIZONTAL
    checkQuickButtonsScroll() {
      this.$nextTick(() => {
        const container = this.$refs.quickButtonsScroll;
        if (container) {
          // Mostrar flechas si hay scroll horizontal
          this.showScrollArrows = container.scrollWidth > container.clientWidth;
          
          // Calcular páginas de scroll
          const containerWidth = container.clientWidth;
          const scrollWidth = container.scrollWidth;
          this.scrollPages = Math.ceil(scrollWidth / containerWidth);
          
          // Actualizar estado de flechas
          this.handleQuickButtonsScroll();
        }
      });
    },

    scrollQuickButtons(direction) {
      const container = this.$refs.quickButtonsScroll;
      if (!container) return;

      const scrollAmount = container.clientWidth * 0.8;
      const newScrollLeft = container.scrollLeft + (direction * scrollAmount);
      
      container.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    },

    handleQuickButtonsScroll() {
      const container = this.$refs.quickButtonsScroll;
      if (!container) return;

      const scrollLeft = container.scrollLeft;
      const scrollWidth = container.scrollWidth;
      const clientWidth = container.clientWidth;
      
      // Determinar si podemos seguir desplazando
      this.canScrollLeft = scrollLeft > 0;
      this.canScrollRight = scrollLeft + clientWidth < scrollWidth;
      
      // Calcular página actual
      if (clientWidth > 0) {
        this.currentScrollPage = Math.min(
          Math.max(1, Math.floor(scrollLeft / clientWidth) + 1),
          this.scrollPages
        );
      }
    },

    getCurrentTime() {
      return new Date().toLocaleTimeString('es-VE', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    },

    formatMessage(text) {
      if (!text) return '';
      
      // Convert markdown links to clickable HTML links
      let formatted = text
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Convert [Text](/path) to router-link style links
        .replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="#" data-route="$2" class="chat-link" onclick="event.preventDefault(); if(window.__chatbot) { window.__chatbot.navigateTo(\'$2\'); }">$1 →</a>');
      
      return formatted;
    },

    navigateTo(path) {
      // Navigate to the path
      this.$router.push(path);
      // Close chat after navigation
      this.isOpen = false;
    },

    // MÉTODOS PARA MOSTRAR/OCULTAR MENSAJE FLOTANTE
    showFixedMessageFor3Seconds() {
      // Limpiar timeout anterior si existe
      if (this.fixedMessageTimeout) {
        clearTimeout(this.fixedMessageTimeout);
      }
      
      // Solo mostrar si el chat está cerrado
      if (!this.isOpen) {
        this.showFixedMessage = true;
        
        // Ocultar después de 3 segundos
        this.fixedMessageTimeout = setTimeout(() => {
          this.showFixedMessage = false;
        }, 3000);
      }
    },

    hideFixedMessage() {
      this.showFixedMessage = false;
      if (this.fixedMessageTimeout) {
        clearTimeout(this.fixedMessageTimeout);
        this.fixedMessageTimeout = null;
      }
    },

    // Método para detectar cambios de ruta
    checkRouteChange() {
      const currentPath = this.$route?.path;
      if (currentPath && currentPath !== this.lastRoutePath) {
        this.lastRoutePath = currentPath;
        this.showFixedMessageFor3Seconds();
      }
    }
  },

  watch: {
    isOpen(newVal) {
      if (newVal) {
        this.$nextTick(() => {
          this.scrollToNewMessageTop();
          setTimeout(() => this.checkQuickButtonsScroll(), 100);
        });
      } else {
        // Cuando se cierra el chat, mostrar el mensaje flotante por 3 segundos
        this.showFixedMessageFor3Seconds();
      }
    },

    messages: {
      handler() {
        this.scrollToNewMessageTop();
        if (!this.isOpen && this.messages.length > 0) {
          this.hasNewMessage = true;
        }
      },
      deep: true
    },

    quickOptions() {
      this.$nextTick(() => {
        setTimeout(() => this.checkQuickButtonsScroll(), 150);
      });
    },

    // Observar cambios de ruta
    '$route.path': function(newPath, oldPath) {
      if (newPath !== oldPath) {
        this.showFixedMessageFor3Seconds();
      }
    }
  },

  mounted() {
    // Verificar autenticación y obtener rol
    this.checkAuthentication();
    this.userRole = this.getUserRole();
    
    // Register chatbot instance globally for link navigation
    window.__chatbot = this;
    
    // Mostrar mensaje flotante al cargar por primera vez
    this.showFixedMessageFor3Seconds();
    
    this.$nextTick(() => {
      setTimeout(() => this.checkQuickButtonsScroll(), 200);
      
      // Recalcular scroll cuando cambia el tamaño de la ventana
      window.addEventListener('resize', this.checkQuickButtonsScroll);
    });
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.checkQuickButtonsScroll);
    
    // Limpiar timeout al desmontar
    if (this.fixedMessageTimeout) {
      clearTimeout(this.fixedMessageTimeout);
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

/* =========================================== */
/* MENSAJE FIJO ARRIBA DEL BOTÓN - CON ANIMACIÓN DE ENTRADA */
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
  animation: slide-in-fixed 0.4s ease-out, float-fixed 2s ease-in-out infinite 0.4s;
  transform-origin: left bottom;
}

@keyframes slide-in-fixed {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes float-fixed {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

.fixed-help-message:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 12px 30px rgba(59, 130, 246, 0.4);
  background: linear-gradient(135deg, #1d4ed8, #3b82f6);
  animation-play-state: paused;
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
  width: 420px; /* Un poco más ancha para botones */
  height: 520px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.25);
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chatbot-window.is-expanded {
  width: 680px;
  height: 760px;
  max-width: calc(100vw - 40px);
  max-height: calc(100vh - 140px);
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
}

.expand-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.expand-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.08);
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
  background: #f8fafc;
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.message-user {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  border-bottom-right-radius: 6px;
  margin-left: auto;
}

.message-bot {
  background: white;
  color: #1f2937;
  border: 1px solid #e5e7eb;
  border-bottom-left-radius: 6px;
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

.message-content >>> .chat-link {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s ease;
  border-bottom: 2px solid transparent;
}

.message-content >>> .chat-link:hover {
  color: #2563eb;
  border-bottom: 2px solid #2563eb;
}

.message-bot .message-content >>> .chat-link {
  color: #10b981;
}

.message-bot .message-content >>> .chat-link:hover {
  color: #059669;
  border-bottom: 2px solid #059669;
}


.message-time {
  font-size: 11px;
  margin-top: 4px;
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
  border-radius: 18px;
  border-bottom-left-radius: 6px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.typing-dots {
  display: flex;
  gap: 4px;
}

.dot {
  width: 6px;
  height: 6px;
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
    transform: translateY(-4px);
    opacity: 1;
  }
}

.typing-text {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

/* =========================================== */
/* BOTONES RÁPIDOS CON SCROLL HORIZONTAL */
/* =========================================== */
.quick-buttons-container {
  padding: 12px 16px;
  border-top: 1px solid #e5e7eb;
  background: white;
  position: relative;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.quick-buttons-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
}

.scroll-arrow {
  width: 28px;
  height: 28px;
  min-width: 28px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  color: #374151;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
  z-index: 2;
}

.scroll-arrow:hover:not(:disabled) {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
  transform: scale(1.1);
}

.scroll-arrow:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.scroll-arrow-left {
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
}

.scroll-arrow-right {
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
}

.arrow-icon {
  width: 16px;
  height: 16px;
}

.quick-buttons-scroll {
  flex: 1;
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scroll-behavior: smooth;
  -ms-overflow-style: none;
  scrollbar-width: none;
  padding: 4px 2px;
  min-height: 46px;
  align-items: center;
}

.quick-buttons-scroll::-webkit-scrollbar {
  display: none;
}

.quick-button {
  flex-shrink: 0;
  padding: 10px 14px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  line-height: 1.2;
}

.quick-button:hover:not(:disabled) {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.quick-button:active:not(:disabled) {
  transform: translateY(0);
}

.quick-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
}

/* Indicador de scroll (puntos) */
.scroll-indicator {
  display: flex;
  justify-content: center;
  gap: 6px;
  padding-top: 4px;
}

.scroll-dot {
  width: 6px;
  height: 6px;
  background: #d1d5db;
  border-radius: 50%;
  transition: all 0.3s;
}

.scroll-dot.active {
  background: #3b82f6;
  transform: scale(1.2);
}

/* Input area */
.input-container {
  padding: 12px 16px;
  border-top: 1px solid #e5e7eb;
  background: white;
  flex-shrink: 0;
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
}

.message-input {
  flex: 1;
  padding: 12px 16px;
  padding-right: 50px;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  font-size: 14px;
  outline: none;
  transition: all 0.2s;
  background: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.message-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.message-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #f9fafb;
}

.send-button {
  position: absolute;
  right: 8px;
  width: 36px;
  height: 36px;
  background: #3b82f6;
  border: none;
  border-radius: 10px;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.send-button:hover:not(:disabled) {
  background: #2563eb;
  transform: scale(1.05);
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
  width: 18px;
  height: 18px;
}

.loading-spinner {
  width: 16px;
  height: 16px;
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
  opacity: 0.7;
}

/* Animaciones */
.chat-window-enter-active,
.chat-window-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
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
    width: calc(100vw - 30px);
    max-width: 420px;
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
    max-width: 90%;
    padding: 10px 14px;
  }
  
  .quick-button {
    padding: 8px 12px;
    font-size: 11px;
    min-height: 36px;
  }
  
  .scroll-arrow {
    width: 26px;
    height: 26px;
    min-width: 26px;
  }
  
  .message-input {
    padding: 10px 14px;
    padding-right: 46px;
    font-size: 13px;
  }
  
  .send-button {
    width: 32px;
    height: 32px;
    right: 6px;
  }
}

/* Dark mode */
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
    background: #111827;
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
  
  .scroll-arrow {
    background: #374151;
    border-color: #4b5563;
    color: #f9fafb;
  }
  
  .scroll-arrow:hover:not(:disabled) {
    background: #3b82f6;
    border-color: #3b82f6;
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
  
  .scroll-dot {
    background: #4b5563;
  }
  
  .scroll-dot.active {
    background: #3b82f6;
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
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
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