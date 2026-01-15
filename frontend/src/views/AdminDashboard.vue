<template>
  <AdminLayout>
    <!-- Header con notificaciones -->
    <div class="flex justify-between items-center px-6 pt-16 pb-6 max-w-7xl mx-auto mt-8">
      <div>
        <h1 class="text-3xl font-extrabold text-neutral-dark">Admin Dashboard</h1>
        <p class="text-neutral-medium mt-2">Welcome back, Administrator</p>
      </div>
    </div>

    <!-- Grid con 6 cards para admin -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-6 max-w-7xl mx-auto pb-10">
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

    <!-- Sección de estadísticas rápidas -->
    <div class="px-6 max-w-7xl mx-auto mb-12">
      <h2 class="text-2xl font-bold text-neutral-dark mb-6">Quick Stats</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-white shadow-lg rounded-2xl p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-neutral-medium text-sm">Total Users</p>
              <p class="text-3xl font-bold text-emerald-600 mt-2">{{ stats.totalUsers }}</p>
            </div>
            <div class="text-4xl">👥</div>
          </div>
        </div>
        
        <div class="bg-white shadow-lg rounded-2xl p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-neutral-medium text-sm">Active Providers</p>
              <p class="text-3xl font-bold text-emerald-600 mt-2">{{ stats.activeProviders }}</p>
            </div>
            <div class="text-4xl">👨‍💼</div>
          </div>
        </div>
        
        <div class="bg-white shadow-lg rounded-2xl p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-neutral-medium text-sm">Today's Appointments</p>
              <p class="text-3xl font-bold text-emerald-600 mt-2">{{ stats.todayAppointments }}</p>
            </div>
            <div class="text-4xl">📅</div>
          </div>
        </div>
        
        <div class="bg-white shadow-lg rounded-2xl p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-neutral-medium text-sm">Pending Reviews</p>
              <p class="text-3xl font-bold text-emerald-600 mt-2">{{ stats.pendingReviews }}</p>
            </div>
            <div class="text-4xl">⭐</div>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script>
import AdminLayout from "@/components/AdminLayout.vue";

export default {
  name: "AdminDashboard",
  components: { AdminLayout },
  data() {
    return {
      stats: {
        totalUsers: 1248,
        activeProviders: 156,
        todayAppointments: 89,
        pendingReviews: 23
      },
      cards: [
        { 
          title: "Users Management", 
          description: "Manage all system users", 
          route: "/admin/users", 
          icon: "👥" 
        },
        { 
          title: "Providers", 
          description: "Manage service providers", 
          route: "/admin/providers", 
          icon: "👨‍💼" 
        },
        { 
          title: "Clients", 
          description: "View and manage clients", 
          route: "/admin/clients", 
          icon: "👤" 
        },
        { 
          title: "Commerces", 
          description: "Manage business listings", 
          route: "/admin/commerces", 
          icon: "🏬" 
        },
        { 
          title: "Appointments", 
          description: "View all appointments", 
          route: "/admin/appointments", 
          icon: "📅" 
        },
        { 
          title: "Settings", 
          description: "System configuration", 
          route: "/admin/settings", 
          icon: "⚙️" 
        }
      ]
    }
  },
  methods: {
    navigate(route) {
      this.$router.push(route)
    }
  }
}
</script>

<style scoped>
/* Animación suave al hover para las cards */
div:hover .text-5xl {
  transform: scale(1.1);
  transition: transform 0.3s ease;
}

/* Colores personalizados para admin */
.bg-emerald-600 {
  background-color: #059669;
}

.text-emerald-600 {
  color: #059669;
}

.bg-neutral-light {
  background-color: #f5f5f5;
}

.text-neutral-dark {
  color: #171717;
}

.text-neutral-medium {
  color: #737373;
}

/* Efecto hover para las cards de estadísticas */
.bg-white {
  transition: all 0.3s ease;
}

.bg-white:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .grid-cols-2 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}
</style>