<template>
  <div class="bg-white min-h-screen flex flex-col">
    <!-- Header con menú hamburguesa para móvil -->
    <header class="fixed top-0 left-0 right-0 w-full z-50 bg-emerald-600 shadow-lg">
      <div class="container mx-auto px-4 md:px-6">
        <div class="flex justify-between items-center py-4">
          <!-- Logo a la izquierda -->
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 md:w-12 md:h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
              <span class="text-xl md:text-2xl text-emerald-600">🐾</span>
            </div>
            <div class="text-lg md:text-2xl font-bold text-white">
              PetServices Admin
            </div>
          </div>

          <!-- Botón hamburguesa para móvil -->
          <button 
            @click="toggleMobileMenu"
            class="md:hidden text-white hover:text-emerald-100 transition-colors p-2 rounded-lg hover:bg-emerald-700"
            aria-label="Menú de navegación"
          >
            <span class="text-2xl">{{ isMobileMenuOpen ? '✕' : '☰' }}</span>
          </button>

          <!-- Navegación para desktop -->
          <nav class="hidden md:flex items-center space-x-2">
            <!-- Items de navegación -->
            <router-link 
              v-for="item in navigationItems"
              :key="item.to"
              :to="item.to" 
              class="text-white hover:text-emerald-100 transition-all duration-300 font-medium px-3 py-2 rounded-lg hover:bg-emerald-700 cursor-pointer flex items-center space-x-2"
              :class="{
                'bg-emerald-700': isActiveRoute(item.to),
                'border-b-2 border-emerald-300': isActiveRoute(item.to)
              }"
            >
              <span>{{ item.icon }}</span>
              <span class="hidden lg:inline">{{ item.label }}</span>
            </router-link>

            <!-- Separador -->
            <div class="w-px h-6 bg-white/30 mx-1"></div>

            <!-- Botón Cerrar Sesión -->
            <button
              @click="logout"
              class="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-rose-600/25 hover:scale-105 group flex items-center space-x-2"
            >
              <span>🚪</span>
              <span class="hidden lg:inline">Cerrar Sesión</span>
            </button>
          </nav>
        </div>

        <!-- Menú móvil desplegable -->
        <div 
          v-if="isMobileMenuOpen"
          class="md:hidden bg-emerald-700 rounded-lg mt-2 py-4 px-4 animate-slideDown"
        >
          <div class="space-y-2">
            <!-- Items de navegación móvil -->
            <router-link 
              v-for="item in navigationItems"
              :key="item.to"
              :to="item.to" 
              @click="closeMobileMenu"
              class="block text-white hover:text-emerald-100 transition-all duration-300 font-medium px-4 py-3 rounded-lg hover:bg-emerald-600 cursor-pointer flex items-center space-x-3"
              :class="{
                'bg-emerald-600': isActiveRoute(item.to)
              }"
            >
              <span class="text-xl">{{ item.icon }}</span>
              <span>{{ item.label }}</span>
            </router-link>

            <!-- Botón Cerrar Sesión móvil -->
            <button
              @click="logout"
              class="w-full bg-rose-600 hover:bg-rose-700 text-white px-4 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 mt-4"
            >
              <span>🚪</span>
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Contenido de la vista -->
    <main class="flex-1 pt-20 md:pt-24 pb-12">
      <slot />
    </main>

    <!-- Footer Minimalista -->
    <footer class="bg-neutral-light text-neutral-medium py-6 text-center mt-auto shadow-inner">
      <div class="container mx-auto px-6">
        <p class="text-base md:text-lg">© 2025 PetServices Admin - Todos los derechos reservados</p>
        <p class="text-sm mt-2 text-neutral-medium/80">
          Panel de administración exclusivo para gestores autorizados
        </p>
        
        <!-- Enlaces rápidos -->
        <div class="flex justify-center space-x-6 mt-4">
          <router-link 
            to="/admin/commerces" 
            class="text-emerald-600 hover:text-emerald-700 transition-colors text-sm flex items-center space-x-1"
          >
            <span>🏬</span>
            <span>Comercios</span>
          </router-link>
          <router-link 
            to="/admin/settings" 
            class="text-emerald-600 hover:text-emerald-700 transition-colors text-sm flex items-center space-x-1"
          >
            <span>⚙️</span>
            <span>Configuración</span>
          </router-link>
          <a 
            href="#" 
            class="text-emerald-600 hover:text-emerald-700 transition-colors text-sm flex items-center space-x-1"
          >
            <span>📞</span>
            <span>Soporte</span>
          </a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: "AdminLayout",
  data() {
    return {
      isMobileMenuOpen: false,
      navigationItems: [
        {
          to: '/admin',
          label: 'Dashboard',
          icon: '📊'
        },
        {
          to: '/admin/users',
          label: 'Usuarios',
          icon: '👥'
        },
        {
          to: '/admin/providers',
          label: 'Proveedores',
          icon: '👨‍💼'
        },
        {
          to: '/admin/clients',
          label: 'Clientes',
          icon: '👤'
        },
        {
          to: '/admin/commerces',
          label: 'Comercios',
          icon: '🏬'
        },
        {
          to: '/admin/appointments',
          label: 'Citas',
          icon: '📅'
        },
        {
          to: '/admin/settings',
          label: 'Configuración',
          icon: '⚙️'
        }
      ]
    }
  },
  methods: {
    toggleMobileMenu() {
      this.isMobileMenuOpen = !this.isMobileMenuOpen;
    },
    
    closeMobileMenu() {
      this.isMobileMenuOpen = false;
    },
    
    logout() {
      // Cerrar menú móvil si está abierto
      this.closeMobileMenu();
      
      // Limpiar almacenamiento local
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      
      // Redirigir al login
      this.$router.push('/login');
      console.log('👋 Sesión cerrada exitosamente');
    },
    
    isActiveRoute(route) {
      return this.$route.path === route || 
             this.$route.path.startsWith(route + '/') ||
             (route === '/admin' && this.$route.path === '/admin');
    }
  },
  mounted() {
    // Verificar autenticación
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    
    if (!user || !token) {
      console.warn('⚠️ Usuario no autenticado, redirigiendo...');
      this.$router.push('/login');
      return;
    }
    
    // Verificar que sea admin
    if (user.role !== 'admin') {
      console.warn('⚠️ Usuario no es administrador, redirigiendo...');
      this.$router.push('/');
      return;
    }
    
    console.log('✅ Admin autenticado:', user.email);
  },
  // Cerrar menú móvil al cambiar de ruta
  watch: {
    '$route.path'() {
      this.closeMobileMenu();
    }
  }
};
</script>

