<template>
  <AdminLayout>
    <div class="px-6 max-w-7xl mx-auto w-full pt-6">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-neutral-dark mb-2">Gestión de Servicios</h1>
        <p class="text-neutral-medium">Administra y supervisa todos los servicios del sistema</p>
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
              placeholder="Buscar servicios o proveedores..."
              class="block w-full pl-10 pr-4 py-3 border border-neutral-medium rounded-lg focus:ring-2 focus:ring-primary-mint focus:border-primary-mint transition-colors duration-200 bg-white"
            />
          </div>
          <button
            @click="openAddModal"
            class="flex items-center gap-2 px-6 py-3 bg-primary-mint text-white rounded-lg hover:bg-state-success focus:ring-2 focus:ring-primary-mint focus:ring-offset-2 transition-all duration-200 font-medium"
          >
            <span>+</span>
            Nuevo Servicio
          </button>
        </div>
      </div>

      <!-- Grid de servicios -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        <div
          v-for="(service, index) in filteredServices"
          :key="service._id"
          class="bg-white rounded-xl shadow-sm border border-neutral-light hover:shadow-md transition-all duration-300 overflow-hidden"
        >
          <!-- Header de la tarjeta con estado -->
          <div 
            class="h-2"
            :class="{
              'bg-state-success': service.status === 'approved',
              'bg-yellow-500': service.status === 'pending',
              'bg-state-error': service.status === 'rejected',
              'bg-neutral-medium': service.status === 'paused'
            }"
          ></div>
          
          <div class="p-6">
            <!-- Header con nombre y estado -->
            <div class="flex justify-between items-start mb-4">
              <h3 class="text-lg font-semibold text-neutral-dark line-clamp-2">{{ service.name }}</h3>
              <span
                class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize"
                :class="{
                  'bg-green-100 text-green-800': service.status === 'approved',
                  'bg-yellow-100 text-yellow-800': service.status === 'pending',
                  'bg-red-100 text-red-800': service.status === 'rejected',
                  'bg-neutral-light text-neutral-dark': service.status === 'paused'
                }"
              >
                {{ service.status === 'approved' ? 'Aprobado' : 
                   service.status === 'pending' ? 'Pendiente' :
                   service.status === 'rejected' ? 'Rechazado' : 'Pausado' }}
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
              <div class="flex justify-between items-center">
                <span class="text-sm text-neutral-medium">Proveedor:</span>
                <span class="text-sm font-medium text-neutral-dark">{{ service.providerName || "Administrador" }}</span>
              </div>
            </div>

            <!-- Acciones -->
            <div class="flex flex-wrap gap-2">
              <button
                @click="openEditModal(index)"
                class="flex-1 min-w-[80px] inline-flex justify-center items-center px-3 py-2 border border-neutral-medium text-sm font-medium rounded-lg text-neutral-dark bg-white hover:bg-neutral-bg focus:ring-2 focus:ring-primary-mint focus:ring-offset-1 transition-colors duration-200"
              >
                <span>✏️</span>
                <span class="ml-1">Editar</span>
              </button>
              
              <button
                @click="deleteService(index)"
                class="flex-1 min-w-[80px] inline-flex justify-center items-center px-3 py-2 border border-state-error text-sm font-medium rounded-lg text-state-error bg-white hover:bg-red-50 focus:ring-2 focus:ring-state-error focus:ring-offset-1 transition-colors duration-200"
              >
                <span>🗑️</span>
                <span class="ml-1">Eliminar</span>
              </button>

              <!-- Botones de estado -->
              <div class="flex flex-wrap gap-2 w-full mt-2" v-if="service.status === 'pending'">
                <button
                  @click="changeStatus(index, 'approved')"
                  class="flex-1 inline-flex justify-center items-center px-3 py-2 bg-state-success text-sm font-medium rounded-lg text-white hover:bg-green-700 focus:ring-2 focus:ring-state-success focus:ring-offset-1 transition-colors duration-200"
                >
                  Aprobar
                </button>
                <button
                  @click="changeStatus(index, 'rejected')"
                  class="flex-1 inline-flex justify-center items-center px-3 py-2 bg-state-error text-sm font-medium rounded-lg text-white hover:bg-red-700 focus:ring-2 focus:ring-state-error focus:ring-offset-1 transition-colors duration-200"
                >
                  Rechazar
                </button>
              </div>

              <button
                v-if="service.status === 'approved'"
                @click="changeStatus(index, 'paused')"
                class="w-full inline-flex justify-center items-center px-3 py-2 bg-yellow-500 text-sm font-medium rounded-lg text-white hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-1 transition-colors duration-200 mt-2"
              >
                Pausar
              </button>

              <button
                v-if="service.status === 'paused'"
                @click="changeStatus(index, 'approved')"
                class="w-full inline-flex justify-center items-center px-3 py-2 bg-neutral-medium text-sm font-medium rounded-lg text-white hover:bg-neutral-dark focus:ring-2 focus:ring-neutral-medium focus:ring-offset-1 transition-colors duration-200 mt-2"
              >
                Reanudar
              </button>
            </div>
          </div>
        </div>
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
                    placeholder="Ingrese el nombre del servicio"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-neutral-dark mb-2">Descripción</label>
                  <textarea 
                    v-model="modalData.description" 
                    required 
                    rows="3"
                    class="w-full px-4 py-3 border border-neutral-medium rounded-lg focus:ring-2 focus:ring-primary-mint focus:border-primary-mint transition-colors duration-200 resize-none bg-white"
                    placeholder="Describa el servicio"
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
                
                <div>
                  <label class="block text-sm font-medium text-neutral-dark mb-2">Proveedor</label>
                  <input 
                    v-model="modalData.providerName" 
                    type="text" 
                    class="w-full px-4 py-3 border border-neutral-medium rounded-lg focus:ring-2 focus:ring-primary-mint focus:border-primary-mint transition-colors duration-200 bg-white"
                    placeholder="Nombre del proveedor"
                  />
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
  </AdminLayout>
