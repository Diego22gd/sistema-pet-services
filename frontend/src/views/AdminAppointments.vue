<template>
  <AdminLayout>
    <div class="px-6 max-w-7xl mx-auto pt-6 w-full">

      <h1 class="text-2xl font-bold mb-6 text-neutral-dark">Appointments Management</h1>

      <!-- Buscador -->
      <div class="flex justify-between mb-6">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by client, provider or service..."
          class="px-4 py-2 border rounded-lg w-full md:w-1/3"
        />
      </div>

      <!-- Tabla -->
      <div class="bg-neutral-light shadow rounded-2xl overflow-hidden">
        <table class="w-full text-left">
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
              v-for="appt in filteredAppointments"
              :key="appt._id"
              class="border-b hover:bg-neutral-light/60"
            >
              <td class="px-4 py-2">
                {{ appt.userId?.name }} {{ appt.userId?.lastname }} <br />
                <small>{{ appt.userId?.email }}</small>
              </td>

              <td class="px-4 py-2">
                {{ appt.providerId?.businessName }} <br />
                <small>{{ appt.providerId?.serviceType }}</small>
              </td>

              <td class="px-4 py-2">{{ appt.service }}</td>

              <td class="px-4 py-2">
                {{ formatDate(appt.date) }}
              </td>

              <td class="px-4 py-2">
                <span :class="statusClass(appt.status)">
                  {{ appt.status }}
                </span>
              </td>

              <td class="px-4 py-2 flex gap-2">
                <button
                  @click="openEditModal(appt)"
                  class="px-3 py-1 text-xs bg-blue-500 text-white rounded"
                >Edit</button>

                <button
                  @click="changeStatus(appt._id, 'confirmed')"
                  class="px-3 py-1 text-xs bg-green-500 text-white rounded"
                >Confirm</button>

                <button
                  @click="changeStatus(appt._id, 'cancelled')"
                  class="px-3 py-1 text-xs bg-yellow-500 text-white rounded"
                >Cancel</button>

                <button
                  @click="deleteAppointment(appt._id)"
                  class="px-3 py-1 text-xs bg-red-500 text-white rounded"
                >Delete</button>
              </td>
            </tr>

            <tr v-if="filteredAppointments.length === 0">
              <td colspan="6" class="px-4 py-3 text-center text-neutral-medium">
                No appointments found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal editar -->
      <div
        v-if="showModal"
        class="fixed inset-0 bg-black/40 flex justify-center items-center z-50"
      >
        <div class="bg-white rounded-xl p-6 w-full max-w-md">
          <h2 class="text-xl font-semibold mb-4">Edit Appointment</h2>

          <form @submit.prevent="saveChanges">
            <label class="block mb-2 font-medium">Date</label>
            <input
              v-model="form.date"
              type="datetime-local"
              class="w-full border rounded px-3 py-2 mb-4"
            />

            <div class="flex justify-end gap-3">
              <button
                @click="closeModal"
                class="px-4 py-2 bg-gray-300 rounded"
                type="button"
              >
                Cancel
              </button>

              <button
                type="submit"
                class="px-4 py-2 bg-primary-mint text-white rounded"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
    <Chatbot />
  </AdminLayout>
</template>

<script>
import AdminLayout from "@/components/AdminLayout.vue";
import Chatbot from "@/components/Chatbot.vue";
import api from "@/api/api";

export default {
  name: "AdminAppointments",

  components: { AdminLayout, Chatbot },

  data() {
    return {
      appointments: [],
      searchQuery: "",
      showModal: false,
      form: {
        _id: "",
        date: "",
      },
    };
  },

  computed: {
    filteredAppointments() {
      const q = this.searchQuery.toLowerCase();
      return this.appointments.filter((a) => {
        return (
          a.userId?.name.toLowerCase().includes(q) ||
          a.providerId?.businessName.toLowerCase().includes(q) ||
          a.service.toLowerCase().includes(q)
        );
      });
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

    statusClass(status) {
      return {
        pending: "text-yellow-600 font-semibold",
        confirmed: "text-green-600 font-semibold",
        cancelled: "text-red-600 font-semibold",
      }[status];
    },

    openEditModal(appt) {
      this.form = {
        _id: appt._id,
        date: appt.date.slice(0, 16),
      };
      this.showModal = true;
    },

    closeModal() {
      this.showModal = false;
    },

    async saveChanges() {
      await api.put(`/admin/appointments/${this.form._id}`, {
        date: this.form.date,
      });
      this.showModal = false;
      this.fetchAppointments();
    },

    async changeStatus(id, status) {
      await api.put(`/admin/appointments/${id}`, { status });
      this.fetchAppointments();
    },

    async deleteAppointment(id) {
      if (!confirm("Are you sure?")) return;

      await api.delete(`/admin/appointments/${id}`);
      this.fetchAppointments();
    },
  },

  mounted() {
    this.fetchAppointments();
  },
};
</script>
