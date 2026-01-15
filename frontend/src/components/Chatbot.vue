<template>
  <!-- ChatBot Container -->
  <div class="chatbot-container" :class="{ 'chat-open': isOpen }">
    <!-- Botón flotante -->
    <button
      @click="toggleChat"
      class="chatbot-toggle"
      :title="isOpen ? 'Cerrar chat' : 'Abrir chat'"
      aria-label="Abrir asistente virtual"
    >
      <img 
        src="/petbot.png"
        class="chatbot-toggle-img"
        alt="PetBot - Asistente virtual"
        @error="handleImageError"
      />
      <!-- Indicador de notificación -->
      <div v-if="!isOpen && hasNewMessage" class="notification-dot"></div>
      <!-- Indicador de conexión -->
      <div class="connection-status" :class="connectionStatus"></div>
    </button>

    <!-- Ventana del Chat -->
    <transition name="chat-window">
      <div
        v-if="isOpen"
        class="chatbot-window"
        role="dialog"
        aria-label="Ventana de chat con asistente virtual"
      >
        <!-- Header -->
        <div class="chatbot-header">
          <div class="header-left">
            <img 
              src="/petbot2.png"
              class="chatbot-avatar"
              alt="PetBot avatar"
              @error="handleImageError"
            />
            <div class="chatbot-info">
              <h3>PetBot AI</h3>
              <p>{{ getRoleDescription() }}</p>
              <div class="connection-indicator" :class="connectionStatus">
                <span class="indicator-dot"></span>
                <span class="indicator-text">{{ getConnectionText() }}</span>
              </div>
            </div>
          </div>
          <div class="header-actions">
            <button 
              @click="clearChat"
              class="header-btn"
              title="Limpiar conversación"
              aria-label="Limpiar conversación"
            >
              <svg class="header-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
            <button 
              @click="toggleChat" 
              class="close-btn"
              title="Cerrar chat"
              aria-label="Cerrar chat"
            >
              ×
            </button>
          </div>
        </div>

        <!-- Área de mensajes -->
        <div 
          ref="messagesContainer" 
          class="chatbot-messages"
          @scroll="handleScroll"
          role="log"
          aria-live="polite"
          aria-label="Mensajes del chat"
        >
          <!-- Mensaje de bienvenida -->
          <div v-if="showWelcome" class="welcome-message">
            <div class="welcome-content">
              <h4>👋 ¡Hola {{ userName }}!</h4>
              <p>Soy PetBot, tu asistente virtual para servicios de mascotas.</p>
              <div class="welcome-features">
                <div class="feature" v-for="feature in welcomeFeatures" :key="feature">
                  <span class="feature-icon">{{ getFeatureIcon(feature) }}</span>
                  <span class="feature-text">{{ feature }}</span>
                </div>
              </div>
              <p class="welcome-hint">Escribe tu pregunta o usa los botones rápidos ↓</p>
            </div>
          </div>

          <!-- Historial de mensajes -->
          <div
            v-for="(msg, index) in messages"
            :key="msg.id || index"
            :class="[
              'message-container',
              msg.sender === 'me' ? 'message-right' : 'message-left',
              msg.type ? `message-${msg.type}` : ''
            ]"
          >
            <!-- Mensaje del usuario -->
            <div v-if="msg.sender === 'me'" class="message-user-wrapper">
              <div class="message-bubble message-user">
                <div class="message-content" v-html="formatMessage(msg.text)"></div>
                <div class="message-footer">
                  <div class="message-time">{{ msg.time }}</div>
                  <div v-if="msg.status" class="message-status" :title="getStatusTitle(msg.status)">
                    <span v-if="msg.status === 'sending'" class="sending-dot"></span>
                    <svg v-else-if="msg.status === 'sent'" class="sent-icon" viewBox="0 0 24 24">
                      <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z"/>
                    </svg>
                    <svg v-else-if="msg.status === 'error'" class="error-icon" viewBox="0 0 24 24">
                      <path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm6 16.094l-4.157-4.104 4.1-4.141-1.849-1.849-4.105 4.159-4.156-4.102-1.833 1.834 4.161 4.12-4.104 4.157 1.834 1.832 4.118-4.159 4.143 4.102 1.848-1.849z"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <!-- Mensaje del bot -->
            <div v-else class="message-bot-wrapper">
              <div class="message-bubble message-bot">
                <div class="bot-header">
                  <img 
                    src="/petbot2.png" 
                    class="bot-avatar-small"
                    alt="PetBot"
                    @error="handleImageError"
                  />
                  <span class="bot-name">PetBot</span>
                </div>
                <div class="message-content" v-html="formatMessage(msg.text)"></div>
                
                <!-- Acciones para mensajes del bot -->
                <div v-if="msg.actions && msg.actions.length > 0" class="message-actions">
                  <button
                    v-for="action in msg.actions"
                    :key="action.label"
                    @click="handleBotAction(action)"
                    class="action-btn"
                    :class="action.type || 'secondary'"
                  >
                    {{ action.label }}
                  </button>
                </div>
                
                <div class="message-footer">
                  <div class="message-time">{{ msg.time }}</div>
                  <div v-if="msg.intent" class="message-intent" :title="'Intención: ' + msg.intent">
                    {{ getIntentIcon(msg.intent) }}
                  </div>
                </div>
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

          <!-- Indicador de nuevos mensajes -->
          <div v-if="showScrollDown" class="scroll-down-indicator">
            <button @click="scrollToBottom" class="scroll-down-btn" title="Ir al último mensaje">
              <svg class="scroll-down-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
              <span>Nuevos mensajes</span>
            </button>
          </div>
        </div>

        <!-- Botones rápidos -->
        <div class="quick-buttons-section">
          <div class="quick-buttons-header">
            <h4>Acciones rápidas</h4>
            <div class="quick-buttons-actions">
              <button 
                @click="scrollQuickButtons(-200)"
                class="scroll-btn scroll-left"
                :disabled="!canScrollLeft"
                title="Desplazar izquierda"
              >
                ‹
              </button>
              <button 
                @click="scrollQuickButtons(200)"
                class="scroll-btn scroll-right"
                :disabled="!canScrollRight"
                title="Desplazar derecha"
              >
                ›
              </button>
            </div>
          </div>
          <div class="quick-buttons-container" ref="quickButtonsContainer">
            <div class="quick-buttons-scroll" ref="quickButtonsScroll">
              <button
                v-for="(option, index) in quickOptions"
                :key="index"
                @click="sendQuick(option)"
                :disabled="isLoading"
                class="quick-button"
                :class="{ 
                  'button-business': option.toLowerCase().includes('negocio') || option.toLowerCase().includes('empresa'),
                  'button-service': option.toLowerCase().includes('servicio'),
                  'button-appointment': option.toLowerCase().includes('cita'),
                  'button-pet': option.toLowerCase().includes('mascota')
                }"
              >
                <span class="quick-button-icon">{{ getQuickButtonIcon(option) }}</span>
                <span class="quick-button-text">{{ option }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Área de input -->
        <div class="input-section">
          <div class="input-container">
            <button
              @click="toggleEmojiPicker"
              class="emoji-btn"
              title="Insertar emoji"
              aria-label="Insertar emoji"
            >
              😊
            </button>
            
            <div class="input-wrapper">
              <textarea
                v-model="userInput"
                @keydown.enter.exact.prevent="handleEnter"
                @keydown.enter.shift.exact.prevent="userInput += '\n'"
                @input="handleInput"
                :disabled="isLoading"
                :placeholder="getInputPlaceholder()"
                class="message-input"
                maxlength="1000"
                rows="1"
                ref="messageInput"
                aria-label="Escribe tu mensaje"
              ></textarea>
              
              <div class="input-actions">
                <span class="char-count">{{ userInput.length }}/1000</span>
                <button
                  @click="sendVoiceMessage"
                  class="voice-btn"
                  :class="{ 'recording': isRecording }"
                  title="Grabar mensaje de voz"
                  aria-label="Grabar mensaje de voz"
                >
                  <svg v-if="!isRecording" class="voice-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  <span v-else class="recording-dot"></span>
                </button>
              </div>
            </div>
            
            <button
              @click="sendMessage"
              :disabled="isLoading || !userInput.trim()"
              class="send-button"
              :class="{ 'sending': isLoading }"
              title="Enviar mensaje"
              aria-label="Enviar mensaje"
            >
              <svg v-if="!isLoading" class="send-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              <div v-else class="loading-spinner"></div>
            </button>
          </div>
          
          <!-- Sugerencias mientras escribe -->
          <div v-if="showSuggestions && suggestions.length > 0" class="suggestions-container">
            <div class="suggestions">
              <button
                v-for="suggestion in suggestions"
                :key="suggestion"
                @click="selectSuggestion(suggestion)"
                class="suggestion-btn"
              >
                {{ suggestion }}
              </button>
            </div>
          </div>
          
          <!-- Emoji picker -->
          <div v-if="showEmojiPicker" class="emoji-picker">
            <div class="emoji-picker-header">
              <span>Emojis</span>
              <button @click="toggleEmojiPicker" class="emoji-close">×</button>
            </div>
            <div class="emoji-grid">
              <button
                v-for="emoji in commonEmojis"
                :key="emoji"
                @click="insertEmoji(emoji)"
                class="emoji-btn-picker"
              >
                {{ emoji }}
              </button>
            </div>
          </div>
        </div>

        <!-- Footer con información del sistema -->
        <div class="chat-footer">
          <div class="footer-info">
            <span class="footer-text">
              💡 Tip: Puedes preguntar por negocios, servicios o tus mascotas
            </span>
            <div class="footer-stats">
              <span class="stat" title="Mensajes en esta sesión">
                💬 {{ messages.length }}
              </span>
              <span class="stat" title="Estado de conexión">
                <span class="status-dot" :class="connectionStatus"></span>
                {{ getConnectionText() }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import axios from "axios";
import { useUserStore } from "@/stores/userStore";
import { debounce } from "lodash";

export default {
  name: "ChatBot",
  data() {
    return {
      isOpen: false,
      userInput: "",
      messages: [],
      isLoading: false,
      hasNewMessage: false,
      showScrollDown: false,
      userRole: "client",
      userName: "",
      connectionStatus: "connected", // connected, connecting, disconnected
      
      // Quick buttons scroll
      canScrollLeft: false,
      canScrollRight: false,
      quickButtonsScrollPosition: 0,
      
      // Input features
      showEmojiPicker: false,
      isRecording: false,
      showSuggestions: false,
      suggestions: [],
      
      // Session management
      sessionId: null,
      messageHistory: [],
      
      // UI states
      showWelcome: true,
      isAtBottom: true,
      scrollPosition: 0,
      
      // Common emojis
      commonEmojis: ["🐶", "🐱", "❤️", "👍", "😊", "🎉", "✅", "❌", "⚠️", "💰", "🏥", "✂️", "🏠", "🎯", "📅", "📍", "⭐", "📞", "📧"]
    };
  },
  computed: {
    quickOptions() {
      const baseOptions = {
        client: [
          "🔍 Buscar negocios", 
          "🏥 Veterinarias cerca", 
          "✂️ Peluquerías caninas", 
          "📅 Mis próximas citas",
          "🐾 Mis mascotas",
          "💰 Ver precios",
          "🚑 Emergencias",
          "🏠 Guarderías",
          "🎯 Entrenamiento",
          "🛎️ Todos los servicios",
          "⭐ Negocios mejor valorados",
          "📍 Negocios por ubicación"
        ],
        provider: [
          "📅 Citas de hoy",
          "🏢 Mi negocio",
          "🛎️ Mis servicios",
          "📊 Estadísticas",
          "💰 Ingresos mensuales",
          "👥 Mis clientes",
          "⭐ Calificaciones",
          "📋 Reportes",
          "⚙️ Configuración",
          "📈 Análisis de rendimiento"
        ],
        admin: [
          "🏢 Negocios pendientes",
          "👥 Usuarios registrados",
          "📊 Dashboard general",
          "📈 Estadísticas sistema",
          "⚠️ Reportes de problemas",
          "🛠️ Configuración sistema",
          "📋 Logs de actividad",
          "💰 Reportes financieros",
          "⭐ Calificaciones sistema",
          "🔧 Mantenimiento"
        ]
      };
      
      return baseOptions[this.userRole] || baseOptions.client;
    },
    
    welcomeFeatures() {
      const features = {
        client: [
          "Buscar negocios y servicios",
          "Gestionar tus mascotas", 
          "Agendar y ver citas",
          "Ver precios y promociones",
          "Contactar emergencias"
        ],
        provider: [
          "Gestionar tu negocio",
          "Ver citas del día",
          "Administrar servicios",
          "Ver estadísticas",
          "Gestionar clientes"
        ],
        admin: [
          "Aprobar negocios",
          "Gestionar usuarios",
          "Ver reportes del sistema",
          "Monitorear actividad",
          "Configurar plataforma"
        ]
      };
      return features[this.userRole] || features.client;
    }
  },
  methods: {
    // ========== INICIALIZACIÓN ==========
    initialize() {
      this.userRole = this.getUserRole();
      this.userName = this.getUserName();
      this.sessionId = this.generateSessionId();
      this.loadChatHistory();
      this.checkConnection();
      this.setupEventListeners();
    },
    
    getUserRole() {
      try {
        const userStore = useUserStore();
        return userStore.user?.role || "client";
      } catch (error) {
        console.error("Error obteniendo rol:", error);
        return "client";
      }
    },
    
    getUserName() {
      try {
        const userStore = useUserStore();
        return userStore.user?.name || "Usuario";
      } catch (error) {
        return "Usuario";
      }
    },
    
    generateSessionId() {
      return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },
    
    // ========== GESTIÓN DE CHAT ==========
    toggleChat() {
      this.isOpen = !this.isOpen;
      if (this.isOpen) {
        if (this.messages.length === 0) {
          this.showWelcome = true;
        }
        this.hasNewMessage = false;
        this.$nextTick(() => {
          this.scrollToBottom();
          this.checkScrollButtons();
          this.focusInput();
        });
      }
    },
    
    async sendMessage() {
      if (!this.userInput.trim() || this.isLoading) return;

      const messageText = this.userInput.trim();
      const messageId = Date.now();
      
      // Agregar mensaje del usuario con estado "enviando"
      const userMessage = {
        id: messageId,
        sender: "me",
        text: messageText,
        time: this.getCurrentTime(),
        status: "sending"
      };
      
      this.messages.push(userMessage);
      this.messageHistory.push({ ...userMessage, sessionId: this.sessionId });
      this.saveChatHistory();
      
      this.userInput = "";
      this.showSuggestions = false;
      this.isLoading = true;
      this.showWelcome = false;

      try {
        const token = localStorage.getItem("token");
        
        if (!token) {
          throw new Error("No hay token de autenticación");
        }

        const response = await axios.post(
          `${this.getApiUrl()}/api/chat`,
          { 
            message: messageText,
            sessionId: this.sessionId
          },
          { 
            headers: { 
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            },
            timeout: 30000
          }
        );

        // Actualizar estado del mensaje a "enviado"
        const messageIndex = this.messages.findIndex(m => m.id === messageId);
        if (messageIndex !== -1) {
          this.messages[messageIndex].status = "sent";
        }

        if (response.data.error) {
          throw new Error(response.data.error);
        }

        // Agregar respuesta del bot
        this.messages.push({
          id: Date.now() + 1,
          sender: "bot",
          text: response.data.reply || "Lo siento, no pude generar una respuesta.",
          time: this.getCurrentTime(),
          intent: response.data.intent,
          type: response.data.type,
          actions: this.generateActions(response.data.intent, response.data.reply)
        });

      } catch (error) {
        console.error("Chat error:", error);
        
        // Actualizar estado del mensaje a "error"
        const messageIndex = this.messages.findIndex(m => m.id === messageId);
        if (messageIndex !== -1) {
          this.messages[messageIndex].status = "error";
        }

        let errorMessage = this.getErrorMessage(error);
        
        this.messages.push({
          id: Date.now() + 1,
          sender: "bot",
          text: errorMessage,
          time: this.getCurrentTime(),
          type: "error"
        });
        
      } finally {
        this.isLoading = false;
        this.scrollToBottom();
        this.focusInput();
      }
    },
    
    sendQuick(text) {
      const cleanText = text.replace(/[🔍🏥✂️📅🐾💰🚑🏠🎯🛎️⭐📍👥📊📈📋⚙️⚠️🛠️🔧]/g, '').trim();
      this.userInput = cleanText;
      this.sendMessage();
      this.scrollToBottom();
    },
    
    // ========== GESTIÓN DE HISTORIAL ==========
    loadChatHistory() {
      try {
        const savedHistory = localStorage.getItem(`petbot_history_${this.userRole}`);
        if (savedHistory) {
          const history = JSON.parse(savedHistory);
          // Mostrar solo los últimos 10 mensajes
          this.messages = history.slice(-10);
          this.messageHistory = history;
        }
      } catch (error) {
        console.error("Error cargando historial:", error);
      }
    },
    
    saveChatHistory() {
      try {
        // Guardar solo los últimos 50 mensajes
        const historyToSave = this.messageHistory.slice(-50);
        localStorage.setItem(`petbot_history_${this.userRole}`, JSON.stringify(historyToSave));
      } catch (error) {
        console.error("Error guardando historial:", error);
      }
    },
    
    clearChat() {
      if (confirm("¿Estás seguro de que quieres limpiar la conversación?")) {
        this.messages = [];
        this.messageHistory = [];
        this.showWelcome = true;
        this.saveChatHistory();
        this.scrollToBottom();
      }
    },
    
    // ========== UI HELPERS ==========
    getRoleDescription() {
      const descriptions = {
        client: "Asistente para clientes 🐾",
        provider: "Asistente para proveedores 🏢", 
        admin: "Asistente administrativo 👨‍💼"
      };
      return descriptions[this.userRole] || "Asistente virtual";
    },
    
    getInputPlaceholder() {
      const placeholders = {
        client: "Pregunta sobre negocios, servicios, mascotas...",
        provider: "Consulta tu negocio, agenda, estadísticas...",
        admin: "Consulta usuarios, negocios, reportes del sistema..."
      };
      return placeholders[this.userRole] || "Escribe tu mensaje...";
    },
    
    getCurrentTime() {
      return new Date().toLocaleTimeString('es-VE', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false
      });
    },
    
    // ========== FORMATO DE MENSAJES ==========
    formatMessage(text) {
      if (!text) return '';
      
      // Primero, escapar HTML
      const div = document.createElement('div');
      div.textContent = text;
      let safeText = div.innerHTML;
      
      // Aplicar formato seguro
      return safeText
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
        .replace(/`(.*?)`/g, '<code class="code">$1</code>')
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        .replace(/^\s*[-*]\s+(.*)/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
        .replace(/(\d+\.\s+.*)/g, '<li>$1</li>')
        .replace(/(<li>\d+\..*<\/li>)/gs, '<ol>$1</ol>');
    },
    
    getFeatureIcon(feature) {
      const iconMap = {
        'negocio': '🏢',
        'servicio': '🛎️',
        'mascota': '🐾',
        'cita': '📅',
        'precio': '💰',
        'emergencia': '🚑',
        'estadística': '📊',
        'cliente': '👥',
        'usuario': '👤',
        'reporte': '📋',
        'configuración': '⚙️'
      };
      
      for (const [key, icon] of Object.entries(iconMap)) {
        if (feature.toLowerCase().includes(key)) return icon;
      }
      return '💡';
    },
    
    getQuickButtonIcon(option) {
      const iconMap = {
        'buscar': '🔍',
        'veterinaria': '🏥',
        'peluquería': '✂️',
        'cita': '📅',
        'mascota': '🐾',
        'precio': '💰',
        'emergencia': '🚑',
        'guardería': '🏠',
        'entrenamiento': '🎯',
        'servicio': '🛎️',
        'valorado': '⭐',
        'ubicación': '📍',
        'negocio': '🏢',
        'estadística': '📊',
        'ingreso': '💰',
        'cliente': '👥',
        'calificación': '⭐',
        'reporte': '📋',
        'configuración': '⚙️',
        'análisis': '📈',
        'pendiente': '⚠️',
        'usuario': '👥',
        'dashboard': '📊',
        'problema': '⚠️',
        'sistema': '🛠️',
        'log': '📋',
        'financiero': '💰',
        'mantenimiento': '🔧'
      };
      
      for (const [key, icon] of Object.entries(iconMap)) {
        if (option.toLowerCase().includes(key)) return icon;
      }
      return '💬';
    },
    
    getIntentIcon(intent) {
      const iconMap = {
        'list_businesses': '🏢',
        'list_services': '🛎️',
        'get_user_appointments': '📅',
        'get_user_pets': '🐾',
        'search_business': '🔍',
        'get_business_details': '📋',
        'prices': '💰',
        'emergency': '🚑',
        'about': '🤖',
        'greeting': '👋',
        'thanks': '🙏',
        'help': '❓'
      };
      return iconMap[intent] || '💬';
    },
    
    // ========== SCROLL MANAGEMENT ==========
    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.messagesContainer;
        if (container) {
          container.scrollTop = container.scrollHeight;
          this.isAtBottom = true;
          this.showScrollDown = false;
        }
      });
    },
    
    handleScroll() {
      const container = this.$refs.messagesContainer;
      if (container) {
        const { scrollTop, scrollHeight, clientHeight } = container;
        this.scrollPosition = scrollTop;
        this.isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
        this.showScrollDown = !this.isAtBottom && scrollHeight - scrollTop - clientHeight > 100;
      }
    },
    
    // ========== QUICK BUTTONS SCROLL ==========
    checkScrollButtons() {
      this.$nextTick(() => {
        const container = this.$refs.quickButtonsScroll;
        if (container) {
          this.canScrollLeft = container.scrollLeft > 0;
          this.canScrollRight = container.scrollWidth > container.clientWidth + container.scrollLeft;
        }
      });
    },
    
    scrollQuickButtons(distance) {
      const container = this.$refs.quickButtonsScroll;
      if (container) {
        container.scrollLeft += distance;
        setTimeout(() => this.checkScrollButtons(), 100);
      }
    },
    
    // ========== INPUT FEATURES ==========
    handleInput: debounce(function(event) {
      if (this.userInput.length > 2) {
        this.generateSuggestions();
      } else {
        this.suggestions = [];
        this.showSuggestions = false;
      }
    }, 300),
    
    generateSuggestions() {
      const input = this.userInput.toLowerCase();
      const suggestionsSet = new Set();
      
      // Sugerencias basadas en el rol
      this.quickOptions.forEach(option => {
        const cleanOption = option.replace(/[🔍🏥✂️📅🐾💰🚑🏠🎯🛎️⭐📍👥📊📈📋⚙️⚠️🛠️🔧]/g, '').toLowerCase();
        if (cleanOption.includes(input) || input.includes(cleanOption)) {
          suggestionsSet.add(option);
        }
      });
      
      // Sugerencias generales
      const generalSuggestions = [
        "¿Qué servicios ofrecen?",
        "Necesito una veterinaria",
        "Quiero agendar una cita",
        "¿Cuáles son los precios?",
        "Emergencia con mi mascota"
      ];
      
      generalSuggestions.forEach(suggestion => {
        if (suggestion.toLowerCase().includes(input)) {
          suggestionsSet.add(suggestion);
        }
      });
      
      this.suggestions = Array.from(suggestionsSet).slice(0, 3);
      this.showSuggestions = this.suggestions.length > 0;
    },
    
    selectSuggestion(suggestion) {
      this.userInput = suggestion.replace(/[🔍🏥✂️📅🐾💰🚑🏠🎯🛎️⭐📍👥📊📈📋⚙️⚠️🛠️🔧]/g, '').trim();
      this.showSuggestions = false;
      this.focusInput();
    },
    
    toggleEmojiPicker() {
      this.showEmojiPicker = !this.showEmojiPicker;
      if (this.showEmojiPicker) {
        this.showSuggestions = false;
      }
    },
    
    insertEmoji(emoji) {
      this.userInput += emoji;
      this.showEmojiPicker = false;
      this.focusInput();
    },
    
    handleEnter(event) {
      if (event.shiftKey) {
        return; // Shift+Enter para nueva línea
      }
      event.preventDefault();
      this.sendMessage();
    },
    
    focusInput() {
      this.$nextTick(() => {
        const input = this.$refs.messageInput;
        if (input) {
          input.focus();
          // Ajustar altura del textarea
          input.style.height = 'auto';
          input.style.height = (input.scrollHeight) + 'px';
        }
      });
    },
    
    sendVoiceMessage() {
      if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
        alert("Tu navegador no soporte reconocimiento de voz");
        return;
      }
      
      this.isRecording = !this.isRecording;
      // Aquí iría la implementación de voice recognition
    },
    
    // ========== BOT ACTIONS ==========
    generateActions(intent, reply) {
      const actions = [];
      
      switch(intent) {
        case 'list_businesses':
          actions.push(
            { label: 'Ver detalles', type: 'primary', action: 'show_details' },
            { label: 'Ver servicios', type: 'secondary', action: 'show_services' }
          );
          break;
          
        case 'list_services':
          actions.push(
            { label: 'Ver precios', type: 'primary', action: 'show_prices' },
            { label: 'Agendar cita', type: 'secondary', action: 'book_appointment' }
          );
          break;
          
        case 'get_business_details':
          actions.push(
            { label: 'Ver servicios', type: 'primary', action: 'show_services' },
            { label: 'Agendar cita', type: 'secondary', action: 'book_appointment' },
            { label: 'Ver ubicación', type: 'secondary', action: 'show_location' }
          );
          break;
      }
      
      return actions;
    },
    
    handleBotAction(action) {
      switch(action.action) {
        case 'show_details':
          this.userInput = "Ver detalles del negocio";
          break;
        case 'show_services':
          this.userInput = "Mostrar servicios disponibles";
          break;
        case 'show_prices':
          this.userInput = "Ver precios y tarifas";
          break;
        case 'book_appointment':
          this.userInput = "Quiero agendar una cita";
          break;
        case 'show_location':
          this.userInput = "Mostrar ubicación en mapa";
          break;
      }
      this.sendMessage();
    },
    
    // ========== ERROR HANDLING ==========
    getErrorMessage(error) {
      if (error.response?.status === 401) {
        return "🔐 **Sesión expirada**\n\nPor favor, inicia sesión nuevamente para continuar usando el chatbot.";
      } else if (error.response?.status === 400) {
        return "📝 **Mensaje inválido**\n\nPor favor, escribe un mensaje más específico o intenta con otras palabras.";
      } else if (error.code === 'ECONNABORTED') {
        return "⏰ **Tiempo de espera agotado**\n\nEl servicio está tardando en responder. Por favor, intenta nuevamente o reformula tu pregunta.";
      } else if (error.message.includes("token")) {
        return "🔐 **Error de autenticación**\n\nPor favor, verifica que has iniciado sesión correctamente.";
      } else if (error.message.includes("network")) {
        return "🌐 **Problema de conexión**\n\nVerifica tu conexión a internet e intenta nuevamente.";
      } else {
        return "❌ **Error del sistema**\n\nLo sentimos, ha ocurrido un error inesperado. Por favor, intenta nuevamente en unos minutos.";
      }
    },
    
    handleImageError(event) {
      event.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%233b82f6"><circle cx="12" cy="12" r="10"/><text x="12" y="16" text-anchor="middle" font-size="8" fill="white">PB</text></svg>';
    },
    
    // ========== CONNECTION MANAGEMENT ==========
    checkConnection() {
      this.connectionStatus = 'connected';
      // Aquí podrías agregar ping al servidor
    },
    
    getConnectionText() {
      const texts = {
        connected: "Conectado",
        connecting: "Conectando...",
        disconnected: "Desconectado"
      };
      return texts[this.connectionStatus];
    },
    
    getApiUrl() {
      // Para producción en Render
      if (process.env.NODE_ENV === 'production') {
        return window.location.origin;
      }
      return 'http://localhost:4000';
    },
    
    // ========== EVENT LISTENERS ==========
    setupEventListeners() {
      // Cerrar chat con ESC
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.toggleChat();
        }
      });
      
      // Clic fuera para cerrar
      document.addEventListener('click', (e) => {
        const chatbot = this.$el;
        const toggleBtn = chatbot?.querySelector('.chatbot-toggle');
        
        if (this.isOpen && chatbot && 
            !chatbot.contains(e.target) && 
            !toggleBtn?.contains(e.target)) {
          this.toggleChat();
        }
      });
    },
    
    getStatusTitle(status) {
      const titles = {
        sending: "Enviando...",
        sent: "Enviado",
        error: "Error al enviar"
      };
      return titles[status] || "";
    }
  },
  
  watch: {
    isOpen(newVal) {
      if (newVal) {
        this.$nextTick(() => {
          this.scrollToBottom();
          this.checkScrollButtons();
          this.focusInput();
        });
      }
    },
    
    messages: {
      handler() {
        this.$nextTick(() => {
          if (this.isAtBottom) {
            this.scrollToBottom();
          }
        });
        this.saveChatHistory();
      },
      deep: true
    },
    
    userInput() {
      this.$nextTick(() => {
        const input = this.$refs.messageInput;
        if (input) {
          input.style.height = 'auto';
          input.style.height = Math.min(input.scrollHeight, 150) + 'px';
        }
      });
    }
  },
  
  mounted() {
    this.initialize();
    
    // Verificar scroll después de que se rendericen los botones
    this.$nextTick(() => {
      setTimeout(() => {
        this.checkScrollButtons();
      }, 100);
      
      // Observar cambios en el contenedor de botones rápidos
      const observer = new ResizeObserver(() => {
        this.checkScrollButtons();
      });
      
      const container = this.$refs.quickButtonsContainer;
      if (container) {
        observer.observe(container);
      }
    });
    
    // También verificar cuando cambia el tamaño de la ventana
    window.addEventListener('resize', this.checkScrollButtons);
  },
  
  beforeUnmount() {
    window.removeEventListener('resize', this.checkScrollButtons);
  }
};
</script>

