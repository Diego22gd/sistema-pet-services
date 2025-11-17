import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

const createAdmin = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const adminEmail = "d.valdemar16@gmail.com";
  const adminPassword = "6e7137d6";

  const existingAdmin = await User.findOne({ email: adminEmail });
  if (existingAdmin) {
    console.log("👑 Admin ya existe");
    return process.exit();
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  await User.create({
    name: "Daniel",
    lastname: "Valdemar",
    email: adminEmail,
    password: hashedPassword,
    role: "admin",
  });

  console.log("✅ Admin creado correctamente");
  process.exit();
};

createAdmin();

