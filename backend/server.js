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
import petRoutes from "./src/routes/petRoutes.js";
import clientServiceRoutes from "./src/routes/clientServiceRoutes.js";
import appointmentsRoutes from "./src/routes/appointmentRoutes.js";
import providerRoutes from "./src/routes/providerRoutes.js";
import chatRoutes from "./src/routes/chat.js";
import chatAdminRoutes from "./src/routes/chatAdmin.js";
import notificationRoutes from "./src/routes/notificationsRoutes.js";
// Importar rutas adicionales que necesitas
import authRoutes from "./src/routes/authRoutes.js"; // Asegúrate de tener este archivo
import businessRoutes from "./src/routes/businessRoutes.js"; // Asegúrate de tener este archivo
import uploadRoutes from "./src/routes/uploadRoutes.js"; // Asegúrate de tener este archivo

// Configuración de ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ============ MIDDLEWARES ============

// 1. CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:8080', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// 2. Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 3. Servir archivos estáticos - ¡CRÍTICO PARA IMÁGENES!
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// ============ CREAR CARPETAS DE UPLOADS ============
const createUploadsFolders = () => {
  const folders = [
    path.join(__dirname, 'public', 'uploads'),
    path.join(__dirname, 'public', 'uploads', 'businesses'),
    path.join(__dirname, 'public', 'uploads', 'users'),
    path.join(__dirname, 'public', 'uploads', 'services'),
    path.join(__dirname, 'public', 'uploads', 'pets')
  ];
  
  folders.forEach(folder => {
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
      console.log(`📁 Carpeta creada: ${folder}`);
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
app.use("/api/auth", authRoutes); // Ruta de autenticación

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
// Solo esto

// Chat
app.use("/api/chat", chatRoutes);
app.use("/api/chatbot/admin", chatAdminRoutes);

// Negocios (businesses) - Para el módulo de comercios
app.use("/api/businesses", businessRoutes);

// Upload de archivos - Para subir imágenes
app.use("/api/upload", uploadRoutes);

// ============ RUTAS DE PRUEBA Y DIAGNÓSTICO ============

// Health check
app.get("/api/health", (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'API Pet Services funcionando 🐾',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uploadsPath: path.join(__dirname, 'public', 'uploads')
  });
});

// Test de uploads
app.get("/api/uploads/test", (req, res) => {
  res.json({ 
    message: 'Ruta de uploads funcionando',
    staticPath: '/uploads/',
    physicalPath: path.join(__dirname, 'public', 'uploads'),
    availableFolders: ['businesses', 'users', 'services', 'pets']
  });
});

// Ruta raíz
app.get("/", (req, res) => {
  res.json({ 
    message: "API Pet Services funcionando 🐾",
    version: "1.0.0",
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

// ============ MANEJO DE ERRORES ============

// Middleware para rutas no encontradas (404)
app.use(notFound);

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
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📁 Archivos estáticos: http://localhost:${PORT}/uploads/`);
      console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🔧 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📂 Ruta uploads: ${path.join(__dirname, 'public', 'uploads')}`);
    });
    
  } catch (error) {
    console.error('❌ Error iniciando servidor:', error);
    process.exit(1);
  }
};

// Manejo de errores no capturados
process.on('unhandledRejection', (err) => {
  console.error('❌ Error no manejado:', err);
  // En producción, podrías reiniciar el proceso aquí
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

// Manejo de excepciones no capturadas
process.on('uncaughtException', (err) => {
  console.error('❌ Excepción no capturada:', err);
  process.exit(1);
});

// Iniciar la aplicación
startServer();

export default app;