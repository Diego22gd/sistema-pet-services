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
              PetServices
            </div>
          </div>

          <!-- Botón hamburguesa para móvil (derecha) -->
          <button 
            @click="toggleMobileMenu"
            class="md:hidden text-white hover:text-emerald-100 transition-colors p-2 rounded-lg hover:bg-emerald-700"
            aria-label="Menú de navegación"
          >
            <span class="text-2xl">{{ isMobileMenuOpen ? '✕' : '☰' }}</span>
          </button>

          <!-- Navegación para desktop -->
          <nav class="hidden md:flex items-center space-x-2">
            <!-- Items de navegación del provider -->
            <router-link 
              v-for="item in navigationItems"
              :key="item.to"
              :to="item.to" 
              class="text-white hover:text-emerald-100 transition-all duration-300 font-medium px-3 py-2 rounded-lg hover:bg-emerald-700 cursor-pointer flex items-center space-x-2"
              :class="{'bg-emerald-700': $route.path.includes(item.to)}"
            >
              <span>{{ item.icon }}</span>
              <span class="hidden lg:inline">{{ item.label }}</span>
            </router-link>

            <!-- Separador -->
            <div class="w-px h-6 bg-white/30 mx-1"></div>

            <!-- Comercios - Link a la vista de comercios del proveedor -->
            <router-link 
              to="/provider/commerces" 
              class="text-white hover:text-emerald-100 transition-all duration-300 font-medium px-3 py-2 rounded-lg hover:bg-emerald-700 cursor-pointer flex items-center space-x-2"
              :class="{'bg-emerald-700': $route.path.includes('/provider/commerces')}"
            >
              <span>🏬</span>
              <span class="hidden lg:inline">Mis Comercios</span>
            </router-link>
            
            <!-- Separador -->
            <div class="w-px h-6 bg-white/30 mx-1"></div>

            <!-- Botón Cerrar Sesión -->
            <button
              @click="logout"
              class="bg-rose-600 hover:bg-rose-700 text-white px-3 py-2 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-rose-600/25 hover:scale-105 group flex items-center space-x-2"
            >
              <span class="hidden lg:inline">Cerrar Sesión</span>
              <span>🚪</span>
            </button>
          </nav>
        </div>

        <!-- Menú móvil desplegable -->
        <div 
          v-if="isMobileMenuOpen"
          class="md:hidden bg-emerald-700/95 backdrop-blur-sm rounded-lg mt-2 py-4 px-4 animate-slideDown shadow-xl border border-emerald-500/20"
        >
          <div class="space-y-2">
            <!-- Items de navegación del provider (móvil) -->
            <router-link 
              v-for="item in navigationItems"
              :key="item.to"
              :to="item.to" 
              @click="closeMobileMenu"
              class="block text-white hover:text-emerald-100 transition-all duration-300 font-medium px-4 py-3 rounded-lg hover:bg-emerald-600 cursor-pointer flex items-center space-x-3 group"
              :class="{'bg-emerald-600': $route.path.includes(item.to)}"
            >
              <span class="text-xl">{{ item.icon }}</span>
              <span class="flex-1">{{ item.label }}</span>
              <span class="text-emerald-200 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </router-link>

            <!-- Separador móvil -->
            <div class="border-t border-emerald-500/30 my-3"></div>

            <!-- Comercios móvil -->
            <router-link 
              to="/provider/commerces" 
              @click="closeMobileMenu"
              class="block text-white hover:text-emerald-100 transition-all duration-300 font-medium px-4 py-3 rounded-lg hover:bg-emerald-600 cursor-pointer flex items-center space-x-3 group border-l-4 border-amber-400 pl-3"
              :class="{'bg-emerald-600': $route.path.includes('/provider/commerces')}"
            >
              <span class="text-xl">🏬</span>
              <span class="flex-1 font-semibold">Mis Comercios</span>
              <span class="text-amber-300">⭐</span>
              <span class="text-emerald-200 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </router-link>

            <!-- Separador móvil -->
            <div class="border-t border-emerald-500/30 my-3"></div>

            <!-- Botón Cerrar Sesión móvil -->
            <button
              @click="logout"
              class="w-full bg-rose-600 hover:bg-rose-700 text-white px-4 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 group"
            >
              <span>Cerrar Sesión</span>
              <span>🚪</span>
              <span class="opacity-0 group-hover:opacity-100 transition-opacity">👋</span>
            </button>

            <!-- Información del proveedor -->
            <div class="pt-3 border-t border-emerald-500/20">
              <div class="text-emerald-200 text-sm text-center">
                <p v-if="userEmail">👨‍💼 {{ userEmail }}</p>
                <p class="text-xs text-emerald-300/70 mt-1">Panel de proveedor</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Contenido de la vista -->
    <main class="flex-1 pt-20 md:pt-24 pb-12">
      <slot />
    </main>

    <!-- Footer Minimalista (Igual al AdminLayout) -->
    <footer class="bg-neutral-light text-neutral-medium py-6 text-center mt-auto shadow-inner">
      <div class="container mx-auto px-6">
        <p class="text-base md:text-lg">© 2025 PetServices Provider - Todos los derechos reservados</p>
        <p class="text-sm mt-2 text-neutral-medium/80">
          Panel exclusivo para proveedores autorizados
        </p>
        
        <!-- Enlaces rápidos -->
        
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: "ProviderLayout",
  data() {
    return {
      isMobileMenuOpen: false,
      userEmail: null,
      navigationItems: [
        {
          to: '/provider/dashboard',
          label: 'Dashboard',
          icon: '📊'
        },
        {
          to: '/provider/appointments',
          label: 'Citas',
          icon: '📅'
        },
        {
          to: '/provider/profile',
          label: 'Perfil',
          icon: '👤'
        },
        {
          to: '/provider/notifications',
          label: 'Notificaciones',
          icon: '🔔'
        },
        {
          to: '/provider/reports',
          label: 'Reportes',
          icon: '📈'
        }
      ]
    }
  },
  methods: {
    toggleMobileMenu() {
      this.isMobileMenuOpen = !this.isMobileMenuOpen;
      // Prevenir scroll cuando el menú está abierto
      if (this.isMobileMenuOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    },
    
    closeMobileMenu() {
      this.isMobileMenuOpen = false;
      document.body.style.overflow = '';
    },
    
    logout() {
      // Cerrar menú móvil si está abierto
      this.closeMobileMenu();
      
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      this.$router.push('/login');
    }
  },
  mounted() {
    // Efecto de entrada suave
    this.$el.querySelector('header').style.transform = 'translateY(0)';
    this.$el.querySelector('header').style.transition = 'transform 0.5s ease-out';
    
    // Obtener email del usuario para mostrar
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.email) {
      this.userEmail = user.email;
    }
    
    // Verificar autenticación
    const token = localStorage.getItem('token');
    
    if (!user || !token) {
      console.warn('⚠️ Usuario no autenticado, redirigiendo...');
      this.$router.push('/login');
      return;
    }
    
    // Verificar que sea provider
    if (user.role !== 'provider') {
      console.warn('⚠️ Usuario no es proveedor, redirigiendo...');
      this.$router.push('/');
      return;
    }
    
    console.log('✅ Proveedor autenticado:', user.email);
  },
  beforeUnmount() {
    // Asegurarse de restaurar el scroll
    document.body.style.overflow = '';
  },
  watch: {
    '$route.path'() {
      // Cerrar menú al cambiar de ruta
      this.closeMobileMenu();
    }
  }
};
</script>

