<template>
  <header class="fixed top-0 left-0 right-0 w-full z-50 bg-emerald-600 shadow-lg">
    <div class="container mx-auto px-4 md:px-6">
      <div class="flex justify-between items-center py-4">
        <!-- Logo moderno -->
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 md:w-12 md:h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
            <span class="text-xl md:text-2xl text-emerald-600">🐾</span>
          </div>
          <div class="text-lg md:text-2xl font-bold text-white">
            PetServices
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
          <!-- DASHBOARD - AGREGADO PRIMERO -->
          <router-link 
            to="/dashboard"
            class="text-white hover:text-emerald-100 transition-all duration-300 font-medium px-4 py-2 rounded-lg hover:bg-emerald-700 cursor-pointer flex items-center space-x-2 group relative"
            :class="{
              'bg-emerald-700': $route.path === '/dashboard' || $route.path.startsWith('/dashboard'),
              'border-b-2 border-emerald-300': $route.path === '/dashboard' || $route.path.startsWith('/dashboard')
            }"
          >
            <span class="text-xl">🏠</span>
            <span>Dashboard</span>
            <span class="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse" 
                  v-if="!($route.path === '/dashboard' || $route.path.startsWith('/dashboard'))">
            </span>
          </router-link>

          <!-- COMERCIOS -->
          <router-link 
            to="/commerces"
            class="text-white hover:text-emerald-100 transition-all duration-300 font-medium px-4 py-2 rounded-lg hover:bg-emerald-700 cursor-pointer flex items-center space-x-2 group relative"
            :class="{
              'bg-emerald-700': $route.path === '/commerces' || $route.path.startsWith('/commerces'),
              'border-b-2 border-emerald-300': $route.path === '/commerces' || $route.path.startsWith('/commerces')
            }"
          >
            <span class="text-xl">🏬</span>
            <span>Comercios</span>
            <span class="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full animate-pulse" 
                  v-if="!($route.path === '/commerces' || $route.path.startsWith('/commerces'))">
            </span>
          </router-link>

          <!-- Citas -->
          <router-link 
            to="/appointments"
            class="text-white hover:text-emerald-100 transition-all duration-300 font-medium px-4 py-2 rounded-lg hover:bg-emerald-700 cursor-pointer flex items-center space-x-2"
            :class="{
              'bg-emerald-700': $route.path === '/appointments' || $route.path.startsWith('/appointments'),
              'border-b-2 border-emerald-300': $route.path === '/appointments' || $route.path.startsWith('/appointments')
            }"
          >
            <span class="text-xl">📅</span>
            <span>Citas</span>
          </router-link>

          <!-- Mascotas -->
          <router-link 
            to="/MyPets"
            class="text-white hover:text-emerald-100 transition-all duration-300 font-medium px-4 py-2 rounded-lg hover:bg-emerald-700 cursor-pointer flex items-center space-x-2"
            :class="{
              'bg-emerald-700': $route.path === '/MyPets' || $route.path.startsWith('/MyPets'),
              'border-b-2 border-emerald-300': $route.path === '/MyPets' || $route.path.startsWith('/MyPets')
            }"
          >
            <span class="text-xl">🐾</span>
            <span>Mascotas</span>
          </router-link>

          <!-- Perfil -->
          <router-link 
            to="/profile"
            class="text-white hover:text-emerald-100 transition-all duration-300 font-medium px-4 py-2 rounded-lg hover:bg-emerald-700 cursor-pointer flex items-center space-x-2"
            :class="{
              'bg-emerald-700': $route.path === '/profile' || $route.path.startsWith('/profile'),
              'border-b-2 border-emerald-300': $route.path === '/profile' || $route.path.startsWith('/profile')
            }"
          >
            <span class="text-xl">👤</span>
            <span>Perfil</span>
          </router-link>

          <!-- Separador -->
          <div class="w-px h-6 bg-white/30 mx-1"></div>

          <!-- Botón Cerrar Sesión -->
          <button
            @click="logout"
            class="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-rose-600/25 hover:scale-105 group flex items-center space-x-2"
          >
            <span>🚪</span>
            <span>Cerrar Sesión</span>
          </button>
        </nav>
      </div>

      <!-- Menú móvil desplegable (ESTILO CORREGIDO) -->
      <div 
        v-if="isMobileMenuOpen"
        class="md:hidden bg-emerald-700/95 backdrop-blur-sm rounded-lg mt-2 py-4 px-4 animate-slideDown shadow-xl border border-emerald-500/20"
      >
        <div class="space-y-2">
          <!-- DASHBOARD móvil - AGREGADO PRIMERO -->
          <router-link 
            to="/dashboard"
            @click="closeMobileMenu"
            class="block text-white hover:text-emerald-100 transition-all duration-300 font-medium px-4 py-3 rounded-lg hover:bg-emerald-600 cursor-pointer flex items-center space-x-3 group border-l-4 border-emerald-300 pl-3"
            :class="{
              'bg-emerald-600': $route.path === '/dashboard' || $route.path.startsWith('/dashboard')
            }"
          >
            <span class="text-xl">🏠</span>
            <span class="flex-1 font-semibold">Dashboard</span>
            <span class="text-emerald-300">🏠</span>
            <span class="w-3 h-3 bg-emerald-400 rounded-full animate-pulse" 
                  v-if="!($route.path === '/dashboard' || $route.path.startsWith('/dashboard'))">
            </span>
            <span class="text-emerald-200 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
          </router-link>

          <!-- COMERCIOS móvil -->
          <router-link 
            to="/commerces"
            @click="closeMobileMenu"
            class="block text-white hover:text-emerald-100 transition-all duration-300 font-medium px-4 py-3 rounded-lg hover:bg-emerald-600 cursor-pointer flex items-center space-x-3 group border-l-4 border-amber-400 pl-3"
            :class="{
              'bg-emerald-600': $route.path === '/commerces' || $route.path.startsWith('/commerces')
            }"
          >
            <span class="text-xl">🏬</span>
            <span class="flex-1 font-semibold">Comercios</span>
            <span class="text-amber-300">⭐</span>
            <span class="w-3 h-3 bg-amber-400 rounded-full animate-pulse" 
                  v-if="!($route.path === '/commerces' || $route.path.startsWith('/commerces'))">
            </span>
            <span class="text-emerald-200 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
          </router-link>

          <!-- Citas móvil -->
          <router-link 
            to="/appointments"
            @click="closeMobileMenu"
            class="block text-white hover:text-emerald-100 transition-all duration-300 font-medium px-4 py-3 rounded-lg hover:bg-emerald-600 cursor-pointer flex items-center space-x-3 group"
            :class="{
              'bg-emerald-600': $route.path === '/appointments' || $route.path.startsWith('/appointments')
            }"
          >
            <span class="text-xl">📅</span>
            <span class="flex-1">Citas</span>
            <span class="text-emerald-200 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
          </router-link>

          <!-- Mascotas móvil -->
          <router-link 
            to="/MyPets"
            @click="closeMobileMenu"
            class="block text-white hover:text-emerald-100 transition-all duration-300 font-medium px-4 py-3 rounded-lg hover:bg-emerald-600 cursor-pointer flex items-center space-x-3 group"
            :class="{
              'bg-emerald-600': $route.path === '/MyPets' || $route.path.startsWith('/MyPets')
            }"
          >
            <span class="text-xl">🐾</span>
            <span class="flex-1">Mascotas</span>
            <span class="text-emerald-200 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
          </router-link>

          <!-- Perfil móvil -->
          <router-link 
            to="/profile"
            @click="closeMobileMenu"
            class="block text-white hover:text-emerald-100 transition-all duration-300 font-medium px-4 py-3 rounded-lg hover:bg-emerald-600 cursor-pointer flex items-center space-x-3 group"
            :class="{
              'bg-emerald-600': $route.path === '/profile' || $route.path.startsWith('/profile')
            }"
          >
            <span class="text-xl">👤</span>
            <span class="flex-1">Perfil</span>
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

          <!-- Información del usuario -->
          <div class="pt-3 border-t border-emerald-500/20">
            <div class="text-emerald-200 text-sm text-center">
              <p v-if="userEmail">📧 {{ userEmail }}</p>
              <p class="text-xs text-emerald-300/70 mt-1">Panel de usuario</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: "Header",
  data() {
    return {
      isMobileMenuOpen: false,
      userEmail: null
    }
  },
  methods: {
    toggleMobileMenu() {
      this.isMobileMenuOpen = !this.isMobileMenuOpen;
      
      if (this.isMobileMenuOpen) {
        document.body.style.overflow = 'hidden';
        document.body.classList.add('menu-open');
      } else {
        document.body.style.overflow = '';
        document.body.classList.remove('menu-open');
      }
    },
    
    closeMobileMenu() {
      this.isMobileMenuOpen = false;
      document.body.style.overflow = '';
      document.body.classList.remove('menu-open');
    },
    
    logout() {
      console.log("Usuario ha cerrado sesión");
      
      // Cerrar menú móvil si está abierto
      this.closeMobileMenu();
      
      // Limpiar almacenamiento local
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Animación de salida
      this.$el.style.transform = 'translateY(-100%)';
      this.$el.style.transition = 'transform 0.3s ease-in-out';
      
      setTimeout(() => {
        this.$router.push("/login");
      }, 300);
    },
    
    handleClickOutside(event) {
      const header = this.$el;
      const mobileMenu = header.querySelector('.md\\:hidden.bg-emerald-700\\/95');
      const hamburgerButton = header.querySelector('button.md\\:hidden');
      
      if (mobileMenu && hamburgerButton) {
        const isClickInsideMenu = mobileMenu.contains(event.target);
        const isClickOnHamburger = hamburgerButton.contains(event.target);
        
        if (!isClickInsideMenu && !isClickOnHamburger && this.isMobileMenuOpen) {
          this.closeMobileMenu();
        }
      }
    }
  },
  mounted() {
    // Efecto de entrada suave
    this.$el.style.transform = 'translateY(0)';
    this.$el.style.transition = 'transform 0.5s ease-out';
    
    // Verificar autenticación y obtener email
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    
    if (user && token) {
      this.userEmail = user.email;
      console.log('✅ Usuario autenticado:', user.email);
    } else {
      console.warn('⚠️ Usuario no autenticado');
    }
    
    // Cerrar menú al hacer clic fuera
    document.addEventListener('click', this.handleClickOutside);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
    document.body.style.overflow = '';
    document.body.classList.remove('menu-open');
  },
  watch: {
    '$route.path'() {
      // Cerrar menú al cambiar de ruta
      this.closeMobileMenu();
    }
  }
}
</script>

