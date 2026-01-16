import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import fs from "fs";
import { connectDB } from "./src/config/db.js";

// Importar middlewares de error
import { notFound, errorHandler } from "./src/middlewares/errorMiddleware.js";

// Importar rutas
import userRoutes from "./src/routes/userRoutes.js";
import serviceRoutes from "./src/routes/serviceRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import adminClientsRoutes from "./src/routes/adminClients.routes.js";
import adminProvidersRoutes from "./src/routes/adminProviders.routes.js";
import adminAppointmentsRoutes from "./src/routes/adminAppointments.routes.js";
import adminReportRoutes from "./src/routes/adminReportRoutes.js";
import adminServiceRoutes from "./src/routes/adminServiceRoutes.js";
import adminUsersRoutes from "./src/routes/adminUsersRoutes.js";
import providerProfileRoutes from "./src/routes/providerProfileRoutes.js";
import providerAppointmentsRoutes from "./src/routes/providerAppointmentsRoutes.js";
import providerServicesRoutes from "./src/routes/providerServicesRoutes.js";
import providerReportsRoutes from "./src/routes/providerReportsRoutes.js";
import petRoutes from "./src/routes/petRoutes.js";
import clientServiceRoutes from "./src/routes/clientServiceRoutes.js";
import appointmentsRoutes from "./src/routes/appointmentRoutes.js";
import providerRoutes from "./src/routes/providerRoutes.js";
import notificationRoutes from "./src/routes/notificationsRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";
import businessRoutes from "./src/routes/businessRoutes.js";
import uploadRoutes from "./src/routes/uploadRoutes.js";
// Añadir estas líneas en tu archivo server principal
import chatbotRoutes from './src/routes/chatbotRoutes.js';

// Después de otras rutas, agregar:

// Configuración de ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ============ CONFIGURACIÓN DE UPLOADS ============

// Determinar ruta de uploads según entorno
const getUploadsPath = () => {
  if (process.env.NODE_ENV === 'production') {
    // En Render, intentar diferentes rutas
    const possiblePaths = [
      '/opt/render/project/src/uploads', // Ruta dentro del proyecto
      path.join(__dirname, 'uploads'),   // Ruta relativa
      '/tmp/uploads-pet-services'        // Carpeta temporal del sistema
    ];
    
    for (const uploadPath of possiblePaths) {
      try {
        // Verificar si el directorio padre existe y es escribible
        const parentDir = path.dirname(uploadPath);
        if (fs.existsSync(parentDir)) {
          // Intentar crear la carpeta
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true, mode: 0o755 });
          }
          console.log(`✅ Usando ruta de uploads: ${uploadPath}`);
          return uploadPath;
        }
      } catch (error) {
        console.log(`⚠️  No se puede usar ${uploadPath}: ${error.message}`);
      }
    }
    
    // Fallback: carpeta dentro del proyecto
    const fallbackPath = path.join(__dirname, 'public', 'uploads');
    if (!fs.existsSync(fallbackPath)) {
      fs.mkdirSync(fallbackPath, { recursive: true });
    }
    console.log(`📁 Usando fallback: ${fallbackPath}`);
    return fallbackPath;
    
  } else {
    // En desarrollo local
    return path.join(__dirname, 'public', 'uploads');
  }
};

const UPLOADS_PATH = getUploadsPath();
console.log(`🎯 Ruta de uploads configurada: ${UPLOADS_PATH}`);

// ============ MIDDLEWARES ============

// 1. CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:8080', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// 2. Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// 3. Servir archivos estáticos
app.use('/uploads', express.static(UPLOADS_PATH));
app.use(express.static(path.join(__dirname, 'public')));

// ============ CREAR CARPETAS DE UPLOADS ============
const createUploadsFolders = () => {
  const folders = [
    UPLOADS_PATH,
    path.join(UPLOADS_PATH, 'businesses'),
    path.join(UPLOADS_PATH, 'users'),
    path.join(UPLOADS_PATH, 'services'),
    path.join(UPLOADS_PATH, 'pets')
  ];
  
  folders.forEach(folder => {
    if (!fs.existsSync(folder)) {
      try {
        fs.mkdirSync(folder, { recursive: true });
        console.log(`📁 Carpeta creada: ${folder}`);
      } catch (error) {
        console.warn(`⚠️  No se pudo crear ${folder}: ${error.message}`);
      }
    }
  });
};

// ============ CONEXIÓN A LA BASE DE DATOS ============
const startDB = async () => {
  try {
    await connectDB();
    console.log('✅ MongoDB conectado correctamente');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
    process.exit(1);
  }
};

// ============ RUTAS DE API ============

