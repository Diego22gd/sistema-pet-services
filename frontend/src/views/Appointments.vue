<template>
  <Layout>
    <div class="p-6 max-w-4xl mx-auto bg-neutral-bg min-h-[80vh]">
      <h1 class="text-2xl font-bold mb-6 text-neutral-dark">Mis Citas</h1>

      <!-- Filtro por mascota -->
      <div class="mb-6 flex items-center gap-4">
        <label class="text-neutral-dark font-medium">Filtrar por mascota:</label>
        <select v-model="selectedPet" class="px-3 py-2 border border-neutral-medium rounded-lg focus:ring-2 focus:ring-secondary focus:outline-none">
          <option value="">Todas las mascotas</option>
          <option v-for="pet in pets" :key="pet.id" :value="pet.id">{{ pet.name }}</option>
        </select>
      </div>

      <div v-if="filteredAppointments.length === 0" class="text-neutral-medium">
        No tienes citas programadas.
      </div>

      <ul v-else class="space-y-4">
        <li 
          v-for="appointment in filteredAppointments" 
          :key="appointment.id" 
          class="bg-white shadow-lg rounded-2xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center hover:shadow-2xl transition"
        >
          <!-- Información principal -->
          <div class="flex items-center gap-4 mb-2 md:mb-0">
            <img :src="appointment.pet.image" alt="Mascota" class="w-16 h-16 object-cover rounded-full border border-neutral-medium"/>
            <div>
              <p class="font-semibold text-lg text-neutral-dark">{{ appointment.serviceName }}</p>
              <p class="text-neutral-medium text-sm">Mascota: {{ appointment.pet.name }} ({{ appointment.pet.type }})</p>
              <p class="text-neutral-medium text-sm">{{ appointment.date }} a las {{ appointment.time }}</p>
              <p class="text-neutral-medium text-sm">
                Estado: 
                <span :class="appointment.status === 'Confirmada' ? 'text-state-success' : 'text-warning'">
                  {{ appointment.status }}
                </span>
              </p>
            </div>
          </div>

          <!-- Botones -->
          <div class="flex gap-2 mt-2 md:mt-0">
            <button 
              class="px-3 py-1 bg-state-error text-white rounded-lg hover:opacity-90 transition"
              @click="cancelAppointment(appointment.id)"
            >
              Cancelar
            </button>
            <button 
              class="px-3 py-1 bg-primary-mint text-white rounded-lg hover:bg-state-success transition"
              @click="rescheduleAppointment(appointment.id)"
            >
              Reprogramar
            </button>
            <button 
              class="px-3 py-1 bg-secondary text-white rounded-lg hover:bg-secondary-dark transition"
              @click="viewDetails(appointment)"
            >
              Más Información
            </button>
          </div>
        </li>
      </ul>

      <!-- Modal para reprogramar cita -->
      <div v-if="showModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div class="bg-neutral-light rounded-xl p-6 w-96 relative">
          <h2 class="text-xl font-bold mb-4 text-neutral-dark">Reprogramar: {{ selectedAppointment.serviceName }}</h2>

          <label class="block mb-2 text-sm font-medium text-neutral-dark">Nueva Fecha:</label>
          <input type="date" v-model="newDate" class="w-full p-2 border border-neutral-medium rounded mb-4 focus:ring-2 focus:ring-secondary focus:outline-none">

          <label class="block mb-2 text-sm font-medium text-neutral-dark">Nueva Hora:</label>
          <input type="time" v-model="newTime" class="w-full p-2 border border-neutral-medium rounded mb-4 focus:ring-2 focus:ring-secondary focus:outline-none">

          <div class="flex justify-end gap-2">
            <button class="px-4 py-2 rounded bg-neutral-medium text-white hover:bg-neutral-dark transition" @click="closeModal">Cancelar</button>
            <button class="px-4 py-2 rounded bg-primary-mint text-white hover:bg-state-success transition" @click="confirmReschedule">Confirmar</button>
          </div>

          <button class="absolute top-2 right-2 text-neutral-medium hover:text-neutral-dark" @click="closeModal">✕</button>
        </div>
      </div>

      <!-- Modal de detalles de la cita -->
      <div v-if="showDetailsModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 overflow-auto">
        <div class="bg-neutral-light rounded-2xl p-6 w-full max-w-3xl relative">
          <h2 class="text-2xl font-bold mb-2 text-neutral-dark">{{ selectedAppointment.serviceName }} - {{ selectedAppointment.pet.name }}</h2>
          <p class="text-neutral-medium mb-2"><strong>Tipo de mascota:</strong> {{ selectedAppointment.pet.type }}</p>
          <p class="text-neutral-medium mb-2"><strong>Fecha y hora:</strong> {{ selectedAppointment.date }} a las {{ selectedAppointment.time }}</p>
          <p class="text-neutral-medium mb-2"><strong>Ubicación:</strong> {{ selectedAppointment.location }}</p>
          <p class="text-neutral-medium mb-4"><strong>Detalles:</strong> {{ selectedAppointment.details }}</p>

          <!-- Carousel de fotos -->
          <div class="flex overflow-x-auto gap-4 mb-4">
            <img v-for="(img, idx) in selectedAppointment.images" :key="idx" :src="img" class="w-48 h-32 object-cover rounded-lg flex-shrink-0">
          </div>

          <div class="flex justify-end">
            <button class="px-4 py-2 rounded bg-primary-mint text-white hover:bg-state-success transition" @click="closeDetailsModal">Cerrar</button>
          </div>

          <button class="absolute top-2 right-2 text-neutral-medium hover:text-neutral-dark" @click="closeDetailsModal">✕</button>
        </div>
      </div>

    </div>
  </Layout>
