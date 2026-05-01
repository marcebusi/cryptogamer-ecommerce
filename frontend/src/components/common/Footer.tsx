import { Link } from 'react-router-dom'
import './Footer.css'

const shopLinks = [
  { label: 'Consolas',   to: '/products?cat=consoles'    },
  { label: 'Accesorios', to: '/products?cat=accessories' },
  { label: 'Juegos',     to: '/products?cat=games'       },
  { label: 'Móviles',    to: '/products?cat=mobile'      },
  { label: 'Audio',      to: '/products?cat=audio'       },
  { label: 'Perfumes',   to: '/products?cat=perfumes'    },
]

const infoLinks = [
  { label: 'Sobre nosotros', to: '/'        },
  { label: 'Ofertas',        to: '/ofertas' },
  { label: 'Soporte',        to: '/'        },
  { label: 'Privacidad',     to: '/'        },
]

const socials = [
  { icon: 'public',        label: 'Sitio web',  color: 'hover:text-cyan-400   hover:shadow-[0_0_12px_rgba(58,244,255,0.5)]'  },
  { icon: 'forum',         label: 'Discord',    color: 'hover:text-indigo-400 hover:shadow-[0_0_12px_rgba(99,102,241,0.5)]'  },
  { icon: 'photo_camera',  label: 'Instagram',  color: 'hover:text-pink-400   hover:shadow-[0_0_12px_rgba(236,72,153,0.5)]'  },
]

export default function Footer() {
  return (
    <footer id="footer" className="bg-slate-950 w-full border-t border-purple-500/20">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 px-4 sm:px-6 py-10 md:py-12 max-w-7xl mx-auto divide-y md:divide-y-0 divide-slate-800">

        {/* ── Brand ────────────────────────────── */}
        <div className="col-span-2 md:col-span-1 space-y-md border-none">
          <Link
            to="/"
            className="block text-xl font-black text-purple-400 font-['Plus_Jakarta_Sans'] italic
              hover:text-primary-container transition-colors duration-300
              hover:drop-shadow-[0_0_10px_rgba(57,255,20,0.5)]"
          >
            Cryptogamer
          </Link>
          <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
            La mejor selección de consolas, accesorios y juegos de toda Argentina. Envíos a todo el país.
          </p>

          {/* Social icons */}
          <div className="flex gap-sm">
            {socials.map(s => (
              <button
                key={s.label}
                aria-label={s.label}
                className={`
                  material-symbols-outlined text-slate-400 cursor-pointer
                  w-9 h-9 rounded-lg border border-white/10
                  flex items-center justify-center
                  transition-all duration-200
                  hover:border-white/25 hover:-translate-y-0.5 hover:scale-110
                  active:scale-95
                  ${s.color}
                `}
              >
                {s.icon}
              </button>
            ))}
          </div>
        </div>

        {/* ── Shop ─────────────────────────────── */}
        <div className="pt-8 md:pt-0 border-none">
          <h5 className="text-on-background font-bold text-sm mb-md font-['Plus_Jakarta_Sans'] uppercase tracking-wider">
            Tienda
          </h5>
          <ul className="space-y-xs">
            {shopLinks.map(({ label, to }) => (
              <li key={label}>
                <Link
                  to={to}
                  className="
                    group flex items-center gap-1
                    text-slate-500 text-sm
                    hover:text-primary-container
                    transition-all duration-200
                    cursor-pointer font-['Plus_Jakarta_Sans']
                  "
                >
                  <span className="
                    w-0 overflow-hidden group-hover:w-3
                    transition-all duration-200
                    material-symbols-outlined text-[11px]
                  ">chevron_right</span>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Info ─────────────────────────────── */}
        <div className="pt-8 md:pt-0 border-none">
          <h5 className="text-on-background font-bold text-sm mb-md font-['Plus_Jakarta_Sans'] uppercase tracking-wider">
            Información
          </h5>
          <ul className="space-y-xs">
            {infoLinks.map(({ label, to }) => (
              <li key={label}>
                <Link
                  to={to}
                  className="
                    group flex items-center gap-1
                    text-slate-500 text-sm
                    hover:text-cyan-400
                    transition-all duration-200
                    cursor-pointer font-['Plus_Jakarta_Sans']
                  "
                >
                  <span className="
                    w-0 overflow-hidden group-hover:w-3
                    transition-all duration-200
                    material-symbols-outlined text-[11px]
                  ">chevron_right</span>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Newsletter ───────────────────────── */}
        <div className="pt-8 md:pt-0 border-none">
          <h5 className="text-on-background font-bold text-sm mb-md font-['Plus_Jakarta_Sans'] uppercase tracking-wider">
            Newsletter
          </h5>
          <p className="text-slate-500 text-xs mb-sm leading-relaxed">
            Suscribite para recibir ofertas exclusivas y lanzamientos.
          </p>
          <form
            onSubmit={e => {
              e.preventDefault()
              ;(e.currentTarget.querySelector('input') as HTMLInputElement).value = ''
            }}
            className="flex gap-xs"
          >
            <input
              type="email"
              placeholder="tu@email.com"
              required
              className="
                bg-surface-container border border-outline-variant
                text-sm rounded-lg w-full px-3 py-2
                focus:ring-2 focus:ring-primary-container/40 focus:border-primary-container
                outline-none text-on-surface placeholder:text-slate-500
                transition-all duration-200
              "
            />
            <button
              type="submit"
              aria-label="Suscribirse"
              className="
                bg-purple-600 text-white p-2 rounded-lg cursor-pointer flex-shrink-0
                hover:bg-primary-container hover:text-on-primary
                hover:shadow-[0_0_16px_rgba(57,255,20,0.4)]
                active:scale-90
                transition-all duration-200
              "
            >
              <span className="material-symbols-outlined text-sm">send</span>
            </button>
          </form>
        </div>
      </div>

      {/* ── Bottom bar ────────────────────────── */}
      <div className="px-4 sm:px-6 py-5 border-t border-purple-500/10 text-center text-slate-500 text-xs font-['Plus_Jakarta_Sans']">
        © {new Date().getFullYear()} Cryptogamer. Todos los derechos reservados.
      </div>
    </footer>
  )
}
