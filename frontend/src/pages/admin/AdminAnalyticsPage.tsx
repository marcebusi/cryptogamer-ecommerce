import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../lib/api'

interface Summary {
  totalRevenue: number
  totalOrders: number
  avgOrderValue: number
  pendingOrders: number
  paidOrders: number
  cancelledOrders: number
  totalSellers: number
  totalProducts: number
}

interface TopProduct {
  id: string
  name: string
  image: string
  category: string
  price: number
  qty: number
  revenue: number
}

interface TopSeller {
  id: string
  name: string
  avatar: string
  orderCount: number
  revenue: number
}

interface DayRevenue {
  date: string
  revenue: number
  orders: number
}

interface CategoryRevenue {
  category: string
  revenue: number
}

interface RecentOrder {
  id: string
  status: string
  totalAmount: number
  createdAt: string
  user: { name: string | null; email: string }
  seller: { id: string; name: string } | null
  itemCount: number
}

interface Analytics {
  summary: Summary
  topProducts: TopProduct[]
  topSellers: TopSeller[]
  revenueByDay: DayRevenue[]
  revenueByCategory: CategoryRevenue[]
  recentOrders: RecentOrder[]
}

const fmt = (n: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)

const statusLabel: Record<string, { label: string; color: string }> = {
  PENDING:   { label: 'Pendiente',  color: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20' },
  PAID:      { label: 'Pagado',     color: 'bg-green-500/15 text-green-400 border-green-500/20' },
  SHIPPED:   { label: 'Enviado',    color: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
  DELIVERED: { label: 'Entregado',  color: 'bg-purple-500/15 text-purple-400 border-purple-500/20' },
  CANCELLED: { label: 'Cancelado',  color: 'bg-red-500/15 text-red-400 border-red-500/20' },
}

function StatCard({ icon, label, value, sub, color }: { icon: string; label: string; value: string; sub?: string; color: string }) {
  return (
    <div className={`relative rounded-2xl border bg-surface-container p-5 overflow-hidden ${color}`}>
      <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-10 blur-2xl bg-current pointer-events-none" />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold mb-1">{label}</p>
          <p className="text-2xl font-black text-on-surface font-['Plus_Jakarta_Sans']">{value}</p>
          {sub && <p className="text-xs text-on-surface-variant mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border bg-current/10`}>
          <span className="material-symbols-outlined text-lg">{icon}</span>
        </div>
      </div>
    </div>
  )
}

function MiniBar({ value, max, color = 'bg-primary-container' }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
    </div>
  )
}

export default function AdminAnalyticsPage() {
  const { isAdmin, isLoading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [data, setData]       = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [range, setRange]     = useState<7 | 30>(30)

  useEffect(() => {
    if (!authLoading && !isAdmin) navigate('/')
  }, [authLoading, isAdmin, navigate])

  useEffect(() => {
    if (!isAdmin) return
    setLoading(true)
    api.get('/api/admin/analytics')
      .then(res => setData(res.data))
      .catch(() => setError('Error al cargar analytics'))
      .finally(() => setLoading(false))
  }, [isAdmin])

  if (authLoading || loading) return (
    <main className="max-w-screen-xl mx-auto px-4 md:px-8 py-lg">
      <div className="flex items-center gap-3 text-on-surface-variant py-xl justify-center">
        <span className="material-symbols-outlined animate-spin">progress_activity</span>
        Cargando analytics...
      </div>
    </main>
  )

  if (error || !data) return (
    <main className="max-w-screen-xl mx-auto px-4 md:px-8 py-lg">
      <p className="text-error">{error || 'Sin datos'}</p>
    </main>
  )

  const { summary, topProducts, topSellers, revenueByDay, revenueByCategory, recentOrders } = data
  const days = revenueByDay.slice(range === 7 ? -7 : 0)
  const maxDayRevenue = Math.max(...days.map(d => d.revenue), 1)
  const maxProductQty = topProducts[0]?.qty ?? 1
  const maxSellerRev  = topSellers[0]?.revenue ?? 1
  const maxCatRev     = revenueByCategory[0]?.revenue ?? 1

  return (
    <main className="max-w-screen-xl mx-auto px-4 md:px-8 py-lg space-y-xl">

      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-xs px-sm py-1 rounded-full bg-tertiary-container/15 border border-tertiary-container/25 text-tertiary-container text-xs font-bold uppercase tracking-widest mb-sm">
          <span className="material-symbols-outlined text-sm">bar_chart</span>
          Analytics
        </div>
        <h1 className="text-3xl font-black text-on-background font-['Plus_Jakarta_Sans'] mb-1">
          Panel de{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-tertiary-container to-primary-container">
            Analytics
          </span>
        </h1>
        <p className="text-on-surface-variant text-sm">Métricas de ventas, productos y vendedores en tiempo real.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="payments" label="Ingresos totales" value={fmt(summary.totalRevenue)} color="border-primary-container/20" />
        <StatCard icon="receipt_long" label="Total órdenes" value={String(summary.totalOrders)} sub={`Promedio ${fmt(summary.avgOrderValue)}`} color="border-secondary-container/20" />
        <StatCard icon="inventory_2" label="Productos" value={String(summary.totalProducts)} color="border-tertiary-container/20" />
        <StatCard icon="group" label="Vendedores" value={String(summary.totalSellers)} color="border-outline-variant" />
      </div>

      {/* Order status row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Pendientes', value: summary.pendingOrders,  color: 'text-yellow-400', bar: 'bg-yellow-400' },
          { label: 'Pagados',    value: summary.paidOrders,     color: 'text-green-400',  bar: 'bg-green-400'  },
          { label: 'Cancelados', value: summary.cancelledOrders, color: 'text-red-400',   bar: 'bg-red-400'    },
        ].map(({ label, value, color, bar }) => (
          <div key={label} className="bg-surface-container border border-white/8 rounded-xl px-4 py-3 flex items-center gap-3">
            <div className={`w-2.5 h-2.5 rounded-full ${bar} flex-shrink-0`} />
            <div>
              <p className="text-xs text-on-surface-variant">{label}</p>
              <p className={`text-xl font-black ${color} font-['Plus_Jakarta_Sans']`}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue chart + Category */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue by day */}
        <div className="lg:col-span-2 bg-surface-container border border-white/8 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-on-surface font-['Plus_Jakarta_Sans']">Ingresos diarios</h2>
            <div className="flex gap-1">
              {([7, 30] as const).map(r => (
                <button key={r} onClick={() => setRange(r)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${range === r ? 'bg-primary-container/20 text-primary-container border border-primary-container/30' : 'text-on-surface-variant hover:bg-white/5'}`}>
                  {r}d
                </button>
              ))}
            </div>
          </div>
          {/* Bar chart */}
          <div className="flex items-end gap-0.5 h-32">
            {days.map(d => {
              const h = maxDayRevenue > 0 ? Math.max(Math.round((d.revenue / maxDayRevenue) * 100), d.revenue > 0 ? 4 : 0) : 0
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div
                    className="w-full rounded-t-sm bg-primary-container/30 group-hover:bg-primary-container/60 transition-colors"
                    style={{ height: `${h}%`, minHeight: d.revenue > 0 ? '4px' : '0' }}
                  />
                  {/* Tooltip */}
                  {d.revenue > 0 && (
                    <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-[#111318] border border-white/10 rounded-lg px-2 py-1 text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                      {fmt(d.revenue)}<br />
                      <span className="text-white/40">{d.orders} orden{d.orders !== 1 ? 'es' : ''}</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-on-surface-variant/50">
            <span>{days[0]?.date.slice(5)}</span>
            <span>{days[Math.floor(days.length / 2)]?.date.slice(5)}</span>
            <span>{days[days.length - 1]?.date.slice(5)}</span>
          </div>
        </div>

        {/* Revenue by category */}
        <div className="bg-surface-container border border-white/8 rounded-2xl p-5">
          <h2 className="font-bold text-on-surface font-['Plus_Jakarta_Sans'] mb-4">Por categoría</h2>
          {revenueByCategory.length === 0 ? (
            <p className="text-sm text-on-surface-variant text-center py-8">Sin datos</p>
          ) : (
            <div className="space-y-3">
              {revenueByCategory.slice(0, 6).map(({ category, revenue }) => (
                <div key={category}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-on-surface font-medium capitalize">{category}</span>
                    <span className="text-on-surface-variant">{fmt(revenue)}</span>
                  </div>
                  <MiniBar value={revenue} max={maxCatRev} color="bg-tertiary-container" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top products + Top sellers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Top products */}
        <div className="bg-surface-container border border-white/8 rounded-2xl p-5">
          <h2 className="font-bold text-on-surface font-['Plus_Jakarta_Sans'] mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-container text-base">trending_up</span>
            Productos más vendidos
          </h2>
          {topProducts.length === 0 ? (
            <p className="text-sm text-on-surface-variant text-center py-8">Sin ventas registradas</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3 group">
                  <span className={`text-xs font-black w-5 text-center flex-shrink-0 ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-white/40' : i === 2 ? 'text-orange-400/60' : 'text-white/20'}`}>
                    #{i + 1}
                  </span>
                  <img src={p.image} alt={p.name} className="w-9 h-9 rounded-lg object-cover flex-shrink-0 bg-white/5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-on-surface truncate">{p.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <MiniBar value={p.qty} max={maxProductQty} />
                      <span className="text-xs text-on-surface-variant flex-shrink-0">{p.qty} uds</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-primary-container flex-shrink-0">{fmt(p.revenue)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top sellers */}
        <div className="bg-surface-container border border-white/8 rounded-2xl p-5">
          <h2 className="font-bold text-on-surface font-['Plus_Jakarta_Sans'] mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary-container text-base">emoji_events</span>
            Ranking de vendedores
          </h2>
          {topSellers.length === 0 ? (
            <p className="text-sm text-on-surface-variant text-center py-8">Sin vendedores registrados</p>
          ) : (
            <div className="space-y-3">
              {topSellers.map((s, i) => (
                <div key={s.id} className="flex items-center gap-3">
                  <span className={`text-xs font-black w-5 text-center flex-shrink-0 ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-white/40' : i === 2 ? 'text-orange-400/60' : 'text-white/20'}`}>
                    #{i + 1}
                  </span>
                  {s.avatar
                    ? <img src={s.avatar} alt={s.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                    : <div className="w-9 h-9 rounded-full bg-purple-600/40 flex items-center justify-center flex-shrink-0 text-white text-sm font-bold">{s.name.charAt(0)}</div>
                  }
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-on-surface truncate">{s.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <MiniBar value={s.revenue} max={maxSellerRev} color="bg-secondary-container" />
                      <span className="text-xs text-on-surface-variant flex-shrink-0">{s.orderCount} venta{s.orderCount !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-secondary-container flex-shrink-0">{fmt(s.revenue)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-surface-container border border-white/8 rounded-2xl p-5">
        <h2 className="font-bold text-on-surface font-['Plus_Jakarta_Sans'] mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-on-surface-variant text-base">history</span>
          Órdenes recientes
        </h2>
        {recentOrders.length === 0 ? (
          <p className="text-sm text-on-surface-variant text-center py-8">Sin órdenes</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-white/8">
                  <th className="pb-2 text-xs text-on-surface-variant font-semibold uppercase tracking-wider">ID</th>
                  <th className="pb-2 text-xs text-on-surface-variant font-semibold uppercase tracking-wider">Cliente</th>
                  <th className="pb-2 text-xs text-on-surface-variant font-semibold uppercase tracking-wider">Vendedor</th>
                  <th className="pb-2 text-xs text-on-surface-variant font-semibold uppercase tracking-wider">Items</th>
                  <th className="pb-2 text-xs text-on-surface-variant font-semibold uppercase tracking-wider">Total</th>
                  <th className="pb-2 text-xs text-on-surface-variant font-semibold uppercase tracking-wider">Estado</th>
                  <th className="pb-2 text-xs text-on-surface-variant font-semibold uppercase tracking-wider">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentOrders.map(o => {
                  const st = statusLabel[o.status] ?? { label: o.status, color: 'bg-white/10 text-white/50 border-white/10' }
                  return (
                    <tr key={o.id} className="hover:bg-white/3 transition-colors">
                      <td className="py-2.5 pr-3 text-xs text-on-surface-variant font-mono">{o.id.slice(0, 8)}…</td>
                      <td className="py-2.5 pr-3">
                        <p className="font-medium text-on-surface truncate max-w-[120px]">{o.user.name ?? o.user.email}</p>
                      </td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{o.seller?.name ?? <span className="text-white/20">—</span>}</td>
                      <td className="py-2.5 pr-3 text-center text-on-surface-variant">{o.itemCount}</td>
                      <td className="py-2.5 pr-3 font-semibold text-primary-container">{fmt(o.totalAmount)}</td>
                      <td className="py-2.5 pr-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${st.color}`}>{st.label}</span>
                      </td>
                      <td className="py-2.5 text-xs text-on-surface-variant whitespace-nowrap">
                        {new Date(o.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}
