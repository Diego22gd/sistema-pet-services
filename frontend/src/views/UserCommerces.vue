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
                  <span class="text-emerald-500 text-xl">🔍</span>
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

        <!-- Grid de comercios -->
        <div v-else-if="businesses.length > 0" class="mb-12">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <div
              v-for="business in businesses"
              :key="business._id"
              class="card-modern group h-full flex flex-col hover-lift"
            >
              <!-- Imagen -->
              <figure class="relative h-56 w-full overflow-hidden rounded-t-2xl bg-gradient-to-br from-emerald-50 to-teal-50">
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
                
                  <div v-if="business.isOpenNow" class="badge-primary bg-gradient-to-r from-emerald-500 to-green-500">
                    🔥 Abierto ahora
                  </div>
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
                  class="absolute bottom-4 right-4 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-300"
                  :class="{ 'text-rose-500': isFavorite(business._id) }"
                >
                  <span class="text-2xl">{{ isFavorite(business._id) ? '❤️' : '🤍' }}</span>
                </button>
              </figure>
              
              <!-- Contenido -->
              <div class="card-modern-body p-6 flex-1 flex flex-col">
                <!-- Nombre y calificación -->
                <div class="mb-4">
                  <h3 class="card-title text-xl font-bold text-gray-900 mb-2">
                    {{ business.name }}
                  </h3>
                  <div class="flex items-center gap-2">
                    <div class="flex items-center">
                      <span class="text-amber-500 text-lg">⭐</span>
                      <span class="ml-1 font-bold">{{ business.rating || 'N/A' }}</span>
                    </div>
                    
                  </div>
                </div>
                
                <!-- Descripción -->
                <p class="text-gray-700 text-sm mb-4 line-clamp-2 flex-grow">
                  {{ business.description || 'Servicios especializados para tu mascota' }}
                </p>
                
                <!-- Ubicación -->
                <div class="flex items-center gap-2 mb-4 text-gray-600">
                  <span class="text-emerald-500">📍</span>
                  <span class="line-clamp-1">{{ business.address }}</span>
                </div>
                
                <!-- Servicios y precios -->
                <div class="mb-4">
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-sm font-medium text-gray-900">Servicios desde:</span>
                    <span class="text-xl font-bold text-emerald-600">
                      ${{ getMinServicePrice(business) }}
                    </span>
                  </div>
                  <div class="flex flex-wrap gap-2">
                    <span 
                      v-for="service in business.services?.slice(0, 2)" 
                      :key="service._id || service.name"
                      class="badge-tag"
                    >
                      {{ service.name || service }}
                    </span>
                    <span 
                      v-if="business.services && business.services.length > 2" 
                      class="badge-tag bg-gray-100 text-gray-600"
                    >
                      +{{ business.services.length - 2 }} más
                    </span>
                  </div>
                </div>
                
                <!-- Horario -->
                <div class="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-emerald-500">⏰</span>
                    <span class="text-sm font-medium text-gray-900">Horario:</span>
                    <span :class="[
                      'text-sm font-bold',
                      business.isOpenNow ? 'text-emerald-600' : 'text-gray-600'
                    ]">
                      {{ business.isOpenNow ? 'Abierto ahora' : 'Cerrado' }}
                    </span>
                  </div>
                  <p class="text-xs text-gray-600">{{ business.formattedHours || 'Horario no disponible' }}</p>
                </div>
                
                <!-- Botones de acción -->
                <div class="card-actions justify-between items-center mt-auto">
                  <button 
                    @click="openBusinessDetail(business)"
                    class="btn-modern-outline group"
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
      <div class="modal-modern-box max-w-6xl" @click.stop>
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
                <div class="badge-rating">
                  ⭐ {{ selectedBusiness.rating || 'N/A' }}
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
                      {{ selectedBusiness.workingHours?.open || '--:--' }} - {{ selectedBusiness.workingHours?.close || '--:--' }}
                    </p>
                    <p class="text-sm text-gray-600 mt-1">
                      {{ selectedBusiness.formattedHours || 'Horario no disponible' }}
                    </p>
                  </div>

                  <div v-if="selectedBusiness.workingHours?.specialDay" class="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
                    <span class="font-bold text-gray-900">Horario especial</span>
                    <p class="text-amber-600 font-medium">
                      {{ selectedBusiness.workingHours?.specialOpen || '--:--' }} - {{ selectedBusiness.workingHours?.specialClose || '--:--' }}
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

    <!-- Modal de Reserva -->
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
                    <span class="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full flex items-center">
                      ⭐ {{ selectedBusiness.rating || 'N/A' }}
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
                        'border-2 rounded-xl p-3 cursor-pointer transition-all duration-200',
                        selectedPet?._id === pet._id
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-200 hover:border-emerald-300'
                      ]"
                    >
                      <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                          <span class="text-lg">{{ getPetIcon(pet.type) }}</span>
                        </div>
                        <div>
                          <p class="font-bold text-gray-900">{{ pet.name }}</p>
                          <p class="text-sm text-gray-600 capitalize">{{ pet.type }} • {{ pet.breed || 'Sin raza especificada' }}</p>
                        </div>
                      </div>
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
                    @change="loadAvailableHours"
                  />
                </div>
                <div>
                  <label class="block mb-2 font-medium text-gray-900">
                    <span class="text-emerald-600">⏰</span> Hora de la cita:
                  </label>
                  <select
                    v-model="reservationTime"
                    class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                    :disabled="!reservationDate"
                  >
                    <option value="">Selecciona una hora</option>
                    <option v-for="hour in availableHours" :key="hour" :value="hour">
                      {{ hour }}
                    </option>
                  </select>
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
            class="btn-modal-primary"
            :disabled="!isReservationValid || reserving"
          >
            <span v-if="!reserving">
              <span class="mr-2">✅</span> Confirmar reserva - ${{ selectedService.price }}
            </span>
            <span v-else class="flex items-center gap-2">
              <span class="animate-spin">⟳</span>
              Procesando...
            </span>
          </button>
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

