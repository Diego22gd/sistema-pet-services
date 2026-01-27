import { defineStore } from "pinia";
import api from "@/api/api";

export const useUserStore = defineStore("user", {
  state: () => ({
    user: JSON.parse(localStorage.getItem("user")) || null,
    token: localStorage.getItem("token") || null,
  }),

  getters: {
    isAuthenticated: (state) => {
      return !!(state.token && state.user);
    },
    userRole: (state) => state.user?.role,
    userName: (state) => state.user?.name || state.user?.email?.split("@")[0] || "Usuario",
  },

  actions: {
    // 🔹 Registro de usuario
    async register(userData) {
      try {
        const res = await api.post("/users/register", userData);
        this.user = res.data.user;
        this.token = res.data.token;

        // GUARDAR EN LOCALSTORAGE - MEJORADO
        this.saveToLocalStorage();
        
        console.log("✅ Usuario registrado. Datos guardados en localStorage:", {
          userId: this.user._id,
          userRole: this.user.role,
          tokenPresent: !!this.token
        });
        
        return res.data;
      } catch (err) {
        console.error("❌ Error al registrar usuario:", err);
        throw this.handleError(err);
      }
    },

    // 🔹 Inicio de sesión
    async login(email, password) {
      try {
        const res = await api.post("/users/login", { email, password });
        this.user = res.data.user;
        this.token = res.data.token;

        // GUARDAR EN LOCALSTORAGE
        this.saveToLocalStorage();
        
        // Configurar token en axios para futuras peticiones
        this.setAuthHeader();
        
        console.log("✅ Usuario autenticado. Datos guardados en localStorage:", {
          userId: this.user._id,
          userRole: this.user.role,
          userName: this.user.name,
          tokenPresent: !!this.token
        });
        
        return res.data;
      } catch (err) {
        console.error("❌ Error al iniciar sesión:", err);
        throw this.handleError(err);
      }
    },

    // 🔹 Obtener datos actualizados del usuario desde el backend
    async fetchUser() {
      if (!this.token) {
        console.warn("⚠️ No hay token para fetchUser");
        return null;
      }

      try {
        const { data } = await api.get(`/users/${this.user?._id || 'me'}`, {
          headers: { Authorization: `Bearer ${this.token}` },
        });

        const userData = data.user || data;
        this.user = userData;
        this.saveUserToLocalStorage(userData);
        
        return userData;
      } catch (err) {
        console.error("❌ Error al obtener datos del usuario:", err);
        // Si el token es inválido, hacer logout
        if (err.response?.status === 401) {
          this.cleanLogout();
        }
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

        const userData = data.user || data;
        this.user = userData;
        this.saveUserToLocalStorage(userData);
        
        return userData;
      } catch (err) {
        console.error("❌ Error al actualizar perfil:", err);
        throw this.handleError(err);
      }
    },

    // 🔹 Obtener mascotas del usuario
    async fetchUserPets() {
      if (!this.token) return [];
      try {
        const { data } = await api.get("/pets", {
          headers: { Authorization: `Bearer ${this.token}` },
        });
        return data;
      } catch (err) {
        console.error("❌ Error al obtener mascotas del usuario:", err);
        return [];
      }
    },

    // 🔹 Cerrar sesión - VERSIÓN CORREGIDA
    logout() {
      console.log("🔄 Iniciando logout...");
      
      // 1. Guardar ruta actual para posible uso futuro
      const currentPath = window.location.pathname;
      console.log(`📍 Ruta actual: ${currentPath}`);
      
      // 2. Limpiar estado del store
      this.user = null;
      this.token = null;
      
      // 3. Limpiar localStorage COMPLETAMENTE
      this.clearLocalStorage();
      
      // 4. Limpiar headers de axios
      this.clearAuthHeader();
      
      console.log("✅ Logout completado. Estado actual:", {
        hasToken: !!localStorage.getItem("token"),
        hasUser: !!localStorage.getItem("user"),
        userStoreToken: this.token,
        userStoreUser: this.user
      });
      
      // 5. NO redirigir aquí - dejar que el router guard maneje la redirección
      // El router guard detectará que no hay token y redirigirá a login
    },

    // 🔹 Limpieza completa (sin redirección)
    cleanLogout() {
      console.log("🧹 Limpieza completa de sesión...");
      this.user = null;
      this.token = null;
      this.clearLocalStorage();
      this.clearAuthHeader();
    },

    // 🔹 Redirigir según rol - VERSIÓN MEJORADA
    redirectByRole(router) {
      console.log("🔀 Redirigiendo según rol...");
      
      // Verificar usando localStorage como fuente de verdad
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      
      console.log("🔍 Estado actual:", {
        tokenPresent: !!token,
        userPresent: !!user,
        userRole: user?.role
      });
      
      if (!token || !user) {
        console.log("⚠️ No autenticado, redirigiendo a login");
        if (router.currentRoute.value.path !== "/login") {
          router.push("/login");
        }
        return;
      }

      const role = user.role;
      const currentRoute = router.currentRoute.value.path;
      
      console.log(`🎯 Rol: ${role}, Ruta actual: ${currentRoute}`);
      
      // Definir rutas por rol
      const roleRoutes = {
        admin: "/admin",
        provider: "/provider/dashboard",
        client: "/dashboard"
      };
      
      const targetRoute = roleRoutes[role] || "/dashboard";
      
      // Solo redirigir si no está ya en la ruta correcta
      if (!currentRoute.includes(targetRoute.replace("/", ""))) {
        console.log(`🔄 Redirigiendo a: ${targetRoute}`);
        router.push(targetRoute);
      } else {
        console.log(`✅ Ya está en la ruta correcta: ${currentRoute}`);
      }
    },

    // 🔹 Verificar y reparar sesión
    async verifyAndRepairSession() {
      const token = localStorage.getItem("token");
      
      if (!token || token === "null" || token === "undefined") {
        console.log("ℹ️ Token no válido o ausente");
        this.cleanLogout();
        return false;
      }
      
      // Restaurar estado del store si es necesario
      if (!this.token) {
        this.token = token;
        this.setAuthHeader();
      }
      
      // Verificar datos en localStorage
      const userStr = localStorage.getItem("user");
      
      if (!userStr) {
        console.log("🔄 Intentando recuperar usuario desde servidor...");
        try {
          const userData = await this.fetchUser();
          if (userData) {
            return true;
          }
        } catch (error) {
          console.error("❌ No se pudo recuperar usuario:", error);
          this.cleanLogout();
          return false;
        }
      } else {
        // Asegurar que el store tenga el usuario
        if (!this.user) {
          try {
            this.user = JSON.parse(userStr);
          } catch (e) {
            console.error("❌ Error parseando usuario:", e);
            this.cleanLogout();
            return false;
          }
        }
      }
      
      // Verificar datos individuales importantes
      const userId = localStorage.getItem("userId");
      const userRole = localStorage.getItem("userRole");
      
      if (!userId || !userRole) {
        console.log("🔧 Reparando datos faltantes...");
        this.saveMissingFields();
      }
      
      return true;
    },

    // 🔹 Inicializar aplicación
    async initializeApp() {
      console.log("🚀 Inicializando aplicación...");
      
      // Verificar token válido en localStorage
      const token = localStorage.getItem("token");
      
      if (token && token !== "null" && token !== "undefined") {
        this.token = token;
        this.setAuthHeader();
        
        // Intentar cargar usuario
        const userStr = localStorage.getItem("user");
        if (userStr) {
          try {
            this.user = JSON.parse(userStr);
          } catch (e) {
            console.error("❌ Error parseando usuario, limpiando sesión:", e);
            this.cleanLogout();
          }
        }
        
        // Verificar sesión completa
        await this.verifyAndRepairSession();
      } else {
        // Token inválido, limpiar
        this.cleanLogout();
      }
      
      console.log("✅ Aplicación inicializada. Estado:", {
        hasToken: !!this.token,
        hasUser: !!this.user,
        userRole: this.user?.role
      });
    },

    // ===== MÉTODOS AUXILIARES =====
    
    // Guardar en localStorage
    saveToLocalStorage() {
      if (this.token) {
        localStorage.setItem("token", this.token);
      }
      if (this.user) {
        localStorage.setItem("user", JSON.stringify(this.user));
        this.saveUserDetails(this.user);
      }
    },
    
    // Guardar detalles del usuario
    saveUserDetails(user) {
      localStorage.setItem("userId", user._id || user.id);
      localStorage.setItem("userRole", user.role);
      localStorage.setItem("userName", user.name || "");
      localStorage.setItem("userEmail", user.email || "");
    },
    
    // Guardar solo usuario
    saveUserToLocalStorage(user) {
      localStorage.setItem("user", JSON.stringify(user));
      this.saveUserDetails(user);
    },
    
    // Guardar campos faltantes
    saveMissingFields() {
      if (this.user) {
        this.saveUserDetails(this.user);
      } else {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            this.saveUserDetails(user);
          } catch (e) {
            console.error("❌ Error guardando campos faltantes:", e);
          }
        }
      }
    },
    
    // Limpiar localStorage
    clearLocalStorage() {
      // Remover solo items relacionados con autenticación
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("userId");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userName");
      localStorage.removeItem("userEmail");
      
      console.log("🧹 localStorage limpiado");
    },
    
    // Configurar header de autorización
    setAuthHeader() {
      if (this.token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
      }
    },
    
    // Limpiar header de autorización
    clearAuthHeader() {
      delete api.defaults.headers.common['Authorization'];
    },
    
    // Manejo de errores
    handleError(err) {
      console.error("🔴 Error en userStore:", err);
      
      // Si es error de autenticación, limpiar sesión
      if (err.response?.status === 401) {
        this.cleanLogout();
      }
      
      return new Error(
        err.response?.data?.message || 
        err.message || 
        "Error en la operación"
      );
    },
  },
});