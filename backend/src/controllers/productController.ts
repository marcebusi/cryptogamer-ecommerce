import type { Request, Response, NextFunction } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getAllProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { category, search, minPrice, maxPrice } = req.query

    const products = await prisma.product.findMany({
      where: {
        ...(category && { category: { slug: String(category) } }),
        ...(search && {
          OR: [
            { name: { contains: String(search), mode: 'insensitive' } },
            { description: { contains: String(search), mode: 'insensitive' } },
          ],
        }),
        ...(minPrice || maxPrice
          ? {
              price: {
                ...(minPrice && { gte: Number(minPrice) }),
                ...(maxPrice && { lte: Number(maxPrice) }),
              },
            }
          : {}),
      },
      include: { category: true, specs: true },
      orderBy: { createdAt: 'desc' },
    })

    res.json({ success: true, data: products, count: products.length })
  } catch (err) {
    next(err)
  }
}

export async function getProductById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { category: true, specs: true },
    })

    if (!product) {
      res.status(404).json({ success: false, error: 'Product not found' })
      return
    }

    res.json({ success: true, data: product })
  } catch (err) {
    next(err)
  }
}

export async function createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const product = await prisma.product.create({
      data: req.body,
      include: { category: true, specs: true },
    })
    res.status(201).json({ success: true, data: product })
  } catch (err) {
    next(err)
  }
}

export async function updateProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: req.body,
      include: { category: true, specs: true },
    })
    res.json({ success: true, data: product })
  } catch (err) {
    next(err)
  }
}

export async function deleteProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await prisma.product.delete({ where: { id: req.params.id } })
    res.json({ success: true, message: 'Product deleted' })
  } catch (err) {
    next(err)
  }
}