<style scoped>
/* Aplicar los mismos estilos del landing */

/* HEADER FIJADO */
header {
  background-color: #059669 !important; /* emerald-600 */
}

/* Asegurar que los textos sean visibles */
nav a, nav button {
  color: white !important;
}

nav a:hover, nav button:hover {
  color: #d1fae5 !important; /* emerald-100 */
}

/* Botón de cerrar sesión con efecto hover */
.bg-rose-600 {
  background-color: #dc2626; /* rose-600 */
}

.bg-rose-600:hover {
  background-color: #b91c1c; /* rose-700 */
}

.hover\:shadow-rose-600\/25:hover {
  box-shadow: 0 10px 15px -3px rgba(220, 38, 38, 0.25);
}

/* Footer (Igual al AdminLayout) */
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

/* Animación de entrada para header */
header {
  transform: translateY(-100%);
  animation: slideDown 0.5s ease-out forwards;
}

@keyframes slideDown {
  from {
    transform: translateY(-100%);
  }
  to {
    transform: translateY(0);
  }
}

/* Animaciones para menú móvil */
.animate-slideDown {
  animation: slideDownMenu 0.3s ease-out;
}

@keyframes slideDownMenu {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Efecto hover para enlaces de navegación */
nav a {
  position: relative;
  overflow: hidden;
}

nav a::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background-color: white;
  transition: all 0.3s ease;
  transform: translateX(-50%);
}

