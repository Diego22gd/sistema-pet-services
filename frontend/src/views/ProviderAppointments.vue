<template>
  <ProviderLayout>
    <div class="px-6 max-w-6xl mx-auto w-full pt-4">

      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-neutral-dark">Citas del Día</h1>

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
              v-for="a in appointments" 
              :key="a._id"
              class="border-b hover:bg-neutral-light/50 transition"
            >
              <td class="px-4 py-3">{{ a.clientId?.name }}</td>
              <td class="px-4 py-3">{{ a.petName }}</td>
              <td class="px-4 py-3">{{ a.service }}</td>
              <td class="px-4 py-3">{{ a.date }}</td>
              <td class="px-4 py-3">{{ a.time }}</td>

              <td class="px-4 py-3">
                <span :class="statusClass(a.status)" class="px-3 py-1 rounded-full text-xs font-medium">
                  {{ a.status }}
                </span>
              </td>

              <td class="px-4 py-3 text-center space-x-2">
                <button 
                  @click="changeStatus(a._id, 'Lista')"
                  class="px-3 py-1 text-xs rounded-lg bg-green-500 text-white hover:bg-green-600"
                >
                  Lista
                </button>
                <button
                  @click="changeStatus(a._id, 'Cancelada')"
                  class="px-3 py-1 text-xs rounded-lg bg-red-500 text-white hover:bg-red-600"
                >
                  Cancelar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal Nueva Cita -->
      <div v-if="showAddModal" class="fixed inset-0 bg-black/40 flex justify-center items-center">
        <div class="bg-white p-6 rounded-xl w-96 shadow-xl">
          <h2 class="text-xl font-bold mb-4">Nueva Cita</h2>

          <input v-model="form.clientId" placeholder="ID del cliente" class="input mb-2" />
          <input v-model="form.petName" placeholder="Nombre de la mascota" class="input mb-2" />
          <input v-model="form.service" placeholder="Servicio" class="input mb-2" />
          <input v-model="form.date" type="date" class="input mb-2" />
          <input v-model="form.time" type="time" class="input mb-4" />

          <div class="flex justify-end space-x-2">
            <button @click="showAddModal = false" class="px-3 py-2">Cancelar</button>
            <button @click="createAppointment" class="px-4 py-2 bg-primary-mint text-white rounded-lg">Guardar</button>
          </div>
        </div>
      </div>

    </div>
  </ProviderLayout>
</template>

<script>
import api from "@/api/api";
import ProviderLayout from "@/components/ProviderLayout.vue";

export default {
  name: "ProviderAppointments",
  components: { ProviderLayout },

  data() {
    return {
      appointments: [],
      showAddModal: false,
      form: {
        clientId: "",
        petName: "",
        service: "",
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
      const providerId = localStorage.getItem("userId");

      const res = await api.get(`/provider-appointments/${providerId}`);
      this.appointments = res.data;
    },

    async changeStatus(id, status) {
      await api.put(`/provider-appointments/${id}`, { status });
      this.loadAppointments();
    },

    statusClass(status) {
      return {
        "Pendiente": "bg-yellow-200 text-yellow-800",
        "Lista": "bg-green-200 text-green-800",
        "Cancelada": "bg-red-200 text-red-800"
      }[status];
    },

    async createAppointment() {
      const providerId = localStorage.getItem("userId");

      await api.post("/provider-appointments", {
        providerId,
        ...this.form
      });

      this.showAddModal = false;
      this.loadAppointments();
    }
  }
};
</script>

<style>
.input {
  @apply w-full border rounded-lg px-3 py-2 mb-2;
}
</style>
