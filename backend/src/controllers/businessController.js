import Business from "../models/Business.js";
import User from "../models/User.js";
import mongoose from "mongoose";

// ===================== FUNCIONES AUXILIARES =====================

/**
 * Verificar si un comercio está abierto ahora
 */
function isOpenNow(workingHours) {
  if (!workingHours || !workingHours.days) return false;
  
  const now = new Date();
  const currentDay = now.toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTime = currentHour * 60 + currentMinute;
  
  // Verificar si hoy es un día de trabajo
  if (!workingHours.days.includes(currentDay)) {
    return false;
  }
  
  // Verificar si está dentro del horario
  if (workingHours.open && workingHours.close) {
    const [openHour, openMin] = workingHours.open.split(':').map(Number);
    const [closeHour, closeMin] = workingHours.close.split(':').map(Number);
    
    const openTime = openHour * 60 + openMin;
    const closeTime = closeHour * 60 + closeMin;
    
    return currentTime >= openTime && currentTime <= closeTime;
  }
  
  return false;
}

/**
 * Formatear horarios para mostrar
 */
function formatWorkingHours(workingHours) {
  if (!workingHours) return 'No disponible';
  
  let formatted = '';
  
  if (workingHours.open && workingHours.close && workingHours.days && workingHours.days.length > 0) {
    const dayNames = {
      'lunes': 'Lunes',
      'martes': 'Martes',
      'miércoles': 'Miércoles',
      'jueves': 'Jueves',
      'viernes': 'Viernes',
      'sábado': 'Sábado',
      'domingo': 'Domingo'
    };
    
    const daysFormatted = workingHours.days.map(day => dayNames[day] || day).join(', ');
    formatted = `${daysFormatted}: ${workingHours.open} - ${workingHours.close}`;
  }
  
  if (workingHours.specialDay && workingHours.specialOpen && workingHours.specialClose) {
    if (formatted) formatted += ' | ';
    const specialMap = {
      'festivos': 'Festivos',
      'domingos': 'Domingos',
      'sabados': 'Sábados',
      'vacaciones': 'Vacaciones'
    };
    formatted += `${specialMap[workingHours.specialDay] || workingHours.specialDay}: ${workingHours.specialOpen} - ${workingHours.specialClose}`;
  }
  
  return formatted || 'Horario no especificado';
}

/**
 * Generar horas disponibles para citas
 */
function generateAvailableHours(workingHours, selectedDate, bookedHours, leadTime = 60) {
  if (!workingHours?.open || !workingHours?.close) {
    return [];
  }
  
  const [openHour, openMin] = workingHours.open.split(':').map(Number);
  const [closeHour, closeMin] = workingHours.close.split(':').map(Number);
  
  const openTotal = openHour * 60 + openMin;
  const closeTotal = closeHour * 60 + closeMin;
  
  const slotDuration = 30; // minutos por defecto
  const availableHours = [];
  
  // Generar slots cada slotDuration minutos
  for (let time = openTotal; time <= closeTotal - leadTime; time += slotDuration) {
    const hour = Math.floor(time / 60);
    const minute = time % 60;
    const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    
    // Verificar que no esté reservado
    if (!bookedHours.includes(timeString)) {
      // Verificar que no sea en el pasado si es hoy
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const selectedDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      
      if (selectedDay.getTime() === today.getTime()) {
        const slotTime = new Date();
        slotTime.setHours(hour, minute, 0, 0);
        if (slotTime > now) {
          availableHours.push(timeString);
        }
      } else {
        availableHours.push(timeString);
      }
    }
  }
  
  return availableHours;
}

// Función auxiliar para imagen por defecto
function getDefaultBusinessImage(category) {
  const images = {
    'Veterinaria': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTNmOGZkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzEwYjk4MSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPjxpPnN0ZXRob3Njb3BlPC9pPjwvdGV4dD48L3N2Zz4=',
    'Peluquería': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBlZGZhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzhiNmJmNSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPjxpPnNjaXNzb3JzPC9pPjwvdGV4dD48L3N2Zz4=',
    'Guardería': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaHelpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmOGUzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iI2Y1OTkyNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPjxpPmhvdXNlPC9pPjwvdGV4dD48L3N2Zz4=',
    'Tienda': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTNmOGVkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzM3NzBiMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPjxpPnNob3BwaW5nLWNhcnQ8L2k+PC90ZXh0Pjwvc3ZnPg==',
    'Entrenamiento': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmOGY1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzY2NjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPjxpPmd5bTwvaT48L3RleHQ+PC9zdmc+',
    'default': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmZGY1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzY2NjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlbiA6KDwvdGV4dD48L3N2Zz4='
  };
  
  return images[category] || images.default;
}

// ===================== ENDPOINTS PÚBLICOS (USUARIOS) =====================

