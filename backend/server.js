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

// ============ CONFIGURACIÓN DE UPLOADS PARA RENDER ============

// Determinar ruta de uploads según entorno
const getUploadsPath = () => {
  if (process.env.NODE_ENV === 'production') {
    // En Render PRODUCCIÓN
    // Intentar varias rutas posibles
    const possiblePaths = [
      '/data/uploads',           // Disco montado de Render
      '/opt/render/project/src/uploads', // Ruta alternativa
      path.join(__dirname, 'uploads')    // Ruta dentro del proyecto
    ];
    
    for (const uploadPath of possiblePaths) {
      try {
        // Verificar si podemos escribir
        fs.accessSync(path.dirname(uploadPath), fs.constants.W_OK);
        console.log(`✅ Usando ruta de uploads: ${uploadPath}`);
        return uploadPath;
      } catch (error) {
        console.log(`⚠️  No se puede usar ${uploadPath}: ${error.message}`);
      }
    }
    
    // Si ninguna funciona, crear una carpeta temporal
    const tempPath = path.join(__dirname, 'temp-uploads');
    console.log(`📁 Creando uploads temporal en: ${tempPath}`);
    return tempPath;
    
  } else {
    // En desarrollo local
    return path.join(__dirname, 'public', 'uploads');
  }
};

const UPLOADS_PATH = getUploadsPath();
console.log(`🎯 Ruta de uploads final: ${UPLOADS_PATH}`);

// ============ MIDDLEWARES ============

