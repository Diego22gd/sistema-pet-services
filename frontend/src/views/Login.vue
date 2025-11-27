<template>
  <div class="min-h-screen flex flex-col bg-neutral-bg pt-24">
    <!-- HEADER MEJORADO -->
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
              to="/"
              class="bg-white text-primary-mint px-4 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex items-center space-x-2 hover:bg-neutral-light"
            >
              <span>Volver al Inicio</span>
            </router-link>
          </nav>
        </div>
      </div>

      <!-- Línea decorativa inferior -->
      <div class="h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
    </header>

    <!-- Resto del código del login se mantiene igual -->
    <div class="flex justify-center items-center flex-grow px-4 pt-24">
      <div class="bg-white p-8 rounded-2xl shadow-lg w-full max-w-lg">
        <h2 class="text-3xl font-bold text-primary text-center mb-6">Iniciar Sesión</h2>

        <form @submit.prevent="handleLogin">
          <div class="mb-4">
            <label class="block text-neutral-dark mb-1">Correo electrónico</label>
            <input
              v-model="email"
              type="email"
              placeholder="ejemplo@email.com"
              class="w-full px-4 py-2 border border-neutral-medium rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
              required
            />
          </div>

          <div class="mb-6">
            <label class="block text-neutral-dark mb-1">Contraseña</label>
            <input
              v-model="password"
              type="password"
              placeholder="********"
              class="w-full px-4 py-2 border border-neutral-medium rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            class="w-full bg-primary-mint text-white font-bold py-3 rounded-lg hover:bg-state-success transition transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
          >
            Entrar
          </button>

          <p v-if="errors.general" class="text-red-500 text-sm mt-2 text-center">
            {{ errors.general }}
          </p>
        </form>

        <!-- Botones de registro mejorados -->
        <div class="text-center text-neutral-medium mt-6 space-y-4">
          <button
            @click="showRegisterClient = true"
            class="w-full bg-secondary text-white px-6 py-3 rounded-lg font-semibold hover:bg-secondary-dark transition transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
          >
            <span>🐶</span>
            <span>Registrarse como Cliente</span>
          </button>
          <button
            @click="showRegisterProvider = true"
            class="w-full bg-primary-mint text-white px-6 py-3 rounded-lg font-semibold hover:bg-state-success transition transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
          >
            <span>🏥</span>
            <span>Registrarse como Proveedor</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Los modales y footer se mantienen igual -->
    <div v-if="showRegisterClient" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-8 rounded-2xl shadow-lg w-full max-w-2xl relative overflow-y-auto max-h-[90vh]">
        <button @click="showRegisterClient = false" class="absolute top-3 right-3 text-neutral-medium hover:text-neutral-dark">
          ✖
        </button>

        <h2 class="text-2xl font-bold text-primary mb-6 text-center">Registro de Cliente</h2>

        <form @submit.prevent="handleRegisterClient">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-neutral-dark mb-1">Nombre</label>
              <input v-model="clientForm.name" type="text" class="input" placeholder="Juan" required />
            </div>
            <div>
              <label class="block text-neutral-dark mb-1">Apellido</label>
              <input v-model="clientForm.lastname" type="text" class="input" placeholder="Pérez" required />
            </div>
            <div>
              <label class="block text-neutral-dark mb-1">Correo electrónico</label>
              <input v-model="clientForm.email" type="email" class="input" placeholder="email@ejemplo.com" required />
            </div>
            <div>
              <label class="block text-neutral-dark mb-1">Teléfono</label>
              <input v-model="clientForm.phone" type="tel" class="input" placeholder="+58 412 1234567" />
            </div>
          </div>

          <div class="mt-4">
            <label class="block text-neutral-dark mb-1">Contraseña</label>
            <input v-model="clientForm.password" type="password" class="input" placeholder="********" required />
          </div>

          <p v-if="errors.general" class="text-red-500 text-sm mt-2 text-center">{{ errors.general }}</p>
          <p v-if="successMessage" class="text-green-600 font-semibold text-center mt-2">{{ successMessage }}</p>

          <button type="submit" class="w-full bg-secondary text-white font-bold py-3 mt-6 rounded-lg hover:bg-secondary-dark transition transform hover:-translate-y-0.5">
            Registrarme
          </button>
        </form>
      </div>
    </div>

    <div v-if="showRegisterProvider" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-8 rounded-2xl shadow-lg w-full max-w-2xl relative overflow-y-auto max-h-[90vh]">
        <button @click="showRegisterProvider = false" class="absolute top-3 right-3 text-neutral-medium hover:text-neutral-dark">
          ✖
        </button>

        <h2 class="text-2xl font-bold text-primary mb-6 text-center">Registro de Proveedor</h2>

        <form @submit.prevent="handleRegisterProvider">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-neutral-dark mb-1">Nombre</label>
              <input v-model="providerForm.name" type="text" class="input" placeholder="Carlos" required />
            </div>
            <div>
              <label class="block text-neutral-dark mb-1">Apellido</label>
              <input v-model="providerForm.lastname" type="text" class="input" placeholder="Gómez" required />
            </div>
            <div>
              <label class="block text-neutral-dark mb-1">Correo electrónico</label>
              <input v-model="providerForm.email" type="email" class="input" placeholder="email@ejemplo.com" required />
            </div>
            <div>
              <label class="block text-neutral-dark mb-1">Teléfono</label>
              <input v-model="providerForm.phone" type="tel" class="input" placeholder="+58 414 7654321" />
            </div>
          </div>

          <div class="mt-4">
            <label class="block text-neutral-dark mb-1">Nombre del Negocio</label>
            <input v-model="providerForm.businessName" type="text" class="input" placeholder="Veterinaria Patitas Felices" />
          </div>

          <div class="mt-4">
            <label class="block text-neutral-dark mb-1">Tipo de Servicio</label>
            <select v-model="providerForm.serviceType" class="input">
              <option disabled value="">Selecciona una opción</option>
              <option>Veterinaria</option>
              <option>Peluquería</option>
              <option>Guardería</option>
              <option>Tienda de mascotas</option>
              <option>Adiestramiento</option>
            </select>
          </div>

          <div class="mt-4">
            <label class="block text-neutral-dark mb-1">Contraseña</label>
            <input v-model="providerForm.password" type="password" class="input" placeholder="********" required />
          </div>

          <p v-if="errors.general" class="text-red-500 text-sm mt-2 text-center">{{ errors.general }}</p>
          <p v-if="successMessage" class="text-green-600 font-semibold text-center mt-2">{{ successMessage }}</p>

          <button type="submit" class="w-full bg-primary-mint text-white font-bold py-3 mt-6 rounded-lg hover:bg-state-success transition transform hover:-translate-y-0.5">
            Registrarme
          </button>
        </form>
      </div>
    </div>

    <footer class="bg-neutral-light text-neutral-medium py-6 text-center mt-auto">
      © 2025 PetServices - Todos los derechos reservados
    </footer>
  </div>
