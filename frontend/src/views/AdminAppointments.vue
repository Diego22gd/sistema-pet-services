<template>
  <AdminLayout>
    <!-- Chatbot Component -->
    <Chatbot />
    
    <!-- Hero Section -->
    <section class="relative bg-gradient-to-br from-purple-50 to-indigo-50 overflow-hidden">
      <div class="absolute inset-0 opacity-5">
        <div class="absolute top-10 left-10 w-32 h-32 rounded-full bg-purple-300"></div>
        <div class="absolute bottom-10 right-10 w-48 h-48 rounded-full bg-indigo-300"></div>
        <div class="absolute top-1/2 left-1/4 w-16 h-16 rounded-full bg-purple-400"></div>
      </div>

      <div class="relative container mx-auto px-4 py-20 md:py-32">
        <div class="text-center max-w-4xl mx-auto fade-up">
          <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-lg mb-8">
            <span class="text-4xl">👑</span>
          </div>
          <h1 class="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Panel de Administración
          </h1>
          <p class="text-xl text-gray-700 mb-10 max-w-3xl mx-auto">
            Gestiona todas las citas del sistema con control total
          </p>
        </div>
      </div>
    </section>

    <!-- Contenido principal -->
    <section class="py-16 bg-white">
      <div class="container mx-auto px-4">
        <!-- Barra de herramientas del Admin -->
        <div class="mb-12 card-modern p-6">
          <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <!-- Búsqueda -->
            <div class="relative w-full lg:w-96">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span class="text-purple-600">🔍</span>
              </div>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Buscar por cliente, proveedor, servicio..."
                class="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white"
              />
            </div>
            
            <!-- Filtros del admin -->
            <div class="flex flex-wrap gap-3">
              <!-- Filtro por estado -->
              <select 
                v-model="filterStatus" 
                class="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
              >
                <option value="">Todos los estados</option>
                <option value="pendiente">Pendientes</option>
                <option value="confirmada">Confirmadas</option>
                <option value="completada">Completadas</option>
                <option value="cancelada">Canceladas</option>
                <option value="reprogramada">Reprogramadas</option>
              </select>
              
              <!-- Filtro por proveedor -->
              <select 
                v-model="filterProvider" 
                class="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white min-w-[180px]"
              >
                <option value="">Todos los proveedores</option>
                <option v-for="provider in formData.providers" :key="provider._id" :value="provider._id">
                  {{ provider.name }}
                </option>
              </select>
              
              <!-- Botón nueva cita -->
              <button
                @click="openCreateModal"
                class="btn-primary-purple flex items-center gap-2"
              >
                <span class="text-lg">+</span>
                Nueva Cita
              </button>
            </div>
          </div>
        </div>

        <!-- Estadísticas del Admin -->
        <div class="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <div class="card-modern p-4 text-center">
            <div class="text-2xl font-bold text-purple-600">{{ totalAppointments }}</div>
            <div class="text-sm text-gray-600">Total Citas</div>
          </div>
          <div class="card-modern p-4 text-center">
            <div class="text-2xl font-bold text-green-600">{{ appointmentsByStatus.confirmada || 0 }}</div>
            <div class="text-sm text-gray-600">Confirmadas</div>
          </div>
          <div class="card-modern p-4 text-center">
            <div class="text-2xl font-bold text-amber-600">{{ appointmentsByStatus.pendiente || 0 }}</div>
            <div class="text-sm text-gray-600">Pendientes</div>
          </div>
          <div class="card-modern p-4 text-center">
            <div class="text-2xl font-bold text-rose-600">{{ appointmentsByStatus.cancelada || 0 }}</div>
            <div class="text-sm text-gray-600">Canceladas</div>
          </div>
          <div class="card-modern p-4 text-center">
            <div class="text-2xl font-bold text-blue-600">{{ appointmentsByStatus.completada || 0 }}</div>
            <div class="text-sm text-gray-600">Completadas</div>
          </div>
          <div class="card-modern p-4 text-center">
            <div class="text-2xl font-bold text-violet-600">{{ appointmentsByStatus.reprogramada || 0 }}</div>
            <div class="text-sm text-gray-600">Reprogramadas</div>
          </div>
        </div>

        <!-- Tabla de citas del Admin -->
        <div class="card-modern overflow-hidden">
          <!-- Header de la tabla ampliada -->
          <div class="bg-gradient-to-r from-purple-600 to-indigo-500 text-white px-6 py-4">
            <div class="grid grid-cols-12 gap-4">
              <div class="col-span-2">
                <div class="text-sm font-semibold uppercase tracking-wider">Cliente</div>
              </div>
              <div class="col-span-2">
                <div class="text-sm font-semibold uppercase tracking-wider">Proveedor/Negocio</div>
              </div>
              <div class="col-span-1">
                <div class="text-sm font-semibold uppercase tracking-wider">Mascota</div>
              </div>
              <div class="col-span-1">
                <div class="text-sm font-semibold uppercase tracking-wider">Servicio</div>
              </div>
              <div class="col-span-2">
                <div class="text-sm font-semibold uppercase tracking-wider">Fecha y Hora</div>
              </div>
              <div class="col-span-1">
                <div class="text-sm font-semibold uppercase tracking-wider">Estado</div>
              </div>
              <div class="col-span-1">
                <div class="text-sm font-semibold uppercase tracking-wider">Precio</div>
              </div>
              <div class="col-span-2">
                <div class="text-sm font-semibold uppercase tracking-wider">Acciones</div>
              </div>
            </div>
          </div>

          <!-- Cuerpo de la tabla -->
          <div v-if="loading" class="p-8 text-center">
            <div class="w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-200">
              <span class="text-2xl text-purple-600 animate-pulse">👑</span>
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
              class="btn-primary-purple"
            >
              Reintentar
            </button>
          </div>

          <div v-else-if="paginatedAppointments.length === 0" class="p-8 text-center">
            <div class="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-300">
              <span class="text-2xl text-gray-400">📅</span>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">No se encontraron citas</h3>
            <p class="text-gray-600">Intenta con otros filtros o crea una nueva cita</p>
          </div>

          <div v-else class="divide-y divide-gray-200">
            <div 
              v-for="appt in paginatedAppointments"
              :key="appt._id"
              class="px-6 py-4 hover:bg-gray-50 transition-colors duration-200 group"
            >
              <div class="grid grid-cols-12 gap-4 items-center">
                <!-- Información del cliente -->
                <div class="col-span-2">
                  <div class="flex items-center">
                    <div class="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                      <span class="text-purple-600 font-semibold text-sm">
                        {{ getInitials(appt.userId?.name, appt.userId?.lastname) }}
                      </span>
                    </div>
                    <div>
                      <div class="font-semibold text-gray-900 text-sm">
                        {{ appt.userId?.name }} {{ appt.userId?.lastname }}
                      </div>
                      <div class="text-xs text-gray-600 truncate">{{ appt.userId?.email }}</div>
                      <div v-if="appt.userId?.phone" class="text-xs text-gray-500">{{ appt.userId?.phone }}</div>
                    </div>
                  </div>
                </div>

                <!-- Proveedor y Negocio -->
                <div class="col-span-2">
                  <div class="space-y-2">
                    <div v-if="appt.providerId" class="flex items-center gap-2">
                      <div class="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                        <span class="text-white text-xs">👤</span>
                      </div>
                      <div class="text-sm text-gray-900 truncate">{{ appt.providerId?.name }}</div>
                    </div>
                    <div v-if="appt.businessId" class="flex items-center gap-2">
                      <div class="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center">
                        <span class="text-white text-xs">🏬</span>
                      </div>
                      <div class="text-sm text-gray-600 truncate">{{ appt.businessId?.name }}</div>
                    </div>
                  </div>
                </div>

                <!-- Mascota -->
                <div class="col-span-1">
                  <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <span class="text-purple-600 text-sm">{{ getPetIcon(appt.petId?.type) }}</span>
                    </div>
                    <div>
                      <div class="text-sm font-medium text-gray-900">
                        {{ appt.petId?.name }}
                      </div>
                      <div class="text-xs text-gray-500 capitalize">{{ appt.petId?.type }}</div>
                    </div>
                  </div>
                </div>

                <!-- Servicio -->
                <div class="col-span-1">
                  <div class="text-sm font-medium text-gray-900 truncate">
                    {{ appt.serviceId?.name || appt.serviceName }}
                  </div>
                  <div class="text-xs text-gray-500">
                    {{ appt.serviceDuration || appt.serviceId?.duration || '60' }} min
                  </div>
                </div>

                <!-- Fecha y hora -->
                <div class="col-span-2">
                  <div class="text-sm font-medium text-gray-900">{{ formatDate(appt.date) }}</div>
                  <div class="text-sm text-gray-600">{{ appt.time }}</div>
                </div>

                <!-- Estado -->
                <div class="col-span-1">
                  <span
                    :class="statusClass(appt.status)"
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize"
                  >
                    <span 
                      class="w-2 h-2 rounded-full mr-1"
                      :class="{
                        'bg-amber-500': appt.status === 'pendiente',
                        'bg-green-500': appt.status === 'confirmada',
                        'bg-rose-500': appt.status === 'cancelada',
                        'bg-blue-500': appt.status === 'completada',
                        'bg-purple-500': appt.status === 'reprogramada'
                      }"
                    ></span>
                    {{ translateStatus(appt.status) }}
                  </span>
                </div>

                <!-- Precio -->
                <div class="col-span-1">
                  <div class="text-sm font-bold text-gray-900">
                    ${{ appt.servicePrice || appt.serviceId?.price || '0' }}
                  </div>
                </div>

                <!-- Acciones -->
                <div class="col-span-2">
                  <div class="flex flex-wrap gap-2">
                    <!-- Botón Detalles -->
                    <button
                      @click="viewAppointmentDetails(appt)"
                      class="btn-details-admin"
                    >
                      👁️ Detalles
                    </button>
                    
                    <!-- Botones de estado -->
                    <div class="flex gap-1 mt-1">
                      <button
                        v-if="appt.status === 'pendiente'"
                        @click="updateStatus(appt, 'confirmada')"
                        class="btn-confirm-admin"
                        title="Confirmar"
                      >
                        ✅
                      </button>
                      <button
                        v-if="appt.status === 'confirmada'"
                        @click="updateStatus(appt, 'completada')"
                        class="btn-complete-admin"
                        title="Completar"
                      >
                        ✓
                      </button>
                      <button
                        v-if="appt.status === 'pendiente' || appt.status === 'confirmada'"
                        @click="updateStatus(appt, 'cancelada')"
                        class="btn-cancel-admin"
                        title="Cancelar"
                      >
                        ❌
                      </button>
                      <button
                        v-if="appt.status === 'pendiente' || appt.status === 'confirmada'"
                        @click="showRescheduleModal(appt)"
                        class="btn-reschedule-admin"
                        title="Reprogramar"
                      >
                        🔄
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Paginación -->
        <div v-if="filteredAppointments.length > 0" class="mt-8 flex justify-center">
          <div class="flex items-center gap-2">
            <button
              @click="prevPage"
              :disabled="currentPage === 1"
              class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              ← Anterior
            </button>
            <span class="px-4 py-2 text-gray-700">
              Página {{ currentPage }} de {{ totalPages }}
            </span>
            <button
              @click="nextPage"
              :disabled="currentPage === totalPages"
              class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Siguiente →
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Modal de Detalles -->
    <div v-if="showDetailsModal && selectedAppointment" class="modal-overlay" @click.self="closeDetailsModal">
      <div class="modal-modern-box max-w-5xl" @click.stop>
        <div class="modal-modern-header flex justify-between items-start">
          <div class="flex items-start gap-4">
            <div class="avatar-modern-lg">
              <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-500 flex items-center justify-center">
                <span class="text-4xl">👑</span>
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
                <div class="badge-outline-admin">
                  👤 {{ selectedAppointment.userId?.name }} {{ selectedAppointment.userId?.lastname }}
                </div>
                <div class="badge-outline-admin">
                  📅 {{ formatDate(selectedAppointment.date) }}
                </div>
                <div class="badge-outline-admin">
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
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Columna 1: Cliente y Mascota -->
            <div class="space-y-6">
              <!-- Información del cliente -->
              <div class="modal-section">
                <h3 class="modal-section-title-admin">
                  <span>👤</span> Información del Cliente
                </h3>
                <div class="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
                  <div class="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-indigo-500 flex items-center justify-center">
                    <span class="text-white text-2xl">
                      {{ getInitials(selectedAppointment.userId?.name, selectedAppointment.userId?.lastname) }}
                    </span>
                  </div>
                  <div class="flex-1">
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
                <h3 class="modal-section-title-admin">
                  <span>🐾</span> Información de la Mascota
                </h3>
                <div class="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
                  <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center">
                      <span class="text-white text-xl">{{ getPetIcon(selectedAppointment.petId?.type) }}</span>
                    </div>
                    <div class="flex-1">
                      <p class="font-bold text-gray-900">{{ selectedAppointment.petId?.name }}</p>
                      <div class="flex flex-wrap gap-2 mt-1">
                        <span class="badge-tag-admin capitalize">{{ selectedAppointment.petId?.type }}</span>
                        <span v-if="selectedAppointment.petId?.breed" class="badge-tag-admin">
                          {{ selectedAppointment.petId?.breed }}
                        </span>
                        <span v-if="selectedAppointment.petId?.age" class="badge-tag-admin">
                          {{ selectedAppointment.petId?.age }} años
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Columna 2: Proveedor y Negocio -->
            <div class="space-y-6">
              <!-- Información del proveedor -->
              <div v-if="selectedAppointment.providerId" class="modal-section">
                <h3 class="modal-section-title-admin">
                  <span>👨‍⚕️</span> Información del Proveedor
                </h3>
                <div class="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                  <div class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                    <span class="text-white text-xl">👤</span>
                  </div>
                  <div class="flex-1">
                    <p class="font-bold text-gray-900">{{ selectedAppointment.providerId?.name }}</p>
                    <div class="space-y-1 mt-2">
                      <p class="text-sm text-gray-600">
                        {{ selectedAppointment.providerId?.email }}
                      </p>
                      <p v-if="selectedAppointment.providerId?.phone" class="text-sm text-gray-600">
                        {{ selectedAppointment.providerId?.phone }}
                      </p>
                      <p v-if="selectedAppointment.providerId?.serviceType" class="text-sm text-blue-600">
                        {{ selectedAppointment.providerId?.serviceType }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Información del negocio -->
              <div v-if="selectedAppointment.businessId" class="modal-section">
                <h3 class="modal-section-title-admin">
                  <span>🏬</span> Información del Negocio
                </h3>
                <div class="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200">
                  <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center">
                      <span class="text-white text-xl">🏬</span>
                    </div>
                    <div class="flex-1">
                      <p class="font-bold text-gray-900">{{ selectedAppointment.businessId?.name }}</p>
                      <p class="text-sm text-gray-600">{{ selectedAppointment.businessId?.address }}</p>
                      <p class="text-sm text-gray-600">{{ selectedAppointment.businessId?.phone }}</p>
                      <p v-if="selectedAppointment.businessId?.category" class="text-xs text-orange-600">
                        {{ selectedAppointment.businessId?.category }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Información del servicio -->
              <div class="modal-section">
                <h3 class="modal-section-title-admin">
                  <span>⚙️</span> Información del Servicio
                </h3>
                <div class="border border-gray-200 rounded-xl p-4">
                  <div class="flex justify-between items-center mb-2">
                    <h4 class="font-bold text-gray-900">{{ selectedAppointment.serviceId?.name || selectedAppointment.serviceName }}</h4>
                    <span class="text-xl font-bold text-purple-600">
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
                  </div>
                </div>
              </div>
            </div>

            <!-- Columna 3: Detalles de la cita -->
            <div class="space-y-6">
              <!-- Detalles de la cita -->
              <div class="modal-section">
                <h3 class="modal-section-title-admin">
                  <span>📋</span> Detalles de la Cita
                </h3>
                <div class="space-y-3 p-4 border border-gray-200 rounded-xl">
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
                  <div v-if="selectedAppointment.rescheduledAt" class="flex justify-between items-center">
                    <span class="font-medium text-gray-900">Reprogramada:</span>
                    <span class="text-sm text-gray-600">{{ formatDateTime(selectedAppointment.rescheduledAt) }}</span>
                  </div>
                </div>
              </div>

              <!-- Notas -->
              <div class="modal-section">
                <h3 class="modal-section-title-admin">
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
              v-if="selectedAppointment.status === 'pendiente'"
              @click="updateStatus(selectedAppointment, 'confirmada')"
              class="btn-modal-confirm-admin"
            >
              ✅ Confirmar
            </button>
            <button 
              v-if="selectedAppointment.status === 'confirmada'"
              @click="updateStatus(selectedAppointment, 'completada')"
              class="btn-modal-complete-admin"
            >
              ✓ Completar
            </button>
            <button 
              v-if="selectedAppointment.status === 'pendiente' || selectedAppointment.status === 'confirmada'"
              @click="updateStatus(selectedAppointment, 'cancelada')"
              class="btn-modal-cancel-admin"
            >
              ❌ Cancelar
            </button>
            <button 
              v-if="selectedAppointment.status === 'pendiente' || selectedAppointment.status === 'confirmada'"
              @click="showRescheduleModal(selectedAppointment)"
              class="btn-modal-reschedule-admin"
            >
              🔄 Reprogramar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para crear nueva cita -->
    <div v-if="showCreateModal" class="modal-overlay" @click.self="closeCreateModal">
      <div class="modal-modern-box max-w-4xl" @click.stop>
        <div class="modal-modern-header flex justify-between items-start">
          <div class="flex items-start gap-4">
            <div class="avatar-modern-lg">
              <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-500 flex items-center justify-center">
                <span class="text-3xl">+</span>
              </div>
            </div>
            <div>
              <h2 class="text-2xl font-bold text-gray-900">Nueva Cita</h2>
              <p class="text-gray-600 mt-1">Crea una nueva cita manualmente como administrador</p>
            </div>
          </div>
          <button @click="closeCreateModal" class="btn-modal-close">
            ✕
          </button>
        </div>

        <div class="modal-modern-content mt-6">
          <form @submit.prevent="createAppointment" class="space-y-6">
            <!-- Primera fila: Cliente y Mascota -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Cliente -->
              <div>
                <label class="block mb-2 font-medium text-gray-900">
                  <span class="text-purple-600">👤</span> Cliente *
                </label>
                <select
                  v-model="newAppointment.clientId"
                  @change="loadClientPets"
                  class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                  required
                >
                  <option value="">Selecciona un cliente</option>
                  <option v-for="client in formData.clients" :key="client._id" :value="client._id">
                    {{ client.name }} {{ client.lastname }} - {{ client.email }}
                  </option>
                </select>
                <p class="text-xs text-gray-500 mt-1">Cliente que solicita el servicio</p>
              </div>

              <!-- Mascota -->
              <div>
                <label class="block mb-2 font-medium text-gray-900">
                  <span class="text-purple-600">🐾</span> Mascota *
                </label>
                <select
                  v-model="newAppointment.petId"
                  class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                  :disabled="!newAppointment.clientId"
                  required
                >
                  <option value="">Primero selecciona un cliente</option>
                  <option v-for="pet in clientPets" :key="pet._id" :value="pet._id">
                    {{ pet.name }} ({{ pet.type }}) - {{ pet.breed || 'Sin raza' }}
                  </option>
                </select>
                <p class="text-xs text-gray-500 mt-1">Mascota que recibirá el servicio</p>
              </div>
            </div>

            <!-- Segunda fila: Proveedor y Negocio -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Proveedor -->
              <div>
                <label class="block mb-2 font-medium text-gray-900">
                  <span class="text-purple-600">👨‍⚕️</span> Proveedor
                </label>
                <select
                  v-model="newAppointment.providerId"
                  @change="loadProviderBusinesses"
                  class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                >
                  <option value="">Selecciona un proveedor (opcional)</option>
                  <option v-for="provider in formData.providers" :key="provider._id" :value="provider._id">
                    {{ provider.name }} - {{ provider.serviceType || 'Proveedor' }}
                  </option>
                </select>
                <p class="text-xs text-gray-500 mt-1">Proveedor que atenderá la cita</p>
              </div>

              <!-- Negocio -->
              <div>
                <label class="block mb-2 font-medium text-gray-900">
                  <span class="text-purple-600">🏬</span> Negocio
                </label>
                <select
                  v-model="newAppointment.businessId"
                  @change="loadBusinessServices"
                  class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                >
                  <option value="">Selecciona un negocio</option>
                  
                  <!-- Negocios del proveedor seleccionado -->
                  <optgroup v-if="newAppointment.providerId && providerBusinesses.length > 0" label="Negocios del proveedor">
                    <option v-for="business in providerBusinesses" :key="business._id" :value="business._id">
                      {{ business.name }} - {{ business.category }}
                    </option>
                  </optgroup>
                  
                  <!-- Todos los negocios -->
                  <optgroup label="Todos los negocios">
                    <option v-for="business in formData.businesses" :key="business._id" :value="business._id">
                      {{ business.name }} - {{ business.category }}
                    </option>
                  </optgroup>
                </select>
                <p v-if="newAppointment.providerId && providerBusinesses.length === 0" class="text-xs text-amber-600 mt-1">
                  Este proveedor no tiene negocios registrados
                </p>
              </div>
            </div>

            <!-- Tercera fila: Servicio -->
            <div>
              <label class="block mb-2 font-medium text-gray-900">
                <span class="text-purple-600">⚙️</span> Servicio *
              </label>
              <select
                v-model="newAppointment.serviceId"
                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                required
              >
                <option value="">Selecciona un servicio</option>
                
                <!-- Servicios del negocio seleccionado -->
                <optgroup v-if="newAppointment.businessId && businessServices.length > 0" label="Servicios del negocio seleccionado">
                  <option v-for="service in businessServices" :key="service._id" :value="service._id">
                    {{ service.name }} - ${{ service.price }} ({{ service.duration }} min)
                  </option>
                </optgroup>
                
                <!-- Servicios del proveedor seleccionado -->
                <optgroup v-if="newAppointment.providerId && providerServices.length > 0" label="Servicios del proveedor">
                  <option v-for="service in providerServices" :key="service._id" :value="service._id">
                    {{ service.name }} - ${{ service.price }} ({{ service.duration }} min)
                  </option>
                </optgroup>
                
                <!-- Todos los servicios disponibles -->
                <optgroup label="Todos los servicios">
                  <option v-for="service in formData.services" :key="service._id" :value="service._id">
                    {{ service.name }} - ${{ service.price }} ({{ service.duration }} min)
                    <span v-if="service.providerId"> - {{ service.providerId.name }}</span>
                    <span v-if="service.businessId"> - {{ service.businessId.name }}</span>
                  </option>
                </optgroup>
              </select>
              <p class="text-xs text-gray-500 mt-1">Servicio a realizar</p>
            </div>

            <!-- Cuarta fila: Fecha y Hora -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Fecha -->
              <div>
                <label class="block mb-2 font-medium text-gray-900">
                  <span class="text-purple-600">📅</span> Fecha *
                </label>
                <input
                  v-model="newAppointment.date"
                  type="date"
                  :min="minDate"
                  class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                  required
                />
              </div>

              <!-- Hora -->
              <div>
                <label class="block mb-2 font-medium text-gray-900">
                  <span class="text-purple-600">⏰</span> Hora *
                </label>
                <select
                  v-model="newAppointment.time"
                  class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                  required
                >
                  <option value="">Selecciona una hora</option>
                  <option v-for="hour in availableHours" :key="hour" :value="hour">
                    {{ hour }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Notas -->
            <div>
              <label class="block mb-2 font-medium text-gray-900">
                <span class="text-purple-600">📝</span> Notas (Opcional)
              </label>
              <textarea
                v-model="newAppointment.notes"
                rows="3"
                placeholder="Notas adicionales para la cita..."
                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 resize-none"
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
            class="btn-modal-primary-admin"
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

    <!-- Modal de Reprogramación -->
    <div v-if="showRescheduleModal && appointmentToReschedule" class="modal-overlay" @click.self="closeRescheduleModal">
      <div class="modal-modern-box max-w-lg" @click.stop>
        <div class="modal-modern-header flex justify-between items-start">
          <div class="flex items-start gap-4">
            <div class="avatar-modern-lg">
              <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-500 flex items-center justify-center">
                <span class="text-3xl">🔄</span>
              </div>
            </div>
            <div>
              <h2 class="text-2xl font-bold text-gray-900">Reprogramar Cita</h2>
              <p class="text-gray-600 mt-1">Cambia la fecha y hora de la cita</p>
            </div>
          </div>
          <button @click="closeRescheduleModal" class="btn-modal-close">
            ✕
          </button>
        </div>

        <div class="modal-modern-content mt-6">
          <form @submit.prevent="rescheduleAppointment" class="space-y-4">
            <!-- Fecha -->
            <div>
              <label class="block mb-2 font-medium text-gray-900">
                Nueva Fecha *
              </label>
              <input
                v-model="rescheduleData.date"
                type="date"
                :min="minDate"
                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                required
              />
            </div>

            <!-- Hora -->
            <div>
              <label class="block mb-2 font-medium text-gray-900">
                Nueva Hora *
              </label>
              <select
                v-model="rescheduleData.time"
                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                required
              >
                <option value="">Selecciona una hora</option>
                <option v-for="hour in availableHours" :key="hour" :value="hour">
                  {{ hour }}
                </option>
              </select>
            </div>

            <!-- Razón -->
            <div>
              <label class="block mb-2 font-medium text-gray-900">
                Razón de la reprogramación
              </label>
              <textarea
                v-model="rescheduleData.reason"
                rows="3"
                placeholder="¿Por qué se reprograma la cita?..."
                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 resize-none"
              ></textarea>
            </div>
          </form>
        </div>

        <div class="modal-modern-actions">
          <button @click="closeRescheduleModal" class="btn-modal-ghost">
            Cancelar
          </button>
          <button 
            @click="rescheduleAppointment"
            class="btn-modal-primary-admin"
            :disabled="!rescheduleData.date || !rescheduleData.time || processing"
          >
            <span v-if="!processing">
              <span class="mr-2">🔄</span> Reprogramar
            </span>
            <span v-else class="flex items-center gap-2">
              <span class="animate-spin">⟳</span>
              Procesando...
            </span>
          </button>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script>
import api from "@/api/api";
import AdminLayout from "@/components/AdminLayout.vue";
import Chatbot from "@/components/Chatbot.vue";

export default {
  name: "AdminAppointments",
  components: { AdminLayout, Chatbot },

  data() {
    return {
      appointments: [],
      loading: false,
      processing: false,
      errorMessage: "",
      searchQuery: "",
      filterStatus: "",
      filterProvider: "",
      
      // Paginación
      currentPage: 1,
      itemsPerPage: 10,
      
      // Form Data
      formData: {
        clients: [],
        providers: [],
        businesses: [],
        services: []
      },
      clientPets: [],
      providerBusinesses: [],
      businessServices: [],
      providerServices: [],
      
      // Modales
      showDetailsModal: false,
      showCreateModal: false,
      showRescheduleModal: false,
      selectedAppointment: null,
      appointmentToReschedule: null,
      
      // Datos para nueva cita
      newAppointment: {
        clientId: "",
        petId: "",
        providerId: "",
        businessId: "",
        serviceId: "",
        date: "",
        time: "",
        notes: ""
      },
      
      // Datos para reprogramación
      rescheduleData: {
        date: "",
        time: "",
        reason: ""
      },
      
      // Horas disponibles
      availableHours: [
        "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", 
        "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
        "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
        "17:00", "17:30", "18:00", "18:30", "19:00", "19:30"
      ]
    };
  },

  computed: {
    filteredAppointments() {
      let filtered = this.appointments;
      
      // Filtrar por búsqueda
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(appt => {
          const clientName = `${appt.userId?.name || ''} ${appt.userId?.lastname || ''}`.toLowerCase();
          const clientEmail = appt.userId?.email?.toLowerCase() || '';
          const providerName = appt.providerId?.name?.toLowerCase() || '';
          const serviceName = appt.serviceId?.name?.toLowerCase() || appt.serviceName?.toLowerCase() || '';
          const businessName = appt.businessId?.name?.toLowerCase() || '';
          
          return clientName.includes(query) ||
                 clientEmail.includes(query) ||
                 providerName.includes(query) ||
                 serviceName.includes(query) ||
                 businessName.includes(query);
        });
      }
      
      // Filtrar por estado
      if (this.filterStatus) {
        filtered = filtered.filter(appt => appt.status === this.filterStatus);
      }
      
      // Filtrar por proveedor
      if (this.filterProvider) {
        filtered = filtered.filter(appt => 
          appt.providerId?._id === this.filterProvider
        );
      }
      
      return filtered;
    },
    
    // Paginación
    paginatedAppointments() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredAppointments.slice(start, end);
    },
    
    totalPages() {
      return Math.ceil(this.filteredAppointments.length / this.itemsPerPage);
    },
    
    totalAppointments() {
      return this.appointments.length;
    },
    
    appointmentsByStatus() {
      return this.appointments.reduce((acc, appt) => {
        acc[appt.status] = (acc[appt.status] || 0) + 1;
        return acc;
      }, {});
    },
    
    isCreateFormValid() {
      return this.newAppointment.clientId &&
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
    await this.loadFormData();
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
    
    getInitials(name, lastname) {
      const first = name?.charAt(0) || '';
      const last = lastname?.charAt(0) || '';
      return `${first}${last}`.toUpperCase() || '??';
    },
    
    translateStatus(status) {
      const translations = {
        'pendiente': 'Pendiente',
        'confirmada': 'Confirmada',
        'cancelada': 'Cancelada',
        'completada': 'Completada',
        'reprogramada': 'Reprogramada'
      };
      return translations[status] || status;
    },
    
    statusClass(status) {
      const classes = {
        'pendiente': 'bg-yellow-100 text-yellow-800',
        'confirmada': 'bg-green-100 text-green-800',
        'cancelada': 'bg-red-100 text-red-800',
        'completada': 'bg-blue-100 text-blue-800',
        'reprogramada': 'bg-purple-100 text-purple-800'
      };
      return classes[status] || 'bg-gray-100 text-gray-800';
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
        console.error("Error formateando fecha:", error);
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
        console.error("Error formateando fecha/hora:", error);
        return 'Fecha inválida';
      }
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
        console.log('📥 Cargando todas las citas para admin...');
        
        const response = await api.get("/admin/appointments");
        
        if (response.data.success) {
          this.appointments = response.data.appointments || [];
          console.log(`✅ ${this.appointments.length} citas cargadas para admin`);
        } else {
          this.errorMessage = response.data.message || "Error al cargar citas";
          console.warn('⚠️ Respuesta inesperada:', response.data);
        }
        
      } catch (err) {
        console.error("❌ Error cargando citas:", err);
        
        if (err.response?.status === 403) {
          this.errorMessage = "No tienes permisos de administrador para ver todas las citas.";
        } else if (err.response?.status === 401) {
          this.errorMessage = "Sesión expirada. Por favor, inicia sesión nuevamente.";
          this.$router.push('/login');
          return;
        } else if (err.response?.status === 404) {
          this.errorMessage = "Ruta no encontrada. Verifica la configuración del backend.";
          // Opcional: cargar datos de ejemplo
          // this.appointments = this.getMockAppointments();
          return;
        } else {
          this.errorMessage = `Error al cargar citas: ${err.message || 'Error desconocido'}`;
        }
        
        this.showTemporaryMessage(this.errorMessage, 'error');
        
      } finally {
        this.loading = false;
      }
    },
    
    async loadFormData() {
      try {
        const response = await api.get("/admin/appointments/form-data");
        if (response.data.success) {
          this.formData = response.data.formData;
          console.log('✅ Datos del formulario cargados para admin');
          console.log('📊 Negocios con provider:', this.formData.businesses.filter(b => b.provider).length);
        }
      } catch (err) {
        console.error("❌ Error cargando datos del formulario:", err);
        this.showTemporaryMessage("Error al cargar datos del formulario", 'error');
      }
    },
    
    async loadClientPets() {
      if (!this.newAppointment.clientId) {
        this.clientPets = [];
        return;
      }
      
      try {
        const response = await api.get(`/admin/appointments/clients/${this.newAppointment.clientId}/pets`);
        if (response.data.success) {
          this.clientPets = response.data.pets;
          this.newAppointment.petId = ""; // Resetear selección
          console.log(`✅ ${this.clientPets.length} mascotas cargadas`);
        }
      } catch (err) {
        console.error("❌ Error cargando mascotas del cliente:", err);
        this.clientPets = [];
      }
    },
    
    async loadProviderBusinesses() {
      if (!this.newAppointment.providerId) {
        this.providerBusinesses = [];
        this.newAppointment.businessId = "";
        this.businessServices = [];
        this.providerServices = [];
        return;
      }
      
      try {
        console.log('🔍 Cargando negocios del proveedor:', this.newAppointment.providerId);
        
        // Cargar negocios del proveedor
        const businessesResponse = await api.get(`/admin/appointments/providers/${this.newAppointment.providerId}/businesses`);
        
        // Cargar servicios del proveedor
        const servicesResponse = await api.get(`/admin/appointments/providers/${this.newAppointment.providerId}/services`);
        
        if (businessesResponse.data.success) {
          this.providerBusinesses = businessesResponse.data.businesses;
          console.log(`✅ ${this.providerBusinesses.length} negocios del proveedor cargados`);
        }
        
        if (servicesResponse.data.success) {
          this.providerServices = servicesResponse.data.services;
          console.log(`✅ ${this.providerServices.length} servicios del proveedor cargados`);
        }
        
        // Resetear selecciones si no pertenecen al proveedor
        if (this.newAppointment.businessId) {
          const selectedBusiness = this.formData.businesses.find(
            b => b._id === this.newAppointment.businessId
          );
          
          if (selectedBusiness && selectedBusiness.provider?._id !== this.newAppointment.providerId) {
            this.newAppointment.businessId = "";
            this.businessServices = [];
          }
        }
        
      } catch (err) {
        console.error("❌ Error cargando datos del proveedor:", err);
        this.providerBusinesses = [];
        this.providerServices = [];
      }
    },
    
    async loadBusinessServices() {
      if (!this.newAppointment.businessId) {
        this.businessServices = [];
        this.newAppointment.serviceId = "";
        return;
      }
      
      try {
        console.log('🔍 Cargando servicios del negocio:', this.newAppointment.businessId);
        
        const response = await api.get(`/admin/appointments/businesses/${this.newAppointment.businessId}/services`);
        
        if (response.data.success) {
          this.businessServices = response.data.services;
          console.log(`✅ ${this.businessServices.length} servicios del negocio cargados`);
        }
        
      } catch (err) {
        console.error("❌ Error cargando servicios del negocio:", err);
        this.businessServices = [];
      }
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
      this.resetForm();
    },
    
    closeCreateModal() {
      this.showCreateModal = false;
      this.resetForm();
    },
    
    resetForm() {
      this.newAppointment = {
        clientId: "",
        petId: "",
        providerId: "",
        businessId: "",
        serviceId: "",
        date: "",
        time: "",
        notes: ""
      };
      this.clientPets = [];
      this.providerBusinesses = [];
      this.businessServices = [];
      this.providerServices = [];
    },
    
    showRescheduleModal(appointment) {
      this.appointmentToReschedule = appointment;
      this.rescheduleData = {
        date: appointment.date,
        time: appointment.time,
        reason: ""
      };
      this.showRescheduleModal = true;
    },
    
    closeRescheduleModal() {
      this.showRescheduleModal = false;
      this.appointmentToReschedule = null;
      this.rescheduleData = {
        date: "",
        time: "",
        reason: ""
      };
    },
    
    // ============ PAGINACIÓN ============
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
        this.scrollToTop();
      }
    },
    
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.scrollToTop();
      }
    },
    
    scrollToTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    
    // ============ ACCIONES ============
    async updateStatus(appointment, newStatus) {
      if (!confirm(`¿Estás seguro de cambiar el estado a "${this.translateStatus(newStatus)}"?`)) {
        return;
      }
      
      try {
        this.processing = true;
        
        const response = await api.put(
          `/admin/appointments/${appointment._id}/status`,
          { status: newStatus }
        );
        
        if (response.data.success) {
          // Actualizar la cita localmente
          const index = this.appointments.findIndex(a => a._id === appointment._id);
          if (index !== -1) {
            this.appointments[index].status = newStatus;
            this.appointments[index].updatedAt = new Date();
            
            // Actualizar timestamps según el estado
            if (newStatus === 'cancelada') {
              this.appointments[index].cancelledAt = new Date();
            } else if (newStatus === 'completada') {
              this.appointments[index].completedAt = new Date();
            } else if (newStatus === 'reprogramada') {
              this.appointments[index].rescheduledAt = new Date();
            }
            
            // Actualizar en el modal de detalles si está abierto
            if (this.selectedAppointment && this.selectedAppointment._id === appointment._id) {
              Object.assign(this.selectedAppointment, this.appointments[index]);
            }
          }
          
          this.showTemporaryMessage(`✅ Estado cambiado a ${this.translateStatus(newStatus)}`, 'success');
        }
        
      } catch (err) {
        console.error("❌ Error cambiando estado:", err);
        this.showTemporaryMessage("❌ Error al cambiar el estado", 'error');
      } finally {
        this.processing = false;
      }
    },
    
    async createAppointment() {
      try {
        this.processing = true;
        
        console.log('📝 Enviando datos de nueva cita:', this.newAppointment);
        
        const response = await api.post(
          "/admin/appointments",
          this.newAppointment
        );
        
        if (response.data.success) {
          this.showTemporaryMessage('✅ Cita creada exitosamente', 'success');
          this.closeCreateModal();
          await this.loadAppointments();
        }
        
      } catch (err) {
        console.error("❌ Error creando cita:", err);
        
        let errorMessage = "❌ Error al crear la cita. Por favor, verifica los datos.";
        if (err.response?.data?.message) {
          errorMessage = `❌ ${err.response.data.message}`;
        } else if (err.response?.data?.errors) {
          errorMessage = `❌ ${err.response.data.errors.join(', ')}`;
        }
        
        this.showTemporaryMessage(errorMessage, 'error');
      } finally {
        this.processing = false;
      }
    },
    
    async rescheduleAppointment() {
      if (!this.appointmentToReschedule) return;
      
      try {
        this.processing = true;
        
        const response = await api.patch(
          `/admin/appointments/${this.appointmentToReschedule._id}/reschedule`,
          this.rescheduleData
        );
        
        if (response.data.success) {
          this.showTemporaryMessage('✅ Cita reprogramada exitosamente', 'success');
          this.closeRescheduleModal();
          await this.loadAppointments();
        }
        
      } catch (err) {
        console.error("❌ Error reprogramando cita:", err);
        this.showTemporaryMessage("❌ Error al reprogramar la cita", 'error');
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
        type === 'success' ? 'bg-purple-500 text-white' : 'bg-rose-500 text-white'
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
/* Estilos específicos para admin */
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
  border-color: #8b5cf6;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.1),
    0 0 0 1px #8b5cf6,
    0 0 20px rgba(139, 92, 246, 0.1);
}

/* Botón principal purple */
.btn-primary-purple {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  transition: all 0.3s ease;
  box-shadow: 0 10px 25px rgba(139, 92, 246, 0.3);
  cursor: pointer;
}

.btn-primary-purple:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 
    0 15px 35px rgba(139, 92, 246, 0.4),
    0 0 0 2px rgba(255, 255, 255, 0.2);
  background: linear-gradient(135deg, #7c3aed, #8b5cf6);
}

.btn-primary-purple:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Botones de acción admin */
.btn-details-admin {
  display: inline-flex !important;
  align-items: center !important;
  padding: 0.5rem 1rem !important;
  background-color: #8b5cf6 !important;
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

.btn-details-admin:hover {
  background-color: #7c3aed !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15) !important;
}

.btn-confirm-admin {
  display: inline-flex !important;
  align-items: center !important;
  padding: 0.25rem 0.5rem !important;
  background-color: #22c55e !important;
  color: white !important;
  font-size: 0.75rem !important;
  font-weight: 500 !important;
  border-radius: 0.375rem !important;
  border: none !important;
  cursor: pointer !important;
  transition: all 0.2s !important;
}

.btn-confirm-admin:hover {
  background-color: #16a34a !important;
  transform: scale(1.1) !important;
}

.btn-complete-admin {
  display: inline-flex !important;
  align-items: center !important;
  padding: 0.25rem 0.5rem !important;
  background-color: #3b82f6 !important;
  color: white !important;
  font-size: 0.75rem !important;
  font-weight: 500 !important;
  border-radius: 0.375rem !important;
  border: none !important;
  cursor: pointer !important;
  transition: all 0.2s !important;
}

.btn-complete-admin:hover {
  background-color: #2563eb !important;
  transform: scale(1.1) !important;
}

.btn-cancel-admin {
  display: inline-flex !important;
  align-items: center !important;
  padding: 0.25rem 0.5rem !important;
  background-color: #f43f5e !important;
  color: white !important;
  font-size: 0.75rem !important;
  font-weight: 500 !important;
  border-radius: 0.375rem !important;
  border: none !important;
  cursor: pointer !important;
  transition: all 0.2s !important;
}

.btn-cancel-admin:hover {
  background-color: #e11d48 !important;
  transform: scale(1.1) !important;
}

.btn-reschedule-admin {
  display: inline-flex !important;
  align-items: center !important;
  padding: 0.25rem 0.5rem !important;
  background-color: #a855f7 !important;
  color: white !important;
  font-size: 0.75rem !important;
  font-weight: 500 !important;
  border-radius: 0.375rem !important;
  border: none !important;
  cursor: pointer !important;
  transition: all 0.2s !important;
}

.btn-reschedule-admin:hover {
  background-color: #9333ea !important;
  transform: scale(1.1) !important;
}

/* Badges admin */
.badge-outline-admin {
  background: white;
  color: #8b5cf6;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-weight: 600;
  font-size: 0.75rem;
  border: 1px solid #8b5cf6;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.badge-tag-admin {
  background: #f5f3ff;
  color: #7c3aed;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.7rem;
  border: 1px solid #ddd6fe;
}

/* Modal section title admin */
.modal-section-title-admin {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.modal-section-title-admin span {
  color: #8b5cf6;
}

/* Botones del modal admin */
.btn-modal-primary-admin {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
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

.btn-modal-primary-admin:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(139, 92, 246, 0.3);
}

.btn-modal-primary-admin:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-modal-confirm-admin {
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

.btn-modal-confirm-admin:hover:not(:disabled) {
  background-color: #16a34a !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 10px 20px rgba(34, 197, 94, 0.3) !important;
}

.btn-modal-complete-admin {
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

.btn-modal-complete-admin:hover:not(:disabled) {
  background-color: #2563eb !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 10px 20px rgba(59, 130, 246, 0.3) !important;
}

.btn-modal-cancel-admin {
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

.btn-modal-cancel-admin:hover:not(:disabled) {
  background-color: #e11d48 !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 10px 20px rgba(244, 63, 94, 0.3) !important;
}

.btn-modal-reschedule-admin {
  display: inline-flex !important;
  align-items: center !important;
  padding: 0.75rem 1.5rem !important;
  background-color: #a855f7 !important;
  color: white !important;
  font-weight: 600 !important;
  border-radius: 10px !important;
  border: none !important;
  cursor: pointer !important;
  transition: all 0.3s ease !important;
}

.btn-modal-reschedule-admin:hover:not(:disabled) {
  background-color: #9333ea !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 10px 20px rgba(168, 85, 247, 0.3) !important;
}

/* Estilos del modal (mantener de tu vista anterior) */
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
    0 0 0 1px #8b5cf6,
    0 0 40px rgba(139, 92, 246, 0.1);
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
  margin-bottom: 1.5rem;
}

.modal-modern-content {
  flex: 1;
  overflow-y: auto;
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
  border-color: #8b5cf6;
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
  
  .btn-modal-primary-admin,
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
  
  .col-span-1,
  .col-span-2 {
    grid-column: span 1;
  }
}
</style>