<style scoped>
/* ========== VARIABLES Y RESET ========== */
.chatbot-container {
  position: fixed;
  bottom: 20px;
  left: 20px;
  z-index: 10000;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
}

/* ========== BOTÓN FLOTANTE ========== */
.chatbot-toggle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border: 2px solid white;
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
  outline: none;
}

.chatbot-toggle:hover {
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 6px 25px rgba(59, 130, 246, 0.6);
}

.chatbot-toggle:active {
  transform: scale(0.95);
}

.chatbot-toggle-img {
  width: 36px;
  height: 36px;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
}

.notification-dot {
  position: absolute;
  top: 0;
  right: 0;
  width: 14px;
  height: 14px;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border-radius: 50%;
  border: 2px solid white;
  animation: pulse 2s infinite;
}

.connection-status {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid white;
}

.connection-status.connected {
  background-color: #10b981;
  animation: pulse-green 2s infinite;
}

.connection-status.connecting {
  background-color: #f59e0b;
  animation: pulse-yellow 2s infinite;
}

.connection-status.disconnected {
  background-color: #ef4444;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.1); }
}

@keyframes pulse-green {
  0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
  70% { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
}

@keyframes pulse-yellow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7); }
  70% { box-shadow: 0 0 0 6px rgba(245, 158, 11, 0); }
}

