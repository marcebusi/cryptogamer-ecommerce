import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCategories } from '../context/CategoriesContext'
import { api } from '../lib/api'

interface ApiProduct {
  id: string; name: string; slug: string; description: string
  price: number; originalPrice?: number | null
  image: string; badge?: string | null; badgeColor: string
  rating: number; reviewCount: number; inStock: boolean
  sortOrder: number; isOffer: boolean; isFeatured: boolean
  subcategory?: string | null; categoryId: string
  category?: { id: string; name: string; slug: string }
  createdAt: string
}

type Tab = 'category' | 'featured' | 'offers'

/* ─── Single draggable card ────────────────────────────── */
function DragCard({
  product, isDragging, isOver,
  onDragStart, onDragEnd, onDragOver, onDragLeave, onDrop,
  onToggle, toggleIcon, toggleLabel,
}: {
  product: ApiProduct
  isDragging: boolean; isOver: boolean
  onDragStart: () => void; onDragEnd: () => void
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: () => void; onDrop: () => void
  onToggle?: () => void; toggleIcon?: string; toggleLabel?: string
}) {
  const disc = product.originalPrice && product.originalPrice > product.price
    ? Math.round((1 - product.price / product.originalPrice) * 100) : 0

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`
        relative group rounded-2xl border flex flex-col overflow-hidden select-none
        transition-all duration-150
        ${isDragging ? 'opacity-30 scale-95 border-dashed border-primary-container/60' : ''}
        ${isOver && !isDragging ? 'border-primary-container shadow-[0_0_20px_rgba(57,255,20,0.3)] scale-[1.03]' : ''}
        ${!isDragging && !isOver ? 'border-white/8 hover:border-white/20' : ''}
        bg-surface-container-low cursor-grab active:cursor-grabbing
      `}
    >
      {/* Drag handle */}
      <div className="absolute top-1.5 left-1.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="bg-black/60 rounded-lg p-0.5">
          <span className="material-symbols-outlined text-white/70 text-base leading-none">drag_indicator</span>
        </div>
      </div>

      {/* Discount badge */}
      {disc > 0 && (
        <div className="absolute top-1.5 right-1.5 z-10 bg-secondary-container text-on-secondary text-[9px] font-black px-1.5 py-0.5 rounded-full">
          -{disc}%
        </div>
      )}

      {/* Image */}
      <div className="aspect-square product-img-bg flex items-center justify-center overflow-hidden">
        <img
          src={product.image || 'https://placehold.co/200x200/111318/39ff14?text=?'}
          alt={product.name}
          className="w-full h-full object-contain p-2 pointer-events-none"
          onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/200x200/111318/39ff14?text=?' }}
        />
      </div>

      {/* Info */}
      <div className="p-2.5 flex flex-col gap-1 flex-1">
        <p className="text-[11px] font-bold text-on-surface line-clamp-2 leading-tight font-['Plus_Jakarta_Sans']">
          {product.name}
        </p>
        <div className="flex items-baseline gap-1 mt-auto">
          <span className="text-primary-container font-black text-sm">${product.price.toFixed(0)}</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-on-surface-variant line-through text-[10px]">${product.originalPrice.toFixed(0)}</span>
          )}
        </div>
        {/* Category label */}
        <p className="text-[9px] text-on-surface-variant/50 uppercase tracking-wider">
          {product.category?.name ?? ''}
        </p>

        {onToggle && (
          <button
            onClick={e => { e.stopPropagation(); onToggle() }}
            className="mt-0.5 w-full py-1 text-[10px] font-bold rounded-lg border border-error/30 text-error/70 hover:bg-error/10 hover:text-error transition-all cursor-pointer flex items-center justify-center gap-0.5"
          >
            <span className="material-symbols-outlined text-[11px]">{toggleIcon}</span>
            {toggleLabel}
          </button>
        )}
      </div>
    </div>
  )
}

