import { useState, useEffect } from 'react'
import { useCart } from '../../context/CartContext'
import type { Product, ProductCondition } from '../../types'
import SpecsGrid from './SpecsGrid'
import './ProductInfo.css'

interface ProductInfoProps {
  product: Product
}

/* ── Condition meta ──────────────────────────────── */
const conditionMeta: Record<ProductCondition, { label: string; bar: string; text: string; glow: string; icon: string }> = {
  'new':       { label: 'Nuevo',      bar: 'bg-primary-container',   text: 'text-primary-container',  glow: 'shadow-[0_0_8px_rgba(57,255,20,0.5)]',  icon: 'new_releases' },
  'like-new':  { label: 'Como Nuevo', bar: 'bg-tertiary-container',  text: 'text-tertiary-container', glow: 'shadow-[0_0_8px_rgba(58,244,255,0.5)]', icon: 'grade' },
  'excellent': { label: 'Excelente',  bar: 'bg-tertiary-container',  text: 'text-tertiary-container', glow: 'shadow-[0_0_8px_rgba(58,244,255,0.5)]', icon: 'verified' },
  'good':      { label: 'Bueno',      bar: 'bg-yellow-400',          text: 'text-yellow-400',         glow: 'shadow-[0_0_8px_rgba(250,204,21,0.5)]', icon: 'thumb_up' },
  'fair':      { label: 'Aceptable',  bar: 'bg-secondary-container', text: 'text-secondary-container',glow: 'shadow-[0_0_8px_rgba(255,74,141,0.5)]', icon: 'info' },
}

/* ── WhatsApp helpers ────────────────────────────── */
interface Seller { id: string; name: string; bio: string; avatar: string; whatsapp: string }

function waUrl(whatsapp: string, productName: string, price: number) {
  const digits = whatsapp.replace(/\D/g, '')
  const number = digits.startsWith('549') || digits.startsWith('54') ? digits : `549${digits}`
  const msg = encodeURIComponent(
    `¡Hola! Me interesa el producto "${productName}" (${new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:0}).format(price)}). ¿Está disponible?`
  )
  return `https://wa.me/${number}?text=${msg}`
}

