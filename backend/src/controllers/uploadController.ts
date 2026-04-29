import { Request, Response } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'

/* ── Storage config ─────────────────────────────── */
const uploadDir = path.join(__dirname, '../../uploads')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename:    (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`
    cb(null, `${unique}${path.extname(file.originalname)}`)
  },
})

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = /jpeg|jpg|png|gif|webp|avif/
  if (allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Solo se permiten imágenes (jpg, png, gif, webp, avif).'))
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB
})

/* ── Controller ─────────────────────────────────── */
export const uploadImage = (req: Request, res: Response): void => {
  if (!req.file) {
    res.status(400).json({ message: 'No se recibió ningún archivo.' })
    return
  }
  const host = `${req.protocol}://${req.get('host')}`
  res.json({ url: `${host}/uploads/${req.file.filename}` })
}
