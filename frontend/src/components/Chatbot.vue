<template>
  <!-- ChatBot Container -->
  <div class="chatbot-container">
    <!-- Botón flotante -->
    <button
      @click="toggleChat"
      class="chatbot-toggle"
      :class="{ 'chatbot-toggle-open': isOpen }"
      :title="isOpen ? 'Cerrar chat' : 'Abrir chat'"
      aria-label="Abrir/Cerrar asistente virtual"
    >
      <img 
        src="/petbot.png"
        class="chatbot-toggle-img"
        alt="PetBot - Asistente virtual"
      />
      <!-- Indicador de notificación -->
      <div v-if="!isOpen && hasNewMessage" class="notification-dot"></div>
      <!-- Indicador de estado -->
      <div v-if="connectionStatus !== 'connected'" 
           class="connection-status-indicator"
           :class="connectionStatus"></div>
    </button>

    <!-- Ventana del Chat -->
    <transition name="chat-window">
      <div
        v-if="isOpen"
        class="chatbot-window"
        role="dialog"
        aria-label="Ventana de chat con PetBot"
      >
        <!-- Header -->
        <div class="chatbot-header">
          <div class="chatbot-identity">
            <img 
              src="/petbot2.png"
              class="chatbot-avatar"
              alt="Avatar de PetBot"
              loading="lazy"
            />
            <div class="chatbot-info">
              <h3>PetBot AI</h3>
              <p>{{ getRoleDescription() }}</p>
              <div class="chatbot-status">
                <span class="status-dot" :class="connectionStatus"></span>
                <span class="status-text">{{ getStatusText() }}</span>
              </div>
            </div>
          </div>
          <div class="chatbot-controls">
            <button 
              @click="clearChat"
              class="control-btn"
              title="Limpiar conversación"
              aria-label="Limpiar historial de chat"
            >
              <svg class="control-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
            <button 
              @click="toggleSound"
              class="control-btn"
              :title="soundEnabled ? 'Silenciar sonidos' : 'Activar sonidos'"
              aria-label="Alternar sonidos del chat"
            >
              <svg v-if="soundEnabled" class="control-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
              <svg v-else class="control-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            </button>
            <button 
              @click="toggleChat" 
              class="control-btn close-btn"
              title="Cerrar chat"
              aria-label="Cerrar ventana de chat"
            >
              <svg class="control-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Área de mensajes -->
        <div 
          ref="messagesContainer" 
          class="chatbot-messages"
          role="log"
          aria-live="polite"
          aria-label="Historial de mensajes"
        >
          <!-- Mensaje de bienvenida inicial -->
          <div v-if="messages.length === 0" class="welcome-container">
            <div class="welcome-message">
              <div class="welcome-header">
                <h4>👋 ¡Hola, {{ userName }}!</h4>
                <p class="welcome-subtitle">Soy PetBot, tu asistente virtual</p>
              </div>
              <div class="welcome-content">
                <p><strong>Puedo ayudarte con:</strong></p>
                <ul class="welcome-features">
                  <li v-for="feature in welcomeFeatures" :key="feature">
                    {{ feature }}
                  </li>
                </ul>
                <p class="welcome-tip">
                  💡 <strong>Tip:</strong> Usa los botones rápidos para consultas frecuentes
                </p>
              </div>
            </div>
          </div>

          <!-- Mensajes de la conversación -->
          <div
            v-for="(msg, index) in messages"
            :key="`message-${index}-${msg.timestamp}`"
            :class="[
              'message-container',
              msg.sender === 'me' ? 'message-right' : 'message-left',
              msg.type === 'error' ? 'message-error' : ''
            ]"
            :data-intent="msg.intent"
          >
            <div
              :class="[
                'message-bubble',
                msg.sender === 'me' ? 'message-user' : 'message-bot',
                msg.type === 'error' ? 'error-bubble' : ''
              ]"
              :aria-label="msg.sender === 'me' ? 'Tu mensaje' : 'Respuesta de PetBot'"
            >
              <!-- Avatar del mensaje -->
              <div v-if="msg.sender === 'bot'" class="message-avatar">
                <img 
                  src="/petbot2.png" 
                  alt="PetBot"
                  class="avatar-small"
                />
              </div>
              
              <div class="message-content-wrapper">
                <!-- Contenido del mensaje -->
                <div class="message-content" v-html="formatMessage(msg.text)"></div>
                
                <!-- Metadatos del mensaje -->
                <div class="message-metadata">
                  <div 
                    :class="msg.sender === 'me' ? 'message-time-user' : 'message-time-bot'"
                    class="message-time"
                  >
                    {{ formatTime(msg.timestamp) }}
                  </div>
                  <div v-if="msg.responseTime && msg.sender === 'bot'" class="response-time">
                    {{ msg.responseTime }}ms
                  </div>
                  <div v-if="msg.aiUsed && msg.sender === 'bot'" class="ai-badge">
                    🤖 IA
                  </div>
                </div>
                
                <!-- Indicadores de carga para mensajes de bot -->
                <div v-if="msg.loading" class="message-loading">
                  <div class="loading-dots">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                  </div>
                </div>
              </div>
              
              <!-- Avatar del usuario -->
              <div v-if="msg.sender === 'me'" class="message-avatar user-avatar">
                <div class="user-avatar-initial">
                  {{ getUserInitial() }}
                </div>
              </div>
            </div>
          </div>

          <!-- Indicador de typing -->
          <div v-if="isLoading" class="typing-indicator" aria-label="PetBot está escribiendo">
            <div class="typing-bubble">
              <div class="typing-avatar">
                <img 
                  src="/petbot2.png" 
                  alt="PetBot"
                  class="avatar-typing"
                />
              </div>
              <div class="typing-content">
                <div class="typing-dots">
                  <div class="dot"></div>
                  <div class="dot"></div>
                  <div class="dot"></div>
                </div>
                <span class="typing-text">PetBot está escribiendo...</span>
              </div>
            </div>
          </div>

          <!-- Indicador de nuevos mensajes -->
          <div 
            v-if="showNewMessageIndicator" 
            class="new-messages-indicator"
            @click="scrollToBottom"
            role="button"
            aria-label="Ir a los mensajes más recientes"
          >
            <span class="indicator-text">Nuevos mensajes</span>
            <svg class="indicator-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <!-- Sugerencias rápidas -->
        <div v-if="showSuggestions" class="suggestions-container">
          <div class="suggestions-header">
            <span class="suggestions-title">💡 Sugerencias rápidas</span>
            <button 
              @click="toggleSuggestions" 
              class="suggestions-toggle"
              aria-label="Ocultar sugerencias"
            >
              ▲
            </button>
          </div>
          <div class="suggestions-grid">
            <button
              v-for="suggestion in currentSuggestions"
              :key="suggestion.text"
              @click="sendQuick(suggestion.text)"
              :disabled="isLoading"
              class="suggestion-button"
              :class="{ 'suggestion-highlight': suggestion.highlight }"
              :title="suggestion.tooltip"
            >
              <span class="suggestion-emoji">{{ suggestion.emoji }}</span>
              <span class="suggestion-text">{{ suggestion.text }}</span>
            </button>
          </div>
        </div>

        <!-- Botones rápidos con scroll horizontal -->
        <div class="quick-buttons-container" v-if="showQuickButtons">
          <div class="quick-buttons-wrapper">
            <div class="quick-buttons-scroll" ref="quickButtonsScroll">
              <button
                v-for="q in filteredQuickOptions"
                :key="q.text"
                @click="sendQuick(q.text)"
                :disabled="isLoading || isButtonDisabled(q.text)"
                class="quick-button"
                :class="{ 'quick-button-active': isButtonActive(q.text) }"
                :title="q.tooltip || q.text"
              >
                <span class="quick-button-emoji">{{ q.emoji }}</span>
                <span class="quick-button-text">{{ q.text }}</span>
              </button>
            </div>
            <!-- Flechas de navegación -->
            <button 
              v-if="showScrollArrows && canScrollLeft" 
              @click="scrollQuickButtons(-200)"
              class="scroll-button scroll-left"
              aria-label="Desplazar botones hacia la izquierda"
            >
              ‹
            </button>
            <button 
              v-if="showScrollArrows && canScrollRight" 
              @click="scrollQuickButtons(200)"
              class="scroll-button scroll-right"
              aria-label="Desplazar botones hacia la derecha"
            >
              ›
            </button>
          </div>
        </div>

        <!-- Área de input -->
        <div class="input-container">
          <div class="input-wrapper">
            <button 
              @click="toggleQuickButtons"
              class="input-action-btn"
              :title="showQuickButtons ? 'Ocultar botones rápidos' : 'Mostrar botones rápidos'"
              aria-label="Alternar botones rápidos"
            >
              <svg class="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            </button>
            
            <input
              v-model="userInput"
              @keyup.enter="sendMessage"
              @keyup="checkInput"
              @paste="handlePaste"
              :disabled="isLoading"
              :placeholder="getInputPlaceholder()"
              class="message-input"
              maxlength="1000"
              aria-label="Escribe tu mensaje"
              ref="messageInput"
            />
            
            <div class="input-actions">
              <div class="char-counter" :class="{'char-warning': userInput.length > 800}">
                {{ userInput.length }}/1000
              </div>
              <button
                v-if="userInput.trim()"
                @click="clearInput"
                class="input-action-btn clear-btn"
                title="Limpiar mensaje"
                aria-label="Limpiar campo de texto"
              >
                ×
              </button>
              <button
                @click="sendMessage"
                :disabled="isLoading || !canSendMessage"
                class="send-button"
                :class="{ 'send-button-loading': isLoading }"
                title="Enviar mensaje"
                aria-label="Enviar mensaje"
              >
                <svg v-if="!isLoading" class="send-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                <div v-else class="loading-spinner"></div>
              </button>
            </div>
          </div>
          
          <!-- Información de estado -->
          <div v-if="connectionStatus !== 'connected'" class="connection-info">
            <span class="connection-text" :class="connectionStatus">
              {{ getConnectionMessage() }}
            </span>
            <button v-if="connectionStatus === 'error'" @click="retryConnection" class="retry-btn">
              Reintentar
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useUserStore } from "@/stores/userStore";
import API from "@/services/api";
import { useToast } from "vue-toastification";

