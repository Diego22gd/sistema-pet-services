<template>
  <ProviderLayout>
    <!-- Chatbot Component -->
    <Chatbot />
    
    <!-- Hero Section -->
    <section class="relative bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden">
      <!-- Patrones decorativos -->
      <div class="absolute inset-0 opacity-5">
        <div class="absolute top-10 left-10 w-32 h-32 rounded-full bg-blue-300"></div>
        <div class="absolute bottom-10 right-10 w-48 h-48 rounded-full bg-indigo-300"></div>
        <div class="absolute top-1/2 left-1/4 w-16 h-16 rounded-full bg-blue-400"></div>
      </div>

      <div class="relative container mx-auto px-4 py-20 md:py-28">
        <div class="text-center max-w-4xl mx-auto fade-up">
          <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-lg mb-8">
            <span class="text-4xl">🔔</span>
          </div>
          <h1 class="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Mis Notificaciones
          </h1>
          <p class="text-xl text-gray-700 mb-10 max-w-3xl mx-auto">
            Mantente al día con todas las actividades y citas de tu negocio
          </p>
        </div>
      </div>
    </section>

    <!-- Contenido principal -->
    <section class="py-16 bg-white">
      <div class="container mx-auto px-4">
        <!-- Header con filtros -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h2 class="text-3xl font-bold text-gray-900 mb-2">
              Historial de Notificaciones
            </h2>
            <p class="text-gray-600">
              {{ filteredNotifications.length }} notificaciones encontradas
              <span v-if="filterType !== 'all'"> ({{ filterTypeLabel }})</span>
            </p>
          </div>
          
          <!-- Filtros y acciones -->
          <div class="flex flex-wrap gap-4">
            <!-- Filtro por tipo -->
            <div class="relative">
              <div class="flex items-center space-x-2 bg-white border border-gray-300 rounded-xl px-4 py-2">
                <span class="text-gray-600">📊</span>
                <select 
                  v-model="filterType" 
                  @change="applyFilters"
                  class="bg-transparent border-none focus:ring-0 text-gray-900"
                >
                  <option value="all">Todas</option>
                  <option value="unread">No leídas</option>
                  <option value="appointment_created">Nuevas citas</option>
                  <option value="appointment_cancelled">Cancelaciones</option>
                  <option value="appointment_rescheduled">Reprogramaciones</option>
                </select>
              </div>
            </div>
            
            <!-- Botón marcar todas como leídas -->
            <button 
              v-if="unreadCount > 0"
              @click="markAllAsRead"
              class="btn-modern-outline group"
            >
              <span>✅ Marcar todas leídas</span>
            </button>
            
            <!-- Botón de reparación (solo desarrollo) -->
            <button 
              v-if="isDevelopment"
              @click="repairCurrentSession"
              class="btn-modern-outline bg-purple-50 text-purple-700 border-purple-300"
            >
              <span>🔧 Reparar Sesión</span>
            </button>
          </div>
        </div>

        <!-- Estadísticas -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div class="card-modern p-4 text-center">
            <div class="text-2xl font-bold text-gray-900">{{ notifications.length }}</div>
            <div class="text-sm text-gray-600">Total</div>
          </div>
          <div class="card-modern p-4 text-center border-l-4 border-l-blue-500">
            <div class="text-2xl font-bold text-blue-600">{{ unreadCount }}</div>
            <div class="text-sm text-gray-600">No leídas</div>
          </div>
          <div class="card-modern p-4 text-center border-l-4 border-l-green-500">
            <div class="text-2xl font-bold text-green-600">{{ stats.appointments }}</div>
            <div class="text-sm text-gray-600">Nuevas citas</div>
          </div>
          <div class="card-modern p-4 text-center">
            <div class="text-lg font-semibold text-gray-900">{{ lastUpdate }}</div>
            <div class="text-sm text-gray-600">Última actualización</div>
          </div>
        </div>

        <!-- Estado de carga -->
        <div v-if="loading" class="text-center py-20">
          <div class="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-200">
            <span class="text-4xl text-blue-600 animate-pulse">📬</span>
          </div>
          <h3 class="text-2xl font-bold text-gray-900 mb-3">Cargando notificaciones</h3>
          <p class="text-gray-700">Obteniendo tus notificaciones más recientes...</p>
        </div>

        <!-- Sin resultados -->
        <div v-else-if="filteredNotifications.length === 0" class="text-center py-20">
          <div class="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-300">
            <span class="text-4xl text-gray-400">📭</span>
          </div>
          <h3 class="text-2xl font-bold text-gray-900 mb-3">No hay notificaciones</h3>
          <p class="text-gray-700 mb-8 max-w-md mx-auto">
            {{ filterType !== 'all' ? 'No hay notificaciones con este filtro' : 'Cuando tengas nuevas actividades, aparecerán aquí' }}
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              v-if="filterType !== 'all'"
              @click="resetFilters"
              class="btn-modern-outline"
            >
              <span>🔄 Ver todas las notificaciones</span>
            </button>
          </div>
        </div>

        <!-- Grid de notificaciones -->
        <div v-else class="mb-12">
          <!-- Filtros rápidos -->
          <div class="mb-6 bg-white rounded-xl p-4 border border-gray-200">
            <h3 class="font-bold text-gray-900 mb-3">📋 Filtros rápidos:</h3>
            <div class="flex flex-wrap gap-2">
              <button 
                v-for="filter in quickFilters"
                :key="filter.value"
                @click="applyQuickFilter(filter.value)"
                class="inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200"
                :class="[
                  activeFilter === filter.value 
                    ? filter.activeClass 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                ]"
              >
                <span>{{ filter.icon }}</span>
                <span>{{ filter.label }}</span>
                <span class="text-xs bg-white bg-opacity-50 px-2 py-1 rounded-full">
                  {{ filter.count }}
                </span>
              </button>
            </div>
          </div>

          <!-- Lista de notificaciones -->
          <div class="space-y-4">
            <div 
              v-for="notification in paginatedNotifications" 
              :key="notification._id"
              class="card-modern group h-full flex flex-col hover-lift cursor-pointer"
              :class="[
                notification.read ? 'opacity-90' : 'border-l-4 border-l-blue-500 bg-blue-50/30',
                notification.type === 'appointment_cancelled' ? 'border-red-100' : '',
                notification.type === 'appointment_created' ? 'border-green-100' : ''
              ]"
              @click="handleNotificationClick(notification)"
            >
              <div class="card-modern-body p-6 flex-1 flex flex-col">
                <!-- Header de la notificación -->
                <div class="mb-4">
                  <div class="flex justify-between items-start mb-3">
                    <div class="flex items-center gap-3">
                      <div class="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm"
                           :class="iconBg(notification.type)">
                        <span class="text-2xl">{{ icon(notification.type) }}</span>
                      </div>
                      <div>
                        <h3 class="card-title text-lg font-bold text-gray-900">
                          {{ notification.title }}
                          <span v-if="!notification.read" class="ml-2 text-xs font-normal text-blue-600">● Nuevo</span>
                        </h3>
                        <p class="text-sm text-gray-600">
                          {{ formatTimeAgo(notification.createdAt) }}
                        </p>
                      </div>
                    </div>
                    <span class="badge-outline" :class="typeBadgeClass(notification.type)">
                      {{ typeLabel(notification.type) }}
                    </span>
                  </div>
                  
                  <!-- Mensaje principal -->
                  <p class="text-gray-700 mb-4 leading-relaxed">
                    {{ notification.message }}
                  </p>
                </div>
                
                <!-- Metadatos -->
                <div v-if="notification.metadata && Object.keys(notification.metadata).length > 0" 
                     class="mb-4 space-y-3">
                  <!-- Fecha de la cita -->
                  <div v-if="notification.metadata.appointmentDate" class="flex items-center gap-2 text-gray-700">
                    <span class="text-blue-500">📅</span>
                    <span class="font-medium">
                      {{ formatDate(notification.metadata.appointmentDate) }}
                      <span v-if="notification.metadata.appointmentTime">
                        a las {{ notification.metadata.appointmentTime }}
                      </span>
                    </span>
                  </div>
                  
                  <!-- Servicio -->
                  <div v-if="notification.metadata.serviceName" class="flex items-center gap-2 text-gray-700">
                    <span class="text-green-500">⚙️</span>
                    <span>{{ notification.metadata.serviceName }}</span>
                  </div>
                  
                  <!-- Mascota -->
                  <div v-if="notification.metadata.petName" class="flex items-center gap-2 text-gray-700">
                    <span class="text-purple-500">🐾</span>
                    <span>{{ notification.metadata.petName }}</span>
                  </div>
                  
                  <!-- Cliente -->
                  <div v-if="notification.metadata.userName" class="flex items-center gap-2 text-gray-700">
                    <span class="text-amber-500">👤</span>
                    <span>{{ notification.metadata.userName }}</span>
                  </div>
                  
                  <!-- Razón -->
                  <div v-if="notification.metadata.reason" class="mt-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="text-amber-500">📝</span>
                      <span class="text-sm font-medium text-gray-900">Razón:</span>
                    </div>
                    <p class="text-xs text-gray-700">{{ notification.metadata.reason }}</p>
                  </div>
                </div>
                
                <!-- Información del usuario -->
                <div v-if="notification.userId" class="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                      <span class="text-sm font-semibold text-gray-700">
                        {{ getUserInitials(notification.userId) }}
                      </span>
                    </div>
                    <div>
                      <p class="font-bold text-gray-900">{{ notification.userId?.name || 'Usuario' }}</p>
                      <p class="text-xs text-gray-600">
                        {{ notification.userId?.email || 'Correo no disponible' }}
                      </p>
                    </div>
                  </div>
                </div>
                
                <!-- Botones de acción -->
                <div class="card-actions justify-between items-center mt-auto pt-4 border-t border-gray-200">
                  <div class="text-xs text-gray-500">
                    {{ formatFullDate(notification.createdAt) }}
                  </div>
                  
                  <div class="flex gap-2">
                    <button 
                      v-if="!notification.read"
                      @click.stop="markAsRead(notification._id)"
                      class="btn-modern-sm bg-blue-500 hover:bg-blue-600"
                    >
                      ✅ Marcar leída
                    </button>
                    
                    <button 
                      v-if="notification.appointmentId"
                      @click.stop="goToAppointment(notification.appointmentId._id)"
                      class="btn-modern-outline-sm"
                    >
                      📋 Ver cita
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Paginación -->
          <div v-if="totalPages > 1" class="mt-12">
            <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div class="text-sm text-gray-600">
                Mostrando {{ paginatedNotifications.length }} de {{ filteredNotifications.length }} notificaciones
              </div>
              
              <div class="flex items-center gap-2">
                <button 
                  @click="prevPage"
                  :disabled="currentPage === 1"
                  class="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span class="text-lg">◀</span>
                </button>
                
                <div class="flex items-center gap-1">
                  <button 
                    v-for="page in visiblePages"
                    :key="page"
                    @click="changePage(page)"
                    :class="[
                      currentPage === page 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'text-gray-700 border-gray-300 hover:bg-gray-50'
                    ]"
                    class="w-10 h-10 flex items-center justify-center rounded-lg border transition-colors font-medium"
                  >
                    {{ page }}
                  </button>
                  
                  <span v-if="hasEllipsis" class="px-2 text-gray-500">...</span>
                </div>
                
                <button 
                  @click="nextPage"
                  :disabled="currentPage === totalPages"
                  class="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span class="text-lg">▶</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Sidebar de Configuración -->
    <section class="py-8 bg-gray-50 border-t">
      <div class="container mx-auto px-4">
        <div class="max-w-4xl mx-auto">
          <div class="bg-white rounded-2xl p-6 shadow-sm border">
            <h3 class="text-xl font-bold text-gray-900 mb-4">⚙️ Configuración de Notificaciones</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Notificaciones push -->
              <div class="space-y-4">
                <h4 class="font-semibold text-gray-900">🔔 Notificaciones en tiempo real</h4>
                <div class="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span class="text-gray-700">Notificaciones push</span>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" v-model="pushNotifications" class="sr-only peer">
                    <div class="w-12 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div class="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span class="text-gray-700">Sonidos de notificación</span>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" v-model="soundNotifications" class="sr-only peer">
                    <div class="w-12 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
              
              <!-- Notificaciones por email -->
              <div class="space-y-4">
                <h4 class="font-semibold text-gray-900">📧 Notificaciones por correo</h4>
                <div class="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span class="text-gray-700">Nuevas citas</span>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" v-model="emailNewAppointments" class="sr-only peer">
                    <div class="w-12 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
                
                <div class="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span class="text-gray-700">Cancelaciones</span>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" v-model="emailCancellations" class="sr-only peer">
                    <div class="w-12 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
              </div>
            </div>
            
            <div class="mt-6 pt-6 border-t border-gray-200">
              <div class="flex flex-col sm:flex-row gap-4 justify-end">
                <button @click="resetSettings" class="btn-modal-ghost">
                  Restablecer
                </button>
                <button @click="saveSettings" class="btn-modal-primary">
                  💾 Guardar configuración
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Toast notifications -->
    <div v-if="showToast" 
         class="fixed bottom-6 right-6 animate-slide-up z-50">
      <div class="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-xl shadow-2xl max-w-sm">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full flex items-center justify-center"
               :class="toastMessage.type === 'error' ? 'bg-red-500' : 'bg-green-500'">
            <span class="text-xl">{{ toastMessage.type === 'error' ? '❌' : '✅' }}</span>
          </div>
          <div class="flex-1">
            <p class="font-semibold">{{ toastMessage.title }}</p>
            <p class="text-sm text-blue-100">{{ toastMessage.text }}</p>
          </div>
          <button @click="showToast = false" class="ml-4 text-blue-200 hover:text-white">
            <span class="text-xl">✕</span>
          </button>
        </div>
      </div>
    </div>
  </ProviderLayout>