</template>

<script>
import Layout from "@/components/Layout.vue";

export default {
  name: "Appointments",
  components: { Layout },
  data() {
    return {
      pets: [
        { id: 1, name: "Firulais", type: "Perro", image: "https://place-puppy.com/100x100" },
        { id: 2, name: "Misu", type: "Gato", image: "https://placekitten.com/100/100" },
      ],
      selectedPet: "",
      appointments: [
        {
          id: 1,
          serviceName: "Baño y peluquería",
          date: "2025-08-25",
          time: "10:00",
          status: "Confirmada",
          pet: { id: 1, name: "Firulais", type: "Perro", image: "https://place-puppy.com/100x100" },
          location: "Calle Falsa 123",
          details: "Baño completo, corte de pelo y limpieza de oídos.",
          images: ["https://place-puppy.com/300x200", "https://place-puppy.com/301x200"]
        },
        {
          id: 2,
          serviceName: "Vacunación",
          date: "2025-08-28",
          time: "15:30",
          status: "Pendiente",
          pet: { id: 2, name: "Misu", type: "Gato", image: "https://placekitten.com/100/100" },
          location: "Av. Siempre Viva 456",
          details: "Vacunas anuales y revisión general.",
          images: ["https://placekitten.com/300/200", "https://placekitten.com/301/200"]
        },
      ],
      showModal: false,
      selectedAppointment: null,
      newDate: "",
      newTime: "",
      showDetailsModal: false
    }
  },
  computed: {
    filteredAppointments() {
      if (!this.selectedPet) return this.appointments;
      return this.appointments.filter(a => a.pet.id === this.selectedPet);
    }
  },
  methods: {
    cancelAppointment(id) {
      this.appointments = this.appointments.filter(a => a.id !== id);
      alert(`Cita ID ${id} cancelada`);
    },
    rescheduleAppointment(id) {
      this.selectedAppointment = this.appointments.find(a => a.id === id);
      this.newDate = this.selectedAppointment.date;
      this.newTime = this.selectedAppointment.time;
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
      this.selectedAppointment = null;
      this.newDate = "";
      this.newTime = "";
    },
    confirmReschedule() {
      if (!this.newDate || !this.newTime) {
        alert("Selecciona fecha y hora para reprogramar");
        return;
      }
      this.selectedAppointment.date = this.newDate;
      this.selectedAppointment.time = this.newTime;
      alert(`Cita ID ${this.selectedAppointment.id} reprogramada a ${this.newDate} a las ${this.newTime}`);
      this.closeModal();
    },
    viewDetails(appointment) {
      this.selectedAppointment = appointment;
      this.showDetailsModal = true;
    },
    closeDetailsModal() {
      this.showDetailsModal = false;
      this.selectedAppointment = null;
    }
  }
}
</script>
