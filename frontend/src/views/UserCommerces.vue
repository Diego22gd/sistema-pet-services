<template>
  <Layout>
    <div class="bg-white min-h-screen">
      <!-- Chatbot Component -->
      <Chatbot />
      
      <!-- Header (se mantiene igual) -->
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
              <span class="text-4xl">🏬</span>
            </div>
            <h1 class="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Encuentra los mejores servicios para tu mascota
            </h1>
            <p class="text-xl text-gray-700 mb-10 max-w-3xl mx-auto">
              Veterinarias, peluquerías, guarderías y más. Todo lo que necesitas para el cuidado de tu compañero peludo.
            </p>
            
            <!-- Barra de búsqueda principal -->
            <div class="bg-white rounded-2xl shadow-2xl p-2 mb-12">
              <div class="flex flex-col md:flex-row gap-4">
                <!-- Búsqueda por texto -->
                <div class="relative flex-1">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                   
                  </div>
                  <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="¿Qué servicio necesitas para tu mascota?"
                    class="w-full pl-12 pr-4 py-4 text-lg border-0 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    @keyup.enter="searchBusinesses"
                  />
                </div>
                
                <!-- Selector de categoría -->
                <div class="relative flex-shrink-0">
                  <select 
                    v-model="filters.category"
                    @change="applyFilters"
                    class="w-full md:w-64 appearance-none bg-white border border-gray-200 rounded-xl pl-4 pr-10 py-4 text-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 cursor-pointer"
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
                
                <!-- Botón de búsqueda -->
                <button
                  @click="searchBusinesses"
                  class="btn-primary text-lg px-8 py-4 whitespace-nowrap"
                  :disabled="loading"
                >
                  <span v-if="!loading">🔍 Buscar</span>
                  <span v-else class="flex items-center gap-2">
                    <span class="animate-spin">⟳</span>
                    Buscando...
                  </span>
                </button>
              </div>
            </div>
            
            <!-- Filtros rápidos -->
            <div class="flex flex-wrap justify-center gap-4 mb-8">
              <button
                v-for="filter in quickFilters"
                :key="filter.id"
                @click="applyQuickFilter(filter)"
                class="px-6 py-3 rounded-full border-2 transition-all duration-300 hover:scale-105"
                :class="activeQuickFilter === filter.id 
                  ? 'border-emerald-500 bg-emerald-500 text-white shadow-lg' 
                  : 'border-gray-300 bg-white text-gray-700 hover:border-emerald-300'"
              >
                <span class="mr-2">{{ filter.icon }}</span>
                {{ filter.label }}
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Resultados -->
      <section class="py-16 bg-white">
        <div class="container mx-auto px-4">
          <!-- Header de resultados -->
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
            <div>
              <h2 class="text-3xl font-bold text-gray-900 mb-2">
                Comercios para tu mascota
              </h2>
              <p class="text-gray-600">
                {{ pagination.totalItems }} comercios disponibles 
                <span v-if="filters.category">en {{ getCategoryLabel(filters.category) }}</span>
                <span v-if="searchQuery"> para "{{ searchQuery }}"</span>
              </p>
            </div>
            
            <!-- Ordenamiento -->
            <div class="flex items-center gap-4">
              <div class="text-gray-600">Ordenar por:</div>
              <select 
                v-model="sortBy"
                @change="applyFilters"
                class="bg-white border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="createdAt">Más recientes</option>
                <option value="rating">Mejor calificados</option>
                <option value="views">Más populares</option>
                <option value="name">Nombre (A-Z)</option>
              </select>
            </div>
          </div>

          <!-- Estado de carga -->
          <div v-if="loading" class="text-center py-20">
            <div class="w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-200">
              <span class="text-4xl text-emerald-600 animate-pulse">🏬</span>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-3">Buscando comercios</h3>
            <p class="text-gray-700">Cargando los mejores servicios para tu mascota...</p>
          </div>

          <!-- Grid de comercios - REDUCIDO 20% -->
          <div v-else-if="businesses.length > 0" class="mb-12">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <div
                v-for="business in businesses"
                :key="business._id"
                class="card-modern group h-full flex flex-col hover-lift transform scale-95  hover:scale-100 transition-all duration-300"
              >
                <!-- Imagen - Reducida -->
                <figure class="relative h-44 w-full overflow-hidden rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50">
                  <img 
                    :src="getBusinessImage(business)" 
                    :alt="business.name" 
                    class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    @error="handleBusinessImageError"
                  />
                  <div class="absolute top-4 right-4 flex flex-col gap-2">
                    <div v-if="business.featured" class="badge-primary bg-gradient-to-r from-amber-500 to-yellow-500">
                      ⭐ Destacado
                    </div>
                  <!-- Badges -->
                  
                    
                  </div>
                  
                  
                  <div class="absolute top-4 left-4">
                    <div class="badge-outline">
                      {{ getCategoryIcon(business.categories?.[0] || business.category) }} 
                      {{ business.categories?.[0] || business.category }}
                    </div>
                  </div>
                  
                  <!-- Botón favoritos -->
                  <button
                    @click="toggleFavorite(business)"
                    class="absolute bottom-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-300"
                    :class="{ 'text-rose-500': isFavorite(business._id) }"
                  >
                    <span class="text-xl">{{ isFavorite(business._id) ? '❤️' : '🤍' }}</span>
                  </button>
                </figure>
                
                <!-- Contenido - Reducido -->
                <div class="card-modern-body p-4 flex-1 flex flex-col">
                  <!-- Nombre y calificación -->
                  <div class="mb-3">
                    <h3 class="card-title text-lg font-bold text-gray-900 mb-1">
                      {{ business.name }}
                    </h3>
                    <div class="flex items-center gap-2">
                      <div class="flex items-center">
                        
                      </div>
                      
                    </div>
                  </div>
                  
                  <!-- Descripción -->
                  <p class="text-gray-700 text-xs mb-3 line-clamp-2 flex-grow">
                    {{ business.description || 'Servicios especializados para tu mascota' }}
                  </p>
                  
                  <!-- Ubicación -->
                  <div class="flex items-center gap-2 mb-3 text-gray-600 text-xs">
                    <span class="text-emerald-500">📍</span>
                    <span class="line-clamp-1">{{ business.address }}</span>
                  </div>
                  
                  <!-- Servicios y precios -->
                  <div class="mb-3">
                    <div class="flex justify-between items-center mb-1">
                      <span class="text-xs font-medium text-gray-900">Servicios desde:</span>
                      <span class="text-lg font-bold text-emerald-600">
                        ${{ getMinServicePrice(business) }}
                      </span>
                    </div>
                    <div class="flex flex-wrap gap-1">
                      <span 
                        v-for="service in business.services?.slice(0, 2)" 
                        :key="service._id || service.name"
                        class="badge-tag text-xs"
                      >
                        {{ service.name || service }}
                      </span>
                      <span 
                        v-if="business.services && business.services.length > 2" 
                        class="badge-tag bg-gray-100 text-gray-600 text-xs"
                      >
                        +{{ business.services.length - 2 }} más
                      </span>
                    </div>
                  </div>
                  
                  <!-- Horario -->
                  <div class="mb-3 p-2 bg-gray-50 rounded-lg text-xs">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="text-emerald-500">⏰</span>
                      <span class="font-medium text-gray-900">Horario:</span>
                      <span :class="[
                        'font-bold',
                        business.isOpenNow ? 'text-emerald-600' : 'text-gray-600'
                      ]">
                        {{ business.isOpenNow ? 'Abierto ahora' : 'Cerrado' }}
                      </span>
                    </div>
                    <p class="text-gray-600">{{ business.formattedHours || 'Horario no disponible' }}</p>
                  </div>
                  
                  <!-- Botones de acción -->
                  <div class="card-actions justify-between items-center mt-auto">
                    <button 
                      @click="openBusinessDetail(business)"
                      class="btn-modern-outline group text-sm py-2 px-3"
                    >
                      <span>Ver detalles</span>
                      <span class="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Paginación -->
            <div v-if="pagination.totalPages > 1" class="mt-12 flex justify-center">
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

          <!-- Sin resultados -->
          <div v-else class="text-center py-20">
            <div class="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-300">
              <span class="text-4xl text-gray-400">🏬</span>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-3">No se encontraron comercios</h3>
            <p class="text-gray-700 mb-8 max-w-md mx-auto">
              {{ searchQuery || filters.category ? 'No hay comercios que coincidan con tu búsqueda.' : 'Pronto agregaremos más comercios.' }}
            </p>
            <button
              @click="resetFilters"
              v-if="searchQuery || filters.category"
              class="btn-primary text-lg px-8 py-4"
            >
              <span>🔄 Ver todos los comercios</span>
            </button>
          </div>
        </div>
      </section>

      <!-- Modal de detalle del comercio -->
      <div v-if="showDetailModal && selectedBusiness" class="modal-overlay" @click.self="closeDetailModal">
        <div class="modal-modern-box max-w-5xl" @click.stop>
          <div class="modal-modern-header flex justify-between items-start">
            <div class="flex items-start gap-4">
              <div class="avatar-modern-lg">
                <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center">
                  <span class="text-4xl">{{ getCategoryIcon(selectedBusinessCategory) }}</span>
                </div>
              </div>
              <div>
                <h2 class="text-3xl font-bold text-gray-900">{{ selectedBusiness.name }}</h2>
                <div class="flex items-center gap-2 mt-2 flex-wrap">
                  <div class="badge-outline">
                    {{ getCategoryIcon(selectedBusinessCategory) }} 
                    {{ selectedBusinessCategory }}
                  </div>
                  
                  <div v-if="selectedBusiness.featured" class="badge-rating bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-0">
                    ⭐ Destacado
                  </div>
                  <div v-if="selectedBusiness.isOpenNow" class="badge-rating bg-gradient-to-r from-emerald-500 to-green-500 text-white border-0">
                    🔥 Abierto ahora
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
              <!-- Columna izquierda: Información principal -->
              <div>
                <!-- Galería de imágenes -->
                <div class="mb-8">
                  <div class="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden bg-gray-100">
                    <img 
                      :src="getBusinessImage(selectedBusiness)" 
                      alt="Imagen del comercio"
                      class="w-full h-full object-cover"
                      @error="handleBusinessImageError"
                    />
                  </div>
                </div>

                <!-- Descripción -->
                <div class="modal-section">
                  <h3 class="modal-section-title">
                    <span>📝</span> Sobre este comercio
                  </h3>
                  <p class="text-gray-700 leading-relaxed">
                    {{ selectedBusiness.description || 'No hay descripción disponible.' }}
                  </p>
                </div>

                <!-- Información de contacto -->
                <div class="modal-section">
                  <h3 class="modal-section-title">
                    <span>📞</span> Contacto
                  </h3>
                  <div class="space-y-4">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <span class="text-emerald-600">📍</span>
                      </div>
                      <div>
                        <p class="font-medium text-gray-900">Dirección</p>
                        <p class="text-gray-600">{{ selectedBusiness.address }}</p>
                      </div>
                    </div>
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <span class="text-emerald-600">📱</span>
                      </div>
                      <div>
                        <p class="font-medium text-gray-900">Teléfono</p>
                        <p class="text-gray-600">{{ selectedBusiness.phone }}</p>
                      </div>
                    </div>
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <span class="text-emerald-600">📧</span>
                      </div>
                      <div>
                        <p class="font-medium text-gray-900">Email</p>
                        <p class="text-gray-600">{{ selectedBusiness.email }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Columna derecha: Servicios y horarios -->
              <div>
                <!-- Servicios -->
                <div class="modal-section">
                  <h3 class="modal-section-title">
                    <span>⚙️</span> Servicios y precios
                  </h3>
                  <div class="space-y-4">
                    <div 
                      v-for="(service, index) in selectedBusiness.services" 
                      :key="index"
                      class="border border-gray-200 rounded-xl p-4 hover:border-emerald-300 transition-colors"
                    >
                      <div class="flex justify-between items-center mb-2">
                        <h4 class="font-bold text-gray-900">{{ service.name }}</h4>
                        <span class="text-xl font-bold text-emerald-600">${{ service.price }}</span>
                      </div>
                      <p class="text-sm text-gray-600 mb-2">{{ service.description || 'Sin descripción' }}</p>
                      <div class="flex items-center justify-between">
                        <span class="text-sm text-gray-500">Duración: {{ service.duration || 60 }} min</span>
                        <button
                          v-if="selectedBusiness.acceptOnlineBookings"
                          @click="openReservationModal(service)"
                          class="btn-modern-sm"
                        >
                          Reservar
                        </button>
                      </div>
                    </div>
                    <div v-if="!selectedBusiness.services || selectedBusiness.services.length === 0" class="text-center py-4">
                      <p class="text-gray-500">No hay servicios registrados</p>
                    </div>
                  </div>
                </div>

                <!-- Horarios -->
                <div class="modal-section">
                  <h3 class="modal-section-title">
                    <span>⏰</span> Horarios de atención
                  </h3>
                  <div class="space-y-4">
                    <div class="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-200">
                      <div class="flex items-center justify-between mb-2">
                        <span class="font-bold text-gray-900">Horario regular</span>
                        <span :class="[
                          'px-3 py-1 rounded-full text-sm font-bold',
                          selectedBusiness.isOpenNow ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'
                        ]">
                          {{ selectedBusiness.isOpenNow ? '🟢 Abierto ahora' : '🔴 Cerrado' }}
                        </span>
                      </div>
                      <p class="text-emerald-600 font-medium">
                        {{ formatTime(selectedBusiness.workingHours?.open) || '--:--' }} - {{ formatTime(selectedBusiness.workingHours?.close) || '--:--' }}
                      </p>
                      <p class="text-sm text-gray-600 mt-1">
                        {{ selectedBusiness.formattedHours || 'Horario no disponible' }}
                      </p>
                    </div>

                    <div v-if="selectedBusiness.workingHours?.specialDay" class="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
                      <span class="font-bold text-gray-900">Horario especial</span>
                      <p class="text-amber-600 font-medium">
                        {{ formatTime(selectedBusiness.workingHours?.specialOpen) || '--:--' }} - {{ formatTime(selectedBusiness.workingHours?.specialClose) || '--:--' }}
                      </p>
                      <p class="text-sm text-gray-600 mt-1">
                        {{ getSpecialDayLabel(selectedBusiness.workingHours?.specialDay) }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Información del proveedor -->
                <div class="modal-section" v-if="selectedBusiness.provider">
                  <h3 class="modal-section-title">
                    <span>👤</span> Información del proveedor
                  </h3>
                  <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div class="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center">
                      <span class="text-white text-xl">👤</span>
                    </div>
                    <div>
                      <p class="font-bold text-gray-900">{{ selectedBusiness.provider.name }}</p>
                      <p class="text-sm text-gray-600">{{ selectedBusiness.provider.email }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-modern-actions">
            <button @click="closeDetailModal" class="btn-modal-ghost">
              Cerrar
            </button>
            <button 
              @click="toggleFavorite(selectedBusiness)"
              class="btn-modal-outline"
            >
              {{ isFavorite(selectedBusiness._id) ? '❤️ Quitar de favoritos' : '🤍 Agregar a favoritos' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Modal de Reserva - VERSIÓN CORREGIDA -->
      <div v-if="showReservationModal && selectedBusiness && selectedService" class="modal-overlay" @click.self="closeReservationModal">
        <div class="modal-modern-box max-w-2xl" @click.stop>
          <div class="modal-modern-header flex justify-between items-start">
            <div class="flex items-start gap-4">
              <div class="avatar-modern-lg">
                <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center">
                  <span class="text-3xl">📅</span>
                </div>
              </div>
              <div>
                <h2 class="text-2xl font-bold text-gray-900">Reservar Cita</h2>
                <p class="text-gray-600 mt-1">Completa los datos para agendar tu cita</p>
              </div>
            </div>
            <button @click="closeReservationModal" class="btn-modal-close">
              ✕
            </button>
          </div>

          <div class="modal-modern-content mt-6">
            <!-- Información del negocio -->
            <div class="modal-section mb-6">
              <h3 class="modal-section-title">
                <span>🏬</span> Información del negocio
              </h3>
              <div class="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-200">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center">
                    <span class="text-white text-xl">{{ getCategoryIcon(selectedBusinessCategory) }}</span>
                  </div>
                  <div>
                    <p class="font-bold text-gray-900">{{ selectedBusiness.name }}</p>
                    <p class="text-sm text-gray-600">{{ selectedBusiness.address }}</p>
                    <div class="flex items-center gap-2 mt-1">
                      <span class="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                        {{ selectedBusinessCategory }}
                      </span>
                      
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Información del servicio -->
            <div class="modal-section mb-6">
              <h3 class="modal-section-title">
                <span>⚙️</span> Servicio seleccionado
              </h3>
              <div class="bg-white border border-gray-200 rounded-xl p-4">
                <div class="flex justify-between items-start">
                  <div>
                    <h4 class="font-bold text-lg text-gray-900">{{ selectedService.name }}</h4>
                    <p class="text-sm text-gray-600 mt-1">{{ selectedService.description || 'Sin descripción' }}</p>
                    <div class="flex items-center gap-4 mt-3">
                      <div class="flex items-center gap-1">
                        <span class="text-gray-500">💰</span>
                        <span class="font-bold text-emerald-600">${{ selectedService.price }}</span>
                      </div>
                      <div class="flex items-center gap-1">
                        <span class="text-gray-500">⏰</span>
                        <span class="text-sm text-gray-600">{{ selectedService.duration || 60 }} minutos</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Formulario de reserva -->
            <div class="modal-section">
              <h3 class="modal-section-title">
                <span>📋</span> Datos de la reserva
              </h3>
              <div class="space-y-4">
                <!-- Seleccionar mascota -->
                <div>
                  <label class="block mb-2 font-medium text-gray-900">
                    <span class="text-emerald-600">🐾</span> Selecciona tu mascota:
                    <span class="text-xs text-red-500 ml-1" v-if="!isAuthenticated">
                      (Debes iniciar sesión)
                    </span>
                  </label>
                  
                  <div v-if="isAuthenticated">
                    <div v-if="userPets.length > 0" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div
                        v-for="pet in userPets"
                        :key="pet._id"
                        @click="selectPet(pet)"
                        :class="[
                          'pet-card relative border-2 rounded-xl p-3 cursor-pointer transition-all duration-200 transform hover:-translate-y-1',
                          selectedPet?._id === pet._id
                            ? 'pet-card-selected border-emerald-500 bg-gradient-to-br from-emerald-50 to-green-50 shadow-lg scale-[1.02]'
                            : 'pet-card-unselected border-gray-200 hover:border-emerald-300 hover:bg-gray-50'
                        ]"
                      >
                        <!-- Indicador de selección (check verde) -->
                        <div 
                          v-if="selectedPet?._id === pet._id"
                          class="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center z-10 shadow-lg border border-white"
                        >
                          <span class="text-white text-xs font-bold">✓</span>
                        </div>
                        
                        <!-- Punto verde animado -->
                        <div 
                          v-if="selectedPet?._id === pet._id"
                          class="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full animate-ping"
                        ></div>
                        
                        <div class="flex items-center gap-3">
                          <!-- Icono de mascota -->
                          <div :class="[
                            'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200',
                            selectedPet?._id === pet._id
                              ? 'bg-gradient-to-br from-emerald-500 to-teal-400 scale-110'
                              : 'bg-gradient-to-br from-emerald-100 to-teal-100'
                          ]">
                            <span :class="[
                              'text-lg transition-all duration-200',
                              selectedPet?._id === pet._id ? 'text-white transform scale-125' : 'text-emerald-600'
                            ]">
                              {{ getPetIcon(pet.type) }}
                            </span>
                          </div>
                          
                          <!-- Información de la mascota -->
                          <div>
                            <p :class="[
                              'font-bold transition-colors duration-200',
                              selectedPet?._id === pet._id ? 'text-emerald-700' : 'text-gray-900'
                            ]">
                              {{ pet.name }}
                              <span v-if="selectedPet?._id === pet._id" class="ml-1 text-emerald-500">✓</span>
                            </p>
                            <p class="text-sm text-gray-600 capitalize">{{ pet.type }} • {{ pet.breed || 'Sin raza especificada' }}</p>
                            <p v-if="pet.age" class="text-xs text-gray-500 mt-0.5">{{ pet.age }} años</p>
                          </div>
                        </div>
                        
                        <!-- Borde decorativo animado para seleccionado -->
                        <div 
                          v-if="selectedPet?._id === pet._id"
                          class="absolute inset-0 rounded-xl border-2 border-emerald-400 opacity-50 animate-pulse"
                        ></div>
                      </div>
                    </div>
                    
                    <div v-else class="text-center py-6">
                      <p class="text-gray-500 mb-3">No tienes mascotas registradas</p>
                      <button
                        @click="goToRegisterPet"
                        class="btn-modern-outline text-sm"
                      >
                        🐶 Registrar mascota
                      </button>
                    </div>
                  </div>
                  
                  <div v-else class="text-center py-6 border-2 border-dashed border-gray-300 rounded-xl">
                    <p class="text-gray-500 mb-3">Debes iniciar sesión para reservar</p>
                    <button
                      @click="goToLogin"
                      class="btn-primary text-sm px-4 py-2"
                    >
                      🔐 Iniciar sesión
                    </button>
                  </div>
                  
                  <!-- Mostrar mascota seleccionada -->
                  <div v-if="selectedPet && isAuthenticated" class="mt-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center">
                          <span class="text-white text-sm">{{ getPetIcon(selectedPet.type) }}</span>
                        </div>
                        <div>
                          <p class="font-bold text-emerald-700">{{ selectedPet.name }} seleccionada</p>
                          <p class="text-xs text-gray-600">Para: {{ selectedService.name }}</p>
                        </div>
                      </div>
                      <button
                        @click="clearPetSelection"
                        class="text-xs text-gray-500 hover:text-red-500 transition-colors"
                      >
                        Cambiar
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Fecha y hora -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block mb-2 font-medium text-gray-900">
                      <span class="text-emerald-600">📅</span> Fecha de la cita:
                    </label>
                    <input
                      type="date"
                      v-model="reservationDate"
                      :min="minDate"
                      class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                      @change="onDateChange"
                    />
                    <!-- Mensaje de validación para fecha pasada -->
                    <div v-if="dateValidationError" class="mt-2 text-red-500 text-sm flex items-center gap-1 animate-pulse">
                      <span>⚠️</span>
                      <span>{{ dateValidationError }}</span>
                    </div>
                    <div v-else-if="reservationDate && !dateValidationError" class="mt-2 text-emerald-500 text-sm flex items-center gap-1">
                      <span>✅</span>
                      <span>Fecha válida seleccionada</span>
                    </div>
                  </div>
                  <div>
                    <label class="block mb-2 font-medium text-gray-900">
                      <span class="text-emerald-600">⏰</span> Hora de la cita:
                    </label>
                    <select
                      v-model="reservationTime"
                      class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                      :class="[
                        !reservationDate || availableHours.length === 0 
                          ? 'border-gray-300 bg-gray-50' 
                          : hourValidationError
                          ? 'border-red-500 bg-red-50'
                          : reservationTime && !hourValidationError
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-300'
                      ]"
                      :disabled="!reservationDate || availableHours.length === 0"
                    >
                      <option value="">Selecciona una hora</option>
                      <option 
                        v-for="hour in availableHours" 
                        :key="hour.time" 
                        :value="hour.time"
                        :disabled="hour.isBooked"
                        :class="[
                          hour.isBooked 
                            ? 'text-red-500 bg-red-100 cursor-not-allowed' 
                            : 'text-gray-700'
                        ]"
                      >
                        {{ formatTime(hour.time) }} 
                        <span v-if="hour.isBooked" class="text-red-500 font-medium">(Reservado)</span>
                        <span v-else class="text-emerald-500">(Disponible)</span>
                      </option>
                    </select>
                    
                    <!-- Mensajes de validación para hora -->
                    <div v-if="hourValidationError" class="mt-2 text-red-500 text-sm flex items-center gap-1 animate-pulse">
                      <span>⚠️</span>
                      <span>{{ hourValidationError }}</span>
                    </div>
                    <div v-else-if="reservationTime && !hourValidationError" class="mt-2 text-emerald-500 text-sm flex items-center gap-1">
                      <span>✅</span>
                      <span>Hora disponible seleccionada</span>
                    </div>
                    <div v-else-if="reservationDate && availableHours.length > 0" class="mt-2 text-blue-500 text-sm flex items-center gap-1">
                      <span>ℹ️</span>
                      <span>Las horas en <span class="text-red-500">rojo</span> ya están reservadas</span>
                    </div>
                  </div>
                </div>

                <!-- Notas adicionales -->
                <div>
                  <label class="block mb-2 font-medium text-gray-900">
                    <span class="text-emerald-600">📝</span> Notas adicionales (opcional):
                  </label>
                  <textarea
                    v-model="reservationNotes"
                    rows="3"
                    placeholder="¿Alguna indicación especial para el servicio?"
                    class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 resize-none"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-modern-actions">
            <button @click="closeReservationModal" class="btn-modal-ghost">
              Cancelar
            </button>
            <button 
              @click="confirmReservation"
              class="btn-modal-primary relative group"
              :disabled="!isReservationValid || reserving"
            >
              <!-- Indicador de mascota seleccionada -->
              <span v-if="!reserving" class="flex items-center gap-2">
                <span>Confirmar reserva</span>
                <span class="font-bold ml-1">${{ selectedService.price }}</span>
                
                <!-- Indicador de validaciones exitosas -->
                <span v-if="isReservationValid" class="ml-1 text-white animate-pulse">
                  ✅
                </span>
              </span>
              <span v-else class="flex items-center gap-2">
                <span class="animate-spin">⟳</span>
                Procesando...
              </span>
              
              <!-- Tooltip para botón deshabilitado -->
              <div v-if="(!isReservationValid || reserving) && !reserving" 
                   class="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10 min-w-[200px]">
                <div class="flex flex-col gap-1">
                  <span v-if="!isAuthenticated">🔸 Debes iniciar sesión</span>
                  <span v-if="!selectedPet">🔸 Selecciona una mascota</span>
                  <span v-if="!reservationDate">🔸 Selecciona una fecha</span>
                  <span v-if="!reservationTime">🔸 Selecciona una hora</span>
                  <span v-if="dateValidationError">🔸 {{ dateValidationError }}</span>
                  <span v-if="hourValidationError">🔸 {{ hourValidationError }}</span>
                  <span v-if="selectedHour && selectedHour.isBooked">🔸 Esta hora ya está reservada</span>
                </div>
                <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-800"></div>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Modal: Sin mascotas -->
      <div v-if="showNoPetsModal" class="modal-overlay" @click.self="closeNoPetsModal">
        <div class="no-pets-modal">
          <button @click="closeNoPetsModal" class="no-pets-close" aria-label="Cerrar">✕</button>
          <div class="no-pets-header">
            <div class="no-pets-icon">🐾</div>
            <h3>Registra tu mascota</h3>
            <p>Necesitas una mascota para reservar una cita.</p>
          </div>
          <div class="no-pets-actions">
            <button @click="closeNoPetsModal" class="no-pets-btn no-pets-btn-ghost">Cancelar</button>
            <button @click="goToMyPets" class="no-pets-btn no-pets-btn-primary">Ir a Mis Mascotas</button>
          </div>
        </div>
      </div>

      <!-- Modal de Éxito - COMPACTO (mitad de altura) -->
      <div v-if="showSuccessModal" class="modal-overlay" @click.self="closeSuccessModal">
        <div class="success-modal-compact" @click.stop>
          <!-- Contenedor principal del modal -->
          <div class="success-modal-content-compact">
            <!-- Icono de éxito animado -->
            <div class="success-icon-compact">
              <div class="success-check-compact">✓</div>
            </div>

            <!-- Título de éxito -->
            <h2 class="success-title-compact">
              ¡Cita Reservada!
            </h2>

            <!-- Resumen de la cita -->
            <div class="appointment-summary-compact">
              <div class="summary-row-compact">
                <span class="summary-label-compact">Servicio:</span>
                <span class="summary-value-compact">{{ successData?.serviceName || 'Servicio' }}</span>
              </div>
              <div class="summary-row-compact">
                <span class="summary-label-compact">Fecha:</span>
                <span class="summary-value-compact">{{ successData?.formattedDate || 'Fecha' }}</span>
              </div>
              <div class="summary-row-compact">
                <span class="summary-label-compact">Hora:</span>
                <span class="summary-value-compact">{{ successData?.time ? formatTime(successData.time) : 'Hora' }}</span>
              </div>
              <div class="summary-row-compact">
                <span class="summary-label-compact">Mascota:</span>
                <span class="summary-value-compact">{{ successData?.petName || 'Mascota' }}</span>
              </div>
              <div class="summary-row-compact total-row-compact">
                <span class="summary-label-compact">Total:</span>
                <span class="summary-total-compact">${{ successData?.servicePrice || '0' }}</span>
              </div>
            </div>

            <!-- Información del negocio (muy compacta) -->
            <div class="business-info-compact">
              <div class="business-icon-compact">🏬</div>
              <div>
                <p class="business-name-compact">{{ successData?.businessName || 'Negocio' }}</p>
                <p class="business-address-compact">{{ successData?.businessAddress || 'Dirección' }}</p>
              </div>
            </div>

            <!-- Acciones -->
            <div class="success-modal-actions-compact">
              <button @click="closeSuccessModal" class="btn-success-outline-compact">
                Continuar
              </button>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script>
