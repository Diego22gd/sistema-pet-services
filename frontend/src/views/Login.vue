<template>
  <div class="min-h-screen bg-white flex flex-col">
    <!-- HEADER IDÉNTICO A LANDING -->
    <header class="fixed top-0 left-0 right-0 w-full z-50 bg-emerald-600 shadow-lg">
      <div class="container mx-auto px-6">
        <div class="flex justify-between items-center py-4">
          <!-- Logo moderno -->
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
              <span class="text-2xl text-emerald-600">🐾</span>
            </div>
            <div class="text-2xl font-bold text-white">
              PetServices
            </div>
          </div>

          <!-- Botón Volver al Inicio -->
          <nav class="flex items-center space-x-4">
            <router-link 
              to="/" 
              class="text-white hover:text-emerald-100 transition-all duration-300 font-medium px-4 py-2 rounded-lg hover:bg-emerald-700 cursor-pointer flex items-center space-x-2"
            >
              <span>←</span>
              <span>Volver al Inicio</span>
            </router-link>
          </nav>
        </div>
      </div>
    </header>

    <!-- CONTENIDO PRINCIPAL -->
    <main class="flex-1 pt-32 pb-16">
      <div class="container mx-auto max-w-6xl px-6">
        <div class="flex justify-center">
          <!-- Card de Login centrada - Aumentada 20px de ancho -->
          <div class="card-modern max-w-lg w-full">
            
            <!-- Header del formulario -->
            <div class="text-center mb-8 mx-10">
              <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 mb-4 border border-emerald-200">
                <span class="text-2xl text-emerald-600">🔐</span>
              </div>
              <h2 class="text-3xl font-bold text-gray-900 mb-2">
                Iniciar Sesión
              </h2>
              <p class="text-gray-700">
                Accede a tu cuenta para gestionar tus servicios
              </p>
            </div>

            <!-- Formulario -->
            <form @submit.prevent="handleLogin" class="space-y-6 mx-10">
              <!-- Email -->
              <div class="form-group">
                <label class="form-label">
                  Correo electrónico
                </label>
                <div class="relative">
                  <input
                    v-model="email"
                    type="email"
                    placeholder="ejemplo@email.com"
                    required
                    class="form-input pl-12"
                    :class="{ 'border-red-500': loginErrors.email }"
                  />
                  <div class="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    📧
                  </div>
                </div>
                <p v-if="loginErrors.email" class="text-red-500 text-xs mt-1">{{ loginErrors.email }}</p>
              </div>

              <!-- Password -->
              <div class="form-group">
                <label class="form-label">
                  Contraseña
                </label>
                <div class="relative">
                  <input
                    v-model="password"
                    type="password"
                    placeholder="********"
                    required
                    class="form-input pl-12"
                    :class="{ 'border-red-500': loginErrors.password }"
                  />
                  <div class="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    🔒
                  </div>
                </div>
                <p v-if="loginErrors.password" class="text-red-500 text-xs mt-1">{{ loginErrors.password }}</p>
              </div>

              <!-- Mensajes de éxito/error -->
              <div v-if="loginSuccess" class="success-message">
                ✅ {{ loginSuccess }}
              </div>
              <div v-if="loginError" class="error-message">
                ⚠️ {{ loginError }}
              </div>

              <!-- Botón Login -->
              <button
                type="submit"
                class="btn-primary w-full group mx-10"
                :disabled="isLoggingIn"
              >
                <span v-if="!isLoggingIn">Entrar a mi cuenta</span>
                <span v-else>Procesando...</span>
                <span v-if="!isLoggingIn" class="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
              </button>
            </form>

            <!-- Separador -->
            <div class="my-8 mx-10">
              <div class="flex items-center">
                <div class="flex-1 border-t border-gray-200"></div>
                <span class="px-4 text-gray-500 text-sm">O regístrate como</span>
                <div class="flex-1 border-t border-gray-200"></div>
              </div>
            </div>

            <!-- Botones de Registro -->
            <div class="space-y-4 mx-10 mb-8">
              <button
                @click="showRegisterClient = true"
                class="btn-modern-card w-full group h-20"
              >
                <div class="flex items-center justify-between w-full">
                  <div class="flex items-center space-x-4">
                    <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center border border-purple-200">
                      <span class="text-2xl text-purple-600">🐶</span>
                    </div>
                    <div class="text-left">
                      <p class="font-bold text-gray-900">Cliente</p>
                      <p class="text-sm text-gray-600">Busco servicios para mi mascota</p>
                    </div>
                  </div>
                  <span class="text-gray-400 group-hover:translate-x-2 transition-transform duration-300">→</span>
                </div>
              </button>

              <button
                @click="showRegisterProvider = true"
                class="btn-modern-card w-full group h-20"
              >
                <div class="flex items-center justify-between w-full">
                  <div class="flex items-center space-x-4">
                    <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center border border-blue-200">
                      <span class="text-2xl text-blue-600">🏥</span>
                    </div>
                    <div class="text-left">
                      <p class="font-bold text-gray-900">Proveedor</p>
                      <p class="text-sm text-gray-600">Ofrezco servicios para mascotas</p>
                    </div>
                  </div>
                  <span class="text-gray-400 group-hover:translate-x-2 transition-transform duration-300">→</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- MODAL REGISTRO CLIENTE -->
    <div v-if="showRegisterClient" class="modal-backdrop">
      <div class="modal-modern-box max-w-2xl w-full">
        <div class="modal-modern-header flex justify-between items-start">
          <div class="flex items-start gap-4">
            <div class="avatar-modern-lg">
              <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-400 flex items-center justify-center">
                <span class="text-3xl text-white">🐶</span>
              </div>
            </div>
            <div>
              <h2 class="text-2xl font-bold text-gray-900">Registro de Cliente</h2>
              <div class="flex items-center gap-2 mt-2">
                <div class="badge-outline">CLIENTE</div>
              </div>
            </div>
          </div>
          <button @click="showRegisterClient = false" class="btn-modal-close">
            ✕
          </button>
        </div>

        <div class="modal-modern-content mt-6">
          <form @submit.prevent="handleRegisterClient">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mx-6">
              <!-- Nombre -->
              <div class="form-group">
                <label class="form-label">Nombre <span class="text-red-500">*</span></label>
                <input v-model="clientForm.name" type="text" class="form-input" placeholder="Juan" required />
                <p v-if="clientErrors.name" class="text-red-500 text-xs mt-1">{{ clientErrors.name }}</p>
              </div>

              <!-- Apellido -->
              <div class="form-group">
                <label class="form-label">Apellido <span class="text-red-500">*</span></label>
                <input v-model="clientForm.lastname" type="text" class="form-input" placeholder="Pérez" required />
                <p v-if="clientErrors.lastname" class="text-red-500 text-xs mt-1">{{ clientErrors.lastname }}</p>
              </div>

              <!-- Cédula -->
              <div class="form-group">
                <label class="form-label">Cédula <span class="text-red-500">*</span></label>
                <input v-model="clientForm.cedula" type="text" class="form-input" placeholder="V-12345678" required />
                <p v-if="clientErrors.cedula" class="text-red-500 text-xs mt-1">{{ clientErrors.cedula }}</p>
              </div>

              <!-- Email -->
              <div class="form-group">
                <label class="form-label">Correo electrónico <span class="text-red-500">*</span></label>
                <input v-model="clientForm.email" type="email" class="form-input" placeholder="email@ejemplo.com" required />
                <p v-if="clientErrors.email" class="text-red-500 text-xs mt-1">{{ clientErrors.email }}</p>
              </div>

              <!-- Teléfono -->
              <div class="form-group">
                <label class="form-label">Teléfono <span class="text-red-500">*</span></label>
                <input v-model="clientForm.phone" type="tel" class="form-input" placeholder="+58 412 1234567" required />
                <p v-if="clientErrors.phone" class="text-red-500 text-xs mt-1">{{ clientErrors.phone }}</p>
              </div>

              <!-- Contraseña -->
              <div class="form-group">
                <label class="form-label">Contraseña <span class="text-red-500">*</span></label>
                <input v-model="clientForm.password" type="password" class="form-input" placeholder="********" required />
                <p v-if="clientErrors.password" class="text-red-500 text-xs mt-1">{{ clientErrors.password }}</p>
              </div>

              <!-- Confirmar Contraseña -->
              <div class="form-group">
                <label class="form-label">Confirmar Contraseña <span class="text-red-500">*</span></label>
                <input v-model="clientForm.confirmPassword" type="password" class="form-input" placeholder="********" required />
                <p v-if="clientErrors.confirmPassword" class="text-red-500 text-xs mt-1">{{ clientErrors.confirmPassword }}</p>
              </div>
            </div>

            <!-- Mensajes -->
            <div v-if="registerError" class="error-message mt-4 mx-6">
              ⚠️ {{ registerError }}
            </div>
            <div v-if="registerSuccess" class="success-message mt-4 mx-6">
              ✅ {{ registerSuccess }}
            </div>

            <!-- Botones del modal -->
            <div class="modal-modern-actions mx-6">
              <button type="button" @click="showRegisterClient = false" class="btn-modal-ghost">
                Cancelar
              </button>
              <button type="submit" class="btn-modal-primary group" :disabled="isRegistering">
                <span v-if="!isRegistering">Registrarme como Cliente</span>
                <span v-else>Procesando...</span>
                <span v-if="!isRegistering" class="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- MODAL REGISTRO PROVEEDOR -->
    <div v-if="showRegisterProvider" class="modal-backdrop">
      <div class="modal-modern-box max-w-2xl w-full">
        <div class="modal-modern-header flex justify-between items-start">
          <div class="flex items-start gap-4">
            <div class="avatar-modern-lg">
              <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                <span class="text-3xl text-white">🏥</span>
              </div>
            </div>
            <div>
              <h2 class="text-2xl font-bold text-gray-900">Registro de Proveedor</h2>
              <div class="flex items-center gap-2 mt-2">
                <div class="badge-outline">PROVEEDOR</div>
              </div>
            </div>
          </div>
          <button @click="showRegisterProvider = false" class="btn-modal-close">
            ✕
          </button>
        </div>

        <div class="modal-modern-content mt-6">
          <form @submit.prevent="handleRegisterProvider">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mx-6">
              <!-- Nombre -->
              <div class="form-group">
                <label class="form-label">Nombre <span class="text-red-500">*</span></label>
                <input v-model="providerForm.name" type="text" class="form-input" placeholder="Carlos" required />
                <p v-if="providerErrors.name" class="text-red-500 text-xs mt-1">{{ providerErrors.name }}</p>
              </div>

              <!-- Apellido -->
              <div class="form-group">
                <label class="form-label">Apellido <span class="text-red-500">*</span></label>
                <input v-model="providerForm.lastname" type="text" class="form-input" placeholder="Gómez" required />
                <p v-if="providerErrors.lastname" class="text-red-500 text-xs mt-1">{{ providerErrors.lastname }}</p>
              </div>

              <!-- Email -->
              <div class="form-group">
                <label class="form-label">Correo electrónico <span class="text-red-500">*</span></label>
                <input v-model="providerForm.email" type="email" class="form-input" placeholder="email@ejemplo.com" required />
                <p v-if="providerErrors.email" class="text-red-500 text-xs mt-1">{{ providerErrors.email }}</p>
              </div>

              <!-- Teléfono -->
              <div class="form-group">
                <label class="form-label">Teléfono <span class="text-red-500">*</span></label>
                <input v-model="providerForm.phone" type="tel" class="form-input" placeholder="+58 414 7654321" required />
                <p v-if="providerErrors.phone" class="text-red-500 text-xs mt-1">{{ providerErrors.phone }}</p>
              </div>

              <!-- RIF -->
              <div class="form-group">
                <label class="form-label">RIF <span class="text-red-500">*</span></label>
                <input v-model="providerForm.rif" type="text" class="form-input" placeholder="J-12345678-9" required />
                <p v-if="providerErrors.rif" class="text-red-500 text-xs mt-1">{{ providerErrors.rif }}</p>
              </div>

              <!-- Nombre del Negocio -->
              <div class="form-group">
                <label class="form-label">Nombre del Negocio <span class="text-red-500">*</span></label>
                <input v-model="providerForm.businessName" type="text" class="form-input" placeholder="Veterinaria Patitas Felices" required />
                <p v-if="providerErrors.businessName" class="text-red-500 text-xs mt-1">{{ providerErrors.businessName }}</p>
              </div>

              <!-- Tipo de Servicio -->
              <div class="form-group">
                <label class="form-label">Tipo de Servicio <span class="text-red-500">*</span></label>
                <select v-model="providerForm.serviceType" class="form-input" required>
                  <option disabled value="">Selecciona una opción</option>
                  <option>Veterinaria</option>
                  <option>Peluquería</option>
                  <option>Guardería</option>
                  <option>Tienda de mascotas</option>
                  <option>Adiestramiento</option>
                  <option>Paseo de mascotas</option>
                  <option>Otro</option>
                </select>
                <p v-if="providerErrors.serviceType" class="text-red-500 text-xs mt-1">{{ providerErrors.serviceType }}</p>
              </div>

              <!-- Contraseña -->
              <div class="form-group">
                <label class="form-label">Contraseña <span class="text-red-500">*</span></label>
                <input v-model="providerForm.password" type="password" class="form-input" placeholder="********" required />
                <p v-if="providerErrors.password" class="text-red-500 text-xs mt-1">{{ providerErrors.password }}</p>
              </div>

              <!-- Confirmar Contraseña -->
              <div class="form-group">
                <label class="form-label">Confirmar Contraseña <span class="text-red-500">*</span></label>
                <input v-model="providerForm.confirmPassword" type="password" class="form-input" placeholder="********" required />
                <p v-if="providerErrors.confirmPassword" class="text-red-500 text-xs mt-1">{{ providerErrors.confirmPassword }}</p>
              </div>
            </div>

            <!-- Mensajes -->
            <div v-if="registerError" class="error-message mt-4 mx-6">
              ⚠️ {{ registerError }}
            </div>
            <div v-if="registerSuccess" class="success-message mt-4 mx-6">
              ✅ {{ registerSuccess }}
            </div>

            <!-- Botones del modal -->
            <div class="modal-modern-actions mx-6">
              <button type="button" @click="showRegisterProvider = false" class="btn-modal-ghost">
                Cancelar
              </button>
              <button type="submit" class="btn-modal-primary group" :disabled="isRegistering">
                <span v-if="!isRegistering">Registrarme como Proveedor</span>
                <span v-else>Procesando...</span>
                <span v-if="!isRegistering" class="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- FOOTER IDÉNTICO A LANDING -->
    <footer class="bg-neutral-light text-neutral-medium py-6 text-center mt-auto shadow-inner">
      <div class="container mx-auto px-6">
        <p class="text-base md:text-lg">© 2025 PetServices - Todos los derechos reservados</p>
        <p class="text-sm mt-2 text-neutral-medium/80">
          Cuidando de tus mascotas desde 2023
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { useUserStore } from "@/stores/userStore";
import { useRouter } from "vue-router";
import { ref, reactive, onMounted } from "vue";

