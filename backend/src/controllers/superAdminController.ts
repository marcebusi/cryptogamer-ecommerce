import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

/* ── GET /api/superadmin/overview ─────────────────── */
export const getOverview = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [
      totalUsers,
      totalOrders,
      totalProducts,
      totalRevenue,
      recentOrders,
      pendingOrders,
      storeConfig,
    ] = await Promise.all([
      prisma.user.count({ where: { role: { in: ['CUSTOMER', 'ADMIN'] } } }),
      prisma.order.count(),
      prisma.product.count(),
      prisma.order.aggregate({ where: { status: 'COMPLETED' }, _sum: { totalAmount: true } }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, email: true } }, seller: { select: { name: true } } },
      }),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.storeConfig.findFirst(),
    ])

    res.json({
      stats: {
        totalUsers,
        totalOrders,
        totalProducts,
        totalRevenue: totalRevenue._sum.totalAmount ?? 0,
        pendingOrders,
      },
      recentOrders,
      storeConfig,
    })
  } catch {
    res.status(500).json({ message: 'Error al obtener overview.' })
  }
}

/* ── GET /api/superadmin/users ────────────────────── */
export const getUsers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, phone: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    })
    res.json(users)
  } catch {
    res.status(500).json({ message: 'Error al obtener usuarios.' })
  }
}

/* ── PUT /api/superadmin/users/:id/role ───────────── */
export const updateUserRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { role } = req.body
    const valid = ['CUSTOMER', 'ADMIN', 'SUPERADMIN']
    if (!valid.includes(role)) { res.status(400).json({ message: 'Rol inválido.' }); return }

    const user = await prisma.user.update({ where: { id }, data: { role } })
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role })
  } catch {
    res.status(500).json({ message: 'Error al actualizar rol.' })
  }
}

/* ── PUT /api/superadmin/users/:id/password ──────── */
export const resetUserPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { password } = req.body
    if (!password || password.length < 6) {
      res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres.' })
      return
    }
    const hashed = await bcrypt.hash(password, 12)
    await prisma.user.update({ where: { id }, data: { password: hashed } })
    res.json({ message: 'Contraseña actualizada.' })
  } catch {
    res.status(500).json({ message: 'Error al actualizar contraseña.' })
  }
}

/* ── DELETE /api/superadmin/users/:id ────────────── */
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } })
    res.json({ message: 'Usuario eliminado.' })
  } catch {
    res.status(500).json({ message: 'Error al eliminar usuario.' })
  }
}

/* ── GET/PUT /api/superadmin/store ────────────────── */
export const getStoreConfig = async (_req: Request, res: Response): Promise<void> => {
  try {
    const config = await prisma.storeConfig.findFirst()
    res.json(config)
  } catch {
    res.status(500).json({ message: 'Error al obtener config.' })
  }
}

export const updateStoreConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const { subscriptionActive, subscriptionExpiresAt, planName, notes, enabledSections } = req.body
    const existing = await prisma.storeConfig.findFirst()

    const data = {
      subscriptionActive:    subscriptionActive    ?? true,
      subscriptionExpiresAt: subscriptionExpiresAt ? new Date(subscriptionExpiresAt) : null,
      planName:              planName  ?? 'PRO',
      notes:                 notes     ?? '',
      enabledSections:       Array.isArray(enabledSections)
                               ? JSON.stringify(enabledSections)
                               : (enabledSections ?? '["orders","analytics","sellers","contact"]'),
    }

    const config = existing
      ? await prisma.storeConfig.update({ where: { id: existing.id }, data })
      : await prisma.storeConfig.create({ data })

    res.json(config)
  } catch {
    res.status(500).json({ message: 'Error al actualizar config.' })
  }
}

/* ── GET /api/superadmin/sections (public for admin) ── */
export const getEnabledSections = async (_req: Request, res: Response): Promise<void> => {
  try {
    const config = await prisma.storeConfig.findFirst({
      select: { enabledSections: true, subscriptionActive: true, subscriptionExpiresAt: true },
    })
    const raw = config?.enabledSections ?? '["orders","analytics","sellers","contact"]'
    const sections: string[] = JSON.parse(raw)
    const active = config?.subscriptionActive ?? true
    const expired = config?.subscriptionExpiresAt ? new Date(config.subscriptionExpiresAt) < new Date() : false
    res.json({ sections: active && !expired ? sections : [] })
  } catch {
    res.json({ sections: ['orders', 'analytics', 'sellers', 'contact'] })
  }
}
