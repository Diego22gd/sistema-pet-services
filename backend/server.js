import dotenv from "dotenv";

// 🔧 1. CARGAR VARIABLES DE ENTORNO - CON DIAGNÓSTICO
console.log('🔍 ======= DIAGNÓSTICO SERVER =======');
console.log('Directorio actual:', process.cwd());

// Intentar diferentes ubicaciones del .env
const envPaths = [
  '.env',                         // Raíz del proyecto
  './.env',                       // Relativo
  `${process.cwd()}/.env`,        // Absoluto desde directorio actual
  '../.env',                      // Un nivel arriba
  '../../.env'                    // Dos niveles arriba
];

let envLoaded = false;
for (const envPath of envPaths) {
  try {
    const result = dotenv.config({ path: envPath });
    if (result.parsed && result.parsed.GEMINI_API_KEY) {
      console.log(`✅ .env cargado desde: ${envPath}`);
      console.log(`🔑 GEMINI_API_KEY encontrada: ${result.parsed.GEMINI_API_KEY.substring(0, 10)}...`);
      envLoaded = true;
      break;
    }
  } catch (error) {
    console.log(`⚠️  No se pudo cargar desde ${envPath}: ${error.message}`);
  }
}

// Si no se cargó, intentar método por defecto
if (!envLoaded) {
  console.log('🔄 Intentando carga por defecto...');
  dotenv.config();
  
  if (process.env.GEMINI_API_KEY) {
    console.log(`✅ .env cargado por defecto`);
    envLoaded = true;
  }
}

// Mostrar diagnóstico de variables
console.log('\n📋 VARIABLES CARGADAS:');
console.log('   PORT:', process.env.PORT || 'No definido (default: 4000)');
console.log('   NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('   GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? `✅ ${process.env.GEMINI_API_KEY.length} chars` : '❌ NO CONFIGURADA');
console.log('   GEMINI_MODEL:', process.env.GEMINI_MODEL || 'gemini-pro (default)');
console.log('   MONGO_URI:', process.env.MONGO_URI ? '✅ Configurada' : '❌ NO CONFIGURADA');

// 🚨 SI NO HAY API KEY, CONFIGURAR UNA POR DEFECTO DE EMERGENCIA
if (!process.env.GEMINI_API_KEY) {
  console.warn('\n⚠️  ⚠️  ⚠️  ADVERTENCIA CRÍTICA ⚠️  ⚠️  ⚠️');
  console.warn('   GEMINI_API_KEY no está configurada en .env');
  console.warn('   El chatbot funcionará en MODO FALLBACK');
  console.warn('   Para usar IA, configura GEMINI_API_KEY en tu .env');
  
  // Establecer una variable de entorno por defecto
  process.env.GEMINI_API_KEY = '';
  process.env.GEMINI_MODEL = 'gemini-pro';
  
  console.log('\n🔧 Configuración de emergencia aplicada');
  console.log('   MODO: Fallback (sin IA)');
}

console.log('🔍 ======= FIN DIAGNÓSTICO =======\n');

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

// Chat - IMPORTANTE: Verificar que las rutas existan
console.log('\n📦 CARGANDO RUTAS DE CHAT...');
try {
  app.use("/api/chat", chatRoutes);
  console.log('✅ Ruta /api/chat cargada correctamente');
} catch (error) {
  console.error('❌ Error cargando /api/chat:', error.message);
}

try {
  app.use("/api/chatbot/admin", chatAdminRoutes);
  console.log('✅ Ruta /api/chatbot/admin cargada correctamente');
} catch (error) {
  console.error('❌ Error cargando /api/chatbot/admin:', error.message);
}

// Negocios
app.use("/api/businesses", businessRoutes);

// Upload de archivos
app.use("/api/upload", uploadRoutes);

// ============ RUTAS DE DIAGNÓSTICO MEJORADAS ============

