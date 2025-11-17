// backend/controllers/pets.controller.js
import Pet from "../models/Pet.js";

// ➕ Crear mascota
export const createPet = async (req, res) => {
  try {
    const { name, type, age, image } = req.body;
    const userId = req.user.id;

    const newPet = await Pet.create({
      owner: userId,
      name,
      type,
      age,
      image,
    });

    res.status(201).json(newPet);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear mascota", error });
  }
};

// 🐾 Obtener mascotas del usuario
export const getUserPets = async (req, res) => {
  try {
    const pets = await Pet.find({ owner: req.user.id });
    res.json(pets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener mascotas", error });
  }
};

// ✏️ Actualizar mascota
export const updatePet = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, age, image } = req.body;

    const pet = await Pet.findOne({ _id: id, owner: req.user.id });
    if (!pet) return res.status(404).json({ message: "Mascota no encontrada" });

    pet.name = name;
    pet.type = type;
    pet.age = age;
    pet.image = image;

    await pet.save();
    res.json(pet);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar mascota", error });
  }
};

// 🗑️ Eliminar mascota
export const deletePet = async (req, res) => {
  try {
    const { id } = req.params;
    const pet = await Pet.findOneAndDelete({ _id: id, owner: req.user.id });
    if (!pet) return res.status(404).json({ message: "Mascota no encontrada" });

    res.json({ message: "Mascota eliminada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar mascota", error });
  }
};
