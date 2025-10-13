<template>
  <div class="bg-neutral-bg min-h-screen flex flex-col">
    <!-- Header -->
    <header class="fixed top-0 left-0 right-0 w-full z-50 bg-primary-mint text-white flex justify-between items-center py-4 shadow-md px-6">
      <div class="text-2xl font-bold">🐾 PetServices</div>
      <nav class="flex space-x-6">
        <router-link to="/provider/dashboard" class="text-white hover:text-secondary transition-colors">Dashboard</router-link>
        <router-link to="/provider/appointments" class="text-white hover:text-secondary transition-colors">Appointments</router-link>
        <router-link to="/provider/profile" class="text-white hover:text-secondary transition-colors">Profile</router-link>
        <router-link to="/provider/notifications" class="text-white hover:text-secondary transition-colors">Notifications</router-link>
        <router-link to="/provider/services" class="text-white hover:text-secondary transition-colors">Services</router-link>
        <router-link to="/provider/reports" class="text-white hover:text-secondary transition-colors">Reports</router-link>
         <button
        @click="logout"
        class="ml-4 bg-white text-state-error px-3 py-1 rounded-lg font-semibold hover:bg-neutral-light transition"
      >
        Cerrar Sesión
      </button>
      </nav>
    </header>

    <!-- Contenido de la vista -->
    <main class="flex-1 pt-28 px-6">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-neutral-light text-neutral-dark py-6 mt-auto shadow-inner ">
      <div class="max-w-7xl mx-auto text-center">
        &copy; 2025 PetServices. Todos los derechos reservados.
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: "ProviderLayout",
  methods: {
    logout() {
      localStorage.removeItem('user');
      this.$router.push('/login');
    }
  }
};
</script>

<style scoped>
/* Ajustes opcionales para el header fijo */
main {
  min-height: calc(100vh - 120px); /* Ajusta para footer y header */
}
</style>
