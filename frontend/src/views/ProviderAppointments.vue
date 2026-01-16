<template>
  <ProviderLayout>
    <!-- Chatbot Component -->
    <Chatbot />
    
    <!-- Hero Section -->
    <section class="relative bg-gradient-to-br from-emerald-50 to-teal-50 overflow-hidden mt-8">
      <div class="absolute inset-0 opacity-5">
        <div class="absolute top-10 left-10 w-32 h-32 rounded-full bg-emerald-300"></div>
        <div class="absolute bottom-10 right-10 w-48 h-48 rounded-full bg-teal-300"></div>
        <div class="absolute top-1/2 left-1/4 w-16 h-16 rounded-full bg-emerald-400"></div>
      </div>

      <div class="relative container mx-auto px-4 py-20 md:py-32">
        <div class="text-center max-w-4xl mx-auto fade-up">
          <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-lg mb-8">
            <span class="text-4xl">📋</span>
          </div>
          <h1 class="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Gestión de Citas
          </h1>
          <p class="text-xl text-gray-700 mb-10 max-w-3xl mx-auto">
            Administra y gestiona todas las citas de tus servicios
          </p>
        </div>
      </div>
    </section>

    <!-- Contenido principal -->
    <section class="py-16 bg-white">
      <div class="container mx-auto px-4">
        <!-- Barra de herramientas -->
        <div class="mb-12 card-modern p-6">
          <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <!-- Búsqueda -->
            <div class="relative w-full lg:w-96">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span class="text-emerald-600">🔍</span>
              </div>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Buscar por cliente, mascota, servicio..."
                class="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-white"
              />
            </div>
            
            <!-- Botón nueva cita -->
            
          </div>
        </div>

        <!-- Estadísticas -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div class="card-modern p-4 text-center">
            <div class="text-2xl font-bold text-emerald-600">{{ appointments.length }}</div>
            <div class="text-sm text-gray-600">Total Citas</div>
          </div>
          <div class="card-modern p-4 text-center">
            <div class="text-2xl font-bold text-green-600">{{ confirmedCount }}</div>
            <div class="text-sm text-gray-600">Confirmadas</div>
          </div>
          <div class="card-modern p-4 text-center">
            <div class="text-2xl font-bold text-amber-600">{{ pendingCount }}</div>
            <div class="text-sm text-gray-600">Pendientes</div>
          </div>
          <div class="card-modern p-4 text-center">
            <div class="text-2xl font-bold text-rose-600">{{ cancelledCount }}</div>
            <div class="text-sm text-gray-600">Canceladas</div>
          </div>
        </div>

        <!-- Tabla de citas -->
        <div class="card-modern overflow-hidden">
          <!-- Header de la tabla -->
          <div class="bg-gradient-to-r from-emerald-600 to-teal-500 text-white px-6 py-4">
            <div class="grid grid-cols-12 gap-4">
              <div class="col-span-3">
                <div class="text-sm font-semibold uppercase tracking-wider">Cliente</div>
              </div>
              <div class="col-span-3">
                <div class="text-sm font-semibold uppercase tracking-wider">Mascota & Servicio</div>
              </div>
              <div class="col-span-2">
                <div class="text-sm font-semibold uppercase tracking-wider">Fecha y Hora</div>
              </div>
              <div class="col-span-2">
                <div class="text-sm font-semibold uppercase tracking-wider">Estado</div>
              </div>
              <div class="col-span-2">
                <div class="text-sm font-semibold uppercase tracking-wider">Acciones</div>
              </div>
            </div>
          </div>

          <!-- Cuerpo de la tabla -->
          <div v-if="loading" class="p-8 text-center">
            <div class="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200">
              <span class="text-2xl text-emerald-600 animate-pulse">📅</span>
            </div>
            <p class="text-gray-700">Cargando citas...</p>
          </div>

          <div v-else-if="errorMessage" class="p-8 text-center">
            <div class="w-16 h-16 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-200">
              <span class="text-2xl text-rose-600">⚠️</span>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Error al cargar citas</h3>
            <p class="text-gray-600 mb-4">{{ errorMessage }}</p>
            <button
              @click="retryLoad"
              class="btn-primary"
            >
              Reintentar
            </button>
          </div>

          <div v-else-if="filteredAppointments.length === 0" class="p-8 text-center">
            <div class="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-300">
              <span class="text-2xl text-gray-400">📅</span>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">No se encontraron citas</h3>
            <p class="text-gray-600">Intenta con otros términos de búsqueda o crea una nueva cita</p>
          </div>

          <div v-else class="divide-y divide-gray-200">
            <div 
              v-for="appt in filteredAppointments"
              :key="appt._id"
              class="px-6 py-4 hover:bg-gray-50 transition-colors duration-200 group"
            >
              <div class="grid grid-cols-12 gap-4 items-center">
                <!-- Información del cliente -->
                <div class="col-span-3">
                  <div class="flex items-center">
                    <div class="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                      <span class="text-emerald-600 font-semibold text-sm">
                        {{ getInitials(appt.userId?.name, appt.userId?.lastname) }}
                      </span>
                    </div>
                    <div>
                      <div class="font-semibold text-gray-900">
                        {{ appt.userId?.name }} {{ appt.userId?.lastname }}
                      </div>
                      <div class="text-sm text-gray-600">{{ appt.userId?.email }}</div>
                      <div v-if="appt.userId?.phone" class="text-xs text-gray-500">{{ appt.userId?.phone }}</div>
                    </div>
                  </div>
                </div>

                <!-- Mascota y servicio -->
                <div class="col-span-3">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                      <span class="text-emerald-600 text-sm">{{ getPetIcon(appt.petId?.type) }}</span>
                    </div>
                    <div>
                      <div class="text-sm font-medium text-gray-900">
                        <span class="font-semibold">{{ appt.petId?.name }}</span>
                        <span class="text-gray-500 text-xs ml-2 capitalize">({{ appt.petId?.type }})</span>
                      </div>
                      <div class="text-sm text-gray-600">{{ appt.serviceId?.name || appt.serviceName }}</div>
                      <div class="text-xs text-emerald-600 font-medium">${{ appt.servicePrice || appt.serviceId?.price || '0' }}</div>
                    </div>
                  </div>
                </div>

                <!-- Fecha y hora -->
                <div class="col-span-2">
                  <div class="text-sm font-medium text-gray-900">{{ formatDate(appt.date) }}</div>
                  <div class="text-sm text-gray-600">{{ appt.time }}</div>
                </div>

                <!-- Estado -->
                <div class="col-span-2">
                  <span
                    :class="statusClass(appt.status)"
                    class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize"
                  >
                    <span 
                      class="w-2 h-2 rounded-full mr-2"
                      :class="{
                        'bg-amber-500': appt.status === 'pending' || appt.status === 'pendiente',
                        'bg-green-500': appt.status === 'confirmed' || appt.status === 'confirmada',
                        'bg-rose-500': appt.status === 'cancelled' || appt.status === 'cancelada',
                        'bg-blue-500': appt.status === 'completed' || appt.status === 'completada',
                        'bg-purple-500': appt.status === 'rescheduled' || appt.status === 'reprogramada'
                      }"
                    ></span>
                    {{ translateStatus(appt.status) }}
                  </span>
                </div>

                <!-- Acciones -->
                <div class="col-span-2">
                  <div class="flex flex-wrap gap-2">
                    <!-- Botón Detalles con clase personalizada -->
                    <button
                      @click="viewAppointmentDetails(appt)"
                      class="btn-details"
                    >
                      👁️ Detalles
                    </button>
                    <div v-if="canChangeStatus(appt.status)" class="flex flex-wrap gap-2 mt-2">
                      <!-- Botón Confirmar con clase personalizada -->
                      <button
                        v-if="canChangeStatus(appt.status, 'confirmada')"
                        @click="changeStatus(appt, 'confirmada')"
                        class="btn-confirm"
                      >
                        ✅ Confirmar
                      </button>
                      <!-- Botón Completar con clase personalizada -->
                      <button
                        v-if="canChangeStatus(appt.status, 'completada')"
                        @click="changeStatus(appt, 'completada')"
                        class="btn-complete"
                      >
                        ✓ Completar
                      </button>
                      <!-- Botón Cancelar con clase personalizada -->
                      <button
                        v-if="canChangeStatus(appt.status, 'cancelada')"
                        @click="changeStatus(appt, 'cancelada')"
                        class="btn-cancel"
                      >
                        ❌ Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Modal de Detalles -->
    <div v-if="showDetailsModal && selectedAppointment" class="modal-overlay" @click.self="closeDetailsModal">
      <div class="modal-modern-box max-w-4xl" @click.stop>
        <div class="modal-modern-header flex justify-between items-start">
          <div class="flex items-start gap-4">
            <div class="avatar-modern-lg">
              <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center">
                <span class="text-4xl">📋</span>
              </div>
            </div>
            <div>
              <h2 class="text-3xl font-bold text-gray-900">Detalles de la Cita</h2>
              <div class="flex items-center gap-2 mt-2 flex-wrap">
                <div :class="[
                  'px-3 py-1 rounded-full text-sm font-bold',
                  statusClass(selectedAppointment.status)
                ]">
                  {{ translateStatus(selectedAppointment.status) }}
                </div>
                <div class="badge-outline">
                  📅 {{ formatDate(selectedAppointment.date) }}
                </div>
                <div class="badge-outline">
                  ⏰ {{ selectedAppointment.time }}
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
            <!-- Columna izquierda: Cliente y Mascota -->
            <div>
              <!-- Información del cliente -->
              <div class="modal-section">
                <h3 class="modal-section-title">
                  <span>👤</span> Información del Cliente
                </h3>
                <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div class="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center">
                    <span class="text-white text-2xl">
                      {{ getInitials(selectedAppointment.userId?.name, selectedAppointment.userId?.lastname) }}
                    </span>
                  </div>
                  <div>
                    <p class="font-bold text-gray-900 text-lg">
                      {{ selectedAppointment.userId?.name }} {{ selectedAppointment.userId?.lastname }}
                    </p>
                    <div class="space-y-1 mt-2">
                      <p class="text-sm text-gray-600 flex items-center gap-2">
                        <span>📧</span> {{ selectedAppointment.userId?.email }}
                      </p>
                      <p v-if="selectedAppointment.userId?.phone" class="text-sm text-gray-600 flex items-center gap-2">
                        <span>📱</span> {{ selectedAppointment.userId?.phone }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Información de la mascota -->
              <div class="modal-section">
                <h3 class="modal-section-title">
                  <span>🐾</span> Información de la Mascota
                </h3>
                <div class="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
                  <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center">
                      <span class="text-white text-xl">{{ getPetIcon(selectedAppointment.petId?.type) }}</span>
                    </div>
                    <div>
                      <p class="font-bold text-gray-900">{{ selectedAppointment.petId?.name }}</p>
                      <div class="flex flex-wrap gap-2 mt-1">
                        <span class="badge-tag capitalize">{{ selectedAppointment.petId?.type }}</span>
                        <span v-if="selectedAppointment.petId?.breed" class="badge-tag">
                          {{ selectedAppointment.petId?.breed }}
                        </span>
                        <span v-if="selectedAppointment.petId?.age" class="badge-tag">
                          {{ selectedAppointment.petId?.age }} años
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Información del negocio -->
              <div v-if="selectedAppointment.businessName" class="modal-section">
                <h3 class="modal-section-title">
                  <span>🏬</span> Información del Negocio
                </h3>
                <div class="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                  <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-400 flex items-center justify-center">
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
            </div>

            <!-- Columna derecha: Servicio y Cita -->
            <div>
              <!-- Información del servicio -->
              <div class="modal-section">
                <h3 class="modal-section-title">
                  <span>⚙️</span> Información del Servicio
                </h3>
                <div class="border border-gray-200 rounded-xl p-4">
                  <div class="flex justify-between items-center mb-2">
                    <h4 class="font-bold text-gray-900">{{ selectedAppointment.serviceId?.name || selectedAppointment.serviceName }}</h4>
                    <span class="text-xl font-bold text-emerald-600">
                      ${{ selectedAppointment.servicePrice || selectedAppointment.serviceId?.price || '0' }}
                    </span>
                  </div>
                  <p class="text-sm text-gray-600 mb-2">
                    {{ selectedAppointment.serviceId?.description || 'Sin descripción disponible' }}
                  </p>
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-500">
                      Duración: {{ selectedAppointment.serviceDuration || selectedAppointment.serviceId?.duration || 60 }} min
                    </span>
                    <span v-if="selectedAppointment.providerId?.name" class="text-sm text-gray-500">
                      Proveedor: {{ selectedAppointment.providerId.name }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Detalles de la cita -->
              <div class="modal-section">
                <h3 class="modal-section-title">
                  <span>📋</span> Detalles de la Cita
                </h3>
                <div class="space-y-3">
                  <div class="flex justify-between items-center">
                    <span class="font-medium text-gray-900">Fecha:</span>
                    <span class="font-bold">{{ formatDate(selectedAppointment.date) }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="font-medium text-gray-900">Hora:</span>
                    <span class="font-bold">{{ selectedAppointment.time }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="font-medium text-gray-900">Estado:</span>
                    <span :class="[
                      'px-3 py-1 rounded-full text-sm font-bold',
                      statusClass(selectedAppointment.status)
                    ]">
                      {{ translateStatus(selectedAppointment.status) }}
                    </span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="font-medium text-gray-900">Creada:</span>
                    <span class="text-sm text-gray-600">{{ formatDateTime(selectedAppointment.createdAt) }}</span>
                  </div>
                  <div v-if="selectedAppointment.updatedAt" class="flex justify-between items-center">
                    <span class="font-medium text-gray-900">Actualizada:</span>
                    <span class="text-sm text-gray-600">{{ formatDateTime(selectedAppointment.updatedAt) }}</span>
                  </div>
                  <div v-if="selectedAppointment.cancelledAt" class="flex justify-between items-center">
                    <span class="font-medium text-gray-900">Cancelada:</span>
                    <span class="text-sm text-gray-600">{{ formatDateTime(selectedAppointment.cancelledAt) }}</span>
                  </div>
                  <div v-if="selectedAppointment.completedAt" class="flex justify-between items-center">
                    <span class="font-medium text-gray-900">Completada:</span>
                    <span class="text-sm text-gray-600">{{ formatDateTime(selectedAppointment.completedAt) }}</span>
                  </div>
                </div>
              </div>

              <!-- Notas -->
              <div class="modal-section">
                <h3 class="modal-section-title">
                  <span>📝</span> Notas
                </h3>
                <div :class="[
                  'rounded-xl p-4 border',
                  selectedAppointment.notes ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200'
                ]">
                  <p class="text-gray-700">{{ selectedAppointment.notes || 'Sin notas adicionales' }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-modern-actions">
          <button @click="closeDetailsModal" class="btn-modal-ghost">
            Cerrar
          </button>
          <div class="flex gap-2">
            <button 
              v-if="canChangeStatus(selectedAppointment.status, 'confirmada')"
              @click="changeStatus(selectedAppointment, 'confirmada')"
              class="btn-modal-confirm"
            >
              ✅ Confirmar
            </button>
            <button 
              v-if="canChangeStatus(selectedAppointment.status, 'completada')"
              @click="changeStatus(selectedAppointment, 'completada')"
              class="btn-modal-complete"
            >
              ✓ Completar
            </button>
            <button 
              v-if="canChangeStatus(selectedAppointment.status, 'cancelada')"
              @click="changeStatus(selectedAppointment, 'cancelada')"
              class="btn-modal-cancel"
            >
              ❌ Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para crear nueva cita -->
    <div v-if="showCreateModal" class="modal-overlay" @click.self="closeCreateModal">
      <div class="modal-modern-box max-w-lg" @click.stop>
        <div class="modal-modern-header flex justify-between items-start">
          <div class="flex items-start gap-4">
            <div class="avatar-modern-lg">
              <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center">
                <span class="text-3xl">📅</span>
              </div>
            </div>
            <div>
              <h2 class="text-2xl font-bold text-gray-900">Nueva Cita</h2>
              <p class="text-gray-600 mt-1">Programa una nueva cita para un cliente</p>
            </div>
          </div>
          <button @click="closeCreateModal" class="btn-modal-close">
            ✕
          </button>
        </div>

        <div class="modal-modern-content mt-6">
          <form @submit.prevent="createAppointment" class="space-y-4">
            <!-- ID del Cliente -->
            <div>
              <label class="block mb-2 font-medium text-gray-900">
                <span class="text-emerald-600">👤</span> ID del Cliente:
              </label>
              <input
                v-model="newAppointment.userId"
                type="text"
                placeholder="Ej: 60d21b4667d0d8992e610c85"
                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                required
              />
              <p class="text-xs text-gray-500 mt-1">ID del usuario/cliente en la base de datos</p>
            </div>

            <!-- ID de la Mascota -->
            <div>
              <label class="block mb-2 font-medium text-gray-900">
                <span class="text-emerald-600">🐾</span> ID de la Mascota:
              </label>
              <input
                v-model="newAppointment.petId"
                type="text"
                placeholder="Ej: 60d21b4667d0d8992e610c86"
                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                required
              />
              <p class="text-xs text-gray-500 mt-1">ID de la mascota en la base de datos</p>
            </div>

            <!-- ID del Servicio -->
            <div>
              <label class="block mb-2 font-medium text-gray-900">
                <span class="text-emerald-600">⚙️</span> ID del Servicio:
              </label>
              <input
                v-model="newAppointment.serviceId"
                type="text"
                placeholder="Ej: 60d21b4667d0d8992e610c87"
                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                required
              />
              <p class="text-xs text-gray-500 mt-1">ID del servicio en la base de datos</p>
            </div>

            <!-- Fecha -->
            <div>
              <label class="block mb-2 font-medium text-gray-900">
                <span class="text-emerald-600">📅</span> Fecha:
              </label>
              <input
                v-model="newAppointment.date"
                type="date"
                :min="minDate"
                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                required
              />
            </div>

            <!-- Hora -->
            <div>
              <label class="block mb-2 font-medium text-gray-900">
                <span class="text-emerald-600">⏰</span> Hora:
              </label>
              <select
                v-model="newAppointment.time"
                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                required
              >
                <option value="">Selecciona una hora</option>
                <option v-for="hour in availableHours" :key="hour" :value="hour">
                  {{ hour }}
                </option>
              </select>
            </div>

            <!-- Notas (opcional) -->
            <div>
              <label class="block mb-2 font-medium text-gray-900">
                <span class="text-emerald-600">📝</span> Notas (opcional):
              </label>
              <textarea
                v-model="newAppointment.notes"
                rows="3"
                placeholder="Notas adicionales para la cita..."
                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 resize-none"
              ></textarea>
            </div>
          </form>
        </div>

        <div class="modal-modern-actions">
          <button @click="closeCreateModal" class="btn-modal-ghost">
            Cancelar
          </button>
          <button 
            @click="createAppointment"
            class="btn-modal-primary"
            :disabled="!isCreateFormValid || processing"
          >
            <span v-if="!processing">
              <span class="mr-2">✅</span> Crear Cita
            </span>
            <span v-else class="flex items-center gap-2">
              <span class="animate-spin">⟳</span>
              Creando...
            </span>
          </button>
        </div>
      </div>
    </div>
  </ProviderLayout>
</template>

<script>
import api from "@/api/api";
import ProviderLayout from "@/components/ProviderLayout.vue";
import Chatbot from "@/components/Chatbot.vue";

export default {
  name: "ProviderAppointments",
  components: { ProviderLayout, Chatbot },

  data() {
    return {
      appointments: [],
      loading: false,
      processing: false,
      searchQuery: "",
      errorMessage: "",
      
      // Modales
      showDetailsModal: false,
      showCreateModal: false,
      selectedAppointment: null,
      
      // Datos para nueva cita
      newAppointment: {
        userId: "",
        petId: "",
        serviceId: "",
        date: "",
        time: "",
        notes: ""
      },
      
      // Horas disponibles
      availableHours: [
        "08:00", "09:00", "10:00", "11:00", "12:00", 
        "13:00", "14:00", "15:00", "16:00", "17:00", 
        "18:00", "19:00"
      ]
    };
  },

  computed: {
    filteredAppointments() {
      if (!this.searchQuery) return this.appointments;
      const query = this.searchQuery.toLowerCase();
      return this.appointments.filter(appt => {
        const clientName = `${appt.userId?.name || ''} ${appt.userId?.lastname || ''}`.toLowerCase();
        const petName = appt.petId?.name?.toLowerCase() || '';
        const serviceName = appt.serviceId?.name?.toLowerCase() || appt.serviceName?.toLowerCase() || '';
        const clientEmail = appt.userId?.email?.toLowerCase() || '';
        
        return clientName.includes(query) ||
               petName.includes(query) ||
               serviceName.includes(query) ||
               clientEmail.includes(query);
      });
    },
    
    confirmedCount() {
      return this.appointments.filter(appt => 
        appt.status === 'confirmed' || appt.status === 'confirmada'
      ).length;
    },
    
    pendingCount() {
      return this.appointments.filter(appt => 
        appt.status === 'pending' || appt.status === 'pendiente'
      ).length;
    },
    
    cancelledCount() {
      return this.appointments.filter(appt => 
        appt.status === 'cancelled' || appt.status === 'cancelada'
      ).length;
    },
    
    completedCount() {
      return this.appointments.filter(appt => 
        appt.status === 'completed' || appt.status === 'completada'
      ).length;
    },
    
    isCreateFormValid() {
      return this.newAppointment.userId &&
             this.newAppointment.petId &&
             this.newAppointment.serviceId &&
             this.newAppointment.date &&
             this.newAppointment.time;
    },
    
    minDate() {
      const today = new Date();
      return today.toISOString().split('T')[0];
    }
  },

  async created() {
    await this.loadAppointments();
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
    
    statusClass(status) {
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
    
    canChangeStatus(currentStatus, newStatus = null) {
      const validTransitions = {
        'pendiente': ['confirmada', 'cancelada'],
        'confirmada': ['completada', 'cancelada', 'reprogramada'],
        'reprogramada': ['confirmada', 'cancelada', 'completada'],
        'completada': [],
        'cancelada': []
      };
      
      const current = this.translateStatus(currentStatus).toLowerCase();
      
      // Si no se especifica newStatus, solo verifica si el estado actual puede cambiar
      if (!newStatus) {
        return validTransitions[current]?.length > 0 || false;
      }
      
      // Si se especifica newStatus, verifica la transición específica
      return validTransitions[current]?.includes(newStatus) || false;
    },
    
    formatDate(dateString) {
      if (!dateString) return 'Fecha no disponible';
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Fecha inválida';
        return date.toLocaleDateString('es-ES', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      } catch (error) {
        console.error("Error formateando fecha:", error, dateString);
        return 'Fecha inválida';
      }
    },
    
    formatDateTime(dateTimeString) {
      if (!dateTimeString) return 'Fecha no disponible';
      try {
        const date = new Date(dateTimeString);
        if (isNaN(date.getTime())) return 'Fecha inválida';
        return date.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (error) {
        console.error("Error formateando fecha/hora:", error, dateTimeString);
        return 'Fecha inválida';
      }
    },
    
    getInitials(name, lastname) {
      const first = name?.charAt(0) || '';
      const last = lastname?.charAt(0) || '';
      return `${first}${last}`.toUpperCase() || '??';
    },
    
    retryLoad() {
      this.errorMessage = "";
      this.loadAppointments();
    },
    
    // ============ MÉTODOS DE DATOS ============
    async loadAppointments() {
      try {
        this.loading = true;
        this.errorMessage = "";
        console.log('📥 Cargando citas del proveedor...');
        
        // Intenta cargar datos reales
        const response = await api.get("/provider/appointments");
        
        console.log('📊 Respuesta del servidor:', response);
        
        if (response.data && Array.isArray(response.data)) {
          this.appointments = response.data;
          console.log(`✅ ${this.appointments.length} citas cargadas exitosamente`);
        } else if (response.data?.appointments) {
          this.appointments = response.data.appointments;
          console.log(`✅ ${this.appointments.length} citas cargadas exitosamente`);
        } else if (response.data?.success && response.data.appointments) {
          this.appointments = response.data.appointments;
          console.log(`✅ ${this.appointments.length} citas cargadas exitosamente`);
        } else {
          console.warn('⚠️ Formato de respuesta inesperado:', response.data);
          this.appointments = response.data || [];
          console.log(`⚠️ ${this.appointments.length} citas cargadas (formato alternativo)`);
        }
        
      } catch (err) {
        console.error("❌ Error cargando citas:", err);
        
        // Analizar el error específico
        if (err.response?.status === 500) {
          this.errorMessage = "Error interno del servidor. El backend puede tener problemas.";
          console.error("🔍 Detalles del error 500:", err.response?.data);
        } else if (err.response?.status === 401) {
          this.errorMessage = "Sesión expirada. Por favor, inicia sesión nuevamente.";
          this.$router.push('/login');
          return;
        } else if (err.response?.status === 403) {
          this.errorMessage = "No tienes permisos para ver citas de proveedor.";
        } else if (err.response?.status === 404) {
          this.errorMessage = "Ruta no encontrada. Verifica la configuración del backend.";
          console.log('⚠️ Ruta /provider/appointments no implementada, usando datos de ejemplo');
          this.appointments = this.getMockAppointments();
          return;
        } else if (err.code === 'ERR_NETWORK') {
          this.errorMessage = "Error de conexión. Verifica tu conexión a internet.";
        } else {
          this.errorMessage = `Error al cargar citas: ${err.message || 'Error desconocido'}`;
        }
        
        this.showTemporaryMessage(this.errorMessage, 'error');
        
      } finally {
        this.loading = false;
      }
    },
    
    // Método temporal para datos de ejemplo
    getMockAppointments() {
      console.log('📋 Generando datos de ejemplo...');
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      return [
        {
          _id: "mock_1",
          userId: {
            _id: "user_1",
            name: "Ana",
            lastname: "García",
            email: "ana.garcia@email.com",
            phone: "555-123-4567"
          },
          petId: {
            _id: "pet_1",
            name: "Max",
            type: "perro",
            breed: "Labrador",
            age: 3
          },
          serviceId: {
            _id: "service_1",
            name: "Baño completo",
            description: "Baño con shampoo especial para perros",
            price: 45,
            duration: 60
          },
          serviceName: "Baño completo",
          servicePrice: 45,
          serviceDuration: 60,
          date: today.toISOString().split('T')[0],
          time: "10:00",
          status: "pendiente",
          notes: "Traer toalla personal",
          createdAt: new Date(today.getTime() - 86400000),
          updatedAt: new Date(today.getTime() - 43200000)
        },
        {
          _id: "mock_2",
          userId: {
            _id: "user_2",
            name: "Carlos",
            lastname: "Rodríguez",
            email: "carlos.rodriguez@email.com",
            phone: "555-987-6543"
          },
          petId: {
            _id: "pet_2",
            name: "Luna",
            type: "gato",
            breed: "Siamés",
            age: 2
          },
          serviceId: {
            _id: "service_2",
            name: "Corte de pelo",
            description: "Corte estilizado para gatos",
            price: 65,
            duration: 90
          },
          serviceName: "Corte de pelo",
          servicePrice: 65,
          serviceDuration: 90,
          date: tomorrow.toISOString().split('T')[0],
          time: "14:00",
          status: "confirmada",
          notes: "Cortar solo las puntas",
          createdAt: new Date(today.getTime() - 172800000),
          updatedAt: new Date(today.getTime() - 86400000)
        },
        {
          _id: "mock_3",
          userId: {
            _id: "user_3",
            name: "María",
            lastname: "López",
            email: "maria.lopez@email.com",
            phone: "555-456-7890"
          },
          petId: {
            _id: "pet_3",
            name: "Rocky",
            type: "perro",
            breed: "Bulldog Francés",
            age: 4
          },
          serviceId: {
            _id: "service_3",
            name: "Consulta veterinaria",
            description: "Revisión general de salud",
            price: 85,
            duration: 45
          },
          serviceName: "Consulta veterinaria",
          servicePrice: 85,
          serviceDuration: 45,
          date: yesterday.toISOString().split('T')[0],
          time: "16:00",
          status: "completada",
          notes: "Vacuna anual aplicada",
          createdAt: new Date(today.getTime() - 259200000),
          updatedAt: new Date(today.getTime() - 86400000),
          completedAt: new Date(today.getTime() - 86400000)
        }
      ];
    },
    
    // ============ MODALES ============
    viewAppointmentDetails(appointment) {
      this.selectedAppointment = appointment;
      this.showDetailsModal = true;
    },
    
    closeDetailsModal() {
      this.showDetailsModal = false;
      this.selectedAppointment = null;
    },
    
    openCreateModal() {
      this.showCreateModal = true;
    },
    
    closeCreateModal() {
      this.showCreateModal = false;
      this.newAppointment = {
        userId: "",
        petId: "",
        serviceId: "",
        date: "",
        time: "",
        notes: ""
      };
      this.processing = false;
    },
    
    // ============ ACCIONES ============
    async changeStatus(appointment, newStatus) {
      if (!confirm(`¿Estás seguro de cambiar el estado a "${this.translateStatus(newStatus)}"?`)) {
        return;
      }
      
      try {
        this.processing = true;
        
        console.log(`🔄 Cambiando estado de cita ${appointment._id} a ${newStatus}`);
        
        // Usar la ruta PUT correcta
        const response = await api.put(
          `/provider/appointments/${appointment._id}`,
          { status: newStatus }
        );
        
        console.log('✅ Estado actualizado:', response.data);
        
        // Actualizar la cita localmente
        const index = this.appointments.findIndex(a => a._id === appointment._id);
        if (index !== -1) {
          this.appointments[index].status = newStatus;
          this.appointments[index].updatedAt = new Date();
          
          // Agregar timestamp según el estado
          if (newStatus === 'cancelada') {
            this.appointments[index].cancelledAt = new Date();
          } else if (newStatus === 'completada') {
            this.appointments[index].completedAt = new Date();
          }
          
          // Si estás en el modal de detalles, actualizar también
          if (this.selectedAppointment && this.selectedAppointment._id === appointment._id) {
            this.selectedAppointment.status = newStatus;
            this.selectedAppointment.updatedAt = new Date();
            if (newStatus === 'cancelada') {
              this.selectedAppointment.cancelledAt = new Date();
            } else if (newStatus === 'completada') {
              this.selectedAppointment.completedAt = new Date();
            }
          }
        }
        
        this.showTemporaryMessage(`✅ Estado cambiado a ${this.translateStatus(newStatus)}`, 'success');
        
      } catch (err) {
        console.error("❌ Error cambiando estado:", err);
        
        let errorMessage = "❌ Error al cambiar el estado. Por favor, intenta de nuevo.";
        
        if (err.response?.data?.message) {
          errorMessage = `❌ ${err.response.data.message}`;
        } else if (err.response?.status === 403) {
          errorMessage = "❌ No tienes permisos para cambiar el estado de esta cita.";
        } else if (err.response?.status === 404) {
          errorMessage = "❌ Cita no encontrada.";
        } else if (err.response?.status === 500) {
          errorMessage = "❌ Error interno del servidor al cambiar el estado.";
        }
        
        this.showTemporaryMessage(errorMessage, 'error');
      } finally {
        this.processing = false;
      }
    },
    
    async createAppointment() {
      try {
        this.processing = true;
        
        console.log('📝 Creando nueva cita:', this.newAppointment);
        
        // Usar la ruta POST correcta
        const response = await api.post(
          "/provider/appointments",
          this.newAppointment
        );
        
        console.log('✅ Cita creada:', response.data);
        
        this.showTemporaryMessage('✅ Cita creada exitosamente', 'success');
        
        // Cerrar modal y actualizar lista
        this.closeCreateModal();
        await this.loadAppointments();
        
      } catch (err) {
        console.error("❌ Error creando cita:", err);
        
        let errorMessage = "❌ Error al crear la cita. Por favor, verifica los datos.";
        
        if (err.response?.data?.message) {
          errorMessage = `❌ ${err.response.data.message}`;
        } else if (err.response?.data?.errors) {
          errorMessage = `❌ ${err.response.data.errors.join(', ')}`;
        } else if (err.response?.status === 403) {
          errorMessage = "❌ No tienes permisos para crear citas.";
        } else if (err.response?.status === 404) {
          errorMessage = "❌ Usuario, mascota o servicio no encontrado.";
        } else if (err.response?.status === 500) {
          errorMessage = "❌ Error interno del servidor al crear la cita.";
        }
        
        this.showTemporaryMessage(errorMessage, 'error');
      } finally {
        this.processing = false;
      }
    },
    
    showTemporaryMessage(message, type = 'success') {
      console.log(`${type.toUpperCase()}: ${message}`);
      
      // Remover alertas anteriores
      const existingAlerts = document.querySelectorAll('.temp-alert');
      existingAlerts.forEach(alert => alert.remove());
      
      const alertDiv = document.createElement('div');
      alertDiv.className = `temp-alert fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300 ${
        type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
      }`;
      alertDiv.textContent = message;
      document.body.appendChild(alertDiv);
      
      setTimeout(() => {
        alertDiv.style.opacity = '0';
        alertDiv.style.transform = 'translateX(100%)';
        setTimeout(() => {
          if (alertDiv.parentNode) {
            document.body.removeChild(alertDiv);
          }
        }, 300);
      }, 3000);
    }
  }
};
</script>

<style scoped>
/* Estilos iguales a UserAppointments.vue */
.fade-up {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-up.show {
  opacity: 1;
  transform: translateY(0);
}

.card-modern {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.card-modern:hover {
  border-color: #10b981;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.1),
    0 0 0 1px #10b981,
    0 0 20px rgba(16, 185, 129, 0.1);
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

/* ============ ESTILOS PARA BOTONES PERSONALIZADOS ============ */
/* Botones de acción en la tabla */
.btn-details {
  display: inline-flex !important;
  align-items: center !important;
  padding: 0.5rem 1rem !important;
  background-color: #10b981 !important;
  color: white !important;
  font-size: 0.875rem !important;
  font-weight: 500 !important;
  border-radius: 0.5rem !important;
  border: none !important;
  cursor: pointer !important;
  transition: all 0.2s !important;
  text-decoration: none !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
}

.btn-details:hover {
  background-color: #059669 !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15) !important;
}

.btn-confirm {
  display: inline-flex !important;
  align-items: center !important;
  padding: 0.25rem 0.75rem !important;
  background-color: #22c55e !important;
  color: white !important;
  font-size: 0.75rem !important;
  font-weight: 500 !important;
  border-radius: 0.5rem !important;
  border: none !important;
  cursor: pointer !important;
  transition: all 0.2s !important;
  text-decoration: none !important;
}

.btn-confirm:hover {
  background-color: #16a34a !important;
}

.btn-complete {
  display: inline-flex !important;
  align-items: center !important;
  padding: 0.25rem 0.75rem !important;
  background-color: #3b82f6 !important;
  color: white !important;
  font-size: 0.75rem !important;
  font-weight: 500 !important;
  border-radius: 0.5rem !important;
  border: none !important;
  cursor: pointer !important;
  transition: all 0.2s !important;
  text-decoration: none !important;
}

.btn-complete:hover {
  background-color: #2563eb !important;
}

.btn-cancel {
  display: inline-flex !important;
  align-items: center !important;
  padding: 0.25rem 0.75rem !important;
  background-color: #f43f5e !important;
  color: white !important;
  font-size: 0.75rem !important;
  font-weight: 500 !important;
  border-radius: 0.5rem !important;
  border: none !important;
  cursor: pointer !important;
  transition: all 0.2s !important;
  text-decoration: none !important;
}

.btn-cancel:hover {
  background-color: #e11d48 !important;
}

/* Botones en el modal */
.btn-modal-confirm {
  display: inline-flex !important;
  align-items: center !important;
  padding: 0.75rem 1.5rem !important;
  background-color: #22c55e !important;
  color: white !important;
  font-weight: 600 !important;
  border-radius: 10px !important;
  border: none !important;
  cursor: pointer !important;
  transition: all 0.3s ease !important;
}

.btn-modal-confirm:hover:not(:disabled) {
  background-color: #16a34a !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 10px 20px rgba(34, 197, 94, 0.3) !important;
}

.btn-modal-complete {
  display: inline-flex !important;
  align-items: center !important;
  padding: 0.75rem 1.5rem !important;
  background-color: #3b82f6 !important;
  color: white !important;
  font-weight: 600 !important;
  border-radius: 10px !important;
  border: none !important;
  cursor: pointer !important;
  transition: all 0.3s ease !important;
}

.btn-modal-complete:hover:not(:disabled) {
  background-color: #2563eb !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 10px 20px rgba(59, 130, 246, 0.3) !important;
}

.btn-modal-cancel {
  display: inline-flex !important;
  align-items: center !important;
  padding: 0.75rem 1.5rem !important;
  background-color: #f43f5e !important;
  color: white !important;
  font-weight: 600 !important;
  border-radius: 10px !important;
  border: none !important;
  cursor: pointer !important;
  transition: all 0.3s ease !important;
}

.btn-modal-cancel:hover:not(:disabled) {
  background-color: #e11d48 !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 10px 20px rgba(244, 63, 94, 0.3) !important;
}

/* ============ FIN ESTILOS BOTONES PERSONALIZADOS ============ */

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
  
  .grid.grid-cols-12 {
    grid-template-columns: 1fr;
  }
  
  .col-span-2,
  .col-span-3 {
    grid-column: span 1;
  }
}
</style> 