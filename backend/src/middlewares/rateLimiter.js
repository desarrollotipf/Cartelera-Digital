const rateLimit = require('express-rate-limit');

/**
 * Limitador general para todas las rutas de la API
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 300, // Límite de 300 peticiones por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Demasiadas solicitudes desde esta IP, por favor intenta de nuevo en 15 minutos.'
  }
});

/**
 * Limitador estricto para rutas de autenticación (Login, OTT)
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 30, // 30 intentos por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Demasiados intentos de autenticación. Por favor espera 15 minutos.'
  }
});

/**
 * Limitador para subida y procesamiento de archivos multimedia
 */
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 60, // 60 subidas por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Límite de subida de archivos alcanzado para esta ventana de tiempo.'
  }
});

module.exports = {
  apiLimiter,
  authLimiter,
  uploadLimiter
};
