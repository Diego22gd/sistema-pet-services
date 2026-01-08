<template>
  <div class="bg-white min-h-screen flex flex-col">
    <!-- Header verde sólido con navegación lateral (ESTILO LANDING) -->
    <header class="fixed top-0 left-0 right-0 w-full z-50 bg-emerald-600 shadow-lg">
      <div class="container mx-auto px-6">
        <div class="flex justify-between items-center py-4">
          <!-- Logo moderno -->
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
              <span class="text-2xl text-emerald-600">🐾</span>
            </div>
            <div class="text-2xl font-bold text-white">
              PetServices Admin
            </div>
          </div>

          <!-- Navegación LATERAL siempre visible -->
          <nav class="flex items-center space-x-4">
            <!-- Items de navegación del admin -->
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
              <span>{{ item.label }}</span>
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
      </div>
    </header>

    <!-- Contenido de la vista -->
    <main class="flex-1 pt-24 pb-12">
      <slot />
    </main>

    <!-- Footer Moderno Verde (ESTILO LANDING) -->
    <footer class="bg-emerald-600 text-white py-12 mt-auto">
      <div class="container mx-auto max-w-6xl px-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div class="flex items-center space-x-3 mb-4">
              <div class="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                <span class="text-xl text-emerald-600">🐾</span>
              </div>
              <div class="text-2xl font-bold text-white">
                PetServices Admin
              </div>
            </div>
            <p class="text-emerald-100 mb-6">Panel de administración para gestionar todos los servicios de PetServices.</p>
            <div class="flex space-x-4">
              <a href="#" class="social-icon-modern hover:bg-emerald-700">
                <span class="text-white">🌐</span>
              </a>
              <a href="#" class="social-icon-modern hover:bg-emerald-700">
                <span class="text-white">📱</span>
              </a>
              <a href="#" class="social-icon-modern hover:bg-emerald-700">
                <span class="text-white">📷</span>
              </a>
              <a href="#" class="social-icon-modern hover:bg-emerald-700">
                <span class="text-white">📹</span>
              </a>
            </div>
          </div>
          
          <div>
            <h3 class="font-bold text-lg text-white mb-4">Administración</h3>
            <ul class="space-y-3">
              <li>
                <router-link 
                  to="/admin/users" 
                  class="text-emerald-100 hover:text-white transition-colors duration-300 hover:translate-x-2 inline-block"
                >
                  👥 Usuarios
                </router-link>
              </li>
              <li>
                <router-link 
                  to="/admin/providers" 
                  class="text-emerald-100 hover:text-white transition-colors duration-300 hover:translate-x-2 inline-block"
                >
                  👨‍💼 Proveedores
                </router-link>
              </li>
              <li>
                <router-link 
                  to="/admin/clients" 
                  class="text-emerald-100 hover:text-white transition-colors duration-300 hover:translate-x-2 inline-block"
                >
                  👤 Clientes
                </router-link>
              </li>
              <li>
                <router-link 
                  to="/admin/commerces" 
                  class="text-emerald-100 hover:text-white transition-colors duration-300 hover:translate-x-2 inline-block font-semibold"
                >
                  🏬 Comercios
                </router-link>
              </li>
              <li>
                <router-link 
                  to="/admin/reports" 
                  class="text-emerald-100 hover:text-white transition-colors duration-300 hover:translate-x-2 inline-block"
                >
                  📈 Reportes
                </router-link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 class="font-bold text-lg text-white mb-4">Gestión</h3>
            <ul class="space-y-3">
              <li>
                <router-link 
                  to="/admin/appointments" 
                  class="text-emerald-100 hover:text-white transition-colors duration-300 hover:translate-x-2 inline-block"
                >
                  📅 Citas
                </router-link>
              </li>
              
              <li>
                <router-link 
                  to="/admin/commerces" 
                  class="text-emerald-100 hover:text-white transition-colors duration-300 hover:translate-x-2 inline-block font-semibold"
                >
                  🏬 Comercios
                </router-link>
              </li>
              <li>
                <router-link 
                  to="/admin/settings" 
                  class="text-emerald-100 hover:text-white transition-colors duration-300 hover:translate-x-2 inline-block"
                >
                  ⚙️ Configuración
                </router-link>
              </li>
              <li><a href="#" class="text-emerald-100 hover:text-white transition-colors duration-300 hover:translate-x-2 inline-block">📞 Soporte</a></li>
            </ul>
          </div>
          
          <div>
            <h3 class="font-bold text-lg text-white mb-4">Soporte</h3>
            <ul class="space-y-3">
              <li><a href="#" class="text-emerald-100 hover:text-white transition-colors duration-300 hover:translate-x-2 inline-block">❓ Centro de ayuda</a></li>
              <li><a href="#" class="text-emerald-100 hover:text-white transition-colors duration-300 hover:translate-x-2 inline-block">📞 Contacto</a></li>
              <li><a href="#" class="text-emerald-100 hover:text-white transition-colors duration-300 hover:translate-x-2 inline-block">🔒 Política de privacidad</a></li>
              <li><a href="#" class="text-emerald-100 hover:text-white transition-colors duration-300 hover:translate-x-2 inline-block">📝 Términos de servicio</a></li>
              <li><a href="#" class="text-emerald-100 hover:text-white transition-colors duration-300 hover:translate-x-2 inline-block">🍪 Cookies</a></li>
            </ul>
          </div>
        </div>
        
        <div class="border-t border-emerald-500 mt-8 pt-8 text-center text-emerald-100">
          <p class="mb-2">© 2025 PetServices Admin. Todos los derechos reservados.</p>
          <p class="text-sm">Panel de administración para PetServices</p>
          <p class="text-xs mt-2 text-emerald-200">
            <router-link to="/admin/commerces" class="hover:text-white transition-colors">
              🏬 Gestión de Comercios
            </router-link>
          </p>
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
          to: '/admin/commerces',  // ✅ AGREGADO A LOS ITEMS DE NAVEGACIÓN
          label: 'Comercios',
          icon: '🏬'
        },
        {
          to: '/admin/appointments',
          label: 'Citas',
          icon: '📅'
        },
        {
          to: '/admin/services',
          label: 'Servicios',
          icon: '⚙️'
        },
        {
          to: '/admin/reports',
          label: 'Reportes',
          icon: '📈'
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
    logout() {
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
    },
    
    // Método para navegar programáticamente a comercios
    goToCommerces() {
      this.$router.push('/admin/commerces').catch(err => {
        console.error('Error navegando a comercios:', err);
        alert('No se pudo cargar la página de comercios. Verifica que la ruta exista.');
      });
    },
    
    // Método para verificar todas las rutas
    checkRoutes() {
      console.log('🔍 Verificando rutas de navegación:');
      this.navigationItems.forEach(item => {
        console.log(`📍 ${item.icon} ${item.label}: ${item.to}`);
      });
      console.log('📍 Ruta actual:', this.$route.path);
    }
  },
  mounted() {
    // Efecto de entrada suave
    this.$el.querySelector('header').style.transform = 'translateY(0)';
    this.$el.querySelector('header').style.transition = 'transform 0.5s ease-out';
    
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
    console.log('🏬 Comercios disponible en:', '/admin/commerces');
    
    // Verificar rutas en modo desarrollo
    if (process.env.NODE_ENV === 'development') {
      setTimeout(() => {
        this.checkRoutes();
      }, 1000);
    }
  },
  watch: {
    // Observar cambios en la ruta
    '$route.path'(newPath) {
      console.log('🔄 Cambio de ruta:', newPath);
      
      // Verificar si la ruta de comercios está activa
      if (newPath === '/admin/commerces') {
        console.log('✅ Estás en la página de Comercios');
      }
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

/* Footer */
footer {
  background-color: #059669 !important; /* emerald-600 */
}

footer .text-emerald-100 {
  color: #d1fae5 !important; /* emerald-100 */
}

.social-icon-modern {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.social-icon-modern:hover {
  transform: translateY(-3px) scale(1.1);
  border-color: currentColor;
  background: rgba(255, 255, 255, 0.2);
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

/* Efecto especial para el enlace de Comercios */
nav a[href="/admin/commerces"] {
  position: relative;
}

nav a[href="/admin/commerces"]::before {
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
  
  .grid.grid-cols-1.md\:grid-cols-4 {
    grid-template-columns: 1fr;
    gap: 2rem;
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
  nav a[href="/admin/commerces"] {
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

/* Destacar el enlace de comercios en el footer */
footer a[href="/admin/commerces"] {
  position: relative;
  padding-left: 8px;
}

footer a[href="/admin/commerces"]::before {
  content: '🏬';
  position: absolute;
  left: -20px;
}
</style>