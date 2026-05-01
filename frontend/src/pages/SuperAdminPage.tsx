import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import toast from 'react-hot-toast'

type Tab = 'overview' | 'users' | 'store'

interface StoreStats {
  totalUsers: number
  totalOrders: number
  totalProducts: number
  totalRevenue: number
  pendingOrders: number
}
interface RecentOrder {
  id: string; status: string; totalAmount: number; createdAt: string
  user: { name: string | null; email: string }
  seller: { name: string } | null
}
interface StoreConfig {
  id: string
  subscriptionActive: boolean
  subscriptionExpiresAt: string | null
  planName: string
  notes: string
}
interface UserRow {
  id: string; name: string | null; email: string; role: string; createdAt: string
}

const ROLE_COLORS: Record<string, string> = {
  SUPERADMIN: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
  ADMIN:      'bg-green-500/20 text-green-300 border-green-500/40',
  CUSTOMER:   'bg-white/10 text-on-surface-variant border-white/15',
}

export default function SuperAdminPage() {
  const { isSuperAdmin, isLoading, user: me } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('overview')

  // Overview
  const [stats,        setStats]        = useState<StoreStats | null>(null)
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  // Users
  const [users,        setUsers]        = useState<UserRow[]>([])
  const [userSearch,   setUserSearch]   = useState('')
  // Store config
  const [config,       setConfig]       = useState<StoreConfig | null>(null)
  const [configForm,   setConfigForm]   = useState({ subscriptionActive: true, subscriptionExpiresAt: '', planName: 'PRO', notes: '' })
  // Shared
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !isSuperAdmin) navigate('/')
  }, [isLoading, isSuperAdmin, navigate])

  const loadOverview = useCallback(async () => {
    const data = await api.get<{ stats: StoreStats; recentOrders: RecentOrder[]; storeConfig: StoreConfig | null }>('/api/superadmin/overview')
    setStats(data.stats)
    setRecentOrders(data.recentOrders)
    if (data.storeConfig) {
      setConfig(data.storeConfig)
      setConfigForm({
        subscriptionActive:    data.storeConfig.subscriptionActive,
        subscriptionExpiresAt: data.storeConfig.subscriptionExpiresAt
          ? new Date(data.storeConfig.subscriptionExpiresAt).toISOString().split('T')[0]
          : '',
        planName: data.storeConfig.planName,
        notes:    data.storeConfig.notes,
      })
    }
    setLoading(false)
  }, [])

  const loadUsers = useCallback(async () => {
    const data = await api.get<UserRow[]>('/api/superadmin/users')
    setUsers(data)
  }, [])

  useEffect(() => {
    loadOverview()
    loadUsers()
  }, [loadOverview, loadUsers])

  const handleRoleChange = async (userId: string, role: string) => {
    if (userId === me?.id) { toast.error('No podés cambiar tu propio rol.'); return }
    try {
      await api.put(`/api/superadmin/users/${userId}/role`, { role })
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u))
      toast.success('Rol actualizado.')
    } catch (e) { toast.error((e as Error).message) }
  }

  const handleDeleteUser = async (userId: string, email: string) => {
    if (userId === me?.id) { toast.error('No podés eliminarte a vos mismo.'); return }
    if (!confirm(`¿Eliminar a ${email}? Esta acción no se puede deshacer.`)) return
    try {
      await api.delete(`/api/superadmin/users/${userId}`)
      setUsers(prev => prev.filter(u => u.id !== userId))
      toast.success('Usuario eliminado.')
    } catch (e) { toast.error((e as Error).message) }
  }

  const handleSaveConfig = async () => {
    try {
      const data = await api.put<StoreConfig>('/api/superadmin/store', {
        ...configForm,
        subscriptionExpiresAt: configForm.subscriptionExpiresAt || null,
      })
      setConfig(data)
      toast.success('Configuración guardada.')
    } catch (e) { toast.error((e as Error).message) }
  }

  if (isLoading || loading) return (
    <div className="min-h-screen flex items-center justify-center text-on-surface-variant">
      <span className="material-symbols-outlined animate-spin text-3xl">progress_activity</span>
    </div>
  )

  const filteredUsers = users.filter(u =>
    u.email.includes(userSearch) || (u.name ?? '').toLowerCase().includes(userSearch.toLowerCase())
  )

  const isSubscriptionExpired = config?.subscriptionExpiresAt
    ? new Date(config.subscriptionExpiresAt) < new Date()
    : false

  const TABS: { key: Tab; icon: string; label: string }[] = [
    { key: 'overview', icon: 'dashboard',        label: 'Overview'    },
    { key: 'users',    icon: 'manage_accounts',  label: 'Usuarios'    },
    { key: 'store',    icon: 'store',             label: 'Servicio'    },
  ]

  return (
    <main className="min-h-screen">
      {/* Header */}
      <section className="border-b border-purple-500/20 bg-surface-container-lowest/60">
        <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-lg">
          <div className="flex items-center gap-md">
            <div className="w-14 h-14 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-purple-400 text-3xl">shield_person</span>
            </div>
            <div>
              <div className="flex items-center gap-xs mb-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase tracking-widest">
                  Superadmin
                </span>
                {config && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-widest ${
                    config.subscriptionActive && !isSubscriptionExpired
                      ? 'bg-green-500/20 text-green-300 border-green-500/40'
                      : 'bg-red-500/20 text-red-300 border-red-500/40'
                  }`}>
                    {config.subscriptionActive && !isSubscriptionExpired ? '● Servicio activo' : '● Servicio vencido'}
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-black text-on-background font-['Plus_Jakarta_Sans']">Panel Atenea Techs</h1>
              <p className="text-sm text-on-surface-variant">{me?.email}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-xs mt-lg border-b border-white/10">
            {TABS.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-xs px-sm pb-sm text-sm font-semibold border-b-2 transition-all cursor-pointer -mb-px ${
                  tab === t.key
                    ? 'border-purple-400 text-purple-300'
                    : 'border-transparent text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-base">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-lg">

        {/* ── OVERVIEW ─────────────────────────────── */}
        {tab === 'overview' && stats && (
          <div className="space-y-lg">
            {/* Stats cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-sm">
              {[
                { label: 'Usuarios',   value: stats.totalUsers,             icon: 'group',         color: 'text-purple-400' },
                { label: 'Órdenes',    value: stats.totalOrders,            icon: 'receipt_long',  color: 'text-blue-400'   },
                { label: 'Productos',  value: stats.totalProducts,          icon: 'inventory_2',   color: 'text-cyan-400'   },
                { label: 'Pendientes', value: stats.pendingOrders,          icon: 'schedule',      color: 'text-yellow-400' },
                { label: 'Ingresos',   value: `$${stats.totalRevenue.toFixed(0)}`, icon: 'payments', color: 'text-green-400' },
              ].map(s => (
                <div key={s.label} className="bg-surface-container rounded-xl border border-white/10 p-sm">
                  <span className={`material-symbols-outlined text-xl mb-xs block ${s.color}`}>{s.icon}</span>
                  <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-on-surface-variant">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Recent orders */}
            <div>
              <h2 className="font-bold text-on-surface mb-sm font-['Plus_Jakarta_Sans']">Últimos pedidos</h2>
              <div className="space-y-xs">
                {recentOrders.length === 0 ? (
                  <p className="text-on-surface-variant text-sm">Sin pedidos aún.</p>
                ) : recentOrders.map(o => (
                  <div key={o.id} className="bg-surface-container rounded-xl border border-white/10 p-sm flex items-center gap-sm">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-on-surface truncate">{o.user.name ?? o.user.email}</p>
                      <p className="text-xs text-on-surface-variant">{new Date(o.createdAt).toLocaleDateString('es-AR')}</p>
                    </div>
                    {o.seller && <span className="text-xs text-purple-300 border border-purple-500/30 px-xs py-0.5 rounded-full hidden sm:block">{o.seller.name}</span>}
                    <span className={`text-[10px] font-bold px-xs py-0.5 rounded-full border ${
                      o.status === 'COMPLETED' ? 'bg-green-500/15 text-green-400 border-green-500/30' :
                      o.status === 'PENDING'   ? 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' :
                      'bg-red-500/15 text-red-400 border-red-500/30'
                    }`}>{o.status}</span>
                    <p className="text-base font-black text-primary-container flex-shrink-0">${o.totalAmount.toFixed(0)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── USERS ───────────────────────────────── */}
        {tab === 'users' && (
          <div className="space-y-md">
            <div className="flex items-center gap-sm">
              <div className="relative flex-1 max-w-sm">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
                <input
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  placeholder="Buscar por nombre o email..."
                  className="w-full pl-9 pr-sm py-xs bg-surface-container border border-outline-variant rounded-xl text-sm text-on-surface outline-none focus:border-purple-400 transition-colors"
                />
              </div>
              <span className="text-sm text-on-surface-variant">{filteredUsers.length} usuarios</span>
            </div>

            <div className="space-y-xs">
              {filteredUsers.map(u => (
                <div key={u.id} className="bg-surface-container rounded-xl border border-white/10 p-sm flex items-center gap-sm">
                  <div className="w-10 h-10 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-purple-300">
                      {(u.name ?? u.email)[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-on-surface truncate">{u.name ?? '—'}</p>
                    <p className="text-xs text-on-surface-variant truncate">{u.email}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-xs py-0.5 rounded-full border flex-shrink-0 ${ROLE_COLORS[u.role] ?? ROLE_COLORS.CUSTOMER}`}>
                    {u.role}
                  </span>
                  {/* Role selector */}
                  <select
                    value={u.role}
                    onChange={e => handleRoleChange(u.id, e.target.value)}
                    disabled={u.id === me?.id}
                    className="bg-surface-container-high border border-outline-variant rounded-lg px-xs py-1 text-xs text-on-surface outline-none focus:border-purple-400 cursor-pointer disabled:opacity-40 flex-shrink-0"
                  >
                    <option value="CUSTOMER">CUSTOMER</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="SUPERADMIN">SUPERADMIN</option>
                  </select>
                  <button
                    onClick={() => handleDeleteUser(u.id, u.email)}
                    disabled={u.id === me?.id}
                    className="w-8 h-8 rounded-lg hover:bg-error/10 flex items-center justify-center text-on-surface-variant hover:text-error transition-colors cursor-pointer disabled:opacity-30 flex-shrink-0"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── STORE / SERVICE ─────────────────────── */}
        {tab === 'store' && (
          <div className="max-w-lg space-y-md">
            <div className="bg-surface-container rounded-2xl border border-purple-500/20 p-lg relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
              <h2 className="font-bold text-on-surface font-['Plus_Jakarta_Sans'] mb-lg flex items-center gap-xs">
                <span className="material-symbols-outlined text-purple-400">store</span>
                Estado del servicio
              </h2>

              <div className="space-y-sm">
                <div>
                  <label className="block text-xs text-on-surface-variant uppercase tracking-wider mb-1">Plan</label>
                  <select
                    value={configForm.planName}
                    onChange={e => setConfigForm(f => ({ ...f, planName: e.target.value }))}
                    className="w-full bg-surface-container-high border border-outline-variant rounded-xl px-sm py-xs text-sm text-on-surface outline-none focus:border-purple-400 cursor-pointer"
                  >
                    {['BASIC', 'PRO', 'ENTERPRISE'].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-on-surface-variant uppercase tracking-wider mb-1">Vencimiento de suscripción</label>
                  <input
                    type="date"
                    value={configForm.subscriptionExpiresAt}
                    onChange={e => setConfigForm(f => ({ ...f, subscriptionExpiresAt: e.target.value }))}
                    className="w-full bg-surface-container-high border border-outline-variant rounded-xl px-sm py-xs text-sm text-on-surface outline-none focus:border-purple-400"
                  />
                  <p className="text-xs text-on-surface-variant mt-1">Dejá vacío si no tiene vencimiento.</p>
                </div>

                <div className="flex items-center justify-between p-sm bg-surface-container-high rounded-xl border border-white/10">
                  <div>
                    <p className="text-sm font-semibold text-on-surface">Servicio activo</p>
                    <p className="text-xs text-on-surface-variant">El cliente tiene acceso a la tienda</p>
                  </div>
                  <button
                    onClick={() => setConfigForm(f => ({ ...f, subscriptionActive: !f.subscriptionActive }))}
                    className={`w-12 h-6 rounded-full transition-colors cursor-pointer relative ${configForm.subscriptionActive ? 'bg-green-500' : 'bg-surface-container'} border border-white/20`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all shadow ${configForm.subscriptionActive ? 'left-6' : 'left-0.5'}`} />
                  </button>
                </div>

                <div>
                  <label className="block text-xs text-on-surface-variant uppercase tracking-wider mb-1">Notas internas</label>
                  <textarea
                    rows={3}
                    value={configForm.notes}
                    onChange={e => setConfigForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder="Ej: Cliente pagó el 01/05/2025..."
                    className="w-full bg-surface-container-high border border-outline-variant rounded-xl px-sm py-xs text-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:border-purple-400 resize-none"
                  />
                </div>

                <button
                  onClick={handleSaveConfig}
                  className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-xs hover:bg-purple-500 hover:shadow-[0_0_20px_rgba(138,43,226,0.4)] active:scale-95 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">save</span>
                  Guardar cambios
                </button>
              </div>
            </div>

            {config && (
              <div className="bg-surface-container rounded-xl border border-white/10 p-sm">
                <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-sm">Estado actual</p>
                <div className="space-y-xs text-sm">
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Plan</span>
                    <span className="font-bold text-purple-300">{config.planName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Estado</span>
                    <span className={`font-bold ${config.subscriptionActive && !isSubscriptionExpired ? 'text-green-400' : 'text-red-400'}`}>
                      {config.subscriptionActive && !isSubscriptionExpired ? '● Activo' : '● Vencido'}
                    </span>
                  </div>
                  {config.subscriptionExpiresAt && (
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">Vence</span>
                      <span className="text-on-surface">{new Date(config.subscriptionExpiresAt).toLocaleDateString('es-AR')}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
