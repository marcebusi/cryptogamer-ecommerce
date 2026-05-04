import { useEffect, useState } from 'react'

interface Seller {
  id: string
  name: string
  bio: string
  avatar: string
  whatsapp: string
  alias: string
  bank: string
  mpAlias: string
  cryptoAlias: string
}

interface Props {
  selected: Seller | null
  onSelect: (seller: Seller) => void
  /** Optional pre-fetched sellers — if provided, skips internal fetch */
  sellers?: Seller[]
}

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

export default function SellerPicker({ selected, onSelect, sellers: propSellers }: Props) {
  const [sellers, setSellers] = useState<Seller[]>(propSellers ?? [])
  const [loading, setLoading] = useState(!propSellers)

  useEffect(() => {
    if (propSellers) { setSellers(propSellers); setLoading(false); return }
    fetch(`${BASE}/api/sellers`)
      .then(r => r.json())
      .then(d => setSellers(Array.isArray(d) ? d : []))
      .catch(() => setSellers([]))
      .finally(() => setLoading(false))
  }, [propSellers])

  if (loading) return (
    <div className="grid grid-cols-1 gap-3">
      {[1,2,3].map(i => <div key={i} className="h-20 rounded-xl bg-white/5 animate-pulse" />)}
    </div>
  )

  if (sellers.length === 0) return (
    <p className="text-sm text-on-surface-variant text-center py-4 opacity-60">
      No hay vendedores disponibles en este momento.
    </p>
  )

  return (
    <div className="space-y-3">
      {sellers.map(s => {
        const active = selected?.id === s.id
        return (
          <button
            key={s.id}
            onClick={() => onSelect(s)}
            className="w-full text-left rounded-2xl p-4 cursor-pointer transition-all duration-200 relative overflow-hidden"
            style={{
              background: active
                ? 'rgba(138, 43, 226, 0.12)'
                : 'rgba(255,255,255,0.03)',
              border: active
                ? '1.5px solid rgba(168, 85, 247, 0.6)'
                : '1.5px solid rgba(255,255,255,0.08)',
              boxShadow: active
                ? '0 0 24px rgba(138,43,226,0.2)'
                : 'none',
            }}
          >
            {/* Selection indicator */}
            <div className={`absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${active ? 'border-purple-500 bg-purple-600' : 'border-white/20'}`}>
              {active && <i className="fa-solid fa-check text-[9px] text-white" />}
            </div>

            <div className="flex items-center gap-3 pr-8">
              {/* Avatar */}
              {s.avatar ? (
                <img
                  src={s.avatar}
                  alt={s.name}
                  className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                  style={{ border: active ? '2px solid rgba(168,85,247,0.5)' : '2px solid rgba(255,255,255,0.08)' }}
                  onError={e => (e.target as HTMLImageElement).style.display = 'none'}
                />
              ) : (
                <div className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center text-lg font-black text-white"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #4f1d96)' }}>
                  {s.name.charAt(0)}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <p className={`font-bold text-sm truncate ${active ? 'text-purple-200' : 'text-on-surface'}`}>{s.name}</p>
                <p className="text-xs text-on-surface-variant truncate">{s.bio}</p>
                {s.whatsapp && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <i className="fa-brands fa-whatsapp text-green-400 text-[10px]" />
                    <span className="text-[10px] text-on-surface-variant/70">Disponible por WhatsApp</span>
                  </div>
                )}
              </div>
            </div>

            {/* Payment info shown when selected */}
            {active && s.alias && (
              <div className="mt-3 pt-3 border-t border-purple-500/20">
                <p className="text-[10px] text-purple-300 font-bold uppercase tracking-wider mb-1.5">
                  <i className="fa-solid fa-building-columns mr-1" />
                  Datos para transferencia
                </p>
                <div className="space-y-1 text-xs">
                  {s.bank && <p className="text-on-surface-variant"><span className="text-on-surface font-semibold">Banco/Billetera:</span> {s.bank}</p>}
                  <p className="text-on-surface-variant"><span className="text-on-surface font-semibold">Alias / CBU:</span> <span className="font-mono text-purple-300">{s.alias}</span></p>
                  {s.mpAlias && <p className="text-on-surface-variant"><span className="text-on-surface font-semibold">MP Alias:</span> <span className="font-mono text-cyan-300">{s.mpAlias}</span></p>}
                </div>
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}
