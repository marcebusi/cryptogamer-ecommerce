import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/* ── GET /api/admin/orders ──────────────────────── */
export const getOrders = async (_req: Request, res: Response): Promise<void> => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user:   { select: { name: true, email: true } },
        seller: { select: { name: true } },
        items:  { include: { product: { select: { id: true, name: true, image: true } } } },
      },
      orderBy: { createdAt: 'desc' }
    })
    res.json(orders)
  } catch {
    res.status(500).json({ message: 'Error fetching orders' })
  }
}

/* ── PATCH /api/admin/orders/:id/trackingCode ───── */
export const updateTrackingCode = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params
  const { trackingCode } = req.body as { trackingCode: string }

  try {
    const order = await prisma.order.update({
      where: { id },
      data:  { trackingCode: trackingCode?.trim() || null },
    })
    res.json(order)
  } catch {
    res.status(500).json({ message: 'Error al guardar tracking' })
  }
}

/* ── PATCH /api/admin/orders/:id/status ─────────── */
export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  const { id }     = req.params
  const { status } = req.body as { status: string }

  const VALID = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'COMPLETED', 'CANCELLED']
  if (!VALID.includes(status)) {
    res.status(400).json({ message: `Estado inválido. Válidos: ${VALID.join(', ')}` })
    return
  }

  try {
    const order = await prisma.order.update({
      where: { id },
      data:  { status },
    })
    res.json(order)
  } catch {
    res.status(500).json({ message: 'Error al actualizar estado' })
  }
}

/* ── PATCH /api/orders/track/:orderNumber/comprobante (public) ── */
export const uploadComprobantePublic = async (req: Request, res: Response): Promise<void> => {
  const { orderNumber } = req.params
  const { comprovanteUrl } = req.body as { comprovanteUrl: string }
  const suffix = orderNumber.replace(/^CG-/i, '').toLowerCase()

  if (!suffix || suffix.length !== 6) {
    res.status(400).json({ message: 'Número de orden inválido' })
    return
  }
  if (!comprovanteUrl) {
    res.status(400).json({ message: 'comprovanteUrl requerido' })
    return
  }

  try {
    const orders = await prisma.order.findMany({
      where: { id: { endsWith: suffix } },
      take: 1,
    })
    if (!orders.length) { res.status(404).json({ message: 'Pedido no encontrado' }); return }

    const order = await prisma.order.update({
      where: { id: orders[0].id },
      data:  { comprovanteUrl },
      include: { user: true, seller: true },
    })

    // Notify admin
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? process.env.SMTP_USER ?? ''
    if (ADMIN_EMAIL) {
      const orderNum  = `CG-${order.id.slice(-6).toUpperCase()}`
      const { sendEmail } = await import('../services/emailService')
      const html = `<p style="font-family:sans-serif;color:#e8eaf0;">
        <strong style="color:#39ff14;">Nuevo comprobante cargado</strong><br><br>
        Orden: <strong>${orderNum}</strong><br>
        Comprador: ${order.customerName ?? order.user.name ?? 'Cliente'} (${order.customerEmail ?? order.user.email})<br>
        <br><a href="${comprovanteUrl}" style="color:#3af4ff;">Ver comprobante →</a>
      </p>`
      sendEmail(ADMIN_EMAIL, `Comprobante cargado — Orden ${orderNum}`, html).catch(console.error)
    }

    res.json({ ok: true })
  } catch {
    res.status(500).json({ message: 'Error al guardar comprobante' })
  }
}

/* ── GET /api/orders/track/:orderNumber (public) ── */
export const trackOrder = async (req: Request, res: Response): Promise<void> => {
  const { orderNumber } = req.params          // e.g. "CG-R0M3NF"
  const suffix = orderNumber.replace(/^CG-/i, '').toLowerCase()

  if (!suffix || suffix.length !== 6) {
    res.status(400).json({ message: 'Número de orden inválido' })
    return
  }

  try {
    // Order IDs are cuid() — last 6 chars match the order number suffix
    const orders = await prisma.order.findMany({
      where: { id: { endsWith: suffix } },
      include: {
        seller: { select: { name: true, whatsapp: true, alias: true, bank: true, mpAlias: true, cryptoAlias: true } },
        items:  { include: { product: { select: { name: true, image: true, slug: true } } } },
      },
      take: 1,
    })

    if (!orders.length) {
      res.status(404).json({ message: 'Pedido no encontrado' })
      return
    }

    const o = orders[0]
    res.json({
      id:                o.id,
      orderNumber:       `CG-${o.id.slice(-6).toUpperCase()}`,
      status:            o.status,
      totalAmount:       o.totalAmount,
      createdAt:         o.createdAt,
      paymentMethod:     o.paymentMethod,
      comprovanteUrl:    o.comprovanteUrl,
      trackingCode:      o.trackingCode,
      shippingCarrier:   o.shippingCarrier,
      shippingService:   o.shippingService,
      shippingCost:      o.shippingCost,
      shippingAddress:   o.shippingAddress,
      shippingCity:      o.shippingCity,
      shippingProvince:  o.shippingProvince,
      shippingPostalCode:o.shippingPostalCode,
      customerName:      o.customerName,
      customerEmail:     o.customerEmail,
      seller:            o.seller,
      items:             o.items,
    })
  } catch {
    res.status(500).json({ message: 'Error al buscar pedido' })
  }
}
