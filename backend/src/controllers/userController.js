import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ===========================
// 🔹 Validaciones
// ===========================
const validateVenezuelanPhone = (phone) => {
  const regex = /^(\+58\s?)?(0?4(1[2-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9]|6[0-9]|7[0-9]|8[0-9]|9[0-9]))[-. ]?(\d{3})[-. ]?(\d{4})$/;
  return regex.test(phone);
};

const validateCedula = (cedula) => {
  const regex = /^(V|E|v|e)?-?\d{5,9}$/;
  return regex.test(cedula);
};

const validateRIF = (rif) => {
  const regex = /^[JGVEPjvgep]-?\d{8}-?\d$/;
  return regex.test(rif);
};

const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const validatePassword = (password) => {
  // Mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return regex.test(password);
};

// ===========================
// 🔹 Función para reparar usuarios antiguos
// ===========================
const repairOldUser = (user) => {
  // Si el usuario es antiguo y le faltan campos requeridos,
  // los llenamos con valores por defecto
  const updates = {};
  
  if (!user.phone || user.phone === '') {
    updates.phone = "04120000000"; // Teléfono temporal
  }
  
  if (!user.lastname || user.lastname === '') {
    updates.lastname = "Usuario"; // Apellido temporal
  }
  
  if (!user.name || user.name === '') {
    updates.name = "Usuario"; // Nombre temporal
  }
  
  // Si hay campos para actualizar
  if (Object.keys(updates).length > 0) {
    console.log(`🔧 Reparando usuario antiguo: ${user.email}`, updates);
    return updates;
  }
  
  return null;
};

