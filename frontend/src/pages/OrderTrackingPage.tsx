import { useState, useEffect, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'

/* ─── Types ─────────────────────────────────────────────────── */
interface TrackingOrder {
  id: string
  orderNumber: string
  status: string
  totalAmount: number
  createdAt: string
  paymentMethod: string | null
  comprovanteUrl: string | null
  trackingCode: string | null
  shippingCarrier: string | null
  shippingService: string | null
  shippingCost: number | null
  shippingAddress: string | null
  shippingCity: string | null
  shippingProvince: string | null
  shippingPostalCode: string | null
  customerName: string | null
  customerEmail: string | null
  seller: { name: string; whatsapp: string; alias: string; bank: string; mpAlias: string; cryptoAlias: string } | null
  items: {
    id: string
    quantity: number
    price: number
    product: { name: string; image: string; slug: string } | null
  }[]
}

/* ─── Constants ──────────────────────────────────────────────── */
const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

const STATUS_STEPS = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'COMPLETED']

const STATUS_META: Record<string, { label: string; icon: string; color: string }> = {
  PENDING:    { label: 'Recibido',            icon: 'fa-solid fa-inbox',              color: '#a855f7' },
  CONFIRMED:  { label: 'Pago confirmado',     icon: 'fa-solid fa-circle-check',       color: '#3af4ff' },
  PROCESSING: { label: 'En preparación',      icon: 'fa-solid fa-box-open',           color: '#f59e0b' },
  SHIPPED:    { label: 'Enviado',             icon: 'fa-solid fa-truck',              color: '#39ff14' },
  COMPLETED:  { label: 'Entregado',           icon: 'fa-solid fa-house-circle-check', color: '#39ff14' },
  CANCELLED:  { label: 'Cancelado',           icon: 'fa-solid fa-ban',                color: '#ef4444' },
}

const PAYMENT_META: Record<string, { label: string; color: string }> = {
  transfer: { label: 'Transferencia bancaria', color: '#3af4ff' },
  usdt:     { label: 'USDT (Crypto)',           color: '#26a17b' },
  cash:     { label: 'Efectivo',                color: '#7c3aed' },
}

/* ─── Helpers ────────────────────────────────────────────────── */
const ars = (n: number) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(n)

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

/* ─── Sub-components ─────────────────────────────────────────── */

