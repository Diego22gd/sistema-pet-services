<template>
  <div class="bg-white min-h-screen flex flex-col">
    <!-- Header verde sólido con menú hamburguesa -->
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

          <!-- Botón hamburguesa para móvil -->
          <button 
            @click="toggleMobileMenu"
            class="md:hidden text-white hover:text-emerald-100 transition-colors p-2 rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-emerald-600"
            aria-label="Menú de navegación"
            :aria-expanded="isMobileMenuOpen"
            type="button"
          >
            <span class="text-2xl">{{ isMobileMenuOpen ? '✕' : '☰' }}</span>
          </button>

          <!-- Navegación para desktop -->
          <nav class="hidden md:flex items-center space-x-4">
            <!-- Comercios - Hace scroll a la sección -->
            <a 
              href="#comercios-destacados"
              @click.prevent="scrollToSection('comercios-destacados')"
              class="text-white hover:text-emerald-100 transition-all duration-300 font-medium px-3 py-2 rounded-lg hover:bg-emerald-700 cursor-pointer"
            >
              Comercios
            </a>
            
            <!-- Servicios - Hace scroll a la nueva sección -->
            <a 
              href="#servicios-completos"
              @click.prevent="scrollToSection('servicios-completos')"
              class="text-white hover:text-emerald-100 transition-all duration-300 font-medium px-3 py-2 rounded-lg hover:bg-emerald-700 cursor-pointer"
            >
              Servicios
            </a>
            
            <!-- Login -->
            <router-link 
              to="/login" 
              class="bg-white text-emerald-600 px-6 py-2.5 rounded-lg font-semibold hover:shadow-lg hover:shadow-white/25 hover:scale-105 transition-all duration-300 group"
            >
              <span class="group-hover:translate-x-1 transition-transform duration-300">Iniciar Sesión</span>
            </router-link>
          </nav>
        </div>

        <!-- Menú móvil desplegable -->
        <div 
          v-if="isMobileMenuOpen"
          class="md:hidden bg-emerald-700/95 backdrop-blur-sm rounded-lg mt-2 py-4 px-4 shadow-xl border border-emerald-500/20 animate-slideDown"
        >
          <div class="space-y-2">
            <!-- Comercios móvil -->
            <a 
              href="#comercios-destacados"
              @click.prevent="() => {
                scrollToSection('comercios-destacados');
                closeMobileMenu();
              }"
              class="block text-white hover:text-emerald-100 transition-all duration-300 font-medium px-4 py-3 rounded-lg hover:bg-emerald-600 cursor-pointer flex items-center space-x-3 group"
            >
              <span class="text-xl">🏬</span>
              <span class="flex-1">Comercios</span>
              <span class="text-emerald-200 opacity-0 group-hover:opacity-100 transition-opacity">↓</span>
            </a>
            
            <!-- Servicios móvil -->
            <a 
              href="#servicios-completos"
              @click.prevent="() => {
                scrollToSection('servicios-completos');
                closeMobileMenu();
              }"
              class="block text-white hover:text-emerald-100 transition-all duration-300 font-medium px-4 py-3 rounded-lg hover:bg-emerald-600 cursor-pointer flex items-center space-x-3 group"
            >
              <span class="text-xl">✨</span>
              <span class="flex-1">Servicios</span>
              <span class="text-emerald-200 opacity-0 group-hover:opacity-100 transition-opacity">↓</span>
            </a>

            <!-- Separador móvil -->
            <div class="border-t border-emerald-500/30 my-3"></div>

            <!-- Login móvil -->
            <router-link 
              to="/login" 
              @click="closeMobileMenu"
              class="block bg-white text-emerald-600 px-4 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2 group w-full text-center"
            >
              <span>Iniciar Sesión</span>
              <span class="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
            </router-link>
          </div>
        </div>
      </div>
    </header>

    <!-- Contenido principal con tema claro -->
    <main class="flex-1 relative z-10">
      <!-- Hero Section Moderna -->
      <section class="pt-32 pb-16 md:pb-24 px-6 md:px-20 bg-white relative overflow-hidden">
        <!-- Elementos decorativos -->
        <div class="absolute inset-0 overflow-hidden">
          <div class="absolute top-1/4 left-1/4 w-1 h-1 bg-emerald-400 rounded-full animate-pulse"></div>
          <div class="absolute top-1/3 right-1/3 w-1 h-1 bg-teal-400 rounded-full animate-pulse" style="animation-delay: 0.5s"></div>
          <div class="absolute bottom-1/4 left-1/3 w-1 h-1 bg-emerald-500 rounded-full animate-pulse" style="animation-delay: 1s"></div>
        </div>

        <!-- Degradados decorativos -->
        <div class="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-emerald-100 to-transparent rounded-full blur-3xl opacity-30"></div>
        <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-teal-100 to-transparent rounded-full blur-3xl opacity-30"></div>
        
        <div class="container mx-auto max-w-6xl relative z-10">
          <div class="flex flex-col md:flex-row items-center justify-between gap-12">
            <div class="md:w-1/2 fade-up">
              <div class="inline-flex items-center space-x-2 bg-white px-4 py-2 rounded-full mb-6 border border-emerald-200 shadow-sm">
                <span class="text-emerald-600">🌟</span>
                <span class="text-sm text-gray-700">#1 en cuidado de mascotas</span>
              </div>
              <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-gray-900">
                Cuidamos de tus Mascotas como familia 🐾
              </h1>
              <p class="text-lg md:text-xl mb-8 text-gray-700 max-w-lg">
                Servicios veterinarios premium disponibles 24/7. Encuentra los mejores cuidadores para tu compañero en nuestra comunidad de servicios.
              </p>
              <div class="flex flex-col sm:flex-row gap-4">
                <router-link to="/login" class="btn-primary text-lg px-8 py-4 text-center font-semibold group">
                  <span class="group-hover:translate-x-2 transition-transform duration-300">Explorar Servicios</span>
                  <span class="ml-2 group-hover:rotate-90 transition-transform duration-300">→</span>
                </router-link>
                <router-link to="/login" class="btn-secondary text-lg px-8 py-4 text-center font-semibold group">
                  <span class="group-hover:scale-110 transition-transform duration-300">Crear Cuenta</span>
                </router-link>
              </div>
              <div class="mt-10 flex items-center">
                <div class="flex -space-x-3 mr-4">
                  <div class="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 border-2 border-white flex items-center justify-center text-xs font-bold text-white shadow-lg">MG</div>
                  <div class="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-400 border-2 border-white flex items-center justify-center text-xs font-bold text-white shadow-lg">CR</div>
                  <div class="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-400 border-2 border-white flex items-center justify-center text-xs font-bold text-white shadow-lg">AM</div>
                </div>
                <p class="text-gray-700 text-sm">
                  <span class="font-bold text-emerald-600">+2,500</span> clientes felices
                </p>
              </div>
            </div>
            <div class="md:w-1/2 flex justify-center fade-up">
              <div class="relative">
                <div class="w-full max-w-md h-80 overflow-hidden rounded-3xl shadow-2xl">
                  <img
                    src="/pet1.png"
                    alt="Mascotas felices"
                    class="w-full h-full object-cover animate-fadeIn"
                  />
                </div>
                <div class="absolute -bottom-6 -right-6 bg-white p-4 rounded-2xl shadow-lg border border-emerald-100 max-w-xs">
                  <div class="flex items-center">
                    <div class="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center mr-3">
                      <span class="text-white text-xl">❤️</span>
                    </div>
                    <div>
                      <p class="font-bold text-sm text-gray-800">Cuidado certificado</p>
                      <p class="text-xs text-gray-600">Profesionales verificados</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Comercios Destacados - TEMA CLARO -->
      <section id="comercios-destacados" class="py-16 md:py-24 px-6 bg-white scroll-mt-20">
        <div class="container mx-auto max-w-7xl">
          
          <!-- Header moderno -->
          <div class="text-center mb-12">
            <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 mb-4 border border-emerald-200">
              <span class="text-2xl text-emerald-600">⭐</span>
            </div>
            <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Comercios Destacados
            </h2>
            <p class="text-lg text-gray-700 max-w-2xl mx-auto">
              Descubre los mejores servicios para tu compañero peludo
            </p>
          </div>

          <!-- Grid de Cards modernas con imágenes del mismo tamaño -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <!-- Card 1 - Veterinaria -->
            <div class="card-modern group h-full flex flex-col">
              <!-- Imagen con tamaño fijo -->
              <figure class="relative h-48 w-full overflow-hidden rounded-t-2xl bg-gradient-to-br from-emerald-50 to-teal-50">
                <img 
                  src="/veterinaria.png" 
                  alt="AnimalCare Veterinaria" 
                  class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <!-- Badges -->
                <div class="absolute top-4 right-4">
                  <div class="badge-primary">
                    ⭐ 4.8
                  </div>
                </div>
                <div class="absolute top-4 left-4">
                  <div class="badge-outline">
                    🏥 VETERINARIA
                  </div>
                </div>
              </figure>
              
              <div class="card-modern-body p-6 flex-1 flex flex-col">
                <!-- Header con avatar -->
                <div class="flex items-start gap-4 mb-4">
                  <div class="avatar-modern">
                    <div class="bg-emerald-100 text-emerald-600 w-12 h-12 rounded-xl border border-emerald-200">
                      <span class="text-2xl">🐕</span>
                    </div>
                  </div>
                  <div class="flex-1">
                    <h3 class="card-title text-lg font-bold text-gray-900">
                      AnimalCare
                    </h3>
                    <div class="flex items-center gap-2 mt-1 text-sm text-gray-600">
                      <span class="text-emerald-500">📍</span> Centro Comercial Los Pinos
                    </div>
                  </div>
                </div>

                <!-- Descripción -->
                <p class="text-gray-700 text-sm mb-4 line-clamp-2 flex-grow">
                  Clínica veterinaria especializada en cuidado preventivo, cirugías y emergencias 24/7.
                </p>

                <!-- Tags -->
                <div class="flex flex-wrap gap-2 mb-4">
                  <span class="badge-tag">
                    Consultas
                  </span>
                  <span class="badge-tag">
                    Vacunación
                  </span>
                  <span class="badge-tag">
                    Emergencias
                  </span>
                </div>

                <!-- Footer con precio y botón -->
                <div class="card-actions justify-between items-center mt-2">
                  <div>
                    <p class="text-lg font-bold text-emerald-600">Desde $25</p>
                    <p class="text-xs text-gray-500">por consulta</p>
                  </div>
                  <button 
                    @click="openModal('animalcare')"
                    class="btn-modern-sm group"
                  >
                    <span>Explorar</span>
                    <span class="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Card 2 - Peluquería -->
            <div class="card-modern group h-full flex flex-col">
              <figure class="relative h-48 w-full overflow-hidden rounded-t-2xl bg-gradient-to-br from-teal-50 to-cyan-50">
                <img 
                  src="/patasybelleza.png" 
                  alt="Paws & Beauty" 
                  class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div class="absolute top-4 right-4">
                  <div class="badge-primary">
                    ⭐ 4.9
                  </div>
                </div>
                <div class="absolute top-4 left-4">
                  <div class="badge-outline">
                    ✂️ PELUQUERÍA
                  </div>
                </div>
              </figure>
              
              <div class="card-modern-body p-6 flex-1 flex flex-col">
                <div class="flex items-start gap-4 mb-4">
                  <div class="avatar-modern">
                    <div class="bg-teal-100 text-teal-600 w-12 h-12 rounded-xl border border-teal-200">
                      <span class="text-2xl">✂️</span>
                    </div>
                  </div>
                  <div class="flex-1">
                    <h3 class="card-title text-lg font-bold text-gray-900">
                      Paws & Beauty
                    </h3>
                    <div class="flex items-center gap-2 mt-1 text-sm text-gray-600">
                      <span class="text-teal-500">📍</span> Calle Principal #123
                    </div>
                  </div>
                </div>

                <p class="text-gray-700 text-sm mb-4 line-clamp-2 flex-grow">
                  Spa y peluquería canina premium con tratamientos de lujo y productos orgánicos.
                </p>

                <div class="flex flex-wrap gap-2 mb-4">
                  <span class="badge-tag">
                    Baño
                  </span>
                  <span class="badge-tag">
                    Corte
                  </span>
                  <span class="badge-tag">
                    SPA
                  </span>
                </div>

                <div class="card-actions justify-between items-center mt-2">
                  <div>
                    <p class="text-lg font-bold text-teal-600">Desde $30</p>
                    <p class="text-xs text-gray-500">servicio básico</p>
                  </div>
                  <button 
                    @click="openModal('pawsbeauty')"
                    class="btn-modern-sm group"
                  >
                    <span>Explorar</span>
                    <span class="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Card 3 - Guardería -->
            <div class="card-modern group h-full flex flex-col">
              <figure class="relative h-48 w-full overflow-hidden rounded-t-2xl bg-gradient-to-br from-purple-50 to-pink-50">
                <img 
                  src="/amidogs.png" 
                  alt="Happy Tails" 
                  class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div class="absolute top-4 right-4">
                  <div class="badge-primary">
                    ⭐ 4.7
                  </div>
                </div>
                <div class="absolute top-4 left-4">
                  <div class="badge-outline">
                    🏠 GUARDERÍA
                  </div>
                </div>
              </figure>
              
              <div class="card-modern-body p-6 flex-1 flex flex-col">
                <div class="flex items-start gap-4 mb-4">
                  <div class="avatar-modern">
                    <div class="bg-purple-100 text-purple-600 w-12 h-12 rounded-xl border border-purple-200">
                      <span class="text-2xl">🏠</span>
                    </div>
                  </div>
                  <div class="flex-1">
                    <h3 class="card-title text-lg font-bold text-gray-900">
                      Happy Tails
                    </h3>
                    <div class="flex items-center gap-2 mt-1 text-sm text-gray-600">
                      <span class="text-purple-500">📍</span> Zona Residencial Norte
                    </div>
                  </div>
                </div>

                <p class="text-gray-700 text-sm mb-4 line-clamp-2 flex-grow">
                  Guardería con áreas de juego, monitoreo 24/7 y personal certificado.
                </p>

                <div class="flex flex-wrap gap-2 mb-4">
                  <span class="badge-tag">
                    Día completo
                  </span>
                  <span class="badge-tag">
                    Medio día
                  </span>
                  <span class="badge-tag">
                    Paseos
                  </span>
                </div>

                <div class="card-actions justify-between items-center mt-2">
                  <div>
                    <p class="text-lg font-bold text-purple-600">Desde $20</p>
                    <p class="text-xs text-gray-500">por día</p>
                  </div>
                  <button 
                    @click="openModal('happytails')"
                    class="btn-modern-sm group"
                  >
                    <span>Explorar</span>
                    <span class="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Card 4 - Traumatología -->
            <div class="card-modern group h-full flex flex-col">
              <figure class="relative h-48 w-full overflow-hidden rounded-t-2xl bg-gradient-to-br from-blue-50 to-cyan-50">
                <img 
                  src="/traumavet.png" 
                  alt="Traumavet" 
                  class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div class="absolute top-4 right-4">
                  <div class="badge-primary">
                    ⭐ 4.9
                  </div>
                </div>
                <div class="absolute top-4 left-4">
                  <div class="badge-outline">
                    🏥 TRAUMATOLOGÍA
                  </div>
                </div>
              </figure>
              
              <div class="card-modern-body p-6 flex-1 flex flex-col">
                <div class="flex items-start gap-4 mb-4">
                  <div class="avatar-modern">
                    <div class="bg-blue-100 text-blue-600 w-12 h-12 rounded-xl border border-blue-200">
                      <span class="text-2xl">🏥</span>
                    </div>
                  </div>
                  <div class="flex-1">
                    <h3 class="card-title text-lg font-bold text-gray-900">
                      Traumavet
                    </h3>
                    <div class="flex items-center gap-2 mt-1 text-sm text-gray-600">
                      <span class="text-blue-500">📍</span> Av. Principal #456
                    </div>
                  </div>
                </div>

                <p class="text-gray-700 text-sm mb-4 line-clamp-2 flex-grow">
                  Especialistas en traumatología y ortopedia veterinaria.
                </p>

                <div class="flex flex-wrap gap-2 mb-4">
                  <span class="badge-tag">
                    Traumatología
                  </span>
                  <span class="badge-tag">
                    Cirugías
                  </span>
                  <span class="badge-tag">
                    Rayos X
                  </span>
                </div>

                <div class="card-actions justify-between items-center mt-2">
                  <div>
                    <p class="text-lg font-bold text-blue-600">Desde $40</p>
                    <p class="text-xs text-gray-500">consulta especializada</p>
                  </div>
                  <button 
                    @click="openModal('traumavet')"
                    class="btn-modern-sm group"
                  >
                    <span>Explorar</span>
                    <span class="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Botón Ver Todos -->
          <div class="text-center mt-12">
            <router-link to="/login" class="btn-modern-outline-lg group inline-flex items-center">
              <span>Ver todos los comercios</span>
              <span class="ml-2 group-hover:translate-x-2 transition-transform duration-300">→</span>
            </router-link>
          </div>
        </div>
      </section>

      <!-- SECCIÓN CORREGIDA: Servicios con imágenes completas - CARD MÁS ALTAS 20% -->
      <section id="servicios-completos" class="py-16 md:py-24 px-6 bg-white scroll-mt-20">
        <div class="container mx-auto max-w-7xl">
          
          <!-- Header moderno -->
          <div class="text-center mb-12 fade-up">
            <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 mb-4 border border-emerald-200">
              <span class="text-2xl text-emerald-600">✨</span>
            </div>
            <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Nuestros Servicios
            </h2>
            <p class="text-lg text-gray-700 max-w-2xl mx-auto">
              Todo lo que tu mascota necesita en un solo lugar
            </p>
          </div>

          <!-- Grid de servicios corregido con cards 20% más altas -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            <!-- Servicio 1 - Veterinaria -->
            <div class="service-card-modern group fade-up">
              <div class="relative h-[307px] w-full overflow-hidden rounded-xl">
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-10"></div>
                <img 
                  src="/veterinaria.png" 
                  alt="Servicio Veterinario" 
                  class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div class="absolute top-4 left-4 z-20">
                  <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-600/90 backdrop-blur-sm border border-emerald-400/30">
                    <span class="text-xl text-white">🏥</span>
                  </div>
                </div>
                <div class="absolute bottom-0 left-0 right-0 p-6 z-20">
                  <div class="flex items-center justify-between">
                    <div>
                      <h3 class="text-xl font-bold text-white mb-1">Veterinaria</h3>
                      <p class="text-emerald-100/90 text-sm">Cuidado médico completo</p>
                    </div>
                    <div class="bg-emerald-600/90 backdrop-blur-sm border border-emerald-400/30 px-3 py-2 rounded-lg text-center min-w-[70px]">
                      <span class="text-xs text-emerald-100 block">Desde</span>
                      <p class="text-lg font-bold text-white">$25</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Servicio 2 - Peluquería -->
            <div class="service-card-modern group fade-up">
              <div class="relative h-[307px] w-full overflow-hidden rounded-xl">
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-10"></div>
                <img 
                  src="/peluqueria.png" 
                  alt="Servicio de Peluquería" 
                  class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div class="absolute top-4 left-4 z-20">
                  <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-teal-600/90 backdrop-blur-sm border border-teal-400/30">
                    <span class="text-xl text-white">✂️</span>
                  </div>
                </div>
                <div class="absolute bottom-0 left-0 right-0 p-6 z-20">
                  <div class="flex items-center justify-between">
                    <div>
                      <h3 class="text-xl font-bold text-white mb-1">Peluquería</h3>
                      <p class="text-emerald-100/90 text-sm">Estilo y cuidado profesional</p>
                    </div>
                    <div class="bg-teal-600/90 backdrop-blur-sm border border-teal-400/30 px-3 py-2 rounded-lg text-center min-w-[70px]">
                      <span class="text-xs text-emerald-100 block">Desde</span>
                      <p class="text-lg font-bold text-white">$30</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Servicio 3 - Guardería -->
            <div class="service-card-modern group fade-up">
              <div class="relative h-[307px] w-full overflow-hidden rounded-xl">
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-10"></div>
                <img 
                  src="/guarderia.png" 
                  alt="Servicio de Guardería" 
                  class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div class="absolute top-4 left-4 z-20">
                  <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-600/90 backdrop-blur-sm border border-purple-400/30">
                    <span class="text-xl text-white">🏠</span>
                  </div>
                </div>
                <div class="absolute bottom-0 left-0 right-0 p-6 z-20">
                  <div class="flex items-center justify-between">
                    <div>
                      <h3 class="text-xl font-bold text-white mb-1">Guardería</h3>
                      <p class="text-emerald-100/90 text-sm">Cuidado diurno con diversión</p>
                    </div>
                    <div class="bg-purple-600/90 backdrop-blur-sm border border-purple-400/30 px-3 py-2 rounded-lg text-center min-w-[70px]">
                      <span class="text-xs text-emerald-100 block">Desde</span>
                      <p class="text-lg font-bold text-white">$20</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Servicio 4 - Entrenamiento -->
            <div class="service-card-modern group fade-up">
              <div class="relative h-[307px] w-full overflow-hidden rounded-xl">
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-10"></div>
                <img 
                  src="/nutricion2.png" 
                  alt="Servicio de Entrenamiento" 
                  class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div class="absolute top-4 left-4 z-20">
                  <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-600/90 backdrop-blur-sm border border-amber-400/30">
                    <span class="text-xl text-white">🎓</span>
                  </div>
                </div>
                <div class="absolute bottom-0 left-0 right-0 p-6 z-20">
                  <div class="flex items-center justify-between">
                    <div>
                      <h3 class="text-xl font-bold text-white mb-1">Entrenamiento</h3>
                      <p class="text-emerald-100/90 text-sm">Educación y comportamiento</p>
                    </div>
                    <div class="bg-amber-600/90 backdrop-blur-sm border border-amber-400/30 px-3 py-2 rounded-lg text-center min-w-[70px]">
                      <span class="text-xs text-emerald-100 block">Desde</span>
                      <p class="text-lg font-bold text-white">$35</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Servicio 5 - Paseos -->
            <div class="service-card-modern group fade-up">
              <div class="relative h-[307px] w-full overflow-hidden rounded-xl">
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-10"></div>
                <img 
                  src="/paseadores.png" 
                  alt="Servicio de Paseos" 
                  class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div class="absolute top-4 left-4 z-20">
                  <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600/90 backdrop-blur-sm border border-blue-400/30">
                    <span class="text-xl text-white">🚶</span>
                  </div>
                </div>
                <div class="absolute bottom-0 left-0 right-0 p-6 z-20">
                  <div class="flex items-center justify-between">
                    <div>
                      <h3 class="text-xl font-bold text-white mb-1">Paseos</h3>
                      <p class="text-emerald-100/90 text-sm">Ejercicio diario para tu mascota</p>
                    </div>
                    <div class="bg-blue-600/90 backdrop-blur-sm border border-blue-400/30 px-3 py-2 rounded-lg text-center min-w-[70px]">
                      <span class="text-xs text-emerald-100 block">Desde</span>
                      <p class="text-lg font-bold text-white">$15</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Servicio 6 - Traumatología -->
            <div class="service-card-modern group fade-up">
              <div class="relative h-[307px] w-full overflow-hidden rounded-xl">
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-10"></div>
                <img 
                  src="/adiestramiento.png" 
                  alt="Servicio de Traumatología" 
                  class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div class="absolute top-4 left-4 z-20">
                  <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600/90 backdrop-blur-sm border border-indigo-400/30">
                    <span class="text-xl text-white">🏥</span>
                  </div>
                </div>
                <div class="absolute bottom-0 left-0 right-0 p-6 z-20">
                  <div class="flex items-center justify-between">
                    <div>
                      <h3 class="text-xl font-bold text-white mb-1">Traumatología</h3>
                      <p class="text-emerald-100/90 text-sm">Especialistas en ortopedia</p>
                    </div>
                    <div class="bg-indigo-600/90 backdrop-blur-sm border border-indigo-400/30 px-3 py-2 rounded-lg text-center min-w-[70px]">
                      <span class="text-xs text-emerald-100 block">Desde</span>
                      <p class="text-lg font-bold text-white">$40</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Botón Ver Todos los Servicios -->
          <div class="text-center mt-12">
            <router-link to="/login" class="btn-modern-outline-lg group inline-flex items-center">
              <span>Explorar todos los servicios</span>
              <span class="ml-2 group-hover:translate-x-2 transition-transform duration-300">→</span>
            </router-link>
          </div>
        </div>
      </section>

      <!-- Testimonios Modernos -->
      <section class="py-16 md:py-24 px-6 bg-white relative overflow-hidden">
        <div class="container mx-auto max-w-6xl relative z-10">
          <div class="text-center mb-16 fade-up">
            <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 mb-4 border border-emerald-200">
              <span class="text-2xl text-emerald-600">💬</span>
            </div>
            <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Testimonios de Clientes</h2>
            <p class="text-lg text-gray-700 max-w-2xl mx-auto">Historias reales de dueños que confían en nuestro cuidado</p>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <!-- Testimonio 1 -->
            <div class="testimonial-card-modern fade-up">
              <div class="flex items-center mb-6">
                <div class="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center mr-4 shadow-lg">
                  <span class="text-white font-bold text-lg">MG</span>
                </div>
                <div>
                  <h4 class="font-bold text-gray-900 text-lg">María González</h4>
                  <div class="flex text-amber-400 mt-1">
                    <span class="text-lg">⭐</span>
                    <span class="text-lg">⭐</span>
                    <span class="text-lg">⭐</span>
                    <span class="text-lg">⭐</span>
                    <span class="text-lg">⭐</span>
                  </div>
                </div>
              </div>
              <p class="text-gray-700 italic">"Encontré el veterinario perfecto para mi gato Simba. La plataforma es muy fácil de usar y pude comparar precios y reseñas antes de decidirme. ¡Altamente recomendado!"</p>
              <div class="mt-6 pt-6 border-t border-gray-100">
                <p class="text-sm text-gray-600">Hace 2 semanas · Veterinaria</p>
              </div>
            </div>
            
            <!-- Testimonio 2 -->
            <div class="testimonial-card-modern fade-up">
              <div class="flex items-center mb-6">
                <div class="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-400 flex items-center justify-center mr-4 shadow-lg">
                  <span class="text-white font-bold text-lg">CR</span>
                </div>
                <div>
                  <h4 class="font-bold text-gray-900 text-lg">Carlos Rodríguez</h4>
                  <div class="flex text-amber-400 mt-1">
                    <span class="text-lg">⭐</span>
                    <span class="text-lg">⭐</span>
                    <span class="text-lg">⭐</span>
                    <span class="text-lg">⭐</span>
                    <span class="text-lg">⭐</span>
                  </div>
                </div>
              </div>
              <p class="text-gray-700 italic">"La guardería que encontré para mi perro Max es increíble. Tienen espacios amplios y personal calificado. ¡Max siempre vuelve feliz y cansado de jugar!"</p>
              <div class="mt-6 pt-6 border-t border-gray-100">
                <p class="text-sm text-gray-600">Hace 1 mes · Guardería</p>
              </div>
            </div>
            
            <!-- Testimonio 3 -->
            <div class="testimonial-card-modern fade-up">
              <div class="flex items-center mb-6">
                <div class="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-orange-400 flex items-center justify-center mr-4 shadow-lg">
                  <span class="text-white font-bold text-lg">AM</span>
                </div>
                <div>
                  <h4 class="font-bold text-gray-900 text-lg">Ana Martínez</h4>
                  <div class="flex text-amber-400 mt-1">
                    <span class="text-lg">⭐</span>
                    <span class="text-lg">⭐</span>
                    <span class="text-lg">⭐</span>
                    <span class="text-lg">⭐</span>
                    <span class="text-lg">⭐</span>
                  </div>
                </div>
              </div>
              <p class="text-gray-700 italic">"Como peluquera canina, PetServices me ha permitido aumentar mi clientela en un 40%. La plataforma es intuitiva y me ayuda a gestionar mis citas eficientemente."</p>
              <div class="mt-6 pt-6 border-t border-gray-100">
                <p class="text-sm text-gray-600">Hace 3 meses · Proveedora</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- FAQ Moderno -->
      <section class="py-16 md:py-24 px-6 bg-white">
        <div class="container mx-auto max-w-4xl">
          <div class="text-center mb-16 fade-up">
            <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 mb-4 border border-emerald-200">
              <span class="text-2xl text-emerald-600">❓</span>
            </div>
            <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Preguntas Frecuentes</h2>
            <p class="text-lg text-gray-700">Resolvemos tus dudas sobre nuestros servicios</p>
          </div>
          
          <div class="space-y-6">
            <div class="faq-card-modern fade-up">
              <div class="flex items-start gap-4">
                <div class="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
                  <span class="text-lg">Q</span>
                </div>
                <div>
                  <h3 class="text-xl font-bold text-gray-900 mb-3">¿Cómo puedo reservar un servicio?</h3>
                  <p class="text-gray-700">Simplemente busca el servicio que necesitas, selecciona el proveedor que prefieras, elige fecha y hora, y confirma tu reserva. Recibirás una confirmación inmediata en tu panel de control.</p>
                </div>
              </div>
            </div>
            
            <div class="faq-card-modern fade-up">
              <div class="flex items-start gap-4">
                <div class="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 flex-shrink-0">
                  <span class="text-lg">Q</span>
                </div>
                <div>
                  <h3 class="text-xl font-bold text-gray-900 mb-3">¿Qué métodos de pago aceptan?</h3>
                  <p class="text-gray-700">Aceptamos tarjetas de crédito y débito (Visa, MasterCard, American Express), transferencias bancarias y PayPal. Todos los pagos se procesan de forma segura a través de nuestra plataforma encriptada.</p>
                </div>
              </div>
            </div>
            
            <div class="faq-card-modern fade-up">
              <div class="flex items-start gap-4">
                <div class="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 flex-shrink-0">
                  <span class="text-lg">Q</span>
                </div>
                <div>
                  <h3 class="text-xl font-bold text-gray-900 mb-3">¿Puedo cancelar o modificar una reserva?</h3>
                  <p class="text-gray-700">Sí, puedes cancelar o modificar tu reserva hasta 24 horas antes del servicio sin coste adicional. Después de ese plazo, pueden aplicarse cargos según la política del proveedor.</p>
                </div>
              </div>
            </div>
            
            <div class="faq-card-modern fade-up">
              <div class="flex items-start gap-4">
                <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                  <span class="text-lg">Q</span>
                </div>
                <div>
                  <h3 class="text-xl font-bold text-gray-900 mb-3">¿Cómo verifican a los proveedores?</h3>
                  <p class="text-gray-700">Todos nuestros proveedores pasan por un riguroso proceso de verificación que incluye comprobación de licencias, seguros, referencias y entrevistas personales.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- MODALES PARA CADA COMERCIO (sin cambios) -->
      <!-- Modal AnimalCare -->
      <dialog id="modal_animalcare" class="modal-modern" @click.self="closeModal">
        <div class="modal-modern-box" @click.stop>
          <div class="modal-modern-header flex justify-between items-start">
            <div class="flex items-start gap-4">
              <div class="avatar-modern-lg">
                <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center">
                  <span class="text-3xl">🐕</span>
                </div>
              </div>
              <div>
                <h2 class="text-2xl font-bold text-gray-900">AnimalCare</h2>
                <div class="flex items-center gap-2 mt-2">
                  <div class="badge-outline">🏥 VETERINARIA</div>
                  <div class="badge-rating">⭐ 4.8</div>
                </div>
              </div>
            </div>
            <button @click="closeModal" class="btn-modal-close">
              ✕
            </button>
          </div>

          <div class="modal-modern-content mt-6">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <!-- Columna izquierda: Información -->
              <div>
                <div class="modal-section">
                  <h3 class="modal-section-title">
                    <span>📍</span> Ubicación
                  </h3>
                  <p class="text-gray-700">Centro Comercial Los Pinos, Calle Principal 123</p>
                </div>

                <div class="modal-section">
                  <h3 class="modal-section-title">
                    <span>⏰</span> Horarios
                  </h3>
                  <div class="grid grid-cols-2 gap-3">
                    <div class="time-card-modern">
                      <p class="font-bold text-gray-900">Lunes - Viernes</p>
                      <p class="text-emerald-600">9:00 AM - 8:00 PM</p>
                    </div>
                    <div class="time-card-modern">
                      <p class="font-bold text-gray-900">Sábados</p>
                      <p class="text-emerald-600">10:00 AM - 6:00 PM</p>
                    </div>
                  </div>
                </div>

                <div class="modal-section">
                  <h3 class="modal-section-title">
                    <span>📞</span> Contacto
                  </h3>
                  <div class="space-y-2">
                    <p class="text-gray-700">📱 Teléfono: <span class="font-bold">+1 (555) 123-4567</span></p>
                    <p class="text-gray-700">📧 Email: <span class="font-bold">info@animalcare.com</span></p>
                  </div>
                </div>
              </div>

              <!-- Columna derecha: Servicios y precios -->
              <div>
                <div class="modal-section">
                  <h3 class="modal-section-title">
                    <span>🩺</span> Servicios y Precios
                  </h3>
                  <div class="space-y-4">
                    <div v-for="(service, index) in businesses[0].pricing" :key="index" 
                         class="border border-gray-200 rounded-xl p-4 hover:border-emerald-300 transition-colors">
                      <div class="flex justify-between items-center mb-2">
                        <h4 class="font-bold text-gray-900">{{ service.service }}</h4>
                        <span class="text-xl font-bold text-emerald-600">{{ service.price }}</span>
                      </div>
                      <p class="text-sm text-gray-600">{{ service.description }}</p>
                    </div>
                  </div>
                </div>

                <div class="modal-section">
                  <h3 class="modal-section-title">
                    <span>🔧</span> Especialidades
                  </h3>
                  <div class="flex flex-wrap gap-2">
                    <span v-for="(service, index) in businesses[0].services" :key="index" 
                          class="badge-tag">
                      {{ service }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-section">
              <h3 class="modal-section-title">
                <span>📝</span> Descripción Completa
              </h3>
              <p class="text-gray-700 leading-relaxed">
                {{ businesses[0].fullDescription }}
              </p>
            </div>
          </div>

          <div class="modal-modern-actions">
            <button @click="closeModal" class="btn-modal-ghost">
              Cerrar
            </button>
            <router-link 
              to="/login" 
              class="btn-modal-primary group"
              @click="closeModal"
            >
              <span>Registrarse / Iniciar sesión para reservar</span>
              <span class="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
            </router-link>
          </div>
        </div>
      </dialog>

      <!-- Modal Paws & Beauty -->
      <dialog id="modal_pawsbeauty" class="modal-modern" @click.self="closeModal">
        <div class="modal-modern-box" @click.stop>
          <div class="modal-modern-header flex justify-between items-start">
            <div class="flex items-start gap-4">
              <div class="avatar-modern-lg">
                <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-400 flex items-center justify-center">
                  <span class="text-3xl">✂️</span>
                </div>
              </div>
              <div>
                <h2 class="text-2xl font-bold text-gray-900">Paws & Beauty</h2>
                <div class="flex items-center gap-2 mt-2">
                  <div class="badge-outline">✂️ PELUQUERÍA</div>
                  <div class="badge-rating">⭐ 4.9</div>
                </div>
              </div>
            </div>
            <button @click="closeModal" class="btn-modal-close">
              ✕
            </button>
          </div>

          <div class="modal-modern-content mt-6">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <div class="modal-section">
                  <h3 class="modal-section-title">
                    <span>📍</span> Ubicación
                  </h3>
                  <p class="text-gray-700">Calle Principal #123, Centro</p>
                </div>

                <div class="modal-section">
                  <h3 class="modal-section-title">
                    <span>⏰</span> Horarios
                  </h3>
                  <div class="grid grid-cols-2 gap-3">
                    <div class="time-card-modern">
                      <p class="font-bold text-gray-900">Martes - Domingo</p>
                      <p class="text-teal-600">10:00 AM - 7:00 PM</p>
                    </div>
                    <div class="time-card-modern">
                      <p class="font-bold text-gray-900">Lunes</p>
                      <p class="text-gray-500">Cerrado</p>
                    </div>
                  </div>
                </div>

                <div class="modal-section">
                  <h3 class="modal-section-title">
                    <span>📞</span> Contacto
                  </h3>
                  <div class="space-y-2">
                    <p class="text-gray-700">📱 Teléfono: <span class="font-bold">+1 (555) 987-6543</span></p>
                    <p class="text-gray-700">📧 Email: <span class="font-bold">contact@pawsbeauty.com</span></p>
                  </div>
                </div>
              </div>

              <div>
                <div class="modal-section">
                  <h3 class="modal-section-title">
                    <span>💈</span> Servicios y Precios
                  </h3>
                  <div class="space-y-4">
                    <div v-for="(service, index) in businesses[1].pricing" :key="index" 
                         class="border border-gray-200 rounded-xl p-4 hover:border-teal-300 transition-colors">
                      <div class="flex justify-between items-center mb-2">
                        <h4 class="font-bold text-gray-900">{{ service.service }}</h4>
                        <span class="text-xl font-bold text-teal-600">{{ service.price }}</span>
                      </div>
                      <p class="text-sm text-gray-600">{{ service.description }}</p>
                    </div>
                  </div>
                </div>

                <div class="modal-section">
                  <h3 class="modal-section-title">
                    <span>✨</span> Especialidades
                  </h3>
                  <div class="flex flex-wrap gap-2">
                    <span v-for="(service, index) in businesses[1].services" :key="index" 
                          class="badge-tag">
                      {{ service }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-section">
              <h3 class="modal-section-title">
                <span>📝</span> Descripción Completa
              </h3>
              <p class="text-gray-700 leading-relaxed">
                {{ businesses[1].fullDescription }}
              </p>
            </div>
          </div>

          <div class="modal-modern-actions">
            <button @click="closeModal" class="btn-modal-ghost">
              Cerrar
            </button>
            <router-link 
              to="/login" 
              class="btn-modal-primary group"
              @click="closeModal"
            >
              <span>Registrarse / Iniciar sesión para reservar</span>
              <span class="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
            </router-link>
          </div>
        </div>
      </dialog>

      <!-- Modal Happy Tails -->
      <dialog id="modal_happytails" class="modal-modern" @click.self="closeModal">
        <div class="modal-modern-box" @click.stop>
          <div class="modal-modern-header flex justify-between items-start">
            <div class="flex items-start gap-4">
              <div class="avatar-modern-lg">
                <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-400 flex items-center justify-center">
                  <span class="text-3xl">🏠</span>
                </div>
              </div>
              <div>
                <h2 class="text-2xl font-bold text-gray-900">Happy Tails</h2>
                <div class="flex items-center gap-2 mt-2">
                  <div class="badge-outline">🏠 GUARDERÍA</div>
                  <div class="badge-rating">⭐ 4.7</div>
                </div>
              </div>
            </div>
            <button @click="closeModal" class="btn-modal-close">
              ✕
            </button>
          </div>

          <div class="modal-modern-content mt-6">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <div class="modal-section">
                  <h3 class="modal-section-title">
                    <span>📍</span> Ubicación
                  </h3>
                  <p class="text-gray-700">Zona Residencial Norte, Av. Las Flores 456</p>
                </div>

                <div class="modal-section">
                  <h3 class="modal-section-title">
                    <span>⏰</span> Horarios
                  </h3>
                  <div class="grid grid-cols-2 gap-3">
                    <div class="time-card-modern">
                      <p class="font-bold text-gray-900">Lunes - Domingo</p>
                      <p class="text-purple-600">7:00 AM - 9:00 PM</p>
                    </div>
                    <div class="time-card-modern">
                      <p class="font-bold text-gray-900">Emergencias</p>
                      <p class="text-purple-600">24/7</p>
                    </div>
                  </div>
                </div>

                <div class="modal-section">
                  <h3 class="modal-section-title">
                    <span>📞</span> Contacto
                  </h3>
                  <div class="space-y-2">
                    <p class="text-gray-700">📱 Teléfono: <span class="font-bold">+1 (555) 456-7890</span></p>
                    <p class="text-gray-700">📧 Email: <span class="font-bold">reservas@happytails.com</span></p>
                  </div>
                </div>
              </div>

              <div>
                <div class="modal-section">
                  <h3 class="modal-section-title">
                    <span>🏠</span> Servicios y Precios
                  </h3>
                  <div class="space-y-4">
                    <div v-for="(service, index) in businesses[2].pricing" :key="index" 
                         class="border border-gray-200 rounded-xl p-4 hover:border-purple-300 transition-colors">
                      <div class="flex justify-between items-center mb-2">
                        <h4 class="font-bold text-gray-900">{{ service.service }}</h4>
                        <span class="text-xl font-bold text-purple-600">{{ service.price }}</span>
                      </div>
                      <p class="text-sm text-gray-600">{{ service.description }}</p>
                    </div>
                  </div>
                </div>

                <div class="modal-section">
                  <h3 class="modal-section-title">
                    <span>🎯</span> Especialidades
                  </h3>
                  <div class="flex flex-wrap gap-2">
                    <span v-for="(service, index) in businesses[2].services" :key="index" 
                          class="badge-tag">
                      {{ service }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-section">
              <h3 class="modal-section-title">
                <span>📝</span> Descripción Completa
              </h3>
              <p class="text-gray-700 leading-relaxed">
                {{ businesses[2].fullDescription }}
              </p>
            </div>
          </div>

          <div class="modal-modern-actions">
            <button @click="closeModal" class="btn-modal-ghost">
              Cerrar
            </button>
            <router-link 
              to="/login" 
              class="btn-modal-primary group"
              @click="closeModal"
            >
              <span>Registrarse / Iniciar sesión para reservar</span>
              <span class="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
            </router-link>
          </div>
        </div>
      </dialog>

      <!-- Modal Traumavet -->
      <dialog id="modal_traumavet" class="modal-modern" @click.self="closeModal">
        <div class="modal-modern-box" @click.stop>
          <div class="modal-modern-header flex justify-between items-start">
            <div class="flex items-start gap-4">
              <div class="avatar-modern-lg">
                <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                  <span class="text-3xl">🏥</span>
                </div>
              </div>
              <div>
                <h2 class="text-2xl font-bold text-gray-900">Traumavet</h2>
                <div class="flex items-center gap-2 mt-2">
                  <div class="badge-outline">🏥 TRAUMATOLOGÍA</div>
                  <div class="badge-rating">⭐ 4.9</div>
                </div>
              </div>
            </div>
            <button @click="closeModal" class="btn-modal-close">
              ✕
            </button>
          </div>

          <div class="modal-modern-content mt-6">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <div class="modal-section">
                  <h3 class="modal-section-title">
                    <span>📍</span> Ubicación
                  </h3>
                  <p class="text-gray-700">Av. Principal #456, Edificio Médico 3</p>
                </div>

                <div class="modal-section">
                  <h3 class="modal-section-title">
                    <span>⏰</span> Horarios
                  </h3>
                  <div class="grid grid-cols-2 gap-3">
                    <div class="time-card-modern">
                      <p class="font-bold text-gray-900">Lunes - Sábado</p>
                      <p class="text-blue-600">8:00 AM - 6:00 PM</p>
                    </div>
                    <div class="time-card-modern">
                      <p class="font-bold text-gray-900">Emergencias</p>
                      <p class="text-blue-600">24/7</p>
                    </div>
                  </div>
                </div>

                <div class="modal-section">
                  <h3 class="modal-section-title">
                    <span>📞</span> Contacto
                  </h3>
                  <div class="space-y-2">
                    <p class="text-gray-700">📱 Teléfono: <span class="font-bold">+1 (555) 234-5678</span></p>
                    <p class="text-gray-700">📧 Email: <span class="font-bold">urgencias@traumavet.com</span></p>
                  </div>
                </div>
              </div>

              <div>
                <div class="modal-section">
                  <h3 class="modal-section-title">
                    <span>🦴</span> Servicios y Precios
                  </h3>
                  <div class="space-y-4">
                    <div v-for="(service, index) in businesses[3].pricing" :key="index" 
                         class="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors">
                      <div class="flex justify-between items-center mb-2">
                        <h4 class="font-bold text-gray-900">{{ service.service }}</h4>
                        <span class="text-xl font-bold text-blue-600">{{ service.price }}</span>
                      </div>
                      <p class="text-sm text-gray-600">{{ service.description }}</p>
                    </div>
                  </div>
                </div>

                <div class="modal-section">
                  <h3 class="modal-section-title">
                    <span>🎯</span> Especialidades
                  </h3>
                  <div class="flex flex-wrap gap-2">
                    <span v-for="(service, index) in businesses[3].services" :key="index" 
                          class="badge-tag">
                      {{ service }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-section">
              <h3 class="modal-section-title">
                <span>📝</span> Descripción Completa
              </h3>
              <p class="text-gray-700 leading-relaxed">
                {{ businesses[3].fullDescription }}
              </p>
            </div>
          </div>

          <div class="modal-modern-actions">
            <button @click="closeModal" class="btn-modal-ghost">
              Cerrar
            </button>
            <router-link 
              to="/login" 
              class="btn-modal-primary group"
              @click="closeModal"
            >
              <span>Registrarse / Iniciar sesión para reservar</span>
              <span class="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
            </router-link>
          </div>
        </div>
      </dialog>
    </main>

    <!-- Footer Simple -->
    <footer class="bg-neutral-light text-neutral-medium py-6 text-center mt-auto shadow-inner relative z-10">
      <div class="container mx-auto px-6">
        <p class="text-base md:text-lg">© 2025 PetServices - Todos los derechos reservados</p>
        <p class="text-sm mt-2 text-neutral-medium/80">
          Cuidando de tus mascotas desde 2023
        </p>
      </div>
    </footer>

    <!-- Chatbot - POSICIONADO CORRECTAMENTE -->
    <Chatbot />
  </div>
</template>

<script>
// Importa el componente Chatbot
import Chatbot from "@/components/Chatbot.vue";

export default {
  name: "LandingLayout",
  
  // Registra el componente Chatbot
  components: {
    Chatbot
  },

  data() {
    return {
      isMobileMenuOpen: false,
      businesses: [
        {
          id: 'animalcare',
          title: "AnimalCare",
          rating: "4.8",
          tag: "🏥 VETERINARIA",
          icon: "🐕",
          location: "Centro Comercial Los Pinos, Calle Principal 123",
          hours: "Lunes a Viernes: 9:00 AM - 8:00 PM, Sábados: 10:00 AM - 6:00 PM",
          fullDescription: "Clínica veterinaria especializada en cuidado preventivo, cirugías y emergencias 24/7. Contamos con equipo de última generación y profesionales certificados con más de 10 años de experiencia. Ofrecemos servicios de hospitalización, laboratorio interno y farmacia veterinaria.",
          services: ["Consultas", "Vacunación", "Emergencias", "Cirugías", "Hospitalización", "Laboratorio"],
          pricing: [
            { service: "Consulta General", price: "$25", description: "Evaluación completa de mascota" },
            { service: "Vacunación", price: "$15-40", description: "Dependiendo del tipo de vacuna" },
            { service: "Emergencia 24/7", price: "$50", description: "Incluye evaluación inicial" },
            { service: "Cirugía Mayor", price: "$200-500", description: "Varía según complejidad" }
          ],
          phone: "+1 (555) 123-4567",
          email: "info@animalcare.com"
        },
        {
          id: 'pawsbeauty',
          title: "Paws & Beauty",
          rating: "4.9",
          tag: "✂️ PELUQUERÍA",
          icon: "✂️",
          location: "Calle Principal #123, Centro",
          hours: "Martes a Domingo: 10:00 AM - 7:00 PM",
          fullDescription: "Spa y peluquería canina premium con tratamientos de lujo y productos orgánicos. Nos especializamos en razas específicas y ofrecemos servicios personalizados según las necesidades de cada mascota. Usamos productos hipoalergénicos y técnicas de grooming profesionales.",
          services: ["Baño", "Corte", "SPA", "Cuidado Dental", "Pedicura", "Deslanado"],
          pricing: [
            { service: "Baño Básico", price: "$30", description: "Incluye shampoo y secado" },
            { service: "Corte Completo", price: "$45-65", description: "Según tamaño de mascota" },
            { service: "SPA Premium", price: "$75", description: "Baño de lujo + masaje" },
            { service: "Cuidado Dental", price: "$25", description: "Limpieza dental básica" }
          ],
          phone: "+1 (555) 987-6543",
          email: "contact@pawsbeauty.com"
        },
        {
          id: 'happytails',
          title: "Happy Tails",
          rating: "4.7",
          tag: "🏠 GUARDERÍA",
          icon: "🏠",
          location: "Zona Residencial Norte, Av. Las Flores 456",
          hours: "Lunes a Domingo: 7:00 AM - 9:00 PM",
          fullDescription: "Guardería con áreas de juego, monitoreo 24/7 y personal certificado. Contamos con espacios separados por tamaño y temperamento de mascotas, cámaras de seguridad en todas las áreas y protocolos de emergencia. Ofrecemos reportes diarios de actividades.",
          services: ["Día completo", "Medio día", "Paseos", "Entrenamiento", "Cuidado Especial", "Transporte"],
          pricing: [
            { service: "Día Completo", price: "$20", description: "8 horas de cuidado" },
            { service: "Medio Día", price: "$12", description: "4 horas de cuidado" },
            { service: "Paseo Diario", price: "$10", description: "30 minutos de paseo" },
            { service: "Paquete Semanal", price: "$85", description: "5 días completos" }
          ],
          phone: "+1 (555) 456-7890",
          email: "reservas@happytails.com"
        },
        {
          id: 'traumavet',
          title: "Traumavet",
          rating: "4.9",
          tag: "🏥 TRAUMATOLOGÍA",
          icon: "🏥",
          location: "Av. Principal #456, Edificio Médico 3",
          hours: "Lunes a Sábado: 8:00 AM - 6:00 PM, Emergencias 24/7",
          fullDescription: "Especialistas en traumatología y ortopedia veterinaria. Centro de referencia para cirugías complejas y rehabilitación. Contamos con sala de Rayos X digital, quirófano equipado y área de recuperación supervisada. Equipo multidisciplinario de especialistas.",
          services: ["Traumatología", "Cirugías", "Rayos X", "Rehabilitación", "Ortopedia", "Control Post-operatorio"],
          pricing: [
            { service: "Consulta Especializada", price: "$40", description: "Evaluación con especialista" },
            { service: "Rayos X", price: "$60-120", description: "Según número de vistas" },
            { service: "Cirugía Traumatológica", price: "$300-800", description: "Varía según complejidad" },
            { service: "Sesión Rehabilitación", price: "$35", description: "Terapia física 45 min" }
          ],
          phone: "+1 (555) 234-5678",
          email: "urgencias@traumavet.com"
        }
      ]
    };
  },

  methods: {
    toggleMobileMenu() {
      console.log('toggleMobileMenu called, current state:', this.isMobileMenuOpen);
      this.isMobileMenuOpen = !this.isMobileMenuOpen;
      if (this.isMobileMenuOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    },
    
    closeMobileMenu() {
      console.log('closeMobileMenu called');
      this.isMobileMenuOpen = false;
      document.body.style.overflow = '';
    },

    openModal(modalId) {
      const modal = document.getElementById(`modal_${modalId}`)
      if (modal) {
        modal.showModal()
      }
    },

    closeModal(event) {
      const dialog = event?.target?.closest('dialog')
      if (dialog) {
        dialog.close()
      }
    },

    scrollToSection(sectionId) {
      const section = document.getElementById(sectionId);
      if (section) {
        const offsetTop = section.offsetTop;
        const headerHeight = 80;
        const scrollPosition = offsetTop - headerHeight;
        
        window.scrollTo({
          top: scrollPosition,
          behavior: 'smooth'
        });
      }
    },

    handleClickOutside(event) {
      // Solo cerrar si el menú está abierto y se hace clic fuera del menú y del botón
      if (this.isMobileMenuOpen && 
          !event.target.closest('.md\\:hidden') && 
          !event.target.closest('button[aria-label="Menú de navegación"]')) {
        this.closeMobileMenu();
      }
    },

    initializeAnimations() {
      const cards = document.querySelectorAll(".fade-up");

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("show");
              observer.unobserve(entry.target);
            }
          });
        },
        { 
          threshold: 0.15,
          rootMargin: '50px 0px -50px 0px'
        }
      );

      cards.forEach((card) => observer.observe(card));
    }
  },

  mounted() {
    // Inicializar animaciones con un pequeño delay para asegurar que el DOM esté listo
    setTimeout(() => {
      this.initializeAnimations();
    }, 100);
    
    // Agregar listener para cerrar menú al hacer clic fuera
    document.addEventListener('click', this.handleClickOutside);
  },

  beforeUnmount() {
    document.body.style.overflow = '';
    document.removeEventListener('click', this.handleClickOutside);
  }
};
</script>

