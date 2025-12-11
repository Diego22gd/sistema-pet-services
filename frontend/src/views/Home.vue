<template>
  <Layout>
    <!-- Bienvenida - Usando clases de tipografía y utilidad de Bootstrap -->
    <section class="mb-5">
      <h1 class="display-4 fw-bold text-primary mb-3">¡Bienvenido a PetServices! 🐾</h1>
      <p class="fs-5 text-muted">
        Aquí podrás gestionar tus mascotas, citas y servicios de forma fácil y rápida.
      </p>
    </section>

    <!-- Accesos rápidos - Usando el sistema de grid de Bootstrap -->
    <section class="row row-cols-1 row-cols-md-3 g-4 mb-5">
      <div class="col">
        <router-link
          to="/services"
          class="card bg-gradient-primary border-0 text-white shadow-lg hover-shadow text-decoration-none h-100"
        >
          <div class="card-body d-flex flex-column justify-content-center align-items-center p-5">
            <div class="icon-shape icon-shape-lg bg-white text-primary rounded-circle mb-3">
              <i class="fas fa-tools fa-2x"></i> <!-- Icono de Font Awesome -->
            </div>
            <h5 class="card-title h4">🛠 Ver Servicios</h5>
          </div>
        </router-link>
      </div>

      <div class="col">
        <router-link
          to="/pets"
          class="card bg-gradient-info border-0 text-white shadow-lg hover-shadow text-decoration-none h-100"
        >
          <div class="card-body d-flex flex-column justify-content-center align-items-center p-5">
            <div class="icon-shape icon-shape-lg bg-white text-info rounded-circle mb-3">
              <i class="fas fa-paw fa-2x"></i>
            </div>
            <h5 class="card-title h4">🐶 Mis Mascotas</h5>
          </div>
        </router-link>
      </div>

      <div class="col">
        <router-link
          to="/appointments"
          class="card bg-gradient-success border-0 text-white shadow-lg hover-shadow text-decoration-none h-100"
        >
          <div class="card-body d-flex flex-column justify-content-center align-items-center p-5">
            <div class="icon-shape icon-shape-lg bg-white text-success rounded-circle mb-3">
              <i class="fas fa-calendar-alt fa-2x"></i>
            </div>
            <h5 class="card-title h4">📅 Mis Citas</h5>
          </div>
        </router-link>
      </div>
    </section>

    <!-- Servicios destacados -->
    <section class="mb-5">
      <h2 class="h2 fw-bold text-dark mb-4">Servicios destacados</h2>
      <div class="row row-cols-1 row-cols-md-3 g-4">
        <div class="col">
          <ServiceCard
            title="Veterinaria"
            description="Consulta médica y vacunación para tus mascotas."
            image="https://placehold.co/400x200?text=Veterinaria"
            icon="fas fa-stethoscope"
            color="primary"
          />
        </div>
        <div class="col">
          <ServiceCard
            title="Peluquería"
            description="Corte, baño y cuidado estético de tus mascotas."
            image="https://placehold.co/400x200?text=Peluqueria"
            icon="fas fa-cut"
            color="info"
          />
        </div>
        <div class="col">
          <ServiceCard
            title="Guardería"
            description="Cuidado seguro para tu mascota cuando lo necesites."
            image="https://placehold.co/400x200?text=Guarderia"
            icon="fas fa-home"
            color="success"
          />
        </div>
      </div>
    </section>

    <!-- Próximas citas - Usando componentes de lista de Bootstrap -->
    <section>
      <h2 class="h2 fw-bold text-dark mb-4">Próximas Citas</h2>
      <div class="card border-0 shadow">
        <div class="card-body p-0">
          <ul class="list-group list-group-flush">
            <li class="list-group-item d-flex justify-content-between align-items-center py-3">
              <div>
                <i class="fas fa-calendar-check text-primary me-3"></i>
                <span class="fw-bold">Consulta Veterinaria - Firulais</span>
              </div>
              <span class="badge bg-primary rounded-pill">25 Ago, 10:00 AM</span>
            </li>
            <li class="list-group-item d-flex justify-content-between align-items-center py-3">
              <div>
                <i class="fas fa-cut text-info me-3"></i>
                <span class="fw-bold">Peluquería - Michi</span>
              </div>
              <span class="badge bg-info rounded-pill">28 Ago, 4:00 PM</span>
            </li>
            <li class="list-group-item text-center py-3 text-muted fst-italic">
              <i class="fas fa-plus me-2"></i>Más citas próximamente...
            </li>
          </ul>
        </div>
      </div>
    </section>
    <Chatbot />
  </Layout>
</template>

<script>
import Layout from "@/components/Layout.vue";
import ServiceCard from "@/components/ServiceCard.vue";

export default {
  name: "Home",
  components: { Layout, ServiceCard }
};
</script>