const router = useRouter();
const userStore = useUserStore();

// Estados para login
const email = ref("");
const password = ref("");
const isLoggingIn = ref(false);
const loginError = ref("");
const loginSuccess = ref("");
const loginErrors = reactive({
  email: "",
  password: ""
});

// Estados para registro
const showRegisterClient = ref(false);
const showRegisterProvider = ref(false);
const isRegistering = ref(false);
const registerError = ref("");
const registerSuccess = ref("");

// Formularios
const clientForm = reactive({
  name: "",
  lastname: "",
  cedula: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
});

const providerForm = reactive({
  name: "",
  lastname: "",
  email: "",
  phone: "",
  rif: "",
  password: "",
  confirmPassword: "",
  businessName: "",
  serviceType: "",
});

// Errores de validación
const clientErrors = reactive({
  name: "",
  lastname: "",
  cedula: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: ""
});

const providerErrors = reactive({
  name: "",
  lastname: "",
  email: "",
  phone: "",
  rif: "",
  password: "",
  confirmPassword: "",
  businessName: "",
  serviceType: ""
});

// 🔹 Verificar si ya está autenticado
onMounted(() => {
  // Inicializar userStore
  userStore.initializeApp();
  
  // Si ya está autenticado, redirigir
  if (userStore.user && userStore.token) {
    console.log("✅ Usuario ya autenticado, redirigiendo...");
    userStore.redirectByRole(router);
  }
});

