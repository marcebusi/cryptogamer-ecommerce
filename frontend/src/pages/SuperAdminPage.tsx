import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import toast from 'react-hot-toast'

type Tab = 'panel' | 'sections' | 'users' | 'payment' | 'billing'

/* ── Admin panel quick-access cards ─────────────────── */
const ADMIN_CARDS = [
  { to: '/admin/productos',                icon: 'add_box',          title: 'Agregar Producto',    desc: 'Publicá un nuevo producto en el catálogo.',                         color: 'primary'   },
  { to: '/admin/productos?manage=true',    icon: 'inventory_2',      title: 'Gestionar Catálogo',  desc: 'Editá, reordenás o eliminás productos existentes.',                 color: 'secondary' },
  { to: '/admin/categorias',               icon: 'category',         title: 'Categorías',          desc: 'Creá y administrá categorías y subcategorías.',                     color: 'primary'   },
  { to: '/admin/productos?filter=offers',  icon: 'local_offer',      title: 'Gestionar Ofertas',   desc: 'Controlá qué productos aparecen en la sección de Ofertas.',         color: 'secondary' },
  { to: '/admin/productos?filter=featured',icon: 'stars',            title: 'Últimas Llegadas',    desc: 'Elegí qué productos destacar en la Home.',                          color: 'tertiary'  },
  { to: '/admin/vendedores',               icon: 'group',            title: 'Vendedores',          desc: 'Administrá los socios con sus datos de pago.',                      color: 'tertiary'  },
  { to: '/admin/pedidos',                  icon: 'receipt_long',     title: 'Pedidos',             desc: 'Historial completo de órdenes con estado y detalle.',               color: 'secondary' },
  { to: '/admin/analytics',                icon: 'bar_chart',        title: 'Analytics',           desc: 'Productos más vendidos, ranking de vendedores e ingresos.',         color: 'tertiary'  },
  { to: '/admin/analytics-avanzado',       icon: 'electric_bolt',    title: 'Analytics Avanzado',  desc: 'KPIs, heatmap, inventario muerto, WhatsApp y métricas profundas.',  color: 'secondary' },
  { to: '/admin/usuarios',                 icon: 'manage_accounts',  title: 'Usuarios',            desc: 'Gestioná cuentas, asigná roles y eliminá usuarios.',                color: 'tertiary'  },
]

const adminColorMap = {
  primary:   { bg: 'bg-primary-container/15',   border: 'border-primary-container/25',   icon: 'text-primary-container'   },
  secondary: { bg: 'bg-secondary-container/15', border: 'border-secondary-container/25', icon: 'text-secondary-container' },
  tertiary:  { bg: 'bg-tertiary-container/15',  border: 'border-tertiary-container/25',  icon: 'text-tertiary-container'  },
}

interface StoreConfig {
  id: string
  subscriptionActive: boolean
  subscriptionExpiresAt: string | null
  planName: string
  notes: string
  enabledSections: string
}

interface BillingConfig {
  monthlyAmount: number
  billingAlias:  string
  billingDay:    number
}

interface ServicePayment {
  id:            string
  period:        string
  dueDate:       string
  amount:        number
  status:        'PENDING' | 'PAID' | 'OVERDUE'
  paidAt:        string | null
  markedByEmail: string | null
  note:          string
}

/* ── Optional sections the superadmin can toggle ── */
const SECTION_DEFS = [
  {
    key:   'orders',
    icon:  'receipt_long',
    title: 'Pedidos',
    desc:  'El cliente puede ver el historial de órdenes recibidas.',
    color: 'text-blue-400',
    bg:    'bg-blue-500/10 border-blue-500/20',
  },
  {
    key:   'sellers',
    icon:  'group',
    title: 'Vendedores',
    desc:  'El cliente puede administrar los socios/vendedores de la tienda.',
    color: 'text-yellow-400',
    bg:    'bg-yellow-500/10 border-yellow-500/20',
  },
  {
    key:   'analytics',
    icon:  'bar_chart',
    title: 'Analytics',
    desc:  'Acceso al dashboard de métricas, productos más vendidos e ingresos.',
    color: 'text-cyan-400',
    bg:    'bg-cyan-500/10 border-cyan-500/20',
  },
  {
    key:   'analytics-advanced',
    icon:  'electric_bolt',
    title: 'Analytics Avanzado',
    desc:  'KPIs, heatmap, inventario muerto, WhatsApp, alertas y métricas profundas.',
    color: 'text-purple-400',
    bg:    'bg-purple-500/10 border-purple-500/20',
  },
  {
    key:   'contact',
    icon:  'mail',
    title: 'Mensajes de contacto',
    desc:  'El cliente puede leer los mensajes enviados desde el formulario.',
    color: 'text-purple-400',
    bg:    'bg-purple-500/10 border-purple-500/20',
  },
]

