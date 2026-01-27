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
        class="admin-card"
        @click="navigate(card.route)"
      >
        <div class="text-5xl mb-4 card-icon">{{ card.icon }}</div>
        <h2 class="font-bold text-xl text-neutral-dark mb-2">{{ card.title }}</h2>
        <p class="text-neutral-medium text-sm">{{ card.description }}</p>
      </div>
    </div>

    <!-- Sección de estadísticas rápidas -->
    <div class="px-6 max-w-7xl mx-auto mb-12">
      <h2 class="text-2xl font-bold text-neutral-dark mb-6">Estadísticas Rápidas</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="stat-card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-neutral-medium text-sm">Total de Usuarios</p>
              <p class="text-3xl font-bold text-emerald-600 mt-2">{{ stats.totalUsers }}</p>
            </div>
            <div class="text-4xl stat-icon">👥</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-neutral-medium text-sm">Proveedores Activos</p>
              <p class="text-3xl font-bold text-emerald-600 mt-2">{{ stats.activeProviders }}</p>
            </div>
            <div class="text-4xl stat-icon">👨‍💼</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-neutral-medium text-sm">Citas de Hoy</p>
              <p class="text-3xl font-bold text-emerald-600 mt-2">{{ stats.todayAppointments }}</p>
            </div>
            <div class="text-4xl stat-icon">📅</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-neutral-medium text-sm">Reseñas Pendientes</p>
              <p class="text-3xl font-bold text-emerald-600 mt-2">{{ stats.pendingReviews }}</p>
            </div>
            <div class="text-4xl stat-icon">⭐</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Chatbot SIN protector - versión simplificada -->
    <Chatbot ref="chatbot" />
  </AdminLayout>
</template>

<script>
import AdminLayout from "@/components/AdminLayout.vue";
import Chatbot from "@/components/Chatbot.vue";

export default {
  name: "AdminDashboard",
  components: { AdminLayout, Chatbot },
  data() {
    return {
      stats: {
        totalUsers: 148,
        activeProviders: 16,
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
  },
  mounted() {
    // Configurar chatbot para modo admin (sin auto-ocultar)
    setTimeout(() => {
      if (this.$refs.chatbot && this.$refs.chatbot.setAdminMode) {
        this.$refs.chatbot.setAdminMode(true);
      }
    }, 100);
  },
  beforeUnmount() {
    // Restaurar comportamiento normal al salir
    if (this.$refs.chatbot && this.$refs.chatbot.setAdminMode) {
      this.$refs.chatbot.setAdminMode(false);
    }
  }
}
</script>

<style scoped>
/* Estilos para tarjetas de admin */
.admin-card {
  background-color: white;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  z-index: 1;
}

.admin-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(5, 150, 105, 0.08), rgba(16, 185, 129, 0.08));
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;
}

.admin-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(5, 150, 105, 0.15);
}

.admin-card:hover::before {
  opacity: 1;
}

.admin-card:hover .card-icon {
  transform: scale(1.15) rotate(5deg);
}

.card-icon {
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  display: inline-block;
  font-size: 3rem;
  line-height: 1;
  margin-bottom: 1rem;
}

/* Estilos para tarjetas de estadísticas */
.stat-card {
  background-color: white;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  border-radius: 1rem;
  padding: 1.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #059669, #10b981);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.stat-card:hover::before {
  opacity: 1;
}

.stat-card:hover .stat-icon {
  transform: scale(1.1);
}

.stat-icon {
  transition: transform 0.3s ease;
  display: inline-block;
  font-size: 2.25rem;
  line-height: 1;
}

/* Colores personalizados para administración */
.text-emerald-600 {
  color: #059669;
}

.text-neutral-dark {
  color: #171717;
}

.text-neutral-medium {
  color: #737373;
}

/* Evitar que los hover afecten al chatbot */
.admin-card,
.stat-card {
  isolation: isolate;
}

/* Ajustes responsivos */
@media (max-width: 640px) {
  .grid-cols-2 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}
</style>