import { useNavigate } from 'react-router-dom'
import './BentoCategories.css'

export default function BentoCategories() {
  const navigate = useNavigate()

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-8 md:px-margin py-xl">

      {/* Section heading — visible on mobile */}
      <div className="md:hidden mb-md">
        <h2 className="text-2xl font-black text-on-background font-['Plus_Jakarta_Sans']">Categorías</h2>
        <p className="text-on-surface-variant text-sm mt-1">Todo lo que necesitás para jugar mejor.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-gutter md:h-[560px]">

        {/* Main featured — Consolas */}
        <div
          onClick={() => navigate('/products?cat=consoles')}
          className="bento-card-main md:col-span-8 relative rounded-xl overflow-hidden group cursor-pointer border border-white/8 bg-zinc-900 transition-all hover:border-primary-container/40"
        >
          <img
            className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700"
            src="/bento/consolas.jpg"
            alt="PS5 Pro - Consolas Next-Gen"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 p-sm md:p-lg">
            <h3 className="text-xl sm:text-2xl md:text-[32px] font-bold leading-tight text-white mb-xs">
              Consolas Next-Gen
            </h3>
            <p className="text-white/70 text-sm max-w-md mb-sm hidden sm:block">
              PS5, Xbox Series X, Nintendo Switch y ediciones limitadas. El futuro del gaming.
            </p>
            <span className="text-primary-container font-bold text-sm flex items-center gap-xs group-hover:gap-md transition-all">
              VER COLECCIÓN
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </span>
          </div>
        </div>

        {/* Right column */}
        <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-1 md:flex md:flex-col gap-3 md:gap-gutter md:h-full">

          {/* Juegos */}
          <div
            onClick={() => navigate('/products?cat=games')}
            className="bento-card-sm md:flex-1 relative rounded-xl overflow-hidden group cursor-pointer border border-white/8 bg-zinc-900 transition-all hover:border-secondary-container/40"
          >
            <img
              className="absolute inset-0 w-full h-full object-cover opacity-55 group-hover:scale-110 transition-transform duration-700"
              src="/bento/juegos.jpg"
              alt="Clair Obscur Expedition 33 - PS5"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 p-xs sm:p-sm">
              <h3 className="text-base sm:text-xl font-bold text-white">Juegos</h3>
              <span className="text-white/60 font-bold text-[10px] sm:text-sm hidden sm:block">PS5, XBOX & SWITCH</span>
            </div>
          </div>

          {/* Accesorios */}
          <div
            onClick={() => navigate('/products?cat=accessories')}
            className="bento-card-sm md:flex-1 relative rounded-xl overflow-hidden group cursor-pointer border border-white/8 bg-zinc-900 transition-all hover:border-tertiary-container/40"
          >
            <img
              className="absolute inset-0 w-full h-full object-cover opacity-55 group-hover:scale-110 transition-transform duration-700"
              src="/bento/accesorios.jpg"
              alt="Xbox Elite Controller - Accesorios"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 p-xs sm:p-sm">
              <h3 className="text-base sm:text-xl font-bold text-white">Accesorios</h3>
              <span className="text-white/60 font-bold text-[10px] sm:text-sm hidden sm:block">
                JOYSTICKS, HEADSETS & MÁS
              </span>
            </div>
          </div>
        </div>
      </div>

    </section>
  )
}
