import './AdminAnalyticsPage.css'
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useThemeColors } from '../../lib/themeColors'
import { api } from '../../lib/api'


/* ── Types ───────────────────────────────────────────────── */
interface Summary { totalRevenue:number; totalOrders:number; avgOrderValue:number; pendingOrders:number; paidOrders:number; cancelledOrders:number; totalSellers:number; totalProducts:number }
interface TopProduct { id:string; name:string; image:string; category:string; price:number; qty:number; revenue:number }
interface TopSeller  { id:string; name:string; avatar:string; orderCount:number; revenue:number }
export interface DayRevenue { date:string; revenue:number; orders:number }
interface CatRevenue { category:string; revenue:number }
interface RecentOrder { id:string; status:string; totalAmount:number; createdAt:string; user:{name:string|null;email:string}; seller:{id:string;name:string}|null; itemCount:number }

export interface PrevPeriod { totalRevenue:number; totalOrders:number; paidOrders:number; cancelledOrders:number }
export interface HeatCell   { day:number; block:number; count:number }
export interface StatusDay  { date:string; CONFIRMED:number; PENDING:number; SHIPPED:number; COMPLETED:number; CANCELLED:number }
export interface DeadProduct { id:string; name:string; image:string; price:number; category:string }
export interface HighValueProduct { id:string; name:string; image:string; price:number; category:string; qty:number; revenue:number; revenuePerUnit:number }
export interface CatOrder   { category:string; orders:number; revenue:number }
export interface SellerTicket { id:string; name:string; avatar:string; orderCount:number; revenue:number; avgTicket:number; waContacts:number }
export interface SubcatOrder     { name:string; orders:number; revenue:number }
export interface CatSubcatOrder  { category:string; orders:number; revenue:number; subcategories:SubcatOrder[] }

export interface Analytics {
  summary:          Summary
  topProducts:      TopProduct[]
  topSellers:       TopSeller[]
  revenueByDay:     DayRevenue[]
  revenueByCategory:CatRevenue[]
  recentOrders:     RecentOrder[]
  previousPeriod:   PrevPeriod
  heatmap:          HeatCell[]
  statusOverTime:   StatusDay[]
  deadInventory:    DeadProduct[]
  highValueProducts:HighValueProduct[]
  categoryByOrders: CatOrder[]
  categorySubcatMap:CatSubcatOrder[]
  avgTicketBySeller:SellerTicket[]
  cancellationRate: number
  waContactsTotal:  number
}

/* ── Date presets ────────────────────────────────────────── */
type Preset = 'today' | 'week' | 'month' | 'custom'

const PRESETS: { key:Preset; label:string; icon:string }[] = [
  { key:'today',  label:'Hoy',           icon:'today' },
  { key:'week',   label:'Semana',        icon:'date_range' },
  { key:'month',  label:'Mes',           icon:'calendar_month' },
  { key:'custom', label:'Personalizado', icon:'tune' },
]

const fmtDate = (d:Date) => d.toISOString().slice(0,10)

function getRangeParams(preset:Preset, cf:string, ct:string): { from:string; to:string } {
  const now = new Date()
  if (preset==='today')  return { from:fmtDate(now), to:fmtDate(now) }
  if (preset==='week')  { const d=new Date(now); d.setDate(d.getDate()-6);  return { from:fmtDate(d), to:fmtDate(now) } }
  if (preset==='month') { const d=new Date(now); d.setDate(d.getDate()-29); return { from:fmtDate(d), to:fmtDate(now) } }
  return { from:cf||fmtDate(now), to:ct||fmtDate(now) }
}

/* ── Helpers ─────────────────────────────────────────────── */
export const ARS = (n:number) => new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:0}).format(n)

const STATUS_MAP: Record<string,{label:string;dot:string;badge:string}> = {
  PENDING:   {label:'Pendiente', dot:'bg-yellow-400', badge:'bg-yellow-400/10 text-yellow-400 border-yellow-400/20'},
  CONFIRMED: {label:'Confirmado', dot:'bg-emerald-400',badge:'bg-emerald-400/10 text-emerald-400 border-emerald-400/20'},
  SHIPPED:   {label:'Enviado',   dot:'bg-sky-400',    badge:'bg-sky-400/10 text-sky-400 border-sky-400/20'},
  COMPLETED: {label:'Completado',dot:'bg-purple-400', badge:'bg-purple-400/10 text-purple-400 border-purple-400/20'},
  CANCELLED: {label:'Cancelado', dot:'bg-red-400',    badge:'bg-red-400/10 text-red-400 border-red-400/20'},
}

const calcTrend = (curr:number, prev:number) => prev > 0 ? ((curr - prev) / prev) * 100 : 0

