import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './ProfilePage.css'

import { api } from '../lib/api'

type Tab = 'profile' | 'orders' | 'password'

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, updateProfile, changePassword, logout } = useAuth()
  const navigate = useNavigate()

  const [tab,   setTab]   = useState<Tab>('profile')
  const [busy,  setBusy]  = useState(false)
  const [msg,   setMsg]   = useState('')
  const [error, setError] = useState('')

  /* Profile fields */
  const [name,    setName]    = useState('')
  const [phone,   setPhone]   = useState('')
  const [address, setAddress] = useState('')

  /* Password fields */
  const [currentPwd, setCurrentPwd] = useState('')
  const [newPwd,     setNewPwd]     = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [showPwd,    setShowPwd]    = useState(false)

  /* Orders */
  const [orders, setOrders] = useState<any[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [orderSearch, setOrderSearch] = useState('')

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate('/')
  }, [isLoading, isAuthenticated, navigate])

  useEffect(() => {
    if (user) {
      setName(user.name ?? '')
      setPhone(user.phone ?? '')
      setAddress(user.address ?? '')
    }
  }, [user])

  useEffect(() => {
    if (tab === 'orders' && orders.length === 0) {
      setLoadingOrders(true)
      api.get<{ data: any[] }>('/api/orders/me')
        .then(res => setOrders(Array.isArray(res) ? res : (res as any).data ?? []))
        .catch(err => console.error(err))
        .finally(() => setLoadingOrders(false))
    }
  }, [tab])

  const feedback = (err: unknown, ok: string) => {
    if (err) setError((err as Error).message)
    else { setMsg(ok); setTimeout(() => setMsg(''), 3000) }
  }

  const handleProfile = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setMsg('')
    if (!name.trim()) { setError('El nombre es requerido.'); return }
    setBusy(true)
    try { await updateProfile({ name, phone, address }); feedback(null, 'Perfil actualizado correctamente.') }
    catch (err) { feedback(err, '') }
    finally { setBusy(false) }
  }

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setMsg('')
    if (!currentPwd || !newPwd || !confirmPwd) { setError('Completá todos los campos.'); return }
    if (newPwd !== confirmPwd) { setError('Las contraseñas no coinciden.'); return }
    if (newPwd.length < 6) { setError('La nueva contraseña debe tener al menos 6 caracteres.'); return }
    setBusy(true)
    try { await changePassword(currentPwd, newPwd); setCurrentPwd(''); setNewPwd(''); setConfirmPwd(''); feedback(null, 'Contraseña actualizada correctamente.') }
    catch (err) { feedback(err, '') }
    finally { setBusy(false) }
  }

  if (isLoading || !user) return null

  const initials = (user.name ?? user.email)
    .split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()

  const inp = 'w-full bg-surface-container border border-outline-variant rounded-xl px-sm py-3 text-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all'

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="profile-hero relative overflow-hidden border-b border-purple-500/20">
        <div className="absolute inset-0 profile-grid pointer-events-none" />
        <div className="profile-hero-blob absolute top-0 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-screen-xl mx-auto px-4 md:px-8 py-xl">
          <div className="flex items-center gap-md">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-purple-600/30 border-2 border-purple-500/50 flex items-center justify-center text-3xl font-black text-purple-300 shadow-[0_0_24px_rgba(138,43,226,0.3)]">
                {initials}
              </div>
              {user.role === 'ADMIN' && (
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary-container border-2 border-background flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm text-on-primary">admin_panel_settings</span>
                </div>
              )}
            </div>

            <div>
              <h1 className="text-2xl md:text-3xl font-black text-on-background font-['Plus_Jakarta_Sans']">
                {user.name ?? 'Mi perfil'}
              </h1>
              <p className="text-on-surface-variant text-sm mt-0.5">{user.email}</p>
              {user.role === 'ADMIN' && (
                <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-purple-600/20 border border-purple-500/30 text-purple-300 text-[10px] font-bold rounded-full uppercase tracking-widest">
                  <span className="material-symbols-outlined text-xs">verified</span>
                  Administrador
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-screen-xl mx-auto px-4 md:px-8 py-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">

          {/* Sidebar */}
          <aside className="lg:col-span-3">
            <div className="space-y-1">
              {([
                { key: 'profile',  icon: 'manage_accounts', label: 'Mis datos'         },
                { key: 'orders',   icon: 'shopping_bag',    label: 'Mis pedidos'        },
                { key: 'password', icon: 'lock',            label: 'Cambiar contraseña' },
              ] as { key: Tab; icon: string; label: string }[]).map(item => (
                <button
                  key={item.key}
                  onClick={() => { setTab(item.key); setError(''); setMsg('') }}
                  className={`w-full flex items-center gap-sm px-sm py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    tab === item.key
                      ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                      : 'text-on-surface-variant hover:bg-white/5 hover:text-on-surface border border-transparent'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">{item.icon}</span>
                  {item.label}
                </button>
              ))}
              <button
                onClick={() => { logout(); navigate('/') }}
                className="w-full flex items-center gap-sm px-sm py-3 rounded-xl text-sm font-semibold text-error hover:bg-error/10 transition-all cursor-pointer border border-transparent mt-sm"
              >
                <span className="material-symbols-outlined text-base">logout</span>
                Cerrar sesión
              </button>
            </div>
          </aside>

          {/* Main */}
          <div className="lg:col-span-9">
            {/* Feedback */}
            {msg && (
              <div className="mb-sm px-sm py-3 bg-primary-container/10 border border-primary-container/30 rounded-xl text-sm text-primary-container flex items-center gap-xs">
                <span className="material-symbols-outlined text-sm">check_circle</span>{msg}
              </div>
            )}
            {error && (
              <div className="mb-sm px-sm py-3 bg-error/10 border border-error/30 rounded-xl text-sm text-error flex items-center gap-xs">
                <span className="material-symbols-outlined text-sm">error</span>{error}
              </div>
            )}

            {/* ── Profile tab ─────────────────────── */}
            {tab === 'profile' && (
              <div className="profile-card rounded-2xl border border-purple-500/20 p-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
                <h2 className="text-lg font-black text-on-surface font-['Plus_Jakarta_Sans'] mb-lg flex items-center gap-xs">
                  <span className="material-symbols-outlined text-purple-400">manage_accounts</span>
                  Mis datos
                </h2>
                <form onSubmit={handleProfile} className="space-y-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
                    <div className="sm:col-span-2">
                      <label className="block text-xs text-on-surface-variant uppercase tracking-wider mb-1 font-['Plus_Jakarta_Sans']">Nombre completo</label>
                      <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Tu nombre" className={inp} />
                    </div>
                    <div>
                      <label className="block text-xs text-on-surface-variant uppercase tracking-wider mb-1 font-['Plus_Jakarta_Sans']">Email</label>
                      <input type="email" value={user.email} disabled className={`${inp} opacity-50 cursor-not-allowed`} />
                      <p className="text-[11px] text-on-surface-variant/60 mt-1">El email no se puede cambiar.</p>
                    </div>
                    <div>
                      <label className="block text-xs text-on-surface-variant uppercase tracking-wider mb-1 font-['Plus_Jakarta_Sans']">Teléfono</label>
                      <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+54 11 0000-0000" className={inp} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs text-on-surface-variant uppercase tracking-wider mb-1 font-['Plus_Jakarta_Sans']">Dirección de envío</label>
                      <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="Av. Ejemplo 1234, CABA" className={inp} />
                    </div>
                  </div>

                  {/* Member since */}
                  {user.createdAt && (
                    <p className="text-xs text-on-surface-variant border-t border-white/8 pt-sm">
                      Miembro desde {new Date(user.createdAt).toLocaleDateString('es-AR', { year: 'numeric', month: 'long' })}
                    </p>
                  )}

                  <button type="submit" disabled={busy}
                    className="profile-save-btn bg-purple-600 px-lg py-3 rounded-xl font-bold text-sm flex items-center gap-xs hover:bg-purple-500 hover:shadow-[0_0_20px_rgba(138,43,226,0.4)] active:scale-95 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed" style={{ color: '#ffffff' }}>
                    {busy
                      ? <><span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>Guardando...</>
                      : <><span className="material-symbols-outlined text-sm">save</span>Guardar cambios</>}
                  </button>
                </form>
              </div>
            )}

            {/* ── Orders tab ───────────────────────── */}
            {tab === 'orders' && (
              <div className="profile-card rounded-2xl border border-purple-500/20 p-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-sm mb-lg">
                  <h2 className="text-lg font-black text-on-surface font-['Plus_Jakarta_Sans'] flex items-center gap-xs">
                    <span className="material-symbols-outlined text-purple-400">shopping_bag</span>
                    Mis pedidos
                  </h2>
                  {/* Inline order search */}
                  <div className="flex items-center gap-1.5 bg-surface-container border border-white/10 hover:border-purple-500/40 focus-within:border-purple-500/60 focus-within:shadow-[0_0_12px_rgba(168,85,247,0.15)] rounded-xl px-3 py-2 transition-all w-full sm:w-52">
                    <span className="material-symbols-outlined text-sm text-on-surface-variant flex-shrink-0">search</span>
                    <input
                      type="text"
                      value={orderSearch}
                      onChange={e => setOrderSearch(e.target.value)}
                      placeholder="Buscar por N.° de orden"
                      className="bg-transparent outline-none text-xs text-on-surface placeholder:text-on-surface-variant/50 w-full font-mono"
                    />
                    {orderSearch && (
                      <button onClick={() => setOrderSearch('')} className="flex-shrink-0 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer">
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    )}
                  </div>
                </div>

                {loadingOrders ? (
                  <div className="flex justify-center py-xl">
                    <span className="material-symbols-outlined animate-spin text-purple-500 text-3xl">progress_activity</span>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-xl text-on-surface-variant">
                    <span className="material-symbols-outlined text-5xl opacity-20 block mb-sm">receipt_long</span>
                    <p>Aún no realizaste ningún pedido.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.filter((order: any) => {
                      if (!orderSearch.trim()) return true
                      const num = `CG-${order.id.slice(-6).toUpperCase()}`
                      return num.includes(orderSearch.trim().toUpperCase())
                    }).length === 0 && orders.length > 0 ? (
                      <div className="text-center py-lg text-on-surface-variant">
                        <span className="material-symbols-outlined text-4xl opacity-20 block mb-xs">search_off</span>
                        <p className="text-sm">No se encontró ningún pedido con ese número.</p>
                        <button onClick={() => setOrderSearch('')} className="mt-xs text-xs text-purple-400 hover:text-purple-300 cursor-pointer transition-colors">
                          Limpiar búsqueda
                        </button>
                      </div>
                    ) : null}
                    {orders.filter((order: any) => {
                      if (!orderSearch.trim()) return true
                      const num = `CG-${order.id.slice(-6).toUpperCase()}`
                      return num.includes(orderSearch.trim().toUpperCase())
                    }).map((order: any) => {
                      const orderNum = `CG-${order.id.slice(-6).toUpperCase()}`
                      const statusLabels: Record<string, { label: string; cls: string }> = {
                        PENDING:    { label: 'Pendiente',       cls: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
                        CONFIRMED:  { label: 'Pago confirmado', cls: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'       },
                        PROCESSING: { label: 'En preparación',  cls: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
                        SHIPPED:    { label: 'Enviado',         cls: 'bg-blue-500/20 text-blue-400 border-blue-500/30'       },
                        COMPLETED:  { label: 'Completado',      cls: 'bg-green-500/20 text-green-400 border-green-500/30'    },
                        CANCELLED:  { label: 'Cancelado',       cls: 'bg-red-500/20 text-red-400 border-red-500/30'          },
                      }
                      const st = statusLabels[order.status] ?? { label: order.status, cls: 'bg-white/10 text-on-surface-variant border-white/10' }
                      return (
                        <div key={order.id} className="bg-surface-container border border-white/8 rounded-xl p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className={`font-mono text-xs font-bold transition-colors ${orderSearch.trim() ? 'text-purple-300' : 'text-white/70'}`}>{orderNum}</span>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${st.cls}`}>
                                  {st.label}
                                </span>
                              </div>
                              <p className="text-xs text-on-surface-variant">
                                {new Date(order.createdAt).toLocaleDateString('es-AR', { year:'numeric', month:'short', day:'numeric' })}
                                {' · '}
                                {order.items.length} {order.items.length === 1 ? 'producto' : 'productos'}
                              </p>
                            </div>
                            <div className="flex items-center gap-3 sm:flex-shrink-0">
                              <p className="text-base font-black text-primary-container">
                                {new Intl.NumberFormat('es-AR', { style:'currency', currency:'ARS', maximumFractionDigits:0 }).format(order.totalAmount)}
                              </p>
                              <a href={`/seguimiento/${orderNum}`} target="_blank" rel="noreferrer"
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-purple-500/30 text-[11px] text-purple-300 hover:bg-purple-500/10 transition-colors cursor-pointer flex-shrink-0">
                                <span className="material-symbols-outlined text-sm">open_in_new</span>
                                Seguir
                              </a>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── Password tab ─────────────────────── */}
            {tab === 'password' && (
              <div className="profile-card rounded-2xl border border-purple-500/20 p-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
                <h2 className="text-lg font-black text-on-surface font-['Plus_Jakarta_Sans'] mb-lg flex items-center gap-xs">
                  <span className="material-symbols-outlined text-purple-400">lock</span>
                  Cambiar contraseña
                </h2>
                <form onSubmit={handlePassword} className="space-y-sm max-w-md">
                  {[
                    { label: 'Contraseña actual',  val: currentPwd, set: setCurrentPwd, auto: 'current-password' },
                    { label: 'Nueva contraseña',   val: newPwd,     set: setNewPwd,     auto: 'new-password'     },
                    { label: 'Confirmar contraseña',val: confirmPwd, set: setConfirmPwd, auto: 'new-password'    },
                  ].map(({ label, val, set, auto }) => (
                    <div key={label}>
                      <label className="block text-xs text-on-surface-variant uppercase tracking-wider mb-1 font-['Plus_Jakarta_Sans']">{label}</label>
                      <input type={showPwd ? 'text' : 'password'} value={val}
                        onChange={e => set(e.target.value)} placeholder="••••••••"
                        autoComplete={auto} className={inp} />
                    </div>
                  ))}
                  <label className="flex items-center gap-xs cursor-pointer text-xs text-on-surface-variant">
                    <input type="checkbox" checked={showPwd} onChange={e => setShowPwd(e.target.checked)} className="accent-purple-500" />
                    Mostrar contraseñas
                  </label>
                  <button type="submit" disabled={busy}
                    className="profile-save-btn bg-purple-600 px-lg py-3 rounded-xl font-bold text-sm flex items-center gap-xs hover:bg-purple-500 hover:shadow-[0_0_20px_rgba(138,43,226,0.4)] active:scale-95 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed" style={{ color: '#ffffff' }}>
                    {busy
                      ? <><span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>Actualizando...</>
                      : <><span className="material-symbols-outlined text-sm">lock_reset</span>Actualizar contraseña</>}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