// Validaciones
const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const validateVenezuelanPhone = (phone) => {
  const regex = /^(\+58\s?)?(0?4(1[2-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9]|6[0-9]|7[0-9]|8[0-9]|9[0-9]))[-. ]?(\d{3})[-. ]?(\d{4})$/;
  return regex.test(phone);
};

const validateCedula = (cedula) => {
  const regex = /^(V|E|v|e)?-?\d{5,9}$/;
  return regex.test(cedula);
};

const validateRIF = (rif) => {
  const regex = /^[JGVEPjvgep]-?\d{8}-?\d$/;
  return regex.test(rif);
};

const validatePassword = (password) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return regex.test(password);
};

// 🔹 Validación del formulario de login
const validateLoginForm = () => {
  let isValid = true;
  
  loginErrors.email = "";
  loginErrors.password = "";
  loginError.value = "";
  
  if (!email.value.trim()) {
    loginErrors.email = "El correo electrónico es obligatorio";
    isValid = false;
  } else if (!validateEmail(email.value)) {
    loginErrors.email = "Formato de correo inválido";
    isValid = false;
  }
  
  if (!password.value) {
    loginErrors.password = "La contraseña es obligatoria";
    isValid = false;
  } else if (password.value.length < 8) {
    loginErrors.password = "La contraseña debe tener al menos 8 caracteres";
    isValid = false;
  }
  
  return isValid;
};

