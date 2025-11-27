<template>
  <Layout>
    <div class="p-6 max-w-4xl mx-auto bg-neutral-bg min-h-[80vh] pt-8">
      <h1 class="text-2xl font-bold mb-6 text-neutral-dark">Mis Citas</h1>

      <!-- Filtro por mascota -->
      <div class="mb-6 flex items-center gap-4">
        <label class="text-neutral-dark font-medium">Filtrar por mascota:</label>
        <select
          v-model="selectedPet"
          class="px-3 py-2 border border-neutral-medium rounded-lg"
        >
          <option value="">Todas las mascotas</option>
          <option v-for="pet in pets" :key="pet._id" :value="pet._id">
            {{ pet.name }}
          </option>
        </select>
      </div>

      <!-- Lista de citas -->
      <div v-if="loading" class="text-neutral-medium">
        Cargando citas...
      </div>

      <div v-else-if="filteredAppointments.length === 0" class="text-neutral-medium">
        No tienes citas programadas.
      </div>

      <ul v-else class="space-y-4">
        <li
          v-for="appt in filteredAppointments"
          :key="appt._id"
          class="bg-white shadow-lg rounded-2xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center transition"
        >
          <div class="flex items-start gap-4 mb-2 md:mb-0">
            <div>
              <p class="font-semibold text-lg text-neutral-dark">
                {{ appt.service?.name || "Servicio" }}
              </p>

              <p class="text-neutral-medium text-sm">
                Mascota: {{ appt.pet?.name || "No disponible" }}
                ({{ appt.pet?.type || "-" }})
              </p>

              <p class="text-neutral-medium text-sm">
                {{ appt.date }} a las {{ appt.time }}
              </p>

              <p class="text-neutral-medium text-sm">
                Estado:
                <span :class="statusClass(appt.status)">
                  {{ translateStatus(appt.status) }}
                </span>
              </p>
            </div>
          </div>

          <!-- Botones -->
          <div class="flex gap-2 mt-2 md:mt-0">
            <button
              class="px-3 py-1 bg-state-error text-white rounded-lg"
              @click="onCancel(appt)"
            >
              Cancelar
            </button>

            <button
              class="px-3 py-1 bg-primary-mint text-white rounded-lg"
              @click="onReschedule(appt)"
            >
              Reprogramar
            </button>

            <button
              class="px-3 py-1 bg-secondary text-white rounded-lg"
              @click="viewDetails(appt)"
            >
              Más Información
            </button>
          </div>
        </li>
      </ul>

      <!-- MODAL REPROGRAMAR -->
      <div
        v-if="showModal"
        class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      >
        <div class="bg-neutral-light rounded-xl p-6 w-96 relative">
          <h2 class="text-xl font-bold mb-4 text-neutral-dark">
            Reprogramar: {{ selectedAppointment?.service?.name }}
          </h2>

          <label class="block mb-2 text-sm font-medium text-neutral-dark">
            Nueva Fecha:
          </label>
          <input
            type="date"
            v-model="newDate"
            class="w-full p-2 border border-neutral-medium rounded mb-4"
          />

          <label class="block mb-2 text-sm font-medium text-neutral-dark">
            Nueva Hora:
          </label>
          <input
            type="time"
            v-model="newTime"
            class="w-full p-2 border border-neutral-medium rounded mb-4"
          />

          <div class="flex justify-end gap-2">
            <button class="px-4 py-2 rounded bg-neutral-medium text-white"
              @click="closeModal">
              Cancelar
            </button>
            <button class="px-4 py-2 rounded bg-primary-mint text-white"
              @click="confirmReschedule">
              Confirmar
            </button>
          </div>
        </div>
      </div>

      <!-- MODAL DETALLES -->
      <div
        v-if="showDetailsModal"
        class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 overflow-auto"
      >
        <div class="bg-neutral-light rounded-2xl p-6 w-full max-w-3xl relative">
          <h2 class="text-2xl font-bold mb-2 text-neutral-dark">
            {{ selectedAppointment?.service?.name }} -
            {{ selectedAppointment?.pet?.name }}
          </h2>

          <p class="text-neutral-medium mb-2">
            <strong>Tipo de mascota:</strong> {{ selectedAppointment?.pet?.type }}
          </p>

          <p class="text-neutral-medium mb-2">
            <strong>Fecha y hora:</strong>
            {{ selectedAppointment?.date }} a las {{ selectedAppointment?.time }}
          </p>

          <p class="text-neutral-medium mb-4">
            <strong>Detalles:</strong>
            {{ selectedAppointment?.details || "Sin detalles adicionales" }}
          </p>

          <div class="flex justify-end">
            <button
              class="px-4 py-2 rounded bg-primary-mint text-white"
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

// Traducción de estados del backend
const translateStatus = (status) => {
  return {
    pending: "pendiente",
    confirmed: "confirmada",
    cancelled: "cancelada",
    completed: "completada",
    reprogramada: "reprogramada",
  }[status] || status;
};

// Colores
const statusClass = (status) => {
  const s = translateStatus(status);
  return {
    pendiente: "text-yellow-600",
    confirmada: "text-green-600",
    cancelada: "text-red-600",
    completada: "text-blue-600",
    reprogramada: "text-blue-600",
  }[s] || "text-neutral-dark";
};

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
    appointments.value = response.data; // ← FIX
  } catch (err) {
    console.error("Error obteniendo citas:", err);
  } finally {
    loading.value = false;
  }
};

// Cancelar cita
const onCancel = async (appt) => {
  if (!confirm("¿Deseas cancelar esta cita?")) return;

  try {
    await appointmentService.cancel(appt._id);
    await fetchAppointments();
  } catch (err) {
    console.error(err);
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
    return alert("Selecciona fecha y hora");

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
