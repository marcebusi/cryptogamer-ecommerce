import express from 'express'
import cors    from 'cors'
import dotenv  from 'dotenv'
import path    from 'path'
import helmet  from 'helmet'

import productRoutes   from './routes/productRoutes'
import categoryRoutes  from './routes/categoryRoutes'
import authRoutes      from './routes/authRoutes'
import adminRoutes     from './routes/adminRoutes'
import uploadRoutes    from './routes/uploadRoutes'
import contactRoutes   from './routes/contactRoutes'
import orderRoutes     from './routes/orderRoutes'
import sellerRoutes    from './routes/sellerRoutes'
import trackingRoutes  from './routes/trackingRoutes'
import superAdminRoutes from './routes/superAdminRoutes'
import shippingRoutes  from './routes/shippingRoutes'

import {
  authLimiter,
  passwordResetLimiter,
  uploadLimiter,
  contactLimiter,
  adminLimiter,
  generalLimiter,
} from './middleware/rateLimiter'

import {
  sanitizeInput,
  preventParamPollution,
  blockMaliciousUA,
  securityLogger,
  BODY_LIMITS,
} from './middleware/security'

import { errorHandler, notFound } from './middleware/errorHandler'

dotenv.config()

const app  = express()
const PORT = process.env.PORT ?? 3001
const isProd = process.env.NODE_ENV === 'production'

// ── Orígenes permitidos ────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:80',
  'http://localhost',
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL_2,
].filter(Boolean) as string[]

// ── Trust proxy (necesario detrás de nginx) ────────────────────────────────────
app.set('trust proxy', isProd ? 1 : false)

// ════════════════════════════════════════════════════
//  SEGURIDAD — Headers HTTP vía Helmet
// ════════════════════════════════════════════════════
app.use(helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc:     ["'self'"],
      scriptSrc:      ["'self'"],
      styleSrc:       ["'self'", 'https://fonts.googleapis.com'],
      fontSrc:        ["'self'", 'https://fonts.gstatic.com'],
      imgSrc:         ["'self'", 'data:', 'https:', 'http:'],
      connectSrc:     ["'self'"],
      frameSrc:       ["'none'"],
      objectSrc:      ["'none'"],
      upgradeInsecureRequests: isProd ? [] : null,
    },
  },
  // HTTP Strict Transport Security (solo producción)
  hsts: isProd ? { maxAge: 31_536_000, includeSubDomains: true, preload: true } : false,
  // Prevenir clickjacking
  frameguard: { action: 'deny' },
  // No revelar X-Powered-By
  hidePoweredBy: true,
  // Prevenir MIME sniffing
  noSniff: true,
  // Referrer Policy
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  // Permitir imágenes cross-origin (Cloudinary)
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginEmbedderPolicy: false,
}))

// ════════════════════════════════════════════════════
//  CORS
// ════════════════════════════════════════════════════
app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (curl, Postman en dev, mobile apps)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      console.warn(`[CORS] Blocked origin: ${origin}`)
      callback(new Error(`Origin ${origin} not allowed by CORS`))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-RateLimit-Limit', 'X-RateLimit-Remaining'],
  maxAge: 86_400, // Pre-flight cache: 24 horas
}))

// ════════════════════════════════════════════════════
//  RATE LIMITING global (todas las rutas)
// ════════════════════════════════════════════════════
app.use(generalLimiter)

// ════════════════════════════════════════════════════
//  BODY PARSING con límites de tamaño
// ════════════════════════════════════════════════════
app.use(express.json({ limit: BODY_LIMITS.json }))
app.use(express.urlencoded({ extended: true, limit: BODY_LIMITS.json }))

// ════════════════════════════════════════════════════
//  MIDDLEWARE DE SEGURIDAD ADICIONAL
// ════════════════════════════════════════════════════
app.use(blockMaliciousUA)
app.use(preventParamPollution)
app.use(sanitizeInput)
if (!isProd) app.use(securityLogger) // Log sospechosos en dev

// ── Archivos estáticos ─────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  dotfiles:   'deny',
  maxAge:     '7d',
  etag:       true,
}))

