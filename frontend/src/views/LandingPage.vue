<template>
  <div class="bg-neutral-bg min-h-screen flex flex-col">
    <!-- Header simplificado para landing -->
   
    <header class="fixed top-0 left-0 right-0 w-full z-50 bg-gradient-to-r bg-primary-mint to-teal-500 text-white shadow-xl">
      <div class="container mx-auto px-6">
        <div class="flex justify-between items-center py-4">
          <!-- Logo con diseño mejorado -->
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shadow-lg border border-white/20">
              <span class="text-2xl">🐾</span>
            </div>
            <div class="text-2xl font-bold bg-gradient-to-r from-white to-gray-100 bg-clip-text text-transparent">
              PetServices
            </div>
          </div>

          <!-- Botón Home mejorado -->
          <nav>
            <router-link 
          to="/login" 
          class="bg-white text-primary-mint px-4 py-2 rounded-lg font-semibold hover:bg-neutral-light transition hover:shadow-md"
        >
          Iniciar Sesión
        </router-link>
          </nav>
        </div>
      </div>

      <!-- Línea decorativa inferior -->
      <div class="h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
    </header>

    <!-- Contenido de la Landing Page -->
    <main class="flex-1">
      <!-- Hero Section -->
      <section class="pt-32 pb-16 md:pb-24 px-6 md:px-20 bg-gradient-to-br from-primary-mint to-emerald-600 text-white rounded-b-[40px] md:rounded-b-[60px] relative overflow-hidden">
        <!-- Elementos decorativos de fondo -->
        <div class="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
          <div class="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-white"></div>
          <div class="absolute top-1/3 -left-20 w-40 h-40 rounded-full bg-white"></div>
          <div class="absolute bottom-20 right-1/4 w-32 h-32 rounded-full bg-white"></div>
        </div>
        
        <div class="container mx-auto max-w-6xl relative z-10">
          <div class="flex flex-col md:flex-row items-center justify-between gap-12">
            <div class="md:w-1/2 fade-up">
              <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Cuidamos de tus <span class="text-secondary-light">mascotas</span> como tú 🐾
              </h1>
              <p class="text-lg md:text-xl mb-8 text-white/90 max-w-lg">
                Encuentra los mejores servicios veterinarios, estéticos y de cuidado para tu compañero peludo. Todo en un solo lugar.
              </p>
              <div class="flex flex-col sm:flex-row gap-4">
                <router-link to="/services" class="btn-primary text-lg px-8 py-4 text-center font-semibold">
                  Explorar Servicios
                </router-link>
                <router-link to="/register" class="btn-secondary text-lg px-8 py-4 text-center font-semibold">
                  Crear Cuenta
                </router-link>
              </div>
              <div class="mt-10 flex items-center">
                <div class="flex -space-x-3 mr-4">
                  <div class="w-10 h-10 rounded-full bg-yellow-400 border-2 border-white flex items-center justify-center text-xs font-bold">MG</div>
                  <div class="w-10 h-10 rounded-full bg-blue-400 border-2 border-white flex items-center justify-center text-xs font-bold">CR</div>
                  <div class="w-10 h-10 rounded-full bg-purple-400 border-2 border-white flex items-center justify-center text-xs font-bold">AM</div>
                </div>
                <p class="text-white/80 text-sm">
                  <span class="font-bold">+2,500</span> clientes satisfechos
                </p>
              </div>
            </div>
            <div class="md:w-1/2 flex justify-center fade-up">
              <div class="relative">
                <div class="w-full max-w-md h-80 overflow-hidden rounded-3xl shadow-2xl">
                  <img
                    src="https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=400&w=500"
                    alt="Mascotas felices"
                    class="w-full h-full object-cover animate-fadeIn"
                  />
                </div>
                <div class="absolute -bottom-6 -right-6 bg-white text-neutral-dark p-4 rounded-2xl shadow-lg max-w-xs">
                  <div class="flex items-center">
                    <div class="w-10 h-10 rounded-full bg-primary-mint flex items-center justify-center mr-3">
                      <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                      </svg>
                    </div>
                    <div>
                      <p class="font-bold text-sm">Cuidado certificado</p>
                      <p class="text-xs text-neutral-medium">Profesionales verificados</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Marcas asociadas -->
      <section class="py-16 bg-neutral-light">
        <div class="container mx-auto max-w-6xl px-6">
          <p class="text-center text-neutral-medium mb-10 text-lg">Confían en nosotros</p>
          <div class="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-70">
            <div class="text-xl font-bold text-neutral-dark bg-white px-6 py-3 rounded-lg shadow-sm">VetPlus</div>
            <div class="text-xl font-bold text-neutral-dark bg-white px-6 py-3 rounded-lg shadow-sm">PetCare</div>
            <div class="text-xl font-bold text-neutral-dark bg-white px-6 py-3 rounded-lg shadow-sm">AnimalLove</div>
            <div class="text-xl font-bold text-neutral-dark bg-white px-6 py-3 rounded-lg shadow-sm">PawFriends</div>
            <div class="text-xl font-bold text-neutral-dark bg-white px-6 py-3 rounded-lg shadow-sm">HappyPets</div>
          </div>
        </div>
      </section>

      <!-- Servicios destacados -->
      <section class="py-20 md:py-28 px-6">
        <div class="container mx-auto max-w-6xl">
          <div class="text-center mb-16 fade-up">
            <h2 class="text-3xl md:text-4xl font-bold text-neutral-dark mb-6">Servicios para cada necesidad</h2>
            <p class="text-lg text-neutral-medium max-w-2xl mx-auto">Desde cuidados básicos hasta servicios especializados, tenemos todo lo que tu mascota necesita.</p>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <!-- Servicio Veterinaria -->
            <div class="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 fade-up group border border-gray-100">
              <div class="w-14 h-14 rounded-xl bg-primary-mint/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <svg class="w-7 h-7 text-primary-mint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
              </div>
              <h3 class="text-xl font-bold text-neutral-dark mb-3">Veterinaria</h3>
              <p class="text-neutral-medium mb-4">Consultas, vacunación, emergencias y cuidados especializados para la salud de tu mascota.</p>
              <a href="#" class="text-primary-mint font-medium flex items-center group-hover:translate-x-1 transition-transform duration-300">
                Ver más
                <svg class="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                </svg>
              </a>
            </div>
            
            <!-- Servicio Peluquería -->
            <div class="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 fade-up group border border-gray-100">
              <div class="w-14 h-14 rounded-xl bg-primary-light/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <svg class="w-7 h-7 text-primary-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              <h3 class="text-xl font-bold text-neutral-dark mb-3">Peluquería</h3>
              <p class="text-neutral-medium mb-4">Baño, corte de pelo, cepillado y tratamientos estéticos para que tu mascota luzca increíble.</p>
              <a href="#" class="text-primary-mint font-medium flex items-center group-hover:translate-x-1 transition-transform duration-300">
                Ver más
                <svg class="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                </svg>
              </a>
            </div>
            
            <!-- Servicio Guardería -->
            <div class="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 fade-up group border border-gray-100">
              <div class="w-14 h-14 rounded-xl bg-primary-mint-light/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <svg class="w-7 h-7 text-primary-mint-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
              </div>
              <h3 class="text-xl font-bold text-neutral-dark mb-3">Guardería</h3>
              <p class="text-neutral-medium mb-4">Espacios seguros y divertidos donde tu mascota estará cuidada mientras tú no estás.</p>
              <a href="#" class="text-primary-mint font-medium flex items-center group-hover:translate-x-1 transition-transform duration-300">
                Ver más
                <svg class="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                </svg>
              </a>
            </div>
            
            <!-- Servicio Entrenamiento -->
            <div class="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 fade-up group border border-gray-100">
              <div class="w-14 h-14 rounded-xl bg-secondary-light flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <svg class="w-7 h-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"></path>
                </svg>
              </div>
              <h3 class="text-xl font-bold text-neutral-dark mb-3">Entrenamiento</h3>
              <p class="text-neutral-medium mb-4">Programas de obediencia, socialización y corrección de comportamientos con expertos.</p>
              <a href="#" class="text-primary-mint font-medium flex items-center group-hover:translate-x-1 transition-transform duration-300">
                Ver más
                <svg class="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA para negocios -->
      <section class="mt-12 mb-12 py-20 md:py-28 px-6 bg-gradient-to-r from-primary-mint to-teal-500 text-white rounded-t-[40px] md:rounded-t-[60px] relative overflow-hidden">
        <div class="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
          <div class="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-white"></div>
          <div class="absolute top-1/4 -right-20 w-60 h-60 rounded-full bg-white"></div>
        </div>
        <div class="container mx-auto max-w-6xl relative z-10">
          <div class="flex flex-col md:flex-row items-center gap-16">
            <!-- Contenido de texto a la izquierda -->
            <div class="w-full md:w-1/2 fade-up">
              <h2 class="text-3xl md:text-4xl font-bold mb-6">¿Tienes un negocio de mascotas?</h2>
              <p class="text-lg md:text-xl mb-4 text-white/90 leading-relaxed">
                Únete a nuestra plataforma y llega a miles de dueños de mascotas que buscan servicios como el tuyo.
              </p>
              
              <!-- Lista de beneficios -->
              <div class="space-y-6 mb-6">
                <div class="flex items-start">
                  
                  <div>
                    <h4 class="font-semibold text-lg mb-2">Aumenta tu visibilidad</h4>
                    <p class="text-white/80">Llega a más clientes en tu zona</p>
                  </div>
                </div>
                
                <div class="flex items-start">
                  
                  <div>
                    <h4 class="font-semibold text-lg mb-2">Gestiona reservas fácilmente</h4>
                    <p class="text-white/80">Sistema de citas automatizado</p>
                  </div>
                </div>
                
                <div class="flex items-start">
                  
                  <div>
                    <h4 class="font-semibold text-Lg mb-2">Recibe pagos seguros</h4>
                    <p class="text-white/80">Múltiples métodos de pago</p>
                  </div>
                </div>
              </div>
              
              <!-- Botón de acción -->
              <div class="flex flex-col sm:flex-row gap-4">
                <button class="btn-secondary text-lg px-8 py-4 font-semibold w-full sm:w-auto text-center">
                  Registrar mi negocio
                </button>
                <button class="border-2 border-white text-white hover:bg-white hover:text-primary-mint transition-all duration-300 text-lg px-8 py-4 font-semibold rounded-xl w-full sm:w-auto text-center">
                  Más información
                </button>
              </div>
            </div>
            
            <!-- Imagen a la derecha -->
            <div class="w-full md:w-1/2 flex justify-center fade-up">
              <div class="relative max-w-md">
                <div class="bg-white/10 backdrop-blur-sm rounded-3xl p-2 border border-white/20">
                  <div class="w-full h-80 overflow-hidden rounded-2xl shadow-2xl">
                    <img
                      src="https://images.pexels.com/photos/416160/pexels-photo-416160.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=400&w=500"
                      alt="Registro comercio"
                      class="w-full h-full object-cover"
                    />
                  </div>
                </div>
                
                <!-- Badge de estadística -->
                
                
                <!-- Badge de confianza -->
                <div class="absolute -bottom-4 -right-4 bg-secondary-light text-neutral-dark p-3 rounded-xl shadow-lg">
                  <div class="flex items-center">
                    <div class="w-8 h-8 rounded-full bg-primary-mint flex items-center justify-center mr-2">
                      <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                      </svg>
                    </div>
                    <div>
                      <p class="font-bold text-sm">+500</p>
                      <p class="text-xs text-neutral-medium">Negocios activos</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Testimonios -->
      <section class="py-32 md:py-40 px-6 bg-neutral-light ">
        <div class="container mx-auto max-w-6xl">
          <div class="text-center mb-16 fade-up ">
            <h2 class="text-3xl md:text-4xl font-bold text-neutral-dark mb-6 py-8 ">Lo que dicen nuestros clientes</h2>
            <p class="text-lg text-neutral-medium max-w-2xl mx-auto">Experiencias reales de dueños de mascotas que confían en nuestros servicios.</p>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 " >
            <!-- Testimonio 1 -->
            <div class="bg-white rounded-2xl p-6 shadow-lg fade-up flex flex-col mb-16">
              <div class="flex items-center mb-4">
                <div class="w-12 h-12 rounded-full bg-primary-mint/20 flex items-center justify-center mr-4">
                  <span class="text-primary-mint font-bold">M</span>
                </div>
                <div>
                  <h4 class="font-bold text-neutral-dark">María González</h4>
                  <div class="flex text-amber-400">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                  </div>
                </div>
              </div>
              <p class="text-neutral-medium italic flex-grow">"Encontré el veterinario perfecto para mi gato Simba. La plataforma es muy fácil de usar y pude comparar precios y reseñas antes de decidirme."</p>
            </div>
            
            <!-- Testimonio 2 -->
            <div class="bg-white rounded-2xl p-6 shadow-lg fade-up flex flex-col mb-16">
              <div class="flex items-center mb-4">
                <div class="w-12 h-12 rounded-full bg-primary-light/20 flex items-center justify-center mr-4">
                  <span class="text-primary-light font-bold">C</span>
                </div>
                <div>
                  <h4 class="font-bold text-neutral-dark">Carlos Rodríguez</h4>
                  <div class="flex text-amber-400">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                  </div>
                </div>
              </div>
              <p class="text-neutral-medium italic flex-grow">"La guardería que encontré para mi perro Max es increíble. Tienen espacios amplios y personal calificado. ¡Max siempre vuelve feliz y cansado de jugar!"</p>
            </div>
            
            <!-- Testimonio 3 -->
            <div class="bg-white rounded-2xl p-6 shadow-lg fade-up flex flex-col mb-16">
              <div class="flex items-center mb-4">
                <div class="w-12 h-12 rounded-full bg-primary-mint-light/20 flex items-center justify-center mr-4">
                  <span class="text-primary-mint-light font-bold">A</span>
                </div>
                <div>
                  <h4 class="font-bold text-neutral-dark">Ana Martínez</h4>
                  <div class="flex text-amber-400">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                  </div>
                </div>
              </div>
              <p class="text-neutral-medium italic flex-grow">"Como peluquera canina, PetServices me ha permitido aumentar mi clientela en un 40%. La plataforma es intuitiva y me ayuda a gestionar mis citas eficientemente."</p>
            </div>
          </div>
        </div>
      </section>

      <!-- FAQ -->
      <section class="py-20 md:py-28 px-6 mt-16">
        <div class="container mx-auto max-w-4xl">
          <div class="text-center mb-16 fade-up">
            <h2 class="text-3xl md:text-4xl font-bold text-neutral-dark mb-6 mt-6">Preguntas frecuentes</h2>
            <p class="text-lg text-neutral-medium">Resolvemos tus dudas sobre nuestros servicios</p>
          </div>
          
          <div class="space-y-6">
            <div class="bg-white rounded-2xl p-6 shadow-lg fade-up mb-6">
              <h3 class="text-xl font-bold text-neutral-dark mb-3">¿Cómo puedo reservar un servicio?</h3>
              <p class="text-neutral-medium">Simplemente busca el servicio que necesitas, selecciona el proveedor que prefieras, elige fecha y hora, y confirma tu reserva. Recibirás una confirmación inmediata.</p>
            </div>
            
            <div class="bg-white rounded-2xl p-6 shadow-lg fade-up mb-6">
              <h3 class="text-xl font-bold text-neutral-dark mb-3">¿Qué métodos de pago aceptan?</h3>
              <p class="text-neutral-medium">Aceptamos tarjetas de crédito y débito, transferencias bancarias y PayPal. Todos los pagos se procesan de forma segura a través de nuestra plataforma.</p>
            </div>
            
            <div class="bg-white rounded-2xl p-6 shadow-lg fade-up mb-6">
              <h3 class="text-xl font-bold text-neutral-dark mb-3">¿Puedo cancelar o modificar una reserva?</h3>
              <p class="text-neutral-medium">Sí, puedes cancelar o modificar tu reserva hasta 24 horas antes del servicio sin coste adicional. Después de ese plazo, pueden aplicarse cargos según la política del proveedor.</p>
            </div>
            
            <div class="bg-white rounded-2xl p-6 shadow-lg fade-up mb-6">
              <h3 class="text-xl font-bold text-neutral-dark mb-3">¿Cómo verifican a los proveedores?</h3>
              <p class="text-neutral-medium">Todos nuestros proveedores pasan por un riguroso proceso de verificación que incluye comprobación de licencias, seguros y referencias. Además, recopilamos y mostramos las valoraciones de otros usuarios.</p>
            </div>
          </div>
          
          <div class="text-center mt-12 fade-up">
            <p class="text-neutral-medium mb-6">¿Tienes otra pregunta?</p>
            <button class="btn-primary text-lg px-8 py-4 font-semibold">
              Contactar con soporte
            </button>
          </div>
        </div>
      </section>

      <!-- CTA Final -->
      <section class="py-20 md:py-28 px-6 bg-gradient-to-br from-primary-mint to-teal-500 text-white rounded-[40px] md:rounded-[60px] mx-6 mb-12 text-center relative overflow-hidden">
        <div class="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
          <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-white"></div>
        </div>
        
        <div class="container mx-auto max-w-4xl relative z-10">
          <h2 class="text-3xl md:text-4xl font-bold mb-6 fade-up">¿Listo para cuidar de tu mascota?</h2>
          <p class="text-xl mb-8 text-white/90 max-w-2xl mx-auto fade-up">Únete a miles de dueños de mascotas que ya confían en PetServices para el cuidado de sus compañeros.</p>
          <div class="flex flex-col sm:flex-row justify-center gap-4 fade-up">
            <router-link to="/services" class="btn-primary text-lg px-8 py-4 text-center font-semibold">
              Explorar Servicios
            </router-link>
            <router-link to="/register" class="btn-secondary text-lg px-8 py-4 text-center font-semibold">
              Crear Cuenta
            </router-link>
          </div>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <footer class="bg-neutral-dark text-white py-12 mt-auto">
      <div class="container mx-auto max-w-6xl px-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div class="text-2xl font-bold text-primary-mint mb-4">🐾 PetServices</div>
            <p class="text-neutral-light mb-4">Cuidando de tus mascotas desde 2023 con servicios de calidad y profesionales verificados.</p>
            <div class="flex space-x-4">
              <a href="#" class="text-neutral-light hover:text-white transition-colors duration-300">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path>
                </svg>
              </a>
              <a href="#" class="text-neutral-light hover:text-white transition-colors duration-300">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z"></path>
                </svg>
              </a>
              <a href="#" class="text-neutral-light hover:text-white transition-colors duration-300">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                  <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"></path>
                </svg>
              </a>
            </div>
          </div>
          
          <div>
            <h3 class="font-bold text-lg mb-4">Servicios</h3>
            <ul class="space-y-2">
              <li><a href="#" class="text-neutral-light hover:text-white transition-colors duration-300">Veterinaria</a></li>
              <li><a href="#" class="text-neutral-light hover:text-white transition-colors duration-300">Peluquería</a></li>
              <li><a href="#" class="text-neutral-light hover:text-white transition-colors duration-300">Guardería</a></li>
              <li><a href="#" class="text-neutral-light hover:text-white transition-colors duration-300">Entrenamiento</a></li>
              <li><a href="#" class="text-neutral-light hover:text-white transition-colors duration-300">Paseadores</a></li>
            </ul>
          </div>
          
          <div>
            <h3 class="font-bold text-lg mb-4">Empresa</h3>
            <ul class="space-y-2">
              <li><a href="#" class="text-neutral-light hover:text-white transition-colors duration-300">Sobre nosotros</a></li>
              <li><a href="#" class="text-neutral-light hover:text-white transition-colors duration-300">Trabaja con nosotros</a></li>
              <li><a href="#" class="text-neutral-light hover:text-white transition-colors duration-300">Para negocios</a></li>
              <li><a href="#" class="text-neutral-light hover:text-white transition-colors duration-300">Blog</a></li>
              <li><a href="#" class="text-neutral-light hover:text-white transition-colors duration-300">Prensa</a></li>
            </ul>
          </div>
          
          <div>
            <h3 class="font-bold text-lg mb-4">Soporte</h3>
            <ul class="space-y-2">
              <li><a href="#" class="text-neutral-light hover:text-white transition-colors duration-300">Centro de ayuda</a></li>
              <li><a href="#" class="text-neutral-light hover:text-white transition-colors duration-300">Contacto</a></li>
              <li><a href="#" class="text-neutral-light hover:text-white transition-colors duration-300">Política de privacidad</a></li>
              <li><a href="#" class="text-neutral-light hover:text-white transition-colors duration-300">Términos de servicio</a></li>
              <li><a href="#" class="text-neutral-light hover:text-white transition-colors duration-300">Cookies</a></li>
            </ul>
          </div>
        </div>
        
        <div class="border-t border-neutral-medium mt-8 pt-8 text-center text-neutral-light">
          <p>© 2025 PetServices. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: "LandingLayout",
  mounted() {
    const cards = this.$el.querySelectorAll(".fade-up");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    cards.forEach((card) => observer.observe(card));
  },
};
</script>

