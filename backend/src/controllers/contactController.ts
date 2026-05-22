import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { sendEmail, emailTemplates } from '../services/emailService'

const prisma = new PrismaClient()

export const submitContact = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, message } = req.body
    if (!name || !email || !message) {
      res.status(400).json({ message: 'Todos los campos son obligatorios' })
      return
    }

    const newContact = await prisma.contactMessage.create({
      data: { name, email, message }
    })

    // Confirmation to the person who wrote (non-blocking)
    const { subject, html } = emailTemplates.contactConfirmation(name)
    sendEmail(email, subject, html).catch(console.error)

    // Notification to store owner (non-blocking)
    const adminEmail = process.env.CONTACT_NOTIFY_EMAIL ?? process.env.ADMIN_EMAIL ?? ''
    if (adminEmail) {
      const { subject: as, html: ah } = emailTemplates.contactNotification({ name, email, message })
      sendEmail(adminEmail, as, ah).catch(console.error)
    }

    res.status(201).json({ message: 'Mensaje enviado correctamente', contact: newContact })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error al enviar el mensaje' })
  }
}

export const getContactMessages = async (_req: Request, res: Response): Promise<void> => {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' }
    })
    res.json(messages)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages' })
  }
}
