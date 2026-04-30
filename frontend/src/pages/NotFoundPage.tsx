import { Link } from 'react-router-dom'
import { AlertCircle, ArrowLeft } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-surface-elevated p-8 rounded-2xl shadow-xl border border-white/5 max-w-md w-full flex flex-col items-center space-y-6">
        <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center">
          <AlertCircle className="w-10 h-10 text-error" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-display font-bold text-white">404</h1>
          <h2 className="text-xl font-medium text-white/90">Página no encontrada</h2>
          <p className="text-white/60">
            Lo sentimos, la página que estás buscando no existe o fue movida.
          </p>
        </div>

        <Link 
          to="/"
          className="flex items-center gap-2 bg-primary text-primary-content px-6 py-3 rounded-xl font-medium hover:bg-primary-hover transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
