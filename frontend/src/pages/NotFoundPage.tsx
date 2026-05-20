import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md mx-auto space-y-6">

        {/* Glitch number */}
        <div className="relative inline-block select-none">
          <span
            className="text-[8rem] sm:text-[10rem] font-black leading-none tracking-tighter font-['Plus_Jakarta_Sans'] text-transparent"
            style={{ WebkitTextStroke: '2px rgba(255,255,255,0.06)' }}
            aria-hidden="true"
          >
            404
          </span>
          <span
            className="absolute inset-0 flex items-center justify-center text-[8rem] sm:text-[10rem] font-black leading-none tracking-tighter font-['Plus_Jakarta_Sans'] text-transparent bg-clip-text"
            style={{ backgroundImage: 'linear-gradient(135deg, #a855f7 0%, #3af4ff 100%)' }}
          >
            404
          </span>
        </div>

        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-purple-400 text-3xl">search_off</span>
          </div>
        </div>

        {/* Copy */}
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-on-background font-['Plus_Jakarta_Sans']">
            Página no encontrada
          </h1>
          <p className="text-on-surface-variant text-sm leading-relaxed">
            Lo que buscás no existe o fue movido. Volvé al inicio y seguí explorando.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm rounded-xl transition-all active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">home</span>
            Volver al inicio
          </Link>
          <Link
            to="/products"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-on-surface font-semibold text-sm rounded-xl transition-all active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">sports_esports</span>
            Ver productos
          </Link>
        </div>
      </div>
    </main>
  )
}
