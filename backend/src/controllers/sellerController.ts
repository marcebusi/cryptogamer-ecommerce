import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/sellers — public
export const getSellers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const sellers = await prisma.seller.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
    })
    res.json(sellers)
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener vendedores' })
  }
}

// GET /api/sellers/:id — public
export const getSellerById = async (req: Request, res: Response): Promise<void> => {
  try {
    const seller = await prisma.seller.findUnique({ where: { id: req.params.id } })
    if (!seller) { res.status(404).json({ message: 'Vendedor no encontrado' }); return }
    res.json(seller)
  } catch (err) {
    res.status(500).json({ message: 'Error' })
  }
}

// POST /api/admin/sellers — admin only
export const createSeller = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, bio, avatar, whatsapp, alias, bank, mpAlias, sortOrder } = req.body
    if (!name) { res.status(400).json({ message: 'El nombre es requerido' }); return }
    const seller = await prisma.seller.create({
      data: { name, bio, avatar, whatsapp, alias, bank, mpAlias, sortOrder: sortOrder ?? 0 },
    })
    res.status(201).json(seller)
  } catch (err) {
    console.error('[createSeller]', err)
    res.status(500).json({ message: 'Error al crear vendedor', detail: String(err) })
  }
}

// PUT /api/admin/sellers/:id — admin only
export const updateSeller = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, bio, avatar, whatsapp, alias, bank, mpAlias, active, sortOrder } = req.body
    const seller = await prisma.seller.update({
      where: { id: req.params.id },
      data: { name, bio, avatar, whatsapp, alias, bank, mpAlias, active, sortOrder },
    })
    res.json(seller)
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar vendedor' })
  }
}

// DELETE /api/admin/sellers/:id — admin only
export const deleteSeller = async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.seller.delete({ where: { id: req.params.id } })
    res.json({ message: 'Vendedor eliminado' })
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar vendedor' })
  }
}

// GET /api/admin/sellers/:id/orders — ventas por vendedor
export const getSellerOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const orders = await prisma.order.findMany({
      where: { sellerId: req.params.id },
      include: { user: { select: { name: true, email: true } }, items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    })
    const total = orders.reduce((s, o) => s + o.totalAmount, 0)
    res.json({ orders, total, count: orders.length })
  } catch (err) {
    res.status(500).json({ message: 'Error' })
  }
}
