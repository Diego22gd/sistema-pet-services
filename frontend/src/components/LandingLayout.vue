<template>
  <div class="bg-neutral-bg min-h-screen flex flex-col">
    <!-- Header profesional con gradiente y sombra -->
    <header class="fixed top-0 left-0 right-0 w-full z-50 bg-gradient-to-r from-primary-mint to-teal-500 text-white shadow-lg backdrop-blur-sm bg-opacity-95">
      <div class="container mx-auto px-6">
        <div class="flex justify-between items-center py-4">
          <!-- Logo con animación -->
          <div class="flex items-center space-x-3">
            <div class="relative">
              <div class="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300">
                <span class="text-2xl text-primary-mint">🐾</span>
              </div>
              <div class="absolute -inset-1 bg-primary-mint rounded-xl blur-sm opacity-30 animate-pulse"></div>
            </div>
            <div class="text-2xl font-bold bg-gradient-to-r from-white to-gray-100 bg-clip-text text-transparent">
              PetServices
            </div>
          </div>

          <!-- Botón de login mejorado -->
          <nav class="flex items-center">
            <router-link 
              to="/login" 
              class="relative group bg-white text-primary-mint px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 border-2 border-transparent hover:border-primary-mint"
            >
              <!-- Efecto de brillo al hover -->
              <div class="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-mint/10 to-teal-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <!-- Texto con animación -->
              <span class="relative z-10 flex items-center space-x-2">
                <span>Iniciar Sesión</span>
                <svg class="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                </svg>
              </span>

              <!-- Efecto de partículas al hacer hover -->
              <div class="absolute -inset-1 rounded-xl bg-gradient-to-r from-primary-mint to-teal-400 opacity-0 group-hover:opacity-10 blur-sm transition-opacity duration-300"></div>
            </router-link>
          </nav>
        </div>
      </div>

      <!-- Línea decorativa inferior -->
      <div class="h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
    </header>

    <!-- Contenido principal con mejor espaciado -->
    <main class="flex-1 pt-24 pb-12">
      <div class="container mx-auto px-6">
        <slot />
      </div>
    </main>

    <!-- Footer mejorado -->
    <footer class="bg-gradient-to-br from-gray-50 to-gray-100 border-t border-gray-200 py-8 mt-auto">
      <div class="container mx-auto px-6">
        <div class="text-center">
          <!-- Logo footer -->
          <div class="flex justify-center items-center space-x-3 mb-4">
            <div class="w-8 h-8 bg-primary-mint rounded-lg flex items-center justify-center shadow-sm">
              <span class="text-lg text-white">🐾</span>
            </div>
            <div class="text-xl font-bold text-neutral-dark">PetServices</div>
          </div>
          
          <!-- Texto copyright -->
          <p class="text-neutral-medium text-sm mb-4">
            Cuidando de tus mascotas con amor y profesionalismo
          </p>
          
          <!-- Derechos reservados -->
          <div class="border-t border-gray-200 pt-4">
            <p class="text-neutral-dark font-semibold">
              &copy; 2025 PetServices. Todos los derechos reservados.
            </p>
          </div>

          <!-- Enlaces legales -->
          <div class="flex justify-center space-x-6 mt-4 text-xs text-neutral-medium">
            <a href="#" class="hover:text-primary-mint transition-colors duration-200">Términos</a>
            <a href="#" class="hover:text-primary-mint transition-colors duration-200">Privacidad</a>
            <a href="#" class="hover:text-primary-mint transition-colors duration-200">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: "LandingLayout",
  mounted() {
    // Efecto de scroll suave para el header
    let lastScrollY = window.scrollY;
    const header = this.$el.querySelector('header');

    const handleScroll = () => {
      if (window.scrollY > lastScrollY && window.scrollY > 100) {
        header.style.transform = 'translateY(-100%)';
      } else {
        header.style.transform = 'translateY(0)';
      }
      lastScrollY = window.scrollY;
    };

    // Solo aplicar en dispositivos no móviles para mejor UX
    if (window.innerWidth > 768) {
      window.addEventListener('scroll', handleScroll, { passive: true });
    }

    // Cleanup
    this.$once('hook:beforeDestroy', () => {
      window.removeEventListener('scroll', handleScroll);
    });
  }
};
</script>

<style scoped>
/* Animación personalizada para el botón */
@keyframes buttonGlow {
  0%, 100% { 
    box-shadow: 0 4px 15px rgba(62, 180, 137, 0.3);
  }
  50% { 
    box-shadow: 0 6px 25px rgba(62, 180, 137, 0.5), 0 0 15px rgba(62, 180, 137, 0.3);
  }
}

/* Aplicar animación sutil al botón */
.router-link-active {
  animation: buttonGlow 3s ease-in-out infinite;
}

/* Mejoras de scroll suave */
html {
  scroll-behavior: smooth;
}

/* Efectos de transición para el header */
header {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Mejora el contraste y legibilidad */
.text-gradient {
  background: linear-gradient(135deg, #3EB489 0%, #2D9C6F 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Sombra suave para el contenido principal */
main {
  background: linear-gradient(180deg, 
    rgba(255, 255, 255, 0.8) 0%, 
    rgba(245, 245, 245, 0.6) 50%, 
    rgba(255, 255, 255, 0.8) 100%);
}
</style>