<style scoped>
/* Animaciones Hero y cards */
@keyframes fadeIn {
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn { animation: fadeIn 1s ease-out forwards; }

.fade-up {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.8s ease-out, transform 0.8s ease-out;
}
.fade-up.show { opacity: 1; transform: translateY(0); }

/* Paleta de colores */
.bg-primary-mint { background-color: #3EB489; }
.bg-primary-mint-light { background-color: #7FD1B9; }
.bg-primary-light { background-color: #A3E1F0; }
.bg-secondary-light { background-color: #F9F3E3; }
.text-neutral-dark { color: #333333; }
.text-neutral-medium { color: #666666; }
.text-neutral-light { color: #999999; }
.bg-neutral-light { background-color: #F5F5F5; }
.bg-neutral-bg { background-color: #FFFFFF; }
.bg-neutral-dark { background-color: #222222; }

/* Botones */
.btn-primary { 
  background-color: #3EB489; 
  color: #fff; 
  padding: 1rem 2rem; 
  border-radius: .75rem; 
  box-shadow: 0 6px 18px rgba(62,180,137,0.12); 
  display: inline-block;
  font-weight: 600;
  transition: all 0.3s ease;
}
.btn-primary:hover { 
  background-color: #66caa1; 
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(62,180,137,0.2);
}

.btn-secondary { 
  background-color: #A3E1F0; 
  color: #17323b; 
  padding: 1rem 2rem; 
  border-radius: .75rem; 
  box-shadow: 0 6px 18px rgba(163,225,240,0.12); 
  display: inline-block;
  font-weight: 600;
  transition: all 0.3s ease;
}
.btn-secondary:hover { 
  background-color: #7fd1b9; 
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(163,225,240,0.2);
}
</style>