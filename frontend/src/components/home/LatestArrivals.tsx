import { Link } from 'react-router-dom'
import { useDynamicProducts } from '../../hooks/useDynamicProducts'
import ProductCarousel from '../common/ProductCarousel'

export default function LatestArrivals() {
  const { products, isLoading } = useDynamicProducts({ isFeatured: true, limit: 12 })

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-8 md:px-margin py-xl bg-surface-container-lowest rounded-[2rem] border border-white/5 mb-xl overflow-hidden">

      {/* Header */}
      <div className="flex justify-between items-end mb-lg px-0">
        <div>
          <h2 className="text-2xl md:text-[32px] font-bold leading-tight text-on-background font-['Plus_Jakarta_Sans']">
            Últimas llegadas
          </h2>
          <p className="text-on-surface-variant text-sm md:text-base mt-1">
            Lo más nuevo directo desde las fuentes.
          </p>
        </div>
        <Link
          to="/products"
          className="latest-ver-todo font-bold text-sm hover:underline underline-offset-8 flex-shrink-0 ml-4 transition-opacity hover:opacity-80">
          VER TODO
        </Link>
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-[200px] flex-shrink-0 animate-pulse">
              <div className="aspect-square rounded-2xl bg-white/5 mb-2" />
              <div className="h-3 bg-white/5 rounded mb-1.5" />
              <div className="h-3 bg-white/5 rounded w-2/3" />
            </div>
          ))}
        </div>
      )}

      {/* Carousel */}
      {!isLoading && products.length > 0 && (
        <ProductCarousel products={products} />
      )}

      {/* Empty state */}
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