import Chatbot from "@/components/Chatbot.vue";
import api from "@/api/api";
import { useUserStore } from "@/stores/userStore";
import Layout from "../components/Layout.vue";
import { formatTimeTo12Hour } from "@/utils/timeFormatter";

export default {
  name: "UserCommerces",
  components: { Chatbot,Layout },
  
  setup() {
    const userStore = useUserStore();
    return { userStore };
  },
  
  data() {
    return {
      businesses: [],
      searchQuery: "",
      loading: false,
      error: "",
      successMessage: "",
      
      // Filtros
      filters: {
        category: "",
        featured: "",
        openNow: false,
        minPrice: "",
        maxPrice: "",
        city: "",
      },
      
      // Paginación
      pagination: {
        currentPage: 1,
        itemsPerPage: 12,
        totalItems: 0,
        totalPages: 1
      },
      
      // Estadísticas
      stats: {
        total: 0,
        openNow: 0,
        featured: 0,
        totalServices: 0
      },
      
      // Favoritos
      favoriteBusinesses: [],
      
      // Modales
      showDetailModal: false,
      selectedBusiness: null,
      
      // Modal de reserva
      showReservationModal: false,
      selectedService: null,
      userPets: [],
      selectedPet: null,
      reservationDate: "",
      reservationTime: "",
      reservationNotes: "",
      availableHours: [],
      reserving: false,
      
      // Modal de éxito
      showSuccessModal: false,
      successData: null,

      // Modal: sin mascotas
      showNoPetsModal: false,
      
      // Validaciones
      dateValidationError: "",
      hourValidationError: "",
      
      // Filtros rápidos
      quickFilters: [
        { id: 'openNow', label: 'Abiertos ahora', icon: '🔥' },
        { id: 'featured', label: 'Destacados', icon: '⭐' },
        { id: 'veterinary', label: 'Veterinarias', icon: '🏥' },
        { id: 'grooming', label: 'Peluquerías', icon: '✂️' },
        { id: 'boarding', label: 'Guarderías', icon: '🏠' },
        { id: 'affordable', label: 'Precios bajos', icon: '💰' }
      ],
      activeQuickFilter: null,
      
      // Ordenamiento
      sortBy: "createdAt",
      
      // Categorías disponibles
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
    
    selectedBusinessCategory() {
      if (!this.selectedBusiness) return '';
      return (this.selectedBusiness.categories && this.selectedBusiness.categories[0]) || this.selectedBusiness.category || '';
    },
    
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
    },
    
    minDate() {
      // CORRECCIÓN: Usar la fecha local en lugar de UTC
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
    
    selectedHour() {
      if (!this.reservationTime || this.availableHours.length === 0) return null;
      return this.availableHours.find(h => h.time === this.reservationTime);
    },
    
    isReservationValid() {
      // Verificar que todos los campos requeridos estén completos
      const hasRequiredFields = this.isAuthenticated && 
                               this.selectedPet && 
                               this.reservationDate && 
                               this.reservationTime;
      
      if (!hasRequiredFields) {
        return false;
      }
      
      // Verificar que no haya errores de validación
      const hasValidationErrors = this.dateValidationError || this.hourValidationError;
      
      if (hasValidationErrors) {
        return false;
      }
      
      // Verificar que la hora seleccionada no esté reservada
      const selectedHour = this.availableHours.find(h => h.time === this.reservationTime);
      const isHourBooked = selectedHour && selectedHour.isBooked;
      
      if (isHourBooked) {
        return false;
      }
      
      // Si llegamos aquí, todo está válido
      return true;
    }
  },
  
  watch: {
    // Observar cambios en la fecha para validar
    reservationDate(newDate) {
      this.validateDate(newDate);
    },
    
    // Observar cambios en la hora para validar
    reservationTime(newTime) {
      this.validateHour(newTime);
    }
  },
  
  async created() {
    console.log('🔄 UserCommerces created - Iniciando...');
    
    // Cargar comercios
    await this.fetchBusinesses();
    
    // Si el usuario está autenticado, cargar sus datos
    if (this.isAuthenticated) {
      await this.loadUserData();
    }
    
    // Verificar parámetros de URL
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    const search = urlParams.get('search');
    
    if (category) {
      this.filters.category = category;
    }
    if (search) {
      this.searchQuery = search;
    }
    
    if (category || search) {
      this.applyFilters();
    }
  },
  
  mounted() {
    this.initAnimations();
    window.addEventListener('scroll', this.handleScroll);
  },
  
  beforeDestroy() {
    window.removeEventListener('scroll', this.handleScroll);
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
    
    handleScroll() {
      // Puedes agregar efectos de scroll aquí si los necesitas
    },
    
    scrollToTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    
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
    
    getCategoryLabel(category) {
      const cat = this.availableCategories.find(c => c.value === category);
      return cat ? cat.label : category;
    },
    
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
    
    handleBusinessImageError(event) {
      event.target.src = this.getPlaceholderImage();
      event.target.onerror = null;
    },
    
    getMinServicePrice(business) {
      if (!business.services || business.services.length === 0) return '0';
      const prices = business.services.map(s => s.price || 0).filter(p => p > 0);
      return prices.length > 0 ? Math.min(...prices) : '0';
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
    
    formatTime(time24) {
      return formatTimeTo12Hour(time24);
    },
    
    // ============ VALIDACIONES ============
    validateDate(dateString) {
      if (!dateString) {
        this.dateValidationError = "";
        return;
      }
      
      // CORRECCIÓN: Usar fecha local
      const selectedDate = new Date(dateString + 'T00:00:00');
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Resetear hora para comparación
      
      if (selectedDate < today) {
        this.dateValidationError = "⚠️ No puedes seleccionar una fecha anterior al día de hoy";
        return;
      }
      
      // Validar que no sea más de 3 meses en el futuro
      const maxDate = new Date();
      maxDate.setMonth(maxDate.getMonth() + 3);
      
      if (selectedDate > maxDate) {
        this.dateValidationError = "⚠️ No puedes reservar con más de 3 meses de anticipación";
        return;
      }
      
      // Validar que no sea fin de semana (opcional)
      const dayOfWeek = selectedDate.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        this.dateValidationError = "ℹ️ Los fines de semana pueden tener disponibilidad limitada";
        return;
      }
      
      this.dateValidationError = "";
    },
    
    validateHour(timeString) {
      if (!timeString) {
        this.hourValidationError = "";
        return;
      }
      
      const selectedHour = this.availableHours.find(h => h.time === timeString);
      
      if (!selectedHour) {
        this.hourValidationError = "⚠️ Por favor, selecciona una hora válida";
        return;
      }
      
      if (selectedHour.isBooked) {
        this.hourValidationError = "❌ Esta hora ya está reservada, selecciona otra hora";
        return;
      }
      
      // Validar que la hora no sea en el pasado si es hoy
      if (this.reservationDate === this.minDate) {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinutes = now.getMinutes();
        const [selectedHourValue, selectedMinutesValue] = timeString.split(':').map(Number);
        
        if (selectedHourValue < currentHour || 
            (selectedHourValue === currentHour && selectedMinutesValue < currentMinutes)) {
          this.hourValidationError = "⚠️ No puedes seleccionar una hora que ya pasó para hoy";
          return;
        }
      }
      
      // Si llegamos aquí, la hora es válida
      this.hourValidationError = "";
    },
    
    onDateChange() {
      this.validateDate(this.reservationDate);
      this.loadAvailableHours();
      // Limpiar hora seleccionada cuando cambia la fecha
      this.reservationTime = "";
    },
    
    // ============ MÉTODOS DE AUTENTICACIÓN ============
    async loadUserData() {
      try {
        console.log('📥 Cargando datos del usuario...');
        
        // Actualizar datos del usuario desde el backend
        if (this.userStore.user?._id) {
          await this.userStore.fetchUser();
        }
        
        // Cargar mascotas del usuario
        await this.loadUserPets();
        
        // Cargar favoritos
        await this.loadFavorites();
        
        console.log('✅ Datos del usuario cargados correctamente');
        
      } catch (err) {
        console.error("❌ Error cargando datos del usuario:", err);
        
        // Si hay error de autenticación, limpiar sesión
        if (err.response?.status === 401) {
          this.userStore.logout();
          this.$router.push('/login');
        }
      }
    },
    
    async loadUserPets() {
      try {
        this.userPets = await this.userStore.fetchUserPets();
        console.log(`✅ Mascotas cargadas: ${this.userPets.length}`);
      } catch (err) {
        console.error("❌ Error cargando mascotas:", err);
        this.userPets = [];
      }
    },
    
    // ============ MÉTODOS DE NEGOCIO ============
    async fetchBusinesses() {
      try {
        this.loading = true;
        this.error = "";
        
        const params = {
          page: this.pagination.currentPage,
          limit: this.pagination.itemsPerPage,
          sortBy: this.sortBy,
          order: 'desc',
          search: this.searchQuery,
          category: this.filters.category,
          featured: this.filters.featured,
          minPrice: this.filters.minPrice,
          maxPrice: this.filters.maxPrice,
          city: this.filters.city,
          openNow: this.filters.openNow
        };
        
        // Limpiar parámetros vacíos
        Object.keys(params).forEach(key => {
          if (params[key] === "" || params[key] === null || params[key] === undefined || params[key] === false) {
            delete params[key];
          }
        });
        
        const res = await api.get("/businesses", { params });
        
        this.businesses = res.data.businesses || [];
        this.pagination.totalItems = res.data.pagination?.total || this.businesses.length;
        this.pagination.totalPages = Math.ceil(this.pagination.totalItems / this.pagination.itemsPerPage);
        
        if (res.data.stats) {
          this.stats = { ...this.stats, ...res.data.stats };
        }
        
      } catch (err) {
        console.error("❌ Error cargando comercios:", err);
        this.error = err.response?.data?.message || "Error al cargar los comercios. Por favor, intenta de nuevo.";
        
        setTimeout(() => {
          this.error = "";
        }, 5000);
      } finally {
        this.loading = false;
      }
    },
    
    async loadFavorites() {
      try {
        if (!this.isAuthenticated) return;
        
        const res = await api.get("/businesses/user/favorites");
        this.favoriteBusinesses = res.data.businesses?.map(b => b._id) || [];
        console.log(`✅ Favoritos cargados: ${this.favoriteBusinesses.length}`);
      } catch (err) {
        console.error("❌ Error cargando favoritos:", err);
        this.favoriteBusinesses = [];
      }
    },
    
    isFavorite(businessId) {
      return this.favoriteBusinesses.includes(businessId);
    },
    
    async toggleFavorite(business) {
      try {
        // Verificar autenticación
        if (!this.isAuthenticated) {
          this.goToLogin();
          return;
        }
        
        const res = await api.post(`/businesses/user/favorites/${business._id}`);
        
        if (res.data.isFavorite) {
          this.favoriteBusinesses.push(business._id);
          this.showTemporaryMessage('❤️ Agregado a favoritos');
        } else {
          this.favoriteBusinesses = this.favoriteBusinesses.filter(id => id !== business._id);
          this.showTemporaryMessage('🤍 Removido de favoritos');
        }
        
      } catch (err) {
        console.error("❌ Error actualizando favoritos:", err);
        
        if (err.response?.status === 401) {
          this.userStore.logout();
          this.goToLogin();
        } else {
          this.showTemporaryMessage('❌ Error al actualizar favoritos', 'error');
        }
      }
    },
    
    // ============ FILTROS Y BÚSQUEDA ============
    searchBusinesses() {
      this.pagination.currentPage = 1;
      this.applyFilters();
    },
    
    applyFilters() {
      this.pagination.currentPage = 1;
      this.fetchBusinesses();
      
      // Actualizar URL (sin recargar la página)
      const url = new URL(window.location);
      if (this.filters.category) {
        url.searchParams.set('category', this.filters.category);
      } else {
        url.searchParams.delete('category');
      }
      if (this.searchQuery) {
        url.searchParams.set('search', this.searchQuery);
      } else {
        url.searchParams.delete('search');
      }
      window.history.pushState({}, '', url);
    },
    
    applyQuickFilter(filter) {
      this.activeQuickFilter = this.activeQuickFilter === filter.id ? null : filter.id;
      
      switch (filter.id) {
        case 'openNow':
          this.filters.openNow = this.activeQuickFilter === 'openNow';
          break;
        case 'featured':
          this.filters.featured = this.activeQuickFilter === 'featured' ? 'true' : '';
          break;
        case 'veterinary':
          this.filters.category = this.activeQuickFilter === 'veterinary' ? 'Veterinaria' : '';
          break;
        case 'grooming':
          this.filters.category = this.activeQuickFilter === 'grooming' ? 'Peluquería' : '';
          break;
        case 'boarding':
          this.filters.category = this.activeQuickFilter === 'boarding' ? 'Guardería' : '';
          break;
        case 'affordable':
          this.filters.minPrice = this.activeQuickFilter === 'affordable' ? '0' : '';
          this.filters.maxPrice = this.activeQuickFilter === 'affordable' ? '50' : '';
          break;
      }
      
      this.applyFilters();
    },
    
    resetFilters() {
      this.searchQuery = "";
      this.filters = {
        category: "",
        featured: "",
        openNow: false,
        minPrice: "",
        maxPrice: "",
        city: "",
      };
      this.activeQuickFilter = null;
      this.sortBy = "createdAt";
      this.pagination.currentPage = 1;
      this.applyFilters();
    },
    
    // ============ PAGINACIÓN ============
    goToPage(page) {
      this.pagination.currentPage = page;
      this.fetchBusinesses();
      this.scrollToTop();
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
    
    // ============ MODALES ============
    openBusinessDetail(business) {
      this.selectedBusiness = business;
      this.showDetailModal = true;
    },
    
    closeDetailModal() {
      this.showDetailModal = false;
      this.selectedBusiness = null;
    },
    
    // ============ MODAL DE RESERVA ============
    async openReservationModal(service) {
      // Verificar autenticación antes de abrir el modal
      if (!this.isAuthenticated) {
        alert("⚠️ Debes iniciar sesión para reservar una cita");
        this.goToLogin();
        return;
      }
      
      // Verificar si el comercio acepta reservas en línea
      if (!this.selectedBusiness?.acceptOnlineBookings) {
        alert("⚠️ Este comercio no acepta reservas en línea. Por favor, contacta directamente para agendar tu cita.");
        return;
      }
      
      this.selectedService = service;
      this.showReservationModal = true;
      
      // CORRECCIÓN: Usar fecha local correcta
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      this.reservationDate = `${year}-${month}-${day}`;
      
      // Validar fecha inicial
      this.validateDate(this.reservationDate);
      
      // Verificar si tenemos datos de mascotas actualizados
      if (this.userPets.length === 0) {
        await this.loadUserPets();
        
        if (this.userPets.length === 0) {
          this.showNoPetsModal = true;
          return;
        }
      }
      
      // Cargar horas disponibles
      await this.loadAvailableHours();
    },
    
    closeReservationModal() {
      this.showReservationModal = false;
      this.selectedService = null;
      this.selectedPet = null;
      this.reservationDate = "";
      this.reservationTime = "";
      this.reservationNotes = "";
      this.availableHours = [];
      this.reserving = false;
      this.dateValidationError = "";
      this.hourValidationError = "";
    },

    closeNoPetsModal() {
      this.showNoPetsModal = false;
    },

    goToMyPets() {
      this.showNoPetsModal = false;
      this.closeReservationModal();
      this.closeDetailModal();
      this.$router.push('/MyPets');
    },
    
    selectPet(pet) {
      // Forzar reactividad
      this.selectedPet = { ...pet };
      console.log('Mascota seleccionada:', this.selectedPet.name);
    },
    
    clearPetSelection() {
      this.selectedPet = null;
      console.log('Selección de mascota limpiada');
    },
    
    // ============ MÉTODO CORREGIDO: loadAvailableHours ============
    async loadAvailableHours() {
      if (!this.reservationDate) return;
      
      try {
        // CORRECCIÓN: Verificar que los IDs sean válidos
        if (!this.selectedBusiness?._id) {
          console.error('❌ ID del negocio no disponible');
          this.availableHours = this.generateDefaultHours([]);
          return;
        }
        
        if (!this.selectedService?._id) {
          console.warn('⚠️ ID del servicio no disponible, usando null');
        }
        
        // CORRECCIÓN: Crear parámetros con validación
        const params = {
          date: this.reservationDate,
          businessId: this.selectedBusiness._id
        };
        
        // Solo agregar serviceId si está disponible y es válido
        if (this.selectedService?._id && this.selectedService._id.length >= 12) {
          params.serviceId = this.selectedService._id;
        }
        
        console.log('📋 Cargando horas disponibles con parámetros:', params);
        
        // CORRECCIÓN: Manejo de errores mejorado
        let res;
        try {
          // En loadAvailableHours() del componente
            res = await api.get(`/appointments/hours/available`, { params });
          
          if (!res.data.success) {
            throw new Error(res.data.message || 'Error en la respuesta del servidor');
          }
          
        } catch (err) {
          console.warn('⚠️ Error cargando horas disponibles:', err.message);

          // Si el comercio está cerrado ese día, mostrar error inmediato
          if (err.response?.status === 400 && err.response?.data?.message?.toLowerCase().includes('cerrado')) {
            this.dateValidationError = `⚠️ ${err.response.data.message}`;
            this.availableHours = [];
            this.reservationTime = "";
            this.hourValidationError = "";
            return;
          }
          
          // Verificar tipo de error
          if (err.response?.status === 400) {
            console.error('❌ Error 400 Detalles:', {
              params: params,
              response: err.response?.data
            });
            
            // Mostrar mensaje amigable al usuario
            this.showTemporaryMessage(
              '⚠️ El servicio de disponibilidad está temporalmente limitado. Usando horario estándar.',
              'warning'
            );
          }
          
          throw err; // Esto hará que caiga en el catch y use las horas por defecto
        }
        
        const bookedHours = res.data?.bookedHours || [];
        
        console.log('✅ Horas reservadas recibidas:', bookedHours);
        
        // Generar horas disponibles
        const hours = this.generateBusinessHours(bookedHours);
        
        this.availableHours = hours;
        
        console.log('✅ Horas disponibles cargadas:', hours.length);
        
        // Si hay una hora seleccionada, validarla nuevamente
        if (this.reservationTime) {
          this.validateHour(this.reservationTime);
        }
        
      } catch (err) {
        console.warn("⚠️ Usando horas por defecto debido a:", err.message);
        
        // Horas por defecto (9am a 6pm, saltando la hora de almuerzo)
        this.availableHours = this.generateDefaultHours([]);
        
        console.log("ℹ️ Usando horario predeterminado (9:00 - 18:00)");
      }
    },
    
    // Método auxiliar para generar horas basadas en el negocio
    generateBusinessHours(bookedHours) {
      const businessHours = this.selectedBusiness?.workingHours;
      let hours = [];
      
      if (businessHours && businessHours.open && businessHours.close) {
        try {
          const openHour = parseInt(businessHours.open.split(':')[0]);
          const closeHour = parseInt(businessHours.close.split(':')[0]);
          
          console.log('🏪 Horario del negocio:', openHour, 'a', closeHour);
          
          for (let hour = openHour; hour < closeHour; hour++) {
            // Saltar la hora de almuerzo (13:00)
            if (hour === 13) continue;
            
            // Formatear hora con dos dígitos
            const formattedHour = hour.toString().padStart(2, '0') + ':00';
            
            hours.push({
              time: formattedHour,
              isBooked: bookedHours.includes(formattedHour)
            });
          }
        } catch (error) {
          console.error('❌ Error procesando horario del negocio:', error);
          hours = this.generateDefaultHours(bookedHours);
        }
      } else {
        // Horas por defecto si no hay horario específico
        hours = this.generateDefaultHours(bookedHours);
      }
      
      return hours;
    },
    
    // Método para horas por defecto
    generateDefaultHours(bookedHours) {
      // Horario por defecto: 9am a 6pm, saltando 1pm (almuerzo)
      const defaultHours = [
        "09:00", "10:00", "11:00", "12:00", 
        "14:00", "15:00", "16:00", "17:00", "18:00"
      ];
      
      return defaultHours.map(time => ({
        time: time,
        isBooked: bookedHours.includes(time)
      }));
    },
    
    goToRegisterPet() {
      this.$router.push('/pets/register');
      this.closeReservationModal();
      this.closeDetailModal();
    },
    
    goToLogin() {
      this.closeReservationModal();
      this.closeDetailModal();
      this.$router.push({
        path: '/login',
        query: { redirect: this.$route.fullPath }
      });
    },
    
    // ============ MÉTODO DE ÉXITO ============
    async confirmReservation() {
      // Verificar autenticación
      if (!this.isAuthenticated) {
        alert("⚠️ Tu sesión ha expirado. Por favor, inicia sesión nuevamente.");
        this.userStore.logout();
        this.goToLogin();
        return;
      }
      
      // Verificar que la reservación sea válida
      if (!this.isReservationValid) {
        let errorMessage = "⚠️ Por favor, completa todos los campos requeridos:\n\n";
        
        if (!this.selectedPet) errorMessage += "• Selecciona una mascota\n";
        if (!this.reservationDate) errorMessage += "• Selecciona una fecha\n";
        if (!this.reservationTime) errorMessage += "• Selecciona una hora\n";
        
        if (this.dateValidationError) errorMessage += `• ${this.dateValidationError}\n`;
        if (this.hourValidationError) errorMessage += `• ${this.hourValidationError}\n`;
        
        const selectedHour = this.availableHours.find(h => h.time === this.reservationTime);
        if (selectedHour && selectedHour.isBooked) {
          errorMessage += "• La hora seleccionada ya está reservada\n";
        }
        
        alert(errorMessage);
        return;
      }
      
      // Verificar que la hora seleccionada no esté reservada (doble verificación)
      const selectedHour = this.availableHours.find(h => h.time === this.reservationTime);
      if (selectedHour && selectedHour.isBooked) {
        alert("⚠️ Esta hora ya está reservada. Por favor, selecciona otra hora.");
        this.hourValidationError = "❌ Esta hora ya está reservada, selecciona otra hora";
        return;
      }
      
      try {
        this.reserving = true;
        
        const reservationData = {
          petId: this.selectedPet._id,
          serviceId: this.selectedService._id,
          providerId: this.selectedBusiness.provider?._id || this.selectedBusiness._id,
          businessId: this.selectedBusiness._id,
          date: this.reservationDate,
          time: this.reservationTime,
          notes: this.reservationNotes,
          serviceName: this.selectedService.name,
          servicePrice: this.selectedService.price,
          businessName: this.selectedBusiness.name,
          businessAddress: this.selectedBusiness.address,
          businessPhone: this.selectedBusiness.phone
        };
        
        console.log('📝 Creando cita con datos:', reservationData);
        
        // Crear la cita
        const res = await api.post("/appointments", reservationData);
        
        // Preparar datos para el modal de éxito
        this.successData = {
          serviceName: this.selectedService.name,
          formattedDate: this.formatDate(this.reservationDate),
          time: this.reservationTime,
          petName: this.selectedPet.name,
          servicePrice: this.selectedService.price,
          businessName: this.selectedBusiness.name,
          businessAddress: this.selectedBusiness.address,
          businessPhone: this.selectedBusiness.phone,
          appointmentId: res.data.appointment?._id
        };
        
        // Cerrar modal de reserva
        this.closeReservationModal();
        this.closeDetailModal();
        
        // Mostrar modal de éxito después de un breve retraso
        setTimeout(() => {
          this.showSuccessModal = true;
        }, 300);
        
      } catch (err) {
        console.error("❌ Error creando la cita:", err);
        
        let errorMessage = "❌ Error al crear la cita. Por favor, intenta de nuevo.";
        
        if (err.response?.status === 401) {
          errorMessage = "⚠️ Tu sesión ha expirado. Por favor, inicia sesión nuevamente.";
          this.userStore.logout();
          this.goToLogin();
          return;
        }
        
        if (err.response?.data?.message) {
          errorMessage = `❌ ${err.response.data.message}`;
        }
        
        this.showErrorMessage(errorMessage);
      } finally {
        this.reserving = false;
      }
    },
    
    formatDate(dateString) {
      const date = /^\d{4}-\d{2}-\d{2}$/.test(dateString)
        ? (() => {
            const [year, month, day] = dateString.split('-').map(Number);
            return new Date(year, month - 1, day);
          })()
        : new Date(dateString);
      // Formato compacto: "Lun 15 Ene 2024"
      return date.toLocaleDateString('es-ES', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    },
    
    closeSuccessModal() {
      this.showSuccessModal = false;
      this.successData = null;
    },
    
    goToAppointments() {
      this.closeSuccessModal();
      this.$router.push('/user/appointments');
    },
    
    showErrorMessage(message) {
      alert(message);
    },
    
    showTemporaryMessage(message, type = 'success') {
      console.log(`${type.toUpperCase()}: ${message}`);
      
      // Implementación básica de toast
      const toast = document.createElement('div');
      toast.className = `fixed top-4 right-4 px-4 py-3 rounded-lg shadow-lg z-50 transition-all duration-300 ${
        type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
      }`;
      toast.textContent = message;
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-10px)';
        setTimeout(() => {
          document.body.removeChild(toast);
        }, 300);
      }, 3000);
    }
  }
};
</script>