/* ========== VENTANA DEL CHAT ========== */
.chatbot-window {
  position: fixed;
  bottom: 90px;
  left: 20px;
  width: 380px;
  max-width: calc(100vw - 40px);
  height: 520px;
  max-height: calc(100vh - 110px);
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.98);
}

/* Header */
.chatbot-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.chatbot-avatar {
  width: 44px;
  height: 44px;
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
  font-weight: 700;
  font-size: 16px;
  margin: 0 0 4px 0;
  line-height: 1.2;
}

.chatbot-info p {
  font-size: 12px;
  opacity: 0.9;
  margin: 0 0 4px 0;
  line-height: 1.2;
}

.connection-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
}

.connection-indicator.connected .indicator-dot {
  background-color: #10b981;
}

.connection-indicator.connecting .indicator-dot {
  background-color: #f59e0b;
  animation: blink 1.5s infinite;
}

.connection-indicator.disconnected .indicator-dot {
  background-color: #ef4444;
}

.indicator-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.indicator-text {
  opacity: 0.8;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-1px);
}

.header-icon {
  width: 16px;
  height: 16px;
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: white;
  font-size: 20px;
  font-weight: 300;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: rotate(90deg);
}

/* ========== MENSAJE DE BIENVENIDA ========== */
.welcome-message {
  margin-bottom: 16px;
}

