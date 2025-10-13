<template>
  <div class="min-h-screen flex flex-col bg-neutral-bg pt-24">
    <!-- HEADER -->
    <header
      class="fixed top-0 left-0 right-0 w-full z-50 bg-primary-mint text-white flex justify-between items-center py-4 shadow-md"
    >
      <div class="text-2xl font-bold px-6">🐾 PetServices</div>
      <nav class="px-6">
        <router-link
          to="/"
          class="bg-white text-primary-mint px-4 py-2 rounded-lg font-semibold shadow hover:bg-neutral-light transition"
        >
          🏠 Home
        </router-link>
      </nav>
    </header>

    <!-- Contenedor Login -->
    <div class="flex justify-center items-center flex-grow px-4 pt-24">
      <div class="bg-white p-8 rounded-2xl shadow-lg w-full max-w-lg">
        <!-- Título -->
        <h2 class="text-3xl font-bold text-primary text-center mb-6">Iniciar Sesión</h2>

        <!-- Login Form -->
        <form @submit.prevent="login">
          <div class="mb-4">
            <label class="block text-neutral-dark mb-1">Correo electrónico</label>
            <input
              v-model="email"
              type="email"
              placeholder="ejemplo@email.com"
              class="w-full px-4 py-2 border border-neutral-medium rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
              required
            />
            <p v-if="errors.email" class="text-red-500 text-sm mt-1">{{ errors.email }}</p>
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
            <p v-if="errors.password" class="text-red-500 text-sm mt-1">{{ errors.password }}</p>
          </div>

          <button
            type="submit"
            class="w-full bg-primary-mint text-white font-bold py-3 rounded-lg hover:bg-state-success transition"
          >
            Entrar
          </button>
        </form>

        <!-- Botón abrir modal registro -->
        <p class="text-center text-neutral-medium mt-6">
          ¿No tienes cuenta?
          <button
            @click="showRegister = true"
            class="text-secondary font-semibold hover:underline"
          >
            Regístrate aquí
          </button>
        </p>
      </div>
    </div>

    <!-- Modal Registro -->
    <div
      v-if="showRegister"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white p-8 rounded-2xl shadow-lg w-full max-w-2xl relative overflow-y-auto max-h-[90vh]">
        <!-- Botón cerrar -->
        <button
          @click="showRegister = false"
          class="absolute top-3 right-3 text-neutral-medium hover:text-neutral-dark"
        >
          ✖
        </button>

        <h2 class="text-2xl font-bold text-primary mb-6 text-center">Crear Cuenta</h2>

        <!-- Selector tipo -->
        <div class="flex justify-center mb-6">
          <button
            :class="['px-6 py-2 rounded-l-lg', userType === 'cliente' ? 'bg-primary-mint text-white' : 'bg-neutral-light']"
            @click="userType = 'cliente'"
          >
            Usuario
          </button>
          <button
            :class="['px-6 py-2 rounded-r-lg', userType === 'proveedor' ? 'bg-primary-mint text-white' : 'bg-neutral-light']"
            @click="userType = 'proveedor'"
          >
            Proveedor
          </button>
        </div>

        <!-- Registro Usuario/Proveedor -->
        <form @submit.prevent="register">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Nombre -->
            <div>
              <label class="block text-neutral-dark mb-1">Nombre</label>
              <input v-model="registerForm.name" type="text" placeholder="Juan"
                class="w-full px-4 py-2 border border-neutral-medium rounded-lg focus:ring-2 focus:ring-secondary focus:outline-none"/>
              <p v-if="errors.name" class="text-red-500 text-sm">{{ errors.name }}</p>
            </div>

            <!-- Apellido -->
            <div>
              <label class="block text-neutral-dark mb-1">Apellido</label>
              <input v-model="registerForm.lastname" type="text" placeholder="Pérez"
                class="w-full px-4 py-2 border border-neutral-medium rounded-lg focus:ring-2 focus:ring-secondary focus:outline-none"/>
              <p v-if="errors.lastname" class="text-red-500 text-sm">{{ errors.lastname }}</p>
            </div>

            <!-- Cédula -->
            <div>
              <label class="block text-neutral-dark mb-1">Cédula</label>
              <input v-model="registerForm.cedula" type="text" placeholder="12345678"
                class="w-full px-4 py-2 border border-neutral-medium rounded-lg focus:ring-2 focus:ring-secondary focus:outline-none"/>
              <p v-if="errors.cedula" class="text-red-500 text-sm">{{ errors.cedula }}</p>
            </div>

            <!-- Teléfono -->
            <div>
              <label class="block text-neutral-dark mb-1">Teléfono</label>
              <input v-model="registerForm.phone" type="tel" placeholder="+58 412 1234567"
                class="w-full px-4 py-2 border border-neutral-medium rounded-lg focus:ring-2 focus:ring-secondary focus:outline-none"/>
              <p v-if="errors.phone" class="text-red-500 text-sm">{{ errors.phone }}</p>
            </div>

            <!-- Fecha Nacimiento -->
            <div>
              <label class="block text-neutral-dark mb-1">Fecha de Nacimiento</label>
              <input v-model="registerForm.birthdate" type="date"
                class="w-full px-4 py-2 border border-neutral-medium rounded-lg focus:ring-2 focus:ring-secondary focus:outline-none"/>
              <p v-if="errors.birthdate" class="text-red-500 text-sm">{{ errors.birthdate }}</p>
            </div>
          </div>

          <!-- Campos especiales si es proveedor -->
          <div v-if="userType === 'proveedor'" class="mt-4">
            <label class="block text-neutral-dark mb-1">Nombre del comercio</label>
            <input v-model="registerForm.businessName" type="text" placeholder="Veterinaria Patitas Felices"
              class="w-full px-4 py-2 border border-neutral-medium rounded-lg focus:ring-2 focus:ring-secondary focus:outline-none"/>
            <p v-if="errors.businessName" class="text-red-500 text-sm">{{ errors.businessName }}</p>

            <label class="block text-neutral-dark mb-1 mt-4">Tipo de servicio</label>
            <select v-model="registerForm.serviceType"
              class="w-full px-4 py-2 border border-neutral-medium rounded-lg focus:ring-2 focus:ring-secondary focus:outline-none">
              <option disabled value="">Selecciona una opción</option>
              <option>Veterinaria</option>
              <option>Peluquería</option>
              <option>Guardería</option>
              <option>Tienda de mascotas</option>
              <option>Adiestramiento</option>
            </select>
            <p v-if="errors.serviceType" class="text-red-500 text-sm">{{ errors.serviceType }}</p>
          </div>

          <!-- Email -->
          <div class="mt-4">
            <label class="block text-neutral-dark mb-1">Correo electrónico</label>
            <input v-model="registerForm.email" type="email" placeholder="ejemplo@email.com"
              class="w-full px-4 py-2 border border-neutral-medium rounded-lg focus:ring-2 focus:ring-secondary focus:outline-none"/>
            <p v-if="errors.registerEmail" class="text-red-500 text-sm">{{ errors.registerEmail }}</p>
          </div>

          <!-- Password -->
          <div class="mt-4">
            <label class="block text-neutral-dark mb-1">Contraseña</label>
            <input v-model="registerForm.password" type="password" placeholder="********"
              class="w-full px-4 py-2 border border-neutral-medium rounded-lg focus:ring-2 focus:ring-secondary focus:outline-none"/>
            <p v-if="errors.registerPassword" class="text-red-500 text-sm">{{ errors.registerPassword }}</p>
          </div>

          <button
            type="submit"
            class="w-full bg-secondary text-white font-bold py-3 mt-6 rounded-lg hover:bg-secondary-dark transition"
          >
            Registrarse
          </button>
        </form>
      </div>
    </div>
     <footer class="bg-neutral-light text-neutral-medium py-6 text-center mt-auto">
      © 2025 PetServices - Todos los derechos reservados
    </footer>
  </div>
