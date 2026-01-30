<template>
  <div>
    <!-- Header de navegación -->
    <header class="fixed top-0 left-0 right-0 w-full z-50 bg-emerald-600 shadow-lg">
      <div class="container mx-auto px-4 md:px-6">
        <div class="flex justify-between items-center py-4">
          <!-- Logo -->
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
            <!-- DASHBOARD -->
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

        <!-- Menú móvil desplegable -->
        <div 
          v-if="isMobileMenuOpen"
          class="md:hidden bg-emerald-700/95 backdrop-blur-sm rounded-lg mt-2 py-4 px-4 animate-slideDown shadow-xl border border-emerald-500/20"
        >
          <div class="space-y-2">
            <!-- DASHBOARD móvil -->
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
                <p class="text-xs text-emerald-300/70 mt-1">Panel de Clientes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Contenido principal del Dashboard -->
    <main class="pt-24 pb-16 px-4 min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <!-- Encabezado con notificaciones -->
      <div class="flex justify-between items-center px-6 pt-8 pb-6 max-w-7xl mx-auto">
        <h1 class="text-3xl font-extrabold text-neutral-dark">Panel del Cliente</h1>
        
        <!-- Botón de notificaciones -->
        <button 
          class="relative p-3 rounded-full bg-emerald-100 hover:bg-emerald-600 hover:text-white transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
          @click="goToNotifications"
        >
          🔔
          <span v-if="unreadNotifications > 0" 
            class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-2 py-0.5 shadow animate-pulse">
            {{ unreadNotifications }}
          </span>
        </button>
      </div>

      <!-- Grid con 4 tarjetas -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-6 max-w-7xl mx-auto">
        <!-- Tarjeta 1: Comercios -->
        <div 
          class="bg-white shadow-lg rounded-2xl p-6 flex flex-col items-center justify-center text-center transform hover:-translate-y-2 hover:shadow-xl transition-all duration-300 cursor-pointer border border-emerald-100 hover:border-emerald-300"
          @click="navigate('/commerces')"
        >
          <div class="text-5xl mb-4 hover:scale-110 transition-transform duration-300">🏬</div>
          <h2 class="font-bold text-xl text-neutral-dark mb-2">Comercios</h2>
          <p class="text-neutral-medium text-sm">Encuentra servicios para tus mascotas</p>
          <span class="mt-3 inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full">
            Explorar
          </span>
        </div>

        <!-- Tarjeta 2: Mis Citas -->
        <div 
          class="bg-white shadow-lg rounded-2xl p-6 flex flex-col items-center justify-center text-center transform hover:-translate-y-2 hover:shadow-xl transition-all duration-300 cursor-pointer border border-emerald-100 hover:border-emerald-300"
          @click="navigate('/appointments')"
        >
          <div class="text-5xl mb-4 hover:scale-110 transition-transform duration-300">📅</div>
          <h2 class="font-bold text-xl text-neutral-dark mb-2">Mis Citas</h2>
          <p class="text-neutral-medium text-sm">Gestiona tus citas programadas</p>
          
        </div>

        <!-- Tarjeta 3: Mis Mascotas -->
        <div 
          class="bg-white shadow-lg rounded-2xl p-6 flex flex-col items-center justify-center text-center transform hover:-translate-y-2 hover:shadow-xl transition-all duration-300 cursor-pointer border border-emerald-100 hover:border-emerald-300"
          @click="navigate('/MyPets')"
        >
          <div class="text-5xl mb-4 hover:scale-110 transition-transform duration-300">🐾</div>
          <h2 class="font-bold text-xl text-neutral-dark mb-2">Mis Mascotas</h2>
          <p class="text-neutral-medium text-sm">Administra el perfil de tus mascotas</p>
          
        </div>

        <!-- Tarjeta 4: Mi Perfil -->
        <div 
          class="bg-white shadow-lg rounded-2xl p-6 flex flex-col items-center justify-center text-center transform hover:-translate-y-2 hover:shadow-xl transition-all duration-300 cursor-pointer border border-emerald-100 hover:border-emerald-300"
          @click="navigate('/profile')"
        >
          <div class="text-5xl mb-4 hover:scale-110 transition-transform duration-300">👤</div>
          <h2 class="font-bold text-xl text-neutral-dark mb-2">Mi Perfil</h2>
          <p class="text-neutral-medium text-sm">Actualiza tu información personal</p>
          <span class="mt-3 inline-block px-3 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full">
            Ver perfil
          </span>
        </div>
      </div>

      <!-- Chatbot -->
      <Chatbot />
    </main>
  </div>
