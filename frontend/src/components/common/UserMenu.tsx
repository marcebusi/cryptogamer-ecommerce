import { useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

interface Props { onClose: () => void }

export default function UserMenu({ onClose }: Props) {
  const { user, isAdmin, isSuperAdmin, logout } = useAuth()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [onClose])

  const initials = (user?.name ?? user?.email ?? 'U')
    .split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()

  return (
    <div ref={ref} className="user-menu-panel absolute right-0 top-full mt-2 w-64 rounded-2xl overflow-hidden z-50">
      {/* Top glow line */}
      <div className="user-menu-glow-line absolute top-0 left-0 right-0 h-px pointer-events-none" />

      {/* User header */}
      <div className="px-4 py-4 flex items-center gap-3">
        <div className="relative flex-shrink-0">
          <div className="user-menu-avatar w-11 h-11 rounded-xl flex items-center justify-center text-sm font-black text-white">
            {initials}
          </div>
          {isAdmin && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-yellow-400 flex items-center justify-center shadow-lg">
              <i className="fa-solid fa-bolt text-[8px] text-yellow-900" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="user-menu-name text-sm font-bold truncate leading-tight">{user?.name ?? 'Usuario'}</p>
          <p className="user-menu-email text-[11px] truncate mt-0.5">{user?.email}</p>
        </div>
      </div>

      {/* Role badges */}
      {isSuperAdmin && (
        <div className="px-4 pb-3">
          <span className="user-menu-badge-super inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
            <span className="material-symbols-outlined text-[10px]">shield_person</span>
            Superadmin
          </span>
        </div>
      )}
      {isAdmin && !isSuperAdmin && (
        <div className="px-4 pb-3">
          <span className="user-menu-badge-admin inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
            <i className="fa-solid fa-shield-halved text-[10px]" />
            Administrador
          </span>
        </div>
      )}

      <div className="user-menu-divider mx-4 border-t mb-1" />

      {/* Menu items */}
      <div className="px-2 py-2 space-y-0.5">
        <Link to="/perfil" onClick={onClose}
          className="user-menu-item flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group">
          <div className="user-menu-item-icon w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 icon-profile">
            <i className="fa-solid fa-user text-xs" />
          </div>
          Mi perfil
        </Link>

        {isSuperAdmin && (
          <>
            <div className="px-3 pt-2 pb-1">
              <p className="user-menu-section-label text-[10px] font-bold uppercase tracking-widest">Atenea Techs</p>
            </div>
            <Link to="/superadmin" onClick={onClose}
              className="user-menu-item flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group">
              <div className="user-menu-item-icon w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 icon-super">
                <span className="material-symbols-outlined text-xs">shield_person</span>
              </div>
              Panel Superadmin
            </Link>
          </>
        )}

        {isAdmin && !isSuperAdmin && (
          <>
            <div className="px-3 pt-2 pb-1">
              <p className="user-menu-section-label text-[10px] font-bold uppercase tracking-widest">Admin</p>
            </div>
            <Link to="/admin" onClick={onClose}
              className="user-menu-item flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group">
              <div className="user-menu-item-icon w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 icon-admin">
                <i className="fa-solid fa-gauge text-xs" />
              </div>
              Panel de Admin
            </Link>
            <Link to="/admin/productos" onClick={onClose}
              className="user-menu-item flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group">
              <div className="user-menu-item-icon w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 icon-add">
                <i className="fa-solid fa-plus text-xs" />
              </div>
              Agregar producto
            </Link>
            <Link to="/admin/productos?manage=true" onClick={onClose}
              className="user-menu-item flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group">
              <div className="user-menu-item-icon w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 icon-manage">
                <i className="fa-solid fa-boxes-stacked text-xs" />
              </div>
              Gestionar catálogo
            </Link>
          </>
        )}

        <div className="user-menu-divider mx-1 border-t my-1" />

        <button onClick={() => { logout(); onClose() }}
          className="user-menu-item-logout flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group w-full text-left">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 icon-logout">
            <i className="fa-solid fa-arrow-right-from-bracket text-xs" />
          </div>
          Cerrar sesión
        </button>
      </div>
      <div className="h-2" />
    </div>
  )
}
