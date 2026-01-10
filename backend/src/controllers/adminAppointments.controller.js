// controllers/adminAppointmentsController.js
import Appointment from "../models/Appointment.js";
import User from "../models/User.js";
import Pet from "../models/Pet.js";
import Service from "../models/Service.js";
import Business from "../models/Business.js";
import mongoose from "mongoose";
import { 
  notifyAppointmentCreated, 
  notifyAppointmentCancelled,
  notifyAppointmentRescheduled,
  createNotification 
} from "./notificationsController.js";

// ======================================================
// 📌 OBTENER TODAS LAS CITAS (ADMIN)
// ======================================================
export const getAllAppointmentsAdmin = async (req, res) => {
  console.log('🔔 Petición GET /admin/appointments recibida');
  
  try {
    // Verificar que el usuario sea admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Acceso denegado. Solo administradores pueden ver todas las citas"
      });
    }

    // Obtener todas las citas sin filtrar por proveedor
    const appointments = await Appointment.find({})
      .populate('userId', 'name lastname email phone')
      .populate('petId', 'name type breed age')
      .populate('serviceId', 'name description price duration')
      .populate('providerId', 'name email phone serviceType')
      .populate('businessId', 'name address phone category')
      .sort({ date: -1, time: -1 })
      .lean();

    console.log(`✅ ${appointments.length} citas encontradas para admin`);

    res.json({
      success: true,
      count: appointments.length,
      appointments
    });

  } catch (err) {
    console.error("❌ Error obteniendo citas para admin:", err);
    res.status(500).json({
      success: false,
      message: "Error del servidor al obtener citas"
    });
  }
};

