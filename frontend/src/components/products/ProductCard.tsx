import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { imgUrl, imgPosition, imgZoom } from '../../types'
import type { Product } from '../../types'
import './ProductCard.css'

type AccentKey = 'primary' | 'secondary' | 'tertiary'

interface ProductCardProps {
  product: Product
  /** Override accent color. Defaults to 'secondary' (pink). */
  accent?: AccentKey
}

const accentClasses: Record<AccentKey, {
  border: string; shadow: string; badge: string
  title: string; price: string; btn: string; glowDot: string
}> = {
  primary: {
    border:  'hover:border-primary-container/30',
    shadow:  'hover:shadow-[0_0_30px_rgba(57,255,20,0.12)]',
    badge:   'bg-primary-container text-on-primary-container pc-badge-glow',
    title:   'group-hover:text-primary-container',
    price:   'text-primary-container',
    btn:     'bg-primary-container text-on-primary pc-btn-hover',
    glowDot: 'bg-primary-container/20',
  },
  secondary: {
    border:  'hover:border-secondary-container/40',
    shadow:  'hover:shadow-[0_0_30px_rgba(255,74,141,0.15)]',
    badge:   'bg-secondary-container text-on-secondary pc-badge-glow',
    title:   'group-hover:text-secondary-container',
    price:   'text-secondary-container',
    btn:     'bg-secondary-container text-on-secondary pc-btn-hover',
    glowDot: 'bg-secondary-container/20',
  },
  tertiary: {
    border:  'hover:border-tertiary-container/30',
    shadow:  'hover:shadow-[0_0_30px_rgba(58,244,255,0.12)]',
    badge:   'bg-tertiary-container text-on-tertiary-container pc-badge-glow',
    title:   'group-hover:text-tertiary-container',
    price:   'text-tertiary-container',
    btn:     'bg-tertiary-container text-on-tertiary-container pc-btn-hover',
    glowDot: 'bg-tertiary-container/20',
  },
}

export default function ProductCard({ product, accent = 'secondary' }: ProductCardProps) {
  const { addToCart } = useCart()
  const theme = accentClasses[accent]

  // Safely get position/zoom from images[] (handles string[], object[], or undefined)
  const firstImg = Array.isArray(product.images) ? product.images[0] : undefined
  const mainSrc  = firstImg ? imgUrl(firstImg) : product.image
  const pos      = firstImg ? imgPosition(firstImg) : '50% 50%'
  const zoom     = firstImg ? Math.max(0.5, Math.min(3, imgZoom(firstImg))) : 1

  return (
    <div className={`group relative bg-surface-container-low border border-white/5 rounded-xl overflow-hidden transition-all duration-500 flex flex-col ${theme.border} ${theme.shadow}`}>

      {/* Ambient glow top-right */}
      <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${theme.glowDot}`} />

      {/* ── Image ──────────────────────────────── */}
      <Link to={`/products/${product.id}`} className="block relative overflow-hidden product-img-bg flex-shrink-0" style={{ aspectRatio: '1 / 1' }}>
        {/* Wrapper handles hover-scale; img handles zoom — no conflict */}
        <div className="w-full h-full group-hover:scale-105 transition-transform duration-700">
          <img
            className="w-full h-full object-cover cursor-pointer"
            src={mainSrc || product.image}
            alt={product.name}
            style={{ objectPosition: pos, ...(zoom !== 1 && { transform: `scale(${zoom})`, transformOrigin: pos }) }}
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAyNTAgMjUwIiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJ4TWlkWU1pZCBtZWV0Ij48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMWYyMTI4Ii8+PC9zdmc+'
            }}
          />
        </div>


        {/* Discount ribbon */}
        {product.originalPrice && (
          <div className="absolute top-2 left-2 bg-secondary-container text-on-secondary text-[10px] font-black px-2 py-0.5 rounded-full pc-badge-glow">
            -{Math.round((1 - product.price / product.originalPrice) * 100)}%
          </div>
        )}

        {product.badge && !product.originalPrice && (
          <div className={`absolute top-2 right-2 font-label-caps text-[10px] px-2 py-0.5 rounded-full ${theme.badge}`}>
            {product.badge}
          </div>
        )}

      </Link>

      {/* ── Info ───────────────────────────────── */}
      <div className="p-3 flex flex-col flex-1 gap-1">
        <Link to={`/products/${product.id}`} className="block">
          <h3 className={`font-semibold text-sm text-on-surface leading-tight line-clamp-2 transition-colors cursor-pointer ${theme.title} font-['Plus_Jakarta_Sans']`}>
            {product.name}
          </h3>
        </Link>

        <p className="text-on-surface-variant text-xs line-clamp-2 leading-relaxed flex-1">
          {product.description}
        </p>

        <div className="flex items-end justify-between mt-2 pt-2 border-t border-white/5 gap-2">
          {/* Price */}
          <div className="min-w-0">
            <span className={`font-black text-base leading-none ${product.inStock ? theme.price : 'text-on-surface-variant'}`}>
              {product.inStock
                ? new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(product.price)
                : 'Sin stock'}
            </span>
            {product.originalPrice && product.inStock && (
              <div className="text-on-surface-variant line-through text-[11px] mt-0.5">
                {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(product.originalPrice)}
              </div>
            )}
          </div>

          {/* Add to cart pill */}
          <button
            onClick={() => addToCart(product)}
            disabled={!product.inStock}
            className={`product-cart-btn flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold tracking-wide transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${theme.btn}`}
            aria-label="Agregar al carrito"
          >
            <span className="material-symbols-outlined text-[15px]">add_shopping_cart</span>
            <span className="product-cart-label">Agregar</span>
          </button>
        </div>
      </div>
    </div>
  )
}
