// routes/adminReportRoutes.js
import express from 'express';
import { 
  getOverviewData,
  getAppointmentsReportData,
  getBusinessesReportData,
  getRevenueReportData,
  generateRevenuePDF
} from '../controllers/adminDashboardReportController.js';
import { protect,  authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

// 🔐 Todas las rutas requieren autenticación y rol de admin
router.use(protect);
router.use(authorizeRoles('admin'));
// 📊 Rutas de reportes
router.get('/overview', getOverviewData);
router.get('/appointments', getAppointmentsReportData);
router.get('/businesses', getBusinessesReportData);
router.get('/revenue', getRevenueReportData);
router.get('/revenue-pdf', generateRevenuePDF);

export default router;