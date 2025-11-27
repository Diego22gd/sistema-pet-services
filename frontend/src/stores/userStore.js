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

        localStorage.setItem("token", this.token);
        localStorage.setItem("user", JSON.stringify(this.user));
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

        localStorage.setItem("token", this.token);
        localStorage.setItem("user", JSON.stringify(this.user));
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
      localStorage.removeItem("token");
      localStorage.removeItem("user");
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

  },
});
