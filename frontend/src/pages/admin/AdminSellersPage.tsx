import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import toast from 'react-hot-toast'
import './AdminSellersPage.css'

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

interface Seller {
  id: string
  name: string
  bio: string
  avatar: string
  whatsapp: string
  alias: string
  bank: string
  mpAlias: string
  cryptoAlias: string
  active: boolean
  sortOrder: number
}

const EMPTY: Omit<Seller, 'id'> = {
  name: '', bio: '', avatar: '', whatsapp: '',
  alias: '', bank: '', mpAlias: '', cryptoAlias: '', active: true, sortOrder: 0,
}

export default function AdminSellersPage() {
  const [sellers, setSellers] = useState<Seller[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing]   = useState<Seller | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${BASE}/api/sellers`)
      const data = await res.json()
      setSellers(Array.isArray(data) ? data : [])
    } catch { toast.error('Error al cargar vendedores') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { setForm(EMPTY); setCreating(true); setEditing(null) }
  const openEdit   = (s: Seller) => { setForm({ name: s.name, bio: s.bio, avatar: s.avatar, whatsapp: s.whatsapp, alias: s.alias, bank: s.bank, mpAlias: s.mpAlias, cryptoAlias: s.cryptoAlias ?? '', active: s.active, sortOrder: s.sortOrder }); setEditing(s); setCreating(false) }
  const closeForm  = () => { setCreating(false); setEditing(null) }

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('El nombre es requerido'); return }
    setSaving(true)
    try {
      if (creating) {
        await api.post('/api/admin/sellers', form)
        toast.success('Vendedor creado ✅')
      } else if (editing) {
        await api.put(`/api/admin/sellers/${editing.id}`, form)
        toast.success('Vendedor actualizado ✅')
      }
      await load()
      closeForm()
    } catch { toast.error('Error al guardar') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar a ${name}? Esta acción no se puede deshacer.`)) return
    try {
      await api.delete(`/api/admin/sellers/${id}`)
      toast.success('Vendedor eliminado')
      await load()
    } catch { toast.error('Error al eliminar') }
  }

  const f = (key: keyof typeof EMPTY, label: string, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-xs text-on-surface-variant uppercase tracking-wider mb-1 font-semibold">{label}</label>
      <input
        type={type}
        value={String(form[key])}
        onChange={e => setForm(p => ({ ...p, [key]: type === 'number' ? Number(e.target.value) : e.target.value }))}
        placeholder={placeholder}
        className="w-full bg-[#0d0e14] border border-white/10 rounded-xl px-3 py-2 text-sm text-on-surface outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/15 transition-all"
      />
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-on-surface font-['Plus_Jakarta_Sans']">Vendedores</h1>
          <p className="text-sm text-on-surface-variant mt-1">Gestioná los socios del marketplace</p>
        </div>
        <button
          onClick={openCreate}
          className="sellers-btn-primary flex items-center gap-2 px-4 py-2 text-white rounded-xl text-sm font-bold transition-all cursor-pointer"
        >
          <i className="fa-solid fa-plus" />
          Nuevo vendedor
        </button>
      </div>

      {/* Form modal */}
      {(creating || editing) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sellers-modal-overlay">
          <div className="w-full max-w-lg rounded-2xl overflow-hidden sellers-modal-panel">
            <div className="px-6 py-4 border-b border-white/8 flex items-center justify-between">
              <h2 className="font-black text-on-surface font-['Plus_Jakarta_Sans']">
                {creating ? 'Nuevo vendedor' : `Editar: ${editing?.name}`}
              </h2>
              <button onClick={closeForm} className="text-on-surface-variant hover:text-on-surface cursor-pointer transition-colors">
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Avatar preview */}
              {form.avatar && (
                <div className="flex justify-center">
                  <img src={form.avatar} alt="Preview" className="w-20 h-20 rounded-2xl object-cover border-2 border-purple-500/30" onError={e => (e.target as HTMLImageElement).style.display = 'none'} />
                </div>
              )}

              {f('name', 'Nombre completo', 'text', 'Ej: Martín García')}
              {f('bio', 'Descripción / Especialidad', 'text', 'Ej: Especialista en periféricos gaming')}
              {f('avatar', 'URL de foto', 'text', 'https://...')}
              {f('whatsapp', 'WhatsApp (con código país)', 'text', '5491112345678')}

              <div className="border-t border-white/8 pt-4">
                <p className="text-xs text-purple-400 font-bold uppercase tracking-widest mb-3">💳 Datos de pago</p>
                {f('bank', 'Banco / Billetera', 'text', 'Ej: Mercado Pago, Brubank, Uala...')}
                {f('alias', 'CBU o Alias', 'text', 'Ej: MARTIN.GARCIA.MP')}
                {f('mpAlias', 'Alias Mercado Pago (opcional)', 'text', 'Ej: martin.gamer')}
                {f('cryptoAlias', 'Alias / Dirección Crypto (opcional)', 'text', 'Ej: TRX1abc...xyz (USDT TRC-20)')}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setForm(p => ({ ...p, active: !p.active }))}
                  className={`relative w-11 h-6 rounded-full transition-all cursor-pointer flex-shrink-0 ${form.active ? 'bg-purple-600' : 'bg-white/15'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${form.active ? 'left-6' : 'left-1'}`} />
                </button>
                <span className="text-sm text-on-surface-variant">Vendedor activo (visible en el checkout)</span>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-white/8 flex gap-3 justify-end">
              <button onClick={closeForm} className="px-4 py-2 border border-white/10 text-on-surface-variant hover:text-on-surface rounded-xl text-sm font-semibold cursor-pointer transition-all">
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="sellers-btn-primary px-6 py-2 text-white rounded-xl text-sm font-bold cursor-pointer transition-all disabled:opacity-60"
              >
                {saving ? 'Guardando...' : creating ? 'Crear vendedor' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sellers grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-48 rounded-2xl bg-white/5 animate-pulse" />)}
        </div>
      ) : sellers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
          <i className="fa-solid fa-users text-5xl mb-4 opacity-20" />
          <p className="font-semibold text-on-surface mb-1">No hay vendedores todavía</p>
          <p className="text-sm">Creá el primer vendedor del marketplace</p>
          <button onClick={openCreate} className="mt-6 px-6 py-2 bg-purple-600/20 text-purple-300 border border-purple-500/30 rounded-xl text-sm font-bold hover:bg-purple-600/30 cursor-pointer transition-all">
            Crear primer vendedor
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sellers.map(s => (
            <div key={s.id} className="seller-card relative rounded-2xl overflow-hidden flex flex-col">

              {/* Status badge */}
              {!s.active && (
                <div className="absolute top-3 right-3 z-10 px-2.5 py-1 bg-yellow-500/15 border border-yellow-500/25 text-yellow-400 text-[10px] font-bold rounded-full uppercase tracking-wide">
                  Inactivo
                </div>
              )}

              {/* Card body */}
              <div className="p-6 flex-1">
                {/* Header: avatar + name */}
                <div className="flex items-center gap-4 mb-5">
                  {s.avatar ? (
                    <img
                      src={s.avatar} alt={s.name}
                      className="w-14 h-14 rounded-2xl object-cover seller-avatar-border flex-shrink-0"
                      onError={e => (e.target as HTMLImageElement).style.display = 'none'}
                    />
                  ) : (
                    <div className="seller-avatar-initials w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black text-white flex-shrink-0 shadow-lg">
                      {s.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-bold text-on-surface text-base leading-tight truncate">{s.name}</p>
                    {s.bio && <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-2 leading-relaxed">{s.bio}</p>}
                    {/* Active dot */}
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${s.active ? 'bg-green-400' : 'bg-yellow-400'}`} />
                      <span className="text-[10px] text-on-surface-variant font-medium">{s.active ? 'Activo' : 'Inactivo'}</span>
                    </div>
                  </div>
                </div>

                {/* Contact info chips */}
                <div className="space-y-2">
                  {s.whatsapp && (
                    <div className="seller-info-chip flex items-center gap-2.5">
                      <div className="seller-chip-icon seller-chip-wa">
                        <i className="fa-brands fa-whatsapp text-xs" />
                      </div>
                      <span className="text-xs text-on-surface-variant font-medium truncate">{s.whatsapp}</span>
                    </div>
                  )}
                  {(s.bank || s.alias) && (
                    <div className="seller-info-chip flex items-center gap-2.5">
                      <div className="seller-chip-icon seller-chip-bank">
                        <i className="fa-solid fa-building-columns text-xs" />
                      </div>
                      <span className="text-xs text-on-surface-variant font-medium truncate">
                        {[s.bank, s.alias].filter(Boolean).join(' · ')}
                      </span>
                    </div>
                  )}
                  {s.mpAlias && (
                    <div className="seller-info-chip flex items-center gap-2.5">
                      <div className="seller-chip-icon seller-chip-mp">
                        <i className="fa-solid fa-credit-card text-xs" />
                      </div>
                      <span className="text-xs text-on-surface-variant font-medium truncate">MP: {s.mpAlias}</span>
                    </div>
                  )}
                  {s.cryptoAlias && (
                    <div className="seller-info-chip flex items-center gap-2.5">
                      <div className="seller-chip-icon seller-chip-crypto">
                        <i className="fa-brands fa-bitcoin text-xs" />
                      </div>
                      <span className="text-xs text-on-surface-variant font-medium truncate">Crypto: {s.cryptoAlias}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer actions */}
              <div className="seller-card-footer px-4 py-3 flex gap-2">
                <button
                  onClick={() => openEdit(s)}
                  className="seller-btn-edit flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  <i className="fa-solid fa-pen-to-square" />
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(s.id, s.name)}
                  className="seller-btn-delete flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  <i className="fa-solid fa-trash" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
