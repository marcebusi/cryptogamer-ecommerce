import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCategories, parseCategoryChildren } from '../context/CategoriesContext'
import { api } from '../lib/api'
import type { Product, CategoryChild } from '../types'
import './AdminProductPage.css'

const CONDITIONS = [
  { id: 'new',       label: 'Nuevo'      },
  { id: 'like-new',  label: 'Como Nuevo' },
  { id: 'excellent', label: 'Excelente'  },
  { id: 'good',      label: 'Bueno'      },
  { id: 'fair',      label: 'Aceptable'  },
]

interface Spec { icon: string; label: string; value: string }
const EMPTY_SPEC: Spec = { icon: 'star', label: '', value: '' }

/* ─── API product shape (flat from backend) ─────────────────────── */
interface ApiProduct {
  id: string
  name: string
  slug: string
  description: string
  price: number
  originalPrice?: number | null
  image: string
  images: string         // JSON string
  badge?: string | null
  badgeColor: string
  rating: number
  reviewCount: number
  inStock: boolean
  sortOrder?: number
  isOffer?: boolean
  isFeatured?: boolean
  subcategory?: string | null
  condition?: string | null
  conditionScore?: number | null
  conditionDescription?: string | null
  conditionTags: string  // JSON string
  categoryId: string
  category?: { id: string; name: string; slug: string }
  specs?: Spec[]
  createdAt?: string
}

