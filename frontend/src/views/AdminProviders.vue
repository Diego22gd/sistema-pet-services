<template>
  <AdminLayout>
    <div class="px-6 max-w-7xl mx-auto w-full pt-8 mt-12 fade-up" :class="{ 'show': true }">
      <!-- Header de la página -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">Gestión de Proveedores</h1>
        <p class="text-gray-600 text-lg">Administra y gestiona todos los proveedores del sistema</p>
      </div>

      <!-- Barra de búsqueda y acciones -->
      <div class="card-modern p-6 mb-8">
        <div class="flex flex-col md:flex-row justify-between items-center gap-4">
          <div class="relative flex-1 w-full md:max-w-md">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar proveedores por nombre, email, RIF o tipo de servicio..."
              class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-gray-50"
            />
          </div>
          <button
            @click="openModal"
            class="btn-primary-purple flex items-center space-x-2 whitespace-nowrap"
          >
            <span>+</span>
            <span>Agregar Proveedor</span>
          </button>
        </div>
      </div>

      <!-- Tarjetas de estadísticas -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="card-modern p-4">
          <div class="text-2xl font-bold text-purple-600">{{ providers.length }}</div>
          <div class="text-sm text-gray-500">Total Proveedores</div>
        </div>
        <div class="card-modern p-4">
          <div class="text-2xl font-bold text-green-600">{{ activeProviders }}</div>
          <div class="text-sm text-gray-500">Activos</div>
        </div>
        <div class="card-modern p-4">
          <div class="text-2xl font-bold text-yellow-600">{{ pausedProviders }}</div>
          <div class="text-sm text-gray-500">Pausados</div>
        </div>
        <div class="card-modern p-4">
          <div class="text-2xl font-bold text-red-600">{{ expiredSubscriptions }}</div>
          <div class="text-sm text-gray-500">Suscripciones Vencidas</div>
        </div>
      </div>

      <!-- Tabla de proveedores mejorada -->
      <div class="card-modern overflow-hidden mb-4">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gradient-to-r from-purple-600 to-purple-800 text-white">
              <tr>
                <th class="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Proveedor</th>
                <th class="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Contacto</th>
                <th class="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Identificación</th>
                <th class="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Servicio</th>
                <th class="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Suscripción</th>
                <th class="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Estado</th>
                <th class="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr
                v-for="provider in filteredProviders"
                :key="provider._id"
                :class="provider.paused ? 'bg-yellow-50' : 'hover:bg-gray-50'"
                class="transition-colors duration-200 group"
              >
                <!-- Información del proveedor -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                      <span class="text-purple-600 font-semibold text-sm">
                        {{ getInitials(provider.name) }}
                      </span>
                    </div>
                    <div>
                      <div class="font-semibold text-gray-800">{{ provider.name }}</div>
                      <div class="text-sm text-gray-500">ID: {{ provider._id.slice(-6) }}</div>
                    </div>
                  </div>
                </td>

                <!-- Contacto -->
                <td class="px-6 py-4">
                  <div class="text-sm font-medium text-gray-800">{{ provider.email }}</div>
                  <div class="text-sm text-gray-500">{{ provider.phone || 'Sin teléfono' }}</div>
                </td>

                <!-- Identificación (RIF) -->
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-800">
                    <span class="font-semibold">RIF:</span> {{ provider.rif || 'No registrado' }}
                  </div>
                  <div v-if="provider.businessName" class="text-sm text-gray-500">
                    {{ provider.businessName }}
                  </div>
                </td>

                <!-- Servicio -->
                <td class="px-6 py-4">
                  <span class="badge-tag-admin">
                    {{ provider.serviceType || 'Sin especificar' }}
                  </span>
                </td>

                <!-- Suscripción -->
                <td class="px-6 py-4">
                  <div class="space-y-2">
                    <div class="text-sm">
                      <span :class="isExpired(provider.subscription?.expirationDate) ? 'text-red-600 font-semibold' : 'text-gray-800'">
                        {{ getSubscriptionTypeText(provider.subscription?.type) }}
                      </span>
                      <div class="text-xs text-gray-500">
                        Vence: {{ formatDate(provider.subscription?.expirationDate) || 'N/A' }}
                      </div>
                    </div>
                    
                    <div class="flex gap-1 flex-wrap">
                      <button
                        v-if="!provider.paused"
                        @click="pauseSubscription(provider)"
                        class="btn-cancel-admin"
                      >
                        Pausar
                      </button>

                      <button
                        v-if="provider.paused"
                        @click="resumeSubscription(provider)"
                        class="btn-confirm-admin"
                      >
                        Reanudar
                      </button>

                      <button
                        @click="renewSubscription(provider)"
                        class="btn-reschedule-admin"
                      >
                        Renovar
                      </button>
                    </div>
                  </div>
                </td>

                <!-- Estado -->
                <td class="px-6 py-4">
                  <span v-if="provider.paused" class="badge-outline-admin bg-yellow-100 text-yellow-800 border-yellow-400">
                    <span class="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                    Pausado
                  </span>
                  <span v-else-if="isExpired(provider.subscription?.expirationDate)" class="badge-outline-admin bg-red-100 text-red-800 border-red-400">
                    <span class="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    Vencido
                  </span>
                  <span v-else class="badge-outline-admin bg-green-100 text-green-800 border-green-400">
                    <span class="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Activo
                  </span>
                </td>

                <!-- Acciones -->
                <td class="px-6 py-4">
                  <div class="flex items-center space-x-2">
                    <button
                      @click="editProvider(provider)"
                      class="btn-details-admin"
                    >
                      <span>✏️</span>
                      <span>Editar</span>
                    </button>
                    <button
                      @click="deleteProvider(provider._id)"
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
        <div v-if="filteredProviders.length === 0" class="text-center py-12">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="text-2xl">🏢</span>
          </div>
          <h3 class="text-lg font-semibold text-gray-800 mb-2">No se encontraron proveedores</h3>
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
                {{ editingProvider ? "Editar Proveedor" : "Agregar Proveedor" }}
              </h2>
              <p class="text-gray-600 text-sm">
                {{ editingProvider ? "Actualiza la información del proveedor" : "Registra un nuevo proveedor en el sistema" }}
              </p>
            </div>
            <button @click="closeModal" class="btn-modal-close">
              ✕
            </button>
          </div>
        </div>

        <!-- Contenido del modal -->
        <div class="modal-modern-content">
          <form @submit.prevent="saveProvider">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="md:col-span-2">
                <label class="block mb-3 font-semibold text-gray-700 text-sm">Nombre del Proveedor *</label>
                <input 
                  v-model="form.name" 
                  type="text" 
                  required 
                  placeholder="Ingresa el nombre completo"
                  class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white transition-all"
                />
              </div>
              
              <div class="md:col-span-2">
                <label class="block mb-3 font-semibold text-gray-700 text-sm">Correo Electrónico *</label>
                <input 
                  v-model="form.email" 
                  type="email" 
                  required 
                  placeholder="correo@ejemplo.com"
                  class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white transition-all"
                />
              </div>
              
              <div>
                <label class="block mb-3 font-semibold text-gray-700 text-sm">RIF *</label>
                <input 
                  v-model="form.rif" 
                  type="text" 
                  required
                  placeholder="J-12345678-9"
                  class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white transition-all"
                />
                <p class="text-xs text-gray-500 mt-1">Formato: J-12345678-9</p>
              </div>
              
              <div>
                <label class="block mb-3 font-semibold text-gray-700 text-sm">Nombre del Negocio</label>
                <input 
                  v-model="form.businessName" 
                  type="text" 
                  placeholder="Nombre del negocio o empresa"
                  class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white transition-all"
                />
              </div>
              
              <div>
                <label class="block mb-3 font-semibold text-gray-700 text-sm">Teléfono</label>
                <input 
                  v-model="form.phone" 
                  type="text" 
                  placeholder="+58 412 1234567"
                  class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white transition-all"
                />
              </div>
              
              <div>
                <label class="block mb-3 font-semibold text-gray-700 text-sm">Tipo de Servicio *</label>
                <select 
                  v-model="form.serviceType" 
                  required
                  class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white transition-all"
                >
                  <option value="">Selecciona un servicio</option>
                  <option value="Veterinaria">Veterinaria</option>
                  <option value="Peluquería">Peluquería</option>
                  <option value="Guardería">Guardería</option>
                  <option value="Entrenamiento">Entrenamiento</option>
                  <option value="Spa">Spa para mascotas</option>
                  <option value="Transporte">Transporte</option>
                  <option value="Tienda">Tienda de mascotas</option>
                  <option value="Hotel">Hotel para mascotas</option>
                  <option value="Adiestramiento">Adiestramiento</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <!-- Campos adicionales -->
              <div>
                <label class="block mb-3 font-semibold text-gray-700 text-sm">Fecha de Nacimiento</label>
                <input 
                  v-model="form.birthdate" 
                  type="date" 
                  class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white transition-all"
                />
              </div>

              <div>
                <label class="block mb-3 font-semibold text-gray-700 text-sm">Dirección</label>
                <input 
                  v-model="form.address" 
                  type="text" 
                  placeholder="Dirección completa"
                  class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white transition-all"
                />
              </div>

              <!-- Contraseña solo para nuevos proveedores -->
              <div v-if="!editingProvider" class="md:col-span-2">
                <label class="block mb-3 font-semibold text-gray-700 text-sm">Contraseña Temporal *</label>
                <input 
                  v-model="form.password" 
                  type="password" 
                  required
                  placeholder="••••••••"
                  class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white transition-all"
                />
                <p class="text-xs text-gray-500 mt-1">El proveedor podrá cambiar esta contraseña después</p>
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
        rif: "",
        businessName: "",
        serviceType: "",
        birthdate: "",
        address: "",
        password: "",
      },
    };
  },

  computed: {
    filteredProviders() {
      if (!this.searchQuery) return this.providers;
      const query = this.searchQuery.toLowerCase();
      return this.providers.filter((p) =>
        `${p.name} ${p.email} ${p.rif} ${p.businessName} ${p.serviceType}`.toLowerCase().includes(query)
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

    // Formatear fecha para input type="date"
    formatDateForInput(dateString) {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    },

    getSubscriptionTypeText(type) {
      if (!type) return 'Sin suscripción';
      
      const subscriptionTypes = {
        'monthly': 'Mensual',
        'Monthly': 'Mensual',
        'annual': 'Anual',
        'quarterly': 'Trimestral',
        'basic': 'Básica',
        'premium': 'Premium',
        'enterprise': 'Empresarial'
      };
      
      return subscriptionTypes[type] || type;
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
        alert("✅ Suscripción pausada correctamente");
      } catch (err) {
        console.error("Error pausing subscription:", err);
        alert("❌ Error al pausar la suscripción: " + (err.response?.data?.message || err.message));
      }
    },

    async resumeSubscription(provider) {
      try {
        const { data } = await api.put(`/admin/providers/${provider._id}/resume`);
        Object.assign(provider, data);
        alert("✅ Suscripción reanudada correctamente");
      } catch (err) {
        console.error("Error resuming subscription:", err);
        alert("❌ Error al reanudar la suscripción: " + (err.response?.data?.message || err.message));
      }
    },

    async renewSubscription(provider) {
      try {
        const { data } = await api.put(`/admin/providers/${provider._id}/renew`);
        Object.assign(provider, data);
        alert("✅ Suscripción renovada correctamente");
      } catch (err) {
        console.error("Error renewing subscription:", err);
        alert("❌ Error al renovar la suscripción: " + (err.response?.data?.message || err.message));
      }
    },

    openModal() {
      this.showModal = true;
      this.editingProvider = null;
      this.form = {
        name: "",
        email: "",
        phone: "",
        rif: "",
        businessName: "",
        serviceType: "",
        birthdate: "",
        address: "",
        password: "",
      };
    },

    closeModal() {
      this.showModal = false;
    },

    editProvider(provider) {
      this.editingProvider = provider;
      this.form = { 
        ...provider, 
        password: "", // No enviar contraseña en edición
        birthdate: provider.birthdate ? this.formatDateForInput(provider.birthdate) : ""
      };
      this.showModal = true;
    },

    async saveProvider() {
      try {
        // Crear objeto sin password si está vacío durante edición
        const formData = { ...this.form };
        
        if (this.editingProvider) {
          // Para edición: eliminar password si está vacío
          if (!formData.password || formData.password.trim() === "") {
            delete formData.password;
          }
          
          const { data } = await api.put(`/admin/providers/${this.editingProvider._id}`, formData);
          const index = this.providers.findIndex((p) => p._id === data._id);
          this.providers.splice(index, 1, data);
          this.closeModal();
          alert("✅ Proveedor actualizado exitosamente");
          
        } else {
          // Para creación: validar que tenga password
          if (!formData.password || formData.password.trim() === "") {
            alert("⚠️ La contraseña es obligatoria para nuevos proveedores");
            return;
          }
          
          const { data } = await api.post("/admin/providers", formData);
          this.providers.push(data);
          this.closeModal();
          alert("✅ Proveedor creado exitosamente");
        }
        
      } catch (err) {
        console.error("Error saving provider:", err);
        
        // Mostrar mensaje de error más específico
        let errorMessage = "Error al guardar el proveedor";
        
        if (err.response) {
          // El servidor respondió con un código de error
          const serverError = err.response.data;
          
          if (serverError.message) {
            errorMessage = serverError.message;
          } else if (typeof serverError === 'string') {
            errorMessage = serverError;
          } else if (serverError.error) {
            errorMessage = serverError.error;
          }
        } else if (err.request) {
          // La solicitud fue hecha pero no hubo respuesta
          errorMessage = "No se pudo conectar con el servidor. Verifica tu conexión a internet.";
        } else {
          // Algo pasó al configurar la solicitud
          errorMessage = err.message || "Error desconocido";
        }
        
        alert(`❌ ${errorMessage}`);
      }
    },

    async deleteProvider(id) {
      if (!confirm("¿Estás seguro de que quieres eliminar este proveedor?")) return;

      try {
        await api.delete(`/admin/providers/${id}`);
        this.providers = this.providers.filter((p) => p._id !== id);
        alert("✅ Proveedor eliminado exitosamente");
      } catch (err) {
        console.error("Error deleting provider:", err);
        alert("❌ Error al eliminar el proveedor: " + (err.response?.data?.message || err.message));
      }
    },
  },

  mounted() {
    this.fetchProviders();
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
}
</style>