<style scoped>
/* Animaciones */
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

/* Cards modernas - REDUCIDAS 20% */
.card-modern {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 16px; /* Reducido de 20px */
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05); /* Reducido */
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transform: scale(0.95); /* Reducción del 5% */
  transform-origin: center;
}

.card-modern:hover {
  border-color: #10b981;
  box-shadow: 
    0 16px 32px rgba(0, 0, 0, 0.1), /* Reducido */
    0 0 0 1px #10b981,
    0 0 16px rgba(16, 185, 129, 0.1); /* Reducido */
  transform: scale(1); /* Restaurar tamaño en hover */
}

.card-modern-body {
  padding: 1rem; /* Reducido de 1.5rem */
  display: flex;
  flex-direction: column;
  flex: 1;
}

.card-title {
  font-size: 1rem; /* Reducido de 1.125rem */
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

/* Badges - Reducidos */
.badge-primary {
  color: white;
  padding: 0.2rem 0.6rem; /* Reducido */
  border-radius: 9999px;
  font-weight: bold;
  font-size: 0.7rem; /* Reducido de 0.75rem */
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); /* Reducido */
}

.badge-outline {
  background: white;
  color: #10b981;
  padding: 0.2rem 0.6rem; /* Reducido */
  border-radius: 9999px;
  font-weight: 600;
  font-size: 0.7rem; /* Reducido de 0.75rem */
  border: 1px solid #10b981;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.badge-tag {
  background: #f0fdfa;
  color: #0d9488;
  padding: 0.2rem 0.4rem; /* Reducido */
  border-radius: 6px;
  font-size: 0.65rem; /* Reducido de 0.7rem */
  border: 1px solid #99f6e4;
}

