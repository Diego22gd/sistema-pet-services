<template>
  <AdminLayout>
    <div class="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <!-- Sidebar Mejorado -->
      <aside class="w-80 bg-white shadow-2xl border-r border-gray-200 transform transition-all duration-500 ease-in-out">
        <div class="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-purple-700">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <span class="text-xl">📊</span>
            </div>
            <div>
              <h2 class="text-2xl font-bold text-white">Analytics Pro</h2>
              <p class="text-sm text-purple-100 mt-1">Panel de análisis premium</p>
            </div>
          </div>
        </div>
        
        <nav class="p-4 space-y-1">
          <button 
            @click="activeTab = 'overview'" 
            :class="tabClass('overview')"
            class="w-full text-left transition-all duration-300 group"
          >
            <div class="flex items-center gap-3 py-3 px-4 rounded-xl">
              <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span class="text-lg">📈</span>
              </div>
              <div>
                <div class="font-semibold">Dashboard</div>
                <div class="text-xs opacity-80">Resumen general</div>
              </div>
              <div :class="activeTab === 'overview' ? 'opacity-100' : 'opacity-0'" class="ml-auto w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            </div>
          </button>
          
          <button 
            @click="activeTab = 'appointments'" 
            :class="tabClass('appointments')"
            class="w-full text-left transition-all duration-300 group"
          >
            <div class="flex items-center gap-3 py-3 px-4 rounded-xl">
              <div class="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span class="text-lg">📅</span>
              </div>
              <div>
                <div class="font-semibold">Citas</div>
                <div class="text-xs opacity-80">Estados y métricas</div>
              </div>
            </div>
          </button>
          
          <button 
            @click="activeTab = 'businesses'" 
            :class="tabClass('businesses')"
            class="w-full text-left transition-all duration-300 group"
          >
            <div class="flex items-center gap-3 py-3 px-4 rounded-xl">
              <div class="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span class="text-lg">🏢</span>
              </div>
              <div>
                <div class="font-semibold">Comercios</div>
                <div class="text-xs opacity-80">Proveedores y negocios</div>
              </div>
            </div>
          </button>

          <button 
            @click="activeTab = 'revenue'" 
            :class="tabClass('revenue')"
            class="w-full text-left transition-all duration-300 group"
          >
            <div class="flex items-center gap-3 py-3 px-4 rounded-xl">
              <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span class="text-lg">💰</span>
              </div>
              <div>
                <div class="font-semibold">Ingresos</div>
                <div class="text-xs opacity-80">Análisis financiero</div>
              </div>
            </div>
          </button>
        </nav>

        <!-- Stats del Sidebar -->
        <div class="p-4 border-t border-gray-200">
          <div class="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-4 text-white">
            <div class="text-sm opacity-80 mb-2">Resumen Global</div>
            <div class="flex items-center justify-between mb-3">
              <div class="text-2xl font-bold">{{ formatNumber(stats?.totalClients || 0) }}</div>
              <div class="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full">Clientes</div>
            </div>
            <div class="flex items-center justify-between">
              <div class="text-2xl font-bold">${{ formatNumber(stats?.monthlyRevenue || 0) }}</div>
              <div class="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">Ingresos</div>
            </div>
          </div>
        </div>
      </aside>

      <!-- Contenido principal -->
      <main class="flex-1 p-6 overflow-y-auto">
        <!-- Header dinámico -->
        <div class="mb-8 fade-up" :class="{ 'show': showContent }">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ getSectionTitle() }}</h1>
              <p class="text-gray-600 text-lg">{{ getSectionDescription() }}</p>
            </div>
            <div class="flex items-center gap-3">
              <div class="text-sm text-gray-500">
                Actualizado: {{ formatDate(lastUpdated) }}
              </div>
              <button v-if="activeTab === 'revenue'" @click="generatePDF" class="btn-primary-purple">
                <span>📄</span>
                Exportar PDF
              </button>
            </div>
          </div>
          
          <!-- Filtros por periodo -->
          <div class="flex gap-2 mb-6">
            <button 
              v-for="period in periodOptions" 
              :key="period.value"
              @click="selectedPeriod = period.value; fetchData()"
              :class="selectedPeriod === period.value 
                ? 'bg-purple-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'"
              class="px-4 py-2 rounded-lg border border-gray-200 transition-all duration-300 hover:shadow-md"
            >
              {{ period.label }}
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="fade-up show">
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            <div v-for="i in 4" :key="i" class="card-modern animate-pulse">
              <div class="h-32 bg-gray-200 rounded-t-2xl"></div>
            </div>
          </div>
        </div>

        <!-- Overview Section -->
        <section v-if="activeTab === 'overview' && !loading" class="space-y-8">
          <!-- Tarjetas de métricas principales -->
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 fade-up" :class="{ 'show': showContent }">
            <div class="card-modern hover:border-blue-500 hover:shadow-2xl">
              <div class="p-6">
                <div class="flex items-center justify-between mb-4">
                  <div class="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                    <span class="text-2xl text-blue-600">👥</span>
                  </div>
                  <div class="text-right">
                    <div class="text-3xl font-bold text-gray-900">{{ formatNumber(stats?.totalClients || 0) }}</div>
                    <div class="text-sm text-gray-500">Clientes</div>
                  </div>
                </div>
                <div class="flex items-center justify-between">
                  <div class="text-sm text-green-600 font-semibold flex items-center">
                    <span class="mr-1">▲</span>
                    +{{ stats?.clientsThisMonth || 0 }} este mes
                  </div>
                  <div class="text-xs text-gray-400">Total registrados</div>
                </div>
              </div>
            </div>

            <div class="card-modern hover:border-green-500 hover:shadow-2xl">
              <div class="p-6">
                <div class="flex items-center justify-between mb-4">
                  <div class="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                    <span class="text-2xl text-green-600">🏢</span>
                  </div>
                  <div class="text-right">
                    <div class="text-3xl font-bold text-gray-900">{{ formatNumber(stats?.totalProviders || 0) }}</div>
                    <div class="text-sm text-gray-500">Proveedores</div>
                  </div>
                </div>
                <div class="flex items-center justify-between">
                  <div class="text-sm text-green-600 font-semibold flex items-center">
                    <span class="mr-1">▲</span>
                    +{{ stats?.providersThisMonth || 0 }} este mes
                  </div>
                  <div class="text-xs text-gray-400">Suscritos: {{ formatNumber(stats?.totalProviders || 0) }}</div>
                </div>
              </div>
            </div>

            <div class="card-modern hover:border-purple-500 hover:shadow-2xl">
              <div class="p-6">
                <div class="flex items-center justify-between mb-4">
                  <div class="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                    <span class="text-2xl text-purple-600">📅</span>
                  </div>
                  <div class="text-right">
                    <div class="text-3xl font-bold text-gray-900">{{ formatNumber(stats?.totalAppointments || 0) }}</div>
                    <div class="text-sm text-gray-500">Citas/Mes</div>
                  </div>
                </div>
                <div class="flex items-center justify-between">
                  <div class="text-sm text-green-600 font-semibold flex items-center">
                    <span class="mr-1">▲</span>
                    +{{ stats?.appointmentsThisMonth || 0 }} este mes
                  </div>
                  <div class="text-xs text-gray-400">Total completadas</div>
                </div>
              </div>
            </div>

            <div class="card-modern hover:border-yellow-500 hover:shadow-2xl">
              <div class="p-6">
                <div class="flex items-center justify-between mb-4">
                  <div class="w-12 h-12 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl flex items-center justify-center">
                    <span class="text-2xl text-yellow-600">💰</span>
                  </div>
                  <div class="text-right">
                    <div class="text-3xl font-bold text-gray-900">${{ formatNumber(stats?.monthlyRevenue || 0) }}</div>
                    <div class="text-sm text-gray-500">Ingresos Mensuales</div>
                  </div>
                </div>
                <div class="flex items-center justify-between">
                  <div class="text-sm text-green-600 font-semibold flex items-center">
                    <span class="mr-1">▲</span>
                    $100/proveedor
                  </div>
                  <div class="text-xs text-gray-400">Suscripciones activas</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Gráficos del overview -->
          <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-4">
            <div class="card-modern fade-up" :class="{ 'show': showContent }" style="animation-delay: 0.1s">
              <div class="p-6">
                <h3 class="font-bold text-xl text-gray-900 mb-4 flex items-center">
                  <span class="mr-2">📊</span>
                  Citas por Estado
                </h3>
                <div class="h-80">
                  <canvas ref="overviewStatusChart"></canvas>
                </div>
                <div v-if="charts?.appointmentsByStatus" class="mt-4 grid grid-cols-2 gap-2">
                  <div v-for="(count, status) in charts.appointmentsByStatus" :key="status" class="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span class="text-sm text-gray-600 capitalize">{{ status }}</span>
                    <span class="font-semibold">{{ count }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="card-modern fade-up" :class="{ 'show': showContent }" style="animation-delay: 0.2s">
              <div class="p-6">
                <h3 class="font-bold text-xl text-gray-900 mb-4 flex items-center">
                  <span class="mr-2">🔥</span>
                  Servicios Populares
                </h3>
                <div class="h-80">
                  <canvas ref="overviewServicesChart"></canvas>
                </div>
                <div v-if="charts?.popularServices?.length" class="mt-4 space-y-2">
                  <div v-for="service in charts.popularServices" :key="service.name" class="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg hover:from-purple-50 transition-all duration-300">
                    <div>
                      <div class="font-medium text-gray-900">{{ service.name }}</div>
                      <div class="text-sm text-gray-500">{{ service.appointments }} citas</div>
                    </div>
                    <div class="text-lg font-bold text-purple-600">${{ formatNumber(service.revenue) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Tendencia mensual -->
          <div class="card-modern fade-up" :class="{ 'show': showContent }" style="animation-delay: 0.3s">
            <div class="p-6">
              <h3 class="font-bold text-xl text-gray-900 mb-4 flex items-center">
                <span class="mr-2">📈</span>
                Tendencia Mensual de Citas
              </h3>
              <div class="h-96">
                <canvas ref="monthlyTrendChart"></canvas>
              </div>
            </div>
          </div>
        </section>

        <!-- Appointments Section -->
        <section v-if="activeTab === 'appointments' && !loading" class="space-y-8">
          <!-- Estadísticas de citas -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 fade-up" :class="{ 'show': showContent }">
            <div v-for="stat in appointmentStats" :key="stat.label" class="card-modern">
              <div class="p-6">
                <div class="flex items-center justify-between">
                  <div>
                    <div class="text-2xl font-bold text-gray-900">{{ stat.value }}</div>
                    <div class="text-sm text-gray-500">{{ stat.label }}</div>
                  </div>
                  <div :class="stat.bgColor" class="w-12 h-12 rounded-xl flex items-center justify-center">
                    <span class="text-xl">{{ stat.icon }}</span>
                  </div>
                </div>
                <div class="mt-3 text-xs text-gray-400">{{ stat.description }}</div>
              </div>
            </div>
          </div>

          <!-- Gráficos de citas -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="card-modern fade-up" :class="{ 'show': showContent }" style="animation-delay: 0.1s">
              <div class="p-6">
                <h3 class="font-bold text-xl text-gray-900 mb-4">Distribución de Citas</h3>
                <div class="h-80">
                  <canvas ref="appointmentsDistributionChart"></canvas>
                </div>
              </div>
            </div>
            
            <div class="card-modern fade-up lg:col-span-2" :class="{ 'show': showContent }" style="animation-delay: 0.2s">
              <div class="p-6">
                <h3 class="font-bold text-xl text-gray-900 mb-4">Tendencia Mensual</h3>
                <div class="h-80">
                  <canvas ref="appointmentsTrendChart"></canvas>
                </div>
              </div>
            </div>
          </div>

          <!-- Citas por día -->
          <div class="card-modern fade-up" :class="{ 'show': showContent }" style="animation-delay: 0.3s">
            <div class="p-6">
              <h3 class="font-bold text-xl text-gray-900 mb-4">Citas por Día de la Semana</h3>
              <div class="h-96">
                <canvas ref="appointmentsByDayChart"></canvas>
              </div>
            </div>
          </div>

          <!-- Top proveedores -->
          <div class="card-modern fade-up" :class="{ 'show': showContent }" style="animation-delay: 0.4s">
            <div class="p-6">
              <h3 class="font-bold text-xl text-gray-900 mb-4">Top Proveedores por Citas</h3>
              <div v-if="appointmentData?.topProviders?.length" class="overflow-x-auto">
                <table class="w-full">
                  <thead>
                    <tr class="border-b border-gray-200">
                      <th class="py-3 px-4 text-left text-gray-600 font-medium">Proveedor</th>
                      <th class="py-3 px-4 text-left text-gray-600 font-medium">Citas</th>
                      <th class="py-3 px-4 text-left text-gray-600 font-medium">Completadas</th>
                      <th class="py-3 px-4 text-left text-gray-600 font-medium">Ingresos</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="provider in appointmentData.topProviders" :key="provider._id" class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td class="py-3 px-4">
                        <div class="font-medium text-gray-900">{{ provider.providerName }}</div>
                        <div class="text-sm text-gray-500">{{ provider.providerEmail }}</div>
                      </td>
                      <td class="py-3 px-4 font-semibold">{{ provider.count }}</td>
                      <td class="py-3 px-4">
                        <span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                          {{ provider.completed }}
                        </span>
                      </td>
                      <td class="py-3 px-4 font-bold text-purple-600">${{ formatNumber(provider.revenue) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div v-else class="text-center py-8 text-gray-500">
                No hay datos de proveedores disponibles
              </div>
            </div>
          </div>
        </section>

        <!-- Businesses Section -->
        <section v-if="activeTab === 'businesses' && !loading" class="space-y-8">
          <!-- Estadísticas de comercios -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 fade-up" :class="{ 'show': showContent }">
            <div class="card-modern">
              <div class="p-6">
                <div class="flex items-center justify-between mb-4">
                  <div>
                    <div class="text-3xl font-bold text-gray-900">{{ formatNumber(businessStats?.totalProviders || 0) }}</div>
                    <div class="text-sm text-gray-500">Proveedores</div>
                  </div>
                  <div class="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                    <span class="text-2xl text-blue-600">👨‍💼</span>
                  </div>
                </div>
                <div class="text-sm text-green-600 font-semibold">
                  ▲ +{{ businessStats?.newProvidersThisMonth || 0 }} este mes
                </div>
              </div>
            </div>

            <div class="card-modern">
              <div class="p-6">
                <div class="flex items-center justify-between mb-4">
                  <div>
                    <div class="text-3xl font-bold text-gray-900">{{ formatNumber(businessStats?.totalBusinesses || 0) }}</div>
                    <div class="text-sm text-gray-500">Comercios</div>
                  </div>
                  <div class="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                    <span class="text-2xl text-green-600">🏪</span>
                  </div>
                </div>
                <div class="text-sm text-green-600 font-semibold">
                  ▲ +{{ businessStats?.newBusinessesThisMonth || 0 }} este mes
                </div>
              </div>
            </div>

            <div class="card-modern">
              <div class="p-6">
                <div class="flex items-center justify-between mb-4">
                  <div>
                    <div class="text-3xl font-bold text-gray-900">{{ businessStats?.activeProviders || 0 }}</div>
                    <div class="text-sm text-gray-500">Suscritos Activos</div>
                  </div>
                  <div class="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                    <span class="text-2xl text-purple-600">💎</span>
                  </div>
                </div>
                <div class="text-sm text-gray-600">
                  ${{ (businessStats?.activeProviders || 0) * 100 }}/mes
                </div>
              </div>
            </div>

            <div class="card-modern">
              <div class="p-6">
                <div class="flex items-center justify-between mb-4">
                  <div>
                    <div class="text-3xl font-bold text-gray-900">{{ businessStats?.pendingBusinesses || 0 }}</div>
                    <div class="text-sm text-gray-500">Pendientes</div>
                  </div>
                  <div class="w-12 h-12 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl flex items-center justify-center">
                    <span class="text-2xl text-yellow-600">⏳</span>
                  </div>
                </div>
                <div class="text-sm text-gray-600">
                  Esperando aprobación
                </div>
              </div>
            </div>
          </div>

          <!-- Distribución por categoría -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div class="card-modern fade-up" :class="{ 'show': showContent }" style="animation-delay: 0.1s">
              <div class="p-6">
                <h3 class="font-bold text-xl text-gray-900 mb-4">Distribución por Categoría</h3>
                <div class="h-80">
                  <canvas ref="businessCategoryChart"></canvas>
                </div>
              </div>
            </div>

            <div class="card-modern fade-up" :class="{ 'show': showContent }" style="animation-delay: 0.2s">
              <div class="p-6">
                <h3 class="font-bold text-xl text-gray-900 mb-4">Top Comercios por Vistas</h3>
                <div v-if="businessData?.topBusinesses?.length" class="space-y-4 max-h-80 overflow-y-auto">
                  <div v-for="business in businessData.topBusinesses" :key="business._id" class="flex items-center p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl hover:from-purple-50 transition-all duration-300 group">
                    <div class="w-12 h-12 rounded-lg overflow-hidden mr-4">
                      <img :src="business.image || getDefaultBusinessImage(business.category)" :alt="business.name" class="w-full h-full object-cover">
                    </div>
                    <div class="flex-1">
                      <div class="font-medium text-gray-900">{{ business.name }}</div>
                      <div class="text-sm text-gray-500">{{ business.category }}</div>
                    </div>
                    <div class="text-right">
                      <div class="font-bold text-gray-900">{{ formatNumber(business.views) }}</div>
                      <div class="text-xs text-gray-500">vistas</div>
                    </div>
                  </div>
                </div>
                <div v-else class="text-center py-8 text-gray-500">
                  No hay datos de comercios disponibles
                </div>
              </div>
            </div>
          </div>

          <!-- Comercios destacados -->
          <div class="card-modern fade-up" :class="{ 'show': showContent }" style="animation-delay: 0.3s">
            <div class="p-6">
              <h3 class="font-bold text-xl text-gray-900 mb-4 flex items-center">
                <span class="mr-2">⭐</span>
                Comercios Destacados
                <span class="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                  {{ businessStats?.featuredBusinesses || 0 }}
                </span>
              </h3>
              <div v-if="businessData?.byCategory?.length" class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div v-for="category in businessData.byCategory.slice(0, 6)" :key="category._id" class="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-200 hover:border-purple-300 transition-all duration-300">
                  <div class="flex items-center justify-between mb-2">
                    <div class="font-medium text-gray-900">{{ category._id }}</div>
                    <div class="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold">
                      {{ category.count }}
                    </div>
                  </div>
                  <div class="text-sm text-gray-600 mb-3">
                    {{ formatNumber(category.totalViews) }} vistas
                  </div>
                  <div class="flex items-center text-sm">
                    <div class="text-yellow-500 mr-1">★</div>
                    <div class="text-gray-700">{{ (category.averageRating || 0).toFixed(1) }}</div>
                    <div class="ml-auto text-xs text-gray-500">rating promedio</div>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-8 text-gray-500">
                No hay datos de categorías disponibles
              </div>
            </div>
          </div>
        </section>

        <!-- Revenue Section -->
        <section v-if="activeTab === 'revenue' && !loading" class="space-y-8">
          <!-- Resumen de ingresos -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 fade-up" :class="{ 'show': showContent }">
            <div class="card-modern lg:col-span-2">
              <div class="p-6">
                <h3 class="font-bold text-xl text-gray-900 mb-4">Resumen Anual</h3>
                <div class="grid grid-cols-2 gap-4">
                  <div class="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
                    <div class="text-sm text-blue-700 mb-1">Ingresos Este Año</div>
                    <div class="text-3xl font-bold text-blue-900">${{ formatNumber(revenueData?.yearlySummary?.currentYear?.revenue || 0) }}</div>
                    <div class="text-sm text-blue-600 mt-2">
                      {{ revenueData?.yearlySummary?.currentYear?.appointments || 0 }} citas
                    </div>
                  </div>
                  <div class="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl">
                    <div class="text-sm text-green-700 mb-1">Crecimiento</div>
                    <div class="text-3xl font-bold text-green-900">{{ revenueData?.yearlySummary?.growthRate || 0 }}%</div>
                    <div class="text-sm text-green-600 mt-2">
                      vs año anterior
                    </div>
                  </div>
                  <div class="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
                    <div class="text-sm text-purple-700 mb-1">Suscripciones Activas</div>
                    <div class="text-3xl font-bold text-purple-900">{{ revenueData?.subscriptionMetrics?.activeSubscriptions || 0 }}</div>
                    <div class="text-sm text-purple-600 mt-2">
                      ${{ formatNumber(revenueData?.subscriptionMetrics?.totalMonthlyRevenue || 0) }}/mes
                    </div>
                  </div>
                  <div class="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl">
                    <div class="text-sm text-orange-700 mb-1">Por Proveedor</div>
                    <div class="text-3xl font-bold text-orange-900">$100</div>
                    <div class="text-sm text-orange-600 mt-2">
                      mensual
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="card-modern">
              <div class="p-6">
                <h3 class="font-bold text-xl text-gray-900 mb-4">Ingresos del Mes</h3>
                <div class="space-y-4">
                  <div class="flex items-center justify-between">
                    <div class="text-gray-600">Suscripciones</div>
                    <div class="font-bold text-blue-600">${{ formatNumber(revenueData?.subscriptionMetrics?.totalMonthlyRevenue || 0) }}</div>
                  </div>
                  <div class="flex items-center justify-between">
                    <div class="text-gray-600">Citas</div>
                    <div class="font-bold text-green-600">${{ formatNumber(getCurrentMonthAppointmentRevenue()) }}</div>
                  </div>
                  <div class="pt-4 border-t border-gray-200">
                    <div class="flex items-center justify-between">
                      <div class="text-gray-900 font-bold">Total</div>
                      <div class="text-2xl font-bold text-purple-600">
                        ${{ formatNumber((revenueData?.subscriptionMetrics?.totalMonthlyRevenue || 0) + getCurrentMonthAppointmentRevenue()) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Gráficos de ingresos -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div class="card-modern fade-up" :class="{ 'show': showContent }" style="animation-delay: 0.1s">
              <div class="p-6">
                <h3 class="font-bold text-xl text-gray-900 mb-4">Ingresos Mensuales</h3>
                <div class="h-80">
                  <canvas ref="revenueChart"></canvas>
                </div>
              </div>
            </div>
            
            <div class="card-modern fade-up" :class="{ 'show': showContent }" style="animation-delay: 0.2s">
              <div class="p-6">
                <h3 class="font-bold text-xl text-gray-900 mb-4">Ingresos por Servicio</h3>
                <div class="h-80">
                  <canvas ref="revenueByServiceChart"></canvas>
                </div>
              </div>
            </div>
          </div>

          <!-- Top proveedores por ingresos -->
          <div class="card-modern fade-up" :class="{ 'show': showContent }" style="animation-delay: 0.3s">
            <div class="p-6">
              <h3 class="font-bold text-xl text-gray-900 mb-4">Top Proveedores por Ingresos</h3>
              <div v-if="revenueData?.topProviders?.length" class="overflow-x-auto">
                <table class="w-full">
                  <thead>
                    <tr class="border-b border-gray-200">
                      <th class="py-3 px-4 text-left text-gray-600 font-medium">Proveedor</th>
                      <th class="py-3 px-4 text-left text-gray-600 font-medium">Ingresos</th>
                      <th class="py-3 px-4 text-left text-gray-600 font-medium">Citas</th>
                      <th class="py-3 px-4 text-left text-gray-600 font-medium">Promedio/Cita</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="provider in revenueData.topProviders" :key="provider._id" class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td class="py-3 px-4">
                        <div class="font-medium text-gray-900">{{ provider.providerName }}</div>
                        <div class="text-sm text-gray-500">{{ provider.providerEmail }}</div>
                      </td>
                      <td class="py-3 px-4">
                        <div class="font-bold text-purple-600">${{ formatNumber(provider.revenue) }}</div>
                      </td>
                      <td class="py-3 px-4 font-semibold">{{ provider.appointments }}</td>
                      <td class="py-3 px-4">
                        <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          ${{ formatNumber(provider.revenue / (provider.appointments || 1)) }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div v-else class="text-center py-8 text-gray-500">
                No hay datos de proveedores disponibles
              </div>
            </div>
          </div>

          <!-- Servicios más rentables -->
          <div class="card-modern fade-up" :class="{ 'show': showContent }" style="animation-delay: 0.4s">
            <div class="p-6">
              <h3 class="font-bold text-xl text-gray-900 mb-4">Servicios Más Rentables</h3>
              <div v-if="revenueData?.byService?.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div v-for="service in revenueData.byService.slice(0, 5)" :key="service._id" class="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-200 hover:border-green-300 transition-all duration-300">
                  <div class="font-medium text-gray-900 mb-2 truncate">{{ service._id }}</div>
                  <div class="text-2xl font-bold text-green-600 mb-2">${{ formatNumber(service.revenue) }}</div>
                  <div class="text-sm text-gray-600">{{ service.count }} citas</div>
                  <div class="text-xs text-gray-500 mt-2">${{ formatNumber(service.revenue / (service.count || 1)) }} por cita</div>
                </div>
              </div>
              <div v-else class="text-center py-8 text-gray-500">
                No hay datos de servicios disponibles
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
    <Chatbot />
  </AdminLayout>
</template>

<script>
import AdminLayout from "@/components/AdminLayout.vue";
import Chatbot from "@/components/Chatbot.vue";
import { ref, watch, onMounted, nextTick, computed } from "vue";
import Chart from "chart.js/auto";
import axios from "axios";

export default {
  name: "AdminReports",
  components: { AdminLayout, Chatbot },
  setup() {
    const activeTab = ref("overview");
    const showContent = ref(false);
    const loading = ref(false);
    const lastUpdated = ref(new Date());
    const selectedPeriod = ref("month");

    // Datos de la API - Inicializar con valores por defecto
    const stats = ref({
      totalClients: 0,
      totalProviders: 0,
      totalBusinesses: 0,
      clientsThisMonth: 0,
      providersThisMonth: 0,
      businessesThisMonth: 0,
      totalAppointments: 0,
      appointmentsThisMonth: 0,
      monthlyRevenue: 0
    });
    
    const charts = ref({
      appointmentsByStatus: {},
      popularServices: [],
      monthlyTrend: []
    });
    
    const appointmentData = ref({
      distribution: [],
      trend: [],
      byDay: [],
      topProviders: []
    });
    
    const businessData = ref({
      summary: {
        totalProviders: 0,
        totalBusinesses: 0,
        activeProviders: 0,
        newProvidersThisMonth: 0,
        newBusinessesThisMonth: 0,
        pendingBusinesses: 0,
        featuredBusinesses: 0
      },
      byCategory: [],
      topBusinesses: []
    });
    
    const revenueData = ref({
      monthlyRevenue: [],
      yearlySummary: {
        currentYear: { revenue: 0, appointments: 0 },
        previousYear: { revenue: 0 },
        growthRate: 0
      },
      byService: [],
      topProviders: [],
      subscriptionMetrics: {
        activeSubscriptions: 0,
        monthlyRevenuePerProvider: 100,
        totalMonthlyRevenue: 0
      }
    });
    
    // Referencias a los gráficos
    const overviewStatusChart = ref(null);
    const overviewServicesChart = ref(null);
    const monthlyTrendChart = ref(null);
    const appointmentsDistributionChart = ref(null);
    const appointmentsTrendChart = ref(null);
    const appointmentsByDayChart = ref(null);
    const businessCategoryChart = ref(null);
    const revenueChart = ref(null);
    const revenueByServiceChart = ref(null);

    // Instancias de Chart.js
    const chartInstances = ref({});

    // Opciones de periodo
    const periodOptions = [
      { label: "Semana", value: "week" },
      { label: "Mes", value: "month" },
      { label: "Trimestre", value: "quarter" },
      { label: "Año", value: "year" }
    ];

    // Títulos y descripciones dinámicas
    const getSectionTitle = () => {
      const titles = {
        overview: "Dashboard de Analytics",
        appointments: "Análisis de Citas",
        businesses: "Métricas de Comercios",
        revenue: "Reportes de Ingresos"
      };
      return titles[activeTab.value] || "Reports & Analytics";
    };

    const getSectionDescription = () => {
      const descriptions = {
        overview: "Resumen completo de métricas y tendencias del sistema",
        appointments: "Seguimiento y análisis del comportamiento de citas",
        businesses: "Gestión y métricas de proveedores y comercios",
        revenue: "Análisis financiero y tendencias de ingresos"
      };
      return descriptions[activeTab.value] || "Panel de análisis y métricas";
    };

    // Clases para tabs
    const tabClass = (tab) =>
      `w-full text-left transition-all duration-300 rounded-xl ${
        activeTab.value === tab
          ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg"
          : "text-gray-700 hover:bg-gray-50"
      }`;

    // Formatear números
    const formatNumber = (num) => {
      if (!num && num !== 0) return "0";
      return new Intl.NumberFormat('en-US').format(num);
    };

    // Formatear fecha
    const formatDate = (date) => {
      return new Intl.DateTimeFormat('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date(date));
    };

    // Estadísticas calculadas para citas
    const appointmentStats = computed(() => {
      if (!appointmentData.value.distribution || !Array.isArray(appointmentData.value.distribution)) {
        return [
          {
            label: "Total Citas",
            value: "0",
            icon: "📊",
            bgColor: "bg-gradient-to-br from-blue-100 to-blue-200",
            description: "Cargando..."
          },
          {
            label: "Completadas",
            value: "0",
            icon: "✅",
            bgColor: "bg-gradient-to-br from-green-100 to-green-200",
            description: "Cargando..."
          },
          {
            label: "Pendientes",
            value: "0",
            icon: "⏳",
            bgColor: "bg-gradient-to-br from-yellow-100 to-yellow-200",
            description: "Cargando..."
          },
          {
            label: "Canceladas",
            value: "0",
            icon: "❌",
            bgColor: "bg-gradient-to-br from-red-100 to-red-200",
            description: "Cargando..."
          }
        ];
      }
      
      const completed = appointmentData.value.distribution
        .find(d => d?.status === 'completada')?.count || 0;
      const pending = appointmentData.value.distribution
        .find(d => d?.status === 'pendiente')?.count || 0;
      const cancelled = appointmentData.value.distribution
        .find(d => d?.status === 'cancelada')?.count || 0;
      const total = appointmentData.value.distribution
        .reduce((sum, d) => sum + (d?.count || 0), 0);

      return [
        {
          label: "Total Citas",
          value: formatNumber(total),
          icon: "📊",
          bgColor: "bg-gradient-to-br from-blue-100 to-blue-200",
          description: `Período: ${selectedPeriod.value}`
        },
        {
          label: "Completadas",
          value: formatNumber(completed),
          icon: "✅",
          bgColor: "bg-gradient-to-br from-green-100 to-green-200",
          description: `${total > 0 ? ((completed / total) * 100).toFixed(1) : 0}% del total`
        },
        {
          label: "Pendientes",
          value: formatNumber(pending),
          icon: "⏳",
          bgColor: "bg-gradient-to-br from-yellow-100 to-yellow-200",
          description: "Por confirmar"
        },
        {
          label: "Canceladas",
          value: formatNumber(cancelled),
          icon: "❌",
          bgColor: "bg-gradient-to-br from-red-100 to-red-200",
          description: `${total > 0 ? ((cancelled / total) * 100).toFixed(1) : 0}% del total`
        }
      ];
    });

    // Estadísticas de comercios
    const businessStats = computed(() => {
      return businessData.value.summary || {};
    });

    // Obtener ingresos por citas del mes actual
    const getCurrentMonthAppointmentRevenue = () => {
      if (!revenueData.value.monthlyRevenue || !Array.isArray(revenueData.value.monthlyRevenue)) {
        return 0;
      }
      
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      
      const currentMonthData = revenueData.value.monthlyRevenue.find(
        month => month?.month === currentMonth && month?.year === currentYear
      );
      
      return currentMonthData?.appointmentRevenue || 0;
    };

    // Función auxiliar para imagen por defecto
    const getDefaultBusinessImage = (category) => {
      const images = {
        'Veterinaria': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTNmOGZkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzEwYjk4MSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPjxpPnN0ZXRob3Njb3BlPC9pPjwvdGV4dD48L3N2Zz4=',
        'Peluquería': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBlZGZhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzhiNmJmNSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPjxpPnNjaXNzb3JzPC9pPjwvdGV4dD48L3N2Zz4=',
        'Guardería': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmOGUzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iI2Y1OTkyNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPjxpPmhvdXNlPC9pPjwvdGV4dD48L3N2Zz4=',
        'default': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmZGY1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzY2NjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlbiA6KDwvdGV4dD48L3N2Zz4='
      };
      
      return images[category] || images.default;
    };

    // 🔹 Obtener datos según la pestaña activa
    const fetchData = async () => {
      loading.value = true;
      try {
        const endpoints = {
          overview: "/api/admin/reports/overview",
          appointments: `/api/admin/reports/appointments?period=${selectedPeriod.value}`,
          businesses: "/api/admin/reports/businesses",
          revenue: "/api/admin/reports/revenue"
        };

        const { data } = await axios.get(endpoints[activeTab.value]);
        
        if (activeTab.value === 'overview') {
          stats.value = data.data?.stats || stats.value;
          charts.value = data.data?.charts || charts.value;
          renderOverviewCharts();
        } else if (activeTab.value === 'appointments') {
          appointmentData.value = data.data || appointmentData.value;
          renderAppointmentCharts();
        } else if (activeTab.value === 'businesses') {
          businessData.value = data.data || businessData.value;
          renderBusinessCharts();
        } else if (activeTab.value === 'revenue') {
          revenueData.value = data.data || revenueData.value;
          renderRevenueCharts();
        }

        lastUpdated.value = new Date();
        showContent.value = true;
        
      } catch (error) {
        console.error(`Error fetching ${activeTab.value} data:`, error);
        // Datos de ejemplo para desarrollo
        loadSampleData();
      } finally {
        loading.value = false;
      }
    };

    // 🔹 Renderizar gráficos del overview
    const renderOverviewCharts = () => {
      // Destruir gráficos existentes
      Object.values(chartInstances.value).forEach(chart => chart?.destroy());
      chartInstances.value = {};

      // 1. Gráfico de estado de citas (doughnut)
      if (overviewStatusChart.value && charts.value.appointmentsByStatus) {
        const ctx = overviewStatusChart.value.getContext("2d");
        const statusData = charts.value.appointmentsByStatus;
        
        chartInstances.value.overviewStatus = new Chart(ctx, {
          type: "doughnut",
          data: {
            labels: Object.keys(statusData).map(s => s?.charAt(0).toUpperCase() + s?.slice(1) || ''),
            datasets: [{
              data: Object.values(statusData),
              backgroundColor: ["#10B981", "#F59E0B", "#EF4444", "#3B82F6", "#8B5CF6"],
              borderWidth: 3,
              borderColor: '#fff'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
              legend: { 
                position: 'bottom',
                labels: {
                  padding: 20,
                  usePointStyle: true
                }
              }
            }
          }
        });
      }

      // 2. Gráfico de servicios populares (bar)
      if (overviewServicesChart.value && charts.value.popularServices && Array.isArray(charts.value.popularServices)) {
        const ctx = overviewServicesChart.value.getContext("2d");
        
        chartInstances.value.overviewServices = new Chart(ctx, {
          type: "bar",
          data: {
            labels: charts.value.popularServices.map(s => s?.name || ''),
            datasets: [{
              label: "Citas",
              data: charts.value.popularServices.map(s => s?.appointments || 0),
              backgroundColor: "#8B5CF6",
              borderRadius: 8,
              borderWidth: 1,
              borderColor: '#7C3AED'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false }
            },
            scales: {
              y: { 
                beginAtZero: true,
                grid: {
                  color: 'rgba(0,0,0,0.05)'
                }
              },
              x: {
                grid: {
                  display: false
                }
              }
            }
          }
        });
      }

      // 3. Gráfico de tendencia mensual (line)
      if (monthlyTrendChart.value && charts.value.monthlyTrend && Array.isArray(charts.value.monthlyTrend)) {
        const ctx = monthlyTrendChart.value.getContext("2d");
        
        chartInstances.value.monthlyTrend = new Chart(ctx, {
          type: "line",
          data: {
            labels: charts.value.monthlyTrend.map(t => t?.month || ''),
            datasets: [{
              label: "Citas",
              data: charts.value.monthlyTrend.map(t => t?.count || 0),
              borderColor: "#10B981",
              backgroundColor: "rgba(16, 185, 129, 0.1)",
              tension: 0.4,
              fill: true,
              pointBackgroundColor: "#10B981",
              pointBorderColor: "#fff",
              pointBorderWidth: 2
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false }
            },
            scales: {
              y: { 
                beginAtZero: true,
                grid: {
                  color: 'rgba(0,0,0,0.05)'
                }
              },
              x: {
                grid: {
                  color: 'rgba(0,0,0,0.05)'
                }
              }
            }
          }
        });
      }
    };

    // 🔹 Renderizar gráficos de citas
    const renderAppointmentCharts = () => {
      // 1. Distribución de citas (pie)
      if (appointmentsDistributionChart.value && appointmentData.value.distribution && Array.isArray(appointmentData.value.distribution)) {
        const ctx = appointmentsDistributionChart.value.getContext("2d");
        
        chartInstances.value.distribution = new Chart(ctx, {
          type: "pie",
          data: {
            labels: appointmentData.value.distribution.map(d => d?.status || ''),
            datasets: [{
              data: appointmentData.value.distribution.map(d => d?.count || 0),
              backgroundColor: ["#10B981", "#F59E0B", "#EF4444", "#3B82F6", "#8B5CF6"],
              borderWidth: 3,
              borderColor: '#fff'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { 
                position: 'right',
                labels: {
                  padding: 20
                }
              }
            }
          }
        });
      }

      // 2. Tendencia mensual (line)
      if (appointmentsTrendChart.value && appointmentData.value.trend && Array.isArray(appointmentData.value.trend)) {
        const ctx = appointmentsTrendChart.value.getContext("2d");
        
        chartInstances.value.trend = new Chart(ctx, {
          type: "line",
          data: {
            labels: appointmentData.value.trend.map(t => t?.month || ''),
            datasets: [
              {
                label: "Total",
                data: appointmentData.value.trend.map(t => t?.total || 0),
                borderColor: "#3B82F6",
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                tension: 0.4,
                fill: true
              },
              {
                label: "Completadas",
                data: appointmentData.value.trend.map(t => t?.completed || 0),
                borderColor: "#10B981",
                backgroundColor: "transparent",
                tension: 0.4,
                borderDash: [5, 5]
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { 
                position: 'top'
              }
            },
            scales: {
              y: { 
                beginAtZero: true,
                grid: {
                  color: 'rgba(0,0,0,0.05)'
                }
              },
              x: {
                grid: {
                  color: 'rgba(0,0,0,0.05)'
                }
              }
            }
          }
        });
      }

      // 3. Citas por día (bar)
      if (appointmentsByDayChart.value && appointmentData.value.byDay && Array.isArray(appointmentData.value.byDay)) {
        const ctx = appointmentsByDayChart.value.getContext("2d");
        
        chartInstances.value.byDay = new Chart(ctx, {
          type: "bar",
          data: {
            labels: appointmentData.value.byDay.map(d => d?.day || ''),
            datasets: [{
              label: "Citas",
              data: appointmentData.value.byDay.map(d => d?.count || 0),
              backgroundColor: "#8B5CF6",
              borderRadius: 8
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false }
            },
            scales: {
              y: { 
                beginAtZero: true,
                grid: {
                  color: 'rgba(0,0,0,0.05)'
                }
              },
              x: {
                grid: {
                  display: false
                }
              }
            }
          }
        });
      }
    };

    // 🔹 Renderizar gráficos de comercios
    const renderBusinessCharts = () => {
      // 1. Distribución por categoría (doughnut)
      if (businessCategoryChart.value && businessData.value.byCategory && Array.isArray(businessData.value.byCategory)) {
        const ctx = businessCategoryChart.value.getContext("2d");
        
        chartInstances.value.businessCategory = new Chart(ctx, {
          type: "doughnut",
          data: {
            labels: businessData.value.byCategory.map(c => c?._id || ''),
            datasets: [{
              data: businessData.value.byCategory.map(c => c?.count || 0),
              backgroundColor: [
                "#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6",
                "#EC4899", "#14B8A6", "#F97316", "#8B5CF6", "#84CC16"
              ]
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '60%',
            plugins: {
              legend: { 
                position: 'right'
              }
            }
          }
        });
      }
    };

    // 🔹 Renderizar gráficos de ingresos
    const renderRevenueCharts = () => {
      // 1. Ingresos mensuales (line)
      if (revenueChart.value && revenueData.value.monthlyRevenue && Array.isArray(revenueData.value.monthlyRevenue)) {
        const ctx = revenueChart.value.getContext("2d");
        
        chartInstances.value.revenue = new Chart(ctx, {
          type: "line",
          data: {
            labels: revenueData.value.monthlyRevenue.map(r => r?.monthName || ''),
            datasets: [
              {
                label: "Total",
                data: revenueData.value.monthlyRevenue.map(r => r?.totalRevenue || 0),
                borderColor: "#8B5CF6",
                backgroundColor: "rgba(139, 92, 246, 0.1)",
                tension: 0.4,
                fill: true
              },
              {
                label: "Suscripciones",
                data: revenueData.value.monthlyRevenue.map(r => r?.subscriptionRevenue || 0),
                borderColor: "#10B981",
                backgroundColor: "transparent",
                tension: 0.4
              },
              {
                label: "Citas",
                data: revenueData.value.monthlyRevenue.map(r => r?.appointmentRevenue || 0),
                borderColor: "#3B82F6",
                backgroundColor: "transparent",
                tension: 0.4
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { 
                position: 'top'
              }
            },
            scales: {
              y: { 
                beginAtZero: true,
                ticks: {
                  callback: function(value) {
                    return '$' + formatNumber(value);
                  }
                }
              }
            }
          }
        });
      }

      // 2. Ingresos por servicio (bar)
      if (revenueByServiceChart.value && revenueData.value.byService && Array.isArray(revenueData.value.byService)) {
        const ctx = revenueByServiceChart.value.getContext("2d");
        
        chartInstances.value.revenueByService = new Chart(ctx, {
          type: "bar",
          data: {
            labels: revenueData.value.byService.map(s => s?._id || ''),
            datasets: [{
              label: "Ingresos ($)",
              data: revenueData.value.byService.map(s => s?.revenue || 0),
              backgroundColor: "#10B981",
              borderRadius: 8
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false }
            },
            scales: {
              y: { 
                beginAtZero: true,
                ticks: {
                  callback: function(value) {
                    return '$' + formatNumber(value);
                  }
                }
              }
            }
          }
        });
      }
    };

    // 🔹 Generar PDF de ingresos
    const generatePDF = async () => {
      try {
        const { data } = await axios.get('/api/admin/reports/revenue-pdf');
        
        // Crear enlace de descarga
        const link = document.createElement('a');
        link.href = data.downloadUrl;
        link.target = '_blank';
        link.download = `reporte-ingresos-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
      } catch (error) {
        console.error('Error generando PDF:', error);
        alert('Error al generar el reporte PDF');
      }
    };

    // 🔹 Cargar datos de ejemplo para desarrollo
    const loadSampleData = () => {
      console.log('Cargando datos de ejemplo para desarrollo...');
      
      // Forzar la renderización de gráficos con datos vacíos
      nextTick(() => {
        if (activeTab.value === 'overview') renderOverviewCharts();
        else if (activeTab.value === 'appointments') renderAppointmentCharts();
        else if (activeTab.value === 'businesses') renderBusinessCharts();
        else if (activeTab.value === 'revenue') renderRevenueCharts();
      });
    };

    // 🔹 Cambio de pestaña
    watch(activeTab, (newTab) => {
      showContent.value = false;
      setTimeout(() => {
        fetchData();
      }, 300);
    });

    // 🔹 Cambio de periodo
    watch(selectedPeriod, () => {
      if (activeTab.value === 'appointments') {
        fetchData();
      }
    });

    onMounted(() => {
      // Animación de entrada
      setTimeout(() => {
        showContent.value = true;
      }, 100);
      
      // Cargar datos iniciales
      fetchData();
    });

    return { 
      activeTab,
      showContent,
      loading,
      lastUpdated,
      selectedPeriod,
      periodOptions,
      stats,
      charts,
      appointmentData,
      businessData,
      revenueData,
      appointmentStats,
      businessStats,
      overviewStatusChart,
      overviewServicesChart,
      monthlyTrendChart,
      appointmentsDistributionChart,
      appointmentsTrendChart,
      appointmentsByDayChart,
      businessCategoryChart,
      revenueChart,
      revenueByServiceChart,
      tabClass,
      getSectionTitle,
      getSectionDescription,
      formatNumber,
      formatDate,
      getCurrentMonthAppointmentRevenue,
      getDefaultBusinessImage,
      generatePDF,
      fetchData
    };
  },
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
  gap: 0.5rem;
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

/* Scrollbar personalizado */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #c7d2fe;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #8b5cf6;
}

/* Animaciones adicionales */
@keyframes slideIn {
  from {
    transform: translateX(-20px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Mejoras de hover para tablas */
tr {
  transition: background-color 0.2s ease;
}

/* Estilos para gráficos */
canvas {
  max-width: 100%;
}

/* Responsive */
@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr !important;
  }
  
  .card-modern {
    border-radius: 16px;
  }
  
  .btn-primary-purple {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }
}
</style>