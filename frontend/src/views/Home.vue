<template>
  <Layout>
    <!-- Bienvenida -->
    <section class="mb-8">
      <h1 class="text-3xl font-bold text-primary">¡Bienvenido a PetServices! 🐾</h1>
      <p class="text-neutral-dark mt-2">
        Aquí podrás gestionar tus mascotas, citas y servicios de forma fácil y rápida.
      </p>
    </section>

    <!-- Accesos rápidos -->
    <section class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      <router-link 
        to="/services" 
        class="bg-secondary text-white rounded-2xl p-6 shadow hover:bg-secondary-dark transition flex items-center justify-center text-lg font-semibold"
      >
        🛠 Ver Servicios
      </router-link>

      <router-link 
  to="/pets" 
  class="bg-primary-mint text-white rounded-2xl p-6 shadow hover:bg-secondary-dark transition flex items-center justify-center text-lg font-semibold"
>
  🐶 Mis Mascotas
</router-link>

      <router-link 
        to="/appointments" 
        class="bg-secondary text-white rounded-2xl p-6 shadow hover:opacity-90 transition flex items-center justify-center text-lg font-semibold"
      >
        📅 Mis Citas
      </router-link>
    </section>

    <!-- Servicios destacados -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold text-neutral-dark mb-4">Servicios destacados</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ServiceCard 
          title="Veterinaria"
          description="Consulta médica y vacunación para tus mascotas."
          image="https://placehold.co/400x200?text=Veterinaria"
        />
        <ServiceCard 
          title="Peluquería"
          description="Corte, baño y cuidado estético de tus mascotas."
          image="https://placehold.co/400x200?text=Peluqueria"
        />
        <ServiceCard 
          title="Guardería"
          description="Cuidado seguro para tu mascota cuando lo necesites."
          image="https://placehold.co/400x200?text=Guarderia"
        />
      </div>
    </section>

    <!-- Próximas citas -->
    <section>
      <h2 class="text-2xl font-bold text-neutral-dark mb-4">Próximas Citas</h2>
      <div class="bg-neutral-light shadow-md rounded-2xl p-6">
        <ul class="divide-y divide-neutral-medium">
          <li class="py-3 flex justify-between items-center">
            <span>Consulta Veterinaria - Firulais</span>
            <span class="text-sm text-neutral-medium">25 Ago, 10:00 AM</span>
          </li>
          <li class="py-3 flex justify-between items-center">
            <span>Peluquería - Michi</span>
            <span class="text-sm text-neutral-medium">28 Ago, 4:00 PM</span>
          </li>
          <li class="py-3 flex justify-between items-center text-neutral-medium italic">
            <span>Más citas próximamente...</span>
          </li>
        </ul>
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
  components: { Layout, ServiceCard, Chatbot }
};
</script>
