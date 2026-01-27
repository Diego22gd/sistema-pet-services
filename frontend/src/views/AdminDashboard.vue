<template>
  <AdminLayout>
    <!-- Encabezado con notificaciones -->
    <div class="flex justify-between items-center px-6 pt-16 pb-6 max-w-7xl mx-auto mt-8">
      <div>
        <h1 class="text-3xl font-extrabold text-neutral-dark">Panel de Administración</h1>
        <p class="text-neutral-medium mt-2">Bienvenido de nuevo, Administrador</p>
      </div>
    </div>

    <!-- Grid con 6 tarjetas para administrador -->
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
      <h2 class="text-2xl font-bold text-neutral-dark mb-6">Estadísticas Rápidas</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-white shadow-lg rounded-2xl p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-neutral-medium text-sm">Total de Usuarios</p>
              <p class="text-3xl font-bold text-emerald-600 mt-2">{{ stats.totalUsers }}</p>
            </div>
            <div class="text-4xl">👥</div>
          </div>
        </div>
        
        <div class="bg-white shadow-lg rounded-2xl p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-neutral-medium text-sm">Proveedores Activos</p>
              <p class="text-3xl font-bold text-emerald-600 mt-2">{{ stats.activeProviders }}</p>
            </div>
            <div class="text-4xl">👨‍💼</div>
          </div>
        </div>
        
        <div class="bg-white shadow-lg rounded-2xl p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-neutral-medium text-sm">Citas de Hoy</p>
              <p class="text-3xl font-bold text-emerald-600 mt-2">{{ stats.todayAppointments }}</p>
            </div>
            <div class="text-4xl">📅</div>
          </div>
        </div>
        
        <div class="bg-white shadow-lg rounded-2xl p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-neutral-medium text-sm">Reseñas Pendientes</p>
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
          title: "Gestión de Usuarios", 
          description: "Administra todos los usuarios del sistema", 
          route: "/admin/users", 
          icon: "👥" 
        },
        { 
          title: "Proveedores", 
          description: "Gestiona los proveedores de servicios", 
          route: "/admin/providers", 
          icon: "👨‍💼" 
        },
        { 
          title: "Clientes", 
          description: "Visualiza y administra clientes", 
          route: "/admin/clients", 
          icon: "👤" 
        },
        { 
          title: "Comercios", 
          description: "Administra los listados de negocios", 
          route: "/admin/commerces", 
          icon: "🏬" 
        },
        { 
          title: "Citas", 
          description: "Visualiza todas las citas", 
          route: "/admin/appointments", 
          icon: "📅" 
        },
        { 
          title: "Configuración", 
          description: "Configuración del sistema", 
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
/* Animación suave al pasar el cursor sobre las tarjetas */
div:hover .text-5xl {
  transform: scale(1.1);
  transition: transform 0.3s ease;
}

/* Colores personalizados para administración */
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

/* Efecto hover para las tarjetas de estadísticas */
.bg-white {
  transition: all 0.3s ease;
}

.bg-white:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

/* Ajustes responsivos */
@media (max-width: 640px) {
  .grid-cols-2 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}
</style>