// ===========================
// 🔹 Registrar un nuevo usuario - RUTA: POST /api/users/register
// ===========================
export const registerUser = async (req, res) => {
  try {
    console.log("📥 Recibiendo solicitud de registro:", req.body);
    
    const {
      name,
      lastname,
      cedula,
      rif,
      phone,
      birthdate,
      address,
      email,
      password,
      confirmPassword,
      businessName,
      serviceType,
      role = "client", // Valor por defecto
    } = req.body;

    // 🔹 Validaciones básicas
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "El nombre es obligatorio" });
    }

    if (!lastname || !lastname.trim()) {
      return res.status(400).json({ message: "El apellido es obligatorio" });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({ message: "El correo electrónico es obligatorio" });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Formato de correo electrónico inválido" });
    }

    if (!phone || !phone.trim()) {
      return res.status(400).json({ message: "El teléfono es obligatorio" });
    }

    if (!validateVenezuelanPhone(phone)) {
      return res.status(400).json({ 
        message: "Formato de teléfono inválido. Use formato venezolano (ej: +58 412 1234567 o 0412-1234567)" 
      });
    }

    if (!password) {
      return res.status(400).json({ message: "La contraseña es obligatoria" });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ 
        message: "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número" 
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Las contraseñas no coinciden" });
    }

    // 🔹 Validaciones específicas por rol
    let finalRole = role.toLowerCase();
    if (!["client", "provider"].includes(finalRole)) {
      finalRole = "client";
    }
    
    // Validación para clientes
    if (finalRole === "client") {
      if (!cedula || !cedula.trim()) {
        return res.status(400).json({ message: "La cédula es obligatoria para clientes" });
      }
      
      const cleanedCedula = cedula.trim().toUpperCase();
      if (!validateCedula(cleanedCedula)) {
        return res.status(400).json({ 
          message: "Formato de cédula inválido. Use formato V-12345678" 
        });
      }

      // Verificar si ya existe un cliente con esta cédula
      const existingCedula = await User.findOne({ 
        cedula: cleanedCedula, 
        role: "client" 
      });
      if (existingCedula) {
        return res.status(409).json({ message: "Ya existe un cliente registrado con esta cédula" });
      }
    }
    
    // Validación para proveedores
    if (finalRole === "provider") {
      if (!rif || !rif.trim()) {
        return res.status(400).json({ message: "El RIF es obligatorio para proveedores" });
      }
      
      const cleanedRIF = rif.trim().toUpperCase();
      if (!validateRIF(cleanedRIF)) {
        return res.status(400).json({ 
          message: "Formato de RIF inválido. Use formato J-12345678-9" 
        });
      }

      if (!businessName || !businessName.trim()) {
        return res.status(400).json({ message: "El nombre del negocio es obligatorio" });
      }

      if (!serviceType || !serviceType.trim()) {
        return res.status(400).json({ message: "El tipo de servicio es obligatorio" });
      }

      // Verificar si ya existe un proveedor con este RIF
      const existingRIF = await User.findOne({ 
        rif: cleanedRIF, 
        role: "provider" 
      });
      if (existingRIF) {
        return res.status(409).json({ message: "Ya existe un proveedor registrado con este RIF" });
      }
    }

    // 🔹 Verificar si ya existe un usuario con el mismo correo
    const cleanedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: cleanedEmail });
    if (existingUser) {
      return res.status(409).json({ message: "Ya existe un usuario registrado con este correo electrónico" });
    }

    // 🔹 Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 🔹 Preparar datos del usuario
    const userData = {
      name: name.trim(),
      lastname: lastname.trim(),
      phone: phone.trim(),
      email: cleanedEmail,
      password: hashedPassword,
      role: finalRole,
      isActive: true,
      emailVerified: false,
      lastLogin: new Date()
    };

    // 🔹 Agregar campos específicos según el rol
    if (finalRole === "client") {
      userData.cedula = cedula.trim().toUpperCase();
      if (birthdate) userData.birthdate = birthdate;
      if (address) userData.address = address.trim();
    }

    if (finalRole === "provider") {
      userData.rif = rif.trim().toUpperCase();
      userData.businessName = businessName.trim();
      userData.serviceType = serviceType.trim();
      if (birthdate) userData.birthdate = birthdate;
      if (address) userData.address = address.trim();
    }

    // 🔹 Crear nuevo usuario
    const newUser = await User.create(userData);

    // 🔹 Generar token JWT
    const token = jwt.sign(
      { 
        id: newUser._id, 
        role: newUser.role,
        email: newUser.email 
      },
      process.env.JWT_SECRET || "pet-services-secret-key-2024-change-in-production",
      { expiresIn: "7d" }
    );

    console.log("✅ Usuario registrado exitosamente:", newUser.email);

    // 🔹 Preparar respuesta
    const userResponse = {
      _id: newUser._id,
      name: newUser.name,
      lastname: newUser.lastname,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      isActive: newUser.isActive,
      emailVerified: newUser.emailVerified,
      createdAt: newUser.createdAt,
      lastLogin: newUser.lastLogin
    };

    // 🔹 Agregar campos específicos según el rol
    if (newUser.role === "client") {
      userResponse.cedula = newUser.cedula;
      userResponse.birthdate = newUser.birthdate;
      userResponse.address = newUser.address;
    }

    if (newUser.role === "provider") {
      userResponse.rif = newUser.rif;
      userResponse.businessName = newUser.businessName;
      userResponse.serviceType = newUser.serviceType;
      userResponse.birthdate = newUser.birthdate;
      userResponse.address = newUser.address;
    }

    // 🔹 Respuesta al frontend
    res.status(201).json({
      success: true,
      message: "Usuario registrado correctamente",
      user: userResponse,
      token
    });
    
  } catch (error) {
    console.error("❌ Error en registro:", error);
    
    // 🔹 Manejo de errores de MongoDB
    if (error.code === 11000) {
      if (error.keyPattern && error.keyPattern.email) {
        return res.status(409).json({ 
          success: false,
          message: "Ya existe un usuario registrado con este correo electrónico" 
        });
      }
      if (error.keyPattern && error.keyPattern.cedula) {
        return res.status(409).json({ 
          success: false,
          message: "Ya existe un cliente registrado con esta cédula" 
        });
      }
      if (error.keyPattern && error.keyPattern.rif) {
        return res.status(409).json({ 
          success: false,
          message: "Ya existe un proveedor registrado con este RIF" 
        });
      }
    }
    
    // 🔹 Otros errores de validación
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false,
        message: messages.join(', ') 
      });
    }
    
    // 🔹 Error del servidor
    res.status(500).json({ 
      success: false,
      message: "Error del servidor. Por favor, intente nuevamente.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ===========================
// 🔹 Iniciar sesión - RUTA: POST /api/users/login
// ===========================
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('📥 Recibiendo solicitud de login para:', email);

    // 🔹 Validaciones básicas
    if (!email || !email.trim()) {
      return res.status(400).json({ 
        success: false,
        message: "El correo electrónico es obligatorio" 
      });
    }

    if (!password) {
      return res.status(400).json({ 
        success: false,
        message: "La contraseña es obligatoria" 
      });
    }

    // 🔹 Buscar usuario por email (case-insensitive)
    const cleanedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanedEmail });
    
    if (!user) {
      console.log('❌ Usuario no encontrado:', cleanedEmail);
      return res.status(401).json({ 
        success: false,
        message: "Credenciales incorrectas" 
      });
    }

    console.log('✅ Usuario encontrado:', user.email);

    // 🔹 Verificar si el usuario está activo
    if (!user.isActive) {
      console.log('🚫 Usuario bloqueado intentando acceder:', user.email);
      return res.status(403).json({ 
        success: false,
        message: "Tu cuenta está bloqueada. Contacta al administrador." 
      });
    }

    // 🔹 Verificar contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      console.log('❌ Contraseña incorrecta para:', user.email);
      return res.status(401).json({ 
        success: false,
        message: "Credenciales incorrectas" 
      });
    }

    console.log('✅ Contraseña correcta');

    // 🔹 Verificar si es un usuario antiguo que necesita reparación
    const repairUpdates = repairOldUser(user);
    if (repairUpdates) {
      console.log(`🛠️ Reparando usuario antiguo: ${user.email}`);
      
      // Usar findByIdAndUpdate para evitar problemas de validación
      await User.findByIdAndUpdate(
        user._id,
        { 
          $set: { 
            ...repairUpdates,
            lastLogin: new Date()
          }
        },
        { 
          new: true,
          runValidators: false // IMPORTANTE: Desactivar validadores para usuarios antiguos
        }
      );
    } else {
      // Solo actualizar lastLogin para usuarios nuevos
      await User.findByIdAndUpdate(
        user._id,
        { $set: { lastLogin: new Date() } },
        { new: true }
      );
    }

    console.log('✅ Token generado para:', user.email);

    // 🔹 Generar token JWT
    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role,
        email: user.email 
      },
      process.env.JWT_SECRET || "pet-services-secret-key-2024-change-in-production",
      { expiresIn: "7d" }
    );

    // 🔹 Preparar respuesta del usuario
    const userResponse = {
      _id: user._id,
      name: user.name || "Usuario",
      lastname: user.lastname || "Usuario",
      email: user.email,
      phone: user.phone || "04120000000",
      role: user.role || "client",
      isActive: user.isActive !== undefined ? user.isActive : true,
      emailVerified: user.emailVerified !== undefined ? user.emailVerified : false,
      avatar: user.avatar || null,
      lastLogin: new Date(),
      createdAt: user.createdAt || new Date()
    };

    // 🔹 Agregar campos específicos según el rol
    if (user.role === "client") {
      userResponse.cedula = user.cedula || "";
      userResponse.birthdate = user.birthdate || null;
      userResponse.address = user.address || "";
      userResponse.pets = user.pets || [];
    }

    if (user.role === "provider") {
      userResponse.rif = user.rif || "";
      userResponse.businessName = user.businessName || "";
      userResponse.serviceType = user.serviceType || "";
      userResponse.birthdate = user.birthdate || null;
      userResponse.address = user.address || "";
      userResponse.subscription = user.subscription || {};
    }

    // 🔹 Respuesta exitosa
    res.json({
      success: true,
      message: "Inicio de sesión exitoso",
      user: userResponse,
      token
    });
    
  } catch (error) {
    console.error("❌ Error en login:", error);
    res.status(500).json({ 
      success: false,
      message: "Error del servidor. Por favor, intente nuevamente.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ===========================
// 🔹 Obtener perfil del usuario autenticado - RUTA: GET /api/users/profile
// ===========================
export const getUserProfile = async (req, res) => {
  try {
    // req.user viene del middleware de autenticación
    const user = await User.findById(req.user.id)
      .select("-password -emailVerificationToken -resetPasswordToken -resetPasswordExpires");
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "Usuario no encontrado" 
      });
    }

    // 🔹 Asegurar que los campos requeridos existan
    const safeUser = {
      ...user.toObject(),
      name: user.name || "Usuario",
      lastname: user.lastname || "Usuario",
      phone: user.phone || "04120000000",
      isActive: user.isActive !== undefined ? user.isActive : true,
      emailVerified: user.emailVerified !== undefined ? user.emailVerified : false
    };

    res.json({
      success: true,
      user: safeUser
    });
  } catch (error) {
    console.error("Error obteniendo perfil:", error);
    res.status(500).json({ 
      success: false,
      message: "Error del servidor. Por favor, intente nuevamente.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ===========================
// 🔹 Obtener usuario por ID - RUTA: GET /api/users/:id
// ===========================
export const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Verificar si el usuario está solicitando su propio perfil o es admin
    if (req.user.role !== "admin" && req.user.id !== userId) {
      return res.status(403).json({ 
        success: false,
        message: "No tienes permiso para acceder a este recurso" 
      });
    }

    const user = await User.findById(userId)
      .select("-password -emailVerificationToken -resetPasswordToken -resetPasswordExpires");
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "Usuario no encontrado" 
      });
    }

    // 🔹 Asegurar que los campos requeridos existan
    const safeUser = {
      ...user.toObject(),
      name: user.name || "Usuario",
      lastname: user.lastname || "Usuario",
      phone: user.phone || "04120000000"
    };

    res.json({
      success: true,
      user: safeUser
    });
  } catch (error) {
    console.error("Error obteniendo usuario por ID:", error);
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ 
        success: false,
        message: "ID de usuario inválido" 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: "Error del servidor. Por favor, intente nuevamente.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ===========================
// 🔹 Actualizar perfil del usuario - RUTA: PUT /api/users/profile
// ===========================
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "Usuario no encontrado" 
      });
    }

    const {
      name,
      lastname,
      phone,
      birthdate,
      address,
      email,
      businessName,
      serviceType,
      avatar,
      currentPassword,
      newPassword,
      confirmPassword
    } = req.body;

    // 🔹 Validar email si se proporciona
    if (email && email !== user.email) {
      if (!validateEmail(email)) {
        return res.status(400).json({ 
          success: false,
          message: "Formato de correo electrónico inválido" 
        });
      }
      
      const cleanedEmail = email.toLowerCase().trim();
      const existingEmail = await User.findOne({ 
        email: cleanedEmail, 
        _id: { $ne: user._id } 
      });
      
      if (existingEmail) {
        return res.status(409).json({ 
          success: false,
          message: "Ya existe un usuario con este correo electrónico" 
        });
      }
      
      user.email = cleanedEmail;
      user.emailVerified = false; // Resetear verificación si cambia el email
    }

    // 🔹 Validar teléfono si se proporciona
    if (phone && phone !== user.phone) {
      if (!validateVenezuelanPhone(phone)) {
        return res.status(400).json({ 
          success: false,
          message: "Formato de teléfono inválido. Use formato venezolano" 
        });
      }
      user.phone = phone.trim();
    } else if (!user.phone || user.phone === '') {
      // Si el usuario antiguo no tiene teléfono, usar uno temporal
      user.phone = phone || "04120000000";
    }

    // 🔹 Asegurar que los campos requeridos básicos existan
    if (!user.name || user.name === '') {
      user.name = name || "Usuario";
    }
    
    if (!user.lastname || user.lastname === '') {
      user.lastname = lastname || "Usuario";
    }

    // 🔹 Validaciones específicas por rol
    if (user.role === "provider") {
      if (businessName !== undefined) {
        if (!businessName.trim()) {
          return res.status(400).json({ 
            success: false,
            message: "El nombre del negocio es obligatorio" 
          });
        }
        user.businessName = businessName.trim();
      }

      if (serviceType !== undefined) {
        if (!serviceType.trim()) {
          return res.status(400).json({ 
            success: false,
            message: "El tipo de servicio es obligatorio" 
          });
        }
        user.serviceType = serviceType.trim();
      }
    }

    // 🔹 Actualizar otros campos
    if (name !== undefined && name.trim() !== '') user.name = name.trim();
    if (lastname !== undefined && lastname.trim() !== '') user.lastname = lastname.trim();
    if (birthdate !== undefined) user.birthdate = birthdate;
    if (address !== undefined) user.address = address.trim();
    if (avatar !== undefined) user.avatar = avatar;

    // 🔹 Cambiar contraseña si se proporciona
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ 
          success: false,
          message: "La contraseña actual es requerida" 
        });
      }
      
      if (!validatePassword(newPassword)) {
        return res.status(400).json({ 
          success: false,
          message: "La nueva contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número" 
        });
      }
      
      if (newPassword !== confirmPassword) {
        return res.status(400).json({ 
          success: false,
          message: "Las contraseñas no coinciden" 
        });
      }
      
      // Verificar contraseña actual
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ 
          success: false,
          message: "La contraseña actual es incorrecta" 
        });
      }
      
      // Encriptar nueva contraseña
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    // 🔹 Guardar usando findByIdAndUpdate para evitar problemas de validación
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $set: user.toObject() },
      { 
        new: true,
        runValidators: true // Solo validar para actualizaciones
      }
    );

    // 🔹 Preparar respuesta
    const userResponse = {
      _id: updatedUser._id,
      name: updatedUser.name || "Usuario",
      lastname: updatedUser.lastname || "Usuario",
      email: updatedUser.email,
      phone: updatedUser.phone || "04120000000",
      role: updatedUser.role,
      isActive: updatedUser.isActive !== undefined ? updatedUser.isActive : true,
      emailVerified: updatedUser.emailVerified !== undefined ? updatedUser.emailVerified : false,
      avatar: updatedUser.avatar,
      updatedAt: updatedUser.updatedAt
    };

    // 🔹 Agregar campos específicos según el rol
    if (updatedUser.role === "client") {
      userResponse.cedula = updatedUser.cedula;
      userResponse.birthdate = updatedUser.birthdate;
      userResponse.address = updatedUser.address;
    }

    if (updatedUser.role === "provider") {
      userResponse.rif = updatedUser.rif;
      userResponse.businessName = updatedUser.businessName;
      userResponse.serviceType = updatedUser.serviceType;
      userResponse.birthdate = updatedUser.birthdate;
      userResponse.address = updatedUser.address;
      userResponse.subscription = updatedUser.subscription;
    }

    res.json({
      success: true,
      message: "Perfil actualizado correctamente",
      user: userResponse
    });
    
  } catch (error) {
    console.error("Error actualizando perfil:", error);
    
    if (error.code === 11000) {
      if (error.keyPattern && error.keyPattern.email) {
        return res.status(409).json({ 
          success: false,
          message: "Ya existe un usuario con este correo electrónico" 
        });
      }
    }
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false,
        message: messages.join(', ') 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: "Error del servidor. Por favor, intente nuevamente.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ===========================
// 🔹 Obtener todos los usuarios (admin) - RUTA: GET /api/users
// ===========================
export const getUsers = async (req, res) => {
  try {
    // Verificar si es admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ 
        success: false,
        message: "Acceso denegado. Solo administradores." 
      });
    }

    const users = await User.find()
      .select("-password -emailVerificationToken -resetPasswordToken -resetPasswordExpires")
      .sort({ createdAt: -1 });

    // 🔹 Asegurar que todos los usuarios tengan campos básicos
    const safeUsers = users.map(user => ({
      ...user.toObject(),
      name: user.name || "Usuario",
      lastname: user.lastname || "Usuario",
      phone: user.phone || "04120000000",
      isActive: user.isActive !== undefined ? user.isActive : true,
      emailVerified: user.emailVerified !== undefined ? user.emailVerified : false
    }));

    res.json({
      success: true,
      count: safeUsers.length,
      users: safeUsers
    });
  } catch (error) {
    console.error("Error obteniendo usuarios:", error);
    res.status(500).json({ 
      success: false,
      message: "Error del servidor",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ===========================
// 🔹 Actualizar usuario (admin) - RUTA: PUT /api/users/:id
// ===========================
export const updateUser = async (req, res) => {
  try {
    // Verificar si es admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ 
        success: false,
        message: "Acceso denegado. Solo administradores." 
      });
    }

    const userId = req.params.id;
    const updateData = req.body;

    console.log(`🔄 Actualizando usuario ${userId}:`, updateData);

    // 🔹 Buscar usuario existente
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ 
        success: false,
        message: "Usuario no encontrado" 
      });
    }

    // 🔹 Evitar que un admin se desactive a sí mismo
    if (existingUser._id.toString() === req.user.id && updateData.isActive === false) {
      return res.status(400).json({ 
        success: false,
        message: "No puedes desactivar tu propia cuenta" 
      });
    }

    // 🔹 Validar email si se cambia
    if (updateData.email && updateData.email !== existingUser.email) {
      if (!validateEmail(updateData.email)) {
        return res.status(400).json({ 
          success: false,
          message: "Formato de correo electrónico inválido" 
        });
      }
      
      const cleanedEmail = updateData.email.toLowerCase().trim();
      const existingEmail = await User.findOne({ 
        email: cleanedEmail, 
        _id: { $ne: userId } 
      });
      
      if (existingEmail) {
        return res.status(409).json({ 
          success: false,
          message: "Ya existe un usuario con este correo electrónico" 
        });
      }
    }

    // 🔹 Validar teléfono si se cambia
    if (updateData.phone && updateData.phone !== existingUser.phone) {
      if (!validateVenezuelanPhone(updateData.phone)) {
        return res.status(400).json({ 
          success: false,
          message: "Formato de teléfono inválido. Use formato venezolano" 
        });
      }
    }

    // 🔹 Validar cédula si se cambia (para clientes)
    if (updateData.cedula && updateData.cedula !== existingUser.cedula) {
      if (!validateCedula(updateData.cedula)) {
        return res.status(400).json({ 
          success: false,
          message: "Formato de cédula inválido. Use formato V-12345678" 
        });
      }

      const cleanedCedula = updateData.cedula.trim().toUpperCase();
      const existingCedula = await User.findOne({ 
        cedula: cleanedCedula, 
        _id: { $ne: userId } 
      });
      
      if (existingCedula) {
        return res.status(409).json({ 
          success: false,
          message: "Ya existe un usuario con esta cédula" 
        });
      }
    }

    // 🔹 Validar RIF si se cambia (para proveedores)
    if (updateData.rif && updateData.rif !== existingUser.rif) {
      if (!validateRIF(updateData.rif)) {
        return res.status(400).json({ 
          success: false,
          message: "Formato de RIF inválido. Use formato J-12345678-9" 
        });
      }

      const cleanedRIF = updateData.rif.trim().toUpperCase();
      const existingRIF = await User.findOne({ 
        rif: cleanedRIF, 
        _id: { $ne: userId } 
      });
      
      if (existingRIF) {
        return res.status(409).json({ 
          success: false,
          message: "Ya existe un usuario con este RIF" 
        });
      }
    }

    // 🔹 Validar contraseña si se cambia
    if (updateData.password) {
      if (!validatePassword(updateData.password)) {
        return res.status(400).json({ 
          success: false,
          message: "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número" 
        });
      }
      
      // Encriptar nueva contraseña
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    } else {
      // No actualizar la contraseña si no se proporciona
      delete updateData.password;
    }

    // 🔹 Limpiar datos antes de actualizar
    const cleanedData = {};
    
    // 🔹 Campos básicos
    if (updateData.name !== undefined) cleanedData.name = updateData.name.trim();
    if (updateData.lastname !== undefined) cleanedData.lastname = updateData.lastname.trim();
    if (updateData.email !== undefined) cleanedData.email = updateData.email.toLowerCase().trim();
    if (updateData.phone !== undefined) cleanedData.phone = updateData.phone.trim();
    if (updateData.role !== undefined) cleanedData.role = updateData.role;
    if (updateData.isActive !== undefined) cleanedData.isActive = updateData.isActive;
    
    // 🔹 Campos específicos de clientes
    if (updateData.cedula !== undefined) cleanedData.cedula = updateData.cedula.trim().toUpperCase();
    if (updateData.birthdate !== undefined) cleanedData.birthdate = updateData.birthdate;
    if (updateData.address !== undefined) cleanedData.address = updateData.address.trim();
    
    // 🔹 Campos específicos de proveedores
    if (updateData.rif !== undefined) cleanedData.rif = updateData.rif.trim().toUpperCase();
    if (updateData.businessName !== undefined) cleanedData.businessName = updateData.businessName.trim();
    if (updateData.serviceType !== undefined) cleanedData.serviceType = updateData.serviceType.trim();
    
    // 🔹 Otros campos
    if (updateData.avatar !== undefined) cleanedData.avatar = updateData.avatar;
    if (updateData.emailVerified !== undefined) cleanedData.emailVerified = updateData.emailVerified;
    if (updateData.password) cleanedData.password = updateData.password;

    // 🔹 Actualizar usuario
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: cleanedData },
      { 
        new: true,
        runValidators: true
      }
    ).select("-password -emailVerificationToken -resetPasswordToken -resetPasswordExpires");

    // 🔹 Asegurar campos requeridos
    const safeUser = {
      ...updatedUser.toObject(),
      name: updatedUser.name || "Usuario",
      lastname: updatedUser.lastname || "Usuario",
      phone: updatedUser.phone || "04120000000",
      isActive: updatedUser.isActive !== undefined ? updatedUser.isActive : true,
      emailVerified: updatedUser.emailVerified !== undefined ? updatedUser.emailVerified : false
    };

    // 🔹 Mensaje apropiado según el cambio
    let message = "Usuario actualizado correctamente";
    if (updateData.isActive === false) {
      message = "Usuario bloqueado correctamente";
    } else if (updateData.isActive === true) {
      message = "Usuario desbloqueado correctamente";
    }

    console.log(`✅ Usuario ${userId} actualizado:`, {
      isActive: updatedUser.isActive,
      role: updatedUser.role
    });

    res.json({
      success: true,
      message,
      user: safeUser
    });
    
  } catch (error) {
    console.error("Error actualizando usuario:", error);
    
    if (error.code === 11000) {
      if (error.keyPattern && error.keyPattern.email) {
        return res.status(409).json({ 
          success: false,
          message: "Ya existe un usuario con este correo electrónico" 
        });
      }
      if (error.keyPattern && error.keyPattern.cedula) {
        return res.status(409).json({ 
          success: false,
          message: "Ya existe un usuario con esta cédula" 
        });
      }
      if (error.keyPattern && error.keyPattern.rif) {
        return res.status(409).json({ 
          success: false,
          message: "Ya existe un usuario con este RIF" 
        });
      }
    }
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false,
        message: messages.join(', ') 
      });
    }
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ 
        success: false,
        message: "ID de usuario inválido" 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: "Error del servidor",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ===========================
