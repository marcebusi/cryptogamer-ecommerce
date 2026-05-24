import { Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth'

const prisma = new PrismaClient()

/* ── GET /api/admin/users ─────────────────────────── */
export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    res.json(users)
  } catch (err) {
    console.error('[getUsers]', err)
    res.status(500).json({ message: 'Error interno.' })
  }
}

/* ── PATCH /api/admin/users/:id/role ──────────────── */
export const updateUserRole = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { role } = req.body

    const ALLOWED_ROLES = ['CUSTOMER', 'ADMIN']
    if (!ALLOWED_ROLES.includes(role)) {
      res.status(400).json({ message: 'Rol inválido. Valores permitidos: CUSTOMER, ADMIN.' })
      return
    }

    // No puede cambiarse el rol a sí mismo
    if (id === req.userId) {
      res.status(400).json({ message: 'No podés cambiar tu propio rol.' })
      return
    }

    const target = await prisma.user.findUnique({ where: { id } })
    if (!target) {
      res.status(404).json({ message: 'Usuario no encontrado.' })
      return
    }

    // No puede modificar a un SUPERADMIN
    if (target.role === 'SUPERADMIN') {
      res.status(403).json({ message: 'No podés modificar un superadministrador.' })
      return
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    })
    res.json(updated)
  } catch (err) {
    console.error('[updateUserRole]', err)
    res.status(500).json({ message: 'Error interno.' })
  }
}

/* ── DELETE /api/admin/users/:id ──────────────────── */
export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    // No puede borrarse a sí mismo
    if (id === req.userId) {
      res.status(400).json({ message: 'No podés eliminar tu propia cuenta.' })
      return
    }

    const target = await prisma.user.findUnique({ where: { id } })
    if (!target) {
      res.status(404).json({ message: 'Usuario no encontrado.' })
      return
    }

    // No puede borrar a un SUPERADMIN
    if (target.role === 'SUPERADMIN') {
      res.status(403).json({ message: 'No podés eliminar un superadministrador.' })
      return
    }

    await prisma.user.delete({ where: { id } })
    res.json({ message: 'Usuario eliminado correctamente.' })
  } catch (err) {
    console.error('[deleteUser]', err)
    res.status(500).json({ message: 'Error interno.' })
  }
}