<style scoped>
/* Añadir padding al elemento html para que el scroll no se superponga con el header */
html {
  scroll-padding-top: 80px;
}

/* Estilos para las secciones con scroll */
#comercios-destacados,
#servicios-completos {
  scroll-margin-top: 80px;
}

/* ===== HEADER CON MENÚ HAMBURGUESA ===== */
header {
  background-color: #059669 !important;
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
}

/* Animaciones para menú móvil */
.animate-slideDown {
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
    max-height: 0;
  }
  to {
    opacity: 1;
    transform: translateY(0);
    max-height: 500px;
  }
}

/* ===== FOOTER SIMPLE ===== */
.bg-neutral-light {
  background-color: #f5f5f5;
}

.text-neutral-medium {
  color: #737373;
}

.shadow-inner {
  box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.05);
}

/* ===== ANIMACIONES ===== */
@keyframes fadeIn {
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.animate-fadeIn { 
  animation: fadeIn 1s ease-out forwards; 
  animation-delay: 0.2s;
}

.animate-pulse { 
  animation: pulse 2s ease-in-out infinite; 
}

.fade-up {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.8s ease-out, transform 0.8s ease-out;
}

.fade-up.show { 
  opacity: 1; 
  transform: translateY(0); 
}

/* ===== SERVICIOS CORREGIDOS - CARD MÁS ALTAS 20% ===== */
.service-card-modern {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  height: 100%;
}

.service-card-modern:hover {
  transform: translateY(-8px);
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.15),
    0 0 0 2px #10b981,
    0 0 30px rgba(16, 185, 129, 0.2);
}