// ======================================================
// 📌 CREAR CITA COMO ADMINISTRADOR (CON NOTIFICACIONES)
// ======================================================
export const createAppointmentAsAdmin = async (req, res) => {
  console.log('🔔 Petición POST /admin/appointments recibida');
  console.log('📦 Body:', JSON.stringify(req.body, null, 2));
  
  try {
    // Verificar que el usuario sea admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Acceso denegado. Solo administradores pueden crear citas manualmente"
      });
    }

    const {
      clientId,
      petId,
      providerId,
      businessId,
      serviceId,
      date,
      time,
      notes,
      serviceName,
      servicePrice
    } = req.body;

    // Validar campos obligatorios
    const requiredFields = ['clientId', 'petId', 'date', 'time'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Campos obligatorios faltantes: ${missingFields.join(', ')}`
      });
    }

    // 1. Verificar que el cliente existe
    const client = await User.findById(clientId);
    if (!client || client.role !== 'client') {
      return res.status(404).json({
        success: false,
        message: "Cliente no encontrado o no es un cliente válido"
      });
    }

    // 2. Verificar que la mascota existe y pertenece al cliente
    const pet = await Pet.findOne({ _id: petId, owner: clientId });
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: "Mascota no encontrada o no pertenece al cliente"
      });
    }

    // Variables para almacenar datos del servicio
    let service = null;
    let provider = null;
    let business = null;
    let serviceData = {};

    // 3. Manejar servicio (puede ser ID de modelo Service o datos embebidos)
    if (serviceId) {
      // Buscar servicio en el modelo Service
      service = await Service.findById(serviceId)
        .populate('providerId', 'name email')
        .populate('businessId', 'name address phone');

      if (!service) {
        return res.status(404).json({
          success: false,
          message: "Servicio no encontrado"
        });
      }

      serviceData = {
        serviceId: service._id,
        serviceName: service.name,
        servicePrice: service.price,
        serviceDuration: service.duration || 60
      };

      // Usar proveedor y negocio del servicio si no se especificaron
      if (service.providerId && !providerId) {
        providerId = service.providerId._id;
        provider = service.providerId;
      }
      if (service.businessId && !businessId) {
        businessId = service.businessId._id;
        business = service.businessId;
      }
    } else if (serviceName) {
      // Es un servicio embebido (de Business.services)
      serviceData = {
        serviceId: null,
        serviceName: serviceName,
        servicePrice: servicePrice || 0,
        serviceDuration: 60
      };
    } else {
      return res.status(400).json({
        success: false,
        message: "Debe especificar un servicio (ID o nombre)"
      });
    }

    // 4. Verificar proveedor (si se proporciona)
    if (providerId) {
      provider = await User.findById(providerId);
      if (!provider || provider.role !== 'provider') {
        return res.status(404).json({
          success: false,
          message: "Proveedor no encontrado o no es un proveedor válido"
        });
      }
    }

    // 5. Verificar negocio (si se proporciona)
    if (businessId) {
      business = await Business.findById(businessId);
      if (!business) {
        return res.status(404).json({
          success: false,
          message: "Negocio no encontrado"
        });
      }
      
      if (providerId && business.provider && business.provider.toString() !== providerId) {
        return res.status(400).json({
          success: false,
          message: "El negocio seleccionado no pertenece al proveedor"
        });
      }
    }

    // 6. Verificar que no haya conflicto de horario para el cliente
    const existingAppointment = await Appointment.findOne({
      userId: clientId,
      date,
      time,
      status: { $nin: ['cancelada', 'completada'] }
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: "El cliente ya tiene una cita en ese horario"
      });
    }

    // 7. Preparar datos para la cita
    const appointmentData = {
      userId: clientId,
      petId,
      serviceId: serviceData.serviceId,
      providerId: providerId || null,
      businessId: businessId || null,
      date,
      time,
      notes: notes || '',
      serviceName: serviceData.serviceName,
      servicePrice: serviceData.servicePrice,
      serviceDuration: serviceData.serviceDuration,
      businessName: business?.name || '',
      businessAddress: business?.address || '',
      businessPhone: business?.phone || '',
      status: "pendiente",
      createdAt: new Date(),
      createdBy: req.user._id,
      createdByRole: 'admin',
      isEmbeddedService: !serviceId && serviceName ? true : false
    };

    // 8. Crear la cita
    const appointment = await Appointment.create(appointmentData);

    console.log('✅ Cita creada exitosamente por admin. ID:', appointment._id);
    
    // 9. 🔔 CREAR NOTIFICACIÓN PARA EL PROVEEDOR
    if (appointment.providerId) {
      console.log(`📨 Creando notificación (admin) para proveedor: ${appointment.providerId}`);
      
      try {
        await notifyAppointmentCreated(appointment);
        console.log('✅ Notificación creada exitosamente para proveedor');
        
        // También notificar al admin sobre la creación
        await createNotification({
          providerId: req.user._id, // Notificar al admin también
          type: "system",
          title: "📋 Cita creada por administrador",
          message: `Has creado una cita para ${client.name} el ${date} a las ${time}`,
          appointmentId: appointment._id,
          userId: clientId,
          metadata: {
            appointmentDate: date,
            appointmentTime: time,
            serviceName: serviceData.serviceName,
            clientName: client.name,
            petName: pet.name,
            createdBy: req.user.name || 'Administrador'
          }
        });
        
      } catch (notificationError) {
        console.error('❌ Error creando notificación:', notificationError);
        // No fallar la operación principal por error en notificación
      }
    } else {
      console.log('ℹ️ No hay proveedor asignado, omitiendo notificación');
    }

    // 10. Construir respuesta poblada
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('userId', 'name lastname email phone')
      .populate('petId', 'name type breed age')
      .populate('serviceId', 'name description price duration')
      .populate('providerId', 'name email phone serviceType')
      .populate('businessId', 'name address phone category');

    res.status(201).json({
      success: true,
      message: "✅ Cita creada exitosamente",
      appointment: populatedAppointment,
      notificationSent: !!appointment.providerId
    });

  } catch (err) {
    console.error("❌ Error creando cita como admin:", err);
    
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: "Error de validación",
        errors: errors
      });
    }
    
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "ID inválido proporcionado",
        field: err.path
      });
    }
    
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Ya existe una cita con estos datos"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Error interno del servidor al crear la cita",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// ======================================================
// 📌 OBTENER DATOS PARA FORMULARIO DE ADMIN
// ======================================================
export const getAppointmentFormData = async (req, res) => {
  console.log('🔔 Petición GET /admin/appointments/form-data recibida');
  
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Acceso denegado. Solo administradores"
      });
    }

    const [clients, providers, businesses, services] = await Promise.all([
      User.find({ role: 'client' })
        .select('_id name lastname email phone')
        .sort({ name: 1 })
        .lean(),
      
      User.find({ role: 'provider' })
        .select('_id name email phone serviceType')
        .sort({ name: 1 })
        .lean(),
      
      Business.find({ 
        approved: true, 
        status: 'active',
        isDeleted: { $ne: true }
      })
      .populate({
        path: 'provider',
        select: '_id name email phone serviceType',
        model: 'User'
      })
      .select('_id name address phone category provider services')
      .sort({ name: 1 })
      .lean()
      .then(businesses => {
        return businesses.map(business => {
          const businessObj = { ...business };
          
          if (business.provider) {
            if (typeof business.provider === 'object' && business.provider._id) {
              businessObj.providerId = business.provider._id.toString();
              businessObj.providerName = business.provider.name;
            } else if (typeof business.provider === 'string') {
              businessObj.providerId = business.provider;
              businessObj.providerName = 'Proveedor';
            }
          }
          
          if (business.services && Array.isArray(business.services)) {
            businessObj.embeddedServices = business.services.map(service => ({
              _id: service._id || `embedded_${business._id}_${service.name}`,
              name: service.name,
              description: service.description || '',
              price: service.price || 0,
              duration: service.duration || 60,
              isActive: service.isActive !== false,
              businessId: business._id,
              businessName: business.name,
              isEmbedded: true
            }));
          } else {
            businessObj.embeddedServices = [];
          }
          
          return businessObj;
        });
      }),
      
      Service.find({ isActive: true })
        .populate('providerId', '_id name email')
        .populate('businessId', '_id name address phone')
        .select('_id name description price duration providerId businessId')
        .sort({ name: 1 })
        .lean()
        .then(services => {
          return services.map(service => {
            const serviceObj = { ...service };
            
            if (service.providerId && typeof service.providerId === 'object') {
              serviceObj.providerId = service.providerId._id.toString();
            }
            
            if (service.businessId && typeof service.businessId === 'object') {
              serviceObj.businessId = service.businessId._id.toString();
            }
            
            serviceObj.isEmbedded = false;
            
            return serviceObj;
          });
        })
    ]);

    const totalEmbeddedServices = businesses.reduce((total, business) => 
      total + (business.embeddedServices?.length || 0), 0
    );

    console.log(`✅ Datos obtenidos: ${clients.length} clientes, ${providers.length} proveedores, ${businesses.length} negocios, ${services.length} servicios standalone`);
    console.log(`✅ Servicios embebidos totales: ${totalEmbeddedServices}`);

    res.json({
      success: true,
      formData: {
        clients,
        providers,
        businesses,
        services,
        totalServices: services.length + totalEmbeddedServices
      }
    });

  } catch (err) {
    console.error("❌ Error obteniendo datos para formulario:", err);
    res.status(500).json({
      success: false,
      message: "Error del servidor al obtener datos del formulario",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// ======================================================
// 📌 OBTENER MASCOTAS DE UN CLIENTE
// ======================================================
export const getClientPets = async (req, res) => {
  console.log('🔔 Petición GET /admin/clients/:clientId/pets recibida');
  console.log('👤 Cliente ID:', req.params.clientId);
  
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Acceso denegado"
      });
    }

    const { clientId } = req.params;

    const client = await User.findById(clientId);
    if (!client || client.role !== 'client') {
      return res.status(404).json({
        success: false,
        message: "Cliente no encontrado"
      });
    }

    const pets = await Pet.find({ owner: clientId })
      .select('_id name type breed age owner')
      .sort({ name: 1 })
      .lean();

    console.log(`✅ ${pets.length} mascotas encontradas para cliente ${clientId}`);

    res.json({
      success: true,
      pets
    });

  } catch (err) {
    console.error("❌ Error obteniendo mascotas del cliente:", err);
    
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "ID de cliente inválido"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Error del servidor al obtener mascotas",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// ======================================================
// 📌 OBTENER NEGOCIOS DE UN PROVEEDOR
// ======================================================
export const getProviderBusinesses = async (req, res) => {
  console.log('🔔 Petición GET /admin/providers/:providerId/businesses recibida');
  console.log('👨‍⚕️ Proveedor ID:', req.params.providerId);
  
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Acceso denegado"
      });
    }

    const { providerId } = req.params;

    const provider = await User.findById(providerId);
    if (!provider || provider.role !== 'provider') {
      return res.status(404).json({
        success: false,
        message: "Proveedor no encontrado"
      });
    }

    const businesses = await Business.find({ 
      provider: providerId,
      approved: true,
      status: 'active',
      isDeleted: { $ne: true }
    })
      .select('_id name category address phone image description services')
      .sort({ name: 1 })
      .lean();

    const businessesWithEmbeddedServices = businesses.map(business => {
      const businessObj = { ...business };
      
      if (business.services && Array.isArray(business.services)) {
        businessObj.embeddedServices = business.services.map(service => ({
          _id: service._id || `embedded_${business._id}_${service.name}`,
          name: service.name,
          description: service.description || '',
          price: service.price || 0,
          duration: service.duration || 60,
          isActive: service.isActive !== false,
          businessId: business._id,
          businessName: business.name,
          isEmbedded: true
        }));
      } else {
        businessObj.embeddedServices = [];
      }
      
      return businessObj;
    });

    const totalEmbeddedServices = businessesWithEmbeddedServices.reduce(
      (total, business) => total + (business.embeddedServices?.length || 0), 0
    );

    console.log(`✅ ${businesses.length} negocios encontrados para proveedor ${providerId} con ${totalEmbeddedServices} servicios embebidos`);

    res.json({
      success: true,
      businesses: businessesWithEmbeddedServices,
      totalEmbeddedServices
    });

  } catch (err) {
    console.error("❌ Error obteniendo negocios del proveedor:", err);
    
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "ID de proveedor inválido"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Error del servidor al obtener negocios",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// ======================================================
// 📌 OBTENER SERVICIOS DE UN NEGOCIO
// ======================================================
export const getBusinessServices = async (req, res) => {
  console.log('🔔 Petición GET /admin/businesses/:businessId/services recibida');
  console.log('🏬 Negocio ID:', req.params.businessId);
  
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Acceso denegado"
      });
    }

    const { businessId } = req.params;

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Negocio no encontrado"
      });
    }

    const standaloneServices = await Service.find({ 
      businessId: businessId,
      isActive: true 
    })
      .populate('providerId', '_id name email')
      .select('_id name description price duration providerId businessId')
      .sort({ name: 1 })
      .lean()
      .then(services => {
        return services.map(service => {
          const serviceObj = { ...service };
          
          if (service.providerId && typeof service.providerId === 'object') {
            serviceObj.providerId = service.providerId._id.toString();
          }
          
          serviceObj.businessId = businessId;
          serviceObj.isEmbedded = false;
          
          return serviceObj;
        });
      });

    let embeddedServices = [];
    if (business.services && Array.isArray(business.services)) {
      embeddedServices = business.services.map(service => ({
        _id: service._id || `embedded_${businessId}_${service.name}`,
        name: service.name,
        description: service.description || '',
        price: service.price || 0,
        duration: service.duration || 60,
        isActive: service.isActive !== false,
        businessId: businessId,
        businessName: business.name,
        isEmbedded: true
      }));
    }

    const allServices = [...embeddedServices, ...standaloneServices];

    console.log(`✅ ${allServices.length} servicios encontrados para negocio ${businessId} (${embeddedServices.length} embebidos, ${standaloneServices.length} standalone)`);

    res.json({
      success: true,
      services: allServices,
      business: {
        _id: business._id,
        name: business.name
      },
      counts: {
        total: allServices.length,
        embedded: embeddedServices.length,
        standalone: standaloneServices.length
      }
    });

  } catch (err) {
    console.error("❌ Error obteniendo servicios del negocio:", err);
    
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "ID de negocio inválido"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Error del servidor al obtener servicios",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// ======================================================
// 📌 OBTENER SERVICIOS DE UN PROVEEDOR
// ======================================================
export const getProviderServices = async (req, res) => {
  console.log('🔔 Petición GET /admin/providers/:providerId/services recibida');
  console.log('👨‍⚕️ Proveedor ID:', req.params.providerId);
  
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Acceso denegado"
      });
    }

    const { providerId } = req.params;

    const provider = await User.findById(providerId);
    if (!provider || provider.role !== 'provider') {
      return res.status(404).json({
        success: false,
        message: "Proveedor no encontrado"
      });
    }

    const standaloneServices = await Service.find({ 
      providerId: providerId,
      isActive: true 
    })
      .populate('businessId', '_id name address')
      .select('_id name description price duration businessId providerId')
      .sort({ name: 1 })
      .lean()
      .then(services => {
        return services.map(service => {
          const serviceObj = { ...service };
          
          if (service.businessId && typeof service.businessId === 'object') {
            serviceObj.businessId = service.businessId._id.toString();
          }
          
          serviceObj.providerId = providerId;
          serviceObj.isEmbedded = false;
          
          return serviceObj;
        });
      });

    const providerBusinesses = await Business.find({ 
      provider: providerId,
      approved: true,
      status: 'active'
    })
    .select('_id name services')
    .lean();

    let embeddedServices = [];
    providerBusinesses.forEach(business => {
      if (business.services && Array.isArray(business.services)) {
        const businessEmbeddedServices = business.services.map(service => ({
          _id: service._id || `embedded_${business._id}_${service.name}`,
          name: service.name,
          description: service.description || '',
          price: service.price || 0,
          duration: service.duration || 60,
          isActive: service.isActive !== false,
          businessId: business._id,
          businessName: business.name,
          providerId: providerId,
          isEmbedded: true
        }));
        embeddedServices = [...embeddedServices, ...businessEmbeddedServices];
      }
    });

    const allServices = [...embeddedServices, ...standaloneServices];

    console.log(`✅ ${allServices.length} servicios encontrados para proveedor ${providerId} (${embeddedServices.length} embebidos, ${standaloneServices.length} standalone)`);

    res.json({
      success: true,
      services: allServices,
      counts: {
        total: allServices.length,
        embedded: embeddedServices.length,
        standalone: standaloneServices.length
      }
    });

  } catch (err) {
    console.error("❌ Error obteniendo servicios del proveedor:", err);
    
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "ID de proveedor inválido"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Error del servidor al obtener servicios",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// ======================================================
// 📌 OBTENER TODOS LOS DATOS EN UNA SOLA PETICIÓN
// ======================================================
export const getCompleteFormData = async (req, res) => {
  console.log('🔔 Petición GET /admin/appointments/complete-form-data recibida');
  
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Acceso denegado. Solo administradores"
      });
    }

    const [clients, providers, businesses, standaloneServices] = await Promise.all([
      User.find({ role: 'client' })
        .select('_id name lastname email phone')
        .sort({ name: 1 })
        .lean(),
      
      User.find({ role: 'provider' })
        .select('_id name email phone serviceType')
        .sort({ name: 1 })
        .lean(),
      
      Business.find({ 
        approved: true, 
        status: 'active',
        isDeleted: { $ne: true }
      })
      .populate({
        path: 'provider',
        select: '_id name email',
        model: 'User'
      })
      .select('_id name category address phone description provider services')
      .sort({ name: 1 })
      .lean()
      .then(businesses => {
        return businesses.map(business => {
          const businessObj = { ...business };
          
          if (business.provider) {
            if (typeof business.provider === 'object' && business.provider._id) {
              businessObj.providerId = business.provider._id.toString();
              businessObj.providerName = business.provider.name;
            } else if (typeof business.provider === 'string') {
              businessObj.providerId = business.provider;
              businessObj.providerName = 'Proveedor';
            }
          }
          
          if (business.services && Array.isArray(business.services)) {
            businessObj.embeddedServices = business.services.map(service => ({
              _id: service._id || `embedded_${business._id}_${service.name}`,
              name: service.name,
              description: service.description || '',
              price: service.price || 0,
              duration: service.duration || 60,
              isActive: service.isActive !== false,
              businessId: business._id,
              businessName: business.name,
              providerId: businessObj.providerId,
              providerName: businessObj.providerName,
              isEmbedded: true
            }));
          } else {
            businessObj.embeddedServices = [];
          }
          
          return businessObj;
        });
      }),
      
      Service.find({ isActive: true })
        .populate('providerId', '_id name')
        .populate('businessId', '_id name address')
        .select('_id name description price duration providerId businessId')
        .sort({ name: 1 })
        .lean()
        .then(services => {
          return services.map(service => {
            const serviceObj = { ...service };
            
            if (service.providerId && typeof service.providerId === 'object') {
              serviceObj.providerId = service.providerId._id.toString();
            }
            
            if (service.businessId && typeof service.businessId === 'object') {
              serviceObj.businessId = service.businessId._id.toString();
            }
            
            serviceObj.isEmbedded = false;
            
            return serviceObj;
          });
        })
    ]);

    let allEmbeddedServices = [];
    businesses.forEach(business => {
      if (business.embeddedServices && business.embeddedServices.length > 0) {
        allEmbeddedServices = [...allEmbeddedServices, ...business.embeddedServices];
      }
    });

    const allServices = [...allEmbeddedServices, ...standaloneServices];

    const businessesByProvider = {};
    businesses.forEach(business => {
      if (business.providerId) {
        if (!businessesByProvider[business.providerId]) {
          businessesByProvider[business.providerId] = [];
        }
        businessesByProvider[business.providerId].push({
          _id: business._id,
          name: business.name,
          category: business.category,
          address: business.address,
          phone: business.phone,
          provider: business.provider,
          embeddedServicesCount: business.embeddedServices?.length || 0
        });
      }
    });

    const servicesByBusiness = {};
    allServices.forEach(service => {
      if (service.businessId) {
        const businessId = service.businessId.toString();
        if (!servicesByBusiness[businessId]) {
          servicesByBusiness[businessId] = [];
        }
        servicesByBusiness[businessId].push({
          _id: service._id,
          name: service.name,
          description: service.description,
          price: service.price,
          duration: service.duration,
          providerId: service.providerId || null,
          isEmbedded: service.isEmbedded || false,
          businessName: service.businessName || ''
        });
      }
    });

    const servicesByProvider = {};
    allServices.forEach(service => {
      if (service.providerId) {
        const providerId = service.providerId.toString();
        if (!servicesByProvider[providerId]) {
          servicesByProvider[providerId] = [];
        }
        servicesByProvider[providerId].push({
          _id: service._id,
          name: service.name,
          description: service.description,
          price: service.price,
          duration: service.duration,
          businessId: service.businessId || null,
          businessName: service.businessName || '',
          isEmbedded: service.isEmbedded || false
        });
      }
    });

    console.log(`✅ Datos completos obtenidos: ${clients.length} clientes, ${providers.length} proveedores, ${businesses.length} negocios, ${allServices.length} servicios totales`);

    res.json({
      success: true,
      formData: {
        clients,
        providers,
        businesses: {
          all: businesses,
          byProvider: businessesByProvider
        },
        services: {
          all: allServices,
          byBusiness: servicesByBusiness,
          byProvider: servicesByProvider,
          embeddedServices: allEmbeddedServices,
          standaloneServices: standaloneServices,
          counts: {
            total: allServices.length,
            embedded: allEmbeddedServices.length,
            standalone: standaloneServices.length
          }
        }
      }
    });

  } catch (err) {
    console.error("❌ Error obteniendo datos completos para formulario:", err);
    res.status(500).json({
      success: false,
      message: "Error del servidor al obtener datos del formulario",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// ======================================================
// 📌 ACTUALIZAR ESTADO DE CITA (ADMIN CON NOTIFICACIONES)
// ======================================================
export const updateAppointmentStatusAdmin = async (req, res) => {
  console.log('🔔 Petición PUT /admin/appointments/:id/status recibida');
  console.log('📌 Cita ID:', req.params.id);
  console.log('📦 Estado:', req.body.status);
  console.log('📝 Razón:', req.body.reason || 'Sin razón especificada');
  
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Acceso denegado"
      });
    }

    const { id } = req.params;
    const { status, reason } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "El estado es requerido"
      });
    }

    const validStatuses = ['pendiente', 'confirmada', 'cancelada', 'completada', 'reprogramada'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Estado inválido. Debe ser uno de: ${validStatuses.join(', ')}`
      });
    }

    const appointment = await Appointment.findById(id)
      .populate('userId', 'name email')
      .populate('providerId', 'name email');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Cita no encontrada"
      });
    }

    const validTransitions = {
      'pendiente': ['confirmada', 'cancelada'],
      'confirmada': ['completada', 'cancelada', 'reprogramada'],
      'reprogramada': ['confirmada', 'cancelada', 'completada'],
      'completada': [],
      'cancelada': []
    };

    const currentStatus = appointment.status;
    if (validTransitions[currentStatus] && !validTransitions[currentStatus].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `No se puede cambiar de ${currentStatus} a ${status}`
      });
    }

    const previousStatus = appointment.status;
    
    appointment.status = status;
    appointment.updatedAt = new Date();
    appointment.updatedBy = req.user._id;
    appointment.updatedByRole = 'admin';
    
    if (status === 'cancelada') {
      appointment.cancelledAt = new Date();
      appointment.cancelledBy = req.user._id;
      appointment.cancellationReason = reason || '';
    } else if (status === 'completada') {
      appointment.completedAt = new Date();
      appointment.completedBy = req.user._id;
    } else if (status === 'reprogramada') {
      appointment.rescheduledAt = new Date();
      appointment.rescheduledBy = req.user._id;
    }
    
    if (!appointment.statusHistory) {
      appointment.statusHistory = [];
    }
    
    appointment.statusHistory.push({
      from: previousStatus,
      to: status,
      changedAt: new Date(),
      changedBy: req.user._id,
      changedByRole: 'admin',
      reason: reason || ''
    });
    
    await appointment.save();

    console.log('✅ Estado de cita actualizado por admin:', appointment._id, `${previousStatus} → ${status}`);
    
    // 🔔 NOTIFICAR AL PROVEEDOR SOBRE EL CAMBIO DE ESTADO
    if (appointment.providerId) {
      console.log(`📨 Notificando cambio de estado a proveedor: ${appointment.providerId}`);
      
      try {
        const message = `El administrador ha cambiado el estado de la cita del ${appointment.date} a las ${appointment.time} de ${previousStatus} a ${status}`;
        
        if (status === 'cancelada') {
          await notifyAppointmentCancelled(appointment, req.user._id, reason || 'Cancelada por administrador');
        } else {
          await createNotification({
            providerId: appointment.providerId,
            type: "appointment_updated",
            title: `📊 Estado actualizado por administrador`,
            message: message,
            appointmentId: appointment._id,
            userId: req.user._id,
            metadata: {
              appointmentDate: appointment.date,
              appointmentTime: appointment.time,
              serviceName: appointment.serviceName,
              previousStatus,
              newStatus: status,
              changedBy: req.user.name || 'Administrador',
              changedByRole: 'admin',
              reason: reason || '',
              changedAt: new Date()
            }
          });
        }
        
        console.log('✅ Notificación de cambio de estado enviada al proveedor');
      } catch (notificationError) {
        console.error('❌ Error creando notificación:', notificationError);
      }
    }

    // 🔔 NOTIFICAR AL CLIENTE (opcional, podrías implementar notificaciones para clientes también)
    if (appointment.userId) {
      console.log(`📨 Notificando cambio de estado a cliente: ${appointment.userId._id}`);
      // Aquí podrías agregar notificaciones para clientes si tienes un sistema
    }
    
    res.json({
      success: true,
      message: `✅ Cita ${status} correctamente`,
      appointment: {
        _id: appointment._id,
        status: appointment.status,
        previousStatus,
        updatedAt: appointment.updatedAt,
        statusHistory: appointment.statusHistory
      }
    });

  } catch (err) {
    console.error("❌ Error actualizando estado de cita:", err);
    
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "ID de cita inválido"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Error del servidor al actualizar estado",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// ======================================================
// 📌 ELIMINAR CITA (ADMIN CON NOTIFICACIONES)
// ======================================================
export const deleteAppointmentAdmin = async (req, res) => {
  console.log('🔔 Petición DELETE /admin/appointments/:id recibida');
  console.log('📌 Cita ID a eliminar:', req.params.id);
  console.log('📝 Razón:', req.body.reason || 'Sin razón especificada');
  
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Acceso denegado"
      });
    }

    const { id } = req.params;
    const { reason } = req.body;

    const appointment = await Appointment.findById(id)
      .populate('userId', 'name email')
      .populate('providerId', 'name email');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Cita no encontrada"
      });
    }

    // 🔔 NOTIFICAR AL PROVEEDOR SOBRE LA ELIMINACIÓN
    if (appointment.providerId) {
      console.log(`📨 Notificando eliminación a proveedor: ${appointment.providerId}`);
      
      try {
        await createNotification({
          providerId: appointment.providerId,
          type: "appointment_cancelled",
          title: "❌ Cita eliminada por administrador",
          message: `El administrador ha eliminado la cita programada para el ${appointment.date} a las ${appointment.time}. ${reason ? `Razón: ${reason}` : ''}`,
          appointmentId: appointment._id,
          userId: req.user._id,
          metadata: {
            appointmentDate: appointment.date,
            appointmentTime: appointment.time,
            serviceName: appointment.serviceName,
            clientName: appointment.userId?.name || 'Cliente',
            deletedBy: req.user.name || 'Administrador',
            deletedAt: new Date(),
            reason: reason || ''
          }
        });
        
        console.log('✅ Notificación de eliminación enviada al proveedor');
      } catch (notificationError) {
        console.error('❌ Error creando notificación de eliminación:', notificationError);
      }
    }

    // Eliminar la cita
    await Appointment.findByIdAndDelete(id);

    console.log('✅ Cita eliminada por admin:', id);
    
    res.json({
      success: true,
      message: "✅ Cita eliminada correctamente",
      deletedAppointment: {
        _id: appointment._id,
        clientId: appointment.userId,
        clientName: appointment.userId?.name,
        date: appointment.date,
        time: appointment.time,
        status: appointment.status,
        providerId: appointment.providerId,
        providerName: appointment.providerId?.name
      }
    });

  } catch (err) {
    console.error("❌ Error eliminando cita:", err);
    
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "ID de cita inválido"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Error del servidor al eliminar cita",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// ======================================================
// 📌 REPROGRAMAR CITA (ADMIN CON NOTIFICACIONES)
// ======================================================
export const rescheduleAppointmentAdmin = async (req, res) => {
  console.log('🔔 Petición PATCH /admin/appointments/:id/reschedule recibida');
  console.log('📌 Cita ID a reprogramar:', req.params.id);
  console.log('📦 Nuevos datos:', req.body);
  
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Acceso denegado"
      });
    }

    const { id } = req.params;
    const { date, time, reason } = req.body;

    if (!date || !time) {
      return res.status(400).json({
        success: false,
        message: "Fecha y hora son obligatorios para reprogramar"
      });
    }

    const appointment = await Appointment.findById(id)
      .populate('userId', '_id name email');

    if (!appointment) {
      console.log('❌ Cita no encontrada');
      return res.status(404).json({
        success: false,
        message: "Cita no encontrada"
      });
    }

    if (appointment.status === 'cancelada') {
      return res.status(400).json({
        success: false,
        message: "No se puede reprogramar una cita cancelada"
      });
    }

    if (appointment.status === 'completada') {
      return res.status(400).json({
        success: false,
        message: "No se puede reprogramar una cita completada"
      });
    }

    const existingAppointment = await Appointment.findOne({
      userId: appointment.userId,
      date,
      time,
      _id: { $ne: id },
      status: { $nin: ['cancelada', 'completada'] }
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: "El cliente ya tiene otra cita en ese horario"
      });
    }

    const previousDate = appointment.date;
    const previousTime = appointment.time;
    const previousStatus = appointment.status;
    
    appointment.date = date;
    appointment.time = time;
    appointment.status = "reprogramada";
    appointment.rescheduledAt = new Date();
    appointment.rescheduledBy = req.user._id;
    appointment.rescheduleReason = reason || '';
    appointment.previousDate = previousDate;
    appointment.previousTime = previousTime;
    appointment.updatedAt = new Date();
    appointment.updatedBy = req.user._id;
    
    if (!appointment.statusHistory) {
      appointment.statusHistory = [];
    }
    
    appointment.statusHistory.push({
      from: previousStatus,
      to: 'reprogramada',
      changedAt: new Date(),
      changedBy: req.user._id,
      changedByRole: 'admin',
      reason: reason || 'Reprogramación administrativa'
    });
    
    await appointment.save();

    console.log('✅ Cita reprogramada por admin:', appointment._id);
    
    // 🔔 NOTIFICAR AL PROVEEDOR SOBRE LA REPROGRAMACIÓN
    if (appointment.providerId) {
      console.log(`📨 Notificando reprogramación a proveedor: ${appointment.providerId}`);
      
      try {
        await notifyAppointmentRescheduled(appointment, req.user._id, previousDate, previousTime, reason || 'Reprogramada por administrador');
        console.log('✅ Notificación de reprogramación enviada al proveedor');
      } catch (notificationError) {
        console.error('❌ Error creando notificación de reprogramación:', notificationError);
      }
    }
    
    res.json({
      success: true,
      message: "✅ Cita reprogramada correctamente",
      appointment: {
        _id: appointment._id,
        date: appointment.date,
        time: appointment.time,
        status: appointment.status,
        previousDate: appointment.previousDate,
        previousTime: appointment.previousTime,
        rescheduledAt: appointment.rescheduledAt,
        rescheduleReason: appointment.rescheduleReason
      }
    });

  } catch (err) {
    console.error("❌ Error reprogramando cita:", err);
    
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "ID de cita inválido"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Error del servidor al reprogramar la cita",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// ======================================================
// 📌 OBTENER ESTADÍSTICAS DE CITAS (ADMIN)
// ======================================================
export const getAppointmentStatsAdmin = async (req, res) => {
  console.log('🔔 Petición GET /admin/appointments/stats recibida');
  
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Acceso denegado"
      });
    }

    const totalAppointments = await Appointment.countDocuments({});
    
    const statsByStatus = await Appointment.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalRevenue: { $sum: "$servicePrice" }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const statsByProvider = await Appointment.aggregate([
      {
        $match: { providerId: { $ne: null } }
      },
      {
        $group: {
          _id: "$providerId",
          count: { $sum: 1 },
          totalRevenue: { $sum: "$servicePrice" }
        }
      },
      { $sort: { count: -1 } },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "provider"
        }
      },
      {
        $unwind: "$provider"
      },
      {
        $project: {
          _id: 1,
          count: 1,
          totalRevenue: 1,
          providerName: "$provider.name",
          providerEmail: "$provider.email"
        }
      }
    ]);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const statsByMonth = await Appointment.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 },
          totalRevenue: { $sum: "$servicePrice" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const statsByDay = await Appointment.aggregate([
      {
        $addFields: {
          dayOfWeek: { $dayOfWeek: "$date" }
        }
      },
      {
        $group: {
          _id: "$dayOfWeek",
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const daysMap = {
      1: 'Domingo',
      2: 'Lunes',
      3: 'Martes',
      4: 'Miércoles',
      5: 'Jueves',
      6: 'Viernes',
      7: 'Sábado'
    };

    const formattedStatsByDay = statsByDay.map(stat => ({
      day: daysMap[stat._id] || `Día ${stat._id}`,
      count: stat.count
    }));

    const totalRevenue = statsByStatus.reduce((total, stat) => total + (stat.totalRevenue || 0), 0);

    console.log('✅ Estadísticas obtenidas para admin');

    res.json({
      success: true,
      stats: {
        totalAppointments,
        totalRevenue,
        byStatus: statsByStatus.reduce((acc, stat) => {
          acc[stat._id] = {
            count: stat.count,
            revenue: stat.totalRevenue || 0
          };
          return acc;
        }, {}),
        byProvider: statsByProvider,
        byMonth: statsByMonth,
        byDay: formattedStatsByDay,
        summary: {
          pending: statsByStatus.find(s => s._id === 'pendiente')?.count || 0,
          confirmed: statsByStatus.find(s => s._id === 'confirmada')?.count || 0,
          completed: statsByStatus.find(s => s._id === 'completada')?.count || 0,
          cancelled: statsByStatus.find(s => s._id === 'cancelada')?.count || 0,
          rescheduled: statsByStatus.find(s => s._id === 'reprogramada')?.count || 0
        }
      }
    });

  } catch (err) {
    console.error("❌ Error obteniendo estadísticas:", err);
    res.status(500).json({
      success: false,
      message: "Error del servidor al obtener estadísticas",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// ======================================================
// 📌 NOTIFICAR TODOS LOS CAMBIOS DE UNA CITA
// ======================================================
export const notifyAppointmentChanges = async (appointmentId, changes, changedByUserId) => {
  try {
    const appointment = await Appointment.findById(appointmentId)
      .populate('providerId', '_id name email')
      .populate('userId', '_id name email');

    if (!appointment || !appointment.providerId) {
      return null;
    }

    const changedByUser = await User.findById(changedByUserId).select('name role');
    
    let title = '';
    let message = '';
    let type = 'appointment_updated';

    // Determinar tipo de cambio
    if (changes.status) {
      title = `📊 Estado actualizado: ${changes.status}`;
      message = `El ${changedByUser?.role === 'admin' ? 'administrador' : 'cliente'} ha cambiado el estado de la cita a ${changes.status}`;
      type = 'appointment_updated';
    } else if (changes.date || changes.time) {
      title = '🔄 Cita reprogramada';
      message = `La cita ha sido reprogramada`;
      type = 'appointment_rescheduled';
    } else if (changes.serviceName || changes.servicePrice) {
      title = '✏️ Detalles de cita actualizados';
      message = 'Los detalles de la cita han sido actualizados';
      type = 'appointment_updated';
    }

    // Agregar detalles específicos
    if (changes.date || changes.time) {
      message += ` para el ${changes.date || appointment.date} a las ${changes.time || appointment.time}`;
    }

    if (changes.reason) {
      message += `. Razón: ${changes.reason}`;
    }

    const notification = await createNotification({
      providerId: appointment.providerId._id,
      type,
      title,
      message,
      appointmentId: appointment._id,
      userId: changedByUserId,
      metadata: {
        appointmentDate: changes.date || appointment.date,
        appointmentTime: changes.time || appointment.time,
        serviceName: appointment.serviceName,
        changes,
        changedBy: changedByUser?.name || 'Sistema',
        changedByRole: changedByUser?.role || 'system',
        changedAt: new Date()
      }
    });

    console.log(`✅ Notificación de cambios creada para cita ${appointmentId}`);
    return notification;

  } catch (error) {
    console.error('❌ Error notificando cambios de cita:', error);
    return null;
  }
};

export default {
  getAllAppointmentsAdmin,
  createAppointmentAsAdmin,
  getAppointmentFormData,
  getClientPets,
  getProviderBusinesses,
  getBusinessServices,
  getProviderServices,
  getCompleteFormData,
  updateAppointmentStatusAdmin,
  deleteAppointmentAdmin,
  rescheduleAppointmentAdmin,
  getAppointmentStatsAdmin,
  notifyAppointmentChanges
};