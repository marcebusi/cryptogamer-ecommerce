import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// ─── Imágenes de productos gaming ─────────────────────────────────────────────
const IMGS = {
  ps5:        'https://images.unsplash.com/photo-1607016284318-d1384bf3afa4?w=600&q=80',
  ps5_ctrl:   'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600&q=80',
  xbox:       'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=600&q=80',
  switch:     'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=600&q=80',
  keyboard:   'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80',
  mouse:      'https://images.unsplash.com/photo-1527814050087-3793815479db?w=600&q=80',
  headset:    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
  monitor:    'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=80',
  iphone:     'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80',
  speaker:    'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=80',
  chair:      'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600&q=80',
  gpu:        'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=600&q=80',
  perfume:    'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&q=80',
  earbuds:    'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=600&q=80',
  tablet:     'https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?w=600&q=80',
  gamepad:    'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80',
}

async function main() {
  console.log('🌱  Seeding database...')

  // ─── Superadmin ─────────────────────────────────────────────────────────────
  const superEmail = 'ateneatechs@gmail.com'
  const existingSuper = await prisma.user.findUnique({ where: { email: superEmail } })
  if (!existingSuper) {
    await prisma.user.create({
      data: { name: 'Atenea Techs', email: superEmail, password: await bcrypt.hash('CG#Atenea2025!', 12), role: 'SUPERADMIN' },
    })
  }
  console.log('✅  Superadmin  →  ateneatechs@gmail.com  /  CG#Atenea2025!')

  // ─── Admin ──────────────────────────────────────────────────────────────────
  const adminEmail = 'admin@cryptogamer.ar'
  const existing   = await prisma.user.findUnique({ where: { email: adminEmail } })
  if (!existing) {
    await prisma.user.create({
      data: { name: 'Admin Cryptogamer', email: adminEmail, password: await bcrypt.hash('Admin123!', 12), role: 'ADMIN' },
    })
  }
  console.log('✅  Admin  →  admin@cryptogamer.ar  /  Admin123!')

  // ─── Categorías ─────────────────────────────────────────────────────────────
  const catDefs = [
    { name: 'Consolas',   slug: 'consoles',    icon: 'sports_esports', sortOrder: 0, children: JSON.stringify([
        { id: 'ps5', label: 'PlayStation 5', children: [
            { id: 'ps5-standard', label: 'Standard' }, { id: 'ps5-digital', label: 'Digital Edition' }
        ]},
        { id: 'xbox',   label: 'Xbox Series', children: [{ id: 'xbox-x', label: 'Xbox Series X' }, { id: 'xbox-s', label: 'Xbox Series S' }]},
        { id: 'switch', label: 'Nintendo Switch', children: [{ id: 'switch-oled', label: 'Switch OLED' }, { id: 'switch-lite', label: 'Switch Lite' }]},
        { id: 'retro',  label: 'Retro' },
      ])},
    { name: 'Accesorios', slug: 'accessories', icon: 'gamepad',        sortOrder: 1, children: JSON.stringify([
        { id: 'controllers', label: 'Controles' }, { id: 'headsets', label: 'Headsets' },
        { id: 'charging',    label: 'Cargadores' }, { id: 'cables',  label: 'Cables' },
      ])},
    { name: 'Juegos',     slug: 'games',       icon: 'playing_cards',  sortOrder: 2, children: JSON.stringify([
        { id: 'ps5-games', label: 'PS5' }, { id: 'xbox-games', label: 'Xbox' },
        { id: 'switch-games', label: 'Nintendo' }, { id: 'pc-games', label: 'PC' },
      ])},
    { name: 'Móviles',   slug: 'mobile',      icon: 'smartphone',     sortOrder: 3, children: JSON.stringify([
        { id: 'phones', label: 'Teléfonos' }, { id: 'tablets', label: 'Tablets' },
      ])},
    { name: 'Audio',      slug: 'audio',       icon: 'headphones',     sortOrder: 4, children: JSON.stringify([
        { id: 'earbuds', label: 'Auriculares' }, { id: 'speakers', label: 'Parlantes' },
      ])},
    { name: 'Perfumes',   slug: 'perfumes',    icon: 'water_drop',     sortOrder: 5, children: JSON.stringify([
        { id: 'men', label: 'Masculino' }, { id: 'women', label: 'Femenino' },
      ])},
  ]
  const catMap: Record<string, string> = {}
  for (const c of catDefs) {
    const cat = await prisma.category.upsert({ where: { slug: c.slug }, update: c, create: c })
    catMap[c.slug] = cat.id
  }
  console.log('✅  Categorías creadas.')

  // ─── Sellers ────────────────────────────────────────────────────────────────
  const sellerDefs = [
    { name: 'Lucas Ramírez',    alias: 'lucas.cg',  bank: 'Galicia',   whatsapp: '5491100000001', sortOrder: 0 },
    { name: 'Matías Gómez',     alias: 'matias.cg', bank: 'Santander', whatsapp: '5491100000002', sortOrder: 1 },
    { name: 'Sebastián Torres', alias: 'sebas.cg',  bank: 'Brubank',   whatsapp: '5491100000003', sortOrder: 2 },
  ]
  const sellers = await Promise.all(sellerDefs.map(async s => {
    const ex = await prisma.seller.findFirst({ where: { name: s.name } })
    return ex ?? prisma.seller.create({ data: { ...s, bio: 'Socio fundador', active: true } })
  }))

  // ─── Productos con imágenes y datos completos ────────────────────────────────
  const products = [
    // Consolas
    { name: 'PlayStation 5 Standard',      slug: 'ps5-standard',        description: 'La consola más potente de Sony. 4K, 120fps, SSD ultrarrápido y haptic feedback.', price: 89000, image: IMGS.ps5,      categorySlug: 'consoles',    condition: 'new',      isFeatured: true,  isOffer: false, originalPrice: null },
    { name: 'PlayStation 5 Digital',        slug: 'ps5-digital',         description: 'Versión digital de PS5 sin lector de disco. Misma potencia a menor precio.', price: 79000, image: IMGS.ps5,      categorySlug: 'consoles',    condition: 'new',      isFeatured: true,  isOffer: true,  originalPrice: 89000 },
    { name: 'Xbox Series S',                slug: 'xbox-series-s',       description: 'La Xbox más compacta y accesible. 1440p, 120fps y Game Pass incluido.', price: 55000, image: IMGS.xbox,     categorySlug: 'consoles',    condition: 'new',      isFeatured: true,  isOffer: false, originalPrice: null },
    { name: 'Nintendo Switch OLED',         slug: 'switch-oled',         description: 'Pantalla OLED de 7", 64GB de almacenamiento y modos portátil y TV.', price: 65000, image: IMGS.switch,   categorySlug: 'consoles',    condition: 'new',      isFeatured: true,  isOffer: true,  originalPrice: 72000 },
    // Accesorios
    { name: 'DualSense PS5',                slug: 'dualsense-ps5',       description: 'Control inalámbrico con haptic feedback y gatillos adaptativos. Color negro.', price: 22000, image: IMGS.ps5_ctrl, categorySlug: 'accessories', condition: 'new',      isFeatured: true,  isOffer: false, originalPrice: null },
    { name: 'Xbox Wireless Controller',     slug: 'xbox-controller',     description: 'Control oficial Xbox con pad híbrido y botón compartir dedicado.', price: 18000, image: IMGS.gamepad,  categorySlug: 'accessories', condition: 'new',      isFeatured: false, isOffer: true,  originalPrice: 22000 },
    { name: 'Teclado Mecánico Redragon',    slug: 'teclado-redragon',    description: 'Teclado mecánico RGB con switches Red. Anti-ghosting y 104 teclas.', price: 32000, image: IMGS.keyboard, categorySlug: 'accessories', condition: 'new',      isFeatured: false, isOffer: false, originalPrice: null },
    { name: 'Mouse Logitech G502',          slug: 'mouse-g502',          description: 'Mouse gaming 25.600 DPI, 11 botones programables y peso ajustable.', price: 28000, image: IMGS.mouse,    categorySlug: 'accessories', condition: 'new',      isFeatured: true,  isOffer: true,  originalPrice: 35000 },
    // Audio
    { name: 'HyperX Cloud II',              slug: 'hyperx-cloud-ii',     description: 'Headset gaming 7.1 virtual, micrófono desmontable y drivers 53mm.', price: 35000, image: IMGS.headset,  categorySlug: 'audio',       condition: 'new',      isFeatured: true,  isOffer: false, originalPrice: null },
    { name: 'Parlante JBL Charge 5',        slug: 'jbl-charge-5',        description: 'Parlante Bluetooth resistente al agua. 20 horas de batería y carga USB.', price: 18000, image: IMGS.speaker,  categorySlug: 'audio',       condition: 'new',      isFeatured: true,  isOffer: true,  originalPrice: 24000 },
    { name: 'AirPods Pro 2',               slug: 'airpods-pro-2',       description: 'Cancelación de ruido adaptativa, audio espacial y estuche MagSafe.', price: 52000, image: IMGS.earbuds,  categorySlug: 'audio',       condition: 'new',      isFeatured: false, isOffer: false, originalPrice: null },
    // Móviles
    { name: 'iPhone 15 128GB',             slug: 'iphone-15-128',       description: 'iPhone 15 con chip A16 Bionic, cámara 48MP y Dynamic Island. Color negro.', price: 95000, image: IMGS.iphone,   categorySlug: 'mobile',      condition: 'new',      isFeatured: true,  isOffer: false, originalPrice: null },
    { name: 'iPhone 13 128GB',             slug: 'iphone-13-128',       description: 'iPhone 13 con chip A15 Bionic, sistema de cámara dual 12MP. Excelente estado.', price: 55000, image: IMGS.iphone,   categorySlug: 'mobile',      condition: 'like-new', isFeatured: true,  isOffer: true,  originalPrice: 65000 },
    { name: 'Samsung Galaxy Tab S9',        slug: 'galaxy-tab-s9',       description: 'Tablet 11", 8GB RAM, 128GB, S Pen incluido y batería 8400mAh.', price: 72000, image: IMGS.tablet,   categorySlug: 'mobile',      condition: 'new',      isFeatured: false, isOffer: false, originalPrice: null },
    // Monitor
    { name: 'Monitor LG UltraGear 27"',    slug: 'monitor-lg-27',       description: 'Monitor gaming 27" 144Hz IPS, 1ms GtG, FreeSync y G-Sync compatible.', price: 85000, image: IMGS.monitor,  categorySlug: 'accessories', condition: 'new',      isFeatured: true,  isOffer: false, originalPrice: null },
    // Perfumes
    { name: 'Creed Aventus 100ml',          slug: 'creed-aventus-100',   description: 'El perfume más icónico de Creed. Notas de bergamota, grosella negra y almizcle.', price: 48000, image: IMGS.perfume,  categorySlug: 'perfumes',    condition: 'new',      isFeatured: false, isOffer: false, originalPrice: null },
  ]

  let created = 0, updated = 0
  for (const p of products) {
    const catId = catMap[p.categorySlug]
    if (!catId) continue
    const { categorySlug, ...data } = p
    const existing = await prisma.product.findUnique({ where: { slug: p.slug } })
    if (existing) {
      await prisma.product.update({
        where: { slug: p.slug },
        data: { ...data, categoryId: catId },
      })
      updated++
    } else {
      await prisma.product.create({ data: { ...data, categoryId: catId } })
      created++
    }
  }
  console.log(`✅  Productos: ${created} creados, ${updated} actualizados (${products.length} total).`)
  console.log(`    ${products.filter(p => p.isFeatured).length} destacados, ${products.filter(p => p.isOffer).length} en oferta.`)

  // ─── Customers ──────────────────────────────────────────────────────────────
  const customers = await Promise.all([
    prisma.user.upsert({ where: { email: 'juan.perez@gmail.com' },       update: {}, create: { name: 'Juan Pérez',    email: 'juan.perez@gmail.com',        password: await bcrypt.hash('demo123', 10), role: 'CUSTOMER' } }),
    prisma.user.upsert({ where: { email: 'maria.lopez@gmail.com' },      update: {}, create: { name: 'María López',   email: 'maria.lopez@gmail.com',       password: await bcrypt.hash('demo123', 10), role: 'CUSTOMER' } }),
    prisma.user.upsert({ where: { email: 'carlos.garcia@hotmail.com' }, update: {}, create: { name: 'Carlos García',  email: 'carlos.garcia@hotmail.com',   password: await bcrypt.hash('demo123', 10), role: 'CUSTOMER' } }),
    prisma.user.upsert({ where: { email: 'ana.martinez@gmail.com' },    update: {}, create: { name: 'Ana Martínez',  email: 'ana.martinez@gmail.com',      password: await bcrypt.hash('demo123', 10), role: 'CUSTOMER' } }),
  ])

  // ─── Orders de prueba ────────────────────────────────────────────────────────
  const orderDefs = [
    { user: customers[0], seller: sellers[0], slug: 'ps5-standard',     days: 5,  status: 'COMPLETED' },
    { user: customers[1], seller: sellers[1], slug: 'hyperx-cloud-ii',  days: 3,  status: 'COMPLETED' },
    { user: customers[2], seller: sellers[2], slug: 'switch-oled',      days: 1,  status: 'PENDING'   },
    { user: customers[3], seller: sellers[0], slug: 'xbox-series-s',    days: 8,  status: 'COMPLETED' },
    { user: customers[0], seller: sellers[1], slug: 'mouse-g502',       days: 10, status: 'CANCELLED' },
    { user: customers[1], seller: sellers[2], slug: 'iphone-15-128',    days: 0,  status: 'PENDING'   },
    { user: customers[2], seller: sellers[0], slug: 'jbl-charge-5',     days: 4,  status: 'COMPLETED' },
    { user: customers[3], seller: sellers[1], slug: 'teclado-redragon', days: 6,  status: 'COMPLETED' },
  ]

  for (const o of orderDefs) {
    const existing = await prisma.order.findFirst({ where: { userId: o.user.id, sellerId: o.seller.id } })
    if (existing) continue
    const product = await prisma.product.findUnique({ where: { slug: o.slug } })
    if (!product) continue
    const createdAt = new Date(Date.now() - o.days * 86400000)
    await prisma.order.create({
      data: {
        userId: o.user.id, sellerId: o.seller.id,
        totalAmount: product.price, status: o.status,
        createdAt, updatedAt: createdAt,
        items: { create: [{ productId: product.id, quantity: 1, price: product.price }] },
      },
    })
  }
  console.log('✅  Pedidos de prueba creados.')
  console.log('🎉  Seed completado.')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