// 🔹 Validación cliente
const validateClientForm = () => {
  let isValid = true;
  Object.keys(clientErrors).forEach(key => clientErrors[key] = '');

  if (!clientForm.name.trim()) {
    clientErrors.name = "El nombre es obligatorio";
    isValid = false;
  }

  if (!clientForm.lastname.trim()) {
    clientErrors.lastname = "El apellido es obligatorio";
    isValid = false;
  }

  if (!clientForm.cedula.trim()) {
    clientErrors.cedula = "La cédula es obligatoria";
    isValid = false;
  } else if (!validateCedula(clientForm.cedula)) {
    clientErrors.cedula = "Formato de cédula inválido (ej: V-12345678)";
    isValid = false;
  }

  if (!clientForm.email.trim()) {
    clientErrors.email = "El correo electrónico es obligatorio";
    isValid = false;
  } else if (!validateEmail(clientForm.email)) {
    clientErrors.email = "Formato de correo inválido";
    isValid = false;
  }

  if (!clientForm.phone.trim()) {
    clientErrors.phone = "El teléfono es obligatorio";
    isValid = false;
  } else if (!validateVenezuelanPhone(clientForm.phone)) {
    clientErrors.phone = "Formato de teléfono inválido (ej: +58 412 1234567)";
    isValid = false;
  }

  if (!clientForm.password) {
    clientErrors.password = "La contraseña es obligatoria";
    isValid = false;
  } else if (!validatePassword(clientForm.password)) {
    clientErrors.password = "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número";
    isValid = false;
  }

  if (!clientForm.confirmPassword) {
    clientErrors.confirmPassword = "Debes confirmar la contraseña";
    isValid = false;
  } else if (clientForm.password !== clientForm.confirmPassword) {
    clientErrors.confirmPassword = "Las contraseñas no coinciden";
    isValid = false;
  }

  return isValid;
};

