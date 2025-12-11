<template>
  <!-- Hero Section Nextly -->
  <section class="relative overflow-hidden bg-gradient-to-br from-primary-mint/20 via-white to-secondary/20 pt-24 pb-16 md:pt-32 md:pb-24">
    <!-- Elementos decorativos -->
    <div class="absolute inset-0 overflow-hidden opacity-20">
      <div class="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-primary-mint/30 to-transparent blur-3xl"></div>
      <div class="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-br from-secondary/30 to-transparent blur-3xl"></div>
    </div>

    <!-- Header Nextly -->
    <header class="absolute top-0 left-0 right-0 z-50">
      <div class="container-wide">
        <div class="flex justify-between items-center py-4 px-4 sm:px-6 lg:px-8">
          <!-- Logo con gradiente -->
          <div class="flex items-center space-x-3">
            <div class="gradient-primary w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg">
              <span class="text-2xl text-white">🐾</span>
            </div>
            <span class="text-2xl font-bold bg-gradient-to-r from-primary to-primary-mint bg-clip-text text-transparent">
              PetServices
            </span>
          </div>

          <!-- Botón de acción -->
          <router-link 
            to="/login" 
            class="btn-primary group"
          >
            <span class="flex items-center">
              Iniciar Sesión
              <span class="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </span>
          </router-link>
        </div>
      </div>
    </header>

    <!-- Contenido Hero -->
    <div class="container-narrow relative z-10">
      <div class="grid lg:grid-cols-2 gap-12 items-center">
        <!-- Texto principal -->
        <div class="space-y-8">
          <h1 class="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
            Cuidamos de tus 
            <span class="bg-gradient-to-r from-primary to-primary-mint bg-clip-text text-transparent">
              mascotas
            </span> 
            como tú 🐾
          </h1>
          
          <p class="text-xl text-neutral-medium leading-relaxed max-w-2xl">
            Encuentra los mejores servicios veterinarios, estéticos y de cuidado para tu compañero peludo. Todo en un solo lugar.
          </p>
          
          <!-- Botones de acción -->
          <div class="flex flex-col sm:flex-row gap-4">
            <router-link to="/services" class="btn-primary text-lg px-8 py-4">
              <span class="flex items-center">
                Explorar Servicios
                <span class="ml-3">→</span>
              </span>
            </router-link>
            <router-link to="/register" class="btn-outline text-lg px-8 py-4">
              <span class="flex items-center">
                Crear Cuenta
                <span class="ml-3">+</span>
              </span>
            </router-link>
          </div>
          
          <!-- Stats y usuarios -->
          <div class="flex items-center pt-6">
            <div class="flex -space-x-3 mr-4">
              <div class="w-10 h-10 rounded-full bg-yellow-400 border-2 border-white flex items-center justify-center text-xs font-bold shadow-sm">MG</div>
              <div class="w-10 h-10 rounded-full bg-blue-400 border-2 border-white flex items-center justify-center text-xs font-bold shadow-sm">CR</div>
              <div class="w-10 h-10 rounded-full bg-purple-400 border-2 border-white flex items-center justify-center text-xs font-bold shadow-sm">AM</div>
            </div>
            <p class="text-neutral-medium">
              <span class="font-bold text-neutral-darkest">+2,500</span> clientes satisfechos confían en nosotros
            </p>
          </div>
        </div>
        
        <!-- Imagen destacada -->
        <div class="relative">
          <div class="relative rounded-3xl overflow-hidden shadow-2xl">
            <img
              src="https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=400&w=500"
              alt="Mascotas felices"
              class="w-full h-96 object-cover transform hover:scale-105 transition-transform duration-500"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
          
          <!-- Badge de confianza -->
          <div class="absolute -bottom-6 -right-6 bg-white rounded-2xl p-5 shadow-xl">
            <div class="flex items-center gap-3">
              <div class="gradient-primary w-12 h-12 rounded-xl flex items-center justify-center">
                <span class="text-white text-lg">❤️</span>
              </div>
              <div>
                <p class="font-bold text-sm text-neutral-darkest">Cuidado certificado</p>
                <p class="text-xs text-neutral-medium">Profesionales verificados</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Marcas asociadas -->
  <section class="py-16 bg-neutral-light/50">
    <div class="container-narrow">
      <p class="text-center text-neutral-medium mb-12 text-lg">Confían en nosotros</p>
      <div class="grid grid-cols-2 md:grid-cols-5 gap-6">
        <div class="card text-center p-4 hover:shadow-lg transition-shadow">
          <span class="text-xl font-bold text-neutral-darkest">VetPlus</span>
        </div>
        <div class="card text-center p-4 hover:shadow-lg transition-shadow">
          <span class="text-xl font-bold text-neutral-darkest">PetCare</span>
        </div>
        <div class="card text-center p-4 hover:shadow-lg transition-shadow">
          <span class="text-xl font-bold text-neutral-darkest">AnimalLove</span>
        </div>
        <div class="card text-center p-4 hover:shadow-lg transition-shadow">
          <span class="text-xl font-bold text-neutral-darkest">PawFriends</span>
        </div>
        <div class="card text-center p-4 hover:shadow-lg transition-shadow">
          <span class="text-xl font-bold text-neutral-darkest">HappyPets</span>
        </div>
      </div>
    </div>
  </section>

  <!-- Servicios destacados -->
  <section class="section-padding">
    <div class="container-narrow">
      <div class="text-center mb-16">
        <h2 class="section-title mb-4">Servicios para cada necesidad</h2>
        <p class="section-subtitle">
          Desde cuidados básicos hasta servicios especializados, tenemos todo lo que tu mascota necesita.
        </p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Veterinaria -->
        <div class="card card-hover group p-6">
          <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-primary-mint/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <span class="text-primary text-2xl">🏥</span>
          </div>
          <h3 class="text-xl font-bold text-neutral-darkest mb-3">Veterinaria</h3>
          <p class="text-neutral-medium mb-4">Consultas, vacunación, emergencias y cuidados especializados para la salud de tu mascota.</p>
          <a href="#" class="text-primary font-medium flex items-center group-hover:translate-x-1 transition-transform duration-300">
            Ver más
            <span class="ml-2">→</span>
          </a>
        </div>
        
        <!-- Peluquería -->
        <div class="card card-hover group p-6">
          <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <span class="text-blue-500 text-2xl">✂️</span>
          </div>
          <h3 class="text-xl font-bold text-neutral-darkest mb-3">Peluquería</h3>
          <p class="text-neutral-medium mb-4">Baño, corte de pelo, cepillado y tratamientos estéticos para que tu mascota luzca increíble.</p>
          <a href="#" class="text-primary font-medium flex items-center group-hover:translate-x-1 transition-transform duration-300">
            Ver más
            <span class="ml-2">→</span>
          </a>
        </div>
        
        <!-- Guardería -->
        <div class="card card-hover group p-6">
          <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <span class="text-green-500 text-2xl">🏠</span>
          </div>
          <h3 class="text-xl font-bold text-neutral-darkest mb-3">Guardería</h3>
          <p class="text-neutral-medium mb-4">Espacios seguros y divertidos donde tu mascota estará cuidada mientras tú no estás.</p>
          <a href="#" class="text-primary font-medium flex items-center group-hover:translate-x-1 transition-transform duration-300">
            Ver más
            <span class="ml-2">→</span>
          </a>
        </div>
        
        <!-- Entrenamiento -->
        <div class="card card-hover group p-6">
          <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <span class="text-amber-600 text-2xl">🎯</span>
          </div>
          <h3 class="text-xl font-bold text-neutral-darkest mb-3">Entrenamiento</h3>
          <p class="text-neutral-medium mb-4">Programas de obediencia, socialización y corrección de comportamientos con expertos.</p>
          <a href="#" class="text-primary font-medium flex items-center group-hover:translate-x-1 transition-transform duration-300">
            Ver más
            <span class="ml-2">→</span>
          </a>
        </div>
      </div>
    </div>
  </section>

  <!-- CTA para negocios -->
  <section class="section-padding gradient-primary text-white relative overflow-hidden">
    <div class="absolute inset-0 opacity-10">
      <div class="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-white"></div>
      <div class="absolute top-1/4 -right-20 w-60 h-60 rounded-full bg-white"></div>
    </div>
    
    <div class="container-narrow relative z-10">
      <div class="grid lg:grid-cols-2 gap-16 items-center">
        <div class="space-y-8">
          <h2 class="text-4xl md:text-5xl font-bold">¿Tienes un negocio de mascotas?</h2>
          <p class="text-xl text-white/90 leading-relaxed">
            Únete a nuestra plataforma y llega a miles de dueños de mascotas que buscan servicios como el tuyo.
          </p>
          
          <!-- Beneficios -->
          <div class="space-y-6">
            <div class="flex items-start gap-4">
              <div class="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <span class="text-white">✓</span>
              </div>
              <div>
                <h4 class="font-semibold text-lg mb-2">Aumenta tu visibilidad</h4>
                <p class="text-white/80">Llega a más clientes en tu zona</p>
              </div>
            </div>
            
            <div class="flex items-start gap-4">
              <div class="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <span class="text-white">✓</span>
              </div>
              <div>
                <h4 class="font-semibold text-lg mb-2">Gestiona reservas fácilmente</h4>
                <p class="text-white/80">Sistema de citas automatizado</p>
              </div>
            </div>
            
            <div class="flex items-start gap-4">
              <div class="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <span class="text-white">✓</span>
              </div>
              <div>
                <h4 class="font-semibold text-lg mb-2">Recibe pagos seguros</h4>
                <p class="text-white/80">Múltiples métodos de pago</p>
              </div>
            </div>
          </div>
          
          <!-- Botones -->
          <div class="flex flex-col sm:flex-row gap-4 pt-6">
            <button class="bg-white text-primary-mint font-semibold py-4 px-8 rounded-xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              Registrar mi negocio
            </button>
            <button class="border-2 border-white text-white hover:bg-white hover:text-primary-mint transition-all duration-300 font-semibold py-4 px-8 rounded-xl">
              Más información
            </button>
          </div>
        </div>
        
        <!-- Imagen -->
        <div class="relative">
          <div class="relative rounded-3xl overflow-hidden shadow-2xl">
            <img
              src="https://images.pexels.com/photos/416160/pexels-photo-416160.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=400&w=500"
              alt="Registro comercio"
              class="w-full h-96 object-cover transform hover:scale-105 transition-transform duration-500"
            />
          </div>
          
          <!-- Badge de estadística -->
          <div class="absolute -bottom-6 -right-6 bg-white text-neutral-dark p-5 rounded-2xl shadow-xl">
            <div class="flex items-center gap-3">
              <div class="gradient-primary w-10 h-10 rounded-xl flex items-center justify-center">
                <span class="text-white">✓</span>
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
  </section>

  <!-- Testimonios -->
  <section class="section-padding bg-gradient-to-b from-white to-neutral-light/30">
    <div class="container-narrow">
      <div class="text-center mb-16">
        <h2 class="section-title mb-4">Lo que dicen nuestros clientes</h2>
        <p class="section-subtitle">Experiencias reales de dueños de mascotas que confían en nuestros servicios.</p>
      </div>
      
      <div class="grid md:grid-cols-3 gap-6">
        <!-- Testimonio 1 -->
        <div class="card card-hover p-6">
          <div class="flex items-center mb-4">
            <div class="w-12 h-12 rounded-full bg-gradient-to-br from-primary/10 to-primary-mint/10 flex items-center justify-center mr-4">
              <span class="text-primary font-bold">M</span>
            </div>
            <div>
              <h4 class="font-bold text-neutral-dark">María González</h4>
              <div class="flex text-amber-400">
                <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
              </div>
            </div>
          </div>
          <p class="text-neutral-medium italic">"Encontré el veterinario perfecto para mi gato Simba. La plataforma es muy fácil de usar y pude comparar precios y reseñas antes de decidirme."</p>
        </div>
        
        <!-- Testimonio 2 -->
        <div class="card card-hover p-6">
          <div class="flex items-center mb-4">
            <div class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center mr-4">
              <span class="text-blue-600 font-bold">C</span>
            </div>
            <div>
              <h4 class="font-bold text-neutral-dark">Carlos Rodríguez</h4>
              <div class="flex text-amber-400">
                <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
              </div>
            </div>
          </div>
          <p class="text-neutral-medium italic">"La guardería que encontré para mi perro Max es increíble. Tienen espacios amplios y personal calificado. ¡Max siempre vuelve feliz y cansado de jugar!"</p>
        </div>
        
        <!-- Testimonio 3 -->
        <div class="card card-hover p-6">
          <div class="flex items-center mb-4">
            <div class="w-12 h-12 rounded-full bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center mr-4">
              <span class="text-green-600 font-bold">A</span>
            </div>
            <div>
              <h4 class="font-bold text-neutral-dark">Ana Martínez</h4>
              <div class="flex text-amber-400">
                <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
              </div>
            </div>
          </div>
          <p class="text-neutral-medium italic">"Como peluquera canina, PetServices me ha permitido aumentar mi clientela en un 40%. La plataforma es intuitiva y me ayuda a gestionar mis citas eficientemente."</p>
        </div>
      </div>
    </div>
  </section>

  <!-- FAQ -->
  <section class="section-padding">
    <div class="container-narrow">
      <div class="text-center mb-16">
        <h2 class="section-title mb-4">Preguntas frecuentes</h2>
        <p class="section-subtitle">Resolvemos tus dudas sobre nuestros servicios</p>
      </div>
      
      <div class="space-y-4">
        <div class="card card-hover p-6">
          <h3 class="text-xl font-bold text-neutral-darkest mb-3">¿Cómo puedo reservar un servicio?</h3>
          <p class="text-neutral-medium">Simplemente busca el servicio que necesitas, selecciona el proveedor que prefieras, elige fecha y hora, y confirma tu reserva. Recibirás una confirmación inmediata.</p>
        </div>
        
        <div class="card card-hover p-6">
          <h3 class="text-xl font-bold text-neutral-darkest mb-3">¿Qué métodos de pago aceptan?</h3>
          <p class="text-neutral-medium">Aceptamos tarjetas de crédito y débito, transferencias bancarias y PayPal. Todos los pagos se procesan de forma segura a través de nuestra plataforma.</p>
        </div>
        
        <div class="card card-hover p-6">
          <h3 class="text-xl font-bold text-neutral-darkest mb-3">¿Puedo cancelar o modificar una reserva?</h3>
          <p class="text-neutral-medium">Sí, puedes cancelar o modificar tu reserva hasta 24 horas antes del servicio sin coste adicional. Después de ese plazo, pueden aplicarse cargos según la política del proveedor.</p>
        </div>
        
        <div class="card card-hover p-6">
          <h3 class="text-xl font-bold text-neutral-darkest mb-3">¿Cómo verifican a los proveedores?</h3>
          <p class="text-neutral-medium">Todos nuestros proveedores pasan por un riguroso proceso de verificación que incluye comprobación de licencias, seguros y referencias. Además, recopilamos y mostramos las valoraciones de otros usuarios.</p>
        </div>
      </div>
      
      <div class="text-center mt-12">
        <p class="text-neutral-medium mb-6">¿Tienes otra pregunta?</p>
        <button class="btn-primary text-lg px-8 py-4">
          Contactar con soporte
        </button>
      </div>
    </div>
  </section>

  <!-- CTA Final -->
  <section class="gradient-primary text-white rounded-3xl mx-6 mb-12 relative overflow-hidden">
    <div class="absolute inset-0 opacity-10">
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-white"></div>
    </div>
    
    <div class="container-narrow py-20 text-center relative z-10">
      <h2 class="text-4xl md:text-5xl font-bold mb-6">¿Listo para cuidar de tu mascota?</h2>
      <p class="text-xl mb-8 text-white/90 max-w-2xl mx-auto">Únete a miles de dueños de mascotas que ya confían en PetServices para el cuidado de sus compañeros.</p>
      <div class="flex flex-col sm:flex-row justify-center gap-4">
        <router-link to="/services" class="btn-outline bg-white text-primary-mint hover:bg-white/90">
          Explorar Servicios
        </router-link>
        <router-link to="/register" class="bg-white/20 backdrop-blur-sm border-2 border-white text-white hover:bg-white/30">
          Crear Cuenta
        </router-link>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="bg-neutral-darkest text-white py-16">
    <div class="container-wide">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div class="space-y-4">
          <div class="text-2xl font-bold text-primary-mint mb-4">🐾 PetServices</div>
          <p class="text-neutral-300">Cuidando de tus mascotas desde 2023 con servicios de calidad y profesionales verificados.</p>
          <div class="flex space-x-4">
            <a href="#" class="text-neutral-400 hover:text-white transition-colors">
              <span class="text-xl">📞</span>
            </a>
            <a href="#" class="text-neutral-400 hover:text-white transition-colors">
              <span class="text-xl">👍</span>
            </a>
            <a href="#" class="text-neutral-400 hover:text-white transition-colors">
              <span class="text-xl">👁️</span>
            </a>
          </div>
        </div>
        
        <div>
          <h3 class="font-bold text-lg mb-4">Servicios</h3>
          <ul class="space-y-2">
            <li><a href="#" class="text-neutral-300 hover:text-white transition-colors">Veterinaria</a></li>
            <li><a href="#" class="text-neutral-300 hover:text-white transition-colors">Peluquería</a></li>
            <li><a href="#" class="text-neutral-300 hover:text-white transition-colors">Guardería</a></li>
            <li><a href="#" class="text-neutral-300 hover:text-white transition-colors">Entrenamiento</a></li>
            <li><a href="#" class="text-neutral-300 hover:text-white transition-colors">Paseadores</a></li>
          </ul>
        </div>
        
        <div>
          <h3 class="font-bold text-lg mb-4">Empresa</h3>
          <ul class="space-y-2">
            <li><a href="#" class="text-neutral-300 hover:text-white transition-colors">Sobre nosotros</a></li>
            <li><a href="#" class="text-neutral-300 hover:text-white transition-colors">Trabaja con nosotros</a></li>
            <li><a href="#" class="text-neutral-300 hover:text-white transition-colors">Para negocios</a></li>
            <li><a href="#" class="text-neutral-300 hover:text-white transition-colors">Blog</a></li>
            <li><a href="#" class="text-neutral-300 hover:text-white transition-colors">Prensa</a></li>
          </ul>
        </div>
        
        <div>
          <h3 class="font-bold text-lg mb-4">Soporte</h3>
          <ul class="space-y-2">
            <li><a href="#" class="text-neutral-300 hover:text-white transition-colors">Centro de ayuda</a></li>
            <li><a href="#" class="text-neutral-300 hover:text-white transition-colors">Contacto</a></li>
            <li><a href="#" class="text-neutral-300 hover:text-white transition-colors">Política de privacidad</a></li>
            <li><a href="#" class="text-neutral-300 hover:text-white transition-colors">Términos de servicio</a></li>
            <li><a href="#" class="text-neutral-300 hover:text-white transition-colors">Cookies</a></li>
          </ul>
        </div>
      </div>
      
      <div class="border-t border-neutral-800 mt-12 pt-8 text-center text-neutral-400">
        <p>© 2025 PetServices. Todos los derechos reservados.</p>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: "LandingPage",
  mounted() {
    // Animaciones de aparición
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    // Observar elementos con animación
    document.querySelectorAll('.card, .section-title, .section-subtitle').forEach((el) => {
      observer.observe(el);
    });
  }
};
</script>

<style scoped>
/* Animaciones */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.6s ease-out forwards;
}

/* Estilos específicos para esta página */
.card {
  @apply transition-all duration-300 hover:shadow-xl hover:-translate-y-1;
}

.btn-primary {
  @apply hover:-translate-y-0.5 transition-transform duration-300;
}

.btn-outline {
  @apply hover:-translate-y-0.5 transition-transform duration-300;
}

/* Gradientes personalizados */
.gradient-primary {
  @apply bg-gradient-to-br from-primary-mint to-teal-500;
}

.gradient-secondary {
  @apply bg-gradient-to-br from-blue-400 to-cyan-400;
}

/* Espaciado consistente */
.section-padding {
  @apply py-16 md:py-24;
}

.container-narrow {
  @apply max-w-6xl mx-auto px-4 sm:px-6 lg:px-8;
}

.container-wide {
  @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
}
</style>