<template>
  <Layout>
    
    <div class="px-6 max-w-4xl mx-auto w-full pt-12 mt-12 ">
      <!-- Header -->
      <div class="mb-8 ">
        <h1 class="mb-2">  </h1>
        <h1 class="text-3xl font-bold text-neutral-dark mb-2 pt-4 ">Mi Perfil</h1>
        <p class="text-neutral-medium">Gestiona tu información personal y preferencias</p>
      </div>

    
      <div class="bg-white rounded-2xl shadow-sm border border-neutral-light p-6 mb-8">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-2 h-8 bg-primary-mint rounded-full"></div>
          <h2 class="text-xl font-semibold text-neutral-dark">Información Personal</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Nombre -->
          <div>
            <label class="block text-sm font-medium text-neutral-dark mb-2">Nombre</label>
            <input
              type="text"
              v-model="user.name"
              class="w-full px-4 py-3 border border-neutral-medium rounded-lg focus:ring-2 focus:ring-primary-mint focus:border-primary-mint transition-colors duration-200 bg-white"
              placeholder="Ingresa tu nombre"
            />
          </div>

          <!-- Apellido -->
          <div>
            <label class="block text-sm font-medium text-neutral-dark mb-2">Apellido</label>
            <input
              type="text"
              v-model="user.lastname"
              class="w-full px-4 py-3 border border-neutral-medium rounded-lg focus:ring-2 focus:ring-primary-mint focus:border-primary-mint transition-colors duration-200 bg-white"
              placeholder="Ingresa tu apellido"
            />
          </div>

          <!-- Cédula -->
          <div>
            <label class="block text-sm font-medium text-neutral-dark mb-2">Cédula</label>
            <input
              type="text"
              v-model="user.cedula"
              class="w-full px-4 py-3 border border-neutral-medium rounded-lg focus:ring-2 focus:ring-primary-mint focus:border-primary-mint transition-colors duration-200 bg-white"
              placeholder="Ej: 12345678"
            />
          </div>

          <!-- Teléfono -->
          <div>
            <label class="block text-sm font-medium text-neutral-dark mb-2">Teléfono</label>
            <input
              type="text"
              v-model="user.phone"
              class="w-full px-4 py-3 border border-neutral-medium rounded-lg focus:ring-2 focus:ring-primary-mint focus:border-primary-mint transition-colors duration-200 bg-white"
              placeholder="Ej: 0412-1234567"
            />
          </div>

          <!-- Email -->
          <div>
            <label class="block text-sm font-medium text-neutral-dark mb-2">Correo electrónico</label>
            <input
              type="email"
              v-model="user.email"
              disabled
              class="w-full px-4 py-3 border border-neutral-medium bg-neutral-bg rounded-lg focus:outline-none cursor-not-allowed"
              placeholder="tu@email.com"
            />
          </div>

          <!-- Fecha de nacimiento -->
          <div>
            <label class="block text-sm font-medium text-neutral-dark mb-2">Fecha de nacimiento</label>
            <input
              type="date"
              v-model="user.birthdate"
              class="w-full px-4 py-3 border border-neutral-medium rounded-lg focus:ring-2 focus:ring-primary-mint focus:border-primary-mint transition-colors duration-200 bg-white"
            />
          </div>

          <!-- Dirección -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-neutral-dark mb-2">Dirección</label>
            <input
              type="text"
              v-model="user.address"
              class="w-full px-4 py-3 border border-neutral-medium rounded-lg focus:ring-2 focus:ring-primary-mint focus:border-primary-mint transition-colors duration-200 bg-white"
              placeholder="Ingresa tu dirección completa"
            />
          </div>
        </div>

        <!-- Campos especiales si es proveedor -->
        <div v-if="user.userType === 'provider'" class="mt-8 pt-6 border-t border-neutral-light">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-2 h-8 bg-secondary rounded-full"></div>
            <h3 class="text-xl font-semibold text-neutral-dark">Información del Comercio</h3>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-neutral-dark mb-2">Nombre del comercio</label>
              <input
                type="text"
                v-model="user.businessName"
                class="w-full px-4 py-3 border border-neutral-medium rounded-lg focus:ring-2 focus:ring-primary-mint focus:border-primary-mint transition-colors duration-200 bg-white"
                placeholder="Nombre de tu negocio"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-neutral-dark mb-2">Tipo de servicio</label>
              <select
                v-model="user.serviceType"
                class="w-full px-4 py-3 border border-neutral-medium rounded-lg focus:ring-2 focus:ring-primary-mint focus:border-primary-mint transition-colors duration-200 bg-white"
              >
                <option disabled value="">Selecciona una opción</option>
                <option>Veterinaria</option>
                <option>Peluquería</option>
                <option>Guardería</option>
                <option>Tienda de mascotas</option>
                <option>Adiestramiento</option>
                <option>Paseador</option>
                <option>Estética canina</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Botón Guardar -->
        <div class="flex justify-end mt-8 pt-6 border-t border-neutral-light">
          <button
            class="flex items-center gap-2 px-8 py-3 bg-primary-mint text-white rounded-lg hover:bg-state-success focus:ring-2 focus:ring-primary-mint focus:ring-offset-2 transition-all duration-200 font-medium"
            @click="updateProfile"
          >
            <span>💾</span>
            <span>Guardar Cambios</span>
          </button>
        </div>
      </div>

      <!-- Tarjeta de información de cuenta -->
      <div class="bg-white rounded-2xl shadow-sm border border-neutral-light p-6">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-2 h-8 bg-blue-500 rounded-full"></div>
          <h2 class="text-xl font-semibold text-neutral-dark">Información de la Cuenta</h2>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="flex items-center justify-between p-4 bg-neutral-bg rounded-lg">
            <span class="text-neutral-dark font-medium">Tipo de usuario:</span>
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 capitalize">
              {{ user.userType || 'Cliente' }}
            </span>
          </div>
          
          <div class="flex items-center justify-between p-4 bg-neutral-bg rounded-lg">
            <span class="text-neutral-dark font-medium">Estado de la cuenta:</span>
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              <span class="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Activa
            </span>
          </div>
          
          <div v-if="user.createdAt" class="flex items-center justify-between p-4 bg-neutral-bg rounded-lg md:col-span-2">
            <span class="text-neutral-dark font-medium">Miembro desde:</span>
            <span class="text-neutral-medium">{{ formatDate(user.createdAt) }}</span>
          </div>
        </div>
      </div>
    </div>
    <Chatbot />
  </Layout>
