import { useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

interface Props {
  onClose: () => void
}

export default function UserMenu({ onClose }: Props) {
  const { user, isAdmin, logout } = useAuth()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [onClose])

  const initials = (user?.name ?? user?.email ?? 'U')
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()

  const itemCls = 'flex items-center gap-sm px-sm py-2.5 rounded-lg text-sm text-on-surface-variant hover:bg-white/5 hover:text-on-surface transition-all cursor-pointer w-full text-left'

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-56 bg-[#0e0f16]/97 backdrop-blur-2xl border border-purple-500/20 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.6)] overflow-hidden"
      style={{ animation: 'auth-slide-up 0.18s ease-out' }}
    >
      {/* User info */}
      <div className="px-sm py-sm border-b border-white/8 flex items-center gap-sm">
        <div className="w-9 h-9 rounded-full bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-xs font-black text-purple-300 flex-shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-on-surface truncate">{user?.name ?? 'Usuario'}</p>
          <p className="text-[11px] text-on-surface-variant truncate">{user?.email}</p>
        </div>
      </div>

      {/* Role badge */}
      {isAdmin && (
        <div className="px-sm py-xs border-b border-white/8">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-600/20 border border-purple-500/30 text-purple-300 text-[10px] font-bold rounded-full uppercase tracking-widest">
            <span className="material-symbols-outlined text-xs">admin_panel_settings</span>
            Administrador
          </span>
        </div>
      )}

      {/* Links */}
      <div className="p-xs space-y-0.5">
        <Link to="/perfil" onClick={onClose} className={itemCls}>
          <span className="material-symbols-outlined text-base text-purple-400">manage_accounts</span>
          Mi perfil
        </Link>

        {isAdmin && (
          <>
            <Link to="/admin" onClick={onClose} className={itemCls}>
              <span className="material-symbols-outlined text-base text-primary-container">dashboard</span>
              Panel de Admin
            </Link>
            <Link to="/admin/productos" onClick={onClose} className={itemCls}>
              <span className="material-symbols-outlined text-base text-primary-container">add_box</span>
              Agregar producto
            </Link>
            <Link to="/admin/productos?manage=true" onClick={onClose} className={itemCls}>
              <span className="material-symbols-outlined text-base text-tertiary-container">inventory_2</span>
              Gestionar catálogo
            </Link>
            <Link to="/admin/categorias" onClick={onClose} className={itemCls}>
              <span className="material-symbols-outlined text-base text-secondary-container">category</span>
              Categorías
            </Link>
          </>
        )}

        <div className="border-t border-white/8 pt-xs mt-xs">
          <button
            onClick={() => { logout(); onClose() }}
            className={`${itemCls} text-error hover:text-error hover:bg-error/10`}
          >
            <span className="material-symbols-outlined text-base">logout</span>
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  )
}
