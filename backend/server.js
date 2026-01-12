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
import chatRoutes from "./src/routes/chat.js";
import chatAdminRoutes from "./src/routes/chatAdmin.js";
import notificationRoutes from "./src/routes/notificationsRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";
import businessRoutes from "./src/routes/businessRoutes.js";
import uploadRoutes from "./src/routes/uploadRoutes.js";

// Configuración de ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ============ MIDDLEWARES ============

// 1. CORS - Configuración para producción y desarrollo
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [
      'https://sistema-pet-services.onrender.com',
      'http://localhost:5173',
      'http://localhost:8080',
      'http://localhost:3000'
    ]
  : ['http://localhost:5173', 'http://localhost:8080', 'http://localhost:3000'];

app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origin (como mobile apps o curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `Origen ${origin} no permitido por CORS`;
      console.warn(msg);
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// 2. Parsers con límites para producción
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// 3. Servir archivos estáticos
const uploadsPath = process.env.NODE_ENV === 'production'
  ? '/data/uploads'  // En Render, usa el disco montado
  : path.join(__dirname, 'public', 'uploads');

// Crear carpeta de uploads si no existe
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log(`📁 Carpeta de uploads creada: ${uploadsPath}`);
}

app.use('/uploads', express.static(uploadsPath));
app.use(express.static(path.join(__dirname, 'public')));

// ============ CREAR CARPETAS DE UPLOADS ============
const createUploadsFolders = () => {
  const baseFolders = ['businesses', 'users', 'services', 'pets'];
  
  baseFolders.forEach(folder => {
    const folderPath = path.join(uploadsPath, folder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
      console.log(`📁 Subcarpeta creada: ${folderPath}`);
    }
  });
};

// ============ CONEXIÓN A LA BASE DE DATOS ============
const startDB = async (retries = 5, delay = 5000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🔄 Intento ${attempt}/${retries} de conexión a MongoDB...`);
      await connectDB();
      console.log('✅ MongoDB conectado correctamente');
      return;
    } catch (error) {
      console.error(`❌ Intento ${attempt} fallado: ${error.message}`);
      
      if (attempt < retries) {
        console.log(`⏳ Esperando ${delay/1000} segundos antes de reintentar...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error('🚨 Todos los intentos de conexión fallaron');
        if (process.env.NODE_ENV === 'production') {
          console.log('⚠️  Continuando sin MongoDB (modo degradado)');
        } else {
          process.exit(1);
        }
      }
    }
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
app.use("/api/chat", chatRoutes);
app.use("/api/chatbot/admin", chatAdminRoutes);

// Negocios (businesses)
app.use("/api/businesses", businessRoutes);

// Upload de archivos
app.use("/api/upload", uploadRoutes);

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
    
    // Rutas específicas de Vue Router (según tu router.js)
    const vueRoutes = [
      '/home', '/login', '/services', '/profile', '/appointments',
      '/mypets', '/commerces', '/admin', '/provider'
    ];
    
    vueRoutes.forEach(route => {
      app.get(route, (req, res) => {
        res.sendFile(path.join(frontendBuildPath, 'index.html'));
      });
    });
    
    // Rutas con parámetros (admin/*, provider/*)
    app.get('/admin/*', (req, res) => {
      res.sendFile(path.join(frontendBuildPath, 'index.html'));
    });
    
    app.get('/provider/*', (req, res) => {
      res.sendFile(path.join(frontendBuildPath, 'index.html'));
    });
    
    // Catch-all para Vue Router - USANDO PATRÓN CORRECTO
    // Expresión regular que captura todo EXCEPTO rutas que comienzan con /api o /uploads
    app.get(/^\/(?!api|uploads).*/, (req, res) => {
      res.sendFile(path.join(frontendBuildPath, 'index.html'), (err) => {
        if (err) {
          console.error('Error sirviendo Vue app:', err);
          res.status(404).json({
            error: 'Página no encontrada',
            message: 'La aplicación Vue.js no pudo cargar'
          });
        }
      });
    });
    
    console.log('🎯 Vue.js SPA configurado correctamente');
    
  } else {
    console.warn('⚠️  Frontend build NO encontrado. Solo se servirá API.');
    
    // Ruta raíz muestra info de API
    app.get('/', (req, res) => {
      res.json({
        app: 'Pet Services Backend API',
        status: 'online',
        environment: 'production',
        frontend: 'not available - run: cd frontend && npm run build',
        api: {
          health: '/api/health',
          users: '/api/users',
          services: '/api/services',
          businesses: '/api/businesses'
        }
      });
    });
  }
}

