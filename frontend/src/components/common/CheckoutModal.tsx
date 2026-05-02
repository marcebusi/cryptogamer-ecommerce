import { useState, useEffect, useRef } from 'react'
import { useCart } from '../../context/CartContext'
import { api } from '../../lib/api'
import SellerPicker from '../checkout/SellerPicker'
import ShippingRatePicker, { type ShippingRate } from '../checkout/ShippingRatePicker'
import './CheckoutModal.css'

type Step      = 'seller' | 'summary' | 'shipping' | 'payment' | 'success'
type PayMethod = 'transfer' | 'cash' | 'usdt'

interface Seller {
  id: string; name: string; bio: string; avatar: string
  whatsapp: string; alias: string; bank: string; mpAlias: string
}

const PROVINCES = [
  'Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut',
  'Córdoba', 'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy',
  'La Pampa', 'La Rioja', 'Mendoza', 'Misiones', 'Neuquén',
  'Río Negro', 'Salta', 'San Juan', 'San Luis', 'Santa Cruz',
  'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego', 'Tucumán',
]

const ARS = (n: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)

const STEP_LABELS: Record<Step, string> = {
  seller:   'Elegí tu vendedor',
  summary:  'Resumen del pedido',
  shipping: 'Datos de envío',
  payment:  'Método de pago',
  success:  '¡Pedido confirmado!',
}
const VISIBLE: Step[] = ['seller', 'summary', 'shipping', 'payment']

