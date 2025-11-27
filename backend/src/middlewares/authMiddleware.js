import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // ⛔ Si no hay token
      if (!token) {
        return res.status(401).json({ message: "Acceso denegado, falta token" });
      }

      // 🔐 Verificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Buscar usuario
      const user = await User.findById(decoded.id).select("-password");

      // ⛔ Usuario eliminado o token inválido
      if (!user) {
        return res.status(401).json({ message: "Token inválido o usuario inexistente" });
      }

      // Guardar usuario en req para siguientes middlewares
      req.user = user;
      next();

    } catch (error) {
      console.error("❌ ERROR en protect:", error);
      const msg =
        error.name === "TokenExpiredError"
          ? "Token expirado"
          : "Token inválido";

      return res.status(401).json({ message: msg });
    }
  } else {
    return res.status(401).json({ message: "No se envió token" });
  }
};

// 🛡 Validar roles
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "No autenticado" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "No autorizado" });
    }

    next();
  };
};
