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
        <div class="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-lg font-semibold">
          {{ unreadCount }} sin leer
        </div>
        
        <!-- Botón marcar todas como leídas -->
        <button 
          v-if="unreadCount > 0"
          @click="markAllAsRead"
          class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
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
          class="px-4 py-2 rounded-lg transition-colors duration-200"
          :class="activeFilter === filter.value 
            ? 'bg-emerald-600 text-white' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
        >
          {{ filter.label }}
        </button>
      </div>
      
      <!-- Estado de carga -->
      <div v-if="isLoading" class="mt-6 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        <p class="text-gray-600 mt-2">Cargando notificaciones...</p>
      </div>
    </div>

    <!-- Lista de notificaciones -->
    <div class="px-6 max-w-7xl mx-auto pb-10">
      <!-- Sin notificaciones -->
      <div v-if="!isLoading && filteredNotifications.length === 0" 
           class="text-center py-12 bg-white rounded-2xl shadow">
        <div class="text-6xl mb-4">🔔</div>
        <h3 class="text-xl font-semibold text-gray-700 mb-2">No hay notificaciones</h3>
        <p class="text-gray-500">¡Estás al día!</p>
      </div>

      <!-- Lista de notificaciones -->
      <div v-else class="space-y-4">
        <div 
          v-for="notification in filteredNotifications" 
          :key="notification._id"
          class="bg-white rounded-2xl shadow-md p-6 transition-all duration-200 hover:shadow-lg border-l-4"
          :class="notification.read ? 'border-l-gray-300' : 'border-l-emerald-500'"
        >
          <div class="flex items-start justify-between">
            <!-- Icono y contenido -->
            <div class="flex items-start space-x-4 flex-1">
              <!-- Icono según tipo -->
              <div class="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                   :class="getNotificationIconClass(notification.type)">
                {{ getNotificationIcon(notification.type) }}
              </div>
              
              <!-- Contenido -->
              <div class="flex-1">
                <div class="flex items-center justify-between mb-2">
                  <h3 class="font-bold text-lg text-neutral-dark">{{ notification.title }}</h3>
                  <span class="text-sm text-gray-500">{{ notification.date }}</span>
                </div>
                
                <p class="text-gray-700 mb-4">{{ notification.message }}</p>
                
                <!-- Información de la cita si existe -->
                <div v-if="notification.appointmentId" 
                     class="bg-gray-50 rounded-lg p-4 mb-4">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div class="flex items-center space-x-2">
                      <span class="text-gray-500">📅</span>
                      <div>
                        <p class="text-sm text-gray-600">Fecha y Hora</p>
                        <p class="font-medium">{{ formatDateTime(notification.appointmentId) }}</p>
                      </div>
                    </div>
                    
                    <div class="flex items-center space-x-2">
                      <span class="text-gray-500">💼</span>
                      <div>
                        <p class="text-sm text-gray-600">Servicio</p>
                        <p class="font-medium">{{ notification.appointmentId.serviceName }}</p>
                      </div>
                    </div>
                    
                    <div class="flex items-center space-x-2">
                      <span class="text-gray-500">👤</span>
                      <div>
                        <p class="text-sm text-gray-600">Cliente</p>
                        <p class="font-medium">{{ notification.userId?.name || 'Cliente' }}</p>
                      </div>
                    </div>
                    
                    <div class="flex items-center space-x-2">
                      <span class="text-gray-500">📋</span>
                      <div>
                        <p class="text-sm text-gray-600">Estado</p>
                        <span class="px-2 py-1 rounded text-xs font-medium"
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
                    class="mt-3 text-emerald-600 hover:text-emerald-700 font-medium flex items-center space-x-1"
                  >
                    <span>Ver detalles de la cita</span>
                    <span>→</span>
                  </button>
                </div>
                
                <!-- Metadata adicional -->
                <div v-if="notification.metadata && Object.keys(notification.metadata).length > 0"
                     class="bg-blue-50 rounded-lg p-3 text-sm text-blue-700">
                  <div v-for="(value, key) in notification.metadata" 
                       :key="key"
                       class="mb-1 last:mb-0">
                    <span class="font-medium">{{ formatKey(key) }}:</span>
                    <span class="ml-2">{{ value }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Botones de acción -->
            <div class="flex flex-col items-center space-y-2 ml-4">
              <!-- Botón marcar como leída/no leída -->
              <button 
                @click="toggleReadStatus(notification)"
                class="w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200"
                :class="notification.read 
                  ? 'bg-gray-200 text-gray-600 hover:bg-gray-300' 
                  : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'"
                :title="notification.read ? 'Marcar como no leída' : 'Marcar como leída'"
              >
                {{ notification.read ? '👁️' : '👁️‍🗨️' }}
              </button>
              
              <!-- Indicador de no leído -->
              <div v-if="!notification.read" 
                   class="w-3 h-3 rounded-full bg-emerald-500"></div>
            </div>
          </div>
          
          <!-- Tipo y hora -->
          <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <span class="text-sm text-gray-500 capitalize">{{ translateNotificationType(notification.type) }}</span>
            <span class="text-sm text-gray-500">{{ formatExactTime(notification.createdAt) }}</span>
          </div>
        </div>
      </div>
      
      <!-- Paginación -->
      <div v-if="notifications.length > 10" 
           class="mt-8 flex justify-center items-center space-x-4">
        <button 
          @click="loadMore"
          class="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200"
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
        'appointment_created': 'bg-green-100 text-green-600',
        'appointment_cancelled': 'bg-red-100 text-red-600',
        'appointment_rescheduled': 'bg-yellow-100 text-yellow-600',
        'appointment_updated': 'bg-blue-100 text-blue-600',
        'system': 'bg-gray-100 text-gray-600',
        'info': 'bg-blue-100 text-blue-600',
        'warning': 'bg-orange-100 text-orange-600',
        'success': 'bg-green-100 text-green-600'
      };
      
      if (type.includes('appointment')) {
        if (type.includes('created')) return classes.appointment_created;
        if (type.includes('cancelled')) return classes.appointment_cancelled;
        if (type.includes('rescheduled')) return classes.appointment_rescheduled;
        if (type.includes('updated')) return classes.appointment_updated;
      }
      
      return classes[type] || 'bg-gray-100 text-gray-600';
    },
    
    formatDateTime(appointment) {
      if (!appointment) return '';
      return `${appointment.date} a las ${appointment.time}`;
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
        'pending': 'bg-yellow-100 text-yellow-800',
        'confirmed': 'bg-green-100 text-green-800',
        'cancelled': 'bg-red-100 text-red-800',
        'completed': 'bg-blue-100 text-blue-800',
        'rescheduled': 'bg-purple-100 text-purple-800',
        'in_progress': 'bg-orange-100 text-orange-800',
        'awaiting_payment': 'bg-amber-100 text-amber-800',
        'paid': 'bg-emerald-100 text-emerald-800'
      };
      return classes[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
    }
  }
};
</script>

<style scoped>
/* Animaciones */
button {
  transition: all 0.2s ease;
}

/* Estilos para scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #10b981;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #059669;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .flex-col {
    flex-direction: column;
  }
  
  .space-x-4 {
    margin-left: 0;
    margin-top: 1rem;
  }
}
</style>