nav a:hover::after {
  width: 80%;
}

nav a.bg-emerald-700::after {
  width: 80%;
  background-color: #d1fae5;
}

/* Responsive */
@media (max-width: 768px) {
  /* Ajustar padding del main para header móvil */
  main {
    padding-top: 5rem;
  }
  
  .flex.justify-between {
    flex-direction: row; /* Mantener logo y hamburguesa en fila */
  }
  
  nav {
    width: 100%;
    justify-content: space-between;
    flex-wrap: wrap;
  }
  
  .w-px {
    display: none;
  }
  
  /* Mejorar visibilidad del menú móvil */
  .md\\:hidden.bg-emerald-700\/95 {
    background-color: rgba(5, 150, 105, 0.98);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }
  
  /* Botón hamburguesa táctil */
  button.md\\:hidden {
    min-width: 44px;
    min-height: 44px;
  }
}

/* Scroll suave para el main */
main {
  min-height: calc(100vh - 180px); /* Ajusta para footer y header */
}

/* Transiciones suaves */
nav a, nav button {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Efecto de elevación para botones */
nav button {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

nav button:hover {
  box-shadow: 0 10px 25px rgba(220, 38, 38, 0.25);
  transform: translateY(-2px);
}

/* Efecto para enlaces activos */
.router-link-active {
  position: relative;
}

.router-link-active::before {
  content: '';
  position: absolute;
  top: 50%;
  left: -8px;
  transform: translateY(-50%);
  width: 4px;
  height: 60%;
  background-color: white;
  border-radius: 2px;
}

/* Mejoras para enlaces con íconos */
nav a {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

nav a span:first-child {
  font-size: 1.125rem;
}

/* Separadores más visibles */
.w-px {
  background-color: rgba(255, 255, 255, 0.4);
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

/* Estilo especial para Mis Comercios en móvil */
.border-l-4.border-amber-400 {
  border-left-color: #fbbf24 !important;
  border-left-width: 4px;
  background: linear-gradient(to right, rgba(251, 191, 36, 0.1), transparent);
}

/* Prevenir scroll cuando el menú está abierto */
@media (max-width: 768px) {
  body.menu-open {
    overflow: hidden;
    position: fixed;
    width: 100%;
    height: 100%;
  }
}

/* Mejoras de accesibilidad */
nav a:focus-visible,
button:focus-visible {
  outline: 2px solid white;
  outline-offset: 2px;
  border-radius: 8px;
}

/* Efecto de overlay para el menú móvil */
@media (max-width: 768px) {
  .md\\:hidden.bg-emerald-700\/95::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(2px);
    z-index: -1;
  }
}

/* Mejoras visuales para elementos del menú móvil */
.md\\:hidden a {
  border-left: 3px solid transparent;
  transition: all 0.3s ease;
}

.md\\:hidden a:hover,
.md\\:hidden a.bg-emerald-600 {
  border-left-color: #fbbf24;
  padding-left: calc(1rem - 3px);
  background: linear-gradient(to right, rgba(251, 191, 36, 0.1), rgba(5, 150, 105, 0.6));
}

/* Efecto de entrada del header */
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

/* Mejoras para enlaces con flechas */
.group:hover .group-hover\\:opacity-100 {
  opacity: 1;
}

/* Efecto de profundidad */
nav a, nav button {
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

/* Responsive para el footer */
@media (max-width: 768px) {
  footer {
    padding-top: 1.5rem;
    padding-bottom: 1.5rem;
  }
  
  .flex.justify-center.space-x-6 {
    flex-wrap: wrap;
    gap: 1rem;
  }
}
</style>