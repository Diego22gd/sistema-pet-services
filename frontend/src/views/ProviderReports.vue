<template>
  <ProviderLayout>
    <div class="px-6 max-w-7xl mx-auto w-full pt-6">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-neutral-dark mb-2">Reportes del Negocio</h1>
        <p class="text-neutral-medium">Analiza el rendimiento y crecimiento de tu negocio</p>
      </div>

      <!-- Filtros de fecha -->
      <div class="mb-8 bg-white rounded-xl shadow-sm border border-neutral-light p-6">
        <div class="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <h2 class="text-lg font-semibold text-neutral-dark">Filtrar por período</h2>
          <div class="flex flex-col sm:flex-row gap-4">
            <div class="flex items-center gap-2">
              <label class="text-sm font-medium text-neutral-dark whitespace-nowrap">Desde:</label>
              <input 
                type="date" 
                class="px-3 py-2 border border-neutral-medium rounded-lg focus:ring-2 focus:ring-primary-mint focus:border-primary-mint transition-colors duration-200"
              />
            </div>
            <div class="flex items-center gap-2">
              <label class="text-sm font-medium text-neutral-dark whitespace-nowrap">Hasta:</label>
              <input 
                type="date" 
                class="px-3 py-2 border border-neutral-medium rounded-lg focus:ring-2 focus:ring-primary-mint focus:border-primary-mint transition-colors duration-200"
              />
            </div>
            <button class="px-4 py-2 bg-primary-mint text-white rounded-lg hover:bg-state-success transition-colors duration-200 font-medium">
              Aplicar
            </button>
          </div>
        </div>
      </div>

      <!-- Tarjetas resumen mejoradas -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-xl shadow-sm border border-neutral-light p-6 hover:shadow-md transition-all duration-300">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-neutral-dark">Citas Atendidas</h3>
            <div class="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <span class="text-green-600 text-lg">✅</span>
            </div>
          </div>
          <p class="text-3xl font-bold text-state-success mb-2">{{ stats.completed }}</p>
          <p class="text-sm text-neutral-medium">Total completadas</p>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-neutral-light p-6 hover:shadow-md transition-all duration-300">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-neutral-dark">Canceladas</h3>
            <div class="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <span class="text-red-600 text-lg">❌</span>
            </div>
          </div>
          <p class="text-3xl font-bold text-state-error mb-2">{{ stats.cancelled }}</p>
          <p class="text-sm text-neutral-medium">Total canceladas</p>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-neutral-light p-6 hover:shadow-md transition-all duration-300">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-neutral-dark">Pendientes</h3>
            <div class="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
              <span class="text-yellow-600 text-lg">⏳</span>
            </div>
          </div>
          <p class="text-3xl font-bold text-yellow-500 mb-2">{{ stats.pending }}</p>
          <p class="text-sm text-neutral-medium">Por confirmar</p>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-neutral-light p-6 hover:shadow-md transition-all duration-300">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-neutral-dark">Ingresos Totales</h3>
            <div class="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <span class="text-blue-600 text-lg">💰</span>
            </div>
          </div>
          <p class="text-3xl font-bold text-secondary mb-2">${{ formatCurrency(stats.revenue) }}</p>
          <p class="text-sm text-neutral-medium">Ingresos brutos</p>
        </div>
      </div>

      <!-- Gráficos y métricas -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <!-- Gráfico principal -->
        <div class="lg:col-span-2 bg-white rounded-xl shadow-sm border border-neutral-light p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold text-neutral-dark">Citas por Mes</h2>
            <div class="flex gap-2">
              <button class="px-3 py-1 text-sm bg-primary-mint text-white rounded-lg">Mensual</button>
              <button class="px-3 py-1 text-sm bg-neutral-bg text-neutral-dark rounded-lg">Anual</button>
            </div>
          </div>
          <div class="h-80">
            <canvas id="appointmentsChart"></canvas>
          </div>
        </div>

        <!-- Métricas adicionales -->
        <div class="bg-white rounded-xl shadow-sm border border-neutral-light p-6">
          <h2 class="text-xl font-semibold text-neutral-dark mb-6">Métricas Clave</h2>
          <div class="space-y-6">
            <div class="flex justify-between items-center p-4 bg-neutral-bg rounded-lg">
              <div>
                <p class="text-sm text-neutral-medium">Tasa de Finalización</p>
                <p class="text-2xl font-bold text-neutral-dark">{{ calculateCompletionRate() }}%</p>
              </div>
              <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <span class="text-green-600">📈</span>
              </div>
            </div>

            <div class="flex justify-between items-center p-4 bg-neutral-bg rounded-lg">
              <div>
                <p class="text-sm text-neutral-medium">Citas Promedio/Mes</p>
                <p class="text-2xl font-bold text-neutral-dark">{{ calculateAverageAppointments() }}</p>
              </div>
              <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <span class="text-blue-600">📅</span>
              </div>
            </div>

            <div class="flex justify-between items-center p-4 bg-neutral-bg rounded-lg">
              <div>
                <p class="text-sm text-neutral-medium">Ingreso Promedio</p>
                <p class="text-2xl font-bold text-neutral-dark">${{ calculateAverageRevenue() }}</p>
              </div>
              <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <span class="text-purple-600">💵</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabla de servicios más populares -->
      <div class="bg-white rounded-xl shadow-sm border border-neutral-light p-6 mb-8">
        <h2 class="text-xl font-semibold text-neutral-dark mb-6">Servicios Más Populares</h2>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-neutral-bg">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-semibold text-neutral-dark">Servicio</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-neutral-dark">Citas</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-neutral-dark">Ingresos</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-neutral-dark">Tasa de Éxito</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-neutral-light">
              <tr v-for="service in popularServices" :key="service.id" class="hover:bg-neutral-bg transition-colors duration-200">
                <td class="px-4 py-3 text-sm font-medium text-neutral-dark">{{ service.name }}</td>
                <td class="px-4 py-3 text-sm text-neutral-medium">{{ service.appointments }}</td>
                <td class="px-4 py-3 text-sm font-semibold text-state-success">${{ formatCurrency(service.revenue) }}</td>
                <td class="px-4 py-3">
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {{ service.successRate }}%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Exportar reportes -->
      <div class="bg-white rounded-xl shadow-sm border border-neutral-light p-6 mb-4">
        <div class="flex flex-col lg:flex-row justify-between items-center gap-4">
          <div>
            <h2 class="text-xl font-semibold text-neutral-dark mb-2">Exportar Reportes</h2>
            <p class="text-neutral-medium">Descarga tus reportes en diferentes formatos</p>
          </div>
          <div class="flex gap-3">
            <button class="flex items-center gap-2 px-4 py-2 bg-state-success text-white rounded-lg hover:bg-green-700 transition-colors duration-200">
              <span>📊</span>
              <span>Exportar PDF</span>
            </button>
            <button class="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-purple-700 transition-colors duration-200">
              <span>📄</span>
              <span>Exportar Excel</span>
            </button>
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
import { onMounted, ref } from "vue";
import Chart from "chart.js/auto";
import api from "@/api/api";

