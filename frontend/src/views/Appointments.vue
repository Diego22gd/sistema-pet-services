<template>
  <Layout>
    <!-- Chatbot Component -->
    <Chatbot />
    
    <!-- Hero Section -->
    <section class="relative bg-gradient-to-br from-emerald-50 to-teal-50 overflow-hidden">
      <!-- Patrones decorativos -->
      <div class="absolute inset-0 opacity-5">
        <div class="absolute top-10 left-10 w-32 h-32 rounded-full bg-emerald-300"></div>
        <div class="absolute bottom-10 right-10 w-48 h-48 rounded-full bg-teal-300"></div>
        <div class="absolute top-1/2 left-1/4 w-16 h-16 rounded-full bg-emerald-400"></div>
      </div>

      <div class="relative container mx-auto px-4 py-20 md:py-32">
        <div class="text-center max-w-4xl mx-auto fade-up">
          <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-lg mb-8">
            <span class="text-4xl">📅</span>
          </div>
          <h1 class="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Mis Citas Programadas
          </h1>
          <p class="text-xl text-gray-700 mb-10 max-w-3xl mx-auto">
            Gestiona todas tus reservas y mantén el control del cuidado de tu mascota
          </p>
        </div>
      </div>
    </section>

    <!-- Contenido principal -->
    <section class="py-16 bg-white">
      <div class="container mx-auto px-4">
        <!-- Header de resultados -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h2 class="text-3xl font-bold text-gray-900 mb-2">
              Historial de Citas
            </h2>
            <p class="text-gray-600">
              {{ filteredAppointments.length }} citas encontradas
              <span v-if="selectedPet"> para {{ getPetName(selectedPet) }}</span>
            </p>
          </div>
          
          <!-- Filtros -->
          <div class="flex items-center gap-4">
            <div class="text-gray-600">Filtrar por:</div>
            <select 
              v-model="selectedPet"
              @change="applyFilters"
              class="bg-white border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">Todas las mascotas</option>
              <option v-for="pet in pets" :key="pet._id" :value="pet._id">
                {{ pet.name }} ({{ pet.type }})
              </option>
            </select>
          </div>
        </div>

        <!-- Estadísticas -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div class="card-modern p-4 text-center">
            <div class="text-2xl font-bold text-emerald-600">{{ filteredAppointments.length }}</div>
            <div class="text-sm text-gray-600">Total Citas</div>
          </div>
          <div class="card-modern p-4 text-center">
            <div class="text-2xl font-bold text-amber-600">{{ pendingCount }}</div>
            <div class="text-sm text-gray-600">Pendientes</div>
          </div>
          <div class="card-modern p-4 text-center">
            <div class="text-2xl font-bold text-green-600">{{ confirmedCount }}</div>
            <div class="text-sm text-gray-600">Confirmadas</div>
          </div>
          <div class="card-modern p-4 text-center">
            <div class="text-2xl font-bold text-blue-600">{{ upcomingCount }}</div>
            <div class="text-sm text-gray-600">Próximas</div>
          </div>
        </div>

        <!-- Estado de carga -->
        <div v-if="loading" class="text-center py-20">
          <div class="w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-200">
            <span class="text-4xl text-emerald-600 animate-pulse">📅</span>
          </div>
          <h3 class="text-2xl font-bold text-gray-900 mb-3">Cargando citas</h3>
          <p class="text-gray-700">Obteniendo tu historial de reservas...</p>
        </div>

        <!-- Sin resultados -->
        <div v-else-if="filteredAppointments.length === 0" class="text-center py-20">
          <div class="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-300">
            <span class="text-4xl text-gray-400">📅</span>
          </div>
          <h3 class="text-2xl font-bold text-gray-900 mb-3">No hay citas programadas</h3>
          <p class="text-gray-700 mb-8 max-w-md mx-auto">
            Aún no has realizado ninguna reserva. ¡Encuentra servicios para tu mascota!
          </p>
          <button
            @click="goToCommerces"
            class="btn-primary text-lg px-8 py-4"
          >
            <span>🏬 Buscar servicios</span>
          </button>
        </div>

        <!-- Grid de citas -->
        <div v-else class="mb-12">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              v-for="appointment in filteredAppointments"
              :key="appointment._id"
              class="card-modern group h-full flex flex-col hover-lift"
            >
              <!-- Header de la cita -->
              <div class="card-modern-body p-6 flex-1 flex flex-col">
                <!-- Estado y fecha -->
                <div class="mb-4">
                  <div class="flex justify-between items-start mb-2">
                    <h3 class="card-title text-xl font-bold text-gray-900">
                      {{ appointment.serviceName || appointment.service?.name || 'Servicio' }}
                    </h3>
                    <span :class="[
                      'px-3 py-1 rounded-full text-xs font-semibold',
                      getStatusBadgeClass(appointment.status)
                    ]">
                      {{ translateStatus(appointment.status) }}
                    </span>
                  </div>
                  <div class="flex items-center gap-2 text-gray-600">
                    <span class="text-emerald-500">📅</span>
                    <span>{{ formatDate(appointment.date) }}</span>
                    <span class="text-gray-400">•</span>
                    <span class="text-emerald-500">⏰</span>
                    <span>{{ formatTime(appointment.time) }}</span>
                  </div>
                </div>
                
                <!-- Información de la mascota -->
                <div class="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                      <span class="text-lg">{{ getPetIcon(appointment.pet?.type) }}</span>
                    </div>
                    <div>
                      <p class="font-bold text-gray-900">{{ appointment.pet?.name || 'Mascota' }}</p>
                      <p class="text-sm text-gray-600 capitalize">
                        {{ appointment.pet?.type || 'Tipo no especificado' }}
                        <span v-if="appointment.pet?.breed">• {{ appointment.pet.breed }}</span>
                      </p>
                    </div>
                  </div>
                </div>
                
                <!-- Información del servicio -->
                <div class="mb-4 space-y-2">
                  <div class="flex justify-between items-center">
                    <span class="text-sm font-medium text-gray-900">Servicio:</span>
                    <span class="text-sm text-gray-700">{{ appointment.serviceName || appointment.service?.name }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm font-medium text-gray-900">Precio:</span>
                    <span class="text-xl font-bold text-emerald-600">
                      ${{ appointment.servicePrice || appointment.service?.price || '0' }}
                    </span>
                  </div>
                  <div v-if="appointment.serviceDuration" class="flex justify-between items-center">
                    <span class="text-sm font-medium text-gray-900">Duración:</span>
                    <span class="text-sm text-gray-700">{{ appointment.serviceDuration }} min</span>
                  </div>
                  <div v-if="appointment.businessName" class="flex justify-between items-center">
                    <span class="text-sm font-medium text-gray-900">Negocio:</span>
                    <span class="text-sm text-gray-700">{{ appointment.businessName }}</span>
                  </div>
                </div>
                
                <!-- Notas -->
                <div v-if="appointment.notes" class="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-amber-500">📝</span>
                    <span class="text-sm font-medium text-gray-900">Notas:</span>
                  </div>
                  <p class="text-xs text-gray-700">{{ appointment.notes }}</p>
                </div>
                
                <!-- Botones de acción -->
                <div class="card-actions justify-between items-center mt-auto pt-4 border-t border-gray-200">
                  <button 
                    @click="viewDetails(appointment)"
                    class="btn-modern-outline group mb-4"
                  >
                    <span>Ver detalles</span>
                    <span class="ml-2  group-hover:translate-x-1 transition-transform duration-300">→</span>
                  </button>
                  
                  <div v-if="isActiveAppointment(appointment)" class="flex gap-2">
                    <button
                      v-if="canReschedule(appointment)"
                      @click="openRescheduleModal(appointment)"
                      class="btn-modern-sm bg-amber-500 hover:bg-amber-600"
                    >
                      Reprogramar
                    </button>
                    
                    <button
                      v-if="canCancel(appointment)"
                      @click="openCancelModal(appointment)"
                      class="btn-modern-sm bg-rose-500 hover:bg-rose-600"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Modal de Detalles de Cita -->
    <div v-if="showDetailsModal && selectedAppointment" class="modal-overlay" @click.self="closeDetailsModal">
      <div class="modal-modern-box max-w-4xl" @click.stop>
        <div class="modal-modern-header flex justify-between items-start">
          <div class="flex items-start gap-4">
            <div class="avatar-modern-lg">
              <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center">
                <span class="text-4xl">📅</span>
              </div>
            </div>
            <div>
              <h2 class="text-3xl font-bold text-gray-900">Detalles de la Cita</h2>
              <div class="flex items-center gap-2 mt-2 flex-wrap">
                <div :class="[
                  'px-3 py-1 rounded-full text-sm font-bold',
                  getStatusBadgeClass(selectedAppointment.status)
                ]">
                  {{ translateStatus(selectedAppointment.status) }}
                </div>
                <div class="badge-outline">
                  📅 {{ formatDate(selectedAppointment.date) }}
                </div>
                <div class="badge-outline">
                  ⏰ {{ formatTime(selectedAppointment.time) }}
                </div>
              </div>
            </div>
          </div>
          <button @click="closeDetailsModal" class="btn-modal-close">
            ✕
          </button>
        </div>

        <div class="modal-modern-content mt-6">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Columna izquierda: Información principal -->
            <div>
              <!-- Información de la mascota -->
              <div class="modal-section">
                <h3 class="modal-section-title">
                  <span>🐾</span> Información de la Mascota
                </h3>
                <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div class="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center">
                    <span class="text-white text-2xl">{{ getPetIcon(selectedAppointment.pet?.type) }}</span>
                  </div>
                  <div>
                    <p class="font-bold text-gray-900 text-lg">{{ selectedAppointment.pet?.name }}</p>
                    <div class="flex flex-wrap gap-2 mt-1">
                      <span class="badge-tag capitalize">{{ selectedAppointment.pet?.type }}</span>
                      <span v-if="selectedAppointment.pet?.breed" class="badge-tag">
                        {{ selectedAppointment.pet.breed }}
                      </span>
                      <span v-if="selectedAppointment.pet?.age" class="badge-tag">
                        {{ selectedAppointment.pet.age }} años
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Información del servicio -->
              <div class="modal-section">
                <h3 class="modal-section-title">
                  <span>⚙️</span> Información del Servicio
                </h3>
                <div class="space-y-4">
                  <div class="border border-gray-200 rounded-xl p-4">
                    <div class="flex justify-between items-center mb-2">
                      <h4 class="font-bold text-gray-900">{{ selectedAppointment.serviceName || selectedAppointment.service?.name }}</h4>
                      <span class="text-xl font-bold text-emerald-600">
                        ${{ selectedAppointment.servicePrice || selectedAppointment.service?.price || '0' }}
                      </span>
                    </div>
                    <p class="text-sm text-gray-600 mb-2">
                      {{ selectedAppointment.service?.description || 'Sin descripción disponible' }}
                    </p>
                    <div class="flex items-center justify-between">
                      <span class="text-sm text-gray-500">
                        Duración: {{ selectedAppointment.serviceDuration || selectedAppointment.service?.duration || 60 }} min
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Columna derecha: Información de la cita -->
            <div>
              <!-- Información del negocio -->
              <div v-if="selectedAppointment.businessName" class="modal-section">
                <h3 class="modal-section-title">
                  <span>🏬</span> Información del Negocio
                </h3>
                <div class="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-200">
                  <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center">
                      <span class="text-white text-xl">🏬</span>
                    </div>
                    <div>
                      <p class="font-bold text-gray-900">{{ selectedAppointment.businessName }}</p>
                      <p class="text-sm text-gray-600">{{ selectedAppointment.businessAddress }}</p>
                      <p class="text-sm text-gray-600">{{ selectedAppointment.businessPhone }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Detalles de la cita -->
              <div class="modal-section">
                <h3 class="modal-section-title">
                  <span>📋</span> Detalles de la Reserva
                </h3>
                <div class="space-y-3">
                  <div class="flex justify-between items-center">
                    <span class="font-medium text-gray-900">Fecha:</span>
                    <span class="font-bold">{{ formatDate(selectedAppointment.date) }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="font-medium text-gray-900">Hora:</span>
                    <span class="font-bold">{{ formatTime(selectedAppointment.time) }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="font-medium text-gray-900">Estado:</span>
                    <span :class="[
                      'px-3 py-1 rounded-full text-sm font-bold',
                      getStatusBadgeClass(selectedAppointment.status)
                    ]">
                      {{ translateStatus(selectedAppointment.status) }}
                    </span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="font-medium text-gray-900">Creada:</span>
                    <span class="text-sm text-gray-600">{{ formatDateTime(selectedAppointment.createdAt) }}</span>
                  </div>
                </div>
              </div>

              <!-- Notas adicionales -->
              <div v-if="selectedAppointment.notes" class="modal-section">
                <h3 class="modal-section-title">
                  <span>📝</span> Notas Adicionales
                </h3>
                <div class="bg-amber-50 rounded-xl p-4 border border-amber-200">
                  <p class="text-gray-700">{{ selectedAppointment.notes }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-modern-actions">
          <button @click="closeDetailsModal" class="btn-modal-ghost">
            Cerrar
          </button>
          <div v-if="isActiveAppointment(selectedAppointment)" class="flex gap-2">
            <button 
              v-if="canReschedule(selectedAppointment)"
              @click="openRescheduleModal(selectedAppointment)"
              class="btn-modal-outline"
            >
              📅 Reprogramar
            </button>
            <button 
              v-if="canCancel(selectedAppointment)"
              @click="openCancelModal(selectedAppointment)"
              class="btn-modal-primary bg-rose-500 hover:bg-rose-600"
            >
              ❌ Cancelar Cita
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Reprogramación -->
    <div v-if="showRescheduleModal && selectedAppointment" class="modal-overlay" @click.self="closeRescheduleModal">
      <div class="modal-modern-box max-w-md" @click.stop>
        <div class="modal-modern-header flex justify-between items-start">
          <div class="flex items-start gap-4">
            <div class="avatar-modern-lg">
              <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-400 flex items-center justify-center">
                <span class="text-3xl">🔄</span>
              </div>
            </div>
            <div>
              <h2 class="text-2xl font-bold text-gray-900">Reprogramar Cita</h2>
              <p class="text-gray-600 mt-1">Selecciona la nueva fecha y hora</p>
            </div>
          </div>
          <button @click="closeRescheduleModal" class="btn-modal-close">
            ✕
          </button>
        </div>

        <div class="modal-modern-content mt-6">
          <div class="space-y-4">
            <!-- Información actual -->
            <div class="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4">
              <h3 class="font-bold text-gray-900 mb-2">Cita Actual</h3>
              <p class="text-gray-700">
                {{ formatDate(selectedAppointment.date) }} a las {{ formatTime(selectedAppointment.time) }}
              </p>
              <p class="text-sm text-gray-600 mt-1">{{ selectedAppointment.serviceName }}</p>
            </div>

            <!-- Formulario de reprogramación -->
            <div>
              <label class="block mb-2 font-medium text-gray-900">
                <span class="text-emerald-600">📅</span> Nueva fecha:
              </label>
              <input
                type="date"
                v-model="rescheduleData.date"
                :min="minDate"
                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
              />
            </div>

            <div>
              <label class="block mb-2 font-medium text-gray-900">
                <span class="text-emerald-600">⏰</span> Nueva hora:
              </label>
              <select
                v-model="rescheduleData.time"
                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
              >
                <option value="">Selecciona una hora</option>
                <option v-for="hour in availableHours" :key="hour" :value="hour">
                  {{ formatTime(hour) }}
                </option>
              </select>
            </div>

            <div>
              <label class="block mb-2 font-medium text-gray-900">
                <span class="text-emerald-600">📝</span> Razón del cambio (opcional):
              </label>
              <textarea
                v-model="rescheduleData.reason"
                rows="3"
                placeholder="¿Por qué necesitas reprogramar la cita?"
                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 resize-none"
              ></textarea>
            </div>
          </div>
        </div>

        <div class="modal-modern-actions">
          <button @click="closeRescheduleModal" class="btn-modal-ghost">
            Cancelar
          </button>
          <button 
            @click="confirmReschedule"
            class="btn-modal-primary"
            :disabled="!isRescheduleValid || processing"
          >
            <span v-if="!processing">
              <span class="mr-2">✅</span> Confirmar reprogramación
            </span>
            <span v-else class="flex items-center gap-2">
              <span class="animate-spin">⟳</span>
              Procesando...
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de Cancelación -->
    <div v-if="showCancelModal && selectedAppointment" class="modal-overlay" @click.self="closeCancelModal">
      <div class="modal-modern-box max-w-md" @click.stop>
        <div class="modal-modern-header flex justify-between items-start">
          <div class="flex items-start gap-4">
            <div class="avatar-modern-lg">
              <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-400 flex items-center justify-center">
                <span class="text-3xl">❌</span>
              </div>
            </div>
            <div>
              <h2 class="text-2xl font-bold text-gray-900">Cancelar Cita</h2>
              <p class="text-gray-600 mt-1">¿Estás seguro de que quieres cancelar esta cita?</p>
            </div>
          </div>
          <button @click="closeCancelModal" class="btn-modal-close">
            ✕
          </button>
        </div>

        <div class="modal-modern-content mt-6">
          <div class="bg-gradient-to-r from-rose-50 to-pink-100 rounded-xl p-4 mb-4">
            <h3 class="font-bold text-gray-900 mb-2">Información de la cita:</h3>
            <p class="text-gray-700">
              {{ selectedAppointment.serviceName }} para {{ selectedAppointment.pet?.name }}
            </p>
            <p class="text-gray-700">
              {{ formatDate(selectedAppointment.date) }} a las {{ formatTime(selectedAppointment.time) }}
            </p>
            <p class="text-gray-700 font-bold mt-2">
              Precio: ${{ selectedAppointment.servicePrice || selectedAppointment.service?.price }}
            </p>
          </div>

          <div class="mb-4">
            <label class="block mb-2 font-medium text-gray-900">
              <span class="text-emerald-600">📝</span> Razón de cancelación (opcional):
            </label>
            <textarea
              v-model="cancelReason"
              rows="3"
              placeholder="¿Por qué cancelas la cita?"
              class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 resize-none"
            ></textarea>
          </div>

          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div class="flex items-start gap-2">
              <span class="text-yellow-600 text-lg">⚠️</span>
              <div>
                <p class="text-sm text-yellow-800 font-medium">Importante:</p>
                <p class="text-xs text-yellow-700 mt-1">
                  Las cancelaciones con menos de 24 horas de anticipación pueden estar sujetas a cargos.
                  Por favor, revisa la política de cancelación del negocio.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-modern-actions">
          <button @click="closeCancelModal" class="btn-modal-ghost">
            Volver
          </button>
          <button 
            @click="confirmCancel"
            class="btn-modal-primary bg-rose-500 hover:bg-rose-600"
            :disabled="processing"
          >
            <span v-if="!processing">
              <span class="mr-2">❌</span> Sí, cancelar cita
            </span>
            <span v-else class="flex items-center gap-2">
              <span class="animate-spin">⟳</span>
              Procesando...
            </span>
          </button>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script>
import Layout from "@/components/Layout.vue";
import Chatbot from "@/components/Chatbot.vue";
import api from "@/api/api";
import { useUserStore } from "@/stores/userStore";
import { formatTimeTo12Hour } from "@/utils/timeFormatter";

export default {
  name: "UserAppointments",
  components: { Layout, Chatbot },
  
  setup() {
    const userStore = useUserStore();
    return { userStore };
  },
  
  data() {
    return {
      appointments: [],
      pets: [],
      loading: false,
      selectedPet: "",
      
      // Modales
      showDetailsModal: false,
      showRescheduleModal: false,
      showCancelModal: false,
      selectedAppointment: null,
      
      // Datos de reprogramación
      rescheduleData: {
        date: "",
        time: "",
        reason: ""
      },
      cancelReason: "",
      processing: false,
      
      // Horas disponibles para reprogramación
      availableHours: [
        "09:00", "10:00", "11:00", "12:00", 
        "14:00", "15:00", "16:00", "17:00", "18:00"
      ]
    };
  },
  
  computed: {
    // Propiedades computadas para el usuario
    isAuthenticated() {
      return !!this.userStore.user && !!this.userStore.token;
    },
    
    user() {
      return this.userStore.user;
    },
    
    // Filtrar citas por mascota seleccionada
    filteredAppointments() {
      if (!this.selectedPet) return this.appointments;
      return this.appointments.filter(appt => 
        appt.pet && appt.pet._id === this.selectedPet
      );
    },
    
    // Estadísticas
    pendingCount() {
      return this.filteredAppointments.filter(appt => 
        appt.status === 'pending' || appt.status === 'pendiente'
      ).length;
    },
    
    confirmedCount() {
      return this.filteredAppointments.filter(appt => 
        appt.status === 'confirmed' || appt.status === 'confirmada'
      ).length;
    },
    
    upcomingCount() {
      const today = new Date().toISOString().split('T')[0];
      return this.filteredAppointments.filter(appt => 
        appt.date >= today && 
        ['pending', 'pendiente', 'confirmed', 'confirmada', 'rescheduled', 'reprogramada'].includes(appt.status)
      ).length;
    },
    
    // Validación de reprogramación
    isRescheduleValid() {
      return this.rescheduleData.date && this.rescheduleData.time;
    },
    
    // Fecha mínima para reprogramación (hoy)
    minDate() {
      const today = new Date();
      return today.toISOString().split('T')[0];
    }
  },
  
  async created() {
    console.log('🔄 UserAppointments created - Iniciando...');
    
    // Verificar autenticación
    if (!this.isAuthenticated) {
      this.$router.push('/login');
      return;
    }
    
    // Cargar citas
    await this.fetchAppointments();
    
    // Cargar mascotas del usuario
    await this.loadUserPets();
  },
  
  mounted() {
    this.initAnimations();
  },
  
  methods: {
    // ============ MÉTODOS DE UTILIDAD ============
    initAnimations() {
      const elements = document.querySelectorAll('.fade-up');
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('show');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1 }
      );
      elements.forEach((el) => observer.observe(el));
    },
    
    getPetIcon(petType) {
      const icons = {
        'perro': '🐕',
        'gato': '🐈',
        'ave': '🐦',
        'roedor': '🐹',
        'reptil': '🦎',
        'pez': '🐠',
        'conejo': '🐰',
        'default': '🐾'
      };
      return icons[petType?.toLowerCase()] || icons.default;
    },
    
    getPetName(petId) {
      const pet = this.pets.find(p => p._id === petId);
      return pet ? pet.name : '';
    },
    
    translateStatus(status) {
      const translations = {
        'pending': 'Pendiente',
        'pendiente': 'Pendiente',
        'confirmed': 'Confirmada',
        'confirmada': 'Confirmada',
        'cancelled': 'Cancelada',
        'cancelada': 'Cancelada',
        'completed': 'Completada',
        'completada': 'Completada',
        'rescheduled': 'Reprogramada',
        'reprogramada': 'Reprogramada'
      };
      return translations[status] || status;
    },
    
    getStatusBadgeClass(status) {
      const translatedStatus = this.translateStatus(status);
      const classes = {
        'Pendiente': 'bg-yellow-100 text-yellow-800',
        'Confirmada': 'bg-green-100 text-green-800',
        'Cancelada': 'bg-red-100 text-red-800',
        'Completada': 'bg-blue-100 text-blue-800',
        'Reprogramada': 'bg-purple-100 text-purple-800'
      };
      return classes[translatedStatus] || 'bg-gray-100 text-gray-800';
    },
    
    formatDate(dateString) {
      if (!dateString) return '';
      const date = /^\d{4}-\d{2}-\d{2}$/.test(dateString)
        ? (() => {
            const [year, month, day] = dateString.split('-').map(Number);
            return new Date(year, month - 1, day);
          })()
        : new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },
    
    formatTime(time24) {
      return formatTimeTo12Hour(time24);
    },
    
    formatDateTime(dateTimeString) {
      if (!dateTimeString) return '';
      const date = new Date(dateTimeString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    addUserNotification(title, message, icon) {
      const notifications = JSON.parse(localStorage.getItem('userNotifications') || '[]');
      notifications.unshift({
        id: `note_${Date.now()}`,
        title,
        message,
        icon,
        read: false,
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('userNotifications', JSON.stringify(notifications.slice(0, 20)));
    },

    syncAppointmentNotifications() {
      const statusMap = JSON.parse(localStorage.getItem('appointmentStatusMap') || '{}');
      this.appointments.forEach((appt) => {
        const id = appt._id || appt.id;
        if (!id) return;

        const currentStatus = appt.status;
        const previousStatus = statusMap[id];

        if (previousStatus && previousStatus !== currentStatus) {
          if (['confirmed', 'confirmada'].includes(currentStatus)) {
            this.addUserNotification('Cita confirmada', 'El proveedor confirmó la cita.', '✅');
          }
          if (['completed', 'completada'].includes(currentStatus)) {
            this.addUserNotification('Cita completada', 'La cita fue completada.', '🏁');
          }
        }

        statusMap[id] = currentStatus;
      });

      localStorage.setItem('appointmentStatusMap', JSON.stringify(statusMap));
    },
    
    isActiveAppointment(appointment) {
      const activeStatuses = ['pending', 'pendiente', 'confirmed', 'confirmada', 'rescheduled', 'reprogramada'];
      return activeStatuses.includes(appointment.status);
    },
    
    canReschedule(appointment) {
      const today = new Date().toISOString().split('T')[0];
      return this.isActiveAppointment(appointment) && appointment.date >= today;
    },
    
    canCancel(appointment) {
      const today = new Date().toISOString().split('T')[0];
      return this.isActiveAppointment(appointment) && appointment.date >= today;
    },
    
    // ============ MÉTODOS DE DATOS ============
    async fetchAppointments() {
      try {
        this.loading = true;
        console.log('📥 Cargando citas del usuario...');
        
        const response = await api.get("/appointments/user/me");
        
        if (response.data && response.data.appointments) {
          this.appointments = response.data.appointments;
          console.log(`✅ ${this.appointments.length} citas cargadas`);
        } else {
          this.appointments = response.data || [];
          console.log(`✅ ${this.appointments.length} citas cargadas (formato alternativo)`);
        }

        this.syncAppointmentNotifications();
        
      } catch (err) {
        console.error("❌ Error cargando citas:", err);
        
        if (err.response?.status === 401) {
          this.userStore.logout();
          this.$router.push('/login');
        }
      } finally {
        this.loading = false;
      }
    },
    
    async loadUserPets() {
      try {
        this.pets = await this.userStore.fetchUserPets();
        console.log(`✅ ${this.pets.length} mascotas cargadas`);
      } catch (err) {
        console.error("❌ Error cargando mascotas:", err);
        this.pets = [];
      }
    },
    
    applyFilters() {
      // El filtro se aplica automáticamente por computed property
      console.log(`🔍 Filtrando por mascota: ${this.selectedPet || 'Todas'}`);
    },
    
    // ============ MODALES ============
    viewDetails(appointment) {
      this.selectedAppointment = appointment;
      this.showDetailsModal = true;
    },
    
    closeDetailsModal() {
      this.showDetailsModal = false;
      this.selectedAppointment = null;
    },
    
    openRescheduleModal(appointment) {
      this.selectedAppointment = appointment;
      this.rescheduleData = {
        date: appointment.date,
        time: appointment.time,
        reason: ""
      };
      this.showRescheduleModal = true;
    },
    
    closeRescheduleModal() {
      this.showRescheduleModal = false;
      this.selectedAppointment = null;
      this.rescheduleData = {
        date: "",
        time: "",
        reason: ""
      };
      this.processing = false;
    },
    
    openCancelModal(appointment) {
      this.selectedAppointment = appointment;
      this.cancelReason = "";
      this.showCancelModal = true;
    },
    
    closeCancelModal() {
      this.showCancelModal = false;
      this.selectedAppointment = null;
      this.cancelReason = "";
      this.processing = false;
    },
    
    // ============ ACCIONES ============
    async confirmReschedule() {
      if (!this.isRescheduleValid) {
        alert("⚠️ Por favor, selecciona una fecha y hora válidas");
        return;
      }
      
      try {
        this.processing = true;
        
        const rescheduleData = {
          date: this.rescheduleData.date,
          time: this.rescheduleData.time,
          reason: this.rescheduleData.reason
        };
        
        console.log('🔄 Reprogramando cita:', {
          appointmentId: this.selectedAppointment._id,
          data: rescheduleData
        });
        
        const response = await api.patch(
          `/appointments/${this.selectedAppointment._id}/reschedule`,
          rescheduleData
        );
        
        console.log('✅ Cita reprogramada:', response.data);
        
        // Mostrar mensaje de éxito
        alert(`✅ Cita reprogramada exitosamente!\n\nNueva fecha: ${this.formatDate(this.rescheduleData.date)}\nNueva hora: ${this.formatTime(this.rescheduleData.time)}`);
        
        // Cerrar modal y actualizar lista
        this.closeRescheduleModal();
        await this.fetchAppointments();
        
      } catch (err) {
        console.error("❌ Error reprogramando la cita:", err);
        
        let errorMessage = "❌ Error al reprogramar la cita. Por favor, intenta de nuevo.";
        
        if (err.response?.status === 401) {
          errorMessage = "⚠️ Tu sesión ha expirado. Por favor, inicia sesión nuevamente.";
          this.userStore.logout();
          this.$router.push('/login');
          return;
        }
        
        if (err.response?.data?.message) {
          errorMessage = `❌ ${err.response.data.message}`;
        }
        
        alert(errorMessage);
      } finally {
        this.processing = false;
      }
    },
    
    async confirmCancel() {
      if (!confirm("¿Estás seguro de que quieres cancelar esta cita? Esta acción no se puede deshacer.")) {
        return;
      }
      
      try {
        this.processing = true;
        
        console.log('❌ Cancelando cita:', this.selectedAppointment._id);
        
        const response = await api.patch(
          `/appointments/${this.selectedAppointment._id}/cancel`,
          { reason: this.cancelReason }
        );
        
        console.log('✅ Cita cancelada:', response.data);
        
        // Mostrar mensaje de éxito
        alert(`✅ Cita cancelada exitosamente.\n\nSe ha enviado una notificación al proveedor.`);
        
        // Cerrar modal y actualizar lista
        this.closeCancelModal();
        await this.fetchAppointments();
        
      } catch (err) {
        console.error("❌ Error cancelando la cita:", err);
        
        let errorMessage = "❌ Error al cancelar la cita. Por favor, intenta de nuevo.";
        
        if (err.response?.status === 401) {
          errorMessage = "⚠️ Tu sesión ha expirado. Por favor, inicia sesión nuevamente.";
          this.userStore.logout();
          this.$router.push('/login');
          return;
        }
        
        if (err.response?.data?.message) {
          errorMessage = `❌ ${err.response.data.message}`;
        }
        
        alert(errorMessage);
      } finally {
        this.processing = false;
      }
    },
    
    goToCommerces() {
      this.$router.push('/commerces');
    },
    
    showTemporaryMessage(message, type = 'success') {
      console.log(`${type.toUpperCase()}: ${message}`);
      
      if (type === 'success') {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'fixed top-4 right-4 bg-emerald-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
        alertDiv.textContent = message;
        document.body.appendChild(alertDiv);
        
        setTimeout(() => {
          document.body.removeChild(alertDiv);
        }, 3000);
      }
    }
  }
};
</script>

<style scoped>
/* Reutiliza los mismos estilos que UserCommerces.vue */
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
  border-radius: 20px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.card-modern:hover {
  border-color: #10b981;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.1),
    0 0 0 1px #10b981,
    0 0 20px rgba(16, 185, 129, 0.1);
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
  color: #10b981;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-weight: 600;
  font-size: 0.75rem;
  border: 1px solid #10b981;
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

.btn-primary {
  background: linear-gradient(135deg, #10b981, #0d9488);
  color: white;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  transition: all 0.3s ease;
  box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
  cursor: pointer;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 
    0 15px 35px rgba(16, 185, 129, 0.4),
    0 0 0 2px rgba(255, 255, 255, 0.2);
  background: linear-gradient(135deg, #0d9488, #10b981);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-modern-outline {
  background: transparent;
  color: #10b981;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  border: 2px solid #10b981;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-modern-outline:hover {
  background: rgba(16, 185, 129, 0.1);
  transform: translateX(4px);
}

.btn-modern-sm {
  background: linear-gradient(135deg, #10b981, #0d9488);
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
  box-shadow: 0 5px 15px rgba(16, 185, 129, 0.3);
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

.modal-modern-box {
  background: white;
  border-radius: 24px;
  padding: 2rem;
  border: 1px solid #e5e7eb;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px #10b981,
    0 0 40px rgba(16, 185, 129, 0.1);
  position: relative;
  overflow: hidden;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  max-width: 100%;
  width: 100%;
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

.modal-modern-header {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.avatar-modern-lg {
  flex-shrink: 0;
}

.btn-modal-close {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f3f4f6;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-modal-close:hover {
  background: #e5e7eb;
  transform: rotate(90deg);
}

.modal-section {
  margin-bottom: 2rem;
}

.modal-section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.modal-modern-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  align-items: center;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
  flex-wrap: wrap;
}

.btn-modal-primary {
  background: linear-gradient(135deg, #10b981, #059669);
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
  box-shadow: 0 10px 20px rgba(16, 185, 129, 0.3);
}

.btn-modal-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-modal-outline {
  background: transparent;
  color: #10b981;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border: 2px solid #10b981;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-modal-outline:hover:not(:disabled) {
  background: rgba(16, 185, 129, 0.1);
  transform: translateY(-2px);
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
  border-color: #10b981;
}

.animate-pulse {
  animation: pulse 2s ease-in-out infinite;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .grid.grid-cols-1.md\:grid-cols-2.lg\:grid-cols-3 {
    grid-template-columns: 1fr;
  }
  
  .modal-modern-box {
    padding: 1rem;
    max-height: 80vh;
  }
  
  .modal-modern-actions {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .btn-modal-primary,
  .btn-modal-outline,
  .btn-modal-ghost {
    width: 100%;
    justify-content: center;
  }
  
  .text-5xl {
    font-size: 2.5rem;
  }
  
  .text-6xl {
    font-size: 3rem;
  }
}
</style>