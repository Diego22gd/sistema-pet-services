<template>
  <Layout>
    <div class="p-6 max-w-4xl mx-auto bg-neutral-bg min-h-[80vh] pt-8">
      <h1 class="text-2xl font-bold mb-6 text-neutral-dark">Mis Citas</h1>

      <!-- Filtro por mascota -->
      <div class="mb-6 flex items-center gap-4">
        <label class="text-neutral-dark font-medium">Filtrar por mascota:</label>
        <select v-model="selectedPet" class="px-3 py-2 border border-neutral-medium rounded-lg">
          <option value="">Todas las mascotas</option>
          <option v-for="pet in pets" :key="pet._id || pet.id" :value="pet._id || pet.id">
            {{ pet.name }}
          </option>
        </select>
      </div>

      <!-- Lista de citas -->
      <div v-if="loading" class="text-neutral-medium">Cargando citas...</div>
      <div v-else-if="filteredAppointments.length === 0" class="text-neutral-medium">
        No tienes citas programadas.
      </div>

      <ul v-else class="space-y-4">
        <li
          v-for="appointment in filteredAppointments"
          :key="appointment._id || appointment.id"
          :class="[
            'bg-white shadow-lg rounded-2xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center transition',
            { 'bg-yellow-50': appointment.status === 'Pendiente', 'bg-red-50': appointment.status === 'Cancelada' }
          ]"
        >
          <div class="flex items-center gap-4 mb-2 md:mb-0">
            <img
              :src="appointment.pet.image"
              alt="Mascota"
              class="w-16 h-16 object-cover rounded-full border border-neutral-medium"
            />
            <div>
              <p class="font-semibold text-lg text-neutral-dark">{{ appointment.serviceName }}</p>
              <p class="text-neutral-medium text-sm">
                Mascota: {{ appointment.pet.name }} ({{ appointment.pet.type }})
              </p>
              <p class="text-neutral-medium text-sm">
                {{ appointment.date }} a las {{ appointment.time }}
              </p>
              <p class="text-neutral-medium text-sm">
                Estado:
                <span :class="statusClass(appointment.status)">
                  {{ appointment.status }}
                </span>
              </p>
            </div>
          </div>

          <!-- Botones de acción -->
          <div class="flex gap-2 mt-2 md:mt-0">
            <button
              class="px-3 py-1 bg-state-error text-white rounded-lg hover:opacity-90 transition"
              @click="onCancel(appointment)"
            >
              Cancelar
            </button>
            <button
              class="px-3 py-1 bg-primary-mint text-white rounded-lg hover:bg-state-success transition"
              @click="onReschedule(appointment)"
            >
              Reprogramar
            </button>
            <button
              class="px-3 py-1 bg-secondary text-white rounded-lg hover:bg-secondary-dark transition"
              @click="viewDetails(appointment)"
            >
              Más Información
            </button>
          </div>
        </li>
      </ul>

      <!-- Modal Reprogramar -->
      <div
        v-if="showModal"
        class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      >
        <div class="bg-neutral-light rounded-xl p-6 w-96 relative">
          <h2 class="text-xl font-bold mb-4 text-neutral-dark">
            Reprogramar: {{ selectedAppointment.serviceName }}
          </h2>
          <label class="block mb-2 text-sm font-medium text-neutral-dark">Nueva Fecha:</label>
          <input
            type="date"
            v-model="newDate"
            class="w-full p-2 border border-neutral-medium rounded mb-4"
          />
          <label class="block mb-2 text-sm font-medium text-neutral-dark">Nueva Hora:</label>
          <input
            type="time"
            v-model="newTime"
            class="w-full p-2 border border-neutral-medium rounded mb-4"
          />
          <div class="flex justify-end gap-2">
            <button class="px-4 py-2 rounded bg-neutral-medium text-white" @click="closeModal">
              Cancelar
            </button>
            <button class="px-4 py-2 rounded bg-primary-mint text-white" @click="confirmReschedule">
              Confirmar
            </button>
          </div>
        </div>
      </div>

      <!-- Modal Detalles -->
      <div
        v-if="showDetailsModal"
        class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 overflow-auto"
      >
        <div class="bg-neutral-light rounded-2xl p-6 w-full max-w-3xl relative">
          <h2 class="text-2xl font-bold mb-2 text-neutral-dark">
            {{ selectedAppointment.serviceName }} - {{ selectedAppointment.pet.name }}
          </h2>
          <p class="text-neutral-medium mb-2">
            <strong>Tipo de mascota:</strong> {{ selectedAppointment.pet.type }}
          </p>
          <p class="text-neutral-medium mb-2">
            <strong>Fecha y hora:</strong> {{ selectedAppointment.date }} a las
            {{ selectedAppointment.time }}
          </p>
          <p class="text-neutral-medium mb-2">
            <strong>Ubicación:</strong> {{ selectedAppointment.location }}
          </p>
          <p class="text-neutral-medium mb-4">
            <strong>Detalles:</strong> {{ selectedAppointment.details }}
          </p>

          <div class="flex overflow-x-auto gap-4 mb-4">
            <img
              v-for="(img, idx) in selectedAppointment.images"
              :key="idx"
              :src="img"
              class="w-48 h-32 object-cover rounded-lg flex-shrink-0"
            />
          </div>

          <div class="flex justify-end">
            <button class="px-4 py-2 rounded bg-primary-mint text-white" @click="closeDetailsModal">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script setup>
