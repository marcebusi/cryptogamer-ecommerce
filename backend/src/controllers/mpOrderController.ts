import { MercadoPagoConfig, Preference } from 'mercadopago'
import { Response } from 'express'
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'
import { AuthRequest } from '../middleware/auth'

const prisma = new PrismaClient()
const mp = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! })

/* ── POST /api/orders ─────────────────────────────── */
/* Called by frontend checkout when user clicks "Pagar" */
export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId
  if (!userId) {
    res.status(401).json({ message: 'No autenticado' })
    return
  }

  try {
    const { items } = req.body as { items: { productId: string; quantity: number }[] }
    if (!items?.length) {
      res.status(400).json({ message: 'El carrito está vacío' })
      return
    }

    // Fetch products from DB to get real prices
    const productIds = items.map(i => i.productId)
    const dbProducts = await prisma.product.findMany({ where: { id: { in: productIds } } })

    const orderItems = items.map(item => {
      const p = dbProducts.find(p => p.id === item.productId)
      if (!p) throw new Error(`Producto ${item.productId} no encontrado`)
      if (!p.inStock) throw new Error(`${p.name} está sin stock`)
      return { product: p, quantity: item.quantity, price: p.price }
    })

    const totalAmount = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0)

    // Create order in DB (PENDING until MP webhook confirms)
    const order = await prisma.order.create({
      data: {
        userId,
        totalAmount,
        status: 'PENDING',
        items: {
          create: orderItems.map(i => ({
            productId: i.product.id,
            quantity: i.quantity,
            price: i.price,
          })),
        },
      },
    })

    // Build Mercado Pago preference
    const preference = new Preference(mp)
    const mpItems = orderItems.map(i => ({
      id: i.product.id,
      title: i.product.name,
      quantity: i.quantity,
      unit_price: i.price,
      currency_id: 'ARS',
      picture_url: i.product.image,
    }))

    const pref = await preference.create({
      body: {
        items: mpItems,
        external_reference: order.id,
        back_urls: {
          success: `${process.env.FRONTEND_URL}/perfil?tab=orders&status=success`,
          failure: `${process.env.FRONTEND_URL}/perfil?tab=orders&status=failure`,
          pending: `${process.env.FRONTEND_URL}/perfil?tab=orders&status=pending`,
        },
        auto_return: 'approved',
        notification_url: `${process.env.BACKEND_URL ?? 'http://localhost:3001'}/api/orders/webhook`,
      },
    })

    res.json({ orderId: order.id, checkoutUrl: pref.init_point })
  } catch (err: any) {
    console.error(err)
    res.status(400).json({ message: err.message ?? 'Error al crear la orden' })
  }
}

/* ── GET /api/orders/me ───────────────────────────── */
export const getUserOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId
  if (!userId) { res.status(401).json({ message: 'No autenticado' }); return }

  try {
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        seller: { select: { name: true } },
        items: {
          include: {
            product: { select: { id: true, name: true, image: true, slug: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    res.json(orders)
  } catch {
    res.status(500).json({ message: 'Error al obtener pedidos' })
  }
}

/* ── POST /api/orders/webhook ─────────────────────── */
/* Mercado Pago notifies payment here */
export const handleWebhook = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const secret = process.env.MP_WEBHOOK_SECRET
    if (secret) {
      // Validate HMAC-SHA256 signature from MP
      const signature = req.headers['x-signature'] as string ?? ''
      const [tsHeader, v1Header] = signature.split(',')
      const ts = tsHeader?.split('=')[1]
      const v1 = v1Header?.split('=')[1]
      const requestId = req.headers['x-request-id'] as string ?? ''
      const dataId = req.query['data.id'] ?? req.body?.data?.id ?? ''
      const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`
      const hmac = crypto.createHmac('sha256', secret).update(manifest).digest('hex')
      if (hmac !== v1) {
        res.status(401).json({ message: 'Firma inválida' })
        return
      }
    }

    const type = req.body?.type ?? req.query.type
    if (type === 'payment') {
      const paymentId = req.body?.data?.id ?? req.query['data.id']
      if (!paymentId) { res.sendStatus(200); return }

      // Fetch payment status from MP
      const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` },
      })
      const payment = await mpRes.json() as { external_reference?: string; status?: string }

      const orderId = payment.external_reference
      const status  = payment.status // 'approved' | 'pending' | 'rejected'

      if (orderId && status === 'approved') {
        await prisma.order.update({
          where: { id: orderId },
          data:  { status: 'COMPLETED' },
        })
      } else if (orderId && status === 'rejected') {
        await prisma.order.update({
          where: { id: orderId },
          data:  { status: 'CANCELLED' },
        })
      }
    }

    res.sendStatus(200)
  } catch (err) {
    console.error('Webhook error:', err)
    res.sendStatus(200) // Always 200 to MP so it doesn't retry forever
  }
}
