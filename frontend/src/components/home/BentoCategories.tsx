import { useNavigate } from 'react-router-dom'
import { navCategories } from '../../data/categories'
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
          className="bento-card-main md:col-span-8 relative rounded-xl overflow-hidden group cursor-pointer border border-white/5 bg-surface-container-low transition-all hover:border-primary-container/30"
        >
          <img
            className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-110 transition-transform duration-700"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCzq048NNKTsZD-8uxPtS09zdOupyQ8K3WzUnJXkfYgsOyRvUxe7QQmvX2Ut5588Q6yUUs2LW6fkueqm1wgkOH816lZppO4AvzD1IwRxmef86J4NuCvN7Oxizr0otxbFzBDJgvPRqEuI35Yx33iJfLJUmq6MBQ4EeVYzfv_Hz0NmuyNvQtsV7tMmLO43d8xJnc65H9ORwr7_8YW6cnMOBZ-gcF7D_ZI5az2XhaaAq8yZus1v-DRY2R-jQ72Kz7d1IMU9hvBiBbvdFk"
            alt="Setup gaming con iluminación neon"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
          <div className="absolute bottom-0 left-0 p-sm md:p-lg">
            <h3 className="text-xl sm:text-2xl md:text-[32px] font-bold leading-tight text-on-background mb-xs">
              Consolas Next-Gen
            </h3>
            <p className="text-on-surface-variant text-sm max-w-md mb-sm hidden sm:block">
              PS5, Xbox Series X, Nintendo Switch y ediciones limitadas. El futuro del gaming.
            </p>
            <span className="text-primary-container font-bold text-sm flex items-center gap-xs group-hover:gap-md transition-all">
              VER COLECCIÓN
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </span>
          </div>
        </div>

        {/* Right column — 2-col grid on mobile, flex-col on desktop */}
        <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-1 md:flex md:flex-col gap-3 md:gap-gutter md:h-full">

          {/* Juegos */}
          <div
            onClick={() => navigate('/products?cat=games')}
            className="bento-card-sm md:flex-1 relative rounded-xl overflow-hidden group cursor-pointer border border-white/5 bg-surface-container-low transition-all hover:border-secondary-container/30"
          >
            <img
              className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-700"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBoKHs6QcOQIsU2jl0DCUDuHQD3hOs4sbFQu1_I-98e7XhxcQ4hUA3X7tl4DjHEwiwhN2R_YPiJa31nQx2_Cp_Hsq9Hs2n-9VJdmmYJnP7z5ANRChD-im4vUXrPZ8J8mDB5EU2Jov9-zoHNh3aadGwlZj_MpoVV5KJLlAHgTX3mLTYUj3UD9a6OqjjqmDdz4owtBLoVg5ng4qPnelfjOfpBfMCAAIURUl8x49fsKcs5f3PqJ3M7MYXbvJQBG51divnmMKF7TZINkm0"
              alt="Videojuegos"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 p-xs sm:p-sm">
              <h3 className="text-base sm:text-xl font-bold text-on-background">Juegos</h3>
              <span className="text-secondary font-bold text-[10px] sm:text-sm hidden sm:block">PS5, XBOX & SWITCH</span>
            </div>
          </div>

          {/* Accesorios */}
          <div
            onClick={() => navigate('/products?cat=accessories')}
            className="bento-card-sm md:flex-1 relative rounded-xl overflow-hidden group cursor-pointer border border-white/5 bg-surface-container-low transition-all hover:border-tertiary-container/30"
          >
            <img
              className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-700"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuByrNkEEqFQBU-4PYlxQdktEEt10ecoR8tnu8OqVQ1c7oao6cHcsR_sJmW3JN7782jgvkNZCT2afi0QTmnJBMJm7LCbNh1n8MXkUYbnTU6KuImGjkXCjv91LSXsagk_Ry0DTfIoQuPsthPo04OaE29C2W7tsE-7CKISQH-YPU3wrpQQ-aZgVV-wmcB8Y9DsKv5jL1W9Nn1d5wpuN4zk97-AmoJ8R0CrbV6PWItyiUWUUL_Nmfs8xEGqrnlO5a9Pt6sR4KU0799yJYs"
              alt="Joystick gaming con gatillos brillantes"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 p-xs sm:p-sm">
              <h3 className="text-base sm:text-xl font-bold text-on-background">Accesorios</h3>
              <span className="text-tertiary-fixed font-bold text-[10px] sm:text-sm hidden sm:block">
                JOYSTICKS, HEADSETS & MÁS
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile — horizontal scroll chips for all 6 categories */}
      <div className="md:hidden mt-3 -mx-4 px-4 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 pb-1" style={{ width: 'max-content' }}>
          {navCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => navigate(`/products?cat=${cat.id}`)}
              className="flex items-center gap-1.5 px-3 py-2 bg-surface-container border border-white/10 rounded-full text-xs font-semibold text-on-surface-variant hover:text-cyan-400 hover:border-cyan-400/30 transition-all cursor-pointer whitespace-nowrap active:scale-95 flex-shrink-0"
            >
              <span className="material-symbols-outlined text-sm">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
