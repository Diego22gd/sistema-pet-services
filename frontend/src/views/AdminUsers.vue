<template>
  <AdminLayout>
    <div class="px-6 max-w-7xl mx-auto w-full pt-8 mt-12">
      <!-- Header de la página -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-neutral-dark mb-2">Gestión de Usuarios</h1>
        <p class="text-neutral-medium text-lg">Administra todos los usuarios del sistema</p>
      </div>

      <!-- Barra de búsqueda y filtros -->
      <div class="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-neutral-light">
        <div class="flex flex-col md:flex-row gap-4 items-center">
          <div class="relative flex-1 w-full md:max-w-md">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-medium">🔍</span>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar usuarios por nombre o email..."
              class="w-full pl-10 pr-4 py-3 border border-neutral-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-mint focus:border-transparent transition-all duration-300 bg-neutral-bg"
            />
          </div>
          
          <select
            v-model="filterRole"
            class="w-full md:w-48 px-4 py-3 border border-neutral-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-mint bg-white transition-all"
          >
            <option value="">Todos los roles</option>
            <option value="client">Cliente</option>
            <option value="provider">Proveedor</option>
            <option value="admin">Administrador</option>
          </select>

          <button
            @click="addUser"
            class="bg-primary-mint text-white px-6 py-3 rounded-xl font-semibold hover:bg-state-success transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl flex items-center space-x-2 whitespace-nowrap"
          >
            <span>+</span>
            <span>Agregar Usuario</span>
          </button>
        </div>
      </div>

      <!-- Tarjetas de estadísticas -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white rounded-xl p-4 shadow-sm border border-neutral-light">
          <div class="text-2xl font-bold text-primary-mint">{{ users.length }}</div>
          <div class="text-sm text-neutral-medium">Total Usuarios</div>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm border border-neutral-light">
          <div class="text-2xl font-bold text-blue-600">{{ clientCount }}</div>
          <div class="text-sm text-neutral-medium">Clientes</div>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm border border-neutral-light">
          <div class="text-2xl font-bold text-green-600">{{ providerCount }}</div>
          <div class="text-sm text-neutral-medium">Proveedores</div>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm border border-neutral-light">
          <div class="text-2xl font-bold text-purple-600">{{ adminCount }}</div>
          <div class="text-sm text-neutral-medium">Administradores</div>
        </div>
      </div>

      <!-- Tabla de usuarios mejorada -->
      <div class="bg-white rounded-2xl shadow-lg border border-neutral-light overflow-hidden mb-4">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gradient-to-r from-primary-mint to-teal-500 text-white">
              <tr>
                <th class="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Usuario</th>
                <th class="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Información</th>
                <th class="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Rol</th>
                <th class="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Estado</th>
                <th class="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-neutral-light">
              <tr
                v-for="user in filteredUsers"
                :key="user._id"
                class="hover:bg-neutral-bg transition-colors duration-200 group"
              >
                <!-- Información del usuario -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="w-10 h-10 bg-primary-mint/10 rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                      <span class="text-primary-mint font-semibold text-sm">
                        {{ getInitials(user.name) }}
                      </span>
                    </div>
                    <div>
                      <div class="font-semibold text-neutral-dark">{{ user.name }}</div>
                      <div class="text-sm text-neutral-medium">ID: {{ user._id.slice(-6) }}</div>
                    </div>
                  </div>
                </td>

                <!-- Información de contacto -->
                <td class="px-6 py-4">
                  <div class="text-sm font-medium text-neutral-dark">{{ user.email }}</div>
                  <div class="text-sm text-neutral-medium">Registrado: {{ formatDate(user.createdAt) }}</div>
                </td>

                <!-- Rol -->
                <td class="px-6 py-4">
                  <span :class="getRoleBadgeClass(user.role)" class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold">
                    {{ getRoleText(user.role) }}
                  </span>
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
                      @click="editUser(user)"
                      class="bg-secondary text-white px-4 py-2 rounded-lg font-semibold hover:bg-secondary-dark transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center space-x-1 text-sm"
                    >
                      <span>✏️</span>
                      <span>Editar</span>
                    </button>
                    <button
                      @click="deleteUser(user._id)"
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
        <div v-if="filteredUsers.length === 0" class="text-center py-12">
          <div class="w-16 h-16 bg-neutral-light rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="text-2xl">👥</span>
          </div>
          <h3 class="text-lg font-semibold text-neutral-dark mb-2">No se encontraron usuarios</h3>
          <p class="text-neutral-medium">Intenta con otros términos de búsqueda</p>
        </div>
      </div>
    </div>

    <!-- Modal editar usuario mejorado -->
    <div
      v-if="showModal"
      class="fixed inset-0 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-neutral-light">
        <!-- Header del modal -->
        <div class="bg-gradient-to-r from-primary-mint to-teal-500 p-6 text-white rounded-t-2xl">
          <div class="flex justify-between items-start">
            <div>
              <h2 class="text-xl font-bold mb-1">Editar Usuario</h2>
              <p class="text-sm opacity-90">Actualiza la información del usuario</p>
            </div>
            <button @click="closeModal" 
                    class="text-white hover:text-neutral-light transition-colors p-1 text-lg">
              ✕
            </button>
          </div>
        </div>

        <!-- Contenido del modal -->
        <div class="p-6">
          <form @submit.prevent="saveEdit">
            <div class="space-y-4">
              <div>
                <label class="block mb-2 font-semibold text-neutral-dark text-sm">Nombre Completo</label>
                <input
                  v-model="editData.name"
                  type="text"
                  required
                  placeholder="Ingresa el nombre completo"
                  class="w-full p-3 border border-neutral-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-mint bg-white transition-all"
                />
              </div>
              
              <div>
                <label class="block mb-2 font-semibold text-neutral-dark text-sm">Correo Electrónico</label>
                <input
                  v-model="editData.email"
                  type="email"
                  required
                  placeholder="correo@ejemplo.com"
                  class="w-full p-3 border border-neutral-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-mint bg-white transition-all"
                />
              </div>
              
              <div>
                <label class="block mb-2 font-semibold text-neutral-dark text-sm">Rol del Usuario</label>
                <select
                  v-model="editData.role"
                  class="w-full p-3 border border-neutral-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-mint bg-white transition-all"
                >
                  <option value="client">Cliente</option>
                  <option value="provider">Proveedor</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>

            <!-- Botones de acción -->
            <div class="flex gap-3 mt-6">
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
                Guardar Cambios
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
  name: "AdminUsers",
  components: { AdminLayout, Chatbot },
  data() {
    return {
      searchQuery: "",
      filterRole: "",
      users: [],
      showModal: false,
      editData: { _id: "", name: "", email: "", role: "" },
    };
  },
  computed: {
    filteredUsers() {
      return this.users.filter((user) => {
        const matchesSearch =
          user.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(this.searchQuery.toLowerCase());
        const matchesRole = this.filterRole ? user.role === this.filterRole : true;
        return matchesSearch && matchesRole;
      });
    },
    clientCount() {
      return this.users.filter(user => user.role === 'client').length;
    },
    providerCount() {
      return this.users.filter(user => user.role === 'provider').length;
    },
    adminCount() {
      return this.users.filter(user => user.role === 'admin').length;
    }
  },
  methods: {
    getInitials(name) {
      return name?.charAt(0)?.toUpperCase() || 'U';
    },

    getRoleText(role) {
      const roles = {
        'client': 'Cliente',
        'provider': 'Proveedor',
        'admin': 'Administrador'
      };
      return roles[role] || role;
    },

    getRoleBadgeClass(role) {
      const classes = {
        'client': 'bg-blue-100 text-blue-800',
        'provider': 'bg-green-100 text-green-800',
        'admin': 'bg-purple-100 text-purple-800'
      };
      return classes[role] || 'bg-gray-100 text-gray-800';
    },

    formatDate(date) {
      if (!date) return 'N/A';
      return new Date(date).toLocaleDateString("es-VE");
    },

    async fetchUsers() {
      try {
        const res = await api.get("/admin/users");
        this.users = res.data;
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    },
    
    addUser() {
      alert("Funcionalidad en desarrollo: Agregar Usuario");
    },
    
    editUser(user) {
      this.editData = { ...user };
      this.showModal = true;
    },
    
    closeModal() {
      this.showModal = false;
    },
    
    async saveEdit() {
      try {
        const res = await api.put(`/admin/users/${this.editData._id}`, this.editData);
        const index = this.users.findIndex((u) => u._id === this.editData._id);
        if (index !== -1) this.users[index] = res.data;
        this.closeModal();
      } catch (error) {
        console.error("Error updating user:", error);
        alert("Error al actualizar el usuario");
      }
    },
    
    async deleteUser(id) {
      if (!confirm("¿Estás seguro de que quieres eliminar este usuario?")) return;
      try {
        await api.delete(`/admin/users/${id}`);
        this.users = this.users.filter((u) => u._id !== id);
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Error al eliminar el usuario");
      }
    },
  },
  mounted() {
    this.fetchUsers();
  },
};
</script>