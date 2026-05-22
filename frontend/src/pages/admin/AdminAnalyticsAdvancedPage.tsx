import { useState, useEffect } from 'react'
import { useNavigate }         from 'react-router-dom'
import { useAuth }             from '../../context/AuthContext'
import { useThemeColors }      from '../../lib/themeColors'
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
  const tc = useThemeColors()
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
          <div className="inline-flex items-center gap-xs px-sm py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-sm"
            style={{ background: tc.primaryBg, border: `1px solid ${tc.primaryBorder}`, color: tc.primary }}>
            <span className="material-symbols-outlined text-sm">electric_bolt</span>
            Analytics Avanzado
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-on-background font-['Plus_Jakarta_Sans'] leading-tight">
            Métricas{' '}
            <span style={{ color: tc.primary }}>Avanzadas</span>
          </h1>
          <p className="text-xs text-on-surface-variant mt-1 font-mono tracking-wide">{presetLabel}</p>
        </div>

        {/* ── Date filter ── */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1 rounded-xl p-1"
            style={{ background: tc.cardBg, border: `1px solid ${tc.cardBorder}` }}>
            {PRESETS.map(p => {
              const isActive = preset === p.key
              return (
                <button
                  key={p.key}
                  onClick={() => setPreset(p.key)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer"
                  style={isActive
                    ? {
                        background: tc.isDark ? 'rgba(168,85,247,0.25)' : '#1f2937',
                        color:      tc.isDark ? '#c084fc'              : '#ffffff',
                        border:     `1px solid ${tc.isDark ? 'rgba(168,85,247,0.4)' : 'transparent'}`,
                      }
                    : {
                        color:  tc.isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.5)',
                        border: '1px solid transparent',
                      }
                  }
                >
                  <span className="material-symbols-outlined text-sm">{p.icon}</span>
                  {p.label}
                </button>
              )
            })}
          </div>

          {preset === 'custom' && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="date"
                value={customFrom}
                onChange={e => setCustomFrom(e.target.value)}
                max={customTo || fmtDate(new Date())}
                className="flex-1 rounded-lg px-3 py-1.5 text-xs cursor-pointer focus:outline-none transition-colors"
                style={{
                  background: tc.cardBg,
                  border:     `1px solid ${tc.cardBorder}`,
                  color:      tc.isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
                  colorScheme: tc.isDark ? 'dark' : 'light',
                }}
              />
              <span className="text-on-surface-variant text-xs text-center">→</span>
              <input
                type="date"
                value={customTo}
                onChange={e => setCustomTo(e.target.value)}
                min={customFrom}
                max={fmtDate(new Date())}
                className="flex-1 rounded-lg px-3 py-1.5 text-xs cursor-pointer focus:outline-none transition-colors"
                style={{
                  background: tc.cardBg,
                  border:     `1px solid ${tc.cardBorder}`,
                  color:      tc.isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
                  colorScheme: tc.isDark ? 'dark' : 'light',
                }}
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