export const getBusinessesForUsers = async (req, res) => {
  try {
    const { 
      category, 
      search, 
      page = 1,
      limit = 12,
      sortBy = 'createdAt',
      order = 'desc',
      featured,
      minPrice,
      maxPrice,
      city,
      openNow
    } = req.query;
    
    console.log('🔍 Parámetros recibidos en vista usuario:', req.query);
    
    // ====== FILTRO BASE CORREGIDO ======
    // SOLO comercios APROBADOS y ACTIVOS
    let filter = { 
      status: 'active',
      isDeleted: { $ne: true }
    };
    
    console.log('✅ Filtro base para usuarios (APROBADOS y ACTIVOS):', filter);
    
    // ====== APLICAR FILTROS ADICIONALES ======
    
    // Filtrar por categoría
    if (category && category !== 'all') {
      filter.$or = [
        { category: category },
        { categories: category }
      ];
      console.log('🎯 Filtrando por categoría:', category);
    }
    
    // Filtrar por búsqueda de texto
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      // NO sobrescribas $or, crea un nuevo array
      const searchFilter = {
        $or: [
          { name: searchRegex },
          { description: searchRegex },
          { address: searchRegex },
          { 'services.name': searchRegex }
        ]
      };
      
      // Si ya existe un $or por categoría, combinamos con $and
      if (filter.$or) {
        filter = {
          $and: [
            { ...filter },
            searchFilter
          ]
        };
      } else {
        filter.$or = searchFilter.$or;
      }
      
      console.log('🔎 Filtrando por búsqueda:', search);
    }
    
    // Filtrar por destacados
    if (featured === 'true') {
      filter.featured = true;
      console.log('⭐ Filtrando por destacados');
    }
    
    // Filtrar por ciudad
    if (city && city.trim() !== '') {
      const cityFilter = { address: { $regex: city.trim(), $options: 'i' } };
      
      if (filter.$or) {
        filter = {
          $and: [
            { ...filter },
            cityFilter
          ]
        };
      } else {
        filter.address = { $regex: city.trim(), $options: 'i' };
      }
      
      console.log('🏙️ Filtrando por ciudad:', city);
    }
    
    // Filtrar por rango de precios
    if (minPrice || maxPrice) {
      filter['services.price'] = {};
      if (minPrice) {
        filter['services.price'].$gte = Number(minPrice);
        console.log('💰 Precio mínimo:', minPrice);
      }
      if (maxPrice) {
        filter['services.price'].$lte = Number(maxPrice);
        console.log('💰 Precio máximo:', maxPrice);
      }
    }
    
    // Filtrar por "abierto ahora" (opcional)
    if (openNow === 'true') {
      console.log('⏰ Filtrando por abiertos ahora');
      // Este filtro se aplicará después en el código
    }
    
    // ====== PAGINACIÓN Y ORDENAMIENTO ======
    const skip = (page - 1) * limit;
    
    // Ordenamiento
    const sortOptions = {};
    if (sortBy === 'rating') {
      sortOptions.rating = order === 'asc' ? 1 : -1;
    } else if (sortBy === 'views') {
      sortOptions.views = order === 'asc' ? 1 : -1;
    } else if (sortBy === 'name') {
      sortOptions.name = order === 'asc' ? 1 : -1;
    } else if (sortBy === 'price') {
      sortOptions['services.price'] = order === 'asc' ? 1 : -1;
    } else {
      sortOptions.createdAt = order === 'asc' ? 1 : -1;
    }
    
    console.log('📊 Ordenando por:', sortBy, 'en orden:', order);
    console.log('📄 Paginación - Página:', page, 'Límite:', limit, 'Salto:', skip);
    console.log('🔎 Filtro final aplicado:', JSON.stringify(filter, null, 2));
    
    // ====== OBTENER COMERCIOS ======
    const businesses = await Business.find(filter)
      .populate('provider', 'name email avatar phone')
      .select('name category categories description address phone email image rating views featured services workingHours createdAt tags averageServicePrice location acceptOnlineBookings')
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));
    
    console.log(`✅ Comercios encontrados para usuarios: ${businesses.length}`);
    
    // ====== CONTAR TOTAL PARA PAGINACIÓN ======
    const total = await Business.countDocuments(filter);
    console.log(`📈 Total de comercios (con filtros): ${total}`);
    
    // Contar total sin filtros (para estadísticas)
    const totalApprovedActive = await Business.countDocuments({ 
      approved: true, 
      status: 'active',
      isDeleted: { $ne: true }
    });
    console.log(`📊 Total aprobados y activos en BD: ${totalApprovedActive}`);
    
    // Si no hay resultados, intentar sugerir alternativas
    if (businesses.length === 0 && (search || category || city)) {
      console.log('⚠️ No hay resultados con filtros, mostrando todos los comercios activos...');
      
      const alternativeFilter = { 
        approved: true, 
        status: 'active',
        isDeleted: { $ne: true }
      };
      
      const alternativeResults = await Business.find(alternativeFilter)
        .populate('provider', 'name email avatar phone')
        .select('name category categories description address phone email image rating views featured services workingHours createdAt tags averageServicePrice location acceptOnlineBookings')
        .sort(sortOptions)
        .limit(Number(limit));
      
      if (alternativeResults.length > 0) {
        console.log(`🔄 Mostrando ${alternativeResults.length} comercios como alternativa`);
        // Aquí podrías decidir usar estos resultados alternativos
        // Por ahora solo informamos en la consola
      }
    }
    
    // ====== CALCULAR ESTADÍSTICAS ======
    const featuredCount = await Business.countDocuments({ 
      approved: true, 
      status: 'active',
      isDeleted: { $ne: true },
      featured: true 
    });
    
    // Calcular comercios abiertos ahora
    const now = new Date();
    const currentDay = now.toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const openBusinesses = businesses.filter(business => {
      if (!business.workingHours?.days?.includes(currentDay)) return false;
      
      const [openHour, openMin] = (business.workingHours.open || '00:00').split(':').map(Number);
      const [closeHour, closeMin] = (business.workingHours.close || '23:59').split(':').map(Number);
      
      const openTime = openHour * 60 + openMin;
      const closeTime = closeHour * 60 + closeMin;
      
      return currentTime >= openTime && currentTime <= closeTime;
    });
    
    // Calcular total de servicios activos
    const totalServices = businesses.reduce((sum, business) => {
      return sum + (business.services?.filter(s => s.isActive !== false).length || 0);
    }, 0);
    
    // Obtener categorías disponibles
    const categories = await Business.distinct('category', { 
      approved: true, 
      status: 'active',
      isDeleted: { $ne: true }
    });
    
    // Obtener ciudades disponibles
    const cities = await Business.aggregate([
      { 
        $match: { 
          approved: true, 
          status: 'active',
          isDeleted: { $ne: true },
          address: { $exists: true, $ne: "" }
        } 
      },
      {
        $project: {
          city: { $arrayElemAt: [{ $split: ["$address", ","] }, 0] }
        }
      },
      {
        $group: {
          _id: "$city",
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    const availableCities = cities.map(c => c._id).filter(c => c);
    
    // ====== PREPARAR RESPUESTA ======
    const businessesWithDetails = businesses.map(business => {
      const businessObj = business.toObject();
      
      // Calcular si está abierto ahora
      businessObj.isOpenNow = isOpenNow(business.workingHours);
      
      // Obtener servicios activos
      businessObj.activeServices = business.services?.filter(s => s.isActive !== false) || [];
      
      // Calcular precio promedio si no existe
      if (!businessObj.averageServicePrice && businessObj.activeServices.length > 0) {
        const totalPrice = businessObj.activeServices.reduce((sum, service) => sum + (service.price || 0), 0);
        businessObj.averageServicePrice = Math.round(totalPrice / businessObj.activeServices.length);
      }
      
      // Formatear horarios
      if (business.workingHours) {
        businessObj.formattedHours = formatWorkingHours(business.workingHours);
      }
      
      // Asegurar que haya una imagen
      if (!businessObj.image || businessObj.image.trim() === '') {
        businessObj.image = getDefaultBusinessImage(businessObj.category);
      }
      
      return businessObj;
    });
    
    // ====== ENVIAR RESPUESTA ======
    res.json({
      success: true,
      businesses: businessesWithDetails,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      stats: {
        total: totalApprovedActive, // Total de comercios aprobados y activos
        featured: featuredCount,
        openNow: openBusinesses.length,
        totalServices
      },
      filters: {
        categories,
        cities: availableCities
      },
      appliedFilters: {
        category: category || '',
        search: search || '',
        featured: featured || '',
        city: city || '',
        minPrice: minPrice || '',
        maxPrice: maxPrice || '',
        sortBy: sortBy || 'createdAt',
        order: order || 'desc'
      },
      debug: {
        filterApplied: filter,
        totalWithFilter: total,
        totalApprovedActive: totalApprovedActive
      }
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo comercios para usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener comercios',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      debug: process.env.NODE_ENV === 'development' ? { stack: error.stack } : undefined
    });
  }
};
/**
 * @desc    Obtener comercio específico (compartido para proveedores/admin)
 * @route   GET /api/businesses/by-id/:id
 * @access  Privado (Proveedor/Admin)
 */
export const getBusinessById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    console.log(`🔍 Buscando comercio ID: ${id} para usuario: ${userId}, rol: ${userRole}`);
    
    // Construir filtro base
    let filter = { _id: id, isDeleted: { $ne: true } };
    
    // Si no es admin, solo puede ver sus propios comercios
    if (userRole !== 'admin') {
      filter.provider = userId;
    }
    
    // Buscar comercio
    const business = await Business.findOne(filter)
      .populate('provider', 'name email avatar phone bio')
      .populate('approvedBy', 'name email')
      .select('-__v');
    
    if (!business) {
      console.log('❌ Comercio no encontrado o no autorizado:', id);
      return res.status(404).json({
        success: false,
        message: 'Comercio no encontrado o no tienes permisos para verlo'
      });
    }
    
    console.log(`✅ Comercio encontrado: ${business.name} | Aprobado: ${business.approved} | Estado: ${business.status}`);
    
    // Preparar respuesta
    const businessObj = business.toObject();
    
    // Verificar si está abierto ahora
    businessObj.isOpenNow = isOpenNow(business.workingHours);
    
    // Obtener servicios activos
    businessObj.activeServices = business.services?.filter(s => s.isActive !== false) || [];
    
    // Formatear horarios
    if (business.workingHours) {
      businessObj.formattedHours = formatWorkingHours(business.workingHours);
      businessObj.daysOpen = business.workingHours.days || [];
    }
    
    // Calcular tiempo desde creación
    const createdDate = new Date(business.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - createdDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) businessObj.timeSinceCreation = 'Hoy';
    else if (diffDays === 1) businessObj.timeSinceCreation = 'Ayer';
    else if (diffDays < 7) businessObj.timeSinceCreation = `Hace ${diffDays} días`;
    else if (diffDays < 30) businessObj.timeSinceCreation = `Hace ${Math.floor(diffDays / 7)} semanas`;
    else if (diffDays < 365) businessObj.timeSinceCreation = `Hace ${Math.floor(diffDays / 30)} meses`;
    else businessObj.timeSinceCreation = `Hace ${Math.floor(diffDays / 365)} años`;
    
    // Calcular precio promedio de servicios activos
    if (businessObj.activeServices.length > 0 && !businessObj.averageServicePrice) {
      const totalPrice = businessObj.activeServices.reduce((sum, service) => sum + (service.price || 0), 0);
      businessObj.averageServicePrice = Math.round(totalPrice / businessObj.activeServices.length);
    }
    
    // Asegurar que haya una imagen
    if (!businessObj.image || businessObj.image.trim() === '') {
      businessObj.image = getDefaultBusinessImage(businessObj.category);
    }
    
    // Estadísticas adicionales (si no existen)
    if (!businessObj.views) businessObj.views = 0;
    if (!businessObj.monthlyViews) businessObj.monthlyViews = 0;
    if (!businessObj.totalAppointments) businessObj.totalAppointments = 0;
    if (!businessObj.totalBookings) businessObj.totalBookings = 0;
    if (!businessObj.totalRevenue) businessObj.totalRevenue = 0;
    
    res.json({
      success: true,
      business: businessObj
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo comercio:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el comercio',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      debug: process.env.NODE_ENV === 'development' ? { stack: error.stack } : undefined
    });
  }
};
/**
 * @desc    Obtener comercio específico para usuarios (ruta pública) - Solo APROBADOS y ACTIVOS
 * @route   GET /api/businesses/:id
 * @access  Público
 */
