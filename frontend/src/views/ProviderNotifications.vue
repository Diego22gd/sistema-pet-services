<template>
  <ProviderLayout>
    <div class="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full pt-6">
      <!-- Header con animación -->
      <div class="fade-up" :class="{ show: animated }">
        <div class="mb-8">
          <h1 class="text-4xl font-bold text-gray-900 mb-2">Reportes del Negocio</h1>
          <p class="text-gray-600 text-lg">Analiza el rendimiento y crecimiento de tu negocio con métricas detalladas</p>
        </div>
      </div>

      <!-- Filtros de fecha - Card Modern -->
      <div class="fade-up card-modern mb-8" :class="{ show: animated }">
        <div class="p-6">
          <div class="flex flex-col lg:flex-row gap-6 items-center justify-between">
            <div class="flex flex-col flex-1">
              <h2 class="text-xl font-semibold text-gray-900">Filtrar por período</h2>
              <p class="text-gray-500 mt-1 text-sm">Selecciona un rango de fechas para generar reportes personalizados</p>
            </div>
            <div class="flex flex-col sm:flex-row gap-4">
              <div class="flex items-center gap-2">
                <label class="text-sm font-medium text-gray-700 whitespace-nowrap">Desde:</label>
                <input 
                  type="date" 
                  v-model="filters.startDate"
                  class="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-white shadow-sm"
                />
              </div>
              <div class="flex items-center gap-2">
                <label class="text-sm font-medium text-gray-700 whitespace-nowrap">Hasta:</label>
                <input 
                  type="date" 
                  v-model="filters.endDate"
                  class="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-white shadow-sm"
                />
              </div>
            </div>
          </div>
          
          <!-- Períodos rápidos -->
          <div class="mt-6">
            <p class="text-sm font-medium text-gray-700 mb-3">Períodos rápidos:</p>
            <div class="flex flex-wrap gap-2">
              <button 
                v-for="period in quickPeriods"
                :key="period.label"
                @click="setQuickPeriod(period)"
                :disabled="loading"
                :class="[
                  'px-4 py-2 text-sm rounded-xl transition-all duration-200 font-medium',
                  filters.quickPeriod === period.value 
                    ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-500' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
                ]"
              >
                {{ period.label }}
              </button>
            </div>
          </div>

          <!-- Botones de acción -->
          <div class="flex flex-wrap gap-3 mt-6">
            <button 
              @click="loadReports"
              :disabled="loading"
              class="btn-primary px-6 py-3 rounded-xl"
            >
              <span v-if="loading" class="flex items-center gap-2">
                <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                <span>Procesando...</span>
              </span>
              <span v-else class="flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>Generar Reporte</span>
              </span>
            </button>
            
            <button 
              @click="resetFilters"
              :disabled="loading"
              class="btn-modal-ghost px-6 py-3 rounded-xl"
            >
              <span class="flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
                <span>Limpiar Filtros</span>
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- Tarjetas resumen con animaciones -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div 
          v-for="(stat, index) in summaryCards"
          :key="stat.title"
          class="fade-up card-modern"
          :class="{ show: animated }"
          :style="{ animationDelay: `${index * 100}ms` }"
        >
          <div class="p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900">{{ stat.title }}</h3>
              <div :class="stat.iconBg" class="w-12 h-12 rounded-2xl flex items-center justify-center">
                <span :class="stat.iconColor" class="text-xl">{{ stat.icon }}</span>
              </div>
            </div>
            <p :class="stat.valueColor" class="text-3xl font-bold mb-2">{{ stat.value }}</p>
            <p class="text-sm text-gray-500">{{ stat.description }}</p>
          </div>
        </div>
      </div>

      <!-- Gráficos y métricas -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <!-- Gráfico principal -->
        <div class="lg:col-span-2 fade-up card-modern" :class="{ show: animated }">
          <div class="p-6">
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
              <h2 class="text-xl font-semibold text-gray-900">Evolución de Citas</h2>
              <div class="flex gap-2">
                <button 
                  @click="setChartType('monthly')"
                  :class="[
                    'px-4 py-2 text-sm rounded-xl transition-all duration-200 font-medium',
                    chartType === 'monthly' 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  ]"
                >
                  Mensual
                </button>
                <button 
                  @click="setChartType('weekly')"
                  :class="[
                    'px-4 py-2 text-sm rounded-xl transition-all duration-200 font-medium',
                    chartType === 'weekly' 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  ]"
                >
                  Semanal
                </button>
                <button 
                  @click="setChartType('daily')"
                  :class="[
                    'px-4 py-2 text-sm rounded-xl transition-all duration-200 font-medium',
                    chartType === 'daily' 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  ]"
                >
                  Diario
                </button>
              </div>
            </div>
            <div class="h-80">
              <canvas id="appointmentsChart"></canvas>
            </div>
            
            <!-- Leyenda del gráfico -->
            <div class="flex flex-wrap gap-4 mt-6">
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span class="text-sm text-gray-600">Citas Completadas</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-full bg-red-500"></div>
                <span class="text-sm text-gray-600">Citas Canceladas</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-full bg-amber-500"></div>
                <span class="text-sm text-gray-600">Citas Pendientes</span>
              </div>
              <div class="flex items-center gap-2" v-if="chartType === 'monthly'">
                <div class="w-3 h-3 rounded-full bg-blue-500"></div>
                <span class="text-sm text-gray-600">Ingresos ($)</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Métricas clave -->
        <div class="fade-up card-modern" :class="{ show: animated }">
          <div class="p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Métricas Clave</h2>
            <div class="space-y-6">
              <div 
                v-for="metric in keyMetrics"
                :key="metric.title"
                class="flex justify-between items-center p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors duration-200"
              >
                <div>
                  <p class="text-sm text-gray-500">{{ metric.title }}</p>
                  <p :class="metric.valueClass" class="text-2xl font-bold mt-1">{{ metric.value }}</p>
                  <p v-if="metric.subtitle" class="text-xs text-gray-400 mt-1">{{ metric.subtitle }}</p>
                </div>
                <div :class="metric.iconBg" class="w-14 h-14 rounded-2xl flex items-center justify-center">
                  <span :class="metric.iconColor" class="text-2xl">{{ metric.icon }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Resumen detallado -->
      <div class="fade-up card-modern mb-8" :class="{ show: animated }">
        <div class="p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-6">Resumen Detallado</h2>
          
          <!-- Filtros aplicados -->
          <div class="mb-6 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p class="font-medium text-emerald-800">📋 Filtros aplicados:</p>
                <p class="text-sm text-emerald-600">
                  {{ filters.startDate ? `Desde: ${formatDate(filters.startDate)}` : 'Desde: Todos' }} • 
                  {{ filters.endDate ? `Hasta: ${formatDate(filters.endDate)}` : 'Hasta: Todos' }}
                </p>
              </div>
              <div class="text-right">
                <p class="text-2xl font-bold text-emerald-700">{{ stats.total || 0 }}</p>
                <p class="text-sm text-emerald-600">Total de citas</p>
              </div>
            </div>
          </div>

          <!-- Grid de estadísticas -->
          <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div class="text-center p-4 bg-emerald-50 rounded-xl">
              <p class="text-2xl font-bold text-emerald-700">{{ stats.completed || 0 }}</p>
              <p class="text-sm text-emerald-600">Completadas</p>
            </div>
            <div class="text-center p-4 bg-red-50 rounded-xl">
              <p class="text-2xl font-bold text-red-700">{{ stats.cancelled || 0 }}</p>
              <p class="text-sm text-red-600">Canceladas</p>
            </div>
            <div class="text-center p-4 bg-amber-50 rounded-xl">
              <p class="text-2xl font-bold text-amber-700">{{ stats.pending || 0 }}</p>
              <p class="text-sm text-amber-600">Pendientes</p>
            </div>
            <div class="text-center p-4 bg-blue-50 rounded-xl">
              <p class="text-2xl font-bold text-blue-700">{{ stats.confirmed || 0 }}</p>
              <p class="text-sm text-blue-600">Confirmadas</p>
            </div>
            <div class="text-center p-4 bg-purple-50 rounded-xl">
              <p class="text-2xl font-bold text-purple-700">{{ stats.reprogrammed || 0 }}</p>
              <p class="text-sm text-purple-600">Reprogramadas</p>
            </div>
          </div>

          <!-- Ingresos y potencial -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
              <div class="flex items-center gap-3 mb-2">
                <div class="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <span class="text-emerald-600">💰</span>
                </div>
                <div>
                  <p class="font-medium text-gray-900">Ingresos Totales</p>
                  <p class="text-2xl font-bold text-emerald-700">${{ formatCurrency(stats.revenue || 0) }}</p>
                </div>
              </div>
              <p class="text-sm text-emerald-600">Generados por citas completadas</p>
            </div>
            
            <div class="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200">
              <div class="flex items-center gap-3 mb-2">
                <div class="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <span class="text-amber-600">📈</span>
                </div>
                <div>
                  <p class="font-medium text-gray-900">Ingresos Potenciales</p>
                  <p class="text-2xl font-bold text-amber-700">${{ formatCurrency(potentialRevenue) }}</p>
                </div>
              </div>
              <p class="text-sm text-amber-600">De citas pendientes y confirmadas</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabla de citas (todas las citas) -->
      <div class="fade-up card-modern mb-8" :class="{ show: animated }" v-if="appointments.length > 0">
        <div class="p-6">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h2 class="text-xl font-semibold text-gray-900">Todas las Citas</h2>
              <p class="text-gray-600 text-sm">{{ appointments.length }} citas en el período seleccionado</p>
            </div>
            <div class="flex gap-2">
              <button 
                @click="showAllAppointments = !showAllAppointments"
                class="btn-modern-outline"
              >
                <span>{{ showAllAppointments ? '👁️ Ocultar' : '👁️ Mostrar' }} Todas</span>
              </button>
            </div>
          </div>

          <!-- Tabla de citas -->
          <div v-if="showAllAppointments" class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="bg-gray-50">
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Fecha</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Cliente</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Servicio</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Estado</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Precio</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr 
                  v-for="appointment in appointments.slice(0, 20)" 
                  :key="appointment._id"
                  class="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td class="px-4 py-3 text-sm text-gray-900">
                    {{ formatDate(appointment.date) }} {{ appointment.time }}
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-900">
                    <div v-if="appointment.userId && appointment.userId.name">
                      {{ appointment.userId.name }} {{ appointment.userId.lastname }}
                    </div>
                    <div v-else class="text-gray-400">Cliente no disponible</div>
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-900">
                    {{ appointment.serviceName || appointment.serviceId?.name || 'Servicio' }}
                  </td>
                  <td class="px-4 py-3">
                    <span 
                      :class="getStatusClass(appointment.status)"
                      class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                    >
                      {{ translateStatus(appointment.status) }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-sm font-medium text-gray-900">
                    ${{ appointment.servicePrice || 0 }}
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-if="appointments.length > 20" class="text-center py-4 text-gray-500 text-sm">
              Mostrando 20 de {{ appointments.length }} citas. Usa los filtros para ver más.
            </div>
          </div>
          <div v-else class="text-center py-8 text-gray-500">
            <p>Haz clic en "Mostrar Todas" para ver todas las citas del período</p>
          </div>
        </div>
      </div>

      <!-- Exportar reportes -->
      <div class="fade-up card-modern mb-4" :class="{ show: animated }">
        <div class="p-6">
          <div class="flex flex-col lg:flex-row justify-between items-center gap-6">
            <div class="flex-1">
              <h2 class="text-xl font-semibold text-gray-900 mb-2">Exportar Reportes</h2>
              <p class="text-gray-500">Descarga un reporte detallado de las citas en el período seleccionado</p>
              
              <!-- Resumen del período -->
              <div v-if="hasData" class="mt-4 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <span class="text-emerald-600">📋</span>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-emerald-700">
                      {{ appointments.length }} citas encontradas
                    </p>
                    <p class="text-xs text-emerald-600">
                      Período: {{ formatDate(filters.startDate) || 'Inicio' }} al {{ formatDate(filters.endDate) || 'Fin' }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="flex flex-col sm:flex-row gap-3">
              <button 
                @click="exportReport('json')"
                :disabled="loading || !hasData"
                class="btn-modal-complete px-6 py-3 rounded-xl flex items-center gap-2"
              >
                <span>📊</span>
                <span>Exportar JSON</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de carga -->
      <div v-if="showLoadingModal" class="modal-overlay">
        <div class="modal-modern-box max-w-md">
          <div class="modal-modern-header">
            <div class="flex items-center gap-4">
              <div class="avatar-modern-lg">
                <div class="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center">
                  <span class="text-emerald-600 text-2xl">📈</span>
                </div>
              </div>
              <div>
                <h3 class="text-xl font-bold text-gray-900">{{ loadingTitle }}</h3>
                <p class="text-gray-500">{{ loadingMessage }}</p>
              </div>
            </div>
          </div>
          
          <div class="modal-section">
            <div class="text-center py-8">
              <div class="animate-spin w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p class="text-gray-600">{{ loadingProgress }}</p>
              <div class="w-full bg-gray-200 rounded-full h-2.5 mt-4">
                <div class="bg-emerald-600 h-2.5 rounded-full transition-all duration-300" :style="{ width: progressWidth }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Chatbot />
  </ProviderLayout>
</template>

<script>
import ProviderLayout from "@/components/ProviderLayout.vue";
import Chatbot from "@/components/Chatbot.vue";
import { onMounted, ref, computed, reactive } from "vue";
import Chart from "chart.js/auto";
import api from "@/api/api";

export default {
  name: "ProviderReports",
  components: { ProviderLayout, Chatbot },

  setup() {
    const stats = reactive({
      completed: 0,
      cancelled: 0,
      pending: 0,
      revenue: 0,
      total: 0,
      confirmed: 0,
      reprogrammed: 0
    });

    const appointments = ref([]);
    const loading = ref(false);
    const animated = ref(false);
    const chartInstance = ref(null);
    const chartType = ref('monthly');
    const showLoadingModal = ref(false);
    const loadingTitle = ref('Generando Reporte');
    const loadingMessage = ref('Procesando los datos, por favor espera...');
    const loadingProgress = ref('Cargando datos...');
    const exportProgress = ref(0);
    const showAllAppointments = ref(false);
    const chartData = reactive({
      monthly: {},
      weekly: {},
      daily: {}
    });

    const filters = reactive({
      startDate: '',
      endDate: '',
      quickPeriod: 'thisMonth'
    });

    const quickPeriods = [
      { label: 'Hoy', value: 'today' },
      { label: 'Esta Semana', value: 'thisWeek' },
      { label: 'Este Mes', value: 'thisMonth' },
      { label: 'Mes Pasado', value: 'lastMonth' },
      { label: 'Últimos 30 Días', value: 'last30Days' },
      { label: 'Este Año', value: 'thisYear' }
    ];

    // Datos computados
    const hasData = computed(() => {
      return appointments.value.length > 0 && stats.total > 0;
    });

    const progressWidth = computed(() => {
      return `${exportProgress.value}%`;
    });

    const potentialRevenue = computed(() => {
      let potential = 0;
      appointments.value.forEach(appt => {
        if (['pendiente', 'confirmada', 'reprogramada'].includes(appt.status)) {
          potential += appt.servicePrice || 0;
        }
      });
      return potential;
    });

    const summaryCards = computed(() => [
      {
        title: 'Citas Atendidas',
        value: stats.completed,
        icon: '✅',
        iconBg: 'bg-emerald-100',
        iconColor: 'text-emerald-600',
        valueColor: 'text-emerald-700',
        description: 'Total completadas en el período'
      },
      {
        title: 'Canceladas',
        value: stats.cancelled,
        icon: '❌',
        iconBg: 'bg-red-100',
        iconColor: 'text-red-600',
        valueColor: 'text-red-700',
        description: 'Total canceladas en el período'
      },
      {
        title: 'Pendientes',
        value: stats.pending,
        icon: '⏳',
        iconBg: 'bg-amber-100',
        iconColor: 'text-amber-600',
        valueColor: 'text-amber-700',
        description: 'Por confirmar en el período'
      },
      {
        title: 'Ingresos Totales',
        value: `$${formatCurrency(stats.revenue)}`,
        icon: '💰',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        valueColor: 'text-blue-700',
        description: 'Ingresos brutos en el período'
      }
    ]);

    const keyMetrics = computed(() => [
      {
        title: 'Tasa de Finalización',
        value: `${calculateCompletionRate()}%`,
        subtitle: `${stats.completed} de ${stats.completed + stats.cancelled}`,
        icon: '📈',
        iconBg: 'bg-emerald-100',
        iconColor: 'text-emerald-600',
        valueClass: 'text-emerald-700'
      },
      {
        title: 'Citas Promedio/Día',
        value: calculateAverageDailyAppointments(),
        subtitle: `${stats.total} citas en ${calculateDaysInPeriod()} días`,
        icon: '📅',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        valueClass: 'text-blue-700'
      },
      {
        title: 'Ingreso Promedio/Cita',
        value: `$${calculateAverageRevenuePerAppointment()}`,
        subtitle: `Total: $${formatCurrency(stats.revenue)}`,
        icon: '💵',
        iconBg: 'bg-purple-100',
        iconColor: 'text-purple-600',
        valueClass: 'text-purple-700'
      }
    ]);

    // Funciones
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-VE', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      } catch (error) {
        return 'Fecha inválida';
      }
    };

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('es-VE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount || 0);
    };

    const translateStatus = (status) => {
      const translations = {
        'pendiente': 'Pendiente',
        'confirmada': 'Confirmada',
        'cancelada': 'Cancelada',
        'completada': 'Completada',
        'reprogramada': 'Reprogramada'
      };
      return translations[status] || status;
    };

    const getStatusClass = (status) => {
      const classes = {
        'pendiente': 'bg-yellow-100 text-yellow-800',
        'confirmada': 'bg-blue-100 text-blue-800',
        'cancelada': 'bg-red-100 text-red-800',
        'completada': 'bg-green-100 text-green-800',
        'reprogramada': 'bg-purple-100 text-purple-800'
      };
      return classes[status] || 'bg-gray-100 text-gray-800';
    };

    const calculateCompletionRate = () => {
      const totalWithStatus = stats.completed + stats.cancelled;
      return totalWithStatus > 0 ? Math.round((stats.completed / totalWithStatus) * 100) : 0;
    };

    const calculateDaysInPeriod = () => {
      if (!filters.startDate || !filters.endDate) return 30;
      
      const start = new Date(filters.startDate);
      const end = new Date(filters.endDate);
      const diffTime = Math.abs(end - start);
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    };

    const calculateAverageDailyAppointments = () => {
      const days = calculateDaysInPeriod();
      return days > 0 ? (stats.total / days).toFixed(1) : '0.0';
    };

    const calculateAverageRevenuePerAppointment = () => {
      return stats.completed > 0 ? (stats.revenue / stats.completed).toFixed(2) : '0.00';
    };

    const setQuickPeriod = (period) => {
      filters.quickPeriod = period.value;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      switch(period.value) {
        case 'today':
          filters.startDate = today.toISOString().split('T')[0];
          filters.endDate = today.toISOString().split('T')[0];
          break;
          
        case 'thisWeek':
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - today.getDay() + 1);
          filters.startDate = startOfWeek.toISOString().split('T')[0];
          filters.endDate = today.toISOString().split('T')[0];
          break;
          
        case 'thisMonth':
          const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
          filters.startDate = startOfMonth.toISOString().split('T')[0];
          filters.endDate = today.toISOString().split('T')[0];
          break;
          
        case 'lastMonth':
          const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
          const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
          filters.startDate = lastMonth.toISOString().split('T')[0];
          filters.endDate = endOfLastMonth.toISOString().split('T')[0];
          break;
          
        case 'last30Days':
          const last30Days = new Date(today);
          last30Days.setDate(today.getDate() - 30);
          filters.startDate = last30Days.toISOString().split('T')[0];
          filters.endDate = today.toISOString().split('T')[0];
          break;
          
        case 'thisYear':
          const startOfYear = new Date(today.getFullYear(), 0, 1);
          filters.startDate = startOfYear.toISOString().split('T')[0];
          filters.endDate = today.toISOString().split('T')[0];
          break;
      }
      
      loadReports();
    };

    const loadReports = async () => {
      loading.value = true;
      try {
        // Parámetros para la API
        const params = {};
        if (filters.startDate) params.startDate = filters.startDate;
        if (filters.endDate) params.endDate = filters.endDate;

        console.log('📊 Cargando reportes con filtros:', params);
        
        // Cargar reportes
        const { data } = await api.get("/provider/reports", { params });
        
        console.log('✅ Datos recibidos del servidor:', data);
        
        if (data.success) {
          // Guardar todas las citas
          appointments.value = data.appointments || [];
          
          // Actualizar estadísticas
          Object.assign(stats, data.stats || {});
          
          // Guardar datos de gráficos
          chartData.monthly = data.chart?.monthly || {};
          chartData.weekly = data.chart?.weekly || {};
          chartData.daily = data.chart?.daily || {};
          
          // Actualizar métricas adicionales
          if (data.metrics) {
            stats.completionRate = data.metrics.completionRate;
            stats.avgDailyAppointments = data.metrics.avgDailyAppointments;
            stats.avgRevenuePerAppointment = data.metrics.avgRevenuePerAppointment;
          }
          
          console.log(`📈 Estadísticas: ${stats.total} citas, $${stats.revenue} ingresos`);
          console.log(`📊 ${appointments.value.length} citas cargadas para reportes`);
          
          // Inicializar gráfico
          if (appointments.value.length > 0) {
            initializeChart();
          } else {
            destroyChart();
          }
        } else {
          console.error("Error en la respuesta del servidor:", data.message);
        }

      } catch (error) {
        console.error("❌ Error cargando reportes:", error);
        
        // Mostrar mensaje de error
        if (error.response?.status === 404) {
          console.error("Ruta no encontrada. Verifica que el backend esté corriendo.");
        } else if (error.response?.status === 401) {
          console.error("No autorizado. Tu sesión puede haber expirado.");
        } else if (error.response?.status === 500) {
          console.error("Error interno del servidor.");
        }
        
        // Datos de ejemplo para desarrollo
        appointments.value = [];
        resetStats();
      } finally {
        loading.value = false;
      }
    };

    const initializeChart = () => {
      // Destruir gráfico anterior
      destroyChart();

      const ctx = document.getElementById("appointmentsChart");
      if (!ctx) return;

      let data;
      let chartLabels;
      
      switch(chartType.value) {
        case 'monthly':
          data = chartData.monthly;
          chartLabels = data?.labels || ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
          break;
        case 'weekly':
          data = chartData.weekly;
          chartLabels = data?.labels || Array(8).fill().map((_, i) => `Sem ${i + 1}`);
          break;
        case 'daily':
          data = chartData.daily;
          chartLabels = data?.labels || Array(30).fill().map((_, i) => `Día ${i + 1}`);
          break;
      }

      const datasets = [];
      
      if (data?.completed) {
        datasets.push({
          label: "Citas Completadas",
          data: data.completed,
          borderColor: "#10b981",
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 4,
          pointBackgroundColor: "#10b981"
        });
      }
      
      if (data?.cancelled) {
        datasets.push({
          label: "Citas Canceladas",
          data: data.cancelled,
          borderColor: "#ef4444",
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 4,
          pointBackgroundColor: "#ef4444"
        });
      }
      
      if (data?.pending) {
        datasets.push({
          label: "Citas Pendientes",
          data: data.pending,
          borderColor: "#f59e0b",
          backgroundColor: "rgba(245, 158, 11, 0.1)",
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 4,
          pointBackgroundColor: "#f59e0b"
        });
      }
      
      if (chartType.value === 'monthly' && data?.revenue) {
        datasets.push({
          label: "Ingresos ($)",
          data: data.revenue,
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 4,
          pointBackgroundColor: "#3b82f6",
          yAxisID: 'y1'
        });
      }

      chartInstance.value = new Chart(ctx, {
        type: "line",
        data: {
          labels: chartLabels,
          datasets: datasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { 
              display: true,
              position: 'top'
            },
            tooltip: {
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              titleColor: '#1f2937',
              bodyColor: '#4b5563',
              borderColor: '#e5e7eb',
              borderWidth: 1,
              cornerRadius: 8,
              padding: 12,
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: "rgba(0, 0, 0, 0.05)",
                drawBorder: false
              },
              ticks: {
                color: '#6b7280'
              },
              title: {
                display: true,
                text: 'Número de Citas'
              }
            },
            y1: chartType.value === 'monthly' ? {
              position: 'right',
              beginAtZero: true,
              grid: {
                drawOnChartArea: false
              },
              ticks: {
                color: '#3b82f6',
                callback: function(value) {
                  return '$' + value.toLocaleString();
                }
              },
              title: {
                display: true,
                text: 'Ingresos ($)',
                color: '#3b82f6'
              }
            } : undefined,
            x: {
              grid: {
                display: false
              },
              ticks: {
                color: '#6b7280'
              }
            }
          }
        }
      });
    };

    const destroyChart = () => {
      if (chartInstance.value) {
        chartInstance.value.destroy();
        chartInstance.value = null;
      }
    };

    const setChartType = (type) => {
      chartType.value = type;
      if (appointments.value.length > 0) {
        initializeChart();
      }
    };

    const exportReport = async (format) => {
      if (!hasData.value) {
        alert('No hay datos para exportar. Aplica filtros primero.');
        return;
      }

      showLoadingModal.value = true;
      loadingTitle.value = 'Exportando Reporte';
      loadingMessage.value = 'Preparando archivo para descarga...';
      exportProgress.value = 0;

      try {
        // Simular progreso
        const progressInterval = setInterval(() => {
          if (exportProgress.value < 90) {
            exportProgress.value += 10;
            loadingProgress.value = `Generando ${format.toUpperCase()}... ${exportProgress.value}%`;
          }
        }, 200);

        const params = {
          startDate: filters.startDate,
          endDate: filters.endDate,
          format: format
        };

        const response = await api.get("/provider/reports/export", { 
          params,
          responseType: 'blob'
        });

        clearInterval(progressInterval);
        exportProgress.value = 100;
        loadingProgress.value = 'Descargando archivo...';

        // Crear descarga
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        const fileName = `reporte-citas-${filters.startDate || 'inicio'}-al-${filters.endDate || 'fin'}.${format}`;
        
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();

        // Esperar un momento antes de cerrar el modal
        setTimeout(() => {
          showLoadingModal.value = false;
          exportProgress.value = 0;
        }, 500);

      } catch (error) {
        console.error("❌ Error exportando reporte:", error);
        alert("Error al exportar el reporte. Por favor, intenta nuevamente.");
        showLoadingModal.value = false;
      }
    };

    const resetFilters = () => {
      filters.startDate = '';
      filters.endDate = '';
      filters.quickPeriod = '';
      appointments.value = [];
      resetStats();
      destroyChart();
      showAllAppointments.value = false;
    };

    const resetStats = () => {
      stats.completed = 0;
      stats.cancelled = 0;
      stats.pending = 0;
      stats.revenue = 0;
      stats.total = 0;
      stats.confirmed = 0;
      stats.reprogrammed = 0;
    };

    // Animaciones iniciales
    onMounted(() => {
      setTimeout(() => {
        animated.value = true;
      }, 100);

      // Cargar reportes del mes actual por defecto
      setQuickPeriod(quickPeriods[2]); // "Este Mes"
    });

    return { 
      stats, 
      appointments,
      filters,
      quickPeriods,
      loading,
      animated,
      chartType,
      hasData,
      summaryCards,
      keyMetrics,
      potentialRevenue,
      showLoadingModal,
      loadingTitle,
      loadingMessage,
      loadingProgress,
      exportProgress,
      progressWidth,
      showAllAppointments,
      formatCurrency,
      formatDate,
      translateStatus,
      getStatusClass,
      calculateCompletionRate,
      calculateAverageDailyAppointments,
      calculateAverageRevenuePerAppointment,
      setQuickPeriod,
      loadReports,
      resetFilters,
      setChartType,
      exportReport
    };
  }
};
</script>

<style scoped>
/* Reutiliza todos los estilos de la vista de notificaciones */
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
  justify-content: center;
  gap: 0.5rem;
  border: 2px solid #10b981;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-modern-outline:hover:not(:disabled) {
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

.btn-modal-complete {
  display: inline-flex !important;
  align-items: center !important;
  padding: 0.75rem 1.5rem !important;
  background-color: #10b981 !important;
  color: white !important;
  font-weight: 600 !important;
  border-radius: 10px !important;
  border: none !important;
  cursor: pointer !important;
  transition: all 0.3s ease !important;
}

.btn-modal-complete:hover:not(:disabled) {
  background-color: #0d9488 !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 10px 20px rgba(16, 185, 129, 0.3) !important;
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

.modal-section {
  margin-bottom: 2rem;
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

/* Estilos para la tabla */
table {
  min-width: 800px;
}

thead {
  background-color: #f8fafc;
}

th {
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.75rem;
}

td, th {
  padding: 0.75rem 1rem;
}

tbody tr {
  border-bottom: 1px solid #e5e7eb;
}

tbody tr:hover {
  background-color: #f9fafb;
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
</style>