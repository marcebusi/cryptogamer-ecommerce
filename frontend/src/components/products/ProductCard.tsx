import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
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

  return (
    <div className={`group relative bg-surface-container-low border border-white/5 rounded-xl overflow-hidden transition-all duration-500 flex flex-col ${accent.border} ${accent.shadow}`}>

      {/* ── Image ──────────────────────────────── */}
      <Link to={`/products/${product.id}`} className="block relative overflow-hidden bg-[#0b0c12] flex-shrink-0" style={{ aspectRatio: '1 / 1' }}>
        <img
          className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-700 cursor-pointer"
          src={product.image}
          alt={product.name}
          loading="lazy"
        />
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
            className={`flex items-center gap-xs px-sm py-xs rounded-full text-xs font-bold transition-all active:scale-95 cursor-pointer ${accent.btn}`}
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
            <span className={`font-black text-base ${accent.price}`}>${product.price.toFixed(0)}</span>
            {product.originalPrice && (
              <span className="text-on-surface-variant line-through text-xs ml-1">
                ${product.originalPrice.toFixed(0)}
              </span>
            )}
          </div>
          <button
            onClick={() => addToCart(product)}
            className={`p-1.5 rounded-full transition-all active:scale-90 cursor-pointer ${accent.btn}`}
            aria-label="Agregar al carrito"
          >
            <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
          </button>
        </div>
      </div>
    </div>
  )
}