export default {
  name: "ChatBot",
  
  setup() {
    const toast = useToast();
    return { toast };
  },
  
  data() {
    return {
      isOpen: false,
      userInput: "",
      messages: [],
      isLoading: false,
      hasNewMessage: false,
      showScrollArrows: false,
      canScrollLeft: false,
      canScrollRight: true,
      userRole: "client",
      connectionStatus: "connected", // 'connected', 'connecting', 'error', 'offline'
      soundEnabled: true,
      showSuggestions: true,
      showQuickButtons: true,
      messageHistory: [],
      lastMessageTime: null,
      isAtBottom: true,
      scrollPosition: 0,
      retryCount: 0,
      typingSound: null,
      notificationSound: null
    };
  },
  
  computed: {
    quickOptions() {
      const optionsByRole = {
        client: [
          { text: "Mis citas", emoji: "📅", tooltip: "Ver mis citas agendadas" },
          { text: "Mis mascotas", emoji: "🐾", tooltip: "Ver mis mascotas registradas" },
          { text: "Servicios disponibles", emoji: "🛎️", tooltip: "Ver servicios ofrecidos" },
          { text: "Agendar cita", emoji: "➕", tooltip: "Agendar nueva cita" },
          { text: "Precios", emoji: "💰", tooltip: "Consultar precios de servicios" },
          { text: "Emergencias", emoji: "🏥", tooltip: "Información de emergencias" },
          { text: "Vacunación", emoji: "💉", tooltip: "Información sobre vacunación" },
          { text: "Peluquería", emoji: "✂️", tooltip: "Servicios de peluquería" },
          { text: "Guardería", emoji: "🏠", tooltip: "Servicios de guardería" },
          { text: "Entrenamiento", emoji: "🎯", tooltip: "Servicios de entrenamiento" }
        ],
        provider: [
          { text: "Citas hoy", emoji: "📊", tooltip: "Ver citas del día de hoy" },
          { text: "Mis servicios", emoji: "🛎️", tooltip: "Gestionar mis servicios" },
          { text: "Estadísticas", emoji: "📈", tooltip: "Ver estadísticas de negocio" },
          { text: "Ingresos", emoji: "💰", tooltip: "Ver reportes de ingresos" },
          { text: "Clientes", emoji: "👥", tooltip: "Ver información de clientes" },
          { text: "Agenda", emoji: "📅", tooltip: "Ver agenda completa" },
          { text: "Servicios activos", emoji: "✅", tooltip: "Ver servicios activos" },
          { text: "Reportes", emoji: "📋", tooltip: "Generar reportes" },
          { text: "Disponibilidad", emoji: "⏰", tooltip: "Gestionar disponibilidad" },
          { text: "Promociones", emoji: "🎁", tooltip: "Crear promociones" }
        ],
        admin: [
          { text: "Proveedores pendientes", emoji: "⏳", tooltip: "Ver proveedores por aprobar" },
          { text: "Usuarios registrados", emoji: "👥", tooltip: "Ver todos los usuarios" },
          { text: "Todas las citas", emoji: "📋", tooltip: "Ver todas las citas del sistema" },
          { text: "Reportes sistema", emoji: "📊", tooltip: "Reportes del sistema completo" },
          { text: "Servicios globales", emoji: "🛎️", tooltip: "Gestionar servicios globalmente" },
          { text: "Estadísticas", emoji: "📈", tooltip: "Estadísticas generales" },
          { text: "Aprobaciones", emoji: "✅", tooltip: "Gestionar aprobaciones" },
          { text: "Monitoreo", emoji: "👁️", tooltip: "Monitorear sistema" },
          { text: "Logs", emoji: "📝", tooltip: "Ver logs del sistema" },
          { text: "Backup", emoji: "💾", tooltip: "Gestionar backups" }
        ]
      };
      
      return optionsByRole[this.userRole] || optionsByRole.client;
    },
    
    filteredQuickOptions() {
      // Filtrar opciones basadas en el historial reciente
      const recentMessages = this.messageHistory.slice(-5);
      return this.quickOptions.filter(option => {
        // No mostrar opciones recientemente usadas
        return !recentMessages.some(msg => 
          msg.toLowerCase().includes(option.text.toLowerCase()) ||
          option.text.toLowerCase().includes(msg.toLowerCase())
        );
      });
    },
    
    currentSuggestions() {
      const suggestionsByRole = {
        client: [
          { text: "¿Cómo agendo una cita?", emoji: "❓", tooltip: "Instrucciones para agendar" },
          { text: "Horarios de atención", emoji: "⏰", tooltip: "Ver horarios disponibles" },
          { text: "Cancelar cita", emoji: "❌", tooltip: "Cómo cancelar una cita" },
          { text: "Mi perfil", emoji: "👤", tooltip: "Ver mi perfil" }
        ],
        provider: [
          { text: "Añadir nuevo servicio", emoji: "➕", tooltip: "Agregar nuevo servicio" },
          { text: "Modificar horarios", emoji: "🕒", tooltip: "Cambiar horarios disponibles" },
          { text: "Clientes frecuentes", emoji: "⭐", tooltip: "Ver clientes frecuentes" },
          { text: "Reseñas", emoji: "🌟", tooltip: "Ver reseñas recibidas" }
        ],
        admin: [
          { text: "Usuarios inactivos", emoji: "👤", tooltip: "Ver usuarios inactivos" },
          { text: "Reportes diarios", emoji: "📅", tooltip: "Generar reporte diario" },
          { text: "Alertas del sistema", emoji: "⚠️", tooltip: "Ver alertas recientes" },
          { text: "Configuración", emoji: "⚙️", tooltip: "Configuración del sistema" }
        ]
      };
      
      return suggestionsByRole[this.userRole] || suggestionsByRole.client;
    },
    
    welcomeFeatures() {
      const featuresByRole = {
        client: [
          "📅 Gestión de citas y reservas",
          "🐾 Información de tus mascotas",
          "🛎️ Explorar servicios disponibles",
          "💰 Consultar precios y promociones",
          "🏥 Emergencias veterinarias",
          "📱 Actualizaciones en tiempo real"
        ],
        provider: [
          "📊 Gestión de agenda completa",
          "🛎️ Administración de servicios",
          "📈 Estadísticas de negocio",
          "👥 Información de clientes",
          "💰 Reportes de ingresos",
          "🔔 Notificaciones importantes"
        ],
        admin: [
          "👥 Gestión completa de usuarios",
          "🏢 Control de proveedores",
          "📊 Reportes del sistema",
          "🛎️ Administración de servicios",
          "🔒 Seguridad y auditoría",
          "📈 Métricas de plataforma"
        ]
      };
      
      return featuresByRole[this.userRole] || featuresByRole.client;
    },
    
    userName() {
      try {
        const userStore = useUserStore();
        return userStore.user?.name || "Usuario";
      } catch {
        return "Usuario";
      }
    },
    
    canSendMessage() {
      const trimmed = this.userInput.trim();
      return trimmed.length > 0 && trimmed.length <= 1000 && !this.isLoading;
    },
    
    showNewMessageIndicator() {
      return !this.isAtBottom && this.messages.length > 3;
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
    
    getUserInitial() {
      try {
        const userStore = useUserStore();
        return userStore.user?.name?.charAt(0)?.toUpperCase() || "U";
      } catch {
        return "U";
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
    
    getStatusText() {
      const statusTexts = {
        connected: "Conectado",
        connecting: "Conectando...",
        error: "Error de conexión",
        offline: "Sin conexión"
      };
      return statusTexts[this.connectionStatus] || "Conectado";
    },
    
    getConnectionMessage() {
      const messages = {
        connected: "✅ Conectado",
        connecting: "🔄 Conectando...",
        error: "❌ Error de conexión",
        offline: "📴 Sin conexión"
      };
      return messages[this.connectionStatus] || "Conectado";
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
      
      if (this.isOpen) {
        // Inicializar cuando se abre
        this.userRole = this.getUserRole();
        this.checkConnection();
        
        if (this.messages.length === 0) {
          this.addWelcomeMessage();
        }
        
        this.hasNewMessage = false;
        
        // Enfocar el input después de la animación
        this.$nextTick(() => {
          setTimeout(() => {
            this.scrollToBottom();
            this.checkScrollButtons();
            this.$refs.messageInput?.focus();
          }, 300);
        });
        
        // Registrar apertura
        this.logInteraction('chat_opened');
      } else {
        this.logInteraction('chat_closed');
      }
    },
    
    addWelcomeMessage() {
      const welcomeMessages = {
        client: `¡Hola **${this.userName}**! 👋 Soy PetBot, tu asistente virtual especializado en servicios para mascotas.

Estoy aquí para ayudarte con todo lo relacionado con el cuidado de tus mascotas. Puedo:

• **Gestionar citas** - Ver, agendar o cancelar
• **Información de mascotas** - Tus animales registrados
• **Servicios disponibles** - Explorar opciones y precios
• **Emergencias** - Protocolos y contactos urgentes
• **Preguntas generales** - Todo sobre cuidado animal

¡Estoy disponible 24/7 para asistirte! ¿En qué puedo ayudarte hoy? 😊`,

        provider: `¡Hola **${this.userName}**! 💼 Soy PetBot, tu asistente para la gestión de servicios.

Mi función es ayudarte a optimizar tu negocio de cuidado animal. Puedo asistirte con:

• **Gestión de agenda** - Citas, disponibilidad, horarios
• **Servicios ofrecidos** - Administrar y promocionar
• **Estadísticas** - Métricas de negocio y rendimiento
• **Clientes** - Información y preferencias
• **Reportes** - Generación y análisis de datos

¿Qué área de tu negocio necesitas gestionar hoy? 📊`,

        admin: `¡Hola **${this.userName}**! 👨‍💼 Soy PetBot, tu asistente administrativo del sistema.

Tengo acceso a las funcionalidades administrativas completas de la plataforma. Puedo ayudarte con:

• **Gestión de usuarios** - Control completo del sistema
• **Proveedores** - Aprobación, seguimiento y reportes
• **Servicios globales** - Categorización y control
• **Estadísticas** - Métricas de toda la plataforma
• **Seguridad** - Monitoreo y auditoría
• **Reportes** - Generación y exportación

¿Qué aspecto del sistema necesitas revisar? ⚙️`
      };

      const message = welcomeMessages[this.userRole] || welcomeMessages.client;
      this.addMessage({
        sender: "bot",
        text: message,
        timestamp: new Date(),
        type: "welcome"
      });
    },
    
    addMessage(messageData) {
      const message = {
        sender: messageData.sender || "bot",
        text: messageData.text,
        timestamp: messageData.timestamp || new Date(),
        type: messageData.type || "text",
        intent: messageData.intent,
        responseTime: messageData.responseTime,
        aiUsed: messageData.aiUsed,
        loading: messageData.loading || false,
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
      
      this.messages.push(message);
      
      // Guardar en historial para filtrado
      if (message.sender === 'me') {
        this.messageHistory.push(message.text);
        if (this.messageHistory.length > 10) {
          this.messageHistory.shift();
        }
      }
      
      // Reproducir sonido si está habilitado
      if (this.soundEnabled && message.sender === 'bot' && !message.loading) {
        this.playNotificationSound();
      }
      
      // Scroll automático si está cerca del fondo
      this.$nextTick(() => {
        if (this.isAtBottom) {
          this.scrollToBottom();
        }
      });
    },
    
    addUserMessage(text) {
      this.addMessage({
        sender: "me",
        text: text,
        timestamp: new Date()
      });
    },
    
    async sendMessage() {
      if (!this.canSendMessage || this.isLoading) return;
      
      const text = this.userInput.trim();
      this.addUserMessage(text);
      this.userInput = "";
      this.isLoading = true;
      this.connectionStatus = "connecting";
      
      // Agregar mensaje de carga
      const loadingMessageId = `loading_${Date.now()}`;
      this.addMessage({
        sender: "bot",
        text: "",
        loading: true,
        id: loadingMessageId
      });
      
      try {
        const token = localStorage.getItem("token");
        
        if (!token) {
          throw new Error("No hay token de autenticación. Por favor, inicia sesión nuevamente.");
        }
        
        const startTime = Date.now();
        
        const res = await API.post("/chat", 
          { message: text },
          { 
            timeout: 35000,
            headers: {
              'X-Request-ID': `frontend_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            }
          }
        );
        
        const responseTime = Date.now() - startTime;
        
        if (res.data.error) {
          throw new Error(res.data.error);
        }
        
        // Remover mensaje de carga
        const loadingIndex = this.messages.findIndex(m => m.id === loadingMessageId);
        if (loadingIndex !== -1) {
          this.messages.splice(loadingIndex, 1);
        }
        
        // Agregar respuesta
        this.addMessage({
          sender: "bot",
          text: res.data.reply || "Lo siento, no pude generar una respuesta.",
          timestamp: new Date(),
          intent: res.data.intent,
          responseTime: res.data.responseTime || responseTime,
          aiUsed: res.data.aiUsed || false,
          requestId: res.data.requestId
        });
        
        this.connectionStatus = "connected";
        this.retryCount = 0;
        
        // Log exitoso
        this.logInteraction('message_sent', {
          length: text.length,
          responseTime,
          intent: res.data.intent
        });
        
      } catch (error) {
        console.error("Chat error:", error);
        
        // Remover mensaje de carga
        const loadingIndex = this.messages.findIndex(m => m.id === loadingMessageId);
        if (loadingIndex !== -1) {
          this.messages.splice(loadingIndex, 1);
        }
        
        this.handleChatError(error);
        
        // Log de error
        this.logInteraction('message_error', {
          error: error.message,
          status: error.response?.status
        });
        
      } finally {
        this.isLoading = false;
        this.$nextTick(() => {
          this.$refs.messageInput?.focus();
        });
      }
    },
    
    handleChatError(error) {
      let errorMessage = "";
      
      if (error.response) {
        switch (error.response.status) {
          case 401:
            errorMessage = "🔐 **Sesión expirada**\n\nPor favor, inicia sesión nuevamente para continuar usando el chat.";
            this.connectionStatus = "error";
            this.logoutUser();
            break;
          case 429:
            errorMessage = "⏰ **Demasiadas peticiones**\n\nPor favor, espera unos momentos antes de enviar otro mensaje.";
            this.connectionStatus = "connected";
            break;
          case 400:
            errorMessage = "📝 **Mensaje no válido**\n\nPor favor, escribe un mensaje válido (máximo 1000 caracteres).";
            this.connectionStatus = "connected";
            break;
          case 500:
          case 502:
          case 503:
          case 504:
            errorMessage = "🚧 **Servicio temporalmente no disponible**\n\nNuestros servidores están experimentando problemas. Por favor, intenta nuevamente en unos minutos.";
            this.connectionStatus = "error";
            break;
          default:
            errorMessage = "❌ **Error de conexión**\n\nNo se pudo conectar con el servidor. Verifica tu conexión a internet.";
            this.connectionStatus = "error";
        }
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = "⏰ **Tiempo de espera agotado**\n\nEl servidor está tardando en responder. Por favor, intenta nuevamente.";
        this.connectionStatus = "error";
      } else if (error.message.includes("token")) {
        errorMessage = "🔐 **Error de autenticación**\n\nPor favor, inicia sesión nuevamente.";
        this.connectionStatus = "error";
        this.logoutUser();
      } else if (error.message.includes("Network Error")) {
        errorMessage = "🌐 **Error de red**\n\nVerifica tu conexión a internet e intenta nuevamente.";
        this.connectionStatus = "offline";
      } else {
        errorMessage = "❌ **Error inesperado**\n\nHa ocurrido un problema inesperado. Por favor, intenta nuevamente más tarde.";
        this.connectionStatus = "error";
      }
      
      this.addMessage({
        sender: "bot",
        text: errorMessage,
        timestamp: new Date(),
        type: "error"
      });
      
      // Incrementar contador de reintentos
      this.retryCount++;
      
      // Mostrar toast para errores graves
      if (error.response?.status === 500 || this.retryCount > 3) {
        this.toast.error("Problemas técnicos en el chat. Contacta soporte si persiste.", {
          timeout: 5000,
          position: "bottom-right"
        });
      }
    },
    
    logoutUser() {
      setTimeout(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }, 2000);
    },
    
    sendQuick(text) {
      if (this.isLoading) return;
      
      this.userInput = text;
      this.sendMessage();
      
      // Log de botón rápido usado
      this.logInteraction('quick_button_used', { buttonText: text });
    },
    
    clearChat() {
      if (this.messages.length === 0) return;
      
      if (confirm("¿Estás seguro de que quieres limpiar toda la conversación?")) {
        this.messages = [];
        this.messageHistory = [];
        this.addWelcomeMessage();
        
        this.logInteraction('chat_cleared');
        
        this.toast.success("Conversación limpiada", {
          timeout: 2000,
          position: "bottom-right"
        });
      }
    },
    
    clearInput() {
      this.userInput = "";
      this.$refs.messageInput?.focus();
    },
    
    toggleSound() {
      this.soundEnabled = !this.soundEnabled;
      localStorage.setItem("chatSoundEnabled", this.soundEnabled.toString());
      
      this.toast.info(this.soundEnabled ? "Sonidos activados" : "Sonidos desactivados", {
        timeout: 1500,
        position: "bottom-right"
      });
    },
    
    toggleSuggestions() {
      this.showSuggestions = !this.showSuggestions;
      localStorage.setItem("chatSuggestions", this.showSuggestions.toString());
    },
    
    toggleQuickButtons() {
      this.showQuickButtons = !this.showQuickButtons;
      localStorage.setItem("chatQuickButtons", this.showQuickButtons.toString());
      
      this.$nextTick(() => {
        this.checkScrollButtons();
      });
    },
    
    isButtonDisabled(buttonText) {
      // Deshabilitar botones que ya fueron usados recientemente
      const recentUsage = this.messageHistory.some(msg => 
        msg.toLowerCase().includes(buttonText.toLowerCase())
      );
      return recentUsage || this.isLoading;
    },
    
    isButtonActive(buttonText) {
      // Resaltar botón si coincide con el input actual
      return this.userInput.toLowerCase().includes(buttonText.toLowerCase());
    },
    
    checkInput() {
      // Auto-expandir input para múltiples líneas
      const input = this.$refs.messageInput;
      if (input && this.userInput.includes('\n')) {
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 120) + 'px';
      }
    },
    
    handlePaste(event) {
      // Limitar contenido pegado
      const pastedText = event.clipboardData.getData('text');
      if (pastedText.length > 1000) {
        event.preventDefault();
        this.toast.warning("El texto pegado es demasiado largo", {
          timeout: 3000
        });
      }
    },
    
    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.messagesContainer;
        if (container) {
          container.scrollTop = container.scrollHeight;
          this.isAtBottom = true;
        }
      });
    },
    
    scrollQuickButtons(distance) {
      const container = this.$refs.quickButtonsScroll;
      if (container) {
        const newScrollLeft = container.scrollLeft + distance;
        container.scrollLeft = newScrollLeft;
        
        // Actualizar estado de flechas después de la animación
        setTimeout(() => {
          this.updateScrollButtonsState();
        }, 100);
      }
    },
    
    checkScrollButtons() {
      this.$nextTick(() => {
        const container = this.$refs.quickButtonsScroll;
        if (container) {
          this.showScrollArrows = container.scrollWidth > container.clientWidth;
          this.updateScrollButtonsState();
        }
      });
    },
    
    updateScrollButtonsState() {
      const container = this.$refs.quickButtonsScroll;
      if (container) {
        this.canScrollLeft = container.scrollLeft > 0;
        this.canScrollRight = container.scrollLeft < (container.scrollWidth - container.clientWidth - 10);
      }
    },
    
    handleScroll() {
      const container = this.$refs.messagesContainer;
      if (container) {
        const { scrollTop, scrollHeight, clientHeight } = container;
        this.scrollPosition = scrollTop;
        this.isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
      }
    },
    
    checkConnection() {
      // Verificar conexión a la API
      API.get("/chat/health")
        .then(() => {
          this.connectionStatus = "connected";
          this.retryCount = 0;
        })
        .catch(() => {
          this.connectionStatus = "offline";
        });
    },
    
    retryConnection() {
      this.connectionStatus = "connecting";
      this.checkConnection();
    },
    
    getCurrentTime() {
      return new Date().toLocaleTimeString('es-VE', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    },
    
    formatTime(timestamp) {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 1) {
        return "Ahora";
      } else if (diffMins < 60) {
        return `Hace ${diffMins} min`;
      } else if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString('es-VE', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      } else {
        return date.toLocaleDateString('es-VE', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    },
    
    formatMessage(text) {
      if (!text) return '';
      
      // Escapar HTML primero
      const escapedText = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
      
      // Aplicar formato
      return escapedText
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-800">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
        .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
        .replace(/# (.*?)(?=\n|$)/g, '<h4 class="text-lg font-bold mt-3 mb-2">$1</h4>')
        .replace(/## (.*?)(?=\n|$)/g, '<h5 class="text-md font-semibold mt-2 mb-1">$1</h5>')
        .replace(/• (.*?)(?=\n|$)/g, '<div class="flex items-start mt-1"><span class="mr-2">•</span><span>$1</span></div>')
        .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline break-all">$1</a>')
        .replace(/📅/g, '<span class="inline-block mr-1" aria-label="calendario">📅</span>')
        .replace(/🐾/g, '<span class="inline-block mr-1" aria-label="huella">🐾</span>')
        .replace(/🛎️/g, '<span class="inline-block mr-1" aria-label="campana">🛎️</span>')
        .replace(/💰/g, '<span class="inline-block mr-1" aria-label="dinero">💰</span>')
        .replace(/🏥/g, '<span class="inline-block mr-1" aria-label="hospital">🏥</span>')
        .replace(/📊/g, '<span class="inline-block mr-1" aria-label="gráfico">📊</span>')
        .replace(/👥/g, '<span class="inline-block mr-1" aria-label="personas">👥</span>')
        .replace(/⚙️/g, '<span class="inline-block mr-1" aria-label="engranaje">⚙️</span>');
    },
    
    playNotificationSound() {
      if (!this.soundEnabled) return;
      
      try {
        // Crear sonido simple (beep)
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
      } catch (error) {
        console.log("Audio no disponible:", error);
      }
    },
    
    logInteraction(type, data = {}) {
      if (process.env.NODE_ENV === 'production') {
        // En producción, enviar a analytics
        const logData = {
          type,
          userId: this.getUserId(),
          userRole: this.userRole,
          timestamp: new Date().toISOString(),
          ...data
        };
        
        // Aquí podrías enviar a Google Analytics, Mixpanel, etc.
        console.log('[Chat Interaction]', logData);
      }
    },
    
    getUserId() {
      try {
        const userStore = useUserStore();
        return userStore.user?._id || 'anonymous';
      } catch {
        return 'anonymous';
      }
    }
  },
  
  watch: {
    isOpen(newVal) {
      if (newVal) {
        // Cargar preferencias
        const savedSound = localStorage.getItem("chatSoundEnabled");
        if (savedSound !== null) {
          this.soundEnabled = savedSound === 'true';
        }
        
        const savedSuggestions = localStorage.getItem("chatSuggestions");
        if (savedSuggestions !== null) {
          this.showSuggestions = savedSuggestions === 'true';
        }
        
        const savedQuickButtons = localStorage.getItem("chatQuickButtons");
        if (savedQuickButtons !== null) {
          this.showQuickButtons = savedQuickButtons === 'true';
        }
        
        // Verificar conexión
        this.checkConnection();
      }
    },
    
    messages: {
      handler() {
        this.$nextTick(() => {
          if (this.isAtBottom) {
            this.scrollToBottom();
          }
        });
      },
      deep: true
    },
    
    userRole() {
      // Resetear sugerencias cuando cambia el rol
      this.$nextTick(() => {
        this.checkScrollButtons();
      });
    }
  },
  
  mounted() {
    // Obtener el rol del usuario
    this.userRole = this.getUserRole();
    
    // Configurar listeners
    window.addEventListener('resize', this.checkScrollButtons);
    
    // Configurar scroll listener
    const messagesContainer = this.$refs.messagesContainer;
    if (messagesContainer) {
      messagesContainer.addEventListener('scroll', this.handleScroll);
    }
    
    // Verificar scroll después de que se rendericen los botones
    this.$nextTick(() => {
      setTimeout(() => {
        this.checkScrollButtons();
      }, 100);
    });
    
    // Verificar conexión inicial
    this.checkConnection();
    
    // Configurar auto-focus cuando se hace clic en el toggle
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.toggleChat();
      }
    });
  },
  
  beforeUnmount() {
    // Limpiar listeners
    window.removeEventListener('resize', this.checkScrollButtons);
    
    const messagesContainer = this.$refs.messagesContainer;
    if (messagesContainer) {
      messagesContainer.removeEventListener('scroll', this.handleScroll);
    }
    
    document.removeEventListener('keydown', this.handleKeydown);
  }
};
</script>

<style scoped>
/* Variables CSS para consistencia */
:root {
  --primary-color: #3b82f6;
  --primary-dark: #1d4ed8;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --error-color: #ef4444;
  --info-color: #06b6d4;
  --bg-light: #f8fafc;
  --bg-white: #ffffff;
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  --border-light: #e5e7eb;
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-full: 9999px;
  --transition-fast: 150ms;
  --transition-normal: 250ms;
  --transition-slow: 350ms;
}

/* Contenedor principal */
.chatbot-container {
  position: fixed;
  bottom: 24px;
  left: 24px;
  z-index: 1000;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Botón flotante */
.chatbot-toggle {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  border: 3px solid white;
  box-shadow: var(--shadow-lg);
  transition: all var(--transition-normal) cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
  outline: none;
}

.chatbot-toggle:hover {
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.chatbot-toggle-open {
  transform: scale(1.05);
  background: linear-gradient(135deg, var(--primary-dark), #1e40af);
}

.chatbot-toggle-img {
  width: 36px;
  height: 36px;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.notification-dot {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 12px;
  height: 12px;
  background: var(--error-color);
  border-radius: var(--radius-full);
  border: 2px solid white;
  animation: pulse 2s infinite;
  z-index: 2;
}

.connection-status-indicator {
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 10px;
  height: 10px;
  border-radius: var(--radius-full);
  border: 2px solid white;
  z-index: 2;
}

.connection-status-indicator.connected {
  background: var(--success-color);
  animation: pulse 3s infinite;
}

.connection-status-indicator.connecting {
  background: var(--warning-color);
  animation: pulse 1s infinite;
}

.connection-status-indicator.error,
.connection-status-indicator.offline {
  background: var(--error-color);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Ventana del chat */
.chatbot-window {
  position: fixed;
  bottom: 96px;
  left: 24px;
  width: 420px;
  max-width: calc(100vw - 48px);
  height: 580px;
  max-height: calc(100vh - 120px);
  background: var(--bg-white);
  border-radius: var(--radius-xl);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15), 0 10px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border-light);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  backdrop-filter: blur(10px);
}

/* Header */
.chatbot-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: white;
  box-shadow: var(--shadow-sm);
  flex-shrink: 0;
}

.chatbot-identity {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.chatbot-avatar {
  width: 44px;
  height: 44px;
  object-fit: contain;
  border-radius: var(--radius-full);
  border: 2px solid rgba(255, 255, 255, 0.3);
  flex-shrink: 0;
}

.chatbot-info {
  flex: 1;
  min-width: 0;
}

.chatbot-info h3 {
  font-weight: 700;
  font-size: 16px;
  margin: 0 0 2px 0;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chatbot-info p {
  font-size: 12px;
  opacity: 0.9;
  margin: 0 0 4px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chatbot-status {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: var(--radius-full);
  background: var(--success-color);
}

.status-dot.connected { background: var(--success-color); }
.status-dot.connecting { background: var(--warning-color); animation: pulse 1s infinite; }
.status-dot.error { background: var(--error-color); }
.status-dot.offline { background: var(--text-secondary); }

.status-text {
  font-size: 11px;
  opacity: 0.8;
}

.chatbot-controls {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.control-btn {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: white;
  cursor: pointer;
  transition: all var(--transition-fast) ease;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: scale(1.05);
}

.control-btn:active {
  transform: scale(0.95);
}

.control-icon {
  width: 18px;
  height: 18px;
}

/* Área de mensajes */
.chatbot-messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: linear-gradient(to bottom, var(--bg-light), var(--bg-white));
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
  scroll-behavior: smooth;
}

.welcome-container {
  margin-bottom: 8px;
}

.welcome-message {
  background: white;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-light);
  padding: 20px;
  box-shadow: var(--shadow-sm);
}

.welcome-header {
  margin-bottom: 16px;
}

.welcome-header h4 {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.welcome-subtitle {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0;
}

.welcome-content {
  font-size: 14px;
  line-height: 1.5;
}

.welcome-content p {
  margin: 0 0 12px 0;
  color: var(--text-primary);
  font-weight: 600;
}

.welcome-features {
  list-style: none;
  padding: 0;
  margin: 0 0 16px 0;
}

.welcome-features li {
  padding: 8px 0 8px 24px;
  position: relative;
  color: var(--text-secondary);
  font-size: 13px;
}

.welcome-features li:before {
  content: "✓";
  position: absolute;
  left: 0;
  color: var(--success-color);
  font-weight: bold;
}

.welcome-tip {
  padding: 12px;
  background: #fef3c7;
  border-radius: var(--radius-md);
  font-size: 12px;
  color: #92400e;
  border-left: 3px solid var(--warning-color);
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
  align-items: flex-start;
  gap: 10px;
  animation: messageAppear 0.3s ease-out;
}

@keyframes messageAppear {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-user {
  flex-direction: row-reverse;
}

.message-bot {
  flex-direction: row;
}

.message-avatar {
  flex-shrink: 0;
  margin-top: 2px;
}

.avatar-small {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-full);
  object-fit: contain;
  border: 1px solid var(--border-light);
}

.user-avatar-initial {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}

.message-content-wrapper {
  flex: 1;
  min-width: 0;
}

.message-user .message-content-wrapper {
  text-align: right;
}

.message-content {
  padding: 12px 16px;
  border-radius: var(--radius-lg);
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.message-user .message-content {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: white;
  border-bottom-right-radius: var(--radius-sm);
  box-shadow: var(--shadow-sm);
}

.message-bot .message-content {
  background: white;
  color: var(--text-primary);
  border: 1px solid var(--border-light);
  border-bottom-left-radius: var(--radius-sm);
  box-shadow: var(--shadow-sm);
}

.error-bubble .message-content {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fca5a5;
}

.message-metadata {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  flex-wrap: wrap;
}

.message-user .message-metadata {
  justify-content: flex-end;
}

.message-time {
  font-size: 11px;
  opacity: 0.7;
}

.message-time-user {
  color: rgba(255, 255, 255, 0.8);
}

.message-time-bot {
  color: var(--text-secondary);
}

.response-time {
  font-size: 10px;
  padding: 2px 6px;
  background: var(--bg-light);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
}

.ai-badge {
  font-size: 10px;
  padding: 2px 6px;
  background: #dbeafe;
  color: #1e40af;
  border-radius: var(--radius-sm);
  font-weight: 600;
}

.message-loading {
  margin-top: 8px;
}

.loading-dots {
  display: flex;
  gap: 4px;
}

.loading-dots .dot {
  width: 6px;
  height: 6px;
  border-radius: var(--radius-full);
  background: var(--text-secondary);
  animation: bounce 1.4s infinite ease-in-out both;
}

.loading-dots .dot:nth-child(1) { animation-delay: -0.32s; }
.loading-dots .dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1.0); }
}

/* Typing indicator */
.typing-indicator {
  display: flex;
  justify-content: flex-start;
  animation: slideInUp 0.3s ease;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.typing-bubble {
  background: white;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  border-bottom-left-radius: var(--radius-sm);
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: var(--shadow-sm);
}

.typing-avatar {
  flex-shrink: 0;
}

.avatar-typing {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  object-fit: contain;
  border: 1px solid var(--border-light);
}

.typing-content {
  flex: 1;
  min-width: 0;
}

.typing-dots {
  display: flex;
  gap: 4px;
  margin-bottom: 4px;
}

.typing-dots .dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  background: var(--primary-color);
  animation: typing-bounce 1.4s infinite ease-in-out both;
}

.typing-dots .dot:nth-child(1) { animation-delay: -0.32s; }
.typing-dots .dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes typing-bounce {
  0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
  40% { transform: translateY(-4px); opacity: 1; }
}

.typing-text {
  font-size: 12px;
  color: var(--text-secondary);
}

/* Indicador de nuevos mensajes */
.new-messages-indicator {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--primary-color);
  color: white;
  padding: 8px 16px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: var(--shadow-lg);
  z-index: 10;
  transition: all var(--transition-fast) ease;
  animation: bounce 2s infinite;
}

.new-messages-indicator:hover {
  background: var(--primary-dark);
  transform: translateX(-50%) scale(1.05);
}

.indicator-text {
  font-size: 13px;
  font-weight: 600;
}

.indicator-icon {
  width: 16px;
  height: 16px;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateX(-50%) translateY(0); }
  40% { transform: translateX(-50%) translateY(-5px); }
  60% { transform: translateX(-50%) translateY(-3px); }
}

/* Sugerencias rápidas */
.suggestions-container {
  border-top: 1px solid var(--border-light);
  background: white;
  flex-shrink: 0;
}

.suggestions-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #f8fafc;
  border-bottom: 1px solid var(--border-light);
}

.suggestions-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.suggestions-toggle {
  width: 24px;
  height: 24px;
  border: none;
  background: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast) ease;
}

.suggestions-toggle:hover {
  color: var(--primary-color);
  transform: rotate(180deg);
}

.suggestions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  padding: 12px 16px;
}

.suggestion-button {
  padding: 10px 12px;
  background: white;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  font-size: 12px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all var(--transition-fast) ease;
  display: flex;
  align-items: center;
  gap: 8px;
  text-align: left;
}

.suggestion-button:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: var(--primary-color);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.suggestion-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.suggestion-highlight {
  background: #eff6ff;
  border-color: var(--primary-color);
  font-weight: 600;
}

.suggestion-emoji {
  font-size: 14px;
  flex-shrink: 0;
}

.suggestion-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Botones rápidos */
.quick-buttons-container {
  border-top: 1px solid var(--border-light);
  background: #f8fafc;
  flex-shrink: 0;
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
  padding: 12px 16px;
  scroll-behavior: smooth;
  scrollbar-width: none;
  -ms-overflow-style: none;
  flex: 1;
}

.quick-buttons-scroll::-webkit-scrollbar {
  display: none;
}

.quick-button {
  flex-shrink: 0;
  padding: 8px 12px;
  background: white;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  font-size: 12px;
  font-weight: 500;
  color: var(--text-primary);
  cursor: pointer;
  transition: all var(--transition-fast) ease;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  min-width: max-content;
}

.quick-button:hover:not(:disabled) {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.quick-button:active:not(:disabled) {
  transform: translateY(0);
}

.quick-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.quick-button-active {
  background: #eff6ff;
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.quick-button-emoji {
  font-size: 14px;
}

.quick-button-text {
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
}

.scroll-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 28px;
  height: 28px;
  background: white;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: var(--text-primary);
  cursor: pointer;
  z-index: 10;
  box-shadow: var(--shadow-md);
  transition: all var(--transition-fast) ease;
}

.scroll-button:hover {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.scroll-left {
  left: 8px;
}

.scroll-right {
  right: 8px;
}

/* Área de input */
.input-container {
  border-top: 1px solid var(--border-light);
  background: white;
  flex-shrink: 0;
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px;
  position: relative;
}

.input-action-btn {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  background: var(--bg-light);
  border: 1px solid var(--border-light);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast) ease;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.input-action-btn:hover {
  background: #e5e7eb;
  color: var(--text-primary);
}

.action-icon {
  width: 18px;
  height: 18px;
}

.clear-btn {
  font-size: 20px;
  font-weight: 300;
}

.message-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  font-size: 14px;
  line-height: 1.5;
  outline: none;
  transition: all var(--transition-fast) ease;
  background: white;
  min-height: 44px;
  max-height: 120px;
  resize: none;
  font-family: inherit;
}

.message-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.message-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.message-input::placeholder {
  color: var(--text-secondary);
}

.input-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.char-counter {
  font-size: 11px;
  color: var(--text-secondary);
  min-width: 50px;
  text-align: right;
}

.char-warning {
  color: var(--warning-color);
  font-weight: 600;
}

.send-button {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  border: none;
  border-radius: var(--radius-lg);
  color: white;
  cursor: pointer;
  transition: all var(--transition-fast) ease;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.send-button:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.send-button:active:not(:disabled) {
  transform: scale(0.98);
}

.send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.send-button-loading {
  opacity: 0.8;
}

.send-icon {
  width: 20px;
  height: 20px;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: var(--radius-full);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.connection-info {
  padding: 8px 16px;
  background: #f8fafc;
  border-top: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
}

.connection-text {
  display: flex;
  align-items: center;
  gap: 6px;
}

.connection-text.connected { color: var(--success-color); }
.connection-text.connecting { color: var(--warning-color); }
.connection-text.error { color: var(--error-color); }
.connection-text.offline { color: var(--text-secondary); }

.retry-btn {
  padding: 4px 12px;
  background: var(--primary-color);
  border: none;
  border-radius: var(--radius-sm);
  color: white;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast) ease;
}

.retry-btn:hover {
  background: var(--primary-dark);
}

/* Animaciones de la ventana */
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

/* Responsive */
@media (max-width: 480px) {
  .chatbot-container {
    bottom: 16px;
    left: 16px;
  }
  
  .chatbot-toggle {
    width: 56px;
    height: 56px;
  }
  
  .chatbot-window {
    bottom: 80px;
    left: 16px;
    width: calc(100vw - 32px);
    height: calc(100vh - 96px);
    max-height: calc(100vh - 96px);
  }
  
  .suggestions-grid {
    grid-template-columns: 1fr;
  }
}

/* Modo oscuro */
@media (prefers-color-scheme: dark) {
  .chatbot-window {
    background: #1f2937;
    border-color: #374151;
  }
  
  .message-bot .message-content {
    background: #374151;
    color: #f9fafb;
    border-color: #4b5563;
  }
  
  .welcome-message {
    background: #374151;
    border-color: #4b5563;
    color: #f9fafb;
  }
  
  .welcome-header h4,
  .welcome-content p {
    color: #f9fafb;
  }
  
  .welcome-features li {
    color: #d1d5db;
  }
  
  .suggestions-container,
  .quick-buttons-container {
    background: #111827;
    border-color: #374151;
  }
  
  .suggestion-button,
  .quick-button {
    background: #374151;
    border-color: #4b5563;
    color: #f9fafb;
  }
  
  .suggestion-button:hover:not(:disabled) {
    background: #4b5563;
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
  
  .message-input::placeholder {
    color: #9ca3af;
  }
  
  .input-action-btn {
    background: #374151;
    border-color: #4b5563;
    color: #d1d5db;
  }
  
  .char-counter {
    color: #9ca3af;
  }
}
</style>