<style scoped>
/* APLICAR LOS MISMOS ESTILOS DEL ADMIN */

/* HEADER FIJADO */
header {
  background-color: #059669 !important; /* emerald-600 */
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
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

/* Punto animado para Comercios */
.bg-amber-400 {
  background-color: #fbbf24;
  animation: pulseDot 2s ease-in-out infinite;
}

/* Punto animado para Dashboard */
.bg-emerald-400 {
  background-color: #34d399;
  animation: pulseDot 2s ease-in-out infinite;
}

@keyframes pulseDot {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.2);
  }
}

/* Efecto hover para enlaces de navegación */
nav a {
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

nav a::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 3px;
  background-color: white;
  transition: all 0.3s ease;
  transform: translateX(-50%);
  border-radius: 2px;
}

nav a:hover::after {
  width: 80%;
}

nav a.bg-emerald-700::after {
  width: 80%;
  background-color: #d1fae5;
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

/* Efecto especial para el enlace de Dashboard */
.border-l-4.border-emerald-300 {
  border-left-color: #6ee7b7 !important;
  border-left-width: 4px;
  background: linear-gradient(to right, rgba(110, 231, 183, 0.1), transparent);
}

/* Efecto especial para el enlace de Comercios */
.border-l-4.border-amber-400 {
  border-left-color: #fbbf24 !important;
  border-left-width: 4px;
  background: linear-gradient(to right, rgba(251, 191, 36, 0.1), transparent);
}

/* Efecto para enlaces activos */
nav a.router-link-active {
  background-color: rgba(255, 255, 255, 0.15);
  font-weight: 600;
}

/* Responsive */
@media (max-width: 1024px) {
  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  nav {
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.5rem;
  }
  
  nav a, nav button {
    margin: 0.125rem;
    padding: 0.5rem 1rem !important;
    font-size: 0.875rem;
  }
}

@media (max-width: 768px) {
  .flex.justify-between {
    flex-direction: row;
    gap: 0;
  }
  
  nav {
    width: 100%;
    justify-content: space-between;
    flex-wrap: wrap;
    overflow-x: auto;
    padding-bottom: 0.5rem;
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
  min-height: calc(100vh - 200px);
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

/* Mejoras para enlaces con íconos */
nav a {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
}

nav a span:first-child {
  font-size: 1.125rem;
}

/* Separadores más visibles */
.w-px {
  background-color: rgba(255, 255, 255, 0.4);
}

/* Mejoras de accesibilidad */
nav a:focus-visible,
button:focus-visible {
  outline: 2px solid white;
  outline-offset: 2px;
  border-radius: 8px;
}

/* Transición para cambios de página */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Efecto de brillo para el enlace de Dashboard */
nav a[href="/dashboard"] {
  position: relative;
  animation: subtleGlowHome 3s ease-in-out infinite;
}

@keyframes subtleGlowHome {
  0%, 100% {
    box-shadow: 0 0 0 rgba(255, 255, 255, 0);
  }
  50% {
    box-shadow: 0 0 10px rgba(110, 231, 183, 0.3);
  }
}

/* Efecto de brillo para el enlace de Comercios */
nav a[href="/commerces"] {
  position: relative;
  animation: subtleGlowCommerces 3s ease-in-out infinite;
}

@keyframes subtleGlowCommerces {
  0%, 100% {
    box-shadow: 0 0 0 rgba(255, 255, 255, 0);
  }
  50% {
    box-shadow: 0 0 10px rgba(251, 191, 36, 0.3);
  }
}

/* Ajuste para el punto animado en móvil */
@media (max-width: 768px) {
  nav a[href="/dashboard"]::before,
  nav a[href="/commerces"]::before {
    display: none;
  }
  
  .bg-amber-400,
  .bg-emerald-400 {
    width: 6px;
    height: 6px;
  }
}

/* Efecto de partículas para hover en Dashboard */
nav a[href="/dashboard"]:hover::after {
  background: linear-gradient(90deg, 
    rgba(255,255,255,0.8) 0%, 
    rgba(110,231,183,0.8) 50%, 
    rgba(255,255,255,0.8) 100%);
  height: 4px;
}

/* Efecto de partículas para hover en Comercios */
nav a[href="/commerces"]:hover::after {
  background: linear-gradient(90deg, 
    rgba(255,255,255,0.8) 0%, 
    rgba(255,215,0,0.8) 50%, 
    rgba(255,255,255,0.8) 100%);
  height: 4px;
}

/* Ajuste de espaciado para íconos */
nav a span:first-child {
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
}

/* Efecto de profundidad para botones */
nav a, nav button {
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

/* Prevenir scroll cuando el menú está abierto */
body.menu-open {
  overflow: hidden !important;
  position: fixed;
  width: 100%;
  height: 100%;
}

/* Mejoras visuales para elementos del menú móvil */
.md\\:hidden a {
  border-left: 3px solid transparent;
  transition: all 0.3s ease;
}

.md\\:hidden a:hover,
.md\\:hidden a.bg-emerald-600 {
  border-left-color: #6ee7b7;
  padding-left: calc(1rem - 3px);
  background: linear-gradient(to right, rgba(110, 231, 183, 0.1), rgba(5, 150, 105, 0.6));
}

/* Efecto de overlay para el menú móvil */
@media (max-width: 768px) {
  .md\\:hidden.bg-emerald-700\/95 {
    position: relative;
    z-index: 50;
  }
  
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

/* Mejoras para enlaces con flechas */
.group:hover .group-hover\\:opacity-100 {
  opacity: 1;
}

/* Efecto de profundidad */
nav a, nav button {
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

/* Estilo especial para Dashboard en menú móvil */
.md\\:hidden a[href="/dashboard"] {
  background: linear-gradient(to right, rgba(110, 231, 183, 0.05), rgba(5, 150, 105, 0.3));
}
</style>