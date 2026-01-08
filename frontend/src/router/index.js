import { createRouter, createWebHistory } from 'vue-router'

// Vistas de clientes
import LandingPage from '@/views/LandingPage.vue'
import Home from '@/views/Home.vue'
import Login from '@/views/Login.vue'
import Services from '@/views/Services.vue'
import Profile from '@/views/Profile.vue'
import Appointments from '@/views/Appointments.vue'
import MyPets from '@/views/MyPets.vue'
import UserCommerces from '@/views/UserCommerces.vue' 

// Vistas de administrador
import AdminDashboard from '@/views/AdminDashboard.vue'
import AdminClients from '@/views/AdminClients.vue'
import AdminProviders from '@/views/AdminProviders.vue'
import AdminAppointments from '@/views/AdminAppointments.vue'
import AdminReports from '@/views/AdminReports.vue'
import AdminServices from '@/views/AdminServices.vue'
import AdminSettings from '@/views/AdminSettings.vue'
import AdminUsers from '@/views/AdminUsers.vue'
import AdminConmerces from '@/views/AdminConmerces.vue' // <-- NUEVO IMPORT

// Vistas de proveedores
import ProviderDashboard from '@/views/ProviderDashboard.vue'
import ProviderAppointments from '@/views/ProviderAppointments.vue'
import ProviderProfile from '@/views/ProviderProfile.vue'
import ProviderNotifications from '@/views/ProviderNotifications.vue'
import ProviderServices from '@/views/ProviderServices.vue'
import ProviderReports from '@/views/ProviderReports.vue'
import ProviderConmerces from '@/views/ProviderConmerces.vue' // <-- CORRECCIÓN: ProviderCommerces

const routes = [
  // Rutas clientes
  { path: '/', name: 'LandingPage', component: LandingPage },
  { path: '/home', name: 'Home', component: Home },
  { path: '/login', name: 'Login', component: Login },
  { path: '/MyPets', name: 'MyPets', component: MyPets },
  { path: '/services', name: 'Services', component: Services },
  { path: '/profile', name: 'Profile', component: Profile },
  { path: '/appointments', name: 'Appointments', component: Appointments },
  { 
    path: '/commerces', 
    name: 'UserCommerces', // <-- NUEVA RUTA PARA USUARIOS
    component: UserCommerces
  },

  // Rutas administrador
  { path: '/admin', name: 'AdminDashboard', component: AdminDashboard },
  { path: '/admin/clients', name: 'AdminClients', component: AdminClients },
  { path: '/admin/providers', name: 'AdminProviders', component: AdminProviders },
  { path: '/admin/appointments', name: 'AdminAppointments', component: AdminAppointments },
  { path: '/admin/reports', name: 'AdminReports', component: AdminReports },
  { path: '/admin/services', name: 'AdminServices', component: AdminServices },
  { path: '/admin/settings', name: 'AdminSettings', component: AdminSettings },
  { path: '/admin/users', name: 'AdminUsers', component: AdminUsers },
  { path: '/admin/commerces', name: 'AdminCommerces', component: AdminConmerces }, // <-- NUEVA RUTA

  // Rutas proveedores
  { path: '/provider/dashboard', name: 'ProviderDashboard', component: ProviderDashboard },
  { path: '/provider/appointments', name: 'ProviderAppointments', component: ProviderAppointments },
  { path: '/provider/profile', name: 'ProviderProfile', component: ProviderProfile },
  { path: '/provider/notifications', name: 'ProviderNotifications', component: ProviderNotifications },
  { path: '/provider/services', name: 'ProviderServices', component: ProviderServices },
  { path: '/provider/reports', name: 'ProviderReports', component: ProviderReports },
  { path: '/provider/commerces', name: 'ProviderConmerces', component: ProviderConmerces },

  // Ruta 404
  { path: '/:pathMatch(.*)*', redirect: '/' } // Redirige a landing page
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Eliminada la verificación de roles para trabajar en lo visual primero

export default router