export const getBusinessByIdForUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`🔍 Buscando comercio ID: ${id} (aprobado y activo)`);
    
    // Buscar comercio APROBADO y ACTIVO
    const business = await Business.findOne({
      approved: true,
    })
    .populate('provider', 'name email avatar phone bio')
    .populate('approvedBy', 'name email')
    .select('name category categories description address phone email image rating views featured services workingHours provider createdAt updatedAt tags averageServicePrice location website socialMedia totalAppointments totalBookings totalRevenue acceptOnlineBookings cancellationPolicy isVerified verificationDate');
    
    if (!business) {
      console.log('❌ Comercio no encontrado o no disponible:', id);
      return res.status(404).json({
        success: false,
        message: 'Comercio no encontrado o no disponible'
      });
    }
    
    console.log(`✅ Comercio encontrado (aprobado y activo): ${business.name}`);
    
    // Incrementar vistas
    business.views = (business.views || 0) + 1;
    await business.save();
    
    // Calcular detalles adicionales
    const businessObj = business.toObject();
    
    // Verificar si está abierto ahora
    businessObj.isOpenNow = isOpenNow(business.workingHours);
    
    // Obtener servicios activos
    businessObj.activeServices = business.services?.filter(s => s.isActive !== false) || [];
    
    // Formatear horarios
    if (business.workingHours) {
      businessObj.formattedHours = formatWorkingHours(business.workingHours);
      businessObj.daysOpen = business.workingHours.days || [];
    }
    
    // Calcular tiempo desde creación
    const createdDate = new Date(business.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - createdDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) businessObj.timeSinceCreation = 'Hoy';
    else if (diffDays === 1) businessObj.timeSinceCreation = 'Ayer';
    else if (diffDays < 7) businessObj.timeSinceCreation = `Hace ${diffDays} días`;
    else if (diffDays < 30) businessObj.timeSinceCreation = `Hace ${Math.floor(diffDays / 7)} semanas`;
    else if (diffDays < 365) businessObj.timeSinceCreation = `Hace ${Math.floor(diffDays / 30)} meses`;
    else businessObj.timeSinceCreation = `Hace ${Math.floor(diffDays / 365)} años`;
    
    // Si el usuario está autenticado, verificar si es favorito
    if (req.user) {
      const user = await User.findById(req.user.id);
      if (user) {
        businessObj.isFavorite = user.favoriteBusinesses?.includes(business._id) || false;
      }
    }
    
    // Asegurar que haya una imagen
    if (!businessObj.image || businessObj.image.trim() === '') {
      businessObj.image = getDefaultBusinessImage(businessObj.category);
    }
    
    res.json({
      success: true,
      business: businessObj
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo comercio:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el comercio',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Obtener horarios disponibles para citas - Solo comercios APROBADOS y ACTIVOS
 * @route   GET /api/businesses/:id/available-hours
 * @access  Público
 */
export const getAvailableHours = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'La fecha es requerida'
      });
    }
    
    // Verificar que el comercio existe, está APROBADO y ACTIVO
    const business = await Business.findOne({
      _id: id,
      approved: true,
      status: 'active',
      isDeleted: { $ne: true },
      acceptOnlineBookings: true
    });
    
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Comercio no encontrado o no acepta reservas en línea'
      });
    }
    
    // Verificar que la fecha sea válida
    const selectedDate = new Date(date);
    if (isNaN(selectedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Fecha inválida'
      });
    }
    
    // Obtener el día de la semana
    const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const dayOfWeek = days[selectedDate.getDay()];
    
    // Verificar si el comercio trabaja ese día
    if (!business.workingHours?.days?.includes(dayOfWeek)) {
      return res.json({
        success: true,
        availableHours: [],
        message: 'El comercio no trabaja este día'
      });
    }
    
    // Generar horas disponibles
    const availableHours = generateAvailableHours(
      business.workingHours,
      selectedDate,
      [],
      business.bookingLeadTime || 60
    );
    
    res.json({
      success: true,
      availableHours,
      businessHours: {
        open: business.workingHours.open,
        close: business.workingHours.close,
        days: business.workingHours.days,
        specialDay: business.workingHours.specialDay,
        specialOpen: business.workingHours.specialOpen,
        specialClose: business.workingHours.specialClose
      }
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo horarios disponibles:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener horarios disponibles',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Obtener comercios favoritos del usuario - Solo APROBADOS y ACTIVOS
 * @route   GET /api/businesses/user/favorites
 * @access  Privado (Usuario)
 */
export const getUserFavoriteBusinesses = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Obtener usuario con sus favoritos
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Si no tiene favoritos, devolver array vacío
    const favoriteIds = user.favoriteBusinesses || [];
    
    if (favoriteIds.length === 0) {
      return res.json({
        success: true,
        businesses: [],
        message: 'No tienes comercios favoritos'
      });
    }
    
    // Obtener comercios favoritos (solo APROBADOS y ACTIVOS)
    const businesses = await Business.find({
      _id: { $in: favoriteIds },
      approved: true,
      status: 'active',
      isDeleted: { $ne: true }
    })
    .populate('provider', 'name email avatar')
    .select('name category image address rating averageServicePrice services workingHours featured acceptOnlineBookings')
    .sort({ featured: -1, rating: -1 });
    
    // Añadir información adicional
    const businessesWithDetails = businesses.map(business => {
      const businessObj = business.toObject();
      businessObj.isOpenNow = isOpenNow(business.workingHours);
      
      // Asegurar que haya una imagen
      if (!businessObj.image || businessObj.image.trim() === '') {
        businessObj.image = getDefaultBusinessImage(businessObj.category);
      }
      
      return businessObj;
    });
    
    res.json({
      success: true,
      businesses: businessesWithDetails,
      count: businesses.length
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo favoritos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener comercios favoritos',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Agregar/remover comercio de favoritos - Solo si está APROBADO y ACTIVO
 * @route   POST /api/businesses/user/favorites/:id
 * @route   DELETE /api/businesses/user/favorites/:id
 * @access  Privado (Usuario)
 */
export const toggleFavoriteBusiness = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Verificar que el comercio existe, está APROBADO y ACTIVO
    const business = await Business.findOne({
      _id: id,
      approved: true,
      status: 'active',
      isDeleted: { $ne: true }
    });
    
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Comercio no encontrado o no disponible'
      });
    }
    
    // Actualizar favoritos del usuario
    const user = await User.findById(userId);
    
    if (!user.favoriteBusinesses) {
      user.favoriteBusinesses = [];
    }
    
    const index = user.favoriteBusinesses.indexOf(id);
    let isFavorite = false;
    
    if (index > -1) {
      // Remover de favoritos
      user.favoriteBusinesses.splice(index, 1);
    } else {
      // Agregar a favoritos
      user.favoriteBusinesses.push(id);
      isFavorite = true;
    }
    
    await user.save();
    
    res.json({
      success: true,
      isFavorite,
      message: isFavorite 
        ? 'Comercio agregado a favoritos' 
        : 'Comercio removido de favoritos'
    });
    
  } catch (error) {
    console.error('❌ Error actualizando favoritos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar favoritos',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Obtener estadísticas públicas - Solo de comercios APROBADOS y ACTIVOS
 * @route   GET /api/businesses/stats
 * @access  Público
 */
export const getBusinessStatsPublic = async (req, res) => {
  try {
    const stats = await Business.aggregate([
      { 
        $match: { 
          approved: true,
          status: 'active',
          isDeleted: { $ne: true }
        } 
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          featured: { $sum: { $cond: ['$featured', 1, 0] } },
          byCategory: {
            $push: {
              category: "$category",
              categories: "$categories"
            }
          },
          totalServices: { 
            $sum: { 
              $size: {
                $filter: {
                  input: "$services",
                  as: "service",
                  cond: { $ne: ["$$service.isActive", false] }
                }
              }
            }
          },
          totalViews: { $sum: "$views" },
          averageRating: { $avg: "$rating" }
        }
      },
      {
        $project: {
          _id: 0,
          total: 1,
          featured: 1,
          totalServices: 1,
          totalViews: 1,
          averageRating: { $round: ["$averageRating", 2] },
          categories: {
            $reduce: {
              input: "$byCategory",
              initialValue: [],
              in: {
                $concatArrays: [
                  "$$value",
                  {
                    $cond: [
                      { $isArray: "$$this.categories" },
                      "$$this.categories",
                      ["$$this.category"]
                    ]
                  }
                ]
              }
            }
          }
        }
      }
    ]);

    const result = stats[0] || {
      total: 0,
      featured: 0,
      totalServices: 0,
      totalViews: 0,
      averageRating: 0,
      categories: []
    };

    // Contar comercios abiertos ahora (solo APROBADOS y ACTIVOS)
    const currentDay = new Date().toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase();
    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    const currentTotalMinutes = currentHour * 60 + currentMinute;

    const openBusinesses = await Business.countDocuments({
      approved: true,
      status: 'active',
      isDeleted: { $ne: true },
      "workingHours.days": currentDay,
      $expr: {
        $and: [
          { $ne: ["$workingHours.open", ""] },
          { $ne: ["$workingHours.close", ""] },
          {
            $let: {
              vars: {
                openTime: { $split: ["$workingHours.open", ":"] },
                closeTime: { $split: ["$workingHours.close", ":"] }
              },
              in: {
                $and: [
                  {
                    $lte: [
                      {
                        $add: [
                          { $toInt: { $arrayElemAt: ["$$openTime", 0] } },
                          { $divide: [{ $toInt: { $arrayElemAt: ["$$openTime", 1] } }, 60] }
                        ]
                      },
                      currentTotalMinutes / 60
                    ]
                  },
                  {
                    $gte: [
                      {
                        $add: [
                          { $toInt: { $arrayElemAt: ["$$closeTime", 0] } },
                          { $divide: [{ $toInt: { $arrayElemAt: ["$$closeTime", 1] } }, 60] }
                        ]
                      },
                      currentTotalMinutes / 60
                    ]
                  }
                ]
              }
            }
          }
        ]
      }
    });

    result.openNow = openBusinesses;
    
    // Contar categorías únicas (solo de comercios APROBADOS y ACTIVOS)
    result.categoryCount = {};
    result.categories.forEach(cat => {
      result.categoryCount[cat] = (result.categoryCount[cat] || 0) + 1;
    });
    
    // Convertir a array para fácil acceso
    result.categoryDistribution = Object.entries(result.categoryCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    res.json({
      success: true,
      stats: result
    });
  } catch (error) {
    console.error("Error obteniendo estadísticas públicas:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al obtener estadísticas", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Obtener recomendaciones basadas en historial del usuario - Solo APROBADOS y ACTIVOS
 * @route   GET /api/businesses/recommended/:userId
 * @access  Público (puede requerir autenticación)
 */
export const getRecommendedBusinesses = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Solo comercios APROBADOS y ACTIVOS
    const recommendations = await Business.find({
      approved: true,
      status: 'active',
      isDeleted: { $ne: true },
      featured: true,
      rating: { $gte: 4 }
    })
    .populate('provider', 'name email avatar')
    .select('name category image address rating services averageServicePrice workingHours acceptOnlineBookings')
    .sort({ rating: -1, views: -1 })
    .limit(6);
    
    // Añadir información adicional
    const recommendationsWithDetails = recommendations.map(business => {
      const businessObj = business.toObject();
      businessObj.isOpenNow = isOpenNow(business.workingHours);
      
      // Asegurar que haya una imagen
      if (!businessObj.image || businessObj.image.trim() === '') {
        businessObj.image = getDefaultBusinessImage(businessObj.category);
      }
      
      return businessObj;
    });
    
    res.json({
      success: true,
      recommendations: recommendationsWithDetails
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo recomendaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener recomendaciones',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Registrar visita a comercio - Solo si está APROBADO y ACTIVO
 * @route   POST /api/businesses/:id/record-view
 * @access  Público (con opción de autenticación para usuarios)
 */
export const recordBusinessView = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id; // Opcional, si el usuario está autenticado
    
    // Verificar que el comercio exista y esté APROBADO y ACTIVO
    const business = await Business.findOne({
      _id: id,
      approved: true,
      status: 'active',
      isDeleted: { $ne: true }
    });
    
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Comercio no encontrado o no disponible'
      });
    }
    
    // Incrementar vistas del comercio
    business.views = (business.views || 0) + 1;
    business.monthlyViews = (business.monthlyViews || 0) + 1;
    business.lastActivity = new Date();
    await business.save();
    
    // Si el usuario está autenticado, actualizar su historial
    if (userId) {
      await User.findByIdAndUpdate(userId, {
        $addToSet: {
          recentlyViewedBusinesses: {
            $each: [{
              business: id,
              viewedAt: new Date()
            }],
            $slice: -20 // Mantener solo los últimos 20
          }
        }
      });
    }
    
    res.json({
      success: true,
      views: business.views,
      message: 'Visita registrada'
    });
    
  } catch (error) {
    console.error('❌ Error registrando visita:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar visita',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Obtener comercios para reservar citas - Solo APROBADOS y ACTIVOS
 * @route   GET /api/businesses/appointment/available
 * @access  Público/Autenticado
 */
export const getBusinessesForAppointment = async (req, res) => {
  try {
    const { 
      category,
      date,
      time,
      petType
    } = req.query;
    
    // Construir filtro base: Solo APROBADOS y ACTIVOS
    let filter = { 
      approved: true, 
      status: 'active',
      isDeleted: { $ne: true },
      acceptOnlineBookings: true
    };
    
    // Filtrar por categoría si se especifica
    if (category) {
      filter.$or = [
        { category: category },
        { categories: category }
      ];
    }
    
    // Si hay fecha, verificar que el comercio trabaje ese día
    if (date) {
      const selectedDate = new Date(date);
      const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
      const dayOfWeek = days[selectedDate.getDay()];
      
      filter['workingHours.days'] = dayOfWeek;
    }
    
    // Obtener comercios (solo APROBADOS y ACTIVOS)
    const businesses = await Business.find(filter)
      .populate('provider', 'name email avatar phone')
      .select('name category categories description address phone email image rating services workingHours acceptOnlineBookings bookingLeadTime cancellationPolicy')
      .sort({ name: 1 });
    
    // Procesar cada comercio para determinar disponibilidad
    const businessesWithAvailability = businesses.map(business => {
      const businessObj = business.toObject();
      
      // Verificar si está abierto ahora
      businessObj.isOpenNow = isOpenNow(business.workingHours);
      
      // Obtener servicios activos
      businessObj.activeServices = business.services?.filter(s => s.isActive !== false) || [];
      
      // Si hay fecha, verificar disponibilidad de horarios
      if (date) {
        const selectedDate = new Date(date);
        const availableHours = generateAvailableHours(
          business.workingHours,
          selectedDate,
          [],
          business.bookingLeadTime || 60
        );
        businessObj.availableHours = availableHours;
      }
      
      // Asegurar que haya una imagen
      if (!businessObj.image || businessObj.image.trim() === '') {
        businessObj.image = getDefaultBusinessImage(businessObj.category);
      }
      
      return businessObj;
    });
    
    res.json({
      success: true,
      businesses: businessesWithAvailability,
      count: businessesWithAvailability.length
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo comercios para citas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener comercios para citas',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Obtener comercios destacados - Solo APROBADOS y ACTIVOS
 * @route   GET /api/businesses/featured
 * @access  Público
 */
export const getFeaturedBusinesses = async (req, res) => {
  try {
    const featured = await Business.find({ 
      approved: true, 
      featured: true,
      status: 'active',
      isDeleted: { $ne: true }
    })
      .populate("provider", "name lastname email avatar")
      .sort({ createdAt: -1 })
      .limit(10);
    
    const businessesWithImages = featured.map(business => {
      const businessObj = business.toObject();
      
      // Asegurar que haya una imagen
      if (!businessObj.image || businessObj.image.trim() === '') {
        businessObj.image = getDefaultBusinessImage(businessObj.category);
      }
      
      return businessObj;
    });
    
    res.json({
      success: true,
      businesses: businessesWithImages
    });
  } catch (error) {
    console.error("Error al obtener comercios destacados:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al obtener comercios destacados", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Obtener comercios por ubicación - Solo APROBADOS y ACTIVOS
 * @route   GET /api/businesses/by-location
 * @access  Público
 */
export const getBusinessesByLocation = async (req, res) => {
  try {
    const { city, region, postalCode } = req.query;
    
    let filter = { 
      approved: true,
      status: 'active',
      isDeleted: { $ne: true }
    };
    
    // Filtrar por ciudad si se proporciona
    if (city) {
      filter.address = { $regex: city, $options: 'i' };
    }
    
    // Filtrar por región si se proporciona
    if (region) {
      filter.address = { ...filter.address, $regex: region, $options: 'i' };
    }
    
    // Filtrar por código postal si se proporciona
    if (postalCode) {
      filter.address = { ...filter.address, $regex: postalCode, $options: 'i' };
    }
    
    const businesses = await Business.find(filter)
      .populate("provider", "name lastname email avatar")
      .limit(50);
    
    const businessesWithImages = businesses.map(business => {
      const businessObj = business.toObject();
      
      // Asegurar que haya una imagen
      if (!businessObj.image || businessObj.image.trim() === '') {
        businessObj.image = getDefaultBusinessImage(businessObj.category);
      }
      
      return businessObj;
    });
    
    res.json({
      success: true,
      businesses: businessesWithImages
    });
  } catch (error) {
    console.error("Error al obtener comercios por ubicación:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al obtener comercios por ubicación", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Obtener todos los comercios aprobados (público) - VERSIÓN COMPATIBILIDAD
 * @route   GET /api/businesses/all
 * @access  Público
 */
export const getBusinesses = async (req, res) => {
  try {
    const { 
      category, 
      search, 
      status = 'active',
      page = 1,
      limit = 12,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;
    
    // Construir filtro base
    let filter = { 
      approved: true,
      status: status,
      isDeleted: { $ne: true }
    };
    
    // Filtrar por categoría
    if (category && category !== 'all') {
      filter.$or = [
        { category: category },
        { categories: category }
      ];
    }
    
    // Filtrar por búsqueda de texto
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { address: searchRegex }
      ];
    }
    
    // Calcular paginación
    const skip = (page - 1) * limit;
    
    // Ordenamiento
    const sortOptions = {};
    if (sortBy === 'rating') {
      sortOptions.rating = order === 'asc' ? 1 : -1;
    } else if (sortBy === 'views') {
      sortOptions.views = order === 'asc' ? 1 : -1;
    } else if (sortBy === 'name') {
      sortOptions.name = order === 'asc' ? 1 : -1;
    } else {
      sortOptions.createdAt = order === 'asc' ? 1 : -1;
    }
    
    // Obtener comercios
    const businesses = await Business.find(filter)
      .populate('provider', 'name email avatar')
      .select('name category categories description address phone email image rating views featured services workingHours createdAt averageServicePrice')
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));
    
    // Contar total para paginación
    const total = await Business.countDocuments(filter);
    
    // Preparar respuesta
    const businessesWithDetails = businesses.map(business => {
      const businessObj = business.toObject();
      
      // Calcular si está abierto ahora
      businessObj.isOpenNow = isOpenNow(business.workingHours);
      
      // Obtener servicios activos
      businessObj.activeServices = business.services?.filter(s => s.isActive !== false) || [];
      
      // Asegurar que haya una imagen
      if (!businessObj.image || businessObj.image.trim() === '') {
        businessObj.image = getDefaultBusinessImage(businessObj.category);
      }
      
      return businessObj;
    });
    
    res.json({
      success: true,
      businesses: businessesWithDetails,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo comercios (legacy):', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener comercios',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Incrementar vistas de un comercio
 * @route   POST /api/businesses/:id/increment-views
 * @access  Público
 */
export const incrementBusinessViews = async (req, res) => {
  try {
    const { id } = req.params;
    const business = await Business.findById(id);
    
    if (!business) {
      return res.status(404).json({ 
        success: false,
        message: "Comercio no encontrado" 
      });
    }

    business.views = (business.views || 0) + 1;
    await business.save();

    res.json({ 
      success: true,
      message: "Vistas incrementadas",
      views: business.views
    });
  } catch (error) {
    console.error("Error al incrementar vistas:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al incrementar vistas", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ===================== ENDPOINTS COMPARTIDOS =====================

// ➕ Crear comercio (compartido entre proveedor y admin)
export const createBusiness = async (req, res) => {
  try {
    const { 
      name, 
      category, 
      categories,
      description, 
      address, 
      phone, 
      email, 
      image, 
      status,
      workingHours,
      services 
    } = req.body;
    
    const providerId = req.user.id;
    const isAdmin = req.user.role === "admin";

    // Verificar que el usuario sea proveedor o admin
    const user = await User.findById(providerId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "Usuario no encontrado" 
      });
    }
    
    if (user.role !== 'provider' && user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: "Solo proveedores y administradores pueden crear comercios" 
      });
    }

    // Validar campos requeridos
    if (!name) {
      return res.status(400).json({ 
        success: false,
        message: "El nombre es requerido" 
      });
    }
    if (!description) {
      return res.status(400).json({ 
        success: false,
        message: "La descripción es requerida" 
      });
    }
    if (!address) {
      return res.status(400).json({ 
        success: false,
        message: "La dirección es requerida" 
      });
    }
    if (!phone) {
      return res.status(400).json({ 
        success: false,
        message: "El teléfono es requerido" 
      });
    }
    if (!email) {
      return res.status(400).json({ 
        success: false,
        message: "El email es requerido" 
      });
    }

    // Validar formato de email
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        message: "Formato de email inválido" 
      });
    }

    // Validar formato de teléfono
    const phoneRegex = /^[0-9+\-\s()]{8,15}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ 
        success: false,
        message: "Formato de teléfono inválido (8-15 dígitos)" 
      });
    }

    // ====== VALIDAR IMAGEN BASE64 ======
    let imageData = '';
    
    if (image) {
      if (typeof image !== 'string') {
        return res.status(400).json({ 
          success: false,
          message: "La imagen debe ser una cadena Base64" 
        });
      }
      
      if (image.startsWith('data:image/')) {
        // Es Base64, validar formato
        const base64Regex = /^data:image\/(png|jpeg|jpg|gif|webp);base64,[A-Za-z0-9+/]+=*$/;
        
        if (!base64Regex.test(image)) {
          return res.status(400).json({ 
            success: false,
            message: "Formato Base64 de imagen inválido" 
          });
        }
        
        imageData = image;
      } else {
        imageData = image;
      }
    }

    // Manejar categorías
    let businessCategories = [];
    if (categories && Array.isArray(categories) && categories.length > 0) {
      businessCategories = categories;
    } else if (category) {
      businessCategories = [category];
    }
    
    // Validar que haya al menos una categoría
    if (businessCategories.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: "Debe seleccionar al menos una categoría" 
      });
    }

    // Validar que las categorías sean válidas
    const validCategories = [
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
    ];

    const invalidCategories = businessCategories.filter(cat => !validCategories.includes(cat));
    if (invalidCategories.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: `Categorías inválidas: ${invalidCategories.join(', ')}` 
      });
    }

    // Si es admin creando para otro proveedor, usar providerId del body
    const finalProviderId = isAdmin && req.body.provider ? req.body.provider : providerId;

    // Validar que no exista un comercio con el mismo nombre o email para este proveedor
    try {
      const existingBusiness = await Business.findOne({ 
        $or: [
          { name, provider: finalProviderId },
          { email, provider: finalProviderId }
        ]
      });

      if (existingBusiness) {
        return res.status(400).json({
          success: false,
          message: "Ya tienes un comercio registrado con este nombre o email"
        });
      }
    } catch (error) {
      console.error("Error verificando comercio existente:", error);
    }

    // Validar y formatear workingHours
    let formattedWorkingHours = {
      open: '',
      close: '',
      days: [],
      specialDay: '',
      specialOpen: '',
      specialClose: '',
      regular: '',
      daysString: '',
      special: ''
    };

    if (workingHours) {
      // Validar días válidos
      const validDays = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
      
      if (workingHours.days) {
        const daysArray = Array.isArray(workingHours.days) 
          ? workingHours.days 
          : (typeof workingHours.days === 'string' 
              ? workingHours.days.split(',').map(d => d.trim().toLowerCase()) 
              : []);
        
        const invalidDays = daysArray.filter(day => !validDays.includes(day));
        if (invalidDays.length > 0) {
          return res.status(400).json({ 
            success: false,
            message: `Días inválidos: ${invalidDays.join(', ')}. Días válidos: ${validDays.join(', ')}` 
          });
        }
        
        formattedWorkingHours.days = daysArray;
      }

      // Validar formato de horas
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      
      if (workingHours.open) {
        if (!timeRegex.test(workingHours.open)) {
          return res.status(400).json({ 
            success: false,
            message: "Formato de hora de apertura inválido (use HH:MM)" 
          });
        }
        formattedWorkingHours.open = workingHours.open;
      }
      
      if (workingHours.close) {
        if (!timeRegex.test(workingHours.close)) {
          return res.status(400).json({ 
            success: false,
            message: "Formato de hora de cierre inválido (use HH:MM)" 
          });
        }
        formattedWorkingHours.close = workingHours.close;
      }

      // Validar que si hay open, también haya close
      if ((workingHours.open && !workingHours.close) || (!workingHours.open && workingHours.close)) {
        return res.status(400).json({ 
          success: false,
          message: "Los horarios de apertura y cierre deben ir juntos" 
        });
      }

      // Validar que close sea después de open
      if (workingHours.open && workingHours.close) {
        const [openHour, openMin] = workingHours.open.split(':').map(Number);
        const [closeHour, closeMin] = workingHours.close.split(':').map(Number);
        
        const openTotal = openHour * 60 + openMin;
        const closeTotal = closeHour * 60 + closeMin;
        
        if (closeTotal <= openTotal) {
          return res.status(400).json({ 
            success: false,
            message: "La hora de cierre debe ser posterior a la hora de apertura" 
          });
        }
        
        formattedWorkingHours.regular = `${workingHours.open} - ${workingHours.close}`;
      }

      // Validar specialDay
      const validSpecialDays = ['', 'festivos', 'domingos', 'sabados', 'vacaciones'];
      if (workingHours.specialDay && !validSpecialDays.includes(workingHours.specialDay)) {
        return res.status(400).json({ 
          success: false,
          message: `Día especial inválido. Válidos: ${validSpecialDays.filter(d => d).join(', ')}` 
        });
      }
      formattedWorkingHours.specialDay = workingHours.specialDay || '';

      // Validar horas especiales
      if (workingHours.specialOpen) {
        if (!timeRegex.test(workingHours.specialOpen)) {
          return res.status(400).json({ 
            success: false,
            message: "Formato de hora especial de apertura inválido (use HH:MM)" 
          });
        }
        formattedWorkingHours.specialOpen = workingHours.specialOpen;
      }
      
      if (workingHours.specialClose) {
        if (!timeRegex.test(workingHours.specialClose)) {
          return res.status(400).json({ 
            success: false,
            message: "Formato de hora especial de cierre inválido (use HH:MM)" 
          });
        }
        formattedWorkingHours.specialClose = workingHours.specialClose;
      }

      // Crear string para special
      if (workingHours.specialDay && workingHours.specialOpen && workingHours.specialClose) {
        const specialMap = {
          'festivos': 'Festivos',
          'domingos': 'Domingos',
          'sabados': 'Sábados',
          'vacaciones': 'Vacaciones'
        };
        formattedWorkingHours.special = `${workingHours.specialOpen} - ${workingHours.specialClose} (${specialMap[workingHours.specialDay] || workingHours.specialDay})`;
      }
    }

    // Validar servicios
    let validatedServices = [];
    if (services && Array.isArray(services)) {
      for (const service of services) {
        if (!service.name || service.price === undefined) {
          return res.status(400).json({ 
            success: false,
            message: "Cada servicio debe tener nombre y precio" 
          });
        }
        
        if (typeof service.price !== 'number' || service.price < 0) {
          return res.status(400).json({ 
            success: false,
            message: "El precio del servicio debe ser un número positivo" 
          });
        }
        
        validatedServices.push({
          name: service.name.trim(),
          price: service.price,
          description: service.description ? service.description.trim() : '',
          duration: service.duration || 60,
          isActive: service.isActive !== undefined ? service.isActive : true
        });
      }
    }

    // Crear el comercio
    const businessData = {
      name: name.trim(),
      category: businessCategories[0],
      categories: businessCategories,
      description: description.trim(),
      address: address.trim(),
      phone: phone.trim(),
      email: email.toLowerCase().trim(),
      image: imageData,
      status: status || (isAdmin ? 'active' : 'pending'),
      workingHours: formattedWorkingHours,
      services: validatedServices,
      provider: finalProviderId,
      approved: isAdmin ? true : false, // Admin crea aprobado, proveedor pendiente
      approvedBy: isAdmin ? providerId : null,
    };

    console.log("✅ Creando comercio:", name, "| Rol:", req.user.role, "| Aprobado:", isAdmin);
    
    const business = await Business.create(businessData);

    res.status(201).json({
      success: true,
      message: "Comercio creado exitosamente",
      business,
    });
  } catch (error) {
    console.error("Error al crear comercio:", error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Error de validación",
        errors: messages
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Ya existe un comercio con este nombre o email"
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: "Error al crear comercio", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ===================== ENDPOINTS DE PROVEEDOR =====================

// 👨‍🔧 Obtener comercios del proveedor autenticado (todos, sin filtrar por aprobado)
export const getMyBusinesses = async (req, res) => {
  try {
    const businesses = await Business.find({ provider: req.user.id })
      .sort({ createdAt: -1 });
    
    const businessesWithImages = businesses.map(business => {
      const businessObj = business.toObject();
      
      // Asegurar que haya una imagen
      if (!businessObj.image || businessObj.image.trim() === '') {
        businessObj.image = getDefaultBusinessImage(businessObj.category);
      }
      
      return businessObj;
    });
    
    res.json({
      success: true,
      businesses: businessesWithImages
    });
  } catch (error) {
    console.error("Error al obtener mis comercios:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al obtener comercios", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 📊 Estadísticas de comercios del proveedor
export const getBusinessStats = async (req, res) => {
  try {
    const providerId = req.user.id;
    
    // Verificar si el usuario tiene rol de provider o admin
    if (req.user.role !== 'provider' && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: "Solo proveedores y administradores pueden ver estadísticas" 
      });
    }
    
    // Si es provider, solo ver sus comercios
    const filter = req.user.role === 'provider' 
      ? { provider: new mongoose.Types.ObjectId(providerId) }
      : {};
    
    const stats = await Business.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
          inactive: { $sum: { $cond: [{ $eq: ["$status", "inactive"] }, 1, 0] } },
          approved: { $sum: { $cond: [{ $eq: ["$approved", true] }, 1, 0] } },
          featured: { $sum: { $cond: [{ $eq: ["$featured", true] }, 1, 0] } },
          totalServices: { $sum: { $size: "$services" } },
          totalViews: { $sum: "$views" }
        }
      }
    ]);

    const result = stats[0] || {
      total: 0,
      active: 0,
      pending: 0,
      inactive: 0,
      approved: 0,
      featured: 0,
      totalServices: 0,
      totalViews: 0
    };
    
    // Agregar estadísticas por categoría
    const byCategory = await Business.aggregate([
      { $match: filter },
      { $unwind: "$categories" },
      {
        $group: {
          _id: "$categories",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Si no hay categorías en array, usar el campo category antiguo
    if (byCategory.length === 0) {
      const byOldCategory = await Business.aggregate([
        { $match: filter },
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]);
      result.byCategory = byOldCategory;
    } else {
      result.byCategory = byCategory;
    }
    
    res.json({
      success: true,
      stats: result
    });
  } catch (error) {
    console.error("❌ ERROR en getBusinessStats:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al obtener estadísticas", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ===================== ENDPOINTS DE ADMINISTRADOR =====================

// 👑 Obtener todos los comercios para administrador (con filtros)
export const getAllBusinessesAdmin = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: "No tienes permiso para ver todos los comercios" 
      });
    }
    
    const { 
      page = 1,
      limit = 10,
      status,
      category,
      approved,
      featured,
      search,
      providerId
    } = req.query;
    
    let filter = {};
    
    // Aplicar filtros si existen
    if (status && status !== 'all') filter.status = status;
    if (category && category !== 'all') {
      filter.$or = [
        { category: category },
        { categories: category }
      ];
    }
    if (approved !== undefined && approved !== 'all') {
      filter.approved = approved === 'true';
    }
    if (featured !== undefined && featured !== 'all') {
      filter.featured = featured === 'true';
    }
    
    // Filtrar por proveedor si se especifica
    if (providerId && providerId !== 'all') {
      try {
        filter.provider = new mongoose.Types.ObjectId(providerId);
      } catch (error) {
        return res.status(400).json({ 
          success: false,
          message: "ID de proveedor inválido" 
        });
      }
    }
    
    // Búsqueda por texto
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { address: searchRegex },
        { email: searchRegex },
        { phone: searchRegex }
      ];
    }
    
    const skip = (page - 1) * limit;
    
    // Obtener comercios con población de proveedor
    const businesses = await Business.find(filter)
      .populate("provider", "name lastname email phone avatar")
      .populate("approvedBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Business.countDocuments(filter);
    
    // Obtener estadísticas de filtro actual
    const stats = await Business.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
          inactive: { $sum: { $cond: [{ $eq: ["$status", "inactive"] }, 1, 0] } },
          approved: { $sum: { $cond: [{ $eq: ["$approved", true] }, 1, 0] } }
        }
      }
    ]);
    
    const filterStats = stats[0] || {
      total: 0,
      active: 0,
      pending: 0,
      inactive: 0,
      approved: 0
    };
    
    res.json({
      success: true,
      businesses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      stats: filterStats
    });
    
  } catch (error) {
    console.error("Error al obtener comercios para admin:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al obtener comercios", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 🕓 Obtener comercios pendientes (solo admin)
export const getPendingBusinesses = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: "No tienes permiso para ver comercios pendientes" 
      });
    }
    
    const pending = await Business.find({ approved: false })
      .populate("provider", "name lastname email phone")
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      businesses: pending
    });
  } catch (error) {
    console.error("Error al obtener comercios pendientes:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al obtener comercios pendientes", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ✅ Aprobar comercio (admin) - También activa el comercio
export const approveBusiness = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: "Solo los administradores pueden aprobar comercios" 
      });
    }
    
    const { id } = req.params;
    const business = await Business.findById(id);
    
    if (!business) {
      return res.status(404).json({ 
        success: false,
        message: "Comercio no encontrado" 
      });
    }

    business.approved = true;
    business.status = 'active'; // Activar automáticamente al aprobar
    business.approvedBy = req.user.id;
    business.approvalDate = new Date();
    await business.save();

    res.json({ 
      success: true,
      message: "Comercio aprobado y activado exitosamente", 
      business 
    });
  } catch (error) {
    console.error("Error al aprobar comercio:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al aprobar comercio", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 🔄 Rechazar comercio (admin) - También inactiva el comercio
export const rejectBusiness = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: "Solo los administradores pueden rechazar comercios" 
      });
    }
    
    const { id } = req.params;
    const business = await Business.findById(id);
    
    if (!business) {
      return res.status(404).json({ 
        success: false,
        message: "Comercio no encontrado" 
      });
    }

    business.approved = false;
    business.status = 'inactive';
    await business.save();

    res.json({ 
      success: true,
      message: "Comercio rechazado y desactivado exitosamente", 
      business 
    });
  } catch (error) {
    console.error("Error al rechazar comercio:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al rechazar comercio", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ⭐ Marcar/desmarcar como destacado (admin only)
export const toggleFeatured = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: "Solo los administradores pueden marcar como destacado" 
      });
    }
    
    const { id } = req.params;
    const business = await Business.findById(id);
    
    if (!business) {
      return res.status(404).json({ 
        success: false,
        message: "Comercio no encontrado" 
      });
    }

    business.featured = !business.featured;
    await business.save();

    res.json({ 
      success: true,
      message: `Comercio ${business.featured ? 'marcado' : 'desmarcado'} como destacado`, 
      business 
    });
  } catch (error) {
    console.error("Error al actualizar destacado:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al actualizar destacado", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 📈 Estadísticas globales para admin
export const getGlobalStats = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: "Solo administradores pueden ver estadísticas globales" 
      });
    }
    
    const stats = await Business.aggregate([
      {
        $group: {
          _id: null,
          totalBusinesses: { $sum: 1 },
          activeBusinesses: { $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] } },
          pendingApproval: { $sum: { $cond: [{ $eq: ["$approved", false] }, 1, 0] } },
          approvedBusinesses: { $sum: { $cond: [{ $eq: ["$approved", true] }, 1, 0] } },
          featuredBusinesses: { $sum: { $cond: ["$featured", 1, 0] } },
          totalViews: { $sum: "$views" },
          byStatus: {
            $push: {
              status: "$status",
              approved: "$approved"
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalBusinesses: 1,
          activeBusinesses: 1,
          pendingApproval: 1,
          approvedBusinesses: 1,
          featuredBusinesses: 1,
          totalViews: 1,
          statusBreakdown: {
            active: { $size: { $filter: { input: "$byStatus", cond: { $eq: ["$$this.status", "active"] } } } },
            pending: { $size: { $filter: { input: "$byStatus", cond: { $eq: ["$$this.status", "pending"] } } } },
            inactive: { $size: { $filter: { input: "$byStatus", cond: { $eq: ["$$this.status", "inactive"] } } } }
          }
        }
      }
    ]);
    
    res.json({
      success: true,
      stats: stats[0] || {}
    });
  } catch (error) {
    console.error("Error al obtener estadísticas globales:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al obtener estadísticas globales", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ===================== ENDPOINTS COMPARTIDOS =====================

// ✏️ Actualizar comercio
export const updateBusiness = async (req, res) => {
  try {
    const { id } = req.params;
    const business = await Business.findById(id);
    
    if (!business) {
      return res.status(404).json({ 
        success: false,
        message: "Comercio no encontrado" 
      });
    }

    // Verificar permisos
    if (business.provider.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ 
        success: false,
        message: "No tienes permiso para editar este comercio" 
      });
    }

    const { 
      name, 
      category, 
      categories,
      description, 
      address, 
      phone, 
      email, 
      image, 
      status,
      workingHours,
      services 
    } = req.body;

    // Validar campos básicos si se proporcionan
    if (email) {
      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ 
          success: false,
          message: "Formato de email inválido" 
        });
      }
    }

    if (phone) {
      const phoneRegex = /^[0-9+\-\s()]{8,15}$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({ 
          success: false,
          message: "Formato de teléfono inválido (8-15 dígitos)" 
        });
      }
    }

    // ====== VALIDAR IMAGEN BASE64 SI SE ENVÍA ======
    let imageData = business.image; // Mantener la actual por defecto
    
    if (image !== undefined) {
      if (image === null || image === '') {
        // Eliminar imagen
        imageData = '';
      } else if (typeof image !== 'string') {
        return res.status(400).json({ 
          success: false,
          message: "La imagen debe ser una cadena Base64" 
        });
      } else if (image.startsWith('data:image/')) {
        // Es Base64, validar formato
        const base64Regex = /^data:image\/(png|jpeg|jpg|gif|webp);base64,[A-Za-z0-9+/]+=*$/;
        
        if (!base64Regex.test(image)) {
          return res.status(400).json({ 
            success: false,
            message: "Formato Base64 de imagen inválido" 
          });
        }
        
        imageData = image;
      } else {
        imageData = image;
      }
    }

    // Validar que no exista otro comercio con el mismo nombre o email (excepto este)
    if (name || email) {
      const existingBusiness = await Business.findOne({
        $and: [
          { _id: { $ne: id } },
          { provider: business.provider },
          {
            $or: [
              { name: name || business.name },
              { email: email || business.email }
            ]
          }
        ]
      });

      if (existingBusiness) {
        return res.status(400).json({
          success: false,
          message: "Ya tienes otro comercio registrado con este nombre o email"
        });
      }
    }

    // Manejar categorías
    let businessCategories = business.categories || [];
    if (categories && Array.isArray(categories) && categories.length > 0) {
      businessCategories = categories;
    } else if (category) {
      businessCategories = [category];
    }
    
    // Validar que haya al menos una categoría
    if (businessCategories.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: "Debe seleccionar al menos una categoría" 
      });
    }

    // Validar que las categorías sean válidas
    const validCategories = [
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
    ];

    const invalidCategories = businessCategories.filter(cat => !validCategories.includes(cat));
    if (invalidCategories.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: `Categorías inválidas: ${invalidCategories.join(', ')}` 
      });
    }

    // Manejar workingHours
    let formattedWorkingHours = { ...business.workingHours };
    
    if (workingHours) {
      // Validar días válidos
      const validDays = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
      
      if (workingHours.days !== undefined) {
        const daysArray = Array.isArray(workingHours.days) 
          ? workingHours.days 
          : (typeof workingHours.days === 'string' 
              ? workingHours.days.split(',').map(d => d.trim().toLowerCase()) 
              : []);
        
        const invalidDays = daysArray.filter(day => !validDays.includes(day));
        if (invalidDays.length > 0) {
          return res.status(400).json({ 
            success: false,
            message: `Días inválidos: ${invalidDays.join(', ')}. Días válidos: ${validDays.join(', ')}` 
          });
        }
        
        formattedWorkingHours.days = daysArray;
      }

      // Validar formato de horas
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      
      if (workingHours.open !== undefined) {
        if (workingHours.open && !timeRegex.test(workingHours.open)) {
          return res.status(400).json({ 
            success: false,
            message: "Formato de hora de apertura inválido (use HH:MM)" 
          });
        }
        formattedWorkingHours.open = workingHours.open || '';
      }
      
      if (workingHours.close !== undefined) {
        if (workingHours.close && !timeRegex.test(workingHours.close)) {
          return res.status(400).json({ 
            success: false,
            message: "Formato de hora de cierre inválido (use HH:MM)" 
          });
        }
        formattedWorkingHours.close = workingHours.close || '';
      }

      // Validar que si hay open, también haya close
      if ((workingHours.open && !workingHours.close) || (!workingHours.open && workingHours.close)) {
        return res.status(400).json({ 
          success: false,
          message: "Los horarios de apertura y cierre deben ir juntos" 
        });
      }

      // Validar que close sea después de open
      if (workingHours.open && workingHours.close) {
        const [openHour, openMin] = workingHours.open.split(':').map(Number);
        const [closeHour, closeMin] = workingHours.close.split(':').map(Number);
        
        const openTotal = openHour * 60 + openMin;
        const closeTotal = closeHour * 60 + closeMin;
        
        if (closeTotal <= openTotal) {
          return res.status(400).json({ 
            success: false,
            message: "La hora de cierre debe ser posterior a la hora de apertura" 
          });
        }
        
        formattedWorkingHours.regular = `${workingHours.open} - ${workingHours.close}`;
      }

      // Validar specialDay
      const validSpecialDays = ['', 'festivos', 'domingos', 'sabados', 'vacaciones'];
      if (workingHours.specialDay !== undefined && !validSpecialDays.includes(workingHours.specialDay)) {
        return res.status(400).json({ 
          success: false,
          message: `Día especial inválido. Válidos: ${validSpecialDays.filter(d => d).join(', ')}` 
        });
      }
      if (workingHours.specialDay !== undefined) {
        formattedWorkingHours.specialDay = workingHours.specialDay || '';
      }
    }

    // Actualizar campos
    const updateData = {
      name: name ? name.trim() : business.name,
      category: businessCategories[0],
      categories: businessCategories,
      description: description ? description.trim() : business.description,
      address: address ? address.trim() : business.address,
      phone: phone ? phone.trim() : business.phone,
      email: email ? email.toLowerCase().trim() : business.email,
      image: imageData,
      status: status || business.status,
      workingHours: formattedWorkingHours,
      // Solo admin puede cambiar approved
      approved: req.user.role === "admin" 
        ? (req.body.approved !== undefined ? req.body.approved : business.approved)
        : business.approved,
    };

    // Si admin aprueba, también activar
    if (req.user.role === "admin" && req.body.approved === true) {
      updateData.status = 'active';
      updateData.approvedBy = req.user.id;
      updateData.approvalDate = new Date();
    }

    // Actualizar servicios si se proporcionan
    if (services !== undefined) {
      if (!Array.isArray(services)) {
        return res.status(400).json({ 
          success: false,
          message: "Los servicios deben ser un array" 
        });
      }
      
      let validatedServices = [];
      for (const service of services) {
        if (!service.name || service.price === undefined) {
          return res.status(400).json({ 
            success: false,
            message: "Cada servicio debe tener nombre y precio" 
          });
        }
        
        if (typeof service.price !== 'number' || service.price < 0) {
          return res.status(400).json({ 
            success: false,
            message: "El precio del servicio debe ser un número positivo" 
          });
        }
        
        validatedServices.push({
          name: service.name.trim(),
          price: service.price,
          description: service.description ? service.description.trim() : '',
          duration: service.duration || 60,
          isActive: service.isActive !== undefined ? service.isActive : true
        });
      }
      
      updateData.services = validatedServices;
    }

    Object.assign(business, updateData);
    await business.save();
    
    res.json({ 
      success: true,
      message: "Comercio actualizado correctamente", 
      business 
    });
  } catch (error) {
    console.error("Error al actualizar comercio:", error);
    
    // Manejar errores de validación de Mongoose
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Error de validación",
        errors: messages
      });
    }
    
    // Manejar error de duplicado
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Ya existe un comercio con este nombre o email"
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: "Error al actualizar comercio", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 🗑️ Eliminar comercio
export const deleteBusiness = async (req, res) => {
  try {
    const { id } = req.params;
    const business = await Business.findById(id);

    if (!business) {
      return res.status(404).json({ 
        success: false,
        message: "Comercio no encontrado" 
      });
    }

    // Verificar permisos
    if (business.provider.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ 
        success: false,
        message: "No tienes permiso para eliminar este comercio" 
      });
    }

    await business.deleteOne();
    
    res.json({ 
      success: true,
      message: "Comercio eliminado correctamente" 
    });
  } catch (error) {
    console.error("Error al eliminar comercio:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al eliminar comercio", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 🔄 Cambiar estado de un comercio
export const changeBusinessStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const business = await Business.findById(id);
    
    if (!business) {
      return res.status(404).json({ 
        success: false,
        message: "Comercio no encontrado" 
      });
    }

    // Verificar permisos
    if (business.provider.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ 
        success: false,
        message: "No tienes permiso para cambiar el estado de este comercio" 
      });
    }

    // Validar estado
    const validStatuses = ['active', 'pending', 'inactive'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false,
        message: `Estado inválido. Estados válidos: ${validStatuses.join(', ')}` 
      });
    }

    business.status = status;
    
    // Si el estado es 'inactive', también desaprobar
    if (status === 'inactive') {
      business.approved = false;
    } else if (status === 'active' && req.user.role === 'admin') {
      // Si admin activa, aprobar automáticamente
      business.approved = true;
      business.approvedBy = req.user.id;
      business.approvalDate = new Date();
    }
    
    await business.save();

    res.json({ 
      success: true,
      message: `Estado del comercio actualizado a ${status}`, 
      business 
    });
  } catch (error) {
    console.error("Error al cambiar estado del comercio:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al cambiar estado del comercio", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 🔍 Búsqueda avanzada de comercios
export const searchBusinesses = async (req, res) => {
  try {
    const { 
      category,
      status,
      city,
      minServices,
      isFeatured,
      providerId,
      dateFrom,
      dateTo
    } = req.query;
    
    let filter = { approved: true, status: 'active', isDeleted: { $ne: true } };
    
    // Filtros básicos
    if (category) {
      filter.$or = [
        { category: category },
        { categories: category }
      ];
    }
    
    if (status) filter.status = status;
    if (isFeatured !== undefined) filter.featured = isFeatured === 'true';
    if (providerId) {
      try {
        filter.provider = new mongoose.Types.ObjectId(providerId);
      } catch (error) {
        return res.status(400).json({ 
          success: false,
          message: "ID de proveedor inválido" 
        });
      }
    }
    
    // Filtro por ciudad
    if (city) {
      filter.address = { $regex: city, $options: 'i' };
    }
    
    // Filtro por cantidad mínima de servicios
    if (minServices) {
      filter.services = { $exists: true, $not: { $size: 0 } };
    }
    
    // Filtro por fecha de creación
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) {
        const date = new Date(dateFrom);
        if (isNaN(date.getTime())) {
          return res.status(400).json({ 
            success: false,
            message: "Formato de fecha desde inválido" 
          });
        }
        filter.createdAt.$gte = date;
      }
      if (dateTo) {
        const date = new Date(dateTo);
        if (isNaN(date.getTime())) {
          return res.status(400).json({ 
            success: false,
            message: "Formato de fecha hasta inválido" 
          });
        }
        filter.createdAt.$lte = date;
      }
    }
    
    const businesses = await Business.find(filter)
      .populate("provider", "name lastname email avatar")
      .sort({ createdAt: -1 });
    
    const businessesWithImages = businesses.map(business => {
      const businessObj = business.toObject();
      
      // Asegurar que haya una imagen
      if (!businessObj.image || businessObj.image.trim() === '') {
        businessObj.image = getDefaultBusinessImage(businessObj.category);
      }
      
      return businessObj;
    });
    
    res.json({
      success: true,
      businesses: businessesWithImages
    });
  } catch (error) {
    console.error("Error en búsqueda avanzada:", error);
    res.status(500).json({ 
      success: false,
      message: "Error en búsqueda avanzada", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ===================== LISTA DE EXPORTACIONES =====================
export {
  // Funciones auxiliares (si las necesitas exportar)
  isOpenNow,
  formatWorkingHours,
  generateAvailableHours,
  getDefaultBusinessImage
};