<template>
  <div class="flex flex-col min-h-screen">
    <!-- Header arriba -->
    <Header />

    <!-- Contenido principal -->
    <main class="flex-1 p-6 bg-gray-50">
      <slot /> <!-- Aquí se renderizan las vistas -->
    </main>

    <!-- Footer abajo -->
    <Footer />
  </div>
</template>

<script>
import Header from './Header.vue'
import Footer from './Footer.vue'

export default {
  name: "Layout",
  components: { Header, Footer }
}
</script>
