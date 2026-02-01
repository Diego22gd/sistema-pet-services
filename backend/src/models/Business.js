import mongoose from 'mongoose';

const businessSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre del comercio es requerido'],
    trim: true,
    minlength: [3, 'El nombre debe tener al menos 3 caracteres'],
    maxlength: [100, 'El nombre no puede exceder los 100 caracteres']
  },
  
  // Campo antiguo para compatibilidad
  category: {
    type: String,
    required: [true, 'La categoría es requerida'],
    enum: {
      values: [
        'Veterinaria',
        'Peluquería',
        'Guardería',
        'Tienda',
        'Entrenamiento',
        'Transporte',
        'Spa',
        'Hotel',
        'Adopción',
        'Otro'
      ],
      message: '{VALUE} no es una categoría válida'
    }
  },
  
  // Nuevo campo para múltiples categorías
  categories: [{
    type: String,
    enum: {
      values: [
        'Veterinaria',
        'Peluquería',
        'Guardería',
        'Tienda',
        'Entrenamiento',
        'Transporte',
        'Spa',
        'Hotel',
        'Adopción',
        'Otro'
      ],
      message: '{VALUE} no es una categoría válida'
    }
  }],
  
  description: {
    type: String,
    required: [true, 'La descripción es requerida'],
    trim: true,
    minlength: [10, 'La descripción debe tener al menos 10 caracteres'],
    maxlength: [500, 'La descripción no puede exceder los 500 caracteres']
  },
  
  address: {
    type: String,
    required: [true, 'La dirección es requerida'],
    trim: true,
    minlength: [5, 'La dirección debe tener al menos 5 caracteres'],
    maxlength: [200, 'La dirección no puede exceder los 200 caracteres']
  },
  
  phone: {
    type: String,
    required: [true, 'El teléfono es requerido'],
    trim: true,
    validate: {
      validator: function(v) {
        return /^[0-9+\-\s()]{8,15}$/.test(v);
      },
      message: 'Formato de teléfono inválido (8-15 dígitos)'
    }
  },
  
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^\S+@\S+\.\S+$/.test(v);
      },
      message: 'Por favor ingresa un email válido'
    }
  },
  
  image: {
    type: String,
    default: '',
    // Eliminamos la validación de URL para permitir Base64
    // Solo validamos la longitud máxima
    maxlength: [10485760, 'La imagen es demasiado grande (máximo 10MB en Base64)']
  },
  
  status: {
    type: String,
    enum: {
      values: ['active', 'pending', 'inactive'],
      message: '{VALUE} no es un estado válido'
    },
    default: 'pending'
  },
  
  workingHours: {
    open: {
      type: String,
      default: '',
      validate: {
        validator: function(v) {
          if (!v) return true;
          return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: 'Formato de hora de apertura inválido (use HH:MM)'
      }
    },
    close: {
      type: String,
      default: '',
      validate: {
        validator: function(v) {
          if (!v) return true;
          return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: 'Formato de hora de cierre inválido (use HH:MM)'
      }
    },
    days: [{
      type: String,
      enum: {
        values: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'],
        message: '{VALUE} no es un día válido'
      }
    }],
    specialDay: {
      type: String,
      enum: {
        values: ['', 'festivos', 'domingos', 'sabados', 'vacaciones'],
        message: '{VALUE} no es un día especial válido'
      },
      default: ''
    },
    specialOpen: {
      type: String,
      default: '',
      validate: {
        validator: function(v) {
          if (!v) return true;
          return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: 'Formato de hora especial de apertura inválido (use HH:MM)'
      }
    },
    specialClose: {
      type: String,
      default: '',
      validate: {
        validator: function(v) {
          if (!v) return true;
          return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: 'Formato de hora especial de cierre inválido (use HH:MM)'
      }
    },
    regular: {
      type: String,
      default: ''
    },
    daysString: {
      type: String,
      default: ''
    },
    special: {
      type: String,
      default: ''
    }
  },
  
  services: [{
    name: {
      type: String,
      required: [true, 'El nombre del servicio es requerido'],
      trim: true,
      minlength: [3, 'El nombre del servicio debe tener al menos 3 caracteres'],
      maxlength: [50, 'El nombre del servicio no puede exceder los 50 caracteres']
    },
    price: {
      type: Number,
      required: [true, 'El precio del servicio es requerido'],
      min: [0, 'El precio no puede ser negativo'],
      max: [100000, 'El precio no puede exceder 100000']
    },
    description: {
      type: String,
      default: '',
      maxlength: [200, 'La descripción del servicio no puede exceder los 200 caracteres']
    },
    duration: {
      type: Number,
      default: 60,
      min: [1, 'La duración mínima es 1 minuto'],
      max: [1440, 'La duración máxima es 1440 minutos (24 horas)']
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El proveedor es requerido'],
    index: true
  },
  
  approved: {
    type: Boolean,
    default: false,
    index: true
  },
  
  featured: {
    type: Boolean,
    default: false,
    index: true
  },
  
  views: {
    type: Number,
    default: 0,
    min: [0, 'Las vistas no pueden ser negativas']
  },
  
  website: {
    type: String,
    default: '',
    validate: {
      validator: function(v) {
        if (!v) return true;
        try {
          new URL(v);
          return true;
        } catch (e) {
          return false;
        }
      },
      message: 'URL del sitio web inválida'
    }
  },
  
  socialMedia: {
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
    twitter: { type: String, default: '' },
    tiktok: { type: String, default: '' } // Añadido para completitud
  },
  
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0],
      index: '2dsphere'
    },
    city: {
      type: String,
      default: '',
      trim: true
    },
    country: {
      type: String,
      default: '',
      trim: true
    },
    postalCode: {
      type: String,
      default: '',
      trim: true
    }
  },
  
  averageServicePrice: {
    type: Number,
    default: 0,
    min: [0, 'El precio promedio no puede ser negativo']
  },
  
  totalAppointments: {
    type: Number,
    default: 0,
    min: [0, 'El total de citas no puede ser negativo']
  },
  
  imageType: {
    type: String,
    default: '',
    enum: ['url', 'base64', '']
  },
  
  imageSize: {
    type: Number,
    default: 0
  },
  
  // Campos para auditoría y administración
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  approvedAt: {
    type: Date
  },
  
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  rejectedAt: {
    type: Date
  },
  
  rejectionReason: {
    type: String,
    default: '',
    maxlength: [500, 'La razón de rechazo no puede exceder los 500 caracteres']
  },
  
  lastStatusChange: {
    type: Date,
    default: Date.now
  },
  
  statusChangedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Campos para métricas y análisis
  rating: {
    type: Number,
    default: 0,
    min: [0, 'La calificación no puede ser menor a 0'],
    max: [5, 'La calificación no puede ser mayor a 5']
  },
  
  totalRatings: {
    type: Number,
    default: 0,
    min: [0, 'El total de calificaciones no puede ser negativo']
  },
  
  popularityScore: {
    type: Number,
    default: 0,
    min: [0, 'El score de popularidad no puede ser negativo']
  },
  
  lastActivity: {
    type: Date,
    default: Date.now
  },
  
  // Campos para SEO y búsqueda
  slug: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    lowercase: true
  },
  
  metaTitle: {
    type: String,
    default: '',
    maxlength: [60, 'El título meta no puede exceder los 60 caracteres']
  },
  
  metaDescription: {
    type: String,
    default: '',
    maxlength: [160, 'La descripción meta no puede exceder los 160 caracteres']
  },
  
  keywords: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  
  // Campos adicionales para funcionalidades futuras
  subscriptionPlan: {
    type: String,
    enum: ['free', 'basic', 'premium', 'enterprise'],
    default: 'free'
  },
  
  subscriptionExpiresAt: {
    type: Date
  },
  
  isPromoted: {
    type: Boolean,
    default: false
  },
  
  promotionExpiresAt: {
    type: Date
  },
  
  // Campos de configuración
  acceptOnlineBookings: {
    type: Boolean,
    default: true
  },
  
  bookingLeadTime: {
    type: Number,
    default: 60, // minutos
    min: [0, 'El tiempo de anticipación no puede ser negativo']
  },
  
  cancellationPolicy: {
    type: String,
    default: '',
    maxlength: [500, 'La política de cancelación no puede exceder los 500 caracteres']
  },
  
  // Campos de disponibilidad
  isAvailable: {
    type: Boolean,
    default: true
  },
  
  nextAvailableDate: {
    type: Date
  },
  
  // Campos para estadísticas
  totalBookings: {
    type: Number,
    default: 0
  },
  
  totalRevenue: {
    type: Number,
    default: 0
  },
  
  monthlyViews: {
    type: Number,
    default: 0
  },
  
  // Campos de integración
  externalId: {
    type: String,
    default: ''
  },
  
  integrationData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  tags: [{
    type: String,
    trim: true,
    maxlength: [20, 'La etiqueta no puede exceder los 20 caracteres']
  }],
  
  isVerified: {
    type: Boolean,
    default: false
  },
  
  verificationDate: {
    type: Date
  },
  
  // Campo para soft delete
  deletedAt: {
    type: Date
  },
  
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      // Eliminar campos sensibles al enviar al cliente
      delete ret.__v;
      delete ret.integrationData;
      return ret;
    }
  },
  toObject: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.__v;
      delete ret.integrationData;
      return ret;
    }
  }
});

