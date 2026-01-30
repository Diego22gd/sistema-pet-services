<template>
  <ProviderLayout>
    <div class="px-6 max-w-7xl mx-auto w-full pt-6 mt-12">
      <!-- Header con estilo moderno -->
      <div class="mb-10 fade-up">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 mb-4 border border-emerald-200 mt-12">
          <span class="text-2xl text-emerald-600">🏬</span>
        </div>
        <h1 class="text-4xl font-bold text-gray-900 mb-3">Mis Comercios</h1>
        <p class="text-lg text-gray-700 max-w-3xl">
          Gestiona tus comercios, agrega información detallada y servicios especializados
        </p>
      </div>

      <!-- Barra de herramientas moderna -->
      <div class="mb-10 bg-white rounded-2xl shadow-lg border border-gray-200 p-6 fade-up">
        <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div class="relative w-full lg:w-96">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span class="text-emerald-500 text-lg">🔍</span>
            </div>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar comercios por nombre o ubicación..."
              class="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 bg-white text-gray-900"
              @keyup.enter="searchBusinesses"
            />
          </div>
          <button
            @click="openAddModal"
            class="btn-primary group flex items-center gap-3 px-8 py-3.5 text-lg"
            :disabled="loading"
          >
            <span class="text-xl">🏬</span>
            <span>{{ loading ? 'Cargando...' : 'Crear Nuevo Comercio' }}</span>
            <span v-if="!loading" class="ml-2 group-hover:rotate-90 transition-transform duration-300">→</span>
          </button>
        </div>
      </div>

      <!-- Tarjetas de estadísticas modernas -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10 fade-up">
        <div class="card-modern text-center">
          <div class="text-3xl font-bold text-emerald-600">{{ stats.total || 0 }}</div>
          <div class="text-sm text-gray-600 mt-2">Comercios Totales</div>
        </div>
        <div class="card-modern text-center">
          <div class="text-3xl font-bold text-teal-600">{{ stats.active || 0 }}</div>
          <div class="text-sm text-gray-600 mt-2">Activos</div>
        </div>
        <div class="card-modern text-center">
          <div class="text-3xl font-bold text-amber-600">{{ stats.pending || 0 }}</div>
          <div class="text-sm text-gray-600 mt-2">Pendientes</div>
        </div>
        <div class="card-modern text-center">
          <div class="text-3xl font-bold text-rose-600">{{ stats.totalServices || 0 }}</div>
          <div class="text-sm text-gray-600 mt-2">Servicios Totales</div>
        </div>
      </div>

      <!-- Mensajes de estado -->
      <div v-if="error" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
        <div class="flex items-center">
          <span class="text-red-500 mr-2">⚠️</span>
          <p class="text-red-700">{{ error }}</p>
          <button @click="error = ''" class="ml-auto text-red-500 hover:text-red-700">
            ✕
          </button>
        </div>
      </div>

      <div v-if="successMessage" class="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
        <div class="flex items-center">
          <span class="text-emerald-500 mr-2">✅</span>
          <p class="text-emerald-700">{{ successMessage }}</p>
          <button @click="successMessage = ''" class="ml-auto text-emerald-500 hover:text-emerald-700">
            ✕
          </button>
        </div>
      </div>

      <!-- Grid de comercios como en landing page -->
      <div v-if="loading" class="text-center py-16 fade-up">
        <div class="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-200">
          <span class="text-3xl text-emerald-600 animate-pulse">⏳</span>
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-3">Cargando comercios</h3>
        <p class="text-gray-700">Espera un momento por favor...</p>
      </div>

      <div v-else-if="filteredBusinesses.length > 0" class="mb-16">
        <!-- Header de la sección -->
        <div class="text-center mb-12 fade-up">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 mb-4 border border-emerald-200">
            <span class="text-2xl text-emerald-600">⭐</span>
          </div>
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Mis Comercios Destacados
          </h2>
          <p class="text-lg text-gray-700 max-w-2xl mx-auto">
            Todos los comercios que has creado y gestionas
          </p>
        </div>

        <!-- Grid de cards modernas con imágenes -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            v-for="business in filteredBusinesses"
            :key="business._id"
            class="card-modern group h-full flex flex-col"
          >
            <!-- Imagen con tamaño fijo -->
            <figure class="relative h-48 w-full overflow-hidden rounded-t-2xl bg-gradient-to-br from-emerald-50 to-teal-50">
              <img 
                :src="getBusinessImage(business)" 
                :alt="business.name" 
                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                @error="handleBusinessImageError($event, business)"
                @load="handleBusinessImageLoad($event, business)"
              />
              <!-- Badges -->
              <div class="absolute top-4 right-4">
                <div class="badge-primary">
                  ⭐ {{ business.featured ? 'Destacado' : 'Regular' }}
                </div>
              </div>
              <div class="absolute top-4 left-4">
                <div class="badge-outline">
                  {{ getCategoryIcon(business.categories?.[0]) }} {{ business.categories?.[0] || business.category }}
                </div>
              </div>
            </figure>
            
            <div class="card-modern-body p-6 flex-1 flex flex-col">
              <!-- Header con avatar -->
              <div class="flex items-start gap-4 mb-4">
                <div class="avatar-modern">
                  <div :class="[
                    'w-12 h-12 rounded-xl border flex items-center justify-center',
                    getStatusColorClass(business.status)
                  ]">
                    <span class="text-2xl">{{ getCategoryIcon(business.categories?.[0] || business.category) }}</span>
                  </div>
                </div>
                <div class="flex-1">
                  <h3 class="card-title text-lg font-bold text-gray-900">
                    {{ business.name }}
                  </h3>
                  <div class="flex items-center gap-2 mt-1 text-sm text-gray-600">
                    <span class="text-emerald-500">📍</span>
                    <span class="line-clamp-1">{{ business.address }}</span>
                  </div>
                </div>
              </div>

              <!-- Descripción -->
              <p class="text-gray-700 text-sm mb-4 line-clamp-2 flex-grow">
                {{ business.description || 'Sin descripción disponible' }}
              </p>

              <!-- Tags de servicios -->
              <div class="flex flex-wrap gap-2 mb-4">
                <span 
                  v-for="service in business.services?.slice(0, 3)" 
                  :key="service._id || service.name"
                  class="badge-tag"
                >
                  {{ service.name || service }}
                </span>
                <span 
                  v-if="business.services && business.services.length > 3" 
                  class="badge-tag bg-gray-100 text-gray-600"
                >
                  +{{ business.services.length - 3 }}
                </span>
              </div>

              <!-- Footer con precio y botón -->
              <div class="card-actions justify-between items-center mt-2">
                <div>
                  <p class="text-sm text-gray-500">
                    {{ getStatusText(business.status) }}
                  </p>
                  <p class="text-xs text-gray-500">
                    {{ business.services?.length || 0 }} servicios
                  </p>
                </div>
                <button 
                  @click="openBusinessDetailModal(business)"
                  class="btn-modern-sm group"
                >
                  <span>Ver Detalles</span>
                  <span class="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Estado vacío -->
      <div v-else class="text-center py-20 fade-up">
        <div class="w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-200">
          <span class="text-4xl text-emerald-600">🏬</span>
        </div>
        <h3 class="text-2xl font-bold text-gray-900 mb-3">No tienes comercios registrados</h3>
        <p class="text-gray-700 mb-8 max-w-md mx-auto">
          Comienza agregando tu primer comercio para ofrecer tus servicios a los clientes
        </p>
        <button
          @click="openAddModal"
          class="btn-primary group text-lg px-8 py-4"
        >
          <span>🏬 Crear Mi Primer Comercio</span>
          <span class="ml-2 group-hover:rotate-90 transition-transform duration-300">→</span>
        </button>
      </div>

      <!-- MODAL PARA CREAR/EDITAR COMERCIO -->
      <div v-if="showBusinessModal" class="modal-overlay" @click.self="closeBusinessModal">
        <div class="modal-modern-box max-w-4xl" @click.stop>
          <div class="modal-modern-header flex justify-between items-start">
            <div class="flex items-start gap-4">
              <div class="avatar-modern-lg">
                <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center">
                  <span class="text-3xl">🏬</span>
                </div>
              </div>
              <div>
                <h2 class="text-2xl font-bold text-gray-900">
                  {{ isEditBusiness ? 'Editar Comercio' : 'Crear Nuevo Comercio' }}
                </h2>
                <div class="flex items-center gap-2 mt-2">
                  <div class="badge-outline">📋 INFORMACIÓN</div>
                </div>
              </div>
            </div>
            <button @click="closeBusinessModal" class="btn-modal-close">
              ✕
            </button>
          </div>

          <div class="modal-modern-content mt-6">
            <form @submit.prevent="saveBusiness" class="space-y-6">
              <!-- Información básica -->
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Columna izquierda -->
                <div class="space-y-6">
                  <div class="modal-section">
                    <h3 class="modal-section-title">
                      <span>📝</span> Información Básica
                    </h3>
                    <div class="space-y-4">
                      <div>
                        <label class="form-label">Nombre del Comercio *</label>
                        <input 
                          v-model="businessData.name"
                          type="text" 
                          required 
                          class="form-input"
                          placeholder="Ej: AnimalCare Veterinaria"
                          :disabled="saving"
                        />
                        <p v-if="validationErrors.name" class="text-sm text-red-600 mt-1">
                          {{ validationErrors.name }}
                        </p>
                      </div>
                      
                      <div>
                        <label class="form-label">Categorías *</label>
                        <div class="space-y-2">
                          <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
                            <div 
                              v-for="category in availableCategories" 
                              :key="category.value"
                              class="relative"
                            >
                              <input 
                                type="checkbox"
                                :id="'category-' + category.value"
                                :value="category.value"
                                v-model="businessData.categories"
                                class="hidden peer"
                                :disabled="saving"
                              />
                              <label 
                                :for="'category-' + category.value"
                                class="flex items-center justify-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 transition-colors duration-200 peer-checked:border-emerald-500 peer-checked:bg-emerald-50 peer-checked:text-emerald-700 peer-checked:font-medium"
                              >
                                <span class="mr-2">{{ category.icon }}</span>
                                <span class="text-sm">{{ category.label }}</span>
                              </label>
                            </div>
                          </div>
                          <p v-if="businessData.categories.length === 0" class="text-sm text-amber-600 mt-1">
                            Selecciona al menos una categoría
                          </p>
                          <p v-else class="text-sm text-emerald-600 mt-1">
                            Seleccionadas: {{ businessData.categories.length }} categoría(s)
                          </p>
                        </div>
                      </div>

                      <div>
                        <label class="form-label">Descripción *</label>
                        <textarea 
                          v-model="businessData.description"
                          rows="3"
                          required
                          class="form-input"
                          placeholder="Describe tu comercio y servicios especializados..."
                          :disabled="saving"
                        ></textarea>
                        <p v-if="validationErrors.description" class="text-sm text-red-600 mt-1">
                          {{ validationErrors.description }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div class="modal-section">
                    <h3 class="modal-section-title">
                      <span>📍</span> Ubicación y Contacto
                    </h3>
                    <div class="space-y-4">
                      <div>
                        <label class="form-label">Dirección *</label>
                        <input 
                          v-model="businessData.address"
                          type="text" 
                          required 
                          class="form-input"
                          placeholder="Ej: Av. Principal #123, Ciudad, País"
                          :disabled="saving"
                        />
                        <p v-if="validationErrors.address" class="text-sm text-red-600 mt-1">
                          {{ validationErrors.address }}
                        </p>
                      </div>
                      
                      <div class="grid grid-cols-2 gap-4">
                        <div>
                          <label class="form-label">Teléfono *</label>
                          <input 
                            v-model="businessData.phone"
                            type="tel" 
                            required 
                            class="form-input"
                            placeholder="Ej: +1 (555) 123-4567"
                            :disabled="saving"
                          />
                          <p v-if="validationErrors.phone" class="text-sm text-red-600 mt-1">
                            {{ validationErrors.phone }}
                          </p>
                        </div>
                        
                        <div>
                          <label class="form-label">Email *</label>
                          <input 
                            v-model="businessData.email"
                            type="email" 
                            required
                            class="form-input"
                            placeholder="contacto@comercio.com"
                            :disabled="saving"
                          />
                          <p v-if="validationErrors.email" class="text-sm text-red-600 mt-1">
                            {{ validationErrors.email }}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Columna derecha -->
                <div class="space-y-6">
                  <!-- SECCIÓN DE IMAGEN -->
                  <div class="modal-section">
                    <h3 class="modal-section-title">
                      <span>🖼️</span> Imagen del Comercio *
                    </h3>
                    <div class="space-y-4">
                      <!-- Input para subir archivo -->
                      <div>
                        <label class="form-label">Selecciona una imagen de tu dispositivo</label>
                        <div 
                          class="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-emerald-400 transition-colors duration-200 cursor-pointer"
                          @click="triggerFileInput"
                          @dragover.prevent="dragover = true"
                          @dragleave.prevent="dragover = false"
                          @drop.prevent="handleFileDrop"
                          :class="{ 
                            'border-emerald-400 bg-emerald-50': dragover, 
                            'border-red-300 bg-red-50': imageError,
                            'border-green-400 bg-green-50': businessData.image && !processingImage
                          }"
                        >
                          <input
                            type="file"
                            ref="fileInput"
                            @change="handleFileSelect"
                            accept="image/*"
                            class="hidden"
                            :disabled="processingImage || saving"
                          />
                          <div class="space-y-3">
                            <!-- Estado de procesamiento -->
                            <div v-if="processingImage" class="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto border border-blue-300">
                              <span class="text-2xl text-blue-600 animate-pulse">⏳</span>
                            </div>
                            <!-- Estado de éxito -->
                            <div v-else-if="businessData.image" class="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto border border-green-300">
                              <span class="text-2xl text-green-600">✅</span>
                            </div>
                            <!-- Estado normal -->
                            <div v-else class="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                              <span class="text-2xl text-emerald-600">🖼️</span>
                            </div>
                            
                            <div>
                              <p class="font-medium text-gray-900 mb-1">
                                {{ getUploadStatusText() }}
                              </p>
                              <p class="text-sm text-gray-500">
                                {{ getUploadSubText() }}
                              </p>
                              <p v-if="selectedFile && !processingImage" class="text-xs text-gray-400 mt-1">
                                Tamaño: {{ formatFileSize(selectedFile.size) }}
                              </p>
                            </div>
                            
                            <button
                              v-if="!processingImage"
                              type="button"
                              class="btn-modal-outline inline-flex items-center gap-2"
                              :disabled="saving"
                            >
                              <span>{{ businessData.image ? 'Cambiar Imagen' : 'Seleccionar Imagen' }}</span>
                            </button>
                          </div>
                        </div>
                        
                        <!-- Mensajes de estado -->
                        <div v-if="imageError" class="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p class="text-sm text-red-600">{{ imageError }}</p>
                        </div>
                        
                        <div v-if="businessData.image" class="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p class="text-sm text-green-600">✅ Imagen lista para guardar (Base64)</p>
                          <p class="text-xs text-gray-600 mt-1">
                            Tamaño: {{ formatBase64Size(businessData.image) }}
                          </p>
                        </div>
                        
                        <div v-if="!businessData.image && !isEditBusiness" class="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                          <p class="text-sm text-amber-600">⚠️ Debes seleccionar una imagen para continuar</p>
                        </div>
                        
                        <div v-if="businessData.image && businessData.image.length > 1000000" class="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p class="text-sm text-blue-600">📝 Nota: La imagen se enviará como Base64 en la petición.</p>
                        </div>
                      </div>
                      
                      <!-- Vista previa de la imagen -->
                      <div v-if="businessData.image" 
                           class="border border-gray-200 rounded-xl p-4">
                        <p class="text-sm font-medium text-gray-700 mb-2">Vista previa:</p>
                        <div class="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100">
                          <img 
                            :src="businessData.image" 
                            alt="Vista previa de la imagen"
                            class="w-full h-full object-cover"
                            @error="handlePreviewImageError"
                            @load="handlePreviewImageLoad"
                          />
                          <button
                            v-if="!processingImage"
                            @click="removeImage"
                            type="button"
                            class="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                            :disabled="processingImage"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- HORARIOS DE ATENCIÓN -->
                  <div class="modal-section">
                    <h3 class="modal-section-title">
                      <span>⏰</span> Horarios de Atención
                    </h3>
                    <div class="space-y-4">
                      <!-- Horario Regular -->
                      <div>
                        <label class="form-label">Horario Regular *</label>
                        <div class="grid grid-cols-2 gap-3">
                          <div>
                            <label class="form-label-sm">Apertura (HH:MM)</label>
                            <input
                              v-model="businessData.workingHours.open"
                              type="text"
                              required
                              class="form-input"
                              placeholder="09:00"
                              pattern="^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$"
                              :disabled="saving"
                            />
                          </div>
                          <div>
                            <label class="form-label-sm">Cierre (HH:MM)</label>
                            <input
                              v-model="businessData.workingHours.close"
                              type="text"
                              required
                              class="form-input"
                              placeholder="18:00"
                              pattern="^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$"
                              :disabled="saving"
                            />
                          </div>
                        </div>
                        <p v-if="businessData.workingHours.open && businessData.workingHours.close" 
                           class="text-sm text-emerald-600 mt-2">
                          ⏰ Horario: {{ formatTime(businessData.workingHours.open) }} - {{ formatTime(businessData.workingHours.close) }}
                        </p>
                      </div>

                      <!-- Días de Trabajo -->
                      <div>
                        <label class="form-label">Días de Trabajo *</label>
                        <div class="grid grid-cols-3 sm:grid-cols-7 gap-2">
                          <div 
                            v-for="day in workDays" 
                            :key="day.value"
                            class="relative"
                          >
                            <input 
                              type="checkbox"
                              :id="'day-' + day.value"
                              :value="day.value"
                              v-model="businessData.workingHours.days"
                              class="hidden peer"
                              :disabled="saving"
                            />
                            <label 
                              :for="'day-' + day.value"
                              class="flex flex-col items-center justify-center p-2 border border-gray-300 rounded-lg cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 transition-colors duration-200 peer-checked:border-emerald-500 peer-checked:bg-emerald-50 peer-checked:text-emerald-700 peer-checked:font-medium"
                            >
                              <span class="text-lg mb-1">{{ day.icon }}</span>
                              <span class="text-xs">{{ day.label }}</span>
                            </label>
                          </div>
                        </div>
                        <p v-if="businessData.workingHours.days.length > 0" class="text-sm text-emerald-600 mt-2">
                          📅 Días seleccionados: {{ formatSelectedDays(businessData.workingHours.days) }}
                        </p>
                        <p v-else class="text-sm text-amber-600 mt-2">
                          Selecciona al menos un día
                        </p>
                      </div>

                      <!-- Horario Especial -->
                      <div>
                        <label class="form-label">Horario Especial (opcional)</label>
                        <div class="space-y-2">
                          <div class="flex items-center gap-2">
                            <select 
                              v-model="businessData.workingHours.specialDay"
                              class="form-input flex-1"
                              :disabled="saving"
                            >
                              <option value="">Día especial</option>
                              <option value="festivos">Festivos</option>
                              <option value="domingos">Domingos</option>
                              <option value="sabados">Sábados</option>
                              <option value="vacaciones">Vacaciones</option>
                            </select>
                          </div>
                          <div class="grid grid-cols-2 gap-2" v-if="businessData.workingHours.specialDay">
                            <input
                              v-model="businessData.workingHours.specialOpen"
                              type="text"
                              class="form-input"
                              placeholder="10:00"
                              pattern="^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$"
                              :disabled="saving"
                            />
                            <input
                              v-model="businessData.workingHours.specialClose"
                              type="text"
                              class="form-input"
                              placeholder="14:00"
                              pattern="^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$"
                              :disabled="saving"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- INFORMACIÓN ADICIONAL -->
                  <div class="modal-section bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200">
                    <h3 class="modal-section-title">
                      <span>ℹ️</span> Información Importante
                    </h3>
                    <div class="space-y-3">
                      <div class="flex items-start gap-3">
                        <div class="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                          <span class="text-amber-600 text-lg">⏳</span>
                        </div>
                        <div>
                          <p class="font-medium text-gray-900">Estado del Comercio</p>
                          <p class="text-sm text-gray-600">
                            Todos los comercios nuevos se crean en estado <span class="font-semibold">"Pendiente"</span>. 
                            Un administrador revisará y aprobará tu comercio antes de que sea visible públicamente.
                          </p>
                        </div>
                      </div>
                      <div class="flex items-start gap-3">
                        <div class="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <span class="text-blue-600 text-lg">🖼️</span>
                        </div>
                        <div>
                          <p class="font-medium text-gray-900">Imágenes en Base64</p>
                          <p class="text-sm text-gray-600">
                            Las imágenes se convierten a Base64 y se almacenan directamente en la base de datos. 
                            Formatos aceptados: JPG, PNG, WebP, GIF. Tamaño máximo: 5MB.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- SECCIÓN DE SERVICIOS -->
              <div class="modal-section bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200">
                <h3 class="modal-section-title">
                  <span>⚙️</span> Servicios del Comercio
                </h3>
                <div class="space-y-4">
                  <div class="flex items-center justify-between mb-2">
                    <div>
                      <p class="text-gray-700 mb-1">Los servicios que agregues aparecerán en la landing page</p>
                      <p class="text-sm text-gray-500">Agrega servicios específicos que ofreces en tu comercio</p>
                    </div>
                    <button
                      type="button"
                      @click="openServicesModal(businessData)"
                      class="btn-modal-outline group"
                      :disabled="saving"
                    >
                      <span>Gestionar Servicios</span>
                      <span class="ml-2 group-hover:rotate-90 transition-transform duration-300">⚙️</span>
                    </button>
                  </div>
                  
                  <!-- Vista previa de servicios -->
                  <div v-if="businessData.services.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div 
                      v-for="(service, index) in businessData.services" 
                      :key="index"
                      class="bg-white p-3 rounded-lg border border-gray-200 hover:border-emerald-300 transition-colors duration-200"
                    >
                      <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                          <span class="text-emerald-600">⚙️</span>
                        </div>
                        <div>
                          <h4 class="font-medium text-gray-900">{{ service.name }}</h4>
                          <p class="text-sm text-gray-600">
                            {{ service.description || 'Sin descripción' }}
                          </p>
                          <p class="text-lg font-bold text-emerald-600 mt-1">
                            ${{ service.price }}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-else class="text-center py-4">
                    <p class="text-gray-500">No hay servicios agregados</p>
                  </div>
                </div>
              </div>

              <!-- Botones de acción -->
              <div class="modal-modern-actions">
                <button 
                  type="button" 
                  @click="closeBusinessModal"
                  class="btn-modal-ghost"
                  :disabled="saving"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  class="btn-modal-primary group"
                  :disabled="saving || processingImage || (!businessData.image && !isEditBusiness)"
                  :class="{ 'opacity-50 cursor-not-allowed': !businessData.image && !isEditBusiness }"
                >
                  <span v-if="saving">
                    <span class="animate-spin inline-block mr-2">⟳</span>
                    Guardando...
                  </span>
                  <span v-else>
                    {{ isEditBusiness ? 'Actualizar Comercio' : 'Crear Comercio' }}
                    <span v-if="!businessData.image && !isEditBusiness" class="ml-2">🖼️</span>
                    <span v-else class="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- MODAL PARA GESTIONAR SERVICIOS -->
      <div v-if="showServicesModal" class="modal-overlay" @click.self="closeServicesModal">
        <div class="modal-modern-box max-w-2xl" @click.stop>
          <div class="modal-modern-header flex justify-between items-start">
            <div class="flex items-start gap-4">
              <div class="avatar-modern-lg">
                <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-400 flex items-center justify-center">
                  <span class="text-3xl">⚙️</span>
                </div>
              </div>
              <div>
                <h2 class="text-2xl font-bold text-gray-900">
                  Servicios de {{ currentBusiness?.name }}
                </h2>
                <div class="flex items-center gap-2 mt-2">
                  <div class="badge-outline">⚙️ SERVICIOS</div>
                </div>
              </div>
            </div>
            <button @click="closeServicesModal" class="btn-modal-close">
              ✕
            </button>
          </div>

          <div class="modal-modern-content mt-6">
            <div class="space-y-6">
              <!-- Agregar nuevo servicio con precio -->
              <div class="modal-section">
                <h3 class="modal-section-title">
                  <span>➕</span> Agregar Nuevo Servicio
                </h3>
                <div class="space-y-4">
                  <div>
                    <label class="form-label">Nombre del Servicio *</label>
                    <input 
                      v-model="newService.name"
                      type="text" 
                      class="form-input"
                      placeholder="Ej: Consulta Veterinaria, Baño Canino, etc."
                      :disabled="managingServices"
                    />
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="form-label">Precio *</label>
                      <div class="relative">
                        <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <input 
                          v-model.number="newService.price"
                          type="number" 
                          min="0"
                          step="0.01"
                          class="form-input pl-8"
                          placeholder="0.00"
                          :disabled="managingServices"
                        />
                      </div>
                    </div>
                    <div>
                      <label class="form-label">Descripción corta</label>
                      <input 
                        v-model="newService.description"
                        type="text" 
                        class="form-input"
                        placeholder="Breve descripción"
                        :disabled="managingServices"
                      />
                    </div>
                  </div>
                  <button
                    @click="addService"
                    class="btn-modal-outline w-full"
                    :disabled="!newService.name || !newService.price || managingServices"
                  >
                    <span>➕ Agregar Servicio</span>
                  </button>
                </div>
              </div>

              <!-- Lista de servicios existentes -->
              <div class="modal-section">
                <h3 class="modal-section-title">
                  <span>📋</span> Servicios Actuales
                </h3>
                <div v-if="businessData.services.length > 0" class="space-y-3">
                  <div 
                    v-for="(service, index) in businessData.services" 
                    :key="index"
                    class="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-emerald-300 transition-colors duration-300"
                  >
                    <div class="flex items-center gap-4">
                      <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                        <span class="text-emerald-600 text-xl">⚙️</span>
                      </div>
                      <div>
                        <h4 class="font-bold text-gray-900">{{ service.name }}</h4>
                        <p class="text-sm text-gray-600">{{ service.description || 'Sin descripción' }}</p>
                        <p class="text-lg font-bold text-emerald-600 mt-1">
                          ${{ service.price }}
                        </p>
                      </div>
                    </div>
                    <button
                      @click="removeService(index)"
                      class="text-rose-500 hover:text-rose-700 p-2 hover:bg-rose-50 rounded-lg transition-colors duration-200"
                      :disabled="managingServices"
                    >
                      <span class="text-xl">🗑️</span>
                    </button>
                  </div>
                </div>
                <div v-else class="text-center py-8">
                  <div class="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-300">
                    <span class="text-2xl text-gray-400">📋</span>
                  </div>
                  <p class="text-gray-500">No hay servicios agregados</p>
                </div>
              </div>
            </div>

            <div class="modal-modern-actions">
              <button 
                @click="closeServicesModal"
                class="btn-modal-primary"
                :disabled="managingServices"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- MODAL DE DETALLE DEL COMERCIO -->
      <div v-if="showDetailModal" class="modal-overlay" @click.self="closeDetailModal">
        <div class="modal-modern-box max-w-4xl" @click.stop>
          <div class="modal-modern-header flex justify-between items-start">
            <div class="flex items-start gap-4">
              <div class="avatar-modern-lg">
                <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center">
                  <span class="text-3xl">{{ getCategoryIcon(selectedBusiness?.categories?.[0] || selectedBusiness?.category) }}</span>
                </div>
              </div>
              <div>
                <h2 class="text-2xl font-bold text-gray-900">{{ selectedBusiness?.name }}</h2>
                <div class="flex items-center gap-2 mt-2">
                  <div class="badge-outline">{{ getCategoryIcon(selectedBusiness?.categories?.[0] || selectedBusiness?.category) }} {{ selectedBusiness?.categories?.[0] || selectedBusiness?.category }}</div>
                  <div class="badge-rating">{{ selectedBusiness?.approved ? '✅ Aprobado' : '⏳ Pendiente' }}</div>
                </div>
              </div>
            </div>
            <button @click="closeDetailModal" class="btn-modal-close">
              ✕
            </button>
          </div>

          <div class="modal-modern-content mt-6">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <!-- Columna izquierda: Información -->
              <div>
                <div class="modal-section">
                  <h3 class="modal-section-title">
                    <span>📍</span> Ubicación
                  </h3>
                  <p class="text-gray-700">{{ selectedBusiness?.address }}</p>
                </div>

                <div class="modal-section">
                  <h3 class="modal-section-title">
                    <span>⏰</span> Horarios
                  </h3>
                  <div class="grid grid-cols-2 gap-3">
                    <div class="time-card-modern">
                      <p class="font-bold text-gray-900">Horario Regular</p>
                      <p class="text-emerald-600">{{ formatWorkingHours(selectedBusiness?.workingHours) }}</p>
                      <p class="text-sm text-gray-500">{{ formatWorkDays(selectedBusiness?.workingHours?.days) }}</p>
                    </div>
                    <div v-if="selectedBusiness?.workingHours?.specialDay" class="time-card-modern">
                      <p class="font-bold text-gray-900">Horario Especial</p>
                      <p class="text-emerald-600">{{ formatTime(selectedBusiness?.workingHours?.specialOpen) }} - {{ formatTime(selectedBusiness?.workingHours?.specialClose) }}</p>
                      <p class="text-sm text-gray-500">{{ getSpecialDayLabel(selectedBusiness?.workingHours?.specialDay) }}</p>
                    </div>
                  </div>
                </div>

                <div class="modal-section">
                  <h3 class="modal-section-title">
                    <span>📞</span> Contacto
                  </h3>
                  <div class="space-y-2">
                    <p class="text-gray-700">📱 Teléfono: <span class="font-bold">{{ selectedBusiness?.phone }}</span></p>
                    <p class="text-gray-700">📧 Email: <span class="font-bold">{{ selectedBusiness?.email }}</span></p>
                  </div>
                </div>
              </div>

              <!-- Columna derecha: Servicios y precios -->
              <div>
                <div class="modal-section">
                  <h3 class="modal-section-title">
                    <span>🩺</span> Servicios y Precios
                  </h3>
                  <div class="space-y-4">
                    <div 
                      v-for="(service, index) in selectedBusiness?.services" 
                      :key="index"
                      class="border border-gray-200 rounded-xl p-4 hover:border-emerald-300 transition-colors"
                    >
                      <div class="flex justify-between items-center mb-2">
                        <h4 class="font-bold text-gray-900">{{ service.name }}</h4>
                        <span class="text-xl font-bold text-emerald-600">${{ service.price }}</span>
                      </div>
                      <p class="text-sm text-gray-600">{{ service.description || 'Servicio disponible' }}</p>
                    </div>
                    <div v-if="!selectedBusiness?.services?.length" class="text-center py-4">
                      <p class="text-gray-500">No hay servicios registrados</p>
                    </div>
                  </div>
                </div>

                <div class="modal-section">
                  <h3 class="modal-section-title">
                    <span>📝</span> Descripción
                  </h3>
                  <p class="text-gray-700 leading-relaxed">
                    {{ selectedBusiness?.description || 'Sin descripción disponible' }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Estado del comercio -->
            <div class="modal-section bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200 mt-6">
              <h3 class="modal-section-title">
                <span>📊</span> Información del Comercio
              </h3>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="text-center">
                  <div class="text-2xl font-bold text-emerald-600">{{ selectedBusiness?.services?.length || 0 }}</div>
                  <p class="text-sm text-gray-600">Servicios</p>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-emerald-600">{{ selectedBusiness?.views || 0 }}</div>
                  <p class="text-sm text-gray-600">Visitas</p>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold" :class="getStatusColorClass(selectedBusiness?.status).split(' ')[0]">
                    {{ getStatusText(selectedBusiness?.status) }}
                  </div>
                  <p class="text-sm text-gray-600">Estado</p>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-gray-600">
                    {{ formatDate(selectedBusiness?.createdAt) }}
                  </div>
                  <p class="text-sm text-gray-600">Creado</p>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-modern-actions">
            <button @click="closeDetailModal" class="btn-modal-ghost">
              Cerrar
            </button>
            <button 
              @click="openEditModal(selectedBusiness)"
              class="btn-modal-outline"
            >
              ✏️ Editar Comercio
            </button>
            <button 
              @click="openServicesModal(selectedBusiness)"
              class="btn-modal-primary"
            >
              ⚙️ Gestionar Servicios
            </button>
          </div>
        </div>
      </div>
    </div>
  </ProviderLayout>
</template>

<script>
import ProviderLayout from "@/components/ProviderLayout.vue";
import api from "@/api/api";
import { formatTimeTo12Hour } from "@/utils/timeFormatter";

export default {
  name: "ProviderCommerces",
  components: { ProviderLayout },
  data() {
    return {
      businesses: [],
      searchQuery: "",
      loading: false,
      saving: false,
      managingServices: false,
      error: "",
      successMessage: "",
      validationErrors: {},
      
      stats: {
        total: 0,
        active: 0,
        pending: 0,
        totalServices: 0
      },

      // Modal de comercio
      showBusinessModal: false,
      isEditBusiness: false,
      currentBusinessId: null,
      businessData: {
        name: "",
        categories: [],
        description: "",
        address: "",
        phone: "",
        email: "",
        image: "", // Base64 string
        status: "pending",
        workingHours: {
          open: "",
          close: "",
          days: [],
          specialDay: "",
          specialOpen: "",
          specialClose: ""
        },
        services: []
      },

      // Variables para manejar imágenes
      selectedFile: null,
      processingImage: false,
      imageError: "",
      dragover: false,

      // Modal de servicios
      showServicesModal: false,
      currentBusiness: null,
      newService: {
        name: "",
        price: 0,
        description: ""
      },

      // Modal de detalle
      showDetailModal: false,
      selectedBusiness: null,

      // Datos para selectores
      availableCategories: [
        { value: "Veterinaria", label: "Veterinaria", icon: "🏥" },
        { value: "Peluquería", label: "Peluquería", icon: "✂️" },
        { value: "Guardería", label: "Guardería", icon: "🏠" },
        { value: "Tienda", label: "Tienda", icon: "🛒" },
        { value: "Entrenamiento", label: "Entrenamiento", icon: "🎓" },
        { value: "Transporte", label: "Transporte", icon: "🚗" },
        { value: "Spa", label: "Spa", icon: "💆" },
        { value: "Hotel", label: "Hotel", icon: "🏨" },
        { value: "Adopción", label: "Adopción", icon: "🐾" },
        { value: "Otro", label: "Otro", icon: "🏬" }
      ],

      workDays: [
        { value: "lunes", label: "Lun", icon: "L" },
        { value: "martes", label: "Mar", icon: "M" },
        { value: "miércoles", label: "Mié", icon: "X" },
        { value: "jueves", label: "Jue", icon: "J" },
        { value: "viernes", label: "Vie", icon: "V" },
        { value: "sábado", label: "Sáb", icon: "S" },
        { value: "domingo", label: "Dom", icon: "D" }
      ]
    };
  },
  computed: {
    filteredBusinesses() {
      if (!this.searchQuery) return this.businesses;
      const query = this.searchQuery.toLowerCase();
      return this.businesses.filter(business => 
        business.name.toLowerCase().includes(query) ||
        business.address.toLowerCase().includes(query) ||
        (business.categories && business.categories.some(cat => cat.toLowerCase().includes(query))) ||
        business.category?.toLowerCase().includes(query)
      );
    }
  },
  async created() {
    await this.fetchBusinesses();
    await this.fetchStats();
  },
  mounted() {
    const cards = this.$el.querySelectorAll(".fade-up");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    cards.forEach((card) => observer.observe(card));
  },
  methods: {
    // ============ MÉTODOS DE UTILIDAD ============
    getCategoryIcon(category) {
      const icons = {
        'Veterinaria': '🏥',
        'Peluquería': '✂️',
        'Guardería': '🏠',
        'Tienda': '🛒',
        'Entrenamiento': '🎓',
        'Transporte': '🚗',
        'Spa': '💆',
        'Hotel': '🏨',
        'Adopción': '🐾',
        'Otro': '🏬'
      };
      return icons[category] || '🏬';
    },

    getStatusColorClass(status) {
      switch(status) {
        case 'active': return 'bg-emerald-100 text-emerald-600 border-emerald-200';
        case 'pending': return 'bg-amber-100 text-amber-600 border-amber-200';
        case 'inactive': return 'bg-gray-100 text-gray-600 border-gray-200';
        default: return 'bg-gray-100 text-gray-600 border-gray-200';
      }
    },

    getStatusText(status) {
      switch(status) {
        case 'active': return '✅ Activo';
        case 'pending': return '⏳ Pendiente';
        case 'inactive': return '❌ Inactivo';
        default: return 'Desconocido';
      }
    },

    formatDate(date) {
      if (!date) return 'N/A';
      const d = new Date(date);
      return d.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    },

    formatSelectedDays(days) {
      const dayMap = {
        'lunes': 'Lun',
        'martes': 'Mar',
        'miércoles': 'Mié',
        'jueves': 'Jue',
        'viernes': 'Vie',
        'sábado': 'Sáb',
        'domingo': 'Dom'
      };
      return days.map(day => dayMap[day] || day).join(', ');
    },

    formatWorkingHours(workingHours) {
      if (!workingHours) return 'No especificado';
      if (workingHours.open && workingHours.close) {
        return `${formatTimeTo12Hour(workingHours.open)} - ${formatTimeTo12Hour(workingHours.close)}`;
      }
      return workingHours.regular || 'No especificado';
    },
    
    formatTime(time24) {
      return formatTimeTo12Hour(time24);
    },

    formatWorkDays(days) {
      if (!days || !Array.isArray(days)) return 'No especificado';
      return this.formatSelectedDays(days);
    },

    getSpecialDayLabel(specialDay) {
      const labels = {
        'festivos': 'Festivos',
        'domingos': 'Domingos',
        'sabados': 'Sábados',
        'vacaciones': 'Vacaciones'
      };
      return labels[specialDay] || specialDay;
    },

    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    formatBase64Size(base64String) {
      if (!base64String) return '0 Bytes';
      // Calcular tamaño aproximado (cada 4 caracteres Base64 = 3 bytes)
      const base64Data = base64String.includes(',') 
        ? base64String.split(',')[1] 
        : base64String;
      const bytes = Math.floor(base64Data.length * 0.75);
      return this.formatFileSize(bytes);
    },

    // ============ MÉTODOS PARA MANEJAR IMÁGENES BASE64 ============
    
    /**
     * Obtiene la imagen de un comercio (maneja Base64 y URLs)
     */
    getBusinessImage(business) {
      if (!business || !business.image || business.image.trim() === '') {
        console.log('📭 Sin imagen para comercio:', business?.name || 'Desconocido');
        return this.getPlaceholderImage();
      }
      
      // Si ya es Base64, devolver directamente
      if (business.image.startsWith('data:image/')) {
        console.log('✅ Es Base64 para comercio:', business.name);
        return business.image;
      }
      
      // Si es una URL, devolverla
      if (business.image.startsWith('http://') || business.image.startsWith('https://') || business.image.startsWith('/')) {
        console.log('🔗 Es URL para comercio:', business.name);
        return business.image;
      }
      
      // Si parece ser solo un nombre de archivo, asumir que es Base64 mal almacenado
      console.log('⚠️ Posible Base64 sin prefijo para comercio:', business.name);
      
      // Intentar verificar si es Base64 (contiene solo caracteres Base64 válidos)
      const base64Regex = /^[A-Za-z0-9+/]+=*$/;
      if (base64Regex.test(business.image)) {
        // Intentar reconstruir como Base64 con un tipo común
        console.log('🔧 Reconstruyendo Base64 para comercio:', business.name);
        return `data:image/jpeg;base64,${business.image}`;
      }
      
      // Si todo falla, usar placeholder
      console.log('❌ No se pudo determinar el tipo de imagen para comercio:', business.name);
      return this.getPlaceholderImage();
    },

    /**
     * Obtiene una imagen de placeholder segura
     */
    getPlaceholderImage() {
      // SVG placeholder en Base64
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmZGY1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzY2NjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlbiA6KDwvdGV4dD48L3N2Zz4=';
    },

    handleBusinessImageError(event, business) {
      console.error('❌ Error cargando imagen del comercio:', {
        name: business.name,
        image: business.image ? `[${business.image.substring(0, 50)}...]` : 'Sin imagen'
      });
      
      // Intentar cargar el placeholder
      event.target.src = this.getPlaceholderImage();
      event.target.onerror = null; // Prevenir bucles infinitos
    },

    handleBusinessImageLoad(event, business) {
      console.log('✅ Imagen de comercio cargada correctamente:', {
        name: business.name,
        isBase64: event.target.src.startsWith('data:image/')
      });
    },

    handlePreviewImageError(event) {
      console.error('❌ Error cargando vista previa de imagen');
      event.target.src = this.getPlaceholderImage();
      event.target.onerror = null; // Prevenir bucles infinitos
    },

    handlePreviewImageLoad(event) {
      console.log('✅ Vista previa de imagen cargada correctamente');
      this.imageError = '';
    },

    // ============ MÉTODOS PARA PROCESAR IMÁGENES A BASE64 ============
    
    triggerFileInput() {
      console.log('🎯 Activando input de archivo');
      this.$refs.fileInput.click();
    },

    handleFileSelect(event) {
      console.log('📄 Archivo seleccionado:', event.target.files[0]);
      const file = event.target.files[0];
      if (file) {
        this.processFile(file);
      }
    },

    handleFileDrop(event) {
      event.preventDefault();
      this.dragover = false;
      const file = event.dataTransfer.files[0];
      console.log('📤 Archivo arrastrado:', file);
      
      if (file && file.type.startsWith('image/')) {
        this.processFile(file);
      } else {
        this.imageError = 'Por favor, selecciona solo archivos de imagen.';
        setTimeout(() => this.imageError = '', 5000);
      }
    },

    async processFile(file) {
      try {
        console.log('🔄 Procesando archivo a Base64...');
        this.imageError = "";
        this.processingImage = true;
        
        // Validar tamaño (5MB máximo)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
          this.imageError = `La imagen es muy grande (${this.formatFileSize(file.size)}). Máximo 5MB.`;
          console.error('❌ Archivo muy grande:', this.imageError);
          setTimeout(() => this.imageError = '', 5000);
          this.processingImage = false;
          return;
        }

        // Validar tipo
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!validTypes.includes(file.type)) {
          this.imageError = `Formato no válido (${file.type}). Usa JPEG, PNG, WebP o GIF.`;
          console.error('❌ Formato inválido:', this.imageError);
          setTimeout(() => this.imageError = '', 5000);
          this.processingImage = false;
          return;
        }

        // Convertir a Base64
        const base64 = await this.fileToBase64(file);
        console.log('✅ Archivo convertido a Base64, tamaño Base64:', this.formatBase64Size(base64));
        
        // Guardar en businessData
        this.businessData.image = base64;
        
        this.selectedFile = file;
        
        console.log('✅ Imagen procesada exitosamente a Base64');
        this.successMessage = 'Imagen convertida a Base64 correctamente';
        setTimeout(() => this.successMessage = '', 3000);
        
      } catch (error) {
        console.error('❌ Error procesando archivo:', error);
        this.imageError = 'Error procesando la imagen. Intenta con otra.';
        setTimeout(() => this.imageError = '', 5000);
      } finally {
        this.processingImage = false;
      }
    },

    /**
     * Convierte un archivo a Base64
     */
    fileToBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          console.log('📊 Base64 generado, primeros 50 caracteres:', reader.result.substring(0, 50));
          resolve(reader.result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    },

    removeImage() {
      console.log('🗑️ Eliminando imagen seleccionada');
      this.selectedFile = null;
      this.businessData.image = '';
      this.imageError = '';
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = '';
      }
    },

    getUploadStatusText() {
      if (this.processingImage) return 'Convirtiendo a Base64...';
      if (this.businessData.image) {
        return '✅ Imagen lista (Base64)';
      }
      if (this.selectedFile) return `Archivo: ${this.selectedFile.name}`;
      return 'Arrastra una imagen aquí o haz clic para seleccionar';
    },

    getUploadSubText() {
      if (this.processingImage) return 'Por favor espera...';
      if (this.businessData.image) {
        return 'Se almacenará como Base64 en la base de datos';
      }
      return 'JPEG, PNG, WebP, GIF hasta 5MB. Se convertirá a Base64.';
    },

    // ============ MÉTODOS DE NEGOCIO ============
    
    searchBusinesses() {
      console.log('🔍 Buscando comercios con query:', this.searchQuery);
    },

    async fetchBusinesses() {
      try {
        this.loading = true;
        this.error = "";
        console.log('📡 Obteniendo comercios del proveedor...');
        
        const res = await api.get("/businesses/provider/my-businesses");
        console.log('✅ Comercios recibidos:', res.data);
        
        this.businesses = res.data.businesses || res.data || [];
        console.log(`📊 Total de comercios: ${this.businesses.length}`);
        
        // Depuración: mostrar información de imágenes
        this.businesses.forEach((business, index) => {
          console.log(`Comercio ${index + 1}: "${business.name}"`, {
            hasImage: !!business.image,
            isBase64: business.image?.startsWith('data:image/'),
            isURL: business.image?.startsWith('http') || business.image?.startsWith('/'),
            imageLength: business.image?.length || 0,
            imagePreview: business.image ? `[${business.image.substring(0, 50)}...]` : 'Sin imagen'
          });
        });
        
      } catch (err) {
        console.error("❌ Error cargando comercios:", err);
        this.error = err.response?.data?.message || "Error al cargar los comercios. Por favor, intenta de nuevo.";
      } finally {
        this.loading = false;
      }
    },

    async fetchStats() {
      try {
        console.log('📊 Obteniendo estadísticas...');
        const res = await api.get("/businesses/provider/stats");
        this.stats = res.data.stats || res.data || {};
        console.log('✅ Estadísticas:', this.stats);
      } catch (err) {
        console.error("❌ Error cargando estadísticas:", err);
        // No mostramos error aquí porque no es crítico
      }
    },

    openAddModal() {
      console.log("➕ Abriendo modal de agregar comercio");
      this.isEditBusiness = false;
      this.currentBusinessId = null;
      this.validationErrors = {};
      this.selectedFile = null;
      this.businessData.image = '';
      this.imageError = '';
      this.businessData = {
        name: "",
        categories: [],
        description: "",
        address: "",
        phone: "",
        email: "",
        image: "", // Base64 vacío
        status: "pending",
        workingHours: {
          open: "",
          close: "",
          days: [],
          specialDay: "",
          specialOpen: "",
          specialClose: ""
        },
        services: []
      };
      this.showBusinessModal = true;
    },

    openEditModal(business) {
      console.log("✏️ Abriendo modal de editar comercio:", business);
      this.isEditBusiness = true;
      this.currentBusinessId = business._id;
      this.validationErrors = {};
      this.selectedFile = null;
      this.imageError = '';
      
      // Convertir datos al formato correcto
      const categories = business.categories || (business.category ? [business.category] : []);
      
      // Preparar workingHours
      let workingHours = {
        open: business.workingHours?.open || "",
        close: business.workingHours?.close || "",
        days: [],
        specialDay: business.workingHours?.specialDay || "",
        specialOpen: business.workingHours?.specialOpen || "",
        specialClose: business.workingHours?.specialClose || ""
      };

      // Procesar días de trabajo
      if (business.workingHours?.days) {
        if (Array.isArray(business.workingHours.days)) {
          workingHours.days = business.workingHours.days;
        } else if (typeof business.workingHours.days === 'string') {
          // Convertir string a array
          const dayMap = {
            'lunes': 'lunes', 'Lunes': 'lunes',
            'martes': 'martes', 'Martes': 'martes',
            'miércoles': 'miércoles', 'Miércoles': 'miérculos',
            'jueves': 'jueves', 'Jueves': 'jueves',
            'viernes': 'viernes', 'Viernes': 'viernes',
            'sábado': 'sábado', 'Sábado': 'sábado',
            'domingo': 'domingo', 'Domingo': 'domingo'
          };
          
          workingHours.days = business.workingHours.days
            .split(',')
            .map(d => d.trim().toLowerCase())
            .filter(d => this.workDays.some(wd => wd.value === d));
        }
      }

      this.businessData = { 
        name: business.name || "",
        categories: categories,
        description: business.description || "",
        address: business.address || "",
        phone: business.phone || "",
        email: business.email || "",
        image: business.image || "", // Mantener Base64 si existe
        status: business.status || "pending",
        workingHours: workingHours,
        services: business.services || []
      };
      this.showBusinessModal = true;
      this.showDetailModal = false;
    },

    closeBusinessModal() {
      console.log("❌ Cerrando modal de comercio");
      this.showBusinessModal = false;
      this.validationErrors = {};
      this.selectedFile = null;
      this.imageError = '';
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = '';
      }
    },

    openServicesModal(business) {
      console.log("⚙️ Abriendo modal de servicios:", business);
      this.currentBusiness = business;
      this.businessData.services = [...(business.services || [])];
      this.newService = { name: "", price: 0, description: "" };
      this.showServicesModal = true;
    },

    closeServicesModal() {
      console.log("❌ Cerrando modal de servicios");
      this.showServicesModal = false;
      this.managingServices = false;
    },

    openBusinessDetailModal(business) {
      console.log("🔍 Abriendo modal de detalle:", business);
      this.selectedBusiness = business;
      this.showDetailModal = true;
    },

    closeDetailModal() {
      console.log("❌ Cerrando modal de detalle");
      this.showDetailModal = false;
    },

    addService() {
      if (this.newService.name.trim() && this.newService.price > 0) {
        this.businessData.services.push({
          name: this.newService.name.trim(),
          price: parseFloat(this.newService.price),
          description: this.newService.description.trim() || '',
          duration: 60,
          isActive: true
        });
        this.newService = { name: "", price: 0, description: "" };
      }
    },

    removeService(index) {
      this.businessData.services.splice(index, 1);
    },

    validateBusinessData() {
      this.validationErrors = {};

      // Validar campos requeridos
      if (!this.businessData.name.trim()) {
        this.validationErrors.name = "El nombre del comercio es requerido";
      }

      if (this.businessData.categories.length === 0) {
        this.validationErrors.categories = "Debe seleccionar al menos una categoría";
      }

      if (!this.businessData.description.trim()) {
        this.validationErrors.description = "La descripción es requerida";
      }

      if (!this.businessData.address.trim()) {
        this.validationErrors.address = "La dirección es requerida";
      }

      if (!this.businessData.phone.trim()) {
        this.validationErrors.phone = "El teléfono es requerido";
      }

      if (!this.businessData.email.trim()) {
        this.validationErrors.email = "El email es requerido";
      }

      // Validar formato de email
      const emailRegex = /^\S+@\S+\.\S+$/;
      if (this.businessData.email && !emailRegex.test(this.businessData.email)) {
        this.validationErrors.email = "Formato de email inválido";
      }

      // Validar formato de teléfono (mínimo 8 dígitos)
      const phoneRegex = /^[0-9+\-\s()]{8,15}$/;
      if (this.businessData.phone && !phoneRegex.test(this.businessData.phone)) {
        this.validationErrors.phone = "Formato de teléfono inválido (8-15 dígitos)";
      }

      // Validar imagen (requerida solo para crear nuevo, no para editar)
      if (!this.isEditBusiness && !this.businessData.image.trim()) {
        this.validationErrors.image = "La imagen es requerida. Selecciona una imagen de tu dispositivo.";
      }

      // Validar horarios
      if (!this.businessData.workingHours.open) {
        this.validationErrors['workingHours.open'] = "La hora de apertura es requerida";
      } else if (!/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/.test(this.businessData.workingHours.open)) {
        this.validationErrors['workingHours.open'] = "Formato inválido (use HH:MM)";
      }

      if (!this.businessData.workingHours.close) {
        this.validationErrors['workingHours.close'] = "La hora de cierre es requerida";
      } else if (!/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/.test(this.businessData.workingHours.close)) {
        this.validationErrors['workingHours.close'] = "Formato inválido (use HH:MM)";
      }

      if (this.businessData.workingHours.days.length === 0) {
        this.validationErrors['workingHours.days'] = "Selecciona al menos un día de trabajo";
      }

      // Validar servicios
      this.businessData.services.forEach((service, index) => {
        if (!service.name || !service.name.trim()) {
          this.validationErrors[`services.${index}.name`] = "El nombre del servicio es requerido";
        }
        if (service.price === undefined || service.price === null || service.price < 0) {
          this.validationErrors[`services.${index}.price`] = "El precio del servicio debe ser un número positivo";
        }
      });

      return Object.keys(this.validationErrors).length === 0;
    },

    async saveBusiness() {
      try {
        this.saving = true;
        this.error = "";
        this.validationErrors = {};

        console.log('💾 Iniciando guardado de comercio con Base64...');
        console.log('📝 Datos del comercio:', {
          ...this.businessData,
          image: this.businessData.image ? `[Base64, ${this.formatBase64Size(this.businessData.image)}]` : 'Sin imagen'
        });

        // Validar datos primero
        if (!this.validateBusinessData()) {
          console.error('❌ Errores de validación:', this.validationErrors);
          throw new Error("Por favor, corrige los errores en el formulario");
        }

        // Preparar datos para enviar
        const businessDataToSend = {
          name: this.businessData.name.trim(),
          category: this.businessData.categories[0] || "Otro",
          categories: this.businessData.categories,
          description: this.businessData.description.trim(),
          address: this.businessData.address.trim(),
          phone: this.businessData.phone.trim(),
          email: this.businessData.email.trim(),
          image: this.businessData.image, // Base64
          status: this.businessData.status,
          workingHours: {
            open: this.businessData.workingHours.open,
            close: this.businessData.workingHours.close,
            days: this.businessData.workingHours.days,
            specialDay: this.businessData.workingHours.specialDay || "",
            specialOpen: this.businessData.workingHours.specialOpen || "",
            specialClose: this.businessData.workingHours.specialClose || ""
          },
          services: this.businessData.services.map(service => ({
            name: service.name.trim(),
            price: parseFloat(service.price),
            description: (service.description || "").trim(),
            duration: service.duration || 60,
            isActive: service.isActive !== undefined ? service.isActive : true
          }))
        };

        console.log("📤 Enviando datos del comercio al servidor...");
        console.log("🖼️ Imagen Base64:", this.businessData.image ? 'Presente' : 'Ausente');

        let res;
        if (this.isEditBusiness) {
          console.log(`✏️ Actualizando comercio ID: ${this.currentBusinessId}`);
          res = await api.put(`/businesses/${this.currentBusinessId}`, businessDataToSend);
        } else {
          console.log("➕ Creando nuevo comercio con Base64");
          res = await api.post("/businesses", businessDataToSend);
        }
        
        console.log("✅ Respuesta del servidor:", res.data);
        
        // Actualizar datos locales
        await this.fetchBusinesses();
        await this.fetchStats();
        this.closeBusinessModal();
        
        this.successMessage = res.data.message || `Comercio ${this.isEditBusiness ? 'actualizado' : 'creado'} exitosamente`;
        
        setTimeout(() => {
          this.successMessage = "";
        }, 5000);
      } catch (err) {
        console.error("❌ Error guardando comercio:", err);
        console.error("📊 Detalles del error:", err.response?.data);
        
        this.error = err.response?.data?.message || err.message || "Error al guardar el comercio. Por favor, intenta de nuevo.";
      } finally {
        this.saving = false;
      }
    }
  }
};
</script>

