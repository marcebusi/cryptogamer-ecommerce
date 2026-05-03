import { Request, Response, NextFunction } from 'express'

// ── Sanitizar strings de entrada (prevenir XSS básico) ───────────────────────
function sanitizeValue(val: unknown): unknown {
  if (typeof val === 'string') {
    return val
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .trim()
  }
  if (Array.isArray(val)) return val.map(sanitizeValue)
  if (val && typeof val === 'object') {
    return Object.fromEntries(
      Object.entries(val as Record<string, unknown>).map(([k, v]) => [k, sanitizeValue(v)])
    )
  }
  return val
}

export function sanitizeInput(req: Request, _res: Response, next: NextFunction) {
  if (req.body)   req.body   = sanitizeValue(req.body)
  if (req.query)  req.query  = sanitizeValue(req.query) as any
  if (req.params) req.params = sanitizeValue(req.params) as any
  next()
}

// ── Prevenir Parameter Pollution ─────────────────────────────────────────────
export function preventParamPollution(req: Request, _res: Response, next: NextFunction) {
  // Si un param aparece más de una vez en query, tomar el último
  for (const key of Object.keys(req.query)) {
    if (Array.isArray(req.query[key])) {
      const arr = req.query[key] as string[]
      req.query[key] = arr[arr.length - 1]
    }
  }
  next()
}

// ── Bloquear User-Agents de bots maliciosos conocidos ────────────────────────
const BLOCKED_UAS = [/sqlmap/i, /nikto/i, /nessus/i, /masscan/i, /zgrab/i]

export function blockMaliciousUA(req: Request, res: Response, next: NextFunction) {
  const ua = req.headers['user-agent'] ?? ''
  if (BLOCKED_UAS.some(pattern => pattern.test(ua))) {
    return res.status(403).json({ error: 'Forbidden' })
  }
  next()
}

// ── Logging de seguridad (peticiones sospechosas) ────────────────────────────
export function securityLogger(req: Request, _res: Response, next: NextFunction) {
  const suspicious = [
    /(<script|SELECT\s+\*|DROP\s+TABLE|UNION\s+SELECT|exec\(|eval\()/i,
    /(\.\.\/)|(\.\.\\)/,
  ]
  const fullUrl = req.url + JSON.stringify(req.body ?? {})
  if (suspicious.some(p => p.test(fullUrl))) {
    console.warn(`[SECURITY] Suspicious request from ${req.ip}: ${req.method} ${req.url}`)
  }
  next()
}

// ── Limit body size para diferentes rutas ────────────────────────────────────
export const BODY_LIMITS = {
  json:    '1mb',
  upload: '20mb',
}
