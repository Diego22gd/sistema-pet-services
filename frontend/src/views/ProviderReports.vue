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
    <Chatbot />
  </ProviderLayout>
 
</template>

<script>
import ProviderLayout from "@/components/ProviderLayout.vue";
import Chatbot from "@/components/Chatbot.vue";
import { onMounted, ref } from "vue";
import Chart from "chart.js/auto";
import api from "@/api/api"; // usa tu axios configurado

export default {
  name: "ProviderReports",
  components: { ProviderLayout,Chatbot },

  setup() {
    const stats = ref({
      completed: 0,
      cancelled: 0,
      pending: 0,
      revenue: 0
    });

    onMounted(async () => {
      try {
        // CORRECTO: usa tu endpoint del backend
        const { data } = await api.get("/provider/reports");

        stats.value = data.stats;

        // Inicializar gráfico
        const ctx = document.getElementById("appointmentsChart");

        new Chart(ctx, {
          type: "line",
          data: {
            labels: data.chart.labels,
            datasets: [
              {
                label: "Citas por mes",
                data: data.chart.data,
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
      } catch (error) {
        console.error("Error cargando reportes:", error);
      }
    });

    return { stats };
  }
};
</script>
