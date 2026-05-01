import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱  Seeding database...')

  /* ── Superadmin (Atenea Techs) ───────────────────── */
  const superEmail = 'ateneatechs@gmail.com'
  const existingSuper = await prisma.user.findUnique({ where: { email: superEmail } })
  if (!existingSuper) {
    const hashed = await bcrypt.hash('CG#Atenea2025!', 12)
    await prisma.user.create({
      data: {
        name:     'Atenea Techs',
        email:    superEmail,
        password: hashed,
        role:     'SUPERADMIN',
      },
    })
    console.log('✅  Superadmin  →  ateneatechs@gmail.com  /  CG#Atenea2025!')
  } else {
    console.log('ℹ️   Superadmin ya existe, se omite.')
  }

  /* ── Admin user (dueño de la tienda) ─────────────── */
  const adminEmail = 'admin@cryptogamer.ar'
  const existing   = await prisma.user.findUnique({ where: { email: adminEmail } })

  if (!existing) {
    const hashedPassword = await bcrypt.hash('Admin123!', 12)
    await prisma.user.create({
      data: {
        name:     'Admin Cryptogamer',
        email:    adminEmail,
        password: hashedPassword,
        role:     'ADMIN',
      },
    })
    console.log('✅  Admin creado  →  admin@cryptogamer.ar  /  Admin123!')
    console.log('⚠️   Cambiá la contraseña del admin en producción.')
  } else {
    console.log('ℹ️   Admin ya existe, se omite.')
  }

  /* ── Base categories ─────────────────────────────── */
  const cats = [
    {
      name: 'Consolas', slug: 'consoles', icon: 'sports_esports', sortOrder: 0,
      children: JSON.stringify([
        { id: 'ps5',    label: 'PlayStation 5' },
        { id: 'xbox',   label: 'Xbox Series' },
        { id: 'switch', label: 'Nintendo Switch' },
        { id: 'retro',  label: 'Retro' },
      ]),
    },
    {
      name: 'Accesorios', slug: 'accessories', icon: 'gamepad', sortOrder: 1,
      children: JSON.stringify([
        { id: 'controllers', label: 'Controles' },
        { id: 'headsets',    label: 'Headsets' },
        { id: 'charging',    label: 'Cargadores' },
        { id: 'cables',      label: 'Cables & Adaptadores' },
      ]),
    },
    {
      name: 'Juegos', slug: 'games', icon: 'playing_cards', sortOrder: 2,
      children: JSON.stringify([
        { id: 'ps5-games',    label: 'PS5' },
        { id: 'xbox-games',   label: 'Xbox' },
        { id: 'switch-games', label: 'Nintendo Switch' },
        { id: 'pc-games',     label: 'PC / Steam' },
      ]),
    },
    {
      name: 'Móviles', slug: 'mobile', icon: 'smartphone', sortOrder: 3,
      children: JSON.stringify([
        { id: 'phones',  label: 'Teléfonos' },
        { id: 'tablets', label: 'Tablets' },
        { id: 'cases',   label: 'Fundas & Protectores' },
      ]),
    },
    {
      name: 'Audio', slug: 'audio', icon: 'headphones', sortOrder: 4,
      children: JSON.stringify([
        { id: 'earbuds',   label: 'Auriculares inalámbricos' },
        { id: 'over-ear',  label: 'Over-ear' },
        { id: 'speakers',  label: 'Parlantes' },
        { id: 'mics',      label: 'Micrófonos' },
      ]),
    },
    {
      name: 'Perfumes', slug: 'perfumes', icon: 'water_drop', sortOrder: 5,
      children: JSON.stringify([
        { id: 'men',   label: 'Masculino' },
        { id: 'women', label: 'Femenino' },
        { id: 'unisex', label: 'Unisex' },
      ]),
    },
  ]

  for (const cat of cats) {
    await prisma.category.upsert({
      where:  { slug: cat.slug },
      update: { name: cat.name, icon: cat.icon, children: cat.children, sortOrder: cat.sortOrder },
      create: cat,
    })
  }
  console.log('✅  Categorías creadas/actualizadas.')

  /* ── Sample sellers (upsert by name) ────────────── */
  const sellerDefs = [
    { name: 'Lucas Ramírez',     alias: 'lucas.cg',  bank: 'Galicia',   whatsapp: '5491100000001', sortOrder: 0 },
    { name: 'Matías Gómez',      alias: 'matias.cg', bank: 'Santander', whatsapp: '5491100000002', sortOrder: 1 },
    { name: 'Sebastián Torres',  alias: 'sebas.cg',  bank: 'Brubank',   whatsapp: '5491100000003', sortOrder: 2 },
  ]
  const sellers = await Promise.all(sellerDefs.map(async s => {
    const existing = await prisma.seller.findFirst({ where: { name: s.name } })
    if (existing) return existing
    return prisma.seller.create({ data: { ...s, bio: 'Socio fundador', active: true } })
  }))

  /* ── Sample customers ────────────────────────────── */
  const customers = await Promise.all([
    prisma.user.upsert({
      where: { email: 'juan.perez@gmail.com' },
      update: {},
      create: { name: 'Juan Pérez',      email: 'juan.perez@gmail.com',   password: await bcrypt.hash('demo123', 10), role: 'CUSTOMER' },
    }),
    prisma.user.upsert({
      where: { email: 'maria.lopez@gmail.com' },
      update: {},
      create: { name: 'María López',     email: 'maria.lopez@gmail.com',  password: await bcrypt.hash('demo123', 10), role: 'CUSTOMER' },
    }),
    prisma.user.upsert({
      where: { email: 'carlos.garcia@hotmail.com' },
      update: {},
      create: { name: 'Carlos García',   email: 'carlos.garcia@hotmail.com', password: await bcrypt.hash('demo123', 10), role: 'CUSTOMER' },
    }),
    prisma.user.upsert({
      where: { email: 'ana.martinez@gmail.com' },
      update: {},
      create: { name: 'Ana Martínez',    email: 'ana.martinez@gmail.com', password: await bcrypt.hash('demo123', 10), role: 'CUSTOMER' },
    }),
  ])

  /* ── Sample orders ───────────────────────────────── */
  const sampleOrders = [
    { user: customers[0], seller: sellers[0], amount: 45000, status: 'COMPLETED', product: 'PS5 DualSense Controller',   days: 5 },
    { user: customers[1], seller: sellers[1], amount: 12500, status: 'COMPLETED', product: 'Auriculares HyperX Cloud',   days: 3 },
    { user: customers[2], seller: sellers[2], amount: 89000, status: 'PENDING',   product: 'Nintendo Switch OLED',        days: 1 },
    { user: customers[3], seller: sellers[0], amount: 23000, status: 'COMPLETED', product: 'Xbox Series S',               days: 8 },
    { user: customers[0], seller: sellers[1], amount: 7500,  status: 'CANCELLED', product: 'Gamepad Genérico PC',         days: 10 },
    { user: customers[1], seller: sellers[2], amount: 55000, status: 'PENDING',   product: 'iPhone 13 128GB',              days: 0 },
    { user: customers[2], seller: sellers[0], amount: 18000, status: 'COMPLETED', product: 'Parlante JBL Charge 5',       days: 4 },
    { user: customers[3], seller: sellers[1], amount: 32000, status: 'COMPLETED', product: 'Teclado Mecánico Redragon',   days: 6 },
  ]

  for (const o of sampleOrders) {
    const existing = await prisma.order.findFirst({ where: { userId: o.user.id, sellerId: o.seller.id, totalAmount: o.amount } })
    if (!existing) {
      const createdAt = new Date(Date.now() - o.days * 24 * 60 * 60 * 1000)

      // We need a real product or a placeholder category
      const cat = await prisma.category.findFirst()
      if (!cat) continue

      // Upsert a placeholder product for the order
      const product = await prisma.product.upsert({
        where: { slug: `demo-${o.product.toLowerCase().replace(/\s+/g, '-').slice(0,30)}` },
        update: {},
        create: {
          name: o.product,
          slug: `demo-${o.product.toLowerCase().replace(/\s+/g, '-').slice(0,30)}`,
          description: 'Producto demo',
          price: o.amount,
          image: '',
          categoryId: cat.id,
        },
      })

      await prisma.order.create({
        data: {
          userId:      o.user.id,
          sellerId:    o.seller.id,
          totalAmount: o.amount,
          status:      o.status,
          createdAt,
          updatedAt:   createdAt,
          items: { create: [{ productId: product.id, quantity: 1, price: o.amount }] },
        },
      })
    }
  }
  console.log('✅  Pedidos de prueba creados.')
  console.log('🎉  Seed completado.')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
