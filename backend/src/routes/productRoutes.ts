import { Router } from 'express'
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController'
import { authenticate, requireAdmin } from '../middleware/auth'

const router = Router()

router.get('/', getAllProducts)
router.get('/:id', getProductById)
router.post('/', authenticate, requireAdmin, createProduct)
router.put('/:id', authenticate, requireAdmin, updateProduct)
router.delete('/:id', authenticate, requireAdmin, deleteProduct)

export default router
