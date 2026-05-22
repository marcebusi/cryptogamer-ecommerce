import { useState, useEffect } from 'react'
import { useCart } from '../../context/CartContext'
import { useThemeColors } from '../../lib/themeColors'
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
  const tc = useThemeColors()
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
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${meta.text}`}
            style={{ background: tc.primaryBg, borderColor: tc.primaryBorder }}>
            <span className="material-symbols-outlined text-xs">{meta.icon}</span>
            {meta.label}
          </span>
        )}
        {product.subcategory && (
          <span className="px-3 py-1 rounded-full text-xs font-medium uppercase tracking-widest text-on-surface-variant"
            style={{ background: tc.cardBg, border: `1px solid ${tc.cardBorder}` }}>
            {product.subcategory}
          </span>
        )}
      </div>

      {/* ── Title ──────────────────────────────────── */}
      <h1 className="text-3xl md:text-4xl font-black text-on-background leading-tight font-['Plus_Jakarta_Sans']">
        {product.name.split(' ').slice(0, -1).join(' ')}{' '}
        <span className="italic block md:inline" style={{ color: tc.primary }}>
          {product.name.split(' ').slice(-1)[0]}
        </span>
      </h1>

      {/* ── Price ──────────────────────────────────── */}
      <div className="flex items-center gap-sm flex-wrap">
        <span className="text-4xl font-black text-secondary-container">
          {ARS(product.price)}
        </span>
        {product.originalPrice && (
          <>
            <span className="text-on-surface-variant line-through text-lg">{ARS(product.originalPrice)}</span>
            <span className="px-2 py-0.5 bg-secondary-container text-on-secondary text-xs font-bold rounded-full">
              AHORRÁS {ARS(product.originalPrice - product.price)}
            </span>
          </>
        )}
      </div>

      {/* ── Symmetric block ──────────────────────────── */}
      <div className="flex flex-col gap-3 w-full">

        {/* Description */}
        <p className="text-on-surface-variant text-sm leading-relaxed pl-sm" style={{ borderLeft: `2px solid ${tc.primaryBorder}` }}>
          {product.description}
        </p>

        {/* CTA buttons */}
        <div className="space-y-2.5">
          <button
            onClick={product.inStock ? () => { addToCart(product); openCart() } : undefined}
            disabled={!product.inStock}
            className={`w-full py-3 px-5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
              product.inStock
                ? 'bg-secondary-container text-on-secondary hover:brightness-110 cursor-pointer'
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
          <div className="flex items-center gap-3 px-4 py-3.5 bg-surface-container rounded-xl border border-outline-variant/30 flex-1">
            <span className="material-symbols-outlined text-2xl flex-shrink-0" style={{ color: tc.primary }}>delivery_truck_speed</span>
            <div>
              <p className="text-sm font-bold text-on-surface leading-tight">Retiro a domicilio</p>
              <p className="text-xs text-on-surface-variant mt-0.5">El vendedor te lo lleva</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-3.5 bg-surface-container rounded-xl border border-outline-variant/30 flex-1">
            <span className="material-symbols-outlined text-2xl flex-shrink-0" style={{ color: tc.primary }}>workspace_premium</span>
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

          {/* Modal panel — explicit inline style for guaranteed light/dark bg */}
          <div className="relative w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden"
            style={{
              background: tc.isDark ? '#111318' : '#ffffff',
              border: `1px solid ${tc.cardBorder}`,
            }}>

            {/* ── Header ── */}
            <div className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: `1px solid ${tc.cardBorder}` }}>
              <div className="flex items-center gap-2.5">
                {modal !== 'choose' && (
                  <button onClick={() => setModal(modal === 'selected' ? 'choose' : 'choose')}
                    className="w-7 h-7 rounded-full flex items-center justify-center transition-colors cursor-pointer flex-shrink-0"
                    style={{ '--hover-bg': tc.cardBg } as React.CSSProperties}>
                    <span className="material-symbols-outlined text-on-surface-variant text-base">arrow_back</span>
                  </button>
                )}
                <div>
                  {modal === 'choose' && (
                    <>
                      <p className="text-sm font-bold text-on-surface">¿Conocés a un vendedor?</p>
                      <p className="text-xs text-on-surface-variant truncate max-w-[200px]">{product.name}</p>
                    </>
                  )}
                  {modal === 'list' && <p className="text-sm font-bold text-on-surface">Elegir vendedor</p>}
                  {modal === 'selected' && selected && <p className="text-sm font-bold text-on-surface">Vendedor seleccionado</p>}
                </div>
              </div>
              <button onClick={closeModal}
                className="w-7 h-7 rounded-full flex items-center justify-center transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-on-surface-variant text-base">close</span>
              </button>
            </div>

            {/* ── Step: choose ── */}
            {modal === 'choose' && (
              <div className="px-5 py-5 space-y-3">
                <p className="text-xs text-on-surface-variant text-center mb-4">Elegí cómo querés continuar</p>

                {/* Random — WhatsApp green, same in both modes */}
                <button onClick={handleRandom} disabled={loading || sellers.length === 0}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed group"
                  style={{ background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.25)' }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(37,211,102,0.12)', border: '1px solid rgba(37,211,102,0.25)' }}>
                    {loading
                      ? <span className="material-symbols-outlined text-base animate-spin" style={{ color: '#25D366' }}>progress_activity</span>
                      : <span className="material-symbols-outlined text-base" style={{ color: '#25D366' }}>shuffle</span>
                    }
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-on-surface">Elegir al azar</p>
                    <p className="text-[11px] text-on-surface-variant">Rápido · equitativo para todos</p>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant/40 text-base ml-auto">chevron_right</span>
                </button>

                {/* Manual */}
                <button onClick={() => setModal('list')} disabled={loading || sellers.length === 0}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed group"
                  style={{ background: tc.cardBg, border: `1px solid ${tc.cardBorder}` }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: tc.cardBg, border: `1px solid ${tc.cardBorder}` }}>
                    <span className="material-symbols-outlined text-on-surface-variant text-base">group</span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-on-surface">Elegir un vendedor</p>
                    <p className="text-[11px] text-on-surface-variant">
                      {loading ? 'Cargando...' : `${sellers.length} disponible${sellers.length !== 1 ? 's' : ''}`}
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant/40 text-base ml-auto">chevron_right</span>
                </button>
              </div>
            )}

            {/* ── Step: list ── */}
            {modal === 'list' && (
              <div className="px-4 py-3 space-y-1.5 max-h-72 overflow-y-auto">
                {sellers.map(seller => (
                  <button key={seller.id} onClick={() => handlePickSeller(seller)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer text-left"
                    style={{ border: '1px solid transparent' }}>
                    <SellerAvatar seller={seller} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-on-surface truncate">{seller.name}</p>
                      {seller.bio && <p className="text-xs text-on-surface-variant truncate">{seller.bio}</p>}
                    </div>
                    <span className="material-symbols-outlined text-on-surface-variant/40 text-base flex-shrink-0">chevron_right</span>
                  </button>
                ))}
              </div>
            )}

            {/* ── Step: selected ── */}
            {modal === 'selected' && selected && (
              <div className="px-5 py-5">
                {/* Seller card */}
                <div className="flex items-center gap-3 p-3.5 rounded-xl mb-5"
                  style={{ background: tc.cardBg, border: `1px solid ${tc.cardBorder}` }}>
                  <SellerAvatar seller={selected} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-on-surface truncate">{selected.name}</p>
                    {selected.bio && <p className="text-xs text-on-surface-variant truncate">{selected.bio}</p>}
                  </div>
                  <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                </div>

                {/* Actions */}
                <div className="space-y-2.5">
                  <button onClick={handleWA}
                    className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl font-bold text-sm transition-all active:scale-95 cursor-pointer"
                    style={{ background: 'rgba(37,211,102,0.10)', border: '1.5px solid rgba(37,211,102,0.35)', color: '#25D366' }}>
                    <i className="fa-brands fa-whatsapp text-base" />
                    Consultar por WhatsApp
                  </button>

                  <button onClick={handleBuy} disabled={!product.inStock}
                    className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-secondary-container text-on-secondary font-bold text-sm hover:brightness-110 transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                    <span className="material-symbols-outlined text-base">shopping_bag</span>
                    {product.inStock ? 'Agregar al carrito' : 'Sin stock'}
                  </button>
                </div>

                <p className="text-center text-[11px] text-on-surface-variant/50 mt-3">{product.name} · {ARS(product.price)}</p>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  )
}
