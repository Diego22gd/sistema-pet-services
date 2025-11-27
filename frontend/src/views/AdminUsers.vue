<template>
  <AdminLayout>
    <div class="px-6 max-w-6xl mx-auto w-full pt-4">
      <h1 class="text-2xl font-bold mb-6 text-neutral-dark">Users Management</h1>

      <!-- Filtros y búsqueda -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by name or email..."
          class="w-full md:w-1/3 border border-neutral-medium rounded-lg p-2 focus:ring-2 focus:ring-primary focus:outline-none"
        />
        <select
          v-model="filterRole"
          class="w-full md:w-1/4 border border-neutral-medium rounded-lg p-2 focus:ring-2 focus:ring-primary focus:outline-none"
        >
          <option value="">All Roles</option>
          <option value="client">Client</option>
          <option value="provider">Provider</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <!-- Tabla de usuarios -->
      <div class="bg-neutral-light shadow rounded-2xl overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead class="bg-primary-mint text-white">
            <tr>
              <th class="px-4 py-2">Name</th>
              <th class="px-4 py-2">Email</th>
              <th class="px-4 py-2">Role</th>
              <th class="px-4 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="user in filteredUsers"
              :key="user._id"
              class="border-b hover:bg-neutral-light/50 transition"
            >
              <td class="px-4 py-3">{{ user.name }}</td>
              <td class="px-4 py-3">{{ user.email }}</td>
              <td class="px-4 py-3 capitalize">{{ user.role }}</td>
              <td class="px-4 py-3 text-center space-x-2">
                <button
                  @click="editUser(user)"
                  class="px-3 py-1 text-xs rounded-lg bg-primary-mint text-white hover:bg-primary transition"
                >
                  Edit
                </button>
                <button
                  @click="deleteUser(user._id)"
                  class="px-3 py-1 text-xs rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
                >
                  Delete
                </button>
              </td>
            </tr>
            <tr v-if="filteredUsers.length === 0">
              <td colspan="4" class="px-4 py-6 text-center text-neutral-dark/70">
                No users found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Botón agregar usuario -->
      <div class="mt-8 text-center">
        <button
          @click="addUser"
          class="px-6 py-3 bg-secondary text-white rounded-xl hover:bg-secondary-dark transition"
        >
          + Add User
        </button>
      </div>

      <!-- Modal editar -->
      <transition name="fade">
        <div v-if="showModal" class="fixed inset-0 flex items-center justify-center z-50">
          <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="closeModal"></div>
          <div
            class="bg-white rounded-2xl shadow-lg w-full max-w-md p-6 relative z-10 overflow-y-auto max-h-[90vh]"
          >
            <h2 class="text-xl font-bold mb-4">Edit User</h2>

            <form @submit.prevent="saveEdit" class="space-y-4">
              <div>
                <label class="block text-sm font-medium mb-1">Name</label>
                <input
                  v-model="editData.name"
                  type="text"
                  required
                  class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-mint"
                />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Email</label>
                <input
                  v-model="editData.email"
                  type="email"
                  required
                  class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-mint"
                />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Role</label>
                <select
                  v-model="editData.role"
                  class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-mint"
                >
                  <option value="client">Client</option>
                  <option value="provider">Provider</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div class="flex justify-end space-x-3 mt-4">
                <button
                  type="button"
                  @click="closeModal"
                  class="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="px-4 py-2 rounded-lg bg-primary-mint text-white hover:bg-green-600 transition"
                >
                  Save
                </button>
              </div>
            </form>

            <button
              @click="closeModal"
              class="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl"
            >
              &times;
            </button>
          </div>
        </div>
      </transition>
    </div>
    <Chatbot />
  </AdminLayout>
</template>

<script>
import AdminLayout from "@/components/AdminLayout.vue";
import Chatbot from "@/components/Chatbot.vue";
import api from "@/api/api"; // 📡 tu instancia Axios

export default {
  name: "AdminUsers",
  components: { AdminLayout,Chatbot },
  data() {
    return {
      searchQuery: "",
      filterRole: "",
      users: [],
      showModal: false,
      editData: { _id: "", name: "", email: "", role: "" },
    };
  },
  computed: {
    filteredUsers() {
      return this.users.filter((user) => {
        const matchesSearch =
          user.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(this.searchQuery.toLowerCase());
        const matchesRole = this.filterRole ? user.role === this.filterRole : true;
        return matchesSearch && matchesRole;
      });
    },
  },
  methods: {
    async fetchUsers() {
      try {
        const res = await api.get("/admin/users");
        this.users = res.data;
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    },
    addUser() {
      alert("Feature under development: Add User");
    },
    editUser(user) {
      this.editData = { ...user };
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
    },
    async saveEdit() {
      try {
        const res = await api.put(`/admin/users/${this.editData._id}`, this.editData);
        const index = this.users.findIndex((u) => u._id === this.editData._id);
        if (index !== -1) this.users[index] = res.data;
        this.closeModal();
      } catch (error) {
        console.error("Error updating user:", error);
      }
    },
    async deleteUser(id) {
      if (!confirm("Are you sure you want to delete this user?")) return;
      try {
        await api.delete(`/admin/users/${id}`);
        this.users = this.users.filter((u) => u._id !== id);
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    },
  },
  mounted() {
    this.fetchUsers();
  },
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
