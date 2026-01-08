<template>
  <header class="fixed top-0 left-0 right-0 w-full z-50 bg-emerald-600 shadow-lg">
    <div class="container mx-auto px-6">
      <div class="flex justify-between items-center py-4">
        <!-- Logo moderno (ESTILO ADMIN) -->
        <div class="flex items-center space-x-3">
          <div class="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
            <span class="text-2xl text-emerald-600">🐾</span>
          </div>
          <div class="text-2xl font-bold text-white">
            PetServices
          </div>
        </div>

        <!-- Navegación LATERAL estilo admin -->
        <nav class="flex items-center space-x-4">
          <!-- Items de navegación del usuario (ESTILO ADMIN) -->
          
          <!-- COMERCIOS - Primer elemento con estilo admin -->
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
            <!-- Punto animado cuando no está activo -->
            <span class="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full animate-pulse" 
                  v-if="!($route.path === '/commerces' || $route.path.startsWith('/commerces'))">
            </span>
          </router-link>

          <!-- Servicios -->
         
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

          <!-- Botón Cerrar Sesión (ESTILO ADMIN) -->
          <button
            @click="logout"
            class="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-rose-600/25 hover:scale-105 group flex items-center space-x-2"
          >
            <span>🚪</span>
            <span>Cerrar Sesión</span>
          </button>
        </nav>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: "Header",
  methods: {
    logout() {
      console.log("Usuario ha cerrado sesión");
      
      // Limpiar almacenamiento local
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Animación de salida
      this.$el.style.transform = 'translateY(-100%)';
      this.$el.style.transition = 'transform 0.3s ease-in-out';
      
      setTimeout(() => {
        this.$router.push("/login");
      }, 300);
    }
  },
  mounted() {
    // Efecto de entrada suave (igual que admin)
    this.$el.style.transform = 'translateY(0)';
    this.$el.style.transition = 'transform 0.5s ease-out';
    
    // Verificar autenticación
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    
    if (!user || !token) {
      console.warn('⚠️ Usuario no autenticado');
    } else {
      console.log('✅ Usuario autenticado:', user.email);
    }
  },
  watch: {
    '$route.path'(newPath) {
      console.log('🔄 Cambio de ruta:', newPath);
    }
  }
}
</script>

<style scoped>
/* APLICAR LOS MISMOS ESTILOS DEL ADMIN */

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

/* Punto animado para Comercios */
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

/* Efecto hover para enlaces de navegación (igual que admin) */
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

/* Animación de entrada para header (igual que admin) */
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

/* Efecto especial para el enlace de Comercios (igual que admin) */
nav a[href="/commerces"] {
  position: relative;
}

nav a[href="/commerces"]::before {
  content: '';
  position: absolute;
  top: 50%;
  left: -5px;
  transform: translateY(-50%);
  width: 6px;
  height: 6px;
  background-color: #fbbf24; /* amarillo */
  border-radius: 50%;
  animation: pulseCommercesDot 1.5s infinite;
}

@keyframes pulseCommercesDot {
  0%, 100% {
    opacity: 1;
    transform: translateY(-50%) scale(1);
  }
  50% {
    opacity: 0.5;
    transform: translateY(-50%) scale(1.2);
  }
}

/* Efecto para enlaces activos */
nav a.router-link-active {
  background-color: rgba(255, 255, 255, 0.15);
  font-weight: 600;
}

/* Responsive (igual que admin) */
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
    flex-direction: column;
    gap: 1rem;
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
  
  /* Scroll horizontal en navegación móvil */
  nav {
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
  }
  
  nav::-webkit-scrollbar {
    height: 4px;
  }
  
  nav::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
  }
  
  nav::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 2px;
  }
}

/* Scroll suave para el main */
main {
  min-height: calc(100vh - 200px); /* Ajusta para footer y header */
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

/* Estilo para el link de comercios en móvil */
@media (max-width: 480px) {
  nav a[href="/commerces"] {
    animation: highlightCommerces 3s ease-in-out infinite;
  }
  
  @keyframes highlightCommerces {
    0%, 100% {
      background-color: transparent;
    }
    50% {
      background-color: rgba(255, 255, 255, 0.2);
    }
  }
}

/* Mejoras de accesibilidad */
nav a:focus-visible,
nav button:focus-visible {
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

/* Efecto de brillo para el enlace de Comercios */
nav a[href="/commerces"] {
  position: relative;
  animation: subtleGlow 3s ease-in-out infinite;
}

@keyframes subtleGlow {
  0%, 100% {
    box-shadow: 0 0 0 rgba(255, 255, 255, 0);
  }
  50% {
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
  }
}

/* Ajuste para el punto animado en móvil */
@media (max-width: 768px) {
  nav a[href="/commerces"]::before {
    display: none;
  }
  
  .bg-amber-400 {
    width: 6px;
    height: 6px;
  }
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

/* Gradiente sutil para el header */
header {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
</style>