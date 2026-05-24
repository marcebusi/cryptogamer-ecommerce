import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import CategorySidebar from '../components/products/CategorySidebar'
import ProductCard from '../components/products/ProductCard'
import LatestArrivals from '../components/home/LatestArrivals'
import { useDynamicProducts } from '../hooks/useDynamicProducts'
import { useCategories, parseCategoryChildren } from '../context/CategoriesContext'

type StockFilter = 'all' | 'inStock' | 'outOfStock'
type SortOrder   = 'default' | 'price-asc' | 'price-desc' | 'newest'

const SORT_OPTIONS: { value: SortOrder; label: string; icon: string }[] = [
  { value: 'default',    label: 'Relevancia',     icon: 'sort' },
  { value: 'newest',     label: 'Más recientes',  icon: 'new_releases' },
  { value: 'price-asc',  label: 'Menor precio',   icon: 'arrow_upward' },
  { value: 'price-desc', label: 'Mayor precio',   icon: 'arrow_downward' },
]

const ITEMS_PER_PAGE = 9
const MAX_PRICE      = 10_000_000

export default function ProductsPage() {
  const [searchParams] = useSearchParams()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sortOrder, setSortOrder]     = useState<SortOrder>('default')
  const [sortOpen, setSortOpen]       = useState(false)
  const sortRef = useRef<HTMLDivElement>(null)

  // Filters
  const [minPrice,  setMinPrice]  = useState('')
  const [maxPrice,  setMaxPrice]  = useState('')
  const [sliderMax, setSliderMax] = useState(MAX_PRICE)
  const [stockFilter, setStockFilter]       = useState<StockFilter>('all')
  const [selectedConditions, setSelectedConditions] = useState<string[]>([])
  const [filtersOpen, setFiltersOpen] = useState(false)

  // Pagination
  const [page, setPage] = useState(1)

  const { categories } = useCategories()

  const cat    = searchParams.get('cat') ?? ''
  const sub    = searchParams.get('sub') ?? ''
  const search = searchParams.get('search') ?? ''

  const { products: allProducts, isLoading } = useDynamicProducts({ category: cat || undefined })

  // Close sort dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Reset to page 1 whenever any filter/sort/route changes
  useEffect(() => { setPage(1) }, [cat, sub, search, sortOrder, minPrice, maxPrice, sliderMax, stockFilter, selectedConditions.join()])

  const toggleCondition = (c: string) =>
    setSelectedConditions(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])

  const filtered = allProducts.filter(p => {
    // Match exact subcategory OR any sub that starts with the parent prefix (e.g. "xbox" matches "xbox-series")
    if (sub && !p.subcategory?.startsWith(sub)) return false
    if (minPrice && p.price < Number(minPrice)) return false
    if (maxPrice && p.price > Number(maxPrice)) return false
    if (sliderMax < MAX_PRICE && p.price > sliderMax) return false
    if (stockFilter === 'inStock'    && !p.inStock) return false
    if (stockFilter === 'outOfStock' &&  p.inStock) return false
    if (selectedConditions.length > 0 && !selectedConditions.includes(p.condition ?? 'new')) return false
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) &&
        !p.description.toLowerCase().includes(search.toLowerCase())) return false
    return true
  }).sort((a, b) => {
    if (sortOrder === 'price-asc')  return a.price - b.price
    if (sortOrder === 'price-desc') return b.price - a.price
    if (sortOrder === 'newest')     return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
    return 0
  })

  const totalPages  = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const pagedItems  = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const catDef   = categories.find(c => c.slug === cat)
  const catLabel = catDef?.name ?? (search ? `Resultados para "${search}"` : 'Todos los productos')
  const subLabel = (() => {
    if (!sub || !catDef) return ''
    const children = parseCategoryChildren(catDef.children)
    const found    = children.find(s => s.id === sub)
    if (found) return found.label
    // Check sub-sub
    for (const s of children) {
      const ss = (s.children ?? []).find(x => x.id === sub)
      if (ss) return `${s.label} › ${ss.label}`
    }
    return sub
  })()
  const title    = sub ? subLabel : catLabel
  const subtitle = sub ? catDef?.name : cat ? 'Explorá nuestra selección.' : search ? '' : "Todo el catálogo de Cryptogamer's."

  const hasActiveFilters = !!(minPrice || maxPrice || sliderMax < MAX_PRICE || stockFilter !== 'all' || selectedConditions.length > 0)
  const clearFilters = () => {
    setMinPrice(''); setMaxPrice(''); setSliderMax(MAX_PRICE)
    setStockFilter('all'); setSelectedConditions([])
  }

  const activeSortLabel = SORT_OPTIONS.find(o => o.value === sortOrder)?.label ?? 'Relevancia'

  // Page range helper — shows at most 7 page buttons with ellipsis
  const pageNums = (() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    if (page <= 4)  return [1, 2, 3, 4, 5, '…', totalPages]
    if (page >= totalPages - 3) return [1, '…', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
    return [1, '…', page - 1, page, page + 1, '…', totalPages]
  })()

  return (
    <main className="max-w-screen-2xl mx-auto px-4 md:px-8 py-lg">

      {/* Mobile filter bar */}
      <div className="flex md:hidden items-center justify-between mb-md gap-xs">
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex items-center gap-xs px-sm py-xs bg-surface-container border border-white/10 rounded-xl text-sm font-semibold text-on-surface cursor-pointer hover:border-pink-500/30 transition-colors">
          <span className="material-symbols-outlined text-sm text-pink-400">tune</span>
          Filtros
          {(cat || sub) && <span className="w-2 h-2 rounded-full bg-secondary-container inline-block" />}
        </button>
        <select
          value={sortOrder}
          onChange={e => setSortOrder(e.target.value as SortOrder)}
          className="bg-surface-container border border-white/10 rounded-xl px-sm py-xs text-sm text-on-surface cursor-pointer outline-none focus:border-pink-500/50">
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <div className="flex flex-col md:flex-row gap-lg">
        <CategorySidebar
          mobileOpen={sidebarOpen}
          onMobileClose={() => setSidebarOpen(false)}
          sliderMax={sliderMax}
          onSliderMaxChange={setSliderMax}
          minPrice={minPrice}
          onMinPriceChange={setMinPrice}
          maxPrice={maxPrice}
          onMaxPriceChange={setMaxPrice}
          selectedConditions={selectedConditions}
          onConditionToggle={toggleCondition}
        />

        <section className="flex-1 min-w-0">

          {/* Desktop header */}
          <div className="hidden md:flex justify-between items-end mb-md gap-sm">
            <div>
              {sub && catDef && (
                <p className="text-xs text-on-surface-variant uppercase tracking-widest mb-1 font-['Plus_Jakarta_Sans']">{catDef.name}</p>
              )}
              <h1 className="font-['Plus_Jakarta_Sans'] font-black text-2xl md:text-3xl text-on-surface mb-1">{title}</h1>
              <p className="text-on-surface-variant text-sm">
                {subtitle}
                {!isLoading && filtered.length > 0 && (
                  <span className="ml-2 text-purple-400 font-semibold">
                    {filtered.length} {filtered.length === 1 ? 'producto' : 'productos'}
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-sm flex-shrink-0">

              {/* ── Custom sort dropdown ── */}
              <div className="relative" ref={sortRef}>
                <button
                  onClick={() => setSortOpen(p => !p)}
                  className={`flex items-center gap-2 px-3 py-2 border rounded-xl text-sm font-semibold cursor-pointer transition-all whitespace-nowrap
                    ${sortOrder !== 'default'
                      ? 'border-purple-500/50 text-purple-400 bg-purple-500/10'
                      : 'border-outline-variant text-on-surface-variant bg-transparent hover:border-purple-500/30 hover:text-on-surface'}`}>
                  <span className="material-symbols-outlined text-sm">swap_vert</span>
                  <span>Ordenar por{sortOrder !== 'default' ? `: ${activeSortLabel}` : ''}</span>
                  <span className={`material-symbols-outlined text-sm transition-transform duration-200 ${sortOpen ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </button>

                {sortOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 admin-card-bg border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
                    style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05)' }}>
                    {SORT_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => { setSortOrder(opt.value); setSortOpen(false) }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all cursor-pointer
                          ${sortOrder === opt.value
                            ? 'text-purple-400 bg-purple-500/12 font-semibold'
                            : 'text-white/55 hover:text-white hover:bg-white/5'}`}>
                        <span className="material-symbols-outlined text-sm flex-shrink-0"
                          style={{ color: sortOrder === opt.value ? '#a855f7' : undefined }}>
                          {opt.icon}
                        </span>
                        <span className="flex-1 text-left">{opt.label}</span>
                        {sortOrder === opt.value && (
                          <span className="material-symbols-outlined text-xs text-purple-400">check</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Advanced filters toggle */}
              <button
                onClick={() => setFiltersOpen(p => !p)}
                className={`flex items-center gap-1 px-3 py-2 border rounded-xl text-sm font-semibold cursor-pointer transition-all ${hasActiveFilters ? 'border-pink-500/50 text-pink-300 bg-pink-500/10' : 'border-outline-variant text-on-surface-variant hover:border-pink-500/30'}`}>
                <span className="material-symbols-outlined text-sm">filter_list</span>
                Filtros
                {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-pink-400 inline-block" />}
              </button>
            </div>
          </div>

          {/* Advanced Filters Panel (stock + condition only) */}
          {filtersOpen && (
            <div className="bg-surface-container border border-white/10 rounded-xl p-md mb-md flex flex-wrap gap-md items-end">
              {/* Stock */}
              <div className="flex flex-col gap-1">
                <p className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Stock</p>
                <div className="flex gap-1">
                  {(['all', 'inStock', 'outOfStock'] as StockFilter[]).map(v => (
                    <button key={v} onClick={() => setStockFilter(v)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${stockFilter === v ? 'bg-red-600 text-white' : 'bg-surface-container-high text-on-surface-variant hover:bg-white/5'}`}>
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
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${selectedConditions.includes(value) ? 'bg-red-600 text-white' : 'bg-surface-container-high text-on-surface-variant hover:bg-white/5'}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {hasActiveFilters && (
                <button onClick={clearFilters} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer text-error hover:bg-error/10 transition-colors border border-error/20">
                  <span className="material-symbols-outlined text-sm">close</span>
                  Limpiar todo
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
              {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square rounded-xl bg-white/5 mb-sm" />
                  <div className="h-4 bg-white/5 rounded mb-2" />
                  <div className="h-3 bg-white/5 rounded w-1/2" />
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-xl text-on-surface-variant">
              <span className="material-symbols-outlined text-5xl mb-md opacity-30">inventory_2</span>
              <p className="text-lg font-semibold text-on-surface mb-xs">Sin productos</p>
              <p className="text-sm">Probá cambiando los filtros o explorá otra categoría.</p>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="mt-md px-4 py-2 bg-pink-600/20 text-pink-300 rounded-xl text-sm font-semibold hover:bg-pink-600/30 transition-colors cursor-pointer">
                  Limpiar filtros
                </button>
              )}
            </div>
          )}

          {/* Product grid */}
          {!isLoading && filtered.length > 0 && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-md">
                {pagedItems.map(product => (
                  <ProductCard key={product.id} product={product} accent="secondary" />
                ))}
              </div>

              {/* ── Pagination ── */}
              {totalPages > 1 && (
                <div className="flex items-center justify-end gap-1.5 mt-10">
                  {/* Prev */}
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/5 text-white/40 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer">
                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                  </button>

                  {/* Page numbers */}
                  {pageNums.map((n, i) =>
                    n === '…'
                      ? <span key={`ellipsis-${i}`} className="w-9 h-9 flex items-center justify-center text-white/25 text-sm">…</span>
                      : (
                        <button
                          key={n}
                          onClick={() => setPage(Number(n))}
                          className={`w-9 h-9 rounded-xl text-sm font-bold transition-all cursor-pointer
                            ${page === n
                              ? 'bg-white/12 text-white border border-white/20'
                              : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/80'}`}>
                          {n}
                        </button>
                      )
                  )}

                  {/* Next */}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/5 text-white/40 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer">
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </button>
                </div>
              )}

              {/* Page info */}
              {totalPages > 1 && (
                <p className="text-right text-xs text-white/25 mt-3">
                  Página {page} de {totalPages} · {filtered.length} productos
                </p>
              )}
            </>
          )}
        </section>
      </div>

      <div className="mt-xl -mx-4 md:-mx-margin scale-[0.92] sm:scale-100 origin-top">
        <LatestArrivals />
      </div>
    </main>
  )
}
