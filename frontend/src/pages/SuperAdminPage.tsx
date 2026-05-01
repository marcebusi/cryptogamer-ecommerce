import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import toast from 'react-hot-toast'

type Tab = 'sections' | 'payment'

interface StoreConfig {
  id: string
  subscriptionActive: boolean
  subscriptionExpiresAt: string | null
  planName: string
  notes: string
  enabledSections: string
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
  const [tab, setTab] = useState<Tab>('sections')

  const [config,     setConfig]     = useState<StoreConfig | null>(null)
  const [enabled,    setEnabled]    = useState<string[]>(['orders', 'analytics', 'sellers', 'contact'])
  const [payForm,    setPayForm]    = useState({ subscriptionActive: true, subscriptionExpiresAt: '', planName: 'PRO', notes: '' })
  const [loading,    setLoading]    = useState(true)
  const [saving,     setSaving]     = useState(false)

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
          <div className="flex gap-xs border-b border-white/10">
            {([
              { key: 'sections', icon: 'toggle_on',      label: 'Secciones'   },
              { key: 'payment',  icon: 'credit_card',     label: 'Suscripción' },
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
      </div>
    </main>
  )
}
