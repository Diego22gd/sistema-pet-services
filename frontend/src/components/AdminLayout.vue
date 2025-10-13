<template>
  <div class="bg-neutral-bg min-h-screen flex flex-col">
    <!-- Header -->
    <header class="fixed top-0 left-0 right-0 w-full z-50 bg-primary-mint text-white flex justify-between items-center py-4 shadow-md px-6">
      <div class="text-2xl font-bold">🐾 PetServices Admin</div>
      <nav class="flex space-x-6">
        <router-link to="/admin" class="text-white hover:text-secondary transition-colors">Dashboard</router-link>
        <router-link to="/admin/clients" class="text-white hover:text-secondary transition-colors">Clients</router-link>
        <router-link to="/admin/providers" class="text-white hover:text-secondary transition-colors">Providers</router-link>
        <router-link to="/admin/appointments" class="text-white hover:text-secondary transition-colors">Appointments</router-link>
        <router-link to="/admin/reports" class="text-white hover:text-secondary transition-colors">Reports</router-link>
        <router-link to="/admin/services" class="text-white hover:text-secondary transition-colors">Services</router-link>
        <router-link to="/admin/settings" class="text-white hover:text-secondary transition-colors">Settings</router-link>
        <router-link to="/admin/users" class="text-white hover:text-secondary transition-colors">Users</router-link>
        <button
          @click="logout"
          class="ml-4 bg-white text-state-error px-3 py-1 rounded-lg font-semibold hover:bg-neutral-light transition"
        >
          Logout
        </button>
      </nav>
    </header>

    <!-- Contenido de la vista -->
    <main class="flex-1 pt-28 px-6">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-neutral-light text-neutral-dark py-6 mt-auto shadow-inner">
      <div class="max-w-7xl mx-auto text-center">
        &copy; 2025 PetServices Admin. All rights reserved.
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: "AdminLayout",
  methods: {
    logout() {
      localStorage.removeItem('user');
      this.$router.push('/login');
    }
  }
};
</script>

<style scoped>
main {
  min-height: calc(100vh - 120px); /* Ajusta para footer y header */
}
</style>
