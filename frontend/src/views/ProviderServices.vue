<template>
  <ProviderLayout>
    <div class="px-6 max-w-5xl mx-auto w-full pt-4">
      <h1 class="text-2xl font-bold mb-6 text-neutral-dark">Gestión de Servicios</h1>

      <!-- Lista de servicios -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div 
          v-for="(service, index) in services" 
          :key="index" 
          class="bg-neutral-light shadow rounded-2xl p-6"
        >
          <h2 class="text-xl font-semibold text-neutral-dark">{{ service.name }}</h2>
          <p class="text-neutral-medium mb-2">{{ service.description }}</p>
          <p class="text-sm text-neutral-dark font-semibold">Precio: ${{ service.price }}</p>
          <div class="flex justify-between mt-4">
            <button 
              class="px-4 py-2 bg-primary-mint text-white rounded-lg hover:bg-state-success transition"
              @click="editService(index)"
            >
              Editar
            </button>
            <button 
              class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              @click="deleteService(index)"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>

      <!-- Botón para agregar servicio -->
      <div class="mt-8 text-center">
        <button 
          class="px-6 py-3 bg-secondary text-white rounded-xl hover:bg-secondary-dark transition"
          @click="addService"
        >
          + Agregar Servicio
        </button>
      </div>
    </div>
  </ProviderLayout>
</template>

<script>
import ProviderLayout from "@/components/ProviderLayout.vue";

export default {
  name: "ProviderServices",
  components: { ProviderLayout },
  data() {
    return {
      services: [
        { name: "Consulta Veterinaria", description: "Revisión general de tu mascota.", price: 25 },
        { name: "Peluquería Canina", description: "Baño, corte y cuidado estético.", price: 40 }
      ]
    };
  },
  methods: {
    addService() {
      alert("Abrir modal para agregar servicio");
    },
    editService(index) {
      alert(`Editar servicio: ${this.services[index].name}`);
    },
    deleteService(index) {
      this.services.splice(index, 1);
    }
  }
};
</script>
