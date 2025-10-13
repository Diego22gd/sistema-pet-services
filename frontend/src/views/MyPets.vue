<template>
  <Layout>
    <div class="p-6 max-w-4xl mx-auto bg-neutral-bg min-h-[80vh]">
      <h1 class="text-2xl font-bold mb-6 text-neutral-dark">Mis Mascotas</h1>

      <!-- Botón agregar mascota -->
      <div class="mb-6 flex justify-end">
        <button 
          @click="showAddModal = true"
          class="px-4 py-2 bg-primary-mint text-white rounded-lg hover:bg-state-success transition"
        >
          + Agregar Mascota
        </button>
      </div>

      <!-- Listado de mascotas -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <div 
          v-for="pet in pets" 
          :key="pet.id" 
          class="bg-white shadow-lg rounded-2xl p-4 flex flex-col items-center hover:shadow-2xl transition"
        >
          <img :src="pet.image" alt="Mascota" class="w-32 h-32 object-cover rounded-full mb-2 border border-neutral-medium"/>
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
              @click="deletePet(pet.id)"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>

      <!-- Modal agregar/editar mascota -->
      <div v-if="showAddModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div class="bg-neutral-light rounded-2xl p-6 w-96 relative">
          <h2 class="text-xl font-bold mb-4 text-neutral-dark">{{ editMode ? 'Editar Mascota' : 'Agregar Mascota' }}</h2>

          <label class="block mb-1 text-neutral-dark font-medium">Nombre:</label>
          <input type="text" v-model="form.name" class="w-full p-2 border border-neutral-medium rounded mb-2 focus:ring-2 focus:ring-secondary focus:outline-none"/>

          <label class="block mb-1 text-neutral-dark font-medium">Tipo:</label>
          <select v-model="form.type" class="w-full p-2 border border-neutral-medium rounded mb-2 focus:ring-2 focus:ring-secondary focus:outline-none">
            <option disabled value="">Selecciona</option>
            <option>Perro</option>
            <option>Gato</option>
            <option>Otro</option>
          </select>

          <label class="block mb-1 text-neutral-dark font-medium">Edad:</label>
          <input type="number" v-model="form.age" class="w-full p-2 border border-neutral-medium rounded mb-2 focus:ring-2 focus:ring-secondary focus:outline-none"/>

          <label class="block mb-1 text-neutral-dark font-medium">Foto URL:</label>
          <input type="text" v-model="form.image" placeholder="https://..." class="w-full p-2 border border-neutral-medium rounded mb-4 focus:ring-2 focus:ring-secondary focus:outline-none"/>

          <div class="flex justify-end gap-2">
            <button class="px-4 py-2 rounded bg-neutral-medium text-white hover:bg-neutral-dark transition" @click="closeModal">Cancelar</button>
            <button class="px-4 py-2 rounded bg-primary-mint text-white hover:bg-state-success transition" @click="savePet">{{ editMode ? 'Guardar Cambios' : 'Agregar' }}</button>
          </div>

          <button class="absolute top-2 right-2 text-neutral-medium hover:text-neutral-dark" @click="closeModal">✕</button>
        </div>
      </div>

    </div>
  </Layout>
</template>

<script>
import Layout from "@/components/Layout.vue";

export default {
  name: "MyPets",
  components: { Layout },
  data() {
    return {
      pets: [
        { id: 1, name: "Firulais", type: "Perro", age: 3, image: "https://place-puppy.com/100x100" },
        { id: 2, name: "Misu", type: "Gato", age: 2, image: "https://placekitten.com/100/100" }
      ],
      showAddModal: false,
      editMode: false,
      form: {
        id: null,
        name: "",
        type: "",
        age: "",
        image: ""
      }
    }
  },
  methods: {
    closeModal() {
      this.showAddModal = false;
      this.editMode = false;
      this.form = { id: null, name: "", type: "", age: "", image: "" };
    },
    savePet() {
      if (!this.form.name || !this.form.type || !this.form.age || !this.form.image) {
        alert("Todos los campos son obligatorios");
        return;
      }

      if (this.editMode) {
        const index = this.pets.findIndex(p => p.id === this.form.id);
        if (index !== -1) this.pets[index] = { ...this.form };
      } else {
        this.form.id = Date.now();
        this.pets.push({ ...this.form });
      }

      this.closeModal();
    },
    editPet(pet) {
      this.form = { ...pet };
      this.editMode = true;
      this.showAddModal = true;
    },
    deletePet(id) {
      if (confirm("¿Deseas eliminar esta mascota?")) {
        this.pets = this.pets.filter(p => p.id !== id);
      }
    }
  }
}
</script>