// Middleware para mantener compatibilidad y validaciones
businessSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Si categories está vacío pero category tiene valor, llenar categories
  if ((!this.categories || this.categories.length === 0) && this.category) {
    this.categories = [this.category];
  }
  
  // Si category está vacío pero categories tiene valores, usar el primero
  if (!this.category && this.categories && this.categories.length > 0) {
    this.category = this.categories[0];
  }
  
  // Validar que al menos haya una categoría
  if ((!this.categories || this.categories.length === 0) && !this.category) {
    return next(new Error('Debe seleccionar al menos una categoría'));
  }
  
  // Determinar el tipo de imagen (si existe)
  if (this.image) {
    if (this.image.startsWith('data:image/')) {
      this.imageType = 'base64';
      // Calcular tamaño aproximado en bytes
      const base64Data = this.image.split(',')[1] || '';
      this.imageSize = Math.floor(base64Data.length * 0.75); // Aproximación Base64 a bytes
    } else {
      this.imageType = 'url';
      this.imageSize = 0;
    }
  } else {
    this.imageType = '';
    this.imageSize = 0;
  }
  
  // Validar tamaño de imagen Base64 (máximo 5MB)
  if (this.imageType === 'base64' && this.imageSize > 5 * 1024 * 1024) {
    return next(new Error('La imagen es muy grande (máximo 5MB)'));
  }
  
  // Validar workingHours
  if (this.workingHours) {
    // Validar que si hay open, también haya close y viceversa
    if ((this.workingHours.open && !this.workingHours.close) || 
        (!this.workingHours.open && this.workingHours.close)) {
      return next(new Error('Los horarios de apertura y cierre deben ir juntos'));
    }
    
    // Validar que close sea después de open
    if (this.workingHours.open && this.workingHours.close) {
      const [openHour, openMin] = this.workingHours.open.split(':').map(Number);
      const [closeHour, closeMin] = this.workingHours.close.split(':').map(Number);
      
      const openTotal = openHour * 60 + openMin;
      const closeTotal = closeHour * 60 + closeMin;
      
      if (closeTotal <= openTotal) {
        return next(new Error('La hora de cierre debe ser posterior a la hora de apertura'));
      }
      
      // Crear regular si no existe
      if (!this.workingHours.regular) {
        this.workingHours.regular = `${this.workingHours.open} - ${this.workingHours.close}`;
      }
    }
    
    // Crear daysString para compatibilidad
    if (this.workingHours.days && Array.isArray(this.workingHours.days) && this.workingHours.days.length > 0) {
      const dayMap = {
        'lunes': 'Lunes',
        'martes': 'Martes',
        'miércoles': 'Miércoles',
        'jueves': 'Jueves',
        'viernes': 'Viernes',
        'sábado': 'Sábado',
        'domingo': 'Domingo'
      };
      this.workingHours.daysString = this.workingHours.days
        .map(day => dayMap[day] || day)
        .join(', ');
    }
    
    // Crear special si hay specialDay con horarios
    if (this.workingHours.specialDay && this.workingHours.specialOpen && this.workingHours.specialClose) {
      const specialMap = {
        'festivos': 'Festivos',
        'domingos': 'Domingos',
        'sabados': 'Sábados',
        'vacaciones': 'Vacaciones'
      };
      this.workingHours.special = `${this.workingHours.specialOpen} - ${this.workingHours.specialClose} (${specialMap[this.workingHours.specialDay] || this.workingHours.specialDay})`;
    }
  }
  
  // Calcular precio promedio de servicios activos
  if (this.services && this.services.length > 0) {
    const activeServices = this.services.filter(service => service.isActive !== false);
    if (activeServices.length > 0) {
      const total = activeServices.reduce((sum, service) => sum + service.price, 0);
      this.averageServicePrice = total / activeServices.length;
    }
  }
  
  // Generar tags automáticamente si no existen
  if (!this.tags || this.tags.length === 0) {
    this.tags = [...(this.categories || [])];
    
    // Extraer palabras clave del nombre y descripción
    const nameWords = this.name.toLowerCase().split(' ').filter(word => word.length > 3);
    const descWords = this.description.toLowerCase().split(' ').filter(word => word.length > 3);
    
    const allWords = [...nameWords, ...descWords];
    const uniqueWords = [...new Set(allWords)].slice(0, 5); // Máximo 5 tags
    
    this.tags = [...this.tags, ...uniqueWords].slice(0, 10); // Máximo 10 tags en total
  }
  
  // Generar slug si no existe
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  
  // Actualizar fecha de última actividad
  this.lastActivity = new Date();
  
  next();
});

