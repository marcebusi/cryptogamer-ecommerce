import { Router } from 'express'
import { authenticate, requireAdmin } from '../middleware/auth'
import { upload, uploadComprobante, uploadImage, uploadComprobanteImage } from '../controllers/uploadController'

const router = Router()

// Admin-only: product images
router.post(
  '/image',
  authenticate,
  requireAdmin,
  upload.single('image'),
  uploadImage,
)

// Public: comprobante upload (images + PDFs, no auth needed)
router.post(
  '/comprobante',
  uploadComprobante.single('file'),
  uploadComprobanteImage,
)

export default router