</template>

<script>
import ProviderLayout from "@/components/ProviderLayout.vue";
import Chatbot from "@/components/Chatbot.vue";
import api from "@/api/api";
import { useUserStore } from "@/stores/userStore";

export default {
  name: "ProviderNotifications",
  components: { ProviderLayout, Chatbot },

  setup() {
    const userStore = useUserStore();
    return { userStore };
  },

  data() {
    return {
      notifications: [],
      filteredNotifications: [],
      loading: true,
      unreadCount: 0,
      filterType: 'all',
      activeFilter: 'all',
      currentPage: 1,
      itemsPerPage: 10,
      totalPages: 1,
      
      // Estadísticas
      stats: {
        appointments: 0,
        cancellations: 0,
        reschedules: 0
      },
      
      // Configuración
      pushNotifications: true,
      soundNotifications: true,
      emailNewAppointments: true,
      emailCancellations: true,
      
      // UI States
      showToast: false,
      toastMessage: { 
        title: '', 
        text: '', 
        type: 'success' 
      },
      lastUpdate: 'Hace unos segundos',
      
      // Debug
      isDevelopment: process.env.NODE_ENV === 'development'
    };
  },

  computed: {
    quickFilters() {
      return [
        {
          value: 'all',
          label: 'Todas',
          icon: '📬',
          activeClass: 'bg-blue-100 text-blue-800 border border-blue-300',
          count: this.notifications.length
        },
        {
          value: 'unread',
          label: 'No leídas',
          icon: '🔔',
          activeClass: 'bg-red-100 text-red-800 border border-red-300',
          count: this.unreadCount
        },
        {
          value: 'appointment_created',
          label: 'Nuevas citas',
          icon: '📅',
          activeClass: 'bg-green-100 text-green-800 border border-green-300',
          count: this.stats.appointments
        },
        {
          value: 'appointment_cancelled',
          label: 'Cancelaciones',
          icon: '❌',
          activeClass: 'bg-rose-100 text-rose-800 border border-rose-300',
          count: this.stats.cancellations
        },
        {
          value: 'appointment_rescheduled',
          label: 'Reprogramaciones',
          icon: '🔄',
          activeClass: 'bg-amber-100 text-amber-800 border border-amber-300',
          count: this.stats.reschedules
        }
      ];
    },
    
    paginatedNotifications() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredNotifications.slice(start, end);
    },
    
    visiblePages() {
      const pages = [];
      const total = this.totalPages;
      const current = this.currentPage;
      const delta = 2;
      
      for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
        pages.push(i);
      }
      
      if (current - delta > 2) {
        pages.unshift('...');
      }
      if (current + delta < total - 1) {
        pages.push('...');
      }
      
      pages.unshift(1);
      if (total > 1) {
        pages.push(total);
      }
      
      return pages.filter((page, index, array) => array.indexOf(page) === index);
    },
    
    hasEllipsis() {
      return this.visiblePages.includes('...');
    },
    
    filterTypeLabel() {
      const labels = {
        'all': 'Todas',
        'unread': 'No leídas',
        'appointment_created': 'Nuevas citas',
        'appointment_cancelled': 'Cancelaciones',
        'appointment_rescheduled': 'Reprogramaciones'
      };
      return labels[this.filterType] || this.filterType;
    }
  },

  async created() {
    await this.autoRepairSession();
    await this.loadNotifications();
    this.startAutoRefresh();
  },

  beforeDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  },

  methods: {
    // 🔧 Reparar sesión actual automáticamente
    async autoRepairSession() {
      console.log('🔄 Verificando y reparando sesión...');
      
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('ℹ️ No hay token en localStorage');
        return;
      }
      
      const hasUserId = localStorage.getItem('userId');
      const hasUserRole = localStorage.getItem('userRole');
      
      if (!hasUserId || !hasUserRole) {
        console.log('⚠️ Faltan datos en localStorage, reparando...');
        
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            localStorage.setItem('userId', user._id || user.id);
            localStorage.setItem('userRole', user.role);
            localStorage.setItem('userName', user.name || '');
            localStorage.setItem('userEmail', user.email || '');
            
            console.log('✅ Datos reparados desde objeto user:', {
              userId: user._id,
              userRole: user.role
            });
            
            this.showToastMessage('Sesión reparada', 'Datos de usuario restaurados', 'success');
          } catch (error) {
            console.error('❌ Error parseando usuario:', error);
          }
        } else {
          console.log('⚠️ No hay objeto user en localStorage');
        }
      } else {
        console.log('✅ Datos de sesión verificados correctamente');
      }
    },
    
    // 🔧 Botón manual para reparar sesión
    async repairCurrentSession() {
      console.log('🔧 Reparando sesión manualmente...');
      
      const token = localStorage.getItem('token');
      if (!token) {
        this.showToastMessage('Error', 'No hay token disponible', 'error');
        return;
      }
      
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload.id || payload.userId || payload._id;
        const userRole = payload.role;
        
        localStorage.setItem('userId', userId);
        localStorage.setItem('userRole', userRole);
        
        console.log('✅ Datos del token guardados:', { userId, userRole });
        
        try {
          const response = await api.get('/users/me');
          if (response.data.success) {
            const user = response.data.user;
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('userName', user.name || '');
            localStorage.setItem('userEmail', user.email || '');
            
            console.log('✅ Datos completos obtenidos del servidor:', user.name);
          }
        } catch (error) {
          console.log('ℹ️ No se pudieron obtener datos completos:', error.message);
        }
        
        this.showToastMessage('Sesión reparada', 'Datos restaurados correctamente', 'success');
        
        setTimeout(() => {
          this.loadNotifications();
        }, 1000);
        
      } catch (error) {
        console.error('❌ Error reparando sesión:', error);
        this.showToastMessage('Error', 'No se pudo reparar la sesión', 'error');
      }
    },
    
    async loadNotifications() {
      try {
        this.loading = true;
        
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('❌ No hay token de autenticación');
          this.showToastMessage('Error', 'No estás autenticado. Por favor, inicia sesión.', 'error');
          this.$router.push('/provider/login');
          return;
        }
        
        const userRole = localStorage.getItem('userRole');
        if (!userRole || userRole !== 'provider') {
          console.warn('⚠️ Usuario no es proveedor, rol:', userRole);
          this.showToastMessage(
            'Acceso restringido', 
            'Solo los proveedores pueden acceder a las notificaciones',
            'error'
          );
          
          setTimeout(() => {
            if (userRole === 'admin') {
              this.$router.push('/admin/dashboard');
            } else if (userRole === 'client') {
              this.$router.push('/client/dashboard');
            } else {
              this.$router.push('/login');
            }
          }, 2000);
          return;
        }
        
        console.log('🔄 Cargando notificaciones para proveedor...');
        
        // PRIMERO INTENTAR CON EL ENDPOINT /me
        try {
          console.log('🔍 Intentando endpoint /notifications/me...');
          const response = await api.get('/notifications/me');
          
          console.log('✅ Respuesta del servidor:', response.data);
          
          if (response.data.success) {
            this.processNotifications(response.data);
          } else {
            throw new Error('Respuesta no exitosa del servidor');
          }
          
        } catch (meError) {
          console.log('❌ Endpoint /me falló, probando alternativa...');
          
          // SI /me FALLA, PROBAR CON EL ID DIRECTAMENTE
          try {
            const userId = localStorage.getItem('userId');
            if (!userId) {
              throw new Error('No hay userId disponible');
            }
            
            console.log(`🔍 Intentando endpoint /notifications/provider/${userId}...`);
            const response = await api.get(`/notifications/provider/${userId}`);
            
            if (response.data.success) {
              this.processNotifications(response.data);
            } else {
              throw new Error('Endpoint alternativo también falló');
            }
            
          } catch (altError) {
            console.error('❌ Ambos endpoints fallaron:', altError);
            this.showToastMessage(
              'Error', 
              'No se pudieron cargar las notificaciones. Intenta recargar la página.',
              'error'
            );
          }
        }
        
      } catch (error) {
        console.error('❌ Error general cargando notificaciones:', error);
        this.showToastMessage('Error', 'Ocurrió un error inesperado', 'error');
      } finally {
        this.loading = false;
      }
    },
    
    processNotifications(responseData) {
      this.notifications = responseData.notifications.map(notif => ({
        ...notif,
        date: this.formatTimeAgo(notif.createdAt)
      }));
      
      this.unreadCount = this.notifications.filter(n => !n.read).length;
      this.calculateStats();
      this.applyFilters();
      this.updateLastUpdate();
      
      console.log(`✅ ${this.notifications.length} notificaciones cargadas`);
      console.log(`🔔 ${this.unreadCount} no leídas`);
      
      this.showToastMessage('Listo', 'Notificaciones cargadas correctamente', 'success');
    },
    
    calculateStats() {
      this.stats = {
        appointments: this.notifications.filter(n => n.type === 'appointment_created').length,
        cancellations: this.notifications.filter(n => n.type === 'appointment_cancelled').length,
        reschedules: this.notifications.filter(n => n.type === 'appointment_rescheduled').length
      };
    },
    
    applyFilters() {
      let filtered = this.notifications;
      
      if (this.filterType === 'unread') {
        filtered = filtered.filter(n => !n.read);
      } else if (this.filterType !== 'all') {
        filtered = filtered.filter(n => n.type === this.filterType);
      }
      
      this.filteredNotifications = filtered;
      this.currentPage = 1;
      this.totalPages = Math.ceil(this.filteredNotifications.length / this.itemsPerPage);
      this.activeFilter = this.filterType;
    },
    
    applyQuickFilter(filterValue) {
      this.filterType = filterValue;
      this.applyFilters();
    },
    
    resetFilters() {
      this.filterType = 'all';
      this.applyFilters();
    },
    
    async markAsRead(id) {
      try {
        await api.put(`/notifications/${id}/read`);
        
        const notif = this.notifications.find(n => n._id === id);
        if (notif) {
          notif.read = true;
          this.unreadCount = Math.max(0, this.unreadCount - 1);
          this.calculateStats();
        }
        
        this.showToastMessage('¡Listo!', 'Notificación marcada como leída', 'success');
        
      } catch (error) {
        console.error("Error marcando como leída:", error);
        this.showToastMessage('Error', 'No se pudo marcar como leída', 'error');
      }
    },
    
    async markAllAsRead() {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          this.showToastMessage('Error', 'No se pudo identificar el usuario', 'error');
          return;
        }
        
        await api.put(`/notifications/provider/${userId}/read-all`);
        
        this.notifications.forEach(notif => notif.read = true);
        this.unreadCount = 0;
        this.calculateStats();
        
        this.showToastMessage('¡Perfecto!', 'Todas las notificaciones marcadas como leídas', 'success');
        
      } catch (error) {
        console.error("Error marcando todas como leídas:", error);
        this.showToastMessage('Error', 'No se pudieron marcar todas como leídas', 'error');
      }
    },
    
    handleNotificationClick(notification) {
      if (!notification.read) {
        this.markAsRead(notification._id);
      }
      
      if (notification.appointmentId && notification.appointmentId._id) {
        this.goToAppointment(notification.appointmentId._id);
      }
    },
    
    goToAppointment(appointmentId) {
      this.$router.push(`/provider/appointments?highlight=${appointmentId}`);
    },
    
    async saveSettings() {
      try {
        // Simular guardado de configuración
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.showToastMessage('Configuración guardada', 'Tus preferencias han sido actualizadas', 'success');
      } catch (error) {
        console.error("Error guardando configuración:", error);
        this.showToastMessage('Error', 'No se pudo guardar la configuración', 'error');
      }
    },
    
    resetSettings() {
      this.pushNotifications = true;
      this.soundNotifications = true;
      this.emailNewAppointments = true;
      this.emailCancellations = true;
      this.showToastMessage('Configuración restablecida', 'Se han cargado los valores por defecto', 'success');
    },
    
    showToastMessage(title, text, type = 'success') {
      this.toastMessage = { title, text, type };
      this.showToast = true;
      setTimeout(() => {
        this.showToast = false;
      }, 4000);
    },
    
    updateLastUpdate() {
      this.lastUpdate = this.formatTimeAgo(new Date());
    },
    
    startAutoRefresh() {
      this.refreshInterval = setInterval(async () => {
        if (this.unreadCount > 0) {
          console.log('🔄 Actualizando notificaciones automáticamente...');
          await this.loadNotifications();
        }
      }, 30000);
    },
    
    // Paginación
    changePage(page) {
      if (page === '...') return;
      this.currentPage = page;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    
    // Formateadores
    formatTimeAgo(date) {
      const now = new Date();
      const notificationDate = new Date(date);
      const diffMs = now - notificationDate;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      
      if (diffMins < 1) return 'Hace unos segundos';
      if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
      if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
      if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
      
      return notificationDate.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short'
      });
    },
    
    formatFullDate(date) {
      return new Date(date).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    
    formatDate(dateStr) {
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    },
    
    getUserInitials(user) {
      if (!user?.name) return 'U';
      return user.name.split(' ').map(n => n[0]).join('').toUpperCase();
    },
    
    // Iconos y estilos
    icon(type) {
      const icons = {
        'appointment_created': '📅',
        'appointment_cancelled': '❌',
        'appointment_rescheduled': '🔄',
        'appointment_updated': '✏️',
        'system': '⚙️'
      };
      return icons[type] || '🔔';
    },
    
    iconBg(type) {
      const bgColors = {
        'appointment_created': 'bg-green-100 text-green-600',
        'appointment_cancelled': 'bg-red-100 text-red-600',
        'appointment_rescheduled': 'bg-yellow-100 text-yellow-600',
        'appointment_updated': 'bg-blue-100 text-blue-600',
        'system': 'bg-gray-100 text-gray-600'
      };
      return bgColors[type] || 'bg-gray-100 text-gray-600';
    },
    
    typeBadgeClass(type) {
      const classes = {
        'appointment_created': 'bg-green-100 text-green-800',
        'appointment_cancelled': 'bg-red-100 text-red-800',
        'appointment_rescheduled': 'bg-yellow-100 text-yellow-800',
        'appointment_updated': 'bg-blue-100 text-blue-800',
        'system': 'bg-gray-100 text-gray-800'
      };
      return classes[type] || 'bg-gray-100 text-gray-800';
    },
    
    typeLabel(type) {
      const labels = {
        'appointment_created': 'Nueva cita',
        'appointment_cancelled': 'Cancelación',
        'appointment_rescheduled': 'Reprogramación',
        'appointment_updated': 'Actualización',
        'system': 'Sistema'
      };
      return labels[type] || 'Notificación';
    }
  }
};
</script>

