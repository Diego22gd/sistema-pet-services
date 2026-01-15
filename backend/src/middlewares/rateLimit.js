// middleware/rateLimit.js
import rateLimit from 'express-rate-limit';

export const chatRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 10, // 10 peticiones por minuto
  message: {
    error: "Demasiadas peticiones al chat. Espera un momento."
  },
  standardHeaders: true,
  legacyHeaders: false
});

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 peticiones por 15 minutos
  message: {
    error: "Demasiadas peticiones a la API."
  }
});