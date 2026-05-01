import { Link } from 'react-router-dom'
import { useDynamicProducts } from '../../hooks/useDynamicProducts'
import ProductCarousel from '../common/ProductCarousel'

export default function RelatedProducts() {
  const { products, isLoading } = useDynamicProducts({ isFeatured: true, limit: 12 })

  if (isLoading) {
    return (
      <section className="mt-xl pt-xl border-t border-white/5">
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-[200px] flex-shrink-0 animate-pulse">
              <div className="aspect-square rounded-2xl bg-white/5 mb-2" />
              <div className="h-3 bg-white/5 rounded mb-1.5" />
              <div className="h-3 bg-white/5 rounded w-2/3" />
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (!products.length) return null

  return (
    <section className="mt-xl pt-xl border-t border-white/5 overflow-hidden">
      {/* Header */}
      <div className="flex items-end justify-between mb-lg">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-on-background font-['Plus_Jakarta_Sans'] leading-tight">
            Productos{' '}
            <span className="text-[#ff4a8d]">Recomendados</span>
          </h2>
          <p className="text-on-surface-variant text-sm mt-1">
            Más productos que podrían interesarte.
          </p>
        </div>
        <Link
          to="/products"
          className="text-[#ff4a8d] font-bold text-sm hover:underline underline-offset-8 flex-shrink-0 ml-4 transition-opacity hover:opacity-80">
          VER TODO
        </Link>
      </div>

<<<<<<< HEAD
      {/* Infinite carousel */}
      <ProductCarousel products={products} />
=======
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
        {relatedProducts.map(product => (
          <div
            key={product.id}
            className="bg-surface-container-low rounded-xl border border-white/5 overflow-hidden group hover:border-cyan-400/50 transition-all hover:-translate-y-2"
          >
            <div className="relative aspect-square bg-black p-8">
              <div className="scanline-overlay absolute inset-0 opacity-10 pointer-events-none" />
              <img
                alt={product.name}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                src={product.image}
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAyNTAgMjUwIiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJ4TWlkWU1pZCBtZWV0Ij48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMWYyMTI4Ii8+PHBhdGggZD0iTTEyNSAxMDZhMTkgMTkgMCAxIDAgMCAzOGExOSAxOSAwIDAgMCAwLTM4em0tMjIgNTFhNDEgNDEgMCAwIDEgNDQtMTNsMjEgMjFWMTE2YTc1IDc1 0IDAgMC0xNTAtMHY1N2wyNi0yNmMxNS0xNSAzOS0xNSA1NCAweiIgZmlsbD0iIzM4M2I0ZCIvPjwvc3ZnPg=='
                }}
              />
            </div>
            <div className="p-md">
              <p className="text-[10px] text-label-caps text-on-surface-variant mb-1">
                {product.category ? 'PRODUCT' : 'ACCESSORY'}
              </p>
              <h4 className="font-bold text-lg mb-2 text-on-surface">{product.name}</h4>
              <div className="flex items-center justify-between">
                <span className={`text-xl font-black ${product.inStock ? 'text-primary-container' : 'text-on-surface-variant'}`}>
                  {product.inStock ? `$${product.price.toFixed(2)}` : 'Sin stock'}
                </span>
                <button
                  onClick={() => addToCart(product)}
                  disabled={!product.inStock}
                  className="material-symbols-outlined text-on-surface-variant hover:text-cyan-400 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Add to cart"
                >
                  add_shopping_cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
>>>>>>> f978315c022390f644d5cf2e1c6bd5b1bbd68c96
    </section>
  )
}
