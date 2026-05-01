import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { imgUrl, imgPosition, imgZoom } from '../../types'
import type { Product } from '../../types'
import './ProductCard.css'

interface ProductCardProps {
  product: Product
}

const accentClasses = {
  primary:   { border: 'hover:border-primary-container/30',   shadow: 'hover:shadow-[0_0_30px_rgba(57,255,20,0.1)]',    badge: 'bg-primary-container text-on-primary-container shadow-[0_0_12px_#39ff14]',   title: 'group-hover:text-primary-container',   price: 'text-primary-container',   btn: 'bg-primary-container text-on-primary hover:shadow-[0_0_20px_#39ff14]' },
  secondary: { border: 'hover:border-secondary-container/30', shadow: 'hover:shadow-[0_0_30px_rgba(255,74,141,0.1)]',  badge: 'bg-secondary-container text-on-secondary shadow-[0_0_12px_#ff4a8d]',        title: 'group-hover:text-secondary-container', price: 'text-secondary-container', btn: 'bg-secondary-container text-on-secondary hover:shadow-[0_0_20px_#ff4a8d]' },
  tertiary:  { border: 'hover:border-tertiary-container/30',  shadow: 'hover:shadow-[0_0_30px_rgba(58,244,255,0.1)]',  badge: 'bg-tertiary-container text-on-tertiary-container shadow-[0_0_12px_#3af4ff]', title: 'group-hover:text-tertiary-container',  price: 'text-tertiary-container',  btn: 'bg-tertiary-container text-on-tertiary-container hover:shadow-[0_0_20px_#3af4ff]' },
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart()
  const accent = accentClasses[product.badgeColor ?? 'primary']

  // Safely get position/zoom from images[] (handles string[], object[], or undefined)
  const firstImg = Array.isArray(product.images) ? product.images[0] : undefined
  const mainSrc  = firstImg ? imgUrl(firstImg) : product.image
  const pos      = firstImg ? imgPosition(firstImg) : '50% 50%'
  const zoom     = firstImg ? Math.max(0.5, Math.min(3, imgZoom(firstImg))) : 1

  return (
    <div className={`group relative bg-surface-container-low border border-white/5 rounded-xl overflow-hidden transition-all duration-500 flex flex-col ${accent.border} ${accent.shadow}`}>

      {/* ── Image ──────────────────────────────── */}
      <Link to={`/products/${product.id}`} className="block relative overflow-hidden bg-[#0b0c12] flex-shrink-0" style={{ aspectRatio: '1 / 1' }}>
        {/* Wrapper handles hover-scale; img handles zoom — no conflict */}
        <div className="w-full h-full group-hover:scale-105 transition-transform duration-700">
          <img
            className="w-full h-full object-cover cursor-pointer"
            src={mainSrc || product.image}
            alt={product.name}
            style={{ objectPosition: pos, ...(zoom !== 1 && { transform: `scale(${zoom})`, transformOrigin: pos }) }}
            loading="lazy"
            onError={(e) => {
            (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAyNTAgMjUwIiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJ4TWlkWU1pZCBtZWV0Ij48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMWYyMTI4Ii8+PHBhdGggZD0iTTEyNSAxMDZhMTkgMTkgMCAxIDAgMCAzOGExOSAxOSAwIDAgMCAwLTM4em0tMjIgNTFhNDEgNDEgMCAwIDEgNDQtMTNsMjEgMjFWMTE2YTc1IDc1 0IDAgMC0xNTAtMHY1N2wyNi0yNmMxNS0xNSAzOS0xNSA1NCAweiIgZmlsbD0iIzM4M2I0ZCIvPjwvc3ZnPg=='
            }}
          />
        </div>
        <div className="scanline-overlay absolute inset-0 opacity-15 pointer-events-none" />

        {/* Discount ribbon */}
        {product.originalPrice && (
          <div className="absolute top-2 left-2 bg-secondary-container text-on-secondary text-[10px] font-black px-2 py-0.5 rounded-full shadow-[0_0_10px_#ff4a8d]">
            -{Math.round((1 - product.price / product.originalPrice) * 100)}%
          </div>
        )}

        {product.badge && !product.originalPrice && (
          <div className={`absolute top-2 right-2 font-label-caps text-[10px] px-2 py-0.5 rounded-full ${accent.badge}`}>
            {product.badge}
          </div>
        )}

        {/* Quick-add overlay */}
        <div className="absolute inset-0 bg-background/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-xs">
          <button
            onClick={e => { e.preventDefault(); addToCart(product) }}
            disabled={!product.inStock}
            className={`flex items-center gap-xs px-sm py-xs rounded-full text-xs font-bold transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${accent.btn}`}
            aria-label="Agregar al carrito"
          >
            <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
            Agregar
          </button>
        </div>
      </Link>

      {/* ── Info ───────────────────────────────── */}
      <div className="p-3 flex flex-col flex-1 gap-1">
        <Link to={`/products/${product.id}`} className="block">
          <h3 className={`font-semibold text-sm text-on-surface leading-tight line-clamp-2 transition-colors cursor-pointer ${accent.title} font-['Plus_Jakarta_Sans']`}>
            {product.name}
          </h3>
        </Link>

        <p className="text-on-surface-variant text-xs line-clamp-2 leading-relaxed flex-1">
          {product.description}
        </p>

        <div className="flex items-center justify-between mt-1 pt-1 border-t border-white/5">
          <div>
            <span className={`font-black text-base ${product.inStock ? accent.price : 'text-on-surface-variant'}`}>
              {product.inStock ? `$${product.price.toFixed(0)}` : 'Sin stock'}
            </span>
            {product.originalPrice && product.inStock && (
              <span className="text-on-surface-variant line-through text-xs ml-1">
                ${product.originalPrice.toFixed(0)}
              </span>
            )}
          </div>
          <button
            onClick={() => addToCart(product)}
            disabled={!product.inStock}
            className={`p-1.5 rounded-full transition-all active:scale-90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${accent.btn}`}
            aria-label="Agregar al carrito"
          >
            <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
          </button>
        </div>
      </div>
    </div>
  )
}