.badge-rating {
  padding: 0.2rem 0.6rem; /* Reducido */
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.7rem; /* Reducido de 0.75rem */
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  color: #6b7280;
}

/* Modal: sin mascotas (compacto) */
.no-pets-modal {
  position: relative;
  width: 300px;
  max-width: 90vw;
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid #e5e7eb;
  padding: 1.25rem 1.25rem 1rem;
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.35s ease;
}

.no-pets-close {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: #f3f4f6;
  color: #6b7280;
  cursor: pointer;
  font-size: 14px;
}

.no-pets-close:hover {
  background: #e5e7eb;
}

.no-pets-header {
  text-align: center;
  padding-top: 6px;
}

.no-pets-header h3 {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  margin: 8px 0 4px;
}

.no-pets-header p {
  font-size: 13px;
  color: #6b7280;
  margin: 0 0 10px;
}

.no-pets-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: #ecfdf5;
  color: #10b981;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  border: 1px solid #a7f3d0;
  box-shadow: 0 8px 18px rgba(16, 185, 129, 0.15);
}

.no-pets-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.no-pets-btn {
  padding: 0.5rem 0.75rem;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  border: none;
  cursor: pointer;
}

.no-pets-btn-ghost {
  background: #f3f4f6;
  color: #4b5563;
}

