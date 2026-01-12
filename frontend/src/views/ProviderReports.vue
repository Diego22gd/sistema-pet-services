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
                <span>Aplicar Filtros</span>
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
            
            <!-- Indicador de cambio si aplica -->
            <div v-if="stat.change" class="mt-3 flex items-center gap-1">
              <span :class="stat.change > 0 ? 'text-emerald-600' : 'text-red-600'" class="text-sm font-medium">
                {{ stat.change > 0 ? '+' : '' }}{{ stat.change }}%
              </span>
              <span class="text-gray-400 text-xs">vs período anterior</span>
            </div>
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
                </div>
                <div :class="metric.iconBg" class="w-14 h-14 rounded-2xl flex items-center justify-center">
                  <span :class="metric.iconColor" class="text-2xl">{{ metric.icon }}</span>
                </div>
              </div>
            </div>
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
                      Período: {{ formatDate(filters.startDate) }} al {{ formatDate(filters.endDate) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="flex flex-col sm:flex-row gap-3">
              <button 
                @click="exportReport('pdf')"
                :disabled="loading || !hasData"
                class="btn-modal-complete px-6 py-3 rounded-xl flex items-center gap-2"
              >
                <span>📊</span>
                <span>Exportar PDF</span>
              </button>
              <button 
                @click="exportReport('excel')"
                :disabled="loading || !hasData"
                class="btn-modal-confirm px-6 py-3 rounded-xl flex items-center gap-2"
              >
                <span>📄</span>
                <span>Exportar Excel</span>
              </button>
            </div>
          </div>
          
          <!-- Información del reporte -->
          <div v-if="hasData" class="mt-6 pt-6 border-t border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900 mb-3">Resumen del Reporte</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="text-center p-3 bg-gray-50 rounded-xl">
                <p class="text-2xl font-bold text-gray-900">{{ stats.total }}</p>
                <p class="text-sm text-gray-500">Total Citas</p>
              </div>
              <div class="text-center p-3 bg-emerald-50 rounded-xl">
                <p class="text-2xl font-bold text-emerald-700">{{ stats.completed }}</p>
                <p class="text-sm text-emerald-600">Completadas</p>
              </div>
              <div class="text-center p-3 bg-red-50 rounded-xl">
                <p class="text-2xl font-bold text-red-700">{{ stats.cancelled }}</p>
                <p class="text-sm text-red-600">Canceladas</p>
              </div>
              <div class="text-center p-3 bg-blue-50 rounded-xl">
                <p class="text-2xl font-bold text-blue-700">${{ formatCurrency(stats.revenue) }}</p>
                <p class="text-sm text-blue-600">Ingresos</p>
              </div>
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
                <h3 class="text-xl font-bold text-gray-900">Generando Reporte</h3>
                <p class="text-gray-500">Procesando los datos, por favor espera...</p>
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
      total: 0
    });

    const appointments = ref([]);
    const loading = ref(false);
    const animated = ref(false);
    const chartInstance = ref(null);
    const chartType = ref('monthly');
    const showLoadingModal = ref(false);
    const loadingProgress = ref('Cargando datos...');
    const exportProgress = ref(0);

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

    const summaryCards = computed(() => [
      {
        title: 'Citas Atendidas',
        value: stats.completed,
        icon: '✅',
        iconBg: 'bg-emerald-100',
        iconColor: 'text-emerald-600',
        valueColor: 'text-emerald-700',
        description: 'Total completadas en el período',
        change: 12 // Ejemplo, en producción calcularías esto
      },
      {
        title: 'Canceladas',
        value: stats.cancelled,
        icon: '❌',
        iconBg: 'bg-red-100',
        iconColor: 'text-red-600',
        valueColor: 'text-red-700',
        description: 'Total canceladas en el período',
        change: -5
      },
      {
        title: 'Pendientes',
        value: stats.pending,
        icon: '⏳',
        iconBg: 'bg-amber-100',
        iconColor: 'text-amber-600',
        valueColor: 'text-amber-700',
        description: 'Por confirmar en el período',
        change: 8
      },
      {
        title: 'Ingresos Totales',
        value: `$${formatCurrency(stats.revenue)}`,
        icon: '💰',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        valueColor: 'text-blue-700',
        description: 'Ingresos brutos en el período',
        change: 15
      }
    ]);

    const keyMetrics = computed(() => [
      {
        title: 'Tasa de Finalización',
        value: `${calculateCompletionRate()}%`,
        icon: '📈',
        iconBg: 'bg-emerald-100',
        iconColor: 'text-emerald-600',
        valueClass: 'text-emerald-700'
      },
      {
        title: 'Citas Promedio/Día',
        value: calculateAverageDailyAppointments(),
        icon: '📅',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        valueClass: 'text-blue-700'
      },
      {
        title: 'Ingreso Promedio/Cita',
        value: `$${calculateAverageRevenuePerAppointment()}`,
        icon: '💵',
        iconBg: 'bg-purple-100',
        iconColor: 'text-purple-600',
        valueClass: 'text-purple-700'
      }
    ]);

    // Funciones
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('es-VE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    };

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('es-VE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount || 0);
    };

    const calculateCompletionRate = () => {
      const totalWithStatus = stats.completed + stats.cancelled;
      return totalWithStatus > 0 ? Math.round((stats.completed / totalWithStatus) * 100) : 0;
    };

    const calculateAverageDailyAppointments = () => {
      if (!filters.startDate || !filters.endDate) return '0.0';
      
      const start = new Date(filters.startDate);
      const end = new Date(filters.endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      
      return diffDays > 0 ? (stats.total / diffDays).toFixed(1) : '0.0';
    };

    const calculateAverageRevenuePerAppointment = () => {
      const totalAppointments = stats.completed + stats.cancelled;
      return totalAppointments > 0 ? (stats.revenue / totalAppointments).toFixed(2) : '0.00';
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

        // Cargar reportes
        const { data } = await api.get("/provider/reports", { params });
        
        if (data.success) {
          appointments.value = data.appointments || [];
          Object.assign(stats, data.stats || {});
          
          // Inicializar gráfico
          if (appointments.value.length > 0) {
            initializeChart(data.chart);
          } else {
            destroyChart();
          }
        } else {
          console.error("Error en la respuesta del servidor:", data.message);
        }

      } catch (error) {
        console.error("Error cargando reportes:", error);
        // Datos de ejemplo para desarrollo
        appointments.value = [];
        resetStats();
      } finally {
        loading.value = false;
      }
    };

    const initializeChart = (chartData) => {
      // Destruir gráfico anterior
      destroyChart();

      const ctx = document.getElementById("appointmentsChart");
      if (!ctx) return;

      const data = chartType.value === 'monthly' ? chartData.monthly : chartData.weekly;

      chartInstance.value = new Chart(ctx, {
        type: "line",
        data: {
          labels: data.labels || [],
          datasets: [
            {
              label: "Citas Completadas",
              data: data.completed || [],
              borderColor: "#10b981",
              backgroundColor: "rgba(16, 185, 129, 0.1)",
              fill: true,
              tension: 0.4,
              borderWidth: 2,
              pointRadius: 4,
              pointBackgroundColor: "#10b981"
            },
            {
              label: "Citas Canceladas",
              data: data.cancelled || [],
              borderColor: "#ef4444",
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              fill: true,
              tension: 0.4,
              borderWidth: 2,
              pointRadius: 4,
              pointBackgroundColor: "#ef4444"
            },
            {
              label: "Citas Pendientes",
              data: data.pending || [],
              borderColor: "#f59e0b",
              backgroundColor: "rgba(245, 158, 11, 0.1)",
              fill: true,
              tension: 0.4,
              borderWidth: 2,
              pointRadius: 4,
              pointBackgroundColor: "#f59e0b"
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { 
              display: false,
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
              }
            },
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
        loadReports(); // Recargar datos para el nuevo tipo de gráfico
      }
    };

    const exportReport = async (format) => {
      if (!hasData.value) {
        alert('No hay datos para exportar. Aplica filtros primero.');
        return;
      }

      showLoadingModal.value = true;
      exportProgress.value = 0;
      loadingProgress.value = 'Preparando datos para exportación...';

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
        console.error("Error exportando reporte:", error);
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
    };

    const resetStats = () => {
      stats.completed = 0;
      stats.cancelled = 0;
      stats.pending = 0;
      stats.revenue = 0;
      stats.total = 0;
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
      showLoadingModal,
      loadingProgress,
      exportProgress,
      progressWidth,
      formatCurrency,
      formatDate,
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