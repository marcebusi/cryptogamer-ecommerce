import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const getAnalytics = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [orders, sellers, products] = await Promise.all([
      prisma.order.findMany({
        include: {
          items: { include: { product: true } },
          seller: true,
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.seller.findMany({ orderBy: { sortOrder: 'asc' } }),
      prisma.product.findMany({ select: { id: true, name: true, image: true, price: true, category: true } }),
    ])

    // ── Summary ──────────────────────────────────────────────
    const totalRevenue   = orders.reduce((s, o) => s + o.totalAmount, 0)
    const totalOrders    = orders.length
    const avgOrderValue  = totalOrders ? totalRevenue / totalOrders : 0
    const pendingOrders  = orders.filter(o => o.status === 'PENDING').length
    const paidOrders     = orders.filter(o => o.status === 'PAID').length
    const cancelledOrders = orders.filter(o => o.status === 'CANCELLED').length

    // ── Top products ─────────────────────────────────────────
    const productSales: Record<string, { name: string; image: string; category: string; price: number; qty: number; revenue: number }> = {}
    for (const order of orders) {
      for (const item of order.items) {
        if (!productSales[item.productId]) {
          productSales[item.productId] = {
            name:     item.product.name,
            image:    item.product.image,
            category: item.product.category,
            price:    item.product.price,
            qty:      0,
            revenue:  0,
          }
        }
        productSales[item.productId].qty     += item.quantity
        productSales[item.productId].revenue += item.price * item.quantity
      }
    }
    const topProducts = Object.entries(productSales)
      .map(([id, v]) => ({ id, ...v }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 8)

    // ── Top sellers ──────────────────────────────────────────
    const sellerStats: Record<string, { name: string; avatar: string; orderCount: number; revenue: number }> = {}
    for (const seller of sellers) {
      sellerStats[seller.id] = { name: seller.name, avatar: seller.avatar, orderCount: 0, revenue: 0 }
    }
    for (const order of orders) {
      if (order.sellerId && sellerStats[order.sellerId]) {
        sellerStats[order.sellerId].orderCount += 1
        sellerStats[order.sellerId].revenue    += order.totalAmount
      }
    }
    const topSellers = Object.entries(sellerStats)
      .map(([id, v]) => ({ id, ...v }))
      .sort((a, b) => b.revenue - a.revenue)

    // ── Revenue last 30 days ─────────────────────────────────
    const now   = new Date()
    const days: { date: string; revenue: number; orders: number }[] = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      days.push({ date: key, revenue: 0, orders: 0 })
    }
    for (const order of orders) {
      const key = new Date(order.createdAt).toISOString().slice(0, 10)
      const day = days.find(d => d.date === key)
      if (day) { day.revenue += order.totalAmount; day.orders += 1 }
    }

    // ── Revenue by category ──────────────────────────────────
    const categoryRevenue: Record<string, number> = {}
    for (const order of orders) {
      for (const item of order.items) {
        const cat = item.product.category
        categoryRevenue[cat] = (categoryRevenue[cat] ?? 0) + item.price * item.quantity
      }
    }
    const revenueByCategory = Object.entries(categoryRevenue)
      .map(([category, revenue]) => ({ category, revenue }))
      .sort((a, b) => b.revenue - a.revenue)

    // ── Recent orders ────────────────────────────────────────
    const recentOrders = orders.slice(0, 10).map(o => ({
      id:          o.id,
      status:      o.status,
      totalAmount: o.totalAmount,
      createdAt:   o.createdAt,
      user:        o.user,
      seller:      o.seller ? { id: o.seller.id, name: o.seller.name } : null,
      itemCount:   o.items.reduce((s, i) => s + i.quantity, 0),
    }))

    res.json({
      summary: { totalRevenue, totalOrders, avgOrderValue, pendingOrders, paidOrders, cancelledOrders, totalSellers: sellers.length, totalProducts: products.length },
      topProducts,
      topSellers,
      revenueByDay: days,
      revenueByCategory,
      recentOrders,
    })
  } catch (err) {
    console.error('[getAnalytics]', err)
    res.status(500).json({ message: 'Error al obtener analytics' })
  }
}
