<template>
  <Layout>
    <div class="p-6 max-w-4xl mx-auto bg-neutral-bg min-h-[80vh]">
      <h1 class="text-2xl font-bold mb-6 text-neutral-dark">Mis Mascotas</h1>

      <div class="mb-6 flex justify-end">
        <button 
          @click="showAddModal = true"
          class="px-4 py-2 bg-primary-mint text-white rounded-lg hover:bg-state-success transition"
        >
          + Agregar Mascota
        </button>
      </div>

      <!-- Listado -->
      <div v-if="pets.length" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <div 
          v-for="pet in pets" 
          :key="pet._id" 
          class="bg-white shadow-lg rounded-2xl p-4 flex flex-col items-center hover:shadow-2xl transition"
        >
          <img :src="pet.image || 'https://placekitten.com/100/100'" alt="Mascota" class="w-32 h-32 object-cover rounded-full mb-2 border border-neutral-medium"/>
          <h2 class="font-semibold text-lg text-neutral-dark">{{ pet.name }}</h2>
          <p class="text-neutral-medium text-sm">Tipo: {{ pet.type }}</p>
          <p class="text-neutral-medium text-sm">Edad: {{ pet.age }} años</p>

          <div class="flex gap-2 mt-3">
            <button 
              class="px-3 py-1 bg-secondary text-white rounded-lg hover:bg-secondary-dark transition"
              @click="editPet(pet)"
            >
              Editar
            </button>
            <button 
              class="px-3 py-1 bg-state-error text-white rounded-lg hover:opacity-90 transition"
              @click="deletePet(pet._id)"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>

      <div v-else class="text-center text-neutral-medium">No tienes mascotas registradas.</div>

      <!-- Modal -->
      <div v-if="showAddModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div class="bg-neutral-light rounded-2xl p-6 w-96 relative">
          <h2 class="text-xl font-bold mb-4 text-neutral-dark">{{ editMode ? 'Editar Mascota' : 'Agregar Mascota' }}</h2>

          <label class="block mb-1 text-neutral-dark font-medium">Nombre:</label>
          <input type="text" v-model="form.name" class="w-full p-2 border border-neutral-medium rounded mb-2"/>

          <label class="block mb-1 text-neutral-dark font-medium">Tipo:</label>
          <select v-model="form.type" class="w-full p-2 border border-neutral-medium rounded mb-2">
            <option disabled value="">Selecciona</option>
            <option>Perro</option>
            <option>Gato</option>
            <option>Otro</option>
          </select>

          <label class="block mb-1 text-neutral-dark font-medium">Edad:</label>
          <input type="number" v-model="form.age" class="w-full p-2 border border-neutral-medium rounded mb-2"/>

          <label class="block mb-1 text-neutral-dark font-medium">Foto URL:</label>
          <input type="text" v-model="form.image" class="w-full p-2 border border-neutral-medium rounded mb-4"/>

          <div class="flex justify-end gap-2">
            <button class="px-4 py-2 rounded bg-neutral-medium text-white" @click="closeModal">Cancelar</button>
            <button class="px-4 py-2 rounded bg-primary-mint text-white hover:bg-state-success transition" @click="savePet">{{ editMode ? 'Guardar' : 'Agregar' }}</button>
          </div>

          <button class="absolute top-2 right-2 text-neutral-medium hover:text-neutral-dark" @click="closeModal">✕</button>
        </div>
      </div>
    </div>
  </Layout>
  <Chatbot />
</template>

<script>
import Layout from "@/components/Layout.vue"
import Chatbot from "@/components/Chatbot.vue";
import api from "@/api/api"
import { useUserStore } from "@/stores/userStore"

export default {
  name: "MyPets",
  components: { Layout , Chatbot },
  data() {
    return {
      pets: [],
      showAddModal: false,
      editMode: false,
      form: { name: "", type: "", age: "", image: "" },
    }
  },

  async created() {
    const userStore = useUserStore()
    const token = userStore.token

    if (!token) return this.$router.push("/login")

    try {
      // ✔ RUTA CORRECTA: usa el token, NO usa /user/:id
      const { data } = await api.get("/pets", {
        headers: { Authorization: `Bearer ${token}` }
      })
      this.pets = data
    } catch (error) {
      console.error("Error cargando mascotas:", error)
    }
  },

  methods: {
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
      if (!confirm("¿Eliminar esta mascota?")) return

      const userStore = useUserStore()
      const token = userStore.token

      try {
        await api.delete(`/pets/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        this.pets = this.pets.filter(p => p._id !== id)
      } catch (error) {
        console.error("Error al eliminar mascota:", error)
      }
    }
  }
}
</script>