</template>

<script>
import AdminLayout from "@/components/AdminLayout.vue";
import Chatbot from "@/components/Chatbot.vue";
import api from "@/api/api";

export default {
  name: "AdminServices",
  components: { AdminLayout, Chatbot },
  data() {
    return {
      searchQuery: "",
      showModal: false,
      isEdit: false,
      editIndex: null,
      modalData: { name: "", description: "", price: null, providerName: "" },
      services: [],
    };
  },
  computed: {
    filteredServices() {
      return this.services.filter(
        (s) =>
          s.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          (s.providerName || "").toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
  },
  methods: {
    async fetchServices() {
      try {
        const res = await api.get("/admin/services");
        this.services = res.data;
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    },
    openAddModal() {
      this.isEdit = false;
      this.modalData = { name: "", description: "", price: null, providerName: "" };
      this.showModal = true;
    },
    openEditModal(index) {
      this.isEdit = true;
      this.editIndex = index;
      this.modalData = { ...this.services[index] };
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
    },
    async saveService() {
      try {
        const payload = {
          name: this.modalData.name,
          description: this.modalData.description,
          price: this.modalData.price,
          providerName: this.modalData.providerName || "Admin",
        };

        if (this.isEdit) {
          const id = this.services[this.editIndex]._id;
          const res = await api.put(`/admin/services/${id}`, payload);
          this.services[this.editIndex] = res.data;
        } else {
          const res = await api.post("/admin/services", payload);
          this.services.push(res.data);
        }
        this.closeModal();
      } catch (error) {
        console.error("Error saving service:", error);
      }
    },
    async deleteService(index) {
      if (confirm('¿Está seguro de que desea eliminar este servicio? Esta acción no se puede deshacer.')) {
        try {
          const id = this.services[index]._id;
          await api.delete(`/admin/services/${id}`);
          this.services.splice(index, 1);
        } catch (error) {
          console.error("Error deleting service:", error);
        }
      }
    },
    async changeStatus(index, newStatus) {
      try {
        const id = this.services[index]._id;
        const res = await api.put(`/admin/services/${id}`, { status: newStatus });
        this.services[index].status = res.data.status;
      } catch (error) {
        console.error("Error changing status:", error);
      }
    },
  },
  mounted() {
    this.fetchServices();
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