// Middleware para servicios (actualizar updatedAt)
businessSchema.pre('save', function(next) {
  if (this.services && this.isModified('services')) {
    this.services.forEach(service => {
      if (!service.createdAt) service.createdAt = new Date();
      service.updatedAt = new Date();
    });
  }
  next();
});

// Virtual para horario formateado
businessSchema.virtual('formattedWorkingHours').get(function() {
  if (!this.workingHours) return '';
  
  const { open, close, days, specialDay, specialOpen, specialClose } = this.workingHours;
  
  let formatted = '';
  
  if (open && close && days && days.length > 0) {
    const dayNames = days.map(day => {
      const dayMap = {
        'lunes': 'Lunes',
        'martes': 'Martes',
        'miércoles': 'Miércoles',
        'jueves': 'Jueves',
        'viernes': 'Viernes',
        'sábado': 'Sábado',
        'domingo': 'Domingo'
      };
      return dayMap[day] || day;
    });
    
    formatted = `${dayNames.join(', ')}: ${open} - ${close}`;
  }
  
  if (specialDay && specialOpen && specialClose) {
    if (formatted) formatted += ' | ';
    const specialMap = {
      'festivos': 'Festivos',
      'domingos': 'Domingos',
      'sabados': 'Sábados',
      'vacaciones': 'Vacaciones'
    };
    formatted += `${specialMap[specialDay] || specialDay}: ${specialOpen} - ${specialClose}`;
  }
  
  return formatted || 'Horario no especificado';
});

