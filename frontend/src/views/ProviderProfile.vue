<template>
  <ProviderLayout>
    <div class="px-6 max-w-6xl mx-auto w-full pt-6">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-neutral-dark mb-2">Perfil del Proveedor</h1>
        <p class="text-neutral-medium">Gestiona tu información profesional y horarios de atención</p>
      </div>

      <div v-if="provider" class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Información General -->
        <div class="bg-white rounded-2xl shadow-sm border border-neutral-light p-6">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-2 h-8 bg-primary-mint rounded-full"></div>
            <h2 class="text-xl font-semibold text-neutral-dark">Información General</h2>
          </div>

          <div class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-neutral-dark mb-2">
                Nombre del Negocio
              </label>
              <input
                v-model="provider.user.businessName"
                type="text"
                class="w-full px-4 py-3 border border-neutral-medium rounded-lg focus:ring-2 focus:ring-primary-mint focus:border-primary-mint transition-colors duration-200 bg-white"
                placeholder="Ingresa el nombre de tu negocio"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-neutral-dark mb-2">
                RIF
              </label>
              <input
                v-model="provider.user.rif"
                type="text"
                class="w-full px-4 py-3 border border-neutral-medium rounded-lg focus:ring-2 focus:ring-primary-mint focus:border-primary-mint transition-colors duration-200 bg-white"
                placeholder="J-12345678-9"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-neutral-dark mb-2">
                Tipo de Servicio
              </label>
              <select
                v-model="provider.user.serviceType"
                class="w-full px-4 py-3 border border-neutral-medium rounded-lg focus:ring-2 focus:ring-primary-mint focus:border-primary-mint transition-colors duration-200 bg-white"
              >
                <option value="">Selecciona un servicio</option>
                <option>Veterinaria</option>
                <option>Peluquería</option>
                <option>Guardería</option>
                <option>Tienda de mascotas</option>
                <option>Adiestramiento</option>
                <option>Paseador</option>
                <option>Estética canina</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-neutral-dark mb-2">
                Bio / Descripción
              </label>
              <textarea
                v-model="provider.profile.bio"
                rows="4"
                class="w-full px-4 py-3 border border-neutral-medium rounded-lg focus:ring-2 focus:ring-primary-mint focus:border-primary-mint transition-colors duration-200 resize-none bg-white"
                placeholder="Describe tus servicios y experiencia..."
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-neutral-dark mb-2">
                Experiencia (años)
              </label>
              <input
                v-model="provider.profile.experience"
                type="number"
                min="0"
                max="50"
                class="w-full px-4 py-3 border border-neutral-medium rounded-lg focus:ring-2 focus:ring-primary-mint focus:border-primary-mint transition-colors duration-200 bg-white"
                placeholder="Años de experiencia"
              />
            </div>
          </div>
        </div>

        <!-- Información de Contacto -->
        <div class="bg-white rounded-2xl shadow-sm border border-neutral-light p-6">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-2 h-8 bg-secondary rounded-full"></div>
            <h2 class="text-xl font-semibold text-neutral-dark">Información de Contacto</h2>
          </div>

          <div class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-neutral-dark mb-2">
                Teléfono
              </label>
              <input
                v-model="provider.user.phone"
                type="text"
                class="w-full px-4 py-3 border border-neutral-medium rounded-lg focus:ring-2 focus:ring-primary-mint focus:border-primary-mint transition-colors duration-200 bg-white"
                placeholder="+58 412 1234567"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-neutral-dark mb-2">
                Correo Electrónico
              </label>
              <input
                :value="provider.user.email"
                type="email"
                disabled
                class="w-full px-4 py-3 border border-neutral-medium bg-neutral-bg rounded-lg focus:outline-none cursor-not-allowed"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-neutral-dark mb-2">
                Dirección
              </label>
              <input
                v-model="provider.profile.address"
                type="text"
                class="w-full px-4 py-3 border border-neutral-medium rounded-lg focus:ring-2 focus:ring-primary-mint focus:border-primary-mint transition-colors duration-200 bg-white"
                placeholder="Ingresa tu dirección completa"
              />
            </div>

            <!-- Información de estadísticas -->
            <div class="bg-neutral-bg rounded-xl p-4 mt-4">
              <h3 class="font-semibold text-neutral-dark mb-3">Resumen del Perfil</h3>
              <div class="grid grid-cols-2 gap-3 text-sm">
                <div class="text-neutral-medium">Experiencia:</div>
                <div class="text-neutral-dark font-medium">{{ provider.profile.experience || 0 }} años</div>
                
                <div class="text-neutral-medium">Servicio:</div>
                <div class="text-neutral-dark font-medium">{{ provider.user.serviceType || 'No especificado' }}</div>
                
                <div class="text-neutral-medium">Estado:</div>
                <div class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <span class="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                  Activo
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

        <!-- Nota sobre horarios -->
        
      </div>

      <!-- Botones de Acción -->
      <div
        v-if="provider"
        class="flex flex-col sm:flex-row justify-end gap-4 mt-8 p-6 bg-white rounded-2xl shadow-sm border border-neutral-light"
      >
        <button
          @click="loadProfile"
          class="px-8 py-3 bg-white border border-neutral-medium text-neutral-dark rounded-lg hover:bg-neutral-bg focus:ring-2 focus:ring-neutral-medium focus:ring-offset-2 transition-all duration-200 font-medium order-2 sm:order-1"
        >
          🔄 Cancelar Cambios
        </button>

        <button
          @click="saveProfile"
          class="px-8 py-3 bg-primary-mint text-white rounded-lg hover:bg-state-success focus:ring-2 focus:ring-primary-mint focus:ring-offset-2 transition-all duration-200 font-medium order-1 sm:order-2"
        >
          💾 Guardar Cambios
        </button>
      </div>

      <!-- Estado de carga -->
      <div v-else class="flex justify-center items-center py-12">
        <div class="text-center">
          <div class="w-16 h-16 bg-neutral-light rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="text-2xl">⏳</span>
          </div>
          <h3 class="text-lg font-semibold text-neutral-dark mb-2">Cargando perfil...</h3>
          <p class="text-neutral-medium">Espera un momento por favor</p>
        </div>
      </div>
    
    <Chatbot />
  </ProviderLayout>
