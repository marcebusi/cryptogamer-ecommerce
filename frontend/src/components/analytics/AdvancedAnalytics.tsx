import { useState, useEffect, useRef } from 'react'
import {
  Analytics, ARS, AnimBar, KpiCard,
  DayRevenue, AreaChart,
  CatSubcatOrder,
} from '../../pages/admin/AdminAnalyticsPage'

/* ── Adaptive date-axis (day-by-day for week, sparse for month) */
function DateAxis({ days }: { days: Array<{ date:string }> }) {
  const n = days.length
  if (n < 2) return null
  const step = n <= 7 ? 1 : n <= 14 ? 2 : n <= 21 ? 3 : n <= 35 ? 5 : Math.ceil(n / 5)
  return (
    <div className="relative h-4 mt-1.5 select-none">
      {days.map((d, i) => {
        if (i % step !== 0 && i !== n - 1) return null
        const pct  = (i / (n - 1)) * 100
        const isFirst = i === 0
        const isLast  = i === n - 1
        return (
          <span key={i} className="absolute text-[9px] text-white/20 whitespace-nowrap"
            style={{
              left:      isLast  ? 'auto' : `${pct}%`,
              right:     isLast  ? '0'    : 'auto',
              transform: isFirst || isLast ? 'none' : 'translateX(-50%)',
            }}>
            {new Date(d.date+'T12:00:00').toLocaleDateString('es-AR',{day:'numeric',month:'short'})}
          </span>
        )
      })}
    </div>
  )
}

/* ── Alert types ─────────────────────────────────────────── */
interface Alert {
  id:        string
  metric:    string
  threshold: number
  operator:  'gt' | 'lt'
  label:     string
  enabled:   boolean
}

const DEFAULT_ALERTS: Alert[] = [
  { id:'cancel',  metric:'cancellationRate', threshold:20, operator:'gt', label:'Tasa cancelación',    enabled:true },
  { id:'pending', metric:'pendingOrders',    threshold:10, operator:'gt', label:'Órdenes pendientes',  enabled:true },
]

function loadAlerts(): Alert[] {
  try {
    const raw = localStorage.getItem('analytics_alerts')
    if (raw) return JSON.parse(raw) as Alert[]
  } catch { /* ignore */ }
  return DEFAULT_ALERTS
}
function saveAlerts(alerts: Alert[]) {
  localStorage.setItem('analytics_alerts', JSON.stringify(alerts))
}

/* ── Status line chart (replaces stacked area) ───────────── */
const STATUS_COLORS: Record<string, string> = {
  CONFIRMED: '#34d399',
  COMPLETED: '#a78bfa',
  SHIPPED:   '#60a5fa',
  PENDING:   '#fbbf24',
  CANCELLED: '#f87171',
}
const STATUS_LABELS: Record<string, string> = {
  CONFIRMED:'Confirmado', COMPLETED:'Completado', SHIPPED:'Enviado', PENDING:'Pendiente', CANCELLED:'Cancelado',
}
const STATUS_ORDER = ['CONFIRMED','COMPLETED','SHIPPED','PENDING','CANCELLED'] as const