<style scoped>
/* Reutiliza los mismos estilos que UserAppointments.vue */
.fade-up {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-up.show {
  opacity: 1;
  transform: translateY(0);
}

.hover-lift {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.hover-lift:hover {
  transform: translateY(-8px);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.card-modern {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.card-modern:hover {
  border-color: #3b82f6;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.1),
    0 0 0 1px #3b82f6,
    0 0 20px rgba(59, 130, 246, 0.1);
}

.card-modern-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.card-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.badge-outline {
  background: white;
  color: #3b82f6;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-weight: 600;
  font-size: 0.75rem;
  border: 1px solid #3b82f6;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.badge-tag {
  background: #f0fdfa;
  color: #0d9488;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.7rem;
  border: 1px solid #99f6e4;
}

.btn-modern-outline {
  background: transparent;
  color: #3b82f6;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: 2px solid #3b82f6;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-modern-outline:hover:not(:disabled) {
  background: rgba(59, 130, 246, 0.1);
  transform: translateY(-2px);
}

.btn-modern-outline-sm {
  background: transparent;
  color: #3b82f6;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid #3b82f6;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-modern-outline-sm:hover {
  background: rgba(59, 130, 246, 0.1);
}

.btn-modern-sm {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-modern-sm:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(59, 130, 246, 0.3);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.btn-modal-primary {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-modal-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(59, 130, 246, 0.3);
}

.btn-modal-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-modal-ghost {
  background: transparent;
  color: #6b7280;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-modal-ghost:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #3b82f6;
}

.animate-pulse {
  animation: pulse 2s ease-in-out infinite;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

.animate-slide-up {
  animation: slideUp 0.3s ease-out;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .grid.grid-cols-1.md\:grid-cols-2.lg\:grid-cols-3 {
    grid-template-columns: 1fr;
  }
  
  .text-5xl {
    font-size: 2.5rem;
  }
  
  .text-6xl {
    font-size: 3rem;
  }
  
  .flex-wrap {
    justify-content: center;
  }
  
  .btn-modern-outline,
  .btn-modern-sm {
    width: 100%;
    justify-content: center;
  }
}

/* Estilos para el toggle switch */
input:checked ~ .peer-checked\:bg-blue-600 {
  background-color: #2563eb;
}

input:checked ~ .peer-checked\:bg-green-600 {
  background-color: #059669;
}

input:checked ~ .peer-checked\:after\:translate-x-full:after {
  transform: translateX(100%);
}

/* Scroll personalizado */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Estilos para hover y focus */
button:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Transiciones suaves */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}

/* Gradientes y sombras */
.shadow-sm {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.shadow-lg {
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Border radius personalizados */
.rounded-3xl {
  border-radius: 1.5rem;
}

/* Estilos para estados */
.hover\:scale-105:hover {
  transform: scale(1.05);
}

.active\:scale-95:active {
  transform: scale(0.95);
}

/* Z-index para toast */
.z-50 {
  z-index: 50;
}
</style>