<template>
  <AdminLayout>
    <div class="px-6 max-w-7xl mx-auto w-full pt-8">
      <!-- Header de la página -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-neutral-dark mb-2">Gestión de Clientes</h1>
        <p class="text-neutral-medium text-lg">Administra y gestiona todos los clientes del sistema</p>
      </div>

      <!-- Barra de búsqueda y acciones -->
      <div class="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-neutral-light">
        <div class="flex flex-col md:flex-row justify-between items-center gap-4">
          <div class="relative flex-1 w-full md:max-w-md">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-medium">🔍</span>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar clientes por nombre, apellido o correo..."
              class="w-full pl-10 pr-4 py-3 border border-neutral-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-mint focus:border-transparent transition-all duration-300 bg-neutral-bg"
            />
          </div>
          <button
            @click="openModal"
            class="bg-primary-mint text-white px-6 py-3 rounded-xl font-semibold hover:bg-state-success transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl flex items-center space-x-2 whitespace-nowrap"
          >
            <span>+</span>
            <span>Agregar Cliente</span>
          </button>
        </div>
      </div>

      <!-- Tarjeta de estadísticas -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white rounded-xl p-4 shadow-sm border border-neutral-light">
          <div class="text-2xl font-bold text-primary-mint">{{ clients.length }}</div>
          <div class="text-sm text-neutral-medium">Total Clientes</div>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm border border-neutral-light">
          <div class="text-2xl font-bold text-state-success">{{ activeClients }}</div>
          <div class="text-sm text-neutral-medium">Activos</div>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm border border-neutral-light">
          <div class="text-2xl font-bold text-state-warning">{{ newThisMonth }}</div>
          <div class="text-sm text-neutral-medium">Nuevos este mes</div>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm border border-neutral-light">
          <div class="text-2xl font-bold text-secondary">{{ withPets }}</div>
          <div class="text-sm text-neutral-medium">Con mascotas</div>
        </div>
      </div>

      <!-- Tabla de clientes mejorada -->
      <div class="bg-white rounded-2xl shadow-lg border border-neutral-light overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gradient-to-r from-primary-mint to-teal-500 text-white">
              <tr>
                <th class="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Cliente</th>
                <th class="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Contacto</th>
                <th class="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Información</th>
                <th class="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Estado</th>
                <th class="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-neutral-light">
              <tr
                v-for="client in filteredClients"
                :key="client._id"
                class="hover:bg-neutral-bg transition-colors duration-200 group"
              >
                <!-- Información del cliente -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="w-10 h-10 bg-primary-mint/10 rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                      <span class="text-primary-mint font-semibold text-sm">
                        {{ getInitials(client.name, client.lastname) }}
                      </span>
                    </div>
                    <div>
                      <div class="font-semibold text-neutral-dark">{{ client.name }} {{ client.lastname }}</div>
                      <div class="text-sm text-neutral-medium">ID: {{ client._id.slice(-6) }}</div>
                    </div>
                  </div>
                </td>

                <!-- Contacto -->
                <td class="px-6 py-4">
                  <div class="text-sm font-medium text-neutral-dark">{{ client.email }}</div>
                  <div class="text-sm text-neutral-medium">{{ client.phone || 'Sin teléfono' }}</div>
                </td>

                <!-- Información adicional -->
                <td class="px-6 py-4">
                  <div class="text-sm text-neutral-dark">Cédula: {{ client.cedula || 'No registrada' }}</div>
                  <div class="text-sm text-neutral-medium">Nac: {{ formatDate(client.birthdate) }}</div>
                </td>

                <!-- Estado -->
                <td class="px-6 py-4">
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                    <span class="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Activo
                  </span>
                </td>

                <!-- Acciones -->
                <td class="px-6 py-4">
                  <div class="flex items-center space-x-2">
                    <button
                      @click="editClient(client)"
                      class="bg-secondary text-white px-4 py-2 rounded-lg font-semibold hover:bg-secondary-dark transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center space-x-1 text-sm"
                    >
                      <span>✏️</span>
                      <span>Editar</span>
                    </button>
                    <button
                      @click="deleteClient(client._id)"
                      class="bg-state-error text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center space-x-1 text-sm"
                    >
                      <span>🗑️</span>
                      <span>Eliminar</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Estado vacío -->
        <div v-if="filteredClients.length === 0" class="text-center py-12">
          <div class="w-16 h-16 bg-neutral-light rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="text-2xl">👥</span>
          </div>
          <h3 class="text-lg font-semibold text-neutral-dark mb-2">No se encontraron clientes</h3>
          <p class="text-neutral-medium">Intenta con otros términos de búsqueda</p>
        </div>
      </div>
    </div>

    <!-- Modal agregar/editar mejorado -->
    <div
      v-if="showModal"
      class="fixed inset-0 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-neutral-light">
        <!-- Header del modal -->
        <div class="bg-gradient-to-r from-primary-mint to-teal-500 p-6 text-white rounded-t-2xl">
          <div class="flex justify-between items-start">
            <div>
              <h2 class="text-xl font-bold mb-1">
                {{ editingClient ? "Editar Cliente" : "Agregar Cliente" }}
              </h2>
              <p class="text-sm opacity-90">
                {{ editingClient ? "Actualiza la información del cliente" : "Registra un nuevo cliente en el sistema" }}
              </p>
            </div>
            <button @click="closeModal" 
                    class="text-white hover:text-neutral-light transition-colors p-1 text-lg">
              ✕
            </button>
          </div>
        </div>

        <!-- Contenido del modal -->
        <div class="p-6">
          <form @submit.prevent="saveClient">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block mb-3 font-semibold text-neutral-dark text-sm">Nombre</label>
                <input 
                  v-model="form.name" 
                  type="text" 
                  required 
                  placeholder="Ingresa el nombre"
                  class="w-full p-3 border border-neutral-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-mint bg-white transition-all"
                />
              </div>
              <div>
                <label class="block mb-3 font-semibold text-neutral-dark text-sm">Apellido</label>
                <input 
                  v-model="form.lastname" 
                  type="text" 
                  required 
                  placeholder="Ingresa el apellido"
                  class="w-full p-3 border border-neutral-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-mint bg-white transition-all"
                />
              </div>
              <div class="md:col-span-2">
                <label class="block mb-3 font-semibold text-neutral-dark text-sm">Correo Electrónico</label>
                <input 
                  v-model="form.email" 
                  type="email" 
                  required 
                  placeholder="correo@ejemplo.com"
                  class="w-full p-3 border border-neutral-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-mint bg-white transition-all"
                />
              </div>
              <div>
                <label class="block mb-3 font-semibold text-neutral-dark text-sm">Teléfono</label>
                <input 
                  v-model="form.phone" 
                  type="text" 
                  required 
                  placeholder="+58 412 1234567"
                  class="w-full p-3 border border-neutral-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-mint bg-white transition-all"
                />
              </div>
              <div>
                <label class="block mb-3 font-semibold text-neutral-dark text-sm">Cédula</label>
                <input 
                  v-model="form.cedula" 
                  type="text" 
                  required 
                  placeholder="V-12345678"
                  class="w-full p-3 border border-neutral-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-mint bg-white transition-all"
                />
              </div>
              <div class="md:col-span-2">
                <label class="block mb-3 font-semibold text-neutral-dark text-sm">Fecha de Nacimiento</label>
                <input 
                  v-model="form.birthdate" 
                  type="date" 
                  required 
                  class="w-full p-3 border border-neutral-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-mint bg-white transition-all"
                />
              </div>
              <div v-if="!editingClient" class="md:col-span-2">
                <label class="block mb-3 font-semibold text-neutral-dark text-sm">Contraseña Temporal</label>
                <input 
                  v-model="form.password" 
                  type="password" 
                  required 
                  placeholder="••••••••"
                  class="w-full p-3 border border-neutral-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-mint bg-white transition-all"
                />
                <p class="text-xs text-neutral-medium mt-2">El cliente podrá cambiar esta contraseña después</p>
              </div>
            </div>

            <!-- Botones de acción -->
            <div class="flex gap-3 mt-8">
              <button 
                type="button" 
                @click="closeModal"
                class="flex-1 bg-neutral-light text-neutral-dark py-3 rounded-lg font-semibold hover:bg-neutral-medium transition-all duration-300"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                class="flex-1 bg-primary-mint text-white py-3 rounded-lg font-semibold hover:bg-state-success transition-all duration-300"
              >
                {{ editingClient ? 'Actualizar' : 'Crear Cliente' }}
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
      const query = this.searchQuery.toLowerCase();
      return this.clients.filter((c) =>
        `${c.name} ${c.lastname} ${c.email} ${c.cedula}`.toLowerCase().includes(query)
      );
    },
    activeClients() {
      return this.clients.length; // En una app real, esto vendría del backend
    },
    newThisMonth() {
      return Math.floor(this.clients.length * 0.15); // Ejemplo
    },
    withPets() {
      return Math.floor(this.clients.length * 0.65); // Ejemplo
    }
  },
  methods: {
    getInitials(name, lastname) {
      return `${name?.charAt(0) || ''}${lastname?.charAt(0) || ''}`.toUpperCase();
    },
    
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
        alert("Error al guardar el cliente: " + (err.response?.data?.message || err.message));
      }
    },
    editClient(client) {
      this.editingClient = client;
      this.form = { ...client, password: "" };
      this.showModal = true;
    },
    async deleteClient(id) {
      if (!confirm("¿Estás seguro de que quieres eliminar este cliente?")) return;
      try {
        await api.delete(`/admin/clients/${id}`);
        this.clients = this.clients.filter((c) => c._id !== id);
      } catch (err) {
        console.error("❌ Error al eliminar cliente:", err);
        alert("Error al eliminar el cliente");
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