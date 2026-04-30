import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email    = 'admin@cryptogamers.com'
  const password = 'Admin1234!'
  const hash     = await bcrypt.hash(password, 12)

  const admin = await prisma.user.upsert({
    where:  { email },
    update: { role: 'ADMIN', password: hash },
    create: {
      email,
      name:     'Administrador',
      password: hash,
      role:     'ADMIN',
    },
  })

  console.log('✅  Admin creado/actualizado:')
  console.log(`    Email   : ${admin.email}`)
  console.log(`    Password: ${password}`)
  console.log(`    Role    : ${admin.role}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
