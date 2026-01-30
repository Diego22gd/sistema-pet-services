<template>
  <ProviderLayout>
    <!-- Encabezado -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center px-6 pt-16 pb-6 max-w-7xl mx-auto mt-8 gap-4">
      <div>
        <h1 class="text-3xl font-extrabold text-neutral-dark">Notificaciones</h1>
        <p class="text-neutral-medium mt-2">Administra tus alertas y actualizaciones de citas</p>
      </div>
      
      <div class="flex items-center space-x-4">
        <!-- Contador de no leídas -->
        <div class="notification-count">
          {{ unreadCount }} sin leer
        </div>
        
        <!-- Botón marcar todas como leídas -->
        <button 
          v-if="unreadCount > 0"
          @click="markAllAsRead"
          class="mark-all-btn"
          :disabled="isMarkingAll"
        >
          <span v-if="isMarkingAll">Procesando...</span>
          <span v-else>Marcar todas como leídas</span>
        </button>
      </div>
    </div>

    <!-- Filtros y estado de carga -->
    <div class="px-6 max-w-7xl mx-auto mb-6">
      <div class="flex flex-wrap gap-4">
        <button 
          v-for="filter in filters"
          :key="filter.value"
          @click="activeFilter = filter.value"
          class="filter-btn"
          :class="{ 'filter-btn-active': activeFilter === filter.value }"
        >
          {{ filter.label }}
        </button>
      </div>
      
      <!-- Estado de carga -->
      <div v-if="isLoading" class="mt-6 text-center">
        <div class="loading-spinner"></div>
        <p class="text-gray-600 mt-2">Cargando notificaciones...</p>
      </div>
    </div>

    <!-- Lista de notificaciones -->
    <div class="px-6 max-w-7xl mx-auto pb-10">
      <!-- Sin notificaciones -->
      <div v-if="!isLoading && filteredNotifications.length === 0" 
           class="empty-notifications">
        <div class="empty-icon">🔔</div>
        <h3 class="empty-title">No hay notificaciones</h3>
        <p class="empty-text">¡Estás al día!</p>
      </div>

      <!-- Lista de notificaciones -->
      <div v-else class="notifications-list">
        <div 
          v-for="notification in filteredNotifications" 
          :key="notification._id"
          class="notification-card"
          :class="{ 'notification-unread': !notification.read }"
        >
          <div class="notification-content">
            <!-- Icono y contenido -->
            <div class="notification-icon-content">
              <!-- Icono según tipo -->
              <div class="notification-icon"
                   :class="getNotificationIconClass(notification.type)">
                {{ getNotificationIcon(notification.type) }}
              </div>
              
              <!-- Contenido -->
              <div class="notification-details">
                <div class="notification-header">
                  <h3 class="notification-title">{{ notification.title }}</h3>
                  <span class="notification-date">{{ notification.date }}</span>
                </div>
                
                <p class="notification-message">{{ notification.message }}</p>
                
                <!-- Información de la cita si existe -->
                <div v-if="notification.appointmentId" 
                     class="appointment-info">
                  <div class="appointment-grid">
                    <div class="appointment-item">
                      <span class="appointment-icon">📅</span>
                      <div>
                        <p class="appointment-label">Fecha y Hora</p>
                        <p class="appointment-value">{{ formatDateTime(notification.appointmentId) }}</p>
                      </div>
                    </div>
                    
                    <div class="appointment-item">
                      <span class="appointment-icon">💼</span>
                      <div>
                        <p class="appointment-label">Servicio</p>
                        <p class="appointment-value">{{ notification.appointmentId.serviceName }}</p>
                      </div>
                    </div>
                    
                    <div class="appointment-item">
                      <span class="appointment-icon">👤</span>
                      <div>
                        <p class="appointment-label">Cliente</p>
                        <p class="appointment-value">{{ notification.userId?.name || 'Cliente' }}</p>
                      </div>
                    </div>
                    
                    <div class="appointment-item">
                      <span class="appointment-icon">📋</span>
                      <div>
                        <p class="appointment-label">Estado</p>
                        <span class="status-badge"
                              :class="getStatusClass(notification.appointmentId.status)">
                          {{ translateStatus(notification.appointmentId.status) }}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Botón para ver cita -->
                  <button 
                    v-if="notification.appointmentId"
                    @click="viewAppointment(notification.appointmentId._id)"
                    class="view-appointment-btn"
                  >
                    <span>Ver detalles de la cita</span>
                    <span>→</span>
                  </button>
                </div>
                
                <!-- Metadata adicional -->
                <div v-if="notification.metadata && Object.keys(notification.metadata).length > 0"
                     class="metadata-container">
                  <div v-for="(value, key) in notification.metadata" 
                       :key="key"
                       class="metadata-item">
                    <span class="metadata-key">{{ formatKey(key) }}:</span>
                    <span class="metadata-value">{{ value }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Botones de acción -->
            <div class="notification-actions">
              <!-- Botón marcar como leída/no leída -->
              <button 
                @click="toggleReadStatus(notification)"
                class="read-toggle-btn"
                :class="{ 'read': notification.read }"
                :title="notification.read ? 'Marcar como no leída' : 'Marcar como leída'"
              >
                {{ notification.read ? '👁️' : '👁️‍🗨️' }}
              </button>
              
              <!-- Indicador de no leído -->
              <div v-if="!notification.read" 
                   class="unread-indicator"></div>
            </div>
          </div>
          
          <!-- Tipo y hora -->
          <div class="notification-footer">
            <span class="notification-type">{{ translateNotificationType(notification.type) }}</span>
            <span class="notification-time">{{ formatExactTime(notification.createdAt) }}</span>
          </div>
        </div>
      </div>
      
      <!-- Paginación -->
      <div v-if="notifications.length > 10" 
           class="pagination-container">
        <button 
          @click="loadMore"
          class="load-more-btn"
        >
          Cargar más
        </button>
      </div>
    </div>
  </ProviderLayout>
</template>

<script>
import ProviderLayout from "@/components/ProviderLayout.vue";
import axios from "axios";
import { formatTimeTo12Hour } from "@/utils/timeFormatter";

export default {
  name: "ProviderNotifications",
  components: { ProviderLayout },
  
  data() {
    return {
      isLoading: false,
      isMarkingAll: false,
      notifications: [],
      unreadCount: 0,
      activeFilter: 'all',
      filters: [
        { label: 'Todas', value: 'all' },
        { label: 'No leídas', value: 'unread' },
        { label: 'Citas', value: 'appointment' },
        { label: 'Sistema', value: 'system' }
      ]
    };
  },
  
  computed: {
    filteredNotifications() {
      return this.notifications.filter(notification => {
        if (this.activeFilter === 'all') return true;
        if (this.activeFilter === 'unread') return !notification.read;
        if (this.activeFilter === 'appointment') return notification.type.includes('appointment');
        if (this.activeFilter === 'system') return !notification.type.includes('appointment');
        return true;
      });
    }
  },
  
  mounted() {
    this.fetchNotifications();
    this.fetchUnreadCount();
  },
  
  methods: {
    async fetchNotifications() {
      this.isLoading = true;
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/notifications/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.data.success) {
          this.notifications = response.data.notifications;
          console.log(`✅ Cargadas ${this.notifications.length} notificaciones`);
        }
      } catch (error) {
        console.error('❌ Error al cargar notificaciones:', error);
        this.$toast.error('No se pudieron cargar las notificaciones');
      } finally {
        this.isLoading = false;
      }
    },
    
    async fetchUnreadCount() {
      try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));
        
        if (!user || !user._id) return;
        
        const response = await axios.get(`/api/notifications/unread/${user._id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.data.success) {
          this.unreadCount = response.data.unreadCount;
        }
      } catch (error) {
        console.error('❌ Error al contar notificaciones no leídas:', error);
      }
    },
    
    async toggleReadStatus(notification) {
      try {
        const token = localStorage.getItem('token');
        
        if (!notification.read) {
          // Marcar como leída
          await axios.patch(`/api/notifications/${notification._id}/read`, {}, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          notification.read = true;
          this.unreadCount = Math.max(0, this.unreadCount - 1);
          this.$toast.success('Marcada como leída');
        } else {
          // Marcar como no leída (simulado en frontend ya que el backend no tiene esta función)
          notification.read = false;
          this.unreadCount += 1;
          this.$toast.info('Marcada como no leída');
        }
      } catch (error) {
        console.error('❌ Error al cambiar estado de lectura:', error);
        this.$toast.error('No se pudo actualizar la notificación');
      }
    },
    
    async markAllAsRead() {
      try {
        this.isMarkingAll = true;
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));
        
        if (!user || !user._id) {
          this.$toast.error('Usuario no encontrado');
          return;
        }
        
        const response = await axios.patch(`/api/notifications/read-all/${user._id}`, {}, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.data.success) {
          // Actualizar todas las notificaciones locales
          this.notifications.forEach(notification => {
            notification.read = true;
          });
          
          this.unreadCount = 0;
          this.$toast.success(`${response.data.modifiedCount} notificaciones marcadas como leídas`);
        }
      } catch (error) {
        console.error('❌ Error al marcar todas como leídas:', error);
        this.$toast.error('No se pudieron marcar todas como leídas');
      } finally {
        this.isMarkingAll = false;
      }
    },
    
    viewAppointment(appointmentId) {
      if (appointmentId) {
        this.$router.push(`/provider/appointments/${appointmentId}`);
      }
    },
    
    loadMore() {
      // Implementar paginación si el backend la soporta
      this.$toast.info('Función de cargar más disponible pronto');
    },
    
    // Métodos auxiliares
    getNotificationIcon(type) {
      const icons = {
        'appointment_created': '📅',
        'appointment_cancelled': '❌',
        'appointment_rescheduled': '🔄',
        'appointment_updated': '✏️',
        'system': '⚙️',
        'info': 'ℹ️',
        'warning': '⚠️',
        'success': '✅'
      };
      
      if (type.includes('appointment')) {
        if (type.includes('created')) return icons.appointment_created;
        if (type.includes('cancelled')) return icons.appointment_cancelled;
        if (type.includes('rescheduled')) return icons.appointment_rescheduled;
        if (type.includes('updated')) return icons.appointment_updated;
      }
      
      return icons[type] || '🔔';
    },
    
    getNotificationIconClass(type) {
      const classes = {
        'appointment_created': 'notification-icon-green',
        'appointment_cancelled': 'notification-icon-red',
        'appointment_rescheduled': 'notification-icon-yellow',
        'appointment_updated': 'notification-icon-blue',
        'system': 'notification-icon-gray',
        'info': 'notification-icon-blue',
        'warning': 'notification-icon-orange',
        'success': 'notification-icon-green'
      };
      
      if (type.includes('appointment')) {
        if (type.includes('created')) return classes.appointment_created;
        if (type.includes('cancelled')) return classes.appointment_cancelled;
        if (type.includes('rescheduled')) return classes.appointment_rescheduled;
        if (type.includes('updated')) return classes.appointment_updated;
      }
      
      return classes[type] || 'notification-icon-gray';
    },
    
    formatDateTime(appointment) {
      if (!appointment) return '';
      return `${appointment.date} a las ${formatTimeTo12Hour(appointment.time)}`;
    },
    
    formatExactTime(timestamp) {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      return date.toLocaleTimeString('es-VE', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    },
    
    formatKey(key) {
      // Convertir camelCase o snake_case a texto legible en español
      const translations = {
        'appointmentId': 'ID de Cita',
        'userId': 'ID de Usuario',
        'serviceId': 'ID de Servicio',
        'status': 'Estado',
        'createdAt': 'Creado el',
        'updatedAt': 'Actualizado el',
        'paymentStatus': 'Estado de Pago',
        'amount': 'Monto',
        'duration': 'Duración',
        'notes': 'Notas'
      };
      
      if (translations[key]) return translations[key];
      
      // Si no hay traducción específica, convertir a español genérico
      return key
        .replace(/_/g, ' ')
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase());
    },
    
    translateNotificationType(type) {
      const translations = {
        'appointment_created': 'cita creada',
        'appointment_cancelled': 'cita cancelada',
        'appointment_rescheduled': 'cita reprogramada',
        'appointment_updated': 'cita actualizada',
        'appointment_confirmed': 'cita confirmada',
        'appointment_completed': 'cita completada',
        'system': 'sistema',
        'info': 'información',
        'warning': 'advertencia',
        'success': 'éxito',
        'payment_received': 'pago recibido',
        'review_received': 'reseña recibida'
      };
      
      return translations[type] || type.replace(/_/g, ' ');
    },
    
    translateStatus(status) {
      const translations = {
        'pending': 'pendiente',
        'confirmed': 'confirmada',
        'cancelled': 'cancelada',
        'completed': 'completada',
        'rescheduled': 'reprogramada',
        'in_progress': 'en progreso',
        'awaiting_payment': 'esperando pago',
        'paid': 'pagada'
      };
      
      return translations[status?.toLowerCase()] || status;
    },
    
    getStatusClass(status) {
      const classes = {
        'pending': 'status-badge-yellow',
        'confirmed': 'status-badge-green',
        'cancelled': 'status-badge-red',
        'completed': 'status-badge-blue',
        'rescheduled': 'status-badge-purple',
        'in_progress': 'status-badge-orange',
        'awaiting_payment': 'status-badge-amber',
        'paid': 'status-badge-emerald'
      };
      return classes[status?.toLowerCase()] || 'status-badge-gray';
    }
  }
};
</script>

<style scoped>
/* Estilos personalizados para garantizar que se apliquen */

/* Contador de notificaciones */
.notification-count {
  background-color: #d1fae5 !important;
  color: #065f46 !important;
  padding: 0.5rem 1rem !important;
  border-radius: 0.5rem !important;
  font-weight: 600 !important;
  border: none !important;
}

/* Botón marcar todas como leídas */
.mark-all-btn {
  background-color: #10b981 !important;
  color: white !important;
  padding: 0.5rem 1rem !important;
  border-radius: 0.5rem !important;
  font-weight: 500 !important;
  border: none !important;
  cursor: pointer !important;
  transition: background-color 0.2s ease !important;
}

.mark-all-btn:hover:not(:disabled) {
  background-color: #059669 !important;
}

.mark-all-btn:disabled {
  opacity: 0.5 !important;
  cursor: not-allowed !important;
}

/* Botones de filtro */
.filter-btn {
  padding: 0.5rem 1rem !important;
  border-radius: 0.5rem !important;
  transition: all 0.2s ease !important;
  border: none !important;
  cursor: pointer !important;
  background-color: #f3f4f6 !important;
  color: #374151 !important;
  font-weight: 500 !important;
}

.filter-btn:hover {
  background-color: #e5e7eb !important;
}

.filter-btn-active {
  background-color: #10b981 !important;
  color: white !important;
}

.filter-btn-active:hover {
  background-color: #059669 !important;
}

/* Spinner de carga */
.loading-spinner {
  display: inline-block !important;
  animation: spin 1s linear infinite !important;
  border-radius: 50% !important;
  height: 2rem !important;
  width: 2rem !important;
  border-bottom: 2px solid #10b981 !important;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Estado vacío */
.empty-notifications {
  text-align: center !important;
  padding: 3rem 1rem !important;
  background-color: white !important;
  border-radius: 1rem !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
}

.empty-icon {
  font-size: 3rem !important;
  margin-bottom: 1rem !important;
}

.empty-title {
  font-size: 1.25rem !important;
  font-weight: 600 !important;
  color: #374151 !important;
  margin-bottom: 0.5rem !important;
}

.empty-text {
  color: #6b7280 !important;
}

/* Lista de notificaciones */
.notifications-list {
  display: flex !important;
  flex-direction: column !important;
  gap: 1rem !important;
}

.notification-card {
  background-color: white !important;
  border-radius: 1rem !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
  padding: 1.5rem !important;
  transition: all 0.2s ease !important;
  border-left: 4px solid #d1d5db !important;
}

.notification-card:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1) !important;
}

.notification-unread {
  border-left-color: #10b981 !important;
}

.notification-content {
  display: flex !important;
  align-items: flex-start !important;
  justify-content: space-between !important;
  margin-bottom: 1rem !important;
}

/* Icono de notificación */
.notification-icon-content {
  display: flex !important;
  align-items: flex-start !important;
  gap: 1rem !important;
  flex: 1 !important;
}

.notification-icon {
  flex-shrink: 0 !important;
  width: 3rem !important;
  height: 3rem !important;
  border-radius: 50% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-size: 1.5rem !important;
}

.notification-icon-green {
  background-color: #d1fae5 !important;
  color: #065f46 !important;
}

.notification-icon-red {
  background-color: #fee2e2 !important;
  color: #991b1b !important;
}

.notification-icon-yellow {
  background-color: #fef3c7 !important;
  color: #92400e !important;
}

.notification-icon-blue {
  background-color: #dbeafe !important;
  color: #1e40af !important;
}

.notification-icon-gray {
  background-color: #f3f4f6 !important;
  color: #374151 !important;
}

.notification-icon-orange {
  background-color: #ffedd5 !important;
  color: #9a3412 !important;
}

/* Detalles de notificación */
.notification-details {
  flex: 1 !important;
}

.notification-header {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  margin-bottom: 0.5rem !important;
}

.notification-title {
  font-size: 1.125rem !important;
  font-weight: 700 !important;
  color: #1f2937 !important;
}

.notification-date {
  font-size: 0.875rem !important;
  color: #6b7280 !important;
}

.notification-message {
  color: #374151 !important;
  margin-bottom: 1rem !important;
}

/* Información de cita */
.appointment-info {
  background-color: #f9fafb !important;
  border-radius: 0.5rem !important;
  padding: 1rem !important;
  margin-bottom: 1rem !important;
}

.appointment-grid {
  display: grid !important;
  grid-template-columns: repeat(1, 1fr) !important;
  gap: 0.75rem !important;
}

@media (min-width: 768px) {
  .appointment-grid {
    grid-template-columns: repeat(2, 1fr) !important;
  }
}

.appointment-item {
  display: flex !important;
  align-items: center !important;
  gap: 0.5rem !important;
}

.appointment-icon {
  color: #6b7280 !important;
}

.appointment-label {
  font-size: 0.875rem !important;
  color: #6b7280 !important;
}

.appointment-value {
  font-weight: 500 !important;
  color: #1f2937 !important;
}

.view-appointment-btn {
  color: #10b981 !important;
  font-weight: 500 !important;
  display: flex !important;
  align-items: center !important;
  gap: 0.25rem !important;
  margin-top: 0.75rem !important;
  cursor: pointer !important;
  background: none !important;
  border: none !important;
  padding: 0 !important;
}

.view-appointment-btn:hover {
  color: #059669 !important;
}

/* Badges de estado */
.status-badge {
  padding: 0.25rem 0.5rem !important;
  border-radius: 9999px !important;
  font-size: 0.75rem !important;
  font-weight: 500 !important;
}

.status-badge-yellow {
  background-color: #fef3c7 !important;
  color: #92400e !important;
}

.status-badge-green {
  background-color: #d1fae5 !important;
  color: #065f46 !important;
}

.status-badge-red {
  background-color: #fee2e2 !important;
  color: #991b1b !important;
}

.status-badge-blue {
  background-color: #dbeafe !important;
  color: #1e40af !important;
}

.status-badge-purple {
  background-color: #e9d5ff !important;
  color: #6b21a8 !important;
}

.status-badge-orange {
  background-color: #fed7aa !important;
  color: #9a3412 !important;
}

.status-badge-amber {
  background-color: #fde68a !important;
  color: #92400e !important;
}

.status-badge-emerald {
  background-color: #a7f3d0 !important;
  color: #065f46 !important;
}

.status-badge-gray {
  background-color: #f3f4f6 !important;
  color: #374151 !important;
}

/* Metadata */
.metadata-container {
  background-color: #dbeafe !important;
  border-radius: 0.5rem !important;
  padding: 0.75rem !important;
  font-size: 0.875rem !important;
  color: #1e40af !important;
}

.metadata-item {
  margin-bottom: 0.25rem !important;
}

.metadata-item:last-child {
  margin-bottom: 0 !important;
}

.metadata-key {
  font-weight: 600 !important;
}

.metadata-value {
  margin-left: 0.5rem !important;
}

/* Acciones de notificación */
.notification-actions {
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  gap: 0.5rem !important;
  margin-left: 1rem !important;
}

.read-toggle-btn {
  width: 2rem !important;
  height: 2rem !important;
  border-radius: 50% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  transition: background-color 0.2s ease !important;
  border: none !important;
  cursor: pointer !important;
  background-color: #d1fae5 !important;
  color: #065f46 !important;
}

.read-toggle-btn.read {
  background-color: #f3f4f6 !important;
  color: #6b7280 !important;
}

.read-toggle-btn:hover {
  background-color: #a7f3d0 !important;
}

.read-toggle-btn.read:hover {
  background-color: #e5e7eb !important;
}

.unread-indicator {
  width: 0.75rem !important;
  height: 0.75rem !important;
  border-radius: 50% !important;
  background-color: #10b981 !important;
}

/* Footer de notificación */
.notification-footer {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  padding-top: 1rem !important;
  border-top: 1px solid #f3f4f6 !important;
}

.notification-type {
  font-size: 0.875rem !important;
  color: #6b7280 !important;
  text-transform: capitalize !important;
}

.notification-time {
  font-size: 0.875rem !important;
  color: #6b7280 !important;
}

/* Paginación */
.pagination-container {
  margin-top: 2rem !important;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  gap: 1rem !important;
}

.load-more-btn {
  padding: 0.5rem 1.5rem !important;
  background-color: #10b981 !important;
  color: white !important;
  border-radius: 0.5rem !important;
  border: none !important;
  cursor: pointer !important;
  transition: background-color 0.2s ease !important;
  font-weight: 500 !important;
}

.load-more-btn:hover {
  background-color: #059669 !important;
}

/* Scrollbar personalizado */
::-webkit-scrollbar {
  width: 8px !important;
}

::-webkit-scrollbar-track {
  background: #f1f1f1 !important;
  border-radius: 4px !important;
}

::-webkit-scrollbar-thumb {
  background: #10b981 !important;
  border-radius: 4px !important;
}

::-webkit-scrollbar-thumb:hover {
  background: #059669 !important;
}

/* Responsive */
@media (max-width: 640px) {
  .flex-col {
    flex-direction: column !important;
  }
  
  .notification-icon-content {
    flex-direction: column !important;
  }
  
  .notification-header {
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: 0.25rem !important;
  }
  
  .appointment-grid {
    grid-template-columns: repeat(1, 1fr) !important;
  }
}
</style>