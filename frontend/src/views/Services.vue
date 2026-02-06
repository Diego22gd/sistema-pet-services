<template>
  <Layout>
    <div class="px-6 max-w-7xl mx-auto w-full pt-32">
      <!-- Header de la página -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-neutral-dark mb-2">Servicios para Mascotas</h1>
        <p class="text-neutral-medium text-lg">Descubre los mejores servicios para el cuidado de tu mascota</p>
      </div>

      <!-- Barra de búsqueda y filtros -->
      <div class="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-neutral-light">
        <div class="flex flex-col md:flex-row gap-4 items-center">
          <div class="relative flex-1 w-full">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-medium">🔍</span>
            <input 
              type="text"
              v-model="searchQuery"
              placeholder="Buscar servicios por nombre o descripción..."
              class="w-full pl-10 pr-4 py-2 border border-neutral-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-mint focus:border-transparent transition-all duration-300 bg-neutral-bg"
            />
          </div>
          
          <!-- Filtros adicionales -->
          <div class="flex gap-2 w-full md:w-auto">
            <select v-model="priceFilter" class="px-3 py-2 border border-neutral-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-mint bg-white shadow-sm text-sm">
              <option value="">Todos los precios</option>
              <option value="low">$0 - $50</option>
              <option value="medium">$50 - $100</option>
              <option value="high">$100+</option>
            </select>
            
            <select v-model="categoryFilter" class="px-3 py-2 border border-neutral-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-mint bg-white shadow-sm text-sm">
              <option value="">Todas las categorías</option>
              <option value="veterinary">Veterinaria</option>
              <option value="grooming">Peluquería</option>
              <option value="training">Entrenamiento</option>
              <option value="boarding">Guardería</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Estadísticas rápidas -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <div class="bg-white rounded-lg p-3 shadow-sm border border-neutral-light">
          <div class="text-xl font-bold text-primary-mint">{{ filteredServices.length }}</div>
          <div class="text-xs text-neutral-medium">Servicios</div>
        </div>
        <div class="bg-white rounded-lg p-3 shadow-sm border border-neutral-light">
          <div class="text-xl font-bold text-secondary">{{ categoriesCount }}</div>
          <div class="text-xs text-neutral-medium">Categorías</div>
        </div>
        <div class="bg-white rounded-lg p-3 shadow-sm border border-neutral-light">
          <div class="text-xl font-bold text-state-success">{{ providersCount }}</div>
          <div class="text-xs text-neutral-medium">Proveedores</div>
        </div>
        <div class="bg-white rounded-lg p-3 shadow-sm border border-neutral-light">
          <div class="text-xl font-bold text-state-warning">{{ averagePrice }}</div>
          <div class="text-xs text-neutral-medium">Precio promedio</div>
        </div>
      </div>

      <!-- Grid de servicios -->
      <div v-if="filteredServices.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        <div 
          v-for="service in filteredServices" 
          :key="service._id" 
          class="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-neutral-light overflow-hidden group"
        >
          <!-- Badge de categoría -->
          <div class="absolute top-3 left-3">
            <span class="bg-primary-mint text-white px-2 py-1 rounded-full text-xs font-semibold">
              {{ getCategoryBadge(service.category) }}
            </span>
          </div>

          <div class="p-4 flex flex-col h-full">
            <!-- Icono del servicio -->
            <div class="w-10 h-10 bg-primary-mint/10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
              <span class="text-lg">{{ getServiceIcon(service.category) }}</span>
            </div>

            <h2 class="font-bold text-lg text-neutral-dark mb-2 group-hover:text-primary-mint transition-colors">{{ service.name }}</h2>
            <p class="text-neutral-medium text-sm mb-3 flex-grow line-clamp-2">{{ service.description }}</p>
            
            <div class="space-y-2 mb-3">
              <div class="flex justify-between items-center">
                <span class="font-semibold text-neutral-dark text-sm">Precio:</span>
                <span class="font-bold text-xl text-primary-mint">${{ service.price }} <span class="text-[10px] font-normal text-neutral-medium ml-1">al cambio BCV</span></span>
              </div>
              
              <div class="flex items-center text-xs text-neutral-medium">
                <span class="w-1.5 h-1.5 bg-state-success rounded-full mr-1"></span>
                <span>{{ service.providerName }}</span>
              </div>
            </div>

            <button 
              class="w-full bg-primary-mint text-white py-2 rounded-lg font-semibold hover:bg-state-success transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center space-x-1 text-sm"
              @click="openReservationModal(service)"
            >
              <span>Reservar</span>
              
            </button>
          </div>
        </div>
      </div>

      <!-- Estado vacío -->
      <div v-else class="text-center py-12">
        <div class="w-16 h-16 bg-neutral-light rounded-full flex items-center justify-center mx-auto mb-3">
          <span class="text-2xl">🔍</span>
        </div>
        <h3 class="text-lg font-semibold text-neutral-dark mb-1">No se encontraron servicios</h3>
        <p class="text-neutral-medium text-sm">Intenta con otros términos de búsqueda o filtros</p>
      </div>
    </div>

    <!-- Modal de Reserva Simplificado -->
    <div 
      v-if="showReservationModal"
      class="fixed inset-0 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-xl shadow-lg w-full max-w-md border border-neutral-light">
        <!-- Header del modal -->
        <div class="bg-primary-mint p-4 text-white rounded-t-xl">
          <div class="flex justify-between items-start">
            <div>
              <h2 class="text-lg font-bold mb-1">{{ selectedService.name }}</h2>
              <p class="text-sm opacity-90">{{ selectedService.description }}</p>
            </div>
            <button @click="closeReservationModal" 
                    class="text-white hover:text-neutral-light transition-colors p-1">
              
            </button>
          </div>
        </div>

        <!-- Contenido del modal -->
        <div class="p-4">
          <div class="space-y-4">
            <!-- Información del servicio -->
            <div class="bg-neutral-bg rounded-lg p-3">
              <h3 class="font-semibold text-neutral-dark mb-2 text-sm">Detalles del servicio</h3>
              <div class="space-y-1 text-xs">
                <div class="flex justify-between">
                  <span class="text-neutral-medium">Precio:</span>
                  <span class="font-bold text-primary-mint">${{ selectedService.price }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-neutral-medium">Proveedor:</span>
                  <span class="font-semibold">{{ selectedService.providerName }}</span>
                </div>
              </div>
            </div>

            <!-- Formulario de reserva -->
            <div class="space-y-3">
              <div>
                <label class="block mb-2 font-medium text-neutral-dark text-sm">
                  Selecciona tu mascota:
                </label>
                <select v-model="selectedPetId" class="w-full p-2 border border-neutral-medium rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-mint bg-white text-sm">
                  <option disabled value="">Selecciona una mascota</option>
                  <option v-for="pet in userPets" :key="pet._id" :value="pet._id">
                    {{ pet.name }} ({{ pet.type }})
                  </option>
                </select>
              </div>

              <div>
                <label class="block mb-2 font-medium text-neutral-dark text-sm">
                  Fecha de reserva:
                </label>
                <input type="date" v-model="reservationDate" class="w-full p-2 border border-neutral-medium rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-mint bg-white text-sm" />
              </div>

              <div>
                <label class="block mb-2 font-medium text-neutral-dark text-sm">
                  Hora de reserva:
                </label>
                <select v-model="reservationTime" class="w-full p-2 border border-neutral-medium rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-mint bg-white text-sm">
                  <option disabled value="">Selecciona un horario</option>
                  <option v-for="hour in availableHours" :key="hour" :value="hour">{{ hour }}</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Botones de acción -->
          <div class="flex gap-2 mt-4">
            <button 
              class="flex-1 bg-neutral-light text-neutral-dark py-2 rounded-lg font-semibold hover:bg-neutral-medium transition-all duration-300 flex items-center justify-center space-x-1 text-sm"
              @click="closeReservationModal"
            >
              
              <span>Volver</span>
            </button>
            
            <button 
              class="flex-1 bg-primary-mint text-white py-2 rounded-lg font-semibold hover:bg-state-success transition-all duration-300 flex items-center justify-center space-x-1 text-sm"
              @click="confirmReservation"
              :disabled="!isFormValid"
            >
              
              <span>Confirmar - ${{ selectedService.price }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- CHATBOT FLOTANTE -->
    <Chatbot />
  </Layout>
</template>

<script>
import Layout from "@/components/Layout.vue";
import Chatbot from "@/components/Chatbot.vue";

import { useUserStore } from "@/stores/userStore";
import api from "@/api/api";

export default {
  components: { Layout, Chatbot },

  data() {
    return {
      services: [],
      userPets: [],
      searchQuery: "",
      priceFilter: "",
      categoryFilter: "",
      showReservationModal: false,
      selectedService: null,
      reservationDate: "",
      reservationTime: "",
      selectedPetId: "",
      availableHours: ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"],
    };
  },

  computed: {
    filteredServices() {
      let filtered = this.services.filter((s) =>
        s.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(this.searchQuery.toLowerCase())
      );

      // Filtro por precio
      if (this.priceFilter === 'low') {
        filtered = filtered.filter(s => s.price < 50);
      } else if (this.priceFilter === 'medium') {
        filtered = filtered.filter(s => s.price >= 50 && s.price <= 100);
      } else if (this.priceFilter === 'high') {
        filtered = filtered.filter(s => s.price > 100);
      }

      // Filtro por categoría
      if (this.categoryFilter) {
        filtered = filtered.filter(s => s.category === this.categoryFilter);
      }

      return filtered;
    },

    categoriesCount() {
      const categories = new Set(this.services.map(s => s.category));
      return categories.size;
    },

    providersCount() {
      const providers = new Set(this.services.map(s => s.providerName));
      return providers.size;
    },

    averagePrice() {
      if (this.services.length === 0) return '$0';
      const avg = this.services.reduce((sum, s) => sum + s.price, 0) / this.services.length;
      return `$${avg.toFixed(0)}`;
    },

    isFormValid() {
      return this.selectedPetId && this.reservationDate && this.reservationTime;
    }
  },

  async created() {
    const userStore = useUserStore();
    if (!userStore.token) return this.$router.push("/login");

    try {
      const [servicesRes, petsRes] = await Promise.all([
        api.get("/client/services"),
        api.get("/pets")
      ]);

      this.services = servicesRes.data;
      this.userPets = petsRes.data;
    } catch (err) {
      console.error("Error cargando servicios:", err);
    }
  },

  methods: {
    getServiceIcon(category) {
      const icons = {
        veterinary: '🏥',
        grooming: '✂️',
        training: '🎓',
        boarding: '🏠',
        default: '🐾'
      };
      return icons[category] || icons.default;
    },

    getCategoryBadge(category) {
      const badges = {
        veterinary: 'Veterinaria',
        grooming: 'Peluquería',
        training: 'Entrenamiento',
        boarding: 'Guardería',
        default: 'Servicio'
      };
      return badges[category] || badges.default;
    },

    addUserNotification(title, message, icon) {
      const notifications = JSON.parse(localStorage.getItem('userNotifications') || '[]');
      notifications.unshift({
        id: `note_${Date.now()}`,
        title,
        message,
        icon,
        read: false,
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('userNotifications', JSON.stringify(notifications.slice(0, 20)));
    },

    openReservationModal(service) {
      this.selectedService = service;
      this.showReservationModal = true;
      // Establecer fecha mínima como hoy
      const today = new Date().toISOString().split('T')[0];
      this.reservationDate = today;
    },

    closeReservationModal() {
      this.showReservationModal = false;
      this.selectedService = null;
      this.reservationDate = "";
      this.reservationTime = "";
      this.selectedPetId = "";
    },

    async confirmReservation() {
      if (!this.isFormValid) {
        alert("Por favor, completa todos los campos requeridos");
        return;
      }

      try {
        const res = await api.post("/appointments", {
          petId: this.selectedPetId,
          serviceId: this.selectedService._id,
          date: this.reservationDate,
          time: this.reservationTime
        });

        if (res?.data?.appointment?._id) {
          const statusMap = JSON.parse(localStorage.getItem('appointmentStatusMap') || '{}');
          statusMap[res.data.appointment._id] = 'pendiente';
          localStorage.setItem('appointmentStatusMap', JSON.stringify(statusMap));
        }

        this.addUserNotification('Cita creada', 'Has creado una cita.', '📅');
        alert("✅ Reserva creada correctamente");
        this.closeReservationModal();
      } catch (error) {
        console.error("Error creando la cita:", error);
        alert(error.response?.data?.message || "Error al crear la cita");
      }
    },
  },
};
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>