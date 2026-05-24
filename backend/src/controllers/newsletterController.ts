import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/* ── POST /api/newsletter/subscribe ─────────────────── */
export const subscribe = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ message: 'Email inválido.' })
      return
    }
    await prisma.newsletterSubscriber.upsert({
      where:  { email },
      update: {},
      create: { email },
    })
    res.json({ message: 'Suscripción exitosa.' })
  } catch (err) {
    console.error('[newsletter/subscribe]', err)
    res.status(500).json({ message: 'Error interno.' })
  }
}