</template>

<script>
import ProviderLayout from "@/components/ProviderLayout.vue";
import Chatbot from "@/components/Chatbot.vue";
import api from "@/api/api";
import { useUserStore } from "@/stores/userStore";

export default {
  name: "ProviderProfile",
  components: { ProviderLayout, Chatbot },

  data() {
    return {
      provider: null,
      loading: false,
      weekDays: [
        "Lunes",
        "Martes",
        "Miércoles",
        "Jueves",
        "Viernes",
        "Sábado",
        "Domingo",
      ],
    };
  },

  async created() {
    await this.loadProfile();
  },

  methods: {
    async loadProfile() {
      try {
        this.loading = true;
        const userStore = useUserStore();
        if (!userStore.token) {
          this.$router.push('/login');
          return;
        }

        if (!userStore.user?._id) {
          await userStore.fetchUser();
        }
        const userId = userStore.user?._id;
        if (!userId) {
          this.$router.push('/login');
          return;
        }

        const { data } = await api.get(`/provider/profile/${userId}`);

        // Asegurar estructura de horarios
        if (!data.profile.schedule) data.profile.schedule = {};
        this.weekDays.forEach((day) => {
          if (!data.profile.schedule[day]) {
            data.profile.schedule[day] = { open: "", close: "" };
          }
        });

        this.provider = data;
      } catch (err) {
        console.error("❌ Error cargando perfil", err);
        alert("Error al cargar el perfil");
      } finally {
        this.loading = false;
      }
    },

    async saveProfile() {
      try {
        const userStore = useUserStore();
        if (!userStore.token) {
          this.$router.push('/login');
          return;
        }
        const userId = userStore.user?._id;
        if (!userId) {
          this.$router.push('/login');
          return;
        }

        // Validación básica
        if (!this.provider.user.businessName?.trim()) {
          alert("El nombre del negocio es obligatorio");
          return;
        }

        if (!this.provider.user.serviceType?.trim()) {
          alert("El tipo de servicio es obligatorio");
          return;
        }

        // Enviar SOLO el perfil (profile)
        await api.put(`/provider/profile/${userId}`, {
          ...this.provider.profile,
          ...this.provider.user, // también actualiza user
        });

        await userStore.fetchUser();
        await this.loadProfile();

        alert("✅ Perfil actualizado correctamente");
      } catch (error) {
        console.error(error);
        alert("❌ Error al guardar los datos");
      }
    },
  },
};
</script>

<style scoped>
.bg-neutral-bg {
  background-color: #f8fafc;
}

.border-neutral-light {
  border-color: #e2e8f0;
}

.border-neutral-medium {
  border-color: #cbd5e1;
}

.text-neutral-dark {
  color: #1e293b;
}

.text-neutral-medium {
  color: #64748b;
}

.bg-primary-mint {
  background-color: #0d9488;
}

.hover\:bg-state-success:hover {
  background-color: #059669;
}

.bg-secondary {
  background-color: #8b5cf6;
}

.focus\:ring-primary-mint:focus {
  --tw-ring-color: #0d9488;
}

.cursor-not-allowed {
  cursor: not-allowed;
}
</style>