/** Skeleton block for loading state */
function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-white/5 ${className}`}
      aria-hidden="true"
    />
  )
}

/** Loading skeletons layout */
function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stepper skeleton */}
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
        <Skeleton className="h-5 w-40 mb-6" />
        <div className="flex gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </div>
      {/* Cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
          <Skeleton className="h-5 w-32" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-14 w-14 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
          <Skeleton className="h-px w-full" />
          <Skeleton className="h-4 w-24 ml-auto" />
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
          <Skeleton className="h-5 w-40" />
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </div>
    </div>
  )
}

/** Status stepper — horizontal on md+, vertical on mobile */
function StatusStepper({
  status, paymentMethod, isPickup,
}: { status: string; paymentMethod: string | null; isPickup: boolean }) {
  // Cash: skip CONFIRMED (no payment proof). Pickup: skip SHIPPED (no delivery).
  const isCash = paymentMethod === 'cash'
  const steps = STATUS_STEPS.filter(s => {
    if (isCash   && s === 'CONFIRMED') return false
    if (isPickup && s === 'SHIPPED')   return false
    return true
  })

  const currentIndex = steps.indexOf(status)

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
      <h2 className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-6 font-['Plus_Jakarta_Sans']">
        Estado del pedido
      </h2>

      {/* Desktop: horizontal */}
      <div className="hidden md:flex items-start relative">
        {steps.map((step, idx) => {
          const meta = STATUS_META[step]
          const isCompleted = currentIndex > idx
          const isActive    = currentIndex === idx
          const isUpcoming  = currentIndex < idx

          const dotColor = isCompleted || isActive ? meta.color : 'rgba(255,255,255,0.15)'
          const lineColor = isCompleted ? meta.color : 'rgba(255,255,255,0.1)'

          return (
            <div key={step} className="flex-1 flex flex-col items-center relative">
              {/* Connector line (not on last item) */}
              {idx < steps.length - 1 && (
                <div
                  className="absolute top-5 left-1/2 w-full h-0.5 transition-all duration-500"
                  style={{ background: lineColor, zIndex: 0 }}
                />
              )}

              {/* Icon circle */}
              <div
                className="relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-500"
                style={{
                  borderColor: dotColor,
                  background: isCompleted || isActive
                    ? `${meta.color}22`
                    : 'rgba(255,255,255,0.04)',
                  boxShadow: isActive ? `0 0 16px ${meta.color}66` : 'none',
                }}
              >
                <i
                  className={`${meta.icon} text-sm transition-all duration-500`}
                  style={{ color: isUpcoming ? 'rgba(255,255,255,0.25)' : meta.color }}
                />
              </div>

              {/* Label */}
              <span
                className="mt-2 text-xs text-center font-medium leading-tight max-w-[72px] font-['Plus_Jakarta_Sans'] transition-all duration-500"
                style={{ color: isUpcoming ? 'rgba(255,255,255,0.3)' : isActive ? meta.color : 'rgba(255,255,255,0.7)' }}
              >
                {meta.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Mobile: vertical */}
      <div className="flex md:hidden flex-col gap-0">
        {steps.map((step, idx) => {
          const meta = STATUS_META[step]
          const isCompleted = currentIndex > idx
          const isActive    = currentIndex === idx
          const isUpcoming  = currentIndex < idx

          const dotColor = isCompleted || isActive ? meta.color : 'rgba(255,255,255,0.15)'

          return (
            <div key={step} className="flex items-start gap-4">
              {/* Left column: dot + vertical line */}
              <div className="flex flex-col items-center">
                <div
                  className="flex items-center justify-center w-9 h-9 rounded-full border-2 flex-shrink-0 transition-all duration-500"
                  style={{
                    borderColor: dotColor,
                    background: isCompleted || isActive
                      ? `${meta.color}22`
                      : 'rgba(255,255,255,0.04)',
                    boxShadow: isActive ? `0 0 14px ${meta.color}66` : 'none',
                  }}
                >
                  <i
                    className={`${meta.icon} text-xs`}
                    style={{ color: isUpcoming ? 'rgba(255,255,255,0.25)' : meta.color }}
                  />
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className="w-0.5 flex-1 min-h-[28px] transition-all duration-500"
                    style={{
                      background: isCompleted
                        ? meta.color
                        : 'rgba(255,255,255,0.08)',
                    }}
                  />
                )}
              </div>

              {/* Right: label */}
              <div className="pt-1.5 pb-6">
                <span
                  className="text-sm font-medium font-['Plus_Jakarta_Sans'] transition-all duration-500"
                  style={{ color: isUpcoming ? 'rgba(255,255,255,0.3)' : isActive ? meta.color : 'rgba(255,255,255,0.75)' }}
                >
                  {meta.label}
                </span>
                {isActive && (
                  <p className="text-xs text-white/40 mt-0.5">Paso actual</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/** Cancelled banner */
function CancelledBanner() {
  return (
    <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 flex items-center gap-4">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500/20 border border-red-500/40 flex-shrink-0">
        <i className="fa-solid fa-ban text-xl text-red-400" />
      </div>
      <div>
        <h2 className="text-lg font-bold text-red-400 font-['Plus_Jakarta_Sans']">Pedido cancelado</h2>
        <p className="text-sm text-white/50 mt-0.5">
          Este pedido fue cancelado. Si tenés dudas, contactá al vendedor o a nuestro soporte.
        </p>
      </div>
    </div>
  )
}

/** Order items card */
function OrderItemsCard({ order }: { order: TrackingOrder }) {
  const subtotal  = order.items.reduce((s, i) => s + i.price * i.quantity, 0)
  const shipping  = order.shippingCost ?? 0
  const total     = order.totalAmount

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <i className="fa-solid fa-bag-shopping text-sm" style={{ color: '#39ff14' }} />
        <h3 className="text-base font-bold text-white font-['Plus_Jakarta_Sans']">
          Productos del pedido
        </h3>
      </div>

      {/* Items */}
      <ul className="flex flex-col gap-4">
        {order.items.map(item => (
          <li key={item.id} className="flex gap-3 items-start">
            {item.product ? (
              <img
                src={item.product.image}
                alt={item.product.name}
                className="w-14 h-14 rounded-lg object-cover border border-white/10 flex-shrink-0 bg-white/5"
                onError={e => {
                  ;(e.currentTarget as HTMLImageElement).src =
                    'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56"><rect width="56" height="56" fill="%23ffffff0a"/><text x="50%25" y="55%25" dominant-baseline="middle" text-anchor="middle" font-size="20" fill="%23ffffff33">?</text></svg>'
                }}
              />
            ) : (
              <div className="w-14 h-14 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center flex-shrink-0">
                <i className="fa-solid fa-box text-white/20" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {item.product?.name ?? 'Producto eliminado'}
              </p>
              <p className="text-xs text-white/40 mt-0.5">
                Cant.: {item.quantity}
              </p>
            </div>
            <span className="text-sm font-bold text-white/80 flex-shrink-0">
              {ars(item.price * item.quantity)}
            </span>
          </li>
        ))}
      </ul>

      {/* Divider */}
      <div className="border-t border-white/10" />

      {/* Totals */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-white/50">
          <span>Subtotal</span>
          <span>{ars(subtotal)}</span>
        </div>
        {shipping > 0 && (
          <div className="flex justify-between text-sm text-white/50">
            <span>Envío</span>
            <span>{ars(shipping)}</span>
          </div>
        )}
        {shipping === 0 && order.shippingCarrier && (
          <div className="flex justify-between text-sm text-white/50">
            <span>Envío</span>
            <span className="text-[#39ff14] font-semibold">Gratis</span>
          </div>
        )}
        <div className="flex justify-between text-base font-bold text-white pt-1">
          <span>Total</span>
          <span style={{ color: '#39ff14' }}>{ars(total)}</span>
        </div>
      </div>
    </div>
  )
}

/* ── Carrier tracking URL helper ─────────────────── */
function carrierTrackingUrl(carrier: string | null, code: string): string {
  const c = (carrier ?? '').toLowerCase()
  if (c.includes('andreani'))
    return `https://www.andreani.com/#!/informacionEnvio/${encodeURIComponent(code)}`
  if (c.includes('correo'))
    return `https://www.correoargentino.com.ar/formularios/e-commerce?id=${encodeURIComponent(code)}`
  return ''
}