export default {
  name: "UserCommerces",
  components: { Chatbot },
  
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
      const today = new Date();
      return today.toISOString().split('T')[0];
    },
    
    isReservationValid() {
      return this.isAuthenticated && this.selectedPet && this.reservationDate && this.reservationTime;
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
      
      // Establecer fecha mínima como hoy
      const today = new Date();
      const todayString = today.toISOString().split('T')[0];
      this.reservationDate = todayString;
      
      // Verificar si tenemos datos de mascotas actualizados
      if (this.userPets.length === 0) {
        await this.loadUserPets();
        
        if (this.userPets.length === 0) {
          const goToRegister = confirm("No tienes mascotas registradas. ¿Deseas registrar una ahora?");
          if (goToRegister) {
            this.$router.push('/pets/register');
            this.closeReservationModal();
            this.closeDetailModal();
            return;
          }
        }
      }
      
      // Cargar horas disponibles
      this.loadAvailableHours();
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
    },
    
    selectPet(pet) {
      this.selectedPet = pet;
    },
    
    async loadAvailableHours() {
      if (!this.reservationDate) return;
      
      try {
        // Generar horas disponibles basadas en el horario del negocio
        const businessHours = this.selectedBusiness?.workingHours;
        let hours = [];
        
        if (businessHours && businessHours.open && businessHours.close) {
          const openHour = parseInt(businessHours.open.split(':')[0]);
          const closeHour = parseInt(businessHours.close.split(':')[0]);
          
          for (let hour = openHour; hour < closeHour; hour++) {
            // Saltar la hora de almuerzo (13:00)
            if (hour === 13) continue;
            
            // Formatear hora con dos dígitos
            const formattedHour = hour.toString().padStart(2, '0') + ':00';
            hours.push(formattedHour);
          }
        } else {
          // Horas por defecto si no hay horario específico
          hours = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00"];
        }
        
        this.availableHours = hours;
        
      } catch (err) {
        console.error("❌ Error cargando horas disponibles:", err);
        this.availableHours = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00"];
      }
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
    
    async confirmReservation() {
      // Verificar autenticación
      if (!this.isAuthenticated) {
        alert("⚠️ Tu sesión ha expirado. Por favor, inicia sesión nuevamente.");
        this.userStore.logout();
        this.goToLogin();
        return;
      }
      
      if (!this.isReservationValid) {
        alert("⚠️ Por favor, completa todos los campos requeridos");
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
        
        // Mostrar mensaje de éxito (MODIFICADO: No redirige a citas)
        this.showSuccessMessage(
          `✅ Cita reservada exitosamente!\n\n` +
          `Tu cita para "${this.selectedService.name}" ha sido agendada para el ${this.formatDate(this.reservationDate)} a las ${this.reservationTime}.\n\n` +
          `El precio total es: $${this.selectedService.price}\n` +
          `Podrás ver los detalles de tu cita en tu historial de citas.`
        );
        
        // Cerrar modales sin redirigir
        this.closeReservationModal();
        this.closeDetailModal();
        
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
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },
    
    showSuccessMessage(message) {
      // Mostrar alerta de éxito
      alert(message);
      
      // También puedes usar un toast más elegante si lo prefieres
      this.showTemporaryMessage('✅ Cita creada exitosamente', 'success');
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

/* Cards modernas */
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
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  color: #6b7280;
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
  .grid.grid-cols-1.md\:grid-cols-2.lg\:grid-cols-3.xl\:grid-cols-4 {
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
  
  .card-modern figure {
    height: 200px;
  }
  
  .text-5xl {
    font-size: 2.5rem;
  }
  
  .text-6xl {
    font-size: 3rem;
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