<style scoped>
/* Header fijo */
header {
  background-color: #059669 !important;
}

/* Animaciones para menú móvil */
.animate-slideDown {
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Footer estilos */
.bg-neutral-light {
  background-color: #f5f5f5;
}

.text-neutral-medium {
  color: #737373;
}

.shadow-inner {
  box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.05);
}

/* Efectos hover para enlaces del footer */
footer a {
  transition: all 0.2s ease;
}

footer a:hover {
  transform: translateY(-1px);
}

/* Responsive */
@media (max-width: 768px) {
  /* Ajustar padding del main para header móvil */
  main {
    padding-top: 5rem;
  }
  
  /* Mejorar visibilidad del menú móvil */
  .md\\:hidden.bg-emerald-700 {
    background-color: rgba(5, 150, 105, 0.95);
    backdrop-filter: blur(10px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  }
  
  /* Ajustar tamaño del logo en móvil */
  .text-lg {
    font-size: 1.125rem;
  }
  
  /* Asegurar que el botón hamburguesa sea fácil de tocar */
  button.md\\:hidden {
    min-width: 44px;
    min-height: 44px;
  }
}

/* Mejoras de accesibilidad */
nav a:focus-visible,
button:focus-visible {
  outline: 2px solid white;
  outline-offset: 2px;
  border-radius: 8px;
}

/* Transiciones suaves */
nav a,
button {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Efecto para enlaces activos */
nav a.router-link-active {
  background-color: rgba(255, 255, 255, 0.15);
  font-weight: 600;
}

/* Scroll suave para el main */
main {
  min-height: calc(100vh - 180px);
}

/* Destacar item de comercios */
nav a[href="/admin/commerces"] {
  position: relative;
}

nav a[href="/admin/commerces"]::after {
  content: '';
  position: absolute;
  top: 4px;
  right: 4px;
  width: 6px;
  height: 6px;
  background-color: #fbbf24;
  border-radius: 50%;
  animation: pulseDot 2s infinite;
}

@keyframes pulseDot {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.2);
  }
}

/* Tablet responsive */
@media (min-width: 769px) and (max-width: 1024px) {
  /* Ocultar etiquetas de texto en tablet */
  .hidden.lg\\:inline {
    display: none;
  }
  
  nav a {
    padding: 0.5rem;
  }
  
  nav a span:first-child {
    font-size: 1.25rem;
  }
}

/* Animación de entrada del header */
header {
  animation: headerSlideIn 0.5s ease-out;
}

@keyframes headerSlideIn {
  from {
    transform: translateY(-100%);
  }
  to {
    transform: translateY(0);
  }
}
</style>