// 🔹 Validación proveedor
const validateProviderForm = () => {
  let isValid = true;
  Object.keys(providerErrors).forEach(key => providerErrors[key] = '');

  if (!providerForm.name.trim()) {
    providerErrors.name = "El nombre es obligatorio";
    isValid = false;
  }

  if (!providerForm.lastname.trim()) {
    providerErrors.lastname = "El apellido es obligatorio";
    isValid = false;
  }

  if (!providerForm.email.trim()) {
    providerErrors.email = "El correo electrónico es obligatorio";
    isValid = false;
  } else if (!validateEmail(providerForm.email)) {
    providerErrors.email = "Formato de correo inválido";
    isValid = false;
  }

  if (!providerForm.phone.trim()) {
    providerErrors.phone = "El teléfono es obligatorio";
    isValid = false;
  } else if (!validateVenezuelanPhone(providerForm.phone)) {
    providerErrors.phone = "Formato de teléfono inválido (ej: +58 414 7654321)";
    isValid = false;
  }

  if (!providerForm.rif.trim()) {
    providerErrors.rif = "El RIF es obligatorio";
    isValid = false;
  } else if (!validateRIF(providerForm.rif)) {
    providerErrors.rif = "Formato de RIF inválido (ej: J-12345678-9)";
    isValid = false;
  }

  if (!providerForm.businessName.trim()) {
    providerErrors.businessName = "El nombre del negocio es obligatorio";
    isValid = false;
  }

  if (!providerForm.serviceType) {
    providerErrors.serviceType = "Debes seleccionar un tipo de servicio";
    isValid = false;
  }

  if (!providerForm.password) {
    providerErrors.password = "La contraseña es obligatoria";
    isValid = false;
  } else if (!validatePassword(providerForm.password)) {
    providerErrors.password = "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número";
    isValid = false;
  }

  if (!providerForm.confirmPassword) {
    providerErrors.confirmPassword = "Debes confirmar la contraseña";
    isValid = false;
  } else if (providerForm.password !== providerForm.confirmPassword) {
    providerErrors.confirmPassword = "Las contraseñas no coinciden";
    isValid = false;
  }

  return isValid;
};

