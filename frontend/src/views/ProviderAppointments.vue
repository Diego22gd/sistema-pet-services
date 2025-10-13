<template>
  <ProviderLayout>
    <div class="px-6 max-w-6xl mx-auto w-full pt-4">
      <h1 class="text-2xl font-bold mb-6 text-neutral-dark">Citas del Día</h1>

      <!-- Tabla de citas -->
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
              v-for="appointment in appointments" 
              :key="appointment.id" 
              class="border-b hover:bg-neutral-light/50 transition"
            >
              <td class="px-4 py-3">{{ appointment.client }}</td>
              <td class="px-4 py-3">{{ appointment.pet }}</td>
              <td class="px-4 py-3">{{ appointment.service }}</td>
              <td class="px-4 py-3">{{ appointment.date }}</td>
              <td class="px-4 py-3">{{ appointment.time }}</td>
              <td class="px-4 py-3">
                <span 
                  :class="statusClass(appointment.status)" 
                  class="px-3 py-1 rounded-full text-xs font-medium"
                >
                  {{ appointment.status }}
                </span>
              </td>
              <td class="px-4 py-3 text-center space-x-2">
                <button 
                  @click="updateStatus(appointment.id, 'Lista')" 
                  class="px-3 py-1 text-xs rounded-lg bg-green-500 text-white hover:bg-green-600"
                >
                  Marcar Lista
                </button>
                <button 
                  @click="updateStatus(appointment.id, 'Cancelada')" 
                  class="px-3 py-1 text-xs rounded-lg bg-red-500 text-white hover:bg-red-600"
                >
                  Cancelar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </ProviderLayout>
</template>

<script>
import ProviderLayout from "@/components/ProviderLayout.vue";

export default {
  name: "ProviderAppointments",
  components: { ProviderLayout },
  data() {
    return {
      appointments: [
        { id: 1, client: "Juan Pérez", pet: "Firulais", service: "Consulta", date: "2025-08-26", time: "10:00", status: "Pendiente" },
        { id: 2, client: "Ana Gómez", pet: "Mishi", service: "Vacunación", date: "2025-08-26", time: "11:30", status: "Lista" },
        { id: 3, client: "Carlos Ruiz", pet: "Max", service: "Peluquería", date: "2025-08-26", time: "13:00", status: "Cancelada" },
      ]
    };
  },
  methods: {
    statusClass(status) {
      switch (status) {
        case "Pendiente":
          return "bg-yellow-200 text-yellow-800";
        case "Lista":
          return "bg-green-200 text-green-800";
        case "Cancelada":
          return "bg-red-200 text-red-800";
        default:
          return "bg-gray-200 text-gray-800";
      }
    },
    updateStatus(id, newStatus) {
      const appointment = this.appointments.find(a => a.id === id);
      if (appointment) {
        appointment.status = newStatus;
      }
    }
  }
};
</script>