// ════════════════════════════════════════════════════
//  ROUTES
// ════════════════════════════════════════════════════

// Health check (sin rate limit)
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV, timestamp: new Date().toISOString() })
})

// Auth — rate limit estricto
app.use('/api/auth',             authLimiter,          authRoutes)
app.use('/api/auth/reset',       passwordResetLimiter, authRoutes)

// Públicas — rate limit normal
app.use('/api/tracking',         trackingRoutes)
app.use('/api/products',         productRoutes)
app.use('/api/categories',       categoryRoutes)
app.use('/api/sellers',          sellerRoutes)

// Contacto — rate limit por hora
app.use('/api/contact',          contactLimiter, contactRoutes)

// Upload — rate limit de uploads
app.use('/api/upload',           uploadLimiter, uploadRoutes)

// Admin — rate limit admin
app.use('/api/admin',            adminLimiter, adminRoutes)
app.use('/api/orders',           adminLimiter, orderRoutes)
app.use('/api/superadmin',       adminLimiter, superAdminRoutes)

// Shipping
app.use('/api/shipping',         shippingRoutes)

// ════════════════════════════════════════════════════
//  ERROR HANDLING
// ════════════════════════════════════════════════════
app.use(notFound)
app.use(errorHandler)

// ════════════════════════════════════════════════════
//  APPLY MISSING SCHEMA COLUMNS (idempotent on startup)
// ════════════════════════════════════════════════════
import { PrismaClient as _PC } from '@prisma/client'
const _prismaInit = new _PC()

const _schemaMigrations = [
  // orders — shipping, payment, and tracking columns added to schema after initial migration
  'ALTER TABLE "orders" ADD COLUMN "shippingCarrier"    TEXT',
  'ALTER TABLE "orders" ADD COLUMN "shippingService"    TEXT',
  'ALTER TABLE "orders" ADD COLUMN "shippingCost"       REAL',
  'ALTER TABLE "orders" ADD COLUMN "shippingPostalCode" TEXT',
  'ALTER TABLE "orders" ADD COLUMN "shippingAddress"    TEXT',
  'ALTER TABLE "orders" ADD COLUMN "shippingCity"       TEXT',
  'ALTER TABLE "orders" ADD COLUMN "shippingProvince"   TEXT',
  'ALTER TABLE "orders" ADD COLUMN "customerName"       TEXT',
  'ALTER TABLE "orders" ADD COLUMN "customerEmail"      TEXT',
  'ALTER TABLE "orders" ADD COLUMN "customerPhone"      TEXT',
  'ALTER TABLE "orders" ADD COLUMN "paymentMethod"      TEXT',
  'ALTER TABLE "orders" ADD COLUMN "comprovanteUrl"     TEXT',
  'ALTER TABLE "orders" ADD COLUMN "trackingCode"       TEXT',
  // sellers — cryptoAlias added to schema without a migration
  'ALTER TABLE "sellers" ADD COLUMN "cryptoAlias" TEXT NOT NULL DEFAULT \'\'',
]

;(async () => {
  for (const sql of _schemaMigrations) {
    try {
      await _prismaInit.$executeRawUnsafe(sql)
    } catch (e: any) {
      if (!e.message?.includes('duplicate column name')) {
        console.warn('[schema-patch]', sql.slice(0, 60), '—', e.message)
      }
    }
  }
  await _prismaInit.$disconnect()
  console.log('✅  Schema patches applied')
})()

// ════════════════════════════════════════════════════
//  INICIAR SERVIDOR
// ════════════════════════════════════════════════════
const server = app.listen(PORT, () => {
  console.log(`🚀  Server running on http://localhost:${PORT}`)
  console.log(`🔒  Security: Helmet ✅ | CORS ✅ | Rate Limiting ✅ | Sanitization ✅`)
  console.log(`🌍  Environment: ${process.env.NODE_ENV ?? 'development'}`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received — closing server gracefully...')
  server.close(() => { process.exit(0) })
})
process.on('SIGINT', () => {
  server.close(() => { process.exit(0) })
})

export default app
