<template>
  <AdminLayout>
  
    <div class="px-6 max-w-7xl mx-auto w-full pt-6">
      <!-- Header con estilo moderno -->
      <div class="mb-10 fade-up">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 mb-4 border border-emerald-200">
          <span class="text-2xl text-emerald-600">🏬</span>
        </div>
        <h1 class="text-4xl font-bold text-neutral-dark mb-3">Gestión de Comercios</h1>
        <p class="text-lg text-gray-700 max-w-3xl">
          Administra y gestiona todos los comercios registrados en PetServices
        </p>
      </div>

      <!-- Barra de herramientas moderna -->
      <div class="mb-4 bg-white rounded-2xl shadow-lg border border-gray-200 p-6 fade-up">
        <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div class="flex flex-col lg:flex-row gap-6 w-full">
            <!-- Búsqueda -->
            <div class="relative w-full lg:w-96">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              </div>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Buscar comercios por nombre, proveedor o ubicación..."
                class="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 bg-white text-gray-900"
                @keyup.enter="searchBusinesses"
              />
            </div>

            <!-- Filtros -->
            <div class="flex flex-wrap gap-3">
              <!-- Filtro por estado -->
              <div class="relative">
                <select 
                  v-model="filters.status" 
                  class="appearance-none bg-white border border-gray-300 rounded-xl pl-4 pr-10 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 text-gray-900 cursor-pointer"
                  @change="applyFilters"
                >
                  <option value="">Todos los estados</option>
                  <option value="pending">⏳ Pendientes</option>
                  <option value="active">✅ Activos</option>
                  <option value="inactive">❌ Inactivos</option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span class="text-gray-500">▼</span>
                </div>
              </div>

              <!-- Filtro por categoría -->
              <div class="relative">
                <select 
                  v-model="filters.category" 
                  class="appearance-none bg-white border border-gray-300 rounded-xl pl-4 pr-10 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 text-gray-900 cursor-pointer"
                  @change="applyFilters"
                >
                  <option value="">Todas las categorías</option>
                  <option v-for="category in availableCategories" :key="category.value" :value="category.value">
                    {{ category.icon }} {{ category.label }}
                  </option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span class="text-gray-500">▼</span>
                </div>
              </div>

              <!-- Filtro por aprobación -->
              <div class="relative">
                <select 
                  v-model="filters.approved" 
                  class="appearance-none bg-white border border-gray-300 rounded-xl pl-4 pr-10 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 text-gray-900 cursor-pointer"
                  @change="applyFilters"
                >
                  <option value="">Todos</option>
                  <option value="true">✅ Aprobados</option>
                  <option value="false">⏳ Por aprobar</option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span class="text-gray-500">▼</span>
                </div>
              </div>

              <!-- Filtro por destacado -->
              <div class="relative">
                <select 
                  v-model="filters.featured" 
                  class="appearance-none bg-white border border-gray-300 rounded-xl pl-4 pr-10 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 text-gray-900 cursor-pointer"
                  @change="applyFilters"
                >
                  <option value="">Todos</option>
                  <option value="true">⭐ Destacados</option>
                  <option value="false">Normal</option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span class="text-gray-500">▼</span>
                </div>
              </div>
            </div>
          </div>

          <button
            @click="openAddModal"
            class="btn-primary group flex items-center gap-3 px-8 py-3.5 text-lg whitespace-nowrap"
            :disabled="loading"
          >
            <span class="text-xl">🏬</span>
            <span>{{ loading ? 'Cargando...' : 'Crear Comercio' }}</span>
            <span v-if="!loading" class="ml-2 group-hover:rotate-90 transition-transform duration-300">→</span>
          </button>
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

      <!-- Grid de comercios -->
      <div v-if="loading" class="text-center py-16 fade-up">
        <div class="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-200">
          <span class="text-3xl text-emerald-600 animate-pulse">⏳</span>
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-3">Cargando comercios</h3>
        <p class="text-gray-700">Espera un momento por favor...</p>
      </div>

      <div v-else-if="businesses.length > 0" class="mb-16">
        <!-- Header de la sección -->
        <div class="text-center mb-12 fade-up">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 mb-4 border border-emerald-200">
            <span class="text-2xl text-emerald-600">⭐</span>
          </div>
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Comercios Registrados
          </h2>
          <p class="text-lg text-gray-700 max-w-2xl mx-auto">
            Gestiona el estado y aprobación de todos los comercios
          </p>
        </div>

        <!-- Grid de cards modernas con imágenes -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ">
          <div
            v-for="business in businesses"
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
              <div class="absolute top-4 right-4 flex flex-col gap-2">
                <div :class="[
                  'badge-primary',
                  business.approved ? 'bg-emerald-500' : 'bg-amber-500'
                ]">
                  {{ business.approved ? '✅ Aprobado' : '⏳ Pendiente' }}
                </div>
                <div v-if="business.featured" class="badge-primary bg-purple-500">
                  ⭐ Destacado
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
                    <span class="text-emerald-500">👤</span>
                    <span class="line-clamp-1">{{ business.provider?.name || 'Proveedor no asignado' }}</span>
                  </div>
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

              <!-- Footer con acciones del admin -->
              <div class="card-actions justify-between items-center mt-2">
                <div>
                  <p class="text-sm text-gray-500">
                    {{ getStatusText(business.status) }}
                  </p>
                  <p class="text-xs text-gray-500">
                    {{ business.services?.length || 0 }} servicios
                  </p>
                </div>
                <div class="flex gap-2">
                  <!-- Botón para cambiar estado con tooltip -->
                  <div class="relative group">
                    <select 
                      v-model="business.status"
                      @change="updateBusinessStatus(business)"
                      :class="[
                        'text-xs font-medium px-3 py-1.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-200 cursor-pointer',
                        getStatusSelectClass(business.status)
                      ]"
                    >
                      <option value="pending" class="bg-amber-50 text-amber-700">⏳ Pendiente</option>
                      <option value="active" class="bg-emerald-50 text-emerald-700">✅ Activo</option>
                      <option value="inactive" class="bg-red-50 text-red-700">❌ Inactivo</option>
                    </select>
                    <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
                      Cambiar estado
                      <div class="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                  
                  <button 
                    @click="openBusinessDetailModal(business)"
                    class="btn-modern-sm group relative"
                    title="Ver detalles"
                  >
                    <span>👁️</span>
                    <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
                      Ver detalles
                      <div class="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Paginación -->
        <div v-if="pagination.totalPages > 1" class="mt-12 flex justify-center fade-up">
          <div class="flex items-center gap-2">
            <button
              @click="prevPage"
              :disabled="pagination.currentPage === 1"
              class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              ← Anterior
            </button>
            
            <div class="flex items-center gap-1">
              <span
                v-for="page in visiblePages"
                :key="page"
                @click="goToPage(page)"
                :class="[
                  'px-3 py-1 rounded-lg cursor-pointer transition-all duration-200',
                  pagination.currentPage === page
                    ? 'bg-emerald-500 text-white font-medium'
                    : 'hover:bg-gray-100 text-gray-700'
                ]"
              >
                {{ page }}
              </span>
              <span v-if="hasMorePages" class="px-2 text-gray-500">...</span>
            </div>
            
            <button
              @click="nextPage"
              :disabled="pagination.currentPage === pagination.totalPages"
              class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Siguiente →
            </button>
          </div>
        </div>
      </div>

      <!-- Estado vacío -->
      <div v-else class="text-center py-20 fade-up">
        <div class="w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-200">
          <span class="text-4xl text-emerald-600">🏬</span>
        </div>
        <h3 class="text-2xl font-bold text-gray-900 mb-3">No hay comercios registrados</h3>
        <p class="text-gray-700 mb-8 max-w-md mx-auto">
          {{ searchQuery || Object.values(filters).some(f => f) ? 'No se encontraron comercios con los filtros aplicados' : 'Comienza creando el primer comercio' }}
        </p>
        <button
          @click="resetFilters"
          v-if="searchQuery || Object.values(filters).some(f => f)"
          class="btn-primary group text-lg px-8 py-4 mr-4"
        >
          <span>🔄 Limpiar Filtros</span>
        </button>
        <button
          @click="openAddModal"
          class="btn-primary group text-lg px-8 py-4"
        >
          <span>🏬 Crear Primer Comercio</span>
          <span class="ml-2 group-hover:rotate-90 transition-transform duration-300">→</span>
        </button>
      </div>

      <!-- MODAL PARA CREAR/EDITAR COMERCIO (Admin puede crear para cualquier proveedor) -->
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
                  <div class="badge-outline">📋 ADMINISTRACIÓN</div>
                  <div v-if="!isEditBusiness" class="badge-outline bg-green-50 text-green-700 border-green-200">
                    ⚡ Creación Directa
                  </div>
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

                      <!-- Selector de proveedor (solo admin y para crear) -->
                      <div v-if="!isEditBusiness">
                        <label class="form-label">Proveedor *</label>
                        <div class="relative">
                          <select 
                            v-model="businessData.provider"
                            required
                            class="form-input appearance-none pr-10 cursor-pointer"
                            :disabled="saving || loadingProviders"
                          >
                            <option value="">Seleccionar proveedor...</option>
                            <option 
                              v-for="provider in providers" 
                              :key="provider._id"
                              :value="provider._id"
                            >
                              👤 {{ provider.name }} {{ provider.lastname }} - {{ provider.email }}
                            </option>
                          </select>
                          <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <span class="text-gray-500">▼</span>
                          </div>
                        </div>
                        <p v-if="loadingProviders" class="text-sm text-gray-500 mt-1">
                          Cargando proveedores...
                        </p>
                        <p v-if="validationErrors.provider" class="text-sm text-red-600 mt-1">
                          {{ validationErrors.provider }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <!-- Ubicación y Contacto -->
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

                  <!-- Configuración del admin -->
                  <div class="modal-section bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                    <h3 class="modal-section-title">
                      <span>⚙️</span> Configuración de Administrador
                    </h3>
                    <div class="space-y-4">
                      <div>
                        <label class="form-label">Estado del Comercio</label>
                        <p class="text-sm text-gray-600 mb-2">
                          {{ isEditBusiness ? 'Actualiza el estado actual' : 'El comercio se creará directamente como activo' }}
                        </p>
                        <div class="grid grid-cols-3 gap-2">
                          <div 
                            v-for="statusOption in statusOptions" 
                            :key="statusOption.value"
                            class="relative"
                          >
                            <input 
                              type="radio"
                              :id="'status-' + statusOption.value"
                              :value="statusOption.value"
                              v-model="businessData.status"
                              class="hidden peer"
                              :disabled="saving"
                            />
                            <label 
                              :for="'status-' + statusOption.value"
                              :class="[
                                'flex flex-col items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors duration-200 peer-checked:border-2 peer-checked:font-medium',
                                statusOption.borderColor,
                                statusOption.bgColor
                              ]"
                            >
                              <span class="text-lg mb-1">{{ statusOption.icon }}</span>
                              <span class="text-xs">{{ statusOption.label }}</span>
                              <span v-if="!isEditBusiness && statusOption.value === 'active'" 
                                    class="text-xs text-green-600 font-bold mt-1">(Inicial)</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label class="form-label">Aprobación</label>
                        <div class="flex items-center gap-3">
                          <label class="inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              v-model="businessData.approved"
                              class="sr-only peer"
                              :disabled="saving"
                              :checked="isEditBusiness ? businessData.approved : true"
                            />
                            <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                            <span class="ml-3 text-sm font-medium text-gray-900">
                              {{ businessData.approved ? '✅ Aprobado' : '⏳ Pendiente' }}
                            </span>
                            <span v-if="!isEditBusiness" class="ml-2 text-sm text-green-600 font-bold">(Por defecto para admin)</span>
                          </label>
                        </div>
                        <p class="text-sm text-gray-600 mt-2">
                          {{ isEditBusiness 
                            ? 'Los comercios aprobados son visibles para los usuarios' 
                            : 'Como administrador, los comercios se crean directamente aprobados' }}
                        </p>
                      </div>

                      <div>
                        <label class="form-label">Destacado</label>
                        <div class="flex items-center gap-3">
                          <label class="inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              v-model="businessData.featured"
                              class="sr-only peer"
                              :disabled="saving"
                            />
                            <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                            <span class="ml-3 text-sm font-medium text-gray-900">
                              {{ businessData.featured ? '⭐ Destacado' : 'Normal' }}
                            </span>
                          </label>
                        </div>
                        <p class="text-sm text-gray-600 mt-2">
                          Los comercios destacados aparecen en secciones especiales
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- HORARIOS DE ATENCIÓN -->
              <div class="modal-section bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200">
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
                  <div :class="[
                    'badge-rating',
                    selectedBusiness?.approved ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-amber-100 text-amber-700 border-amber-200'
                  ]">
                    {{ selectedBusiness?.approved ? '✅ Aprobado' : '⏳ Pendiente' }}
                  </div>
                  <div v-if="selectedBusiness?.featured" class="badge-rating bg-purple-100 text-purple-700 border-purple-200">
                    ⭐ Destacado
                  </div>
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
                    <span>👤</span> Información del Proveedor
                  </h3>
                  <div v-if="selectedBusiness?.provider" class="space-y-3">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <span class="text-emerald-600">👤</span>
                      </div>
                      <div>
                        <p class="font-bold text-gray-900">{{ selectedBusiness.provider.name }} {{ selectedBusiness.provider.lastname }}</p>
                        <p class="text-sm text-gray-600">{{ selectedBusiness.provider.email }}</p>
                        <p class="text-sm text-gray-600">{{ selectedBusiness.provider.phone || 'Sin teléfono' }}</p>
                      </div>
                    </div>
                  </div>
                  <div v-else class="text-gray-500">
                    Sin información del proveedor
                  </div>
                </div>

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
                    <div class="mt-3">
                      <p class="text-sm font-medium text-gray-900 mb-1">Estado actual:</p>
                      <div class="relative group inline-block">
                        <select 
                          v-model="selectedBusiness.status"
                          @change="updateBusinessStatus(selectedBusiness)"
                          :class="[
                            'text-sm font-medium px-3 py-1.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-200 cursor-pointer',
                            getStatusSelectClass(selectedBusiness?.status)
                          ]"
                        >
                          <option value="pending" class="bg-amber-50 text-amber-700">⏳ Pendiente</option>
                          <option value="active" class="bg-emerald-50 text-emerald-700">✅ Activo</option>
                          <option value="inactive" class="bg-red-50 text-red-700">❌ Inactivo</option>
                        </select>
                        <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
                          Cambiar estado
                          <div class="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                        </div>
                      </div>
                    </div>
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

                <div class="modal-section">
                  <h3 class="modal-section-title">
                    <span>🖼️</span> Imagen del Comercio
                  </h3>
                  <div v-if="selectedBusiness?.image" class="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100">
                    <img 
                      :src="getBusinessImage(selectedBusiness)" 
                      alt="Imagen del comercio"
                      class="w-full h-full object-cover"
                      @error="handleBusinessImageError($event, selectedBusiness)"
                    />
                  </div>
                  <div v-else class="text-gray-500">
                    Sin imagen disponible
                  </div>
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
              v-if="!selectedBusiness?.approved"
              @click="approveBusiness(selectedBusiness)"
              class="btn-modal-primary"
              :disabled="loading"
            >
              ✅ Aprobar Comercio
            </button>
            <button 
              v-else
              @click="rejectBusiness(selectedBusiness)"
              class="btn-modal-outline bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:border-red-300"
              :disabled="loading"
            >
              ❌ Rechazar Comercio
            </button>
            <button 
              @click="deleteBusiness(selectedBusiness)"
              class="btn-modal-ghost text-rose-600 hover:text-rose-700 hover:bg-rose-50 hover:border-rose-200"
              :disabled="loading"
            >
              🗑️ Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
    <Chatbot />
  </AdminLayout>