<style scoped>
/* Estilos específicos para esta vista */
.fade-up {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.8s ease-out, transform 0.8s ease-out;
}
.fade-up.show {
  opacity: 1;
  transform: translateY(0);
}

/* Overlay para modales */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Cards modernas (estilo landing) */
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
  transform: translateY(-8px);
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.1),
    0 0 0 1px #10b981,
    0 0 20px rgba(16, 185, 129, 0.1);
  border-color: #10b981;
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

/* Badges */
.badge-primary {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-weight: bold;
  font-size: 0.875rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 6px rgba(16, 185, 129, 0.2);
}

.badge-outline {
  background: white;
  color: #10b981;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-weight: bold;
  font-size: 0.875rem;
  border: 1px solid #10b981;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.badge-tag {
  background: #f0fdfa;
  color: #0d9488;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  border: 1px solid #99f6e4;
}

.badge-rating {
  background: #fef3c7;
  color: #d97706;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  border: 1px solid #fcd34d;
}

/* Botones */
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

.btn-modern-sm {
  background: white;
  color: #10b981;
  padding: 0.5rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
  cursor: pointer;
}

.btn-modern-sm:hover:not(:disabled) {
  background: #f0fdfa;
  border-color: #10b981;
  transform: translateX(4px);
}

.btn-modern-sm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Modales */
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

