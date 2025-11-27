<template>
  <AdminLayout>
    <div class="px-6 max-w-6xl mx-auto w-full pt-4">
      <h1 class="text-2xl font-bold mb-6 text-neutral-dark">Admin Dashboard</h1>

      <!-- Cards resumen -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div class="bg-neutral-light shadow rounded-2xl p-6">
          <h2 class="text-sm text-neutral-medium">Clientes</h2>
          <p class="text-3xl font-bold text-primary-mint">{{ stats.clients }}</p>
        </div>
        <div class="bg-neutral-light shadow rounded-2xl p-6">
          <h2 class="text-sm text-neutral-medium">Proveedores</h2>
          <p class="text-3xl font-bold text-primary-mint">{{ stats.providers }}</p>
        </div>
        <div class="bg-neutral-light shadow rounded-2xl p-6">
          <h2 class="text-sm text-neutral-medium">Citas Hoy</h2>
          <p class="text-3xl font-bold text-primary-mint">{{ stats.appointmentsToday }}</p>
        </div>
        <div class="bg-neutral-light shadow rounded-2xl p-6">
          <h2 class="text-sm text-neutral-medium">Suscripciones Activas</h2>
          <p class="text-3xl font-bold text-primary-mint">{{ stats.subscriptionsActive }}</p>
        </div>
      </div>

      <!-- Gráfico -->
      <div class="bg-neutral-light shadow rounded-2xl p-6 mb-8">
        <h2 class="text-lg font-semibold text-neutral-dark mb-4">
          Citas por Día (Semana Actual)
        </h2>
        <canvas id="appointmentsChart"></canvas>
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
  components: { AdminLayout ,Chatbot},
  data() {
    return {
      stats: {
        clients: 0,
        providers: 0,
        appointmentsToday: 0,
        subscriptionsActive: 0,
        appointmentsPerDay: [],
      },
      chart: null,
    };
  },
  methods: {
    async loadStats() {
      const userStore = useUserStore();
      const token = userStore.token;

      try {
        const { data } = await api.get("/admin/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });

        this.stats = data;
        this.renderChart();
      } catch (error) {
        console.error("❌ Error al cargar estadísticas:", error);
      }
    },
    renderChart() {
      const ctx = document.getElementById("appointmentsChart").getContext("2d");

      if (this.chart) this.chart.destroy();

      this.chart = new Chart(ctx, {
        type: "bar",
        data: {
          labels: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
          datasets: [
            {
              label: "Citas",
              data: this.stats.appointmentsPerDay,
              backgroundColor: "rgba(16,185,129,0.6)",
              borderColor: "#10B981",
              borderWidth: 2,
              borderRadius: 6,
            },
          ],
        },
        options: {
          scales: {
            y: { beginAtZero: true, ticks: { stepSize: 1 } },
          },
        },
      });
    },
  },
  mounted() {
    this.loadStats();
  },
};
</script>
