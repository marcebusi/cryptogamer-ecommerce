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
  { fa: 'fa-brands fa-facebook', label: 'Facebook', href: 'https://www.facebook.com/gabriel.diosquez.31', color: 'hover:text-blue-500 hover:border-blue-500/40' },
  { fa: 'fa-brands fa-whatsapp', label: 'WhatsApp', href: 'https://wa.me/5491166506985',                     color: 'hover:text-green-400 hover:border-green-400/40' },
]

export default function Footer() {
  return (
    <footer id="footer" className="bg-slate-950 w-full border-t border-purple-500/20">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 px-4 sm:px-6 py-10 md:py-12 max-w-7xl mx-auto">

        {/* Brand */}
        <div className="col-span-2 md:col-span-1 space-y-md">
          <Link to="/"
            className="block text-xl font-black text-purple-400 font-['Plus_Jakarta_Sans'] italic
              hover:text-primary-container transition-colors duration-300">
            Cryptogamer
          </Link>
          <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
            La mejor selección de consolas, accesorios y juegos de toda Argentina. Envíos a todo el país.
          </p>
          <div className="flex gap-xs">
            {socials.map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                className={`social-btn text-slate-400 cursor-pointer
                  w-9 h-9 rounded-lg border border-white/10
                  flex items-center justify-center
                  transition-all duration-200
                  hover:-translate-y-0.5
                  ${s.color}`}>
                <i className={s.fa} />
              </a>
            ))}
          </div>
        </div>

        {/* Tienda */}
        <div className="pt-8 md:pt-0">
          <h5 className="text-white/80 font-bold text-xs mb-md font-['Plus_Jakarta_Sans'] uppercase tracking-widest">Tienda</h5>
          <ul className="space-y-xs">
            {shopLinks.map(({ label, to }) => (
              <li key={label}>
                <Link to={to}
                  className="text-slate-500 text-sm hover:text-primary-container
                    transition-all duration-200 cursor-pointer font-['Plus_Jakarta_Sans']
                    hover:translate-x-1 inline-block">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Información */}
        <div className="pt-8 md:pt-0">
          <h5 className="text-white/80 font-bold text-xs mb-md font-['Plus_Jakarta_Sans'] uppercase tracking-widest">Información</h5>
          <ul className="space-y-xs">
            {infoLinks.map(({ label, to }) => (
              <li key={label}>
                <Link to={to}
                  className="text-slate-500 text-sm hover:text-cyan-400
                    transition-all duration-200 cursor-pointer font-['Plus_Jakarta_Sans']
                    hover:translate-x-1 inline-block">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Newsletter */}
        <div className="pt-8 md:pt-0">
          <h5 className="text-white/80 font-bold text-xs mb-md font-['Plus_Jakarta_Sans'] uppercase tracking-widest">Newsletter</h5>
          <p className="text-slate-500 text-xs mb-sm leading-relaxed">
            Suscribite para recibir ofertas exclusivas y lanzamientos.
          </p>
          <form onSubmit={e => { e.preventDefault(); (e.currentTarget.querySelector('input') as HTMLInputElement).value = '' }}
            className="flex gap-xs">
            <input type="email" placeholder="tu@email.com" required
              className="bg-surface-container border border-outline-variant
                text-sm rounded-lg w-full px-3 py-2
                focus:ring-2 focus:ring-primary-container/40 focus:border-primary-container
                outline-none text-on-surface placeholder:text-slate-500
                transition-all duration-200"/>
            <button type="submit" aria-label="Suscribirse"
              className="bg-purple-600 text-white p-2 rounded-lg cursor-pointer flex-shrink-0
                hover:bg-primary-container hover:text-on-primary
                hover:shadow-[0_0_16px_rgba(57,255,20,0.35)]
                active:scale-90 transition-all duration-200">
              <span className="material-symbols-outlined text-sm">send</span>
            </button>
          </form>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-5 border-t border-purple-500/10 text-center text-slate-500 text-xs font-['Plus_Jakarta_Sans']">
        © {new Date().getFullYear()} Cryptogamer. Todos los derechos reservados.
      </div>
    </footer>
  )
}