</template>

<script>
import Chatbot from "@/components/Chatbot.vue";

export default {
  name: "UserDashboard",
  components: { Chatbot },
  data() {
    return {
      isMobileMenuOpen: false,
      userEmail: null,
      unreadNotifications: 2,
      upcomingAppointments: 1,
      petCount: 2,
      appointments: [
        {
          id: 1,
          service: 'Veterinario',
          date: '15 Dic 2024',
          time: '10:00 AM',
          location: 'Clínica VetPlus',
          status: 'Confirmada'
        },
        {
          id: 2,
          service: 'Peluquería',
          date: '20 Dic 2024',
          time: '2:30 PM',
          location: 'PetSpa Center',
          status: 'Programada'
        }
      ],
      pets: [
        {
          id: 1,
          name: 'Max',
          type: 'Perro',
          breed: 'Golden Retriever',
          age: 3,
          gender: 'Macho',
          vaccinated: true
        },
        {
          id: 2,
          name: 'Luna',
          type: 'Gato',
          breed: 'Siamés',
          age: 2,
          gender: 'Hembra',
          vaccinated: true
        }
      ],
      cards: [
        { 
          title: "Comercios", 
          description: "Encuentra servicios para tus mascotas", 
          route: "/commerces", 
          icon: "🏬",
          badge: "Explorar"
        },
        { 
          title: "Mis Citas", 
          description: "Gestiona tus citas programadas", 
          route: "/appointments", 
          icon: "📅",
          badge: "Próximas"
        },
        { 
          title: "Mis Mascotas", 
          description: "Administra el perfil de tus mascotas", 
          route: "/MyPets", 
          icon: "🐾",
          badge: "Registradas"
        },
        { 
          title: "Mi Perfil", 
          description: "Actualiza tu información personal", 
          route: "/profile", 
          icon: "👤",
          badge: "Ver perfil"
        }
      ]
    }
  },
  methods: {
    toggleMobileMenu() {
      this.isMobileMenuOpen = !this.isMobileMenuOpen;
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
    
    navigate(route) {
      this.$router.push(route);
      this.closeMobileMenu();
    },
    
    goToNotifications() {
      this.$router.push('/appointments');
    },
    
    logout() {
      console.log("Usuario ha cerrado sesión");
      this.closeMobileMenu();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.$router.push("/login");
    },
    
    handleClickOutside(event) {
      const header = this.$el.querySelector('header');
      const mobileMenu = header?.querySelector('.md\\:hidden.bg-emerald-700\\/95');
      const hamburgerButton = header?.querySelector('button.md\\:hidden');
      
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
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    
    if (user && token) {
      this.userEmail = user.email;
      console.log('✅ Usuario autenticado:', user.email);
    } else {
      console.warn('⚠️ Usuario no autenticado');
      this.$router.push("/login");
    }
    
    document.addEventListener('click', this.handleClickOutside);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
    document.body.style.overflow = '';
  },
  watch: {
    '$route.path'() {
      this.closeMobileMenu();
    }
  }
}
</script>

<style scoped>
/* Animación suave para tarjetas */
div:hover .text-5xl {
  transform: scale(1.1);
  transition: transform 0.3s ease;
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

/* Estilos para navegación */
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

/* Punto animado para notificaciones */
.bg-amber-400 {
  background-color: #fbbf24;
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

/* Estilos para tarjetas interactivas */
.hover\:-translate-y-2:hover {
  transform: translateY(-0.5rem);
}

.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}

/* Estilos responsivos */
@media (max-width: 768px) {
  .grid-cols-4 {
    grid-template-columns: repeat(2, 1fr);
  }
  
  main {
    padding-top: 100px;
  }
}

@media (max-width: 640px) {
  .grid-cols-4 {
    grid-template-columns: 1fr;
  }
}

/* Efecto hover para elementos interactivos */
.cursor-pointer:hover {
  cursor: pointer;
}

/* Sombras mejoradas */
.shadow-lg {
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.hover\:shadow-xl:hover {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Colores consistentes */
.bg-emerald-600 {
  background-color: #059669;
}

.bg-emerald-50 {
  background-color: #ecfdf5;
}

.bg-emerald-100 {
  background-color: #d1fae5;
}

.text-emerald-600 {
  color: #059669;
}

/* Mejoras de accesibilidad */
:focus-visible {
  outline: 2px solid #059669;
  outline-offset: 2px;
}
</style>