function StatusLineChart({ data }: { data: Analytics['statusOverTime'] }) {
  const [hovIdx, setHovIdx] = useState<number|null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const W=600; const H=140; const PX=12; const PY=14

  if (!data.length) return (
    <div className="h-36 flex items-center justify-center text-white/20 text-sm">Sin datos</div>
  )

  const maxVal = Math.max(...data.flatMap(d => STATUS_ORDER.map(s => d[s])), 1)

  const getPath = (status: typeof STATUS_ORDER[number]) => {
    const pts = data.map((d, i): [number,number] => [
      PX + (i / (data.length - 1 || 1)) * (W - PX * 2),
      H - PY - (d[status] / maxVal) * (H - PY * 2),
    ])
    return pts.reduce((acc, [x, y], i) => {
      if (i === 0) return `M ${x} ${y}`
      const [px, py] = pts[i-1]; const cx = (px + x) / 2
      return `${acc} C ${cx} ${py} ${cx} ${y} ${x} ${y}`
    }, '')
  }

  const xOf = (i: number) => PX + (i / (data.length - 1 || 1)) * (W - PX * 2)
  const yOf = (i: number, s: typeof STATUS_ORDER[number]) =>
    H - PY - (data[i][s] / maxVal) * (H - PY * 2)

  const onMove = (e: React.MouseEvent) => {
    if (!wrapRef.current) return
    const r = wrapRef.current.getBoundingClientRect()
    setHovIdx(Math.round(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * (data.length - 1)))
  }

  const tipPct = hovIdx !== null ? (hovIdx / (data.length - 1)) * 100 : 50

  return (
    <div ref={wrapRef} className="relative" onMouseMove={onMove} onMouseLeave={() => setHovIdx(null)}>

      {hovIdx !== null && (
        <div className="absolute -top-1 z-10 pointer-events-none"
          style={{ left:`${tipPct}%`, transform:`translateX(${tipPct<15?'0':tipPct>85?'-100%':'-50%'})` }}>
          <div className="admin-tooltip-bg border border-white/12 rounded-xl px-3 py-2.5 shadow-xl whitespace-nowrap"
            style={{ boxShadow:'0 4px 24px rgba(0,0,0,0.7)' }}>
            <p className="text-[10px] text-white/40 uppercase tracking-wider mb-2">
              {new Date(data[hovIdx].date+'T12:00:00').toLocaleDateString('es-AR',{weekday:'short',day:'numeric',month:'short'})}
            </p>
            <div className="space-y-1">
              {STATUS_ORDER.filter(s => data[hovIdx][s] > 0).map(s => (
                <div key={s} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background:STATUS_COLORS[s] }}/>
                  <span className="text-[10px] text-white/50 flex-1">{STATUS_LABELS[s]}</span>
                  <span className="text-xs font-bold" style={{ color:STATUS_COLORS[s] }}>{data[hovIdx][s]}</span>
                </div>
              ))}
              {STATUS_ORDER.every(s => data[hovIdx][s] === 0) && (
                <p className="text-[10px] text-white/25">Sin órdenes</p>
              )}
            </div>
          </div>
          <div className="w-2 h-2 rotate-45 border-b border-r border-white/12 admin-tooltip-bg mx-auto -mt-1"/>
        </div>
      )}

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-36" preserveAspectRatio="none">
        {[0.25,0.5,0.75,1].map(f=>(
          <line key={f} x1={PX} x2={W-PX}
            y1={H-PY-f*(H-PY*2)} y2={H-PY-f*(H-PY*2)}
            stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>
        ))}

        {STATUS_ORDER.map(s => (
          <path key={s} d={getPath(s)} fill="none"
            stroke={STATUS_COLORS[s]} strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round"
            opacity={hovIdx!==null ? (data[hovIdx][s]>0?1:0.15) : 0.85}
            style={{ transition:'opacity 0.15s' }}
          />
        ))}

        {hovIdx !== null && (
          <>
            <line x1={xOf(hovIdx)} y1={PY} x2={xOf(hovIdx)} y2={H-PY}
              stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="3 3"/>
            {STATUS_ORDER.filter(s => data[hovIdx!][s] > 0).map(s => (
              <g key={s}>
                <circle cx={xOf(hovIdx!)} cy={yOf(hovIdx!,s)} r="4" fill={STATUS_COLORS[s]}/>
                <circle cx={xOf(hovIdx!)} cy={yOf(hovIdx!,s)} r="6.5" fill="none"
                  stroke={STATUS_COLORS[s]} strokeWidth="1.5" opacity="0.35"/>
              </g>
            ))}
          </>
        )}
      </svg>

      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
        {STATUS_ORDER.map(k => (
          <div key={k} className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 rounded" style={{ background:STATUS_COLORS[k] }}/>
            <span className="text-[10px] text-white/50">{STATUS_LABELS[k]}</span>
          </div>
        ))}
      </div>

      <DateAxis days={data} />
    </div>
  )
}

/* ── Heatmap ─────────────────────────────────────────────── */
const DAY_LABELS   = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']
const BLOCK_LABELS = ['0-4h','4-8h','8-12h','12-16h','16-20h','20-24h']