function SellerAvatar({ seller }: { seller: Seller }) {
  if (seller.avatar)
    return <img src={seller.avatar} alt={seller.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
  return (
    <div className="w-9 h-9 rounded-full bg-[#25D366]/20 flex items-center justify-center flex-shrink-0 text-[#25D366] font-bold text-sm border border-[#25D366]/30">
      {seller.name.charAt(0).toUpperCase()}
    </div>
  )
}

/* ── ARS formatter ───────────────────────────────── */
const ARS = (n: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)

/* ── Main component ──────────────────────────────── */
export default function ProductInfo({ product }: ProductInfoProps) {
  const { addToCart, openCart } = useCart()

  /* Default to 'new' so the condition card always renders */
  const cond  = (product.condition ?? 'new') as ProductCondition
  const meta  = conditionMeta[cond]
  const score = product.conditionScore ?? 100

  /* WhatsApp modal state */
  const [showWA,   setShowWA]   = useState(false)
  const [sellers,  setSellers]  = useState<Seller[]>([])
  const [waLoading,setWaLoading]= useState(false)

  useEffect(() => {
    if (!showWA) return
    setWaLoading(true)
    fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:3001'}/api/sellers`)
      .then(r => r.json())
      .then(d => setSellers(Array.isArray(d) ? d : []))
      .catch(() => setSellers([]))
      .finally(() => setWaLoading(false))
  }, [showWA])

  const handleSelectSeller = (seller: Seller) => {
    fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:3001'}/api/tracking/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'wa_click', sellerId: seller.id }),
    }).catch(() => {})
    window.open(waUrl(seller.whatsapp, product.name, product.price), '_blank', 'noopener,noreferrer')
    setShowWA(false)
  }

  const handleAddToCart = () => { addToCart(product); openCart() }

  return (
    <div className="lg:col-span-6 flex flex-col gap-md">

      {/* ── Badge row ──────────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Stock status */}
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
          product.inStock
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
            : 'bg-red-500/10 text-red-400 border-red-500/25'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${product.inStock ? 'bg-emerald-400' : 'bg-red-400'}`}/>
          {product.inStock ? 'En stock' : 'Sin stock'}
        </span>

        {/* Pre-owned badge */}
        {cond !== 'new' && (
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${meta.text} bg-purple-500/10 border-purple-500/25`}>
            <span className="material-symbols-outlined text-xs">{meta.icon}</span>
            {meta.label}
          </span>
        )}

        {/* Category chip */}
        {product.subcategory && (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-white/50 uppercase tracking-widest">
            {product.subcategory}
          </span>
        )}
      </div>

      {/* ── Title ──────────────────────────────── */}
      <h1 className="text-3xl md:text-4xl font-black text-on-background leading-tight font-['Plus_Jakarta_Sans']">
        {product.name.split(' ').slice(0, -1).join(' ')}{' '}
        <span className="text-purple-400 italic block md:inline">
          {product.name.split(' ').slice(-1)[0]}
        </span>
      </h1>

      {/* ── Price ──────────────────────────────── */}
      <div className="flex items-center gap-sm flex-wrap">
        <span className="text-4xl font-black text-secondary-container drop-shadow-[0_0_10px_rgba(255,74,141,0.5)]">
          {ARS(product.price)}
        </span>
        {product.originalPrice && (
          <>
            <span className="text-on-surface-variant line-through text-lg">{ARS(product.originalPrice)}</span>
            <span className="px-2 py-0.5 bg-secondary-container text-on-secondary text-xs font-bold rounded-full shadow-[0_0_10px_rgba(255,74,141,0.4)]">
              AHORRÁS {ARS(product.originalPrice - product.price)}
            </span>
          </>
        )}
      </div>

      {/* ── Bloque simétrico (descripción + condition + botones + garantías) ── */}
      <div className="flex flex-col gap-3 w-full">

        {/* Descripción */}
        <p className="text-on-surface-variant text-sm leading-relaxed border-l-2 border-purple-500/30 pl-sm">
          {product.description}
        </p>

        {/* Condition card — always visible */}
        <div className="condition-card rounded-2xl border border-white/10 overflow-hidden">
          <div className="flex items-center justify-between px-md py-sm bg-white/[0.03] border-b border-white/8">
            <div className="flex items-center gap-xs">
              <span className={`material-symbols-outlined text-lg ${meta.text}`}>{meta.icon}</span>
              <span className={`font-bold text-sm font-['Plus_Jakarta_Sans'] ${meta.text}`}>
                Producto {meta.label}
              </span>
            </div>
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-bold ${meta.text}`}
              style={{ borderColor: 'currentColor', opacity: 0.9 }}>
              <span className="material-symbols-outlined text-xs">check_circle</span>
              Verificado
            </div>
          </div>
          <div className="p-md space-y-sm">
            <p className="text-sm text-on-surface-variant leading-relaxed">
              {product.conditionDescription ?? 'Esta unidad ha sido inspeccionada y certificada por nuestros técnicos. Desgaste cosmético mínimo. Incluye todos los accesorios originales.'}
            </p>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[11px] text-on-surface-variant uppercase tracking-widest font-semibold">Calidad del producto</span>
                <span className={`text-xs font-black ${meta.text}`}>{score}%</span>
              </div>
              <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-700 ${meta.bar} ${meta.glow}`} style={{ width: `${score}%` }} />
              </div>
            </div>
            {product.conditionTags && product.conditionTags.length > 0 && (
              <div className="flex gap-xs flex-wrap">
                {product.conditionTags.map(tag => (
                  <span key={tag} className="flex items-center gap-1 px-sm py-1 bg-surface-container-high text-on-surface-variant text-xs rounded-full border border-white/10">
                    <span className="material-symbols-outlined text-xs text-primary-container">check</span>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CTA buttons */}
        <div className="space-y-2.5">
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className={`w-full py-3 px-5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
              product.inStock
                ? 'bg-secondary-container text-on-secondary hover:shadow-[0_0_24px_rgba(255,74,141,0.5)] hover:brightness-110 cursor-pointer'
                : 'bg-surface-container-high text-on-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-base">{product.inStock ? 'shopping_bag' : 'remove_shopping_cart'}</span>
            {product.inStock ? 'Agregar al Carrito' : 'Sin Stock'}
          </button>

          <button
            onClick={() => setShowWA(true)}
            className="w-full bg-transparent border border-[#25D366]/40 text-[#25D366] py-3 px-5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#25D366]/10 hover:border-[#25D366]/70 hover:shadow-[0_0_20px_rgba(37,211,102,0.2)] transition-all active:scale-95 cursor-pointer"
          >
            <i className="fa-brands fa-whatsapp text-base" />
            Consultar por WhatsApp
          </button>
        </div>

        {/* Guarantees */}
        <div className="flex gap-2">
          <div className="flex items-center gap-3 px-4 py-3.5 bg-surface-container rounded-xl border border-white/5 flex-1">
            <span className="material-symbols-outlined text-tertiary-container text-2xl flex-shrink-0">local_shipping</span>
            <div>
              <p className="text-sm font-bold text-on-surface leading-tight">Envío Gratis</p>
              <p className="text-xs text-on-surface-variant mt-0.5">Llega en 2–3 días</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-3.5 bg-surface-container rounded-xl border border-white/5 flex-1">
            <span className="material-symbols-outlined text-tertiary-container text-2xl flex-shrink-0">workspace_premium</span>
            <div>
              <p className="text-sm font-bold text-on-surface leading-tight">Garantía 90 días</p>
              <p className="text-xs text-on-surface-variant mt-0.5">Protección total</p>
            </div>
          </div>
        </div>

      </div>

      {/* ── Specs ──────────────────────────────── */}
      {product.specs && <SpecsGrid specs={product.specs} />}

      {/* ── WhatsApp modal ─────────────────────── */}
      {showWA && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowWA(false)} />
          <div className="relative w-full max-w-sm bg-[#111318] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#25D366]/15 flex items-center justify-center">
                  <i className="fa-brands fa-whatsapp text-[#25D366] text-base" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Consultar por WhatsApp</p>
                  <p className="text-xs text-white/40 truncate max-w-[200px]">{product.name}</p>
                </div>
              </div>
              <button onClick={() => setShowWA(false)}
                className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-white/50 text-base">close</span>
              </button>
            </div>

            {/* Sellers */}
            <div className="px-4 py-3 space-y-2">
              {waLoading ? (
                <div className="py-6 flex items-center justify-center gap-2 text-white/30 text-sm">
                  <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                  Cargando vendedores...
                </div>
              ) : sellers.length === 0 ? (
                <p className="py-4 text-center text-sm text-white/30">Sin vendedores disponibles</p>
              ) : (
                sellers.map(seller => (
                  <button key={seller.id} onClick={() => handleSelectSeller(seller)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/6 border border-transparent hover:border-[#25D366]/20 transition-all cursor-pointer group text-left">
                    <SellerAvatar seller={seller} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{seller.name}</p>
                      {seller.bio && <p className="text-xs text-white/40 truncate">{seller.bio}</p>}
                    </div>
                    <i className="fa-brands fa-whatsapp text-[#25D366] text-lg opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </button>
                ))
              )}
            </div>

            {/* Random if multiple */}
            {sellers.length > 1 && (
              <div className="px-4 pb-4 border-t border-white/8 pt-3">
                <button
                  onClick={() => {
                    const idx = Math.floor(Math.random() * sellers.length)
                    handleSelectSeller(sellers[idx])
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#25D366]/10 border border-[#25D366]/25 text-[#25D366] text-sm font-bold hover:bg-[#25D366]/20 transition-all cursor-pointer">
                  <span className="material-symbols-outlined text-base">shuffle</span>
                  Elegir al azar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