import { onMounted, ref, computed } from "vue";
import { useUserStore } from "@/stores/userStore";
import appointmentService from "@/services/appointmentService";

import Layout from "@/components/Layout.vue";

const userStore = useUserStore();

const appointments = ref([]);
const selectedPet = ref("");
const loading = ref(false);
const showModal = ref(false);
const showDetailsModal = ref(false);
const selectedAppointment = ref(null);
const newDate = ref("");
const newTime = ref("");

const filteredAppointments = computed(() => {
  if (!selectedPet.value) return appointments.value;
  return appointments.value.filter(
    (a) => (a.pet._id || a.pet.id) === selectedPet.value
  );
});

const statusClass = (status) => {
  switch (status) {
    case "Confirmada":
      return "text-green-600";
    case "Pendiente":
      return "text-yellow-600";
    case "Reprogramada":
      return "text-blue-600";
    case "Cancelada":
      return "text-red-600";
    default:
      return "text-neutral-dark";
  }
};

const fetchAppointments = async () => {
  try {
    loading.value = true;
    const data = await appointmentService.getByUser(userStore.userId);
    appointments.value = data;
  } catch (err) {
    console.error("Error obteniendo citas:", err);
  } finally {
    loading.value = false;
  }
};

const onCancel = async (appointment) => {
  if (!confirm("¿Deseas cancelar esta cita?")) return;
  try {
    await appointmentService.cancel(appointment._id || appointment.id);
    await fetchAppointments();
  } catch (err) {
    console.error(err);
  }
};

const onReschedule = (appointment) => {
  selectedAppointment.value = appointment;
  newDate.value = appointment.date;
  newTime.value = appointment.time;
  showModal.value = true;
};

const confirmReschedule = async () => {
  if (!newDate.value || !newTime.value) {
    alert("Selecciona fecha y hora");
    return;
  }
  try {
    await appointmentService.reschedule(
      selectedAppointment.value._id || selectedAppointment.value.id,
      newDate.value,
      newTime.value
    );
    await fetchAppointments();
    closeModal();
  } catch (err) {
    console.error(err);
  }
};

const viewDetails = (appointment) => {
  selectedAppointment.value = appointment;
  showDetailsModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  selectedAppointment.value = null;
};

const closeDetailsModal = () => {
  showDetailsModal.value = false;
  selectedAppointment.value = null;
};

onMounted(async () => {
  if (!userStore.isLoggedIn) await userStore.fetchUserData();
  await userStore.fetchUserPets();
  await fetchAppointments();
});
</script>
