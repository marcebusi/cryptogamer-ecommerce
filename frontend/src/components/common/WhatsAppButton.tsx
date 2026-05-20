import { useState, useEffect } from 'react'

interface Seller { id: string; name: string; bio: string; avatar: string; whatsapp: string }

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'
const FALLBACK_WA = '5491166506985'
type ModalStep = 'choose' | 'list' | 'selected'

function getRRSeller(sellers: Seller[]): Seller {
  const key = 'wa_next_idx'
  const idx = Number(localStorage.getItem(key) ?? '0') % sellers.length
  localStorage.setItem(key, String((idx + 1) % sellers.length))
  return sellers[idx]
}

function waUrl(whatsapp: string) {
  const digits = whatsapp.replace(/\D/g, '')
  const number = digits.startsWith('549') || digits.startsWith('54') ? digits : `549${digits}`
  const msg = encodeURIComponent('¡Hola! Quisiera hacer una consulta sobre un producto.')
  return `https://wa.me/${number}?text=${msg}`
}

function SellerAvatar({ seller }: { seller: Seller }) {
  if (seller.avatar) {
    return <img src={seller.avatar} alt={seller.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
  }
  return (
    <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
      {seller.name.charAt(0).toUpperCase()}
    </div>
  )
}

export default function WhatsAppButton() {
  const [modal,    setModal]    = useState<ModalStep | null>(null)
  const [sellers,  setSellers]  = useState<Seller[]>([])
  const [loading,  setLoading]  = useState(false)
  const [selected, setSelected] = useState<Seller | null>(null)

  useEffect(() => {
    if (!modal || sellers.length > 0) return
    setLoading(true)
    fetch(`${API}/api/sellers`)
      .then(r => r.json())
      .then(d => setSellers(Array.isArray(d) ? d : []))
      .catch(() => setSellers([]))
      .finally(() => setLoading(false))
  }, [modal])

  const openModal  = () => { setSelected(null); setModal('choose') }
  const closeModal = () => setModal(null)

  const handleRandom = () => {
    if (sellers.length > 0) {
      setSelected(getRRSeller(sellers))
      setModal('selected')
    } else {
      // Fallback: open main contact number directly
      const msg = encodeURIComponent('¡Hola! Quisiera hacer una consulta sobre un producto.')
      window.open(`https://wa.me/${FALLBACK_WA}?text=${msg}`, '_blank', 'noopener,noreferrer')
      closeModal()
    }
  }

  const handlePickSeller = (seller: Seller) => {
    setSelected(seller)
    setModal('selected')
  }

  const handleWA = () => {
    if (!selected) return
    fetch(`${API}/api/tracking/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'wa_click', sellerId: selected.id }),
    }).catch(() => {})
    window.open(waUrl(selected.whatsapp), '_blank', 'noopener,noreferrer')
    closeModal()
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={openModal}
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-[0_4px_20px_rgba(37,211,102,0.5)] hover:scale-110 hover:shadow-[0_4px_30px_rgba(37,211,102,0.7)] transition-all duration-300 group cursor-pointer"
        aria-label="Contactar por WhatsApp"
      >
        <i className="fa-brands fa-whatsapp text-3xl" />
        <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-[#111318] text-white px-4 py-2 rounded-xl text-sm font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none shadow-lg border border-white/10">
          ¡Consultanos por WhatsApp!
        </span>
      </button>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />

          {/* Panel */}
          <div className="relative w-full max-w-sm bg-[#111318] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#25D366]/15 flex items-center justify-center">
                  <i className="fa-brands fa-whatsapp text-[#25D366] text-base" />
                </div>
                <div>
                  {modal === 'choose' && (
                    <>
                      <p className="text-sm font-bold text-white">¿Conocés a un vendedor?</p>
                      <p className="text-xs text-white/35">Elegí cómo querés continuar</p>
                    </>
                  )}
                  {modal === 'list' && <p className="text-sm font-bold text-white">Elegir vendedor</p>}
                  {modal === 'selected' && <p className="text-sm font-bold text-white">Vendedor seleccionado</p>}
                </div>
              </div>
              <button onClick={closeModal}
                className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-white/50 text-base">close</span>
              </button>
            </div>

            {/* ── Step: choose ── */}
            {modal === 'choose' && (
              <div className="px-5 py-5 space-y-3">
                <p className="text-xs text-white/35 text-center mb-4">Elegí cómo querés continuar</p>

                <button onClick={handleRandom} disabled={loading}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-[#25D366]/10 border border-[#25D366]/25 hover:bg-[#25D366]/18 hover:border-[#25D366]/45 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed group">
                  <div className="w-9 h-9 rounded-xl bg-[#25D366]/15 border border-[#25D366]/25 flex items-center justify-center flex-shrink-0 group-hover:bg-[#25D366]/25 transition-colors">
                    {loading
                      ? <span className="material-symbols-outlined text-[#25D366] text-base animate-spin">progress_activity</span>
                      : <span className="material-symbols-outlined text-[#25D366] text-base">shuffle</span>}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-white">Elegir al azar</p>
                    <p className="text-[11px] text-white/35">Rápido · equitativo para todos</p>
                  </div>
                  <span className="material-symbols-outlined text-white/20 text-base ml-auto group-hover:text-white/40 transition-colors">chevron_right</span>
                </button>

                <button onClick={() => setModal('list')} disabled={loading || sellers.length === 0}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/8 hover:bg-white/[0.08] hover:border-white/15 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed group">
                  <div className="w-9 h-9 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-white/12 transition-colors">
                    <span className="material-symbols-outlined text-white/60 text-base">group</span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-white">Elegir un vendedor</p>
                    <p className="text-[11px] text-white/35">
                      {loading ? 'Cargando...' : `${sellers.length} disponible${sellers.length !== 1 ? 's' : ''}`}
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-white/20 text-base ml-auto group-hover:text-white/40 transition-colors">chevron_right</span>
                </button>
              </div>
            )}

            {/* ── Step: list ── */}
            {modal === 'list' && (
              <div className="px-4 py-3 space-y-1.5 max-h-72 overflow-y-auto">
                {sellers.map(seller => (
                  <button key={seller.id} onClick={() => handlePickSeller(seller)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/6 border border-transparent hover:border-[#25D366]/20 transition-all cursor-pointer group text-left">
                    <SellerAvatar seller={seller} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{seller.name}</p>
                      {seller.bio && <p className="text-xs text-white/35 truncate">{seller.bio}</p>}
                    </div>
                    <span className="material-symbols-outlined text-white/20 text-base group-hover:text-white/50 transition-colors flex-shrink-0">chevron_right</span>
                  </button>
                ))}
              </div>
            )}

            {/* ── Step: selected ── */}
            {modal === 'selected' && selected && (
              <div className="px-5 py-5">
                <div className="flex items-center gap-3 p-3.5 bg-white/[0.04] rounded-xl border border-white/8 mb-5">
                  <SellerAvatar seller={selected} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{selected.name}</p>
                    {selected.bio && <p className="text-xs text-white/40 truncate">{selected.bio}</p>}
                  </div>
                  <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                </div>

                <button onClick={handleWA}
                  className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-[#25D366]/12 border border-[#25D366]/30 text-[#25D366] font-bold text-sm hover:bg-[#25D366]/20 hover:border-[#25D366]/55 hover:shadow-[0_0_20px_rgba(37,211,102,0.2)] transition-all active:scale-95 cursor-pointer">
                  <i className="fa-brands fa-whatsapp text-base" />
                  Consultar por WhatsApp
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  )
}
