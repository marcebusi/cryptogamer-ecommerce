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

// Validación real con Magic Bytes
const checkMagicBytes = (filePath: string): boolean => {
  const buffer = Buffer.alloc(4)
  const fd = fs.openSync(filePath, 'r')
  fs.readSync(fd, buffer, 0, 4, 0)
  fs.closeSync(fd)

  const hex = buffer.toString('hex').toUpperCase()
  // Magic bytes típicos:
  // JPEG: FFD8FFE0, FFD8FFE1, FFD8FFEE, FFD8DB
  // PNG: 89504E47
  // GIF: 47494638
  // WEBP empieza con RIFF (52494646)
  
  if (hex.startsWith('FFD8FF')) return true
  if (hex.startsWith('89504E47')) return true
  if (hex.startsWith('47494638')) return true
  if (hex.startsWith('52494646')) return true // WEBP o AVIF/RIFF-based
  // AVIF puede ser un poco más complejo pero suele empezar por cajas FTYP
  if (hex === '0000001C' || hex === '00000020' || hex.includes('66747970')) return true
  return false
}

/* ── Controller ─────────────────────────────────── */
export const uploadImage = (req: Request, res: Response): void => {
  if (!req.file) {
    res.status(400).json({ message: 'No se recibió ningún archivo.' })
    return
  }
  
  // Validar magic bytes post-upload
  const isValid = checkMagicBytes(req.file.path)
  if (!isValid) {
    fs.unlinkSync(req.file.path) // Eliminar archivo malicioso
    res.status(400).json({ message: 'El archivo no es una imagen válida.' })
    return
  }

  const host = `${req.protocol}://${req.get('host')}`
  res.json({ url: `${host}/uploads/${req.file.filename}` })
}
