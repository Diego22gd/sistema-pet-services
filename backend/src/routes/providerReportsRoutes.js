// backend/src/routes/providerReportsRoutes.js
import { Router } from "express";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import { 
  getProviderReports, 
  exportReport,
  exportReportPDF,
  exportReportExcel,
  getQuickStats 
} from "../controllers/providerReportsController.js";

const router = Router();

// Middleware que solo permite proveedores (y admins si quieres)
const providerOnly = authorizeRoles('provider', 'admin');

// Ruta principal para obtener reportes con filtros
router.get("/", protect, providerOnly, getProviderReports);

// Ruta para estadísticas rápidas (dashboard)
router.get("/quick-stats", protect, providerOnly, getQuickStats);

// Ruta unificada para exportación
router.get("/export", protect, providerOnly, exportReport);

// Rutas específicas para cada formato (opcional, si quieres endpoints separados)
router.get("/export/pdf", protect, providerOnly, exportReportPDF);
router.get("/export/excel", protect, providerOnly, exportReportExcel);

export default router;