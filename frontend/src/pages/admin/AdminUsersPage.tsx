import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../lib/api'


interface UserRow {
  id: string
  name: string | null
  email: string
  role: string
  createdAt: string
  _count: { orders: number }
}

const ROLE_LABELS: Record<string, { label: string; cls: string }> = {
  CUSTOMER:   { label: 'Cliente',   cls: 'bg-slate-500/20 text-slate-300 border-slate-500/30'   },
  ADMIN:      { label: 'Admin',     cls: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
  MANAGER:    { label: 'Manager',   cls: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'       },
  SUPERADMIN: { label: 'Superadmin',cls: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
}

export default function AdminUsersPage() {
  const { isAdmin, isManager, isSuperAdmin, isLoading, user: me } = useAuth()
  const navigate = useNavigate()

  const [users,   setUsers]   = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [busy,    setBusy]    = useState<string | null>(null)   // userId en proceso
  const [msg,     setMsg]     = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<UserRow | null>(null)

  useEffect(() => {
    if (!isLoading && !isManager) navigate('/')
  }, [isLoading, isManager, navigate])

  useEffect(() => {
    api.get<UserRow[]>('/api/admin/users')
      .then(data => setUsers(Array.isArray(data) ? data : []))
      .catch(() => setMsg({ type: 'err', text: 'No se pudieron cargar los usuarios.' }))
      .finally(() => setLoading(false))
  }, [])

  const flash = (type: 'ok' | 'err', text: string) => {
    setMsg({ type, text })
    setTimeout(() => setMsg(null), 3500)
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    setBusy(userId)
    try {
      const updated = await api.patch<UserRow>(`/api/admin/users/${userId}/role`, { role: newRole })
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: updated.role } : u))
      flash('ok', 'Rol actualizado correctamente.')
    } catch (e: any) {
      flash('err', e?.message ?? 'Error al actualizar el rol.')
    } finally {
      setBusy(null)
    }
  }

  const handleDelete = async (userId: string) => {
    setConfirmDelete(null)
    setBusy(userId)
    try {
      await api.delete(`/api/admin/users/${userId}`)
      setUsers(prev => prev.filter(u => u.id !== userId))
      flash('ok', 'Usuario eliminado.')
    } catch (e: any) {
      flash('err', e?.message ?? 'Error al eliminar el usuario.')
    } finally {
      setBusy(null)
    }
  }

  const filtered = users.filter(u =>
    !search.trim() ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.name ?? '').toLowerCase().includes(search.toLowerCase())
  )

  if (isLoading) return null

  return (
    <main className="max-w-screen-xl mx-auto px-4 md:px-8 py-lg">

      {/* Header */}
      <div className="mb-xl">
        <button onClick={() => navigate('/admin')}
          className="flex items-center gap-1 text-on-surface-variant hover:text-on-surface text-sm mb-sm transition-colors cursor-pointer">
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Panel de Admin
        </button>
        <div className="inline-flex items-center gap-xs px-sm py-1 rounded-full bg-purple-500/15 border border-purple-500/25 text-purple-300 text-xs font-bold uppercase tracking-widest mb-sm">
          <span className="material-symbols-outlined text-sm">manage_accounts</span>
          Gestión de usuarios
        </div>
        <h1 className="text-3xl font-black text-on-background font-['Plus_Jakarta_Sans'] mb-xs">
          Usuarios
        </h1>
        <p className="text-on-surface-variant text-sm">
          Asigná roles o eliminá cuentas de usuario.
        </p>
      </div>

      {/* Flash */}
      {msg && (
        <div className={`mb-md px-sm py-3 rounded-xl border text-sm flex items-center gap-xs ${
          msg.type === 'ok'
            ? 'bg-green-500/10 border-green-500/30 text-green-400'
            : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          <span className="material-symbols-outlined text-sm">
            {msg.type === 'ok' ? 'check_circle' : 'error'}
          </span>
          {msg.text}
        </div>
      )}

      {/* Search + count */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-sm mb-md">
        <div className="flex items-center gap-1.5 bg-surface-container border border-white/10 hover:border-purple-500/40 focus-within:border-purple-500/60 rounded-xl px-3 py-2 transition-all w-full sm:w-72">
          <span className="material-symbols-outlined text-sm text-on-surface-variant">search</span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre o email..."
            className="bg-transparent outline-none text-sm text-on-surface placeholder:text-on-surface-variant/50 w-full"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-on-surface-variant hover:text-on-surface cursor-pointer">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          )}
        </div>
        <p className="text-xs text-on-surface-variant flex-shrink-0">
          {filtered.length} {filtered.length === 1 ? 'usuario' : 'usuarios'}
        </p>
      </div>

      {/* Table / cards */}
      {loading ? (
        <div className="flex justify-center py-xl">
          <span className="material-symbols-outlined animate-spin text-purple-500 text-3xl">progress_activity</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-xl text-on-surface-variant">
          <span className="material-symbols-outlined text-5xl opacity-20 block mb-sm">person_off</span>
          <p>No se encontraron usuarios.</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-surface-container border border-white/8 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8 text-on-surface-variant text-xs uppercase tracking-wider">
                  <th className="text-left px-5 py-3 font-semibold">Usuario</th>
                  <th className="text-left px-5 py-3 font-semibold">Rol</th>
                  <th className="text-left px-5 py-3 font-semibold">Pedidos</th>
                  <th className="text-left px-5 py-3 font-semibold">Registro</th>
                  <th className="text-right px-5 py-3 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => {
                  const isSelf    = u.id === me?.id
                  const isTargetSuperAdmin = u.role === 'SUPERADMIN'
                  const isTargetManager    = u.role === 'MANAGER'
                  const isLocked  = isSelf || isTargetSuperAdmin || (isTargetManager && !isSuperAdmin)
                  const st        = ROLE_LABELS[u.role] ?? { label: u.role, cls: 'bg-white/10 text-on-surface-variant border-white/10' }
                  return (
                    <tr key={u.id} className={`border-b border-white/5 last:border-0 transition-colors ${busy === u.id ? 'opacity-50' : 'hover:bg-white/[0.02]'}`}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-purple-600/25 border border-purple-500/20 flex items-center justify-center text-purple-300 text-xs font-black flex-shrink-0">
                            {(u.name ?? u.email).charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-on-surface truncate">{u.name ?? '—'}</p>
                            <p className="text-xs text-on-surface-variant truncate">{u.email}</p>
                          </div>
                          {isSelf && (
                            <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full px-2 py-0.5 font-bold flex-shrink-0">Vos</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        {isLocked ? (
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${st.cls}`}>
                            {st.label}
                          </span>
                        ) : (
                          <select
                            value={u.role}
                            disabled={busy === u.id}
                            onChange={e => handleRoleChange(u.id, e.target.value)}
                            className="bg-surface-container-high border border-white/10 hover:border-purple-500/40 text-on-surface text-xs rounded-lg px-2.5 py-1.5 outline-none cursor-pointer transition-all"
                          >
                            <option value="CUSTOMER">Cliente</option>
                            <option value="ADMIN">Admin</option>
                            {isSuperAdmin && <option value="MANAGER">Manager</option>}
                          </select>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-on-surface-variant">
                        {u._count.orders}
                      </td>
                      <td className="px-5 py-3.5 text-on-surface-variant text-xs">
                        {new Date(u.createdAt).toLocaleDateString('es-AR', { day:'2-digit', month:'short', year:'numeric' })}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {!isLocked && (
                          <button
                            disabled={busy === u.id}
                            onClick={() => setConfirmDelete(u)}
                            className="p-1.5 rounded-lg text-on-surface-variant hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer disabled:opacity-40"
                            title="Eliminar usuario"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filtered.map(u => {
              const isSelf             = u.id === me?.id
              const isTargetSuperAdmin = u.role === 'SUPERADMIN'
              const isTargetManager    = u.role === 'MANAGER'
              const isLocked           = isSelf || isTargetSuperAdmin || (isTargetManager && !isSuperAdmin)
              const st           = ROLE_LABELS[u.role] ?? { label: u.role, cls: 'bg-white/10 text-on-surface-variant border-white/10' }
              return (
                <div key={u.id} className={`bg-surface-container border border-white/8 rounded-xl p-4 transition-opacity ${busy === u.id ? 'opacity-50' : ''}`}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-purple-600/25 border border-purple-500/20 flex items-center justify-center text-purple-300 text-sm font-black flex-shrink-0">
                        {(u.name ?? u.email).charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="font-semibold text-on-surface text-sm">{u.name ?? '—'}</p>
                          {isSelf && <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full px-1.5 py-0.5 font-bold">Vos</span>}
                        </div>
                        <p className="text-xs text-on-surface-variant break-all">{u.email}</p>
                      </div>
                    </div>
                    {!isLocked && (
                      <button
                        disabled={busy === u.id}
                        onClick={() => setConfirmDelete(u)}
                        className="p-1.5 rounded-lg text-on-surface-variant hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer flex-shrink-0 disabled:opacity-40"
                      >
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      {isLocked ? (
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${st.cls}`}>
                          {st.label}
                        </span>
                      ) : (
                        <select
                          value={u.role}
                          disabled={busy === u.id}
                          onChange={e => handleRoleChange(u.id, e.target.value)}
                          className="bg-surface-container-high border border-white/10 text-on-surface text-xs rounded-lg px-2.5 py-1.5 outline-none cursor-pointer"
                        >
                          <option value="CUSTOMER">Cliente</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      )}
                    </div>
                    <p className="text-xs text-on-surface-variant">
                      {u._count.orders} {u._count.orders === 1 ? 'pedido' : 'pedidos'} ·{' '}
                      {new Date(u.createdAt).toLocaleDateString('es-AR', { day:'2-digit', month:'short', year:'numeric' })}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Confirm delete modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setConfirmDelete(null)} />
          <div className="relative bg-surface-container border border-white/10 rounded-2xl p-lg max-w-sm w-full shadow-2xl">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/40 to-transparent rounded-t-2xl" />
            <div className="flex items-start gap-sm mb-md">
              <div className="w-11 h-11 rounded-xl bg-red-500/15 border border-red-500/25 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-red-400">person_remove</span>
              </div>
              <div>
                <h3 className="font-black text-on-surface font-['Plus_Jakarta_Sans'] text-lg">¿Eliminar usuario?</h3>
                <p className="text-sm text-on-surface-variant mt-0.5">Esta acción no se puede deshacer.</p>
              </div>
            </div>
            <div className="bg-red-500/8 border border-red-500/20 rounded-xl px-sm py-3 mb-md">
              <p className="font-semibold text-on-surface text-sm">{confirmDelete.name ?? '—'}</p>
              <p className="text-xs text-on-surface-variant break-all">{confirmDelete.email}</p>
            </div>
            <div className="flex gap-sm">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-on-surface-variant hover:bg-white/5 text-sm font-semibold transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(confirmDelete.id)}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold transition-all cursor-pointer active:scale-95"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
