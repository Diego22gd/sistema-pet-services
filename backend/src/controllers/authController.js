import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// Crear token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// Registro de CLIENTE
export const registerClient = async (req, res) => {
  try {
    const { name, lastname, email, password, phone } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "El correo ya existe" });

    const hashed = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      lastname,
      email,
      password: hashed,
      phone,
      userType: "client",       // 👈 Rol correcto
    });

    res.status(201).json({
      message: "Cliente registrado",
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        userType: newUser.userType,
      },
      token: generateToken(newUser._id),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Error registrando cliente" });
  }
};

// Registro de PROVEEDOR
export const registerProvider = async (req, res) => {
  try {
    const { name, lastname, email, password, phone, businessName, serviceType } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "El correo ya existe" });

    const hashed = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      lastname,
      email,
      password: hashed,
      phone,
      businessName,
      serviceType,
      userType: "provider",     // 👈 Rol correcto
    });

    res.status(201).json({
      message: "Proveedor registrado",
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        userType: newUser.userType,
      },
      token: generateToken(newUser._id),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Error registrando proveedor" });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Contraseña incorrecta" });

    res.json({
      message: "Login exitoso",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
      },
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error en login" });
  }
};
