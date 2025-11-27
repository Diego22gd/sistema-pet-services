<template>
  <AdminLayout>
    <div class="px-6 max-w-7xl mx-auto w-full pt-4">
      <h1 class="text-2xl font-bold mb-6 text-neutral-dark">Administrar Servicios</h1>

      <!-- Barra búsqueda y agregar -->
      <div class="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar por servicio o proveedor..."
          class="w-full md:w-1/3 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-mint"
        />
        <button
          @click="openAddModal"
          class="px-6 py-2 bg-primary-mint text-white rounded-lg hover:bg-green-600 transition"
        >
          + Agregar Servicio
        </button>
      </div>

      <!-- Lista de servicios -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div
          v-for="(service, index) in filteredServices"
          :key="service._id"
          :class="[
            'shadow rounded-2xl p-6 border transition-all duration-300',
            service.status === 'approved' ? 'bg-green-50 border-green-400' :
            service.status === 'rejected' ? 'bg-red-50 border-red-400' :
            service.status === 'paused' ? 'bg-yellow-50 border-yellow-400' :
            'bg-neutral-light border-gray-200'
          ]"
        >
          <h2 class="text-xl font-semibold text-neutral-dark">{{ service.name }}</h2>
          <p class="text-neutral-medium mb-2">{{ service.description }}</p>
          <p class="text-sm text-neutral-dark font-semibold mb-1">Precio: ${{ service.price }}</p>
          <p class="text-sm text-neutral-dark/70 mb-2">Proveedor: {{ service.providerName || "Admin" }}</p>
          <p class="text-sm font-semibold mb-4">
            Estado:
            <span
              :class="{
                'text-green-600': service.status === 'approved',
                'text-yellow-600': service.status === 'pending',
                'text-red-600': service.status === 'rejected',
                'text-gray-600': service.status === 'paused'
              }"
            >
              {{ service.status }}
            </span>
          </p>

          <!-- Acciones -->
          <div class="flex flex-wrap gap-2 justify-between">
            <button
              class="px-3 py-2 text-sm bg-primary-mint text-white rounded-lg hover:bg-green-600"
              @click="openEditModal(index)"
            >
              Editar
            </button>
            <button
              class="px-3 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
              @click="deleteService(index)"
            >
              Eliminar
            </button>
            <button
              v-if="service.status === 'pending'"
              class="px-3 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600"
              @click="changeStatus(index, 'approved')"
            >
              Aprobar
            </button>
            <button
              v-if="service.status === 'pending'"
              class="px-3 py-2 text-sm bg-red-400 text-white rounded-lg hover:bg-red-500"
              @click="changeStatus(index, 'rejected')"
            >
              Rechazar
            </button>
            <button
              v-if="service.status === 'approved'"
              class="px-3 py-2 text-sm bg-yellow-400 text-white rounded-lg hover:bg-yellow-500"
              @click="changeStatus(index, 'paused')"
            >
              Pausar
            </button>
            <button
              v-if="service.status === 'paused'"
              class="px-3 py-2 text-sm bg-gray-500 text-white hover:bg-gray-600"
              @click="changeStatus(index, 'approved')"
            >
              Reanudar
            </button>
          </div>
        </div>
      </div>

      <!-- Modal agregar/editar -->
      <transition name="fade">
        <div v-if="showModal" class="fixed inset-0 flex items-center justify-center z-50">
          <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="closeModal"></div>
          <div class="bg-white rounded-2xl shadow-lg w-full max-w-md p-6 relative z-10 overflow-y-auto max-h-[90vh]">
            <h2 class="text-xl font-bold mb-4">{{ isEdit ? 'Editar Servicio' : 'Agregar Servicio' }}</h2>
            <form @submit.prevent="saveService" class="space-y-4">
              <div>
                <label class="block text-sm font-medium mb-1">Nombre del Servicio</label>
                <input v-model="modalData.name" type="text" required class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-mint"/>
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Descripción</label>
                <textarea v-model="modalData.description" required class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-mint"></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Precio</label>
                <input v-model.number="modalData.price" type="number" min="0" required class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-mint"/>
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Proveedor</label>
                <input v-model="modalData.providerName" type="text" class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-mint"/>
              </div>
              <div class="flex justify-end space-x-3 mt-4">
                <button type="button" @click="closeModal" class="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition">Cancelar</button>
                <button type="submit" class="px-4 py-2 rounded-lg bg-primary-mint text-white hover:bg-green-600 transition">{{ isEdit ? 'Actualizar' : 'Agregar' }}</button>
              </div>
            </form>
            <button @click="closeModal" class="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
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
  components: { AdminLayout , Chatbot },
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
      try {
        const id = this.services[index]._id;
        await api.delete(`/admin/services/${id}`);
        this.services.splice(index, 1);
      } catch (error) {
        console.error("Error deleting service:", error);
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
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
