import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import { createOrder, handleWebhook, getUserOrders } from '../controllers/mpOrderController'
import express from 'express'

const router = Router()

// Webhook must receive raw body for signature verification
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook)

// Authenticated routes
router.post('/',  authenticate, createOrder)
router.get('/me', authenticate, getUserOrders)

export default router