// Health check mejorado
app.get("/api/health", (req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  res.json({ 
    status: 'OK', 
    message: 'API Pet Services funcionando 🐾',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    mongoDB: mongoStatus,
    nodeVersion: process.version,
    uploadsPath: UPLOADS_PATH,
    geminiApi: {
      configured: !!process.env.GEMINI_API_KEY,
      model: process.env.GEMINI_MODEL || 'gemini-pro',
      status: process.env.GEMINI_API_KEY ? 'ready' : 'not_configured'
    },
    system: {
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB'
      }
    }
  });
});

// Endpoint para verificar variables de entorno (SIN información sensible)
app.get("/api/env-check", (req, res) => {
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    environment: {
      node_env: process.env.NODE_ENV || 'development',
      port: process.env.PORT || 4000
    },
    services: {
      mongo: !!process.env.MONGO_URI,
      gemini: !!process.env.GEMINI_API_KEY,
      gemini_model: process.env.GEMINI_MODEL || 'gemini-pro',
      jwt: !!process.env.JWT_SECRET
    },
    status: {
      mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      server: 'running'
    }
  });
});

// Test específico de Gemini
app.get("/api/test-gemini", async (req, res) => {
  try {
    const API_KEY = process.env.GEMINI_API_KEY;
    
    if (!API_KEY || API_KEY.trim() === '') {
      return res.json({
        success: false,
        error: "GEMINI_API_KEY no configurada en variables de entorno",
        suggestion: "Agrega GEMINI_API_KEY=tu_clave_aqui a tu archivo .env"
      });
    }
    
    const model = process.env.GEMINI_MODEL || 'gemini-pro';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;
    
    console.log(`🧪 Probando Gemini con modelo: ${model}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: "Responde solo con 'OK'" }]
        }]
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      res.json({
        success: true,
        message: "✅ Gemini API funciona correctamente",
        model: model,
        response: data?.candidates?.[0]?.content?.parts?.[0]?.text || 'OK'
      });
    } else {
      const errorText = await response.text();
      res.json({
        success: false,
        error: `HTTP ${response.status}: ${errorText.substring(0, 200)}`,
        suggestion: "Verifica tu API Key y que Gemini API esté habilitada en Google Cloud"
      });
    }
    
  } catch (error) {
    res.json({
      success: false,
      error: error.message,
      suggestion: "Error de conexión. Verifica tu internet y firewall."
    });
  }
});

// Info
app.get("/api/info", (req, res) => {
  res.json({
    app: "Pet Services API",
    version: "1.0.0",
    environment: process.env.NODE_ENV,
    features: [
      "Authentication",
      "User Management", 
      "Pet Management",
      "Business Directory",
      "Appointments",
      "Chatbot AI",
      "Notifications",
      "File Uploads"
    ],
    chatbot: {
      status: process.env.GEMINI_API_KEY ? "AI Enabled" : "Fallback Mode",
      model: process.env.GEMINI_MODEL || "gemini-pro"
    }
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
        api: 'available at /api/*',
        chatbot: process.env.GEMINI_API_KEY ? 'AI enabled' : 'Fallback mode'
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
      chatbot: process.env.GEMINI_API_KEY ? "🤖 AI Enabled" : "📝 Fallback Mode",
      frontend: "http://localhost:5173",
      api: "http://localhost:4000/api",
      endpoints: {
        health: "/api/health",
        env_check: "/api/env-check",
        test_gemini: "/api/test-gemini",
        users: "/api/users",
        services: "/api/services",
        businesses: "/api/businesses",
        chat: "/api/chat"
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
      method: req.method,
      timestamp: new Date().toISOString()
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

🤖 CHATBOT STATUS: ${process.env.GEMINI_API_KEY ? '🤖 AI ENABLED' : '📝 FALLBACK MODE'}
   Modelo: ${process.env.GEMINI_MODEL || 'gemini-pro'}
   API Key: ${process.env.GEMINI_API_KEY ? '✅ Configurada' : '❌ No configurada'}

🔧 MongoDB: ${mongoose.connection.readyState === 1 ? '✅ Conectado' : '❌ Desconectado'}

📌 ENDPOINTS DE DIAGNÓSTICO:
   • API Health: http://localhost:${PORT}/api/health
   • Env Check: http://localhost:${PORT}/api/env-check
   • Test Gemini: http://localhost:${PORT}/api/test-gemini
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