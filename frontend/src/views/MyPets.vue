<template>
  <Layout>
    <div class="px-6 max-w-6xl mx-auto w-full pt-32">
      <!-- Header de la página -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-neutral-dark mb-2">Mis Mascotas</h1>
        <p class="text-neutral-medium text-lg">Gestiona y cuida a tus compañeros peludos</p>
      </div>

      <!-- Barra de acciones -->
      <div class="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-neutral-light">
        <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div class="text-neutral-medium text-sm">
            {{ pets.length }} mascota{{ pets.length !== 1 ? 's' : '' }} registrada{{ pets.length !== 1 ? 's' : '' }}
          </div>
          
          <button 
            @click="showAddModal = true"
            class="bg-primary-mint text-white px-6 py-3 rounded-xl font-semibold hover:bg-state-success transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
          >
            Agregar Mascota
          </button>
        </div>
      </div>

      <!-- Listado de mascotas -->
      <div v-if="pets.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        <div 
          v-for="pet in pets" 
          :key="pet._id" 
          class="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-neutral-light overflow-hidden group"
        >
          <!-- Imagen de la mascota -->
          <div class="relative">
            <img 
              :src="pet.image || getDefaultPetImage(pet.type)" 
              :alt="pet.name"
              class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div class="absolute top-3 right-3">
              <span class="bg-primary-mint text-white px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
                {{ pet.type }}
              </span>
            </div>
          </div>

          <!-- Información de la mascota -->
          <div class="p-5">
            <h2 class="font-bold text-xl text-neutral-dark mb-2 group-hover:text-primary-mint transition-colors">
              {{ pet.name }}
            </h2>
            
            <div class="space-y-2 mb-4">
              <div class="text-sm text-neutral-medium">
                {{ pet.age }} año{{ pet.age !== 1 ? 's' : '' }}
              </div>
              
              <div class="text-sm text-neutral-medium">
                ID: {{ pet._id.slice(-6) }}
              </div>
            </div>

            <!-- Botones de acción -->
            <div class="flex gap-2">
              <button 
                class="flex-1 bg-secondary text-white py-2 rounded-lg font-semibold hover:bg-secondary-dark transition-all duration-300 text-sm"
                @click="editPet(pet)"
              >
                Editar
              </button>
              
              <button 
                class="flex-1 bg-state-error text-white py-2 rounded-lg font-semibold hover:bg-red-600 transition-all duration-300 text-sm"
                @click="deletePet(pet._id)"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Estado vacío -->
      <div v-else class="text-center py-16">
        <div class="w-24 h-24 bg-neutral-light rounded-full flex items-center justify-center mx-auto mb-4">
          <span class="text-4xl">🐾</span>
        </div>
        <h3 class="text-xl font-semibold text-neutral-dark mb-2">No tienes mascotas registradas</h3>
        <p class="text-neutral-medium mb-6">Comienza agregando tu primera mascota</p>
        <button 
          @click="showAddModal = true"
          class="bg-primary-mint text-white px-8 py-3 rounded-xl font-semibold hover:bg-state-success transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl mx-auto"
        >
          Agregar Primera Mascota
        </button>
      </div>
    </div>

    <!-- Modal de Mascota - Estilo Mejorado -->
    <div
      v-if="showAddModal"
      class="fixed inset-0 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-neutral-light">
        <!-- Header del modal -->
        <div class="bg-gradient-to-r from-primary-mint to-teal-500 p-6 text-white rounded-t-2xl">
          <div class="flex justify-between items-start">
            <div>
              <h2 class="text-xl font-bold mb-1">{{ editMode ? 'Editar Mascota' : 'Agregar Mascota' }}</h2>
              <p class="text-sm opacity-90">{{ editMode ? 'Actualiza la información de tu mascota' : 'Registra una nueva mascota en tu cuenta' }}</p>
            </div>
            <button @click="closeModal" 
                    class="text-white hover:text-neutral-light transition-colors p-1 text-lg">
              ✕
            </button>
          </div>
        </div>

        <!-- Contenido del modal -->
        <div class="p-6">
          <form @submit.prevent="savePet">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block mb-3 font-semibold text-neutral-dark text-sm">Nombre de la mascota</label>
                <input 
                  type="text" 
                  v-model="form.name" 
                  placeholder="Ej: Max, Luna..."
                  class="w-full p-3 border border-neutral-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-mint bg-white transition-all"
                  required
                />
              </div>

              <div>
                <label class="block mb-3 font-semibold text-neutral-dark text-sm">Tipo de mascota</label>
                <select 
                  v-model="form.type" 
                  class="w-full p-3 border border-neutral-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-mint bg-white transition-all"
                  required
                >
                  <option disabled value="">Selecciona el tipo</option>
                  <option>Perro</option>
                  <option>Gato</option>
                  <option>Conejo</option>
                  <option>Ave</option>
                  <option>Otro</option>
                </select>
              </div>

              <div>
                <label class="block mb-3 font-semibold text-neutral-dark text-sm">Edad (años)</label>
                <input 
                  type="number" 
                  v-model="form.age" 
                  min="0" 
                  max="30"
                  placeholder="0"
                  class="w-full p-3 border border-neutral-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-mint bg-white transition-all"
                  required
                />
              </div>

              <div>
                <label class="block mb-3 font-semibold text-neutral-dark text-sm">URL de la foto</label>
                <input 
                  type="text" 
                  v-model="form.image" 
                  placeholder="https://ejemplo.com/foto.jpg"
                  class="w-full p-3 border border-neutral-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-mint bg-white transition-all"
                />
              </div>
            </div>

            <!-- Vista previa de imagen -->
            <div v-if="form.image || form.type" class="mt-6 bg-neutral-bg rounded-xl p-4 border border-neutral-light">
              <h3 class="font-semibold text-neutral-dark mb-3 text-sm">Vista Previa</h3>
              <div class="flex items-center gap-4">
                <img 
                  :src="form.image || getDefaultPetImage(form.type)" 
                  :alt="form.name || 'Mascota'"
                  class="w-16 h-16 rounded-lg object-cover border border-neutral-medium"
                />
                <div class="text-sm">
                  <p class="font-semibold text-neutral-dark">{{ form.name || 'Nombre de mascota' }}</p>
                  <p class="text-neutral-medium">{{ form.type || 'Tipo de mascota' }}</p>
                  <p class="text-neutral-medium" v-if="form.age">{{ form.age }} año{{ form.age != 1 ? 's' : '' }}</p>
                </div>
              </div>
              <p class="text-xs text-neutral-medium mt-2" v-if="!form.image">
                Se usará una imagen predeterminada para {{ form.type || 'la mascota' }}
              </p>
            </div>

            <!-- Botones de acción -->
            <div class="flex gap-3 mt-8">
              <button 
                type="button"
                class="flex-1 bg-neutral-light text-neutral-dark py-3 rounded-lg font-semibold hover:bg-neutral-medium transition-all duration-300"
                @click="closeModal"
              >
                Cancelar
              </button>
              
              <button 
                type="submit"
                class="flex-1 bg-primary-mint text-white py-3 rounded-lg font-semibold hover:bg-state-success transition-all duration-300"
                :disabled="!isFormValid"
                :class="{'opacity-50 cursor-not-allowed': !isFormValid}"
              >
                {{ editMode ? 'Guardar Cambios' : 'Agregar Mascota' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- CHATBOT FLOTANTE -->
    <Chatbot />
  </Layout>
</template>

<script>
import Layout from "@/components/Layout.vue"
import Chatbot from "@/components/Chatbot.vue";
import api from "@/api/api"
import { useUserStore } from "@/stores/userStore"

export default {
  name: "MyPets",
  components: { Layout, Chatbot },
  data() {
    return {
      pets: [],
      showAddModal: false,
      editMode: false,
      form: { name: "", type: "", age: "", image: "" },
    }
  },

  computed: {
    isFormValid() {
      return this.form.name && this.form.type && this.form.age !== "";
    }
  },

  async created() {
    const userStore = useUserStore()
    const token = userStore.token

    if (!token) return this.$router.push("/login")

    try {
      const { data } = await api.get("/pets", {
        headers: { Authorization: `Bearer ${token}` }
      })
      this.pets = data
    } catch (error) {
      console.error("Error cargando mascotas:", error)
    }
  },

  methods: {
    getDefaultPetImage(type) {
      const images = {
        'Perro': 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=400&fit=crop',
        'Gato': 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=400&fit=crop',
        'Conejo': 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=400&h=400&fit=crop',
        'Ave': 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=400&h=400&fit=crop'
      };
      return images[type] || 'https://images.unsplash.com/photo-1453227588063-bb302b62f50b?w=400&h=400&fit=crop';
    },

    closeModal() {
      this.showAddModal = false
      this.editMode = false
      this.form = { name: "", type: "", age: "", image: "" }
    },

    editPet(pet) {
      this.form = { ...pet }
      this.editMode = true
      this.showAddModal = true
    },

    async savePet() {
      const userStore = useUserStore()
      const token = userStore.token

      try {
        if (this.editMode) {
          const { data } = await api.put(`/pets/${this.form._id}`, this.form, {
            headers: { Authorization: `Bearer ${token}` }
          })
          this.pets = this.pets.map(p => p._id === data._id ? data : p)
        } else {
          const { data } = await api.post("/pets", this.form, {
            headers: { Authorization: `Bearer ${token}` }
          })
          this.pets.push(data)
        }
        this.closeModal()
      } catch (error) {
        console.error("Error al guardar mascota:", error)
        alert("Error al guardar mascota")
      }
    },

    async deletePet(id) {
      if (!confirm("¿Estás seguro de que quieres eliminar esta mascota?")) return

      const userStore = useUserStore()
      const token = userStore.token

      try {
        await api.delete(`/pets/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        this.pets = this.pets.filter(p => p._id !== id)
      } catch (error) {
        console.error("Error al eliminar mascota:", error)
        alert("Error al eliminar la mascota")
      }
    }
  }
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

.bg-state-error {
  background-color: #dc2626;
}

.hover\:bg-red-600:hover {
  background-color: #b91c1c;
}

.bg-secondary {
  background-color: #8b5cf6;
}

.hover\:bg-secondary-dark:hover {
  background-color: #7c3aed;
}

.cursor-not-allowed {
  cursor: not-allowed;
}
</style>