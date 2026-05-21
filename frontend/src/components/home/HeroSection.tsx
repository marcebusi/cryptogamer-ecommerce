import { useNavigate } from 'react-router-dom'
import './HeroSection.css'

const STATS = [
  { value: '10',    label: 'Años en el mercado' },
  { value: '4.9★',  label: 'Calificación'       },
  { value: '+500',  label: 'Ventas realizadas'  },
]

const SPEC_PILLS = [
  { icon: 'memory',          label: '16 GB RAM',   color: '#39ff14', side: 'left'  },
  { icon: 'storage',         label: '1 TB SSD',    color: '#3af4ff', side: 'right' },
  { icon: 'sports_esports',  label: '120 FPS',     color: '#ff4a8d', side: 'left'  },
]

export default function HeroSection() {
  const navigate = useNavigate()

  return (
    <section className="hero-section relative w-full min-h-[560px] sm:min-h-[640px] md:min-h-[760px] flex items-center overflow-hidden">

      {/* ── Ambient background orbs ─────────────────────────── */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Background image */}
        <img
          className="absolute inset-0 w-full h-full object-cover opacity-20 scale-[1.08] origin-center"
          src="/bento/hero-consolas.jpg"
          alt="Setup de gaming"
          loading="eager"
        />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 md:via-background/75 to-background/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />

        {/* Orb A — green */}
        <div className="hero-orb-a absolute top-[-120px] right-[15%] w-[600px] h-[600px] rounded-full opacity-[0.12]"
          style={{ background: 'radial-gradient(circle, #39ff14 0%, transparent 70%)' }} />

        {/* Orb B — cyan */}
        <div className="hero-orb-b absolute bottom-[-80px] right-[5%] w-[500px] h-[500px] rounded-full opacity-[0.10]"
          style={{ background: 'radial-gradient(circle, #3af4ff 0%, transparent 70%)' }} />

        {/* Subtle dot grid */}
        <div className="hero-grid-shimmer absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.18) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }} />
      </div>

      {/* ── Content ─────────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 md:px-margin py-16 md:py-0 grid md:grid-cols-2 gap-lg items-center">

        {/* ── LEFT — text content ─────────────────────────── */}
        <div className="space-y-5 md:space-y-6">

          {/* Pill badge */}
          <div className="hero-entry-0 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary-container/25 bg-primary-container/8 text-primary-container text-xs font-bold tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse" />
            Edición Limitada
          </div>

          {/* Heading */}
          <h1 className="hero-entry-1 text-[2.2rem] sm:text-5xl md:text-[3.4rem] font-black leading-[1.05] tracking-tight text-on-background font-['Plus_Jakarta_Sans']">
            POTENCIA{' '}
            <span className="hero-gradient-text">NEXT-GEN</span>
            <br />SIN LÍMITES
          </h1>

          {/* Subtitle */}
          <p className="hero-entry-2 text-sm sm:text-base md:text-[17px] text-on-surface-variant max-w-md leading-relaxed">
            La selección más completa de consolas, accesorios y juegos de Argentina.
            Equipos nuevos y pre-owned certificados. Envíos a todo el país.
          </p>

          {/* Buttons */}
          <div className="hero-entry-3 flex flex-wrap gap-3 pt-1">
            <button
              onClick={() => navigate('/products?cat=consoles')}
              className="hero-btn-primary flex items-center gap-2 px-6 py-3 font-bold text-sm rounded-xl cursor-pointer active:scale-95"
            >
              Ver Consolas
              <span className="material-symbols-outlined text-base">bolt</span>
            </button>
            <button
              onClick={() => navigate('/ofertas')}
              className="hero-btn-secondary flex items-center gap-2 px-6 py-3 font-bold text-sm rounded-xl cursor-pointer active:scale-95"
            >
              Ofertas
              <span className="material-symbols-outlined text-base">local_offer</span>
            </button>
          </div>

          {/* Stats */}
          <div className="hero-entry-4 flex justify-center md:justify-start gap-8 pt-2">
            {STATS.map(s => (
              <div key={s.label} className="group cursor-default text-center md:text-left">
                <p className="text-xl font-black text-on-background font-['Plus_Jakarta_Sans'] transition-colors group-hover:text-primary-container">{s.value}</p>
                <p className="text-xs text-on-surface-variant mt-0.5 leading-tight">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT — product card with floating effects ─── */}
        <div className="hidden md:flex justify-center items-center w-full">
          <div className="relative w-full max-w-[620px]">

            {/* Glowing orb behind card */}
            <div className="hero-product-glow absolute -inset-10 rounded-full blur-3xl opacity-30 pointer-events-none" />

            {/* Rotating glow ring */}
            <div className="absolute -inset-1 rounded-2xl opacity-20 pointer-events-none overflow-hidden">
              <div style={{
                position: 'absolute', inset: '-50%',
                background: 'conic-gradient(from 0deg, transparent 0%, #39ff14 25%, transparent 50%, #3af4ff 75%, transparent 100%)',
                animation: 'glowRotate 4s linear infinite',
              }} />
            </div>

            {/* Floating card */}
            <div className="hero-card-float hero-card-border-pulse hero-card-hover relative rounded-2xl overflow-hidden border hero-product-border p-2.5 hero-glass shadow-2xl">

              {/* Scan line sweep */}
              <div className="hero-scan-line absolute inset-x-0 h-[2px] pointer-events-none z-20"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(57,255,20,0.5), transparent)' }} />

              {/* Main image */}
              <img
                className="w-full h-auto rounded-xl shadow-2xl object-cover scale-[1.12] origin-center"
                src="/bento/hero-consolas.jpg"
                alt="PS5 y Xbox Series X — consolas Next-Gen"
              />

              {/* Corner decorators */}
              <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-primary-container/60 rounded-tl-md pointer-events-none" />
              <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-primary-container/60 rounded-tr-md pointer-events-none" />
              <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-tertiary-container/60 rounded-bl-md pointer-events-none" />
              <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-tertiary-container/60 rounded-br-md pointer-events-none" />

              {/* Shine sweep on hover */}
              <div className="hero-shine absolute inset-0 pointer-events-none z-30" />

              {/* NUEVO badge */}
              <div className="absolute top-5 right-5 hero-badge px-3 py-1.5 rounded-full text-xs font-bold z-10">
                NUEVO
              </div>

              {/* Overlay gradient at bottom */}
              <div className="absolute inset-x-0 bottom-0 h-16 pointer-events-none rounded-b-xl"
                style={{ background: 'linear-gradient(to top, rgba(6,7,9,0.5), transparent)' }} />
            </div>

            {/* Floating spec pills */}
            <div className="hero-pill-float-a hero-spec-pill absolute -left-16 top-[22%] shadow-lg"
              style={{ boxShadow: '0 0 12px rgba(57,255,20,0.3)' }}>
              <span className="material-symbols-outlined text-[14px]" style={{ color: SPEC_PILLS[0].color }}>
                {SPEC_PILLS[0].icon}
              </span>
              <span>{SPEC_PILLS[0].label}</span>
            </div>

            <div className="hero-pill-float-b hero-spec-pill absolute -right-16 top-[38%] shadow-lg"
              style={{ boxShadow: '0 0 12px rgba(58,244,255,0.3)' }}>
              <span className="material-symbols-outlined text-[14px]" style={{ color: SPEC_PILLS[1].color }}>
                {SPEC_PILLS[1].icon}
              </span>
              <span>{SPEC_PILLS[1].label}</span>
            </div>

            <div className="hero-pill-float-c hero-spec-pill absolute -left-14 bottom-[22%] shadow-lg"
              style={{ boxShadow: '0 0 12px rgba(255,74,141,0.3)' }}>
              <span className="material-symbols-outlined text-[14px]" style={{ color: SPEC_PILLS[2].color }}>
                {SPEC_PILLS[2].icon}
              </span>
              <span>{SPEC_PILLS[2].label}</span>
            </div>

          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
    </section>
  )
}
