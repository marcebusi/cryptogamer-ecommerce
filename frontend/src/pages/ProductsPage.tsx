import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import CategorySidebar from '../components/products/CategorySidebar'
import ProductCard from '../components/products/ProductCard'
import { allProducts } from '../data/products'
import { navCategories } from '../data/categories'

type ViewMode = 'grid' | 'list'

function getSubLabel(catId: string, subId: string): string {
  const cat = navCategories.find(c => c.id === catId)
  if (!cat?.children) return subId
  for (const sub of cat.children) {
    if (sub.id === subId) return sub.label
    if (sub.children) {
      const ssub = sub.children.find(s => s.id === subId)
      if (ssub) return `${sub.label} › ${ssub.label}`
    }
  }
  return subId
}

export default function ProductsPage() {
  const [searchParams] = useSearchParams()
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  const cat = searchParams.get('cat') ?? ''
  const sub = searchParams.get('sub') ?? ''

  const filtered = allProducts.filter(p => {
    if (!cat) return true
    if (p.category !== cat) return false
    if (sub && p.subcategory !== sub) return false
    return true
  })

  const catDef = navCategories.find(c => c.id === cat)
  const title = sub
    ? getSubLabel(cat, sub)
    : catDef?.label ?? 'Todos los productos'

  const subtitle = sub
    ? catDef?.label
    : cat ? 'Explora nuestra selección completa.' : 'Todo el catálogo de Cryptogamer.'

  return (
    <main className="max-w-screen-2xl mx-auto px-4 md:px-8 py-lg flex flex-col md:flex-row gap-lg">
      <CategorySidebar />

      <section className="flex-1 min-w-0">
        {/* Section header */}
        <div className="flex justify-between items-end mb-lg">
          <div>
            {sub && catDef && (
              <p className="text-xs text-on-surface-variant uppercase tracking-widest mb-1 font-['Plus_Jakarta_Sans']">
                {catDef.label}
              </p>
            )}
            <h1 className="font-h1-display text-h2-headline text-on-surface mb-1 font-['Plus_Jakarta_Sans']">
              {title}
            </h1>
            <p className="text-on-surface-variant text-sm">
              {subtitle}
              {filtered.length > 0 && (
                <span className="ml-2 text-primary-container font-semibold">
                  {filtered.length} {filtered.length === 1 ? 'producto' : 'productos'}
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 border rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'border-tertiary-container text-tertiary-container'
                  : 'border-outline-variant text-on-surface-variant hover:border-tertiary-container'
              }`}
              aria-label="Vista cuadrícula"
            >
              <span className="material-symbols-outlined">grid_view</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 border rounded-lg transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'border-tertiary-container text-tertiary-container'
                  : 'border-outline-variant text-on-surface-variant hover:border-tertiary-container'
              }`}
              aria-label="Vista lista"
            >
              <span className="material-symbols-outlined">list</span>
            </button>
          </div>
        </div>

        {/* Product grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-xl text-on-surface-variant">
            <span className="material-symbols-outlined text-5xl mb-md opacity-30">inventory_2</span>
            <p className="text-lg font-semibold text-on-surface mb-xs">Sin productos en esta categoría</p>
            <p className="text-sm">Pronto agregaremos más stock aquí.</p>
          </div>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-md'
                : 'flex flex-col gap-md'
            }
          >
            {filtered.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