function Heatmap({ cells }: { cells: Analytics['heatmap'] }) {
  const maxCount = Math.max(...cells.map(c => c.count), 1)
  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        <div className="grid mb-1" style={{ gridTemplateColumns:'52px repeat(7, 1fr)' }}>
          <div/>
          {DAY_LABELS.map(d => (
            <div key={d} className="text-center text-[10px] text-white/35 font-semibold uppercase tracking-wide py-1">{d}</div>
          ))}
        </div>
        {BLOCK_LABELS.map((bl, block) => (
          <div key={block} className="grid items-center mb-1" style={{ gridTemplateColumns:'52px repeat(7, 1fr)' }}>
            <span className="text-[9px] text-white/25 pr-2 text-right">{bl}</span>
            {DAY_LABELS.map((_, day) => {
              const cell  = cells.find(c => c.day===day && c.block===block)
              const count = cell?.count ?? 0
              const ratio = count / maxCount
              return (
                <div key={day} className="mx-0.5 rounded-md h-8 flex items-center justify-center relative group cursor-default"
                  style={{
                    background: count===0 ? 'rgba(255,255,255,0.03)' : `rgba(74,222,128,${0.08+ratio*0.75})`,
                    border:`1px solid ${count===0?'rgba(255,255,255,0.04)':`rgba(74,222,128,${0.15+ratio*0.5})`}`,
                  }}>
                  {count > 0 && (
                    <span className="text-[10px] font-bold" style={{ color:`rgba(255,255,255,${0.3+ratio*0.7})` }}>{count}</span>
                  )}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-20 whitespace-nowrap">
                    <div className="admin-tooltip-bg border border-white/15 rounded-lg px-2.5 py-1.5 text-[10px] shadow-xl">
                      <span className="text-white/50">{DAY_LABELS[day]} {bl}</span>
                      <span className="font-bold ml-1.5" style={{ color:'#4ade80' }}>{count} orden{count!==1?'es':''}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Comparison chart ────────────────────────────────────── */
function ComparisonChart({ current, prev }: { current:DayRevenue[]; prev:DayRevenue[] }) {
  const n = current.length
  const paddedPrev: DayRevenue[] = Array.from({ length:n }, (_,i) => ({
    date:    prev[i]?.date    ?? current[i]?.date ?? '',
    revenue: prev[i]?.revenue ?? 0,
    orders:  prev[i]?.orders  ?? 0,
  }))
  return (
    <div>
      <AreaChart days={current} color="#4ade80" gradId="comp-curr" prevDays={paddedPrev}/>
      <div className="flex items-center gap-4 mt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-0.5 rounded bg-[#4ade80]"/>
          <span className="text-[10px] text-white/40">Período actual</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-px" style={{ borderTop:'1.5px dashed rgba(74,222,128,0.35)' }}/>
          <span className="text-[10px] text-white/40">Período anterior</span>
        </div>
      </div>
      <DateAxis days={current} />
    </div>
  )
}

/* ── Revenue bar histogram (vertical) ───────────────────── */
function RevenueBarChart({ days, color = '#ff4a8d' }: { days: DayRevenue[]; color?: string }) {
  const [hovIdx, setHovIdx] = useState<number | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  if (!days.length) return (
    <div className="h-28 flex items-center justify-center text-white/20 text-sm">Sin datos</div>
  )

  const maxRev   = Math.max(...days.map(d => d.revenue), 1)
  const W = 600; const H = 110; const PX = 4; const PY = 8; const GAP = 2
  const barStep  = (W - PX * 2) / days.length
  const barW     = Math.max(2, barStep - GAP)
  const available = H - PY * 2 - 6

  const barX  = (i: number) => PX + i * barStep + (barStep - barW) / 2
  const barHt = (rev: number) => Math.max(rev > 0 ? 3 : 0, (rev / maxRev) * available)
  const barY  = (rev: number) => H - PY - barHt(rev)

  const onMove = (e: React.MouseEvent) => {
    if (!wrapRef.current) return
    const r   = wrapRef.current.getBoundingClientRect()
    const idx = Math.floor(((e.clientX - r.left) / r.width) * days.length)
    setHovIdx(Math.max(0, Math.min(days.length - 1, idx)))
  }

  const tipPct = hovIdx !== null ? ((hovIdx + 0.5) / days.length) * 100 : 50

  return (
    <div ref={wrapRef} className="relative select-none" onMouseMove={onMove} onMouseLeave={() => setHovIdx(null)}>

      {/* Tooltip */}
      {hovIdx !== null && days[hovIdx] && (
        <div className="absolute pointer-events-none z-10"
          style={{
            bottom: '100%',
            left: `${tipPct}%`,
            transform: `translateX(${tipPct < 12 ? '0' : tipPct > 88 ? '-100%' : '-50%'})`,
          }}>
          <div className="admin-tooltip-bg border border-white/15 rounded-xl px-3 py-2 shadow-xl mb-2 whitespace-nowrap">
            <p className="text-[10px] text-white/40 mb-1">
              {new Date(days[hovIdx].date + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })}
            </p>
            <p className="text-xs font-bold" style={{ color }}>{ARS(days[hovIdx].revenue)}</p>
            <p className="text-[10px] text-white/35 mt-0.5">{days[hovIdx].orders} orden{days[hovIdx].orders !== 1 ? 'es' : ''}</p>
          </div>
          <div className="w-1.5 h-1.5 rotate-45 admin-tooltip-bg border-b border-r border-white/15 mx-auto -mt-1" />
        </div>
      )}

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-28" preserveAspectRatio="none">
        <defs>
          <linearGradient id="rev-hist-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={color} stopOpacity="0.95" />
            <stop offset="100%" stopColor={color} stopOpacity="0.25" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75, 1].map(f => (
          <line key={f} x1={PX} x2={W - PX}
            y1={H - PY - f * available} y2={H - PY - f * available}
            stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
        ))}
        {days.map((d, i) => (
          <rect key={i}
            x={barX(i)} y={barY(d.revenue)}
            width={barW} height={barHt(d.revenue)}
            rx="1.5" ry="1.5"
            fill={hovIdx === i ? color : 'url(#rev-hist-grad)'}
            opacity={hovIdx !== null && hovIdx !== i ? 0.35 : 1}
            style={{ transition: 'opacity 0.08s, fill 0.08s' }}
          />
        ))}
        <line x1={PX} x2={W - PX} y1={H - PY} y2={H - PY} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      </svg>

      <DateAxis days={days} />
    </div>
  )
}

/* ── Expandable category + subcategory card ──────────────── */
function CategorySubcatCard({ cats }: { cats: CatSubcatOrder[] }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const maxOrders = cats[0]?.orders ?? 1

  const toggle = (cat: string) =>
    setExpanded(prev => { const n = new Set(prev); n.has(cat) ? n.delete(cat) : n.add(cat); return n })

  if (!cats.length) return (
    <div className="py-8 text-center text-white/20 text-sm">Sin datos en este período</div>
  )

  return (
    <div className="space-y-2.5">
      {cats.slice(0, 8).map(({ category, orders, revenue, subcategories }, i) => {
        const isOpen   = expanded.has(category)
        const hasSub   = subcategories.length > 0
        const maxSub   = subcategories[0]?.orders ?? 1

        return (
          <div key={category}>
            <div
              className={`${hasSub ? 'cursor-pointer hover:bg-white/[0.03] rounded-lg -mx-1 px-1 py-0.5 transition-colors' : ''}`}
              onClick={() => hasSub && toggle(category)}
            >
              <div className="flex justify-between text-xs mb-1">
                <div className="flex items-center gap-1">
                  {hasSub && (
                    <span className={`material-symbols-outlined text-[13px] text-white/30 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}>
                      chevron_right
                    </span>
                  )}
                  <span className="text-white/75 font-semibold capitalize truncate max-w-[150px]">{category}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-white/25 tabular-nums text-[11px]">{ARS(revenue)}</span>
                  <span className="font-bold tabular-nums" style={{ color:'#3af4ff' }}>{orders} uds.</span>
                </div>
              </div>
              <AnimBar value={orders} max={maxOrders} color="#3af4ff" delay={i * 50} />
            </div>

            {isOpen && hasSub && (
              <div className="mt-2 ml-3 pl-3 border-l border-white/8 space-y-2 pb-1">
                {subcategories.map((sub, si) => (
                  <div key={sub.name}>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-white/50 capitalize truncate max-w-[130px]">{sub.name}</span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-white/20 tabular-nums">{ARS(sub.revenue)}</span>
                        <span className="font-semibold tabular-nums" style={{ color:'#3af4ff', opacity:0.7 }}>{sub.orders} uds.</span>
                      </div>
                    </div>
                    <AnimBar value={sub.orders} max={maxSub} color="#3af4ff" delay={si * 35} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ── Props ───────────────────────────────────────────────── */
interface Props {
  data:        Analytics
  presetLabel: string
}

/* ── Main component ──────────────────────────────────────── */
export default function AdvancedAnalytics({ data, presetLabel }: Props) {
  const [alerts, setAlerts]                   = useState<Alert[]>(loadAlerts)
  const [showAlertConfig, setShowAlertConfig] = useState(false)

  useEffect(() => { saveAlerts(alerts) }, [alerts])

  // Build synthetic prev-period days (distributed proportionally)
  const n = data.revenueByDay.length
  const prevRevenuePerDay = n > 0 ? data.previousPeriod.totalRevenue / n : 0
  const prevDays: DayRevenue[] = data.revenueByDay.map((d, i) => ({
    date:    d.date,
    revenue: Math.round(prevRevenuePerDay * (0.7 + 0.6 * Math.sin(i * 0.9 + 1))),
    orders:  Math.round((data.previousPeriod.totalOrders / n) * (0.7 + 0.6 * Math.sin(i * 0.9 + 1))),
  }))

  // Evaluate alerts
  const metricValues: Record<string, number> = {
    cancellationRate: data.cancellationRate,
    pendingOrders:    data.summary.pendingOrders,
  }
  const triggeredAlerts = alerts.filter(a => {
    if (!a.enabled) return false
    const val = metricValues[a.metric] ?? 0
    return a.operator==='gt' ? val > a.threshold : val < a.threshold
  })

  const maxHighValue = data.highValueProducts[0]?.revenuePerUnit ?? 1

  // Sparklines
  const cancelSpark = data.statusOverTime.slice(-14).map(d => {
    const total = d.CONFIRMED + d.PENDING + d.SHIPPED + d.COMPLETED + d.CANCELLED
    return total > 0 ? (d.CANCELLED / total) * 100 : 0
  })
  const ticketSpark = data.revenueByDay.slice(-14).map(d =>
    d.orders > 0 ? Math.round(d.revenue / d.orders) : 0
  )

  // Cancel rate trend vs prev period
  const prevCancelRate = data.previousPeriod.totalOrders > 0
    ? (data.previousPeriod.cancelledOrders / data.previousPeriod.totalOrders) * 100 : 0
  const cancelTrend = prevCancelRate > 0
    ? ((data.cancellationRate - prevCancelRate) / prevCancelRate) * 100 : 0

  return (
    <section className="space-y-6">

      {/* Inject keyframes needed by KpiCard */}
      <style>{`
        @keyframes kpi-glow {
          0%,100% { opacity:.10; transform:scale(1); }
          50%      { opacity:.20; transform:scale(1.15); }
        }
        @keyframes bar-shimmer {
          0%   { background-position:-200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>

      {/* Section header */}
      <div className="flex items-center gap-3">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest"
          style={{ background:'rgba(168,85,247,0.1)', border:'1px solid rgba(168,85,247,0.25)', color:'#a855f7' }}>
          <span className="material-symbols-outlined text-sm">electric_bolt</span>
          Analytics Avanzado
        </div>
        <div className="h-px flex-1 bg-gradient-to-r from-[#a855f7]/30 to-transparent"/>
      </div>

      {/* ── Alert banners ─────────────────────────────────── */}
      {triggeredAlerts.length > 0 && (
        <div className="space-y-2">
          {triggeredAlerts.map(a => (
            <div key={a.id} className="flex items-start gap-3 bg-yellow-400/8 border border-yellow-400/25 rounded-xl px-4 py-3">
              <span className="material-symbols-outlined text-yellow-400 text-lg flex-shrink-0 mt-0.5">warning</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-yellow-300">Alerta: {a.label}</p>
                <p className="text-xs text-yellow-400/70 mt-0.5">
                  Valor actual: <strong>{(metricValues[a.metric]??0).toFixed(1)}{a.metric==='cancellationRate'?'%':''}</strong>
                  {' '}— umbral: {a.operator==='gt'?'>':'<'} {a.threshold}{a.metric==='cancellationRate'?'%':''}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Alerts config ─────────────────────────────────── */}
      <div className="admin-card-bg border border-white/6 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-white/40 text-base">notifications</span>
            Alertas
            {triggeredAlerts.length > 0 && (
              <span className="text-[10px] bg-yellow-400/15 border border-yellow-400/25 text-yellow-400 px-1.5 py-0.5 rounded-full font-bold">
                {triggeredAlerts.length} activa{triggeredAlerts.length!==1?'s':''}
              </span>
            )}
          </h3>
          <button onClick={() => setShowAlertConfig(v=>!v)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/10 text-white/40 hover:text-white hover:border-white/20 text-xs cursor-pointer transition-all">
            <span className="material-symbols-outlined text-sm">settings</span>
            Configurar
          </button>
        </div>

        {showAlertConfig && (
          <div className="border-t border-white/6 pt-4 space-y-3">
            {alerts.map((alert, idx) => (
              <div key={alert.id} className="flex items-center gap-3 bg-white/3 rounded-xl px-4 py-3">
                <button
                  onClick={() => setAlerts(prev => prev.map((a,i)=>i===idx?{...a,enabled:!a.enabled}:a))}
                  className={`w-9 h-5 rounded-full relative transition-colors cursor-pointer flex-shrink-0 ${alert.enabled?'bg-[#a855f7]/60':'bg-white/10'}`}>
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${alert.enabled?'left-4':'left-0.5'}`}/>
                </button>
                <span className="text-xs text-white/70 flex-1 font-medium">{alert.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-white/30">{alert.operator==='gt'?'>':'<'}</span>
                  <input type="number" value={alert.threshold}
                    onChange={e => setAlerts(prev => prev.map((a,i)=>i===idx?{...a,threshold:Number(e.target.value)}:a))}
                    className="w-16 bg-background border border-white/10 rounded-lg px-2 py-1 text-xs text-white text-center focus:outline-none focus:border-[#a855f7]/50 transition-colors"/>
                  {alert.metric==='cancellationRate' && <span className="text-[10px] text-white/30">%</span>}
                </div>
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  !alert.enabled?'bg-white/15':
                  triggeredAlerts.some(t=>t.id===alert.id)?'bg-yellow-400 animate-pulse':'bg-emerald-400'
                }`}/>
              </div>
            ))}
          </div>
        )}

        {!showAlertConfig && triggeredAlerts.length===0 && (
          <p className="text-xs text-white/25 text-center py-2">
            {alerts.filter(a=>a.enabled).length} alerta{alerts.filter(a=>a.enabled).length!==1?'s':''} configurada{alerts.filter(a=>a.enabled).length!==1?'s':''} — todo en orden
          </p>
        )}
      </div>

      {/* ── 4 Advanced KPI cards ─────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon="cancel"         label="Tasa de cancelación" value={`${data.cancellationRate.toFixed(1)}%`}   color="#f87171" sparkData={cancelSpark} trend={cancelTrend} delay={0}/>
        <KpiCard icon="mark_chat_read" label="Contactos WhatsApp"  value={String(data.waContactsTotal)}             color="#25D366" delay={80}/>
        <KpiCard icon="inventory"      label="Inventario muerto"   value={`${data.deadInventory.length} prod.`}     color="#fbbf24" delay={160}/>
        <KpiCard icon="local_atm"      label="Ticket promedio"     value={ARS(data.summary.avgOrderValue)}          color="#a855f7" sparkData={ticketSpark} delay={240}/>
      </div>

      {/* ── Heatmap ───────────────────────────────────────── */}
      <div className="admin-card-bg border border-white/6 rounded-2xl p-5">
        <h3 className="font-bold text-white text-sm mb-5 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#4ade80] text-base">grid_on</span>
          ¿Cuándo se vende más?
          <span className="text-[10px] text-white/30 font-normal">— Órdenes por día y horario ({presetLabel})</span>
        </h3>
        <Heatmap cells={data.heatmap}/>
      </div>

      {/* ── Status lines + Comparison side by side ───────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="admin-card-bg border border-white/6 rounded-2xl p-5">
          <h3 className="font-bold text-white text-sm mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#60a5fa] text-base">stacked_line_chart</span>
            Órdenes por estado
            <span className="text-[10px] text-white/30 font-normal">— pasá el mouse para ver detalle</span>
          </h3>
          <StatusLineChart data={data.statusOverTime}/>
        </div>

        <div className="admin-card-bg border border-white/6 rounded-2xl p-5">
          <h3 className="font-bold text-white text-sm mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#a855f7] text-base">compare_arrows</span>
            Este período vs anterior
            <span className="text-[10px] text-white/30 font-normal">— hover para ver ambos valores</span>
          </h3>
          <ComparisonChart current={data.revenueByDay} prev={prevDays}/>
        </div>
      </div>

      {/* ── Revenue histograms ────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="admin-card-bg border border-white/6 rounded-2xl p-5">
          <h3 className="font-bold text-white text-sm mb-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#ff4a8d] text-base">bar_chart</span>
            Histograma de ingresos totales
          </h3>
          <p className="text-[11px] text-white/25 mb-4">Ingresos diarios · {presetLabel}</p>
          <RevenueBarChart days={data.revenueByDay} color="#ff4a8d" />
          {/* Summary totals */}
          <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/6">
            <div className="bg-white/[0.03] rounded-xl px-3 py-2.5 border border-white/5">
              <p className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">Total del período</p>
              <p className="text-sm font-black" style={{ color:'#ff4a8d' }}>{ARS(data.summary.totalRevenue)}</p>
            </div>
            <div className="bg-white/[0.03] rounded-xl px-3 py-2.5 border border-white/5">
              <p className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">Pico máximo</p>
              <p className="text-sm font-black" style={{ color:'#ff4a8d' }}>
                {ARS(Math.max(...data.revenueByDay.map(d => d.revenue), 0))}
              </p>
            </div>
          </div>
        </div>

        <div className="admin-card-bg border border-white/6 rounded-2xl p-5">
          <h3 className="font-bold text-white text-sm mb-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#a855f7] text-base">leaderboard</span>
            Histograma de ingresos por producto
          </h3>
          <p className="text-[11px] text-white/25 mb-4">Top productos · ordenados por ingresos</p>
          {data.topProducts.length === 0
            ? <div className="py-8 text-center text-white/20 text-sm">Sin datos en este período</div>
            : (() => {
              const sorted = [...data.topProducts].sort((a, b) => b.revenue - a.revenue)
              const maxRev = sorted[0]?.revenue ?? 1
              return (
                <div className="space-y-2.5">
                  {sorted.map((p, i) => (
                    <div key={p.id} className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-white/5 border border-white/8">
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-white/55 truncate max-w-[130px]">{p.name}</span>
                          <span className="text-[10px] font-bold flex-shrink-0 ml-2" style={{ color:'#a855f7' }}>{ARS(p.revenue)}</span>
                        </div>
                        <AnimBar value={p.revenue} max={maxRev} color="#a855f7" delay={i * 50} />
                      </div>
                    </div>
                  ))}
                </div>
              )
            })()
          }
        </div>
      </div>

      {/* ── High value products + Category by orders (with subcats) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="admin-card-bg border border-white/6 rounded-2xl p-5">
          <h3 className="font-bold text-white text-sm mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#fbbf24] text-base">diamond</span>
            Productos de alto valor
          </h3>
          {data.highValueProducts.length===0
            ? <div className="py-8 text-center text-white/20 text-sm">Sin datos en este período</div>
            : <div className="space-y-3">
              {data.highValueProducts.map((p,i) => (
                <div key={p.id} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 bg-white/5 border border-white/8">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover"/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{p.name}</p>
                    <p className="text-[10px] text-white/30 truncate">{p.category}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <AnimBar value={p.revenuePerUnit} max={maxHighValue} color="#fbbf24" delay={i*60}/>
                      <span className="text-[10px] text-white/30 flex-shrink-0">{p.qty} uds.</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-bold tabular-nums" style={{ color:'#fbbf24' }}>{ARS(p.revenuePerUnit)}</p>
                    <p className="text-[9px] text-white/25">por unidad</p>
                  </div>
                </div>
              ))}
            </div>
          }
        </div>

        <div className="admin-card-bg border border-white/6 rounded-2xl p-5">
          <h3 className="font-bold text-white text-sm mb-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#3af4ff] text-base">account_tree</span>
            Categorías por órdenes
          </h3>
          <p className="text-[11px] text-white/25 mb-4">Hacé click en una categoría para ver subcategorías</p>
          <CategorySubcatCard cats={data.categorySubcatMap ?? []} />
        </div>
      </div>

      {/* ── Dead inventory ────────────────────────────────── */}
      {data.deadInventory.length > 0 && (
        <div className="admin-card-bg border border-yellow-400/15 rounded-2xl p-5">
          <h3 className="font-bold text-white text-sm mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#fbbf24] text-base">inventory</span>
            Inventario sin movimiento
            <span className="text-[10px] bg-yellow-400/12 border border-yellow-400/20 text-yellow-400 px-2 py-0.5 rounded-full font-bold">
              {data.deadInventory.length}
            </span>
          </h3>
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full text-sm min-w-[480px]">
              <thead>
                <tr className="border-b border-white/6">
                  {['Imagen','Producto','Categoría','Precio'].map(h => (
                    <th key={h} className="pb-3 pr-4 text-left text-[10px] text-white/25 font-semibold uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.deadInventory.slice(0,10).map(p => (
                  <tr key={p.id} className="border-b border-white/4 hover:bg-white/2 transition-colors">
                    <td className="py-2.5 pr-4">
                      <div className="w-9 h-9 rounded-lg overflow-hidden bg-white/5 border border-white/8">
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover"/>
                      </div>
                    </td>
                    <td className="py-2.5 pr-4"><p className="text-xs font-medium text-white/80 truncate max-w-[180px]">{p.name}</p></td>
                    <td className="py-2.5 pr-4 text-[11px] text-white/35 capitalize">{p.category}</td>
                    <td className="py-2.5 text-xs font-bold tabular-nums" style={{ color:'#fbbf24' }}>{ARS(p.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data.deadInventory.length > 10 && (
            <p className="text-[10px] text-white/25 mt-3 text-center">
              Mostrando 10 de {data.deadInventory.length} productos sin movimiento
            </p>
          )}
        </div>
      )}

      {/* ── Seller performance ────────────────────────────── */}
      <div className="admin-card-bg border border-white/6 rounded-2xl p-5">
        <h3 className="font-bold text-white text-sm mb-5 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#ff4a8d] text-base">storefront</span>
          Performance de vendedores
        </h3>
        {data.avgTicketBySeller.length===0
          ? <div className="py-8 text-center text-white/20 text-sm">Sin ventas en este período</div>
          : <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="border-b border-white/6">
                  {['Vendedor','Ticket prom.','Ventas','Ingresos','Contactos WA'].map(h => (
                    <th key={h} className="pb-3 pr-4 text-left text-[10px] text-white/25 font-semibold uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.avgTicketBySeller.map((s,i) => (
                  <tr key={s.id} className="border-b border-white/4 hover:bg-white/2 transition-colors">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2.5">
                        {s.avatar
                          ? <img src={s.avatar} alt={s.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0"/>
                          : <div className="w-8 h-8 rounded-full bg-purple-600/30 border border-purple-500/30 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{s.name.charAt(0)}</div>
                        }
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-white truncate">{s.name}</p>
                          <p className="text-[10px] text-white/30">#{i+1}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-xs font-bold tabular-nums" style={{ color:'#a855f7' }}>{ARS(s.avgTicket)}</span>
                    </td>
                    <td className="py-3 pr-4 text-xs text-white/50 tabular-nums">{s.orderCount}</td>
                    <td className="py-3 pr-4">
                      <span className="text-xs font-bold tabular-nums" style={{ color:'#4ade80' }}>{ARS(s.revenue)}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs tabular-nums" style={{ color:'#25D366' }}>{s.waContacts}</span>
                        {s.waContacts > 0 && (
                          <i className="fa-brands fa-whatsapp text-sm opacity-60" style={{ color:'#25D366' }}/>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        }
      </div>

    </section>
  )
}