</template>

<script>
export default {
  name: "Login",
  data() {
    return {
      email: "",
      password: "",
      showRegister: false,
      userType: "cliente",
      registerForm: {
        name: "",
        lastname: "",
        cedula: "",
        phone: "",
        birthdate: "",
        businessName: "",
        serviceType: "",
        email: "",
        password: "",
      },
      errors: {},
    };
  },
  methods: {
    validateEmail(email) {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return regex.test(email);
    },
    validatePhone(phone) {
      const regex = /^\+?\d{7,15}$/;
      return regex.test(phone);
    },
    validatePassword(password) {
      // Al menos 8 caracteres, una mayúscula, un número
      const regex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
      return regex.test(password);
    },
    login() {
      this.errors = {};
      if (!this.validateEmail(this.email)) {
        this.errors.email = "Introduce un correo válido.";
      }
      if (!this.validatePassword(this.password)) {
        this.errors.password = "La contraseña debe tener al menos 8 caracteres, una mayúscula y un número.";
      }

      if (Object.keys(this.errors).length === 0) {
        console.log("Login con:", this.email, this.password);
        this.$router.push("/");
      }
    },
    register() {
      this.errors = {};

      if (!this.registerForm.name) this.errors.name = "El nombre es obligatorio.";
      if (!this.registerForm.lastname) this.errors.lastname = "El apellido es obligatorio.";
      if (!/^\d{6,10}$/.test(this.registerForm.cedula)) this.errors.cedula = "Cédula inválida.";
      if (!this.validatePhone(this.registerForm.phone)) this.errors.phone = "Teléfono inválido.";
      if (!this.registerForm.birthdate) this.errors.birthdate = "La fecha de nacimiento es obligatoria.";

      if (this.userType === "proveedor") {
        if (!this.registerForm.businessName) this.errors.businessName = "El nombre del comercio es obligatorio.";
        if (!this.registerForm.serviceType) this.errors.serviceType = "Selecciona un tipo de servicio.";
      }

      if (!this.validateEmail(this.registerForm.email)) this.errors.registerEmail = "Correo inválido.";
      if (!this.validatePassword(this.registerForm.password)) this.errors.registerPassword = "Contraseña insegura.";

      if (Object.keys(this.errors).length === 0) {
        console.log("Registro:", this.userType, this.registerForm);
        this.showRegister = false;
      }
    },
  },
};
</script>
