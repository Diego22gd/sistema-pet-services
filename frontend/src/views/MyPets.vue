<template>
  <Layout>
    <!-- Chatbot Component -->
    <Chatbot />
    
    <!-- Contenido principal -->
    <div class="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 mt-12">
      <div class="container mx-auto px-4 py-8 md:py-12">
        <!-- Header de la página -->
        <div class="mb-8 md:mb-12 text-center ">
          <div class="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-white shadow-lg mb-4 md:mb-6 mt-12">
            <span class="text-3xl md:text-4xl">🐾</span>
          </div>
          <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 md:mb-4">
            Mis Mascotas
          </h1>
          <p class="text-base md:text-lg text-gray-700 max-w-2xl mx-auto">
            Gestiona y cuida a tus compañeros peludos en un solo lugar
          </p>
        </div>

        <!-- Barra de acciones -->
        <div class="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-200 hover:shadow-2xl transition-shadow duration-300">
          <div class="flex flex-col sm:flex-row justify-between items-center gap-4 md:gap-6">
            <div class="text-center sm:text-left">
              <div class="text-2xl md:text-3xl font-bold text-emerald-600 mb-1">
                {{ pets.length }}
              </div>
              <div class="text-sm md:text-base text-gray-600">
                mascota{{ pets.length !== 1 ? 's' : '' }} registrada{{ pets.length !== 1 ? 's' : '' }}
              </div>
            </div>
            
            <button 
              @click="showAddModal = true"
              class="btn-primary px-6 md:px-8 py-3 md:py-4 text-base md:text-lg flex items-center gap-2 group"
            >
              <span class="text-lg">➕</span>
              <span>Agregar Mascota</span>
            </button>
          </div>
        </div>

        <!-- Listado de mascotas -->
        <div v-if="pets.length" class="mb-8 md:mb-12">
          <!-- Versión móvil: Carrusel horizontal -->
          <div class="block md:hidden">
            <div class="relative">
              <div class="flex space-x-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                <div
                  v-for="pet in pets" 
                  :key="pet._id" 
                  class="card-mobile group"
                >
                  <!-- Imagen de la mascota -->
                  <div class="relative">
                    <img 
                      :src="pet.image || getDefaultPetImage(pet.type)" 
                      :alt="pet.name"
                      class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div class="absolute top-3 right-3">
                      <span class="badge-pet">
                        {{ pet.type }}
                      </span>
                    </div>
                  </div>

                  <!-- Información de la mascota -->
                  <div class="p-4">
                    <h2 class="font-bold text-lg text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
                      {{ pet.name }}
                    </h2>
                    
                    <div class="space-y-2 mb-4">
                      <div class="text-sm text-gray-600">
                        <span class="font-semibold">Edad:</span> {{ pet.age }} año{{ pet.age !== 1 ? 's' : '' }}
                      </div>
                      
                      <div class="text-xs text-gray-500">
                        ID: {{ pet._id.slice(-6) }}
                      </div>
                    </div>

                    <!-- Botones de acción -->
                    <div class="flex gap-2">
                      <button 
                        class="btn-edit flex-1"
                        @click="editPet(pet)"
                      >
                        <span>✏️</span>
                        <span>Editar</span>
                      </button>
                      
                      <button 
                        class="btn-delete flex-1"
                        @click="deletePet(pet._id)"
                      >
                        <span>🗑️</span>
                        <span>Eliminar</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Versión desktop: Grid -->
          <div class="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
            <div 
              v-for="pet in pets" 
              :key="pet._id" 
              class="card-desktop group"
            >
              <!-- Imagen de la mascota -->
              <div class="relative">
                <img 
                  :src="pet.image || getDefaultPetImage(pet.type)" 
                  :alt="pet.name"
                  class="w-full h-52 object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div class="absolute top-4 right-4">
                  <span class="badge-pet">
                    {{ pet.type }}
                  </span>
                </div>
                
                <!-- Fondo degradado overlay -->
                <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>

              <!-- Información de la mascota -->
              <div class="p-5">
                <h2 class="font-bold text-xl text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
                  {{ pet.name }}
                </h2>
                
                <div class="space-y-2 mb-4">
                  <div class="text-sm text-gray-600">
                    <span class="font-semibold">Edad:</span> {{ pet.age }} año{{ pet.age !== 1 ? 's' : '' }}
                  </div>
                  
                  <div class="text-xs text-gray-500 font-mono">
                    ID: {{ pet._id.slice(-8) }}
                  </div>
                </div>

                <!-- Botones de acción -->
                <div class="flex gap-2">
                  <button 
                    class="btn-edit flex-1"
                    @click="editPet(pet)"
                  >
                    <span class="flex items-center justify-center gap-2">
                      <span>✏️</span>
                      <span>Editar</span>
                    </span>
                  </button>
                  
                  <button 
                    class="btn-delete flex-1"
                    @click="deletePet(pet._id)"
                  >
                    <span class="flex items-center justify-center gap-2">
                      <span>🗑️</span>
                      <span>Eliminar</span>
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Estado vacío -->
        <div v-else class="text-center py-12 md:py-20">
          <div class="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-200">
            <span class="text-4xl md:text-5xl">🐾</span>
          </div>
          <h3 class="text-xl md:text-2xl font-bold text-gray-900 mb-3">No tienes mascotas registradas</h3>
          <p class="text-base md:text-lg text-gray-700 mb-8 max-w-md mx-auto">
            Comienza agregando tu primera mascota para gestionar todos sus cuidados
          </p>
          <button 
            @click="showAddModal = true"
            class="btn-primary px-8 py-4 text-base md:text-lg flex items-center gap-2 mx-auto"
          >
            <span>🐶</span>
            <span>Agregar Primera Mascota</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de Mascota - MEJORADO -->
    <div 
      v-if="showAddModal"
      class="modal-overlay"
      @click.self="closeModal"
    >
      <div class="modal-pet-box">
        <!-- Header del modal con animación -->
        <div class="modal-pet-header">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <span class="text-2xl">{{ editMode ? '✏️' : '➕' }}</span>
            </div>
            <div>
              <h2 class="text-xl md:text-2xl font-bold text-white">
                {{ editMode ? 'Editar Mascota' : 'Agregar Mascota' }}
              </h2>
              <p class="text-sm text-white/90">
                {{ editMode ? 'Actualiza la información de tu mascota' : 'Registra una nueva mascota en tu cuenta' }}
              </p>
            </div>
          </div>
          <button @click="closeModal" class="btn-modal-close">
            ✕
          </button>
        </div>

        <!-- Contenido del modal -->
        <div class="modal-pet-content">
          <!-- Vista previa de mascota -->
          <div class="mb-6 text-center">
            <div class="inline-block relative">
              <div class="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden border-4 border-white shadow-lg mx-auto">
                <img 
                  :src="form.image || getDefaultPetImage(form.type || 'Perro')" 
                  :alt="form.name || 'Mascota'"
                  class="w-full h-full object-cover"
                  @error="handleImageError"
                />
              </div>
              <div class="absolute -bottom-2 left-1/2  transform -translate-x-1/2">
                <div class="bg-emerald-500 text-black  px-3 py-1 rounded-full text-xs font-semibold shadow-md ">
                  {{ form.type || 'Seleccionar tipo' }}
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-5 mt-8">
            <!-- Campo Nombre -->
            <div class="form-group  ">
              <label class="form-label  ">
                <span class="form-icon">🐕</span>
                Nombre de la mascota
              </label>
              <div class="relative">
                <input 
                  type="text" 
                  v-model="form.name" 
                  placeholder="Ej: Max, Luna, Simba..."
                  class="form-input pl-10"
                />
                <div class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  📛
                </div>
              </div>
            </div>

            <!-- Campo Tipo -->
            <div class="form-group">
              <label class="form-label">
                <span class="form-icon">🏷️</span>
                Tipo de mascota
              </label>
              <div class="relative">
                <select 
                  v-model="form.type" 
                  class="form-input pl-10 appearance-none"
                >
                  <option disabled value="">Selecciona el tipo</option>
                  <option value="Perro">🐕 Perro</option>
                  <option value="Gato">🐈 Gato</option>
                  <option value="Conejo">🐰 Conejo</option>
                  <option value="Ave">🐦 Ave</option>
                  <option value="Roedor">🐹 Roedor</option>
                  <option value="Reptil">🦎 Reptil</option>
                  <option value="Pez">🐠 Pez</option>
                  <option value="Otro">🐾 Otro</option>
                </select>
                <div class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  🏷️
                </div>
                <div class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                  ▼
                </div>
              </div>
            </div>

            <!-- Campo Edad -->
            <div class="form-group">
              <label class="form-label">
                <span class="form-icon">🎂</span>
                Edad (años)
              </label>
              <div class="relative">
                <input 
                  type="number" 
                  v-model="form.age" 
                  min="0" 
                  max="30"
                  placeholder="0"
                  class="form-input pl-10"
                />
                <div class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  🎂
                </div>
              </div>
            </div>

            <!-- Campo Imagen -->
            <div class="form-group">
            </div>
          </div>
          
          <!-- Botones de acción -->
          <div class="modal-pet-actions">
            <button 
              class="btn-modal-ghost"
              @click="closeModal"
            >
              <span>↩️</span>
              Cancelar
            </button>
            
            <button 
              class="btn-modal-primary"
              @click="savePet"
              :disabled="!isFormValid"
            >
              <span v-if="editMode" class="flex items-center gap-2">
                <span>💾</span>
                <span>Guardar Cambios</span>
              </span>
              <span v-else class="flex items-center gap-2">
                <span>✅</span>
                <span>Agregar Mascota</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script>
