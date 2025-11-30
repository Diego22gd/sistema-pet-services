<template>
  <div class="bg-neutral-bg min-h-screen flex flex-col">
    <!-- Header Mejorado -->
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
              PetServices Admin
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

            <!-- Botón Cerrar Sesión mejorado -->
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
  data() {
    return {
      navigationItems: [
        {
          to: '/admin',
          label: 'Dashboard',
          icon: 'DashboardIcon'
        },
        {
          to: '/admin/clients',
          label: 'Clients',
          icon: 'ClientsIcon'
        },
        {
          to: '/admin/providers',
          label: 'Providers',
          icon: 'ProvidersIcon'
        },
        {
          to: '/admin/appointments',
          label: 'Appointments',
          icon: 'AppointmentsIcon'
        },
        {
          to: '/admin/reports',
          label: 'Reports',
          icon: 'ReportsIcon'
        },
        {
          to: '/admin/services',
          label: 'Services',
          icon: 'ServicesIcon'
        },
        {
          to: '/admin/settings',
          label: 'Settings',
          icon: 'SettingsIcon'
        },
        {
          to: '/admin/users',
          label: 'Users',
          icon: 'UsersIcon'
        }
      ]
    }
  },
  components: {
    DashboardIcon: {
      template: `
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
        </svg>
      `
    },
    ClientsIcon: {
      template: `
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
        </svg>
      `
    },
    ProvidersIcon: {
      template: `
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
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
    ReportsIcon: {
      template: `
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
      `
    },
    ServicesIcon: {
      template: `
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
        </svg>
      `
    },
    SettingsIcon: {
      template: `
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </svg>
      `
    },
    UsersIcon: {
      template: `
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
        </svg>
      `
    }
  },
  methods: {
    logout() {
      localStorage.removeItem('user');
      this.$router.push('/login');
    }
  },
  mounted() {
    // Efecto de entrada suave
    this.$el.querySelector('header').style.transform = 'translateY(0)';
    this.$el.querySelector('header').style.transition = 'transform 0.5s ease-out';
  }
};
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

main {
  min-height: calc(100vh - 120px); /* Ajusta para footer y header */
}
</style>