/* ── Animated counter ────────────────────────────────────── */
function useCountUp(target:number, duration=900, delay=0) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let frame:number
    const start = performance.now() + delay
    const tick = (now:number) => {
      const elapsed  = Math.max(0, now - start)
      const progress = Math.min(elapsed / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      setVal(Math.round(ease * target))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, duration, delay])
  return val
}

/* ── Area chart ──────────────────────────────────────────── */
export function AreaChart({ days, color, gradId, prevDays }: { days:DayRevenue[]; color:string; gradId:string; prevDays?:DayRevenue[] }) {
  const pathRef = useRef<SVGPathElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const [animated, setAnimated] = useState(false)
  const [hovIdx, setHovIdx]     = useState<number|null>(null)
  const W=600; const H=140; const PX=12; const PY=16

  const vals = days.map(d=>d.revenue)
  const maxV = Math.max(...vals, ...(prevDays?.map(d=>d.revenue)??[]), 1)
  const pts: [number,number][] = vals.map((v,i)=>[
    PX + (i/(vals.length-1||1))*(W-PX*2),
    H - PY - (v/maxV)*(H-PY*2-8),
  ])

  const prevPts: [number,number][] = (prevDays??[]).map((d,i)=>[
    PX + (i/((prevDays!.length-1)||1))*(W-PX*2),
    H - PY - (d.revenue/maxV)*(H-PY*2-8),
  ])

  const buildLine = (p:[number,number][]) => p.reduce((acc,[x,y],i)=>{
    if(i===0) return `M ${x} ${y}`
    const [px,py]=p[i-1]; const cx=(px+x)/2
    return `${acc} C ${cx} ${py} ${cx} ${y} ${x} ${y}`
  },'')

  const linePath  = buildLine(pts)
  const prevLine  = buildLine(prevPts)
  const areaPath  = pts.length ? `${linePath} L ${pts[pts.length-1][0]} ${H-PY} L ${PX} ${H-PY} Z` : ''

  // Smooth opacity crossfade when data changes (no abrupt stroke reset)
  useEffect(()=>{
    setAnimated(false)
    const t = setTimeout(()=>setAnimated(true), 220)
    return ()=>clearTimeout(t)
  }, [days])

  useEffect(()=>{
    if(!pathRef.current) return
    const len = pathRef.current.getTotalLength()
    pathRef.current.style.strokeDasharray  = String(len)
    pathRef.current.style.strokeDashoffset = animated ? '0' : String(len)
    pathRef.current.style.transition = animated
      ? 'stroke-dashoffset 0.9s cubic-bezier(0.25,0.46,0.45,0.94)'
      : 'none'
  },[animated])

  const onMove = (e:React.MouseEvent) => {
    if(!wrapRef.current||days.length<2) return
    const r = wrapRef.current.getBoundingClientRect()
    setHovIdx(Math.round(Math.max(0,Math.min(1,(e.clientX-r.left)/r.width))*(days.length-1)))
  }

  const hov  = hovIdx!==null ? days[hovIdx] : null
  const hovX = hovIdx!==null ? (pts[hovIdx]?.[0]??0) : 0
  const hovY = hovIdx!==null ? (pts[hovIdx]?.[1]??0) : 0
  const tipL = hovIdx!==null ? (hovIdx/(days.length-1))*100 : 50
  const lastPt = pts[pts.length-1]

  return (
    <div ref={wrapRef} className="relative" onMouseMove={onMove} onMouseLeave={()=>setHovIdx(null)}
      style={{opacity: animated ? 1 : 0, transition: 'opacity 0.22s ease'}}>
      {hov && (
        <div className="absolute -top-1 z-10 pointer-events-none"
          style={{left:`${tipL}%`,transform:`translateX(${tipL<15?'0':tipL>85?'-100%':'-50%'})`}}>
          <div className="admin-tooltip-bg border border-white/12 rounded-xl px-3 py-2 shadow-xl whitespace-nowrap"
            style={{boxShadow:`0 4px 24px rgba(0,0,0,0.7),0 0 0 1px ${color}25`}}>
            <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1.5">
              {new Date(hov.date+'T12:00:00').toLocaleDateString('es-AR',{weekday:'short',day:'numeric',month:'short'})}
            </p>
            <div className="flex items-center gap-1.5 mb-0.5">
              <div className="w-2 h-0.5 rounded" style={{background:color}}/>
              <span className="text-[10px] text-white/40">Actual</span>
            </div>
            <p className="text-sm font-black leading-none" style={{color}}>{ARS(hov.revenue)}</p>
            <p className="text-[10px] text-white/40 mt-0.5 mb-1.5">{hov.orders} orden{hov.orders!==1?'es':''}</p>
            {prevDays && prevDays[hovIdx!] && (
              <>
                <div className="flex items-center gap-1.5 mb-0.5 border-t border-white/8 pt-1.5">
                  <div className="w-2 h-px" style={{borderTop:`1.5px dashed ${color}`}}/>
                  <span className="text-[10px] text-white/30">Período anterior</span>
                </div>
                <p className="text-sm font-bold leading-none" style={{color,opacity:0.45}}>{ARS(prevDays[hovIdx!].revenue)}</p>
                <p className="text-[10px] text-white/25 mt-0.5">{prevDays[hovIdx!].orders} orden{prevDays[hovIdx!].orders!==1?'es':''}</p>
              </>
            )}
          </div>
          <div className="w-2 h-2 rotate-45 border-b border-r border-white/12 admin-tooltip-bg mx-auto -mt-1"/>
        </div>
      )}

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-36" preserveAspectRatio="none">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor={color} stopOpacity="0.35"/>
            <stop offset="85%" stopColor={color} stopOpacity="0.02"/>
          </linearGradient>
          <linearGradient id={`${gradId}-sh`} gradientUnits="userSpaceOnUse" x1="-300" y1="0" x2="-100" y2="0">
            <stop offset="0%"   stopColor={color} stopOpacity="0"/>
            <stop offset="50%"  stopColor={color} stopOpacity="0.2"/>
            <stop offset="100%" stopColor={color} stopOpacity="0"/>
            <animate attributeName="x1" values={`-300;${W+100};-300`} dur="6s" repeatCount="indefinite" calcMode="linear"/>
            <animate attributeName="x2" values={`-100;${W+300};-100`} dur="6s" repeatCount="indefinite" calcMode="linear"/>
          </linearGradient>
          <mask id={`${gradId}-mask`}>
            <path d={areaPath} fill="white"/>
          </mask>
          <filter id={`${gradId}-glow`}>
            <feGaussianBlur result="blur">
              <animate attributeName="stdDeviation" values="2;5;2" dur="7s" repeatCount="indefinite"/>
            </feGaussianBlur>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {[0.25,0.5,0.75,1].map(f=>(
          <line key={f} x1={PX} x2={W-PX}
            y1={H-PY-(f*(H-PY*2-8))} y2={H-PY-(f*(H-PY*2-8))}
            stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>
        ))}

        <path d={areaPath} fill={`url(#${gradId})`}/>
        <rect width={W} height={H} fill={`url(#${gradId}-sh)`} mask={`url(#${gradId}-mask)`}/>

        {/* Previous period dashed line */}
        {prevLine && prevPts.length > 1 && (
          <path d={prevLine} fill="none" stroke={color} strokeWidth="1.5"
            strokeDasharray="5 4" strokeLinecap="round" opacity="0.35"/>
        )}

        <path ref={pathRef} d={linePath} fill="none" stroke={color} strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round" filter={`url(#${gradId}-glow)`}/>

        {hovIdx!==null && (
          <line x1={hovX} y1={PY} x2={hovX} y2={H-PY}
            stroke={color} strokeWidth="1" strokeDasharray="3 3" opacity="0.5"/>
        )}

        {lastPt && (
          <g>
            <circle cx={lastPt[0]} cy={lastPt[1]} r="4" fill={color} opacity="0">
              <animate attributeName="r"       values="4;18;4"      dur="2.5s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.18;0;0.18" dur="2.5s" repeatCount="indefinite"/>
            </circle>
            <circle cx={lastPt[0]} cy={lastPt[1]} r="4" fill="none" stroke={color} strokeWidth="1.5" opacity="0">
              <animate attributeName="r"       values="4;11;4"    dur="2s" begin="0.4s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" begin="0.4s" repeatCount="indefinite"/>
            </circle>
            <circle cx={lastPt[0]} cy={lastPt[1]} r="3.5" fill={color}/>
          </g>
        )}

        {hovIdx!==null && (
          <g>
            <circle cx={hovX} cy={hovY} r="9" fill={color} opacity="0.1"/>
            <circle cx={hovX} cy={hovY} r="4" fill={color}/>
            <circle cx={hovX} cy={hovY} r="5.5" fill="none" stroke={color} strokeWidth="2"/>
          </g>
        )}
      </svg>
    </div>
  )
}

