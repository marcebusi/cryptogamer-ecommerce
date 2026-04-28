import type { Request, Response, NextFunction } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getAllCategories(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
    })
    res.json({ success: true, data: categories })
  } catch (err) {
    next(err)
  }
}

export async function createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const category = await prisma.category.create({ data: req.body })
    res.status(201).json({ success: true, data: category })
  } catch (err) {
    next(err)
  }
}
