<template>
  <ProviderLayout>
    <div class="px-6 max-w-7xl mx-auto w-full pt-6">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-neutral-dark mb-2">Gestión de Servicios</h1>
        <p class="text-neutral-medium">Administra y gestiona todos tus servicios</p>
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
              placeholder="Buscar servicios por nombre o descripción..."
              class="block w-full pl-10 pr-4 py-3 border border-neutral-medium rounded-lg focus:ring-2 focus:ring-primary-mint focus:border-primary-mint transition-colors duration-200 bg-white"
            />
          </div>
          <button
            @click="openAddModal"
            class="flex items-center gap-2 px-6 py-3 bg-primary-mint text-white rounded-lg hover:bg-state-success focus:ring-2 focus:ring-primary-mint focus:ring-offset-2 transition-all duration-200 font-medium"
          >
            <span>+</span>
            <span>Agregar Servicio</span>
          </button>
        </div>
      </div>

      <!-- Tarjetas de estadísticas -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white rounded-xl p-4 shadow-sm border border-neutral-light">
          <div class="text-2xl font-bold text-primary-mint">{{ services.length }}</div>
          <div class="text-sm text-neutral-medium">Total Servicios</div>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm border border-neutral-light">
          <div class="text-2xl font-bold text-state-success">{{ approvedCount }}</div>
          <div class="text-sm text-neutral-medium">Aprobados</div>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm border border-neutral-light">
          <div class="text-2xl font-bold text-yellow-500">{{ pausedCount }}</div>
          <div class="text-sm text-neutral-medium">Pausados</div>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm border border-neutral-light">
          <div class="text-2xl font-bold text-state-error">{{ rejectedCount }}</div>
          <div class="text-sm text-neutral-medium">Rechazados</div>
        </div>
      </div>

      <!-- Grid de servicios -->
      <div v-if="loading" class="text-center py-12">
        <div class="w-16 h-16 bg-neutral-light rounded-full flex items-center justify-center mx-auto mb-4">
          <span class="text-2xl">⏳</span>
        </div>
        <h3 class="text-lg font-semibold text-neutral-dark mb-2">Cargando servicios</h3>
        <p class="text-neutral-medium">Espera un momento por favor</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        <div
          v-for="service in filteredServices"
          :key="service._id"
          class="bg-white rounded-xl shadow-sm border border-neutral-light hover:shadow-md transition-all duration-300 overflow-hidden"
        >
          <!-- Header de la tarjeta con estado -->
          <div 
            class="h-2"
            :class="{
              'bg-state-success': service.status === 'aprobado',
              'bg-yellow-500': service.status === 'pausado',
              'bg-state-error': service.status === 'desaprobado',
              'bg-neutral-medium': service.status === 'pendiente'
            }"
          ></div>
          
          <div class="p-6">
            <!-- Header con nombre y estado -->
            <div class="flex justify-between items-start mb-4">
              <h3 class="text-lg font-semibold text-neutral-dark line-clamp-2">{{ service.name }}</h3>
              <span
                class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize"
                :class="{
                  'bg-green-100 text-green-800': service.status === 'aprobado',
                  'bg-yellow-100 text-yellow-800': service.status === 'pausado',
                  'bg-red-100 text-red-800': service.status === 'desaprobado',
                  'bg-neutral-light text-neutral-dark': service.status === 'pendiente'
                }"
              >
                {{ service.status }}
              </span>
            </div>

            <!-- Descripción -->
            <p class="text-neutral-medium text-sm mb-4 line-clamp-3">{{ service.description }}</p>

            <!-- Información del servicio -->
            <div class="space-y-2 mb-6">
              <div class="flex justify-between items-center">
                <span class="text-sm text-neutral-medium">Precio:</span>
                <span class="text-lg font-semibold text-neutral-dark">${{ service.price }}</span>
              </div>
            </div>

            <!-- Acciones -->
            <div class="flex flex-wrap gap-2">
              <button
                @click="openEditModal(service)"
                class="flex-1 min-w-[80px] inline-flex justify-center items-center px-3 py-2 border border-neutral-medium text-sm font-medium rounded-lg text-neutral-dark bg-white hover:bg-neutral-bg focus:ring-2 focus:ring-primary-mint focus:ring-offset-1 transition-colors duration-200"
              >
                <span>✏️</span>
                <span class="ml-1">Editar</span>
              </button>
              
              <button
                @click="deleteService(service._id)"
                class="flex-1 min-w-[80px] inline-flex justify-center items-center px-3 py-2 border border-state-error text-sm font-medium rounded-lg text-state-error bg-white hover:bg-red-50 focus:ring-2 focus:ring-state-error focus:ring-offset-1 transition-colors duration-200"
              >
                <span>🗑️</span>
                <span class="ml-1">Eliminar</span>
              </button>

              <!-- Botones de estado -->
              <button
                v-if="service.status === 'aprobado'"
                @click="pauseService(service._id)"
                class="w-full inline-flex justify-center items-center px-3 py-2 bg-yellow-500 text-sm font-medium rounded-lg text-white hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-1 transition-colors duration-200 mt-2"
              >
                ⏸️ Pausar
              </button>

              <button
                v-if="service.status === 'pausado'"
                @click="resumeService(service._id)"
                class="w-full inline-flex justify-center items-center px-3 py-2 bg-neutral-medium text-sm font-medium rounded-lg text-white hover:bg-neutral-dark focus:ring-2 focus:ring-neutral-medium focus:ring-offset-1 transition-colors duration-200 mt-2"
              >
                ▶️ Reanudar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Estado vacío -->
      <div v-if="!loading && filteredServices.length === 0" class="text-center py-12">
        <div class="w-16 h-16 bg-neutral-light rounded-full flex items-center justify-center mx-auto mb-4">
          <span class="text-2xl">📦</span>
        </div>
        <h3 class="text-lg font-semibold text-neutral-dark mb-2">No se encontraron servicios</h3>
        <p class="text-neutral-medium mb-6">Comienza agregando tu primer servicio</p>
        <button
          @click="openAddModal"
          class="inline-flex items-center gap-2 px-6 py-3 bg-primary-mint text-white rounded-lg hover:bg-state-success focus:ring-2 focus:ring-primary-mint focus:ring-offset-2 transition-all duration-200 font-medium"
        >
          <span>+</span>
          <span>Agregar Primer Servicio</span>
        </button>
      </div>

      <!-- Modal -->
      <transition name="modal">
        <div v-if="showModal" class="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="closeModal"></div>
          <div class="bg-white rounded-2xl shadow-xl w-full max-w-md relative z-10 max-h-[90vh] overflow-hidden">
            <!-- Header del modal -->
            <div class="px-6 py-4 border-b border-neutral-light">
              <div class="flex items-center justify-between">
                <h2 class="text-xl font-semibold text-neutral-dark">
                  {{ isEdit ? 'Editar Servicio' : 'Crear Nuevo Servicio' }}
                </h2>
                <button 
                  @click="closeModal"
                  class="text-neutral-medium hover:text-neutral-dark transition-colors duration-200 p-1 rounded-lg hover:bg-neutral-bg text-2xl"
                >
                  ✕
                </button>
              </div>
            </div>

            <!-- Formulario -->
            <div class="p-6 overflow-y-auto">
              <form @submit.prevent="saveService" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-neutral-dark mb-2">Nombre del Servicio</label>
                  <input 
                    v-model="modalData.name" 
                    type="text" 
                    required 
                    class="w-full px-4 py-3 border border-neutral-medium rounded-lg focus:ring-2 focus:ring-primary-mint focus:border-primary-mint transition-colors duration-200 bg-white"
                    placeholder="Ingresa el nombre del servicio"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-neutral-dark mb-2">Descripción</label>
                  <textarea 
                    v-model="modalData.description" 
                    required 
                    rows="4"
                    class="w-full px-4 py-3 border border-neutral-medium rounded-lg focus:ring-2 focus:ring-primary-mint focus:border-primary-mint transition-colors duration-200 resize-none bg-white"
                    placeholder="Describe tu servicio en detalle"
                  ></textarea>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-neutral-dark mb-2">Precio</label>
                  <div class="relative">
                    <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-medium">$</span>
                    <input 
                      v-model.number="modalData.price" 
                      type="number" 
                      min="0" 
                      step="0.01"
                      required 
                      class="w-full pl-8 pr-4 py-3 border border-neutral-medium rounded-lg focus:ring-2 focus:ring-primary-mint focus:border-primary-mint transition-colors duration-200 bg-white"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <!-- Footer del modal -->
                <div class="flex justify-end gap-3 pt-4">
                  <button 
                    type="button" 
                    @click="closeModal"
                    class="px-6 py-2.5 text-neutral-dark bg-white border border-neutral-medium rounded-lg hover:bg-neutral-bg focus:ring-2 focus:ring-neutral-medium focus:ring-offset-2 transition-all duration-200 font-medium"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    class="px-6 py-2.5 bg-primary-mint text-white rounded-lg hover:bg-state-success focus:ring-2 focus:ring-primary-mint focus:ring-offset-2 transition-all duration-200 font-medium"
                  >
                    {{ isEdit ? 'Actualizar' : 'Crear Servicio' }}
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
import ProviderLayout from "@/components/ProviderLayout.vue";
import Chatbot from "@/components/Chatbot.vue";
import api from "@/api/api";

