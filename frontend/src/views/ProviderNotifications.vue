<template>
  <ProviderLayout>
    <div class="px-6 max-w-5xl mx-auto w-full pt-4">
      <h1 class="text-2xl font-bold mb-6 text-neutral-dark">Notificaciones</h1>

      <!-- Lista de notificaciones -->
      <div class="space-y-4">
        <div 
          v-for="notification in notifications" 
          :key="notification.id" 
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
            @click="markAsRead(notification.id)" 
            class="ml-4 text-xs px-3 py-1 rounded-lg"
            :class="notification.read ? 'bg-gray-200 text-gray-600' : 'bg-primary-mint text-white'"
          >
            {{ notification.read ? 'Leído' : 'Marcar leído' }}
          </button>
        </div>
      </div>
    </div>
  </ProviderLayout>
</template>

<script>
import ProviderLayout from "@/components/ProviderLayout.vue";

export default {
  name: "ProviderNotifications",
  components: { ProviderLayout },
  data() {
    return {
      notifications: [
        { id: 1, type: "appointment", title: "Nueva cita reservada", message: "Juan Pérez reservó una cita para Firulais.", date: "26/08/2025 - 09:15 AM", read: false },
        { id: 2, type: "cancel", title: "Cita cancelada", message: "Ana Gómez canceló la cita de Mishi.", date: "26/08/2025 - 08:40 AM", read: false },
        { id: 3, type: "reminder", title: "Recordatorio", message: "Tienes 5 citas programadas para hoy.", date: "25/08/2025 - 07:00 PM", read: true },
        { id: 4, type: "system", title: "Mensaje del sistema", message: "Recuerda actualizar la información de tu negocio.", date: "24/08/2025 - 06:30 PM", read: true },
      ]
    };
  },
  methods: {
    icon(type) {
      switch (type) {
        case "appointment": return "📅";
        case "cancel": return "❌";
        case "reminder": return "⏰";
        case "system": return "⚙️";
        default: return "🔔";
      }
    },
    iconBg(type) {
      switch (type) {
        case "appointment": return "bg-green-200";
        case "cancel": return "bg-red-200";
        case "reminder": return "bg-yellow-200";
        case "system": return "bg-blue-200";
        default: return "bg-gray-200";
      }
    },
    markAsRead(id) {
      const notif = this.notifications.find(n => n.id === id);
      if (notif) notif.read = true;
    }
  }
};
</script>