// Virtual para contar servicios activos
businessSchema.virtual('activeServicesCount').get(function() {
  // Verificar si services existe y es un array
  if (!this.services || !Array.isArray(this.services)) {
    return 0;
  }
  return this.services.filter(service => service.isActive !== false).length;
});

// Virtual para obtener servicios activos - CORREGIDO
businessSchema.virtual('activeServices').get(function() {
  // CORRECCIÓN: Verificar si services existe y es un array
  if (!this.services || !Array.isArray(this.services)) {
    return []; // Retornar array vacío en lugar de undefined
  }
  return this.services.filter(service => service.isActive !== false);
});

// Virtual para obtener información de la imagen
businessSchema.virtual('imageInfo').get(function() {
  if (!this.image) return null;
  
  if (this.imageType === 'base64') {
    return {
      type: 'base64',
      size: this.imageSize,
      hasImage: true
    };
  } else {
    return {
      type: 'url',
      url: this.image,
      hasImage: true
    };
  }
});

// Virtual para el estado formateado
businessSchema.virtual('statusFormatted').get(function() {
  const statusMap = {
    'active': '✅ Activo',
    'pending': '⏳ Pendiente',
    'inactive': '❌ Inactivo'
  };
  return statusMap[this.status] || this.status;
});

// Virtual para tiempo desde creación
businessSchema.virtual('timeSinceCreation').get(function() {
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffMs = now - created;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
  if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} meses`;
  return `Hace ${Math.floor(diffDays / 365)} años`;
});

// Método para obtener imagen optimizada
businessSchema.methods.getOptimizedImage = function(maxSize = 500000) {
  if (!this.image) return '';
  
  if (this.imageType === 'base64' && this.imageSize > maxSize) {
    // Aquí podrías implementar lógica para generar thumbnails
    return this.image;
  }
  
  return this.image;
};

// Método para aprobar comercio
businessSchema.methods.approve = function(userId) {
  this.approved = true;
  this.status = 'active';
  this.approvedBy = userId;
  this.approvedAt = new Date();
  this.lastStatusChange = new Date();
  this.statusChangedBy = userId;
  return this.save();
};

// Método para rechazar comercio
businessSchema.methods.reject = function(userId, reason = '') {
  this.approved = false;
  this.status = 'inactive';
  this.rejectedBy = userId;
  this.rejectedAt = new Date();
  this.rejectionReason = reason;
  this.lastStatusChange = new Date();
  this.statusChangedBy = userId;
  return this.save();
};

// Método para cambiar estado
businessSchema.methods.changeStatus = function(status, userId) {
  const validStatuses = ['active', 'pending', 'inactive'];
  if (!validStatuses.includes(status)) {
    throw new Error('Estado inválido');
  }
  
  this.status = status;
  this.lastStatusChange = new Date();
  this.statusChangedBy = userId;
  
  // Si se cambia a inactivo, desaprobar automáticamente
  if (status === 'inactive') {
    this.approved = false;
  }
  
  return this.save();
};

// Método para toggle destacado
businessSchema.methods.toggleFeatured = function() {
  this.featured = !this.featured;
  return this.save();
};

// Método para soft delete
businessSchema.methods.softDelete = function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

// Método para restaurar
businessSchema.methods.restore = function() {
  this.isDeleted = false;
  this.deletedAt = null;
  return this.save();
};

// Query helper para excluir eliminados
businessSchema.query.notDeleted = function() {
  return this.where({ isDeleted: { $ne: true } });
};

// Query helper para solo activos
businessSchema.query.active = function() {
  return this.where({ status: 'active', approved: true, isDeleted: { $ne: true } });
};

// Query helper para pendientes de aprobación
businessSchema.query.pendingApproval = function() {
  return this.where({ approved: false, status: 'pending', isDeleted: { $ne: true } });
};

// Método para incrementar vistas
businessSchema.methods.incrementViews = function() {
  this.views = (this.views || 0) + 1;
  this.monthlyViews = (this.monthlyViews || 0) + 1;
  this.lastActivity = new Date();
  return this.save();
};

// Método para añadir a favoritos de usuario
businessSchema.statics.addToUserFavorites = async function(businessId, userId) {
  const user = await mongoose.model('User').findById(userId);
  if (!user) throw new Error('Usuario no encontrado');
  
  if (!user.favoriteBusinesses) {
    user.favoriteBusinesses = [];
  }
  
  if (!user.favoriteBusinesses.includes(businessId)) {
    user.favoriteBusinesses.push(businessId);
    await user.save();
  }
  
  return true;
};

// Método para remover de favoritos de usuario
businessSchema.statics.removeFromUserFavorites = async function(businessId, userId) {
  const user = await mongoose.model('User').findById(userId);
  if (!user) throw new Error('Usuario no encontrado');
  
  if (user.favoriteBusinesses) {
    const index = user.favoriteBusinesses.indexOf(businessId);
    if (index > -1) {
      user.favoriteBusinesses.splice(index, 1);
      await user.save();
    }
  }
  
  return true;
};

// Método para verificar si está en favoritos
businessSchema.statics.isUserFavorite = async function(businessId, userId) {
  const user = await mongoose.model('User').findById(userId);
  if (!user) return false;
  
  return user.favoriteBusinesses?.includes(businessId) || false;
};

// Método para obtener comercios recomendados para un usuario
businessSchema.statics.getRecommendedForUser = async function(userId, limit = 6) {
  const user = await mongoose.model('User').findById(userId);
  if (!user) {
    // Si no hay usuario, devolver comercios destacados
    return this.find({
      approved: true,
      status: 'active',
      featured: true,
      isDeleted: { $ne: true }
    })
    .populate('provider', 'name email avatar')
    .sort({ rating: -1, views: -1 })
    .limit(limit);
  }
  
  // Lógica de recomendación básica
  // 1. Comercios similares a favoritos
  const favoriteCategories = [];
  if (user.favoriteBusinesses && user.favoriteBusinesses.length > 0) {
    const favorites = await this.find({
      _id: { $in: user.favoriteBusinesses },
      approved: true,
      status: 'active'
    }).select('categories category');
    
    favorites.forEach(business => {
      if (business.categories && business.categories.length > 0) {
        favoriteCategories.push(...business.categories);
      } else if (business.category) {
        favoriteCategories.push(business.category);
      }
    });
  }
  
  // 2. Buscar comercios por categorías favoritas
  const uniqueCategories = [...new Set(favoriteCategories)];
  
  if (uniqueCategories.length > 0) {
    return this.find({
      approved: true,
      status: 'active',
      isDeleted: { $ne: true },
      $or: [
        { categories: { $in: uniqueCategories } },
        { category: { $in: uniqueCategories } }
      ],
      _id: { $nin: user.favoriteBusinesses || [] }
    })
    .populate('provider', 'name email avatar')
    .sort({ rating: -1, featured: -1, views: -1 })
    .limit(limit);
  }
  
  // 3. Si no hay categorías favoritas, devolver destacados
  return this.find({
    approved: true,
    status: 'active',
    featured: true,
    isDeleted: { $ne: true }
  })
  .populate('provider', 'name email avatar')
  .sort({ rating: -1, views: -1 })
  .limit(limit);
};

// Índices para optimizar consultas
businessSchema.index({ name: 'text', description: 'text', address: 'text', tags: 'text', keywords: 'text' });
businessSchema.index({ category: 1 });
businessSchema.index({ categories: 1 });
businessSchema.index({ status: 1 });
businessSchema.index({ isVerified: 1 });
businessSchema.index({ createdAt: -1 });
businessSchema.index({ updatedAt: -1 });
businessSchema.index({ lastActivity: -1 });
businessSchema.index({ views: -1 });
businessSchema.index({ totalAppointments: -1 });
businessSchema.index({ averageServicePrice: 1 });
businessSchema.index({ rating: -1 });
businessSchema.index({ popularityScore: -1 });
businessSchema.index({ email: 1 });
businessSchema.index({ isDeleted: 1 });
businessSchema.index({ deletedAt: -1 });
businessSchema.index({ approvedAt: -1 });
businessSchema.index({ lastStatusChange: -1 });
businessSchema.index({ subscriptionExpiresAt: 1 });
businessSchema.index({ promotionExpiresAt: 1 });
businessSchema.index({ nextAvailableDate: 1 });
businessSchema.index({ 'provider': 1, 'name': 1 }, { unique: true });
businessSchema.index({ imageType: 1 });
businessSchema.index({ imageSize: 1 });

// Índice compuesto para búsquedas comunes
businessSchema.index({ status: 1, approved: 1, isDeleted: 1 });
businessSchema.index({ category: 1, status: 1, approved: 1 });
businessSchema.index({ provider: 1, status: 1, approved: 1 });

const Business = mongoose.model('Business', businessSchema);

export default Business;