// ============ RUTAS DE PRUEBA Y DIAGNÓSTICO ============

// Health check para Render
app.get("/api/health", (req, res) => {
  const mongoStatus = mongoose.connection.readyState;
  const statusText = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  }[mongoStatus] || 'unknown';
  
  res.json({ 
    status: 'OK', 
    message: 'API Pet Services funcionando 🐾',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    mongoDB: {
      status: statusText,
      readyState: mongoStatus,
      host: mongoose.connection.host || 'not connected'
    },
    nodeVersion: process.version,
    uploadsPath: uploadsPath,
    frontend: process.env.NODE_ENV === 'production' ? 'integrated' : 'separate'
  });
});

// Test de uploads
app.get("/api/uploads/test", (req, res) => {
  res.json({ 
    message: 'Ruta de uploads funcionando',
    staticPath: '/uploads/',
    physicalPath: uploadsPath,
    exists: fs.existsSync(uploadsPath),
    availableFolders: ['businesses', 'users', 'services', 'pets']
  });
});

// Ruta raíz (solo en desarrollo, en producción maneja Vue)
if (process.env.NODE_ENV !== 'production') {
  app.get("/", (req, res) => {
    res.json({ 
      message: "API Pet Services funcionando 🐾",
      version: "1.0.0",
      environment: "development",
      frontend: "http://localhost:5173",
      api: "http://localhost:4000/api",
      endpoints: {
        auth: "/api/auth",
        users: "/api/users",
        services: "/api/services",
        businesses: "/api/businesses",
        upload: "/api/upload",
        admin: "/api/admin",
        provider: "/api/provider",
        health: "/api/health"
      }
    });
  });
}

// ============ MANEJO DE ERRORES ============

// Middleware para rutas no encontradas (404) - solo para API
app.use('/api/*', notFound);

// Middleware global de manejo de errores
app.use(errorHandler);

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
   🐾 API + Vue.js Fullstack Application
   ===============================================
   
✅ Servidor corriendo en puerto: ${PORT}
🌐 Entorno: ${process.env.NODE_ENV || 'development'}
📁 Uploads: ${uploadsPath}
🔧 Health check: /api/health
🔗 MongoDB: ${mongoose.connection.readyState === 1 ? '✅ Conectado' : '❌ Desconectado'}
🎯 Frontend: ${process.env.NODE_ENV === 'production' ? '✅ Integrado (SPA)' : '🚀 En localhost:5173'}

📌 URLs importantes:
   • API: http://localhost:${PORT}/api
   • Frontend: ${process.env.NODE_ENV === 'production' ? 'Integrado' : 'http://localhost:5173'}
   • Health: http://localhost:${PORT}/api/health
   
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
process.on('unhandledRejection', (err, promise) => {
  console.error('❌ Error no manejado en Promise:', err);
  console.error('Promise:', promise);
});

// Manejo de excepciones no capturadas
process.on('uncaughtException', (err) => {
  console.error('❌ Excepción no capturada:', err);
  console.error('Stack:', err.stack);
  
  // En producción, podemos intentar reiniciar de forma más controlada
  if (process.env.NODE_ENV === 'production') {
    console.log('⚠️  Reiniciando proceso en 5 segundos...');
    setTimeout(() => {
      process.exit(1);
    }, 5000);
  } else {
    process.exit(1);
  }
});

// Iniciar la aplicación
startServer();

export default app;