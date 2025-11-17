// src/models/Pet.js
import mongoose from "mongoose";

const petSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    type: { type: String, required: true }, // Perro, Gato, etc.
    age: { type: Number },
    image: { type: String },
  },
  { timestamps: true }
);

const Pet = mongoose.model("Pet", petSchema);
export default Pet;
