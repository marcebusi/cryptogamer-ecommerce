import { useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

interface Props {
  onClose: () => void
}

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
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-64 rounded-2xl overflow-hidden z-50"
      style={{
        background: 'rgba(8, 7, 18, 0.97)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        border: '1px solid rgba(138, 43, 226, 0.2)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.03) inset',
        animation: 'auth-slide-up 0.18s ease-out',
      }}
    >
      {/* Top glow line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent pointer-events-none" />

      {/* ── User header ──────────────────── */}
      <div className="px-4 py-4 flex items-center gap-3">
        {/* Avatar with gradient ring */}
        <div className="relative flex-shrink-0">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-600 to-violet-900 flex items-center justify-center text-sm font-black text-white shadow-[0_0_16px_rgba(138,43,226,0.5)]">
            {initials}
          </div>
          {isAdmin && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-yellow-400 flex items-center justify-center shadow-lg">
              <i className="fa-solid fa-bolt text-[8px] text-yellow-900" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-white truncate leading-tight">{user?.name ?? 'Usuario'}</p>
          <p className="text-[11px] text-purple-300/60 truncate mt-0.5">{user?.email}</p>
        </div>
      </div>

      {/* Role badge */}
      {isSuperAdmin && (
        <div className="px-4 pb-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-purple-300"
            style={{ background: 'rgba(138,43,226,0.15)', border: '1px solid rgba(138,43,226,0.35)' }}>
            <span className="material-symbols-outlined text-[10px]">shield_person</span>
            Superadmin
          </span>
        </div>
      )}
      {isAdmin && !isSuperAdmin && (
        <div className="px-4 pb-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-yellow-300"
            style={{ background: 'rgba(234,179,8,0.12)', border: '1px solid rgba(234,179,8,0.25)' }}>
            <i className="fa-solid fa-shield-halved text-[10px]" />
            Administrador
          </span>
        </div>
      )}

      {/* ── Divider ──────────────────────── */}
      <div className="mx-4 border-t border-white/8 mb-1" />

      {/* ── Menu items ───────────────────── */}
      <div className="px-2 py-2 space-y-0.5">

        <Link
          to="/perfil"
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/6 transition-all group"
        >
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-purple-600/15 group-hover:bg-purple-600/25 transition-colors flex-shrink-0">
            <i className="fa-solid fa-user text-purple-400 text-xs" />
          </div>
          Mi perfil
        </Link>

        {isSuperAdmin && (
          <>
            <div className="px-3 pt-2 pb-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Atenea Techs</p>
            </div>
            <Link
              to="/superadmin"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/6 transition-all group"
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-purple-600/20 group-hover:bg-purple-600/30 transition-colors flex-shrink-0">
                <span className="material-symbols-outlined text-purple-400 text-xs">shield_person</span>
              </div>
              Panel Superadmin
            </Link>
          </>
        )}

        {isAdmin && (
          <>
            <div className="px-3 pt-2 pb-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Admin</p>
            </div>

            <Link
              to="/admin"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/6 transition-all group"
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-cyan-500/12 group-hover:bg-cyan-500/22 transition-colors flex-shrink-0">
                <i className="fa-solid fa-gauge text-cyan-400 text-xs" />
              </div>
              Panel de Admin
            </Link>

            <Link
              to="/admin/productos"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/6 transition-all group"
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-green-500/12 group-hover:bg-green-500/22 transition-colors flex-shrink-0">
                <i className="fa-solid fa-plus text-green-400 text-xs" />
              </div>
              Agregar producto
            </Link>

            <Link
              to="/admin/productos?manage=true"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/6 transition-all group"
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-orange-500/12 group-hover:bg-orange-500/22 transition-colors flex-shrink-0">
                <i className="fa-solid fa-boxes-stacked text-orange-400 text-xs" />
              </div>
              Gestionar catálogo
            </Link>

            <Link
              to="/admin/categorias"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/6 transition-all group"
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-purple-500/12 group-hover:bg-purple-500/22 transition-colors flex-shrink-0">
                <i className="fa-solid fa-layer-group text-purple-400 text-xs" />
              </div>
              Categorías
            </Link>

            <Link
              to="/admin/vendedores"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/6 transition-all group"
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-yellow-500/12 group-hover:bg-yellow-500/22 transition-colors flex-shrink-0">
                <i className="fa-solid fa-users text-yellow-400 text-xs" />
              </div>
              Vendedores
            </Link>
          </>
        )}

        {/* ── Divider ──────────────────────── */}
        <div className="mx-1 border-t border-white/8 my-1" />

        <button
          onClick={() => { logout(); onClose() }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/8 transition-all group w-full text-left"
        >
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-red-500/10 group-hover:bg-red-500/18 transition-colors flex-shrink-0">
            <i className="fa-solid fa-arrow-right-from-bracket text-red-400 text-xs" />
          </div>
          Cerrar sesión
        </button>
      </div>

      <div className="h-2" />
    </div>
  )
}
