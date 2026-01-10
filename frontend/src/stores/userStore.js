import { defineStore } from "pinia";
import api from "@/api/api";

export const useUserStore = defineStore("user", {
  state: () => ({
    user: JSON.parse(localStorage.getItem("user")) || null,
    token: localStorage.getItem("token") || null,
  }),

  actions: {
    // 🔹 Registro de usuario
    async register(userData) {
      try {
        const res = await api.post("/users/register", userData);
        this.user = res.data.user;
        this.token = res.data.token;

        // GUARDAR EN LOCALSTORAGE - MEJORADO
        localStorage.setItem("token", this.token);
        localStorage.setItem("user", JSON.stringify(this.user));
        
        // GUARDAR CAMPOS INDIVIDUALES (IMPORTANTE PARA LAS NOTIFICACIONES)
        localStorage.setItem("userId", this.user._id || this.user.id);
        localStorage.setItem("userRole", this.user.role);
        localStorage.setItem("userName", this.user.name || "");
        localStorage.setItem("userEmail", this.user.email || "");
        
        console.log("✅ Usuario registrado. Datos guardados en localStorage:", {
          userId: this.user._id,
          userRole: this.user.role,
          tokenPresent: !!this.token
        });
        
        return res.data;
      } catch (err) {
        console.error("❌ Error al registrar usuario:", err);
        throw new Error(err.response?.data?.message || "Error al registrar usuario");
      }
    },

    // 🔹 Inicio de sesión
    async login(email, password) {
      try {
        const res = await api.post("/users/login", { email, password });
        this.user = res.data.user;
        this.token = res.data.token;

        // GUARDAR EN LOCALSTORAGE - MEJORADO
        localStorage.setItem("token", this.token);
        localStorage.setItem("user", JSON.stringify(this.user));
        
        // GUARDAR CAMPOS INDIVIDUALES (CRÍTICO PARA LAS NOTIFICACIONES)
        localStorage.setItem("userId", this.user._id || this.user.id);
        localStorage.setItem("userRole", this.user.role);
        localStorage.setItem("userName", this.user.name || "");
        localStorage.setItem("userEmail", this.user.email || "");
        
        // Configurar token en axios para futuras peticiones
        api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
        
        console.log("✅ Usuario autenticado. Datos guardados en localStorage:", {
          userId: this.user._id,
          userRole: this.user.role,
          userName: this.user.name,
          tokenPresent: !!this.token
        });
        
        return res.data;
      } catch (err) {
        console.error("❌ Error al iniciar sesión:", err);
        throw new Error(err.response?.data?.message || "Error al iniciar sesión");
      }
    },

    // 🔹 Obtener datos actualizados del usuario desde el backend
    async fetchUser() {
      if (!this.token || !this.user?._id) return null;

      try {
        const { data } = await api.get(`/users/${this.user._id}`, {
          headers: { Authorization: `Bearer ${this.token}` },
        });

        this.user = data;
        localStorage.setItem("user", JSON.stringify(data));
        
        // ACTUALIZAR CAMPOS INDIVIDUALES
        localStorage.setItem("userId", data._id || data.id);
        localStorage.setItem("userRole", data.role);
        localStorage.setItem("userName", data.name || "");
        localStorage.setItem("userEmail", data.email || "");
        
        return data;
      } catch (err) {
        console.error("❌ Error al obtener datos del usuario:", err);
        this.logout();
        throw err;
      }
    },

    // 🔹 Actualizar perfil del usuario
    async updateProfile(updatedData) {
      if (!this.token || !this.user?._id) {
        throw new Error("Usuario no autenticado");
      }

      try {
        const { data } = await api.put(`/users/${this.user._id}`, updatedData, {
          headers: { Authorization: `Bearer ${this.token}` },
        });

        this.user = data;
        localStorage.setItem("user", JSON.stringify(data));
        
        // ACTUALIZAR CAMPOS INDIVIDUALES
        localStorage.setItem("userName", data.name || "");
        localStorage.setItem("userEmail", data.email || "");
        
        return data;
      } catch (err) {
        console.error("❌ Error al actualizar perfil:", err);
        throw new Error(err.response?.data?.message || "Error al actualizar el perfil");
      }
    },

    async fetchUserPets() {
      if (!this.token) return [];
      try {
        const { data } = await api.get("/pets", {
          headers: { Authorization: `Bearer ${this.token}` },
        });
        this.userPets = data;
        return data;
      } catch (err) {
        console.error("❌ Error al obtener mascotas del usuario:", err);
        return [];
      }
    },

    // 🔹 Cerrar sesión
    logout() {
      this.user = null;
      this.token = null;
      
      // LIMPIAR TODO EL LOCALSTORAGE
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("userId");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userName");
      localStorage.removeItem("userEmail");
      
      // Limpiar headers de axios
      delete api.defaults.headers.common['Authorization'];
      
      console.log("✅ Sesión cerrada y localStorage limpiado");
    },

    // 🔹 Redirigir según rol
    redirectByRole(router) {
      if (!this.user) {
        router.push("/login");
        return;
      }

      const role = this.user.role;

      if (role === "admin") {
        router.push("/admin");
      } else if (role === "provider") {
        router.push("/provider/dashboard");
      } else {
        router.push("/profile");
      }
    },

    // 🔹 NUEVO: Verificar y reparar sesión (para usar cuando falten datos)
    async verifyAndRepairSession() {
      const token = localStorage.getItem("token");
      
      if (!token) {
        console.log("ℹ️ No hay token en localStorage");
        return false;
      }
      
      // Restaurar estado del store si es necesario
      if (!this.token) {
        this.token = token;
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      
      // Verificar si faltan datos individuales
      const hasUserId = localStorage.getItem("userId");
      const hasUserRole = localStorage.getItem("userRole");
      
      if (!hasUserId || !hasUserRole) {
        console.log("🔄 Reparando datos faltantes en localStorage...");
        
        // Intentar obtener del objeto user completo
        const userStr = localStorage.getItem("user");
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            localStorage.setItem("userId", user._id || user.id);
            localStorage.setItem("userRole", user.role);
            localStorage.setItem("userName", user.name || "");
            localStorage.setItem("userEmail", user.email || "");
            
            console.log("✅ Datos reparados desde objeto user:", {
              userId: user._id,
              userRole: user.role
            });
          } catch (e) {
            console.error("❌ Error parseando usuario:", e);
          }
        } else {
          // Si no hay objeto user, intentar obtener del servidor
          try {
            const response = await api.get("/users/me");
            if (response.data.success) {
              const user = response.data.user;
              localStorage.setItem("userId", user._id);
              localStorage.setItem("userRole", user.role);
              localStorage.setItem("userName", user.name || "");
              localStorage.setItem("userEmail", user.email || "");
              localStorage.setItem("user", JSON.stringify(user));
              
              this.user = user;
              
              console.log("✅ Datos obtenidos del servidor y guardados");
            }
          } catch (error) {
            console.error("❌ Error obteniendo usuario del servidor:", error);
          }
        }
      }
      
      return !!this.token;
    },

    // 🔹 NUEVO: Inicializar aplicación (llamar en main.js o App.vue)
    async initializeApp() {
      console.log("🚀 Inicializando aplicación...");
      
      // Restaurar token en axios si existe
      const token = localStorage.getItem("token");
      if (token) {
        this.token = token;
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      
      // Verificar y reparar datos faltantes
      await this.verifyAndRepairSession();
      
      // Si hay token, intentar obtener usuario completo
      if (token && !this.user) {
        try {
          const response = await api.get("/users/me");
          if (response.data.success) {
            this.user = response.data.user;
            console.log("✅ Usuario cargado desde servidor:", this.user.name);
          }
        } catch (error) {
          console.log("ℹ️ No se pudo cargar usuario completo, pero hay token válido");
        }
      }
      
      console.log("✅ Aplicación inicializada. Estado:", {
        hasToken: !!this.token,
        hasUser: !!this.user,
        userRole: this.user?.role
      });
    }
  },
});