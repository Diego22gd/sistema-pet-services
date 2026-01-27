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
            <!-- Indicador de estado del usuario -->
            <div v-if="userRole === 'guest'" class="guest-badge">
              🎯 Modo visitante
            </div>
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
          <!-- Mensaje de bienvenida específico por rol -->
          <div v-if="showWelcomeMessage" class="welcome-message-container">
            <div class="message-left">
              <div class="message-bubble message-bot welcome-bubble">
                <div class="message-content" v-html="formatMessage(welcomeMessage)"></div>
                <div class="message-time message-time-bot">
                  {{ getCurrentTime() }}
                </div>
              </div>
            </div>
          </div>

          <!-- Mensajes de la conversación -->
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

          <!-- Promoción para usuarios visitantes -->
          <div v-if="userRole === 'guest' && messages.length > 0" class="guest-promotion">
            <div class="promotion-bubble">
              <div class="promotion-content">
                <span class="promotion-icon">✨</span>
                <span class="promotion-text">
                  <strong>¡Regístrate ahora!</strong> Para acceder a todas las funciones
                </span>
              </div>
              <button @click="goToRegister" class="promotion-button">
                Registrarme
              </button>
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
          
          <!-- Mensaje para visitantes -->
          <div v-if="userRole === 'guest'" class="guest-message">
            <span class="guest-icon">👋</span>
            <span class="guest-text">
              <strong>Modo visitante:</strong> Puedes chatear sin registrarte
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
      canScrollLeft: false,
      canScrollRight: false,
      currentScrollPage: 1,
      scrollPages: 1,
      userRole: "guest",
      showFixedMessage: false,
      fixedMessageTimeout: null,
      lastRoutePath: null,
      showWelcomeMessage: true,
      welcomeMessage: ""
    };
  },
  computed: {
    quickOptions() {
      const optionsByRole = {
        guest: [
          "¿Qué es PetServices?",
          "Cómo registrarme",
          "Servicios disponibles",
          "Precios y costos",
          "¿Cómo funciona?",
          "Beneficios de registrarse",
          "Seguridad y privacidad",
          "App móvil",
          "Contactar soporte",
          "Emergencias veterinarias",
          "Veterinarias cerca",
          "Peluquerías caninas"
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
    getUserRole() {
      try {
        const userStore = useUserStore();
        const token = localStorage.getItem("token");
        
        // Si no hay token, es visitante
        if (!token) {
          return "guest";
        }
        
        // Si hay token pero el store no está cargado, intentamos obtener el rol
        if (userStore.user?.role) {
          return userStore.user.role;
        }
        
        return "client"; // Default si hay token pero no hay rol
      } catch (error) {
        console.error("Error obteniendo rol:", error);
        return "guest";
      }
    },

    getRoleDescription() {
      const descriptions = {
        guest: "Guía para visitantes - ¡Regístrate y descubre más!",
        client: "Asistente para clientes",
        provider: "Asistente para proveedores", 
        admin: "Asistente administrativo"
      };
      return descriptions[this.userRole] || "Asistente virtual";
    },

    getInputPlaceholder() {
      const placeholders = {
        guest: "Pregunta sobre PetServices, registro o servicios...",
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
        this.scrollToBottom();
        this.checkQuickButtonsScroll();
      });
    },

    addWelcomeMessage() {
      const welcomeMessages = {
        guest: `¡Hola! 👋 Soy PetBot, tu guía en **PetServices**.

🎯 **Estás en modo visitante**, puedo ayudarte con:

📋 **INFORMACIÓN GENERAL:**
• ¿Qué es PetServices?
• ¿Cómo funciona?
• Servicios disponibles

👤 **REGISTRO Y ACCESO:**
• Cómo registrarse
• Beneficios de tener cuenta
• Tipos de cuenta disponibles

💰 **PRECIOS Y COSTOS:**
• Costos para clientes
• Planes para proveedores
• Promociones

🏢 **SERVICIOS DISPONIBLES:**
• 🏥 Veterinarias
• ✂️ Peluquerías caninas
• 🏪 Guarderías
• 🛒 Tiendas de mascotas
• 🎓 Entrenadores

✨ **¡Regístrate para acceder a todas las funciones!**

**¿En qué puedo ayudarte hoy?**`,

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

      this.welcomeMessage = welcomeMessages[this.userRole] || welcomeMessages.guest;
      this.showWelcomeMessage = true;
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

      // Ocultar mensaje de bienvenida después del primer mensaje
      if (this.showWelcomeMessage) {
        this.showWelcomeMessage = false;
      }

      try {
        const token = localStorage.getItem("token");
        let headers = {
          "Content-Type": "application/json"
        };
        
        // Solo añadir Authorization si hay token
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const apiUrl = this.apiBaseUrl 
          ? `${this.apiBaseUrl}/api/chat`
          : '/api/chat';

        const res = await axios.post(
          apiUrl,
          { message: text },
          { 
            headers: headers,
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
          // Para usuarios no autenticados, esto es normal - usar modo visitante
          errorMessage = "🔄 Usando modo visitante... Puedes continuar chateando.";
          this.userRole = "guest";
        } else if (error.response?.status === 400) {
          errorMessage = "📝 Por favor, escribe un mensaje válido.";
        } else if (error.code === 'ECONNABORTED') {
          errorMessage = "⏰ El servicio está tardando en responder. Intenta nuevamente.";
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
      
      // Formato simple y limpio
      return text
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
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
    },

    // Navegar a registro
    goToRegister() {
      this.toggleChat();
      this.$router.push('/register');
    },

    // Actualizar rol cuando cambie el estado de autenticación
    updateUserRole() {
      const newRole = this.getUserRole();
      if (newRole !== this.userRole) {
        this.userRole = newRole;
        // Si se abre el chat, actualizar mensaje de bienvenida
        if (this.isOpen && this.messages.length === 0) {
          this.addWelcomeMessage();
        }
      }
    }
  },

  watch: {
    isOpen(newVal) {
      if (newVal) {
        this.$nextTick(() => {
          this.scrollToBottom();
          setTimeout(() => this.checkQuickButtonsScroll(), 100);
        });
      } else {
        // Cuando se cierra el chat, mostrar el mensaje flotante por 3 segundos
        this.showFixedMessageFor3Seconds();
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

    quickOptions() {
      this.$nextTick(() => {
        setTimeout(() => this.checkQuickButtonsScroll(), 150);
      });
    },

    // Observar cambios de ruta
    '$route.path': function(newPath, oldPath) {
      if (newPath !== oldPath) {
        this.showFixedMessageFor3Seconds();
        // Actualizar rol cuando cambia la ruta
        this.updateUserRole();
      }
    }
  },

  mounted() {
    this.userRole = this.getUserRole();
    this.addWelcomeMessage();
    
    // Mostrar mensaje flotante al cargar por primera vez
    this.showFixedMessageFor3Seconds();
    
    // Escuchar cambios en el store de usuario
    const userStore = useUserStore();
    if (userStore) {
      this.$watch(
        () => userStore.user,
        () => {
          this.updateUserRole();
        },
        { deep: true }
      );
    }
    
    // Escuchar cambios en localStorage (token)
    window.addEventListener('storage', (event) => {
      if (event.key === 'token') {
        this.updateUserRole();
      }
    });
    
    this.$nextTick(() => {
      setTimeout(() => this.checkQuickButtonsScroll(), 200);
      
      // Recalcular scroll cuando cambia el tamaño de la ventana
      window.addEventListener('resize', this.checkQuickButtonsScroll);
    });
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.checkQuickButtonsScroll);
    window.removeEventListener('storage', this.updateUserRole);
    
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

/* Header */
.chatbot-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
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
  position: relative;
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

.guest-badge {
  position: absolute;
  top: -8px;
  right: 0;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  animation: pulse-guest 2s infinite;
}

@keyframes pulse-guest {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
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

.welcome-message-container {
  animation: fadeIn 0.5s ease-out;
}

.welcome-bubble {
  background: linear-gradient(135deg, #e0f2fe, #bae6fd);
  border: 2px solid #38bdf8;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
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
  animation: messageAppear 0.3s ease-out;
}

@keyframes messageAppear {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
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

/* Promoción para visitantes */
.guest-promotion {
  margin-top: 8px;
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.promotion-bubble {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border: 2px solid #f59e0b;
  border-radius: 16px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.promotion-content {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.promotion-icon {
  font-size: 18px;
}

.promotion-text {
  font-size: 12px;
  color: #92400e;
  font-weight: 500;
}

.promotion-button {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.promotion-button:hover {
  background: linear-gradient(135deg, #d97706, #b45309);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(245, 158, 11, 0.3);
}

.promotion-button:active {
  transform: translateY(0);
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
  position: relative;
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

/* Mensaje para visitantes */
.guest-message {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  padding: 8px 12px;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
  animation: fadeInGuest 0.5s ease-out;
}

@keyframes fadeInGuest {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.guest-icon {
  font-size: 14px;
}

.guest-text {
  font-size: 11px;
  color: #0369a1;
  font-weight: 500;
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
  
  .promotion-bubble {
    flex-direction: column;
    gap: 8px;
  }
  
  .promotion-button {
    width: 100%;
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
  
  .guest-badge {
    background: linear-gradient(135deg, #92400e, #78350f);
  }
  
  .chatbot-messages {
    background: #111827;
  }
  
  .welcome-bubble {
    background: linear-gradient(135deg, #1e3a8a, #1e40af);
    border-color: #3b82f6;
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
  
  .promotion-bubble {
    background: linear-gradient(135deg, #78350f, #92400e);
    border-color: #f59e0b;
  }
  
  .promotion-text {
    color: #fef3c7;
  }
  
  .promotion-button {
    background: linear-gradient(135deg, #d97706, #f59e0b);
    color: #1f2937;
  }
  
  .promotion-button:hover {
    background: linear-gradient(135deg, #f59e0b, #fbbf24);
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
  
  .guest-message {
    background: #1e3a8a;
    border-color: #3b82f6;
  }
  
  .guest-text {
    color: #bae6fd;
  }
  
  .chatbot-messages::-webkit-scrollbar-thumb {
    background: #4b5563;
  }
  
  .chatbot-messages::-webkit-scrollbar-thumb:hover {
    background: #6b7280;
  }
}
</style>