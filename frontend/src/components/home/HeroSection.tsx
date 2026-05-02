import { useNavigate } from 'react-router-dom'
import './HeroSection.css'

const STATS = [
  { value: '+5.000',  label: 'Productos'  },
  { value: '+12.000', label: 'Clientes'   },
  { value: '4.9★',   label: 'Calificación'},
]

export default function HeroSection() {
  const navigate = useNavigate()

  return (
    <section className="hero-section relative w-full min-h-[560px] sm:min-h-[640px] md:min-h-[760px] flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          className="w-full h-full object-cover opacity-35"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAEg16l2OPghql1MGbDUQg3Zqt6oKv8ROdvEE1tva1uTnbvyNiwqiSKQYk8hy5bUhallxheG5NPnNw475abksCy9oLaDuyOtefJwDdPP78Z8bni8JzYDVJXqwIMhZ0Pf_IURNphZD5RW4zgBFCG2d2OOMN5ansR4WY8gqyd_beqWj6mY5NsbM5pkmCK-V0_Iymyf5nJtpv2fqS21ZyHrPQaE49zbXnq1OBNp5VBqWNzzqB8g6nlG_MUswXmn47uZ6aOaA7ccZt1obM"
          alt="Setup de gaming futurista"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 md:via-background/65 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 md:px-margin py-16 md:py-0 grid md:grid-cols-2 gap-lg items-center">

        {/* Left */}
        <div className="space-y-5 md:space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary-container/25 bg-primary-container/8 text-primary-container text-xs font-bold tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse" />
            Edición Limitada
          </div>

          <h1 className="text-[2.2rem] sm:text-5xl md:text-[3.4rem] font-black leading-[1.05] tracking-tight text-on-background font-['Plus_Jakarta_Sans']">
            POTENCIA{' '}
            <span className="hero-gradient-text">NEXT-GEN</span>
            <br />SIN LÍMITES
          </h1>

          <p className="text-sm sm:text-base md:text-[17px] text-on-surface-variant max-w-md leading-relaxed">
            La selección más completa de consolas, accesorios y juegos de Argentina.
            Equipos nuevos y pre-owned certificados. Envíos a todo el país.
          </p>

          <div className="flex flex-wrap gap-3 pt-1">
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
          <div className="flex gap-6 pt-2">
            {STATS.map(s => (
              <div key={s.label}>
                <p className="text-xl font-black text-on-background font-['Plus_Jakarta_Sans']">{s.value}</p>
                <p className="text-xs text-on-surface-variant mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right — md+ */}
        <div className="hidden md:flex justify-center items-center">
          <div className="relative">
            <div className="hero-product-glow absolute -inset-8 rounded-full blur-3xl opacity-25" />
            <div className="relative rounded-2xl overflow-hidden border hero-product-border p-3 hero-glass">
              <img
                className="w-full max-w-[420px] h-auto rounded-xl shadow-2xl"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAleQLDCs7vR7gBQK7f3BdwpRFVqnNl_hMrYEOF79qWovdJZUPmTIa8NgBy_QbWwfr5MfFKRRzphtWhts8gmVUAzDheSaKd9fS5pqJi9JPKrc8GFqIP9cKCEfiRqRevT2ZG_-AHUBE1qNbODZH2o0jAC703adMJHQeRwW2b2M1p3d5d22GwomLghJ3EOV8ABeFtYYcyJLIEZnC1n7zCvWgv1mAS5itwkb0MaYlyrXz4SeGeIpvw8J0CLHXPjdUmGZH11SpIZ99ELJM"
                alt="Hardware gaming de alto rendimiento"
              />
              <div className="absolute top-5 right-5 hero-badge px-3 py-1.5 rounded-full text-xs font-bold">
                NUEVO
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent z-10" />
    </section>
  )
}
