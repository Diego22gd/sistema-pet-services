<template>
  <ProviderLayout>
    <div class="px-6 max-w-6xl mx-auto w-full pt-4">

      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-neutral-dark">Citas del Proveedor</h1>

        <button
          @click="showAddModal = true"
          class="px-4 py-2 bg-primary-mint text-white rounded-lg shadow hover:bg-primary-hover"
        >
          + Nueva Cita
        </button>
      </div>

      <!-- Tabla -->
      <div class="bg-neutral-light rounded-2xl shadow-lg overflow-hidden">
        <table class="w-full text-left border-collapse">
          <thead class="bg-primary-mint text-white">
            <tr>
              <th class="px-4 py-3">Cliente</th>
              <th class="px-4 py-3">Mascota</th>
              <th class="px-4 py-3">Servicio</th>
              <th class="px-4 py-3">Fecha</th>
              <th class="px-4 py-3">Hora</th>
              <th class="px-4 py-3">Estado</th>
              <th class="px-4 py-3 text-center">Acciones</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="appt in appointments"
              :key="appt._id"
              class="border-b hover:bg-neutral-light/50 transition"
            >
              <td class="px-4 py-3">
                {{ appt.userId?.name }} {{ appt.userId?.lastname }}
                <br />
                <small>{{ appt.userId?.email }}</small>
              </td>

              <td class="px-4 py-3">{{ appt.petId?.name }}</td>

              <td class="px-4 py-3">{{ appt.serviceId?.name }}</td>

              <td class="px-4 py-3">{{ formatDate(appt.date) }}</td>

              <td class="px-4 py-3">{{ appt.time }}</td>

              <td class="px-4 py-3">
                <span :class="statusClass(appt.status)"
                      class="px-3 py-1 rounded-full text-xs font-medium">
                  {{ appt.status }}
                </span>
              </td>

              <td class="px-4 py-3 text-center space-x-2">
                <button
                  @click="changeStatus(appt._id, 'confirmed')"
                  class="px-3 py-1 text-xs rounded-lg bg-green-500 text-white hover:bg-green-600"
                >
                  Confirmar
                </button>

                <button
                  @click="changeStatus(appt._id, 'cancelled')"
                  class="px-3 py-1 text-xs rounded-lg bg-red-500 text-white hover:bg-red-600"
                >
                  Cancelar
                </button>
              </td>
            </tr>

            <tr v-if="appointments.length === 0">
              <td colspan="7" class="px-4 py-3 text-center text-neutral-medium">
                No hay citas disponibles.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal Nueva Cita -->
      <div
        v-if="showAddModal"
        class="fixed inset-0 bg-black/40 flex justify-center items-center z-50"
      >
        <div class="bg-white p-6 rounded-xl w-96 shadow-xl">
          <h2 class="text-xl font-bold mb-4">Nueva Cita</h2>

          <input v-model="form.userId" placeholder="ID del cliente" class="input mb-2" />
          <input v-model="form.petId" placeholder="ID de la mascota" class="input mb-2" />
          <input v-model="form.serviceId" placeholder="ID del servicio" class="input mb-2" />
          <input v-model="form.date" type="date" class="input mb-2" />
          <input v-model="form.time" type="time" class="input mb-4" />

          <div class="flex justify-end space-x-2">
            <button @click="showAddModal = false" class="px-3 py-2">
              Cancelar
            </button>

            <button @click="createAppointment"
                    class="px-4 py-2 bg-primary-mint text-white rounded-lg">
              Guardar
            </button>
          </div>
        </div>
      </div>

    </div>
     <Chatbot />
  </ProviderLayout>
</template>

<script>
import api from "@/api/api";
import ProviderLayout from "@/components/ProviderLayout.vue";
import Chatbot from "@/components/Chatbot.vue";

export default {
  name: "ProviderAppointments",
  components: { ProviderLayout , Chatbot},

  data() {
    return {
      appointments: [],
      showAddModal: false,
      form: {
        userId: "",
        petId: "",
        serviceId: "",
        date: "",
        time: ""
      }
    };
  },

  async mounted() {
    await this.loadAppointments();
  },

  methods: {
    async loadAppointments() {
      try {
        const res = await api.get("/provider/appointments");
        this.appointments = res.data;
      } catch (err) {
        console.error("Error loading provider appointments:", err);
      }
    },

    async changeStatus(id, status) {
      try {
        await api.put(`/provider/appointments/${id}`, { status });
        this.loadAppointments();
      } catch (err) {
        console.error("Error updating status:", err);
      }
    },

    statusClass(status) {
      return {
        pending: "bg-yellow-200 text-yellow-800",
        confirmed: "bg-green-200 text-green-800",
        cancelled: "bg-red-200 text-red-800"
      }[status] || "bg-gray-200 text-gray-800";
    },

    formatDate(date) {
      return new Date(date).toLocaleDateString();
    },

    async createAppointment() {
      try {
        await api.post("/provider/appointments", this.form);
        this.showAddModal = false;

        this.form = {
          userId: "",
          petId: "",
          serviceId: "",
          date: "",
          time: ""
        };

        this.loadAppointments();
      } catch (err) {
        console.error("Error creating appointment:", err);
      }
    }
  }
};
</script>

<style>
.input {
  @apply w-full border rounded-lg px-3 py-2 mb-2;
}
</style>
