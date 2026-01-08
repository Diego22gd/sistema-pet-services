// src/middleware/errorMiddleware.js

/**
 * Middleware para manejar errores 404 (Recurso no encontrado)
 * Se debe usar al final de todas las rutas, antes de errorHandler
 */
const notFound = (req, res, next) => {
  console.error(`❌ Ruta no encontrada: ${req.method} ${req.originalUrl}`);
  
  const error = new Error(`Ruta no encontrada: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

/**
 * Middleware para manejo global de errores
 * Captura todos los errores que ocurren en la aplicación
 */
const errorHandler = (err, req, res, next) => {
  // Log del error para depuración
  console.error('❌ Error del servidor:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
    user: req.user ? req.user._id : 'No autenticado'
  });

  // Determinar el código de estado
  let statusCode = err.statusCode || res.statusCode || 500;
  
  // Mensaje por defecto
  let message = err.message || 'Error interno del servidor';
  
  // Manejar errores específicos de Mongoose/MongoDB
  if (err.name === 'CastError') {
    // Error al convertir ID (ObjectId inválido)
    statusCode = 400;
    message = `ID inválido: ${err.value}`;
  }
  
  if (err.name === 'ValidationError') {
    // Error de validación de Mongoose
    statusCode = 400;
    const errors = Object.values(err.errors).map(e => e.message);
    message = `Error de validación: ${errors.join(', ')}`;
  }
  
  if (err.code === 11000) {
    // Error de duplicado (clave única)
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    message = `El valor '${value}' ya existe para el campo '${field}'`;
  }
  
  // Manejar errores de JWT
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Token de autenticación inválido';
  }
  
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token de autenticación expirado';
  }
  
  // Manejar errores de Multer (subida de archivos)
  if (err.name === 'MulterError') {
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'El archivo es muy grande. Máximo 5MB';
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      message = 'Demasiados archivos. Máximo 1 archivo por vez';
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      message = 'Tipo de archivo no permitido';
    } else {
      message = `Error al subir archivo: ${err.message}`;
    }
  }
  
  // Manejar errores de sintaxis JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'JSON inválido en el cuerpo de la solicitud';
  }
  
  // Respuesta al cliente
  const response = {
    success: false,
    message: message,
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  };
  
  // En desarrollo, incluir stack trace y detalles
  if (process.env.NODE_ENV === 'development') {
    response.error = err.message;
    response.stack = err.stack;
    
    // Detalles adicionales para desarrollo
    if (err.errors) {
      response.errors = err.errors;
    }
    if (err.code) {
      response.code = err.code;
    }
    if (err.name) {
      response.name = err.name;
    }
  }
  
  // En producción, ocultar detalles sensibles
  if (process.env.NODE_ENV === 'production') {
    // Si es un error 500 interno, usar mensaje genérico
    if (statusCode === 500) {
      response.message = 'Error interno del servidor';
    }
    
    // No incluir stack trace en producción
    delete response.stack;
  }
  
  // Enviar respuesta
  res.status(statusCode).json(response);
};

/**
 * Middleware para envolver controladores async/await
 * Evita tener que usar try-catch en cada controlador
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Middleware para validar errores personalizados
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Middleware para manejar errores de CORS
 */
const corsErrorHandler = (err, req, res, next) => {
  if (err) {
    console.error('❌ Error CORS:', err.message);
    return res.status(403).json({
      success: false,
      message: 'Acceso CORS no permitido'
    });
  }
  next();
};

// Exportar todos los middlewares
export { 
  notFound, 
  errorHandler, 
  asyncHandler, 
  AppError,
  corsErrorHandler 
};

// También exportar por defecto como objeto
export default {
  notFound,
  errorHandler,
  asyncHandler,
  AppError,
  corsErrorHandler
};