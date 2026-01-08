import express from 'express';
import {
  createBusiness,
  getBusinesses,
  getPendingBusinesses,
  approveBusiness,
  getMyBusinesses,
  getBusinessById,
  updateBusiness,
  deleteBusiness,
  getBusinessStats,
  toggleFeatured,
  getFeaturedBusinesses,
  getGlobalStats,
  searchBusinesses,
  rejectBusiness,
  getBusinessesByLocation,
  incrementBusinessViews,
  changeBusinessStatus,
  getAllBusinessesAdmin,
  
  // NUEVAS FUNCIONES PARA USUARIOS
  getBusinessesForUsers,
  getBusinessByIdForUser,
  getAvailableHours,
  getUserFavoriteBusinesses,
  toggleFavoriteBusiness,
  getBusinessStatsPublic,
  getRecommendedBusinesses,
  recordBusinessView
} from '../controllers/businessController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

// ===================== RUTAS PÚBLICAS (USUARIOS) =====================
// RUTA PÚBLICA LEGACY (mantener compatibilidad)
router.get('/public/list', getBusinesses);

// Obtener comercios para usuarios con filtros (nueva ruta)
router.get('/', getBusinessesForUsers);

// Obtener estadísticas públicas
router.get('/stats', getBusinessStatsPublic);

// Obtener comercio específico para usuarios
router.get('/:id', getBusinessByIdForUser);

// Obtener horarios disponibles para citas
router.get('/:id/available-hours', getAvailableHours);

// Incrementar vistas (público)
router.put('/:id/increment-views', incrementBusinessViews);

// Obtener recomendaciones basadas en búsquedas
router.get('/recommended/:userId', getRecommendedBusinesses);

// Registrar visita a comercio
router.post('/:id/record-view', recordBusinessView);

// Otras rutas públicas existentes
router.get('/featured', getFeaturedBusinesses);
router.get('/search', searchBusinesses);
router.get('/location', getBusinessesByLocation);

// ===================== RUTAS DE USUARIO AUTENTICADO =====================
// Aplicar autenticación para rutas siguientes
router.use(protect);

// Favoritos del usuario
router.get('/user/favorites', getUserFavoriteBusinesses);
router.post('/user/favorites/:id', toggleFavoriteBusiness);
router.delete('/user/favorites/:id', toggleFavoriteBusiness);

// ===================== RUTAS DE PROVEEDOR =====================
router.get('/provider/my-businesses', authorizeRoles('provider', 'admin'), getMyBusinesses);
router.get('/provider/stats', authorizeRoles('provider', 'admin'), getBusinessStats);

// ===================== RUTAS DE ADMINISTRADOR =====================
// Nueva ruta para obtener todos los comercios con filtros
router.get('/admin/all-businesses', authorizeRoles('admin'), getAllBusinessesAdmin);

// Obtener comercios pendientes
router.get('/admin/pending', authorizeRoles('admin'), getPendingBusinesses);

// Estadísticas globales
router.get('/admin/global-stats', authorizeRoles('admin'), getGlobalStats);

// Aprobar/rechazar comercios
router.put('/admin/approve/:id', authorizeRoles('admin'), approveBusiness);
router.put('/admin/reject/:id', authorizeRoles('admin'), rejectBusiness);

// Marcar como destacado
router.put('/admin/toggle-featured/:id', authorizeRoles('admin'), toggleFeatured);

// ===================== RUTAS COMPARTIDAS =====================
// Crear comercio (admin puede crear para cualquier proveedor)
router.post('/', authorizeRoles('provider', 'admin'), createBusiness);

// Obtener comercio por ID (ruta específica para usuarios autenticados)
router.get('/by-id/:id', getBusinessById);

// Actualizar comercio
router.put('/:id', authorizeRoles('provider', 'admin'), updateBusiness);

// Cambiar estado del comercio
router.put('/:id/status', authorizeRoles('provider', 'admin'), changeBusinessStatus);

// Eliminar comercio
router.delete('/:id', authorizeRoles('provider', 'admin'), deleteBusiness);

export default router;