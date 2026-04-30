import { useState, useEffect } from 'react'
import { useCart } from '../../context/CartContext'
import SellerPicker from '../checkout/SellerPicker'
import './CheckoutModal.css'

type Step = 'seller' | 'summary' | 'shipping' | 'success'

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

function generateOrderNumber() {
  return `CG-${Math.floor(Math.random() * 900000) + 100000}`
}

const STEP_LABELS: Record<Step, string> = {
  seller: 'Elegí tu vendedor', summary: 'Resumen del pedido',
  shipping: 'Datos de envío',  success: '¡Pedido confirmado!',
}
const VISIBLE: Step[] = ['seller', 'summary', 'shipping']

export default function CheckoutModal() {
  const { items, totalPrice, clearCart, isCheckoutOpen, closeCheckout } = useCart()
  const [step, setStep]     = useState<Step>('seller')
  const [seller, setSeller] = useState<Seller | null>(null)
  const [orderNumber]       = useState(generateOrderNumber)
  const [form, setForm]     = useState({
    name: '', email: '', phone: '',
    address: '', city: '', province: 'Buenos Aires', postal: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const tax   = totalPrice * 0.1
  const total = totalPrice + tax

  useEffect(() => {
    document.body.style.overflow = isCheckoutOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isCheckoutOpen])

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  })

  if (!isCheckoutOpen) return null

  const handleClose = () => {
    closeCheckout()
    if (step === 'success') {
      clearCart()
      setTimeout(() => { setStep('seller'); setSeller(null) }, 300)
    }
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim())       e.name    = 'Requerido'
    if (!form.email.includes('@')) e.email  = 'Email inválido'
    if (!form.phone.trim())      e.phone   = 'Requerido'
    if (!form.address.trim())    e.address = 'Requerido'
    if (!form.city.trim())       e.city    = 'Requerido'
    if (!form.postal.trim())     e.postal  = 'Requerido'
    return e
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setStep('success')
  }

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

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-md" onClick={handleClose} />

      <div className="checkout-modal relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-purple-500/30 shadow-[0_0_80px_rgba(138,43,226,0.25)]">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/60 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between px-md py-sm border-b border-white/10">
          <div className="flex items-center gap-xs">
            <div className="w-8 h-8 rounded-xl bg-purple-600/20 flex items-center justify-center flex-shrink-0">
              {step === 'success' ? <i className="fa-solid fa-check text-green-400 text-sm" />
               : step === 'seller' ? <i className="fa-solid fa-users text-purple-400 text-sm" />
               : <i className="fa-solid fa-bag-shopping text-purple-400 text-sm" />}
            </div>
            <div>
              <h2 className="font-bold text-on-surface font-['Plus_Jakarta_Sans'] text-sm">{STEP_LABELS[step]}</h2>
              {step !== 'success' && <p className="text-xs text-on-surface-variant">Paso {vi + 1} de {VISIBLE.length}</p>}
            </div>
          </div>
          <button onClick={handleClose} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer" aria-label="Cerrar">
            <span className="material-symbols-outlined text-on-surface-variant text-xl">close</span>
          </button>
        </div>

        {/* Step dots */}
        {step !== 'success' && (
          <div className="flex px-md pt-sm gap-xs">
            {VISIBLE.map((s, i) => (
              <div key={s} className="flex items-center gap-xs flex-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                  s === step ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(138,43,226,0.5)]'
                  : i < vi ? 'bg-purple-600/30 text-purple-300' : 'bg-surface-container-high text-on-surface-variant'
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

        {/* ── STEP 1: Seller ── */}
        {step === 'seller' && (
          <div className="p-md space-y-md">
            <p className="text-sm text-on-surface-variant">
              Elegí con qué vendedor querés realizar tu compra. Cada uno tiene sus propios datos de pago.
            </p>
            <SellerPicker selected={seller} onSelect={setSeller} />
            <button
              onClick={() => { if (seller) setStep('summary') }}
              disabled={!seller}
              className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: seller ? 'linear-gradient(135deg,#7c3aed,#5b21b6)' : 'rgba(255,255,255,0.05)',
                color: seller ? 'white' : 'rgba(255,255,255,0.4)',
                boxShadow: seller ? '0 0 24px rgba(138,43,226,0.4)' : 'none',
              }}
            >
              {seller ? <><span>Continuar con {seller.name}</span><i className="fa-solid fa-arrow-right" /></> : 'Seleccioná un vendedor para continuar'}
            </button>
          </div>
        )}

        {/* ── STEP 2: Summary ── */}
        {step === 'summary' && (
          <div className="p-md space-y-md">
            {seller && (
              <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background:'rgba(138,43,226,0.1)', border:'1px solid rgba(168,85,247,0.25)' }}>
                {seller.avatar
                  ? <img src={seller.avatar} alt={seller.name} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                  : <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-violet-900 flex items-center justify-center text-sm font-black text-white flex-shrink-0">{seller.name.charAt(0)}</div>
                }
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-purple-300 font-semibold uppercase tracking-wider">Vendedor seleccionado</p>
                  <p className="text-sm font-bold text-white truncate">{seller.name}</p>
                </div>
                <button onClick={() => setStep('seller')} className="text-xs text-purple-400 hover:text-purple-300 cursor-pointer transition-colors font-semibold">Cambiar</button>
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
                  <span className="text-sm font-bold text-primary-container flex-shrink-0">${(product.price * quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>

            <div className="border-t border-white/10 pt-sm space-y-xs">
              <div className="flex justify-between text-sm text-on-surface-variant"><span>Subtotal</span><span className="text-on-surface">${totalPrice.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm text-on-surface-variant"><span>Impuesto (10%)</span><span className="text-on-surface">${tax.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm text-on-surface-variant"><span>Envío</span><span className="text-primary-container font-semibold">{totalPrice >= 200 ? 'GRATIS' : '$15.00'}</span></div>
              <div className="flex justify-between items-center pt-xs border-t border-white/10">
                <span className="font-bold text-on-surface uppercase tracking-wide text-sm">Total</span>
                <span className="text-xl font-black text-primary-container drop-shadow-[0_0_8px_rgba(57,255,20,0.4)]">${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-sm">
              <button onClick={() => setStep('seller')} className="flex-1 border border-outline-variant text-on-surface-variant py-3 rounded-xl font-semibold text-sm hover:bg-white/5 cursor-pointer transition-all">Volver</button>
              <button onClick={() => setStep('shipping')} className="flex-[2] bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(138,43,226,0.5)] cursor-pointer transition-all">
                Continuar <i className="fa-solid fa-arrow-right" />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Shipping ── */}
        {step === 'shipping' && (
          <form onSubmit={handleSubmit} className="p-md space-y-sm">
            <div className="grid grid-cols-1 gap-sm">
              {field('name',    'Nombre completo', 'text',  'Ej: Juan Pérez')}
              {field('email',   'Email',           'email', 'tu@email.com')}
              {field('phone',   'Teléfono',        'tel',   '+54 11 0000-0000')}
              {field('address', 'Dirección',       'text',  'Calle y número')}
              <div className="grid grid-cols-2 gap-sm">
                {field('city',   'Ciudad',        'text', 'Ej: Rosario')}
                {field('postal', 'Código postal', 'text', 'Ej: 1000')}
              </div>
              <div>
                <label className="block text-xs text-on-surface-variant uppercase tracking-wider mb-1">Provincia</label>
                <select value={form.province} onChange={e => setForm(f => ({ ...f, province: e.target.value }))} className="w-full bg-surface-container border border-outline-variant rounded-lg px-sm py-xs text-sm text-on-surface outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container/30 cursor-pointer">
                  {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            {/* Transfer banner */}
            {seller?.alias && (
              <div className="rounded-xl p-3 text-xs space-y-1" style={{ background:'rgba(6,182,212,0.08)', border:'1px solid rgba(6,182,212,0.2)' }}>
                <p className="font-bold text-cyan-300 uppercase tracking-wider"><i className="fa-solid fa-building-columns mr-1" />Transferencia a {seller.name}</p>
                {seller.bank && <p className="text-on-surface-variant"><span className="text-white font-semibold">Billetera:</span> {seller.bank}</p>}
                <p className="text-on-surface-variant"><span className="text-white font-semibold">Alias / CBU:</span> <span className="font-mono text-cyan-300">{seller.alias}</span></p>
                {seller.mpAlias && <p className="text-on-surface-variant"><span className="text-white font-semibold">MP:</span> <span className="font-mono">{seller.mpAlias}</span></p>}
              </div>
            )}

            <div className="flex gap-sm pt-xs">
              <button type="button" onClick={() => setStep('summary')} className="flex-1 border border-outline-variant text-on-surface-variant py-3 rounded-xl font-semibold text-sm hover:bg-white/5 cursor-pointer transition-all">Volver</button>
              <button type="submit" className="flex-[2] bg-purple-600 hover:bg-purple-700 text-white py-3 px-lg rounded-xl font-bold text-sm flex items-center justify-center gap-xs hover:shadow-[0_0_20px_rgba(138,43,226,0.5)] cursor-pointer transition-all">
                <i className="fa-solid fa-lock text-xs" /> Confirmar pedido
              </button>
            </div>
          </form>
        )}

        {/* ── STEP 4: Success ── */}
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
              <p className="text-on-surface-variant text-sm">Tu pedido fue recibido y está siendo procesado.</p>
            </div>

            {seller && (
              <div className="flex items-center justify-center gap-3 p-3 rounded-xl" style={{ background:'rgba(138,43,226,0.08)', border:'1px solid rgba(168,85,247,0.2)' }}>
                {seller.avatar
                  ? <img src={seller.avatar} alt={seller.name} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                  : <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-violet-900 flex items-center justify-center text-sm font-black text-white flex-shrink-0">{seller.name.charAt(0)}</div>
                }
                <div className="text-left">
                  <p className="text-xs text-purple-300">Tu vendedor</p>
                  <p className="font-bold text-white text-sm">{seller.name}</p>
                  {seller.whatsapp && (
                    <a href={`https://wa.me/${seller.whatsapp}`} target="_blank" rel="noreferrer" className="text-xs text-green-400 flex items-center gap-1 hover:text-green-300 transition-colors">
                      <i className="fa-brands fa-whatsapp" /> Contactar por WhatsApp
                    </a>
                  )}
                </div>
              </div>
            )}

            <div className="bg-surface-container rounded-xl border border-white/10 p-sm">
              <p className="text-xs text-on-surface-variant mb-xs uppercase tracking-widest">Número de orden</p>
              <p className="text-2xl font-black text-primary-container font-['Plus_Jakarta_Sans'] drop-shadow-[0_0_8px_rgba(57,255,20,0.4)]">{orderNumber}</p>
            </div>

            <button onClick={handleClose} className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-bold text-sm hover:shadow-[0_0_20px_rgba(138,43,226,0.5)] cursor-pointer transition-all">
              Volver a la tienda
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
