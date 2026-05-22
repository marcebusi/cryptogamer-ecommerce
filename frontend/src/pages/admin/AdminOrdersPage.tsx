import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useThemeColors } from '../../lib/themeColors'
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
  paymentMethod:  string | null
  comprovanteUrl: string | null
  trackingCode:   string | null
  shippingCarrier:    string | null
  shippingService:    string | null
  shippingCost:       number | null
  shippingAddress:    string | null
  shippingCity:       string | null
  shippingProvince:   string | null
  shippingPostalCode: string | null
  customerName:  string | null
  customerEmail: string | null
  customerPhone: string | null
  user:   { name: string | null; email: string }
  seller: { name: string } | null
  items:  OrderItem[]
}

/* ── Status config ──────────────────────────────── */
const STATUS_CFG: Record<string, { label: string; color: string; icon: string }> = {
  PENDING:    { label: 'Pendiente',       color: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',  icon: 'schedule'           },
  CONFIRMED:  { label: 'Pago confirmado', color: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',        icon: 'check_circle'       },
  PROCESSING: { label: 'En preparación', color: 'bg-orange-500/15 text-orange-400 border-orange-500/30',  icon: 'inventory_2'        },
  SHIPPED:    { label: 'Enviado',         color: 'bg-blue-500/15 text-blue-400 border-blue-500/30',        icon: 'local_shipping'     },
  COMPLETED:  { label: 'Completado',      color: 'bg-green-500/15 text-green-400 border-green-500/30',     icon: 'check_circle'       },
  CANCELLED:  { label: 'Cancelado',       color: 'bg-red-500/15 text-red-400 border-red-500/30',           icon: 'cancel'             },
}

const STATUS_FLOW = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'COMPLETED']

/* ── Payment method config ───────────────────────── */
const PAY_CFG: Record<string, { label: string; icon: string; color: string }> = {
  transfer:    { label: 'Transferencia', icon: 'fa-solid fa-building-columns', color: '#3af4ff' },
  usdt:        { label: 'USDT Crypto',   icon: 'fa-brands fa-ethereum',        color: '#26a17b' },
  cash:        { label: 'Efectivo',      icon: 'fa-solid fa-money-bill-wave',  color: '#a855f7' },
  mercadopago: { label: 'MercadoPago',   icon: 'fa-solid fa-credit-card',      color: '#39ff14' },
}

const ARS = (n: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)

const PAGE_SIZE = 15

export default function AdminOrdersPage() {
  const tc = useThemeColors()
  const { isAdmin, isLoading } = useAuth()
  const navigate = useNavigate()

  const [orders,      setOrders]      = useState<Order[]>([])
  const [loading,     setLoading]     = useState(true)
  const [expanded,    setExpanded]    = useState<string | null>(null)
  const [filter,      setFilter]      = useState('ALL')
  const [page,        setPage]        = useState(1)
  const [updating,    setUpdating]    = useState<string | null>(null)
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({})
  const [savingTracking, setSavingTracking] = useState<string | null>(null)

  useEffect(() => { if (!isLoading && !isAdmin) navigate('/') }, [isLoading, isAdmin, navigate])

  const load = () => {
    api.get<Order[]>('/api/admin/orders')
      .then(setOrders).catch(() => {}).finally(() => setLoading(false))
  }
  useEffect(load, [])
  useEffect(() => { setPage(1) }, [filter])
  // Pre-fill tracking inputs with existing codes
  useEffect(() => {
    const init: Record<string, string> = {}
    orders.forEach(o => { if (o.trackingCode) init[o.id] = o.trackingCode })
    setTrackingInputs(init)
  }, [orders])

  const filtered   = filter === 'ALL' ? orders : orders.filter(o => o.status === filter)
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const totals = {
    all:       orders.length,
    pending:   orders.filter(o => o.status === 'PENDING').length,
    confirmed: orders.filter(o => o.status === 'CONFIRMED').length,
    processing:orders.filter(o => o.status === 'PROCESSING').length,
    shipped:   orders.filter(o => o.status === 'SHIPPED').length,
    completed: orders.filter(o => o.status === 'COMPLETED').length,
    cancelled: orders.filter(o => o.status === 'CANCELLED').length,
    revenue:   orders.filter(o => o.status === 'COMPLETED').reduce((s, o) => s + o.totalAmount, 0),
  }

  const saveTrackingCode = async (orderId: string) => {
    const code = (trackingInputs[orderId] ?? '').trim()
    setSavingTracking(orderId)
    try {
      await api.patch(`/api/admin/orders/${orderId}/trackingCode`, { trackingCode: code })
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, trackingCode: code || null } : o))
    } catch {
      alert('Error al guardar el código de seguimiento')
    } finally {
      setSavingTracking(null)
    }
  }

  const changeStatus = async (orderId: string, newStatus: string) => {
    setUpdating(orderId)
    try {
      await api.patch(`/api/admin/orders/${orderId}/status`, { status: newStatus })
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
    } catch (e) {
      alert('Error al actualizar estado')
    } finally {
      setUpdating(null)
    }
  }

  if (isLoading) return null

  return (
    <main className="max-w-screen-xl mx-auto px-4 md:px-8 py-lg">

      {/* Header */}
      <div className="flex items-center justify-between mb-lg flex-wrap gap-sm">
        <div>
          <button onClick={() => navigate('/admin')}
            className="flex items-center gap-xs text-sm text-on-surface-variant hover:text-on-surface mb-sm cursor-pointer transition-colors">
            <span className="material-symbols-outlined text-sm">arrow_back</span>Volver al dashboard
          </button>
          <h1 className="text-2xl font-black text-on-background font-['Plus_Jakarta_Sans']">
            Pedidos <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-container to-tertiary-container">recibidos</span>
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">Gestión de órdenes, pagos y envíos</p>
        </div>
        <button onClick={load}
          className="flex items-center gap-xs px-sm py-xs rounded-xl text-sm text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer"
          style={{ border: `1px solid ${tc.cardBorder}` }}>
          <span className="material-symbols-outlined text-sm">refresh</span>Actualizar
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-sm mb-lg">
        {[
          { label: 'Total',       value: totals.all,                            icon: 'receipt_long', color: 'text-on-surface' },
          { label: 'Pendientes',  value: totals.pending + totals.confirmed,     icon: 'schedule',     color: 'text-yellow-400' },
          { label: 'En camino',   value: totals.processing + totals.shipped,    icon: 'local_shipping',color:'text-blue-400'   },
          { label: 'Ingresos',    value: ARS(totals.revenue),                   icon: 'payments',     color: 'text-primary-container' },
        ].map(s => (
          <div key={s.label} className="bg-surface-container rounded-xl border border-outline-variant/20 p-sm">
            <span className={`material-symbols-outlined text-xl mb-xs block ${s.color}`}>{s.icon}</span>
            <p className={`text-lg font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-on-surface-variant">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-xs mb-md flex-wrap">
        {[
          { key: 'ALL',       label: `Todos (${totals.all})`                },
          { key: 'PENDING',   label: `Pendientes (${totals.pending})`       },
          { key: 'CONFIRMED', label: `Confirmados (${totals.confirmed})`    },
          { key: 'PROCESSING',label: `Preparación (${totals.processing})`   },
          { key: 'SHIPPED',   label: `Enviados (${totals.shipped})`         },
          { key: 'COMPLETED', label: `Completados (${totals.completed})`    },
          { key: 'CANCELLED', label: `Cancelados (${totals.cancelled})`     },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-sm py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
              filter === f.key
                ? 'bg-primary-container/20 text-primary-container border-primary-container/40'
                : 'bg-surface-container text-on-surface-variant border-outline-variant/30 hover:border-outline-variant/60'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Orders list */}
      {loading ? (
        <div className="space-y-sm">
          {[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-surface-container rounded-xl border border-white/10 animate-pulse" />)}
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
              const st     = STATUS_CFG[order.status] ?? { label: order.status, color: 'bg-white/10 text-on-surface-variant border-white/10', icon: 'help' }
              const pay    = order.paymentMethod ? PAY_CFG[order.paymentMethod] : null
              const isOpen = expanded === order.id
              const orderNum = `CG-${order.id.slice(-6).toUpperCase()}`

              return (
                <div key={order.id} className="bg-surface-container rounded-xl border border-outline-variant/20 overflow-hidden">

                  {/* ── Summary row ── */}
                  <button onClick={() => setExpanded(isOpen ? null : order.id)}
                    className="w-full flex items-center gap-sm p-sm text-left transition-colors cursor-pointer hover:bg-surface-container-high/50">

                    {/* Left: order info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-xs flex-wrap mb-0.5">
                        <span className="font-mono text-xs font-bold text-on-surface-variant">{orderNum}</span>
                        <span className={`text-[10px] font-bold px-xs py-0.5 rounded-full border flex items-center gap-0.5 ${st.color}`}>
                          <span className="material-symbols-outlined text-[11px]">{st.icon}</span>
                          {st.label}
                        </span>
                        {pay && (
                          <span className="text-[10px] font-bold px-xs py-0.5 rounded-full flex items-center gap-1 text-on-surface-variant"
                            style={{ border: `1px solid ${tc.cardBorder}`, background: tc.cardBg }}>
                            <i className={`${pay.icon} text-[9px]`}
                              style={{ color: tc.isDark ? pay.color : '#6b7280' }} />
                            {pay.label}
                          </span>
                        )}
                        {order.comprovanteUrl && (
                          <span className="text-[10px] font-bold px-xs py-0.5 rounded-full flex items-center gap-1"
                            style={{ border: `1px solid ${tc.cyanBorder}`, background: tc.cyanBg, color: tc.cyan }}>
                            <i className="fa-solid fa-paperclip text-[9px]" /> Comprobante
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-on-surface truncate">
                        {order.customerName ?? order.user.name ?? order.user.email}
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        {order.customerEmail ?? order.user.email}
                        {order.seller && <span className="ml-2 text-on-surface-variant">· {order.seller.name}</span>}
                      </p>
                    </div>

                    {/* Right: amount + date */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-base font-black text-primary-container">{ARS(order.totalAmount)}</p>
                      <p className="text-xs text-on-surface-variant">
                        {new Date(order.createdAt).toLocaleDateString('es-AR', { day:'2-digit', month:'short', year:'numeric' })}
                      </p>
                    </div>

                    <span className={`material-symbols-outlined text-on-surface-variant text-sm transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}>
                      expand_more
                    </span>
                  </button>

                  {/* ── Expanded detail ── */}
                  {isOpen && (
                    <div className="border-t border-white/10 bg-surface-container-high/20">

                      {/* Status changer */}
                      <div className="px-sm pt-sm pb-xs">
                        <p className="text-[10px] text-white/40 uppercase tracking-wider font-semibold mb-2">Cambiar estado del pedido</p>
                        <div className="flex flex-wrap gap-1.5">
                          {STATUS_FLOW.map(s => {
                            const cfg = STATUS_CFG[s]
                            const isCurrent = order.status === s
                            return (
                              <button key={s} type="button"
                                onClick={() => !isCurrent && changeStatus(order.id, s)}
                                disabled={isCurrent || updating === order.id}
                                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer disabled:cursor-default flex items-center gap-1 ${
                                  isCurrent ? cfg.color + ' opacity-100' : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10 hover:text-white/70'
                                }`}>
                                <span className="material-symbols-outlined text-[11px]">{cfg.icon}</span>
                                {cfg.label}
                              </button>
                            )
                          })}
                          {/* Cancel button */}
                          <button type="button"
                            onClick={() => order.status !== 'CANCELLED' && changeStatus(order.id, 'CANCELLED')}
                            disabled={order.status === 'CANCELLED' || updating === order.id}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer disabled:cursor-default flex items-center gap-1 ${
                              order.status === 'CANCELLED'
                                ? STATUS_CFG.CANCELLED.color + ' opacity-100'
                                : 'bg-white/5 text-red-400/60 border-red-500/20 hover:bg-red-500/10 hover:text-red-400'
                            }`}>
                            <span className="material-symbols-outlined text-[11px]">cancel</span>Cancelar
                          </button>
                        </div>

                        {/* Tracking link + tracking code input */}
                        <div className="mt-2 flex flex-wrap items-start gap-3">
                          <a href={`/seguimiento/${orderNum}`} target="_blank" rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors">
                            <span className="material-symbols-outlined text-sm">open_in_new</span>
                            Ver seguimiento del cliente
                          </a>
                        </div>

                        {/* Carrier tracking code — show when carrier is Andreani or Correo */}
                        {order.shippingCarrier && order.shippingCarrier !== 'pickup' && (
                          <div className="mt-3 pt-3 border-t border-white/10">
                            <p className="text-[10px] text-white/40 uppercase tracking-wider font-semibold mb-2 flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-[13px]">local_shipping</span>
                              Código de seguimiento ({order.shippingCarrier})
                            </p>
                            {order.trackingCode && (
                              <p className="font-mono text-xs text-[#39ff14] mb-2 flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[13px]">check_circle</span>
                                Actual: {order.trackingCode}
                              </p>
                            )}
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder={order.trackingCode ? 'Actualizar código...' : 'Ej: 12345678901234'}
                                value={trackingInputs[order.id] ?? ''}
                                onChange={e => setTrackingInputs(prev => ({ ...prev, [order.id]: e.target.value }))}
                                onKeyDown={e => { if (e.key === 'Enter') saveTrackingCode(order.id) }}
                                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/25 focus:outline-none focus:border-[#39ff14]/50 min-w-0"
                              />
                              <button type="button"
                                onClick={() => saveTrackingCode(order.id)}
                                disabled={savingTracking === order.id || !(trackingInputs[order.id] ?? '').trim()}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-default flex items-center gap-1"
                                style={{ background: '#39ff1420', color: '#39ff14', border: '1px solid #39ff1440' }}>
                                {savingTracking === order.id
                                  ? <span className="material-symbols-outlined text-[13px] animate-spin">progress_activity</span>
                                  : <span className="material-symbols-outlined text-[13px]">save</span>}
                                Guardar
                              </button>
                            </div>
                            <p className="text-[10px] text-white/25 mt-1.5">
                              Aparecerá en la página de seguimiento del cliente con link directo a {order.shippingCarrier}.
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="grid md:grid-cols-2 gap-0 border-t border-white/10">

                        {/* Items */}
                        <div className="p-sm space-y-xs border-b md:border-b-0 md:border-r border-white/10">
                          <p className="text-[10px] text-white/40 uppercase tracking-wider font-semibold mb-2">Productos</p>
                          {order.items.map(item => (
                            <div key={item.id} className="flex items-center gap-sm">
                              <div className="w-9 h-9 rounded-lg overflow-hidden bg-surface-container-high border border-white/10 flex-shrink-0">
                                {item.product?.image
                                  ? <img src={item.product.image} alt={item.product?.name} className="w-full h-full object-cover" loading="lazy" />
                                  : <span className="material-symbols-outlined text-on-surface-variant m-auto block mt-1.5 text-sm">image_not_supported</span>}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-on-surface truncate">{item.product?.name ?? 'Producto eliminado'}</p>
                                <p className="text-[10px] text-on-surface-variant">×{item.quantity}</p>
                              </div>
                              <p className="text-xs font-semibold text-on-surface flex-shrink-0">{ARS(item.price * item.quantity)}</p>
                            </div>
                          ))}
                          <div className="border-t border-white/10 pt-xs mt-xs space-y-0.5">
                            {order.shippingCost != null && (
                              <div className="flex justify-between text-xs text-white/50">
                                <span>Envío · {order.shippingService ?? order.shippingCarrier}</span>
                                <span>{ARS(order.shippingCost)}</span>
                              </div>
                            )}
                            <div className="flex justify-between text-xs font-bold text-on-surface">
                              <span>Total</span><span className="text-primary-container">{ARS(order.totalAmount)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Right col: customer + shipping + comprobante */}
                        <div className="p-sm space-y-sm">

                          {/* Customer */}
                          <div>
                            <p className="text-[10px] text-white/40 uppercase tracking-wider font-semibold mb-1.5">Comprador</p>
                            <div className="space-y-0.5 text-xs">
                              {order.customerName  && <p className="text-on-surface font-semibold">{order.customerName}</p>}
                              {order.customerEmail && <p className="text-on-surface-variant">{order.customerEmail}</p>}
                              {order.customerPhone && <p className="text-on-surface-variant">{order.customerPhone}</p>}
                            </div>
                          </div>

                          {/* Shipping address */}
                          {(order.shippingAddress || order.shippingCity) && (
                            <div>
                              <p className="text-[10px] text-white/40 uppercase tracking-wider font-semibold mb-1.5">Dirección de envío</p>
                              <div className="text-xs text-on-surface-variant space-y-0.5">
                                {order.shippingAddress  && <p>{order.shippingAddress}</p>}
                                {order.shippingCity     && <p>{order.shippingCity}{order.shippingProvince ? `, ${order.shippingProvince}` : ''}</p>}
                                {order.shippingPostalCode && <p>CP {order.shippingPostalCode}</p>}
                                {order.shippingCarrier  && (
                                  <p className="mt-1 text-blue-400 font-semibold">
                                    <i className="fa-solid fa-truck mr-1 text-[10px]" />
                                    {order.shippingCarrier} · {order.shippingService}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Comprobante */}
                          {order.comprovanteUrl ? (
                            <div>
                              <p className="text-[10px] text-white/40 uppercase tracking-wider font-semibold mb-1.5">
                                Comprobante de pago
                              </p>
                              <div className="space-y-2">
                                {order.comprovanteUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                  <a href={order.comprovanteUrl} target="_blank" rel="noreferrer">
                                    <img src={order.comprovanteUrl} alt="Comprobante"
                                      className="w-full max-h-32 object-contain rounded-lg border border-cyan-500/20 hover:border-cyan-500/50 transition-colors" />
                                  </a>
                                ) : (
                                  <a href={order.comprovanteUrl} target="_blank" rel="noreferrer"
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 text-xs hover:bg-cyan-500/10 transition-colors">
                                    <i className="fa-solid fa-file-pdf" /> Ver comprobante
                                  </a>
                                )}
                                {/* Quick confirm button when payment method is transfer or usdt */}
                                {(order.paymentMethod === 'transfer' || order.paymentMethod === 'usdt') &&
                                  order.status === 'PENDING' && (
                                  <button type="button"
                                    onClick={() => changeStatus(order.id, 'CONFIRMED')}
                                    disabled={updating === order.id}
                                    className="w-full py-1.5 rounded-lg text-xs font-bold border border-cyan-500/40 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 transition-all cursor-pointer disabled:opacity-50">
                                    <span className="material-symbols-outlined text-[11px] mr-1">check_circle</span>
                                    Confirmar pago recibido
                                  </button>
                                )}
                              </div>
                            </div>
                          ) : (
                            (order.paymentMethod === 'transfer' || order.paymentMethod === 'usdt') && (
                              <div className="text-xs text-yellow-400/70 flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-sm">schedule</span>
                                Esperando comprobante del comprador
                              </div>
                            )
                          )}

                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-md">
              <p className="text-xs text-on-surface-variant">
                Mostrando {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length}
              </p>
              <div className="flex items-center gap-xs">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="w-8 h-8 rounded-lg border border-outline-variant flex items-center justify-center text-on-surface-variant hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer">
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                  .reduce<(number | '...')[]>((acc, n, idx, arr) => {
                    if (idx > 0 && n - (arr[idx - 1] as number) > 1) acc.push('...')
                    acc.push(n); return acc
                  }, [])
                  .map((n, i) => n === '...'
                    ? <span key={`d${i}`} className="w-8 text-center text-xs text-on-surface-variant">…</span>
                    : <button key={n} onClick={() => setPage(n as number)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          page === n ? 'bg-primary-container/20 text-primary-container border border-primary-container/40'
                                     : 'border border-outline-variant text-on-surface-variant hover:bg-white/5'
                        }`}>{n}</button>
                  )}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="w-8 h-8 rounded-lg border border-outline-variant flex items-center justify-center text-on-surface-variant hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer">
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
