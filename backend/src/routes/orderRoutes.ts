import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import { createOrder, handleWebhook, getUserOrders, updateComprobante } from '../controllers/mpOrderController'
import { trackOrder, uploadComprobantePublic } from '../controllers/adminOrderController'
import express from 'express'

const router = Router()

// Webhook must receive raw body for signature verification
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook)

// Public — no auth needed
router.get('/track/:orderNumber',               trackOrder)
router.patch('/track/:orderNumber/comprobante', uploadComprobantePublic)

// Authenticated routes
router.post('/',                    authenticate, createOrder)
router.get('/me',                   authenticate, getUserOrders)
router.patch('/:id/comprobante',    authenticate, updateComprobante)

export default router
