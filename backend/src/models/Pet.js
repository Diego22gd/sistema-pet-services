import mongoose from "mongoose";

const petSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    type: { type: String, required: true }, // Perro, Gato, etc.
    breed: { type: String }, // Raza (opcional)
    age: { type: Number },
    weight: { type: Number }, // Peso en kg (opcional)
    image: { type: String },
  },
  { timestamps: true }
);

const Pet = mongoose.model("Pet", petSchema);
export default Pet;