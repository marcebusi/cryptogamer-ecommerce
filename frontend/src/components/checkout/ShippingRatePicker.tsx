/* Carriers (Andreani / Correo Argentino) commented out — only home pickup active */

export interface ShippingRate {
  carrierId:    'andreani' | 'correo-argentino' | 'pickup'
  carrierName:  string
  serviceId:    string
  serviceName:  string
  deliveryType: 'D' | 'S' | 'P'
  price:        number
  daysMin:      number
  daysMax:      number
}

export const PICKUP_RATE: ShippingRate = {
  carrierId:    'pickup',
  carrierName:  'Retiro',
  serviceId:    'pickup',
  serviceName:  'Retiro a domicilio del vendedor',
  deliveryType: 'P',
  price:        0,
  daysMin:      0,
  daysMax:      0,
}

interface Props {
  postalCode:    string
  totalItems:    number
  declaredValue: number
  selected:      ShippingRate | null
  onSelect:      (rate: ShippingRate) => void
}

export default function ShippingRatePicker({ selected, onSelect }: Props) {
  const isSelected = selected?.serviceId === 'pickup'

  /* Auto-select pickup on first render */
  if (!selected) {
    // Use setTimeout to avoid setState-during-render
    setTimeout(() => onSelect(PICKUP_RATE), 0)
  }

  return (
    <div className="mt-4">
      <p className="text-xs text-white/40 uppercase tracking-wider font-semibold flex items-center gap-2 mb-3">
        <span className="material-symbols-outlined text-sm">delivery_truck_speed</span>
        Método de entrega
      </p>

      <button
        type="button"
        onClick={() => onSelect(PICKUP_RATE)}
        className={`w-full rounded-2xl border overflow-hidden flex items-center gap-3 px-4 py-3.5 text-left transition-all cursor-pointer ${
          isSelected
            ? 'bg-purple-500/12 border-purple-500 border-l-2'
            : 'border-white/8 hover:bg-white/[0.04] border-l-2 border-transparent'
        }`}
      >
        {/* Radio */}
        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
          isSelected ? 'border-purple-500 bg-purple-600' : 'border-white/20'
        }`}>
          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
        </div>

        {/* Icon */}
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg,#7c3aed,#5b21b6)' }}>
          <span className="material-symbols-outlined text-white text-base">delivery_truck_speed</span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <span className={`text-sm font-semibold ${isSelected ? 'text-purple-200' : 'text-white/80'}`}>
            Retiro a domicilio del vendedor
          </span>
          <p className="text-xs text-white/40 mt-0.5">
            Coordinás el retiro directamente con el vendedor vía WhatsApp
          </p>
        </div>

        <span className="text-sm font-bold flex-shrink-0 ml-3 text-[#39ff14]">Gratis</span>
      </button>
    </div>
  )
}