// 🔹 Función de login usando userStore
async function handleLogin() {
  if (!validateLoginForm()) {
    return;
  }
  
  isLoggingIn.value = true;
  loginError.value = "";
  loginSuccess.value = "";
  
  try {
    console.log('📤 Iniciando sesión con userStore...');
    
    // Usar el userStore para login
    const response = await userStore.login(email.value, password.value);
    
    console.log('✅ Login exitoso con userStore:', response);
    
    if (userStore.user && userStore.token) {
      loginSuccess.value = "✅ Inicio de sesión exitoso";
      
      // Esperar un momento para que se guarde en localStorage
      setTimeout(() => {
        console.log('🔄 Redirigiendo según rol...', userStore.user?.role);
        userStore.redirectByRole(router);
      }, 500);
    } else {
      loginError.value = "Error al iniciar sesión: datos de usuario no disponibles";
    }
    
  } catch (error) {
    console.error('❌ Error completo en login:', error);
    
    // Manejo de errores
    if (error.message) {
      loginError.value = error.message;
    } else if (error.response) {
      if (error.response.status === 400) {
        loginError.value = error.response.data.message || "Credenciales incorrectas";
      } else if (error.response.status === 404) {
        loginError.value = "Usuario no encontrado";
      } else if (error.response.status === 500) {
        loginError.value = "Error en el servidor. Por favor, intente más tarde.";
      } else {
        loginError.value = error.response.data.message || "Error al iniciar sesión";
      }
    } else if (error.request) {
      loginError.value = "No se pudo conectar con el servidor. Verifica tu conexión.";
    } else {
      loginError.value = "Error en la configuración de la solicitud";
    }
  } finally {
    isLoggingIn.value = false;
  }
}

// 🔹 Registro cliente usando userStore
async function handleRegisterClient() {
  if (!validateClientForm()) {
    return;
  }

  isRegistering.value = true;
  registerError.value = "";
  registerSuccess.value = "";

  try {
    console.log('📤 Registrando cliente con userStore...');
    
    const response = await userStore.register({
      ...clientForm,
      role: "client",
    });

    console.log('✅ Registro exitoso con userStore:', response);
    
    if (userStore.user && userStore.token) {
      registerSuccess.value = "✅ Registro exitoso. Bienvenido cliente.";
      
      // Esperar un momento para que se guarde en localStorage
      setTimeout(() => {
        console.log('🔄 Redirigiendo cliente...', userStore.user?.role);
        showRegisterClient.value = false;
        userStore.redirectByRole(router);
        
        // Resetear formulario
        Object.keys(clientForm).forEach(key => clientForm[key] = '');
      }, 1500);
    } else {
      registerError.value = "Error al registrarse: datos de usuario no disponibles";
    }
    
  } catch (error) {
    console.error('❌ Error en registro cliente:', error);
    
    if (error.message) {
      registerError.value = error.message;
    } else if (error.response) {
      if (error.response.status === 400) {
        registerError.value = error.response.data.message || "Error en los datos del formulario";
      } else if (error.response.status === 409) {
        registerError.value = "El correo electrónico o cédula ya están registrados";
      } else if (error.response.status === 500) {
        registerError.value = "Error en el servidor. Por favor, intente más tarde.";
      } else {
        registerError.value = error.response.data.message || "Error al registrarse";
      }
    } else if (error.request) {
      registerError.value = "No se pudo conectar con el servidor. Verifica tu conexión.";
    } else {
      registerError.value = "Error en la configuración de la solicitud";
    }
  } finally {
    isRegistering.value = false;
  }
}

