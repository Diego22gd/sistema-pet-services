<template>
  <ProviderLayout>
    <div class="px-6 max-w-7xl mx-auto w-full pt-6">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-neutral-dark mb-2">Gestión de Citas</h1>
        <p class="text-neutral-medium">Administra y gestiona todas las citas de tus servicios</p>
      </div>

      <!-- Barra de herramientas -->
      <div class="mb-8 bg-white rounded-xl shadow-sm border border-neutral-light p-6">
        <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div class="relative w-full lg:w-96">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span class="text-neutral-medium">🔍</span>
            </div>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar citas por cliente, mascota o servicio..."
              class="block w-full pl-10 pr-4 py-3 border border-neutral-medium rounded-lg focus:ring-2 focus:ring-primary-mint focus:border-primary-mint transition-colors duration-200 bg-white"
            />
          </div>
          <button
            @click="showAddModal = true"
            class="flex items-center gap-2 px-6 py-3 bg-primary-mint text-white rounded-lg hover:bg-state-success focus:ring-2 focus:ring-primary-mint focus:ring-offset-2 transition-all duration-200 font-medium"
          >
            <span>+</span>
            <span>Nueva Cita</span>
          </button>
        </div>
      </div>

      <!-- Tarjetas de estadísticas -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white rounded-xl p-4 shadow-sm border border-neutral-light">
          <div class="text-2xl font-bold text-primary-mint">{{ appointments.length }}</div>
          <div class="text-sm text-neutral-medium">Total Citas</div>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm border border-neutral-light">
          <div class="text-2xl font-bold text-state-success">{{ confirmedCount }}</div>
          <div class="text-sm text-neutral-medium">Confirmadas</div>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm border border-neutral-light">
          <div class="text-2xl font-bold text-yellow-500">{{ pendingCount }}</div>
          <div class="text-sm text-neutral-medium">Pendientes</div>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm border border-neutral-light">
          <div class="text-2xl font-bold text-state-error">{{ cancelledCount }}</div>
          <div class="text-sm text-neutral-medium">Canceladas</div>
        </div>
      </div>

      <!-- Tabla de citas mejorada -->
      <div class="bg-white rounded-2xl shadow-lg border border-neutral-light overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gradient-to-r from-primary-mint to-teal-500 text-white">
              <tr>
                <th class="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Cliente</th>
                <th class="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Mascota & Servicio</th>
                <th class="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Fecha y Hora</th>
                <th class="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Estado</th>
                <th class="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-neutral-light">
              <tr
                v-for="appt in filteredAppointments"
                :key="appt._id"
                class="hover:bg-neutral-bg transition-colors duration-200 group"
              >
                <!-- Información del cliente -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="w-10 h-10 bg-primary-mint/10 rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                      <span class="text-primary-mint font-semibold text-sm">
                        {{ getInitials(appt.userId?.name, appt.userId?.lastname) }}
                      </span>
                    </div>
                    <div>
                      <div class="font-semibold text-neutral-dark">{{ appt.userId?.name }} {{ appt.userId?.lastname }}</div>
                      <div class="text-sm text-neutral-medium">{{ appt.userId?.email }}</div>
                    </div>
                  </div>
                </td>

                <!-- Mascota y servicio -->
                <td class="px-6 py-4">
                  <div class="text-sm font-medium text-neutral-dark">
                    <span class="font-semibold">🐾 {{ appt.petId?.name }}</span>
                  </div>
                  <div class="text-sm text-neutral-medium">{{ appt.serviceId?.name }}</div>
                </td>

                <!-- Fecha y hora -->
                <td class="px-6 py-4">
                  <div class="text-sm font-medium text-neutral-dark">{{ formatDate(appt.date) }}</div>
                  <div class="text-sm text-neutral-medium">{{ appt.time }}</div>
                </td>

                <!-- Estado -->
                <td class="px-6 py-4">
                  <span
                    :class="statusClass(appt.status)"
                    class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize"
                  >
                    <span 
                      class="w-2 h-2 rounded-full mr-2"
                      :class="{
                        'bg-yellow-500': appt.status === 'pending',
                        'bg-green-500': appt.status === 'confirmed',
                        'bg-red-500': appt.status === 'cancelled'
                      }"
                    ></span>
                    {{ appt.status === 'pending' ? 'Pendiente' : 
                       appt.status === 'confirmed' ? 'Confirmada' : 'Cancelada' }}
                  </span>
                </td>

                <!-- Acciones -->
                <td class="px-6 py-4">
                  <div class="flex flex-wrap gap-2">
                    <button
                      v-if="appt.status === 'pending'"
                      @click="changeStatus(appt._id, 'confirmed')"
                      class="inline-flex items-center px-3 py-2 bg-state-success text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-state-success focus:ring-offset-1 transition-colors duration-200"
                    >
                      ✅ Confirmar
                    </button>
                    <button
                      v-if="appt.status !== 'cancelled'"
                      @click="changeStatus(appt._id, 'cancelled')"
                      class="inline-flex items-center px-3 py-2 bg-state-error text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-state-error focus:ring-offset-1 transition-colors duration-200"
                    >
                      ❌ Cancelar
                    </button>
                    <button
                      v-if="appt.status === 'confirmed'"
                      @click="changeStatus(appt._id, 'pending')"
                      class="inline-flex items-center px-3 py-2 bg-yellow-500 text-white text-sm font-medium rounded-lg hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-1 transition-colors duration-200"
                    >
                      ⏳ Pendiente
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Estado vacío -->
        <div v-if="filteredAppointments.length === 0" class="text-center py-12">
          <div class="w-16 h-16 bg-neutral-light rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="text-2xl">📅</span>
          </div>
          <h3 class="text-lg font-semibold text-neutral-dark mb-2">No se encontraron citas</h3>
          <p class="text-neutral-medium">Intenta con otros términos de búsqueda o crea una nueva cita</p>
        </div>
      </div>

      <!-- Modal Nueva Cita -->
      <transition name="modal">
        <div v-if="showAddModal" class="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showAddModal = false"></div>
          <div class="bg-white rounded-2xl shadow-xl w-full max-w-md relative z-10 max-h-[90vh] overflow-hidden">
            <!-- Header del modal -->
            <div class="px-6 py-4 border-b border-neutral-light">
              <div class="flex items-center justify-between">
                <h2 class="text-xl font-semibold text-neutral-dark">Nueva Cita</h2>
                <button 
                  @click="showAddModal = false"
                  class="text-neutral-medium hover:text-neutral-dark transition-colors duration-200 p-1 rounded-lg hover:bg-neutral-bg text-2xl"
                >
                  ✕
                </button>
              </div>
            </div>

            <!-- Formulario -->
            <div class="p-6 overflow-y-auto">
              <form @submit.prevent="createAppointment" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-neutral-dark mb-2">ID del Cliente</label>
                  <input 
                    v-model="form.userId" 
                    placeholder="Ingresa el ID del cliente" 
                    class="w-full px-4 py-3 border border-neutral-medium rounded-lg focus:ring-2 focus:ring-primary-mint focus:border-primary-mint transition-colors duration-200 bg-white"
                    required
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-neutral-dark mb-2">ID de la Mascota</label>
                  <input 
                    v-model="form.petId" 
                    placeholder="Ingresa el ID de la mascota" 
                    class="w-full px-4 py-3 border border-neutral-medium rounded-lg focus:ring-2 focus:ring-primary-mint focus:border-primary-mint transition-colors duration-200 bg-white"
                    required
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-neutral-dark mb-2">ID del Servicio</label>
                  <input 
                    v-model="form.serviceId" 
                    placeholder="Ingresa el ID del servicio" 
                    class="w-full px-4 py-3 border border-neutral-medium rounded-lg focus:ring-2 focus:ring-primary-mint focus:border-primary-mint transition-colors duration-200 bg-white"
                    required
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-neutral-dark mb-2">Fecha</label>
                  <input 
                    v-model="form.date" 
                    type="date" 
                    class="w-full px-4 py-3 border border-neutral-medium rounded-lg focus:ring-2 focus:ring-primary-mint focus:border-primary-mint transition-colors duration-200 bg-white"
                    required
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-neutral-dark mb-2">Hora</label>
                  <input 
                    v-model="form.time" 
                    type="time" 
                    class="w-full px-4 py-3 border border-neutral-medium rounded-lg focus:ring-2 focus:ring-primary-mint focus:border-primary-mint transition-colors duration-200 bg-white"
                    required
                  />
                </div>

                <!-- Footer del modal -->
                <div class="flex justify-end gap-3 pt-4">
                  <button 
                    type="button" 
                    @click="showAddModal = false"
                    class="px-6 py-2.5 text-neutral-dark bg-white border border-neutral-medium rounded-lg hover:bg-neutral-bg focus:ring-2 focus:ring-neutral-medium focus:ring-offset-2 transition-all duration-200 font-medium"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    class="px-6 py-2.5 bg-primary-mint text-white rounded-lg hover:bg-state-success focus:ring-2 focus:ring-primary-mint focus:ring-offset-2 transition-all duration-200 font-medium"
                  >
                    Crear Cita
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </transition>
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
  components: { ProviderLayout, Chatbot },

  data() {
    return {
      appointments: [],
      searchQuery: "",
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

  computed: {
    filteredAppointments() {
      if (!this.searchQuery) return this.appointments;
      const query = this.searchQuery.toLowerCase();
      return this.appointments.filter(appt => 
        appt.userId?.name?.toLowerCase().includes(query) ||
        appt.userId?.lastname?.toLowerCase().includes(query) ||
        appt.petId?.name?.toLowerCase().includes(query) ||
        appt.serviceId?.name?.toLowerCase().includes(query)
      );
    },
    confirmedCount() {
      return this.appointments.filter(a => a.status === 'confirmed').length;
    },
    pendingCount() {
      return this.appointments.filter(a => a.status === 'pending').length;
    },
    cancelledCount() {
      return this.appointments.filter(a => a.status === 'cancelled').length;
    }
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
        await this.loadAppointments();
      } catch (err) {
        console.error("Error updating status:", err);
        alert("Error al actualizar el estado de la cita");
      }
    },

    statusClass(status) {
      return {
        'pending': 'bg-yellow-100 text-yellow-800',
        'confirmed': 'bg-green-100 text-green-800',
        'cancelled': 'bg-red-100 text-red-800'
      }[status] || "bg-gray-100 text-gray-800";
    },

    formatDate(date) {
      if (!date) return '-';
      return new Date(date).toLocaleDateString('es-VE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },

    getInitials(name, lastname) {
      return `${name?.charAt(0) || ''}${lastname?.charAt(0) || ''}`.toUpperCase();
    },

    async createAppointment() {
      try {
        await api.post("/provider/appointments", this.form);
        this.showAddModal = false;
        
        // Reset form
        this.form = {
          userId: "",
          petId: "",
          serviceId: "",
          date: "",
          time: ""
        };

        await this.loadAppointments();
      } catch (err) {
        console.error("Error creating appointment:", err);
        alert("Error al crear la cita");
      }
    }
  }
};
</script>

<style scoped>
.bg-neutral-bg {
  background-color: #f8fafc;
}

.border-neutral-light {
  border-color: #e2e8f0;
}

.border-neutral-medium {
  border-color: #cbd5e1;
}

.text-neutral-dark {
  color: #1e293b;
}

.text-neutral-medium {
  color: #64748b;
}

.bg-primary-mint {
  background-color: #0d9488;
}

.hover\:bg-state-success:hover {
  background-color: #059669;
}

.bg-state-error {
  background-color: #dc2626;
}

.hover\:bg-red-700:hover {
  background-color: #b91c1c;
}

.focus\:ring-primary-mint:focus {
  --tw-ring-color: #0d9488;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .bg-white,
.modal-leave-active .bg-white {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-enter-from .bg-white {
  transform: scale(0.95);
  opacity: 0;
}

.modal-leave-to .bg-white {
  transform: scale(0.95);
  opacity: 0;
}
</style>