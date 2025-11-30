<template>
  <AdminLayout>
    <div class="px-6 max-w-7xl mx-auto w-full pt-8">
      <!-- Header de la página -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-neutral-dark mb-2">Gestión de Proveedores</h1>
        <p class="text-neutral-medium text-lg">Administra y gestiona todos los proveedores del sistema</p>
      </div>

      <!-- Barra de búsqueda y acciones -->
      <div class="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-neutral-light">
        <div class="flex flex-col md:flex-row justify-between items-center gap-4">
          <div class="relative flex-1 w-full md:max-w-md">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-medium">🔍</span>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar proveedores por nombre, email o tipo de servicio..."
              class="w-full pl-10 pr-4 py-3 border border-neutral-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-mint focus:border-transparent transition-all duration-300 bg-neutral-bg"
            />
          </div>
          <button
            @click="openModal"
            class="bg-primary-mint text-white px-6 py-3 rounded-xl font-semibold hover:bg-state-success transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl flex items-center space-x-2 whitespace-nowrap"
          >
            <span>+</span>
            <span>Agregar Proveedor</span>
          </button>
        </div>
      </div>

      <!-- Tarjetas de estadísticas -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white rounded-xl p-4 shadow-sm border border-neutral-light">
          <div class="text-2xl font-bold text-primary-mint">{{ providers.length }}</div>
          <div class="text-sm text-neutral-medium">Total Proveedores</div>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm border border-neutral-light">
          <div class="text-2xl font-bold text-state-success">{{ activeProviders }}</div>
          <div class="text-sm text-neutral-medium">Activos</div>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm border border-neutral-light">
          <div class="text-2xl font-bold text-state-warning">{{ pausedProviders }}</div>
          <div class="text-sm text-neutral-medium">Pausados</div>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm border border-neutral-light">
          <div class="text-2xl font-bold text-secondary">{{ expiredSubscriptions }}</div>
          <div class="text-sm text-neutral-medium">Suscripciones Vencidas</div>
        </div>
      </div>

      <!-- Tabla de proveedores mejorada -->
      <div class="bg-white rounded-2xl shadow-lg border border-neutral-light overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gradient-to-r from-primary-mint to-teal-500 text-white">
              <tr>
                <th class="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Proveedor</th>
                <th class="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Contacto</th>
                <th class="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Servicio</th>
                <th class="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Suscripción</th>
                <th class="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Estado</th>
                <th class="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-neutral-light">
              <tr
                v-for="provider in filteredProviders"
                :key="provider._id"
                :class="provider.paused ? 'bg-yellow-50' : 'hover:bg-neutral-bg'"
                class="transition-colors duration-200 group"
              >
                <!-- Información del proveedor -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="w-10 h-10 bg-primary-mint/10 rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                      <span class="text-primary-mint font-semibold text-sm">
                        {{ getInitials(provider.name) }}
                      </span>
                    </div>
                    <div>
                      <div class="font-semibold text-neutral-dark">{{ provider.name }}</div>
                      <div class="text-sm text-neutral-medium">ID: {{ provider._id.slice(-6) }}</div>
                    </div>
                  </div>
                </td>

                <!-- Contacto -->
                <td class="px-6 py-4">
                  <div class="text-sm font-medium text-neutral-dark">{{ provider.email }}</div>
                  <div class="text-sm text-neutral-medium">{{ provider.phone || 'Sin teléfono' }}</div>
                </td>

                <!-- Servicio -->
                <td class="px-6 py-4">
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                    {{ provider.serviceType }}
                  </span>
                </td>

                <!-- Suscripción -->
                <td class="px-6 py-4">
                  <div class="space-y-2">
                    <div class="text-sm">
                      <span :class="isExpired(provider.subscription?.expirationDate) ? 'text-red-600 font-semibold' : 'text-neutral-dark'">
                        {{ provider.subscription?.type || 'Sin suscripción' }}
                      </span>
                      <div class="text-xs text-neutral-medium">
                        Vence: {{ formatDate(provider.subscription?.expirationDate) || 'N/A' }}
                      </div>
                    </div>
                    
                    <div class="flex gap-1 flex-wrap">
                      <button
                        v-if="!provider.paused"
                        @click="pauseSubscription(provider)"
                        class="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-all duration-200 font-semibold"
                      >
                        Pausar
                      </button>

                      <button
                        v-if="provider.paused"
                        @click="resumeSubscription(provider)"
                        class="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all duration-200 font-semibold"
                      >
                        Reanudar
                      </button>

                      <button
                        @click="renewSubscription(provider)"
                        class="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all duration-200 font-semibold"
                      >
                        Renovar
                      </button>
                    </div>
                  </div>
                </td>

                <!-- Estado -->
                <td class="px-6 py-4">
                  <span v-if="provider.paused" class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                    <span class="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                    Pausado
                  </span>
                  <span v-else-if="isExpired(provider.subscription?.expirationDate)" class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                    <span class="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    Vencido
                  </span>
                  <span v-else class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                    <span class="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Activo
                  </span>
                </td>

                <!-- Acciones -->
                <td class="px-6 py-4">
                  <div class="flex items-center space-x-2">
                    <button
                      @click="editProvider(provider)"
                      class="bg-secondary text-white px-4 py-2 rounded-lg font-semibold hover:bg-secondary-dark transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center space-x-1 text-sm"
                    >
                      <span>✏️</span>
                      <span>Editar</span>
                    </button>
                    <button
                      @click="deleteProvider(provider._id)"
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
        <div v-if="filteredProviders.length === 0" class="text-center py-12">
          <div class="w-16 h-16 bg-neutral-light rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="text-2xl">🏢</span>
          </div>
          <h3 class="text-lg font-semibold text-neutral-dark mb-2">No se encontraron proveedores</h3>
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
                {{ editingProvider ? "Editar Proveedor" : "Agregar Proveedor" }}
              </h2>
              <p class="text-sm opacity-90">
                {{ editingProvider ? "Actualiza la información del proveedor" : "Registra un nuevo proveedor en el sistema" }}
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
          <form @submit.prevent="saveProvider">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="md:col-span-2">
                <label class="block mb-3 font-semibold text-neutral-dark text-sm">Nombre del Proveedor</label>
                <input 
                  v-model="form.name" 
                  type="text" 
                  required 
                  placeholder="Ingresa el nombre completo"
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
                  placeholder="+58 412 1234567"
                  class="w-full p-3 border border-neutral-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-mint bg-white transition-all"
                />
              </div>
              
              <div>
                <label class="block mb-3 font-semibold text-neutral-dark text-sm">Tipo de Servicio</label>
                <select 
                  v-model="form.serviceType" 
                  required
                  class="w-full p-3 border border-neutral-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-mint bg-white transition-all"
                >
                  <option value="">Selecciona un servicio</option>
                  <option value="Veterinaria">Veterinaria</option>
                  <option value="Peluquería">Peluquería</option>
                  <option value="Guardería">Guardería</option>
                  <option value="Entrenamiento">Entrenamiento</option>
                  <option value="Spa">Spa para mascotas</option>
                  <option value="Transporte">Transporte</option>
                  <option value="Otro">Otro</option>
                </select>
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
                {{ editingProvider ? 'Actualizar' : 'Crear Proveedor' }}
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
  components: { AdminLayout, Chatbot },

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
      const query = this.searchQuery.toLowerCase();
      return this.providers.filter((p) =>
        `${p.name} ${p.email} ${p.serviceType}`.toLowerCase().includes(query)
      );
    },
    activeProviders() {
      return this.providers.filter(p => !p.paused && !this.isExpired(p.subscription?.expirationDate)).length;
    },
    pausedProviders() {
      return this.providers.filter(p => p.paused).length;
    },
    expiredSubscriptions() {
      return this.providers.filter(p => this.isExpired(p.subscription?.expirationDate)).length;
    }
  },

  methods: {
    getInitials(name) {
      return name?.charAt(0)?.toUpperCase() || 'P';
    },

    formatDate(date) {
      if (!date) return 'N/A';
      return new Date(date).toLocaleDateString("es-VE");
    },

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
        alert("Error al pausar la suscripción");
      }
    },

    async resumeSubscription(provider) {
      try {
        const { data } = await api.put(`/admin/providers/${provider._id}/resume`);
        Object.assign(provider, data);
      } catch (err) {
        console.error("Error resuming subscription:", err);
        alert("Error al reanudar la suscripción");
      }
    },

    async renewSubscription(provider) {
      try {
        const { data } = await api.put(`/admin/providers/${provider._id}/renew`);
        Object.assign(provider, data);
      } catch (err) {
        console.error("Error renewing subscription:", err);
        alert("Error al renovar la suscripción");
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
        alert("Error al guardar el proveedor");
      }
    },

    async deleteProvider(id) {
      if (!confirm("¿Estás seguro de que quieres eliminar este proveedor?")) return;

      try {
        await api.delete(`/admin/providers/${id}`);
        this.providers = this.providers.filter((p) => p._id !== id);
      } catch (err) {
        console.error("Error deleting provider:", err);
        alert("Error al eliminar el proveedor");
      }
    },
  },

  mounted() {
    this.fetchProviders();
  },
};
</script>