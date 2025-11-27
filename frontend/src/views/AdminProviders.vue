<template>
  <AdminLayout>
    <div class="px-6 max-w-7xl mx-auto w-full pt-4">
      <h1 class="text-2xl font-bold mb-6 text-neutral-dark">Providers Management</h1>

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

      <div class="bg-neutral-light shadow rounded-2xl overflow-hidden">
        <table class="w-full text-left border-collapse">
          <thead class="bg-primary-mint text-white">
            <tr>
              <th class="px-4 py-2">Name</th>
              <th class="px-4 py-2">Email</th>
              <th class="px-4 py-2">Phone</th>
              <th class="px-4 py-2">Service Type</th>
              <th class="px-4 py-2">Subscription</th>
              <th class="px-4 py-2">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="provider in filteredProviders"
              :key="provider._id"
              :class="provider.paused ? 'bg-yellow-100' : ''"
              class="border-b hover:bg-neutral-light/50 transition"
            >
              <td class="px-4 py-2">{{ provider.name }}</td>
              <td class="px-4 py-2">{{ provider.email }}</td>
              <td class="px-4 py-2">{{ provider.phone }}</td>

              <td class="px-4 py-2">{{ provider.serviceType }}</td>

              <td class="px-4 py-2">
                <div class="flex flex-col gap-1">
                  <span :class="isExpired(provider.subscription?.expirationDate) ? 'text-red-600 font-semibold' : ''">
                    {{ provider.subscription?.type || 'N/A' }}
                    (Expires:
                    {{ provider.subscription?.expirationDate
                      ? provider.subscription.expirationDate.split('T')[0]
                      : 'N/A' }})
                  </span>

                  <div class="flex gap-2 mt-1">
                    <button
                      v-if="!provider.paused"
                      @click="pauseSubscription(provider)"
                      class="px-2 py-1 text-xs bg-yellow-400 rounded hover:bg-yellow-500"
                    >
                      Pause
                    </button>

                    <button
                      v-if="provider.paused"
                      @click="resumeSubscription(provider)"
                      class="px-2 py-1 text-xs bg-green-400 rounded hover:bg-green-500"
                    >
                      Resume
                    </button>

                    <button
                      @click="renewSubscription(provider)"
                      class="px-2 py-1 text-xs bg-blue-400 rounded hover:bg-blue-500"
                    >
                      Renew
                    </button>
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
                  @click="deleteProvider(provider._id)"
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

      <!-- modal -->
      <div
        v-if="showModal"
        class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      >
        <div class="bg-white rounded-2xl p-6 w-full max-w-lg shadow-lg">
          <h2 class="text-xl font-semibold mb-4">
            {{ editingProvider ? 'Edit Provider' : 'Add Provider' }}
          </h2>

          <form @submit.prevent="saveProvider" class="space-y-3">

            <input v-model="form.name" type="text" placeholder="Name" class="w-full border rounded-lg px-3 py-2" required />

            <input v-model="form.email" type="email" placeholder="Email"
              class="w-full border rounded-lg px-3 py-2" required />

            <input v-model="form.phone" type="text" placeholder="Phone"
              class="w-full border rounded-lg px-3 py-2" />

            <input v-model="form.serviceType" type="text" placeholder="Service Type"
              class="w-full border rounded-lg px-3 py-2" required />

            <div class="flex justify-end gap-2 mt-4">
              <button type="button" @click="closeModal" class="px-4 py-2 bg-gray-300 rounded-lg">
                Cancel
              </button>

              <button type="submit" class="px-4 py-2 bg-primary-mint text-white rounded-lg">
                {{ editingProvider ? 'Save Changes' : 'Add' }}
              </button>
            </div>

          </form>
        </div>
      </div>

    </div>
    <Chatbot />
  </AdminLayout>
</template>


<script>
import AdminLayout from "@/components/AdminLayout.vue";
import Chatbot from "@/components/Chatbot.vue";
import api from "@/api/api";

export default {
  name: "AdminProviders",
  components: { AdminLayout ,Chatbot},

  data() {
    return {
      searchQuery: "",
      providers: [],
      showModal: false,
      editingProvider: null,
      form: {
        name: "",
        email: "",
        phone: "",
        serviceType: "",
      },
    };
  },

  computed: {
    filteredProviders() {
      if (!this.searchQuery) return this.providers;
      return this.providers.filter((p) =>
        p.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
  },

  methods: {
    async fetchProviders() {
      try {
        const { data } = await api.get("/admin/providers");
        this.providers = data;
      } catch (err) {
        console.error("Error fetching providers:", err);
      }
    },

    isExpired(date) {
      if (!date) return false;
      return new Date(date) < new Date();
    },

    async pauseSubscription(provider) {
      try {
        const { data } = await api.put(`/admin/providers/${provider._id}/pause`);
        Object.assign(provider, data);
      } catch (err) {
        console.error("Error pausing subscription:", err);
      }
    },

    async resumeSubscription(provider) {
      try {
        const { data } = await api.put(`/admin/providers/${provider._id}/resume`);
        Object.assign(provider, data);
      } catch (err) {
        console.error("Error resuming subscription:", err);
      }
    },

    async renewSubscription(provider) {
      try {
        const { data } = await api.put(`/admin/providers/${provider._id}/renew`);
        Object.assign(provider, data);
      } catch (err) {
        console.error("Error renewing subscription:", err);
      }
    },

    openModal() {
      this.showModal = true;
      this.editingProvider = null;
      this.form = {
        name: "",
        email: "",
        phone: "",
        serviceType: "",
      };
    },

    closeModal() {
      this.showModal = false;
    },

    editProvider(provider) {
      this.editingProvider = provider;
      this.form = { ...provider };
      this.showModal = true;
    },

    async saveProvider() {
      try {
        if (this.editingProvider) {
          const { data } = await api.put(`/admin/providers/${this.editingProvider._id}`, this.form);
          const index = this.providers.findIndex((p) => p._id === data._id);
          this.providers.splice(index, 1, data);
        } else {
          const { data } = await api.post("/admin/providers", this.form);
          this.providers.push(data);
        }

        this.closeModal();
      } catch (err) {
        console.error("Error saving provider:", err);
      }
    },

    async deleteProvider(id) {
      if (!confirm("Are you sure you want to delete this provider?")) return;

      try {
        await api.delete(`/admin/providers/${id}`);
        this.providers = this.providers.filter((p) => p._id !== id);
      } catch (err) {
        console.error("Error deleting provider:", err);
      }
    },
  },

  mounted() {
    this.fetchProviders();
  },
};
</script>