/** Shipping & seller info card */
function ShippingCard({ order }: { order: TrackingOrder }) {
  const isPickup = order.shippingCarrier === 'pickup' || order.shippingService === 'Retiro en domicilio del vendedor'

  const hasShipping =
    order.shippingAddress ||
    order.shippingCity ||
    order.shippingProvince ||
    order.shippingPostalCode ||
    (order.shippingCarrier && !isPickup)

  const waLink = order.seller?.whatsapp
    ? `https://wa.me/${order.seller.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
        `Hola! Consulto por el pedido ${order.orderNumber}`
      )}`
    : null

  const trackingUrl = order.trackingCode
    ? carrierTrackingUrl(order.shippingCarrier, order.trackingCode)
    : ''

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <i className={`fa-solid ${isPickup ? 'fa-store' : 'fa-truck'} text-sm`}
          style={{ color: isPickup ? '#a855f7' : '#3af4ff' }} />
        <h3 className="text-base font-bold text-white font-['Plus_Jakarta_Sans']">
          {isPickup ? 'Retiro en domicilio' : 'Información de envío'}
        </h3>
      </div>

      {/* ── PICKUP mode ── */}
      {isPickup ? (
        <div className="space-y-4">
          {/* Main info card */}
          <div className="rounded-xl border p-4 space-y-2"
            style={{ borderColor: 'rgba(168,85,247,0.25)', background: 'rgba(168,85,247,0.06)' }}>
            <p className="text-sm font-semibold text-purple-300 flex items-center gap-2">
              <i className="fa-solid fa-store text-xs" /> Retiro en domicilio del vendedor
            </p>
            <p className="text-xs text-white/50 leading-relaxed">
              Coordiná con el vendedor el día y horario para pasar a retirar el producto.
            </p>
          </div>

          {/* Inspect before paying tip */}
          <div className="rounded-xl border p-4 space-y-2"
            style={{ borderColor: 'rgba(57,255,20,0.15)', background: 'rgba(57,255,20,0.04)' }}>
            <p className="text-sm font-semibold flex items-center gap-2" style={{ color: '#39ff14' }}>
              <i className="fa-solid fa-magnifying-glass text-xs" /> ¿Querés ver el producto antes de pagar?
            </p>
            <p className="text-xs text-white/50 leading-relaxed">
              Podés coordinar una visita para revisar el estado del producto en persona antes de confirmar el pago. No estás obligado a transferir hasta que estés conforme.
            </p>
          </div>

          {/* WhatsApp CTA */}
          {order.seller && waLink && (
            <a href={waLink} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:brightness-110 active:scale-95 w-full"
              style={{ background: '#25D366', color: '#fff' }}>
              <i className="fa-brands fa-whatsapp text-base" />
              Coordinar con el vendedor por WhatsApp
            </a>
          )}
        </div>
      ) : (
        <>
          {/* Carrier / service badges */}
          {(order.shippingCarrier || order.shippingService) && (
            <div className="flex flex-wrap gap-2">
              {order.shippingCarrier && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border"
                  style={{ borderColor: '#3af4ff33', color: '#3af4ff', background: '#3af4ff11' }}>
                  <i className="fa-solid fa-truck text-[10px]" />
                  {order.shippingCarrier}
                </span>
              )}
              {order.shippingService && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-white/10 text-white/60 bg-white/5">
                  {order.shippingService}
                </span>
              )}
            </div>
          )}

          {/* Carrier tracking link — shown when admin set a tracking code */}
          {order.trackingCode && (
            <div className="rounded-xl border p-4 space-y-3"
              style={{ borderColor: 'rgba(57,255,20,0.2)', background: 'rgba(57,255,20,0.05)' }}>
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-satellite-dish text-xs" style={{ color: '#39ff14' }} />
                <span className="text-xs font-semibold text-white/70">Número de seguimiento</span>
              </div>
              <p className="font-mono text-sm font-bold" style={{ color: '#39ff14' }}>
                {order.trackingCode}
              </p>
              {trackingUrl ? (
                <a href={trackingUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:brightness-110 active:scale-95"
                  style={{ background: '#39ff14', color: '#080910' }}>
                  <i className="fa-solid fa-arrow-up-right-from-square text-xs" />
                  Rastrear en {order.shippingCarrier ?? 'el correo'}
                </a>
              ) : (
                <p className="text-xs text-white/30">Usá este código en el sitio del correo para rastrear tu envío.</p>
              )}
            </div>
          )}

          {/* Address */}
          {hasShipping ? (
            <div className="space-y-2">
              {order.shippingAddress && (
                <div className="flex gap-2 items-start">
                  <i className="fa-solid fa-location-dot text-xs text-white/30 mt-0.5 w-4 flex-shrink-0" />
                  <span className="text-sm text-white/70">{order.shippingAddress}</span>
                </div>
              )}
              {(order.shippingCity || order.shippingProvince) && (
                <div className="flex gap-2 items-start">
                  <i className="fa-solid fa-city text-xs text-white/30 mt-0.5 w-4 flex-shrink-0" />
                  <span className="text-sm text-white/70">
                    {[order.shippingCity, order.shippingProvince].filter(Boolean).join(', ')}
                  </span>
                </div>
              )}
              {order.shippingPostalCode && (
                <div className="flex gap-2 items-start">
                  <i className="fa-solid fa-hashtag text-xs text-white/30 mt-0.5 w-4 flex-shrink-0" />
                  <span className="text-sm text-white/70">CP {order.shippingPostalCode}</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-white/30 italic">Sin información de envío registrada.</p>
          )}
        </>
      )}

      {/* Customer */}
      {(order.customerName || order.customerEmail) && (
        <>
          <div className="border-t border-white/10" />
          <div className="space-y-2">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Comprador</p>
            {order.customerName && (
              <div className="flex gap-2 items-center">
                <i className="fa-solid fa-user text-xs text-white/30 w-4 flex-shrink-0" />
                <span className="text-sm text-white/70">{order.customerName}</span>
              </div>
            )}
            {order.customerEmail && (
              <div className="flex gap-2 items-center">
                <i className="fa-solid fa-envelope text-xs text-white/30 w-4 flex-shrink-0" />
                <span className="text-sm text-white/70">{order.customerEmail}</span>
              </div>
            )}
          </div>
        </>
      )}

      {/* Seller (non-pickup: show contact option too) */}
      {order.seller && !isPickup && (
        <>
          <div className="border-t border-white/10" />
          <div className="space-y-3">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Vendedor</p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#7c3aed]/20 border border-[#7c3aed]/40 flex items-center justify-center flex-shrink-0">
                <i className="fa-solid fa-store text-xs" style={{ color: '#a78bfa' }} />
              </div>
              <span className="text-sm font-semibold text-white">{order.seller.name}</span>
            </div>
            {waLink && (
              <a href={waLink} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:brightness-110 active:scale-95"
                style={{ background: '#25D366', color: '#fff' }}>
                <i className="fa-brands fa-whatsapp text-base" />
                Contactar al vendedor
              </a>
            )}
          </div>
        </>
      )}
    </div>
  )
}

