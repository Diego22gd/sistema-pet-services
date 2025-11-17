import dotenv from "dotenv";
dotenv.config(); // 👈 cargar variables de entorno primero

import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";

// Rutas
import userRoutes from "./routes/userRoutes.js";
import petRoutes from "./routes/petRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";


// Rutas

// Más adelante podrás importar:
// import petRoutes from "./routes/petRoutes.js";
// import serviceRoutes from "./routes/serviceRoutes.js";
// import appointmentRoutes from "./routes/appointmentRoutes.js";

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

// Conectar a MongoDB
connectDB();

// Rutas de la API
app.use("/api/users", userRoutes);
// app.use("/api/pets", petRoutes);
app.use("/api/pets", petRoutes);
// app.use("/api/services", serviceRoutes);
app.use("/api/services", serviceRoutes);
// app.use("/api/appointments", appointmentRoutes);
app.use("/api/appointments", appointmentRoutes);


// Ruta de prueba
app.get("/", (req, res) => {
  res.send("API Pet Services funcionando 🐾");
});

export default app;
