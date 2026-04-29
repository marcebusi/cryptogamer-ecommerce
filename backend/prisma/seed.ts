import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱  Seeding database...')

  /* ── Admin user ──────────────────────────────────── */
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
  console.log('🎉  Seed completado.')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
