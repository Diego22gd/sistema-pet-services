<template>
  <ProviderLayout>
    <div class="px-6 max-w-6xl mx-auto w-full pt-4">
      <h1 class="text-2xl font-bold mb-6 text-neutral-dark">Reportes del Negocio</h1>

      <!-- Tarjetas resumen -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-neutral-light shadow rounded-2xl p-6 text-center">
          <h2 class="text-xl font-semibold text-neutral-dark">Citas Atendidas</h2>
          <p class="text-3xl font-bold text-primary-mint">{{ stats.completed }}</p>
        </div>
        <div class="bg-neutral-light shadow rounded-2xl p-6 text-center">
          <h2 class="text-xl font-semibold text-neutral-dark">Canceladas</h2>
          <p class="text-3xl font-bold text-red-500">{{ stats.cancelled }}</p>
        </div>
        <div class="bg-neutral-light shadow rounded-2xl p-6 text-center">
          <h2 class="text-xl font-semibold text-neutral-dark">Pendientes</h2>
          <p class="text-3xl font-bold text-yellow-500">{{ stats.pending }}</p>
        </div>
        <div class="bg-neutral-light shadow rounded-2xl p-6 text-center">
          <h2 class="text-xl font-semibold text-neutral-dark">Ingresos</h2>
          <p class="text-3xl font-bold text-secondary">${{ stats.revenue }}</p>
        </div>
      </div>

      <!-- Gráfico -->
      <div class="bg-neutral-light shadow rounded-2xl p-6 mb-8">
        <h2 class="text-xl font-semibold mb-4 text-neutral-dark">Citas por Mes</h2>
        <canvas id="appointmentsChart"></canvas>
      </div>
    </div>
  </ProviderLayout>
</template>

<script>
import ProviderLayout from "@/components/ProviderLayout.vue";
import { onMounted } from "vue";
import Chart from "chart.js/auto";

export default {
  name: "ProviderReports",
  components: { ProviderLayout },
  data() {
    return {
      stats: {
        completed: 120,
        cancelled: 15,
        pending: 8,
        revenue: 3200
      }
    };
  },
  setup() {
    onMounted(() => {
      const ctx = document.getElementById("appointmentsChart");
      new Chart(ctx, {
        type: "line",
        data: {
          labels: ["Enero", "Febrero", "Marzo", "Abril", "Mayo"],
          datasets: [
            {
              label: "Citas",
              data: [20, 35, 40, 25, 50],
              borderColor: "#34d399",
              fill: false,
              tension: 0.3
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: true }
          }
        }
      });
    });
  }
};
</script>
