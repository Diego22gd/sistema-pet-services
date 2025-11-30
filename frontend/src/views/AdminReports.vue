<template>
  <AdminLayout>
    <div class="flex min-h-screen bg-neutral-bg">
      <!-- Sidebar Mejorado -->
      <aside class="w-80 bg-white shadow-xl border-r border-neutral-light">
        <div class="p-6 border-b border-neutral-light">
          <h2 class="text-2xl font-bold flex items-center gap-3 text-neutral-dark">
            <div class="w-10 h-10 bg-primary-mint/10 rounded-xl flex items-center justify-center">
              <span class="text-lg">📊</span>
            </div>
            Analytics & Reports
          </h2>
          <p class="text-sm text-neutral-medium mt-2">Panel de análisis y métricas del sistema</p>
        </div>
        
        <nav class="p-4 space-y-2">
          <button 
            @click="activeTab = 'overview'" 
            :class="tabClass('overview')"
            class="w-full text-left transition-all duration-300"
          >
            <div class="flex items-center gap-3 py-3 px-4 rounded-xl">
              <div class="w-8 h-8 bg-primary-mint/10 rounded-lg flex items-center justify-center">
                <span>📈</span>
              </div>
              <div>
                <div class="font-semibold">Dashboard</div>
                <div class="text-xs text-neutral-medium">Resumen general</div>
              </div>
            </div>
          </button>
          
          <button 
            @click="activeTab = 'appointments'" 
            :class="tabClass('appointments')"
            class="w-full text-left transition-all duration-300"
          >
            <div class="flex items-center gap-3 py-3 px-4 rounded-xl">
              <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span>📅</span>
              </div>
              <div>
                <div class="font-semibold">Citas</div>
                <div class="text-xs text-neutral-medium">Estados y métricas</div>
              </div>
            </div>
          </button>
          
          <button 
            @click="activeTab = 'services'" 
            :class="tabClass('services')"
            class="w-full text-left transition-all duration-300"
          >
            <div class="flex items-center gap-3 py-3 px-4 rounded-xl">
              <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span>🔧</span>
              </div>
              <div>
                <div class="font-semibold">Servicios</div>
                <div class="text-xs text-neutral-medium">Popularidad</div>
              </div>
            </div>
          </button>

          <button 
            @click="activeTab = 'revenue'" 
            :class="tabClass('revenue')"
            class="w-full text-left transition-all duration-300"
          >
            <div class="flex items-center gap-3 py-3 px-4 rounded-xl">
              <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <span>💰</span>
              </div>
              <div>
                <div class="font-semibold">Ingresos</div>
                <div class="text-xs text-neutral-medium">Análisis financiero</div>
              </div>
            </div>
          </button>
        </nav>
      </aside>

      <!-- Contenido principal mejorado -->
      <main class="flex-1 p-8 overflow-y-auto">
        <!-- Header dinámico -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-neutral-dark mb-2">{{ getSectionTitle() }}</h1>
          <p class="text-neutral-medium text-lg">{{ getSectionDescription() }}</p>
        </div>

        <!-- Overview Mejorado -->
        <section v-if="activeTab === 'overview'" class="space-y-8">
          <!-- Tarjetas de métricas principales -->
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <div class="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 p-6 border border-neutral-light">
              <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <span class="text-xl">👥</span>
                </div>
                <div class="text-right">
                  <div class="text-2xl font-bold text-neutral-dark">{{ stats.clients }}</div>
                  <div class="text-sm text-neutral-medium">Clientes</div>
                </div>
              </div>
              <div class="text-xs text-green-600 font-semibold">+12% este mes</div>
            </div>

            <div class="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 p-6 border border-neutral-light">
              <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <span class="text-xl">🏢</span>
                </div>
                <div class="text-right">
                  <div class="text-2xl font-bold text-neutral-dark">{{ stats.providers }}</div>
                  <div class="text-sm text-neutral-medium">Proveedores</div>
                </div>
              </div>
              <div class="text-xs text-green-600 font-semibold">+5% este mes</div>
            </div>

            <div class="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 p-6 border border-neutral-light">
              <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <span class="text-xl">📅</span>
                </div>
                <div class="text-right">
                  <div class="text-2xl font-bold text-neutral-dark">{{ stats.appointments }}</div>
                  <div class="text-sm text-neutral-medium">Citas/Mes</div>
                </div>
              </div>
              <div class="text-xs text-green-600 font-semibold">+18% este mes</div>
            </div>

            <div class="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 p-6 border border-neutral-light">
              <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <span class="text-xl">💰</span>
                </div>
                <div class="text-right">
                  <div class="text-2xl font-bold text-primary-mint">${{ formatRevenue(stats.revenue) }}</div>
                  <div class="text-sm text-neutral-medium">Ingresos</div>
                </div>
              </div>
              <div class="text-xs text-green-600 font-semibold">+22% este mes</div>
            </div>
          </div>

          <!-- Gráficos del overview -->
          <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-4">
            <div class="bg-white rounded-2xl shadow-lg p-6 border border-neutral-light">
              <h3 class="font-bold text-lg text-neutral-dark mb-4">Citas por Estado</h3>
              <div class="h-80">
                <canvas id="overviewStatusChart"></canvas>
              </div>
            </div>

            <div class="bg-white rounded-2xl shadow-lg p-6 border border-neutral-light">
              <h3 class="font-bold text-lg text-neutral-dark mb-4">Servicios Populares</h3>
              <div class="h-80">
                <canvas id="overviewServicesChart"></canvas>
              </div>
            </div>
          </div>
        </section>

        <!-- Appointments Mejorado -->
        <section v-if="activeTab === 'appointments'" class="space-y-8">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="bg-white rounded-2xl shadow-lg p-6 border border-neutral-light">
              <h3 class="font-bold text-lg text-neutral-dark mb-4">Distribución de Citas</h3>
              <div class="h-80">
                <canvas id="statusChart"></canvas>
              </div>
            </div>
            
            <div class="bg-white rounded-2xl shadow-lg p-6 border border-neutral-light lg:col-span-2">
              <h3 class="font-bold text-lg text-neutral-dark mb-4">Tendencia Mensual</h3>
              <div class="h-80">
                <canvas id="appointmentsTrendChart"></canvas>
              </div>
            </div>
          </div>
        </section>

        <!-- Services Mejorado -->
        <section v-if="activeTab === 'services'" class="space-y-8">
          <div class="bg-white rounded-2xl shadow-lg p-6 border border-neutral-light">
            <h3 class="font-bold text-lg text-neutral-dark mb-4">Servicios Más Solicitados</h3>
            <div class="h-96">
              <canvas id="servicesChart"></canvas>
            </div>
          </div>
        </section>

        <!-- Revenue Mejorado -->
        <section v-if="activeTab === 'revenue'" class="space-y-8">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div class="bg-white rounded-2xl shadow-lg p-6 border border-neutral-light">
              <h3 class="font-bold text-lg text-neutral-dark mb-4">Ingresos Mensuales</h3>
              <div class="h-80">
                <canvas id="revenueChart"></canvas>
              </div>
            </div>
            
            <div class="bg-white rounded-2xl shadow-lg p-6 border border-neutral-light">
              <h3 class="font-bold text-lg text-neutral-dark mb-4">Ingresos por Servicio</h3>
              <div class="h-80">
                <canvas id="revenueByServiceChart"></canvas>
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
import { ref, watch, onMounted } from "vue";
import Chart from "chart.js/auto";
import axios from "axios";

