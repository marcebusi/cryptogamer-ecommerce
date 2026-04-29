import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
  userId?: string
  userRole?: string
}

interface JwtPayload {
  userId: string
  role: string
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'No autorizado. Token requerido.' })
    return
  }

  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload
    req.userId   = decoded.userId
    req.userRole = decoded.role
    next()
  } catch {
    res.status(401).json({ message: 'Token inválido o expirado.' })
  }
}

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.userRole !== 'ADMIN') {
    res.status(403).json({ message: 'Acceso denegado. Se requieren permisos de administrador.' })
    return
  }
  next()
}
