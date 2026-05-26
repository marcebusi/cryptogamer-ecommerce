import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'

interface BillingStatus {
  hasPendingPayment: boolean
  status: 'PENDING' | 'PAID' | 'OVERDUE' | null
  amount: number
  dueDate: string | null
  alias: string
}

/* ── All possible cards ──────────────────────────────────────── */
// sectionKey = null means always shown (core feature)
const ALL_CARDS = [
  { to: '/admin/productos',               icon: 'add_box',      title: 'Agregar Producto',    desc: 'Publicá un nuevo producto en el catálogo con imagen, precio y specs.',          color: 'primary',   sectionKey: null        },
  { to: '/admin/productos?manage=true',   icon: 'inventory_2',  title: 'Gestionar Catálogo',  desc: 'Editá, reordenás o eliminás productos existentes.',                             color: 'secondary', sectionKey: null        },
  { to: '/admin/categorias',              icon: 'category',     title: 'Categorías',          desc: 'Creá y administrá categorías y subcategorías del catálogo.',                    color: 'primary',   sectionKey: null        },
  { to: '/admin/productos?filter=offers', icon: 'local_offer',  title: 'Gestionar Ofertas',   desc: 'Controlá qué productos aparecen en la sección de Ofertas.',                    color: 'secondary', sectionKey: null        },
  { to: '/admin/productos?filter=featured',icon:'stars',        title: 'Últimas Llegadas',    desc: 'Elegí qué productos destacar en la Home.',                                      color: 'tertiary',  sectionKey: null        },
  { to: '/admin/vendedores',              icon: 'group',        title: 'Vendedores',          desc: 'Administrá los socios que aparecen al comprar con sus datos de pago.',          color: 'tertiary',  sectionKey: null        },
  { to: '/admin/pedidos',                 icon: 'receipt_long', title: 'Pedidos',             desc: 'Historial completo de órdenes recibidas con estado y detalle.',                 color: 'secondary', sectionKey: 'orders'    },
  { to: '/admin/analytics',               icon: 'bar_chart',    title: 'Analytics',           desc: 'Productos más vendidos, ranking de vendedores, ingresos y más.',                color: 'tertiary',  sectionKey: 'analytics' },
  { to: '/admin/analytics-avanzado',      icon: 'electric_bolt',title: 'Analytics Avanzado',  desc: 'KPIs, heatmap, inventario muerto, WhatsApp, alertas y métricas profundas.',     color: 'secondary', sectionKey: 'analytics' },
  { to: '/admin/usuarios',               icon: 'manage_accounts', title: 'Usuarios',           desc: 'Gestioná cuentas de usuario, asigná roles de admin o eliminá usuarios.',       color: 'tertiary',  sectionKey: null        },
]

const colorMap = {
  primary:   { bg: 'bg-primary-container/15',   border: 'border-primary-container/25',   icon: 'text-primary-container',   glow: '' },
  secondary: { bg: 'bg-secondary-container/15', border: 'border-secondary-container/25', icon: 'text-secondary-container', glow: '' },
  tertiary:  { bg: 'bg-tertiary-container/15',  border: 'border-tertiary-container/25',  icon: 'text-tertiary-container',  glow: '' },
}

export default function AdminDashboard() {
  const { isAdmin, isManager, isLoading } = useAuth()
  const navigate = useNavigate()
  const [enabledSections, setEnabledSections] = useState<string[] | null>(null)
  const [billingStatus,   setBillingStatus]   = useState<BillingStatus | null>(null)

  useEffect(() => {
    if (!isLoading && !isAdmin) navigate('/')
  }, [isLoading, isAdmin, navigate])

  useEffect(() => {
    api.get<{ sections: string[] }>('/api/superadmin/sections')
      .then(d => setEnabledSections(d.sections))
      .catch(() => setEnabledSections(['orders', 'analytics', 'sellers', 'contact']))
  }, [])

  useEffect(() => {
    api.get<BillingStatus>('/api/superadmin/billing-status')
      .then(d => setBillingStatus(d))
      .catch(() => { /* no mostrar nada si falla */ })
  }, [])

  if (isLoading) return null

  // Show core cards always + optional cards only if section is enabled
  // Users card only for MANAGER and SUPERADMIN
  const visibleCards = ALL_CARDS.filter(c => {
    if (c.to === '/admin/usuarios' && !isManager) return false
    return c.sectionKey === null || enabledSections?.includes(c.sectionKey)
  })

  return (
    <main className="max-w-screen-xl mx-auto px-4 md:px-8 py-lg">
      <div className="mb-xl">
        <div className="inline-flex items-center gap-xs px-sm py-1 rounded-full bg-primary-container/15 border border-primary-container/25 text-primary-container text-xs font-bold uppercase tracking-widest mb-sm">
          <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
          Panel de administración
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-on-background font-['Plus_Jakarta_Sans'] leading-tight mb-xs">
          Bienvenido al{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-container to-tertiary-container">
            Dashboard
          </span>
        </h1>
        <p className="text-on-surface-variant">Desde acá podés gestionar todo el contenido de la tienda.</p>
      </div>

      {/* ── Banner de pago pendiente ─────────────────────────── */}
      {billingStatus?.hasPendingPayment && (
        <div className={`mb-lg rounded-2xl border p-md flex items-start gap-md ${
          billingStatus.status === 'OVERDUE'
            ? 'bg-red-500/10 border-red-500/30'
            : 'bg-yellow-500/10 border-yellow-500/30'
        }`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            billingStatus.status === 'OVERDUE'
              ? 'bg-red-500/20 border border-red-500/30'
              : 'bg-yellow-500/20 border border-yellow-500/30'
          }`}>
            <span className={`material-symbols-outlined ${billingStatus.status === 'OVERDUE' ? 'text-red-400' : 'text-yellow-400'}`}>
              {billingStatus.status === 'OVERDUE' ? 'error' : 'payment'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className={`font-bold text-sm ${billingStatus.status === 'OVERDUE' ? 'text-red-300' : 'text-yellow-300'}`}>
              {billingStatus.status === 'OVERDUE' ? 'Pago vencido' : 'Pago pendiente'}
            </p>
            <p className="text-sm text-on-surface-variant mt-0.5">
              {billingStatus.dueDate
                ? `Vencimiento: ${new Date(billingStatus.dueDate).toLocaleDateString('es-AR')}`
                : 'Tenés un pago pendiente con Atenea Techs.'}
              {billingStatus.amount > 0 && ` · $${billingStatus.amount.toLocaleString('es-AR')}`}
            </p>
            {billingStatus.alias && (
              <p className="text-xs text-on-surface-variant mt-1 flex items-center gap-xs">
                <span className="material-symbols-outlined text-xs">account_balance</span>
                Transferir a: <span className="font-bold text-on-surface ml-1">{billingStatus.alias}</span>
              </p>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
        {visibleCards.map(card => {
          const c = colorMap[card.color as keyof typeof colorMap]
          return (
            <Link
              key={card.to}
              to={card.to}
              className={`group relative rounded-2xl border ${c.border} bg-surface-container p-lg flex flex-col gap-sm ${c.glow} hover:-translate-y-1 transition-all duration-200 cursor-pointer overflow-hidden`}
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
    </main>
  )
}
