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
      api.get('/auth/me/orders')
        .then(res => setOrders(res.data))
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

  const inp = 'w-full bg-surface-container border border-outline-variant rounded-xl px-sm py-3 text-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all'

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="profile-hero relative overflow-hidden border-b border-purple-500/20">
        <div className="absolute inset-0 profile-grid pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

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
                    className="bg-purple-600 text-white px-lg py-3 rounded-xl font-bold text-sm flex items-center gap-xs hover:bg-purple-500 hover:shadow-[0_0_20px_rgba(138,43,226,0.4)] active:scale-95 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
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
                <h2 className="text-lg font-black text-on-surface font-['Plus_Jakarta_Sans'] mb-lg flex items-center gap-xs">
                  <span className="material-symbols-outlined text-purple-400">shopping_bag</span>
                  Mis pedidos
                </h2>

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
                  <div className="space-y-4">
                    {orders.map((order: any) => (
                      <div key={order.id} className="bg-surface-container border border-white/5 rounded-xl p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono text-on-surface-variant">#{order.id.slice(-6).toUpperCase()}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              order.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                              order.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                              'bg-surface-container-high text-on-surface-variant border border-white/10'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                          <p className="text-sm text-on-surface font-semibold">
                            {new Date(order.createdAt).toLocaleDateString('es-AR', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </p>
                          <p className="text-xs text-on-surface-variant mt-1">
                            {order.items.length} {order.items.length === 1 ? 'producto' : 'productos'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black text-primary-container">${order.totalAmount.toFixed(0)}</p>
                        </div>
                      </div>
                    ))}
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
                    className="bg-purple-600 text-white px-lg py-3 rounded-xl font-bold text-sm flex items-center gap-xs hover:bg-purple-500 hover:shadow-[0_0_20px_rgba(138,43,226,0.4)] active:scale-95 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
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
