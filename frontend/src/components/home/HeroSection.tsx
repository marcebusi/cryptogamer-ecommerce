import { useNavigate } from 'react-router-dom'
import './HeroSection.css'

export default function HeroSection() {
  const navigate = useNavigate()

  return (
    <section className="hero-section relative w-full h-[870px] flex items-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img
          className="w-full h-full object-cover opacity-40"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAEg16l2OPghql1MGbDUQg3Zqt6oKv8ROdvEE1tva1uTnbvyNiwqiSKQYk8hy5bUhallxheG5NPnNw475abksCy9oLaDuyOtefJwDdPP78Z8bni8JzYDVJXqwIMhZ0Pf_IURNphZD5RW4zgBFCG2d2OOMN5ansR4WY8gqyd_beqWj6mY5NsbM5pkmCK-V0_Iymyf5nJtpv2fqS21ZyHrPQaE49zbXnq1OBNp5VBqWNzzqB8g6nlG_MUswXmn47uZ6aOaA7ccZt1obM"
          alt="Futuristic gaming setup with neon lighting"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-margin grid md:grid-cols-2 gap-lg items-center w-full">
        {/* Left: text */}
        <div className="space-y-md">
          <div className="inline-block px-sm py-1 rounded-full border border-primary-container/30 bg-primary-container/10 text-primary-container font-label-caps uppercase text-xs">
            Ultra Rare Drop
          </div>

          <h1 className="font-h1-display text-h1-display text-on-background">
            LIMITLESS{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-container to-tertiary-container">
              EMPRESS-X
            </span>
            <br />
            CHROME EDITION
          </h1>

          <p className="text-body-lg font-body-lg text-on-surface-variant max-w-lg">
            Experience pure performance with the world's most powerful handheld. Overclocked internals,
            liquid-cooled architecture, and a zero-latency OLED display.
          </p>

          <div className="flex flex-wrap gap-sm pt-md">
            <button
              onClick={() => navigate('/products?cat=consoles')}
              className="bg-primary-container text-on-primary px-lg py-sm font-button-text text-button-text rounded-lg hover:shadow-[0_0_20px_rgba(57,255,20,0.5)] transition-all active:scale-95 flex items-center gap-xs cursor-pointer"
            >
              VER CONSOLAS
              <span className="material-symbols-outlined text-sm">bolt</span>
            </button>
            <button
              onClick={() => navigate('/products/ps5')}
              className="border border-secondary-container text-secondary px-lg py-sm font-button-text text-button-text rounded-lg hover:bg-secondary-container/10 transition-all flex items-center gap-xs cursor-pointer"
            >
              VER SPECS
              <span className="material-symbols-outlined text-sm">visibility</span>
            </button>
          </div>
        </div>

        {/* Right: glass card */}
        <div className="hidden md:block relative">
          <div className="absolute -inset-4 bg-primary-container/5 rounded-full blur-3xl" />
          <div className="hero-glass-card relative scanline rounded-xl overflow-hidden border border-white/10 glass-panel p-sm">
            <img
              className="w-full h-auto rounded-lg shadow-2xl"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAleQLDCs7vR7gBQK7f3BdwpRFVqnNl_hMrYEOF79qWovdJZUPmTIa8NgBy_QbWwfr5MfFKRRzphtWhts8gmVUAzDheSaKd9fS5pqJi9JPKrc8GFqIP9cKCEfiRqRevT2ZG_-AHUBE1qNbODZH2o0jAC703adMJHQeRwW2b2M1p3d5d22GwomLghJ3EOV8ABeFtYYcyJLIEZnC1n7zCvWgv1mAS5itwkb0MaYlyrXz4SeGeIpvw8J0CLHXPjdUmGZH11SpIZ99ELJM"
              alt="High-performance gaming hardware with neon glow"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
