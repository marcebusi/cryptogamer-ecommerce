import { useState, useEffect } from 'react'
import { useCart } from '../../context/CartContext'
import './CheckoutModal.css'

type Step = 'summary' | 'shipping' | 'success'

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

export default function CheckoutModal() {
  const { items, totalPrice, clearCart, isCheckoutOpen, closeCheckout } = useCart()
  const [step, setStep] = useState<Step>('summary')
  const [orderNumber] = useState(generateOrderNumber)
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    address: '', city: '', province: 'Buenos Aires', postal: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const tax = totalPrice * 0.1
  const total = totalPrice + tax

  useEffect(() => {
    document.body.style.overflow = isCheckoutOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isCheckoutOpen])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  })

  if (!isCheckoutOpen) return null

  const handleClose = () => {
    closeCheckout()
    if (step === 'success') {
      clearCart()
      setTimeout(() => setStep('summary'), 300)
    }
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Requerido'
    if (!form.email.includes('@')) e.email = 'Email inválido'
    if (!form.phone.trim()) e.phone = 'Requerido'
    if (!form.address.trim()) e.address = 'Requerido'
    if (!form.city.trim()) e.city = 'Requerido'
    if (!form.postal.trim()) e.postal = 'Requerido'
    return e
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setStep('success')
  }

  const field = (
    key: keyof typeof form,
    label: string,
    type = 'text',
    placeholder = ''
  ) => (
    <div>
      <label className="block text-xs text-on-surface-variant uppercase tracking-wider mb-1">
        {label}
      </label>
      <input
        type={type}
        value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        placeholder={placeholder}
        className={`w-full bg-surface-container border rounded-lg px-sm py-xs text-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:ring-1 transition-all ${
          errors[key]
            ? 'border-error focus:ring-error'
            : 'border-outline-variant focus:border-primary-container focus:ring-primary-container/30'
        }`}
      />
      {errors[key] && <p className="text-xs text-error mt-0.5">{errors[key]}</p>}
    </div>
  )

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/75 backdrop-blur-md" onClick={handleClose} />

      {/* Modal */}
      <div className="checkout-modal relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-purple-500/30 shadow-[0_0_80px_rgba(138,43,226,0.25)]">

        {/* Top glow line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/60 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between px-md py-sm border-b border-white/10">
          <div className="flex items-center gap-xs">
            <span className="material-symbols-outlined text-primary-container text-2xl">
              {step === 'success' ? 'check_circle' : 'shopping_cart_checkout'}
            </span>
            <div>
              <h2 className="font-bold text-on-surface font-['Plus_Jakarta_Sans']">
                {step === 'summary' ? 'Resumen del pedido' : step === 'shipping' ? 'Datos de envío' : '¡Pedido confirmado!'}
              </h2>
              {step !== 'success' && (
                <p className="text-xs text-on-surface-variant">
                  Paso {step === 'summary' ? '1' : '2'} de 2
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Cerrar"
          >
            <span className="material-symbols-outlined text-on-surface-variant text-xl">close</span>
          </button>
        </div>

        {/* Step indicator */}
        {step !== 'success' && (
          <div className="flex px-md pt-sm gap-xs">
            {['summary', 'shipping'].map((s, i) => (
              <div key={s} className="flex items-center gap-xs flex-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                  s === step ? 'bg-primary-container text-on-primary' : i < ['summary','shipping'].indexOf(step) ? 'bg-primary-container/30 text-primary-container' : 'bg-surface-container-high text-on-surface-variant'
                }`}>
                  {i + 1}
                </div>
                {i === 0 && <div className={`flex-1 h-px transition-all ${step === 'shipping' ? 'bg-primary-container/50' : 'bg-white/10'}`} />}
              </div>
            ))}
          </div>
        )}

        {/* STEP 1: Summary */}
        {step === 'summary' && (
          <div className="p-md space-y-md">
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
                  <span className="text-sm font-bold text-primary-container flex-shrink-0">
                    ${(product.price * quantity).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="border-t border-white/10 pt-sm space-y-xs">
              <div className="flex justify-between text-sm text-on-surface-variant">
                <span>Subtotal</span>
                <span className="text-on-surface">${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-on-surface-variant">
                <span>Impuesto (10%)</span>
                <span className="text-on-surface">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-on-surface-variant">
                <span>Envío</span>
                <span className="text-primary-container font-semibold">
                  {totalPrice >= 200 ? 'GRATIS' : '$15.00'}
                </span>
              </div>
              <div className="flex justify-between items-center pt-xs border-t border-white/10">
                <span className="font-bold text-on-surface uppercase tracking-wide text-sm">Total</span>
                <span className="text-xl font-black text-primary-container drop-shadow-[0_0_8px_rgba(57,255,20,0.4)]">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={() => setStep('shipping')}
              className="w-full bg-primary-container text-on-primary py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-xs hover:shadow-[0_0_20px_rgba(57,255,20,0.5)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              Continuar
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        )}

        {/* STEP 2: Shipping form */}
        {step === 'shipping' && (
          <form onSubmit={handleSubmit} className="p-md space-y-sm">
            <div className="grid grid-cols-1 gap-sm">
              {field('name', 'Nombre completo', 'text', 'Ej: Juan Pérez')}
              {field('email', 'Email', 'email', 'tu@email.com')}
              {field('phone', 'Teléfono', 'tel', '+54 11 0000-0000')}
              {field('address', 'Dirección', 'text', 'Calle y número')}
              <div className="grid grid-cols-2 gap-sm">
                {field('city', 'Ciudad', 'text', 'Ej: Rosario')}
                {field('postal', 'Código postal', 'text', 'Ej: 1000')}
              </div>
              <div>
                <label className="block text-xs text-on-surface-variant uppercase tracking-wider mb-1">
                  Provincia
                </label>
                <select
                  value={form.province}
                  onChange={e => setForm(f => ({ ...f, province: e.target.value }))}
                  className="w-full bg-surface-container border border-outline-variant rounded-lg px-sm py-xs text-sm text-on-surface outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container/30 cursor-pointer"
                >
                  {PROVINCES.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-sm pt-xs">
              <button
                type="button"
                onClick={() => setStep('summary')}
                className="flex-1 border border-outline-variant text-on-surface-variant py-3 rounded-xl font-semibold text-sm hover:bg-white/5 active:scale-95 transition-all cursor-pointer"
              >
                Volver
              </button>
              <button
                type="submit"
                className="flex-2 flex-grow bg-primary-container text-on-primary py-3 px-lg rounded-xl font-bold text-sm flex items-center justify-center gap-xs hover:shadow-[0_0_20px_rgba(57,255,20,0.5)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">lock</span>
                Confirmar pedido
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Success */}
        {step === 'success' && (
          <div className="p-md text-center space-y-md">
            <div className="relative inline-flex items-center justify-center">
              <div className="absolute inset-0 bg-primary-container/20 rounded-full blur-xl animate-pulse" />
              <div className="relative w-20 h-20 rounded-full bg-primary-container/10 border border-primary-container/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary-container text-4xl">check_circle</span>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-black text-on-surface font-['Plus_Jakarta_Sans'] mb-xs">
                ¡Pedido confirmado!
              </h3>
              <p className="text-on-surface-variant text-sm">
                Tu pedido fue recibido y está siendo procesado.
              </p>
            </div>

            <div className="bg-surface-container rounded-xl border border-white/10 p-sm">
              <p className="text-xs text-on-surface-variant mb-xs uppercase tracking-widest">Número de orden</p>
              <p className="text-2xl font-black text-primary-container font-['Plus_Jakarta_Sans'] drop-shadow-[0_0_8px_rgba(57,255,20,0.4)]">
                {orderNumber}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-sm text-sm">
              <div className="bg-surface-container rounded-xl border border-white/10 p-sm">
                <span className="material-symbols-outlined text-tertiary-container text-xl mb-xs block">local_shipping</span>
                <p className="font-semibold text-on-surface">Envío</p>
                <p className="text-on-surface-variant text-xs">2–4 días hábiles</p>
              </div>
              <div className="bg-surface-container rounded-xl border border-white/10 p-sm">
                <span className="material-symbols-outlined text-primary-container text-xl mb-xs block">email</span>
                <p className="font-semibold text-on-surface">Confirmación</p>
                <p className="text-on-surface-variant text-xs">Enviada a {form.email || 'tu email'}</p>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="w-full bg-primary-container text-on-primary py-3 rounded-xl font-bold text-sm hover:shadow-[0_0_20px_rgba(57,255,20,0.5)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              Volver a la tienda
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
