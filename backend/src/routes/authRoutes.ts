import { Router } from 'express'
import {
  register, login, getMe,
  updateProfile, changePassword,
  forgotPassword, resetPassword,
} from '../controllers/authController'
import { authenticate } from '../middleware/auth'

const router = Router()

/* Public */
router.post('/register',       register)
router.post('/login',          login)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password',  resetPassword)

import { getMyOrders } from '../controllers/orderController'

/* Protected */
router.get('/me',              authenticate, getMe)
router.put('/me',              authenticate, updateProfile)
router.put('/me/password',     authenticate, changePassword)
router.get('/me/orders',       authenticate, getMyOrders)

export default router
