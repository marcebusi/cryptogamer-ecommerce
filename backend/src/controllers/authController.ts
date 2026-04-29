import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth'

const prisma = new PrismaClient()

/* ── Helper ───────────────────────────────────────── */
const signToken = (userId: string, role: string): string =>
  jwt.sign({ userId, role }, process.env.JWT_SECRET!, { expiresIn: '7d' })

const userSelect = {
  id: true, name: true, email: true,
  role: true, phone: true, address: true, createdAt: true,
}

/* ── Register ─────────────────────────────────────── */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body

    if (!name?.trim() || !email?.trim() || !password) {
      res.status(400).json({ message: 'Nombre, email y contraseña son requeridos.' })
      return
    }
    if (password.length < 6) {
      res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres.' })
      return
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
    if (existing) {
      res.status(409).json({ message: 'Ya existe una cuenta con ese email.' })
      return
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: { name: name.trim(), email: email.toLowerCase(), password: hashedPassword },
      select: userSelect,
    })

    const token = signToken(user.id, user.role)
    res.status(201).json({ token, user })
  } catch (err) {
    console.error('[register]', err)
    res.status(500).json({ message: 'Error interno del servidor.' })
  }
}

/* ── Login ────────────────────────────────────────── */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body

    if (!email?.trim() || !password) {
      res.status(400).json({ message: 'Email y contraseña requeridos.' })
      return
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
    if (!user) {
      res.status(401).json({ message: 'Credenciales inválidas.' })
      return
    }

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      res.status(401).json({ message: 'Credenciales inválidas.' })
      return
    }

    const token = signToken(user.id, user.role)
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    })
  } catch (err) {
    console.error('[login]', err)
    res.status(500).json({ message: 'Error interno del servidor.' })
  }
}

/* ── Get me ───────────────────────────────────────── */
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: userSelect,
    })
    if (!user) { res.status(404).json({ message: 'Usuario no encontrado.' }); return }
    res.json(user)
  } catch (err) {
    console.error('[getMe]', err)
    res.status(500).json({ message: 'Error interno del servidor.' })
  }
}

/* ── Update profile ───────────────────────────────── */
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, phone, address } = req.body
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { name: name?.trim(), phone: phone?.trim() || null, address: address?.trim() || null },
      select: userSelect,
    })
    res.json(user)
  } catch (err) {
    console.error('[updateProfile]', err)
    res.status(500).json({ message: 'Error interno del servidor.' })
  }
}

/* ── Change password ──────────────────────────────── */
export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      res.status(400).json({ message: 'Ambas contraseñas son requeridas.' })
      return
    }
    if (newPassword.length < 6) {
      res.status(400).json({ message: 'La nueva contraseña debe tener al menos 6 caracteres.' })
      return
    }

    const user = await prisma.user.findUnique({ where: { id: req.userId } })
    if (!user) { res.status(404).json({ message: 'Usuario no encontrado.' }); return }

    const isValid = await bcrypt.compare(currentPassword, user.password)
    if (!isValid) { res.status(400).json({ message: 'Contraseña actual incorrecta.' }); return }

    const hashed = await bcrypt.hash(newPassword, 12)
    await prisma.user.update({ where: { id: req.userId! }, data: { password: hashed } })
    res.json({ message: 'Contraseña actualizada correctamente.' })
  } catch (err) {
    console.error('[changePassword]', err)
    res.status(500).json({ message: 'Error interno del servidor.' })
  }
}

/* ── Forgot password ──────────────────────────────── */
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body
    // Always return success to prevent email enumeration
    const SUCCESS = { message: 'Si el email existe en nuestra base, recibirás el enlace en breve.' }

    if (!email) { res.json(SUCCESS); return }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
    if (!user) { res.json(SUCCESS); return }

    const resetToken  = crypto.randomBytes(32).toString('hex')
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    const expiry      = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { resetPasswordToken: hashedToken, resetPasswordExpiry: expiry },
    })

    const resetUrl = `${process.env.FRONTEND_URL ?? 'http://localhost:5173'}/reset-password?token=${resetToken}`

    // In dev: print link to console. In prod: wire up a real email service (SendGrid, Resend, etc.)
    if (process.env.NODE_ENV !== 'production') {
      console.log('\n🔑 ─── PASSWORD RESET LINK ───────────────────────')
      console.log(`   User : ${user.email}`)
      console.log(`   Link : ${resetUrl}`)
      console.log('─────────────────────────────────────────────────\n')
    }

    res.json(SUCCESS)
  } catch (err) {
    console.error('[forgotPassword]', err)
    res.status(500).json({ message: 'Error interno del servidor.' })
  }
}

/* ── Reset password ───────────────────────────────── */
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, password } = req.body

    if (!token || !password) {
      res.status(400).json({ message: 'Token y contraseña son requeridos.' })
      return
    }
    if (password.length < 6) {
      res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres.' })
      return
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpiry: { gt: new Date() },
      },
    })

    if (!user) {
      res.status(400).json({ message: 'El enlace es inválido o ya expiró. Solicitá uno nuevo.' })
      return
    }

    const hashed = await bcrypt.hash(password, 12)
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed, resetPasswordToken: null, resetPasswordExpiry: null },
    })

    res.json({ message: 'Contraseña restablecida correctamente. Ya podés iniciar sesión.' })
  } catch (err) {
    console.error('[resetPassword]', err)
    res.status(500).json({ message: 'Error interno del servidor.' })
  }
}
