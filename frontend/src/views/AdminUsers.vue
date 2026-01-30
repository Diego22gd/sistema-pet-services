<template>
  <AdminLayout>
    <div class="px-6 max-w-7xl mx-auto w-full pt-8 mt-12 fade-up" :class="{ 'show': true }">
      <!-- Header de la página -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">Gestión de Usuarios</h1>
        <p class="text-gray-600 text-lg">Administra todos los usuarios del sistema</p>
      </div>

      <!-- Barra de búsqueda y filtros -->
      <div class="card-modern p-6 mb-8">
        <div class="flex flex-col md:flex-row gap-4 items-center">
          <div class="relative flex-1 w-full md:max-w-md">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar usuarios por nombre o email..."
              class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-gray-50"
            />
          </div>
          
          <select
            v-model="filterRole"
            class="w-full md:w-48 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white transition-all"
          >
            <option value="">Todos los roles</option>
            <option value="client">Cliente</option>
            <option value="provider">Proveedor</option>
            <option value="admin">Administrador</option>
          </select>

          <select
            v-model="filterStatus"
            class="w-full md:w-48 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white transition-all"
          >
            <option value="">Todos los estados</option>
            <option value="active">Activo</option>
            <option value="blocked">Bloqueado</option>
          </select>

          <button
            @click="addUser"
            class="btn-primary-purple flex items-center space-x-2 whitespace-nowrap"
          >
            <span>+</span>
            <span>Agregar Usuario</span>
          </button>
        </div>
      </div>

      <!-- Tarjetas de estadísticas -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="card-modern p-4">
          <div class="text-2xl font-bold text-purple-600">{{ users.length }}</div>
          <div class="text-sm text-gray-500">Total Usuarios</div>
        </div>
        <div class="card-modern p-4">
          <div class="text-2xl font-bold text-blue-600">{{ clientCount }}</div>
          <div class="text-sm text-gray-500">Clientes</div>
        </div>
        <div class="card-modern p-4">
          <div class="text-2xl font-bold text-green-600">{{ providerCount }}</div>
          <div class="text-sm text-gray-500">Proveedores</div>
        </div>
        <div class="card-modern p-4">
          <div class="text-2xl font-bold text-purple-600">{{ adminCount }}</div>
          <div class="text-sm text-gray-500">Administradores</div>
        </div>
      </div>

      <!-- Tabla de usuarios mejorada -->
      <div class="card-modern overflow-hidden mb-4">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gradient-to-r from-purple-600 to-purple-800 text-white">
              <tr>
                <th class="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Usuario</th>
                <th class="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Información</th>
                <th class="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Rol</th>
                <th class="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Estado</th>
                <th class="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr
                v-for="user in filteredUsers"
                :key="user._id"
                class="hover:bg-gray-50 transition-colors duration-200 group"
              >
                <!-- Información del usuario -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                      <span class="text-purple-600 font-semibold text-sm">
                        {{ getInitials(user.name) }}
                      </span>
                    </div>
                    <div>
                      <div class="font-semibold text-gray-800">{{ user.name }}</div>
                      <div class="text-sm text-gray-500">ID: {{ user._id.slice(-6) }}</div>
                    </div>
                  </div>
                </td>

                <!-- Información de contacto -->
                <td class="px-6 py-4">
                  <div class="text-sm font-medium text-gray-800">{{ user.email }}</div>
                  <div class="text-sm text-gray-500">Registrado: {{ formatDate(user.createdAt) }}</div>
                </td>

                <!-- Rol -->
                <td class="px-6 py-4">
                  <span :class="getRoleBadgeClass(user.role)" class="badge-tag-admin">
                    {{ getRoleText(user.role) }}
                  </span>
                </td>

                <!-- Estado -->
                <td class="px-6 py-4">
                  <span 
                    :class="user.isActive 
                      ? 'badge-outline-admin bg-green-100 text-green-800 border-green-400' 
                      : 'badge-outline-admin bg-red-100 text-red-800 border-red-400'"
                  >
                    <span 
                      class="w-2 h-2 rounded-full mr-2"
                      :class="user.isActive ? 'bg-green-500' : 'bg-red-500'"
                    ></span>
                    {{ user.isActive ? 'Activo' : 'Bloqueado' }}
                  </span>
                </td>

                <!-- Acciones -->
                <td class="px-6 py-4">
                  <div class="flex items-center space-x-2">
                    <button
                      @click="editUser(user)"
                      class="btn-details-admin"
                    >
                      <span>✏️</span>
                      <span>Editar</span>
                    </button>
                    <button
                      @click="toggleUserStatus(user._id, user.isActive)"
                      :class="user.isActive 
                        ? 'btn-block-admin bg-amber-500 hover:bg-amber-600' 
                        : 'btn-confirm-admin'"
                      class="flex items-center space-x-1 px-3 py-2 rounded-lg text-white font-medium text-sm transition-all duration-200"
                    >
                      <span>{{ user.isActive ? '⛔' : '✅' }}</span>
                      <span>{{ user.isActive ? 'Bloquear' : 'Activar' }}</span>
                    </button>
                    <button
                      @click="deleteUser(user._id)"
                      class="btn-cancel-admin"
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
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="text-2xl">👥</span>
          </div>
          <h3 class="text-lg font-semibold text-gray-800 mb-2">No se encontraron usuarios</h3>
          <p class="text-gray-500">Intenta con otros términos de búsqueda</p>
        </div>
      </div>
    </div>

    <!-- Modal editar usuario mejorado -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-modern-box w-full max-w-md">
        <!-- Header del modal -->
        <div class="modal-modern-header">
          <div class="flex justify-between items-start">
            <div>
              <h2 class="modal-section-title-admin">Editar Usuario</h2>
              <p class="text-gray-600 text-sm">Actualiza la información del usuario</p>
            </div>
            <button @click="closeModal" class="btn-modal-close">
              ✕
            </button>
          </div>
        </div>

        <!-- Contenido del modal -->
        <div class="modal-modern-content">
          <form @submit.prevent="saveEdit">
            <div class="space-y-4">
              <div>
                <label class="block mb-2 font-semibold text-gray-700 text-sm">Nombre Completo</label>
                <input
                  v-model="editData.name"
                  type="text"
                  required
                  placeholder="Ingresa el nombre completo"
                  class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white transition-all"
                />
              </div>
              
              <div>
                <label class="block mb-2 font-semibold text-gray-700 text-sm">Correo Electrónico</label>
                <input
                  v-model="editData.email"
                  type="email"
                  required
                  placeholder="correo@ejemplo.com"
                  class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white transition-all"
                />
              </div>
              
              <div>
                <label class="block mb-2 font-semibold text-gray-700 text-sm">Rol del Usuario</label>
                <select
                  v-model="editData.role"
                  class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white transition-all"
                >
                  <option value="client">Cliente</option>
                  <option value="provider">Proveedor</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div>
                <label class="block mb-2 font-semibold text-gray-700 text-sm">Estado</label>
                <div class="flex items-center space-x-4">
                  <label class="flex items-center">
                    <input
                      type="radio"
                      v-model="editData.isActive"
                      :value="true"
                      class="mr-2"
                    />
                    <span class="text-sm">Activo</span>
                  </label>
                  <label class="flex items-center">
                    <input
                      type="radio"
                      v-model="editData.isActive"
                      :value="false"
                      class="mr-2"
                    />
                    <span class="text-sm">Bloqueado</span>
                  </label>
                </div>
              </div>
            </div>

            <!-- Botones de acción -->
            <div class="modal-modern-actions">
              <button 
                type="button" 
                @click="closeModal"
                class="btn-modal-ghost"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                class="btn-modal-primary-admin"
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
      filterStatus: "",
      users: [],
      showModal: false,
      editData: { _id: "", name: "", email: "", role: "", isActive: true },
    };
  },
  computed: {
    filteredUsers() {
      return this.users.filter((user) => {
        const matchesSearch =
          user.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(this.searchQuery.toLowerCase());
        const matchesRole = this.filterRole ? user.role === this.filterRole : true;
        const matchesStatus = this.filterStatus 
          ? (this.filterStatus === 'active' ? user.isActive : !user.isActive)
          : true;
        return matchesSearch && matchesRole && matchesStatus;
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
        'client': 'bg-blue-100 text-blue-800 border-blue-400',
        'provider': 'bg-green-100 text-green-800 border-green-400',
        'admin': 'bg-purple-100 text-purple-800 border-purple-400'
      };
      return classes[role] || 'bg-gray-100 text-gray-800 border-gray-400';
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

    async toggleUserStatus(id, currentStatus) {
      const action = currentStatus ? 'bloquear' : 'activar';
      if (!confirm(`¿Estás seguro de que quieres ${action} este usuario?`)) return;
      
      try {
        const res = await api.patch(`/admin/users/${id}/toggle-status`);
        const index = this.users.findIndex((u) => u._id === id);
        if (index !== -1) {
          this.users[index].isActive = !this.users[index].isActive;
        }
        alert(res.data.message || `Usuario ${action === 'bloquear' ? 'bloqueado' : 'activado'} exitosamente`);
      } catch (error) {
        console.error("Error toggling user status:", error);
        alert("Error al cambiar el estado del usuario");
      }
    },
  },
  mounted() {
    this.fetchUsers();
    // Agregar animación de entrada
    setTimeout(() => {
      const element = document.querySelector('.fade-up');
      if (element) element.classList.add('show');
    }, 100);
  },
};
</script>

<style scoped>
/* Estilos específicos para admin */
.fade-up {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-up.show {
  opacity: 1;
  transform: translateY(0);
}

.card-modern {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.card-modern:hover {
  border-color: #24c77e;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.1),
    0 0 0 1px #8b5cf6,
    0 0 20px rgba(139, 92, 246, 0.1);
}

/* Botón principal purple */
.btn-primary-purple {
  background: linear-gradient(135deg, #10b981, #0d9488);;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  transition: all 0.3s ease;
  box-shadow: 0 10px 25px rgba(139, 92, 246, 0.3);
  cursor: pointer;
}

.btn-primary-purple:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 
    0 15px 35px rgba(139, 92, 246, 0.4),
    0 0 0 2px rgba(255, 255, 255, 0.2);
  background: #10b981;
}

.btn-primary-purple:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Botón Bloquear - Color ámbar */
.btn-block-admin {
  display: inline-flex !important;
  align-items: center !important;
  padding: 0.25rem 0.5rem !important;
  background-color: #f59e0b !important;
  color: white !important;
  font-size: 0.75rem !important;
  font-weight: 500 !important;
  border-radius: 0.375rem !important;
  border: none !important;
  cursor: pointer !important;
  transition: all 0.2s !important;
}

.btn-block-admin:hover {
  background-color: #d97706 !important;
  transform: scale(1.1) !important;
}

/* Botones de acción admin */
.btn-details-admin {
  display: inline-flex !important;
  align-items: center !important;
  padding: 0.5rem 1rem !important;
  background-color: #a69eba !important;
  color: white !important;
  font-size: 0.875rem !important;
  font-weight: 500 !important;
  border-radius: 0.5rem !important;
  border: none !important;
  cursor: pointer !important;
  transition: all 0.2s !important;
  text-decoration: none !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
}

.btn-details-admin:hover {
  background-color: #3a46ed !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15) !important;
}

.btn-confirm-admin {
  display: inline-flex !important;
  align-items: center !important;
  padding: 0.25rem 0.5rem !important;
  background-color: #22c55e !important;
  color: white !important;
  font-size: 0.75rem !important;
  font-weight: 500 !important;
  border-radius: 0.375rem !important;
  border: none !important;
  cursor: pointer !important;
  transition: all 0.2s !important;
}

.btn-confirm-admin:hover {
  background-color: #16a34a !important;
  transform: scale(1.1) !important;
}

.btn-complete-admin {
  display: inline-flex !important;
  align-items: center !important;
  padding: 0.25rem 0.5rem !important;
  background-color: #3b82f6 !important;
  color: white !important;
  font-size: 0.75rem !important;
  font-weight: 500 !important;
  border-radius: 0.375rem !important;
  border: none !important;
  cursor: pointer !important;
  transition: all 0.2s !important;
}

.btn-complete-admin:hover {
  background-color: #2563eb !important;
  transform: scale(1.1) !important;
}

.btn-cancel-admin {
  display: inline-flex !important;
  align-items: center !important;
  padding: 0.25rem 0.5rem !important;
  background-color: #f43f5e !important;
  color: white !important;
  font-size: 0.75rem !important;
  font-weight: 500 !important;
  border-radius: 0.375rem !important;
  border: none !important;
  cursor: pointer !important;
  transition: all 0.2s !important;
}

.btn-cancel-admin:hover {
  background-color: #e11d48 !important;
  transform: scale(1.1) !important;
}

.btn-reschedule-admin {
  display: inline-flex !important;
  align-items: center !important;
  padding: 0.25rem 0.5rem !important;
  background-color: #10b981 !important;
  color: white !important;
  font-size: 0.75rem !important;
  font-weight: 500 !important;
  border-radius: 0.375rem !important;
  border: none !important;
  cursor: pointer !important;
  transition: all 0.2s !important;
}

.btn-reschedule-admin:hover {
  background-color: #4932d8 !important;
  transform: scale(1.1) !important;
}

/* Badges admin */
.badge-outline-admin {
  background: white;
  color: #10b981;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-weight: 600;
  font-size: 0.75rem;
  border: 1px solid #10b981;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.badge-tag-admin {
  background: #f5f3ff;
  color: #7c3aed;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.7rem;
  border: 1px solid #ddd6fe;
}

/* Modal section title admin */
.modal-section-title-admin {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.modal-section-title-admin span {
  color: #8b5cf6;
}

/* Botones del modal admin */
.btn-modal-primary-admin {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-modal-primary-admin:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(139, 92, 246, 0.3);
}

.btn-modal-primary-admin:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-modal-confirm-admin {
  display: inline-flex !important;
  align-items: center !important;
  padding: 0.75rem 1.5rem !important;
  background-color: #22c55e !important;
  color: white !important;
  font-weight: 600 !important;
  border-radius: 10px !important;
  border: none !important;
  cursor: pointer !important;
  transition: all 0.3s ease !important;
}

.btn-modal-confirm-admin:hover:not(:disabled) {
  background-color: #16a34a !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 10px 20px rgba(34, 197, 94, 0.3) !important;
}

.btn-modal-complete-admin {
  display: inline-flex !important;
  align-items: center !important;
  padding: 0.75rem 1.5rem !important;
  background-color: #3b82f6 !important;
  color: white !important;
  font-weight: 600 !important;
  border-radius: 10px !important;
  border: none !important;
  cursor: pointer !important;
  transition: all 0.3s ease !important;
}

.btn-modal-complete-admin:hover:not(:disabled) {
  background-color: #2563eb !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 10px 20px rgba(59, 130, 246, 0.3) !important;
}

.btn-modal-cancel-admin {
  display: inline-flex !important;
  align-items: center !important;
  padding: 0.75rem 1.5rem !important;
  background-color: #f43f5e !important;
  color: white !important;
  font-weight: 600 !important;
  border-radius: 10px !important;
  border: none !important;
  cursor: pointer !important;
  transition: all 0.3s ease !important;
}

.btn-modal-cancel-admin:hover:not(:disabled) {
  background-color: #e11d48 !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 10px 20px rgba(244, 63, 94, 0.3) !important;
}

.btn-modal-reschedule-admin {
  display: inline-flex !important;
  align-items: center !important;
  padding: 0.75rem 1.5rem !important;
  background-color: #a855f7 !important;
  color: white !important;
  font-weight: 600 !important;
  border-radius: 10px !important;
  border: none !important;
  cursor: pointer !important;
  transition: all 0.3s ease !important;
}

.btn-modal-reschedule-admin:hover:not(:disabled) {
  background-color: #9333ea !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 10px 20px rgba(168, 85, 247, 0.3) !important;
}

/* Estilos del modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-modern-box {
  background: white;
  border-radius: 24px;
  padding: 2rem;
  border: 1px solid #e5e7eb;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px #8b5cf6,
    0 0 40px rgba(139, 92, 246, 0.1);
  position: relative;
  overflow: hidden;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  max-width: 100%;
  width: 100%;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-modern-header {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.avatar-modern-lg {
  flex-shrink: 0;
}

.btn-modal-close {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f3f4f6;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-modal-close:hover {
  background: #e5e7eb;
  transform: rotate(90deg);
}

.modal-section {
  margin-bottom: 1.5rem;
}

.modal-modern-content {
  flex: 1;
  overflow-y: auto;
}

.modal-modern-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  align-items: center;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
  flex-wrap: wrap;
}

.btn-modal-ghost {
  background: transparent;
  color: #6b7280;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-modal-ghost:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #8b5cf6;
}

.animate-pulse {
  animation: pulse 2s ease-in-out infinite;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .modal-modern-box {
    padding: 1rem;
    max-height: 80vh;
  }
  
  .modal-modern-actions {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .btn-modal-primary-admin,
  .btn-modal-ghost {
    width: 100%;
    justify-content: center;
  }
  
  .text-5xl {
    font-size: 2.5rem;
  }
  
  .text-6xl {
    font-size: 3rem;
  }
  
  .grid.grid-cols-12 {
    grid-template-columns: 1fr;
  }
  
  .col-span-1,
  .col-span-2 {
    grid-column: span 1;
  }
}
</style>