</template>

<script setup>
import { useUserStore } from "@/stores/userStore";
import { useRouter } from "vue-router";
import { ref, reactive } from "vue";

const router = useRouter();
const userStore = useUserStore();

const email = ref("");
const password = ref("");

const showRegisterClient = ref(false);
const showRegisterProvider = ref(false);

const successMessage = ref("");
const errors = reactive({});

// formularios
const clientForm = reactive({
  name: "",
  lastname: "",
  email: "",
  phone: "",
  password: "",
});

const providerForm = reactive({
  name: "",
  lastname: "",
  email: "",
  phone: "",
  password: "",
  businessName: "",
  serviceType: "",
});

// login
async function handleLogin() {
  errors.general = "";
  try {
    await userStore.login(email.value, password.value);
    userStore.redirectByRole(router);
  } catch (err) {
    errors.general = err.message || "Error al iniciar sesión";
  }
}

// registro cliente
async function handleRegisterClient() {
  errors.general = "";
  try {
    await userStore.register({
      ...clientForm,
      role: "client",
    });
    successMessage.value = "✅ Registro exitoso. Bienvenido cliente.";
    setTimeout(() => {
      userStore.redirectByRole(router);
      showRegisterClient.value = false;
    }, 1200);
  } catch (err) {
    errors.general = err.message || "Error al registrarse como cliente";
  }
}

// registro proveedor
async function handleRegisterProvider() {
  errors.general = "";
  try {
    await userStore.register({
      ...providerForm,
      role: "provider",
    });
    successMessage.value = "✅ Registro exitoso. Bienvenido proveedor.";
    setTimeout(() => {
      userStore.redirectByRole(router);
      showRegisterProvider.value = false;
    }, 1200);
  } catch (err) {
    errors.general = err.message || "Error al registrarse como proveedor";
  }
}
</script>

<style scoped>
.input {
  @apply w-full px-4 py-2 border border-neutral-medium rounded-lg focus:ring-2 focus:ring-secondary focus:outline-none;
}
</style>