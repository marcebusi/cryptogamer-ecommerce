/**
 * Seed: fake orders + buyers for analytics demo
 * Run: npx ts-node prisma/seedOrders.ts
 */
import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// ── Real IDs from DB ─────────────────────────────────────
const SELLERS = [
  'cmom3kcwc0000r40kpcfixi6e', // Marcelo Busignani
  'cmom3ljm70001r40koiwf96be', // Agustin Elisey
]

const PRODUCTS = [
  { id: 'cmojcdfag0001jy7xui01fz7l', price: 700 },
  { id: 'cmojgev6e0001xcxkq30eerr9', price: 399.99 },
  { id: 'cmojgev700007xcxkkf8gik5b', price: 349 },
  { id: 'cmojgev78000bxcxkgbdyph8d', price: 69.99 },
  { id: 'cmojgev7d000dxcxkw1n82vnr', price: 99.99 },
  { id: 'cmojgev7i000fxcxkf1kp5xg7', price: 79 },
  { id: 'cmojgev7m000hxcxkghbwj6nj', price: 189 },
  { id: 'cmojgev7r000jxcxk2d5iocz0', price: 89 },
  { id: 'cmojgev7w000lxcxksjdzwlv3', price: 69.99 },
  { id: 'cmojgev81000nxcxkk2kqjzxv', price: 59.99 },
  { id: 'cmojgev86000pxcxkq1cc40ih', price: 64.99 },
  { id: 'cmojgev8a000rxcxkro5a4ahm', price: 299 },
  { id: 'cmojgev8f000txcxkcgl6kzng', price: 249 },
  { id: 'cmojgev8j000vxcxkz0ny8tkz', price: 100 },
  { id: 'cmojgev8o000xxcxks893k7f3', price: 89 },
  { id: 'cmojgev8s000zxcxklic4dszd', price: 65 },
]

// ── Weighted picks: some products sell more than others ──
const WEIGHTS = [3, 8, 5, 12, 7, 6, 4, 9, 10, 8, 7, 5, 4, 6, 4, 5]

function weightedPick() {
  const total = WEIGHTS.reduce((a, b) => a + b, 0)
  let r = Math.random() * total
  for (let i = 0; i < PRODUCTS.length; i++) {
    r -= WEIGHTS[i]
    if (r <= 0) return PRODUCTS[i]
  }
  return PRODUCTS[0]
}

function rnd(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function daysAgo(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(rnd(8, 23), rnd(0, 59), rnd(0, 59))
  return d
}

const STATUSES = ['PAID', 'PAID', 'PAID', 'PAID', 'PAID', 'PENDING', 'PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED']

const BUYERS = [
  { name: 'Lucas Fernández',   email: 'lucas.fernandez@gmail.com' },
  { name: 'Valentina Rojas',   email: 'valentina.rojas@gmail.com' },
  { name: 'Mateo García',      email: 'mateo.garcia@hotmail.com' },
  { name: 'Sofía Martínez',    email: 'sofia.martinez@gmail.com' },
  { name: 'Tomás López',       email: 'tomas.lopez@outlook.com' },
  { name: 'Camila Sánchez',    email: 'camila.sanchez@gmail.com' },
  { name: 'Nicolás Pérez',     email: 'nicolas.perez@yahoo.com' },
  { name: 'Isabella Torres',   email: 'isabella.torres@gmail.com' },
  { name: 'Sebastián Díaz',    email: 'sebastian.diaz@gmail.com' },
  { name: 'Martina Ruiz',      email: 'martina.ruiz@hotmail.com' },
]

async function main() {
  console.log('🌱 Seeding fake orders…')

  const hash = await bcrypt.hash('password123', 10)

  // Create buyers if they don't exist
  const userIds: string[] = []
  for (const b of BUYERS) {
    const user = await prisma.user.upsert({
      where: { email: b.email },
      update: {},
      create: { name: b.name, email: b.email, password: hash, role: 'CUSTOMER' },
    })
    userIds.push(user.id)
  }
  console.log(`✅ ${userIds.length} buyers ready`)

  // Delete old seeded orders (optional: comment out to keep)
  // await prisma.order.deleteMany({ where: { user: { role: 'CUSTOMER' } } })

  let orderCount = 0

  // ── Spread 80 orders over the last 30 days ──────────────
  // More orders on recent days (simulate growth)
  const orderDays = [
    ...Array(5).fill(0),  // today: 5 orders
    ...Array(4).fill(1),
    ...Array(3).fill(2),
    ...Array(4).fill(3),
    ...Array(3).fill(4),
    ...Array(2).fill(5),
    ...Array(3).fill(6),
    ...Array(2).fill(7),
    ...Array(3).fill(8),
    ...Array(2).fill(9),
    ...Array(3).fill(10),
    ...Array(2).fill(11),
    ...Array(2).fill(12),
    ...Array(2).fill(13),
    ...Array(1).fill(14),
    ...Array(2).fill(15),
    ...Array(1).fill(16),
    ...Array(2).fill(17),
    ...Array(1).fill(18),
    ...Array(2).fill(19),
    ...Array(1).fill(20),
    ...Array(2).fill(21),
    ...Array(1).fill(22),
    ...Array(1).fill(23),
    ...Array(2).fill(24),
    ...Array(1).fill(25),
    ...Array(1).fill(26),
    ...Array(2).fill(27),
    ...Array(1).fill(28),
    ...Array(1).fill(29),
  ]

  for (const daysBack of orderDays) {
    const userId   = userIds[rnd(0, userIds.length - 1)]
    const sellerId = SELLERS[rnd(0, SELLERS.length - 1)]
    const status   = STATUSES[rnd(0, STATUSES.length - 1)]
    const itemCount = rnd(1, 3)
    const createdAt = daysAgo(daysBack)

    const items: { productId: string; quantity: number; price: number }[] = []
    for (let i = 0; i < itemCount; i++) {
      const p = weightedPick()
      items.push({ productId: p.id, quantity: rnd(1, 2), price: p.price })
    }
    const total = items.reduce((s, i) => s + i.price * i.quantity, 0)

    await prisma.order.create({
      data: {
        status,
        totalAmount: Math.round(total * 100) / 100,
        createdAt,
        updatedAt: createdAt,
        userId,
        sellerId,
        items: { create: items },
      },
    })
    orderCount++
  }

  console.log(`✅ ${orderCount} orders created`)
  console.log('🎉 Done! Run the app and visit /admin/analytics')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
