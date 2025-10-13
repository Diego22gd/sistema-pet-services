<template>
  <AdminLayout>
    <div class="flex h-full">
      <!-- Sidebar -->
      <aside class="w-64 bg-white shadow-lg p-6">
        <h2 class="text-xl font-bold mb-6 flex items-center gap-2 text-neutral-dark">📊 Reports</h2>
        <nav class="flex flex-col space-y-3">
          <button @click="activeTab = 'overview'" :class="tabClass('overview')">Overview</button>
          <button @click="activeTab = 'revenue'" :class="tabClass('revenue')">Revenue</button>
          <button @click="activeTab = 'services'" :class="tabClass('services')">Services</button>
          <button @click="activeTab = 'appointments'" :class="tabClass('appointments')">Appointments</button>
          <button @click="activeTab = 'detailed'" :class="tabClass('detailed')">Detailed Reports</button>
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

        <!-- Revenue -->
        <section v-if="activeTab === 'revenue'">
          <h1 class="text-3xl font-bold mb-8 text-neutral-dark">Monthly Revenue</h1>
          <div class="bg-white shadow rounded-2xl p-6">
            <canvas id="revenueChart" style="height: 320px;"></canvas>
          </div>
        </section>

        <!-- Services -->
        <section v-if="activeTab === 'services'">
          <h1 class="text-3xl font-bold mb-8 text-neutral-dark">Most Requested Services</h1>
          <div class="bg-white shadow rounded-2xl p-6">
            <canvas id="servicesChart" style="height: 320px;"></canvas>
          </div>
        </section>

        <!-- Appointments -->
        <section v-if="activeTab === 'appointments'">
          <h1 class="text-3xl font-bold mb-8 text-neutral-dark">Appointments Status</h1>
          <div class="bg-white shadow rounded-2xl p-6 h-280 max-h-[80%]">
            <canvas id="statusChart" style="height: 520px;"></canvas>
          </div>
        </section>

        <!-- Detailed Reports -->
        <section v-if="activeTab === 'detailed'">
          <h1 class="text-3xl font-bold mb-8 text-neutral-dark">Detailed Reports</h1>
          <div class="bg-white shadow rounded-2xl p-6 overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead class="bg-primary-mint text-white">
                <tr>
                  <th class="px-4 py-2">Report</th>
                  <th class="px-4 py-2">Value</th>
                  <th class="px-4 py-2">Last Update</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="report in detailedReports" :key="report.id" class="border-b hover:bg-neutral-light/50">
                  <td class="px-4 py-2">{{ report.title }}</td>
                  <td class="px-4 py-2">{{ report.value }}</td>
                  <td class="px-4 py-2">{{ report.date }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  </AdminLayout>
</template>

<script>
import AdminLayout from "@/components/AdminLayout.vue";
import { watch, onMounted, ref } from "vue";
import Chart from "chart.js/auto";

export default {
  name: "AdminReports",
  components: { AdminLayout },
  setup() {
    const activeTab = ref("overview");
    const charts = ref({});

    const stats = {
      clients: 320,
      providers: 58,
      appointments: 145,
      revenue: 12500,
    };

    const detailedReports = [
      { id: 1, title: "Top Provider", value: "Happy Pets Grooming", date: "2025-08-20" },
      { id: 2, title: "Most Popular Service", value: "Grooming", date: "2025-08-20" },
      { id: 3, title: "Average Revenue per Appointment", value: "$85", date: "2025-08-20" },
      { id: 4, title: "Cancelled Appointments", value: "12", date: "2025-08-20" },
    ];

    const initCharts = (tab) => {
      if (charts.value[tab]) charts.value[tab].destroy();

      if (tab === "revenue") {
        const ctx = document.getElementById("revenueChart").getContext("2d");
        charts.value[tab] = new Chart(ctx, {
          type: "line",
          data: {
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"],
            datasets: [
              {
                label: "Revenue",
                data: [8000, 9500, 11000, 9000, 12000, 13000, 12500, 14000],
                borderColor: "#10B981",
                backgroundColor: "rgba(16,185,129,0.2)",
                fill: true,
                tension: 0.3,
              },
            ],
          },
        });
      }

      if (tab === "services") {
        const ctx = document.getElementById("servicesChart").getContext("2d");
        charts.value[tab] = new Chart(ctx, {
          type: "bar",
          data: {
            labels: ["Grooming", "Veterinary", "Walking", "Training", "Daycare"],
            datasets: [
              {
                label: "Appointments",
                data: [50, 40, 30, 20, 15],
                backgroundColor: ["#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#6366F1"],
              },
            ],
          },
        });
      }

      if (tab === "appointments") {
        const ctx = document.getElementById("statusChart").getContext("2d");
        charts.value[tab] = new Chart(ctx, {
          type: "doughnut",
          data: {
            labels: ["Pending", "Completed", "Cancelled"],
            datasets: [
              {
                data: [45, 80, 20],
                backgroundColor: ["#F59E0B", "#10B981", "#EF4444"],
              },
            ],
          },
        });
      }
    };

    watch(activeTab, (newTab) => {
      if (["revenue", "services", "appointments"].includes(newTab)) {
        setTimeout(() => initCharts(newTab), 200);
      }
    });

    onMounted(() => {
      if (activeTab.value !== "overview") initCharts(activeTab.value);
    });

    const tabClass = (tab) =>
      `text-left px-4 py-2 rounded-lg transition font-medium ${
        activeTab.value === tab
          ? "bg-primary-mint text-white shadow"
          : "text-neutral-dark hover:bg-primary-mint hover:text-white"
      }`;

    return {
      activeTab,
      stats,
      detailedReports,
      tabClass,
    };
  },
};
</script>

<style scoped>
main {
  min-height: calc(100vh - 120px);
}
</style>
