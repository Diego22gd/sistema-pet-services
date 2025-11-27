<template>
  <ProviderLayout>
    <div class="px-6 max-w-5xl mx-auto w-full pt-4">
      <h1 class="text-2xl font-bold mb-6 text-neutral-dark">Perfil del Proveedor</h1>

      <div v-if="provider" class="grid grid-cols-1 md:grid-cols-2 gap-6">

        <!-- Información General -->
        <div class="bg-neutral-light rounded-2xl shadow-lg p-6">
          <h2 class="text-lg font-semibold text-neutral-dark mb-4">
            Información General
          </h2>

          <div class="space-y-4">

            <div>
              <label class="block text-sm font-medium text-neutral-dark">
                Nombre del Negocio
              </label>
              <input
                v-model="provider.user.businessName"
                type="text"
                class="w-full border border-neutral-medium rounded-lg p-2"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-neutral-dark">
                Tipo de Servicio
              </label>
              <input
                v-model="provider.user.serviceType"
                type="text"
                class="w-full border border-neutral-medium rounded-lg p-2"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-neutral-dark">
                Bio / Descripción
              </label>
              <textarea
                v-model="provider.profile.bio"
                rows="3"
                class="w-full border border-neutral-medium rounded-lg p-2"
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-neutral-dark">
                Experiencia (años)
              </label>
              <input
                v-model="provider.profile.experience"
                type="number"
                class="w-full border rounded-lg p-2"
              />
            </div>
          </div>
        </div>

        <!-- Contacto -->
        <div class="bg-neutral-light rounded-2xl shadow-lg p-6">
          <h2 class="text-lg font-semibold text-neutral-dark mb-4">
            Contacto
          </h2>

          <div class="space-y-4">

            <div>
              <label class="block text-sm font-medium text-neutral-dark">
                Teléfono
              </label>
              <input
                v-model="provider.user.phone"
                type="text"
                class="w-full border border-neutral-medium rounded-lg p-2"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-neutral-dark">
                Dirección
              </label>
              <input
                v-model="provider.profile.address"
                type="text"
                class="w-full border border-neutral-medium rounded-lg p-2"
              />
            </div>

          </div>
        </div>

      </div>

      <!-- Horarios -->
      <div
        v-if="provider"
        class="bg-neutral-light rounded-2xl shadow-lg p-6 mt-6"
      >
        <h2 class="text-lg font-semibold text-neutral-dark mb-4">Horarios</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="day in weekDays"
            :key="day"
            class="flex items-center gap-4"
          >
            <label class="w-24 font-medium text-neutral-dark">{{ day }}</label>

            <input
              type="time"
              v-model="provider.profile.schedule[day].open"
              class="border border-neutral-medium rounded-lg p-2"
            />

            <span>-</span>

            <input
              type="time"
              v-model="provider.profile.schedule[day].close"
              class="border border-neutral-medium rounded-lg p-2"
            />
          </div>
        </div>
      </div>

      <!-- Botones -->
      <div
        v-if="provider"
        class="flex justify-end gap-4 mt-6 mb-4"
      >
        <button
          @click="loadProfile"
          class="px-6 py-2 rounded-lg border border-neutral-medium text-neutral-dark hover:bg-neutral-medium hover:text-white transition"
        >
          Cancelar
        </button>

        <button
          @click="saveProfile"
          class="px-6 py-2 rounded-lg bg-primary-mint text-white hover:bg-primary transition"
        >
          Guardar Cambios
        </button>
      </div>
    </div>
    <Chatbot />
  </ProviderLayout>
</template>

<script>
import ProviderLayout from "@/components/ProviderLayout.vue";
import Chatbot from "@/components/Chatbot.vue";
import api from "@/api/api";
import { useUserStore } from "@/stores/userStore";

export default {
  name: "ProviderProfile",
  components: { ProviderLayout, Chatbot },

  data() {
    return {
      provider: null,
      weekDays: [
        "Lunes",
        "Martes",
        "Miércoles",
        "Jueves",
        "Viernes",
        "Sábado",
        "Domingo",
      ],
    };
  },

  async created() {
    await this.loadProfile();
  },

  methods: {
    async loadProfile() {
      try {
        const userStore = useUserStore();
        const userId = userStore.user._id;

        const { data } = await api.get(`/provider/profile/${userId}`);

        // Asegurar estructura de horarios
        if (!data.profile.schedule) data.profile.schedule = {};
        this.weekDays.forEach((day) => {
          if (!data.profile.schedule[day]) {
            data.profile.schedule[day] = { open: "", close: "" };
          }
        });

        this.provider = data;
      } catch (err) {
        console.error("❌ Error cargando perfil", err);
      }
    },

    async saveProfile() {
      try {
        const userStore = useUserStore();
        const userId = userStore.user._id;

        // Enviar SOLO el perfil (profile)
        await api.put(`/provider/profile/${userId}`, {
          ...this.provider.profile,
          ...this.provider.user, // también actualiza user
        });

        alert("Perfil actualizado correctamente");
      } catch (error) {
        console.error(error);
        alert("Error al guardar los datos");
      }
    },
  },
};
</script>
