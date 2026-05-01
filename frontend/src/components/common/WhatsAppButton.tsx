import { useState, useEffect } from 'react'

interface Seller {
  id: string
  name: string
  bio: string
  avatar: string
  whatsapp: string
}

// Round-robin equitable selection — persisted in localStorage
function pickEquitable(sellers: Seller[]): Seller {
  if (sellers.length === 0) return sellers[0]
  const key = 'wa_next_idx'
  const idx = Number(localStorage.getItem(key) ?? '0') % sellers.length
  localStorage.setItem(key, String((idx + 1) % sellers.length))
  return sellers[idx]
}

function waUrl(whatsapp: string) {
  // Normalize: strip non-digits, ensure country code
  const digits = whatsapp.replace(/\D/g, '')
  const number = digits.startsWith('549') || digits.startsWith('54')
    ? digits
    : `549${digits}`
  const msg = encodeURIComponent('¡Hola! Quisiera hacer una consulta sobre un producto.')
  return `https://wa.me/${number}?text=${msg}`
}

function Avatar({ seller }: { seller: Seller }) {
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
  const [open, setOpen]       = useState(false)
  const [sellers, setSellers] = useState<Seller[]>([])

  useEffect(() => {
    if (!open) return
    fetch('http://localhost:3001/api/sellers')
      .then(r => r.json())
      .then(d => setSellers(Array.isArray(d) ? d : []))
      .catch(() => setSellers([]))
  }, [open])

  const handleSelect = (seller: Seller) => {
    fetch('http://localhost:3001/api/tracking/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'wa_click', sellerId: seller.id }),
    }).catch(() => {})
    window.open(waUrl(seller.whatsapp), '_blank', 'noopener,noreferrer')
    setOpen(false)
  }

  const handleRandom = () => {
    if (!sellers.length) return
    handleSelect(pickEquitable(sellers))
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-[0_4px_20px_rgba(37,211,102,0.5)] hover:scale-110 hover:shadow-[0_4px_30px_rgba(37,211,102,0.7)] transition-all duration-300 group cursor-pointer"
        aria-label="Contactar por WhatsApp"
      >
        <i className="fa-brands fa-whatsapp text-3xl" />
        <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-[#111318] text-white px-4 py-2 rounded-xl text-sm font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none shadow-lg border border-white/10">
          ¡Consultanos por WhatsApp!
        </span>
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <div className="relative w-full max-w-sm bg-[#111318] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#25D366]/15 flex items-center justify-center">
                  <i className="fa-brands fa-whatsapp text-[#25D366] text-base" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Contactar por WhatsApp</p>
                  <p className="text-xs text-white/40">Elegí con quién hablar</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-white/50 text-base">close</span>
              </button>
            </div>

            {/* Sellers list */}
            <div className="px-4 py-3 space-y-2">
              {sellers.length === 0 ? (
                <div className="py-6 flex items-center justify-center gap-2 text-white/30 text-sm">
                  <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                  Cargando vendedores...
                </div>
              ) : (
                sellers.map(seller => (
                  <button
                    key={seller.id}
                    onClick={() => handleSelect(seller)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/6 border border-transparent hover:border-[#25D366]/20 transition-all cursor-pointer group text-left"
                  >
                    <Avatar seller={seller} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{seller.name}</p>
                      {seller.bio && <p className="text-xs text-white/40 truncate">{seller.bio}</p>}
                    </div>
                    <i className="fa-brands fa-whatsapp text-[#25D366] text-lg opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </button>
                ))
              )}
            </div>

            {/* Random button */}
            {sellers.length > 1 && (
              <div className="px-4 pb-4">
                <div className="border-t border-white/8 pt-3">
                  <button
                    onClick={handleRandom}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#25D366]/10 border border-[#25D366]/25 text-[#25D366] text-sm font-bold hover:bg-[#25D366]/20 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">shuffle</span>
                    Elegir al azar
                    <span className="text-[10px] font-normal text-[#25D366]/60 ml-1">(distribución equitativa)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
