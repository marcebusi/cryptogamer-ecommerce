import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const getAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { from, to } = req.query

    const now      = new Date()
    const toDate   = to   ? new Date(`${to}T23:59:59`)   : now
    const fromDate = from ? new Date(`${from}T00:00:00`) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const [orders, sellers, products] = await Promise.all([
      prisma.order.findMany({
        where: { createdAt: { gte: fromDate, lte: toDate } },
        include: {
          items: { include: { product: { include: { category: true } } } },
          seller: true,
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.seller.findMany({ orderBy: { sortOrder: 'asc' } }),
      prisma.product.findMany({ select: { id: true } }),
    ])

    // ── Summary ──────────────────────────────────────────────
    const totalRevenue    = orders.reduce((s, o) => s + o.totalAmount, 0)
    const totalOrders     = orders.length
    const avgOrderValue   = totalOrders ? totalRevenue / totalOrders : 0
    const pendingOrders   = orders.filter(o => o.status === 'PENDING').length
    const paidOrders      = orders.filter(o => o.status === 'PAID').length
    const cancelledOrders = orders.filter(o => o.status === 'CANCELLED').length

    // ── Previous period ──────────────────────────────────────
    const duration = toDate.getTime() - fromDate.getTime()
    const prevTo   = new Date(fromDate.getTime() - 1000)
    const prevFrom = new Date(prevTo.getTime() - duration)
    const prevOrders = await prisma.order.findMany({
      where: { createdAt: { gte: prevFrom, lte: prevTo } },
      select: { totalAmount: true, status: true },
    })
    const previousPeriod = {
      totalRevenue:    prevOrders.reduce((s, o) => s + o.totalAmount, 0),
      totalOrders:     prevOrders.length,
      paidOrders:      prevOrders.filter(o => o.status === 'PAID').length,
      cancelledOrders: prevOrders.filter(o => o.status === 'CANCELLED').length,
    }

    // ── Top products ─────────────────────────────────────────
    const productSales: Record<string, { name:string; image:string; category:string; price:number; qty:number; revenue:number }> = {}
    for (const order of orders) {
      for (const item of order.items) {
        if (!productSales[item.productId]) {
          productSales[item.productId] = {
            name:     item.product.name,
            image:    item.product.image,
            category: item.product.subcategory ?? item.product.category?.name ?? 'Sin categoría',
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
    const sellerStats: Record<string, { name:string; avatar:string; orderCount:number; revenue:number }> = {}
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

    // ── Revenue by day (dynamic range) ──────────────────────
    const days: { date:string; revenue:number; orders:number }[] = []
    const cur = new Date(fromDate)
    cur.setHours(0, 0, 0, 0)
    const endD = new Date(toDate)
    endD.setHours(23, 59, 59, 999)
    while (cur <= endD) {
      days.push({ date: cur.toISOString().slice(0, 10), revenue: 0, orders: 0 })
      cur.setDate(cur.getDate() + 1)
    }
    for (const order of orders) {
      const key = new Date(order.createdAt).toISOString().slice(0, 10)
      const day = days.find(d => d.date === key)
      if (day) { day.revenue += order.totalAmount; day.orders += 1 }
    }

    // ── Revenue by subcategory ───────────────────────────────
    const categoryRevenue: Record<string, number> = {}
    for (const order of orders) {
      for (const item of order.items) {
        const cat = item.product.subcategory ?? item.product.category?.name ?? 'Sin categoría'
        categoryRevenue[cat] = (categoryRevenue[cat] ?? 0) + item.price * item.quantity
      }
    }
    const revenueByCategory = Object.entries(categoryRevenue)
      .map(([category, revenue]) => ({ category, revenue }))
      .sort((a, b) => b.revenue - a.revenue)

    // ── Heatmap (day × time block) ───────────────────────────
    const heatmapMap: Record<string, number> = {}
    for (const order of orders) {
      const d     = new Date(order.createdAt)
      const day   = (d.getDay() + 6) % 7          // Mon=0 … Sun=6
      const block = Math.floor(d.getHours() / 4)  // 0-5
      const key   = `${day}_${block}`
      heatmapMap[key] = (heatmapMap[key] ?? 0) + 1
    }
    const heatmap: { day:number; block:number; count:number }[] = []
    for (let day = 0; day < 7; day++) {
      for (let block = 0; block < 6; block++) {
        heatmap.push({ day, block, count: heatmapMap[`${day}_${block}`] ?? 0 })
      }
    }

    // ── Status over time ─────────────────────────────────────
    const statusOverTime = days.map(day => {
      const dOrders = orders.filter(o => new Date(o.createdAt).toISOString().slice(0, 10) === day.date)
      return {
        date:      day.date,
        PAID:      dOrders.filter(o => o.status === 'PAID').length,
        PENDING:   dOrders.filter(o => o.status === 'PENDING').length,
        SHIPPED:   dOrders.filter(o => o.status === 'SHIPPED').length,
        DELIVERED: dOrders.filter(o => o.status === 'DELIVERED').length,
        CANCELLED: dOrders.filter(o => o.status === 'CANCELLED').length,
      }
    })

    // ── Dead inventory ───────────────────────────────────────
    const allProductsFull = await prisma.product.findMany({ include: { category: true } })
    const soldIds = new Set(Object.keys(productSales))
    const deadInventory = allProductsFull
      .filter(p => !soldIds.has(p.id))
      .map(p => ({
        id:       p.id,
        name:     p.name,
        image:    p.image,
        price:    p.price,
        category: p.subcategory ?? p.category?.name ?? 'Sin categoría',
      }))

    // ── High value products ──────────────────────────────────
    const highValueProducts = Object.entries(productSales)
      .map(([id, v]) => ({ id, ...v, revenuePerUnit: v.qty > 0 ? v.revenue / v.qty : 0 }))
      .sort((a, b) => b.revenuePerUnit - a.revenuePerUnit)
      .slice(0, 6)

    // ── Category by orders ───────────────────────────────────
    const catOrdersMap: Record<string, { orders:number; revenue:number }> = {}
    for (const order of orders) {
      for (const item of order.items) {
        const cat = item.product.subcategory ?? item.product.category?.name ?? 'Sin categoría'
        if (!catOrdersMap[cat]) catOrdersMap[cat] = { orders: 0, revenue: 0 }
        catOrdersMap[cat].orders  += item.quantity
        catOrdersMap[cat].revenue += item.price * item.quantity
      }
    }
    const categoryByOrders = Object.entries(catOrdersMap)
      .map(([category, v]) => ({ category, ...v }))
      .sort((a, b) => b.orders - a.orders)

    // ── Category → subcategory hierarchy ─────────────────────
    type CatAccum = { orders:number; revenue:number; sub:Record<string,{orders:number;revenue:number}> }
    const catSubcatNested: Record<string, CatAccum> = {}
    for (const order of orders) {
      for (const item of order.items) {
        const cat    = item.product.category?.name ?? 'Sin categoría'
        const subcat = item.product.subcategory
        if (!catSubcatNested[cat]) catSubcatNested[cat] = { orders:0, revenue:0, sub:{} }
        catSubcatNested[cat].orders  += item.quantity
        catSubcatNested[cat].revenue += item.price * item.quantity
        if (subcat && subcat !== cat) {
          if (!catSubcatNested[cat].sub[subcat]) catSubcatNested[cat].sub[subcat] = { orders:0, revenue:0 }
          catSubcatNested[cat].sub[subcat].orders  += item.quantity
          catSubcatNested[cat].sub[subcat].revenue += item.price * item.quantity
        }
      }
    }
    const categorySubcatMap = Object.entries(catSubcatNested)
      .map(([category, v]) => ({
        category,
        orders:   v.orders,
        revenue:  v.revenue,
        subcategories: Object.entries(v.sub)
          .map(([name, c]) => ({ name, ...c }))
          .sort((a, b) => b.orders - a.orders),
      }))
      .sort((a, b) => b.orders - a.orders)

    // ── WA contacts + avg ticket by seller ───────────────────
    const waEventsBySellerArr = await (async () => {
      try {
        const events = await prisma.analyticsEvent.findMany({
          where: { type: 'wa_click', createdAt: { gte: fromDate, lte: toDate } },
          select: { sellerId: true },
        })
        const map: Record<string, number> = {}
        for (const e of events) if (e.sellerId) map[e.sellerId] = (map[e.sellerId] ?? 0) + 1
        return map
      } catch {
        return {} as Record<string, number>
      }
    })()

    const avgTicketBySeller = Object.entries(sellerStats)
      .map(([id, v]) => ({
        id, name: v.name, avatar: v.avatar,
        orderCount: v.orderCount, revenue: v.revenue,
        avgTicket:  v.orderCount ? v.revenue / v.orderCount : 0,
        waContacts: waEventsBySellerArr[id] ?? 0,
      }))
      .filter(s => s.orderCount > 0)
      .sort((a, b) => b.avgTicket - a.avgTicket)

    const waContactsTotal  = Object.values(waEventsBySellerArr).reduce((s, n) => s + n, 0)
    const cancellationRate = totalOrders > 0 ? (cancelledOrders / totalOrders) * 100 : 0

    // ── Recent orders (50 for pagination) ───────────────────
    const recentOrders = orders.slice(0, 50).map(o => ({
      id:          o.id,
      status:      o.status,
      totalAmount: o.totalAmount,
      createdAt:   o.createdAt,
      user:        o.user,
      seller:      o.seller ? { id: o.seller.id, name: o.seller.name } : null,
      itemCount:   o.items.reduce((s, i) => s + i.quantity, 0),
    }))

    res.json({
      summary: {
        totalRevenue, totalOrders, avgOrderValue,
        pendingOrders, paidOrders, cancelledOrders,
        totalSellers: sellers.length, totalProducts: products.length,
      },
      topProducts,
      topSellers,
      revenueByDay:      days,
      revenueByCategory,
      recentOrders,
      previousPeriod,
      heatmap,
      statusOverTime,
      deadInventory,
      highValueProducts,
      categoryByOrders,
      categorySubcatMap,
      avgTicketBySeller,
      cancellationRate,
      waContactsTotal,
    })
  } catch (err) {
    console.error('[getAnalytics]', err)
    res.status(500).json({ message: 'Error al obtener analytics' })
  }
}