.welcome-content {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid #bae6fd;
}

.welcome-content h4 {
  margin: 0 0 12px 0;
  color: #0369a1;
  font-size: 16px;
  font-weight: 700;
}

.welcome-content p {
  margin: 0 0 16px 0;
  color: #0c4a6e;
  font-size: 14px;
  line-height: 1.4;
}

.welcome-features {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.feature {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 10px;
  border: 1px solid #7dd3fc;
}

.feature-icon {
  font-size: 16px;
  width: 24px;
  text-align: center;
}

.feature-text {
  font-size: 13px;
  color: #0c4a6e;
  flex: 1;
}

.welcome-hint {
  font-size: 12px;
  color: #64748b;
  text-align: center;
  margin: 0;
  padding-top: 12px;
  border-top: 1px solid #bae6fd;
}

/* ========== ÁREA DE MENSAJES ========== */
.chatbot-messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: linear-gradient(to bottom, #f8fafc 0%, #ffffff 100%);
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
}

/* Scrollbar personalizada */
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

/* Contenedores de mensajes */
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

/* Burbujas de mensaje */
.message-bubble {
  max-width: 85%;
  min-width: 120px;
  padding: 12px 16px;
  border-radius: 18px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Mensaje del usuario */
.message-user {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border-bottom-right-radius: 6px;
}

.message-user .message-content {
  font-size: 14px;
  line-height: 1.4;
  color: white;
}

.message-user .message-content :deep(.font-bold) {
  color: #bfdbfe;
}

.message-user .message-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  margin-top: 6px;
}

.message-user .message-time {
  font-size: 11px;
  opacity: 0.8;
}

.message-status {
  display: flex;
  align-items: center;
}

.sending-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.6);
  animation: blink 1.5s infinite;
}

