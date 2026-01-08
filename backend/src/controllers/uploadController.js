// uploadController.js - VERSIÓN MEJORADA
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Asegurar que el directorio base existe
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configurar almacenamiento MEJORADO
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const folder = req.body.folder || 'general';
    const uploadPath = path.join(uploadsDir, folder);
    
    // Crear directorio si no existe
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Usar timestamp + uuid para nombres únicos
    const timestamp = Date.now();
    const uniqueName = `${timestamp}-${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// Filtrar archivos
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, webp, gif)'));
  }
};

const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1 // Solo un archivo
  },
  fileFilter: fileFilter
});

// Controlador para subir imagen MEJORADO
export const uploadImage = async (req, res) => {
  try {
    console.log('📥 Recibiendo solicitud de upload:', {
      file: req.file,
      body: req.body,
      user: req.user
    });

    if (!req.file) {
      console.error('❌ No se recibió archivo');
      return res.status(400).json({
        success: false,
        message: "No se ha subido ninguna imagen"
      });
    }

    console.log('📄 Archivo recibido:', {
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      path: req.file.path
    });

    // Construir la URL de la imagen
    const folder = req.body.folder || 'general';
    const imageUrl = `/uploads/${folder}/${req.file.filename}`;

    console.log('✅ Imagen subida exitosamente:', imageUrl);

    res.status(200).json({
      success: true,
      message: "Imagen subida exitosamente",
      imageUrl: imageUrl,
      filename: req.file.filename,
      fullPath: req.file.path
    });
  } catch (error) {
    console.error("❌ Error al subir imagen:", error);
    res.status(500).json({
      success: false,
      message: "Error al subir la imagen",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Middleware para manejar errores de multer
export const handleMulterError = (err, req, res, next) => {
  console.error('❌ Error de multer:', err);
  
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: "El archivo es muy grande. Máximo 5MB"
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: "Demasiados archivos. Solo se permite uno"
      });
    }
  } else if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || "Error al procesar el archivo"
    });
  }
  next();
};

// Exportar middleware de multer
export { upload };