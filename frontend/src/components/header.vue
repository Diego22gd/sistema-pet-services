<template>
  <header class="fixed top-0 left-0 right-0 w-full z-50 bg-primary-mint text-white shadow-md mb-16">
    <div class="container mx-auto px-6">
      <div class="flex justify-between items-center py-3">
        <!-- Logo con diseño mejorado -->
        <div class="flex items-center space-x-3">
          <div class="relative group">
            <div class="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shadow-lg border border-white/20 transform group-hover:scale-110 transition-all duration-300">
              <span class="text-2xl">🐾</span>
            </div>
            <div class="absolute -inset-1 bg-white/20 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          <div class="text-2xl font-bold text-white">
            PetServices
          </div>
        </div>

        <!-- Navegación mejorada -->
        <nav class="flex items-center space-x-1">
          <!-- Items de navegación -->
          <div class="flex items-center space-x-1 bg-white/10 rounded-2xl p-1 border border-white/20">
            <router-link 
              v-for="item in navigationItems"
              :key="item.to"
              :to="item.to" 
              class="relative px-4 py-2 rounded-xl font-medium transition-all duration-300 group nav-item text-white hover:text-neutral-light mx-2"
              :class="{'bg-white/20': $route.path.includes(item.to)}"
            >
              <!-- Efecto de fondo al hover -->
              <div class="absolute inset-0 rounded-xl bg-gradient-to-r from-white/10 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <!-- Texto e ícono -->
              <span class="relative z-10 flex items-center space-x-2 text-sm">
                <component :is="item.icon" class="w-4 h-4" />
                <span>{{ item.label }}</span>
              </span>

              <!-- Indicador activo -->
              <div v-if="$route.path.includes(item.to)" class="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
            </router-link>
          </div>

          <!-- Separador visual -->
          <div class="w-px h-8 bg-white/20 mx-2"></div>

          <!-- Botón Cerrar Sesión mejorado y más pequeño -->
          <button
  @click="logout"
  class="btn-danger relative group px-3 py-1 rounded-lg font-semibold transition-all duration-300 transform hover:-translate-y-0.5 flex items-center space-x-2 text-xs ml-4"
>
  <!-- Efecto de brillo -->
  <div class="absolute inset-0 rounded-lg bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
  
  <!-- Ícono y texto -->
  <svg class="w-3 h-3 transform group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
  </svg>
  <span class="relative z-10">Cerrar Sesión</span>

  <!-- Efecto de partículas al hover -->
  <div class="absolute -inset-1 rounded-lg bg-state-error/20 opacity-0 group-hover:opacity-50 blur-sm transition-opacity duration-300"></div>
</button>
        </nav>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: "Header",
  data() {
    return {
      navigationItems: [
        {
          to: '/services',
          label: 'Servicios',
          icon: 'ServicesIcon'
        },
        {
          to: '/appointments',
          label: 'Citas',
          icon: 'AppointmentsIcon'
        },
        {
          to: '/MyPets',
          label: 'Mascotas',
          icon: 'PetsIcon'
        },
        {
          to: '/profile',
          label: 'Perfil',
          icon: 'ProfileIcon'
        }
      ]
    }
  },
  components: {
    ServicesIcon: {
      template: `
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
        </svg>
      `
    },
    AppointmentsIcon: {
      template: `
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
      `
    },
    PetsIcon: {
      template: `
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
        </svg>
      `
    },
    ProfileIcon: {
      template: `
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
        </svg>
      `
    }
  },
  methods: {
    logout() {
      console.log("Usuario ha cerrado sesión");
      
      // Animación de salida antes de redirigir
      this.$el.style.transform = 'translateY(-100%)';
      this.$el.style.transition = 'transform 0.3s ease-in-out';
      
      setTimeout(() => {
        this.$router.push("/login");
      }, 300);
    }
  },
  mounted() {
    // Efecto de entrada suave
    this.$el.style.transform = 'translateY(0)';
    this.$el.style.transition = 'transform 0.5s ease-out';
  }
}
</script>

<style scoped>
/* Animaciones personalizadas */
.nav-item {
  position: relative;
  overflow: hidden;
}

.nav-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
  transition: left 0.5s ease-in-out;
}

.nav-item:hover::before {
  left: 100%;
}

/* Efecto de brillo para el botón activo */
.router-link-active {
  position: relative;
}

.router-link-active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 2px;
  background: white;
  border-radius: 2px;
}

/* Scroll suave para el header */
header {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Responsive improvements */
@media (max-width: 1024px) {
  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  nav {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>