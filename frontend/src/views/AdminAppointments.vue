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
              :key="appointment.id"
              class="border-b hover:bg-neutral-light/50"
            >
              <td class="px-4 py-2">{{ appointment.client }}</td>
              <td class="px-4 py-2">{{ appointment.provider }}</td>
              <td class="px-4 py-2">{{ appointment.service }}</td>
              <td class="px-4 py-2">{{ appointment.date }}</td>
              <td class="px-4 py-2">
                <span
                  :class="[
                    'px-2 py-1 rounded-lg text-xs font-semibold',
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
                  @click="deleteAppointment(appointment.id)"
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

export default {
  name: "AdminAppointments",
  components: { AdminLayout },
  data() {
    return {
      searchQuery: "",
      appointments: [
        {
          id: 1,
          client: "Ana Pérez",
          provider: "VetClinic Center",
          service: "Veterinary",
          date: "2025-08-30 10:00",
          status: "Pending",
        },
        {
          id: 2,
          client: "Carlos Ruiz",
          provider: "Happy Pets Grooming",
          service: "Grooming",
          date: "2025-08-31 14:00",
          status: "Completed",
        },
        {
          id: 3,
          client: "María López",
          provider: "PetWalkers Co",
          service: "Walking",
          date: "2025-09-01 09:00",
          status: "Pending",
        },
      ],
    };
  },
  computed: {
    filteredAppointments() {
      if (!this.searchQuery) return this.appointments;
      return this.appointments.filter(
        (a) =>
          a.client.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          a.provider.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
  },
  methods: {
    changeStatus(appointment, newStatus) {
      appointment.status = newStatus;
    },
    deleteAppointment(id) {
      this.appointments = this.appointments.filter((a) => a.id !== id);
    },
  },
};
</script>