.modal-modern-box::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, #10b981, transparent);
}

.modal-modern-header {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.avatar-modern-lg {
  flex-shrink: 0;
}

.time-card-modern {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
  transition: all 0.3s ease;
}

.time-card-modern:hover {
  border-color: #10b981;
  background: #f0fdfa;
  transform: translateY(-2px);
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
  text-decoration: none;
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

.btn-modal-outline:disabled {
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
  border-color: #10b981;
}

.btn-modal-ghost:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Formularios */
.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-label-sm {
  display: block;
  font-size: 0.75rem;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: white;
  color: #1f2937;
}

.form-input:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.form-input:disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
}

.form-input::placeholder {
  color: #9ca3af;
}

/* Checkbox personalizado */
input[type="checkbox"]:checked + label {
  border-color: #10b981;
  background-color: #f0fdfa;
  color: #047857;
}

/* Utilidades */
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
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

/* Responsive */
@media (max-width: 768px) {
  .grid.grid-cols-1.md\\:grid-cols-2.xl\\:grid-cols-3 {
    grid-template-columns: 1fr;
  }
  
  .grid.grid-cols-2.md\\:grid-cols-4 {
    grid-template-columns: repeat(2, 1fr);
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
  
  .card-modern figure {
    height: 200px;
  }
  
  /* Responsive para días de trabajo */
  .grid.grid-cols-3.sm\\:grid-cols-7 {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* Estilos para checkboxes de categorías y días */
.checkbox-container label {
  transition: all 0.2s ease;
  user-select: none;
}

.checkbox-container input:checked + label {
  transform: scale(0.98);
}

/* Utilidades para imágenes */
.object-cover {
  object-fit: cover;
}

.bg-gray-100 {
  background-color: #f3f4f6;
}

.bg-gray-200 {
  background-color: #e5e7eb;
}
</style>