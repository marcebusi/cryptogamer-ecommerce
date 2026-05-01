import { useState, useEffect } from 'react'
import { useNavigate }         from 'react-router-dom'
import { useAuth }             from '../../context/AuthContext'
import { api }                 from '../../lib/api'
import { Analytics }           from './AdminAnalyticsPage'
import AdvancedAnalytics       from '../../components/analytics/AdvancedAnalytics'

/* ── Date presets ────────────────────────────────────────── */
type Preset = 'today' | 'week' | 'month' | 'custom'

const PRESETS: { key: Preset; label: string; icon: string }[] = [
  { key: 'today',  label: 'Hoy',           icon: 'today' },
  { key: 'week',   label: 'Semana',        icon: 'date_range' },
  { key: 'month',  label: 'Mes',           icon: 'calendar_month' },
  { key: 'custom', label: 'Personalizado', icon: 'tune' },
]

const fmtDate  = (d: Date)   => d.toISOString().slice(0, 10)
const fmtLabel = (s: string) =>
  new Date(s + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })

function getRangeParams(preset: Preset, cf: string, ct: string): { from: string; to: string } {
  const now = new Date()
  if (preset === 'today')  return { from: fmtDate(now), to: fmtDate(now) }
  if (preset === 'week')  { const d = new Date(now); d.setDate(d.getDate() - 6);  return { from: fmtDate(d), to: fmtDate(now) } }
  if (preset === 'month') { const d = new Date(now); d.setDate(d.getDate() - 29); return { from: fmtDate(d), to: fmtDate(now) } }
  return { from: cf || fmtDate(now), to: ct || fmtDate(now) }
}

/* ── Skeleton ────────────────────────────────────────────── */
function Skeleton() {
  return (
    <main className="max-w-screen-xl mx-auto px-4 md:px-8 py-lg space-y-8">
      <div className="h-16 w-72 bg-white/5 rounded-xl animate-pulse" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-56 bg-white/5 rounded-2xl animate-pulse" />
        ))}
      </div>
    </main>
  )
}

/* ── Page ────────────────────────────────────────────────── */
export default function AdminAnalyticsAdvancedPage() {
  const { isAdmin, isLoading: authLoading } = useAuth()
  const navigate = useNavigate()

  const [data,       setData]       = useState<Analytics | null>(null)
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState('')
  const [preset,     setPreset]     = useState<Preset>('month')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo,   setCustomTo]   = useState('')
  const [rangeFrom,  setRangeFrom]  = useState('')
  const [rangeTo,    setRangeTo]    = useState('')

  useEffect(() => {
    if (!authLoading && !isAdmin) navigate('/')
  }, [authLoading, isAdmin, navigate])

  useEffect(() => {
    if (!isAdmin) return
    if (preset === 'custom' && (!customFrom || !customTo)) return
    const { from, to } = getRangeParams(preset, customFrom, customTo)
    setRangeFrom(from)
    setRangeTo(to)
    setLoading(true)
    api.get<Analytics>(`/api/admin/analytics?from=${from}&to=${to}`)
      .then(res => setData(res))
      .catch(e  => setError(e.message ?? 'Error al cargar analytics'))
      .finally(() => setLoading(false))
  }, [isAdmin, preset, customFrom, customTo])

  const presetLabel = (() => {
    if (preset === 'today') return `Hoy · ${fmtLabel(rangeFrom)}`
    if (rangeFrom && rangeTo && rangeFrom !== rangeTo) return `${fmtLabel(rangeFrom)} → ${fmtLabel(rangeTo)}`
    return rangeFrom ? fmtLabel(rangeFrom) : '…'
  })()

  if (authLoading || loading) return <Skeleton />
  if (error) return (
    <main className="max-w-screen-xl mx-auto px-4 md:px-8 py-lg">
      <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
        <span className="material-symbols-outlined">error</span>{error}
      </div>
    </main>
  )
  if (!data) return null

  return (
    <main className="max-w-screen-xl mx-auto px-4 md:px-8 py-lg space-y-8">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-xs px-sm py-1 rounded-full bg-purple-500/15 border border-purple-500/25 text-purple-400 text-xs font-bold uppercase tracking-widest mb-sm">
            <span className="material-symbols-outlined text-sm">electric_bolt</span>
            Analytics Avanzado
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white font-['Plus_Jakarta_Sans'] leading-tight">
            Métricas{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-[#3af4ff]">
              Avanzadas
            </span>
          </h1>
          <p className="text-xs text-white/30 mt-1 font-mono tracking-wide">{presetLabel}</p>
        </div>

        {/* ── Date filter ── */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 bg-white/4 border border-white/8 rounded-xl p-1">
            {PRESETS.map(p => (
              <button
                key={p.key}
                onClick={() => setPreset(p.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer
                  ${preset === p.key
                    ? 'bg-purple-500/25 text-purple-300 border border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.2)]'
                    : 'text-white/40 hover:text-white/70 hover:bg-white/5'}`}
              >
                <span className="material-symbols-outlined text-sm">{p.icon}</span>
                {p.label}
              </button>
            ))}
          </div>

          {preset === 'custom' && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={customFrom}
                onChange={e => setCustomFrom(e.target.value)}
                max={customTo || fmtDate(new Date())}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white/70 focus:outline-none focus:border-purple-500/50 focus:bg-white/8 transition-colors cursor-pointer"
              />
              <span className="text-white/20 text-xs">→</span>
              <input
                type="date"
                value={customTo}
                onChange={e => setCustomTo(e.target.value)}
                min={customFrom}
                max={fmtDate(new Date())}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white/70 focus:outline-none focus:border-purple-500/50 focus:bg-white/8 transition-colors cursor-pointer"
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      <AdvancedAnalytics data={data} presetLabel={presetLabel} />

    </main>
  )
}
