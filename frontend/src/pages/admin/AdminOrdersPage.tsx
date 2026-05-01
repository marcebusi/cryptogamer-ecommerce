import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../lib/api'

interface OrderItem {
  id: string
  quantity: number
  price: number
  product: { id: string; name: string; image: string } | null
}

interface Order {
  id: string
  status: string
  totalAmount: number
  createdAt: string
  user: { name: string | null; email: string }
  seller: { name: string } | null
  items: OrderItem[]
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING:   { label: 'Pendiente',  color: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
  COMPLETED: { label: 'Completado', color: 'bg-green-500/15 text-green-400 border-green-500/30'   },
  CANCELLED: { label: 'Cancelado',  color: 'bg-red-500/15 text-red-400 border-red-500/30'         },
}

const PAGE_SIZE = 10

export default function AdminOrdersPage() {
  const { isAdmin, isLoading } = useAuth()
  const navigate = useNavigate()

  const [orders,   setOrders]   = useState<Order[]>([])
  const [loading,  setLoading]  = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [filter,   setFilter]   = useState<string>('ALL')
  const [page,     setPage]     = useState(1)

  useEffect(() => {
    if (!isLoading && !isAdmin) navigate('/')
  }, [isLoading, isAdmin, navigate])

  useEffect(() => {
    api.get<Order[]>('/api/admin/orders')
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Reset to page 1 when filter changes
  useEffect(() => { setPage(1) }, [filter])

  const filtered   = filter === 'ALL' ? orders : orders.filter(o => o.status === filter)
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const totals = {
    all:       orders.length,
    pending:   orders.filter(o => o.status === 'PENDING').length,
    completed: orders.filter(o => o.status === 'COMPLETED').length,
    cancelled: orders.filter(o => o.status === 'CANCELLED').length,
    revenue:   orders.filter(o => o.status === 'COMPLETED').reduce((s, o) => s + o.totalAmount, 0),
  }

  if (isLoading) return null

  return (
    <main className="max-w-screen-xl mx-auto px-4 md:px-8 py-lg">

      {/* Header */}
      <div className="flex items-center justify-between mb-lg">
        <div>
          <button onClick={() => navigate('/admin')} className="flex items-center gap-xs text-sm text-on-surface-variant hover:text-on-surface mb-sm cursor-pointer transition-colors">
            <span className="material-symbols-outlined text-sm">arrow_back</span>Volver al dashboard
          </button>
          <h1 className="text-2xl font-black text-on-background font-['Plus_Jakarta_Sans']">
            Pedidos <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-container to-tertiary-container">recibidos</span>
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">Historial completo de órdenes de la tienda</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-sm mb-lg">
        {[
          { label: 'Total órdenes', value: totals.all,       icon: 'receipt_long',    color: 'text-on-surface' },
          { label: 'Pendientes',    value: totals.pending,   icon: 'schedule',        color: 'text-yellow-400' },
          { label: 'Completadas',   value: totals.completed, icon: 'check_circle',    color: 'text-green-400'  },
          { label: 'Ingresos',      value: `$${totals.revenue.toFixed(2)}`, icon: 'payments', color: 'text-primary-container' },
        ].map(s => (
          <div key={s.label} className="bg-surface-container rounded-xl border border-white/10 p-sm">
            <span className={`material-symbols-outlined text-xl mb-xs block ${s.color}`}>{s.icon}</span>
            <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-on-surface-variant">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-xs mb-md flex-wrap">
        {[
          { key: 'ALL',       label: `Todos (${totals.all})`             },
          { key: 'PENDING',   label: `Pendientes (${totals.pending})`    },
          { key: 'COMPLETED', label: `Completados (${totals.completed})` },
          { key: 'CANCELLED', label: `Cancelados (${totals.cancelled})`  },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-sm py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
              filter === f.key
                ? 'bg-primary-container/20 text-primary-container border-primary-container/40'
                : 'bg-surface-container text-on-surface-variant border-white/10 hover:border-white/20'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Orders list */}
      {loading ? (
        <div className="space-y-sm">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-surface-container rounded-xl border border-white/10 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-2xl text-on-surface-variant">
          <span className="material-symbols-outlined text-5xl block mb-sm opacity-30">receipt_long</span>
          No hay pedidos{filter !== 'ALL' ? ' con este estado' : ''}.
        </div>
      ) : (
        <>
        <div className="space-y-sm">
          {paginated.map(order => {
            const st = STATUS_LABELS[order.status] ?? { label: order.status, color: 'bg-white/10 text-on-surface-variant border-white/10' }
            const isOpen = expanded === order.id
            return (
              <div key={order.id} className="bg-surface-container rounded-xl border border-white/10 overflow-hidden">
                {/* Row */}
                <button
                  onClick={() => setExpanded(isOpen ? null : order.id)}
                  className="w-full flex items-center gap-sm p-sm text-left hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-xs flex-wrap">
                      <span className="font-mono text-xs text-on-surface-variant">#{order.id.slice(-8).toUpperCase()}</span>
                      <span className={`text-[10px] font-bold px-xs py-0.5 rounded-full border ${st.color}`}>{st.label}</span>
                      {order.seller && (
                        <span className="text-[10px] text-on-surface-variant border border-white/10 px-xs py-0.5 rounded-full">
                          {order.seller.name}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-on-surface mt-0.5 truncate">
                      {order.user.name ?? order.user.email}
                    </p>
                    <p className="text-xs text-on-surface-variant">{order.user.email}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-base font-black text-primary-container">${order.totalAmount.toFixed(2)}</p>
                    <p className="text-xs text-on-surface-variant">
                      {new Date(order.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <span className={`material-symbols-outlined text-on-surface-variant text-sm transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </button>

                {/* Expanded items */}
                {isOpen && (
                  <div className="border-t border-white/10 p-sm space-y-xs bg-surface-container-high/30">
                    {order.items.map(item => (
                      <div key={item.id} className="flex items-center gap-sm">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface-container-high border border-white/10 flex-shrink-0">
                          {item.product?.image
                            ? <img src={item.product.image} alt={item.product?.name} className="w-full h-full object-cover" loading="lazy" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                            : <span className="material-symbols-outlined text-on-surface-variant m-auto block mt-2 text-sm">image_not_supported</span>
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-on-surface truncate">{item.product?.name ?? 'Producto eliminado'}</p>
                          <p className="text-xs text-on-surface-variant">x{item.quantity}</p>
                        </div>
                        <p className="text-sm font-semibold text-on-surface flex-shrink-0">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* ── Pagination ─────────────────────── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-md">
            <p className="text-xs text-on-surface-variant">
              Mostrando {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length} pedidos
            </p>
            <div className="flex items-center gap-xs">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 rounded-lg border border-outline-variant flex items-center justify-center text-on-surface-variant hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                .reduce<(number | '...')[]>((acc, n, idx, arr) => {
                  if (idx > 0 && n - (arr[idx - 1] as number) > 1) acc.push('...')
                  acc.push(n)
                  return acc
                }, [])
                .map((n, i) =>
                  n === '...'
                    ? <span key={`dots-${i}`} className="w-8 text-center text-xs text-on-surface-variant">…</span>
                    : <button
                        key={n}
                        onClick={() => setPage(n)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          page === n
                            ? 'bg-primary-container/20 text-primary-container border border-primary-container/40'
                            : 'border border-outline-variant text-on-surface-variant hover:bg-white/5'
                        }`}
                      >{n}</button>
                )}

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 rounded-lg border border-outline-variant flex items-center justify-center text-on-surface-variant hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        )}
        </>
      )}
    </main>
  )
}
