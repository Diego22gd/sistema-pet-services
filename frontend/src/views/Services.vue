<template>
  <Layout>
    <div class="px-6 max-w-7xl mx-auto w-full pt-32">
      <h1 class="text-2xl font-bold mb-4 text-neutral-dark">Servicios para Mascotas</h1>

      <!-- Barra de búsqueda -->
      <div class="flex flex-col md:flex-row gap-4 mb-6 items-center">
        <div class="relative flex-1 w-full">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-medium">🔍</span>
          <input 
            type="text"
            v-model="searchQuery"
            placeholder="Buscar servicios..."
            class="w-full pl-10 pr-4 py-2 border border-neutral-medium rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary transition"
          />
        </div>
      </div>

      <!-- Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <div 
          v-for="service in filteredServices" 
          :key="service._id" 
          class="bg-neutral-light rounded-2xl shadow-lg p-4 hover:shadow-xl transition flex flex-col"
        >
          <h2 class="font-semibold text-lg text-neutral-dark">{{ service.name }}</h2>
          <p class="text-neutral-medium text-sm mb-2">{{ service.description }}</p>
          <p class="font-bold text-primary-mint">${{ service.price }}</p>
          <p class="text-xs text-neutral-dark mb-4">Proveedor: {{ service.providerName }}</p>

          <div class="mt-auto flex flex-col gap-2">
            <button 
              class="w-full bg-secondary text-white py-1 rounded-lg hover:bg-secondary-dark transition"
              @click="openReservationModal(service)"
            >
              Reservar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de reserva -->
    <div v-if="showReservationModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl shadow-lg w-full max-w-xl p-6 relative">
        <button @click="closeReservationModal" class="absolute top-3 right-3 text-neutral-medium hover:text-neutral-dark">✕</button>

        <h2 class="text-2xl font-bold mb-2 text-neutral-dark">Reservar: {{ selectedService.name }}</h2>
        <p class="text-neutral-dark mb-4">Precio: ${{ selectedService.price }}</p>

        <!-- Seleccionar mascota -->
        <label class="block mb-2 font-medium text-neutral-dark">Selecciona tu mascota:</label>
        <select v-model="selectedPetId" class="w-full p-2 border border-neutral-medium rounded mb-4">
          <option disabled value="">Selecciona una mascota</option>
          <option v-for="pet in userPets" :key="pet._id" :value="pet._id">
            {{ pet.name }} ({{ pet.type }})
          </option>
        </select>

        <label class="block mb-2 font-medium text-neutral-dark">Fecha:</label>
        <input type="date" v-model="reservationDate" class="w-full p-2 border border-neutral-medium rounded mb-4">

        <label class="block mb-2 font-medium text-neutral-dark">Hora:</label>
        <select v-model="reservationTime" class="w-full p-2 border border-neutral-medium rounded mb-4">
          <option disabled value="">Selecciona un horario</option>
          <option v-for="hour in availableHours" :key="hour" :value="hour">{{ hour }}</option>
        </select>

        <button 
          class="w-full bg-primary-mint text-white py-2 rounded-lg hover:bg-state-success transition"
          @click="confirmReservation"
        >
          Confirmar
        </button>
      </div>
    </div>
  </Layout>
</template>

<script>
import Layout from '@/components/Layout.vue'
import api from '@/api/api'
import { useUserStore } from '@/stores/userStore'

export default {
  name: "Services",
  components: { Layout },
  data() {
    return {
      services: [],
      userPets: [],
      searchQuery: "",
      showReservationModal: false,
      selectedService: null,
      reservationDate: "",
      reservationTime: "",
      selectedPetId: "",
      availableHours: ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00"],
    }
  },

  computed: {
    filteredServices() {
      return this.services.filter(s =>
        s.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(this.searchQuery.toLowerCase())
      )
    }
  },

  async created() {
    const userStore = useUserStore()
    const token = userStore.token

    if (!token) return this.$router.push('/login')

    try {
      const servicesRes = await api.get('/client/services')
      const petsRes = await api.get('/pets', {
        headers: { Authorization: `Bearer ${token}` }
      })

      this.services = servicesRes.data
      this.userPets = petsRes.data

    } catch (error) {
      console.error("Error cargando datos:", error)
    }
  },

  methods: {
    openReservationModal(service) {
      this.selectedService = service
      this.showReservationModal = true
    },

    closeReservationModal() {
      this.showReservationModal = false
      this.selectedService = null
      this.reservationDate = ""
      this.reservationTime = ""
      this.selectedPetId = ""
    },

    async confirmReservation() {
      if (!this.selectedPetId || !this.reservationDate || !this.reservationTime) {
        alert("Completa todos los campos");
        return;
      }

      const userStore = useUserStore();
      const token = userStore.token;

      try {
        await api.post(
          "/appointments",
          {
            petId: this.selectedPetId,
            serviceId: this.selectedService._id,
            date: this.reservationDate,
            time: this.reservationTime
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        alert("Reserva exitosa");
        this.closeReservationModal();

      } catch (error) {
        console.error(error);
        alert("Error al crear la reserva");
      }
    }
  }
}
</script>
