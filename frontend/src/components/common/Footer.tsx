import { Link } from 'react-router-dom'
import './Footer.css'

const shopLinks = [
  { label: 'Consolas', to: '/products?cat=consoles' },
  { label: 'Accesorios', to: '/products?cat=accessories' },
  { label: 'Juegos', to: '/products?cat=games' },
  { label: 'Móviles', to: '/products?cat=mobile' },
  { label: 'Audio', to: '/products?cat=audio' },
  { label: 'Perfumes', to: '/products?cat=perfumes' },
]

const infoLinks = [
  { label: 'Sobre nosotros', to: '/' },
  { label: 'Ofertas', to: '/ofertas' },
  { label: 'Soporte', to: '/' },
  { label: 'Privacidad', to: '/' },
]

export default function Footer() {
  return (
    <footer id="footer" className="bg-slate-950 w-full border-t border-purple-500/20">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 px-4 sm:px-6 py-10 md:py-12 max-w-7xl mx-auto divide-y md:divide-y-0 divide-slate-800">

        {/* Brand */}
        <div className="col-span-2 md:col-span-1 space-y-md border-none">
          <Link to="/" className="block text-xl font-black text-purple-600 dark:text-purple-400 font-['Plus_Jakarta_Sans'] italic">
            Cryptogamer
          </Link>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs">
            La mejor selección de consolas, accesorios y juegos de toda Argentina. Envíos a todo el país.
          </p>
          <div className="flex gap-sm">
            <button
              className="material-symbols-outlined text-slate-400 cursor-pointer hover:text-cyan-400 transition-colors"
              aria-label="Sitio web"
            >
              public
            </button>
            <button
              className="material-symbols-outlined text-slate-400 cursor-pointer hover:text-cyan-400 transition-colors"
              aria-label="Foro"
            >
              forum
            </button>
            <button
              className="material-symbols-outlined text-slate-400 cursor-pointer hover:text-cyan-400 transition-colors"
              aria-label="Compartir"
            >
              share
            </button>
          </div>
        </div>

        {/* Shop */}
        <div className="pt-8 md:pt-0 border-none">
          <h5 className="text-on-background font-button-text text-button-text mb-md font-['Plus_Jakarta_Sans']">Tienda</h5>
          <ul className="space-y-xs">
            {shopLinks.map(({ label, to }) => (
              <li key={label}>
                <Link
                  to={to}
                  className="text-slate-500 dark:text-slate-400 text-sm hover:text-cyan-400 transition-colors cursor-pointer font-['Plus_Jakarta_Sans']"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Info */}
        <div className="pt-8 md:pt-0 border-none">
          <h5 className="text-on-background font-button-text text-button-text mb-md font-['Plus_Jakarta_Sans']">Información</h5>
          <ul className="space-y-xs">
            {infoLinks.map(({ label, to }) => (
              <li key={label}>
                <Link
                  to={to}
                  className="text-slate-500 dark:text-slate-400 text-sm hover:text-cyan-400 transition-colors cursor-pointer font-['Plus_Jakarta_Sans']"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Newsletter */}
        <div className="pt-8 md:pt-0 border-none">
          <h5 className="text-on-background font-button-text text-button-text mb-md font-['Plus_Jakarta_Sans']">Newsletter</h5>
          <p className="text-slate-500 dark:text-slate-400 text-xs mb-sm">
            Suscribite para recibir ofertas exclusivas y lanzamientos.
          </p>
          <form
            onSubmit={e => { e.preventDefault(); (e.currentTarget.querySelector('input') as HTMLInputElement).value = '' }}
            className="flex gap-xs"
          >
            <input
              type="email"
              placeholder="tu@email.com"
              required
              className="bg-surface-container border border-outline-variant text-sm rounded w-full px-2 py-1 focus:ring-1 focus:ring-primary-container focus:border-primary-container outline-none text-on-surface placeholder:text-slate-500"
            />
            <button
              type="submit"
              className="bg-purple-600 text-white p-2 rounded cursor-pointer hover:bg-purple-500 transition-colors flex-shrink-0"
              aria-label="Suscribirse"
            >
              <span className="material-symbols-outlined text-sm">send</span>
            </button>
          </form>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-5 border-t border-purple-500/10 text-center text-slate-500 text-xs font-['Plus_Jakarta_Sans']">
        © 2025 Cryptogamer. Todos los derechos reservados.
      </div>
    </footer>
  )
}