/** Payment method card — includes comprobante upload for transfer/usdt */
function PaymentCard({
  order,
  onComprobanteUploaded,
}: {
  order: TrackingOrder
  onComprobanteUploaded: (url: string) => void
}) {
  const method = order.paymentMethod ?? 'unknown'
  const meta   = PAYMENT_META[method]
  const needsComprobante = method === 'transfer' || method === 'usdt'
  const isPaymentConfirmed = order.status === 'CONFIRMED' || order.status === 'PROCESSING' ||
                             order.status === 'SHIPPED'   || order.status === 'COMPLETED'

  type UpState = 'idle' | 'uploading' | 'done' | 'error'
  const [upState,      setUpState]      = useState<UpState>(order.comprovanteUrl ? 'done' : 'idle')
  const [currentUrl,   setCurrentUrl]   = useState<string>(order.comprovanteUrl ?? '')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (file: File) => {
    setUpState('uploading')
    try {
      // 1. Upload file — public endpoint, no auth needed, accepts images + PDF
      const fd = new FormData()
      fd.append('file', file)
      const r = await fetch(`${BASE}/api/upload/comprobante`, { method: 'POST', body: fd })
      if (!r.ok) throw new Error()
      const { url } = await r.json() as { url: string }

      // 2. Attach to order (public endpoint)
      await fetch(`${BASE}/api/orders/track/${order.orderNumber}/comprobante`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ comprovanteUrl: url }),
      })

      setCurrentUrl(url)
      onComprobanteUploaded(url)
      setUpState('done')
    } catch {
      setUpState('error')
    }
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <i className="fa-solid fa-credit-card text-sm" style={{ color: '#f59e0b' }} />
        <h3 className="text-base font-bold text-white font-['Plus_Jakarta_Sans']">
          Método de pago
        </h3>
      </div>

      {/* Method badge */}
      <div className="flex flex-wrap gap-3 items-center">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border"
          style={{
            color:       meta?.color ?? 'rgba(255,255,255,0.5)',
            borderColor: `${meta?.color ?? 'rgba(255,255,255,0.2)'}44`,
            background:  `${meta?.color ?? 'rgba(255,255,255,0.1)'}11`,
          }}>
          {method === 'transfer' && <i className="fa-solid fa-building-columns text-[10px]" />}
          {method === 'usdt'     && <i className="fa-brands fa-ethereum text-[10px]" />}
          {method === 'cash'     && <i className="fa-solid fa-money-bill-wave text-[10px]" />}
          {meta?.label ?? 'No especificado'}
        </span>

        {/* Payment confirmed badge — takes priority */}
        {needsComprobante && isPaymentConfirmed && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border"
            style={{ color:'#3af4ff', borderColor:'#3af4ff44', background:'#3af4ff11' }}>
            <i className="fa-solid fa-circle-check text-[10px]" /> Pago confirmado
          </span>
        )}

        {/* Comprobante status (when not yet confirmed) */}
        {needsComprobante && !isPaymentConfirmed && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border"
            style={
              upState === 'done'
                ? { color:'#39ff14', borderColor:'#39ff1444', background:'#39ff1411' }
                : { color:'#f59e0b', borderColor:'#f59e0b44', background:'#f59e0b11' }
            }>
            <i className={`fa-solid ${upState === 'done' ? 'fa-circle-check' : 'fa-clock'} text-[10px]`} />
            {upState === 'done' ? 'Comprobante enviado · Esperando confirmación' : 'Comprobante pendiente'}
          </span>
        )}
      </div>

      {/* ── Payment details (transfer / usdt / cash) ── */}
      {method === 'transfer' && order.seller?.alias && (
        <div className="rounded-xl p-4 space-y-2 border"
          style={{ background: 'rgba(58,244,255,0.06)', borderColor: 'rgba(58,244,255,0.2)' }}>
          <p className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: '#3af4ff' }}>
            <i className="fa-solid fa-building-columns text-[10px]" /> Datos para tu transferencia
          </p>
          <div className="space-y-1 text-xs">
            {order.seller.bank && (
              <p className="text-white/60">
                <span className="text-white font-semibold">Banco / Billetera:</span> {order.seller.bank}
              </p>
            )}
            <div className="flex items-center gap-2">
              <p className="text-white/60 flex-1">
                <span className="text-white font-semibold">Alias / CBU:</span>{' '}
                <span className="font-mono" style={{ color: '#3af4ff' }}>{order.seller.alias}</span>
              </p>
              <button type="button"
                onClick={() => navigator.clipboard.writeText(order.seller!.alias)}
                className="text-white/30 hover:text-white/70 transition-colors cursor-pointer flex-shrink-0"
                title="Copiar alias">
                <i className="fa-regular fa-copy text-xs" />
              </button>
            </div>
            {order.seller.mpAlias && (
              <p className="text-white/60">
                <span className="text-white font-semibold">MP Alias:</span>{' '}
                <span className="font-mono text-purple-300">{order.seller.mpAlias}</span>
              </p>
            )}
            <p className="font-bold pt-1" style={{ color: '#3af4ff' }}>
              Monto: <span className="font-mono">{ars(order.totalAmount)}</span>
            </p>
          </div>
        </div>
      )}

      {method === 'usdt' && order.seller?.cryptoAlias && (
        <div className="rounded-xl p-4 space-y-2 border"
          style={{ background: 'rgba(38,161,123,0.06)', borderColor: 'rgba(38,161,123,0.25)' }}>
          <p className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: '#26a17b' }}>
            <i className="fa-brands fa-ethereum text-[10px]" /> Dirección de wallet USDT
          </p>
          <div className="flex items-center gap-2 bg-black/30 rounded-lg px-3 py-2 border border-[#26a17b]/20">
            <span className="font-mono text-[11px] flex-1 break-all" style={{ color: '#26a17b' }}>
              {order.seller.cryptoAlias}
            </span>
            <button type="button"
              onClick={() => navigator.clipboard.writeText(order.seller!.cryptoAlias)}
              className="text-white/30 hover:text-white/70 transition-colors cursor-pointer flex-shrink-0"
              title="Copiar dirección">
              <i className="fa-regular fa-copy text-xs" />
            </button>
          </div>
          <p className="text-xs text-white/40 leading-relaxed">
            Red: <span className="text-white font-semibold">TRC-20 (Tron)</span> o{' '}
            <span className="text-white font-semibold">ERC-20 (Ethereum)</span>.
            Confirmá la red antes de enviar.
          </p>
          <p className="text-xs font-bold" style={{ color: '#26a17b' }}>
            Monto: <span className="font-mono">{ars(order.totalAmount)}</span>
          </p>
        </div>
      )}

      {method === 'cash' && (
        <div className="rounded-xl p-4 border"
          style={{ background: 'rgba(168,85,247,0.06)', borderColor: 'rgba(168,85,247,0.2)' }}>
          <p className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 mb-2" style={{ color: '#a855f7' }}>
            <i className="fa-solid fa-money-bill-wave text-[10px]" /> Pago en efectivo
          </p>
          <p className="text-xs text-white/55 leading-relaxed">
            Coordiná con el vendedor el pago de{' '}
            <span className="font-bold text-white">{ars(order.totalAmount)}</span>.
            {order.seller?.whatsapp && ' Podés contactarlo por WhatsApp.'}
          </p>
        </div>
      )}

      {/* Comprobante upload section */}
      {needsComprobante && !isPaymentConfirmed && (
        <div className="border-t border-white/10 pt-4 space-y-3">

          {/* Hidden file input — always present so ref works */}
          <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden"
            onChange={e => {
              const f = e.target.files?.[0]
              if (f) handleUpload(f)
              // Reset input so selecting same file again triggers onChange
              e.target.value = ''
            }} />

          {upState === 'idle' && (
            <>
              <p className="text-xs text-white/40">
                Una vez realizado el pago, subí el comprobante para que el vendedor lo verifique:
              </p>
              <button type="button" onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all cursor-pointer hover:brightness-110"
                style={{ color:'#3af4ff', borderColor:'rgba(58,244,255,0.35)', background:'rgba(58,244,255,0.07)' }}>
                <i className="fa-solid fa-upload text-xs" /> Subir comprobante
              </button>
            </>
          )}

          {upState === 'uploading' && (
            <div className="flex items-center gap-2 text-sm text-white/50">
              <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
              Subiendo comprobante...
            </div>
          )}

          {upState === 'done' && currentUrl && (
            <div className="space-y-3">
              <p className="text-xs text-white/40">
                Tu comprobante fue recibido. El vendedor lo revisará y confirmará el pago.
              </p>

              {/* Preview */}
              {currentUrl.toLowerCase().endsWith('.pdf') || currentUrl.includes('application/pdf') ? (
                <a href={currentUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all hover:brightness-110"
                  style={{ color:'#3af4ff', borderColor:'rgba(58,244,255,0.35)', background:'rgba(58,244,255,0.07)' }}>
                  <i className="fa-solid fa-file-pdf text-xs" /> Ver comprobante (PDF)
                </a>
              ) : (
                <img src={currentUrl} alt="Comprobante"
                  className="w-full max-h-48 object-contain rounded-lg border border-white/10" />
              )}

              {/* Replace button */}
              <button type="button" onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer hover:brightness-110"
                style={{ color:'rgba(255,255,255,0.45)', borderColor:'rgba(255,255,255,0.12)', background:'rgba(255,255,255,0.04)' }}>
                <i className="fa-solid fa-rotate text-[10px]" /> Cambiar comprobante
              </button>
            </div>
          )}

          {upState === 'error' && (
            <div className="space-y-3">
              <p className="text-xs text-white/40">
                Una vez realizado el pago, subí el comprobante para que el vendedor lo verifique:
              </p>
              <div className="flex items-center justify-between text-sm text-red-400">
                <span className="flex items-center gap-1.5">
                  <i className="fa-solid fa-circle-xmark text-xs" /> Error al subir. Intentá de nuevo.
                </span>
              </div>
              <button type="button" onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all cursor-pointer hover:brightness-110"
                style={{ color:'#3af4ff', borderColor:'rgba(58,244,255,0.35)', background:'rgba(58,244,255,0.07)' }}>
                <i className="fa-solid fa-upload text-xs" /> Reintentar subida
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ─── Main page ───────────────────────────────────────────────── */
export default function OrderTrackingPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>()

  const [order,   setOrder]   = useState<TrackingOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  useEffect(() => {
    if (!orderNumber) {
      setError('Número de pedido no especificado.')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    fetch(`${BASE}/api/orders/track/${encodeURIComponent(orderNumber)}`)
      .then(async res => {
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          throw new Error(
            (data as { message?: string }).message ?? `HTTP ${res.status}`,
          )
        }
        return data as TrackingOrder
      })
      .then(data => setOrder(data))
      .catch(() => setError('No encontramos ningún pedido con ese número.'))
      .finally(() => setLoading(false))
  }, [orderNumber])

  const isCancelled = order?.status === 'CANCELLED'

  const handleComprobanteUploaded = (url: string) => {
    setOrder(prev => prev ? { ...prev, comprovanteUrl: url } : prev)
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: '#080910' }}
    >
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-10 space-y-8">

        {/* ── Header ── */}
        <header className="space-y-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors"
          >
            <i className="fa-solid fa-arrow-left text-xs" />
            Volver a la tienda
          </Link>

          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white font-['Plus_Jakarta_Sans'] leading-tight">
              Seguimiento de{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: 'linear-gradient(135deg, #39ff14 0%, #3af4ff 100%)',
                }}
              >
                pedido
              </span>
            </h1>

            {orderNumber && (
              <div className="mt-2 inline-flex items-center gap-2">
                <span className="text-white/40 text-sm">N.° de pedido:</span>
                <span
                  className="font-mono text-base font-bold tracking-widest px-3 py-0.5 rounded-full border"
                  style={{
                    color: '#39ff14',
                    borderColor: '#39ff1440',
                    background: '#39ff1410',
                  }}
                >
                  {orderNumber}
                </span>
              </div>
            )}

            {order && (
              <p className="mt-1 text-sm text-white/30">
                Realizado el {formatDate(order.createdAt)}
              </p>
            )}
          </div>
        </header>

        {/* ── Loading ── */}
        {loading && <LoadingSkeleton />}

        {/* ── Error ── */}
        {!loading && error && (
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-10 flex flex-col items-center gap-6 text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center border"
              style={{ background: '#ef444411', borderColor: '#ef444440' }}
            >
              <i className="fa-solid fa-circle-exclamation text-2xl text-red-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-['Plus_Jakarta_Sans']">
                Pedido no encontrado
              </h2>
              <p className="text-sm text-white/50 mt-1 max-w-sm">
                No encontramos ningún pedido con ese número. Verificá que sea correcto e intentá de nuevo.
              </p>
            </div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 hover:brightness-110 active:scale-95"
              style={{ background: '#39ff14', color: '#080910' }}
            >
              <i className="fa-solid fa-house text-xs" />
              Ir al inicio
            </Link>
          </div>
        )}

        {/* ── Content ── */}
        {!loading && !error && order && (
          <div className="space-y-6">

            {/* Cancelled banner OR status stepper */}
            {isCancelled ? (
              <CancelledBanner />
            ) : (
              <StatusStepper
                status={order.status}
                paymentMethod={order.paymentMethod}
                isPickup={
                  order.shippingCarrier === 'pickup' ||
                  order.shippingService === 'Retiro en domicilio del vendedor'
                }
              />
            )}

            {/* Items + Shipping */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <OrderItemsCard order={order} />
              <ShippingCard order={order} />
            </div>

            {/* Payment info */}
            {order.paymentMethod && (
              <PaymentCard order={order} onComprobanteUploaded={handleComprobanteUploaded} />
            )}

            {/* Footer note */}
            <footer className="flex items-center justify-center gap-2 pt-2 pb-4">
              <i className="fa-solid fa-shield-halved text-xs" style={{ color: '#39ff14' }} />
              <p className="text-xs text-white/30 text-center">
                Este pedido está siendo gestionado por{' '}
                <span className="text-white/50 font-semibold">Cryptogamer's</span>
              </p>
            </footer>

          </div>
        )}
      </div>
    </div>
  )
}
