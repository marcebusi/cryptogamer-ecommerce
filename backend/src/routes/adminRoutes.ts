import { Router } from 'express'
import { authenticate, requireAdmin } from '../middleware/auth'
import {
  createProduct, updateProduct, deleteProduct, listProducts,
} from '../controllers/adminProductController'
import {
  createCategory, updateCategory, deleteCategory,
} from '../controllers/categoryController'
import { getOrders } from '../controllers/adminOrderController'

const router = Router()

// All admin routes require authentication + admin role
router.use(authenticate, requireAdmin)

/* ── Products ─────────────────────────────────────── */
router.get('/products',         listProducts)
router.post('/products',        createProduct)
router.put('/products/:id',     updateProduct)
router.delete('/products/:id',  deleteProduct)

/* ── Categories ───────────────────────────────────── */
router.post('/categories',        createCategory)
router.put('/categories/:id',     updateCategory)
router.delete('/categories/:id',  deleteCategory)

/* ── Orders ───────────────────────────────────────── */
router.get('/orders',             getOrders)

/* ── Contact Messages ─────────────────────────────── */
import { getContactMessages } from '../controllers/contactController'
router.get('/contact-messages',   getContactMessages)

export default router