/* ── Donut chart ─────────────────────────────────────────── */
function DonutChart({ paid, pending, cancelled }: { paid:number; pending:number; cancelled:number }) {
  const [progress, setProgress] = useState(0)
  useEffect(()=>{ const t=setTimeout(()=>setProgress(1),300); return()=>clearTimeout(t) },[])
  const total = paid+pending+cancelled||1
  const R=44; const cx=60; const cy=60; const sw=13; const C=2*Math.PI*R
  const slices = [
    {value:paid,      color:'#34d399', label:'Pagadas'},
    {value:pending,   color:'#fbbf24', label:'Pendientes'},
    {value:cancelled, color:'#f87171', label:'Canceladas'},
  ]
  let offset=0
  const arcs = slices.map(s=>{
    const len=(s.value/total)*C*progress
    const el=<circle key={s.label} cx={cx} cy={cy} r={R} fill="none"
      stroke={s.color} strokeWidth={sw}
      strokeDasharray={`${len} ${C}`} strokeDashoffset={-offset}
      style={{transform:`rotate(-90deg)`,transformOrigin:`${cx}px ${cy}px`,
        transition:'stroke-dasharray 1s cubic-bezier(0.4,0,0.2,1)'}}/>
    offset+=len; return el
  })
  return (
    <div className="flex items-center gap-5">
      <div className="relative flex-shrink-0">
        <svg viewBox="0 0 120 120" className="w-28 h-28">
          <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={sw}/>
          {arcs}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-black text-white leading-none">{total}</span>
          <span className="text-[10px] text-white/30 uppercase tracking-wider">total</span>
        </div>
      </div>
      <div className="space-y-2.5 flex-1">
        {slices.map(s=>(
          <div key={s.label} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{background:s.color}}/>
            <span className="text-xs text-white/50 flex-1">{s.label}</span>
            <span className="text-sm font-bold text-white">{s.value}</span>
            <span className="text-[10px] text-white/30 w-9 text-right">{Math.round(s.value/total*100)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Animated bar with shimmer ───────────────────────────── */
export function AnimBar({ value, max, color, delay=0 }: { value:number; max:number; color:string; delay?:number }) {
  const [w, setW] = useState('0%')
  useEffect(()=>{
    const t=setTimeout(()=>setW(`${max>0?(value/max)*100:0}%`), delay+200)
    return()=>clearTimeout(t)
  },[value,max,delay])
  return (
    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
      <div className="h-full rounded-full relative overflow-hidden"
        style={{width:w, background:color, transition:'width 0.5s cubic-bezier(0.25,0.46,0.45,0.94)'}}>
        <div className="absolute inset-0"
          style={{
            background:'linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.18) 50%,transparent 100%)',
            backgroundSize:'200% 100%',
            animation:'bar-shimmer 3.5s linear infinite',
          }}/>
      </div>
    </div>
  )
}

/* ── KPI Card ────────────────────────────────────────────── */
export function KpiCard({ icon, label, value, sub, color, sparkData, delay=0, trend }: {
  icon:string; label:string; value:string; sub?:string; color:string; sparkData?:number[]; delay?:number; trend?:number
}) {
  const [visible, setVisible] = useState(false)
  useEffect(()=>{const t=setTimeout(()=>setVisible(true),delay);return()=>clearTimeout(t)},[delay])
  const W=80; const H=28
  const spark = sparkData?.slice(-12)??[]
  const maxS  = Math.max(...spark,1)
  const sparkPath = spark.length>1 ? spark.map((v,i)=>{
    const x=i/(spark.length-1)*W; const y=H-2-(v/maxS)*(H-4)
    return `${i===0?'M':'L'} ${x} ${y}`
  }).join(' ') : ''
  return (
    <div className={`relative rounded-2xl border border-white/8 admin-card-bg p-5 overflow-hidden transition-all duration-500 ${visible?'opacity-100 translate-y-0':'opacity-0 translate-y-4'}`}
      style={{transitionDelay:`${delay}ms`}}>
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full blur-3xl pointer-events-none"
        style={{background:color, animation:'kpi-glow 4s ease-in-out infinite'}}/>
      <div className="flex items-start justify-between mb-4">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center border"
          style={{background:`${color}18`,borderColor:`${color}30`}}>
          <span className="material-symbols-outlined text-base" style={{color}}>{icon}</span>
        </div>
        {sparkPath && (
          <svg viewBox={`0 0 ${W} ${H}`} className="w-16 h-7 opacity-60">
            <path d={sparkPath} fill="none" stroke={color} strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
      <p className="text-2xl font-black text-white font-['Plus_Jakarta_Sans'] leading-none">{value}</p>
      {trend !== undefined && !isNaN(trend) && (
        <span className={`text-[10px] font-bold flex items-center gap-0.5 mt-0.5 ${trend>=0?'text-emerald-400':'text-red-400'}`}>
          <span className="material-symbols-outlined text-xs">{trend>=0?'trending_up':'trending_down'}</span>
          {trend>=0?'+':''}{trend.toFixed(1)}% vs período ant.
        </span>
      )}
      {sub && <p className="text-xs text-white/40 mt-1">{sub}</p>}
      <p className="text-[10px] text-white/30 uppercase tracking-widest font-semibold mt-3">{label}</p>
    </div>
  )
}

/* ── Skeleton ────────────────────────────────────────────── */
function Skeleton() {
  return (
    <main className="max-w-screen-xl mx-auto px-4 md:px-8 py-lg space-y-8">
      <div className="h-16 w-72 bg-white/5 rounded-xl animate-pulse"/>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_,i)=><div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse"/>)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-64 bg-white/5 rounded-2xl animate-pulse"/>
        <div className="h-64 bg-white/5 rounded-2xl animate-pulse"/>
      </div>
    </main>
  )
}

/* ── Page ────────────────────────────────────────────────── */
export default function AdminAnalyticsPage() {
  const tc = useThemeColors()
  const { isAdmin, isLoading:authLoading } = useAuth()
  const navigate = useNavigate()
  const [data, setData]             = useState<Analytics|null>(null)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [preset, setPreset]         = useState<Preset>('month')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo]     = useState('')
  const [chartKey, setChartKey]     = useState(0)
  const [ordersPage, setOrdersPage] = useState(1)
  const PAGE_SIZE = 8

  useEffect(()=>{ if(!authLoading&&!isAdmin) navigate('/') },[authLoading,isAdmin,navigate])

  useEffect(()=>{
    if(!isAdmin) return
    if(preset==='custom'&&(!customFrom||!customTo)) return
    const { from, to } = getRangeParams(preset, customFrom, customTo)
    setLoading(true)
    setOrdersPage(1)
    api.get<Analytics>(`/api/admin/analytics?from=${from}&to=${to}`)
      .then(res=>{ setData(res); setChartKey(k=>k+1) })
      .catch(e=>setError(e.message??'Error al cargar analytics'))
      .finally(()=>setLoading(false))
  },[isAdmin, preset, customFrom, customTo])

  const revCount  = useCountUp(data?.summary.totalRevenue??0, 1600, 300)
  const ordCount  = useCountUp(data?.summary.totalOrders??0,  1200, 500)
  const prodCount = useCountUp(data?.summary.totalProducts??0,1000, 700)
  const sellCount = useCountUp(data?.summary.totalSellers??0,  800, 900)

  if (authLoading||loading) return <Skeleton/>
  if (error) return (
    <main className="max-w-screen-xl mx-auto px-4 md:px-8 py-lg">
      <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
        <span className="material-symbols-outlined">error</span>{error}
      </div>
    </main>
  )
  if (!data) return null

  const { summary, topProducts, topSellers, revenueByDay, revenueByCategory, recentOrders, previousPeriod } = data
  const sparkData   = revenueByDay.slice(-14).map(d=>d.revenue)
  const periodRev   = revenueByDay.reduce((s,d)=>s+d.revenue, 0)
  const maxProd     = topProducts[0]?.qty??1
  const maxSell     = topSellers[0]?.revenue??1
  const maxCat      = revenueByCategory[0]?.revenue??1

  const pagedOrders = recentOrders.slice((ordersPage-1)*PAGE_SIZE, ordersPage*PAGE_SIZE)
  const totalPages  = Math.ceil(recentOrders.length / PAGE_SIZE)

  const exportCSV = () => {
    const rows = [
      ['ID','Cliente','Vendedor','Items','Total','Estado','Fecha'],
      ...recentOrders.map(o=>[
        o.id.slice(0,8),
        o.user.name??o.user.email,
        o.seller?.name??'',
        String(o.itemCount),
        String(o.totalAmount),
        o.status,
        new Date(o.createdAt).toLocaleDateString('es-AR'),
      ])
    ]
    const csv  = rows.map(r=>r.map(c=>`"${c}"`).join(',')).join('\n')
    const blob = new Blob(['﻿'+csv],{type:'text/csv;charset=utf-8'})
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a'); a.href=url
    a.download = `ordenes-${new Date().toISOString().slice(0,10)}.csv`
    a.click(); URL.revokeObjectURL(url)
  }

  const presetLabel = PRESETS.find(p=>p.key===preset)?.label??''

  return (
    <main className="max-w-screen-xl mx-auto px-4 md:px-8 py-lg space-y-8 bg-background min-h-screen">

      {/* Global keyframes */}
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

      {/* ── Header ───────────────────────────────────────── */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2"
            style={{ background: tc.primaryBg, border: `1px solid ${tc.primaryBorder}`, color: tc.primary }}>
            <span className="material-symbols-outlined text-sm">bar_chart</span>
            Analytics
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white font-['Plus_Jakarta_Sans']">
            Panel de{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3af4ff] via-[#a855f7] to-[#4ade80]">
              Analytics
            </span>
          </h1>
          <p className="text-white/40 text-sm mt-1">
            {(() => {
              const { from, to } = getRangeParams(preset, customFrom, customTo)
              const fmt = (s:string) => new Date(s+'T12:00:00').toLocaleDateString('es-AR',{day:'numeric',month:'short'})
              if (preset==='today') return `Hoy · ${fmt(from)}`
              return `${fmt(from)} → ${fmt(to)}`
            })()}
          </p>
        </div>

        {/* ── Date filter ──────────────────────────────────── */}
        <div className="flex flex-col gap-2 items-stretch sm:items-end w-full sm:w-auto">
          <div className="flex flex-wrap gap-1 rounded-xl p-1"
            style={{ background: tc.cardBg, border: `1px solid ${tc.cardBorder}` }}>
            {PRESETS.map(p=>{
              const isActive = preset === p.key
              return (
                <button key={p.key} onClick={()=>setPreset(p.key)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all whitespace-nowrap flex-1 sm:flex-none justify-center sm:justify-start"
                  style={isActive
                    ? { background: tc.isDark ? 'rgba(58,244,255,0.12)' : '#1f2937',
                        color:      tc.isDark ? '#3af4ff' : '#ffffff',
                        border:     `1px solid ${tc.isDark ? 'rgba(58,244,255,0.25)' : 'transparent'}` }
                    : { color:  tc.isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.5)',
                        border: '1px solid transparent' }
                  }>
                  <span className="material-symbols-outlined text-sm">{p.icon}</span>
                  <span className="hidden xs:inline sm:inline">{p.label}</span>
                </button>
              )
            })}
          </div>
          {preset==='custom' && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
              <input type="date" value={customFrom} onChange={e=>setCustomFrom(e.target.value)}
                className="rounded-lg px-3 py-1.5 text-xs cursor-pointer focus:outline-none transition-colors w-full sm:w-auto"
                style={{ background: tc.cardBg, border: `1px solid ${tc.cardBorder}`,
                  color: tc.isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
                  colorScheme: tc.isDark ? 'dark' : 'light' }}/>
              <span className="text-on-surface-variant text-sm font-light text-center">→</span>
              <input type="date" value={customTo} onChange={e=>setCustomTo(e.target.value)}
                className="rounded-lg px-3 py-1.5 text-xs cursor-pointer focus:outline-none transition-colors w-full sm:w-auto"
                style={{ background: tc.cardBg, border: `1px solid ${tc.cardBorder}`,
                  color: tc.isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
                  colorScheme: tc.isDark ? 'dark' : 'light' }}/>
            </div>
          )}
        </div>
      </div>

      {/* ── KPI Cards ────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon="payments"     label="Ingresos totales"   value={ARS(revCount)}    sub={`Prom. ${ARS(summary.avgOrderValue)}`} color="#4ade80" sparkData={sparkData} delay={0}   trend={calcTrend(summary.totalRevenue, previousPeriod.totalRevenue)}/>
        <KpiCard icon="receipt_long" label="Órdenes totales"    value={String(ordCount)} sub={`${summary.paidOrders} pagadas`}       color="#ff4a8d" sparkData={revenueByDay.slice(-14).map(d=>d.orders)} delay={100} trend={calcTrend(summary.totalOrders, previousPeriod.totalOrders)}/>
        <KpiCard icon="inventory_2"  label="Productos"          value={String(prodCount)}                                            color="#3af4ff" delay={200}/>
        <KpiCard icon="storefront"   label="Vendedores activos" value={String(sellCount)}                                            color="#a855f7" delay={300}/>
      </div>

      {/* ── Revenue chart + Donut ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2 admin-card-bg border border-white/6 rounded-2xl p-5">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="font-bold text-white font-['Plus_Jakarta_Sans'] text-base">Ingresos del período</h2>
              <p className="text-xs text-white/40 mt-0.5">
                <span className="font-semibold" style={{color:'#4ade80'}}>{ARS(periodRev)}</span>
                {' '}· {presetLabel}
              </p>
            </div>
          </div>
          <AreaChart days={revenueByDay} color="#4ade80" gradId="rev-grad"/>
          {revenueByDay.length > 1 && (() => {
            const n = revenueByDay.length
            const step = n<=7?1:n<=14?2:n<=21?3:n<=35?5:Math.ceil(n/5)
            return (
              <div className="relative h-4 mt-2 px-1">
                {revenueByDay.map((d,i)=>{
                  if(i%step!==0&&i!==n-1) return null
                  const pct=(i/(n-1))*100
                  return (
                    <span key={i} className="absolute text-[9px] text-white/25 whitespace-nowrap"
                      style={{left:i===n-1?'auto':`${pct}%`,right:i===n-1?'0':'auto',transform:i===0||i===n-1?'none':'translateX(-50%)'}}>
                      {new Date(d.date+'T12:00:00').toLocaleDateString('es-AR',{day:'numeric',month:'short'})}
                    </span>
                  )
                })}
              </div>
            )
          })()}
        </div>

        <div className="admin-card-bg border border-white/6 rounded-2xl p-5">
          <h2 className="font-bold text-white font-['Plus_Jakarta_Sans'] text-base mb-5">Estado de órdenes</h2>
          <DonutChart paid={summary.paidOrders} pending={summary.pendingOrders} cancelled={summary.cancelledOrders}/>
          <div className="mt-5 pt-4 border-t border-white/6 grid grid-cols-2 gap-3">
            {[
              {label:'Enviadas',  val:summary.totalOrders-summary.pendingOrders-summary.cancelledOrders, color:'#818cf8'},
              {label:'Canceladas',val:summary.cancelledOrders, color:'#f87171'},
            ].map(s=>(
              <div key={s.label} className="rounded-xl border border-white/5 p-2.5 text-center" style={{background:`${s.color}08`}}>
                <p className="text-lg font-black" style={{color:s.color}}>{s.val}</p>
                <p className="text-[10px] text-white/30 uppercase tracking-wide mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Top Products + Subcategories ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2 admin-card-bg border border-white/6 rounded-2xl p-5">
          <h2 className="font-bold text-white font-['Plus_Jakarta_Sans'] text-base mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-base" style={{color:'#4ade80'}}>trending_up</span>
            Productos más vendidos
          </h2>
          {topProducts.length===0
            ? <div className="py-12 flex flex-col items-center gap-2 text-white/20"><span className="material-symbols-outlined text-4xl">inventory_2</span><p className="text-sm">Sin ventas en este período</p></div>
            : <div className="space-y-3.5">
              {topProducts.map((p,i)=>(
                <div key={p.id} className="flex items-center gap-3">
                  <div className={`w-6 text-center flex-shrink-0 text-xs font-black ${i===0?'text-yellow-400':i===1?'text-slate-300':i===2?'text-orange-400':'text-white/15'}`}>
                    {i===0?'🥇':i===1?'🥈':i===2?'🥉':`#${i+1}`}
                  </div>
                  <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-white/5 border border-white/8">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover"/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{p.name}</p>
                    <p className="text-[10px] text-white/30 truncate">{p.category}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <AnimBar value={p.qty} max={maxProd} color="#4ade80" delay={i*80}/>
                      <span className="text-[11px] text-white/35 flex-shrink-0 w-14 text-right">{p.qty} uds.</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold flex-shrink-0 w-20 text-right tabular-nums" style={{color:'#4ade80'}}>{ARS(p.revenue)}</span>
                </div>
              ))}
            </div>
          }
        </div>

        <div className="admin-card-bg border border-white/6 rounded-2xl p-5">
          <h2 className="font-bold text-white font-['Plus_Jakarta_Sans'] text-base mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#3af4ff] text-base">category</span>
            Por subcategoría
          </h2>
          {revenueByCategory.length===0
            ? <div className="py-12 flex flex-col items-center gap-2 text-white/20"><span className="material-symbols-outlined text-4xl">category</span><p className="text-sm">Sin datos</p></div>
            : <div className="space-y-4">
              {revenueByCategory.slice(0,7).map(({category,revenue},i)=>(
                <div key={category}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-white/70 font-medium capitalize">{category}</span>
                    <span className="text-white/35 tabular-nums">{ARS(revenue)}</span>
                  </div>
                  <AnimBar value={revenue} max={maxCat} color="#3af4ff" delay={i*60}/>
                </div>
              ))}
            </div>
          }
        </div>
      </div>

      {/* ── Seller Ranking ────────────────────────────────── */}
      <div className="admin-card-bg border border-white/6 rounded-2xl p-5">
        <h2 className="font-bold text-white font-['Plus_Jakarta_Sans'] text-base mb-5 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#ff4a8d] text-base">emoji_events</span>
          Ranking de vendedores
        </h2>
        {topSellers.length===0
          ? <div className="py-8 text-center text-white/20 text-sm">Sin vendedores</div>
          : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {topSellers.map((s,i)=>{
              const medal = i===0
                ? {ring:'ring-yellow-400/40', bg:'bg-yellow-400/8',  num:'text-yellow-400', label:'#1'}
                : i===1
                ? {ring:'ring-slate-400/30',  bg:'bg-slate-400/5',   num:'text-slate-300',  label:'#2'}
                : {ring:'ring-orange-500/30', bg:'bg-orange-500/5',  num:'text-orange-400', label:`#${i+1}`}
              return (
                <div key={s.id} className={`relative rounded-xl p-4 border border-white/6 ring-1 ${medal.ring} ${medal.bg}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="relative flex-shrink-0">
                      {s.avatar
                        ? <img src={s.avatar} alt={s.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-white/10"/>
                        : <div className="w-12 h-12 rounded-full bg-purple-600/30 border border-purple-500/30 flex items-center justify-center text-white font-bold text-lg">{s.name.charAt(0)}</div>
                      }
                      <span className={`absolute -bottom-1 -right-1 text-xs font-black ${medal.num}`}>{medal.label}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-white truncate">{s.name}</p>
                      <p className="text-xs text-white/35">{s.orderCount} venta{s.orderCount!==1?'s':''}</p>
                    </div>
                  </div>
                  <div>
                    <AnimBar value={s.revenue} max={maxSell} color="#ff4a8d" delay={i*100}/>
                    <p className="font-bold text-sm mt-1.5 tabular-nums" style={{color:'#ff4a8d'}}>{ARS(s.revenue)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        }
      </div>

      {/* ── Recent Orders ─────────────────────────────────── */}
      <div className="admin-card-bg border border-white/6 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-white font-['Plus_Jakarta_Sans'] text-base flex items-center gap-2">
            <span className="material-symbols-outlined text-white/30 text-base">receipt_long</span>
            Órdenes recientes
            <span className="text-[10px] bg-white/6 border border-white/10 rounded-full px-2 py-0.5 text-white/40 font-normal">{recentOrders.length}</span>
          </h2>
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#4ade80]/10 border border-[#4ade80]/20 text-[#4ade80] text-xs font-bold hover:bg-[#4ade80]/20 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            Exportar CSV
          </button>
        </div>
        {recentOrders.length===0
          ? <div className="py-10 text-center text-white/20 text-sm">Sin órdenes en este período</div>
          : <>
            <div className="overflow-x-auto -mx-5 px-5">
              <table className="w-full text-sm min-w-[640px]">
                <thead>
                  <tr className="border-b border-white/6">
                    {['#','Cliente','Vendedor','Items','Total','Estado','Fecha'].map(h=>(
                      <th key={h} className="pb-3 pr-4 text-left text-[10px] text-white/25 font-semibold uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pagedOrders.map(o=>{
                    const st=STATUS_MAP[o.status]??{label:o.status,dot:'bg-white/20',badge:'bg-white/5 text-white/30 border-white/10'}
                    return (
                      <tr key={o.id} className="border-b border-white/4 hover:bg-white/2 transition-colors group">
                        <td className="py-3 pr-4 text-[11px] text-white/20 font-mono group-hover:text-white/40 transition-colors">{o.id.slice(0,8)}</td>
                        <td className="py-3 pr-4"><p className="font-medium text-white/80 truncate max-w-[130px]">{o.user.name??o.user.email}</p></td>
                        <td className="py-3 pr-4 text-white/40 text-xs">{o.seller?.name??'—'}</td>
                        <td className="py-3 pr-4 text-center text-white/40 text-xs">{o.itemCount}</td>
                        <td className="py-3 pr-4 font-bold text-xs tabular-nums" style={{color:'#4ade80'}}>{ARS(o.totalAmount)}</td>
                        <td className="py-3 pr-4">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${st.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`}/>
                            {st.label}
                          </span>
                        </td>
                        <td className="py-3 text-[11px] text-white/30 whitespace-nowrap">
                          {new Date(o.createdAt).toLocaleDateString('es-AR',{day:'2-digit',month:'2-digit',year:'2-digit'})}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/6">
                <span className="text-xs text-white/30">
                  Mostrando {(ordersPage-1)*PAGE_SIZE+1}–{Math.min(ordersPage*PAGE_SIZE, recentOrders.length)} de {recentOrders.length}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={()=>setOrdersPage(p=>Math.max(1,p-1))}
                    disabled={ordersPage===1}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/10 text-white/40 hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all"
                  >
                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                    Ant.
                  </button>
                  <div className="flex gap-1">
                    {Array.from({length:totalPages},(_,i)=>i+1).map(p=>(
                      <button key={p} onClick={()=>setOrdersPage(p)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold cursor-pointer transition-all
                          ${p===ordersPage
                            ? 'bg-[#3af4ff]/15 text-[#3af4ff] border border-[#3af4ff]/30'
                            : 'text-white/30 hover:text-white/60 border border-transparent hover:border-white/10'}`}>
                        {p}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={()=>setOrdersPage(p=>Math.min(totalPages,p+1))}
                    disabled={ordersPage===totalPages}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/10 text-white/40 hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all"
                  >
                    Sig.
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </button>
                </div>
              </div>
            )}
          </>
        }
      </div>


    </main>
  )
}
