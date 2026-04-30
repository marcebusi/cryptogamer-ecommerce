import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import CategorySidebar from '../components/products/CategorySidebar'
import ProductCard from '../components/products/ProductCard'
import { useDynamicProducts } from '../hooks/useDynamicProducts'
import { useCategories, parseCategoryChildren } from '../context/CategoriesContext'

type StockFilter = 'all' | 'inStock' | 'outOfStock'
type SortOrder = 'default' | 'price-asc' | 'price-desc'

export default function ProductsPage() {
  const [searchParams] = useSearchParams()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sortOrder, setSortOrder] = useState<SortOrder>('default')

  // Advanced filters (client-side after fetch)
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [sliderMax, setSliderMax] = useState(2000)
  const [stockFilter, setStockFilter] = useState<StockFilter>('all')
  const [selectedConditions, setSelectedConditions] = useState<string[]>([])
  const [filtersOpen, setFiltersOpen] = useState(false)

  const { categories } = useCategories()

  const cat    = searchParams.get('cat') ?? ''
  const sub    = searchParams.get('sub') ?? ''
  const search = searchParams.get('search') ?? ''

  const { products: allProducts, isLoading } = useDynamicProducts({ category: cat || undefined })

  const toggleCondition = (c: string) =>
    setSelectedConditions(prev =>
      prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]
    )

  const filtered = allProducts.filter(p => {
    if (sub && p.subcategory !== sub) return false
    if (minPrice && p.price < Number(minPrice)) return false
    if (maxPrice && p.price > Number(maxPrice)) return false
    if (sliderMax < 2000 && p.price > sliderMax) return false
    if (stockFilter === 'inStock' && !p.inStock) return false
    if (stockFilter === 'outOfStock' && p.inStock) return false
    if (selectedConditions.length > 0 && !selectedConditions.includes(p.condition ?? 'new')) return false
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) &&
        !p.description.toLowerCase().includes(search.toLowerCase())) return false
    return true
  }).sort((a, b) => {
    if (sortOrder === 'price-asc') return a.price - b.price
    if (sortOrder === 'price-desc') return b.price - a.price
    return 0
  })

  const catDef   = categories.find(c => c.slug === cat)
  const catLabel = catDef?.name ?? (search ? `Resultados para "${search}"` : 'Todos los productos')
  const subLabel = (() => {
    if (!sub || !catDef) return ''
    const children = parseCategoryChildren(catDef.children)
    const found = children.find(s => s.id === sub)
    return found?.label ?? sub
  })()
  const title    = sub ? subLabel : catLabel
  const subtitle = sub ? catDef?.name : cat ? 'Explorá nuestra selección.' : search ? '' : 'Todo el catálogo de Cryptogamer\'s.'

  const hasActiveFilters = minPrice || maxPrice || sliderMax < 2000 || stockFilter !== 'all' || selectedConditions.length > 0
  const clearFilters = () => { setMinPrice(''); setMaxPrice(''); setSliderMax(2000); setStockFilter('all'); setSelectedConditions([]) }

  return (
    <main className="max-w-screen-2xl mx-auto px-4 md:px-8 py-lg">

      {/* Mobile filter bar */}
      <div className="flex md:hidden items-center justify-between mb-md gap-xs">
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex items-center gap-xs px-sm py-xs bg-surface-container border border-white/10 rounded-xl text-sm font-semibold text-on-surface cursor-pointer hover:border-purple-500/30 transition-colors">
          <span className="material-symbols-outlined text-sm text-purple-400">tune</span>
          Filtros
          {(cat || sub) && <span className="w-2 h-2 rounded-full bg-primary-container inline-block" />}
        </button>
        <select
          value={sortOrder}
          onChange={e => setSortOrder(e.target.value as SortOrder)}
          className="bg-surface-container border border-white/10 rounded-xl px-sm py-xs text-sm text-on-surface cursor-pointer outline-none focus:border-purple-500/50">
          <option value="default">Relevancia</option>
          <option value="price-asc">Menor precio</option>
          <option value="price-desc">Mayor precio</option>
        </select>
      </div>

      <div className="flex flex-col md:flex-row gap-lg">
        <CategorySidebar
          mobileOpen={sidebarOpen}
          onMobileClose={() => setSidebarOpen(false)}
          sliderMax={sliderMax}
          onSliderMaxChange={setSliderMax}
          selectedConditions={selectedConditions}
          onConditionToggle={toggleCondition}
        />

        <section className="flex-1 min-w-0">
          {/* Desktop header */}
          <div className="hidden md:flex justify-between items-end mb-md">
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
            <div className="flex items-center gap-sm flex-shrink-0">
              {/* Sort */}
              <div className="relative flex items-center">
                <span className="material-symbols-outlined text-sm text-on-surface-variant absolute left-2.5 pointer-events-none">swap_vert</span>
                <select
                  value={sortOrder}
                  onChange={e => setSortOrder(e.target.value as SortOrder)}
                  className={`pl-8 pr-3 py-2 border rounded-xl text-sm font-semibold cursor-pointer outline-none transition-all appearance-none ${sortOrder !== 'default' ? 'border-purple-500/60 text-purple-300 bg-purple-600/10' : 'border-outline-variant text-on-surface-variant bg-transparent hover:border-purple-500/30'}`}>
                  <option value="default">Relevancia</option>
                  <option value="price-asc">Menor precio</option>
                  <option value="price-desc">Mayor precio</option>
                </select>
              </div>
              {/* Filtros avanzados toggle */}
              <button
                onClick={() => setFiltersOpen(p => !p)}
                className={`flex items-center gap-1 px-3 py-2 border rounded-xl text-sm font-semibold cursor-pointer transition-all ${hasActiveFilters ? 'border-purple-500/60 text-purple-300 bg-purple-600/10' : 'border-outline-variant text-on-surface-variant hover:border-purple-500/30'}`}>
                <span className="material-symbols-outlined text-sm">filter_list</span>
                Filtros
                {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-purple-400 inline-block" />}
              </button>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {filtersOpen && (
            <div className="bg-surface-container border border-white/10 rounded-xl p-md mb-md flex flex-wrap gap-md items-end">
              {/* Price range */}
              <div className="flex flex-col gap-1">
                <p className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Precio</p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={minPrice}
                    onChange={e => setMinPrice(e.target.value)}
                    placeholder="Mín"
                    className="w-24 bg-surface-container-high border border-outline-variant rounded-lg px-2 py-1.5 text-sm text-on-surface outline-none focus:border-purple-500"
                  />
                  <span className="text-on-surface-variant text-xs">—</span>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={e => setMaxPrice(e.target.value)}
                    placeholder="Máx"
                    className="w-24 bg-surface-container-high border border-outline-variant rounded-lg px-2 py-1.5 text-sm text-on-surface outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Stock */}
              <div className="flex flex-col gap-1">
                <p className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Stock</p>
                <div className="flex gap-1">
                  {(['all', 'inStock', 'outOfStock'] as StockFilter[]).map(v => (
                    <button key={v} onClick={() => setStockFilter(v)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${stockFilter === v ? 'bg-purple-600 text-white' : 'bg-surface-container-high text-on-surface-variant hover:bg-white/5'}`}>
                      {v === 'all' ? 'Todos' : v === 'inStock' ? 'Con stock' : 'Sin stock'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Condition */}
              <div className="flex flex-col gap-1">
                <p className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Condición</p>
                <div className="flex flex-wrap gap-1">
                  {[{ value: 'new', label: 'Nuevo' }, { value: 'like-new', label: 'Como Nuevo' }, { value: 'excellent', label: 'Excelente' }, { value: 'good', label: 'Bueno' }].map(({ value, label }) => (
                    <button key={value} onClick={() => toggleCondition(value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${selectedConditions.includes(value) ? 'bg-purple-600 text-white' : 'bg-surface-container-high text-on-surface-variant hover:bg-white/5'}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {hasActiveFilters && (
                <button onClick={clearFilters} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer text-error hover:bg-error/10 transition-colors border border-error/20">
                  <span className="material-symbols-outlined text-sm">close</span>
                  Limpiar
                </button>
              )}
            </div>
          )}

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
              <p className="text-lg font-semibold text-on-surface mb-xs">Sin productos</p>
              <p className="text-sm">Probá cambiando los filtros o explorá otra categoría.</p>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="mt-md px-4 py-2 bg-purple-600/20 text-purple-300 rounded-xl text-sm font-semibold hover:bg-purple-600/30 transition-colors cursor-pointer">
                  Limpiar filtros
                </button>
              )}
            </div>
          )}

          {!isLoading && filtered.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-md">
              {filtered.map(product => <ProductCard key={product.id} product={product} />)}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
