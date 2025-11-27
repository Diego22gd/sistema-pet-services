<template>
  <AdminLayout>
    <div class="flex h-full">
      <!-- Sidebar -->
      <aside class="w-64 bg-white shadow-lg p-6">
        <h2 class="text-xl font-bold mb-6 flex items-center gap-2 text-neutral-dark">📊 Reports</h2>
        <nav class="flex flex-col space-y-3">
          <button @click="activeTab = 'overview'" :class="tabClass('overview')">Overview</button>
          <button @click="activeTab = 'appointments'" :class="tabClass('appointments')">Appointments</button>
          <button @click="activeTab = 'services'" :class="tabClass('services')">Services</button>
        </nav>
      </aside>

      <!-- Contenido principal -->
      <main class="flex-1 p-8 overflow-y-auto bg-neutral-bg">
        <!-- Overview -->
        <section v-if="activeTab === 'overview'">
          <h1 class="text-3xl font-bold mb-8 text-neutral-dark">Reports & Analytics Overview</h1>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="bg-white shadow rounded-2xl p-6 hover:shadow-md transition">
              <h2 class="text-sm text-neutral-medium">Total Clients</h2>
              <p class="text-3xl font-bold text-primary-mint">{{ stats.clients }}</p>
            </div>
            <div class="bg-white shadow rounded-2xl p-6 hover:shadow-md transition">
              <h2 class="text-sm text-neutral-medium">Total Providers</h2>
              <p class="text-3xl font-bold text-primary-mint">{{ stats.providers }}</p>
            </div>
            <div class="bg-white shadow rounded-2xl p-6 hover:shadow-md transition">
              <h2 class="text-sm text-neutral-medium">Appointments This Month</h2>
              <p class="text-3xl font-bold text-primary-mint">{{ stats.appointments }}</p>
            </div>
            <div class="bg-white shadow rounded-2xl p-6 hover:shadow-md transition">
              <h2 class="text-sm text-neutral-medium">Revenue This Month</h2>
              <p class="text-3xl font-bold text-primary-mint">${{ stats.revenue }}</p>
            </div>
          </div>
        </section>

        <!-- Appointments -->
        <section v-if="activeTab === 'appointments'">
          <h1 class="text-3xl font-bold mb-8 text-neutral-dark">Appointments Status</h1>
          <div class="bg-white shadow rounded-2xl p-6 h-[420px]">
            <canvas id="statusChart" style="height: 100%;"></canvas>
          </div>
        </section>

        <!-- Services -->
        <section v-if="activeTab === 'services'">
          <h1 class="text-3xl font-bold mb-8 text-neutral-dark">Most Requested Services</h1>
          <div class="bg-white shadow rounded-2xl p-6 h-[420px]">
            <canvas id="servicesChart" style="height: 100%;"></canvas>
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
  components: { AdminLayout , Chatbot },
  setup() {
    const activeTab = ref("overview");
    const stats = ref({ clients: 0, providers: 0, appointments: 0, revenue: 0 });
    const charts = ref({});

    // 🔹 Obtener datos de resumen
    const fetchStats = async () => {
      try {
        const { data } = await axios.get("/api/admin/reports/overview");
        stats.value = data;
      } catch (error) {
        console.error("Error fetching overview stats:", error);
      }
    };

    // 🔹 Obtener datos de citas
    const fetchAppointmentsData = async () => {
      try {
        const { data } = await axios.get("/api/admin/reports/appointments");
        renderAppointmentsChart(data);
      } catch (error) {
        console.error("Error fetching appointment data:", error);
      }
    };

    // 🔹 Renderizar gráfico de citas por estado
    const renderAppointmentsChart = (data) => {
      if (charts.value.appointments) charts.value.appointments.destroy();

      const ctx = document.getElementById("statusChart").getContext("2d");

      charts.value.appointments = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: ["Pendiente", "Confirmada", "Reprogramada", "Cancelada"],
          datasets: [
            {
              data: [data.pending, data.confirmed, data.rescheduled, data.cancelled],
              backgroundColor: ["#F59E0B", "#10B981", "#3B82F6", "#EF4444"],
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: "bottom" },
          },
        },
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

      const ctx = document.getElementById("servicesChart").getContext("2d");

      charts.value.services = new Chart(ctx, {
        type: "bar",
        data: {
          labels: data.map((s) => s.service),
          datasets: [
            {
              label: "Appointments",
              data: data.map((s) => s.count),
              backgroundColor: "#10B981",
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
          },
        },
      });
    };

    // 🔹 Cambio de pestaña
    watch(activeTab, (newTab) => {
      if (newTab === "appointments") fetchAppointmentsData();
      if (newTab === "services") fetchServicesData();
    });

    onMounted(() => {
      fetchStats();
    });

    const tabClass = (tab) =>
      `text-left px-4 py-2 rounded-lg transition font-medium ${
        activeTab.value === tab
          ? "bg-primary-mint text-white shadow"
          : "text-neutral-dark hover:bg-primary-mint hover:text-white"
      }`;

    return { activeTab, stats, tabClass };
  },
};
</script>

<style scoped>
main {
  min-height: calc(100vh - 120px);
}
</style>