export default {
  name: "ProviderReports",
  components: { ProviderLayout, Chatbot },

  setup() {
    const stats = ref({
      completed: 0,
      cancelled: 0,
      pending: 0,
      revenue: 0
    });

    const popularServices = ref([]);

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('es-VE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
    };

    const calculateCompletionRate = () => {
      const total = stats.value.completed + stats.value.cancelled + stats.value.pending;
      return total > 0 ? Math.round((stats.value.completed / total) * 100) : 0;
    };

    const calculateAverageAppointments = () => {
      return Math.round((stats.value.completed + stats.value.cancelled + stats.value.pending) / 12);
    };

    const calculateAverageRevenue = () => {
      return formatCurrency(stats.value.revenue / (stats.value.completed || 1));
    };

    onMounted(async () => {
      try {
        const { data } = await api.get("/provider/reports");

        stats.value = data.stats;
        popularServices.value = data.popularServices || [
          { id: 1, name: "Consulta Veterinaria", appointments: 45, revenue: 2250, successRate: 95 },
          { id: 2, name: "Peluquería Canina", appointments: 32, revenue: 1600, successRate: 88 },
          { id: 3, name: "Vacunación", appointments: 28, revenue: 1400, successRate: 92 }
        ];

        // Inicializar gráfico
        const ctx = document.getElementById("appointmentsChart");
        
        if (ctx) {
          new Chart(ctx, {
            type: "line",
            data: {
              labels: data.chart?.labels || ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
              datasets: [
                {
                  label: "Citas Completadas",
                  data: data.chart?.data || [12, 19, 15, 22, 18, 25, 30, 28, 32, 35, 40, 38],
                  borderColor: "#0d9488",
                  backgroundColor: "rgba(13, 148, 136, 0.1)",
                  fill: true,
                  tension: 0.4
                },
                {
                  label: "Citas Canceladas",
                  data: data.chart?.cancelledData || [2, 3, 1, 4, 2, 3, 2, 1, 3, 2, 1, 2],
                  borderColor: "#dc2626",
                  backgroundColor: "rgba(220, 38, 38, 0.1)",
                  fill: true,
                  tension: 0.4
                }
              ]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { 
                  display: true,
                  position: 'top'
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  grid: {
                    color: "rgba(0, 0, 0, 0.1)"
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
      } catch (error) {
        console.error("Error cargando reportes:", error);
        
        // Datos de ejemplo para desarrollo
        stats.value = {
          completed: 156,
          cancelled: 12,
          pending: 8,
          revenue: 7800
        };
      }
    });

    return { 
      stats, 
      popularServices,
      formatCurrency,
      calculateCompletionRate,
      calculateAverageAppointments,
      calculateAverageRevenue
    };
  }
};
</script>

<style scoped>
.bg-neutral-bg {
  background-color: #f8fafc;
}

.border-neutral-light {
  border-color: #e2e8f0;
}

.border-neutral-medium {
  border-color: #cbd5e1;
}

.text-neutral-dark {
  color: #1e293b;
}

.text-neutral-medium {
  color: #64748b;
}

.bg-primary-mint {
  background-color: #0d9488;
}

.hover\:bg-state-success:hover {
  background-color: #059669;
}

.bg-state-success {
  background-color: #059669;
}

.bg-state-error {
  background-color: #dc2626;
}

.hover\:bg-red-700:hover {
  background-color: #b91c1c;
}

.bg-secondary {
  background-color: #8b5cf6;
}

.hover\:bg-purple-700:hover {
  background-color: #7c3aed;
}

.focus\:ring-primary-mint:focus {
  --tw-ring-color: #0d9488;
}
</style>