export default function CheckoutModal() {
  const { items, totalPrice, clearCart, isCheckoutOpen, closeCheckout } = useCart()

  const [step,        setStep]        = useState<Step>('seller')
  const [seller,      setSeller]      = useState<Seller | null>(null)
  const [shipping,    setShipping]    = useState<ShippingRate | null>(null)
  const [payMethod,   setPayMethod]   = useState<PayMethod | null>(null)
  const [orderNumber, setOrderNumber] = useState('')
  const [orderId,     setOrderId]     = useState('')
  const [submitting,  setSubmitting]  = useState(false)

  /* Comprobante upload */
  type UploadState = 'idle' | 'uploading' | 'done' | 'error'
  const [comprState, setComprState] = useState<UploadState>('idle')
  const [comprUrl,   setComprUrl]   = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    address: '', city: '', province: 'Buenos Aires', postal: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const tax          = totalPrice * 0.1
  const shippingCost = shipping?.price ?? 0
  const total        = totalPrice + tax + shippingCost
  const totalItems   = items.reduce((s, i) => s + i.quantity, 0)

  /* ── Scroll lock ── */
  useEffect(() => {
    document.body.style.overflow = isCheckoutOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isCheckoutOpen])

  /* ── ESC to close ── */
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  })

  if (!isCheckoutOpen) return null

  /* ── Close / reset ── */
  const handleClose = () => {
    closeCheckout()
    if (step === 'success') {
      clearCart()
      setTimeout(() => {
        setStep('seller'); setSeller(null); setShipping(null)
        setPayMethod(null); setOrderNumber(''); setOrderId('')
        setComprState('idle'); setComprUrl('')
        setForm({ name:'', email:'', phone:'', address:'', city:'', province:'Buenos Aires', postal:'' })
      }, 300)
    }
  }

  /* ── Shipping form validation ── */
  const validateShipping = () => {
    const e: Record<string, string> = {}
    const isPickup = shipping?.carrierId === 'pickup'
    if (!form.name.trim())         e.name     = 'Requerido'
    if (!form.email.includes('@')) e.email    = 'Email inválido'
    if (!form.phone.trim())        e.phone    = 'Requerido'
    // Address fields not required for pickup
    if (!isPickup && !form.address.trim()) e.address = 'Requerido'
    if (!isPickup && !form.city.trim())    e.city    = 'Requerido'
    if (!isPickup && !form.postal.trim())  e.postal  = 'Requerido'
    if (!shipping)                 e.shipping = 'Elegí una opción de envío'
    return e
  }

  /* ── Continue from shipping to payment ── */
  const handleContinueToPayment = () => {
    const errs = validateShipping()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setStep('payment')
  }

  /* ── Submit order ── */
  const handleConfirmOrder = async () => {
    if (!payMethod) { setErrors({ submit: 'Seleccioná un método de pago' }); return }
    setErrors({})
    setSubmitting(true)
    try {
      const payload = {
        sellerId:      seller?.id ?? null,
        paymentMethod: payMethod,
        items: items.map(({ product, quantity }) => ({ productId: product.id, quantity })),
        shipping: shipping ? {
          carrierId:   shipping.carrierId,
          serviceId:   shipping.serviceId,
          serviceName: shipping.serviceName,
          price:       shipping.price,
          postalCode:  form.postal,
        } : undefined,
        customer: {
          name: form.name, email: form.email, phone: form.phone,
          address: form.address, city: form.city, province: form.province,
        },
      }
      const res = await api.post<{ orderId: string; orderNumber: string }>(
        '/api/orders', payload
      )
      setOrderNumber(res.orderNumber)
      setOrderId(res.orderId)
      setStep('success')
    } catch (err) {
      setErrors({ submit: (err as Error).message ?? 'Error al procesar el pedido.' })
    } finally {
      setSubmitting(false)
    }
  }

  /* ── Comprobante upload ── */
  const handleComprovanteUpload = async (file: File) => {
    setComprState('uploading')
    try {
      // Public endpoint — no auth needed, accepts images + PDF
      const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch(`${BASE_URL}/api/upload/comprobante`, { method: 'POST', body: fd })
      if (!res.ok) throw new Error()
      const { url } = await res.json() as { url: string }
      setComprUrl(url)
      // Attach to the order record
      if (orderId) {
        await api.patch(`/api/orders/${orderId}/comprobante`, { comprovanteUrl: url })
      }
      setComprState('done')
    } catch {
      setComprState('error')
    }
  }

  /* ── Field helper ── */
  const field = (key: keyof typeof form, label: string, type = 'text', ph = '') => (
    <div>
      <label className="block text-xs text-on-surface-variant uppercase tracking-wider mb-1">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        placeholder={ph}
        className={`w-full bg-surface-container border rounded-lg px-sm py-xs text-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:ring-1 transition-all ${
          errors[key] ? 'border-error focus:ring-error' : 'border-outline-variant focus:border-primary-container focus:ring-primary-container/30'
        }`}
      />
      {errors[key] && <p className="text-xs text-error mt-0.5">{errors[key]}</p>}
    </div>
  )

  const vi = VISIBLE.indexOf(step)

  /* ════════════════════════════════════════════════════ */
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-md" onClick={handleClose} />

      <div className="checkout-modal relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-purple-500/30 shadow-[0_0_80px_rgba(138,43,226,0.25)]">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/60 to-transparent" />

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-md py-sm border-b border-white/10">
          <div className="flex items-center gap-xs">
            <div className="w-8 h-8 rounded-xl bg-purple-600/20 flex items-center justify-center flex-shrink-0">
              {step === 'success'   ? <i className="fa-solid fa-check        text-green-400  text-sm" />
               : step === 'seller'  ? <i className="fa-solid fa-users        text-purple-400 text-sm" />
               : step === 'shipping'? <i className="fa-solid fa-truck        text-purple-400 text-sm" />
               : step === 'payment' ? <i className="fa-solid fa-credit-card  text-purple-400 text-sm" />
               :                      <i className="fa-solid fa-bag-shopping text-purple-400 text-sm" />}
            </div>
            <div>
              <h2 className="font-bold text-on-surface font-['Plus_Jakarta_Sans'] text-sm">{STEP_LABELS[step]}</h2>
              {step !== 'success' && vi >= 0 && (
                <p className="text-xs text-on-surface-variant">Paso {vi + 1} de {VISIBLE.length}</p>
              )}
            </div>
          </div>
          <button type="button" onClick={handleClose}
            className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Cerrar">
            <span className="material-symbols-outlined text-on-surface-variant text-xl">close</span>
          </button>
        </div>

        {/* ── Step dots ── */}
        {step !== 'success' && vi >= 0 && (
          <div className="flex px-md pt-sm gap-xs">
            {VISIBLE.map((s, i) => (
              <div key={s} className="flex items-center gap-xs flex-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                  s === step        ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(138,43,226,0.5)]'
                  : i < vi          ? 'bg-purple-600/30 text-purple-300'
                  :                   'bg-surface-container-high text-on-surface-variant'
                }`}>
                  {i < vi ? <i className="fa-solid fa-check text-[9px]" /> : i + 1}
                </div>
                {i < VISIBLE.length - 1 && (
                  <div className={`flex-1 h-px transition-all ${i < vi ? 'bg-purple-500/50' : 'bg-white/10'}`} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* ════════ STEP 1 — Seller ════════ */}
        {step === 'seller' && (
          <div className="p-md space-y-md">
            <p className="text-sm text-on-surface-variant">
              Elegí con qué vendedor querés realizar tu compra. Cada uno tiene sus propios datos de pago.
            </p>
            <SellerPicker selected={seller} onSelect={setSeller} />
            <button type="button"
              onClick={() => { if (seller) setStep('summary') }}
              disabled={!seller}
              className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: seller ? 'linear-gradient(135deg,#7c3aed,#5b21b6)' : 'rgba(255,255,255,0.05)',
                color:      seller ? 'white' : 'rgba(255,255,255,0.4)',
                boxShadow:  seller ? '0 0 24px rgba(138,43,226,0.4)' : 'none',
              }}
            >
              {seller
                ? <><span>Continuar con {seller.name}</span><i className="fa-solid fa-arrow-right" /></>
                : 'Seleccioná un vendedor para continuar'}
            </button>
          </div>
        )}

        {/* ════════ STEP 2 — Summary ════════ */}
        {step === 'summary' && (
          <div className="p-md space-y-md">
            {seller && (
              <div className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background:'rgba(138,43,226,0.1)', border:'1px solid rgba(168,85,247,0.25)' }}>
                {seller.avatar
                  ? <img src={seller.avatar} alt={seller.name} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                  : <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-violet-900 flex items-center justify-center text-sm font-black text-white flex-shrink-0">
                      {seller.name.charAt(0)}
                    </div>
                }
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-purple-300 font-semibold uppercase tracking-wider">Vendedor seleccionado</p>
                  <p className="text-sm font-bold text-white truncate">{seller.name}</p>
                </div>
                <button type="button" onClick={() => setStep('seller')}
                  className="text-xs text-purple-400 hover:text-purple-300 cursor-pointer transition-colors font-semibold">
                  Cambiar
                </button>
              </div>
            )}

            <ul className="space-y-sm">
              {items.map(({ product, quantity }) => (
                <li key={product.id} className="flex gap-sm items-center">
                  <div className="w-16 h-16 rounded-lg overflow-hidden border border-white/10 flex-shrink-0 bg-surface-container-high">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-on-surface line-clamp-1">{product.name}</p>
                    <p className="text-xs text-on-surface-variant">Cantidad: {quantity}</p>
                  </div>
                  <span className="text-sm font-bold text-primary-container flex-shrink-0">{ARS(product.price * quantity)}</span>
                </li>
              ))}
            </ul>

            <div className="border-t border-white/10 pt-sm space-y-xs">
              <div className="flex justify-between text-sm text-on-surface-variant">
                <span>Subtotal</span><span className="text-on-surface">{ARS(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-sm text-on-surface-variant">
                <span>Impuesto (10%)</span><span className="text-on-surface">{ARS(tax)}</span>
              </div>
              <div className="flex justify-between text-sm text-on-surface-variant">
                <span>Envío</span>
                <span className={shipping ? 'text-on-surface' : 'text-on-surface-variant/50 italic text-xs'}>
                  {shipping ? ARS(shipping.price) : 'Se calcula en el paso siguiente'}
                </span>
              </div>
              <div className="flex justify-between items-center pt-xs border-t border-white/10">
                <span className="font-bold text-on-surface uppercase tracking-wide text-sm">Total estimado</span>
                <span className="text-xl font-black text-primary-container drop-shadow-[0_0_8px_rgba(57,255,20,0.4)]">
                  {ARS(total)}
                </span>
              </div>
            </div>

            <div className="flex gap-sm">
              <button type="button" onClick={() => setStep('seller')}
                className="flex-1 border border-outline-variant text-on-surface-variant py-3 rounded-xl font-semibold text-sm hover:bg-white/5 cursor-pointer transition-all">
                Volver
              </button>
              <button type="button" onClick={() => setStep('shipping')}
                className="flex-[2] bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(138,43,226,0.5)] cursor-pointer transition-all">
                Continuar <i className="fa-solid fa-arrow-right" />
              </button>
            </div>
          </div>
        )}

        {/* ════════ STEP 3 — Shipping ════════ */}
        {step === 'shipping' && (
          <div className="p-md space-y-sm">
            <p className="text-xs text-white/40 uppercase tracking-wider font-semibold">Tus datos</p>
            <div className="grid grid-cols-1 gap-sm">
              {field('name',  'Nombre completo', 'text',  'Ej: Juan Pérez')}
              {field('email', 'Email',           'email', 'tu@email.com')}
              {field('phone', 'Teléfono',        'tel',   '+54 11 0000-0000')}
            </div>

            <p className="text-xs text-white/40 uppercase tracking-wider font-semibold pt-1">Dirección de entrega</p>
            <div className="grid grid-cols-1 gap-sm">
              {field('address', 'Calle y número', 'text', 'Ej: Av. Corrientes 1234')}
              <div className="grid grid-cols-2 gap-sm">
                {field('city',   'Ciudad',        'text', 'Ej: Buenos Aires')}
                {field('postal', 'Código postal', 'text', 'Ej: 1414')}
              </div>
              <div>
                <label className="block text-xs text-on-surface-variant uppercase tracking-wider mb-1">Provincia</label>
                <select
                  value={form.province}
                  onChange={e => setForm(f => ({ ...f, province: e.target.value }))}
                  className="w-full bg-surface-container border border-outline-variant rounded-lg px-sm py-xs text-sm text-on-surface outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container/30 cursor-pointer">
                  {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <ShippingRatePicker
              postalCode={form.postal}
              totalItems={totalItems}
              declaredValue={totalPrice}
              selected={shipping}
              onSelect={setShipping}
            />
            {errors.shipping && (
              <p className="text-xs text-error flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">error</span>
                {errors.shipping}
              </p>
            )}

            {shipping && (
              <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 px-4 py-3 space-y-1.5">
                <div className="flex justify-between text-xs text-white/50">
                  <span>Productos</span><span>{ARS(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-xs text-white/50">
                  <span>Impuesto (10%)</span><span>{ARS(tax)}</span>
                </div>
                <div className="flex justify-between text-xs text-white/50">
                  <span>Envío · {shipping.serviceName}</span><span>{ARS(shipping.price)}</span>
                </div>
                <div className="flex justify-between items-center pt-1.5 border-t border-purple-500/20">
                  <span className="text-sm font-bold text-white">Total</span>
                  <span className="text-lg font-black text-primary-container drop-shadow-[0_0_8px_rgba(57,255,20,0.4)]">
                    {ARS(total)}
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-sm pt-xs">
              <button type="button" onClick={() => setStep('summary')}
                className="flex-1 border border-outline-variant text-on-surface-variant py-3 rounded-xl font-semibold text-sm hover:bg-white/5 cursor-pointer transition-all">
                Volver
              </button>
              <button type="button" onClick={handleContinueToPayment} disabled={!shipping}
                className="flex-[2] bg-purple-600 hover:bg-purple-700 text-white py-3 px-lg rounded-xl font-bold text-sm flex items-center justify-center gap-xs hover:shadow-[0_0_20px_rgba(138,43,226,0.5)] cursor-pointer transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                {!shipping
                  ? <><i className="fa-solid fa-truck text-xs" /> Elegí un envío para continuar</>
                  : <><span>Continuar al pago</span><i className="fa-solid fa-arrow-right" /></>}
              </button>
            </div>
          </div>
        )}

        {/* ════════ STEP 4 — Payment ════════ */}
        {step === 'payment' && (
          <div className="p-md space-y-sm">
            <p className="text-sm text-on-surface-variant">
              Elegí cómo querés pagar tu pedido de <span className="text-white font-bold">{ARS(total)}</span>.
            </p>

            {/* Payment options */}
            <div className="space-y-2">
              {([
                {
                  id:       'transfer'    as PayMethod,
                  icon:     'fa-solid fa-building-columns',
                  color:    '#3af4ff',
                  title:    'Transferencia bancaria',
                  desc:     'Alias / CBU · Acreditación inmediata',
                  glow:     'rgba(58,244,255,0.08)',
                  border:   'rgba(58,244,255,0.25)',
                },
                {
                  id:       'cash'        as PayMethod,
                  icon:     'fa-solid fa-money-bill-wave',
                  color:    '#a855f7',
                  title:    'Efectivo',
                  desc:     'Coordinar pago directo con el vendedor',
                  glow:     'rgba(168,85,247,0.08)',
                  border:   'rgba(168,85,247,0.25)',
                },
                {
                  id:       'usdt'        as PayMethod,
                  icon:     'fa-brands fa-ethereum',
                  color:    '#26a17b',
                  title:    'USDT (Crypto)',
                  desc:     'Tether TRC-20 / ERC-20 · Sin intermediarios',
                  glow:     'rgba(38,161,123,0.08)',
                  border:   'rgba(38,161,123,0.25)',
                },
              ] as const).map(opt => {
                const active = payMethod === opt.id
                return (
                  <button key={opt.id} type="button" onClick={() => setPayMethod(opt.id)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all cursor-pointer text-left"
                    style={{
                      background: active ? opt.glow   : 'rgba(255,255,255,0.03)',
                      border:    `1.5px solid ${active ? opt.border : 'rgba(255,255,255,0.08)'}`,
                      boxShadow:  active ? `0 0 20px ${opt.color}22` : 'none',
                    }}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: active ? opt.glow   : 'rgba(255,255,255,0.06)',
                        border:    `1px solid ${active ? opt.border : 'rgba(255,255,255,0.1)'}`,
                      }}>
                      <i className={`${opt.icon} text-sm`}
                        style={{ color: active ? opt.color : 'rgba(255,255,255,0.4)' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold" style={{ color: active ? opt.color : 'rgba(255,255,255,0.85)' }}>
                        {opt.title}
                      </p>
                      <p className="text-xs text-white/40 mt-0.5">{opt.desc}</p>
                    </div>
                    <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                      style={{
                        borderColor: active ? opt.color : 'rgba(255,255,255,0.2)',
                        background:  active ? opt.color : 'transparent',
                      }}>
                      {active && <i className="fa-solid fa-check text-[8px] text-black" />}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Transfer preview */}
            {payMethod === 'transfer' && seller?.alias && (
              <div className="rounded-xl p-3 text-xs space-y-1"
                style={{ background:'rgba(6,182,212,0.08)', border:'1px solid rgba(6,182,212,0.2)' }}>
                <p className="font-bold text-cyan-300 uppercase tracking-wider">
                  <i className="fa-solid fa-building-columns mr-1" />Transferí a {seller.name}
                </p>
                {seller.bank   && <p className="text-white/60"><span className="text-white font-semibold">Banco:</span> {seller.bank}</p>}
                <p className="text-white/60"><span className="text-white font-semibold">Alias / CBU:</span> <span className="font-mono text-cyan-300">{seller.alias}</span></p>
                {seller.mpAlias && <p className="text-white/60"><span className="text-white font-semibold">MP Alias:</span> <span className="font-mono">{seller.mpAlias}</span></p>}
                <p className="text-cyan-200 font-bold pt-1">Monto: <span className="font-mono">{ARS(total)}</span></p>
              </div>
            )}

            {/* Cash note */}
            {payMethod === 'cash' && (
              <div className="rounded-xl p-3 text-xs"
                style={{ background:'rgba(168,85,247,0.08)', border:'1px solid rgba(168,85,247,0.2)' }}>
                <p className="text-purple-300 leading-relaxed">
                  El vendedor te contactará para coordinar el pago en efectivo.
                  Tendrás que abonar <span className="font-bold font-mono text-white">{ARS(total)}</span>.
                </p>
              </div>
            )}

            {/* USDT note */}
            {payMethod === 'usdt' && (
              <div className="rounded-xl p-3 text-xs space-y-1.5"
                style={{ background:'rgba(38,161,123,0.08)', border:'1px solid rgba(38,161,123,0.25)' }}>
                <p className="font-bold text-[#26a17b] uppercase tracking-wider flex items-center gap-1.5">
                  <i className="fa-brands fa-ethereum" /> USDT · Tether
                </p>
                <p className="text-white/55 leading-relaxed">
                  Al confirmar recibirás la dirección de wallet del vendedor para realizar la transferencia.
                  El monto equivalente en USDT se calculará al tipo de cambio del momento.
                </p>
              </div>
            )}

            {errors.submit && (
              <p className="text-xs text-error bg-error/10 border border-error/30 rounded-lg px-sm py-xs">
                {errors.submit}
              </p>
            )}

            <div className="flex gap-sm pt-xs">
              <button type="button" onClick={() => setStep('shipping')}
                className="flex-1 border border-outline-variant text-on-surface-variant py-3 rounded-xl font-semibold text-sm hover:bg-white/5 cursor-pointer transition-all">
                Volver
              </button>
              <button type="button" onClick={handleConfirmOrder} disabled={submitting || !payMethod}
                className="flex-[2] bg-purple-600 hover:bg-purple-700 text-white py-3 px-lg rounded-xl font-bold text-sm flex items-center justify-center gap-xs hover:shadow-[0_0_20px_rgba(138,43,226,0.5)] cursor-pointer transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                {submitting
                  ? <><span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>Procesando...</>
                  : !payMethod
                  ? 'Seleccioná un método de pago'
                  : <><i className="fa-solid fa-lock text-xs" /> Confirmar pedido</>}
              </button>
            </div>
          </div>
        )}

        {/* ════════ STEP 5 — Success ════════ */}
        {step === 'success' && (
          <div className="p-md text-center space-y-md">
            <div className="relative inline-flex items-center justify-center">
              <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl animate-pulse" />
              <div className="relative w-20 h-20 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                <i className="fa-solid fa-check text-green-400 text-3xl" />
              </div>
            </div>

            <div>
              <h3 className="text-xl font-black text-on-surface font-['Plus_Jakarta_Sans'] mb-xs">¡Pedido confirmado!</h3>
              <p className="text-on-surface-variant text-sm">Revisá tu email para los detalles del pedido.</p>
            </div>

            {/* Order number */}
            <div className="bg-surface-container rounded-xl border border-white/10 p-sm">
              <p className="text-xs text-on-surface-variant mb-xs uppercase tracking-widest">Número de orden</p>
              <p className="text-2xl font-black text-primary-container font-['Plus_Jakarta_Sans'] drop-shadow-[0_0_8px_rgba(57,255,20,0.4)]">
                {orderNumber}
              </p>
            </div>

            {/* Seller & shipping info */}
            <div className="space-y-2 text-left">
              {seller && (
                <div className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background:'rgba(138,43,226,0.08)', border:'1px solid rgba(168,85,247,0.2)' }}>
                  {seller.avatar
                    ? <img src={seller.avatar} alt={seller.name} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                    : <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-violet-900 flex items-center justify-center text-sm font-black text-white flex-shrink-0">
                        {seller.name.charAt(0)}
                      </div>
                  }
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-xs text-purple-300">Tu vendedor</p>
                    <p className="font-bold text-white text-sm">{seller.name}</p>
                    {seller.whatsapp && (
                      <a href={`https://wa.me/${seller.whatsapp}`} target="_blank" rel="noreferrer"
                        className="text-xs text-green-400 flex items-center gap-1 hover:text-green-300 transition-colors">
                        <i className="fa-brands fa-whatsapp" /> Contactar por WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              )}

              {shipping && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/8">
                  <div className="w-10 h-10 rounded-xl bg-white/8 flex items-center justify-center flex-shrink-0">
                    <i className="fa-solid fa-truck text-white/60" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white/40">Método de envío</p>
                    <p className="font-bold text-white text-sm">{shipping.carrierName} · {shipping.serviceName}</p>
                    <p className="text-xs text-white/50">
                      {shipping.daysMin === shipping.daysMax
                        ? `${shipping.daysMin} días hábiles`
                        : `${shipping.daysMin}–${shipping.daysMax} días hábiles`
                      } · {ARS(shipping.price)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* ── Transfer: bank details + comprobante upload ── */}
            {payMethod === 'transfer' && seller?.alias && (
              <div className="rounded-xl text-left"
                style={{ background:'rgba(58,244,255,0.06)', border:'1px solid rgba(58,244,255,0.2)', padding:'16px' }}>
                <p className="font-bold text-cyan-300 text-sm uppercase tracking-wider mb-3">
                  <i className="fa-solid fa-building-columns mr-1.5" />Datos para tu transferencia
                </p>
                <div className="space-y-1.5 text-xs mb-4">
                  {seller.bank    && <p className="text-white/60"><span className="text-white font-semibold">Banco:</span> {seller.bank}</p>}
                  <p className="text-white/60"><span className="text-white font-semibold">Alias / CBU:</span> <span className="font-mono text-cyan-300 text-sm">{seller.alias}</span></p>
                  {seller.mpAlias && <p className="text-white/60"><span className="text-white font-semibold">MP Alias:</span> <span className="font-mono">{seller.mpAlias}</span></p>}
                  <p className="text-cyan-200 font-bold pt-1 text-sm">Monto: <span className="font-mono">{ARS(total)}</span></p>
                </div>

                {/* Comprobante upload section */}
                <div className="border-t border-cyan-500/20 pt-3">
                  <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden"
                    onChange={e => {
                      const f = e.target.files?.[0]; if (f) handleComprovanteUpload(f)
                      e.target.value = ''
                    }} />

                  {comprState === 'idle' && (
                    <>
                      <p className="text-xs text-white/50 mb-2.5">
                        Una vez realizada la transferencia, podés cargar el comprobante:
                      </p>
                      <button type="button" onClick={() => fileRef.current?.click()}
                        className="w-full py-2.5 rounded-xl text-xs font-semibold text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/10 transition-all cursor-pointer flex items-center justify-center gap-2">
                        <i className="fa-solid fa-upload" /> Cargar comprobante
                      </button>
                    </>
                  )}
                  {comprState === 'uploading' && (
                    <div className="flex items-center justify-center gap-2 py-2.5 text-xs text-white/50">
                      <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                      Subiendo comprobante...
                    </div>
                  )}
                  {comprState === 'done' && comprUrl && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-green-400">
                        <i className="fa-solid fa-circle-check" />
                        Comprobante recibido. El vendedor verificará tu pago.
                      </div>
                      {comprUrl.toLowerCase().endsWith('.pdf') ? (
                        <a href={comprUrl} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-cyan-300 underline">
                          <i className="fa-solid fa-file-pdf text-[10px]" /> Ver PDF
                        </a>
                      ) : (
                        <img src={comprUrl} alt="Comprobante" className="w-full max-h-40 object-contain rounded-lg border border-white/10" />
                      )}
                      <button type="button" onClick={() => fileRef.current?.click()}
                        className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/60 transition-colors cursor-pointer">
                        <i className="fa-solid fa-rotate text-[10px]" /> Cambiar comprobante
                      </button>
                    </div>
                  )}
                  {comprState === 'error' && (
                    <div className="space-y-2">
                      <p className="text-xs text-white/50">
                        Una vez realizada la transferencia, podés cargar el comprobante:
                      </p>
                      <div className="flex items-center justify-between text-xs text-red-400">
                        <span className="flex items-center gap-1.5">
                          <i className="fa-solid fa-circle-xmark" /> Error al subir. Intentá de nuevo.
                        </span>
                      </div>
                      <button type="button" onClick={() => fileRef.current?.click()}
                        className="w-full py-2.5 rounded-xl text-xs font-semibold text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/10 transition-all cursor-pointer flex items-center justify-center gap-2">
                        <i className="fa-solid fa-upload" /> Reintentar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Cash: next steps ── */}
            {payMethod === 'cash' && (
              <div className="rounded-xl text-left p-4"
                style={{ background:'rgba(168,85,247,0.06)', border:'1px solid rgba(168,85,247,0.2)' }}>
                <p className="text-sm font-bold text-purple-300 mb-1.5">
                  <i className="fa-solid fa-money-bill-wave mr-1.5" />Próximos pasos
                </p>
                <p className="text-xs text-white/55 leading-relaxed">
                  El vendedor se pondrá en contacto para coordinar el pago en efectivo de{' '}
                  <span className="font-bold text-white">{ARS(total)}</span>.
                  {seller?.whatsapp && ' También podés contactarlo directamente por WhatsApp.'}
                </p>
              </div>
            )}

            {/* ── USDT: wallet + comprobante upload ── */}
            {payMethod === 'usdt' && (
              <div className="rounded-xl text-left"
                style={{ background:'rgba(38,161,123,0.06)', border:'1px solid rgba(38,161,123,0.25)', padding:'16px' }}>
                <p className="font-bold text-[#26a17b] text-sm uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <i className="fa-brands fa-ethereum" /> Pago con USDT
                </p>

                {/* Wallet address from seller (stored in mpAlias field for now) */}
                {seller?.mpAlias ? (
                  <div className="space-y-2 text-xs mb-4">
                    <p className="text-white/60">Enviá el monto equivalente en USDT a esta dirección de wallet:</p>
                    <div className="flex items-center gap-2 bg-black/30 rounded-lg px-3 py-2 border border-[#26a17b]/20">
                      <span className="font-mono text-[#26a17b] text-[11px] flex-1 break-all">{seller.mpAlias}</span>
                      <button type="button"
                        onClick={() => navigator.clipboard.writeText(seller!.mpAlias)}
                        className="flex-shrink-0 text-white/40 hover:text-white/80 transition-colors cursor-pointer"
                        title="Copiar dirección">
                        <i className="fa-regular fa-copy text-xs" />
                      </button>
                    </div>
                    <p className="text-white/40 leading-relaxed">
                      Red: <span className="text-white font-semibold">TRC-20 (Tron)</span> o <span className="text-white font-semibold">ERC-20 (Ethereum)</span>.
                      Confirmá la red antes de enviar. El tipo de cambio se acuerda con el vendedor.
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-white/50 mb-4">
                    El vendedor te enviará la dirección de wallet por WhatsApp para coordinar el pago.
                  </p>
                )}

                {/* Comprobante upload */}
                <div className="border-t border-[#26a17b]/20 pt-3">
                  {comprState === 'idle' && (
                    <>
                      <p className="text-xs text-white/50 mb-2.5">
                        Una vez realizada la transferencia, subí el hash o captura de confirmación:
                      </p>
                      <button type="button" onClick={() => fileRef.current?.click()}
                        className="w-full py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center justify-center gap-2"
                        style={{ color:'#26a17b', borderColor:'rgba(38,161,123,0.35)' }}>
                        <i className="fa-solid fa-upload" /> Cargar comprobante / hash
                      </button>
                    </>
                  )}
                  {comprState === 'uploading' && (
                    <div className="flex items-center justify-center gap-2 py-2.5 text-xs text-white/50">
                      <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                      Subiendo...
                    </div>
                  )}
                  {comprState === 'done' && comprUrl && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-green-400">
                        <i className="fa-solid fa-circle-check" />
                        Comprobante recibido. El vendedor verificará la transacción.
                      </div>
                      {comprUrl.toLowerCase().endsWith('.pdf') ? (
                        <a href={comprUrl} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs underline"
                          style={{ color:'#26a17b' }}>
                          <i className="fa-solid fa-file-pdf text-[10px]" /> Ver PDF
                        </a>
                      ) : (
                        <img src={comprUrl} alt="Comprobante" className="w-full max-h-40 object-contain rounded-lg border border-white/10" />
                      )}
                      <button type="button" onClick={() => fileRef.current?.click()}
                        className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/60 transition-colors cursor-pointer">
                        <i className="fa-solid fa-rotate text-[10px]" /> Cambiar comprobante
                      </button>
                    </div>
                  )}
                  {comprState === 'error' && (
                    <div className="space-y-2">
                      <p className="text-xs text-white/50 mb-2.5">
                        Una vez realizada la transferencia, subí el hash o captura de confirmación:
                      </p>
                      <div className="text-xs text-red-400 flex items-center gap-1.5">
                        <i className="fa-solid fa-circle-xmark" /> Error al subir. Intentá de nuevo.
                      </div>
                      <button type="button" onClick={() => fileRef.current?.click()}
                        className="w-full py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center justify-center gap-2"
                        style={{ color:'#26a17b', borderColor:'rgba(38,161,123,0.35)' }}>
                        <i className="fa-solid fa-upload" /> Reintentar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-sm">
              <a href={`/seguimiento/${orderNumber}`} target="_blank" rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm border border-purple-500/40 text-purple-300 hover:bg-purple-500/10 transition-all cursor-pointer">
                <i className="fa-solid fa-location-dot text-xs" /> Seguir pedido
              </a>
              <button type="button" onClick={handleClose}
                className="flex-[2] bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-bold text-sm hover:shadow-[0_0_20px_rgba(138,43,226,0.5)] cursor-pointer transition-all">
                Volver a la tienda
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