export default function AdminProductPage() {
  const { isAdmin, isLoading: authLoading } = useAuth()
  const { categories } = useCategories()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const filterMode = searchParams.get('filter') // 'offers' | 'featured' | null
  const manageMode = searchParams.get('manage') === 'true'

  useEffect(() => {
    if (!authLoading && !isAdmin) navigate('/')
  }, [authLoading, isAdmin, navigate])

  /* ── Catalog management list ──────────────────── */
  const [allProducts, setAllProducts] = useState<ApiProduct[]>([])
  const [listLoading, setListLoading] = useState(false)

  const fetchAllProducts = async () => {
    setListLoading(true)
    try {
      const res = await api.get<ApiProduct[]>('/api/admin/products')
      setAllProducts(res)
    } catch { /* ignore */ }
    finally { setListLoading(false) }
  }

  useEffect(() => {
    if (manageMode || filterMode) fetchAllProducts()
  }, [manageMode, filterMode])

  /* ── Form state ───────────────────────────── */
  const [name,               setName]               = useState('')
  const [description,        setDescription]        = useState('')
  const [price,              setPrice]              = useState('')
  const [originalPrice,      setOriginalPrice]      = useState('')
  const [categorySlug,       setCategorySlug]       = useState('')
  const [subcategory,        setSubcategory]        = useState('')
  const [condition,          setCondition]          = useState('new')
  const [conditionScore,     setConditionScore]     = useState('100')
  const [conditionDesc,      setConditionDesc]      = useState('')
  const [conditionTags,      setConditionTags]      = useState('')
  const [badge,              setBadge]              = useState('')
  const [badgeColor,         setBadgeColor]         = useState<'primary'|'secondary'|'tertiary'>('primary')
  const [galleryImages, setGalleryImages] = useState<{url:string;position:string;zoom:number}[]>([])
  const [sortOrder,          setSortOrder]          = useState('0')
  const [isOffer,            setIsOffer]            = useState(false)
  const [isFeatured,         setIsFeatured]         = useState(false)
  const [specs,              setSpecs]              = useState<Spec[]>([{ ...EMPTY_SPEC }])

  /* ── Image upload ─────────────────────────── */
  const [uploadBusy,   setUploadBusy]  = useState(false)
  const [uploadError,  setUploadError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragImgIdx   = useRef<number | null>(null)

  const handleFilesSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploadBusy(true); setUploadError('')
    try {
      const uploads = await Promise.all(
        Array.from(files).slice(0, 8 - galleryImages.length).map(f => api.uploadImage(f))
      )
      setGalleryImages(prev => [
        ...prev,
        ...uploads.map(r => ({ url: r.url, position: '50% 50%', zoom: 1 })),
      ].slice(0, 8))
    } catch (err) {
      setUploadError((err as Error).message)
    } finally {
      setUploadBusy(false)
    }
  }

  const removeGalleryImg = (idx: number) =>
    setGalleryImages(prev => prev.filter((_, i) => i !== idx))

  const moveImgToFront = (idx: number) =>
    setGalleryImages(prev => [prev[idx], ...prev.filter((_, i) => i !== idx)])

  const updateImgSetting = (idx: number, patch: Partial<{position: string; zoom: number}>) =>
    setGalleryImages(prev => prev.map((img, i) => i === idx ? { ...img, ...patch } : img))

  // Position editor state
  const [editingIdx, setEditingIdx] = useState<number | null>(null)

  // 9-point focal grid
  const FOCAL_POINTS = [
    { label: '↖', pos: '15% 15%' }, { label: '↑', pos: '50% 15%' }, { label: '↗', pos: '85% 15%' },
    { label: '←', pos: '15% 50%' }, { label: '⊙', pos: '50% 50%' }, { label: '→', pos: '85% 50%' },
    { label: '↙', pos: '15% 85%' }, { label: '↓', pos: '50% 85%' }, { label: '↘', pos: '85% 85%' },
  ]

  const handleImgDragStart = (idx: number) => { dragImgIdx.current = idx }
  const handleImgDrop = (toIdx: number) => {
    const from = dragImgIdx.current
    dragImgIdx.current = null
    if (from === null || from === toIdx) return
    setEditingIdx(null)
    setGalleryImages(prev => {
      const arr = [...prev]
      const [item] = arr.splice(from, 1)
      arr.splice(toIdx, 0, item)
      return arr
    })
  }

  /* ── UI state ─────────────────────────────── */
  const [busy,    setBusy]    = useState(false)
  const [success, setSuccess] = useState(false)
  const [error,   setError]   = useState('')

  /* Pick first category when loaded */
  useEffect(() => {
    if (categories.length > 0 && !categorySlug) {
      setCategorySlug(categories[0].slug)
    }
  }, [categories])

  const selectedCat: CategoryChild[] = categories.length > 0
    ? parseCategoryChildren(categories.find(c => c.slug === categorySlug)?.children ?? '[]')
    : []

  const priceNum     = parseFloat(price) || 0
  const origPriceNum = parseFloat(originalPrice) || 0
  const discountPct  = origPriceNum > priceNum ? Math.round((1 - priceNum / origPriceNum) * 100) : 0

  useEffect(() => { setSubcategory(selectedCat[0]?.id ?? '') }, [categorySlug])

  const addSpec    = () => setSpecs(s => [...s, { ...EMPTY_SPEC }])
  const removeSpec = (i: number) => setSpecs(s => s.filter((_, idx) => idx !== i))
  const updateSpec = (i: number, field: keyof Spec, val: string) =>
    setSpecs(s => s.map((sp, idx) => idx === i ? { ...sp, [field]: val } : sp))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('')
    if (!name.trim() || !price) {
      setError('Nombre y precio son obligatorios.'); return
    }

    setBusy(true)
    try {
      await api.post('/api/admin/products', {
        name, description, price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        categorySlug,
        subcategory: subcategory || null,
        condition, conditionScore: parseInt(conditionScore),
        conditionDescription: conditionDesc || null,
        conditionTags: conditionTags.split(',').map(t => t.trim()).filter(Boolean),
        badge: badge || null, badgeColor,
        image: galleryImages[0]?.url || null,
        images: JSON.stringify(galleryImages),
        sortOrder: parseInt(sortOrder) || 0,
        isOffer,
        isFeatured,
        specs: specs.filter(s => s.label && s.value),
      })
      setSuccess(true)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const resetForm = () => {
    setName(''); setDescription(''); setPrice(''); setOriginalPrice('')
    if (categories.length > 0) setCategorySlug(categories[0].slug)
    setSubcategory(''); setCondition('new')
    setConditionScore('100'); setConditionDesc(''); setConditionTags('')
    setBadge(''); setBadgeColor('primary'); setGalleryImages([])
    setSortOrder('0'); setIsOffer(false); setIsFeatured(false)
    setSpecs([{ ...EMPTY_SPEC }]); setSuccess(false); setError('')
  }

  /* ── Quick toggle for offers/featured in manage mode ─ */
  const toggleFlag = async (productId: string, field: 'isOffer' | 'isFeatured', current: boolean) => {
    try {
      await api.put(`/api/admin/products/${productId}`, { [field]: !current })
      setAllProducts(prev =>
        prev.map(p => p.id === productId ? { ...p, [field]: !current } : p)
      )
    } catch { /* ignore */ }
  }

  const deleteProduct = async (productId: string) => {
    if (!confirm('¿Eliminás este producto?')) return
    try {
      await api.delete(`/api/admin/products/${productId}`)
      setAllProducts(prev => prev.filter(p => p.id !== productId))
    } catch { /* ignore */ }
  }

  /* ── Drag & Drop reorder ────────────────── */
  const dragId  = useRef<string | null>(null)
  const [dragOver, setDragOver] = useState<string | null>(null)

  const handleDragStart = (id: string) => { dragId.current = id }

  const handleDrop = async (targetId: string) => {
    const fromId = dragId.current
    dragId.current = null
    setDragOver(null)
    if (!fromId || fromId === targetId) return

    setAllProducts(prev => {
      const list = [...prev]
      const fromIdx   = list.findIndex(p => p.id === fromId)
      const targetIdx = list.findIndex(p => p.id === targetId)
      if (fromIdx === -1 || targetIdx === -1) return prev
      const [moved] = list.splice(fromIdx, 1)
      list.splice(targetIdx, 0, moved)
      // Re-assign sortOrder based on new positions
      const updated = list.map((p, i) => ({ ...p, sortOrder: i }))
      // Persist all updated sortOrders to backend (fire-and-forget)
      updated.forEach(p =>
        api.put(`/api/admin/products/${p.id}`, { sortOrder: p.sortOrder }).catch(() => {})
      )
      return updated
    })
  }

  /* ── Filter / Pagination ─────────────────── */
  const [catFilter, setCatFilter] = useState('all')
  const [subFilter, setSubFilter] = useState('')
  const [page,      setPage]      = useState(1)
  const PAGE_SIZE = 10

  /* ── Edit modal state ────────────────────── */
  const [editingProduct,    setEditingProduct]    = useState<ApiProduct | null>(null)
  const [editName,          setEditName]          = useState('')
  const [editPrice,         setEditPrice]         = useState('')
  const [editOriginalPrice, setEditOriginalPrice] = useState('')
  const [editDescription,   setEditDescription]   = useState('')
  const [editBadge,         setEditBadge]         = useState('')
  const [editBadgeColor,    setEditBadgeColor]    = useState<'primary'|'secondary'|'tertiary'>('primary')
  const [editIsOffer,       setEditIsOffer]       = useState(false)
  const [editIsFeatured,    setEditIsFeatured]    = useState(false)
  const [editSortOrder,     setEditSortOrder]     = useState('0')
  const [editBusy,          setEditBusy]          = useState(false)
  const [editError,         setEditError]         = useState('')

  const openEdit = (p: ApiProduct) => {
    setEditingProduct(p); setEditName(p.name); setEditPrice(String(p.price))
    setEditOriginalPrice(p.originalPrice ? String(p.originalPrice) : '')
    setEditDescription(p.description); setEditBadge(p.badge ?? '')
    setEditBadgeColor((p.badgeColor as 'primary'|'secondary'|'tertiary') ?? 'primary')
    setEditIsOffer(p.isOffer ?? false); setEditIsFeatured(p.isFeatured ?? false)
    setEditSortOrder(String(p.sortOrder ?? 0)); setEditError('')
  }

  const handleEditSave = async () => {
    if (!editingProduct) return
    if (!editName.trim() || !editPrice) { setEditError('Nombre y precio son obligatorios.'); return }
    setEditBusy(true); setEditError('')
    try {
      await api.put(`/api/admin/products/${editingProduct.id}`, {
        name: editName.trim(), price: parseFloat(editPrice),
        originalPrice: editOriginalPrice ? parseFloat(editOriginalPrice) : null,
        description: editDescription.trim(), badge: editBadge.trim() || null,
        badgeColor: editBadgeColor, isOffer: editIsOffer,
        isFeatured: editIsFeatured, sortOrder: parseInt(editSortOrder) || 0,
      })
      setAllProducts(prev => prev.map(p => p.id === editingProduct.id
        ? { ...p, name: editName.trim(), price: parseFloat(editPrice),
            originalPrice: editOriginalPrice ? parseFloat(editOriginalPrice) : null,
            description: editDescription.trim(), badge: editBadge.trim() || null,
            badgeColor: editBadgeColor, isOffer: editIsOffer,
            isFeatured: editIsFeatured, sortOrder: parseInt(editSortOrder) || 0 }
        : p
      ))
      setEditingProduct(null)
    } catch { setEditError('Error al guardar.') }
    finally { setEditBusy(false) }
  }

  if (authLoading) return null

  const inp = 'admin-input w-full bg-surface-container border border-outline-variant rounded-xl px-sm py-3 text-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all'
  const lbl = (text: string) => (
    <label className="block text-xs text-on-surface-variant uppercase tracking-wider mb-1 font-['Plus_Jakarta_Sans']">{text}</label>
  )

  /* ── Manage / Offers / Featured list view ─────────── */
  if (manageMode || filterMode) {
    const title = filterMode === 'offers' ? 'Gestionar Ofertas' : filterMode === 'featured' ? 'Últimas Llegadas' : 'Catálogo completo'

    // Parse subcategory children for selected category
    const filterCatChildren = !filterMode && catFilter !== 'all'
      ? (() => { try { return JSON.parse(categories.find(c => c.slug === catFilter)?.children ?? '[]') } catch { return [] } })() as {id:string;label:string}[]
      : []

    // Apply filters
    const filtered = allProducts.filter(p => {
      if (filterMode === 'offers'    && !p.isOffer)    return false
      if (filterMode === 'featured'  && !p.isFeatured) return false
      if (!filterMode) {
        if (catFilter !== 'all' && p.category?.slug !== catFilter) return false
        if (subFilter && p.subcategory !== subFilter) return false
      }
      return true
    })

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
    const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

    return (
      <main className="max-w-screen-xl mx-auto px-4 md:px-8 py-lg">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-md mb-lg">
          <div>
            <div className="inline-flex items-center gap-xs px-sm py-1 rounded-full bg-primary-container/15 border border-primary-container/25 text-primary-container text-xs font-bold uppercase tracking-widest mb-sm">
              <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
              Admin · Productos
            </div>
            <h1 className="text-3xl font-black text-on-background font-['Plus_Jakarta_Sans']">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-container to-tertiary-container">{title}</span>
            </h1>
          </div>
          <Link to="/admin/productos"
            className="inline-flex items-center gap-xs px-md py-2.5 bg-primary-container text-on-primary rounded-xl font-bold text-sm hover:brightness-110 active:scale-95 transition-all cursor-pointer">
            <span className="material-symbols-outlined text-sm">add</span>Agregar producto
          </Link>
        </div>

        {/* Category + subcategory filter (only for manage mode, not offer/featured) */}
        {!filterMode && (
          <div className="mb-md space-y-2">
            <div className="flex flex-wrap gap-2">
              <button onClick={() => { setCatFilter('all'); setSubFilter(''); setPage(1) }}
                className={`px-sm py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${catFilter === 'all' ? 'bg-primary-container/20 border-primary-container/40 text-primary-container' : 'border-white/10 text-on-surface-variant hover:border-white/25'}`}>
                Todos
              </button>
              {categories.map(cat => (
                <button key={cat.id} onClick={() => { setCatFilter(cat.slug); setSubFilter(''); setPage(1) }}
                  className={`px-sm py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${catFilter === cat.slug ? 'bg-primary-container/20 border-primary-container/40 text-primary-container' : 'border-white/10 text-on-surface-variant hover:border-white/25'}`}>
                  {cat.name}
                </button>
              ))}
            </div>
            {filterCatChildren.length > 0 && (
              <div className="flex flex-wrap gap-2 pl-2">
                <button onClick={() => { setSubFilter(''); setPage(1) }}
                  className={`px-sm py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${!subFilter ? 'border-tertiary-container/40 text-tertiary-container' : 'border-white/8 text-on-surface-variant hover:border-white/20'}`}>
                  Todas
                </button>
                {filterCatChildren.map((sc: {id:string;label:string}) => (
                  <button key={sc.id} onClick={() => { setSubFilter(sc.id); setPage(1) }}
                    className={`px-sm py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${subFilter === sc.id ? 'border-tertiary-container/40 text-tertiary-container' : 'border-white/8 text-on-surface-variant hover:border-white/20'}`}>
                    {sc.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {listLoading ? (
          <div className="flex items-center justify-center h-40 text-on-surface-variant">
            <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>Cargando...
          </div>
        ) : (
          <>
            <div className="bg-surface-container rounded-2xl border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/8">
                      <th className="w-8 px-2 py-sm" />
                      <th className="text-left px-md py-sm text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Producto</th>
                      <th className="text-left px-md py-sm text-xs text-on-surface-variant uppercase tracking-wider font-semibold hidden md:table-cell">Categoría</th>
                      <th className="text-center px-md py-sm text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Orden</th>
                      <th className="text-center px-md py-sm text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Oferta</th>
                      <th className="text-center px-md py-sm text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Destacado</th>
                      <th className="text-center px-md py-sm text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map(p => (
                      <tr key={p.id}
                        draggable
                        onDragStart={() => handleDragStart(p.id)}
                        onDragOver={e => { e.preventDefault(); setDragOver(p.id) }}
                        onDragLeave={() => setDragOver(null)}
                        onDrop={() => handleDrop(p.id)}
                        className={`border-b border-white/5 transition-colors ${dragOver === p.id ? 'bg-primary-container/10' : 'hover:bg-white/2'}`}
                      >
                        <td className="pl-2 pr-0 py-3">
                          <span className="material-symbols-outlined text-on-surface-variant/30 hover:text-on-surface-variant text-base cursor-grab select-none">drag_indicator</span>
                        </td>
                        <td className="px-md py-3">
                          <div className="flex items-center gap-sm">
                            <div className="w-10 h-10 rounded-lg bg-[#07080d] overflow-hidden flex-shrink-0 border border-white/8">
                              <img src={p.image} alt="" className="w-full h-full object-contain p-1" onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/80x80/111318/39ff14?text=?' }} />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-on-surface line-clamp-1 text-xs">{p.name}</p>
                              <p className="text-primary-container font-bold text-xs">${p.price}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-md py-3 text-on-surface-variant text-xs hidden md:table-cell">{p.category?.name ?? p.categoryId}</td>
                        <td className="px-md py-3 text-center text-on-surface-variant text-xs">{p.sortOrder ?? 0}</td>
                        <td className="px-md py-3 text-center">
                          <button onClick={() => toggleFlag(p.id, 'isOffer', p.isOffer ?? false)}
                            className={`w-8 h-8 rounded-lg border transition-all cursor-pointer flex items-center justify-center mx-auto ${p.isOffer ? 'bg-secondary-container/20 border-secondary-container/40 text-secondary-container' : 'border-white/10 text-on-surface-variant/30 hover:border-white/25'}`}>
                            <span className="material-symbols-outlined text-base">{p.isOffer ? 'local_offer' : 'radio_button_unchecked'}</span>
                          </button>
                        </td>
                        <td className="px-md py-3 text-center">
                          <button onClick={() => toggleFlag(p.id, 'isFeatured', p.isFeatured ?? false)}
                            className={`w-8 h-8 rounded-lg border transition-all cursor-pointer flex items-center justify-center mx-auto ${p.isFeatured ? 'bg-primary-container/20 border-primary-container/40 text-primary-container' : 'border-white/10 text-on-surface-variant/30 hover:border-white/25'}`}>
                            <span className="material-symbols-outlined text-base">{p.isFeatured ? 'star' : 'radio_button_unchecked'}</span>
                          </button>
                        </td>
                        <td className="px-md py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={() => openEdit(p)}
                              className="p-1.5 text-tertiary-container/60 hover:text-tertiary-container hover:bg-tertiary-container/10 rounded-lg transition-colors cursor-pointer" title="Editar">
                              <span className="material-symbols-outlined text-base">edit</span>
                            </button>
                            <button onClick={() => deleteProduct(p.id)}
                              className="p-1.5 text-error/60 hover:text-error hover:bg-error/10 rounded-lg transition-colors cursor-pointer" title="Eliminar">
                              <span className="material-symbols-outlined text-base">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {paginated.length === 0 && (
                      <tr><td colSpan={7} className="text-center py-xl text-on-surface-variant text-sm">
                        Sin productos. <Link to="/admin/productos" className="text-primary-container underline">Agregar uno</Link>
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-end gap-2 mt-md">
                <span className="text-xs text-on-surface-variant mr-2">{filtered.length} productos · pág. {page}/{totalPages}</span>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 text-on-surface-variant hover:border-white/30 disabled:opacity-30 cursor-pointer transition-all">
                  <span className="material-symbols-outlined text-base">chevron_left</span>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <button key={n} onClick={() => setPage(n)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold border transition-all cursor-pointer ${n === page ? 'bg-primary-container text-on-primary border-primary-container' : 'border-white/10 text-on-surface-variant hover:border-white/30'}`}>
                    {n}
                  </button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 text-on-surface-variant hover:border-white/30 disabled:opacity-30 cursor-pointer transition-all">
                  <span className="material-symbols-outlined text-base">chevron_right</span>
                </button>
              </div>
            )}
          </>
        )}

        {/* ── Edit Modal ─────────────────────────────────── */}
        {editingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setEditingProduct(null)}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <div className="relative bg-surface-container rounded-2xl border border-white/15 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
              {/* Modal header */}
              <div className="flex items-center justify-between px-lg py-md border-b border-white/8">
                <div>
                  <p className="text-xs text-on-surface-variant uppercase tracking-widest font-semibold">Editar producto</p>
                  <p className="font-bold text-on-surface text-sm line-clamp-1">{editingProduct.name}</p>
                </div>
                <button onClick={() => setEditingProduct(null)} className="p-1.5 hover:bg-white/8 rounded-lg transition-colors cursor-pointer text-on-surface-variant">
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              </div>

              {/* Modal body */}
              <div className="px-lg py-md space-y-md max-h-[70vh] overflow-y-auto">
                {editError && <div className="text-xs text-error bg-error/10 border border-error/30 rounded-xl px-sm py-2">{editError}</div>}

                <div>
                  <label className="block text-xs text-on-surface-variant uppercase tracking-wider mb-1">Nombre *</label>
                  <input value={editName} onChange={e => setEditName(e.target.value)} className={inp} placeholder="Nombre del producto" />
                </div>

                <div className="grid grid-cols-2 gap-sm">
                  <div>
                    <label className="block text-xs text-on-surface-variant uppercase tracking-wider mb-1">Precio *</label>
                    <input type="number" min="0" step="0.01" value={editPrice} onChange={e => setEditPrice(e.target.value)} className={inp} placeholder="0.00" />
                  </div>
                  <div>
                    <label className="block text-xs text-on-surface-variant uppercase tracking-wider mb-1">Precio original</label>
                    <input type="number" min="0" step="0.01" value={editOriginalPrice} onChange={e => setEditOriginalPrice(e.target.value)} className={inp} placeholder="0.00" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-on-surface-variant uppercase tracking-wider mb-1">Descripción</label>
                  <textarea rows={3} value={editDescription} onChange={e => setEditDescription(e.target.value)} className={`${inp} resize-none`} placeholder="Descripción del producto..." />
                </div>

                <div className="grid grid-cols-2 gap-sm">
                  <div>
                    <label className="block text-xs text-on-surface-variant uppercase tracking-wider mb-1">Badge</label>
                    <input value={editBadge} onChange={e => setEditBadge(e.target.value)} className={inp} placeholder="HOT, NEW, SALE..." />
                  </div>
                  <div>
                    <label className="block text-xs text-on-surface-variant uppercase tracking-wider mb-1">Color badge</label>
                    <select value={editBadgeColor} onChange={e => setEditBadgeColor(e.target.value as 'primary'|'secondary'|'tertiary')} className={`${inp} cursor-pointer`}>
                      <option value="primary">Verde neón</option>
                      <option value="secondary">Rosa</option>
                      <option value="tertiary">Cyan</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-sm items-end">
                  <div>
                    <label className="block text-xs text-on-surface-variant uppercase tracking-wider mb-1">sortOrder</label>
                    <input type="number" min="0" value={editSortOrder} onChange={e => setEditSortOrder(e.target.value)} className={inp} />
                  </div>
                  <label className="flex items-center gap-xs cursor-pointer p-3 rounded-xl border border-white/8 hover:bg-white/3 transition-colors">
                    <div onClick={() => setEditIsOffer(v => !v)} className={`w-10 h-5 rounded-full relative flex-shrink-0 cursor-pointer transition-colors ${editIsOffer ? 'bg-secondary-container' : 'bg-white/15'}`}>
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${editIsOffer ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </div>
                    <span className="text-xs font-bold text-on-surface">Oferta</span>
                  </label>
                  <label className="flex items-center gap-xs cursor-pointer p-3 rounded-xl border border-white/8 hover:bg-white/3 transition-colors">
                    <div onClick={() => setEditIsFeatured(v => !v)} className={`w-10 h-5 rounded-full relative flex-shrink-0 cursor-pointer transition-colors ${editIsFeatured ? 'bg-primary-container' : 'bg-white/15'}`}>
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${editIsFeatured ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </div>
                    <span className="text-xs font-bold text-on-surface">Destacado</span>
                  </label>
                </div>
              </div>

              {/* Modal footer */}
              <div className="flex items-center justify-end gap-sm px-lg py-md border-t border-white/8">
                <button onClick={() => setEditingProduct(null)} className="px-md py-2 rounded-xl border border-white/15 text-sm text-on-surface-variant hover:bg-white/5 transition-all cursor-pointer">
                  Cancelar
                </button>
                <button onClick={handleEditSave} disabled={editBusy}
                  className="px-md py-2 rounded-xl bg-primary-container text-on-primary text-sm font-bold hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-xs">
                  {editBusy ? <><span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>Guardando...</> : <><span className="material-symbols-outlined text-sm">save</span>Guardar cambios</>}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    )
  }

  /* ── Add product form view ─────────────────────────── */
  return (
    <main className="max-w-screen-xl mx-auto px-4 md:px-8 py-lg">

      {/* Page header */}
      <div className="mb-xl flex flex-wrap items-start justify-between gap-md">
        <div>
          <div className="inline-flex items-center gap-xs px-sm py-1 rounded-full bg-primary-container/15 border border-primary-container/25 text-primary-container text-xs font-bold uppercase tracking-widest mb-sm">
            <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
            Panel de administración
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-on-background font-['Plus_Jakarta_Sans'] leading-tight mb-xs">
            Agregar{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-container to-tertiary-container">
              Producto
            </span>
          </h1>
          <p className="text-on-surface-variant">Completá el formulario para publicar un nuevo producto en el catálogo.</p>
        </div>
        <Link to="/admin/productos?manage=true"
          className="inline-flex items-center gap-xs px-md py-2.5 border border-outline-variant text-on-surface rounded-xl font-bold text-sm hover:bg-white/5 active:scale-95 transition-all cursor-pointer">
          <span className="material-symbols-outlined text-sm">inventory_2</span>
          Ver catálogo
        </Link>
      </div>

      {success ? (
        <div className="admin-card rounded-2xl border border-primary-container/25 p-xl text-center">
          <div className="relative w-20 h-20 mx-auto mb-md">
            <div className="absolute inset-0 bg-primary-container/20 rounded-full blur-xl animate-pulse" />
            <div className="relative w-20 h-20 rounded-full bg-primary-container/10 border border-primary-container/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary-container text-4xl">check_circle</span>
            </div>
          </div>
          <h2 className="text-2xl font-black text-on-surface font-['Plus_Jakarta_Sans'] mb-xs">¡Producto publicado!</h2>
          <p className="text-on-surface-variant mb-lg">El producto fue agregado correctamente al catálogo.</p>
          <div className="flex justify-center gap-sm">
            <button onClick={resetForm}
              className="px-lg py-3 bg-primary-container text-on-primary rounded-xl font-bold text-sm hover:shadow-[0_0_20px_rgba(57,255,20,0.4)] hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center gap-xs">
              <span className="material-symbols-outlined text-sm">add</span>Agregar otro
            </button>
            <button onClick={() => navigate('/products')}
              className="px-lg py-3 border border-outline-variant text-on-surface rounded-xl font-bold text-sm hover:bg-white/5 active:scale-95 transition-all cursor-pointer flex items-center gap-xs">
              <span className="material-symbols-outlined text-sm">storefront</span>Ver catálogo
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">

          {/* ── Form (left 8 cols) ─────────────── */}
          <div className="lg:col-span-8">
            <form onSubmit={handleSubmit} className="admin-card rounded-2xl border border-white/10 p-lg space-y-md relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-container/40 to-transparent" />

              {error && (
                <div className="px-sm py-3 bg-error/10 border border-error/30 rounded-xl text-sm text-error flex items-center gap-xs">
                  <span className="material-symbols-outlined text-sm">error</span>{error}
                </div>
              )}

              {/* Name */}
              <div>
                {lbl('Nombre del producto *')}
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="Ej: Sony DualSense Edge Controller — Midnight Black" className={inp} />
              </div>

              {/* Category + Subcategory */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
                <div>
                  {lbl('Categoría *')}
                  <select value={categorySlug} onChange={e => setCategorySlug(e.target.value)} className={`${inp} cursor-pointer`}>
                    {categories.map(c => (
                      <option key={c.id} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>
                {selectedCat.length > 0 && (
                  <div>
                    {lbl('Subcategoría')}
                    <select value={subcategory} onChange={e => setSubcategory(e.target.value)} className={`${inp} cursor-pointer`}>
                      <option value="">— Sin subcategoría —</option>
                      {selectedCat.map(s => (
                        <option key={s.id} value={s.id}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Price + Original price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
                <div>
                  {lbl('Precio de venta ($) *')}
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold text-sm">$</span>
                    <input type="number" min="0" step="0.01" value={price} onChange={e => setPrice(e.target.value)}
                      placeholder="0.00" className={`${inp} pl-6`} />
                  </div>
                </div>
                <div>
                  {lbl('Precio original (opcional)')}
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold text-sm">$</span>
                    <input type="number" min="0" step="0.01" value={originalPrice} onChange={e => setOriginalPrice(e.target.value)}
                      placeholder="0.00 (para mostrar descuento)" className={`${inp} pl-6`} />
                  </div>
                  {discountPct > 0 && (
                    <p className="text-xs text-secondary-container mt-1 font-semibold">→ Descuento: -{discountPct}%</p>
                  )}
                </div>
              </div>

              {/* Sort order + CMS toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-sm items-end">
                <div>
                  {lbl('Posición en grid (sortOrder)')}
                  <input type="number" min="0" value={sortOrder} onChange={e => setSortOrder(e.target.value)}
                    placeholder="0 = primero" className={inp} />
                  <p className="text-xs text-on-surface-variant/50 mt-1">Menor número aparece antes.</p>
                </div>
                <label className="flex items-center gap-sm cursor-pointer p-3 rounded-xl border border-white/8 hover:bg-white/3 transition-colors group">
                  <div onClick={() => setIsOffer(v => !v)}
                    className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 cursor-pointer ${isOffer ? 'bg-secondary-container' : 'bg-white/15'}`}>
                    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${isOffer ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-on-surface">Oferta</p>
                    <p className="text-xs text-on-surface-variant">Aparece en sección Ofertas</p>
                  </div>
                </label>
                <label className="flex items-center gap-sm cursor-pointer p-3 rounded-xl border border-white/8 hover:bg-white/3 transition-colors group">
                  <div onClick={() => setIsFeatured(v => !v)}
                    className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 cursor-pointer ${isFeatured ? 'bg-primary-container' : 'bg-white/15'}`}>
                    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${isFeatured ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-on-surface">Destacado</p>
                    <p className="text-xs text-on-surface-variant">Aparece en Últimas Llegadas</p>
                  </div>
                </label>
              </div>

              {/* Condition */}
              <div>
                {lbl('Condición del producto')}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {CONDITIONS.map(c => (
                    <label key={c.id} className="cursor-pointer">
                      <input type="radio" name="condition" className="hidden peer"
                        checked={condition === c.id} onChange={() => setCondition(c.id)} />
                      <div className="p-2.5 text-center rounded-xl border-2 border-white/8 bg-surface-container-low text-on-surface-variant text-xs font-bold peer-checked:border-primary-container peer-checked:bg-primary-container/15 peer-checked:text-primary-container transition-all cursor-pointer">
                        {c.label}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Condition details */}
              {condition !== 'new' && (
                <div className="space-y-sm border-l-2 border-primary-container/20 pl-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm items-end">
                    <div>
                      {lbl('Puntuación (%)')}
                      <input type="number" min="0" max="100" value={conditionScore}
                        onChange={e => setConditionScore(e.target.value)} className={inp} />
                    </div>
                    <div>
                      {lbl('Tags (separados por coma)')}
                      <input type="text" value={conditionTags} onChange={e => setConditionTags(e.target.value)}
                        placeholder="Sin rayones, Con caja" className={inp} />
                    </div>
                  </div>
                  <div>
                    {lbl('Descripción del estado')}
                    <textarea rows={2} value={conditionDesc} onChange={e => setConditionDesc(e.target.value)}
                      placeholder="Describe el estado físico..." className={`${inp} resize-none`} />
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                {lbl('Descripción general (opcional)')}
                <textarea rows={4} value={description} onChange={e => setDescription(e.target.value)}
                  placeholder="Describí el producto: características, compatibilidad, incluye..." className={`${inp} resize-none`} />
                <p className="text-xs text-on-surface-variant/50 text-right mt-1">{description.length}/500</p>
              </div>

              {/* Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
                <div>
                  {lbl('Badge (etiqueta opcional)')}
                  <input type="text" value={badge} onChange={e => setBadge(e.target.value)}
                    placeholder="Ej: HOT, NEW, SALE" className={inp} />
                </div>
                <div>
                  {lbl('Color del badge')}
                  <select value={badgeColor} onChange={e => setBadgeColor(e.target.value as typeof badgeColor)} className={`${inp} cursor-pointer`}>
                    <option value="primary">Verde neón (primary)</option>
                    <option value="secondary">Rosa (secondary)</option>
                    <option value="tertiary">Cyan (tertiary)</option>
                  </select>
                </div>
              </div>

              {/* Specs */}
              <div>
                {lbl('Especificaciones técnicas')}
                <div className="space-y-2">
                  {specs.map((s, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input type="text" value={s.icon} onChange={e => updateSpec(i, 'icon', e.target.value)}
                        placeholder="Ícono (ej: memory)" className={`${inp} w-28 flex-shrink-0`} />
                      <input type="text" value={s.label} onChange={e => updateSpec(i, 'label', e.target.value)}
                        placeholder="Etiqueta" className={inp} />
                      <input type="text" value={s.value} onChange={e => updateSpec(i, 'value', e.target.value)}
                        placeholder="Valor" className={inp} />
                      {specs.length > 1 && (
                        <button type="button" onClick={() => removeSpec(i)}
                          className="text-error hover:bg-error/10 p-1.5 rounded-lg transition-colors cursor-pointer flex-shrink-0">
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button type="button" onClick={addSpec}
                  className="mt-2 flex items-center gap-xs text-xs text-primary-container hover:text-on-surface transition-colors cursor-pointer">
                  <span className="material-symbols-outlined text-sm">add_circle</span>
                  Agregar especificación
                </button>
              </div>

              {/* Submit */}
              <div className="pt-sm border-t border-white/8">
                <button type="submit" disabled={busy}
                  className="w-full md:w-auto px-xl py-4 bg-primary-container text-on-primary rounded-xl font-bold text-sm flex items-center justify-center gap-xs hover:shadow-[0_0_24px_rgba(57,255,20,0.5)] hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_4px_0_0_rgba(57,255,20,0.3)]">
                  {busy
                    ? <><span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>Publicando...</>
                    : <><span className="material-symbols-outlined text-sm">rocket_launch</span>Publicar producto</>}
                </button>
              </div>
            </form>
          </div>

          {/* ── Sidebar (right 4 cols) ─────────── */}
          <div className="lg:col-span-4 flex flex-col gap-md">

            {/* ── Multi-image gallery ──────────── */}
            <div className="admin-card rounded-2xl border border-white/10 p-md">
              <div className="flex items-center justify-between mb-sm">
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                  Imágenes del producto
                </p>
                <span className="text-xs text-on-surface-variant">{galleryImages.length}/8</span>
              </div>

              <p className="text-[11px] text-on-surface-variant/60 mb-sm leading-relaxed">
                La <strong className="text-primary-container">primera imagen</strong> es la principal (card y miniatura). Arrastrá para reordenar.
              </p>

              {/* Grid de imágenes */}
              <div className="grid grid-cols-2 gap-xs mb-sm">
                {galleryImages.map((img, idx) => (
                  <div key={img.url + idx} className="flex flex-col gap-0.5">
                    <div
                      draggable
                      onDragStart={() => handleImgDragStart(idx)}
                      onDragOver={e => e.preventDefault()}
                      onDrop={() => handleImgDrop(idx)}
                      className="relative group aspect-square rounded-xl overflow-hidden border border-white/10 bg-[#07080d] cursor-grab active:cursor-grabbing"
                    >
                      <img
                        src={img.url}
                        alt={`Imagen ${idx + 1}`}
                        className="w-full h-full object-cover transition-all"
                        style={{ objectPosition: img.position, transform: `scale(${img.zoom})`, transformOrigin: img.position }}
                      />
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-xs">
                        <span className="material-symbols-outlined text-white/80 text-base">drag_indicator</span>
                      </div>
                      {/* Main badge */}
                      {idx === 0 && (
                        <span className="absolute top-1 left-1 bg-primary-container text-on-primary text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wide leading-none">
                          Principal
                        </span>
                      )}
                      {/* Action buttons */}
                      <div className="absolute top-1 right-1 flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button type="button" onClick={() => setEditingIdx(editingIdx === idx ? null : idx)}
                          title="Ajustar encuadre"
                          className="w-6 h-6 rounded-md bg-purple-600/90 flex items-center justify-center cursor-pointer">
                          <span className="material-symbols-outlined text-[12px] text-white">crop_free</span>
                        </button>
                        {idx !== 0 && (
                          <button type="button" onClick={() => moveImgToFront(idx)} title="Poner como principal"
                            className="w-6 h-6 rounded-md bg-primary-container/90 flex items-center justify-center cursor-pointer">
                            <span className="material-symbols-outlined text-[12px] text-on-primary">star</span>
                          </button>
                        )}
                        <button type="button" onClick={() => removeGalleryImg(idx)} title="Eliminar"
                          className="w-6 h-6 rounded-md bg-error/90 flex items-center justify-center cursor-pointer">
                          <span className="material-symbols-outlined text-[12px] text-white">close</span>
                        </button>
                      </div>
                    </div>

                    {/* ── Position editor (inline) ── */}
                    {editingIdx === idx && (
                      <div className="bg-surface-container-high border border-white/10 rounded-xl p-xs space-y-xs">
                        <p className="text-[10px] text-on-surface-variant font-semibold uppercase tracking-wider">Encuadre</p>
                        {/* 3×3 focal grid */}
                        <div className="grid grid-cols-3 gap-0.5">
                          {FOCAL_POINTS.map(fp => (
                            <button
                              key={fp.pos}
                              type="button"
                              onClick={() => updateImgSetting(idx, { position: fp.pos })}
                              className={`h-7 rounded text-[11px] transition-all cursor-pointer font-bold ${
                                img.position === fp.pos
                                  ? 'bg-primary-container text-on-primary'
                                  : 'bg-surface-container text-on-surface-variant hover:bg-white/10'
                              }`}
                            >{fp.label}</button>
                          ))}
                        </div>
                        {/* Zoom slider */}
                        <div>
                          <div className="flex justify-between mb-0.5">
                            <span className="text-[10px] text-on-surface-variant">Zoom</span>
                            <span className="text-[10px] text-primary-container font-mono">{img.zoom.toFixed(1)}×</span>
                          </div>
                          <input
                            type="range" min="0.8" max="2.5" step="0.1"
                            value={img.zoom}
                            onChange={e => updateImgSetting(idx, { zoom: parseFloat(e.target.value) })}
                            className="w-full accent-primary-container h-1 cursor-pointer"
                          />
                        </div>
                        <button type="button" onClick={() => updateImgSetting(idx, { position: '50% 50%', zoom: 1 })}
                          className="w-full text-[10px] text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer py-0.5">
                          Resetear
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {/* Add slot */}
                {galleryImages.length < 8 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadBusy}
                    className="aspect-square rounded-xl border-2 border-dashed border-white/15 hover:border-primary-container/50 hover:bg-primary-container/5 transition-all cursor-pointer flex flex-col items-center justify-center gap-xs text-on-surface-variant hover:text-primary-container disabled:opacity-40"
                  >
                    {uploadBusy
                      ? <span className="material-symbols-outlined text-2xl animate-spin">progress_activity</span>
                      : <><span className="material-symbols-outlined text-2xl">add_photo_alternate</span>
                        <span className="text-[10px] font-semibold">Agregar</span></>}
                  </button>
                )}
              </div>

              {uploadError && (
                <p className="text-xs text-error mb-xs">{uploadError}</p>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={e => handleFilesSelect(e.target.files)}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadBusy || galleryImages.length >= 8}
                className="w-full py-2.5 border-2 border-dashed border-primary-container/30 rounded-xl text-xs text-primary-container font-semibold hover:border-primary-container/60 hover:bg-primary-container/5 active:scale-95 transition-all cursor-pointer disabled:opacity-40 flex items-center justify-center gap-xs"
              >
                <span className="material-symbols-outlined text-sm">upload</span>
                {galleryImages.length === 0 ? 'Seleccionar imágenes' : 'Agregar más imágenes'}
              </button>
              <p className="text-[10px] text-on-surface-variant/40 text-center mt-xs">
                JPG, PNG, WEBP · Máx. 8MB por imagen · Podés subir varias a la vez
              </p>
            </div>

            {/* Live preview */}
            <div className="admin-card rounded-2xl border border-white/8 p-md">
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-sm">Vista previa</p>
              <div className="rounded-xl border border-white/5 overflow-hidden bg-surface-container-low">
                <div className="aspect-square bg-[#07080d] flex items-center justify-center relative overflow-hidden">
                  {galleryImages[0]
                    ? <img src={galleryImages[0].url} className="w-full h-full object-cover" alt="preview"
                        style={{ objectPosition: galleryImages[0].position, transform: `scale(${galleryImages[0].zoom})`, transformOrigin: galleryImages[0].position }} />
                    : <span className="material-symbols-outlined text-4xl text-on-surface-variant opacity-20">image</span>
                  }
                  {badge && (
                    <div className={`absolute top-2 right-2 text-[10px] font-black px-2 py-0.5 rounded-full ${
                      badgeColor === 'primary'   ? 'bg-primary-container text-on-primary' :
                      badgeColor === 'secondary' ? 'bg-secondary-container text-on-secondary' :
                      'bg-tertiary-container text-on-tertiary-container'
                    }`}>{badge}</div>
                  )}
                  {discountPct > 0 && (
                    <div className="absolute top-2 left-2 bg-secondary-container text-on-secondary text-[10px] font-black px-2 py-0.5 rounded-full">-{discountPct}%</div>
                  )}
                  {isOffer && (
                    <div className="absolute bottom-2 left-2 bg-secondary-container/90 text-on-secondary text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[10px]">local_offer</span>OFERTA
                    </div>
                  )}
                  {isFeatured && (
                    <div className="absolute bottom-2 right-2 bg-primary-container/90 text-on-primary text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[10px]">star</span>DESTACADO
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold text-on-surface leading-tight line-clamp-2 mb-1 font-['Plus_Jakarta_Sans']">
                    {name || 'Nombre del producto'}
                  </p>
                  <p className="text-xs text-on-surface-variant line-clamp-2 mb-2">
                    {description || 'Descripción del producto...'}
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-black text-base text-primary-container">
                        ${priceNum > 0 ? priceNum.toFixed(0) : '—'}
                      </span>
                      {origPriceNum > priceNum && (
                        <span className="text-on-surface-variant line-through text-xs ml-1">${origPriceNum.toFixed(0)}</span>
                      )}
                    </div>
                    <div className="p-1.5 rounded-full bg-primary-container">
                      <span className="material-symbols-outlined text-sm text-on-primary">add_shopping_cart</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
