import { Router } from 'express'
import { authenticate, requireAdmin } from '../middleware/auth'
import { upload, uploadImage } from '../controllers/uploadController'

const router = Router()

router.post(
  '/image',
  authenticate,
  requireAdmin,
  upload.single('image'),
  uploadImage,
)

export default router