</template>

<script>
import Layout from '@/components/Layout.vue'
import Chatbot from "@/components/Chatbot.vue";
import api from '@/api/api'
import { useUserStore } from '@/stores/userStore'

export default {
  name: 'Profile',
  components: { Layout, Chatbot },
  data() {
    return {
      user: {},
      loading: true,
    }
  },
  async created() {
    const userStore = useUserStore()
    const token = userStore.token
    const userId = userStore.user?._id

    if (!token || !userId) {
      this.$router.push('/login')
      return
    }

    try {
      // ✅ Obtener datos completos del usuario desde el backend
      const { data } = await api.get(`/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      this.user = data
      userStore.user = data
      localStorage.setItem('user', JSON.stringify(data))
    } catch (error) {
      console.error('Error al obtener el perfil:', error)
      alert('No se pudo cargar el perfil')
    } finally {
      this.loading = false
    }
  },
  methods: {
    async updateProfile() {
      const userStore = useUserStore()
      const token = userStore.token
      const userId = userStore.user?._id

      // Validación básica
      if (!this.user.name || !this.user.lastname || !this.user.cedula) {
        alert('Por favor, completa los campos obligatorios: Nombre, Apellido y Cédula');
        return;
      }

      try {
        const { data } = await api.put(`/users/${userId}`, this.user, {
          headers: { Authorization: `Bearer ${token}` },
        })

        userStore.user = data
        localStorage.setItem('user', JSON.stringify(data))
        alert('✅ Perfil actualizado con éxito')
      } catch (error) {
        console.error('Error al actualizar perfil:', error)
        alert('❌ Error al actualizar el perfil')
      }
    },
    
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('es-VE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  },
}
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