.no-pets-btn-ghost:hover {
  background: #e5e7eb;
}

.no-pets-btn-primary {
  background: linear-gradient(135deg, #10b981, #059669);
  color: #ffffff;
}

.no-pets-btn-primary:hover {
  box-shadow: 0 8px 16px rgba(16, 185, 129, 0.25);
  transform: translateY(-1px);
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

/* Modal */
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

.modal-modern {
  background: #ffffff;
  border-radius: 28px;
  padding: 1.75rem;
  border: 1px solid #e5e7eb;
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(16, 185, 129, 0.08);
  position: relative;
  overflow: hidden;
  max-width: 100%;
  width: 100%;
  animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
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
  background: linear-gradient(135deg, #9ca3af, #6b7280);
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

/* ============ ESTILOS PARA SELECCIÓN DE MASCOTAS ============ */
.pet-card {
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.pet-card-selected {
  animation: cardSelect 0.4s ease-out;
  box-shadow: 
    0 10px 25px -5px rgba(16, 185, 129, 0.2), 
    0 0 0 2px rgba(16, 185, 129, 0.3),
    inset 0 2px 4px rgba(255, 255, 255, 0.5);
  border-color: #10b981 !important;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(13, 148, 136, 0.05)) !important;
  transform: translateY(-4px) scale(1.02);
}

.pet-card-unselected:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: #a7f3d0;
  background-color: #f9fafb;
}

@keyframes cardSelect {
  0% {
    transform: scale(1);
    box-shadow: none;
  }
  50% {
    transform: scale(1.03) translateY(-2px);
  }
  100% {
    transform: scale(1.02) translateY(-4px);
    box-shadow: 
      0 10px 25px -5px rgba(16, 185, 129, 0.2), 
      0 0 0 2px rgba(16, 185, 129, 0.3);
  }
}

/* ============ MODAL DE ÉXITO COMPACTO (MITAD DE ALTURA) ============ */
.success-modal-compact {
  background: white;
  border-radius: 20px;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  box-shadow: 
    0 20px 40px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px #10b981,
    0 0 30px rgba(16, 185, 129, 0.1);
  position: relative;
  overflow: hidden;
  max-width: 400px;
  width: 95%;
  max-height: 70vh; /* Mitad de altura */
  animation: successModalCompactAppear 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes successModalCompactAppear {
  0% {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.success-modal-content-compact {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 1rem; /* Espaciado reducido */
}

/* Icono de éxito compacto */
.success-icon-compact {
  position: relative;
  width: 60px;
  height: 60px;
  margin: 0 auto;
}

.success-check-compact {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #10b981, #0d9488);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
  animation: checkSpin 0.6s ease-out;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

@keyframes checkSpin {
  0% {
    transform: rotate(-180deg) scale(0);
    opacity: 0;
  }
  70% {
    transform: rotate(10deg) scale(1.1);
  }
  100% {
    transform: rotate(0) scale(1);
    opacity: 1;
  }
}

/* Título compacto */
.success-title-compact {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

/* Resumen de cita compacto */
.appointment-summary-compact {
  background: #f9fafb;
  border-radius: 10px;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  text-align: left;
  font-size: 0.875rem;
}

.summary-row-compact {
  display: flex;
  justify-content: space-between;
  padding: 0.25rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.summary-row-compact:last-child {
  border-bottom: none;
}

.summary-label-compact {
  color: #6b7280;
  font-weight: 500;
  font-size: 0.8125rem;
}

.summary-value-compact {
  color: #1f2937;
  font-weight: 600;
  font-size: 0.8125rem;
  text-align: right;
  max-width: 60%;
  word-break: break-word;
}

.total-row-compact {
  margin-top: 0.25rem;
  padding-top: 0.5rem;
  border-top: 2px solid #10b981;
}

.summary-total-compact {
  color: #10b981;
  font-weight: 700;
  font-size: 1rem;
}

/* Información del negocio compacta */
.business-info-compact {
  background: linear-gradient(135deg, #f0fdfa, #ecfdf5);
  border-radius: 8px;
  padding: 0.5rem;
  border: 1px solid #a7f3d0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-align: left;
  font-size: 0.75rem;
}

.business-icon-compact {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: linear-gradient(135deg, #10b981, #0d9488);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 1rem;
  color: white;
}

.business-name-compact {
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  font-size: 0.8125rem;
  line-height: 1.2;
}

.business-address-compact {
  color: #6b7280;
  margin: 0;
  font-size: 0.6875rem;
  line-height: 1.2;
}

/* Acciones compactas */
.success-modal-actions-compact {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.btn-success-outline-compact {
  flex: 1;
  background: transparent;
  color: #6b7280;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.btn-success-outline-compact:hover {
  background: #f9fafb;
  border-color: #10b981;
  color: #10b981;
}

.btn-success-primary-compact {
  flex: 1;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.btn-success-primary-compact:hover {
  transform: translateY(-1px);
  box-shadow: 0 5px 15px rgba(16, 185, 129, 0.3);
  background: linear-gradient(135deg, #0d9488, #047857);
}

/* ============ ESTILOS PARA VALIDACIONES ============ */
.text-red-500 {
  color: #ef4444;
}

.text-emerald-500 {
  color: #10b981;
}

.text-blue-500 {
  color: #3b82f6;
}

.bg-red-50 {
  background-color: #fef2f2;
}

.bg-emerald-50 {
  background-color: #ecfdf5;
}

.border-red-500 {
  border-color: #ef4444 !important;
}

.border-emerald-500 {
  border-color: #10b981 !important;
}

/* Tooltip para botón deshabilitado */
.tooltip-container {
  position: relative;
}

.tooltip-container:hover .tooltip {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(10px);
  background: #1f2937;
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.75rem;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
  z-index: 50;
  pointer-events: none;
}

.tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: #1f2937;
}

/* Responsive */
@media (max-width: 768px) {
  .grid.grid-cols-1.md\:grid-cols-2.lg\:grid-cols-4.xl\:grid-cols-5 {
    grid-template-columns: 1fr;
  }
  
  .modal-modern-box,
  .success-modal-compact {
    padding: 1rem;
    max-height: 80vh;
  }
  
  .modal-modern-actions,
  .success-modal-actions-compact {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .btn-modal-primary,
  .btn-modal-outline,
  .btn-modal-ghost,
  .btn-success-outline-compact,
  .btn-success-primary-compact {
    width: 100%;
    justify-content: center;
  }
  
  .card-modern figure {
    height: 180px; /* Reducido para móviles */
  }
  
  .text-5xl {
    font-size: 2.5rem;
  }
  
  .text-6xl {
    font-size: 3rem;
  }
  
  /* Ajustes para selección de mascotas en móvil */
  .pet-card-selected {
    transform: translateY(-2px) scale(1.01);
  }
  
  .card-modern {
    transform: scale(1); /* Tamaño normal en móviles */
  }
  
  /* Ajustes para modal compacto en móvil */
  .success-modal-compact {
    width: 95%;
    max-width: 350px;
    max-height: 70vh; /* Un poco más alto en móvil */
  }
  
  .success-icon-compact {
    width: 50px;
    height: 50px;
  }
  
  .success-check-compact {
    width: 50px;
    height: 50px;
    font-size: 1.25rem;
  }
  
  .success-title-compact {
    font-size: 1.125rem;
  }
  
  .appointment-summary-compact {
    padding: 0.5rem;
    font-size: 0.8125rem;
  }
  
  /* Ajustes para tooltips en móvil */
  .tooltip {
    display: none; /* Ocultar tooltips en móvil */
  }
}

/* Ajustes para pantallas grandes */
@media (min-width: 1536px) {
  .grid.grid-cols-1.md\:grid-cols-2.lg\:grid-cols-4.xl\:grid-cols-5 {
    grid-template-columns: repeat(6, 1fr); /* 6 columnas en pantallas XL */
  }
}

/* Patrones decorativos */
.bg-gradient-to-br {
  background-size: 400% 400%;
  animation: gradient 15s ease infinite;
}

@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
</style>