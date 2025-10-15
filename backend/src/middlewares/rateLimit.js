// Simple rate limiter en memoria para rutas específicas (login)
// Nota: Para entornos multi-instancia, usar Redis/Memcached o express-rate-limit.

const buckets = new Map();

function cleanupOld(now) {
  // Limpieza ocasional para evitar crecimiento indefinido
  for (const [ip, entry] of buckets) {
    // Si no hubo actividad en 15 minutos, limpiar
    if (now - entry.last > 15 * 60 * 1000) {
      buckets.delete(ip);
    }
  }
}

// limit: intentos permitidos, windowMs: ventana en ms, blockMs: bloqueo tras exceder
function makeLimiter({ limit = 5, windowMs = 60_000, blockMs = 10 * 60_000 } = {}) {
  return function (req, res, next) {
    try {
      const now = Date.now();
      const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';

      let entry = buckets.get(ip);
      if (!entry) {
        entry = { count: 0, reset: now + windowMs, blockedUntil: 0, last: now };
        buckets.set(ip, entry);
      }

      entry.last = now;

      if (entry.blockedUntil && now < entry.blockedUntil) {
        const retryAfter = Math.ceil((entry.blockedUntil - now) / 1000);
        res.setHeader('Retry-After', String(retryAfter));
        return res.status(429).json({ mensaje: 'Demasiados intentos. Intenta más tarde.' });
      }

      if (now > entry.reset) {
        entry.count = 0;
        entry.reset = now + windowMs;
      }

      entry.count += 1;

      if (entry.count > limit) {
        entry.blockedUntil = now + blockMs;
        const retryAfter = Math.ceil(blockMs / 1000);
        res.setHeader('Retry-After', String(retryAfter));
        cleanupOld(now);
        return res.status(429).json({ mensaje: 'Demasiados intentos. Intenta más tarde.' });
      }

      cleanupOld(now);
      return next();
    } catch (e) {
      return next();
    }
  };
}

// Límite conservador para login: 5 por minuto; bloqueo 10 minutos
const loginRateLimiter = makeLimiter({ limit: 5, windowMs: 60_000, blockMs: 10 * 60_000 });

// Límite para operaciones de escritura de admin: 30 solicitudes/5 min; bloqueo 10 min
const adminWriteLimiter = makeLimiter({ limit: 30, windowMs: 5 * 60_000, blockMs: 10 * 60_000 });

// Límite suave para lecturas de admin: 120 solicitudes/5 min; bloqueo 5 min
const adminReadLimiter = makeLimiter({ limit: 120, windowMs: 5 * 60_000, blockMs: 5 * 60_000 });

module.exports = { makeLimiter, loginRateLimiter, adminWriteLimiter, adminReadLimiter };