// 1. CORS
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [
      'https://sistema-pet-services.onrender.com',
      'http://localhost:5173',
      process.env.FRONTEND_URL
    ].filter(Boolean)
  : ['http://localhost:5173', 'http://localhost:8080', 'http://localhost:3000'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️  Origen no permitido: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// 2. Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// 3. Servir archivos estáticos de UPLOADS (con manejo de errores)
app.use('/uploads', (req, res, next) => {
  try {
    const filePath = path.join(UPLOADS_PATH, req.path);
    
    if (fs.existsSync(filePath) && !fs.lstatSync(filePath).isDirectory()) {
      // Configurar headers para archivos
      res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 día
      res.sendFile(filePath);
    } else {
      next();
    }
  } catch (error) {
    console.error(`❌ Error sirviendo archivo ${req.path}:`, error.message);
    next();
  }
});

// Servir archivos estáticos públicos
app.use(express.static(path.join(__dirname, 'public')));

// ============ CREAR CARPETAS DE UPLOADS ============
const createUploadsFolders = () => {
  console.log(`🔧 Configurando carpetas de uploads en: ${UPLOADS_PATH}`);
  
  const folders = [
    UPLOADS_PATH,
    path.join(UPLOADS_PATH, 'businesses'),
    path.join(UPLOADS_PATH, 'users'),
    path.join(UPLOADS_PATH, 'services'),
    path.join(UPLOADS_PATH, 'pets')
  ];
  
  let successCount = 0;
  
  folders.forEach(folder => {
    try {
      if (!fs.existsSync(folder)) {
        // Usar modo 0o755 para permisos adecuados
        fs.mkdirSync(folder, { recursive: true, mode: 0o755 });
        console.log(`✅ Carpeta creada: ${folder}`);
        successCount++;
      } else {
        console.log(`✓ Carpeta ya existe: ${folder}`);
        successCount++;
      }
    } catch (error) {
      console.warn(`⚠️  No se pudo crear carpeta ${folder}:`, error.message);
      // Intentar con ruta alternativa dentro del proyecto
      if (folder === UPLOADS_PATH && process.env.NODE_ENV === 'production') {
        const fallbackPath = path.join(__dirname, 'temp-uploads-fallback');
        try {
          if (!fs.existsSync(fallbackPath)) {
            fs.mkdirSync(fallbackPath, { recursive: true });
            console.log(`🔄 Usando fallback: ${fallbackPath}`);
            // Actualizar UPLOADS_PATH para esta sesión
            global.UPLOADS_PATH_FALLBACK = fallbackPath;
          }
        } catch (fallbackError) {
          console.error(`❌ Fallback también falló: ${fallbackError.message}`);
        }
      }
    }
  });
  
  console.log(`📊 Carpetas configuradas: ${successCount}/${folders.length}`);
  
  // Si no se pudo crear ninguna carpeta, usar una temporal en /tmp
  if (successCount === 0 && process.env.NODE_ENV === 'production') {
    const tmpPath = '/tmp/uploads-pet-services';
    try {
      if (!fs.existsSync(tmpPath)) {
        fs.mkdirSync(tmpPath, { recursive: true });
        console.log(`🔥 Usando carpeta temporal del sistema: ${tmpPath}`);
        global.UPLOADS_PATH_TEMP = tmpPath;
      }
    } catch (tmpError) {
      console.error('❌ No se pudo crear carpeta temporal:', tmpError.message);
    }
  }
};

// ============ CONEXIÓN A LA BASE DE DATOS ============
const startDB = async (retries = 3, delay = 5000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🔄 Intento ${attempt}/${retries} de conexión a MongoDB...`);
      await connectDB();
      console.log('✅ MongoDB conectado correctamente');
      return;
    } catch (error) {
      console.error(`❌ Intento ${attempt} fallado: ${error.message}`);
      
      if (attempt < retries) {
        console.log(`⏳ Esperando ${delay/1000}s antes de reintentar...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error('🚨 Todos los intentos de conexión fallaron');
        // En producción, podemos continuar sin DB para que al menos el frontend cargue
        if (process.env.NODE_ENV === 'production') {
          console.log('⚠️  Continuando sin conexión a base de datos');
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

// Negocios
app.use("/api/businesses", businessRoutes);

// Upload de archivos - pasar la ruta de uploads
app.use("/api/upload", (req, res, next) => {
  // Inyectar la ruta de uploads en el request para que las rutas la usen
  req.uploadsPath = UPLOADS_PATH;
  next();
}, uploadRoutes);

// ============ SERVIR FRONTEND VUE.JS EN PRODUCCIÓN ============
if (process.env.NODE_ENV === 'production') {
  const frontendBuildPath = path.join(__dirname, '..', 'frontend', 'dist');
  
  console.log('🔍 Buscando frontend Vue.js en:', frontendBuildPath);
  
  if (fs.existsSync(frontendBuildPath)) {
    console.log('✅ Frontend build encontrado');
    
    // Servir archivos estáticos del frontend
    app.use(express.static(frontendBuildPath));
    
    // Ruta principal - redirige al frontend
    app.get('/', (req, res) => {
      res.sendFile(path.join(frontendBuildPath, 'index.html'));
    });
    
    // Catch-all para Vue Router - SOLUCIÓN SEGURA
    // Esta regex captura todo EXCEPTO rutas que comienzan con /api, /uploads, o tienen extensión de archivo
    app.get(/^\/(?!api|uploads)(.*)/, (req, res) => {
      // Verificar si es un archivo estático
      const staticFile = path.join(frontendBuildPath, req.path);
      if (fs.existsSync(staticFile) && !fs.lstatSync(staticFile).isDirectory()) {
        return res.sendFile(staticFile);
      }
      
      // Si no es archivo estático, enviar index.html para Vue Router
      res.sendFile(path.join(frontendBuildPath, 'index.html'), (err) => {
        if (err) {
          console.error('Error sirviendo Vue app:', err.message);
          res.status(200).json({
            app: 'Pet Services',
            status: 'backend running',
            frontend: 'Vue.js application',
            note: 'If you see this, Vue Router might not be loading properly'
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
        note: 'Frontend not built. Run: cd frontend && npm run build',
        endpoints: {
          health: '/api/health',
          api: '/api/*',
          uploads: '/uploads/*'
        }
      });
    });
  }
}

// ============ RUTAS DE DIAGNÓSTICO ============

// Health check para Render (IMPORTANTE)
app.get("/api/health", (req, res) => {
  const mongoStatus = mongoose.connection.readyState;
  const statusText = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  }[mongoStatus] || 'unknown';
  
  // Verificar sistema de archivos
  let uploadsStatus = 'unknown';
  try {
    fs.accessSync(UPLOADS_PATH, fs.constants.W_OK);
    uploadsStatus = 'writable';
  } catch (error) {
    uploadsStatus = `read-only or inaccessible: ${error.message}`;
  }
  
  res.json({ 
    status: 'OK',
    service: 'Pet Services API',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    versions: {
      node: process.version,
      environment: process.env.NODE_ENV
    },
    database: {
      status: statusText,
      readyState: mongoStatus,
      host: mongoose.connection.host || 'not connected'
    },
    uploads: {
      path: UPLOADS_PATH,
      status: uploadsStatus,
      exists: fs.existsSync(UPLOADS_PATH)
    },
    frontend: process.env.NODE_ENV === 'production' ? 'integrated' : 'separate'
  });
});

// Ruta de información del sistema
app.get("/api/info", (req, res) => {
  res.json({
    app: "Pet Services API",
    version: "1.0.0",
    environment: process.env.NODE_ENV,
    uploadsPath: UPLOADS_PATH,
    memory: process.memoryUsage(),
    uptime: process.uptime(),
    platform: process.platform
  });
});

// Ruta raíz para desarrollo
if (process.env.NODE_ENV !== 'production') {
  app.get("/", (req, res) => {
    res.json({
      app: "Pet Services API (Development)",
      frontend: "http://localhost:5173",
      api: "http://localhost:4000/api",
      uploads: "http://localhost:4000/uploads",
      environment: "development"
    });
  });
}

// ============ MANEJO DE ERRORES ============

// 404 para rutas API no encontradas
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    path: req.path,
    method: req.method
  });
});

// Middleware global de errores
app.use((err, req, res, next) => {
  console.error('🔥 Server Error:', err.message);
  console.error('Stack:', err.stack);
  
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Please contact administrator',
    timestamp: new Date().toISOString()
  });
});