const PLANS = ['BASIC', 'PRO', 'ENTERPRISE']

export default function SuperAdminPage() {
  const { isSuperAdmin, isLoading, user: me } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('panel')

  const [config,     setConfig]     = useState<StoreConfig | null>(null)
  const [enabled,    setEnabled]    = useState<string[]>(['orders', 'analytics', 'analytics-advanced', 'sellers', 'contact'])
  const [payForm,    setPayForm]    = useState({ subscriptionActive: true, subscriptionExpiresAt: '', planName: 'PRO', notes: '' })
  const [loading,    setLoading]    = useState(true)
  const [saving,     setSaving]     = useState(false)

  // Billing state
  const [billingConfig,  setBillingConfig]  = useState<BillingConfig>({ monthlyAmount: 0, billingAlias: '', billingDay: 1 })
  const [amountInput,    setAmountInput]    = useState('')
  const [payments,       setPayments]       = useState<ServicePayment[]>([])
  const [billingLoading, setBillingLoading] = useState(false)
  const [markingId,      setMarkingId]      = useState<string | null>(null)
  const today = new Date()
  const [newPeriod, setNewPeriod] = useState(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`)
  const [newNote,   setNewNote]   = useState('')

  useEffect(() => {
    if (!isLoading && !isSuperAdmin) navigate('/')
  }, [isLoading, isSuperAdmin, navigate])

  const loadConfig = useCallback(async () => {
    try {
      const data = await api.get<StoreConfig | null>('/api/superadmin/store')
      if (data) {
        setConfig(data)
        try { setEnabled(JSON.parse(data.enabledSections)) } catch { /* use default */ }
        setPayForm({
          subscriptionActive:    data.subscriptionActive,
          subscriptionExpiresAt: data.subscriptionExpiresAt
            ? new Date(data.subscriptionExpiresAt).toISOString().split('T')[0]
            : '',
          planName: data.planName,
          notes:    data.notes,
        })
      }
    } catch { /* no config yet */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { loadConfig() }, [loadConfig])

  const loadBilling = useCallback(async () => {
    setBillingLoading(true)
    try {
      const [cfg, pays] = await Promise.all([
        api.get<BillingConfig>('/api/superadmin/billing'),
        api.get<ServicePayment[]>('/api/superadmin/billing/payments'),
      ])
      setBillingConfig(cfg)
      setAmountInput(cfg.monthlyAmount > 0 ? String(cfg.monthlyAmount) : '')
      setPayments(pays)
    } catch { /* ignore */ }
    finally { setBillingLoading(false) }
  }, [])

  useEffect(() => { if (tab === 'billing') loadBilling() }, [tab, loadBilling])

  const toggleSection = (key: string) => {
    setEnabled(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])
  }

  const saveSections = async () => {
    setSaving(true)
    try {
      await api.put('/api/superadmin/store', { ...payForm, enabledSections: enabled })
      toast.success('Secciones guardadas.')
    } catch (e) { toast.error((e as Error).message) }
    finally { setSaving(false) }
  }

  const saveBillingConfig = async () => {
    setSaving(true)
    try {
      await api.put('/api/superadmin/billing', billingConfig)
      toast.success('Configuración guardada.')
    } catch (e) { toast.error((e as Error).message) }
    finally { setSaving(false) }
  }

  const createPayment = async () => {
    if (!newPeriod) return
    const [year, month] = newPeriod.split('-').map(Number)
    const dueDate = new Date(year, month - 1, billingConfig.billingDay).toISOString()
    setSaving(true)
    try {
      await api.post('/api/superadmin/billing/payments', {
        period: newPeriod, dueDate, amount: billingConfig.monthlyAmount, note: newNote,
      })
      toast.success(`Registro ${newPeriod} creado.`)
      setNewNote('')
      await loadBilling()
    } catch (e) { toast.error((e as Error).message) }
    finally { setSaving(false) }
  }

  const markStatus = async (id: string, status: 'PAID' | 'OVERDUE' | 'PENDING') => {
    setMarkingId(id)
    try {
      await api.patch(`/api/superadmin/billing/payments/${id}/status`, { status })
      toast.success(status === 'PAID' ? 'Marcado como pagado.' : status === 'OVERDUE' ? 'Marcado como vencido.' : 'Restablecido a pendiente.')
      await loadBilling()
    } catch (e) { toast.error((e as Error).message) }
    finally { setMarkingId(null) }
  }

  const savePayment = async () => {
    setSaving(true)
    try {
      await api.put('/api/superadmin/store', {
        ...payForm,
        enabledSections: enabled,
        subscriptionExpiresAt: payForm.subscriptionExpiresAt || null,
      })
      toast.success('Pago guardado.')
    } catch (e) { toast.error((e as Error).message) }
    finally { setSaving(false) }
  }

  if (isLoading || loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <span className="material-symbols-outlined animate-spin text-3xl text-on-surface-variant">progress_activity</span>
    </div>
  )

  const isExpired = payForm.subscriptionExpiresAt
    ? new Date(payForm.subscriptionExpiresAt) < new Date()
    : false
  const isActive = payForm.subscriptionActive && !isExpired

  return (
    <main className="min-h-screen">
      {/* Header */}
      <section className="border-b border-purple-500/20 bg-surface-container-lowest/60">
        <div className="max-w-screen-lg mx-auto px-4 md:px-8 py-lg">
          <div className="flex items-center gap-md mb-lg">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-purple-400 text-2xl">shield_person</span>
            </div>
            <div>
              <p className="text-xs font-bold text-purple-300 uppercase tracking-widest">Atenea Techs</p>
              <h1 className="text-xl font-black text-on-background font-['Plus_Jakarta_Sans']">Panel de gestión</h1>
              <p className="text-xs text-on-surface-variant">{me?.email}</p>
            </div>
            {/* Service status pill */}
            <div className="ml-auto">
              <span className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full border ${
                isActive
                  ? 'bg-green-500/15 text-green-300 border-green-500/30'
                  : 'bg-red-500/15 text-red-300 border-red-500/30'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: 'currentColor' }} />
                {isActive ? 'Servicio activo' : 'Servicio vencido'}
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-xs border-b border-white/10 flex-wrap">
            {([
              { key: 'panel',    icon: 'dashboard',         label: 'Panel Admin'  },
              { key: 'sections', icon: 'toggle_on',         label: 'Secciones'    },
              { key: 'users',    icon: 'manage_accounts',   label: 'Usuarios'     },
              { key: 'payment',  icon: 'credit_card',       label: 'Suscripción'  },
              { key: 'billing',  icon: 'receipt_long',      label: 'Facturación'  },
            ] as { key: Tab; icon: string; label: string }[]).map(t => (
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

      <div className="max-w-screen-lg mx-auto px-4 md:px-8 py-lg">

        {/* ── PANEL ADMIN ───────────────────────────── */}
        {tab === 'panel' && (
          <div>
            <div className="mb-lg">
              <h2 className="font-bold text-on-surface font-['Plus_Jakarta_Sans'] mb-xs">Accesos rápidos</h2>
              <p className="text-sm text-on-surface-variant">Navegá directamente a cualquier sección del panel de administración.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
              {ADMIN_CARDS.map(card => {
                const c = adminColorMap[card.color as keyof typeof adminColorMap]
                return (
                  <Link
                    key={card.to}
                    to={card.to}
                    className={`group relative rounded-2xl border ${c.border} bg-surface-container p-lg flex flex-col gap-sm hover:-translate-y-1 transition-all duration-200 cursor-pointer overflow-hidden`}
                  >
                    <div className={`absolute top-0 right-0 w-24 h-24 ${c.bg} rounded-full blur-2xl pointer-events-none`} />
                    <div className={`w-12 h-12 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center`}>
                      <span className={`material-symbols-outlined ${c.icon}`}>{card.icon}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-on-surface text-lg font-['Plus_Jakarta_Sans'] mb-1">{card.title}</h3>
                      <p className="text-sm text-on-surface-variant leading-relaxed">{card.desc}</p>
                    </div>
                    <div className={`mt-auto flex items-center gap-1 text-xs font-semibold ${c.icon}`}>
                      Ir ahora
                      <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* ── SECTIONS ──────────────────────────────── */}
        {tab === 'sections' && (
          <div className="max-w-xl space-y-md">
            <div>
              <h2 className="font-bold text-on-surface font-['Plus_Jakarta_Sans'] mb-xs">Secciones habilitadas</h2>
              <p className="text-sm text-on-surface-variant">Controlá qué módulos puede ver el cliente en su panel de administración.</p>
            </div>

            <div className="space-y-sm">
              {SECTION_DEFS.map(s => {
                const on = enabled.includes(s.key)
                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => toggleSection(s.key)}
                    className={`w-full flex items-center gap-md p-sm rounded-2xl border transition-all cursor-pointer text-left ${
                      on
                        ? `${s.bg} border-opacity-100`
                        : 'bg-surface-container border-white/10 opacity-60 hover:opacity-80'
                    }`}
                  >
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${s.bg} border`}>
                      <span className={`material-symbols-outlined text-xl ${s.color}`}>{s.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-on-surface text-sm">{s.title}</p>
                      <p className="text-xs text-on-surface-variant leading-relaxed">{s.desc}</p>
                    </div>
                    {/* Toggle visual */}
                    <div className={`w-11 h-6 rounded-full flex-shrink-0 relative transition-colors ${on ? 'bg-green-500' : 'bg-surface-container-high border border-white/20'}`}>
                      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${on ? 'left-5' : 'left-0.5'}`} />
                    </div>
                  </button>
                )
              })}
            </div>

            <button
              onClick={saveSections}
              disabled={saving}
              className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-xs hover:bg-purple-500 hover:shadow-[0_0_20px_rgba(138,43,226,0.4)] active:scale-95 transition-all cursor-pointer disabled:opacity-60"
            >
              {saving
                ? <><span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>Guardando...</>
                : <><span className="material-symbols-outlined text-sm">save</span>Guardar secciones</>}
            </button>
          </div>
        )}

        {/* ── USERS ─────────────────────────────────── */}
        {tab === 'users' && (
          <div className="max-w-xl space-y-md">
            <div>
              <h2 className="font-bold text-on-surface font-['Plus_Jakarta_Sans'] mb-xs">Gestión de usuarios</h2>
              <p className="text-sm text-on-surface-variant">Asigná roles (incluyendo Manager) o eliminá cuentas.</p>
            </div>
            <Link
              to="/admin/usuarios"
              className="flex items-center gap-md p-sm rounded-2xl border bg-purple-500/10 border-purple-500/20 hover:bg-purple-500/15 transition-all cursor-pointer group"
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-purple-500/20 border border-purple-500/30">
                <span className="material-symbols-outlined text-xl text-purple-400">manage_accounts</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-on-surface text-sm">Ir a Gestión de Usuarios</p>
                <p className="text-xs text-on-surface-variant">Ver, editar roles y eliminar cuentas de usuario.</p>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant group-hover:text-on-surface transition-colors">arrow_forward</span>
            </Link>
          </div>
        )}

        {/* ── PAYMENT / SUBSCRIPTION ─────────────────── */}
        {tab === 'payment' && (
          <div className="max-w-md space-y-md">
            <div>
              <h2 className="font-bold text-on-surface font-['Plus_Jakarta_Sans'] mb-xs">Estado de suscripción</h2>
              <p className="text-sm text-on-surface-variant">Gestioná el plan y el vencimiento del servicio del cliente.</p>
            </div>

            <div className="bg-surface-container rounded-2xl border border-purple-500/20 p-lg space-y-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />

              {/* Plan */}
              <div>
                <label className="block text-xs text-on-surface-variant uppercase tracking-wider mb-1">Plan</label>
                <div className="flex gap-xs">
                  {PLANS.map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPayForm(f => ({ ...f, planName: p }))}
                      className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
                        payForm.planName === p
                          ? 'bg-purple-600/30 text-purple-200 border-purple-500/50'
                          : 'bg-surface-container-high text-on-surface-variant border-white/10 hover:border-white/20'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Expiry */}
              <div>
                <label className="block text-xs text-on-surface-variant uppercase tracking-wider mb-1">Fecha de vencimiento</label>
                <input
                  type="date"
                  value={payForm.subscriptionExpiresAt}
                  onChange={e => setPayForm(f => ({ ...f, subscriptionExpiresAt: e.target.value }))}
                  className="w-full bg-surface-container-high border border-outline-variant rounded-xl px-sm py-xs text-sm text-on-surface outline-none focus:border-purple-400"
                />
                <p className="text-xs text-on-surface-variant mt-1">Dejá vacío si no tiene vencimiento.</p>
              </div>

              {/* Active toggle */}
              <div className="flex items-center justify-between p-sm bg-surface-container-high rounded-xl border border-white/10">
                <div>
                  <p className="text-sm font-semibold text-on-surface">Servicio activo</p>
                  <p className="text-xs text-on-surface-variant">El cliente tiene acceso al panel de administración</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPayForm(f => ({ ...f, subscriptionActive: !f.subscriptionActive }))}
                  className={`w-12 h-6 rounded-full transition-colors cursor-pointer relative flex-shrink-0 ${payForm.subscriptionActive ? 'bg-green-500' : 'bg-surface-container border border-white/20'}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all shadow ${payForm.subscriptionActive ? 'left-6' : 'left-0.5'}`} />
                </button>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs text-on-surface-variant uppercase tracking-wider mb-1">Notas internas</label>
                <textarea
                  rows={2}
                  value={payForm.notes}
                  onChange={e => setPayForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Ej: Pagó el 01/05/2025 con transferencia..."
                  className="w-full bg-surface-container-high border border-outline-variant rounded-xl px-sm py-xs text-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:border-purple-400 resize-none"
                />
              </div>

              <button
                onClick={savePayment}
                disabled={saving}
                className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-xs hover:bg-purple-500 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
              >
                {saving
                  ? <><span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>Guardando...</>
                  : <><span className="material-symbols-outlined text-sm">save</span>Guardar</>}
              </button>
            </div>

            {/* Current status summary */}
            {config && (
              <div className="bg-surface-container rounded-xl border border-white/10 p-sm">
                <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-sm">Estado guardado</p>
                <div className="space-y-xs text-sm">
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Plan</span>
                    <span className="font-bold text-purple-300">{config.planName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Estado</span>
                    <span className={`font-bold ${isActive ? 'text-green-400' : 'text-red-400'}`}>
                      {isActive ? '● Activo' : '● Vencido/inactivo'}
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

        {/* ── BILLING ──────────────────────────────── */}
        {tab === 'billing' && (
          <div className="space-y-lg">

            {/* Config */}
            <div className="max-w-md">
              <h2 className="font-bold text-on-surface font-['Plus_Jakarta_Sans'] mb-xs">Configuración de cobro</h2>
              <p className="text-sm text-on-surface-variant mb-md">Monto mensual, alias de transferencia y día de vencimiento.</p>
              <div className="bg-surface-container rounded-2xl border border-purple-500/20 p-lg space-y-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
                <div>
                  <label className="block text-xs text-on-surface-variant uppercase tracking-wider mb-1">Monto mensual ($)</label>
                  <input type="number" min="0" value={amountInput} placeholder="Ej: 15000"
                    onChange={e => { setAmountInput(e.target.value); setBillingConfig(f => ({ ...f, monthlyAmount: Number(e.target.value) || 0 })) }}
                    className="w-full bg-surface-container-high border border-outline-variant rounded-xl px-sm py-xs text-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:border-purple-400" />
                </div>
                <div>
                  <label className="block text-xs text-on-surface-variant uppercase tracking-wider mb-1">Alias / CBU</label>
                  <input type="text" value={billingConfig.billingAlias} placeholder="ej: ateneatechs.mp"
                    onChange={e => setBillingConfig(f => ({ ...f, billingAlias: e.target.value }))}
                    className="w-full bg-surface-container-high border border-outline-variant rounded-xl px-sm py-xs text-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:border-purple-400" />
                </div>
                <div>
                  <label className="block text-xs text-on-surface-variant uppercase tracking-wider mb-1">Día de vencimiento (1–28)</label>
                  <input type="number" min="1" max="28" value={billingConfig.billingDay}
                    onChange={e => setBillingConfig(f => ({ ...f, billingDay: Number(e.target.value) }))}
                    className="w-full bg-surface-container-high border border-outline-variant rounded-xl px-sm py-xs text-sm text-on-surface outline-none focus:border-purple-400" />
                </div>
                <button onClick={saveBillingConfig} disabled={saving}
                  className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-xs hover:bg-purple-500 active:scale-95 transition-all cursor-pointer disabled:opacity-60">
                  {saving
                    ? <><span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>Guardando...</>
                    : <><span className="material-symbols-outlined text-sm">save</span>Guardar configuración</>}
                </button>
              </div>
            </div>

            {/* Crear registro */}
            <div className="max-w-md">
              <h2 className="font-bold text-on-surface font-['Plus_Jakarta_Sans'] mb-xs">Crear registro de pago</h2>
              <div className="bg-surface-container rounded-xl border border-white/10 p-md space-y-sm">
                <div>
                  <label className="block text-xs text-on-surface-variant uppercase tracking-wider mb-1">Período</label>
                  <input type="month" value={newPeriod} onChange={e => setNewPeriod(e.target.value)}
                    className="w-full bg-surface-container-high border border-outline-variant rounded-xl px-sm py-xs text-sm text-on-surface outline-none focus:border-purple-400" />
                </div>
                <div>
                  <label className="block text-xs text-on-surface-variant uppercase tracking-wider mb-1">Nota interna (opcional)</label>
                  <input type="text" value={newNote} onChange={e => setNewNote(e.target.value)}
                    placeholder="Ej: avisado por WhatsApp"
                    className="w-full bg-surface-container-high border border-outline-variant rounded-xl px-sm py-xs text-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:border-purple-400" />
                </div>
                <button onClick={createPayment} disabled={saving}
                  className="w-full py-2.5 rounded-xl font-bold text-sm border border-primary-container/40 text-primary-container hover:bg-primary-container/10 active:scale-95 transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-xs">
                  <span className="material-symbols-outlined text-sm">add_circle</span>
                  Crear registro
                </button>
              </div>
            </div>

            {/* Tabla de pagos */}
            <div>
              <h2 className="font-bold text-on-surface font-['Plus_Jakarta_Sans'] mb-md">Historial de pagos</h2>
              {billingLoading ? (
                <div className="flex items-center gap-xs text-on-surface-variant text-sm">
                  <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>Cargando...
                </div>
              ) : payments.length === 0 ? (
                <p className="text-sm text-on-surface-variant">No hay registros todavía. Creá el primero arriba.</p>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-white/8">
                  <table className="w-full text-sm">
                    <thead className="bg-surface-container-high">
                      <tr>
                        {['Período','Vencimiento','Monto','Estado','Acciones'].map(h => (
                          <th key={h} className="text-left text-xs text-on-surface-variant uppercase tracking-wider px-md py-sm font-semibold">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {payments.map(p => {
                        const statusStyle = {
                          PAID:    'bg-green-500/15 text-green-300 border-green-500/30',
                          PENDING: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
                          OVERDUE: 'bg-red-500/15 text-red-300 border-red-500/30',
                        }[p.status]
                        const statusLabel = { PAID:'Pagado', PENDING:'Pendiente', OVERDUE:'Vencido' }[p.status]
                        const isMarking = markingId === p.id
                        return (
                          <tr key={p.id} className="bg-surface-container hover:bg-surface-container-high transition-colors">
                            <td className="px-md py-sm font-bold text-on-surface">{p.period}</td>
                            <td className="px-md py-sm text-on-surface-variant">
                              {new Date(p.dueDate).toLocaleDateString('es-AR')}
                            </td>
                            <td className="px-md py-sm font-semibold text-on-surface">
                              ${p.amount.toLocaleString('es-AR')}
                            </td>
                            <td className="px-md py-sm">
                              <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full border ${statusStyle}`}>
                                <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: 'currentColor' }} />
                                {statusLabel}
                              </span>
                              {p.paidAt && (
                                <p className="text-[10px] text-on-surface-variant mt-0.5">
                                  {new Date(p.paidAt).toLocaleDateString('es-AR')}
                                </p>
                              )}
                            </td>
                            <td className="px-md py-sm">
                              <div className="flex gap-xs flex-wrap">
                                {p.status !== 'PAID' && (
                                  <button onClick={() => markStatus(p.id, 'PAID')} disabled={isMarking}
                                    className="text-xs px-xs py-1 rounded-lg bg-green-500/15 text-green-300 border border-green-500/30 hover:bg-green-500/25 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-0.5">
                                    {isMarking
                                      ? <span className="material-symbols-outlined text-xs animate-spin">progress_activity</span>
                                      : <span className="material-symbols-outlined text-xs">check_circle</span>}
                                    Pagado
                                  </button>
                                )}
                                {p.status === 'PENDING' && (
                                  <button onClick={() => markStatus(p.id, 'OVERDUE')} disabled={isMarking}
                                    className="text-xs px-xs py-1 rounded-lg bg-red-500/15 text-red-300 border border-red-500/30 hover:bg-red-500/25 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-0.5">
                                    <span className="material-symbols-outlined text-xs">warning</span>
                                    Vencido
                                  </button>
                                )}
                                {p.status === 'PAID' && (
                                  <button onClick={() => markStatus(p.id, 'PENDING')} disabled={isMarking}
                                    className="text-xs px-xs py-1 rounded-lg bg-surface-container-high text-on-surface-variant border border-white/10 hover:border-white/20 transition-all cursor-pointer disabled:opacity-50">
                                    Restablecer
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </main>
  )
}