.sent-icon {
  width: 12px;
  height: 12px;
  fill: rgba(255, 255, 255, 0.8);
}

.error-icon {
  width: 12px;
  height: 12px;
  fill: #fca5a5;
}

/* Mensaje del bot */
.message-bot {
  background: white;
  color: #1f2937;
  border: 1px solid #e5e7eb;
  border-bottom-left-radius: 6px;
}

.bot-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.bot-avatar-small {
  width: 20px;
  height: 20px;
  object-fit: contain;
  border-radius: 50%;
}

.bot-name {
  font-size: 12px;
  font-weight: 600;
  color: #4b5563;
}

.message-bot .message-content {
  font-size: 14px;
  line-height: 1.5;
  color: #374151;
}

.message-bot .message-content :deep(.font-bold) {
  color: #1e40af;
}

.message-bot .message-content :deep(.italic) {
  color: #7c2d12;
}

.message-bot .message-content :deep(.code) {
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 12px;
  color: #dc2626;
}

.message-bot .message-content :deep(h1) {
  font-size: 18px;
  margin: 8px 0;
  color: #1e40af;
}

.message-bot .message-content :deep(h2) {
  font-size: 16px;
  margin: 8px 0;
  color: #1e40af;
}

.message-bot .message-content :deep(h3) {
  font-size: 14px;
  margin: 8px 0;
  color: #1e40af;
}

