<template>
  <AdminLayout>
    <div class="px-6 max-w-7xl mx-auto w-full pt-4">
      <h1 class="text-2xl font-bold mb-6 text-neutral-dark">Providers Management</h1>

      <!-- Barra de búsqueda y botón agregar -->
      <div class="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search providers..."
          class="w-full md:w-1/3 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-mint outline-none"
        />
        <button
          @click="openModal"
          class="bg-primary-mint text-white px-4 py-2 rounded-lg shadow hover:bg-primary-mint/90 transition"
        >
          + Add Provider
        </button>
      </div>

      <!-- Tabla de proveedores -->
      <div class="bg-neutral-light shadow rounded-2xl overflow-hidden">
        <table class="w-full text-left border-collapse">
          <thead class="bg-primary-mint text-white">
            <tr>
              <th class="px-4 py-2">Name</th>
              <th class="px-4 py-2">Email</th>
              <th class="px-4 py-2">Phone</th>
              <th class="px-4 py-2">Service</th>
              <th class="px-4 py-2">Subscription</th>
              <th class="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="provider in filteredProviders"
              :key="provider.id"
              :class="provider.paused ? 'bg-yellow-100' : ''"
              class="border-b hover:bg-neutral-light/50 transition"
            >
              <td class="px-4 py-2">{{ provider.name }}</td>
              <td class="px-4 py-2">{{ provider.email }}</td>
              <td class="px-4 py-2">{{ provider.phone }}</td>
              <td class="px-4 py-2">{{ provider.service }}</td>
              <td class="px-4 py-2">
                <div class="flex flex-col gap-1">
                  <span :class="isExpired(provider.expirationDate) ? 'text-red-600 font-semibold' : ''">
                    {{ provider.subscriptionType }} (Expires: {{ provider.expirationDate }})
                  </span>
                  <div class="flex gap-2 mt-1">
                    <button
                      v-if="!provider.paused"
                      @click="pauseSubscription(provider)"
                      class="px-2 py-1 text-xs bg-yellow-400 rounded hover:bg-yellow-500"
                    >Pause</button>
                    <button
                      v-if="provider.paused"
                      @click="resumeSubscription(provider)"
                      class="px-2 py-1 text-xs bg-green-400 rounded hover:bg-green-500"
                    >Resume</button>
                    <button
                      @click="renewSubscription(provider)"
                      class="px-2 py-1 text-xs bg-blue-400 rounded hover:bg-blue-500"
                    >Renew</button>
                  </div>
                </div>
              </td>
              <td class="px-4 py-2 flex gap-2">
                <button
                  @click="editProvider(provider)"
                  class="px-3 py-1 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Edit
                </button>
                <button
                  @click="deleteProvider(provider.id)"
                  class="px-3 py-1 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
            <tr v-if="filteredProviders.length === 0">
              <td colspan="6" class="px-4 py-4 text-center text-neutral-medium">
                No providers found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </AdminLayout>
</template>

<script>
import AdminLayout from "@/components/AdminLayout.vue";

export default {
  name: "AdminProviders",
  components: { AdminLayout },
  data() {
    return {
      searchQuery: "",
      providers: [
        { id: 1, name: "VetClinic Center", email: "clinic@example.com", phone: "555-1111", service: "Veterinary", subscriptionType: "Monthly", startDate: "2025-08-01", expirationDate: "2025-09-01", paused: false },
        { id: 2, name: "Happy Pets Grooming", email: "grooming@example.com", phone: "555-2222", service: "Grooming", subscriptionType: "Monthly", startDate: "2025-07-15", expirationDate: "2025-08-15", paused: false },
        { id: 3, name: "PetWalkers Co", email: "walkers@example.com", phone: "555-3333", service: "Walking", subscriptionType: "Monthly", startDate: "2025-08-10", expirationDate: "2025-09-10", paused: false },
      ]
    };
  },
  computed: {
    filteredProviders() {
      if (!this.searchQuery) return this.providers;
      return this.providers.filter(p => p.name.toLowerCase().includes(this.searchQuery.toLowerCase()));
    }
  },
  methods: {
    isExpired(expirationDate) {
      return new Date(expirationDate) < new Date();
    },
    pauseSubscription(provider) {
      provider.paused = true;
    },
    resumeSubscription(provider) {
      provider.paused = false;
    },
    renewSubscription(provider) {
      let currentExp = new Date(provider.expirationDate);
      currentExp.setMonth(currentExp.getMonth() + 1);
      provider.expirationDate = currentExp.toISOString().split('T')[0];
    },
    editProvider(provider) {
      alert(`Edit provider: ${provider.name}`);
    },
    deleteProvider(id) {
      this.providers = this.providers.filter(p => p.id !== id);
    }
  }
};
</script>
