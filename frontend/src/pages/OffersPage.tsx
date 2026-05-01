import { useState } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/products/ProductCard'
import { useDynamicProducts } from '../hooks/useDynamicProducts'

type Sort = 'discount' | 'price-asc' | 'price-desc'

export default function OffersPage() {
  const [sort, setSort] = useState<Sort>('discount')
  const { products: rawOffers, isLoading } = useDynamicProducts({ isOffer: true })

  const sorted = [...rawOffers].sort((a, b) => {
    if (sort === 'discount') {
      const da = a.originalPrice ? a.originalPrice - a.price : 0
      const db = b.originalPrice ? b.originalPrice - b.price : 0
      return db - da
    }
    if (sort === 'price-asc')  return a.price - b.price
    if (sort === 'price-desc') return b.price - a.price
    return 0
  })

  return (
    <main>
      {/* Hero banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-purple-950/20 to-background border-b border-purple-500/20">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-secondary-container/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary-container/8 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-screen-2xl mx-auto px-4 md:px-8 py-xl flex flex-col md:flex-row items-center justify-between gap-lg">
          <div>
            <div className="inline-flex items-center gap-xs px-sm py-1 rounded-full bg-secondary-container/20 border border-secondary-container/30 text-secondary-container text-xs font-bold uppercase tracking-widest mb-sm">
              <span className="material-symbols-outlined text-sm">local_offer</span>
              Ofertas especiales
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-on-background font-['Plus_Jakarta_Sans'] leading-tight mb-xs">
              PRECIOS{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary-container to-primary-container">
                INCREÍBLES
              </span>
            </h1>
            <p className="text-on-surface-variant max-w-lg">
              Productos seleccionados con descuentos exclusivos. Stock limitado, ¡no te los pierdas!
            </p>
          </div>

          <div className="flex flex-col items-center gap-xs bg-surface-container rounded-2xl border border-white/10 p-md text-center min-w-[160px]">
            <span className="material-symbols-outlined text-secondary-container text-3xl">bolt</span>
            <p className="text-3xl font-black text-on-surface">{isLoading ? '—' : sorted.length}</p>
            <p className="text-xs text-on-surface-variant uppercase tracking-widest">Ofertas activas</p>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="max-w-screen-2xl mx-auto px-4 md:px-8 py-lg">
        {/* Sort bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-sm mb-lg">
          <p className="text-on-surface-variant text-sm">
            Mostrando <span className="text-on-surface font-semibold">{isLoading ? '…' : sorted.length}</span> ofertas
          </p>
          <div className="flex items-center gap-xs overflow-x-auto pb-1 -mb-1">
            <span className="text-xs text-on-surface-variant uppercase tracking-wider flex-shrink-0">Ordenar:</span>
            {([
              ['discount',   'Mayor descuento'],
              ['price-asc',  'Menor precio'],
              ['price-desc', 'Mayor precio'],
            ] as [Sort, string][]).map(([val, label]) => (
              <button
                key={val}
                onClick={() => setSort(val)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex-shrink-0 ${
                  sort === val
                    ? 'bg-secondary-container text-on-secondary'
                    : 'bg-surface-container text-on-surface-variant border border-white/10 hover:border-secondary-container/40'
                }`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-md">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square rounded-xl bg-white/5 mb-sm" />
                <div className="h-4 bg-white/5 rounded mb-2" />
                <div className="h-3 bg-white/5 rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && sorted.length === 0 && (
          <div className="flex flex-col items-center justify-center py-xl text-on-surface-variant">
            <span className="material-symbols-outlined text-5xl mb-md opacity-30">local_offer</span>
            <p className="text-lg font-semibold">Sin ofertas disponibles</p>
            <p className="text-sm mt-1 mb-md">El admin puede marcar productos como oferta desde el panel.</p>
            <Link to="/products" className="text-sm text-primary-container hover:underline">Ver todos los productos</Link>
          </div>
        )}

        {!isLoading && sorted.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-md">
            {sorted.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}

        {/* CTA */}
        <div className="mt-xl text-center">
          <p className="text-on-surface-variant text-sm mb-sm">¿No encontrás lo que buscás?</p>
          <Link
            to="/products"
            className="inline-flex items-center gap-xs px-lg py-sm bg-surface-container border border-white/10 hover:border-primary-container/40 text-on-surface rounded-xl font-semibold text-sm transition-all hover:bg-surface-container-high cursor-pointer">
            <span className="material-symbols-outlined text-sm">apps</span>
            Ver catálogo completo
          </Link>
        </div>
      </section>
    </main>
  )
}