// Rutas públicas
app.use("/api/users", userRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/auth", authRoutes);

// Admin
app.use("/api/admin", adminRoutes);
app.use("/api/admin/clients", adminClientsRoutes);
app.use("/api/admin/providers", adminProvidersRoutes);
app.use("/api/admin/appointments", adminAppointmentsRoutes);
app.use("/api/admin/reports", adminReportRoutes);
app.use("/api/admin/services", adminServiceRoutes);
app.use("/api/admin/users", adminUsersRoutes);
app.use("/api/notifications", notificationRoutes);

// Provider
app.use("/api/provider/profile", providerProfileRoutes);
app.use("/api/provider/appointments", providerAppointmentsRoutes);
app.use("/api/provider-services", providerServicesRoutes);
app.use("/api/client/services", clientServiceRoutes);
app.use("/api/pets", petRoutes);
app.use("/api/appointments", appointmentsRoutes);
app.use("/api/providers", providerRoutes);
app.use("/api/provider/reports", providerReportsRoutes);

// Chat

app.use('/api/chatbot', chatbotRoutes);

// Negocios
app.use("/api/businesses", businessRoutes);

// Upload de archivos
app.use("/api/upload", uploadRoutes);

// ============ RUTAS DE DIAGNÓSTICO ============

// Health check
app.get("/api/health", (req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  res.json({ 
    status: 'OK', 
    message: 'API Pet Services funcionando 🐾',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    mongoDB: mongoStatus,
    nodeVersion: process.version,
    uploadsPath: UPLOADS_PATH
  });
});

// Info
app.get("/api/info", (req, res) => {
  res.json({
    app: "Pet Services API",
    version: "1.0.0",
    environment: process.env.NODE_ENV
  });
});

// ============ SERVIR FRONTEND VUE.JS EN PRODUCCIÓN ============
if (process.env.NODE_ENV === 'production') {
  const frontendBuildPath = path.join(__dirname, '..', 'frontend', 'dist');
  
  console.log('🔍 Buscando frontend en:', frontendBuildPath);
  
  if (fs.existsSync(frontendBuildPath)) {
    console.log('✅ Frontend build encontrado');
    
    // Servir archivos estáticos del frontend
    app.use(express.static(frontendBuildPath));
    
    // Ruta principal
    app.get('/', (req, res) => {
      res.sendFile(path.join(frontendBuildPath, 'index.html'));
    });
    
    // Rutas específicas de Vue (sin usar * que causa error)
    const vueRoutes = ['/home', '/login', '/services', '/profile', '/appointments', 
                      '/mypets', '/commerces', '/admin', '/provider'];
    
    vueRoutes.forEach(route => {
      app.get(route, (req, res) => {
        res.sendFile(path.join(frontendBuildPath, 'index.html'));
      });
    });
    
    // Para rutas como /admin/dashboard, /provider/profile, etc.
    // Usamos una expresión regular SEGURA en lugar de *
    app.get(/^\/(admin|provider)\/.+$/, (req, res) => {
      res.sendFile(path.join(frontendBuildPath, 'index.html'));
    });
    
    // Catch-all para Vue Router - USANDO EXPRESIÓN REGULAR CORRECTA
    // Esta regex captura todo EXCEPTO rutas que comienzan con /api, /uploads, o tienen extensión de archivo
    app.get(/^\/[^.]*$/, (req, res, next) => {
      // Excluir rutas que ya manejamos
      if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
        return next();
      }
      
      // Verificar si es un archivo estático
      const staticFile = path.join(frontendBuildPath, req.path);
      if (fs.existsSync(staticFile) && !fs.lstatSync(staticFile).isDirectory()) {
        return res.sendFile(staticFile);
      }
      
      // Para SPA Vue.js
      res.sendFile(path.join(frontendBuildPath, 'index.html'));
    });
    
    console.log('🎯 Vue.js SPA configurado correctamente');
    
  } else {
    console.warn('⚠️  Frontend build NO encontrado');
    
    app.get('/', (req, res) => {
      res.json({
        app: 'Pet Services Backend',
        status: 'online',
        frontend: 'not available',
        api: 'available at /api/*'
      });
    });
  }
}

// Ruta raíz para desarrollo
if (process.env.NODE_ENV !== 'production') {
  app.get("/", (req, res) => {
    res.json({ 
      message: "API Pet Services funcionando 🐾",
      version: "1.0.0",
      environment: "development",
      frontend: "http://localhost:5173",
      api: "http://localhost:4000/api",
      endpoints: {
        health: "/api/health",
        users: "/api/users",
        services: "/api/services",
        businesses: "/api/businesses"
      }
    });
  });
}

// ============ MANEJO DE ERRORES ============

// Middleware 404 para rutas no encontradas - CORREGIDO
app.use((req, res, next) => {
  // Solo manejar 404 para rutas API
  if (req.path.startsWith('/api')) {
    res.status(404).json({
      error: 'Endpoint no encontrado',
      path: req.path,
      method: req.method
    });
  } else {
    next(); // Para rutas no-API, pasar al siguiente middleware
  }
});

// Middleware global de manejo de errores
app.use((err, req, res, next) => {
  console.error('🔥 Error:', err.stack);
  
  const statusCode = err.status || 500;
  const response = {
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Contacte al administrador',
    timestamp: new Date().toISOString()
  };
  
  // Si es un error de validación, añadir detalles
  if (err.name === 'ValidationError') {
    response.details = err.errors;
  }
  
  res.status(statusCode).json(response);
});

// ============ INICIAR SERVIDOR ============

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    // 1. Crear carpetas de uploads
    createUploadsFolders();
    
    // 2. Conectar a la base de datos
    await startDB();
    
    // 3. Iniciar servidor
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`
🚀 ===============================================
   Pet Services Server
   ===============================================
   
✅ Servidor corriendo en puerto: ${PORT}
🌐 Entorno: ${process.env.NODE_ENV || 'development'}
📁 Uploads: ${UPLOADS_PATH}
🔧 Health check: /api/health
🔗 MongoDB: ${mongoose.connection.readyState === 1 ? '✅ Conectado' : '❌ Desconectado'}

📌 URLs:
   • API: http://localhost:${PORT}/api
   • Health: http://localhost:${PORT}/api/health
   • Uploads: http://localhost:${PORT}/uploads/
   
🚀 ¡Servidor listo!
===============================================
      `);
    });
    
  } catch (error) {
    console.error('❌ Error iniciando servidor:', error);
    process.exit(1);
  }
};

// Manejo de errores no capturados
process.on('unhandledRejection', (err) => {
  console.error('❌ Error no manejado:', err);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Excepción no capturada:', err);
  process.exit(1);
});

// Iniciar la aplicación
startServer();

export default app;