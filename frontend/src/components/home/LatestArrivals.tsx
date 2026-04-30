import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useDynamicProducts } from '../../hooks/useDynamicProducts'
import StarRating from './StarRating'
import './LatestArrivals.css'

const badgeClasses: Record<string, string> = {
  primary:   'bg-primary-container text-on-primary',
  secondary: 'bg-secondary-container text-on-secondary',
  tertiary:  'bg-tertiary-container text-on-tertiary-container',
}

export default function LatestArrivals() {
  const { addToCart } = useCart()
  const { products, isLoading } = useDynamicProducts({ isFeatured: true, limit: 8 })

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-8 md:px-margin py-xl bg-surface-container-lowest rounded-[2rem] border border-white/5 mb-xl">
      {/* Header */}
      <div className="flex justify-between items-end mb-lg">
        <div>
          <h2 className="text-2xl md:text-[32px] font-bold leading-tight text-on-background font-['Plus_Jakarta_Sans']">Últimas llegadas</h2>
          <p className="text-on-surface-variant text-sm md:text-base mt-1">Lo más nuevo directo desde las fuentes.</p>
        </div>
        <Link to="/products"
          className="text-primary-container font-bold text-sm hover:underline underline-offset-8 flex-shrink-0 ml-4">
          VER TODO
        </Link>
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-gutter">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square rounded-xl bg-white/5 mb-sm" />
              <div className="h-4 bg-white/5 rounded mb-2" />
              <div className="h-3 bg-white/5 rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Grid */}
      {!isLoading && products.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-gutter">
          {products.map(product => (
            <div key={product.id} className="group">
              <Link to={`/products/${product.id}`}>
                <div className="relative rounded-xl overflow-hidden aspect-square mb-sm bg-[#0b0c12] border border-white/5 scanline cursor-pointer">
                  <img
                    className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-500"
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAyNTAgMjUwIiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJ4TWlkWU1pZCBtZWV0Ij48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMWYyMTI4Ii8+PHBhdGggZD0iTTEyNSAxMDZhMTkgMTkgMCAxIDAgMCAzOGExOSAxOSAwIDAgMCAwLTM4em0tMjIgNTFhNDEgNDEgMCAwIDEgNDQtMTNsMjEgMjFWMTE2YTc1IDc1 0IDAgMC0xNTAtMHY1N2wyNi0yNmMxNS0xNSAzOS0xNSA1NCAweiIgZmlsbD0iIzM4M2I0ZCIvPjwvc3ZnPg=='
                    }}
                  />
                  {product.badge && (
                    <div className={`absolute top-xs right-xs px-xs py-1 rounded font-label-caps text-[10px] ${badgeClasses[product.badgeColor ?? 'primary']}`}>
                      {product.badge}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-sm">
                    <button
                      onClick={e => { e.preventDefault(); addToCart(product) }}
                      disabled={!product.inStock}
                      className="p-3 bg-primary-container text-on-primary rounded-full hover:scale-110 transition-transform cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Agregar al carrito">
                      <span className="material-symbols-outlined">add_shopping_cart</span>
                    </button>
                    <button
                      onClick={e => e.preventDefault()}
                      className="p-3 bg-white/10 backdrop-blur-md rounded-full hover:scale-110 transition-transform cursor-pointer"
                      aria-label="Favorito">
                      <span className="material-symbols-outlined">favorite</span>
                    </button>
                  </div>
                </div>
              </Link>
              <h4 className="text-sm font-semibold text-on-background group-hover:text-primary-container transition-colors leading-tight line-clamp-2 font-['Plus_Jakarta_Sans']">
                {product.name}
              </h4>
              <div className="flex justify-between items-center mt-1">
                <span className={`font-bold text-sm ${product.inStock ? 'text-primary-container' : 'text-on-surface-variant'}`}>
                  {product.inStock ? `$${product.price.toFixed(0)}` : 'Sin stock'}
                </span>
                <StarRating rating={product.rating} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state — show static hint if no products are featured yet */}
      {!isLoading && products.length === 0 && (
        <div className="text-center py-xl text-on-surface-variant">
          <span className="material-symbols-outlined text-5xl opacity-20 block mb-sm">star_border</span>
          <p className="text-sm">Aún no hay productos destacados.</p>
          <p className="text-xs mt-1">Activá "Destacado" en un producto desde el panel de admin.</p>
        </div>
      )}
    </section>
  )
}
