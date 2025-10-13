<template>
  <AdminLayout>
    <div class="px-6 max-w-7xl mx-auto w-full pt-4">
      <h1 class="text-2xl font-bold mb-6 text-neutral-dark">Manage Services</h1>

      <!-- Barra de búsqueda -->
      <div class="mb-6">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by service or provider..."
          class="w-full md:w-1/3 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-mint"
        />
      </div>

      <!-- Lista de servicios filtrada -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div 
          v-for="(service, index) in filteredServices" 
          :key="index" 
          class="bg-neutral-light shadow rounded-2xl p-6"
        >
          <h2 class="text-xl font-semibold text-neutral-dark">{{ service.name }}</h2>
          <p class="text-neutral-medium mb-2">{{ service.description }}</p>
          <p class="text-sm text-neutral-dark font-semibold">Price: ${{ service.price }}</p>
          <p class="text-sm text-neutral-dark/70">Provider: {{ service.provider }}</p>
          <div class="flex justify-between mt-4">
            <button 
              class="px-4 py-2 bg-primary-mint text-white rounded-lg hover:bg-green-600 transition"
              @click="openEditModal(index)"
            >
              Edit
            </button>
            <button 
              class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              @click="deleteService(index)"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <!-- Botón agregar servicio -->
      <div class="mt-8 text-center">
        <button 
          class="px-6 py-3 bg-secondary text-white rounded-xl hover:bg-secondary-dark transition"
          @click="openAddModal"
        >
          + Add Service
        </button>
      </div>

      <!-- Modal -->
      <transition name="fade">
        <div v-if="showModal" class="fixed inset-0 flex items-center justify-center z-50">
          <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="closeModal"></div>
          <div class="bg-white rounded-2xl shadow-lg w-full max-w-md p-6 relative z-10 overflow-y-auto max-h-[90vh]">
            <h2 class="text-xl font-bold mb-4">{{ isEdit ? 'Edit Service' : 'Add Service' }}</h2>
            <form @submit.prevent="saveService" class="space-y-4">
              <div>
                <label class="block text-sm font-medium mb-1">Service Name</label>
                <input v-model="modalData.name" type="text" required
                       class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-mint" />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Description</label>
                <textarea v-model="modalData.description" required
                          class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-mint"></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Price</label>
                <input v-model.number="modalData.price" type="number" min="0" required
                       class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-mint" />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Provider</label>
                <input v-model="modalData.provider" type="text" required
                       class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-mint" />
              </div>
              <div class="flex justify-end space-x-3 mt-4">
                <button type="button" @click="closeModal"
                        class="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition">
                  Cancel
                </button>
                <button type="submit"
                        class="px-4 py-2 rounded-lg bg-primary-mint text-white hover:bg-green-600 transition">
                  {{ isEdit ? 'Update' : 'Add' }}
                </button>
              </div>
            </form>
            <button @click="closeModal" class="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
          </div>
        </div>
      </transition>
    </div>
  </AdminLayout>
</template>

<script>
import AdminLayout from "@/components/AdminLayout.vue";

export default {
  name: "AdminServices",
  components: { AdminLayout },
  data() {
    return {
      services: [
        { name: "Consulta Veterinaria", description: "Revisión general de la mascota.", price: 30, provider: "Vet Center" },
        { name: "Peluquería Canina", description: "Baño, corte y cuidado estético.", price: 45, provider: "Happy Pets" },
        { name: "Adiestramiento", description: "Entrenamiento básico y avanzado.", price: 60, provider: "TrainYourDog" }
      ],
      searchQuery: '',
      showModal: false,
      isEdit: false,
      editIndex: null,
      modalData: { name: '', description: '', price: null, provider: '' }
    };
  },
  computed: {
    filteredServices() {
      return this.services.filter(s =>
        s.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        s.provider.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
  },
  methods: {
    openAddModal() {
      this.isEdit = false;
      this.modalData = { name: '', description: '', price: null, provider: '' };
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
    saveService() {
      if(this.isEdit) {
        this.services[this.editIndex] = { ...this.modalData };
      } else {
        this.services.push({ ...this.modalData });
      }
      this.closeModal();
    },
    deleteService(index) {
      this.services.splice(index, 1);
    }
  }
};
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
