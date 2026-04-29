import type { Request, Response, NextFunction } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const slugify = (text: string) =>
  text.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-')

/* ── GET all categories (public) ───────────────── */
export async function getAllCategories(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { sortOrder: 'asc' },
    })
    res.json({ success: true, data: categories })
  } catch (err) {
    next(err)
  }
}

/* ── POST create category (admin) ─────────────── */
export async function createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, icon, children, sortOrder } = req.body
    if (!name?.trim()) {
      res.status(400).json({ message: 'El nombre es requerido.' })
      return
    }
    const slug = slugify(name)
    const existing = await prisma.category.findUnique({ where: { slug } })
    if (existing) {
      res.status(409).json({ message: `Ya existe una categoría con slug "${slug}".` })
      return
    }
    const category = await prisma.category.create({
      data: {
        name:      name.trim(),
        slug,
        icon:      icon?.trim() || 'category',
        children:  JSON.stringify(children ?? []),
        sortOrder: sortOrder ? Number(sortOrder) : 0,
      },
    })
    res.status(201).json({ success: true, data: category })
  } catch (err) {
    next(err)
  }
}

/* ── PUT update category (admin) ──────────────── */
export async function updateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params
    const { name, icon, children, sortOrder } = req.body

    const category = await prisma.category.update({
      where: { id },
      data: {
        name:      name?.trim() ?? undefined,
        icon:      icon?.trim() ?? undefined,
        children:  children !== undefined ? JSON.stringify(children) : undefined,
        sortOrder: sortOrder !== undefined ? Number(sortOrder) : undefined,
      },
    })
    res.json({ success: true, data: category })
  } catch (err) {
    next(err)
  }
}

/* ── DELETE category (admin) ──────────────────── */
export async function deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params
    const count = await prisma.product.count({ where: { categoryId: id } })
    if (count > 0) {
      res.status(400).json({ message: `No se puede eliminar: la categoría tiene ${count} producto(s) asociado(s).` })
      return
    }
    await prisma.category.delete({ where: { id } })
    res.json({ success: true, message: 'Categoría eliminada.' })
  } catch (err) {
    next(err)
  }
}