// 🔹 Cambiar estado del usuario (bloquear/desbloquear) - RUTA: PATCH /api/users/:id/status
// ===========================
export const updateUserStatus = async (req, res) => {
  try {
    // Verificar si es admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ 
        success: false,
        message: "Acceso denegado. Solo administradores." 
      });
    }

    const userId = req.params.id;
    const { isActive } = req.body;

    console.log(`🔄 Cambiando estado del usuario ${userId} a:`, isActive);

    // 🔹 Validar que isActive sea un booleano
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ 
        success: false,
        message: "El estado (isActive) debe ser un valor booleano" 
      });
    }

    // 🔹 Buscar usuario existente
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ 
        success: false,
        message: "Usuario no encontrado" 
      });
    }

    // 🔹 Evitar que un admin se desactive a sí mismo
    if (existingUser._id.toString() === req.user.id && isActive === false) {
      return res.status(400).json({ 
        success: false,
        message: "No puedes desactivar tu propia cuenta" 
      });
    }

    // 🔹 Actualizar solo el estado
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { isActive } },
      { 
        new: true,
        runValidators: true
      }
    ).select("-password -emailVerificationToken -resetPasswordToken -resetPasswordExpires");

    // 🔹 Asegurar campos requeridos
    const safeUser = {
      ...updatedUser.toObject(),
      name: updatedUser.name || "Usuario",
      lastname: updatedUser.lastname || "Usuario",
      phone: updatedUser.phone || "04120000000"
    };

    const message = isActive 
      ? "Usuario desbloqueado correctamente. Ahora puede iniciar sesión." 
      : "Usuario bloqueado correctamente. Ya no podrá iniciar sesión.";

    console.log(`✅ Estado del usuario ${userId} cambiado a: ${isActive}`);

    res.json({
      success: true,
      message,
      user: safeUser
    });
    
  } catch (error) {
    console.error("Error cambiando estado del usuario:", error);
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ 
        success: false,
        message: "ID de usuario inválido" 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: "Error del servidor",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ===========================
// 🔹 Eliminar usuario (admin) - RUTA: DELETE /api/users/:id
// ===========================
export const deleteUser = async (req, res) => {
  try {
    // Verificar si es admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ 
        success: false,
        message: "Acceso denegado. Solo administradores." 
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "Usuario no encontrado" 
      });
    }

    // Evitar que un admin se elimine a sí mismo
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ 
        success: false,
        message: "No puedes eliminar tu propia cuenta" 
      });
    }

    await user.deleteOne();

    res.json({
      success: true,
      message: "Usuario eliminado correctamente"
    });
  } catch (error) {
    console.error("Error eliminando usuario:", error);
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ 
        success: false,
        message: "ID de usuario inválido" 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: "Error del servidor",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ===========================
// 🔹 Verificar token - RUTA: GET /api/users/verify-token
// ===========================
export const verifyToken = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password -emailVerificationToken -resetPasswordToken -resetPasswordExpires");
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "Usuario no encontrado" 
      });
    }

    // 🔹 Asegurar que los campos requeridos existan
    const safeUser = {
      ...user.toObject(),
      name: user.name || "Usuario",
      lastname: user.lastname || "Usuario",
      phone: user.phone || "04120000000"
    };

    res.json({
      success: true,
      message: "Token válido",
      user: safeUser
    });
  } catch (error) {
    console.error("Error verificando token:", error);
    res.status(500).json({ 
      success: false,
      message: "Error del servidor",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ===========================
// 🔹 Cerrar sesión - RUTA: POST /api/users/logout
// ===========================
export const logoutUser = async (req, res) => {
  try {
    res.json({
      success: true,
      message: "Sesión cerrada correctamente"
    });
  } catch (error) {
    console.error("Error cerrando sesión:", error);
    res.status(500).json({ 
      success: false,
      message: "Error del servidor",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ===========================
// 🔹 Script para reparar usuarios antiguos (ejecutar una sola vez)
// ===========================
export const repairAllOldUsers = async (req, res) => {
  try {
    // Solo admin puede ejecutar esto
    if (req.user.role !== "admin") {
      return res.status(403).json({ 
        success: false,
        message: "Acceso denegado. Solo administradores." 
      });
    }

    const users = await User.find();
    let repairedCount = 0;

    for (const user of users) {
      const repairUpdates = repairOldUser(user);
      if (repairUpdates) {
        await User.findByIdAndUpdate(
          user._id,
          { $set: repairUpdates },
          { runValidators: false }
        );
        repairedCount++;
        console.log(`🛠️ Reparado: ${user.email}`);
      }
    }

    res.json({
      success: true,
      message: `Se repararon ${repairedCount} usuarios antiguos`,
      repairedCount
    });
  } catch (error) {
    console.error("Error reparando usuarios:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al reparar usuarios",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};