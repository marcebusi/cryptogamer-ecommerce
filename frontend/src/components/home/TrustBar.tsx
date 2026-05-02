import './TrustBar.css'

const ITEMS = [
  { icon: 'local_shipping',   title: 'Envío gratis',     desc: 'En compras superiores a $200'       },
  { icon: 'workspace_premium',title: 'Garantía 90 días', desc: 'Todos los productos certificados'   },
  { icon: 'verified_user',    title: 'Pago 100% seguro', desc: 'Mercado Pago y tarjetas'             },
  { icon: 'autorenew',        title: 'Devoluciones',     desc: 'Sin preguntas en 30 días'            },
]

export default function TrustBar() {
  return (
    <div className="trust-bar-wrapper">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 md:px-margin py-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-0 md:divide-x trust-bar-dividers">
          {ITEMS.map((item) => (
            <div key={item.title} className="flex items-center gap-3 px-0 md:px-6 first:pl-0 last:pr-0">
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
