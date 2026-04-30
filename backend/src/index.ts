import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import productRoutes  from './routes/productRoutes'
import categoryRoutes from './routes/categoryRoutes'
import authRoutes     from './routes/authRoutes'
import adminRoutes    from './routes/adminRoutes'
import uploadRoutes   from './routes/uploadRoutes'
import contactRoutes  from './routes/contactRoutes'
import orderRoutes    from './routes/orderRoutes'
import sellerRoutes   from './routes/sellerRoutes'
import { errorHandler, notFound } from './middleware/errorHandler'

dotenv.config()

const app  = express()
const PORT = process.env.PORT ?? 3001

const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter(Boolean) as string[]

app.use(helmet())
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" })) // Allow loading images from same origin

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Rate limiting para /api/auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // 20 intentos por IP
  message: { message: 'Demasiados intentos de inicio de sesión. Por favor, intenta de nuevo después de 15 minutos.' }
})

/* ── Static uploads ──────────────────────────────── */
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

/* ── Routes ──────────────────────────────────────── */
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api/auth',       authLimiter, authRoutes)
app.use('/api/products',   productRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/admin',      adminRoutes)
app.use('/api/upload',     uploadRoutes)
app.use('/api/contact',    contactRoutes)
app.use('/api/orders',     orderRoutes)
app.use('/api/sellers',    sellerRoutes)

/* ── Error handling ──────────────────────────────── */
app.use(notFound)
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`🚀  Server running on http://localhost:${PORT}`)
})

export default app