// ============ INICIAR SERVIDOR ============

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    console.log(`
🚀 ===============================================
   Iniciando Pet Services Server
   🐾 Modo: ${process.env.NODE_ENV || 'development'}
   ===============================================
    `);
    
    // 1. Crear carpetas de uploads (con manejo de permisos)
    createUploadsFolders();
    
    // 2. Conectar a la base de datos
    await startDB();
    
    // 3. Iniciar servidor
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`
✅ ===============================================
   ¡Servidor iniciado correctamente!
   
   📍 Puerto: ${PORT}
   🌐 Entorno: ${process.env.NODE_ENV || 'development'}
   📁 Uploads: ${UPLOADS_PATH}
   🔗 MongoDB: ${mongoose.connection.readyState === 1 ? '✅ Conectado' : '⚠️  Verificando...'}
   
   📌 URLs disponibles:
      • API Health: http://localhost:${PORT}/api/health
      • API Info: http://localhost:${PORT}/api/info
      • Uploads: http://localhost:${PORT}/uploads/
      • Frontend: ${process.env.NODE_ENV === 'production' ? 'Integrado (SPA)' : 'http://localhost:5173'}
   
   🚀 ¡Servidor listo para recibir peticiones!
   ===============================================
      `);
    });
    
    // Manejo de cierre elegante
    process.on('SIGTERM', () => {
      console.log('🔻 Recibido SIGTERM, cerrando servidor...');
      server.close(() => {
        console.log('✅ Servidor cerrado correctamente');
        process.exit(0);
      });
    });
    
  } catch (error) {
    console.error('❌ Error crítico iniciando servidor:', error);
    process.exit(1);
  }
};

// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  // No salir inmediatamente en producción
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});

// Iniciar la aplicación
startServer();

export default app;