<template>
  <Layout>
    <div class="px-6 max-w-7xl mx-auto w-full pt-32">
      <h1 class="text-2xl font-bold mb-4 text-neutral-dark">Servicios para Mascotas</h1>

      <!-- Barra de búsqueda y filtros -->
      <div class="flex flex-col md:flex-row gap-4 mb-6 items-center">
        <div class="relative flex-1 w-full">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-medium">🔍</span>
          <input 
            type="text"
            v-model="searchQuery"
            placeholder="Buscar servicios o empresas..."
            class="w-full pl-10 pr-4 py-2 border border-neutral-medium rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary transition"
          />
        </div>
        <select v-model="filterType" class="w-full md:w-60 px-4 py-2 border border-neutral-medium rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary transition">
          <option value="">Todos los servicios</option>
          <option>Veterinaria</option>
          <option>Peluquería</option>
          <option>Guardería</option>
          <option>Tienda de mascotas</option>
          <option>Adiestramiento</option>
        </select>
      </div>

      <!-- Grid de servicios -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <div 
          v-for="service in filteredServices" 
          :key="service.id" 
          class="bg-neutral-light rounded-2xl shadow-lg p-4 hover:shadow-xl transition flex flex-col"
        >
          <img :src="service.image" alt="" class="w-full h-40 object-cover rounded-xl mb-2">
          <h2 class="font-semibold text-lg text-neutral-dark">{{ service.name }}</h2>
          <p class="text-neutral-medium text-sm mb-2">{{ service.shortDescription }}</p>
          <p class="font-bold text-primary-mint">${{ service.price }}</p>
          <div class="mt-auto flex flex-col gap-2">
            <button 
              class="w-full bg-secondary text-white py-1 rounded-lg hover:bg-secondary-dark transition"
              @click="openReservationModal(service)"
            >
              Reservar
            </button>
            <button
              class="w-full border border-primary-mint text-primary-mint py-1 rounded-lg hover:bg-primary-mint hover:text-white transition"
              @click="openInfoModal(service)"
            >
              Más información
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de información con carrusel -->
    <div v-if="showInfoModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl shadow-lg w-full max-w-3xl p-6 relative overflow-y-auto max-h-[90vh]">
        <button @click="closeInfoModal" class="absolute top-3 right-3 text-neutral-medium hover:text-neutral-dark">✕</button>
        <h2 class="text-2xl font-bold text-primary mb-2">{{ selectedService.name }}</h2>
        <p class="text-neutral-dark font-semibold mb-2">{{ selectedService.serviceType }}</p>
        <p class="text-neutral-medium mb-2">Ubicación: {{ selectedService.location }}</p>
        <p class="text-neutral-dark mb-4">{{ selectedService.fullDescription }}</p>

        <!-- Carrusel -->
        <div class="relative">
          <img :src="selectedService.images[currentImageIndex]" class="w-full h-64 object-cover rounded-lg mb-4 transition duration-500">
          <button @click="prevImage" class="absolute left-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 p-2 rounded-full hover:bg-opacity-90 transition">‹</button>
          <button @click="nextImage" class="absolute right-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 p-2 rounded-full hover:bg-opacity-90 transition">›</button>
        </div>
      </div>
    </div>

    <!-- Modal de reserva con selección de mascota -->
    <div v-if="showReservationModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl shadow-lg w-full max-w-xl p-6 relative overflow-y-auto max-h-[90vh]">
        <button @click="closeReservationModal" class="absolute top-3 right-3 text-neutral-medium hover:text-neutral-dark">✕</button>
        <h2 class="text-2xl font-bold mb-2 text-neutral-dark">Reservar: {{ selectedService.name }}</h2>
        <p class="text-neutral-dark mb-4">Precio: ${{ selectedService.price }}</p>

        <!-- Seleccionar mascota -->
        <label class="block mb-2 font-medium text-neutral-dark">Selecciona tu mascota:</label>
        <select v-model="selectedPetId" class="w-full p-2 border border-neutral-medium rounded mb-4 focus:ring-2 focus:ring-secondary focus:outline-none">
          <option disabled value="">Selecciona una mascota</option>
          <option v-for="pet in userPets" :key="pet.id" :value="pet.id">{{ pet.name }} ({{ pet.species }})</option>
        </select>

        <label class="block mb-2 font-medium text-neutral-dark">Fecha:</label>
        <input type="date" v-model="reservationDate" class="w-full p-2 border border-neutral-medium rounded mb-4 focus:ring-2 focus:ring-secondary focus:outline-none">

        <label class="block mb-2 font-medium text-neutral-dark">Hora:</label>
        <select v-model="reservationTime" class="w-full p-2 border border-neutral-medium rounded mb-4 focus:ring-2 focus:ring-secondary focus:outline-none">
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
import Layout from '@/components/Layout.vue';

