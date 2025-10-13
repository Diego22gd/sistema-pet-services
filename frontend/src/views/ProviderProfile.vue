<template>
  <ProviderLayout>
    <div class="px-6 max-w-5xl mx-auto w-full pt-4 ">
      <h1 class="text-2xl font-bold mb-6 text-neutral-dark">Perfil del Proveedor</h1>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Información General -->
        <div class="bg-neutral-light rounded-2xl shadow-lg p-6">
          <h2 class="text-lg font-semibold text-neutral-dark mb-4">Información General</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-neutral-dark">Nombre del Negocio</label>
              <input v-model="provider.name" type="text" class="w-full border border-neutral-medium rounded-lg p-2 focus:ring-2 focus:ring-primary focus:outline-none">
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-dark">Descripción</label>
              <textarea v-model="provider.description" rows="3" class="w-full border border-neutral-medium rounded-lg p-2 focus:ring-2 focus:ring-primary focus:outline-none"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-dark">Categoría</label>
              <select v-model="provider.category" class="w-full border border-neutral-medium rounded-lg p-2 focus:ring-2 focus:ring-primary focus:outline-none">
                <option>Veterinaria</option>
                <option>Peluquería</option>
                <option>Guardería</option>
                <option>Tienda de Mascotas</option>
                <option>Adiestramiento</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Contacto -->
        <div class="bg-neutral-light rounded-2xl shadow-lg p-6">
          <h2 class="text-lg font-semibold text-neutral-dark mb-4">Contacto</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-neutral-dark">Teléfono</label>
              <input v-model="provider.phone" type="text" class="w-full border border-neutral-medium rounded-lg p-2 focus:ring-2 focus:ring-primary focus:outline-none">
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-dark">Email</label>
              <input v-model="provider.email" type="email" class="w-full border border-neutral-medium rounded-lg p-2 focus:ring-2 focus:ring-primary focus:outline-none">
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-dark">Dirección</label>
              <input v-model="provider.address" type="text" class="w-full border border-neutral-medium rounded-lg p-2 focus:ring-2 focus:ring-primary focus:outline-none">
            </div>
          </div>
        </div>
      </div>

      <!-- Horarios -->
      <div class="bg-neutral-light rounded-2xl shadow-lg p-6 mt-6">
        <h2 class="text-lg font-semibold text-neutral-dark mb-4">Horarios</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="day in weekDays" :key="day" class="flex items-center gap-4">
            <label class="w-24 font-medium text-neutral-dark">{{ day }}</label>
            <input type="time" v-model="provider.schedule[day].open" class="border border-neutral-medium rounded-lg p-2 focus:ring-2 focus:ring-primary focus:outline-none">
            <span>-</span>
            <input type="time" v-model="provider.schedule[day].close" class="border border-neutral-medium rounded-lg p-2 focus:ring-2 focus:ring-primary focus:outline-none">
          </div>
        </div>
      </div>

      <!-- Botones -->
      <div class="flex justify-end gap-4 mt-6 mb-4">
        <button 
          @click="resetForm" 
          class="px-6 py-2 rounded-lg border border-neutral-medium text-neutral-dark hover:bg-neutral-medium hover:text-white transition"
        >
          Cancelar
        </button>
        <button 
          @click="saveProfile" 
          class="px-6 py-2 rounded-lg bg-primary-mint text-white hover:bg-primary transition"
        >
          Guardar Cambios
        </button>
      </div>
    </div>
  </ProviderLayout>
</template>

<script>
import ProviderLayout from "@/components/ProviderLayout.vue";

export default {
  name: "ProviderProfile",
  components: { ProviderLayout },
  data() {
    return {
      provider: {
        name: "Veterinaria Salud Animal",
        description: "Cuidamos la salud y el bienestar de tus mascotas.",
        category: "Veterinaria",
        phone: "123456789",
        email: "contacto@saludanimal.com",
        address: "Av. Principal 45, Ciudad",
        schedule: {
          Lunes: { open: "09:00", close: "18:00" },
          Martes: { open: "09:00", close: "18:00" },
          Miércoles: { open: "09:00", close: "18:00" },
          Jueves: { open: "09:00", close: "18:00" },
          Viernes: { open: "09:00", close: "18:00" },
          Sábado: { open: "10:00", close: "14:00" },
          Domingo: { open: "", close: "" },
        },
      },
      weekDays: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
    };
  },
  methods: {
    resetForm() {
      alert("Cambios cancelados");
    },
    saveProfile() {
      alert("Perfil actualizado correctamente");
    }
  }
};
</script>
