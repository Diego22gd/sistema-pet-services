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
          <h2 class="text-sm text-neutral-medium">Ingresos</h2>
          <p class="text-3xl font-bold text-primary-mint">${{ stats.revenue }}</p>
        </div>
      </div>

      <!-- Gráfico -->
      <div class="bg-neutral-light shadow rounded-2xl p-6 mb-8">
        <h2 class="text-lg font-semibold text-neutral-dark mb-4">Tendencia de Citas</h2>
        <canvas id="appointmentsChart"></canvas>
      </div>
    </div>
  </AdminLayout>
</template>

<script>
import AdminLayout from "@/components/AdminLayout.vue";
import Chart from "chart.js/auto";

export default {
  name: "AdminDashboard",
  components: { AdminLayout },
  data() {
    return {
      stats: {
        clients: 120,
        providers: 35,
        appointmentsToday: 18,
        revenue: 4500,
      },
    };
  },
  methods: {
    initChart() {
      const ctx = document.getElementById("appointmentsChart").getContext("2d");
      new Chart(ctx, {
        type: "line",
        data: {
          labels: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
          datasets: [
            {
              label: "Citas",
              data: [5, 8, 6, 10, 7, 12, 9],
              borderColor: "#10B981",
              backgroundColor: "rgba(16,185,129,0.2)",
              fill: true,
              tension: 0.3,
            },
          ],
        },
      });
    },
  },
  mounted() {
    this.initChart();
  },
};
</script>
