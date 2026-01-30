<template>
  <AdminLayout>
    <div class="px-6 max-w-7xl mx-auto w-full pt-8 mt-12 fade-up" :class="{ 'show': true }">
      <!-- Header de la página -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">Gestión de Clientes</h1>
        <p class="text-gray-600 text-lg">Administra y gestiona todos los clientes del sistema</p>
      </div>

      <!-- Barra de búsqueda y acciones -->
      <div class="card-modern p-6 mb-8">
        <div class="flex flex-col md:flex-row justify-between items-center gap-4">
          <div class="relative flex-1 w-full md:max-w-md">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar clientes por nombre, apellido o correo..."
              class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-gray-50"
            />
          </div>
          
          <!-- Filtros -->
          <div class="flex flex-wrap gap-2">
            <select
              v-model="filterStatus"
              class="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white transition-all"
            >
              <option value="">Todos los estados</option>
              <option value="active">Activo</option>
              <option value="blocked">Bloqueado</option>
            </select>
          </div>
          
          <button
            @click="openModal"
            class="btn-primary-purple flex items-center space-x-2 whitespace-nowrap"
          >
            <span>+</span>
            <span>Agregar Cliente</span>
          </button>
        </div>
      </div>

      <!-- Tarjeta de estadísticas -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div class="card-modern p-4">
          <div class="text-2xl font-bold text-purple-600">{{ clients.length }}</div>
          <div class="text-sm text-gray-500">Total Clientes</div>
        </div>
        <div class="card-modern p-4">
          <div class="text-2xl font-bold text-green-600">{{ activeClients }}</div>
          <div class="text-sm text-gray-500">Activos</div>
        </div>
        <div class="card-modern p-4">
          <div class="text-2xl font-bold text-red-600">{{ blockedClients }}</div>
          <div class="text-sm text-gray-500">Bloqueados</div>
        </div>
        <div class="card-modern p-4">
          <div class="text-2xl font-bold text-yellow-600">{{ newThisMonth }}</div>
          <div class="text-sm text-gray-500">Nuevos este mes</div>
        </div>
        <div class="card-modern p-4">
          <div class="text-2xl font-bold text-blue-600">{{ withPets }}</div>
          <div class="text-sm text-gray-500">Con mascotas</div>
        </div>
      </div>

      <!-- Tabla de clientes mejorada -->
      <div class="card-modern overflow-hidden mb-4">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gradient-to-r from-purple-600 to-purple-800 text-white">
              <tr>
                <th class="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Cliente</th>
                <th class="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Contacto</th>
                <th class="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Información</th>
                <th class="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Estado</th>
                <th class="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr
                v-for="client in filteredClients"
                :key="client._id"
                :class="client.isActive === false ? 'bg-red-50' : 'hover:bg-gray-50'"
                class="transition-colors duration-200 group"
              >
                <!-- Información del cliente -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                      <span class="text-purple-600 font-semibold text-sm">
                        {{ getInitials(client.name, client.lastname) }}
                      </span>
                    </div>
                    <div>
                      <div class="font-semibold text-gray-800">{{ client.name }} {{ client.lastname }}</div>
                      <div class="text-sm text-gray-500">ID: {{ client._id.slice(-6) }}</div>
                    </div>
                  </div>
                </td>

                <!-- Contacto -->
                <td class="px-6 py-4">
                  <div class="text-sm font-medium text-gray-800">{{ client.email }}</div>
                  <div class="text-sm text-gray-500">{{ client.phone || 'Sin teléfono' }}</div>
                  <div class="text-xs text-gray-400 mt-1">
                    Registrado: {{ formatDate(client.createdAt) }}
                  </div>
                </td>

                <!-- Información adicional -->
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-800">Cédula: {{ client.cedula || 'No registrada' }}</div>
                  <div class="text-sm text-gray-500">Nac: {{ formatDate(client.birthdate) }}</div>
                  <div v-if="client.pets && client.pets.length > 0" class="text-xs text-blue-600 mt-1">
                    {{ client.pets.length }} mascota(s)
                  </div>
                </td>

                <!-- Estado -->
                <td class="px-6 py-4">
                  <span 
                    :class="client.isActive === false 
                      ? 'badge-outline-admin bg-red-100 text-red-800 border-red-400' 
                      : 'badge-outline-admin bg-green-100 text-green-800 border-green-400'"
                    class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                  >
                    <span 
                      class="w-2 h-2 rounded-full mr-2"
                      :class="client.isActive === false ? 'bg-red-500' : 'bg-green-500'"
                    ></span>
                    {{ client.isActive === false ? 'Bloqueado' : 'Activo' }}
                  </span>
                </td>

                <!-- Acciones -->
                <td class="px-6 py-4">
                  <div class="flex items-center space-x-2">
                    <button
                      @click="editClient(client)"
                      class="btn-details-admin"
                      title="Editar cliente"
                    >
                      <span>✏️</span>
                      <span>Editar</span>
                    </button>
                    
                    <!-- Botón de bloquear/activar -->
                    <button
                      @click="toggleClientStatus(client)"
                      :class="client.isActive === false 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-amber-600 hover:bg-amber-700'"
                      class="flex items-center space-x-1 px-3 py-2 rounded-lg text-white font-medium text-sm transition-all duration-200 shadow-sm hover:shadow-md"
                      :title="client.isActive === false ? 'Activar cuenta' : 'Bloquear cuenta'"
                    >
                      <span>{{ client.isActive === false ? '✅' : '⛔' }}</span>
                      <span>{{ client.isActive === false ? 'Activar' : 'Bloquear' }}</span>
                    </button>
                    
                    <button
                      @click="deleteClient(client._id)"
                      class="btn-cancel-admin"
                      title="Eliminar cliente"
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
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="text-2xl">👥</span>
          </div>
          <h3 class="text-lg font-semibold text-gray-800 mb-2">No se encontraron clientes</h3>
          <p class="text-gray-500">Intenta con otros términos de búsqueda</p>
        </div>
      </div>
    </div>

    <!-- Modal agregar/editar mejorado -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-modern-box w-full max-w-2xl">
        <!-- Header del modal -->
        <div class="modal-modern-header">
          <div class="flex justify-between items-start">
            <div>
              <h2 class="modal-section-title-admin">
                {{ editingClient ? "Editar Cliente" : "Agregar Cliente" }}
              </h2>
              <p class="text-gray-600 text-sm">
                {{ editingClient ? "Actualiza la información del cliente" : "Registra un nuevo cliente en el sistema" }}
              </p>
            </div>
            <button @click="closeModal" class="btn-modal-close">
              ✕
            </button>
          </div>
        </div>

        <!-- Contenido del modal -->
        <div class="modal-modern-content">
          <form @submit.prevent="saveClient">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block mb-3 font-semibold text-gray-700 text-sm">Nombre</label>
                <input 
                  v-model="form.name" 
                  type="text" 
                  required 
                  placeholder="Ingresa el nombre"
                  class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white transition-all"
                />
              </div>
              <div>
                <label class="block mb-3 font-semibold text-gray-700 text-sm">Apellido</label>
                <input 
                  v-model="form.lastname" 
                  type="text" 
                  required 
                  placeholder="Ingresa el apellido"
                  class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white transition-all"
                />
              </div>
              <div class="md:col-span-2">
                <label class="block mb-3 font-semibold text-gray-700 text-sm">Correo Electrónico</label>
                <input 
                  v-model="form.email" 
                  type="email" 
                  required 
                  placeholder="correo@ejemplo.com"
                  class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white transition-all"
                />
              </div>
              <div>
                <label class="block mb-3 font-semibold text-gray-700 text-sm">Teléfono</label>
                <input 
                  v-model="form.phone" 
                  type="text" 
                  required 
                  placeholder="+58 412 1234567"
                  class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white transition-all"
                />
              </div>
              <div>
                <label class="block mb-3 font-semibold text-gray-700 text-sm">Cédula</label>
                <input 
                  v-model="form.cedula" 
                  type="text" 
                  required 
                  placeholder="V-12345678"
                  class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white transition-all"
                />
              </div>
              <div class="md:col-span-2">
                <label class="block mb-3 font-semibold text-gray-700 text-sm">Fecha de Nacimiento</label>
                <input 
                  v-model="form.birthdate" 
                  type="date" 
                  required 
                  class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white transition-all"
                />
              </div>
              
              <!-- Estado de la cuenta -->
              <div class="md:col-span-2">
                <label class="block mb-3 font-semibold text-gray-700 text-sm">Estado de la Cuenta</label>
                <div class="flex items-center space-x-6">
                  <label class="flex items-center">
                    <input
                      type="radio"
                      v-model="form.isActive"
                      :value="true"
                      class="mr-2 h-4 w-4 text-green-600"
                    />
                    <span class="text-sm text-gray-700">Activo</span>
                  </label>
                  <label class="flex items-center">
                    <input
                      type="radio"
                      v-model="form.isActive"
                      :value="false"
                      class="mr-2 h-4 w-4 text-red-600"
                    />
                    <span class="text-sm text-gray-700">Bloqueado</span>
                  </label>
                </div>
                <p class="text-xs text-gray-500 mt-2">
                  * Los clientes bloqueados no podrán iniciar sesión en el sistema
                </p>
              </div>

              <div v-if="!editingClient" class="md:col-span-2">
                <label class="block mb-3 font-semibold text-gray-700 text-sm">Contraseña Temporal</label>
                <input 
                  v-model="form.password" 
                  type="password" 
                  required 
                  placeholder="••••••••"
                  class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white transition-all"
                />
                <p class="text-xs text-gray-500 mt-2">El cliente podrá cambiar esta contraseña después</p>
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
                {{ editingClient ? 'Actualizar' : 'Crear Cliente' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal de confirmación para bloquear/activar -->
    <div v-if="showStatusModal" class="modal-overlay">
      <div class="modal-modern-box w-full max-w-md">
        <div class="modal-modern-header">
          <div class="flex justify-between items-start">
            <div>
              <h2 class="modal-section-title-admin">
                {{ statusAction === 'block' ? '🔒 Bloquear Cliente' : '✅ Activar Cliente' }}
              </h2>
              <p class="text-gray-600 text-sm">
                {{ statusAction === 'block' 
                  ? 'El cliente no podrá iniciar sesión en el sistema.' 
                  : 'El cliente podrá acceder nuevamente al sistema.' }}
              </p>
            </div>
            <button @click="closeStatusModal" class="btn-modal-close">
              ✕
            </button>
          </div>
        </div>

        <div class="modal-modern-content">
          <div class="p-4 bg-gray-50 rounded-lg mb-6">
            <div class="flex items-center space-x-3">
              <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <span class="text-purple-600 font-semibold">
                  {{ getInitials(selectedClient?.name, selectedClient?.lastname) }}
                </span>
              </div>
              <div>
                <h4 class="font-semibold text-gray-800">{{ selectedClient?.name }} {{ selectedClient?.lastname }}</h4>
                <p class="text-sm text-gray-600">{{ selectedClient?.email }}</p>
                <p class="text-xs text-gray-500">Cédula: {{ selectedClient?.cedula || 'No registrada' }}</p>
              </div>
            </div>
          </div>

          <div class="modal-modern-actions">
            <button 
              type="button" 
              @click="closeStatusModal"
              class="btn-modal-ghost"
            >
              Cancelar
            </button>
            <button 
              type="button" 
              @click="confirmToggleStatus"
              :class="statusAction === 'block' 
                ? 'bg-amber-600 hover:bg-amber-700' 
                : 'bg-green-600 hover:bg-green-700'"
              class="px-6 py-3 rounded-lg text-white font-medium transition-all shadow-sm hover:shadow-md"
            >
              {{ statusAction === 'block' ? 'Confirmar Bloqueo' : 'Confirmar Activación' }}
            </button>
          </div>
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
  components: { AdminLayout, Chatbot },
  data() {
    return {
      searchQuery: "",
      filterStatus: "",
      showModal: false,
      showStatusModal: false,
      editingClient: null,
      selectedClient: null,
      statusAction: 'block',
      form: {
        name: "",
        lastname: "",
        email: "",
        phone: "",
        cedula: "",
        birthdate: "",
        password: "",
        isActive: true,
      },
      clients: [],
    };
  },
  computed: {
    filteredClients() {
      let filtered = this.clients;
      
      // Filtrar por búsqueda
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter((c) =>
          `${c.name} ${c.lastname} ${c.email} ${c.cedula} ${c.phone}`.toLowerCase().includes(query)
        );
      }
      
      // Filtrar por estado
      if (this.filterStatus) {
        filtered = filtered.filter(c => {
          switch(this.filterStatus) {
            case 'active':
              return c.isActive !== false;
            case 'blocked':
              return c.isActive === false;
            default:
              return true;
          }
        });
      }
      
      return filtered;
    },
    activeClients() {
      return this.clients.filter(c => c.isActive !== false).length;
    },
    blockedClients() {
      return this.clients.filter(c => c.isActive === false).length;
    },
    newThisMonth() {
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      return this.clients.filter(c => {
        const createdDate = new Date(c.createdAt);
        return createdDate.getMonth() === currentMonth && 
               createdDate.getFullYear() === currentYear;
      }).length;
    },
    withPets() {
      return this.clients.filter(c => c.pets && c.pets.length > 0).length;
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
        isActive: true,
      };
    },
    
    closeModal() {
      this.showModal = false;
    },
    
    async saveClient() {
      try {
        // Crear objeto sin password si está vacío durante edición
        const formData = { ...this.form, role: 'client' };
        
        if (this.editingClient) {
          // Para edición: eliminar password si está vacío
          if (!formData.password || formData.password.trim() === "") {
            delete formData.password;
          }
          
          const { data } = await api.put(`/admin/clients/${this.editingClient._id}`, formData);
          const index = this.clients.findIndex((c) => c._id === data._id);
          if (index !== -1) {
            this.clients.splice(index, 1, data);
          }
          this.closeModal();
          alert("✅ Cliente actualizado exitosamente");
          
        } else {
          // Para creación: validar que tenga password
          if (!formData.password || formData.password.trim() === "") {
            alert("⚠️ La contraseña es obligatoria para nuevos clientes");
            return;
          }
          
          const { data } = await api.post("/admin/clients", formData);
          this.clients.push(data);
          this.closeModal();
          alert("✅ Cliente creado exitosamente");
        }
        
      } catch (err) {
        console.error("❌ Error al guardar cliente:", err);
        
        let errorMessage = "Error al guardar el cliente";
        
        if (err.response) {
          const serverError = err.response.data;
          
          if (serverError.message) {
            errorMessage = serverError.message;
          } else if (typeof serverError === 'string') {
            errorMessage = serverError;
          } else if (serverError.error) {
            errorMessage = serverError.error;
          }
        } else if (err.request) {
          errorMessage = "No se pudo conectar con el servidor. Verifica tu conexión a internet.";
        } else {
          errorMessage = err.message || "Error desconocido";
        }
        
        alert(`❌ ${errorMessage}`);
      }
    },
    
    editClient(client) {
      this.editingClient = client;
      this.form = { 
        ...client, 
        password: "",
        birthdate: client.birthdate ? this.formatDateForInput(client.birthdate) : "",
        isActive: client.isActive !== undefined ? client.isActive : true
      };
      this.showModal = true;
    },
    
    async deleteClient(id) {
      if (!confirm("¿Estás seguro de que quieres eliminar este cliente?")) return;
      
      try {
        await api.delete(`/admin/clients/${id}`);
        this.clients = this.clients.filter((c) => c._id !== id);
        alert("✅ Cliente eliminado exitosamente");
      } catch (err) {
        console.error("❌ Error al eliminar cliente:", err);
        alert("Error al eliminar el cliente: " + (err.response?.data?.message || err.message));
      }
    },
    
    formatDate(date) {
      if (!date) return "-";
      return new Date(date).toLocaleDateString("es-VE", {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    },
    
    // Formato especial para input type="date" (YYYY-MM-DD)
    formatDateForInput(dateString) {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    },
    
    toggleClientStatus(client) {
      this.selectedClient = client;
      this.statusAction = client.isActive === false ? 'activate' : 'block';
      this.showStatusModal = true;
    },

    closeStatusModal() {
      this.showStatusModal = false;
      this.selectedClient = null;
      this.statusAction = 'block';
    },

    async confirmToggleStatus() {
      if (!this.selectedClient) return;
      
      const clientId = this.selectedClient._id;
      const newStatus = this.statusAction === 'activate';
      
      try {
        // Usar la misma ruta que en la gestión de usuarios
        const res = await api.patch(`/admin/users/${clientId}/toggle-status`);
        
        if (res.data.success) {
          // Actualizar el cliente en la lista
          const index = this.clients.findIndex(c => c._id === clientId);
          if (index !== -1) {
            this.clients[index].isActive = newStatus;
          }
          
          alert(res.data.message || `Cliente ${newStatus ? 'activado' : 'bloqueado'} exitosamente`);
        } else {
          alert(res.data.message || "Error al cambiar el estado");
        }
      } catch (error) {
        console.error("Error toggling client status:", error);
        
        // Intentar método alternativo
        try {
          // Actualizar directamente el campo isActive
          const updateRes = await api.put(`/admin/clients/${clientId}`, {
            isActive: newStatus
          });
          
          if (updateRes.data) {
            const index = this.clients.findIndex(c => c._id === clientId);
            if (index !== -1) {
              this.clients[index].isActive = newStatus;
            }
            alert(`Cliente ${newStatus ? 'activado' : 'bloqueado'} exitosamente`);
          }
        } catch (altError) {
          console.error("Alternative update also failed:", altError);
          alert("Error al cambiar el estado del cliente");
        }
      }
      
      this.closeStatusModal();
    }
  },
  
  mounted() {
    this.fetchClients();
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
  background: linear-gradient(135deg, #10b981, #0d9488);
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

/* Botón de bloquear/activar - COLOR #f59e0b */
.bg-amber-600 {
  background-color: #f59e0b !important;
}

.bg-amber-600:hover {
  background-color: #d97706 !important;
}

.bg-amber-700:hover {
  background-color: #b45309 !important;
}

/* Botón verde para activar */
.bg-green-600 {
  background-color: #22c55e !important;
}

.bg-green-600:hover {
  background-color: #16a34a !important;
}

.bg-green-700:hover {
  background-color: #15803d !important;
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

/* Resto de estilos del modal (se mantienen igual) */
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

/* Responsive */
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
  
  .grid.grid-cols-5 {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>