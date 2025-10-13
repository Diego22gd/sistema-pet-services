<template>
  <div class="min-h-screen flex flex-col bg-neutral-bg pt-24">
    <!-- Navbar fijo -->
    <header
      class="fixed top-0 left-0 right-0 w-full z-50 bg-primary-mint text-white flex justify-between items-center py-4 shadow-md"
    >
      <div class="text-2xl font-bold px-6">🐾 PetServices</div>
      <nav class="px-6">
        <router-link
          to="/login"
          class="btn-secondary px-4 py-2 text-white rounded-lg shadow hover:bg-secondary-dark transition"
        >
          Login
        </router-link>
      </nav>
    </header>

    <!-- Hero -->
  <section
  class="pt-16 pb-16 px-6 md:px-20 bg-primary-mint text-white rounded-b-3xl rounded-t-3xl flex flex-col md:flex-row items-center justify-between"
>
  <div class="md:w-1/2 mb-10 md:mb-0">
    <h1 class="text-4xl md:text-5xl font-bold mb-4 text-white">
      Encuentra los mejores servicios para tus mascotas 🐶🐱
    </h1>
    <p class="text-lg mb-6">
      Veterinarias, peluquerías, guarderías y más, todo en un solo lugar con
      la máxima confianza.
    </p>
    <router-link to="/services" class="btn-primary text-lg">
      Ver Servicios
    </router-link>
  </div>
  <div class="md:w-1/2 flex justify-center">
    <img
      src="https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=300&w=400"
      alt="Mascotas felices"
      class="rounded-2xl shadow-lg animate-fadeIn w-full max-w-md"
      style="height: 305px; object-fit: cover;"
    />
  </div>
</section>



    <!-- Primera Card con imagen a la derecha -->
    <section class="px-6 md:px-20 py-16 mt-12">
      <div class="bg-secondary-light rounded-t-3xl rounded-b-2xl p-6 md:p-10 shadow-md fade-up flex flex-col md:flex-row items-center justify-between">
        <div class="md:w-1/2">
          <h2 class="text-2xl font-bold text-neutral-dark mb-4">
            Registra tu comercio
          </h2>
          <p class="text-neutral-medium mb-6">
            Afila tu negocio y forma parte de nuestra red de servicios para mascotas.
          </p>
          <button class="btn-secondary">Registrar Ahora</button>
        </div>
        <div class="md:w-1/2 flex justify-center mt-6 md:mt-0">
          <img
            src="https://images.pexels.com/photos/416160/pexels-photo-416160.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=200&w=300"
            alt="Registro comercio"
            class="rounded-xl shadow-lg w-full max-w-sm object-cover"
          />
        </div>
      </div>
    </section>

    <!-- Cards info con imágenes -->
    <section class="px-6 md:px-20 py-16 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-primary-light p-6 rounded-2xl shadow fade-up text-neutral-dark">
        <img
          src="https://images.pexels.com/photos/461428/pexels-photo-461428.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=160&w=300"
          alt="Pagar más fácil"
          class="w-full h-40 object-cover rounded-xl mb-4"
        />
        <h3 class="font-semibold text-lg mb-2">Pagar es más fácil</h3>
        <p>Métodos de pago confiables y rápidos.</p>
      </div>

      <div class="bg-secondary-light p-6 rounded-2xl shadow fade-up text-neutral-dark">
        <img
          src="https://images.pexels.com/photos/374906/pexels-photo-374906.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=160&w=300"
          alt="Rastrea tus servicios"
          class="w-full h-40 object-cover rounded-xl mb-4"
        />
        <h3 class="font-semibold text-lg mb-2">Rastrea tus servicios</h3>
        <p>Sigue tus reservas en tiempo real.</p>
      </div>

      <div class="bg-primary-mint-light p-6 rounded-2xl shadow fade-up text-white">
        <img
          src="https://images.pexels.com/photos/356378/pexels-photo-356378.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=160&w=300"
          alt="+30 categorías"
          class="w-full h-40 object-cover rounded-xl mb-4"
        />
        <h3 class="font-semibold text-lg mb-2">+30 categorías</h3>
        <p>Más opciones para tus mascotas.</p>
      </div>
    </section>

    <!-- Card de equipo con imagen -->
    <section class="px-6 md:px-20 py-16">
      <div class="bg-secondary-light rounded-2xl p-6 md:p-10 shadow-md fade-up flex flex-col md:flex-row items-center justify-between">
        <div class="md:w-1/2 mb-6 md:mb-0">
          <h2 class="text-2xl font-bold text-neutral-dark mb-4">
            Conviértete en parte del equipo
          </h2>
          <p class="text-neutral-medium mb-4">
            Únete y forma parte de los mejores servicios para mascotas.
          </p>
          <button class="btn-secondary">Aplicar Ahora</button>
        </div>
        <div class="md:w-1/2 flex justify-center">
          <img
            src="https://images.pexels.com/photos/104827/cat-pet-animal-domestic-104827.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=200&w=200"
            alt="Repartidor"
            class="rounded-xl shadow-lg w-44 h-44 object-cover"
          />
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-neutral-light text-neutral-medium py-6 text-center mt-auto">
      © 2025 PetServices - Todos los derechos reservados
    </footer>
  </div>
</template>

<script>
export default {
  name: "LandingPage",
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

<style>
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

/* Botones */
.btn-primary { background-color: #3EB489; color: #fff; padding: .5rem 1.25rem; border-radius: .75rem; box-shadow: 0 6px 18px rgba(62,180,137,0.12); }
.btn-primary:hover { background-color: #66caa1; }
.btn-secondary { background-color: #A3E1F0; color: #17323b; padding: .5rem 1.25rem; border-radius: .75rem; box-shadow: 0 6px 18px rgba(163,225,240,0.12); }
.btn-secondary:hover { background-color: #7fd1b9; }
</style>
