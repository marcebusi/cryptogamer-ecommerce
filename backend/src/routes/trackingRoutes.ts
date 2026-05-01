import { Router } from 'express'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

router.post('/event', async (req, res) => {
  try {
    const { type, sellerId } = req.body
    if (!type) { res.status(400).json({ ok: false }); return }
    await prisma.analyticsEvent.create({ data: { type, sellerId: sellerId || null } })
    res.json({ ok: true })
  } catch {
    res.json({ ok: false })
  }
})

export default router
