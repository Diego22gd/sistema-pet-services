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
        <select v-model="filterRole" class="w-full md:w-1/4 border border-neutral-medium rounded-lg p-2 focus:ring-2 focus:ring-primary focus:outline-none">
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
              :key="user.id" 
              class="border-b hover:bg-neutral-light/50 transition"
            >
              <td class="px-4 py-3">{{ user.name }}</td>
              <td class="px-4 py-3">{{ user.email }}</td>
              <td class="px-4 py-3 capitalize">{{ user.role }}</td>
              <td class="px-4 py-3 text-center space-x-2">
                <button 
                  @click="editUser(user.id)" 
                  class="px-3 py-1 text-xs rounded-lg bg-primary-mint text-white hover:bg-primary transition"
                >
                  Edit
                </button>
                <button 
                  @click="deleteUser(user.id)" 
                  class="px-3 py-1 text-xs rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
                >
                  Delete
                </button>
              </td>
            </tr>
            <tr v-if="filteredUsers.length === 0">
              <td colspan="4" class="px-4 py-6 text-center text-neutral-dark/70">No users found.</td>
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
    </div>
  </AdminLayout>
</template>

<script>
import AdminLayout from "@/components/AdminLayout.vue";

export default {
  name: "AdminUsers",
  components: { AdminLayout },
  data() {
    return {
      searchQuery: "",
      filterRole: "",
      users: [
        { id: 1, name: "Juan Pérez", email: "juan@example.com", role: "client" },
        { id: 2, name: "Ana Gómez", email: "ana@example.com", role: "provider" },
        { id: 3, name: "Carlos Ruiz", email: "carlos@example.com", role: "admin" },
        { id: 4, name: "María López", email: "maria@example.com", role: "client" },
      ]
    };
  },
  computed: {
    filteredUsers() {
      return this.users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                              user.email.toLowerCase().includes(this.searchQuery.toLowerCase());
        const matchesRole = this.filterRole ? user.role === this.filterRole : true;
        return matchesSearch && matchesRole;
      });
    }
  },
  methods: {
    addUser() {
      alert("Open modal to add a new user");
    },
    editUser(id) {
      const user = this.users.find(u => u.id === id);
      if (user) alert(`Edit user: ${user.name}`);
    },
    deleteUser(id) {
      const user = this.users.find(u => u.id === id);
      if (user && confirm(`Are you sure you want to delete ${user.name}?`)) {
        this.users = this.users.filter(u => u.id !== id);
      }
    }
  }
};
</script>

<style scoped>
/* Ajustes de tabla y hover */
table tbody tr:hover {
  background-color: rgba(16, 185, 129, 0.1);
}
</style>
