<template>
  <header class="fixed top-0 left-0 right-0 w-full z-50 bg-primary-mint text-white flex justify-between items-center py-4 shadow-md px-6">
    <!-- Logo -->
    <div class="text-2xl font-bold">🐾 PetServices</div>

    <!-- Navegación + Cerrar sesión -->
    <nav class="flex items-center space-x-4 mr-4">
      <router-link 
        to="/services" 
        class="text-white hover:text-secondary transition-colors"
      >
        Servicios
      </router-link>
      <router-link 
        to="/appointments" 
        class="text-white hover:text-secondary transition-colors"
      >
        Citas
      </router-link>
      <router-link 
        to="/MyPets" 
        class="text-white hover:text-secondary transition-colors"
      >
        Mis Mascotas
      </router-link>
      <router-link 
        to="/profile" 
        class="text-white hover:text-secondary transition-colors"
      >
        Perfil
      </router-link>

      <!-- Botón Cerrar Sesión -->
      <button
        @click="logout"
        class="ml-4 bg-white text-state-error px-3 py-1 rounded-lg font-semibold hover:bg-neutral-light transition"
      >
        Cerrar Sesión
      </button>
    </nav>
  </header>
</template>

<script>
export default {
  name: "Header",
  methods: {
    logout() {
      // Aquí puedes limpiar el estado de usuario / token y redirigir
      console.log("Usuario ha cerrado sesión");
      this.$router.push("/login"); // Redirige a login
    }
  }
}
</script>

<style scoped>
/* Ajusta la navegación para que no se pegue al borde */
nav {
  max-width: calc(100% - 180px); /* Ajusta según lo que necesites */
}
</style>
