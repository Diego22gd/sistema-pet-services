import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ===========================
// 🔹 Registrar un nuevo usuario
// ===========================
export const registerUser = async (req, res) => {
  try {
    const {
      name,
      lastname,
      cedula,
      phone,
      birthdate,
      address,
      email,
      password,
      userType,
      businessName,
      serviceType,
      role, // <-- IMPORTANTE
    } = req.body;

    // Verificar si ya existe un usuario con el mismo correo
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "El usuario ya existe" });
    }

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Rol seguro: si no envían rol, será "client"
    const finalRole = role || "client";

    // Crear nuevo usuario
    const newUser = await User.create({
      name,
      lastname,
      cedula,
      phone,
      birthdate,
      address,
      email,
      password: hashedPassword,
      userType,
      businessName,
      serviceType,
      role: finalRole, // <-- YA SE GUARDA CORRECTAMENTE
    });

    // Generar token JWT
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Respuesta al frontend
    res.status(201).json({
      message: "Usuario registrado correctamente",
      user: {
        _id: newUser._id,
        name: newUser.name,
        lastname: newUser.lastname,
        cedula: newUser.cedula,
        phone: newUser.phone,
        birthdate: newUser.birthdate,
        address: newUser.address,
        email: newUser.email,
        userType: newUser.userType,
        businessName: newUser.businessName,
        serviceType: newUser.serviceType,
        role: newUser.role, // <-- IMPORTANTE
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===========================
// 🔹 Iniciar sesión
// ===========================
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Usuario no encontrado" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Contraseña incorrecta" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Inicio de sesión exitoso",
      user: {
        _id: user._id,
        name: user.name,
        lastname: user.lastname,
        cedula: user.cedula,
        phone: user.phone,
        birthdate: user.birthdate,
        address: user.address,
        email: user.email,
        userType: user.userType,
        businessName: user.businessName,
        serviceType: user.serviceType,
        role: user.role, // <-- AQUI TAMBIÉN
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===========================
// 🔹 Obtener perfil del usuario autenticado
// ===========================
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===========================
// 🔹 Actualizar perfil del usuario
// ===========================
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    const fields = [
      "name",
      "lastname",
      "cedula",
      "phone",
      "birthdate",
      "address",
      "email",
      "userType",
      "businessName",
      "serviceType",
      "role",  // <-- PERMITIMOS EDITAR EL ROL (opcional)
    ];

    // Actualizar solo los campos enviados
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    // Si se envía nueva contraseña
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await user.save();
    res.json({
      message: "Perfil actualizado correctamente",
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        lastname: updatedUser.lastname,
        cedula: updatedUser.cedula,
        phone: updatedUser.phone,
        birthdate: updatedUser.birthdate,
        address: updatedUser.address,
        email: updatedUser.email,
        userType: updatedUser.userType,
        businessName: updatedUser.businessName,
        serviceType: updatedUser.serviceType,
        role: updatedUser.role, // <-- NECESARIO
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
