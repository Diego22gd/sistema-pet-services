<template>
  <Layout>
    <div class="px-6 max-w-6xl mx-auto w-full pt-32">
      <!-- Header de la página -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-neutral-dark mb-2">Mis Citas</h1>
        <p class="text-neutral-medium text-lg">Gestiona y revisa todas tus citas programadas</p>
      </div>

      <!-- Filtros y estadísticas -->
      <div class="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-neutral-light">
        <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <!-- Filtro por mascota -->
          <div class="flex items-center gap-3">
            <label class="text-neutral-dark font-semibold text-sm">Filtrar por mascota:</label>
            <select
              v-model="selectedPet"
              class="px-4 py-2 border border-neutral-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-mint bg-white transition-all"
            >
              <option value="">Todas las mascotas</option>
              <option v-for="pet in pets" :key="pet._id" :value="pet._id">
                {{ pet.name }}
              </option>
            </select>
          </div>

          <!-- Estadísticas rápidas -->
          <div class="flex gap-4 text-sm">
            <div class="bg-neutral-bg px-3 py-2 rounded-lg">
              <span class="font-semibold text-neutral-dark">{{ filteredAppointments.length }}</span>
              <span class="text-neutral-medium ml-1">citas</span>
            </div>
            <div class="bg-yellow-50 px-3 py-2 rounded-lg">
              <span class="font-semibold text-yellow-600">{{ pendingCount }}</span>
              <span class="text-yellow-600 ml-1">pendientes</span>
            </div>
            <div class="bg-green-50 px-3 py-2 rounded-lg">
              <span class="font-semibold text-green-600">{{ confirmedCount }}</span>
              <span class="text-green-600 ml-1">confirmadas</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Lista de citas -->
      <div v-if="loading" class="text-center py-12">
        <div class="w-16 h-16 bg-neutral-light rounded-full flex items-center justify-center mx-auto mb-4">
          <span class="text-2xl">⏳</span>
        </div>
        <p class="text-neutral-medium">Cargando citas...</p>
      </div>

      <div v-else-if="filteredAppointments.length === 0" class="text-center py-16">
        <div class="w-24 h-24 bg-neutral-light rounded-full flex items-center justify-center mx-auto mb-4">
          <span class="text-4xl">📅</span>
        </div>
        <h3 class="text-xl font-semibold text-neutral-dark mb-2">No tienes citas programadas</h3>
        <p class="text-neutral-medium">Cuando programes citas, aparecerán aquí</p>
      </div>

      <!-- Grid de citas -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        <div
          v-for="appt in filteredAppointments"
          :key="appt._id"
          class="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-neutral-light overflow-hidden"
        >
          <!-- Header de la cita -->
          <div class="bg-white p-4 text-white">
            <div class="flex justify-between items-start">
              <h3 class="font-bold text-lg truncate">
                {{ appt.service?.name || "Servicio" }}
              </h3>
              <span :class="['px-2 py-1 rounded-full text-xs font-semibold', statusBadgeClass(appt.status)]">
                {{ translateStatus(appt.status) }}
              </span>
            </div>
          </div>

          <!-- Información de la cita -->
          <div class="p-5 " >
            <div class="space-y-3 mb-4 ">
              <!-- Mascota -->
              <div class="flex items-center text-sm">
                <span class="font-semibold ml-4 text-neutral-dark mr-2">Mascota:</span>
                <span class="text-neutral-medium">{{ appt.pet?.name || "No disponible" }}</span>
                <span class="text-neutral-medium ml-1">({{ appt.pet?.type || "-" }})</span>
              </div>

              <!-- Fecha y hora -->
              <div class="flex items-center text-sm">
                <span class="font-semibold ml-4 text-neutral-dark mr-2">Fecha:</span>
                <span class="text-neutral-medium">{{ formatDate(appt.date) }} a las {{ appt.time }}</span>
              </div>

              <!-- Proveedor -->
              <div v-if="appt.service?.providerName"  class="flex items-center text-sm">
                <span class="font-semibold ml-4 text-neutral-dark mr-2">Proveedor:</span>
                <span class="text-neutral-medium">{{ appt.service.providerName }}</span>
              </div>

              <!-- Precio -->
              <div v-if="appt.service?.price" class="flex items-center text-sm">
                <span class="font-semibold ml-4 text-neutral-dark mr-2">Precio:</span>
                <span class="text-primary-mint font-bold">${{ appt.service.price }}</span>
              </div>
            </div>

            <!-- Botones de acción -->
            <div class="flex flex-col gap-2 mb-3 ">
              <button
                class="w-1 bg-secondary text-white py-2 rounded-lg font-semibold hover:bg-secondary-dark transition-all duration-300 text-sm"
                @click="viewDetails(appt)"
              >
                Ver Detalles
              </button>
              
              <div class="flex gap-2" v-if="appt.status === 'pending' || appt.status === 'confirmed'">
                <button
                  class="flex-1 bg-primary-mint text-white py-2 rounded-lg font-semibold hover:bg-state-success transition-all duration-300 text-sm"
                  @click="onReschedule(appt)"
                >
                  Reprogramar
                </button>
                
                <button
                  class="flex-1 bg-state-error text-white py-2 rounded-lg font-semibold hover:bg-red-600 transition-all duration-300 text-sm"
                  @click="onCancel(appt)"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Reprogramar -->
    <div
      v-if="showModal"
      class="fixed inset-0 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-neutral-light">
        <!-- Header del modal -->
        <div class="bg-primary-mint p-5 text-white rounded-t-2xl">
          <div class="flex justify-between items-start">
            <div>
              <h2 class="text-xl font-bold mb-1">Reprogramar Cita</h2>
              <p class="text-sm opacity-90">{{ selectedAppointment?.service?.name }} - {{ selectedAppointment?.pet?.name }}</p>
            </div>
            <button @click="closeModal" 
                    class="text-white hover:text-neutral-light transition-colors p-1 text-lg">
              ✕
            </button>
          </div>
        </div>

        <!-- Contenido del modal -->
        <div class="p-5">
          <div class="space-y-4">
            <div>
              <label class="block mb-2 font-semibold text-neutral-dark text-sm">
                Nueva Fecha:
              </label>
              <input
                type="date"
                v-model="newDate"
                class="w-full p-3 border border-neutral-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-mint bg-white transition-all"
              />
            </div>

            <div>
              <label class="block mb-2 font-semibold text-neutral-dark text-sm">
                Nueva Hora:
              </label>
              <input
                type="time"
                v-model="newTime"
                class="w-full p-3 border border-neutral-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-mint bg-white transition-all"
              />
            </div>
          </div>

          <!-- Botones de acción -->
          <div class="flex gap-3 mt-6">
            <button 
              class="flex-1 bg-neutral-light text-neutral-dark py-3 rounded-lg font-semibold hover:bg-neutral-medium transition-all duration-300"
              @click="closeModal"
            >
              Cancelar
            </button>
            
            <button 
              class="flex-1 bg-primary-mint text-white py-3 rounded-lg font-semibold hover:bg-state-success transition-all duration-300"
              @click="confirmReschedule"
              :disabled="!newDate || !newTime"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Detalles -->
    <div
      v-if="showDetailsModal"
      class="fixed inset-0 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-neutral-light">
        <!-- Header del modal -->
        <div class="bg-primary-mint p-5 text-white rounded-t-2xl">
          <div class="flex justify-between items-start">
            <div>
              <h2 class="text-xl font-bold mb-1">Detalles de la Cita</h2>
              <p class="text-sm opacity-90">{{ selectedAppointment?.service?.name }} - {{ selectedAppointment?.pet?.name }}</p>
            </div>
            <button @click="closeDetailsModal" 
                    class="text-white hover:text-neutral-light transition-colors p-1 text-lg">
              ✕
            </button>
          </div>
        </div>

        <!-- Contenido del modal -->
        <div class="p-5">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Información principal -->
            <div class="space-y-4">
              <div class="bg-neutral-bg rounded-lg p-4">
                <h3 class="font-semibold text-neutral-dark mb-3 text-sm">Información del Servicio</h3>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-neutral-medium">Servicio:</span>
                    <span class="font-semibold">{{ selectedAppointment?.service?.name }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-neutral-medium">Precio:</span>
                    <span class="font-bold text-primary-mint">${{ selectedAppointment?.service?.price || '0' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-neutral-medium">Proveedor:</span>
                    <span class="font-semibold">{{ selectedAppointment?.service?.providerName || 'No especificado' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Información de la cita -->
            <div class="space-y-4">
              <div class="bg-neutral-bg rounded-lg p-4">
                <h3 class="font-semibold text-neutral-dark mb-3 text-sm">Detalles de la Cita</h3>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-neutral-medium">Mascota:</span>
                    <span class="font-semibold">{{ selectedAppointment?.pet?.name }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-neutral-medium">Tipo:</span>
                    <span>{{ selectedAppointment?.pet?.type || '-' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-neutral-medium">Fecha:</span>
                    <span class="font-semibold">{{ formatDate(selectedAppointment?.date) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-neutral-medium">Hora:</span>
                    <span class="font-semibold">{{ selectedAppointment?.time }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-neutral-medium">Estado:</span>
                    <span :class="statusBadgeClass(selectedAppointment?.status)" class="px-2 py-1 rounded-full text-xs font-semibold">
                      {{ translateStatus(selectedAppointment?.status) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Descripción adicional -->
          <div class="mt-4 bg-neutral-bg rounded-lg p-4">
            <h3 class="font-semibold text-neutral-dark mb-2 text-sm">Descripción del Servicio</h3>
            <p class="text-sm text-neutral-medium">
              {{ selectedAppointment?.service?.description || selectedAppointment?.details || "Sin descripción adicional" }}
            </p>
          </div>

          <!-- Botón de cierre -->
          <div class="flex justify-end mt-6">
            <button 
              class="bg-primary-mint text-white px-6 py-3 rounded-lg font-semibold hover:bg-state-success transition-all duration-300"
              @click="closeDetailsModal"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>

    <Chatbot />
  </Layout>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useUserStore } from "@/stores/userStore";
import appointmentService from "@/services/appointmentService";
import Chatbot from "@/components/Chatbot.vue";
import Layout from "@/components/Layout.vue";

const userStore = useUserStore();

const appointments = ref([]);
const pets = ref([]);
const selectedPet = ref("");
const loading = ref(false);

const showModal = ref(false);
const showDetailsModal = ref(false);
const selectedAppointment = ref(null);
const newDate = ref("");
const newTime = ref("");

// Traducción de estados
const translateStatus = (status) => {
  return {
    pending: "Pendiente",
    confirmed: "Confirmada",
    cancelled: "Cancelada",
    completed: "Completada",
    reprogramada: "Reprogramada",
  }[status] || status;
};

// Clases para badges de estado
const statusBadgeClass = (status) => {
  const s = translateStatus(status);
  return {
    'Pendiente': 'bg-yellow-100 text-yellow-800',
    'Confirmada': 'bg-green-100 text-green-800',
    'Cancelada': 'bg-red-100 text-red-800',
    'Completada': 'bg-blue-100 text-blue-800',
    'Reprogramada': 'bg-purple-100 text-purple-800',
  }[s] || 'bg-gray-100 text-gray-800';
};

// Formatear fecha
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Estadísticas computadas
const pendingCount = computed(() => {
  return filteredAppointments.value.filter(appt => appt.status === 'pending').length;
});

const confirmedCount = computed(() => {
  return filteredAppointments.value.filter(appt => appt.status === 'confirmed').length;
});

// Filtrar por mascota
const filteredAppointments = computed(() => {
  if (!selectedPet.value) return appointments.value;
  return appointments.value.filter((a) => a.pet?._id === selectedPet.value);
});

// Obtener citas
const fetchAppointments = async () => {
  loading.value = true;

  try {
    pets.value = userStore.userPets || [];
    const response = await appointmentService.getByUser();
    appointments.value = response.data;
  } catch (err) {
    console.error("Error obteniendo citas:", err);
  } finally {
    loading.value = false;
  }
};

// Cancelar cita
const onCancel = async (appt) => {
  if (!confirm("¿Estás seguro de que quieres cancelar esta cita?")) return;

  try {
    await appointmentService.cancel(appt._id);
    await fetchAppointments();
  } catch (err) {
    console.error(err);
    alert("Error al cancelar la cita");
  }
};

// Reprogramar cita
const onReschedule = (appt) => {
  selectedAppointment.value = appt;
  newDate.value = appt.date;
  newTime.value = appt.time;
  showModal.value = true;
};

const confirmReschedule = async () => {
  if (!newDate.value || !newTime.value)
    return alert("Por favor, selecciona una nueva fecha y hora");

  try {
    await appointmentService.reschedule(
      selectedAppointment.value._id,
      newDate.value,
      newTime.value
    );
    await fetchAppointments();
    closeModal();
  } catch (err) {
    console.error(err);
    alert("Error al reprogramar la cita");
  }
};

// Ver detalles
const viewDetails = (appt) => {
  selectedAppointment.value = appt;
  showDetailsModal.value = true;
};

// Cerrar modales
const closeModal = () => {
  showModal.value = false;
  selectedAppointment.value = null;
  newDate.value = "";
  newTime.value = "";
};

const closeDetailsModal = () => {
  showDetailsModal.value = false;
  selectedAppointment.value = null;
};

// Montaje
onMounted(async () => {
  if (!userStore.user) await userStore.fetchUser();
  await fetchAppointments();
});
</script>