<template>
  <AdminLayout>
    <div class="px-6 max-w-6xl mx-auto w-full pt-4">
      <h1 class="text-2xl font-bold mb-6 text-neutral-dark">Clients Management</h1>

      <!-- Barra de búsqueda y botón agregar -->
      <div class="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search clients..."
          class="w-full md:w-1/3 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-mint outline-none"
        />
        <button
          @click="openModal"
          class="bg-primary-mint text-white px-4 py-2 rounded-lg shadow hover:bg-primary-mint/90 transition"
        >
          + Add Client
        </button>
      </div>

      <!-- Tabla de clientes -->
      <div class="bg-neutral-light shadow rounded-2xl overflow-hidden">
        <table class="w-full text-left border-collapse">
          <thead class="bg-primary-mint text-white">
            <tr>
              <th class="px-4 py-2">Name</th>
              <th class="px-4 py-2">Email</th>
              <th class="px-4 py-2">Phone</th>
              <th class="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="client in filteredClients"
              :key="client.id"
              class="border-b hover:bg-neutral-light/50"
            >
              <td class="px-4 py-2">{{ client.name }}</td>
              <td class="px-4 py-2">{{ client.email }}</td>
              <td class="px-4 py-2">{{ client.phone }}</td>
              <td class="px-4 py-2 flex gap-2">
                <button
                  @click="editClient(client)"
                  class="px-3 py-1 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Edit
                </button>
                <button
                  @click="deleteClient(client.id)"
                  class="px-3 py-1 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
            <tr v-if="filteredClients.length === 0">
              <td colspan="4" class="px-4 py-4 text-center text-neutral-medium">
                No clients found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal agregar/editar -->
      <div
        v-if="showModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <div class="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
          <h2 class="text-lg font-semibold mb-4">
            {{ editingClient ? "Edit Client" : "Add Client" }}
          </h2>
          <form @submit.prevent="saveClient">
            <div class="mb-4">
              <label class="block text-sm font-medium mb-1">Name</label>
              <input
                v-model="form.name"
                type="text"
                required
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-mint outline-none"
              />
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium mb-1">Email</label>
              <input
                v-model="form.email"
                type="email"
                required
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-mint outline-none"
              />
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium mb-1">Phone</label>
              <input
                v-model="form.phone"
                type="text"
                required
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-mint outline-none"
              />
            </div>
            <div class="flex justify-end gap-3">
              <button
                type="button"
                @click="closeModal"
                class="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-4 py-2 bg-primary-mint text-white rounded-lg hover:bg-primary-mint/90"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script>
import AdminLayout from "@/components/AdminLayout.vue";

export default {
  name: "AdminClients",
  components: { AdminLayout },
  data() {
    return {
      searchQuery: "",
      showModal: false,
      editingClient: null,
      form: { name: "", email: "", phone: "" },
      clients: [
        { id: 1, name: "Juan Pérez", email: "juan@example.com", phone: "555-1234" },
        { id: 2, name: "Ana Gómez", email: "ana@example.com", phone: "555-5678" },
        { id: 3, name: "Carlos Ruiz", email: "carlos@example.com", phone: "555-9876" },
      ],
    };
  },
  computed: {
    filteredClients() {
      if (!this.searchQuery) return this.clients;
      return this.clients.filter((c) =>
        c.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
  },
  methods: {
    openModal() {
      this.showModal = true;
      this.editingClient = null;
      this.form = { name: "", email: "", phone: "" };
    },
    closeModal() {
      this.showModal = false;
    },
    saveClient() {
      if (this.editingClient) {
        // Update
        Object.assign(this.editingClient, this.form);
      } else {
        // Create
        this.clients.push({
          id: Date.now(),
          ...this.form,
        });
      }
      this.closeModal();
    },
    editClient(client) {
      this.editingClient = client;
      this.form = { ...client };
      this.showModal = true;
    },
    deleteClient(id) {
      this.clients = this.clients.filter((c) => c.id !== id);
    },
  },
};
</script>
