<template>
  <AdminLayout>
    <div class="px-6 max-w-6xl mx-auto w-full pt-4">
      <h1 class="text-2xl font-bold mb-6 text-neutral-dark">Platform Settings</h1>

      <!-- Información General -->
      <div class="bg-neutral-light rounded-2xl shadow-lg p-6 mb-6">
        <h2 class="text-lg font-semibold text-neutral-dark mb-4">General Info</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-neutral-dark">Platform Name</label>
            <input v-model="settings.platformName" type="text" class="w-full border border-neutral-medium rounded-lg p-2 focus:ring-2 focus:ring-primary focus:outline-none">
          </div>
          <div>
            <label class="block text-sm font-medium text-neutral-dark">Platform Logo URL</label>
            <input v-model="settings.logoUrl" type="text" class="w-full border border-neutral-medium rounded-lg p-2 focus:ring-2 focus:ring-primary focus:outline-none">
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-neutral-dark">Description</label>
            <textarea v-model="settings.description" rows="3" class="w-full border border-neutral-medium rounded-lg p-2 focus:ring-2 focus:ring-primary focus:outline-none"></textarea>
          </div>
        </div>
      </div>

      <!-- Planes y Precios -->
      <div class="bg-neutral-light rounded-2xl shadow-lg p-6 mb-6">
        <h2 class="text-lg font-semibold text-neutral-dark mb-4">Plans & Pricing</h2>
        <div class="space-y-4">
          <div v-for="(plan, index) in settings.plans" :key="index" class="flex gap-4 items-center">
            <input v-model="plan.name" type="text" placeholder="Plan Name" class="flex-1 border border-neutral-medium rounded-lg p-2 focus:ring-2 focus:ring-primary focus:outline-none">
            <input v-model="plan.price" type="number" placeholder="Price" class="w-32 border border-neutral-medium rounded-lg p-2 focus:ring-2 focus:ring-primary focus:outline-none">
            <button @click="removePlan(index)" class="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">Delete</button>
          </div>
          <button @click="addPlan" class="px-4 py-2 bg-primary-mint text-white rounded-lg hover:bg-primary transition">+ Add Plan</button>
        </div>
      </div>

      <!-- Botones Guardar / Cancelar -->
      <div class="flex justify-end gap-4 mt-6">
        <button 
          @click="resetSettings" 
          class="px-6 py-2 rounded-lg border border-neutral-medium text-neutral-dark hover:bg-neutral-medium hover:text-white transition"
        >
          Cancel
        </button>
        <button 
          @click="saveSettings" 
          class="px-6 py-2 rounded-lg bg-primary-mint text-white hover:bg-primary transition"
        >
          Save Changes
        </button>
      </div>
    </div>
    <Chatbot />
  </AdminLayout>
</template>

<script>
import AdminLayout from "@/components/AdminLayout.vue";
import Chatbot from "@/components/Chatbot.vue";

export default {
  name: "AdminSettings",
  components: { AdminLayout , Chatbot },
  data() {
    return {
      settings: {
        platformName: "Pet Services Platform",
        logoUrl: "https://via.placeholder.com/150",
        description: "Manage all your pet services in one place.",
        plans: [
          { name: "Basic", price: 10 },
          { name: "Standard", price: 25 },
          { name: "Premium", price: 50 }
        ]
      }
    };
  },
  methods: {
    addPlan() {
      this.settings.plans.push({ name: "", price: 0 });
    },
    removePlan(index) {
      this.settings.plans.splice(index, 1);
    },
    resetSettings() {
      alert("Changes canceled");
    },
    saveSettings() {
      alert("Settings saved successfully");
    }
  }
};
</script>
