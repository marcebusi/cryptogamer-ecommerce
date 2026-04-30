import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import { createOrder, handleWebhook } from '../controllers/mpOrderController'
import express from 'express'

const router = Router()

// Webhook must receive raw body for signature verification
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook)

// Authenticated checkout
router.post('/', authenticate, createOrder)

export default router
