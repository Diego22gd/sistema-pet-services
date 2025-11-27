<template>
  <AdminLayout>
    <div class="px-6 max-w-6xl mx-auto w-full pt-4">
      <h1 class="text-2xl font-bold mb-6 text-neutral-dark">Gestión de Clientes</h1>

      <!-- Barra de búsqueda y botón agregar -->
      <div class="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar clientes..."
          class="w-full md:w-1/3 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-mint outline-none"
        />
        <button
          @click="openModal"
          class="bg-primary-mint text-white px-4 py-2 rounded-lg shadow hover:bg-primary-mint/90 transition"
        >
          + Agregar Cliente
        </button>
      </div>

      <!-- Tabla de clientes -->
      <div class="bg-neutral-light shadow rounded-2xl overflow-hidden">
        <table class="w-full text-left border-collapse">
          <thead class="bg-primary-mint text-white">
            <tr>
              <th class="px-4 py-2">Nombre</th>
              <th class="px-4 py-2">Apellido</th>
              <th class="px-4 py-2">Correo</th>
              <th class="px-4 py-2">Teléfono</th>
              <th class="px-4 py-2">Cédula</th>
              <th class="px-4 py-2">Nacimiento</th>
              <th class="px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="client in filteredClients"
              :key="client._id"
              class="border-b hover:bg-neutral-light/50"
            >
              <td class="px-4 py-2">{{ client.name }}</td>
              <td class="px-4 py-2">{{ client.lastname }}</td>
              <td class="px-4 py-2">{{ client.email }}</td>
              <td class="px-4 py-2">{{ client.phone }}</td>
              <td class="px-4 py-2">{{ client.cedula }}</td>
              <td class="px-4 py-2">{{ formatDate(client.birthdate) }}</td>
              <td class="px-4 py-2 flex gap-2">
                <button
                  @click="editClient(client)"
                  class="px-3 py-1 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Editar
                </button>
                <button
                  @click="deleteClient(client._id)"
                  class="px-3 py-1 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Eliminar
                </button>
              </td>
            </tr>
            <tr v-if="filteredClients.length === 0">
              <td colspan="7" class="px-4 py-4 text-center text-neutral-medium">
                No se encontraron clientes.
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
            {{ editingClient ? "Editar Cliente" : "Agregar Cliente" }}
          </h2>
          <form @submit.prevent="saveClient">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-1">Nombre</label>
                <input v-model="form.name" type="text" required class="input" />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Apellido</label>
                <input v-model="form.lastname" type="text" required class="input" />
              </div>
              <div class="sm:col-span-2">
                <label class="block text-sm font-medium mb-1">Correo</label>
                <input v-model="form.email" type="email" required class="input" />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Teléfono</label>
                <input v-model="form.phone" type="text" required class="input" />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Cédula</label>
                <input v-model="form.cedula" type="text" required class="input" />
              </div>
              <div class="sm:col-span-2">
                <label class="block text-sm font-medium mb-1">Fecha de Nacimiento</label>
                <input v-model="form.birthdate" type="date" required class="input" />
              </div>
              <div v-if="!editingClient" class="sm:col-span-2">
                <label class="block text-sm font-medium mb-1">Contraseña</label>
                <input v-model="form.password" type="password" required class="input" />
              </div>
            </div>

            <div class="flex justify-end gap-3 mt-6">
              <button type="button" @click="closeModal" class="btn-gray">Cancelar</button>
              <button type="submit" class="btn-green">Guardar</button>
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
  name: "AdminClients",
  components: { AdminLayout , Chatbot },
  data() {
    return {
      searchQuery: "",
      showModal: false,
      editingClient: null,
      form: {
        name: "",
        lastname: "",
        email: "",
        phone: "",
        cedula: "",
        birthdate: "",
        password: "",
      },
      clients: [],
    };
  },
  computed: {
    filteredClients() {
      if (!this.searchQuery) return this.clients;
      return this.clients.filter((c) =>
        `${c.name} ${c.lastname}`.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
  },
  methods: {
    async fetchClients() {
      try {
        const { data } = await api.get("/admin/clients");
        this.clients = data;
      } catch (err) {
        console.error("❌ Error al obtener clientes:", err);
      }
    },
    openModal() {
      this.showModal = true;
      this.editingClient = null;
      this.form = {
        name: "",
        lastname: "",
        email: "",
        phone: "",
        cedula: "",
        birthdate: "",
        password: "",
      };
    },
    closeModal() {
      this.showModal = false;
    },
    async saveClient() {
      try {
        if (this.editingClient) {
          const { data } = await api.put(`/admin/clients/${this.editingClient._id}`, this.form);
          const index = this.clients.findIndex((c) => c._id === data._id);
          this.clients.splice(index, 1, data);
        } else {
          const { data } = await api.post("/admin/clients", this.form);
          this.clients.push(data);
        }
        this.closeModal();
      } catch (err) {
        console.error("❌ Error al guardar cliente:", err);
      }
    },
    editClient(client) {
      this.editingClient = client;
      this.form = { ...client, password: "" };
      this.showModal = true;
    },
    async deleteClient(id) {
      if (!confirm("¿Eliminar este cliente?")) return;
      try {
        await api.delete(`/admin/clients/${id}`);
        this.clients = this.clients.filter((c) => c._id !== id);
      } catch (err) {
        console.error("❌ Error al eliminar cliente:", err);
      }
    },
    formatDate(date) {
      if (!date) return "-";
      return new Date(date).toLocaleDateString("es-VE");
    },
  },
  mounted() {
    this.fetchClients();
  },
};
</script>

<style scoped>
.input {
  @apply w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-mint outline-none;
}
.btn-gray {
  @apply px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300;
}
.btn-green {
  @apply px-4 py-2 bg-primary-mint text-white rounded-lg hover:bg-primary-mint/90;
}
</style>
