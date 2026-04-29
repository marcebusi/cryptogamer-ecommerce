import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import CategorySidebar from '../components/products/CategorySidebar'
import ProductCard from '../components/products/ProductCard'
import { useDynamicProducts } from '../hooks/useDynamicProducts'
import { useCategories, parseCategoryChildren } from '../context/CategoriesContext'

type ViewMode = 'grid' | 'list'

export default function ProductsPage() {
  const [searchParams] = useSearchParams()
  const [viewMode, setViewMode]       = useState<ViewMode>('grid')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const { categories } = useCategories()

  const cat = searchParams.get('cat') ?? ''
  const sub = searchParams.get('sub') ?? ''

  const { products: allProducts, isLoading } = useDynamicProducts({ category: cat || undefined })

  const filtered = allProducts.filter(p => {
    if (sub && p.subcategory !== sub) return false
    return true
  })

  // Resolve labels from dynamic categories
  const catDef   = categories.find(c => c.slug === cat)
  const catLabel = catDef?.name ?? 'Todos los productos'
  const subLabel = (() => {
    if (!sub || !catDef) return ''
    const children = parseCategoryChildren(catDef.children)
    const found = children.find(s => s.id === sub)
    return found?.label ?? sub
  })()
  const title    = sub ? subLabel : catLabel
  const subtitle = sub ? catDef?.name : cat ? 'Explorá nuestra selección.' : 'Todo el catálogo de Cryptogamer.'

  return (
    <main className="max-w-screen-2xl mx-auto px-4 md:px-8 py-lg">

      {/* Mobile filter bar */}
      <div className="flex md:hidden items-center justify-between mb-md">
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex items-center gap-xs px-sm py-xs bg-surface-container border border-white/10 rounded-xl text-sm font-semibold text-on-surface cursor-pointer hover:border-purple-500/30 transition-colors">
          <span className="material-symbols-outlined text-sm text-purple-400">tune</span>
          Filtros
          {(cat || sub) && <span className="w-2 h-2 rounded-full bg-primary-container inline-block" />}
        </button>
        <div className="flex gap-xs">
          <button onClick={() => setViewMode('grid')} className={`p-2 border rounded-lg cursor-pointer transition-colors ${viewMode === 'grid' ? 'border-tertiary-container text-tertiary-container' : 'border-outline-variant text-on-surface-variant'}`}>
            <span className="material-symbols-outlined text-sm">grid_view</span>
          </button>
          <button onClick={() => setViewMode('list')} className={`p-2 border rounded-lg cursor-pointer transition-colors ${viewMode === 'list' ? 'border-tertiary-container text-tertiary-container' : 'border-outline-variant text-on-surface-variant'}`}>
            <span className="material-symbols-outlined text-sm">list</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-lg">
        <CategorySidebar mobileOpen={sidebarOpen} onMobileClose={() => setSidebarOpen(false)} />

        <section className="flex-1 min-w-0">
          {/* Desktop header */}
          <div className="hidden md:flex justify-between items-end mb-lg">
            <div>
              {sub && catDef && (
                <p className="text-xs text-on-surface-variant uppercase tracking-widest mb-1 font-['Plus_Jakarta_Sans']">{catDef.name}</p>
              )}
              <h1 className="font-['Plus_Jakarta_Sans'] font-black text-2xl md:text-3xl text-on-surface mb-1">{title}</h1>
              <p className="text-on-surface-variant text-sm">
                {subtitle}
                {!isLoading && filtered.length > 0 && (
                  <span className="ml-2 text-primary-container font-semibold">
                    {filtered.length} {filtered.length === 1 ? 'producto' : 'productos'}
                  </span>
                )}
              </p>
            </div>
            <div className="flex gap-xs flex-shrink-0">
              <button onClick={() => setViewMode('grid')} className={`p-2 border rounded-lg cursor-pointer transition-colors ${viewMode === 'grid' ? 'border-tertiary-container text-tertiary-container' : 'border-outline-variant text-on-surface-variant hover:border-tertiary-container'}`}>
                <span className="material-symbols-outlined">grid_view</span>
              </button>
              <button onClick={() => setViewMode('list')} className={`p-2 border rounded-lg cursor-pointer transition-colors ${viewMode === 'list' ? 'border-tertiary-container text-tertiary-container' : 'border-outline-variant text-on-surface-variant hover:border-tertiary-container'}`}>
                <span className="material-symbols-outlined">list</span>
              </button>
            </div>
          </div>

          {/* Mobile title */}
          <div className="md:hidden mb-md">
            <h1 className="font-['Plus_Jakarta_Sans'] font-black text-xl text-on-surface">{title}</h1>
            {!isLoading && (
              <p className="text-xs text-on-surface-variant mt-0.5">
                {filtered.length} {filtered.length === 1 ? 'producto' : 'productos'}
              </p>
            )}
          </div>

          {/* Loading skeleton */}
          {isLoading && (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-md">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square rounded-xl bg-white/5 mb-sm" />
                  <div className="h-4 bg-white/5 rounded mb-2" />
                  <div className="h-3 bg-white/5 rounded w-1/2" />
                </div>
              ))}
            </div>
          )}

          {!isLoading && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-xl text-on-surface-variant">
              <span className="material-symbols-outlined text-5xl mb-md opacity-30">inventory_2</span>
              <p className="text-lg font-semibold text-on-surface mb-xs">Sin productos en esta categoría</p>
              <p className="text-sm">Pronto agregaremos más stock.</p>
            </div>
          )}

          {!isLoading && filtered.length > 0 && (
            <div className={viewMode === 'grid'
              ? 'grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-md'
              : 'flex flex-col gap-md'
            }>
              {filtered.map(product => <ProductCard key={product.id} product={product} />)}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
