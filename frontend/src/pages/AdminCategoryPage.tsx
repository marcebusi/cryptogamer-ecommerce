import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCategories, parseCategoryChildren } from '../context/CategoriesContext'
import { api } from '../lib/api'
import type { Category, CategoryChild } from '../types'

const ICONS = [
  'sports_esports','gamepad','playing_cards','smartphone','headphones',
  'water_drop','category','devices','memory','keyboard','mouse',
  'tv','cable','charging_station','computer',
]

const inp = 'w-full bg-surface-container border border-outline-variant rounded-xl px-sm py-3 text-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all'

export default function AdminCategoryPage() {
  const { isAdmin, isLoading: authLoading } = useAuth()
  const navigate = useNavigate()
  const { categories, refetch } = useCategories()

  useEffect(() => {
    if (!authLoading && !isAdmin) navigate('/')
  }, [authLoading, isAdmin, navigate])

  /* ── New category form ──────────────────────────── */
  const [newName,      setNewName]      = useState('')
  const [newIcon,      setNewIcon]      = useState('category')
  const [newSortOrder, setNewSortOrder] = useState('0')
  const [formBusy,     setFormBusy]     = useState(false)
  const [formError,    setFormError]    = useState('')

  /* ── Editing ────────────────────────────────────── */
  const [editId,       setEditId]       = useState<string | null>(null)
  const [editName,     setEditName]     = useState('')
  const [editIcon,     setEditIcon]     = useState('category')
  const [editSortOrder,setEditSortOrder]= useState('0')
  const [editChildren, setEditChildren] = useState<CategoryChild[]>([])
  const [editBusy,     setEditBusy]     = useState(false)
  const [editError,    setEditError]    = useState('')

  /* ── Delete confirmation ────────────────────────── */
  const [deleteId,  setDeleteId]  = useState<string | null>(null)
  const [deleteBusy,setDeleteBusy]= useState(false)
  const [deleteErr, setDeleteErr] = useState('')

  const startEdit = (cat: Category) => {
    setEditId(cat.id)
    setEditName(cat.name)
    setEditIcon(cat.icon)
    setEditSortOrder(String(cat.sortOrder))
    setEditChildren(parseCategoryChildren(cat.children))
    setEditError('')
  }

  /* Sub-category helpers */
  const addSubcat    = () => setEditChildren(c => [...c, { id: '', label: '' }])
  const removeSubcat = (i: number) => setEditChildren(c => c.filter((_, idx) => idx !== i))
  const updateSubcat = (i: number, field: 'id' | 'label', val: string) =>
    setEditChildren(c => c.map((s, idx) => idx === i ? { ...s, [field]: val } : s))

  /* ── Create ─────────────────────────────────────── */
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setFormError('')
    if (!newName.trim()) { setFormError('El nombre es requerido.'); return }
    setFormBusy(true)
    try {
      await api.post('/api/categories', {
        name: newName.trim(), icon: newIcon, sortOrder: Number(newSortOrder), children: [],
      })
      await refetch()
      setNewName(''); setNewIcon('category'); setNewSortOrder('0')
    } catch (err) {
      setFormError((err as Error).message)
    } finally {
      setFormBusy(false)
    }
  }

  /* ── Save edit ──────────────────────────────────── */
  const handleSave = async () => {
    if (!editId) return; setEditError('')
    setEditBusy(true)
    try {
      await api.put(`/api/categories/${editId}`, {
        name: editName.trim(), icon: editIcon,
        sortOrder: Number(editSortOrder), children: editChildren,
      })
      await refetch()
      setEditId(null)
    } catch (err) {
      setEditError((err as Error).message)
    } finally {
      setEditBusy(false)
    }
  }

  /* ── Delete ─────────────────────────────────────── */
  const handleDelete = async () => {
    if (!deleteId) return; setDeleteErr('')
    setDeleteBusy(true)
    try {
      await api.delete(`/api/categories/${deleteId}`)
      await refetch()
      setDeleteId(null)
    } catch (err) {
      setDeleteErr((err as Error).message)
    } finally {
      setDeleteBusy(false)
    }
  }

  if (authLoading) return null

  return (
    <main className="max-w-screen-xl mx-auto px-4 md:px-8 py-lg">
      {/* Header */}
      <div className="mb-xl">
        <div className="inline-flex items-center gap-xs px-sm py-1 rounded-full bg-secondary-container/15 border border-secondary-container/25 text-secondary-container text-xs font-bold uppercase tracking-widest mb-sm">
          <span className="material-symbols-outlined text-sm">category</span>
          Admin · Categorías
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-on-background font-['Plus_Jakarta_Sans'] leading-tight mb-xs">
          Gestionar{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary-container to-tertiary-container">
            Categorías
          </span>
        </h1>
        <p className="text-on-surface-variant">
          Creá, editá y eliminá categorías y subcategorías del catálogo.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">

        {/* ── New category form (left 4) ─────────── */}
        <div className="lg:col-span-4">
          <div className="bg-surface-container rounded-2xl border border-white/10 p-lg">
            <h2 className="font-bold text-on-surface mb-md flex items-center gap-xs">
              <span className="material-symbols-outlined text-secondary-container">add_circle</span>
              Nueva categoría
            </h2>
            <form onSubmit={handleCreate} className="space-y-sm">
              {formError && (
                <p className="text-xs text-error bg-error/10 border border-error/25 rounded-lg px-sm py-2">{formError}</p>
              )}
              <div>
                <label className="block text-xs text-on-surface-variant uppercase tracking-wider mb-1">Nombre</label>
                <input value={newName} onChange={e => setNewName(e.target.value)}
                  placeholder="Ej: Periféricos" className={inp} />
              </div>
              <div>
                <label className="block text-xs text-on-surface-variant uppercase tracking-wider mb-1">Ícono (Material Symbol)</label>
                <div className="flex gap-2 items-center">
                  <select value={newIcon} onChange={e => setNewIcon(e.target.value)} className={`${inp} flex-1`}>
                    {ICONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                  </select>
                  <span className="material-symbols-outlined text-on-surface-variant text-2xl">{newIcon}</span>
                </div>
              </div>
              <div>
                <label className="block text-xs text-on-surface-variant uppercase tracking-wider mb-1">Orden (menor = primero)</label>
                <input type="number" value={newSortOrder} onChange={e => setNewSortOrder(e.target.value)} className={inp} />
              </div>
              <button type="submit" disabled={formBusy}
                className="w-full py-3 bg-secondary-container text-on-secondary rounded-xl font-bold text-sm hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-xs">
                {formBusy
                  ? <><span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>Creando...</>
                  : <><span className="material-symbols-outlined text-sm">add</span>Crear categoría</>}
              </button>
            </form>
          </div>
        </div>

        {/* ── Category list (right 8) ─────────────── */}
        <div className="lg:col-span-8 space-y-sm">
          {categories.map(cat => {
            const children = parseCategoryChildren(cat.children)
            const isEditing = editId === cat.id

            return (
              <div key={cat.id}
                className="bg-surface-container rounded-2xl border border-white/10 overflow-hidden transition-all">

                {/* Row header */}
                <div className="flex items-center gap-sm px-md py-sm">
                  <div className="w-10 h-10 rounded-xl bg-secondary-container/15 border border-secondary-container/20 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-secondary-container text-lg">{cat.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-on-surface text-sm">{cat.name}</p>
                    <p className="text-xs text-on-surface-variant">{cat.slug} · {children.length} subcat · {cat._count?.products ?? 0} productos</p>
                  </div>
                  <div className="flex items-center gap-xs flex-shrink-0">
                    <button onClick={() => isEditing ? setEditId(null) : startEdit(cat)}
                      className={`p-2 rounded-lg transition-colors cursor-pointer ${isEditing ? 'bg-white/10 text-on-surface' : 'text-on-surface-variant hover:bg-white/5 hover:text-on-surface'}`}>
                      <span className="material-symbols-outlined text-base">{isEditing ? 'close' : 'edit'}</span>
                    </button>
                    <button onClick={() => { setDeleteId(cat.id); setDeleteErr('') }}
                      className="p-2 rounded-lg text-error/70 hover:bg-error/10 hover:text-error transition-colors cursor-pointer">
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                  </div>
                </div>

                {/* Edit panel */}
                {isEditing && (
                  <div className="border-t border-white/8 p-md space-y-sm">
                    {editError && (
                      <p className="text-xs text-error bg-error/10 border border-error/25 rounded-lg px-sm py-2">{editError}</p>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-sm">
                      <div>
                        <label className="block text-xs text-on-surface-variant uppercase tracking-wider mb-1">Nombre</label>
                        <input value={editName} onChange={e => setEditName(e.target.value)} className={inp} />
                      </div>
                      <div>
                        <label className="block text-xs text-on-surface-variant uppercase tracking-wider mb-1">Ícono</label>
                        <div className="flex gap-2 items-center">
                          <select value={editIcon} onChange={e => setEditIcon(e.target.value)} className={`${inp} flex-1`}>
                            {ICONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                          </select>
                          <span className="material-symbols-outlined text-on-surface-variant text-xl">{editIcon}</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-on-surface-variant uppercase tracking-wider mb-1">Orden</label>
                        <input type="number" value={editSortOrder} onChange={e => setEditSortOrder(e.target.value)} className={inp} />
                      </div>
                    </div>

                    {/* Subcategories */}
                    <div>
                      <label className="block text-xs text-on-surface-variant uppercase tracking-wider mb-2">Subcategorías</label>
                      <div className="space-y-2">
                        {editChildren.map((sub, i) => (
                          <div key={i} className="flex gap-2 items-center">
                            <input value={sub.id} onChange={e => updateSubcat(i, 'id', e.target.value)}
                              placeholder="id (ej: ps5)" className={`${inp} flex-1`} />
                            <input value={sub.label} onChange={e => updateSubcat(i, 'label', e.target.value)}
                              placeholder="Nombre" className={`${inp} flex-1`} />
                            <button type="button" onClick={() => removeSubcat(i)}
                              className="text-error hover:bg-error/10 p-1.5 rounded-lg transition-colors cursor-pointer flex-shrink-0">
                              <span className="material-symbols-outlined text-base">remove_circle</span>
                            </button>
                          </div>
                        ))}
                      </div>
                      <button type="button" onClick={addSubcat}
                        className="mt-2 flex items-center gap-1 text-xs text-secondary-container hover:text-on-surface transition-colors cursor-pointer">
                        <span className="material-symbols-outlined text-sm">add_circle</span>
                        Agregar subcategoría
                      </button>
                    </div>

                    <div className="flex gap-sm pt-sm border-t border-white/8">
                      <button onClick={handleSave} disabled={editBusy}
                        className="px-md py-2.5 bg-secondary-container text-on-secondary rounded-xl font-bold text-sm hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-60 flex items-center gap-xs">
                        {editBusy
                          ? <><span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>Guardando...</>
                          : <><span className="material-symbols-outlined text-sm">save</span>Guardar cambios</>}
                      </button>
                      <button onClick={() => setEditId(null)}
                        className="px-md py-2.5 border border-outline-variant text-on-surface rounded-xl font-bold text-sm hover:bg-white/5 active:scale-95 transition-all cursor-pointer">
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                {/* Subcategory chips (when not editing) */}
                {!isEditing && children.length > 0 && (
                  <div className="px-md pb-sm flex flex-wrap gap-1.5">
                    {children.map(s => (
                      <span key={s.id} className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/8 text-on-surface-variant">
                        {s.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Delete confirm modal ─────────────────────── */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface-container border border-error/30 rounded-2xl p-lg max-w-sm w-full">
            <div className="w-12 h-12 rounded-xl bg-error/15 border border-error/25 flex items-center justify-center mx-auto mb-md">
              <span className="material-symbols-outlined text-error text-2xl">warning</span>
            </div>
            <h3 className="font-bold text-on-surface text-lg text-center mb-xs font-['Plus_Jakarta_Sans']">¿Eliminar categoría?</h3>
            <p className="text-sm text-on-surface-variant text-center mb-md">
              Esta acción no se puede deshacer. Solo se puede eliminar si no tiene productos asociados.
            </p>
            {deleteErr && (
              <p className="text-xs text-error bg-error/10 border border-error/25 rounded-lg px-sm py-2 mb-sm text-center">{deleteErr}</p>
            )}
            <div className="flex gap-sm">
              <button onClick={handleDelete} disabled={deleteBusy}
                className="flex-1 py-3 bg-error text-white rounded-xl font-bold text-sm hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-xs">
                {deleteBusy
                  ? <><span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>Eliminando...</>
                  : <><span className="material-symbols-outlined text-sm">delete</span>Eliminar</>}
              </button>
              <button onClick={() => { setDeleteId(null); setDeleteErr('') }}
                className="flex-1 py-3 border border-outline-variant text-on-surface rounded-xl font-bold text-sm hover:bg-white/5 active:scale-95 transition-all cursor-pointer">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
