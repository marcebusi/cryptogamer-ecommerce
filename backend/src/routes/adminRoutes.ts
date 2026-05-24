import { Router } from 'express'
import { authenticate, requireAdmin } from '../middleware/auth'
import {
  createProduct, updateProduct, deleteProduct, listProducts,
} from '../controllers/adminProductController'
import {
  createCategory, updateCategory, deleteCategory,
} from '../controllers/categoryController'
import { getOrders, updateOrderStatus, updateTrackingCode } from '../controllers/adminOrderController'
import {
  createSeller, updateSeller, deleteSeller, getSellerOrders,
} from '../controllers/sellerController'
import { getContactMessages } from '../controllers/contactController'
import { getAnalytics } from '../controllers/analyticsController'
import { getUsers, updateUserRole, deleteUser } from '../controllers/adminUserController'

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
router.get('/orders',                    getOrders)
router.patch('/orders/:id/status',       updateOrderStatus)
router.patch('/orders/:id/trackingCode', updateTrackingCode)

/* ── Sellers ──────────────────────────────────────── */
router.post('/sellers',              createSeller)
router.put('/sellers/:id',           updateSeller)
router.delete('/sellers/:id',        deleteSeller)
router.get('/sellers/:id/orders',    getSellerOrders)

/* ── Contact Messages ─────────────────────────────── */
router.get('/contact-messages',   getContactMessages)

/* ── Analytics ────────────────────────────────────── */
router.get('/analytics',          getAnalytics)

/* ── Users ────────────────────────────────────────── */
router.get('/users',              getUsers)
router.patch('/users/:id/role',   updateUserRole)
router.delete('/users/:id',       deleteUser)

export default router