import Layout from "@/components/Layout.vue"
import Chatbot from "@/components/Chatbot.vue";
import api from "@/api/api"
import { useUserStore } from "@/stores/userStore"

export default {
  name: "MyPets",
  components: { Layout , Chatbot },
  data() {
    return {
      pets: [],
      showAddModal: false,
      editMode: false,
      form: { name: "", type: "", age: "", image: "" },
    }
  },

  computed: {
    isFormValid() {
      return this.form.name && this.form.type && this.form.age !== "";
    }
  },

  async created() {
    const userStore = useUserStore()
    const token = userStore.token

    if (!token) return this.$router.push("/login")

    try {
      const { data } = await api.get("/pets", {
        headers: { Authorization: `Bearer ${token}` }
      })
      this.pets = data
    } catch (error) {
      console.error("Error cargando mascotas:", error)
    }
  },

  methods: {
    getDefaultPetImage(type) {
      const images = {
        'Perro': 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=400&fit=crop',
        'Gato': 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=400&fit=crop',
        'Conejo': 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=400&h=400&fit=crop',
        'Ave': 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=400&h=400&fit=crop',
        'Roedor': 'https://images.unsplash.com/photo-1506891536236-3e07892564b7?w=400&h=400&fit=crop',
        'Reptil': 'https://images.unsplash.com/photo-1504450874802-0ba2bcd9b5ae?w=400&h=400&fit=crop',
        'Pez': 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=400&h=400&fit=crop',
        'Otro': 'https://images.unsplash.com/photo-1453227588063-bb302b62f50b?w=400&h=400&fit=crop'
      };
      return images[type] || images['Otro'];
    },

    handleImageError(event) {
      event.target.src = this.getDefaultPetImage(this.form.type || 'Otro');
    },

    closeModal() {
      this.showAddModal = false
      this.editMode = false
      this.form = { name: "", type: "", age: "", image: "" }
    },

    editPet(pet) {
      this.form = { ...pet }
      this.editMode = true
      this.showAddModal = true
    },

    async savePet() {
      const userStore = useUserStore()
      const token = userStore.token

      try {
        if (this.editMode) {
          const { data } = await api.put(`/pets/${this.form._id}`, this.form, {
            headers: { Authorization: `Bearer ${token}` }
          })
          this.pets = this.pets.map(p => p._id === data._id ? data : p)
        } else {
          const { data } = await api.post("/pets", this.form, {
            headers: { Authorization: `Bearer ${token}` }
          })
          this.pets.push(data)
        }
        this.closeModal()
      } catch (error) {
        console.error("Error al guardar mascota:", error)
        alert("Error al guardar mascota. Por favor, intenta de nuevo.")
      }
    },

    async deletePet(id) {
      if (!confirm("¿Estás seguro de que quieres eliminar esta mascota?\n\nEsta acción no se puede deshacer.")) return

      const userStore = useUserStore()
      const token = userStore.token

      try {
        await api.delete(`/pets/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        this.pets = this.pets.filter(p => p._id !== id)
      } catch (error) {
        console.error("Error al eliminar mascota:", error)
        alert("Error al eliminar la mascota. Por favor, intenta de nuevo.")
      }
    }
  }
}
</script>

<style scoped>
/* Botón principal */
.btn-primary {
  background: linear-gradient(135deg, #10b981, #0d9488);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  transition: all 0.3s ease;
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
  cursor: pointer;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 
    0 15px 30px rgba(16, 185, 129, 0.4),
    0 0 0 2px rgba(255, 255, 255, 0.2);
  background: linear-gradient(135deg, #0d9488, #10b981);
}

/* Cards para móvil */
.card-mobile {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  transition: all 0.3s ease;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: 85vw;
  max-width: 320px;
}

.card-mobile:hover {
  border-color: #10b981;
  box-shadow: 
    0 12px 24px rgba(0, 0, 0, 0.1),
    0 0 0 1px #10b981;
}

/* Cards para desktop */
.card-desktop {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  transition: all 0.4s ease;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.card-desktop:hover {
  transform: translateY(-8px);
  border-color: #10b981;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.12),
    0 0 0 1px #10b981,
    0 0 20px rgba(16, 185, 129, 0.15);
}

/* Badge para mascotas */
.badge-pet {
  background: linear-gradient(135deg, #10b981, #0d9488);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-weight: 600;
  font-size: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Botones de acción en cards */
.btn-edit {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
}

.btn-edit:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(59, 130, 246, 0.3);
}

.btn-delete {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
}

.btn-delete:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(239, 68, 68, 0.3);
}

/* ============ MODAL MEJORADO ============ */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-pet-box {
  background: white;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px #10b981,
    0 0 40px rgba(16, 185, 129, 0.1);
  max-width: 480px;
  width: 100%;
  animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-pet-header {
  background: linear-gradient(135deg, #10b981, #0d9488);
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.btn-modal-close {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-modal-close:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.modal-pet-content {
  padding: 1.5rem;
  background: #f8fafc;
}

/* Formulario mejorado */
.form-group {
  margin-bottom: 1.25rem;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.form-icon {
  font-size: 1rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 0.875rem;
  background: white;
  transition: all 0.3s ease;
  color: #1f2937;
}

.form-input:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  transform: translateY(-1px);
}

.form-input::placeholder {
  color: #9ca3af;
}

.form-input:disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
}

/* Botones del modal */
.modal-pet-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  align-items: center;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
  margin-top: 1.5rem;
}

.btn-modal-primary {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 160px;
  justify-content: center;
}

.btn-modal-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
  background: linear-gradient(135deg, #059669, #10b981);
}

.btn-modal-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-modal-ghost {
  background: transparent;
  color: #6b7280;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border: 2px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-modal-ghost:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #10b981;
  color: #10b981;
}

/* Utilidades */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Media queries */
@media (max-width: 640px) {
  .modal-pet-box {
    margin: 0.5rem;
    max-width: calc(100% - 1rem);
  }
  
  .modal-pet-content {
    padding: 1rem;
  }
  
  .modal-pet-actions {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .btn-modal-primary,
  .btn-modal-ghost {
    width: 100%;
    justify-content: center;
  }
}

/* Patrones decorativos */
.bg-gradient-to-br {
  background-size: 400% 400%;
  animation: gradient 15s ease infinite;
}

@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
</style>