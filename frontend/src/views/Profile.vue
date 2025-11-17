<template>
  <Layout>
    <div class="p-6 max-w-4xl mx-auto bg-neutral-bg min-h-[80vh] pt-8">
      <h1 class="text-2xl font-bold mb-6 text-neutral-dark">Mi Perfil</h1>

      <!-- Información Personal -->
      <div class="bg-neutral-light shadow rounded-2xl p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4 text-neutral-dark">Información Personal</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Nombre -->
          <div>
            <label class="block text-sm font-medium mb-1 text-neutral-dark">Nombre:</label>
            <input
              type="text"
              v-model="user.name"
              class="w-full p-2 border border-neutral-medium rounded-lg focus:ring-2 focus:ring-secondary focus:outline-none"
            />
          </div>

          <!-- Apellido -->
          <div>
            <label class="block text-sm font-medium mb-1 text-neutral-dark">Apellido:</label>
            <input
              type="text"
              v-model="user.lastname"
              class="w-full p-2 border border-neutral-medium rounded-lg focus:ring-2 focus:ring-secondary focus:outline-none"
            />
          </div>

          <!-- Cédula -->
          <div>
            <label class="block text-sm font-medium mb-1 text-neutral-dark">Cédula:</label>
            <input
              type="text"
              v-model="user.cedula"
              class="w-full p-2 border border-neutral-medium rounded-lg focus:ring-2 focus:ring-secondary focus:outline-none"
            />
          </div>

          <!-- Teléfono -->
          <div>
            <label class="block text-sm font-medium mb-1 text-neutral-dark">Teléfono:</label>
            <input
              type="text"
              v-model="user.phone"
              class="w-full p-2 border border-neutral-medium rounded-lg focus:ring-2 focus:ring-secondary focus:outline-none"
            />
          </div>

          <!-- Email -->
          <div>
            <label class="block text-sm font-medium mb-1 text-neutral-dark">Correo electrónico:</label>
            <input
              type="email"
              v-model="user.email"
              disabled
              class="w-full p-2 border border-neutral-medium bg-gray-100 rounded-lg focus:outline-none"
            />
          </div>

          <!-- Fecha de nacimiento -->
          <div>
            <label class="block text-sm font-medium mb-1 text-neutral-dark">Fecha de nacimiento:</label>
            <input
              type="date"
              v-model="user.birthdate"
              class="w-full p-2 border border-neutral-medium rounded-lg focus:ring-2 focus:ring-secondary focus:outline-none"
            />
          </div>

          <!-- Dirección -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium mb-1 text-neutral-dark">Dirección:</label>
            <input
              type="text"
              v-model="user.address"
              class="w-full p-2 border border-neutral-medium rounded-lg focus:ring-2 focus:ring-secondary focus:outline-none"
            />
          </div>
        </div>

        <!-- Campos especiales si es proveedor -->
        <div v-if="user.userType === 'provider'" class="mt-6">
          <h3 class="text-lg font-semibold mb-2 text-neutral-dark">Información del Comercio</h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1 text-neutral-dark">Nombre del comercio:</label>
              <input
                type="text"
                v-model="user.businessName"
                class="w-full p-2 border border-neutral-medium rounded-lg focus:ring-2 focus:ring-secondary focus:outline-none"
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-1 text-neutral-dark">Tipo de servicio:</label>
              <select
                v-model="user.serviceType"
                class="w-full p-2 border border-neutral-medium rounded-lg focus:ring-2 focus:ring-secondary focus:outline-none"
              >
                <option disabled value="">Selecciona una opción</option>
                <option>Veterinaria</option>
                <option>Peluquería</option>
                <option>Guardería</option>
                <option>Tienda de mascotas</option>
                <option>Adiestramiento</option>
              </select>
            </div>
          </div>
        </div>

        <button
          class="mt-6 px-4 py-2 bg-primary-mint text-white rounded-lg hover:bg-state-success transition"
          @click="updateProfile"
        >
          Guardar Cambios
        </button>
      </div>
    </div>
  </Layout>
</template>

<script>
import Layout from '@/components/Layout.vue'
import api from '@/api/api'
import { useUserStore } from '@/stores/userStore'

export default {
  name: 'Profile',
  components: { Layout },
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

      try {
        const { data } = await api.put(`/users/${userId}`, this.user, {
          headers: { Authorization: `Bearer ${token}` },
        })

        userStore.user = data
        localStorage.setItem('user', JSON.stringify(data))
        alert('Perfil actualizado con éxito ✅')
      } catch (error) {
        console.error('Error al actualizar perfil:', error)
        alert('Error al actualizar el perfil ❌')
      }
    },
  },
}
</script>

<style scoped>
.bg-gray-100 {
  background-color: #f5f5f5;
}
</style>
