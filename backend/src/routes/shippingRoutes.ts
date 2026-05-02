import { Router } from 'express'
import { getShippingRates } from '../controllers/shippingController'

const router = Router()

// POST /api/shipping/rates — public (no auth needed)
router.post('/rates', getShippingRates)

export default router
