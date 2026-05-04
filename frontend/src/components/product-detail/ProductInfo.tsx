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

/* ── Seller type ─────────────────────────────────── */
interface Seller { id: string; name: string; bio: string; avatar: string; whatsapp: string }

/* ── WhatsApp URL builder ────────────────────────── */
function waUrl(whatsapp: string, productName: string, price: number) {
  const digits = whatsapp.replace(/\D/g, '')
  const number = digits.startsWith('549') || digits.startsWith('54') ? digits : `549${digits}`
  const msg = encodeURIComponent(
    `¡Hola! Me interesa el producto "${productName}" (${new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:0}).format(price)}). ¿Está disponible?`
  )
  return `https://wa.me/${number}?text=${msg}`
}

/* ── Round-robin seller selection ───────────────── */
function getRRSeller(sellers: Seller[]): Seller {
  const key = 'cg_seller_rr'
  const idx = parseInt(localStorage.getItem(key) ?? '0', 10) % sellers.length
  localStorage.setItem(key, String((idx + 1) % sellers.length))
  return sellers[idx]
}

/* ── Seller avatar ───────────────────────────────── */
function SellerAvatar({ seller, size = 'md' }: { seller: Seller; size?: 'sm' | 'md' | 'lg' }) {
  const cls = size === 'lg' ? 'w-14 h-14 text-lg' : size === 'sm' ? 'w-7 h-7 text-xs' : 'w-10 h-10 text-sm'
  if (seller.avatar)
    return <img src={seller.avatar} alt={seller.name} className={`${cls} rounded-full object-cover flex-shrink-0`} />
  return (
    <div className={`${cls} rounded-full bg-[#25D366]/20 flex items-center justify-center flex-shrink-0 text-[#25D366] font-bold border border-[#25D366]/30`}>
      {seller.name.charAt(0).toUpperCase()}
    </div>
  )
}

