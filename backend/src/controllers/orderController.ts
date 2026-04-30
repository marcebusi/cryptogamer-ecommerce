import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const getMyOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId
    if (!userId) {
      res.status(401).json({ message: 'No autenticado' })
      return
    }

    const orders = await prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' }
    })

    res.json(orders)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders' })
  }
}
