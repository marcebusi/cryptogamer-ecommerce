import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import productRoutes  from './routes/productRoutes'
import categoryRoutes from './routes/categoryRoutes'
import authRoutes     from './routes/authRoutes'
import adminRoutes    from './routes/adminRoutes'
import uploadRoutes   from './routes/uploadRoutes'
import { errorHandler, notFound } from './middleware/errorHandler'

dotenv.config()

const app  = express()
const PORT = process.env.PORT ?? 3001

const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter(Boolean) as string[]

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.some(o => origin.startsWith(o))) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

/* ── Static uploads ──────────────────────────────── */
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

/* ── Routes ──────────────────────────────────────── */
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api/auth',       authRoutes)
app.use('/api/products',   productRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/admin',      adminRoutes)
app.use('/api/upload',     uploadRoutes)

/* ── Error handling ──────────────────────────────── */
app.use(notFound)
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`🚀  Server running on http://localhost:${PORT}`)
})

export default app