.service-card-modern .relative {
  height: 100%;
}

.service-card-modern img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Asegurar altura consistente - AGRANDADO 20% (de 256px a 307px) */
.service-card-modern .relative {
  height: 307px; /* 256px * 1.2 = 307px */
}

/* Responsive para las cards más altas */
@media (max-width: 768px) {
  .service-card-modern .relative {
    height: 270px; /* Un poco más pequeño en móvil pero manteniendo proporción */
  }
}

@media (min-width: 768px) and (max-width: 1024px) {
  .service-card-modern .relative {
    height: 290px; /* Ajuste para tablet */
  }
}

@media (min-width: 1024px) {
  .service-card-modern .relative {
    height: 307px; /* Altura completa en desktop */
  }
}

/* ===== COMPONENTES MODERNOS ===== */

/* Cards */
.card-modern {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.card-modern:hover {
  transform: translateY(-8px);
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.1),
    0 0 0 1px #10b981,
    0 0 20px rgba(16, 185, 129, 0.1);
  border-color: #10b981;
}

.card-modern-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}

/* Badges */
.badge-primary {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-weight: bold;
  font-size: 0.875rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 6px rgba(16, 185, 129, 0.2);
}

.badge-outline {
  background: white;
  color: #10b981;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-weight: bold;
  font-size: 0.875rem;
  border: 1px solid #10b981;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.badge-tag {
  background: #f0fdfa;
  color: #0d9488;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  border: 1px solid #99f6e4;
}

