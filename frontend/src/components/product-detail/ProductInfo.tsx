import { useCart } from '../../context/CartContext'
import type { Product, ProductCondition } from '../../types'
import SpecsGrid from './SpecsGrid'
import './ProductInfo.css'

interface ProductInfoProps {
  product: Product
}

const conditionMeta: Record<ProductCondition, { label: string; bar: string; text: string; glow: string; icon: string }> = {
  'new':       { label: 'Nuevo',      bar: 'bg-primary-container',   text: 'text-primary-container',  glow: 'shadow-[0_0_8px_rgba(57,255,20,0.5)]',  icon: 'new_releases' },
  'like-new':  { label: 'Como Nuevo', bar: 'bg-tertiary-container',  text: 'text-tertiary-container', glow: 'shadow-[0_0_8px_rgba(58,244,255,0.5)]', icon: 'grade' },
  'excellent': { label: 'Excelente',  bar: 'bg-tertiary-container',  text: 'text-tertiary-container', glow: 'shadow-[0_0_8px_rgba(58,244,255,0.5)]', icon: 'verified' },
  'good':      { label: 'Bueno',      bar: 'bg-yellow-400',          text: 'text-yellow-400',         glow: 'shadow-[0_0_8px_rgba(250,204,21,0.5)]', icon: 'thumb_up' },
  'fair':      { label: 'Aceptable',  bar: 'bg-secondary-container', text: 'text-secondary-container',glow: 'shadow-[0_0_8px_rgba(255,74,141,0.5)]', icon: 'info' },
}

export default function ProductInfo({ product }: ProductInfoProps) {
  const { addToCart, openCart } = useCart()

  const cond  = product.condition
  const meta  = cond ? conditionMeta[cond] : null
  const score = product.conditionScore ?? 100

  const handleAddToCart = () => { addToCart(product); openCart() }

  return (
    <div className="lg:col-span-5 flex flex-col gap-md">

      {/* ── Badge + title ───────────────────── */}
      <div>
        {cond && cond !== 'new' && (
          <span className="inline-block mb-sm px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest bg-purple-600/20 text-purple-300 border border-purple-500/30">
            Pre-owned
          </span>
        )}

        <h1 className="text-3xl md:text-4xl font-black text-on-background leading-tight font-['Plus_Jakarta_Sans']">
          {product.name.split(' ').slice(0, -1).join(' ')}{' '}
          <span className="text-purple-400 italic block md:inline">
            {product.name.split(' ').slice(-1)[0]}
          </span>
        </h1>

      </div>

      {/* ── Price ───────────────────────────── */}
      <div className="flex items-center gap-sm flex-wrap">
        <span className="text-4xl font-black text-primary-container drop-shadow-[0_0_8px_rgba(57,255,20,0.5)]">
          ${product.price.toFixed(2)}
        </span>
        {product.originalPrice && (
          <>
            <span className="text-on-surface-variant line-through text-lg">${product.originalPrice.toFixed(2)}</span>
            <span className="px-2 py-0.5 bg-secondary-container text-on-secondary text-xs font-bold rounded-full shadow-[0_0_10px_rgba(255,74,141,0.4)]">
              AHORRÁS ${(product.originalPrice - product.price).toFixed(0)}
            </span>
          </>
        )}
      </div>

      {/* ── Description ─────────────────────── */}
      <p className="text-on-surface-variant text-sm leading-relaxed border-l-2 border-purple-500/30 pl-sm">
        {product.description}
      </p>

      {/* ── Condition card ──────────────────── */}
      {cond && (
        <div className="condition-card rounded-2xl border border-white/10 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-md py-sm bg-white/[0.03] border-b border-white/8">
            <div className="flex items-center gap-xs">
              <span className={`material-symbols-outlined text-lg ${meta?.text}`}>{meta?.icon}</span>
              <span className={`font-bold text-sm font-['Plus_Jakarta_Sans'] ${meta?.text}`}>
                {meta?.label} Condition
              </span>
            </div>
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-bold ${meta?.text}`} style={{ borderColor: 'currentColor', opacity: 0.9 }}>
              <span className="material-symbols-outlined text-xs">check_circle</span>
              Verificado
            </div>
          </div>

          <div className="p-md space-y-sm">
            <p className="text-sm text-on-surface-variant leading-relaxed">
              {product.conditionDescription ??
                'Esta unidad ha sido inspeccionada y certificada por nuestros técnicos. Desgaste cosmético mínimo. Incluye todos los accesorios originales.'}
            </p>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[11px] text-on-surface-variant uppercase tracking-widest font-semibold">Calidad de superficie</span>
                <span className={`text-xs font-black ${meta?.text}`}>{score}% MINT</span>
              </div>
              <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${meta?.bar} ${meta?.glow}`}
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>

            {product.conditionTags && product.conditionTags.length > 0 && (
              <div className="flex gap-xs flex-wrap">
                {product.conditionTags.map(tag => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 px-sm py-1 bg-surface-container-high text-on-surface-variant text-xs rounded-full border border-white/10"
                  >
                    <span className="material-symbols-outlined text-xs text-primary-container">check</span>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── CTA buttons ─────────────────────── */}
      <div className="space-y-sm">
        <button
          onClick={handleAddToCart}
          disabled={!product.inStock}
          className={`w-full py-4 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-xs transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
            product.inStock
              ? 'bg-primary-container text-on-primary hover:shadow-[0_0_24px_rgba(57,255,20,0.6)] hover:brightness-110 cursor-pointer'
              : 'bg-surface-container-high text-on-surface-variant'
          }`}
        >
          <span className="material-symbols-outlined">{product.inStock ? 'shopping_bag' : 'remove_shopping_cart'}</span>
          {product.inStock ? 'Agregar al Carrito' : 'Sin Stock'}
        </button>

        <button className="w-full bg-transparent border border-secondary text-secondary py-4 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-xs hover:bg-secondary/10 transition-all active:scale-95 cursor-pointer">
          <span className="material-symbols-outlined">sell</span>
          Vender el tuyo por ${product.originalPrice ? (product.price * 0.65).toFixed(2) : (product.price * 0.6).toFixed(2)}
        </button>
      </div>

      {/* ── Guarantees ──────────────────────── */}
      <div className="grid grid-cols-2 gap-sm">
        <div className="flex items-start gap-xs p-sm bg-surface-container rounded-xl border border-white/5">
          <span className="material-symbols-outlined text-tertiary-container text-2xl flex-shrink-0">local_shipping</span>
          <div>
            <p className="text-xs font-bold text-on-surface">Envío Gratis</p>
            <p className="text-[11px] text-on-surface-variant">Llega en 2–3 días</p>
          </div>
        </div>
        <div className="flex items-start gap-xs p-sm bg-surface-container rounded-xl border border-white/5">
          <span className="material-symbols-outlined text-tertiary-container text-2xl flex-shrink-0">workspace_premium</span>
          <div>
            <p className="text-xs font-bold text-on-surface">Garantía 90 días</p>
            <p className="text-[11px] text-on-surface-variant">Protección total</p>
          </div>
        </div>
      </div>

      {/* ── Specs ───────────────────────────── */}
      {product.specs && <SpecsGrid specs={product.specs} />}
    </div>
  )
}