export default {
  name: "Services",
  components: { Layout },
  data() {
    return {
      services: [
        {
          id: 1,
          name: "Baño y Peluquería Patitas Felices",
          shortDescription: "Servicio completo de baño y corte de pelo para tu mascota.",
          fullDescription: "Incluye baño, corte de pelo, limpieza de oídos y cepillado. Personal altamente capacitado.",
          price: 25,
          serviceType: "Peluquería",
          location: "Calle Falsa 123, Ciudad",
          image: "https://place-puppy.com/300x200",
          images: ["https://place-puppy.com/300x200","https://place-puppy.com/301x200"]
        },
        {
          id: 2,
          name: "Vacunación Veterinaria Salud Animal",
          shortDescription: "Vacunas anuales para mantener a tu mascota protegida.",
          fullDescription: "Administramos todas las vacunas requeridas según la edad y especie de tu mascota. Veterinarios certificados.",
          price: 40,
          serviceType: "Veterinaria",
          location: "Av. Principal 45, Ciudad",
          image: "https://place-puppy.com/301x200",
          images: ["https://place-puppy.com/301x200","https://place-puppy.com/302x200"]
        },
        {
          id: 3,
          name: "Consulta Veterinaria Salud Animal",
          shortDescription: "Chequeo completo y asesoramiento veterinario.",
          fullDescription: "Incluye examen físico completo, diagnóstico y plan de salud personalizado.",
          price: 50,
          serviceType: "Veterinaria",
          location: "Av. Secundaria 67, Ciudad",
          image: "https://place-puppy.com/302x200",
          images: ["https://place-puppy.com/302x200","https://place-puppy.com/303x200"]
        },
      ],
      searchQuery: "",
      filterType: "",
      showInfoModal: false,
      showReservationModal: false,
      selectedService: null,
      reservationDate: "",
      reservationTime: "",
      selectedPetId: "",
      availableHours: ["09:00","10:00","11:00","12:00","14:00","15:00","16:00"],
      currentImageIndex: 0,
      userPets: [
        { id: 1, name: "Firulais", species: "Perro" },
        { id: 2, name: "Mishi", species: "Gato" }
      ]
    }
  },
  computed: {
    filteredServices() {
      return this.services.filter(service => {
        const matchesSearch = service.name.toLowerCase().includes(this.searchQuery.toLowerCase()) 
          || service.shortDescription.toLowerCase().includes(this.searchQuery.toLowerCase());
        const matchesType = this.filterType ? service.serviceType === this.filterType : true;
        return matchesSearch && matchesType;
      });
    }
  },
  methods: {
    openInfoModal(service) {
      this.selectedService = service;
      this.currentImageIndex = 0;
      this.showInfoModal = true;
    },
    closeInfoModal() {
      this.showInfoModal = false;
      this.selectedService = null;
      this.currentImageIndex = 0;
    },
    prevImage() {
      if (this.selectedService && this.selectedService.images.length > 0) {
        this.currentImageIndex = (this.currentImageIndex - 1 + this.selectedService.images.length) % this.selectedService.images.length;
      }
    },
    nextImage() {
      if (this.selectedService && this.selectedService.images.length > 0) {
        this.currentImageIndex = (this.currentImageIndex + 1) % this.selectedService.images.length;
      }
    },
    openReservationModal(service) {
      this.selectedService = service;
      this.showReservationModal = true;
    },
    closeReservationModal() {
      this.showReservationModal = false;
      this.selectedService = null;
      this.reservationDate = "";
      this.reservationTime = "";
      this.selectedPetId = "";
    },
    confirmReservation() {
      if(!this.selectedPetId) {
        alert("Selecciona una mascota para la reserva.");
        return;
      }
      if(!this.reservationDate || !this.reservationTime) {
        alert("Por favor selecciona fecha y horario.");
        return;
      }
      const pet = this.userPets.find(p => p.id === this.selectedPetId);
      alert(`Has reservado "${this.selectedService.name}" para ${pet.name} (${pet.species}) el ${this.reservationDate} a las ${this.reservationTime}`);
      this.closeReservationModal();
    }
  }
}
</script>
