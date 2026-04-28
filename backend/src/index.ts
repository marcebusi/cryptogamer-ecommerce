import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import productRoutes from './routes/productRoutes'
import categoryRoutes from './routes/categoryRoutes'
import { errorHandler, notFound } from './middleware/errorHandler'

dotenv.config()

const app = express()
const PORT = process.env.PORT ?? 3001

/* ── Middleware ──────────────────────────────────── */
app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

/* ── Routes ──────────────────────────────────────── */
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api/products', productRoutes)
app.use('/api/categories', categoryRoutes)

/* ── Error handling ──────────────────────────────── */
app.use(notFound)
app.use(errorHandler)

/* ── Server ──────────────────────────────────────── */
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})

export default app
