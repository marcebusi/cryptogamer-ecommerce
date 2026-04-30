import { v2 as cloudinary } from 'cloudinary'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import multer from 'multer'
import { Request, Response } from 'express'
import fs from 'fs'
import path from 'path'

/* ── Cloudinary config ───────────────────────────── */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const useCloudinary = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'tu-cloud-name'
)

/* ── Storage: Cloudinary in prod, local in dev ───── */
let storage: multer.StorageEngine

if (useCloudinary) {
  storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'cryptogamers',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif'],
      transformation: [{ quality: 'auto', fetch_format: 'auto' }],
    } as any,
  })
} else {
  const uploadDir = path.join(__dirname, '../../uploads')
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })
  storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`
      cb(null, `${unique}${path.extname(file.originalname)}`)
    },
  })
}

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = /jpeg|jpg|png|gif|webp|avif/
  if (allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Solo se permiten imágenes (jpg, png, gif, webp, avif).'))
  }
}

export const upload = multer({ storage, fileFilter, limits: { fileSize: 8 * 1024 * 1024 } })

/* ── Magic bytes validator (local only) ──────────── */
const checkMagicBytes = (filePath: string): boolean => {
  if (!fs.existsSync(filePath)) return true // Cloudinary already validated
  const buffer = Buffer.alloc(4)
  const fd = fs.openSync(filePath, 'r')
  fs.readSync(fd, buffer, 0, 4, 0)
  fs.closeSync(fd)
  const hex = buffer.toString('hex').toUpperCase()
  if (hex.startsWith('FFD8FF')) return true
  if (hex.startsWith('89504E47')) return true
  if (hex.startsWith('47494638')) return true
  if (hex.startsWith('52494646')) return true
  if (hex === '0000001C' || hex === '00000020') return true
  return false
}

/* ── Controller ─────────────────────────────────── */
export const uploadImage = (req: Request, res: Response): void => {
  if (!req.file) {
    res.status(400).json({ message: 'No se recibió ningún archivo.' })
    return
  }

  if (!useCloudinary) {
    // Local: validate magic bytes
    const isValid = checkMagicBytes(req.file.path)
    if (!isValid) {
      fs.unlinkSync(req.file.path)
      res.status(400).json({ message: 'El archivo no es una imagen válida.' })
      return
    }
    const host = `${req.protocol}://${req.get('host')}`
    res.json({ url: `${host}/uploads/${req.file.filename}` })
    return
  }

  // Cloudinary: path is the secure URL
  const url = (req.file as any).path
  res.json({ url })
}