.message-bot .message-content :deep(ul),
.message-bot .message-content :deep(ol) {
  margin: 8px 0;
  padding-left: 20px;
}

.message-bot .message-content :deep(li) {
  margin: 4px 0;
}

/* Acciones del bot */
.message-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.action-btn {
  padding: 6px 12px;
  border-radius: 8px;
  border: none;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn.primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
}

.action-btn.secondary {
  background: #f3f4f6;
  color: #4b5563;
  border: 1px solid #d1d5db;
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.action-btn.primary:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
}

.action-btn.secondary:hover {
  background: #e5e7eb;
}

.message-bot .message-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #f3f4f6;
}

.message-bot .message-time {
  font-size: 11px;
  color: #6b7280;
}

.message-intent {
  font-size: 12px;
  opacity: 0.6;
}

/* Indicador de typing */
.typing-indicator {
  align-self: flex-start;
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
  width: 8px;
  height: 8px;
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
    opacity: 0.6;
  }
  30% {
    transform: translateY(-6px);
    opacity: 1;
  }
}

.typing-text {
  font-size: 12px;
  color: #6b7280;
}

/* Indicador de scroll down */
.scroll-down-indicator {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
}

.scroll-down-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  color: #4b5563;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  animation: bounce 2s infinite;
}

.scroll-down-btn:hover {
  background: #f9fafb;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.scroll-down-icon {
  width: 14px;
  height: 14px;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateX(-50%) translateY(0); }
  40% { transform: translateX(-50%) translateY(-5px); }
  60% { transform: translateX(-50%) translateY(-3px); }
}