/* ─── Main page ─────────────────────────────────────────── */
export default function AdminEditorPage() {
  const { isAdmin, isLoading: authLoading } = useAuth()
  const navigate = useNavigate()
  const { categories } = useCategories()

  useEffect(() => {
    if (!authLoading && !isAdmin) navigate('/')
  }, [authLoading, isAdmin, navigate])

  const [activeTab, setActiveTab]     = useState<Tab>('category')
  const [selectedCat, setSelectedCat] = useState<string>('all')
  const [products, setProducts]       = useState<ApiProduct[]>([])
  const [loading, setLoading]         = useState(false)
  const [savedMsg, setSavedMsg]       = useState(false)

  /* drag state — use state so components re-render */
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const dragFromIdx = useRef<number>(-1)

  /* ── Fetch ── */
  const fetchProducts = useCallback(async (cat: string, tab: Tab) => {
    setLoading(true)
    try {
      let qs = ''
      if (tab === 'featured') qs = '?isFeatured=true'
      else if (tab === 'offers') qs = '?isOffer=true'
      else if (cat !== 'all') qs = `?category=${cat}`

      const res = await api.get<{ success: boolean; data: ApiProduct[] }>(`/api/products${qs}`)
      setProducts(res.data.sort((a, b) => a.sortOrder - b.sortOrder))
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProducts(selectedCat, activeTab)
  }, [selectedCat, activeTab, fetchProducts])

  /* ── Save order ── */
  const saveOrder = useCallback((list: ApiProduct[]) => {
    const updates = list.map((p, i) => ({ id: p.id, sortOrder: i }))
    updates.forEach(u => {
      api.put(`/api/admin/products/${u.id}`, { sortOrder: u.sortOrder })
        .catch(() => {})
    })
    setSavedMsg(true)
    setTimeout(() => setSavedMsg(false), 2000)
  }, [])

  /* ── Drag handlers ── */
  const handleDragStart = (id: string, idx: number) => {
    setDraggingId(id)
    dragFromIdx.current = idx
  }

  const handleDragEnd = () => {
    setDraggingId(null)
    setDragOverId(null)
  }

  const handleDrop = (targetId: string, targetIdx: number) => {
    const fromIdx = dragFromIdx.current
    setDraggingId(null)
    setDragOverId(null)
    if (draggingId === null || draggingId === targetId) return

    setProducts(prev => {
      const arr = [...prev]
      const [moved] = arr.splice(fromIdx, 1)
      arr.splice(targetIdx, 0, moved)
      const updated = arr.map((p, i) => ({ ...p, sortOrder: i }))
      saveOrder(updated)
      return updated
    })
    dragFromIdx.current = -1
  }

  /* ── Toggle featured / offer ── */
  const toggleFlag = async (product: ApiProduct, field: 'isFeatured' | 'isOffer') => {
    try {
      await api.put(`/api/admin/products/${product.id}`, { [field]: !product[field] })
      fetchProducts(selectedCat, activeTab)
    } catch { /* ignore */ }
  }

  if (authLoading) return null

  const TABS = [
    { id: 'category' as Tab, label: 'Por Categoría', icon: 'category' },
    { id: 'featured' as Tab, label: 'Últimas Llegadas (Home)', icon: 'star' },
    { id: 'offers'   as Tab, label: 'Ofertas', icon: 'local_offer' },
  ]

  return (
    <main className="max-w-screen-xl mx-auto px-4 md:px-8 py-lg">

      {/* Header */}
      <div className="mb-xl">
        <div className="inline-flex items-center gap-xs px-sm py-1 rounded-full bg-primary-container/15 border border-primary-container/25 text-primary-container text-xs font-bold uppercase tracking-widest mb-sm">
          <span className="material-symbols-outlined text-sm">tune</span>
          Admin · Editor Visual
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-on-background font-['Plus_Jakarta_Sans'] leading-tight mb-xs">
          Ordenar{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-container to-tertiary-container">
            Productos
          </span>
        </h1>
        <p className="text-on-surface-variant text-sm">
          Arrastrá las cards para cambiar el orden. Los cambios se guardan automáticamente.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-lg flex-wrap">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); if (tab.id !== 'category') setSelectedCat('all') }}
            className={`flex items-center gap-xs px-md py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer border ${
              activeTab === tab.id
                ? 'bg-primary-container text-on-primary border-primary-container shadow-[0_0_16px_rgba(57,255,20,0.3)]'
                : 'border-white/10 text-on-surface-variant hover:border-white/25 hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-base">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Category pills — only for category tab */}
      {activeTab === 'category' && (
        <div className="mb-lg">
          <p className="text-xs text-on-surface-variant uppercase tracking-widest font-semibold mb-sm">Categoría</p>
          <div className="flex flex-wrap gap-2">
            {/* ALL option */}
            <button
              onClick={() => setSelectedCat('all')}
              className={`px-sm py-2 rounded-xl text-sm font-bold transition-all cursor-pointer border ${
                selectedCat === 'all'
                  ? 'bg-primary-container/20 border-primary-container/50 text-primary-container'
                  : 'border-white/8 text-on-surface-variant hover:border-white/20 hover:text-on-surface'
              }`}
            >
              Todos
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.slug)}
                className={`px-sm py-2 rounded-xl text-sm font-bold transition-all cursor-pointer border ${
                  selectedCat === cat.slug
                    ? 'bg-primary-container/20 border-primary-container/50 text-primary-container'
                    : 'border-white/8 text-on-surface-variant hover:border-white/20 hover:text-on-surface'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Info bar */}
      <div className="mb-md flex items-center gap-xs px-sm py-2.5 bg-surface-container rounded-xl border border-white/8 text-xs text-on-surface-variant">
        <span className="material-symbols-outlined text-primary-container text-sm">drag_indicator</span>
        Arrastrá las cards para reordenar · {products.length} producto{products.length !== 1 ? 's' : ''}
        {(activeTab === 'featured' || activeTab === 'offers') && (
          <button
            onClick={() => fetchProducts(selectedCat, activeTab)}
            className="ml-auto text-primary-container font-semibold hover:underline cursor-pointer"
          >
            Actualizar
          </button>
        )}
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-md">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl overflow-hidden border border-white/5">
              <div className="aspect-square bg-white/5" />
              <div className="p-2.5 space-y-2">
                <div className="h-3 bg-white/5 rounded" />
                <div className="h-3 bg-white/5 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && products.length === 0 && (
        <div className="flex flex-col items-center justify-center py-xl text-on-surface-variant">
          <span className="material-symbols-outlined text-5xl mb-md opacity-20">inventory_2</span>
          <p className="font-semibold text-on-surface mb-1">Sin productos</p>
          <p className="text-sm">
            {activeTab === 'featured' && 'Marcá productos como Destacados desde el catálogo.'}
            {activeTab === 'offers' && 'Marcá productos como Oferta desde el catálogo.'}
            {activeTab === 'category' && 'No hay productos en esta categoría.'}
          </p>
        </div>
      )}

      {/* Drag & drop grid */}
      {!loading && products.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-md">
          {products.map((product, idx) => (
            <DragCard
              key={product.id}
              product={product}
              isDragging={draggingId === product.id}
              isOver={dragOverId === product.id && draggingId !== product.id}
              onDragStart={() => handleDragStart(product.id, idx)}
              onDragEnd={handleDragEnd}
              onDragOver={e => { e.preventDefault(); if (draggingId !== product.id) setDragOverId(product.id) }}
              onDragLeave={() => setDragOverId(null)}
              onDrop={() => handleDrop(product.id, idx)}
              onToggle={
                activeTab === 'featured' ? () => toggleFlag(product, 'isFeatured') :
                activeTab === 'offers'   ? () => toggleFlag(product, 'isOffer') :
                undefined
              }
              toggleIcon={activeTab === 'featured' ? 'star_off' : activeTab === 'offers' ? 'label_off' : undefined}
              toggleLabel={activeTab === 'featured' ? 'Quitar de Home' : activeTab === 'offers' ? 'Quitar de Ofertas' : undefined}
            />
          ))}
        </div>
      )}

      {/* Toast: saved */}
      <div className={`fixed bottom-6 right-6 flex items-center gap-xs px-md py-3 bg-surface-container border border-primary-container/40 rounded-2xl shadow-[0_0_20px_rgba(57,255,20,0.2)] text-sm text-on-surface z-50 transition-all duration-300 ${savedMsg ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
        <span className="material-symbols-outlined text-primary-container text-base">check_circle</span>
        Orden guardado
      </div>
    </main>
  )
}
