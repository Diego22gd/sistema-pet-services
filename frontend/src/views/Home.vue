<template>
  <Layout>
    <!-- Hero Section Nextly -->
    <section class="relative overflow-hidden bg-gradient-to-br from-neutral-light via-white to-primary/5 py-20 md:py-28">
      <div class="container-narrow text-center relative z-10">
        <!-- Gradiente decorativo -->
        <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-70"></div>
        <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl opacity-50"></div>
        
        <h1 class="text-5xl md:text-7xl font-bold mb-8 leading-tight">
          Cuidamos a tus 
          <span class="bg-gradient-to-r from-primary to-primary-mint bg-clip-text text-transparent">
            mascotas
          </span> 
          como tú
        </h1>
        <p class="text-xl md:text-2xl text-neutral-medium mb-12 max-w-3xl mx-auto leading-relaxed">
          Servicios veterinarios premium, peluquería especializada y guardería de confianza 
          para el bienestar integral de tu mejor amigo.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <router-link to="/services" class="btn-primary group">
            <span class="flex items-center">
              Explorar Servicios
              <svg class="ml-3 w-5 h-5 transform group-hover:translate-x-1 transition-transform" 
                   fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
              </svg>
            </span>
          </router-link>
          <router-link to="/appointments" class="btn-outline group">
            <span class="flex items-center">
              Ver Mis Citas
              <svg class="ml-3 w-5 h-5 transform group-hover:translate-x-1 transition-transform" 
                   fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </span>
          </router-link>
        </div>
        
        <!-- Stats mini -->
        <div class="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
          <div class="text-center">
            <div class="text-3xl font-bold text-primary">1,500+</div>
            <div class="text-sm text-neutral-medium">Mascotas felices</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-secondary">98%</div>
            <div class="text-sm text-neutral-medium">Satisfacción</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-state-success">50+</div>
            <div class="text-sm text-neutral-medium">Servicios</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-primary-mint">24/7</div>
            <div class="text-sm text-neutral-medium">Atención</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Accesos rápidos - Estilo Nextly -->
    <section class="section-padding">
      <div class="container-narrow">
        <div class="text-center mb-12">
          <h2 class="section-title">Acceso Rápido</h2>
          <p class="section-subtitle">
            Gestiona todo lo relacionado con tus mascotas en un solo lugar
          </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <router-link 
            to="/services" 
            class="group card card-hover p-8 text-center"
          >
            <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl mb-6">
              <span class="text-4xl">🛠</span>
            </div>
            <h3 class="text-xl font-bold text-neutral-darkest mb-3">Servicios</h3>
            <p class="text-neutral-medium mb-4">
              Descubre todos nuestros servicios veterinarios y de cuidado disponibles
            </p>
            <span class="text-primary font-semibold inline-flex items-center gap-2 group-hover:gap-3 transition-all">
              Explorar
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </span>
          </router-link>

          <router-link 
            to="/pets" 
            class="group gradient-primary text-white rounded-2xl p-8 shadow-card card-hover text-center"
          >
            <div class="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-2xl mb-6 backdrop-blur-sm">
              <span class="text-4xl">🐶</span>
            </div>
            <h3 class="text-xl font-bold mb-3">Mis Mascotas</h3>
            <p class="text-primary-light/90 mb-4">
              Gestiona el perfil, historial médico y preferencias de tus mascotas
            </p>
            <span class="text-white font-semibold inline-flex items-center gap-2 group-hover:gap-3 transition-all">
              Administrar
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </span>
          </router-link>

          <router-link 
            to="/appointments" 
            class="group gradient-secondary text-white rounded-2xl p-8 shadow-card card-hover text-center"
          >
            <div class="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-2xl mb-6 backdrop-blur-sm">
              <span class="text-4xl">📅</span>
            </div>
            <h3 class="text-xl font-bold mb-3">Mis Citas</h3>
            <p class="text-secondary-light/90 mb-4">
              Revisa, agenda y gestiona todas tus citas programadas
            </p>
            <span class="text-white font-semibold inline-flex items-center gap-2 group-hover:gap-3 transition-all">
              Ver agenda
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </span>
          </router-link>
        </div>
      </div>
    </section>

    <!-- Servicios destacados - Estilo Nextly -->
    <section class="section-padding bg-gradient-to-b from-white to-neutral-light/30">
      <div class="container-narrow">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div>
            <h2 class="section-title mb-3">Servicios Destacados</h2>
            <p class="section-subtitle max-w-2xl">
              Los servicios más populares y mejor valorados por nuestra comunidad de amantes de mascotas
            </p>
          </div>
          <router-link 
            to="/services" 
            class="btn-outline group mt-4 md:mt-0"
          >
            <span class="flex items-center">
              Ver todos los servicios
              <svg class="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform" 
                   fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </span>
          </router-link>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <ServiceCard 
            title="Veterinaria Integral"
            description="Consulta médica completa, diagnóstico avanzado, vacunación y cuidados preventivos para la salud óptima de tu mascota."
            image="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800"
            :features="['Consulta especializada', 'Vacunación completa', 'Diagnóstico por imagen', 'Urgencias 24/7']"
            icon="🏥"
            price="Desde 35€"
            badge="Más popular"
          />
          <ServiceCard 
            title="Peluquería & Spa"
            description="Corte profesional adaptado a cada raza, baño con productos naturales y cuidado estético premium para el bienestar de tu mascota."
            image="https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?auto=format&fit=crop&w=800"
            :features="['Corte de raza específica', 'Baño terapéutico', 'Corte de uñas', 'Limpieza dental']"
            icon="✂️"
            price="Desde 25€"
            badge="Nuevo"
          />
          <ServiceCard 
            title="Guardería Premium"
            description="Cuidado seguro, espacios de juego diseñados y atención personalizada para que tu mascota disfrute mientras tú no estás."
            image="https://images.unsplash.com/photo-1554456854-55a089fd4cb2?auto=format&fit=crop&w=800"
            :features="['Guardería diaria', 'Paseos personalizados', 'Alimentación especial', 'Reporte diario']"
            icon="🏠"
            price="Desde 15€/día"
            badge="Recomendado"
          />
        </div>
      </div>
    </section>

    <!-- Próximas citas - Estilo Nextly -->
    <section class="section-padding">
      <div class="container-narrow">
        <div class="text-center mb-12">
          <h2 class="section-title">Próximas Citas</h2>
          <p class="section-subtitle">
            Mantén el control de las próximas citas programadas para tus mascotas
          </p>
        </div>
        
        <div class="glass-card overflow-hidden">
          <div class="card-header">
            <div class="flex justify-between items-center">
              <h3 class="text-xl font-semibold text-neutral-darkest">
                Citas Programadas
              </h3>
              <div class="flex items-center gap-3">
                <span class="badge badge-success">
                  <span class="w-2 h-2 bg-state-success rounded-full mr-2"></span>
                  2 próximas
                </span>
                <router-link to="/appointments/new" class="text-sm text-primary font-semibold hover:underline">
                  + Nueva cita
                </router-link>
              </div>
            </div>
          </div>
          
          <div class="divide-y divide-neutral-100">
            <div v-for="appointment in appointments" 
                 :key="appointment.id"
                 class="group appointment-item">
              <div class="flex items-center gap-4">
                <div class="appointment-item-icon">
                  {{ appointment.icon }}
                </div>
                <div class="flex-1">
                  <div class="flex items-start justify-between">
                    <div>
                      <h4 class="font-semibold text-neutral-darkest group-hover:text-primary transition-colors">
                        {{ appointment.title }}
                      </h4>
                      <p class="text-sm text-neutral-medium mt-1">
                        {{ appointment.pet }} • {{ appointment.description }}
                      </p>
                    </div>
                    <div class="text-right">
                      <div class="font-semibold text-neutral-darkest">{{ appointment.date }}</div>
                      <div class="text-sm text-primary font-medium">{{ appointment.location }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="card-footer">
            <router-link 
              to="/appointments" 
              class="flex justify-center items-center text-primary font-semibold hover:text-primary-dark transition-colors group"
            >
              <span>Ver todas las citas programadas</span>
              <svg class="ml-3 w-5 h-5 transform group-hover:translate-x-1 transition-transform" 
                   fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- Estadísticas - Estilo Nextly -->
    <section class="section-padding bg-gradient-to-br from-primary/5 via-white to-secondary/5">
      <div class="container-narrow">
        <div class="text-center mb-12">
          <h2 class="section-title">Confían en Nosotros</h2>
          <p class="section-subtitle">
            Más de 5 años brindando cuidado y amor a las mascotas de nuestra comunidad
          </p>
        </div>
        
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div class="card text-center p-8 card-hover">
            <div class="text-5xl font-bold text-primary mb-3">1,500+</div>
            <div class="text-neutral-darkest font-semibold mb-2">Mascotas Felices</div>
            <p class="text-sm text-neutral-medium">
              Familias que confían en nuestro cuidado
            </p>
          </div>
          
          <div class="card text-center p-8 card-hover">
            <div class="text-5xl font-bold text-secondary mb-3">98%</div>
            <div class="text-neutral-darkest font-semibold mb-2">Satisfacción</div>
            <p class="text-sm text-neutral-medium">
              Clientes recomiendan nuestros servicios
            </p>
          </div>
          
          <div class="card text-center p-8 card-hover">
            <div class="text-5xl font-bold text-state-success mb-3">50+</div>
            <div class="text-neutral-darkest font-semibold mb-2">Servicios</div>
            <p class="text-sm text-neutral-medium">
              Soluciones integrales para mascotas
            </p>
          </div>
          
          <div class="card text-center p-8 card-hover">
            <div class="text-5xl font-bold text-primary-mint mb-3">5+</div>
            <div class="text-neutral-darkest font-semibold mb-2">Años</div>
            <p class="text-sm text-neutral-medium">
              De experiencia y dedicación
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Final -->
    <section class="section-padding">
      <div class="container-narrow">
        <div class="gradient-primary rounded-3xl p-12 text-center text-white">
          <h2 class="text-4xl font-bold mb-6">
            ¿Listo para darle lo mejor a tu mascota?
          </h2>
          <p class="text-xl text-primary-light mb-10 max-w-2xl mx-auto">
            Únete a nuestra comunidad de amantes de mascotas y descubre una nueva forma de cuidar a tu mejor amigo.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <router-link to="/register" class="btn-outline bg-white text-primary hover:bg-white/90">
              Crear Cuenta Gratis
            </router-link>
            <router-link to="/services" class="bg-white/20 backdrop-blur-sm border-2 border-white text-white hover:bg-white/30">
              Explorar Servicios
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <Chatbot />
  </Layout>
</template>

<script>
import Layout from "@/components/Layout.vue";
import ServiceCard from "@/components/ServiceCard.vue";
import Chatbot from "@/components/Chatbot.vue";

export default {
  name: "Home",
  components: { Layout, ServiceCard, Chatbot },
  data() {
    return {
      appointments: [
        {
          id: 1,
          title: "Consulta Veterinaria Integral",
          pet: "Firulais (Golden Retriever)",
          description: "Control anual de salud y vacunación",
          date: "25 Ago, 10:00 AM",
          location: "Clínica Central - Sala 3",
          type: "vet",
          icon: "🐕"
        },
        {
          id: 2,
          title: "Spa & Peluquería Completa",
          pet: "Michi (Gato Persa)",
          description: "Corte de raza, baño terapéutico y cuidado de uñas",
          date: "28 Ago, 4:00 PM",
          location: "Spa Pet - Estación Premium",
          type: "grooming",
          icon: "🐱"
        },
        {
          id: 3,
          title: "Día de Guardería",
          pet: "Toby (Border Collie)",
          description: "Guardería diurna con actividades",
          date: "30 Ago, 9:00 AM",
          location: "Guardería Premium",
          type: "daycare",
          icon: "🏠"
        }
      ]
    }
  }
}
</script>

<style scoped>
/* Estilos específicos para esta página */
.section-title {
  @apply text-4xl md:text-5xl font-bold text-neutral-darkest mb-4 tracking-tight;
}

.section-subtitle {
  @apply text-lg text-neutral-medium mb-8 max-w-2xl;
}

/* Animaciones suaves para elementos */
.card-hover {
  @apply transition-all duration-300 hover:-translate-y-1 hover:shadow-xl;
}

/* Estilos para el gradiente de texto */
.gradient-text {
  @apply bg-gradient-to-r from-primary to-primary-mint bg-clip-text text-transparent;
}
</style>