export default {
  name: "ProviderServices",
  components: { ProviderLayout, Chatbot },
  data() {
    return {
      services: [],
      searchQuery: "",
      showModal: false,
      isEdit: false,
      editId: null,
      loading: true,
      modalData: { name: "", description: "", price: null },
    };
  },
  computed: {
    filteredServices() {
      if (!this.searchQuery) return this.services;
      const query = this.searchQuery.toLowerCase();
      return this.services.filter(service => 
        service.name.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query)
      );
    },
    approvedCount() {
      return this.services.filter(s => s.status === 'aprobado').length;
    },
    pausedCount() {
      return this.services.filter(s => s.status === 'pausado').length;
    },
    rejectedCount() {
      return this.services.filter(s => s.status === 'desaprobado').length;
    }
  },
  async created() {
    await this.fetchServices();
  },
  methods: {
    async fetchServices() {
      try {
        const res = await api.get("/provider-services");
        this.services = res.data;
      } catch (err) {
        console.error("Error cargando servicios:", err);
        alert("Error al cargar los servicios");
      } finally {
        this.loading = false;
      }
    },
    openAddModal() {
      this.isEdit = false;
      this.modalData = { name: "", description: "", price: null };
      this.showModal = true;
    },
    openEditModal(service) {
      this.isEdit = true;
      this.editId = service._id;
      this.modalData = { ...service };
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
    },
    async saveService() {
      try {
        if (this.isEdit) {
          await api.put(`/provider-services/${this.editId}`, this.modalData);
        } else {
          await api.post("/provider-services", this.modalData);
        }
        await this.fetchServices();
        this.closeModal();
        alert(`Servicio ${this.isEdit ? 'actualizado' : 'creado'} correctamente`);
      } catch (err) {
        console.error("Error guardando servicio:", err);
        alert("Error al guardar el servicio");
      }
    },
    async deleteService(id) {
      if (!confirm("¿Estás seguro de que quieres eliminar este servicio?")) return;
      try {
        await api.delete(`/provider-services/${id}`);
        await this.fetchServices();
        alert("Servicio eliminado correctamente");
      } catch (err) {
        console.error("Error eliminando servicio:", err);
        alert("Error al eliminar el servicio");
      }
    },
    async pauseService(id) {
      try {
        await api.put(`/provider-services/${id}/pause`);
        await this.fetchServices();
        alert("Servicio pausado correctamente");
      } catch (err) {
        console.error("Error pausando servicio:", err);
        alert("Error al pausar el servicio");
      }
    },
    async resumeService(id) {
      try {
        await api.put(`/provider-services/${id}/resume`);
        await this.fetchServices();
        alert("Servicio reanudado correctamente");
      } catch (err) {
        console.error("Error reanudando servicio:", err);
        alert("Error al reanudar el servicio");
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