// src/middlewares/roleMiddleware.js
export const adminOnly = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "No autenticado" });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Acceso denegado: se requiere rol de administrador" });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: "Error al verificar el rol", error: error.message });
  }
};
// backend/src/middlewares/roleMiddleware.js

/**
 * Middleware para restringir acceso según el rol del usuario.
 * Ejemplo: requireRole("admin") => solo los administradores pueden continuar.
 */
export const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "No autenticado." });
    }

    if (req.user.role !== role) {
      return res.status(403).json({ message: `Acceso denegado. Se requiere rol: ${role}.` });
    }

    next();
  };
};
