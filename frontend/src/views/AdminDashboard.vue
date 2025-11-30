<template>
  <AdminLayout>
    <div class="px-6 max-w-7xl mx-auto w-full pt-8">
      <!-- Header del Dashboard -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-neutral-dark mb-2">Panel de Administración</h1>
        <p class="text-neutral-medium text-lg">Resumen completo y métricas del sistema</p>
      </div>

      <!-- Cards de Métricas Principales -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        <!-- Clientes -->
        <div class="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-neutral-light p-6">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <span class="text-xl">👥</span>
            </div>
            <div class="text-right">
              <div class="text-2xl font-bold text-neutral-dark">{{ formatNumber(stats.clients) }}</div>
              <div class="text-sm text-neutral-medium">Clientes</div>
            </div>
          </div>
          <div class="flex items-center text-xs text-green-600 font-semibold">
            <span>+12% este mes</span>
          </div>
        </div>

        <!-- Proveedores -->
        <div class="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-neutral-light p-6">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <span class="text-xl">🏢</span>
            </div>
            <div class="text-right">
              <div class="text-2xl font-bold text-neutral-dark">{{ formatNumber(stats.providers) }}</div>
              <div class="text-sm text-neutral-medium">Proveedores</div>
            </div>
          </div>
          <div class="flex items-center text-xs text-green-600 font-semibold">
            <span>+5% este mes</span>
          </div>
        </div>

        <!-- Citas Hoy -->
        <div class="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-neutral-light p-6">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <span class="text-xl">📅</span>
            </div>
            <div class="text-right">
              <div class="text-2xl font-bold text-neutral-dark">{{ formatNumber(stats.appointmentsToday) }}</div>
              <div class="text-sm text-neutral-medium">Citas Hoy</div>
            </div>
          </div>
          <div class="flex items-center text-xs text-blue-600 font-semibold">
            <span>{{ getAppointmentsTrend() }}</span>
          </div>
        </div>

        <!-- Suscripciones Activas -->
        <div class="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-neutral-light p-6">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <span class="text-xl">⭐</span>
            </div>
            <div class="text-right">
              <div class="text-2xl font-bold text-primary-mint">{{ formatNumber(stats.subscriptionsActive) }}</div>
              <div class="text-sm text-neutral-medium">Suscripciones</div>
            </div>
          </div>
          <div class="flex items-center text-xs text-green-600 font-semibold">
            <span>+8% este mes</span>
          </div>
        </div>
      </div>

      <!-- Sección de Gráficos -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
        <!-- Gráfico Principal - Citas por Día -->
        <div class="bg-white rounded-2xl shadow-lg p-6 border border-neutral-light xl:col-span-2">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-bold text-neutral-dark">Citas por Día (Semana Actual)</h2>
            <div class="flex gap-2">
              <button class="px-3 py-1 text-xs bg-neutral-light rounded-lg hover:bg-neutral-medium transition">Semana</button>
              <button class="px-3 py-1 text-xs bg-primary-mint text-white rounded-lg hover:bg-state-success transition">Mes</button>
            </div>
          </div>
          <div class="h-80">
            <canvas id="appointmentsChart"></canvas>
          </div>
        </div>

        <!-- Métricas Rápidas -->
        <div class="space-y-6">
          <!-- Estado de Citas -->
          <div class="bg-white rounded-2xl shadow-lg p-6 border border-neutral-light">
            <h3 class="font-bold text-lg text-neutral-dark mb-4">Estado de Citas</h3>
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-sm text-neutral-medium">Confirmadas</span>
                <span class="font-semibold text-green-600">{{ stats.confirmedAppointments || 45 }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-neutral-medium">Pendientes</span>
                <span class="font-semibold text-yellow-600">{{ stats.pendingAppointments || 23 }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-neutral-medium">Canceladas</span>
                <span class="font-semibold text-red-600">{{ stats.cancelledAppointments || 8 }}</span>
              </div>
            </div>
          </div>

          <!-- Actividad Reciente -->
          <div class="bg-white rounded-2xl shadow-lg p-6 border border-neutral-light mt-4">
            <h3 class="font-bold text-lg text-neutral-dark mb-4">Actividad Reciente</h3>
            <div class="space-y-3">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span class="text-xs">📝</span>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium">Nueva cita registrada</p>
                  <p class="text-xs text-neutral-medium">Hace 5 minutos</p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span class="text-xs">👤</span>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium">Nuevo cliente registrado</p>
                  <p class="text-xs text-neutral-medium">Hace 15 minutos</p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span class="text-xs">✅</span>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium">Cita completada</p>
                  <p class="text-xs text-neutral-medium">Hace 1 hora</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabla de Citas Recientes -->
      <div class="bg-white rounded-2xl shadow-lg p-6 border border-neutral-light mb-8">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-neutral-dark">Citas Recientes</h2>
          <button class="text-primary-mint hover:text-state-success transition font-semibold text-sm">
            Ver todas →
          </button>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-neutral-light">
                <th class="text-left py-3 px-4 text-sm font-semibold text-neutral-medium">Cliente</th>
                <th class="text-left py-3 px-4 text-sm font-semibold text-neutral-medium">Servicio</th>
                <th class="text-left py-3 px-4 text-sm font-semibold text-neutral-medium">Fecha</th>
                <th class="text-left py-3 px-4 text-sm font-semibold text-neutral-medium">Estado</th>
                <th class="text-left py-3 px-4 text-sm font-semibold text-neutral-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="appointment in recentAppointments" :key="appointment.id" class="border-b border-neutral-light hover:bg-neutral-bg transition">
                <td class="py-3 px-4 text-sm">{{ appointment.client }}</td>
                <td class="py-3 px-4 text-sm">{{ appointment.service }}</td>
                <td class="py-3 px-4 text-sm text-neutral-medium">{{ appointment.date }}</td>
                <td class="py-3 px-4">
                  <span :class="getStatusBadgeClass(appointment.status)" class="px-2 py-1 rounded-full text-xs font-semibold">
                    {{ appointment.status }}
                  </span>
                </td>
                <td class="py-3 px-4">
                  <button class="text-primary-mint hover:text-state-success transition text-sm font-semibold">
                    Ver detalles
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Métricas Adicionales -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white rounded-2xl shadow-lg p-6 border border-neutral-light">
          <h3 class="font-bold text-lg text-neutral-dark mb-4">Tasa de Conversión</h3>
          <div class="text-3xl font-bold text-primary-mint mb-2">68%</div>
          <div class="w-full bg-neutral-light rounded-full h-2">
            <div class="bg-primary-mint h-2 rounded-full" style="width: 68%"></div>
          </div>
          <p class="text-xs text-neutral-medium mt-2">+5% vs mes anterior</p>
        </div>

        <div class="bg-white rounded-2xl shadow-lg p-6 border border-neutral-light">
          <h3 class="font-bold text-lg text-neutral-dark mb-4">Satisfacción del Cliente</h3>
          <div class="text-3xl font-bold text-primary-mint mb-2">4.8/5</div>
          <div class="flex text-yellow-400 mb-2">
            <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
          </div>
          <p class="text-xs text-neutral-medium">Basado en 124 reseñas</p>
        </div>

        <div class="bg-white rounded-2xl shadow-lg p-6 border border-neutral-light">
          <h3 class="font-bold text-lg text-neutral-dark mb-4">Tiempo Promedio de Respuesta</h3>
          <div class="text-3xl font-bold text-primary-mint mb-2">2.3h</div>
          <p class="text-xs text-neutral-medium">-0.5h vs mes anterior</p>
        </div>
      </div>
    </div>
    <Chatbot />
  </AdminLayout>
</template>

<script>
import AdminLayout from "@/components/AdminLayout.vue";
import Chatbot from "@/components/Chatbot.vue";
import Chart from "chart.js/auto";
import api from "@/api/api";
import { useUserStore } from "@/stores/userStore";

export default {
  name: "AdminDashboard",
  components: { AdminLayout, Chatbot },
  data() {
    return {
      stats: {
        clients: 0,
        providers: 0,
        appointmentsToday: 0,
        subscriptionsActive: 0,
        appointmentsPerDay: [],
        confirmedAppointments: 0,
        pendingAppointments: 0,
        cancelledAppointments: 0
      },
      recentAppointments: [
        {
          id: 1,
          client: "María González",
          service: "Consulta Veterinaria",
          date: "2024-01-15 10:00",
          status: "Confirmada"
        },
        {
          id: 2,
          client: "Carlos Rodríguez",
          service: "Peluquería Canina",
          date: "2024-01-15 11:30",
          status: "Pendiente"
        },
        {
          id: 3,
          client: "Ana Martínez",
          service: "Vacunación",
          date: "2024-01-15 14:00",
          status: "Completada"
        },
        {
          id: 4,
          client: "Juan Pérez",
          service: "Guardería",
          date: "2024-01-16 09:00",
          status: "Confirmada"
        }
      ],
      chart: null,
    };
  },
  methods: {
    formatNumber(number) {
      return new Intl.NumberFormat('es-ES').format(number);
    },

    getAppointmentsTrend() {
      const today = this.stats.appointmentsToday;
      const avg = this.stats.appointmentsPerDay ? 
        this.stats.appointmentsPerDay.reduce((a, b) => a + b, 0) / this.stats.appointmentsPerDay.length : 0;
      
      if (today > avg) return `+${Math.round((today - avg) / avg * 100)}% vs promedio`;
      if (today < avg) return `${Math.round((today - avg) / avg * 100)}% vs promedio`;
      return "En línea con el promedio";
    },

    getStatusBadgeClass(status) {
      const classes = {
        'Confirmada': 'bg-green-100 text-green-800',
        'Pendiente': 'bg-yellow-100 text-yellow-800',
        'Completada': 'bg-blue-100 text-blue-800',
        'Cancelada': 'bg-red-100 text-red-800'
      };
      return classes[status] || 'bg-gray-100 text-gray-800';
    },

    async loadStats() {
      const userStore = useUserStore();
      const token = userStore.token;

      try {
        const { data } = await api.get("/admin/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });

        this.stats = { ...this.stats, ...data };
        this.renderChart();
      } catch (error) {
        console.error("❌ Error al cargar estadísticas:", error);
        // Datos de ejemplo para desarrollo
        this.stats = {
          clients: 1247,
          providers: 89,
          appointmentsToday: 23,
          subscriptionsActive: 567,
          appointmentsPerDay: [15, 18, 20, 22, 25, 23, 19],
          confirmedAppointments: 45,
          pendingAppointments: 23,
          cancelledAppointments: 8
        };
        this.renderChart();
      }
    },

    renderChart() {
      const ctx = document.getElementById("appointmentsChart")?.getContext("2d");
      if (!ctx) return;

      if (this.chart) this.chart.destroy();

      this.chart = new Chart(ctx, {
        type: "bar",
        data: {
          labels: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
          datasets: [
            {
              label: "Citas",
              data: this.stats.appointmentsPerDay,
              backgroundColor: "rgba(16,185,129,0.8)",
              borderColor: "#10B981",
              borderWidth: 2,
              borderRadius: 6,
              borderSkipped: false,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { 
              beginAtZero: true, 
              ticks: { stepSize: 5 },
              grid: {
                color: "rgba(0,0,0,0.1)"
              }
            },
            x: {
              grid: {
                display: false
              }
            }
          },
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              backgroundColor: "rgba(0,0,0,0.8)",
              titleColor: "#fff",
              bodyColor: "#fff"
            }
          }
        },
      });
    },
  },
  mounted() {
    this.loadStats();
  },
};
</script>

<style scoped>
/* Estilos adicionales para mejorar la experiencia */
.hover-lift:hover {
  transform: translateY(-4px);
  transition: transform 0.2s ease-in-out;
}

/* Mejora la legibilidad de las tablas */
table {
  border-collapse: separate;
  border-spacing: 0;
}

th {
  background-color: #f8fafc;
}
</style>