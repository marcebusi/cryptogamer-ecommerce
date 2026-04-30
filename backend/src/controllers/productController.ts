import type { Request, Response, NextFunction } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getAllProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { category, search, minPrice, maxPrice, isOffer, isFeatured, limit, inStock,
            page = '1', pageSize = '24' } = req.query

    const take = limit ? Number(limit) : Number(pageSize)
    const skip = limit ? 0 : (Number(page) - 1) * take

    const where = {
      ...(category  && { category: { slug: String(category) } }),
      ...(isOffer === 'true'    && { isOffer:    true }),
      ...(isFeatured === 'true' && { isFeatured: true }),
      ...(inStock === 'true'    && { inStock:     true }),
      ...(inStock === 'false'   && { inStock:     false }),
      ...(search && {
        OR: [
          { name:        { contains: String(search) } },
          { description: { contains: String(search) } },
        ],
      }),
      ...((minPrice || maxPrice)
        ? {
            price: {
              ...(minPrice && { gte: Number(minPrice) }),
              ...(maxPrice && { lte: Number(maxPrice) }),
            },
          }
        : {}),
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true, specs: true },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        take,
        skip,
      }),
      prisma.product.count({ where }),
    ])

    res.json({
      success: true,
      data: products,
      count: products.length,
      total,
      page: Number(page),
      pageSize: take,
      totalPages: Math.ceil(total / take),
    })
  } catch (err) {
    next(err)
  }
}

export async function getProductById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Support lookup by id or slug
    const { id } = req.params
    const product = await prisma.product.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: { category: true, specs: true },
    })

    if (!product) {
      res.status(404).json({ success: false, error: 'Producto no encontrado' })
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
    res.json({ success: true, message: 'Producto eliminado' })
  } catch (err) {
    next(err)
  }
}