// 🔹 Registro proveedor usando userStore
async function handleRegisterProvider() {
  if (!validateProviderForm()) {
    return;
  }

  isRegistering.value = true;
  registerError.value = "";
  registerSuccess.value = "";

  try {
    console.log('📤 Registrando proveedor con userStore...');
    
    const response = await userStore.register({
      ...providerForm,
      role: "provider",
    });

    console.log('✅ Registro exitoso con userStore:', response);
    
    if (userStore.user && userStore.token) {
      registerSuccess.value = "✅ Registro exitoso. Bienvenido proveedor.";
      
      // Esperar un momento para que se guarde en localStorage
      setTimeout(() => {
        console.log('🔄 Redirigiendo proveedor...', userStore.user?.role);
        showRegisterProvider.value = false;
        userStore.redirectByRole(router);
        
        // Resetear formulario
        Object.keys(providerForm).forEach(key => providerForm[key] = '');
      }, 1500);
    } else {
      registerError.value = "Error al registrarse: datos de usuario no disponibles";
    }
    
  } catch (error) {
    console.error('❌ Error en registro proveedor:', error);
    
    if (error.message) {
      registerError.value = error.message;
    } else if (error.response) {
      if (error.response.status === 400) {
        registerError.value = error.response.data.message || "Error en los datos del formulario";
      } else if (error.response.status === 409) {
        registerError.value = "El correo electrónico o RIF ya están registrados";
      } else if (error.response.status === 500) {
        registerError.value = "Error en el servidor. Por favor, intente más tarde.";
      } else {
        registerError.value = error.response.data.message || "Error al registrarse";
      }
    } else if (error.request) {
      registerError.value = "No se pudo conectar con el servidor. Verifica tu conexión.";
    } else {
      registerError.value = "Error en la configuración de la solicitud";
    }
  } finally {
    isRegistering.value = false;
  }
}
</script>

<style scoped>
/* ===== REUTILIZAR ESTILOS DE LANDING ===== */

/* Cards - Ajustado para ser más ancho */
.card-modern {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  max-width: 480px !important;
  width: 100%;
  padding: 1.5rem 0;
}

.card-modern:hover {
  transform: translateY(-4px);
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.1),
    0 0 0 1px #10b981,
    0 0 20px rgba(16, 185, 129, 0.1);
}

header {
  background-color: #059669 !important;
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
  cursor: pointer;
  width: 90%;
  margin-left: 20px;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 
    0 15px 35px rgba(16, 185, 129, 0.4),
    0 0 0 2px rgba(255, 255, 255, 0.2);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-modern-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 1rem 1.5rem;
  transition: all 0.3s ease;
  cursor: pointer;
  text-align: left;
  width: 90%;
  margin-left: 20px;
}

.btn-modern-card:hover {
  border-color: #10b981;
  background: #f0fdfa;
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

/* Formularios */
.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left:20px;
}

.form-input {
  width: 90%;
  padding: 0.875rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
  margin-left: 20px;
}

.form-input:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.form-input.pl-12 {
  padding-left: 3rem;
}

.border-red-500 {
  border-color: #ef4444;
}

/* Badges */
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

/* Modales */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 1rem;
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
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
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

.modal-modern-content {
  margin-top: 1.5rem;
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

.btn-modal-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(16, 185, 129, 0.3);
}

.btn-modal-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

/* Mensajes */
.error-message {
  color: #dc2626;
  background: #fef2f2;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid #fecaca;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 20px;
}

.success-message {
  color: #059669;
  background: #f0fdfa;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid #a7f3d0;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 20px;
}

/* Footer */
.footer-emerald {
  background-color: #059669;
  color: white;
  padding: 3rem 0;
  margin-top: auto;
}

/* Responsive */
@media (max-width: 768px) {
  .card-modern {
    max-width: 100% !important;
    margin: 0 1rem;
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
  
  .btn-primary {
    width: 90%;
    margin-right: 20px;
    justify-content: center;
  }
  
  /* Ajustar márgenes en móvil */
  .mx-10 {
    margin-left: 1rem !important;
    margin-right: 1rem !important;
  }
  
  .mx-6 {
    margin-left: 1rem !important;
    margin-right: 1rem !important;
  }
}
</style>