<template>
  <AdminLayout>
    <div class="px-6 max-w-6xl mx-auto w-full pt-10">
      <h1 class="text-2xl font-bold mb-6 text-neutral-dark">Appointments Management</h1>

      <!-- Barra de búsqueda -->
      <div class="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by client or provider..."
          class="w-full md:w-1/3 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-mint outline-none"
        />
      </div>

      <!-- Tabla de citas -->
      <div class="bg-neutral-light shadow rounded-2xl overflow-hidden">
        <table class="w-full text-left border-collapse">
          <thead class="bg-primary-mint text-white">
            <tr>
              <th class="px-4 py-2">Client</th>
              <th class="px-4 py-2">Provider</th>
              <th class="px-4 py-2">Service</th>
              <th class="px-4 py-2">Date</th>
              <th class="px-4 py-2">Status</th>
              <th class="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="appointment in filteredAppointments"
              :key="appointment._id"
              class="border-b hover:bg-neutral-light/50 transition"
            >
              <td class="px-4 py-2">{{ appointment.clientId?.name || 'N/A' }}</td>
              <td class="px-4 py-2">{{ appointment.providerId?.name || 'N/A' }}</td>
              <td class="px-4 py-2">{{ appointment.service || 'N/A' }}</td>
              <td class="px-4 py-2">{{ formatDate(appointment.date) }}</td>
              <td class="px-4 py-2">
                <span
                  :class="[ 'px-2 py-1 rounded-lg text-xs font-semibold',
                    appointment.status === 'Pending'
                      ? 'bg-yellow-200 text-yellow-800'
                      : appointment.status === 'Completed'
                      ? 'bg-green-200 text-green-800'
                      : 'bg-red-200 text-red-800'
                  ]"
                >
                  {{ appointment.status }}
                </span>
              </td>
              <td class="px-4 py-2 flex gap-2">
                <button
                  @click="changeStatus(appointment, 'Completed')"
                  class="px-3 py-1 text-xs bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Complete
                </button>
                <button
                  @click="changeStatus(appointment, 'Cancelled')"
                  class="px-3 py-1 text-xs bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                >
                  Cancel
                </button>
                <button
                  @click="deleteAppointment(appointment._id)"
                  class="px-3 py-1 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
            <tr v-if="filteredAppointments.length === 0">
              <td colspan="6" class="px-4 py-4 text-center text-neutral-medium">
                No appointments found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </AdminLayout>
</template>

<script>
import AdminLayout from "@/components/AdminLayout.vue";
import api from "@/api/api";

export default {
  name: "AdminAppointments",
  components: { AdminLayout },
  data() {
    return {
      searchQuery: "",
      appointments: [],
    };
  },
  computed: {
    filteredAppointments() {
      if (!this.searchQuery) return this.appointments;
      const query = this.searchQuery.toLowerCase();
      return this.appointments.filter(
        (a) =>
          a.clientId?.name?.toLowerCase().includes(query) ||
          a.providerId?.name?.toLowerCase().includes(query)
      );
    },
  },
  methods: {
    async fetchAppointments() {
      try {
        const { data } = await api.get("/admin/appointments");
        this.appointments = data;
      } catch (err) {
        console.error("Error fetching appointments:", err);
      }
    },
    formatDate(date) {
      return new Date(date).toLocaleString();
    },
    async changeStatus(appointment, newStatus) {
      try {
        const { data } = await api.put(`/admin/appointments/${appointment._id}/status`, { status: newStatus });
        const index = this.appointments.findIndex((a) => a._id === data._id);
        this.appointments.splice(index, 1, data);
      } catch (err) {
        console.error("Error updating status:", err);
      }
    },
    async deleteAppointment(id) {
      if (!confirm("Are you sure you want to delete this appointment?")) return;
      try {
        await api.delete(`/admin/appointments/${id}`);
        this.appointments = this.appointments.filter((a) => a._id !== id);
      } catch (err) {
        console.error("Error deleting appointment:", err);
      }
    },
  },
  mounted() {
    this.fetchAppointments();
  },
};
</script>
