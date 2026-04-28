import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import type { Product } from '../../types'
import './ProductCard.css'

interface ProductCardProps {
  product: Product
}

const accentClasses = {
  primary: {
    border: 'hover:border-primary-container/30',
    shadow: 'hover:shadow-[0_0_30px_rgba(57,255,20,0.1)]',
    badge: 'bg-primary-container text-on-primary-container shadow-[0_0_15px_#39ff14]',
    title: 'group-hover:text-primary-container',
    price: 'text-primary-container',
    btn: 'bg-primary-container text-on-primary hover:shadow-[0_0_20px_#39ff14]',
  },
  secondary: {
    border: 'hover:border-secondary-container/30',
    shadow: 'hover:shadow-[0_0_30px_rgba(255,74,141,0.1)]',
    badge: 'bg-secondary-container text-on-secondary shadow-[0_0_15px_#ff4a8d]',
    title: 'group-hover:text-secondary-container',
    price: 'text-secondary-container',
    btn: 'bg-secondary-container text-on-secondary hover:shadow-[0_0_20px_#ff4a8d]',
  },
  tertiary: {
    border: 'hover:border-tertiary-container/30',
    shadow: 'hover:shadow-[0_0_30px_rgba(58,244,255,0.1)]',
    badge: 'bg-tertiary-container text-on-tertiary-container shadow-[0_0_15px_#3af4ff]',
    title: 'group-hover:text-tertiary-container',
    price: 'text-tertiary-container',
    btn: 'bg-tertiary-container text-on-tertiary-container hover:shadow-[0_0_20px_#3af4ff]',
  },
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart()
  const accent = accentClasses[product.badgeColor ?? 'primary']

  return (
    <div
      className={`group relative bg-surface-container-low border border-white/5 rounded-xl overflow-hidden transition-all duration-500 ${accent.border} ${accent.shadow}`}
    >
      {/* Image */}
      <div className="relative h-64 overflow-hidden">
        <Link to={`/products/${product.id}`}>
          <img
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 cursor-pointer"
            src={product.image}
            alt={product.name}
          />
        </Link>
        <div className="scanline-overlay absolute inset-0 opacity-20 pointer-events-none" />

        {product.badge && (
          <div className="absolute top-sm right-sm">
            <span className={`font-label-caps text-label-caps px-xs py-1 rounded-full ${accent.badge}`}>
              {product.badge}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-sm flex flex-col h-[calc(100%-16rem)]">
        <div className="flex justify-between items-start mb-xs">
          <Link to={`/products/${product.id}`}>
            <h3
              className={`font-h3-title text-body-lg text-on-surface transition-colors cursor-pointer ${accent.title}`}
            >
              {product.name}
            </h3>
          </Link>
          <span className={`font-h3-title ${accent.price}`}>${product.price.toFixed(2)}</span>
        </div>
        <p className="text-on-surface-variant text-sm mb-md flex-grow">{product.description}</p>
        <button
          onClick={() => addToCart(product)}
          className={`w-full py-3 font-button-text text-button-text rounded-lg transition-all flex items-center justify-center gap-xs cursor-pointer ${accent.btn}`}
        >
          <span className="material-symbols-outlined text-sm">shopping_cart</span>
          Add to Cart
        </button>
      </div>
    </div>
  )
}
