import { useState, useEffect, useRef } from 'react'

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
  serviceName:  'Retiro en domicilio del vendedor',
  deliveryType: 'P',
  price:        0,
  daysMin:      0,
  daysMax:      0,
}

interface Props {
  postalCode:   string
  totalItems:   number
  declaredValue: number
  selected:     ShippingRate | null
  onSelect:     (rate: ShippingRate) => void
}

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

const ARS = (n: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)

/* ── Carrier logos (inline SVG) ─────────────────────────────── */
function AndreaniLogo() {
  return (
    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-black text-xs text-white"
      style={{ background: 'linear-gradient(135deg,#E31D1A,#c01a17)' }}>
      AN
    </div>
  )
}
function CorreoLogo() {
  return (
    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-black text-xs text-white"
      style={{ background: 'linear-gradient(135deg,#0052A5,#003d7a)' }}>
      CA
    </div>
  )
}

function CarrierLogo({ carrierId }: { carrierId: string }) {
  return carrierId === 'andreani' ? <AndreaniLogo /> : <CorreoLogo />
}

export default function ShippingRatePicker({ postalCode, totalItems, declaredValue, selected, onSelect }: Props) {
  const [rates,   setRates]   = useState<ShippingRate[]>([])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const lastCP = useRef('')

  useEffect(() => {
    const cp = postalCode.replace(/\D/g, '')
    if (cp.length < 4 || cp === lastCP.current) return
    lastCP.current = cp

    setLoading(true)
    setError('')
    setRates([])

    fetch(`${API}/api/shipping/rates`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postalCode: cp, totalItems, declaredValue }),
    })
      .then(r => r.json())
      .then(d => {
        if (d.rates) setRates(d.rates)
        else setError('No se pudieron obtener tarifas.')
      })
      .catch(() => setError('Error al consultar tarifas de envío.'))
      .finally(() => setLoading(false))
  }, [postalCode])

  /* ── Loading ── */
  if (loading) return (
    <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.02] p-4">
      <p className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-3 flex items-center gap-2">
        <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
        Calculando tarifas de envío...
      </p>
      <div className="space-y-2">
        {[1,2,3].map(i => <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />)}
      </div>
    </div>
  )

  /* ── Error ── */
  if (error) return (
    <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400 flex items-center gap-2">
      <span className="material-symbols-outlined text-base">error</span>
      {error}
    </div>
  )

  /* ── No CP yet ── */
  if (!postalCode || postalCode.replace(/\D/g, '').length < 4) return (
    <div className="mt-4 rounded-xl border border-white/6 bg-white/[0.02] px-4 py-3 text-sm text-white/30 flex items-center gap-2">
      <span className="material-symbols-outlined text-base">local_shipping</span>
      Ingresá tu código postal para ver opciones de envío
    </div>
  )

  /* ── Rates ── */
  if (!rates.length) return null

  /* Group by carrier */
  const andreaniRates = rates.filter(r => r.carrierId === 'andreani')
  const caRates       = rates.filter(r => r.carrierId === 'correo-argentino')

  const groups = [
    { carrierId: 'andreani',         carrierName: 'Andreani',         rates: andreaniRates },
    { carrierId: 'correo-argentino', carrierName: 'Correo Argentino', rates: caRates },
  ].filter(g => g.rates.length > 0)

  return (
    <div className="mt-4 space-y-3">
      <p className="text-xs text-white/40 uppercase tracking-wider font-semibold flex items-center gap-2">
        <span className="material-symbols-outlined text-sm">local_shipping</span>
        Opciones de envío a CP {postalCode.replace(/\D/g, '')}
      </p>

      {groups.map(group => (
        <div key={group.carrierId} className="rounded-2xl border border-white/8 overflow-hidden">
          {/* Carrier header */}
          <div className="flex items-center gap-2.5 px-4 py-2.5 bg-white/[0.03] border-b border-white/6">
            <CarrierLogo carrierId={group.carrierId} />
            <span className="text-sm font-bold text-white">{group.carrierName}</span>
          </div>

          {/* Services */}
          <div className="divide-y divide-white/5">
            {group.rates.map(rate => {
              const isSelected = selected?.serviceId === rate.serviceId
              return (
                <button key={rate.serviceId} type="button" onClick={() => onSelect(rate)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-purple-500/12 border-l-2 border-purple-500'
                      : 'hover:bg-white/[0.04] border-l-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Selection circle */}
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      isSelected ? 'border-purple-500 bg-purple-600' : 'border-white/20'
                    }`}>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-sm font-semibold ${isSelected ? 'text-purple-200' : 'text-on-surface'}`}>
                          {rate.serviceName}
                        </span>
                        {rate.deliveryType === 'S' && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/8 text-white/50 border border-white/10">
                            Sucursal
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-white/40 mt-0.5">
                        {rate.daysMin === rate.daysMax
                          ? `${rate.daysMin} días hábiles`
                          : `${rate.daysMin}–${rate.daysMax} días hábiles`
                        }
                      </p>
                    </div>
                  </div>

                  <span className={`text-sm font-bold flex-shrink-0 ml-3 ${isSelected ? 'text-purple-300' : 'text-on-surface'}`}>
                    {ARS(rate.price)}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {/* Pickup option */}
      {(() => {
        const isPickup = selected?.serviceId === 'pickup'
        return (
          <button type="button" onClick={() => onSelect(PICKUP_RATE)}
            className={`w-full rounded-2xl border overflow-hidden flex items-center gap-3 px-4 py-3 text-left transition-all cursor-pointer ${
              isPickup
                ? 'bg-purple-500/12 border-purple-500 border-l-2'
                : 'border-white/8 hover:bg-white/[0.04] border-l-2 border-transparent'
            }`}
          >
            {/* Selection circle */}
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
              isPickup ? 'border-purple-500 bg-purple-600' : 'border-white/20'
            }`}>
              {isPickup && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
            </div>

            {/* Icon */}
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#5b21b6)' }}>
              <i className="fa-solid fa-store text-white text-xs" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <span className={`text-sm font-semibold ${isPickup ? 'text-purple-200' : 'text-white/80'}`}>
                Retiro en domicilio del vendedor
              </span>
              <p className="text-xs text-white/40 mt-0.5">Coordinás el retiro directamente con el vendedor</p>
            </div>

            <span className={`text-sm font-bold flex-shrink-0 ml-3 ${isPickup ? 'text-purple-300' : 'text-[#39ff14] font-bold'}`}>
              Gratis
            </span>
          </button>
        )
      })()}

      {selected && (
        <p className="text-xs text-white/35 text-center">
          {selected.carrierId === 'pickup'
            ? 'Retiro en domicilio del vendedor · Gratis'
            : `${selected.carrierName} · ${selected.serviceName} · ${ARS(selected.price)}`}
        </p>
      )}
    </div>
  )
}