/* ── ARS formatter ───────────────────────────────── */
const ARS = (n: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

/* ── Modal step type ─────────────────────────────── */
type ModalStep = 'choose' | 'list' | 'selected'

/* ── Main component ──────────────────────────────── */
export default function ProductInfo({ product }: ProductInfoProps) {
  const { addToCart, openCart } = useCart()

  const cond  = (product.condition ?? 'new') as ProductCondition
  const meta  = conditionMeta[cond]
  const score = product.conditionScore ?? 100

  /* Vendor modal state */
  const [modal,    setModal]    = useState<ModalStep | null>(null)
  const [sellers,  setSellers]  = useState<Seller[]>([])
  const [loading,  setLoading]  = useState(false)
  const [selected, setSelected] = useState<Seller | null>(null)

  /* Fetch sellers once when modal first opens */
  useEffect(() => {
    if (!modal || sellers.length > 0) return
    setLoading(true)
    fetch(`${API}/api/sellers`)
      .then(r => r.json())
      .then(d => setSellers(Array.isArray(d) ? d : []))
      .catch(() => setSellers([]))
      .finally(() => setLoading(false))
  }, [modal])

  const openModal = () => { setSelected(null); setModal('choose') }
  const closeModal = () => setModal(null)

  const handleRandom = () => {
    if (!sellers.length) return
    setSelected(getRRSeller(sellers))
    setModal('selected')
  }

  const handlePickSeller = (seller: Seller) => {
    setSelected(seller)
    setModal('selected')
  }

  const handleWA = () => {
    if (!selected) return
    fetch(`${API}/api/tracking/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'wa_click', sellerId: selected.id }),
    }).catch(() => {})
    window.open(waUrl(selected.whatsapp, product.name, product.price), '_blank', 'noopener,noreferrer')
    closeModal()
  }

  const handleBuy = () => {
    addToCart(product)
    openCart()
    closeModal()
  }

  return (
    <div className="lg:col-span-6 flex flex-col gap-md">

      {/* ── Badge row ──────────────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
          product.inStock
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
            : 'bg-red-500/10 text-red-400 border-red-500/25'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${product.inStock ? 'bg-emerald-400' : 'bg-red-400'}`}/>
          {product.inStock ? 'En stock' : 'Sin stock'}
        </span>
        {cond !== 'new' && (
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${meta.text} bg-purple-500/10 border-purple-500/25`}>
            <span className="material-symbols-outlined text-xs">{meta.icon}</span>
            {meta.label}
          </span>
        )}
        {product.subcategory && (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-white/50 uppercase tracking-widest">
            {product.subcategory}
          </span>
        )}
      </div>

      {/* ── Title ──────────────────────────────────── */}
      <h1 className="text-3xl md:text-4xl font-black text-on-background leading-tight font-['Plus_Jakarta_Sans']">
        {product.name.split(' ').slice(0, -1).join(' ')}{' '}
        <span className="text-purple-400 italic block md:inline">
          {product.name.split(' ').slice(-1)[0]}
        </span>
      </h1>

      {/* ── Price ──────────────────────────────────── */}
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

      {/* ── Symmetric block ──────────────────────────── */}
      <div className="flex flex-col gap-3 w-full">

        {/* Description */}
        <p className="text-on-surface-variant text-sm leading-relaxed border-l-2 border-purple-500/30 pl-sm">
          {product.description}
        </p>

        {/* Condition card */}
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
            onClick={product.inStock ? () => { addToCart(product); openCart() } : undefined}
            disabled={!product.inStock}
            className={`w-full py-3 px-5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
              product.inStock
                ? 'bg-secondary-container text-on-secondary hover:shadow-[0_0_24px_rgba(255,74,141,0.5)] hover:brightness-110 cursor-pointer'
                : 'bg-surface-container-high text-on-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-base">{product.inStock ? 'shopping_bag' : 'remove_shopping_cart'}</span>
            {product.inStock ? 'Comprar' : 'Sin Stock'}
          </button>

          <button
            onClick={openModal}
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
              <p className="text-sm font-bold text-on-surface leading-tight">Tipos de envío</p>
              <p className="text-xs text-on-surface-variant mt-0.5">Andreani, Correo Argentino y Retiro en sucursal</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-3.5 bg-surface-container rounded-xl border border-white/5 flex-1">
            <span className="material-symbols-outlined text-tertiary-container text-2xl flex-shrink-0">workspace_premium</span>
            <div>
              <p className="text-sm font-bold text-on-surface leading-tight">Garantía 30 días</p>
              <p className="text-xs text-on-surface-variant mt-0.5">Para productos nuevos</p>
            </div>
          </div>
        </div>

      </div>

      {/* ── Specs ──────────────────────────────────── */}
      {product.specs && <SpecsGrid specs={product.specs} />}

      {/* ══════════════════════════════════════════════
          ── Vendor Selection Modal ─────────────────── */}
      {modal && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={closeModal} />

          <div className="relative w-full max-w-sm bg-[#111318] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">

            {/* ── Header ── */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
              <div className="flex items-center gap-2.5">
                {modal !== 'choose' && (
                  <button onClick={() => setModal(modal === 'selected' ? 'choose' : 'choose')}
                    className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer flex-shrink-0">
                    <span className="material-symbols-outlined text-white/50 text-base">arrow_back</span>
                  </button>
                )}
                <div>
                  {modal === 'choose' && (
                    <>
                      <p className="text-sm font-bold text-white">¿Conocés a un vendedor?</p>
                      <p className="text-xs text-white/35 truncate max-w-[200px]">{product.name}</p>
                    </>
                  )}
                  {modal === 'list' && (
                    <p className="text-sm font-bold text-white">Elegir vendedor</p>
                  )}
                  {modal === 'selected' && selected && (
                    <p className="text-sm font-bold text-white">Vendedor seleccionado</p>
                  )}
                </div>
              </div>
              <button onClick={closeModal}
                className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-white/50 text-base">close</span>
              </button>
            </div>

            {/* ── Step: choose ── */}
            {modal === 'choose' && (
              <div className="px-5 py-5 space-y-3">
                <p className="text-xs text-white/35 text-center mb-4">
                  Elegí cómo querés continuar
                </p>

                {/* Random */}
                <button
                  onClick={handleRandom}
                  disabled={loading || sellers.length === 0}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-[#25D366]/10 border border-[#25D366]/25 hover:bg-[#25D366]/18 hover:border-[#25D366]/45 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed group"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#25D366]/15 border border-[#25D366]/25 flex items-center justify-center flex-shrink-0 group-hover:bg-[#25D366]/25 transition-colors">
                    {loading
                      ? <span className="material-symbols-outlined text-[#25D366] text-base animate-spin">progress_activity</span>
                      : <span className="material-symbols-outlined text-[#25D366] text-base">shuffle</span>
                    }
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-white">Elegir al azar</p>
                    <p className="text-[11px] text-white/35">Rápido · equitativo para todos</p>
                  </div>
                  <span className="material-symbols-outlined text-white/20 text-base ml-auto group-hover:text-white/40 transition-colors">chevron_right</span>
                </button>

                {/* Manual */}
                <button
                  onClick={() => setModal('list')}
                  disabled={loading || sellers.length === 0}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/8 hover:bg-white/[0.08] hover:border-white/15 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed group"
                >
                  <div className="w-9 h-9 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-white/12 transition-colors">
                    <span className="material-symbols-outlined text-white/60 text-base">group</span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-white">Elegir un vendedor</p>
                    <p className="text-[11px] text-white/35">
                      {loading ? 'Cargando...' : `${sellers.length} disponible${sellers.length !== 1 ? 's' : ''}`}
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-white/20 text-base ml-auto group-hover:text-white/40 transition-colors">chevron_right</span>
                </button>
              </div>
            )}

            {/* ── Step: list ── */}
            {modal === 'list' && (
              <div className="px-4 py-3 space-y-1.5 max-h-72 overflow-y-auto">
                {sellers.map(seller => (
                  <button key={seller.id} onClick={() => handlePickSeller(seller)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/6 border border-transparent hover:border-[#25D366]/20 transition-all cursor-pointer group text-left">
                    <SellerAvatar seller={seller} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{seller.name}</p>
                      {seller.bio && <p className="text-xs text-white/35 truncate">{seller.bio}</p>}
                    </div>
                    <span className="material-symbols-outlined text-white/20 text-base group-hover:text-white/50 transition-colors flex-shrink-0">chevron_right</span>
                  </button>
                ))}
              </div>
            )}

            {/* ── Step: selected ── */}
            {modal === 'selected' && selected && (
              <div className="px-5 py-5">
                {/* Seller card */}
                <div className="flex items-center gap-3 p-3.5 bg-white/[0.04] rounded-xl border border-white/8 mb-5">
                  <SellerAvatar seller={selected} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{selected.name}</p>
                    {selected.bio && <p className="text-xs text-white/40 truncate">{selected.bio}</p>}
                  </div>
                  <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                </div>

                {/* Actions */}
                <div className="space-y-2.5">
                  <button
                    onClick={handleWA}
                    className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-[#25D366]/12 border border-[#25D366]/30 text-[#25D366] font-bold text-sm hover:bg-[#25D366]/20 hover:border-[#25D366]/55 hover:shadow-[0_0_20px_rgba(37,211,102,0.2)] transition-all active:scale-95 cursor-pointer"
                  >
                    <i className="fa-brands fa-whatsapp text-base" />
                    Consultar por WhatsApp
                  </button>

                  <button
                    onClick={handleBuy}
                    disabled={!product.inStock}
                    className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-secondary-container text-on-secondary font-bold text-sm hover:brightness-110 hover:shadow-[0_0_20px_rgba(255,74,141,0.4)] transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-base">shopping_bag</span>
                    {product.inStock ? 'Agregar al carrito' : 'Sin stock'}
                  </button>
                </div>

                {/* Price reminder */}
                <p className="text-center text-[11px] text-white/20 mt-3">{product.name} · {ARS(product.price)}</p>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  )
}