export default {
  name: "AdminReports",
  components: { AdminLayout, Chatbot },
  setup() {
    const activeTab = ref("overview");
    const stats = ref({ clients: 0, providers: 0, appointments: 0, revenue: 0 });
    const charts = ref({});

    // Títulos y descripciones dinámicas
    const getSectionTitle = () => {
      const titles = {
        overview: "Dashboard de Analytics",
        appointments: "Análisis de Citas",
        services: "Métricas de Servicios",
        revenue: "Reportes de Ingresos"
      };
      return titles[activeTab.value] || "Reports & Analytics";
    };

    const getSectionDescription = () => {
      const descriptions = {
        overview: "Resumen completo de métricas y tendencias del sistema",
        appointments: "Seguimiento y análisis del comportamiento de citas",
        services: "Popularidad y desempeño de servicios ofrecidos",
        revenue: "Análisis financiero y tendencias de ingresos"
      };
      return descriptions[activeTab.value] || "Panel de análisis y métricas";
    };

    // Formatear revenue
    const formatRevenue = (amount) => {
      return new Intl.NumberFormat('en-US').format(amount);
    };

    // 🔹 Obtener datos de resumen
    const fetchStats = async () => {
      try {
        const { data } = await axios.get("/api/admin/reports/overview");
        stats.value = data;
        renderOverviewCharts(data);
      } catch (error) {
        console.error("Error fetching overview stats:", error);
        // Datos de ejemplo para desarrollo
        stats.value = { clients: 1247, providers: 89, appointments: 342, revenue: 28500 };
      }
    };

    // 🔹 Renderizar gráficos del overview
    const renderOverviewCharts = (data) => {
      // Gráfico de estado de citas para overview
      const statusCtx = document.getElementById("overviewStatusChart")?.getContext("2d");
      if (statusCtx && !charts.value.overviewStatus) {
        charts.value.overviewStatus = new Chart(statusCtx, {
          type: "doughnut",
          data: {
            labels: ["Confirmadas", "Pendientes", "Canceladas", "Completadas"],
            datasets: [{
              data: [45, 25, 15, 15],
              backgroundColor: ["#10B981", "#F59E0B", "#EF4444", "#3B82F6"],
              borderWidth: 2,
              borderColor: '#fff'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'bottom' },
              tooltip: { enabled: true }
            }
          }
        });
      }

      // Gráfico de servicios para overview
      const servicesCtx = document.getElementById("overviewServicesChart")?.getContext("2d");
      if (servicesCtx && !charts.value.overviewServices) {
        charts.value.overviewServices = new Chart(servicesCtx, {
          type: "bar",
          data: {
            labels: ["Veterinaria", "Peluquería", "Guardería", "Entrenamiento", "Spa"],
            datasets: [{
              label: "Citas",
              data: [120, 85, 60, 45, 32],
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
              y: { beginAtZero: true }
            }
          }
        });
      }
    };

    // 🔹 Obtener datos de citas
    const fetchAppointmentsData = async () => {
      try {
        const { data } = await axios.get("/api/admin/reports/appointments");
        renderAppointmentsChart(data);
        renderAppointmentsTrendChart(data);
      } catch (error) {
        console.error("Error fetching appointment data:", error);
      }
    };

    // 🔹 Renderizar gráfico de citas por estado
    const renderAppointmentsChart = (data) => {
      if (charts.value.appointments) charts.value.appointments.destroy();

      const ctx = document.getElementById("statusChart")?.getContext("2d");
      if (!ctx) return;

      charts.value.appointments = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: ["Pendiente", "Confirmada", "Reprogramada", "Cancelada", "Completada"],
          datasets: [{
            data: [data.pending || 25, data.confirmed || 45, data.rescheduled || 10, data.cancelled || 15, data.completed || 5],
            backgroundColor: ["#F59E0B", "#10B981", "#3B82F6", "#EF4444", "#8B5CF6"],
            borderWidth: 3,
            borderColor: '#fff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "bottom" }
          }
        }
      });
    };

    // 🔹 Renderizar gráfico de tendencia de citas
    const renderAppointmentsTrendChart = (data) => {
      const ctx = document.getElementById("appointmentsTrendChart")?.getContext("2d");
      if (!ctx) return;

      charts.value.appointmentsTrend = new Chart(ctx, {
        type: "line",
        data: {
          labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul"],
          datasets: [{
            label: "Citas Mensuales",
            data: [120, 150, 180, 200, 240, 280, 342],
            borderColor: "#10B981",
            backgroundColor: "rgba(16, 185, 129, 0.1)",
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: { beginAtZero: true }
          }
        }
      });
    };

    // 🔹 Obtener datos de servicios
    const fetchServicesData = async () => {
      try {
        const { data } = await axios.get("/api/admin/reports/services");
        renderServicesChart(data);
      } catch (error) {
        console.error("Error fetching services data:", error);
      }
    };

    // 🔹 Renderizar gráfico de servicios más solicitados
    const renderServicesChart = (data) => {
      if (charts.value.services) charts.value.services.destroy();

      const ctx = document.getElementById("servicesChart")?.getContext("2d");
      if (!ctx) return;

      charts.value.services = new Chart(ctx, {
        type: "bar",
        data: {
          labels: data.map((s) => s.service) || ["Veterinaria", "Peluquería", "Guardería", "Entrenamiento"],
          datasets: [{
            label: "Citas",
            data: data.map((s) => s.count) || [120, 85, 60, 45],
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
            y: { beginAtZero: true }
          }
        }
      });
    };

    // 🔹 Renderizar gráficos de revenue
    const renderRevenueCharts = () => {
      // Gráfico de ingresos mensuales
      const revenueCtx = document.getElementById("revenueChart")?.getContext("2d");
      if (revenueCtx && !charts.value.revenue) {
        charts.value.revenue = new Chart(revenueCtx, {
          type: "line",
          data: {
            labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul"],
            datasets: [{
              label: "Ingresos ($)",
              data: [15000, 18000, 22000, 19500, 24000, 26500, 28500],
              borderColor: "#8B5CF6",
              backgroundColor: "rgba(139, 92, 246, 0.1)",
              tension: 0.4,
              fill: true
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false }
            }
          }
        });
      }

      // Gráfico de ingresos por servicio
      const revenueServiceCtx = document.getElementById("revenueByServiceChart")?.getContext("2d");
      if (revenueServiceCtx && !charts.value.revenueByService) {
        charts.value.revenueByService = new Chart(revenueServiceCtx, {
          type: "doughnut",
          data: {
            labels: ["Veterinaria", "Peluquería", "Guardería", "Entrenamiento", "Otros"],
            datasets: [{
              data: [45, 25, 15, 10, 5],
              backgroundColor: ["#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6"],
              borderWidth: 2,
              borderColor: '#fff'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'bottom' }
            }
          }
        });
      }
    };

    // 🔹 Cambio de pestaña
    watch(activeTab, (newTab) => {
      if (newTab === "appointments") fetchAppointmentsData();
      if (newTab === "services") fetchServicesData();
      if (newTab === "revenue") renderRevenueCharts();
    });

    onMounted(() => {
      fetchStats();
    });

    const tabClass = (tab) =>
      `w-full text-left transition-all duration-300 rounded-xl ${
        activeTab.value === tab
          ? "bg-primary-mint text-white shadow-lg"
          : "text-neutral-dark hover:bg-neutral-light"
      }`;

    return { 
      activeTab, 
      stats, 
      tabClass, 
      getSectionTitle, 
      getSectionDescription,
      formatRevenue
    };
  },
};
</script>

<style scoped>
/* Estilos personalizados para scroll suave */
main {
  scroll-behavior: smooth;
}

/* Mejoras visuales para las tarjetas */
.bg-white {
  backdrop-filter: blur(10px);
}
</style>