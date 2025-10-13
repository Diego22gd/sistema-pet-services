<template>
  <ProviderLayout>
    <!-- Header con notificaciones -->
    <div class="flex justify-between items-center px-6 pt-8 pb-6 max-w-7xl mx-auto">
      <h1 class="text-3xl font-extrabold text-neutral-dark">Provider Dashboard</h1>
      
      <!-- Botón de notificaciones -->
      <button 
        class="relative p-3 rounded-full bg-neutral-light hover:bg-primary-mint hover:text-white transition shadow-md"
        @click="goToNotifications"
      >
        🔔
        <span v-if="unreadNotifications > 0" 
          class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-2 py-0.5 shadow">
          {{ unreadNotifications }}
        </span>
      </button>
    </div>

    <!-- Grid con 4 cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-6 max-w-7xl mx-auto pb-10">
      <div 
        v-for="card in cards" 
        :key="card.title" 
        class="bg-white shadow-lg rounded-2xl p-6 flex flex-col items-center justify-center text-center transform hover:-translate-y-2 hover:shadow-xl transition cursor-pointer"
        @click="navigate(card.route)"
      >
        <div class="text-5xl mb-4">{{ card.icon }}</div>
        <h2 class="font-bold text-xl text-neutral-dark mb-2">{{ card.title }}</h2>
        <p class="text-neutral-medium text-sm">{{ card.description }}</p>
      </div>
    </div>
  </ProviderLayout>
</template>

<script>
import ProviderLayout from "@/components/ProviderLayout.vue";

export default {
  name: "ProviderDashboard",
  components: { ProviderLayout },
  data() {
    return {
      unreadNotifications: 3,
      cards: [
        { 
          title: "Profile", 
          description: "Edit your business information", 
          route: "/provider/profile", 
          icon: "👤" 
        },
        { 
          title: "Services", 
          description: "Manage the services you offer", 
          route: "/provider/services", 
          icon: "💼" 
        },
        { 
          title: "Appointments", 
          description: "Check and update client bookings", 
          route: "/provider/appointments", 
          icon: "📅" 
        },
        { 
          title: "Reports", 
          description: "View business performance metrics", 
          route: "/provider/reports", 
          icon: "📊" 
        }
      ]
    }
  },
  methods: {
    navigate(route) {
      this.$router.push(route)
    },
    goToNotifications() {
      this.$router.push("/provider/notifications")
    }
  }
}
</script>

<style scoped>
/* Animación suave al hover */
div:hover .text-5xl {
  transform: scale(1.1);
  transition: transform 0.3s ease;
}
</style>