/* ========== BOTONES RÁPIDOS ========== */
.quick-buttons-section {
  flex-shrink: 0;
  border-top: 1px solid #e5e7eb;
  background: #f8fafc;
  padding: 12px 16px;
}

.quick-buttons-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.quick-buttons-header h4 {
  font-size: 12px;
  font-weight: 600;
  color: #4b5563;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.quick-buttons-actions {
  display: flex;
  gap: 4px;
}

.scroll-btn {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: white;
  border: 1px solid #d1d5db;
  color: #4b5563;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.scroll-btn:hover:not(:disabled) {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.scroll-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.quick-buttons-container {
  position: relative;
  overflow: hidden;
}

.quick-buttons-scroll {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding-bottom: 4px;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.quick-buttons-scroll::-webkit-scrollbar {
  display: none;
}

.quick-button {
  flex-shrink: 0;
  padding: 8px 14px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: max-content;
}

.quick-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.quick-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* Colores por tipo de botón */
.button-business {
  border-color: #60a5fa;
  background: linear-gradient(to right, #dbeafe, #eff6ff);
  color: #1e40af;
}

.button-service {
  border-color: #34d399;
  background: linear-gradient(to right, #d1fae5, #ecfdf5);
  color: #065f46;
}

.button-appointment {
  border-color: #fbbf24;
  background: linear-gradient(to right, #fef3c7, #fffbeb);
  color: #92400e;
}

.button-pet {
  border-color: #f472b6;
  background: linear-gradient(to right, #fce7f3, #fdf2f8);
  color: #9d174d;
}

.quick-button-icon {
  font-size: 14px;
}

.quick-button-text {
  flex: 1;
}

/* ========== ÁREA DE INPUT ========== */
.input-section {
  flex-shrink: 0;
  border-top: 1px solid #e5e7eb;
  background: white;
  padding: 16px;
  position: relative;
}

.input-container {
  display: flex;
  align-items: flex-end;
  gap: 10px;
}

.emoji-btn {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  color: #6b7280;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.emoji-btn:hover {
  background: #e5e7eb;
  transform: scale(1.05);
}

.input-wrapper {
  flex: 1;
  position: relative;
  min-height: 40px;
}

.message-input {
  width: 100%;
  min-height: 40px;
  max-height: 150px;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  font-size: 14px;
  font-family: inherit;
  line-height: 1.4;
  resize: none;
  outline: none;
  transition: all 0.2s ease;
  background: white;
  overflow-y: auto;
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

.input-actions {
  position: absolute;
  right: 8px;
  bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.char-count {
  font-size: 11px;
  color: #9ca3af;
}

.voice-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.voice-btn:hover {
  background: #e5e7eb;
}

.voice-btn.recording {
  background: #fee2e2;
  border-color: #fca5a5;
  color: #dc2626;
  animation: pulse-red 1s infinite;
}

.voice-icon {
  width: 14px;
  height: 14px;
}

.recording-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #dc2626;
  animation: blink 1s infinite;
}

.send-button {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border: none;
  border-radius: 12px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
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

.send-button.sending {
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
}

.send-icon {
  width: 18px;
  height: 18px;
}

.loading-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Sugerencias */
.suggestions-container {
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  margin-bottom: 8px;
  z-index: 1000;
}

.suggestions {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.suggestion-btn {
  width: 100%;
  padding: 10px 16px;
  text-align: left;
  border: none;
  background: none;
  color: #374151;
  font-size: 13px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid #f3f4f6;
}

.suggestion-btn:last-child {
  border-bottom: none;
}

.suggestion-btn:hover {
  background: #f9fafb;
}

/* Emoji picker */
.emoji-picker {
  position: absolute;
  bottom: 100%;
  left: 0;
  width: 240px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  z-index: 1001;
  margin-bottom: 8px;
}

.emoji-picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-bottom: 1px solid #f3f4f6;
  font-size: 12px;
  font-weight: 600;
  color: #4b5563;
}

.emoji-close {
  width: 20px;
  height: 20px;
  border: none;
  background: none;
  color: #9ca3af;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.emoji-close:hover {
  color: #6b7280;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 4px;
  padding: 8px;
}

.emoji-btn-picker {
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  border-radius: 6px;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.emoji-btn-picker:hover {
  background: #f3f4f6;
  transform: scale(1.1);
}

/* Footer */
.chat-footer {
  flex-shrink: 0;
  padding: 10px 16px;
  background: #f8fafc;
  border-top: 1px solid #e5e7eb;
}

.footer-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.footer-text {
  font-size: 11px;
  color: #6b7280;
  flex: 1;
}

.footer-stats {
  display: flex;
  gap: 12px;
}

.stat {
  font-size: 11px;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 4px;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.status-dot.connected {
  background-color: #10b981;
}

.status-dot.connecting {
  background-color: #f59e0b;
}

.status-dot.disconnected {
  background-color: #ef4444;
}

/* ========== ANIMACIONES ========== */
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

/* ========== RESPONSIVE ========== */
@media (max-width: 640px) {
  .chatbot-container {
    bottom: 10px;
    left: 10px;
    right: 10px;
  }
  
  .chatbot-window {
    width: calc(100vw - 20px);
    left: 10px;
    bottom: 80px;
    height: 500px;
  }
  
  .chatbot-toggle {
    width: 56px;
    height: 56px;
  }
  
  .chatbot-avatar {
    width: 36px;
    height: 36px;
  }
  
  .message-bubble {
    max-width: 90%;
  }
}

@media (max-width: 400px) {
  .quick-button {
    padding: 6px 10px;
    font-size: 11px;
  }
  
  .emoji-picker {
    width: 200px;
  }
  
  .emoji-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}

/* Estados especiales */
.chat-open .chatbot-toggle {
  transform: rotate(15deg);
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

/* Utility animations */
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes pulse-red {
  0%, 100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7); }
  70% { box-shadow: 0 0 0 6px rgba(220, 38, 38, 0); }
}

/* Ajustes para dark mode (opcional) */
@media (prefers-color-scheme: dark) {
  .chatbot-window {
    background: rgba(30, 41, 59, 0.98);
    border-color: #475569;
  }
  
  .message-bot {
    background: #1e293b;
    border-color: #475569;
    color: #e2e8f0;
  }
  
  .message-bot .message-content {
    color: #e2e8f0;
  }
  
  .welcome-content {
    background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
    border-color: #3b82f6;
  }
  
  .quick-buttons-section {
    background: #1e293b;
    border-color: #475569;
  }
  
  .input-section {
    background: #1e293b;
    border-color: #475569;
  }
  
  .chat-footer {
    background: #1e293b;
    border-color: #475569;
  }
}
</style>