/* Botones */
.btn-primary {
  background: linear-gradient(135deg, #10b981, #0d9488);
  color: white;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  transition: all 0.3s ease;
  box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 
    0 15px 35px rgba(16, 185, 129, 0.4),
    0 0 0 2px rgba(255, 255, 255, 0.2);
  background: linear-gradient(135deg, #0d9488, #10b981);
}

.btn-secondary {
  background: transparent;
  color: #10b981;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #10b981;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: rgba(16, 185, 129, 0.1);
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(16, 185, 129, 0.1);
}

.btn-modern-sm {
  background: white;
  color: #10b981;
  padding: 0.5rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

.btn-modern-sm:hover {
  background: #f0fdfa;
  border-color: #10b981;
  transform: translateX(4px);
}

.btn-modern-outline-lg {
  background: transparent;
  color: #10b981;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  border: 2px solid #10b981;
  transition: all 0.3s ease;
}

.btn-modern-outline-lg:hover {
  background: rgba(16, 185, 129, 0.1);
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(16, 185, 129, 0.1);
}

/* ===== MODALES MODERNOS ===== */
.modal-modern {
  background: transparent;
  border: none;
  max-width: 800px;
  width: 90%;
  margin: auto;
  padding: 0;
  z-index: 60; /* Más alto que el chatbot */
}

.modal-modern::backdrop {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 50;
}

.modal-modern-box {
  background: white;
  border-radius: 24px;
  padding: 2rem;
  border: 1px solid #e5e7eb;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px #10b981,
    0 0 40px rgba(16, 185, 129, 0.1);
  position: relative;
  overflow: hidden;
}

.modal-modern-box::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, #10b981, transparent);
}

.modal-modern-header {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.avatar-modern-lg {
  flex-shrink: 0;
}

.badge-rating {
  background: #fef3c7;
  color: #d97706;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  border: 1px solid #fcd34d;
}

.btn-modal-close {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f3f4f6;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-modal-close:hover {
  background: #e5e7eb;
  transform: rotate(90deg);
}

.modal-section {
  margin-bottom: 2rem;
}

.modal-section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.time-card-modern {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
  transition: all 0.3s ease;
}

.time-card-modern:hover {
  border-color: #10b981;
  background: #f0fdfa;
  transform: translateY(-2px);
}

.modal-modern-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  align-items: center;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
  flex-wrap: wrap;
}

.btn-modal-primary {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
}

.btn-modal-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(16, 185, 129, 0.3);
}

.btn-modal-ghost {
  background: transparent;
  color: #6b7280;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-modal-ghost:hover {
  background: #f3f4f6;
  border-color: #10b981;
}

/* ===== TESTIMONIAL CARDS ===== */
.testimonial-card-modern {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.testimonial-card-modern:hover {
  border-color: #10b981;
  transform: translateY(-5px);
  box-shadow: 
    0 15px 30px rgba(0, 0, 0, 0.1),
    0 0 0 1px #10b981;
}

/* ===== FAQ CARDS ===== */
.faq-card-modern {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  margin-bottom: 1rem;
}

.faq-card-modern:hover {
  border-color: #10b981;
  transform: translateX(5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

/* ===== UTILIDADES ===== */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Responsive */
@media (max-width: 768px) {
  main {
    padding-top: 5rem;
  }
  
  button.md\:hidden {
    min-width: 44px;
    min-height: 44px;
  }
  
  .md\:hidden.bg-emerald-700\/95 {
    background-color: rgba(5, 150, 105, 0.98);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }
  
  .modal-modern-box {
    padding: 1rem;
    margin: 1rem;
  }
  
  .modal-modern-actions {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .btn-modal-primary,
  .btn-modal-ghost {
    width: 100%;
    justify-content: center;
  }
  
  .btn-primary,
  .btn-secondary {
    width: 100%;
    justify-content: center;
  }
  
  .card-modern figure {
    height: 200px;
  }
  
  /* Ajuste para las cards de servicios en móvil */
  .service-card-modern .relative {
    height: 240px;
  }
}

/* Asegurar altura fija para todas las imágenes de las cards */
.card-modern figure {
  height: 192px;
  width: 100%;
  flex-shrink: 0;
}

.card-modern figure img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Mejoras para enlaces con flechas */
.group:hover .group-hover\:opacity-100 {
  opacity: 1;
}

/* Mejoras de accesibilidad */
nav a:focus-visible,
button:focus-visible {
  outline: 2px solid white;
  outline-offset: 2px;
  border-radius: 8px;
}

/* Ajuste del gap en la sección de servicios para las cards más altas */
#servicios-completos .gap-8 {
  gap: 2rem;
}

@media (max-width: 768px) {
  #servicios-completos .gap-8 {
    gap: 1.5rem;
  }
}

/* Mejoras para el chatbot */
.fixed.z-40 {
  z-index: 40;
}

main.relative.z-10 {
  z-index: 10;
  position: relative;
}

/* Asegurar que los modales estén por encima del chatbot */
dialog[open] {
  z-index: 60 !important;
}

/* Mejoras para el menú móvil */
.transition-all.duration-300 {
  transition: all 0.3s ease;
}

/* Botón hamburguesa más accesible */
button[aria-label="Menú de navegación"] {
  touch-action: manipulation;
}

/* Menú móvil con mejor animación */
.md\:hidden.bg-emerald-700\/95 {
  animation: slideDown 0.3s ease-out;
}

/* Asegurar que el botón sea clickeable */
button.md\:hidden {
  z-index: 60;
  position: relative;
}

/* Asegurar que el menú móvil tenga buena visibilidad */
.md\:hidden.bg-emerald-700\/95 {
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}
</style>