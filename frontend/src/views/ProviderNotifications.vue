<template>
  <ProviderLayout>
    <div class="px-6 max-w-5xl mx-auto w-full pt-4">
      <h1 class="text-2xl font-bold mb-6 text-neutral-dark">Notificaciones</h1>

      <!-- Lista de notificaciones -->
      <div class="space-y-4">
        <div 
          v-for="notification in notifications" 
          :key="notification._id" 
          class="flex items-start p-4 bg-neutral-light rounded-2xl shadow hover:shadow-md transition"
        >
          <!-- Icono -->
          <div 
            class="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full"
            :class="iconBg(notification.type)"
          >
            <span class="text-2xl">
              {{ icon(notification.type) }}
            </span>
          </div>

          <!-- Contenido -->
          <div class="ml-4 flex-1">
            <h2 class="font-semibold text-neutral-dark">
              {{ notification.title }}
            </h2>
            <p class="text-sm text-neutral-dark/70">{{ notification.message }}</p>
            <p class="text-xs text-neutral-dark/50 mt-1">
              {{ notification.date }}
            </p>
          </div>

          <!-- Estado leído/no leído -->
          <button 
            @click="markAsRead(notification._id)" 
            class="ml-4 text-xs px-3 py-1 rounded-lg"
            :class="notification.read ? 'bg-gray-200 text-gray-600' : 'bg-primary-mint text-white'"
          >
            {{ notification.read ? 'Leído' : 'Marcar leído' }}
          </button>
        </div>
      </div>
    </div>
    <Chatbot />
  </ProviderLayout>
</template>

<script>
import ProviderLayout from "@/components/ProviderLayout.vue";
import Chatbot from "@/components/Chatbot.vue";
import api from "@/api/api"; // CORRECTO

export default {
  name: "ProviderNotifications",
  components: { ProviderLayout , Chatbot},

  data() {
    return {
      notifications: [],
      loading: true
    };
  },

  async created() {
    await this.loadNotifications();
  },

  methods: {
    async loadNotifications() {
      try {
        const providerId = localStorage.getItem("userId");

        const res = await api.get(`/provider-notifications/${providerId}`);
        this.notifications = res.data;
      } catch (error) {
        console.log(error);
      } finally {
        this.loading = false;
      }
    },

    async markAsRead(id) {
      try {
        await api.put(`/provider-notifications/${id}/read`);
        const notif = this.notifications.find(n => n._id === id);
        if (notif) notif.read = true;
      } catch (error) {
        console.log(error);
      }
    },

    icon(type) {
      switch (type) {
        case "appointment": return "📅";
        case "cancel": return "❌";
        case "approval": return "✔️";
        case "system": return "⚙️";
        default: return "🔔";
      }
    },

    iconBg(type) {
      switch (type) {
        case "appointment": return "bg-green-200";
        case "cancel": return "bg-red-200";
        case "approval": return "bg-blue-300";
        case "system": return "bg-gray-200";
        default: return "bg-gray-200";
      }
    }
  }
};
</script>
