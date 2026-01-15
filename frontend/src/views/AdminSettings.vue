<template>
  <AdminLayout>
    <div class="px-6 max-w-6xl mx-auto w-full pt-6 mt-8">
      <!-- Header -->
      <div class="mb-8 mt-12">
        <h1 class="text-3xl font-bold text-neutral-dark mb-2">Configuración de la Plataforma</h1>
        <p class="text-neutral-medium">Gestiona la configuración general y planes de la plataforma</p>
      </div>

      <!-- Información General -->
      <div class="bg-white rounded-2xl shadow-sm border border-neutral-light p-6 mb-8">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-2 h-8 bg-primary-mint rounded-full"></div>
          <h2 class="text-xl font-semibold text-neutral-dark">Información General</h2>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-neutral-dark mb-2">Nombre de la Plataforma</label>
            <input 
              v-model="settings.platformName" 
              type="text" 
              class="w-full px-4 py-3 border border-neutral-medium rounded-lg focus:ring-2 focus:ring-primary-mint focus:border-primary-mint transition-colors duration-200 bg-white"
              placeholder="Ingresa el nombre de la plataforma"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-neutral-dark mb-2">URL del Logo</label>
            <input 
              v-model="settings.logoUrl" 
              type="text" 
              class="w-full px-4 py-3 border border-neutral-medium rounded-lg focus:ring-2 focus:ring-primary-mint focus:border-primary-mint transition-colors duration-200 bg-white"
              placeholder="https://ejemplo.com/logo.png"
            >
          </div>
          <div class="lg:col-span-2">
            <label class="block text-sm font-medium text-neutral-dark mb-2">Descripción</label>
            <textarea 
              v-model="settings.description" 
              rows="4" 
              class="w-full px-4 py-3 border border-neutral-medium rounded-lg focus:ring-2 focus:ring-primary-mint focus:border-primary-mint transition-colors duration-200 resize-none bg-white"
              placeholder="Describe los servicios de la plataforma"
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Planes y Precios -->
      <div class="bg-white rounded-2xl shadow-sm border border-neutral-light p-6 mb-8">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-2 h-8 bg-primary-mint rounded-full"></div>
          <h2 class="text-xl font-semibold text-neutral-dark">Planes y Precios</h2>
        </div>
        
        <div class="space-y-4">
          <div 
            v-for="(plan, index) in settings.plans" 
            :key="index" 
            class="flex flex-col sm:flex-row gap-4 items-start sm:items-center p-4 bg-neutral-bg rounded-lg border border-neutral-light hover:border-primary-mint transition-colors duration-200"
          >
            <div class="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              <div>
                <label class="block text-sm font-medium text-neutral-dark mb-2">Nombre del Plan</label>
                <input 
                  v-model="plan.name" 
                  type="text" 
                  placeholder="Ej: Básico, Premium..." 
                  class="w-full px-3 py-2 border border-neutral-medium rounded-lg focus:ring-2 focus:ring-primary-mint focus:border-primary-mint transition-colors duration-200 bg-white"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-neutral-dark mb-2">Precio Mensual</label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-medium">$</span>
                  <input 
                    v-model.number="plan.price" 
                    type="number" 
                    min="0"
                    placeholder="0.00" 
                    class="w-full pl-8 pr-3 py-2 border border-neutral-medium rounded-lg focus:ring-2 focus:ring-primary-mint focus:border-primary-mint transition-colors duration-200 bg-white"
                  >
                </div>
              </div>
            </div>
            <button 
              @click="removePlan(index)" 
              class="px-4 py-2 bg-state-error text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-state-error focus:ring-offset-1 transition-all duration-200 font-medium text-sm whitespace-nowrap mt-4 sm:mt-0"
            >
              🗑️ Eliminar
            </button>
          </div>
          
          <button 
            @click="addPlan" 
            class="flex items-center gap-2 px-6 py-3 bg-primary-mint text-white rounded-lg hover:bg-state-success focus:ring-2 focus:ring-primary-mint focus:ring-offset-2 transition-all duration-200 font-medium"
          >
            <span>+</span>
            <span>Agregar Plan</span>
          </button>
        </div>
      </div>

      <!-- Vista previa de planes -->
      <div class="bg-white rounded-2xl shadow-sm border border-neutral-light p-6 mb-8">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-2 h-8 bg-primary-mint rounded-full"></div>
          <h2 class="text-xl font-semibold text-neutral-dark">Vista Previa de Planes</h2>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div 
            v-for="(plan, index) in settings.plans" 
            :key="'preview-' + index"
            class="border-2 border-neutral-light rounded-xl p-6 text-center hover:border-primary-mint transition-colors duration-300"
          >
            <h3 class="text-lg font-bold text-neutral-dark mb-2">{{ plan.name || 'Nuevo Plan' }}</h3>
            <div class="text-3xl font-bold text-primary-mint mb-4">${{ plan.price || '0' }}</div>
            <p class="text-neutral-medium text-sm">Plan {{ plan.name ? plan.name.toLowerCase() : 'básico' }} con todas las características incluidas</p>
          </div>
        </div>
      </div>

      <!-- Botones Guardar / Cancelar -->
      <div class="flex flex-col sm:flex-row justify-end gap-4 mt-8 p-6 bg-white rounded-2xl shadow-sm border border-neutral-light">
        <button 
          @click="resetSettings" 
          class="px-8 py-3 bg-white border border-neutral-medium text-neutral-dark rounded-lg hover:bg-neutral-bg focus:ring-2 focus:ring-neutral-medium focus:ring-offset-2 transition-all duration-200 font-medium order-2 sm:order-1"
        >
          Cancelar Cambios
        </button>
        <button 
          @click="saveSettings" 
          class="px-8 py-3 bg-primary-mint text-white rounded-lg hover:bg-state-success focus:ring-2 focus:ring-primary-mint focus:ring-offset-2 transition-all duration-200 font-medium order-1 sm:order-2"
        >
          💾 Guardar Cambios
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
  components: { AdminLayout, Chatbot },
  data() {
    return {
      settings: {
        platformName: "Pet Services Platform",
        logoUrl: "https://via.placeholder.com/150",
        description: "Manage all your pet services in one place.",
        plans: [
          { name: "Básico", price: 10 },
          { name: "Estándar", price: 25 },
          { name: "Premium", price: 50 }
        ]
      },
      originalSettings: null
    };
  },
  methods: {
    addPlan() {
      this.settings.plans.push({ name: "", price: 0 });
    },
    removePlan(index) {
      if (this.settings.plans.length > 1) {
        this.settings.plans.splice(index, 1);
      } else {
        alert("Debe haber al menos un plan en la plataforma");
      }
    },
    resetSettings() {
      if (confirm("¿Estás seguro de que deseas descartar los cambios?")) {
        this.settings = JSON.parse(JSON.stringify(this.originalSettings));
      }
    },
    saveSettings() {
      // Validación básica
      const emptyPlan = this.settings.plans.some(plan => !plan.name.trim() || plan.price === null);
      if (emptyPlan) {
        alert("Por favor, completa todos los campos de los planes");
        return;
      }
      
      // Aquí iría la lógica para guardar en la API
      console.log("Configuración guardada:", this.settings);
      this.originalSettings = JSON.parse(JSON.stringify(this.settings));
      alert("✅ Configuración guardada exitosamente");
    }
  },
  mounted() {
    // Guardar copia original para reset
    this.originalSettings = JSON.parse(JSON.stringify(this.settings));
  }
};
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

.hover\:bg-red-700:hover {
  background-color: #b91c1c;
}

.focus\:ring-primary-mint:focus {
  --tw-ring-color: #0d9488;
}

.focus\:ring-state-error:focus {
  --tw-ring-color: #dc2626;
}
</style>