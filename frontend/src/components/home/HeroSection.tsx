import { useNavigate } from 'react-router-dom'
import './HeroSection.css'

export default function HeroSection() {
  const navigate = useNavigate()

  return (
    <section className="hero-section relative w-full min-h-[540px] sm:min-h-[620px] md:min-h-[780px] flex items-center overflow-hidden py-16 md:py-0">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img
          className="w-full h-full object-cover opacity-40"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAEg16l2OPghql1MGbDUQg3Zqt6oKv8ROdvEE1tva1uTnbvyNiwqiSKQYk8hy5bUhallxheG5NPnNw475abksCy9oLaDuyOtefJwDdPP78Z8bni8JzYDVJXqwIMhZ0Pf_IURNphZD5RW4zgBFCG2d2OOMN5ansR4WY8gqyd_beqWj6mY5NsbM5pkmCK-V0_Iymyf5nJtpv2fqS21ZyHrPQaE49zbXnq1OBNp5VBqWNzzqB8g6nlG_MUswXmn47uZ6aOaA7ccZt1obM"
          alt="Setup de gaming futurista con iluminación neon"
          loading="eager"
        />
        {/* stronger gradient on mobile so text is always readable */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 md:via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent md:hidden" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 md:px-margin grid md:grid-cols-2 gap-lg items-center w-full">
        {/* Left: text */}
        <div className="space-y-4 md:space-y-md">
          <div className="inline-block px-sm py-1 rounded-full border border-primary-container/30 bg-primary-container/10 text-primary-container font-label-caps uppercase text-xs">
            Edición Limitada
          </div>

          <h1 className="text-[2.15rem] sm:text-5xl md:text-[52px] font-black leading-[1.1] tracking-tight text-on-background font-['Plus_Jakarta_Sans']">
            POTENCIA{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-container to-tertiary-container">
              NEXT-GEN
            </span>
            <br className="hidden sm:block" />
            {' '}SIN LÍMITES
          </h1>

          <p className="text-sm sm:text-base md:text-body-lg text-on-surface-variant max-w-lg leading-relaxed">
            La selección más completa de consolas, accesorios y juegos de Argentina.
            Equipos nuevos y pre-owned certificados. Envíos a todo el país.
          </p>

          <div className="flex flex-wrap gap-xs sm:gap-sm pt-2 md:pt-md">
            <button
              onClick={() => navigate('/products?cat=consoles')}
              className="bg-primary-container text-on-primary px-5 sm:px-lg py-3 sm:py-sm font-bold text-sm rounded-lg hover:shadow-[0_0_20px_rgba(57,255,20,0.5)] transition-all active:scale-95 flex items-center gap-xs cursor-pointer"
            >
              VER CONSOLAS
              <span className="material-symbols-outlined text-sm">bolt</span>
            </button>
            <button
              onClick={() => navigate('/ofertas')}
              className="border border-secondary-container text-secondary px-5 sm:px-lg py-3 sm:py-sm font-bold text-sm rounded-lg hover:bg-secondary-container/10 transition-all flex items-center gap-xs cursor-pointer"
            >
              OFERTAS
              <span className="material-symbols-outlined text-sm">local_offer</span>
            </button>
          </div>

          {/* Trust signals — mobile-friendly */}
          <div className="flex flex-wrap gap-3 pt-1 md:pt-sm">
            {[
              { icon: 'local_shipping', label: 'Envío gratis +$200' },
              { icon: 'workspace_premium', label: 'Garantía 90 días' },
              { icon: 'verified_user', label: 'Pago 100% seguro' },
            ].map(t => (
              <div key={t.label} className="flex items-center gap-1 text-xs text-on-surface-variant">
                <span className="material-symbols-outlined text-sm text-primary-container">{t.icon}</span>
                {t.label}
              </div>
            ))}
          </div>
        </div>

        {/* Right: glass card — only on md+ */}
        <div className="hidden md:block relative">
          <div className="absolute -inset-4 bg-primary-container/5 rounded-full blur-3xl" />
          <div className="hero-glass-card relative scanline rounded-xl overflow-hidden border border-white/10 glass-panel p-sm">
            <img
              className="w-full h-auto rounded-lg shadow-2xl"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAleQLDCs7vR7gBQK7f3BdwpRFVqnNl_hMrYEOF79qWovdJZUPmTIa8NgBy_QbWwfr5MfFKRRzphtWhts8gmVUAzDheSaKd9fS5pqJi9JPKrc8GFqIP9cKCEfiRqRevT2ZG_-AHUBE1qNbODZH2o0jAC703adMJHQeRwW2b2M1p3d5d22GwomLghJ3EOV8ABeFtYYcyJLIEZnC1n7zCvWgv1mAS5itwkb0MaYlyrXz4SeGeIpvw8J0CLHXPjdUmGZH11SpIZ99ELJM"
              alt="Hardware gaming de alto rendimiento con glow neon"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
