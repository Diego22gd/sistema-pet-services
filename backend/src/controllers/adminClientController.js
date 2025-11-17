import User from "../models/User.js";
import bcrypt from "bcryptjs";

// 🔹 Obtener todos los clientes
export const getClients = async (req, res) => {
  try {
    // Si deseas proteger solo para admin, descomenta:
    // if (req.user.role !== "admin") {
    //   return res.status(403).json({ message: "Acceso denegado" });
    // }

    const clients = await User.find({ role: "client" }).select("-password");
    res.json(clients);
  } catch (error) {
    console.error("❌ Error al obtener clientes:", error);
    res.status(500).json({ message: "Error al obtener clientes" });
  }
};

// 🔹 Crear cliente nuevo
export const createClient = async (req, res) => {
  try {
    const { name, lastname, email, phone, cedula, birthdate, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "El correo ya está registrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      lastname,
      email,
      phone,
      cedula,
      birthdate,
      password: hashedPassword,
      role: "client",
      userType: "client",
    });

    // Devolvemos el cliente creado sin el password
    const userWithoutPassword = newUser.toObject();
    delete userWithoutPassword.password;

    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error("❌ Error al crear cliente:", error);
    res.status(500).json({ message: "Error al crear cliente" });
  }
};

// 🔹 Actualizar cliente
export const updateClient = async (req, res) => {
  try {
    const client = await User.findById(req.params.id);
    if (!client) return res.status(404).json({ message: "Cliente no encontrado" });

    const updates = req.body;
    // Si incluye password nuevo, encriptarlo
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    Object.assign(client, updates);
    await client.save();

    const clientWithoutPassword = client.toObject();
    delete clientWithoutPassword.password;

    res.json(clientWithoutPassword);
  } catch (error) {
    console.error("❌ Error al actualizar cliente:", error);
    res.status(500).json({ message: "Error al actualizar cliente" });
  }
};

// 🔹 Eliminar cliente
export const deleteClient = async (req, res) => {
  try {
    const client = await User.findById(req.params.id);
    if (!client) return res.status(404).json({ message: "Cliente no encontrado" });

    await client.deleteOne();
    res.json({ message: "Cliente eliminado correctamente" });
  } catch (error) {
    console.error("❌ Error al eliminar cliente:", error);
    res.status(500).json({ message: "Error al eliminar cliente" });
  }
};
