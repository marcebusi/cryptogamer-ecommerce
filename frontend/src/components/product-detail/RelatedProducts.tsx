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

      {/* Infinite carousel */}
      <ProductCarousel products={products} />
    </section>
  )
}