</template>

<script>
import AdminLayout from "@/components/AdminLayout.vue";
import Chatbot from "@/components/Chatbot.vue";
import api from "@/api/api";
import { formatTimeTo12Hour } from "@/utils/timeFormatter";

export default {
  name: "AdminBusinesses",
  components: { AdminLayout,  Chatbot },
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
      
      // Filtros
      filters: {
        status: "",
        category: "",
        approved: "",
        featured: "",
        providerId: ""
      },
      
      // Paginación
      pagination: {
        currentPage: 1,
        itemsPerPage: 12,
        totalItems: 0,
        totalPages: 1
      },
      
      stats: {
        total: 0,
        active: 0,
        pending: 0,
        inactive: 0,
        approved: 0,
        featured: 0
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
        image: "",
        status: "active", // Admin crea como activo por defecto
        approved: true,   // Admin crea aprobado por defecto
        featured: false,
        provider: "",
        workingHours: {
          open: "09:00",
          close: "18:00",
          days: ["lunes", "martes", "miércoles", "jueves", "viernes"],
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

      // Lista de proveedores para seleccionar
      providers: [],
      loadingProviders: false,

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

      statusOptions: [
        { value: "pending", label: "Pendiente", icon: "⏳", borderColor: "border-amber-400", bgColor: "bg-amber-50 text-amber-700" },
        { value: "active", label: "Activo", icon: "✅", borderColor: "border-emerald-400", bgColor: "bg-emerald-50 text-emerald-700" },
        { value: "inactive", label: "Inactivo", icon: "❌", borderColor: "border-red-400", bgColor: "bg-red-50 text-red-700" }
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
    visiblePages() {
      const pages = [];
      const totalPages = this.pagination.totalPages;
      const current = this.pagination.currentPage;
      
      if (totalPages <= 5) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
      } else {
        if (current <= 3) {
          pages.push(1, 2, 3, 4, 5);
        } else if (current >= totalPages - 2) {
          pages.push(totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
        } else {
          pages.push(current - 2, current - 1, current, current + 1, current + 2);
        }
      }
      
      return pages;
    },
    
    hasMorePages() {
      return this.pagination.currentPage < this.pagination.totalPages - 2;
    }
  },
  async created() {
    await this.fetchBusinesses();
    await this.fetchStats();
    await this.fetchProviders();
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

    getStatusSelectClass(status) {
      switch(status) {
        case 'active': return 'bg-emerald-50 text-emerald-700 border-emerald-200 focus:ring-emerald-500';
        case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200 focus:ring-amber-500';
        case 'inactive': return 'bg-red-50 text-red-700 border-red-200 focus:ring-red-500';
        default: return 'bg-gray-50 text-gray-700 border-gray-200 focus:ring-gray-500';
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
      const base64Data = base64String.includes(',') 
        ? base64String.split(',')[1] 
        : base64String;
      const bytes = Math.floor(base64Data.length * 0.75);
      return this.formatFileSize(bytes);
    },

    // ============ MÉTODOS PARA MANEJAR IMÁGENES BASE64 ============
    getBusinessImage(business) {
      if (!business || !business.image || business.image.trim() === '') {
        return this.getPlaceholderImage();
      }
      
      if (business.image.startsWith('data:image/')) {
        return business.image;
      }
      
      if (business.image.startsWith('http://') || business.image.startsWith('https://') || business.image.startsWith('/')) {
        return business.image;
      }
      
      const base64Regex = /^[A-Za-z0-9+/]+=*$/;
      if (base64Regex.test(business.image)) {
        return `data:image/jpeg;base64,${business.image}`;
      }
      
      return this.getPlaceholderImage();
    },

    getPlaceholderImage() {
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmZGY1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzY2NjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlbiA6KDwvdGV4dD48L3N2Zz4=';
    },

    handleBusinessImageError(event, business) {
      event.target.src = this.getPlaceholderImage();
      event.target.onerror = null;
    },

    handleBusinessImageLoad(event, business) {
      // Imagen cargada correctamente
    },

    handlePreviewImageError(event) {
      event.target.src = this.getPlaceholderImage();
      event.target.onerror = null;
    },

    handlePreviewImageLoad(event) {
      this.imageError = '';
    },

    // ============ MÉTODOS PARA PROCESAR IMÁGENES A BASE64 ============
    triggerFileInput() {
      this.$refs.fileInput.click();
    },

    handleFileSelect(event) {
      const file = event.target.files[0];
      if (file) {
        this.processFile(file);
      }
    },

    handleFileDrop(event) {
      event.preventDefault();
      this.dragover = false;
      const file = event.dataTransfer.files[0];
      
      if (file && file.type.startsWith('image/')) {
        this.processFile(file);
      } else {
        this.imageError = 'Por favor, selecciona solo archivos de imagen.';
        setTimeout(() => this.imageError = '', 5000);
      }
    },

    async processFile(file) {
      try {
        this.imageError = "";
        this.processingImage = true;
        
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
          this.imageError = `La imagen es muy grande (${this.formatFileSize(file.size)}). Máximo 5MB.`;
          setTimeout(() => this.imageError = '', 5000);
          this.processingImage = false;
          return;
        }

        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!validTypes.includes(file.type)) {
          this.imageError = `Formato no válido (${file.type}). Usa JPEG, PNG, WebP o GIF.`;
          setTimeout(() => this.imageError = '', 5000);
          this.processingImage = false;
          return;
        }

        const base64 = await this.fileToBase64(file);
        this.businessData.image = base64;
        this.selectedFile = file;
        
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

    fileToBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    },

    removeImage() {
      this.selectedFile = null;
      this.businessData.image = '';
      this.imageError = '';
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = '';
      }
    },

    getUploadStatusText() {
      if (this.processingImage) return 'Convirtiendo a Base64...';
      if (this.businessData.image) return '✅ Imagen lista (Base64)';
      if (this.selectedFile) return `Archivo: ${this.selectedFile.name}`;
      return 'Arrastra una imagen aquí o haz clic para seleccionar';
    },

    getUploadSubText() {
      if (this.processingImage) return 'Por favor espera...';
      if (this.businessData.image) return 'Se almacenará como Base64 en la base de datos';
      return 'JPEG, PNG, WebP, GIF hasta 5MB. Se convertirá a Base64.';
    },

    // ============ MÉTODOS DE NEGOCIO ============
    async fetchBusinesses() {
      try {
        this.loading = true;
        this.error = "";
        
        const params = {
          page: this.pagination.currentPage,
          limit: this.pagination.itemsPerPage,
          ...this.filters
        };
        
        // Limpiar parámetros vacíos
        Object.keys(params).forEach(key => {
          if (params[key] === "" || params[key] === null || params[key] === undefined) {
            delete params[key];
          }
        });
        
        // Usar endpoint de administrador
        const res = await api.get("/businesses/admin/all-businesses", { params });
        
        this.businesses = res.data.businesses || [];
        this.pagination.totalItems = res.data.pagination?.total || this.businesses.length;
        this.pagination.totalPages = Math.ceil(this.pagination.totalItems / this.pagination.itemsPerPage);
        
        if (res.data.stats) {
          this.stats = res.data.stats;
        }
        
      } catch (err) {
        console.error("❌ Error cargando comercios:", err);
        this.error = err.response?.data?.message || "Error al cargar los comercios.";
      } finally {
        this.loading = false;
      }
    },

    async fetchStats() {
      try {
        const res = await api.get("/businesses/admin/global-stats");
        this.stats = res.data.stats || res.data || {};
      } catch (err) {
        console.error("❌ Error cargando estadísticas globales:", err);
        // Calcular estadísticas básicas desde los datos locales
        this.calculateLocalStats();
      }
    },

    calculateLocalStats() {
      const stats = {
        total: this.businesses.length,
        active: this.businesses.filter(b => b.status === 'active').length,
        pending: this.businesses.filter(b => b.status === 'pending').length,
        inactive: this.businesses.filter(b => b.status === 'inactive').length,
        approved: this.businesses.filter(b => b.approved).length,
        featured: this.businesses.filter(b => b.featured).length
      };
      this.stats = { ...this.stats, ...stats };
    },

    async fetchProviders() {
      try {
        this.loadingProviders = true;
        // Endpoint para obtener proveedores
        const res = await api.get("/users/providers");
        this.providers = res.data.users || res.data.providers || res.data || [];
      } catch (err) {
        console.error("❌ Error cargando proveedores:", err);
        // Intentar endpoint alternativo
        try {
          const res = await api.get("/admin/providers");
          this.providers = res.data.users || res.data.providers || res.data || [];
        } catch (err2) {
          console.error("❌ Error en endpoint alternativo:", err2);
          this.providers = [];
        }
      } finally {
        this.loadingProviders = false;
      }
    },

    searchBusinesses() {
      this.pagination.currentPage = 1;
      this.fetchBusinesses();
    },

    applyFilters() {
      this.pagination.currentPage = 1;
      this.fetchBusinesses();
    },

    resetFilters() {
      this.searchQuery = "";
      this.filters = {
        status: "",
        category: "",
        approved: "",
        featured: "",
        providerId: ""
      };
      this.pagination.currentPage = 1;
      this.fetchBusinesses();
    },

    // Paginación
    goToPage(page) {
      this.pagination.currentPage = page;
      this.fetchBusinesses();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    prevPage() {
      if (this.pagination.currentPage > 1) {
        this.goToPage(this.pagination.currentPage - 1);
      }
    },

    nextPage() {
      if (this.pagination.currentPage < this.pagination.totalPages) {
        this.goToPage(this.pagination.currentPage + 1);
      }
    },

    // Modal de crear/editar
    openAddModal() {
      this.isEditBusiness = false;
      this.currentBusinessId = null;
      this.validationErrors = {};
      this.selectedFile = null;
      this.imageError = '';
      
      // VALORES POR DEFECTO PARA ADMIN
      this.businessData = {
        name: "",
        categories: [],
        description: "",
        address: "",
        phone: "",
        email: "",
        image: "",
        status: "active", // ← Admin crea directamente como activo
        approved: true,   // ← Admin crea directamente aprobado
        featured: false,
        provider: "",
        workingHours: {
          open: "09:00",  // Horario por defecto
          close: "18:00", // Horario por defecto
          days: ["lunes", "martes", "miércoles", "jueves", "viernes"], // Días por defecto
          specialDay: "",
          specialOpen: "",
          specialClose: ""
        },
        services: []
      };
      
      this.showBusinessModal = true;
    },

    openEditModal(business) {
      this.isEditBusiness = true;
      this.currentBusinessId = business._id;
      this.validationErrors = {};
      this.selectedFile = null;
      this.imageError = '';
      
      const categories = business.categories || (business.category ? [business.category] : []);
      
      let workingHours = {
        open: business.workingHours?.open || "09:00",
        close: business.workingHours?.close || "18:00",
        days: [],
        specialDay: business.workingHours?.specialDay || "",
        specialOpen: business.workingHours?.specialOpen || "",
        specialClose: business.workingHours?.specialClose || ""
      };

      if (business.workingHours?.days) {
        if (Array.isArray(business.workingHours.days)) {
          workingHours.days = business.workingHours.days;
        } else if (typeof business.workingHours.days === 'string') {
          const dayMap = {
            'lunes': 'lunes', 'Lunes': 'lunes',
            'martes': 'martes', 'Martes': 'martes',
            'miércoles': 'miérculos', 'Miércoles': 'miércoles',
            'jueves': 'jueves', 'Jueves': 'jueves',
            'viernes': 'viernes', 'Viernes': 'viernes',
            'sábado': 'sábado', 'Sábado': 'sábado',
            'domingo': 'domingo', 'Domingo': 'domingo'
          };
          
          workingHours.days = business.workingHours.days
            .split(',')
            .map(d => d.trim().toLowerCase())
            .map(d => dayMap[d] || d)
            .filter(d => this.workDays.some(wd => wd.value === d));
        }
      }

      // Si no hay días, establecer por defecto
      if (workingHours.days.length === 0) {
        workingHours.days = ["lunes", "martes", "miércoles", "jueves", "viernes"];
      }

      this.businessData = { 
        name: business.name || "",
        categories: categories,
        description: business.description || "",
        address: business.address || "",
        phone: business.phone || "",
        email: business.email || "",
        image: business.image || "",
        status: business.status || "active", // ← Por defecto activo
        approved: business.approved !== undefined ? business.approved : true, // ← Por defecto aprobado
        featured: business.featured || false,
        provider: business.provider?._id || "",
        workingHours: workingHours,
        services: business.services || []
      };
      
      this.showBusinessModal = true;
      this.showDetailModal = false;
    },

    closeBusinessModal() {
      this.showBusinessModal = false;
      this.validationErrors = {};
      this.selectedFile = null;
      this.imageError = '';
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = '';
      }
    },

    // Modal de servicios
    openServicesModal(business) {
      this.currentBusiness = business;
      this.businessData.services = [...(business.services || [])];
      this.newService = { name: "", price: 0, description: "" };
      this.showServicesModal = true;
    },

    closeServicesModal() {
      this.showServicesModal = false;
      this.managingServices = false;
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

    // Modal de detalle
    openBusinessDetailModal(business) {
      this.selectedBusiness = business;
      this.showDetailModal = true;
    },

    closeDetailModal() {
      this.showDetailModal = false;
    },

    // Validación
    validateBusinessData() {
      this.validationErrors = {};

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

      const emailRegex = /^\S+@\S+\.\S+$/;
      if (this.businessData.email && !emailRegex.test(this.businessData.email)) {
        this.validationErrors.email = "Formato de email inválido";
      }

      const phoneRegex = /^[0-9+\-\s()]{8,15}$/;
      if (this.businessData.phone && !phoneRegex.test(this.businessData.phone)) {
        this.validationErrors.phone = "Formato de teléfono inválido (8-15 dígitos)";
      }

      if (!this.isEditBusiness && !this.businessData.image.trim()) {
        this.validationErrors.image = "La imagen es requerida";
      }

      if (!this.isEditBusiness && !this.businessData.provider) {
        this.validationErrors.provider = "Debe seleccionar un proveedor";
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

      return Object.keys(this.validationErrors).length === 0;
    },

    // Guardar comercio - CORREGIDA LA LÓGICA DE ESTADO
    async saveBusiness() {
      try {
        this.saving = true;
        this.error = "";
        this.validationErrors = {};

        if (!this.validateBusinessData()) {
          throw new Error("Por favor, corrige los errores en el formulario");
        }

        // Determinar el estado inicial basado en quién está creando
        const initialStatus = this.isEditBusiness 
          ? this.businessData.status 
          : "active"; // Admin crea directamente como activo

        // Determinar aprobación: admin siempre crea aprobado
        const initialApproved = this.isEditBusiness 
          ? this.businessData.approved 
          : true; // Admin siempre crea aprobado

        const businessDataToSend = {
          name: this.businessData.name.trim(),
          category: this.businessData.categories[0] || "Otro",
          categories: this.businessData.categories,
          description: this.businessData.description.trim(),
          address: this.businessData.address.trim(),
          phone: this.businessData.phone.trim(),
          email: this.businessData.email.trim(),
          image: this.businessData.image,
          status: initialStatus, // Usar estado calculado
          approved: initialApproved, // Usar aprobación calculada
          featured: this.businessData.featured,
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

        console.log("📤 Enviando datos del comercio:", businessDataToSend);
        console.log("👤 Rol del usuario: Admin");
        console.log("📝 Estado inicial:", initialStatus);
        console.log("✅ Aprobado inicialmente:", initialApproved);

        let res;
        if (this.isEditBusiness) {
          res = await api.put(`/businesses/${this.currentBusinessId}`, businessDataToSend);
        } else {
          // Para crear, incluir providerId
          const createData = { ...businessDataToSend };
          if (this.businessData.provider) {
            createData.provider = this.businessData.provider;
          }
          res = await api.post("/businesses", createData);
        }
        
        await this.fetchBusinesses();
        await this.fetchStats();
        this.closeBusinessModal();
        
        this.successMessage = res.data.message || `Comercio ${this.isEditBusiness ? 'actualizado' : 'creado'} exitosamente`;
        setTimeout(() => this.successMessage = "", 5000);
      } catch (err) {
        console.error("❌ Error guardando comercio:", err);
        this.error = err.response?.data?.message || err.message || "Error al guardar el comercio.";
        
        if (err.response?.data?.errors) {
          this.validationErrors = { ...this.validationErrors, ...err.response.data.errors };
        }
      } finally {
        this.saving = false;
      }
    },

    // Actualizar estado del comercio - CORREGIDA LA LÓGICA
    async updateBusinessStatus(business) {
      try {
        this.loading = true;
        
        // Guardar el estado original por si falla
        const originalStatus = business.status;
        
        // Si se cambia a 'inactive', también desaprobar
        const updates = { status: business.status };
        if (business.status === 'inactive') {
          updates.approved = false;
        } else if (business.status === 'active') {
          // Si se activa, también aprobar
          updates.approved = true;
        }
        
        const res = await api.put(`/businesses/${business._id}/status`, updates);
        
        await this.fetchBusinesses();
        await this.fetchStats();
        
        // Actualizar el objeto local
        if (updates.approved !== undefined) {
          business.approved = updates.approved;
        }
        
        this.successMessage = `Estado actualizado a "${this.getStatusText(business.status)}"`;
        setTimeout(() => this.successMessage = "", 3000);
        
      } catch (err) {
        console.error("❌ Error actualizando estado:", err);
        this.error = err.response?.data?.message || "Error al actualizar el estado.";
        
        // Revertir el cambio en la UI si falla
        business.status = originalStatus;
        
        // Mostrar error específico
        if (err.response?.data?.details) {
          this.error += `: ${err.response.data.details}`;
        }
      } finally {
        this.loading = false;
      }
    },

    // Aprobar comercio
    async approveBusiness(business) {
      try {
        if (!confirm(`¿Estás seguro de aprobar el comercio "${business.name}"?`)) return;
        
        this.loading = true;
        await api.put(`/businesses/admin/approve/${business._id}`);
        
        await this.fetchBusinesses();
        await this.fetchStats();
        
        this.successMessage = `Comercio "${business.name}" aprobado exitosamente`;
        setTimeout(() => this.successMessage = "", 3000);
        
        this.closeDetailModal();
        
      } catch (err) {
        console.error("❌ Error aprobando comercio:", err);
        this.error = err.response?.data?.message || "Error al aprobar el comercio.";
      } finally {
        this.loading = false;
      }
    },

    // Rechazar comercio
    async rejectBusiness(business) {
      try {
        if (!confirm(`¿Estás seguro de rechazar el comercio "${business.name}"?`)) return;
        
        this.loading = true;
        await api.put(`/businesses/admin/reject/${business._id}`);
        
        await this.fetchBusinesses();
        await this.fetchStats();
        
        this.successMessage = `Comercio "${business.name}" rechazado`;
        setTimeout(() => this.successMessage = "", 3000);
        
        this.closeDetailModal();
        
      } catch (err) {
        console.error("❌ Error rechazando comercio:", err);
        this.error = err.response?.data?.message || "Error al rechazar el comercio.";
      } finally {
        this.loading = false;
      }
    },

    // Eliminar comercio
    async deleteBusiness(business) {
      try {
        if (!confirm(`¿Estás seguro de eliminar el comercio "${business.name}"? Esta acción no se puede deshacer.`)) return;
        
        this.loading = true;
        await api.delete(`/businesses/${business._id}`);
        
        await this.fetchBusinesses();
        await this.fetchStats();
        
        this.successMessage = `Comercio "${business.name}" eliminado exitosamente`;
        setTimeout(() => this.successMessage = "", 3000);
        
        this.closeDetailModal();
        
      } catch (err) {
        console.error("❌ Error eliminando comercio:", err);
        this.error = err.response?.data?.message || "Error al eliminar el comercio.";
      } finally {
        this.loading = false;
      }
    },

    // Marcar/desmarcar como destacado
    async toggleFeatured(business) {
      try {
        this.loading = true;
        
        const res = await api.put(`/businesses/admin/toggle-featured/${business._id}`);
        
        await this.fetchBusinesses();
        await this.fetchStats();
        
        this.successMessage = `Comercio ${business.featured ? 'destacado' : 'desmarcado'} exitosamente`;
        setTimeout(() => this.successMessage = "", 3000);
        
      } catch (err) {
        console.error("❌ Error actualizando destacado:", err);
        this.error = err.response?.data?.message || "Error al actualizar destacado.";
        // Revertir cambio
        business.featured = !business.featured;
      } finally {
        this.loading = false;
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
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-weight: bold;
  font-size: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

.badge-rating {
  padding: 0.25rem 0.75rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.75rem;
  border: 1px solid;
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
  padding: 0.5rem;
  border-radius: 8px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
  cursor: pointer;
  width: 36px;
  height: 36px;
}

.btn-modern-sm:hover:not(:disabled) {
  background: #f0fdfa;
  border-color: #10b981;
  transform: translateY(-2px);
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

/* Checkbox y radio personalizados */
input[type="checkbox"]:checked + label,
input[type="radio"]:checked + label {
  transform: scale(0.98);
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
  .grid.grid-cols-1.md\:grid-cols-2.lg\:grid-cols-4 {
    grid-template-columns: 1fr;
  }
  
  .grid.grid-cols-2.md\:grid-cols-4 {
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
  .grid.grid-cols-3.sm\:grid-cols-7 {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* Estilos para selectores de estado */
select {
  cursor: pointer;
  transition: all 0.2s ease;
}

select:focus {
  outline: none;
  ring: 2px;
}

/* Toggle switch */
input[type="checkbox"]:checked ~ .peer-checked\:bg-emerald-500 {
  background-color: #10b981;
}

input[type="checkbox"]:checked ~ .peer-checked\:bg-amber-500 {
  background-color: #f59e0b;
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

/* Tooltips */
.group:hover .group-hover\:opacity-100 {
  opacity: 1;
}
</style>