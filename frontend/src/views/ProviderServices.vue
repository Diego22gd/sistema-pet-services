<template>
  <ProviderLayout>
    <div class="px-6 max-w-6xl mx-auto w-full pt-4">
      <h1 class="text-2xl font-bold mb-6 text-neutral-dark">Gestión de Servicios</h1>

      <!-- Lista de servicios -->
      <div v-if="loading" class="text-center text-gray-500">Cargando servicios...</div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          v-for="service in services"
          :key="service._id"
          :class="[
            'shadow rounded-2xl p-6 border transition-all duration-300',
            service.status === 'aprobado'
              ? 'bg-green-50 border-green-400'
              : service.status === 'pausado'
              ? 'bg-yellow-50 border-yellow-400'
              : service.status === 'desaprobado'
              ? 'bg-red-50 border-red-400'
              : 'bg-neutral-light border-gray-200'
          ]"
        >
          <h2 class="text-xl font-semibold text-neutral-dark">{{ service.name }}</h2>
          <p class="text-neutral-medium mb-2">{{ service.description }}</p>
          <p class="text-sm text-neutral-dark font-semibold mb-2">
            Precio: ${{ service.price }}
          </p>
          <p class="text-sm font-semibold">
            Estado:
            <span
              :class="{
                'text-green-600': service.status === 'aprobado',
                'text-red-600': service.status === 'desaprobado',
                'text-yellow-600': service.status === 'pausado',
                'text-gray-600': service.status === 'pendiente'
              }"
            >
              {{ service.status }}
            </span>
          </p>

          <!-- Acciones -->
          <div class="flex flex-wrap justify-between mt-4 gap-2">
            <button
              class="px-4 py-2 bg-primary-mint text-white rounded-lg hover:bg-green-600 transition"
              @click="openEditModal(service)"
            >
              Editar
            </button>
            <button
              class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              @click="deleteService(service._id)"
            >
              Eliminar
            </button>
            <button
              v-if="service.status === 'aprobado'"
              class="px-4 py-2 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 transition"
              @click="pauseService(service._id)"
            >
              Pausar
            </button>
            <button
              v-if="service.status === 'pausado'"
              class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
              @click="resumeService(service._id)"
            >
              Reanudar
            </button>
          </div>
        </div>
      </div>

      <!-- Botón agregar -->
      <div class="mt-8 text-center">
        <button
          class="px-6 py-3 bg-secondary text-white rounded-xl hover:bg-secondary-dark transition"
          @click="openAddModal"
        >
          + Agregar Servicio
        </button>
      </div>

      <!-- Modal agregar/editar -->
      <transition name="fade">
        <div v-if="showModal" class="fixed inset-0 flex items-center justify-center z-50">
          <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="closeModal"></div>
          <div
            class="bg-white rounded-2xl shadow-lg w-full max-w-md p-6 relative z-10 overflow-y-auto max-h-[90vh]"
          >
            <h2 class="text-xl font-bold mb-4">
              {{ isEdit ? "Editar Servicio" : "Agregar Servicio" }}
            </h2>
            <form @submit.prevent="saveService" class="space-y-4">
              <div>
                <label class="block text-sm font-medium mb-1">Nombre del Servicio</label>
                <input
                  v-model="modalData.name"
                  type="text"
                  required
                  class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-mint"
                />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Descripción</label>
                <textarea
                  v-model="modalData.description"
                  required
                  class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-mint"
                ></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Precio</label>
                <input
                  v-model.number="modalData.price"
                  type="number"
                  min="0"
                  required
                  class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-mint"
                />
              </div>
              <div class="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  @click="closeModal"
                  class="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  class="px-4 py-2 bg-primary-mint text-white rounded-lg hover:bg-green-600"
                >
                  {{ isEdit ? "Actualizar" : "Agregar" }}
                </button>
              </div>
            </form>
            <button
              @click="closeModal"
              class="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl"
            >
              &times;
            </button>
          </div>
        </div>
      </transition>
    </div>
  </ProviderLayout>
  <Chatbot />
</template>

<script>
import ProviderLayout from "@/components/ProviderLayout.vue";
import Chatbot from "@/components/Chatbot.vue";
import api from "@/api/api";

export default {
  name: "ProviderServices",
  components: { ProviderLayout,Chatbot },
  data() {
    return {
      services: [],
      showModal: false,
      isEdit: false,
      editId: null,
      loading: true,
      modalData: { name: "", description: "", price: null },
    };
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
      } catch (err) {
        console.error("Error guardando servicio:", err);
      }
    },
    async deleteService(id) {
      try {
        await api.delete(`/provider-services/${id}`);
        await this.fetchServices();
      } catch (err) {
        console.error("Error eliminando servicio:", err);
      }
    },
    async pauseService(id) {
      await api.put(`/provider-services/${id}/pause`);
      await this.fetchServices();
    },
    async resumeService(id) {
      await api.put(`/provider-services/${id}/resume`);
      await this.fetchServices();
    },
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

