import './TrustBar.css'

const ITEMS = [
  { icon: 'delivery_truck_speed', title: 'Retiro a domicilio', desc: 'Te llevamos el pedido hasta tu puerta'  },
  { icon: 'workspace_premium',   title: 'Garantía 30 días',   desc: 'Solo en productos nuevos'               },
  { icon: 'verified_user',       title: 'Pago 100% seguro',   desc: 'Transferencia, efectivo y Crypto'        },
]

export default function TrustBar() {
  return (
    <div className="trust-bar-wrapper">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 md:px-margin py-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-0">
          {ITEMS.map((item, idx) => (
            <div key={item.title} className="flex items-center sm:justify-center gap-3 relative">
              {/* Divider between items on desktop */}
              {idx > 0 && (
                <div className="hidden sm:block absolute left-0 top-1/2 -translate-y-1/2 w-px h-8 trust-bar-divider" />
              )}
              <div className="trust-bar-icon flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
              </div>
              <div>
                <p className="text-sm font-bold text-on-background leading-tight">{item.title}</p>
                <p className="text-xs text-on-surface-variant mt-0.5 leading-tight">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
