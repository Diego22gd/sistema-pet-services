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
              <h3 class="font-bold text-lg truncate text-neutral-dark">
                {{ appt.service?.name || "Servicio" }}
              </h3>
              <span :class="['px-2 py-1 rounded-full text-xs font-semibold', statusBadgeClass(appt.status)]">
                {{ translateStatus(appt.status) }}
              </span>
            </div>
          </div>

          <!-- Información de la cita -->
          <div class="p-5">
            <div class="space-y-3 mb-4">
              <!-- Mascota -->
              <div class="flex items-center text-sm">
                <span class="font-semibold text-neutral-dark mr-2">Mascota:</span>
                <span class="text-neutral-medium">{{ appt.pet?.name || "No disponible" }}</span>
                <span class="text-neutral-medium ml-1">({{ appt.pet?.type || "-" }})</span>
              </div>

              <!-- Fecha y hora -->
              <div class="flex items-center text-sm">
                <span class="font-semibold text-neutral-dark mr-2">Fecha:</span>
                <span class="text-neutral-medium">{{ formatDate(appt.date) }} a las {{ appt.time }}</span>
              </div>

              <!-- Proveedor -->
              <div v-if="appt.service?.providerName" class="flex items-center text-sm">
                <span class="font-semibold text-neutral-dark mr-2">Proveedor:</span>
                <span class="text-neutral-medium">{{ appt.service.providerName }}</span>
              </div>

              <!-- Precio -->
              <div v-if="appt.service?.price" class="flex items-center text-sm">
                <span class="font-semibold text-neutral-dark mr-2">Precio:</span>
                <span class="text-primary-mint font-bold">${{ appt.service.price }}</span>
              </div>
            </div>

            <!-- Botones de acción -->
            <div class="flex flex-col gap-2 mb-3">
              <button
                class="w-full bg-secondary text-white py-2 rounded-lg font-semibold hover:bg-secondary-dark transition-all duration-300 text-sm"
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

    <!-- Modal Reprogramar - Estilo Mejorado -->
    <div
      v-if="showModal"
      class="fixed inset-0 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-neutral-light">
        <!-- Header del modal -->
        <div class="bg-gradient-to-r from-primary-mint to-teal-500 p-6 text-white rounded-t-2xl">
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
        <div class="p-6">
          <form @submit.prevent="confirmReschedule">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block mb-3 font-semibold text-neutral-dark text-sm">Nueva Fecha</label>
                <input
                  type="date"
                  v-model="newDate"
                  class="w-full p-3 border border-neutral-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-mint bg-white transition-all"
                  required
                />
              </div>

              <div>
                <label class="block mb-3 font-semibold text-neutral-dark text-sm">Nueva Hora</label>
                <input
                  type="time"
                  v-model="newTime"
                  class="w-full p-3 border border-neutral-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-mint bg-white transition-all"
                  required
                />
              </div>
            </div>

            <!-- Información actual -->
            <div class="mt-6 bg-neutral-bg rounded-xl p-4 border border-neutral-light">
              <h3 class="font-semibold text-neutral-dark mb-3 text-sm">Información Actual</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span class="text-neutral-medium">Fecha actual:</span>
                  <p class="font-semibold text-neutral-dark">{{ formatDate(selectedAppointment?.date) }}</p>
                </div>
                <div>
                  <span class="text-neutral-medium">Hora actual:</span>
                  <p class="font-semibold text-neutral-dark">{{ selectedAppointment?.time }}</p>
                </div>
                <div class="md:col-span-2">
                  <span class="text-neutral-medium">Servicio:</span>
                  <p class="font-semibold text-neutral-dark">{{ selectedAppointment?.service?.name }}</p>
                </div>
              </div>
            </div>

            <!-- Botones de acción -->
            <div class="flex gap-3 mt-8">
              <button 
                type="button"
                class="flex-1 bg-neutral-light text-neutral-dark py-3 rounded-lg font-semibold hover:bg-neutral-medium transition-all duration-300"
                @click="closeModal"
              >
                Cancelar
              </button>
              
              <button 
                type="submit"
                class="flex-1 bg-primary-mint text-white py-3 rounded-lg font-semibold hover:bg-state-success transition-all duration-300"
                :disabled="!newDate || !newTime"
                :class="{'opacity-50 cursor-not-allowed': !newDate || !newTime}"
              >
                Confirmar Cambios
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal Detalles - Estilo Mejorado -->
    <div
      v-if="showDetailsModal"
      class="fixed inset-0 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-neutral-light">
        <!-- Header del modal -->
        <div class="bg-gradient-to-r from-primary-mint to-teal-500 p-6 text-white rounded-t-2xl">
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
        <div class="p-6">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Información del servicio -->
            <div class="bg-neutral-bg rounded-xl p-4 border border-neutral-light">
              <h3 class="font-semibold text-neutral-dark mb-4 text-sm flex items-center gap-2">
                <span>📋</span>
                Información del Servicio
              </h3>
              <div class="space-y-3 text-sm">
                <div class="flex justify-between items-center">
                  <span class="text-neutral-medium">Servicio:</span>
                  <span class="font-semibold text-neutral-dark">{{ selectedAppointment?.service?.name }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-neutral-medium">Precio:</span>
                  <span class="font-bold text-primary-mint">${{ selectedAppointment?.service?.price || '0' }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-neutral-medium">Proveedor:</span>
                  <span class="font-semibold text-neutral-dark">{{ selectedAppointment?.service?.providerName || 'No especificado' }}</span>
                </div>
                <div class="flex justify-between items-start">
                  <span class="text-neutral-medium">Descripción:</span>
                  <span class="text-neutral-dark text-right text-xs max-w-[200px]">
                    {{ selectedAppointment?.service?.description || selectedAppointment?.details || "Sin descripción adicional" }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Información de la cita -->
            <div class="bg-neutral-bg rounded-xl p-4 border border-neutral-light">
              <h3 class="font-semibold text-neutral-dark mb-4 text-sm flex items-center gap-2">
                <span>📅</span>
                Detalles de la Cita
              </h3>
              <div class="space-y-3 text-sm">
                <div class="flex justify-between items-center">
                  <span class="text-neutral-medium">Mascota:</span>
                  <span class="font-semibold text-neutral-dark">{{ selectedAppointment?.pet?.name }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-neutral-medium">Tipo:</span>
                  <span class="text-neutral-dark">{{ selectedAppointment?.pet?.type || '-' }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-neutral-medium">Fecha:</span>
                  <span class="font-semibold text-neutral-dark">{{ formatDate(selectedAppointment?.date) }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-neutral-medium">Hora:</span>
                  <span class="font-semibold text-neutral-dark">{{ selectedAppointment?.time }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-neutral-medium">Estado:</span>
                  <span :class="statusBadgeClass(selectedAppointment?.status)" class="px-2 py-1 rounded-full text-xs font-semibold">
                    {{ translateStatus(selectedAppointment?.status) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Acciones adicionales -->
          <div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <h4 class="font-semibold text-blue-800 mb-2 text-sm">Acciones Disponibles</h4>
            <div class="flex flex-wrap gap-2">
              <button
                v-if="selectedAppointment?.status === 'pending' || selectedAppointment?.status === 'confirmed'"
                class="px-4 py-2 bg-primary-mint text-white rounded-lg hover:bg-state-success transition-all duration-300 text-sm font-medium"
                @click="onReschedule(selectedAppointment)"
              >
                Reprogramar
              </button>
              <button
                v-if="selectedAppointment?.status === 'pending' || selectedAppointment?.status === 'confirmed'"
                class="px-4 py-2 bg-state-error text-white rounded-lg hover:bg-red-600 transition-all duration-300 text-sm font-medium"
                @click="onCancel(selectedAppointment)"
              >
                Cancelar Cita
              </button>
              <button
                class="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-purple-600 transition-all duration-300 text-sm font-medium"
                @click="closeDetailsModal"
              >
                Cerrar
              </button>
            </div>
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
    if (showDetailsModal.value) closeDetailsModal();
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
  if (showDetailsModal.value) closeDetailsModal();
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

<style scoped>
.bg-neutral-bg {
  background-color: #f8fafc;
}

.border-neutral-light {
  border-color: #e2e8f0;
}

.border-neutral-medium {
  border-color: #cbd5e1;
}

.text-neutral-dark {
  color: #1e293b;
}

.text-neutral-medium {
  color: #64748b;
}

.bg-primary-mint {
  background-color: #0d9488;
}

.hover\:bg-state-success:hover {
  background-color: #059669;
}

.bg-state-error {
  background-color: #dc2626;
}

.hover\:bg-red-600:hover {
  background-color: #b91c1c;
}

.bg-secondary {
  background-color: #8b5cf6;
}

.hover\:bg-purple-600:hover {
  background-color: #7c3aed;
}

.cursor-not-allowed {
  cursor: not-allowed;
}
</style>