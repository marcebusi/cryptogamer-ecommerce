import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

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
