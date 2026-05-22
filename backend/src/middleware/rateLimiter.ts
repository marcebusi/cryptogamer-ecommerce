import rateLimit from 'express-rate-limit'

// ── Respuesta estandarizada para rate limit ───────────────────────────────────
const rateLimitHandler = (req: any, res: any) => {
  res.status(429).json({
    error: 'Demasiadas solicitudes',
    message: 'Has excedido el límite de peticiones. Intentá de nuevo más tarde.',
    retryAfter: res.getHeader('Retry-After'),
  })
}

// ── Auth: login / register / reset — MUY estricto ────────────────────────────
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  skipSuccessfulRequests: true, // Solo cuenta intentos fallidos
  message: 'Demasiados intentos de autenticación.',
})

// ── Password reset — ultra estricto ──────────────────────────────────────────
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
})

// ── Upload de imágenes ────────────────────────────────────────────────────────
export const uploadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutos
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
})

// ── Contacto / Email — 3 mensajes por hora por IP para evitar spam al owner ──
export const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  message: 'Límite de mensajes alcanzado. Podés enviar hasta 3 mensajes por hora.',
})

// ── Admin endpoints ───────────────────────────────────────────────────────────
export const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
})

// ── API general (catch-all) ───────────────────────────────────────────────────
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  skip: (req) => {
    // No limitar health check
    return req.path === '/api/health'
  },
})
