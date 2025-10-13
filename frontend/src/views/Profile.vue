<template>
  <Layout>
    <div class="p-6 max-w-4xl mx-auto bg-neutral-bg min-h-[80vh] pt-8">
      <h1 class="text-2xl font-bold mb-6 text-neutral-dark">Mi Perfil</h1>

      <!-- Información Personal -->
      <div class="bg-neutral-light shadow rounded-2xl p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4 text-neutral-dark">Información Personal</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1 text-neutral-dark">Nombre:</label>
            <input type="text" v-model="user.name" class="w-full p-2 border border-neutral-medium rounded-lg focus:ring-2 focus:ring-secondary focus:outline-none" />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1 text-neutral-dark">Apellido:</label>
            <input type="text" v-model="user.lastname" class="w-full p-2 border border-neutral-medium rounded-lg focus:ring-2 focus:ring-secondary focus:outline-none" />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1 text-neutral-dark">Cédula:</label>
            <input type="text" v-model="user.cedula" class="w-full p-2 border border-neutral-medium rounded-lg focus:ring-2 focus:ring-secondary focus:outline-none" />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1 text-neutral-dark">Teléfono:</label>
            <input type="text" v-model="user.phone" class="w-full p-2 border border-neutral-medium rounded-lg focus:ring-2 focus:ring-secondary focus:outline-none" />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1 text-neutral-dark">Correo electrónico:</label>
            <input type="email" v-model="user.email" class="w-full p-2 border border-neutral-medium rounded-lg focus:ring-2 focus:ring-secondary focus:outline-none" />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1 text-neutral-dark">Fecha de nacimiento:</label>
            <input type="date" v-model="user.birthdate" class="w-full p-2 border border-neutral-medium rounded-lg focus:ring-2 focus:ring-secondary focus:outline-none" />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1 text-neutral-dark">Dirección:</label>
            <input type="text" v-model="user.address" class="w-full p-2 border border-neutral-medium rounded-lg focus:ring-2 focus:ring-secondary focus:outline-none" />
          </div>
        </div>

        <!-- Campos especiales si es proveedor -->
        <div v-if="user.userType === 'proveedor'" class="mt-4">
          <h3 class="text-lg font-semibold mb-2 text-neutral-dark">Información del Comercio</h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1 text-neutral-dark">Nombre del comercio:</label>
              <input type="text" v-model="user.businessName" class="w-full p-2 border border-neutral-medium rounded-lg focus:ring-2 focus:ring-secondary focus:outline-none" />
            </div>

            <div>
              <label class="block text-sm font-medium mb-1 text-neutral-dark">Tipo de servicio:</label>
              <select v-model="user.serviceType" class="w-full p-2 border border-neutral-medium rounded-lg focus:ring-2 focus:ring-secondary focus:outline-none">
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

      <!-- Reservas del usuario -->
      <div class="bg-neutral-light shadow rounded-2xl p-6">
        <h2 class="text-xl font-semibold mb-4 text-neutral-dark">Mis Reservas</h2>

        <div v-if="reservations.length === 0" class="text-neutral-medium">
          No tienes reservas activas.
        </div>

        <ul v-else class="space-y-4">
          <li 
            v-for="res in reservations" 
            :key="res.id" 
            class="border border-neutral-medium p-4 rounded-lg flex justify-between items-center bg-white"
          >
            <div>
              <p class="font-semibold text-neutral-dark">{{ res.serviceName }}</p>
              <p class="text-neutral-medium text-sm">{{ res.date }} a las {{ res.time }}</p>
            </div>
            <button 
              class="px-3 py-1 bg-state-error text-white rounded-lg hover:opacity-90 transition"
              @click="cancelReservation(res.id)"
            >
              Cancelar
            </button>
          </li>
        </ul>
      </div>
    </div>
  </Layout>
</template>

<script>
import Layout from '@/components/Layout.vue';

export default {
  name: "Profile",
  components: { Layout },
  data() {
    return {
      user: {
        name: "Yngrid",
        lastname: "Gonzalez",
        email: "yngrid@example.com",
        phone: "+58 4121234567",
        address: "Calle Falsa 123",
        birthdate: "1995-08-26",
        userType: "cliente", // cliente o proveedor
        businessName: "",
        serviceType: ""
      },
      reservations: [
        { id: 1, serviceName: "Baño y peluquería", date: "2025-08-25", time: "10:00" },
        { id: 2, serviceName: "Vacunación", date: "2025-08-28", time: "15:30" }
      ]
    }
  },
  methods: {
    updateProfile() {
      alert(`Perfil actualizado:\nNombre: ${this.user.name} ${this.user.lastname}\nCorreo: ${this.user.email}`);
      // Aquí se puede agregar lógica para enviar los datos a la API/backend
    },
    cancelReservation(reservationId) {
      this.reservations = this.reservations.filter(r => r.id !== reservationId);
      alert(`Reserva ID ${reservationId} cancelada`);
      // Aquí se puede agregar lógica para cancelar la reserva en el backend
    }
  }
}
</script>
