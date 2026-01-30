import User from "../models/User.js";
import bcrypt from "bcryptjs";

// 🔹 Obtener todos los clientes
export const getClients = async (req, res) => {
  try {
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

// 🔹 BLOQUEAR/DESBLOQUEAR CLIENTE - TOGGLE STATUS
export const toggleClientStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar el cliente
    const client = await User.findById(id);
    if (!client) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    // Verificar que sea un cliente
    if (client.role !== "client") {
      return res.status(400).json({ message: "Solo se puede cambiar el estado de clientes" });
    }

    // Alternar el estado (si es undefined, se establece como false/bloqueado)
    const newStatus = client.isActive === undefined ? false : !client.isActive;
    
    // Actualizar el estado
    client.isActive = newStatus;
    client.lastLogin = new Date();
    await client.save();

    // Devolver el cliente actualizado sin password
    const clientWithoutPassword = client.toObject();
    delete clientWithoutPassword.password;

    res.json({
      _id: clientWithoutPassword._id,
      name: clientWithoutPassword.name,
      lastname: clientWithoutPassword.lastname,
      email: clientWithoutPassword.email,
      phone: clientWithoutPassword.phone,
      cedula: clientWithoutPassword.cedula,
      birthdate: clientWithoutPassword.birthdate,
      role: clientWithoutPassword.role,
      isActive: clientWithoutPassword.isActive,
      createdAt: clientWithoutPassword.createdAt,
      updatedAt: clientWithoutPassword.updatedAt,
      lastLogin: clientWithoutPassword.lastLogin,
      message: newStatus ? "Cliente activado exitosamente" : "Cliente bloqueado exitosamente"
    });
  } catch (error) {
    console.error("❌ Error al cambiar estado del cliente:", error);
    res.status(500).json({ message: "Error al cambiar el estado del cliente" });
  }
};

// 🔹 CAMBIAR ESTADO ESPECÍFICO DEL CLIENTE
export const changeClientStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    // Validar que isActive sea un booleano
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ message: "El campo isActive debe ser true o false" });
    }

    // Buscar y actualizar el cliente
    const client = await User.findByIdAndUpdate(
      id,
      { 
        isActive,
        lastLogin: new Date()
      },
      { new: true }
    ).select("-password");

    if (!client) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    // Verificar que sea un cliente
    if (client.role !== "client") {
      return res.status(400).json({ message: "Solo se puede cambiar el estado de clientes" });
    }

    res.json({
      ...client.toObject(),
      message: isActive ? "Cliente activado exitosamente" : "Cliente bloqueado exitosamente"
    });
  } catch (error) {
    console.error("❌ Error al cambiar estado del cliente:", error);
    res.status(500).json({ message: "Error al cambiar el estado del cliente" });
  }
};