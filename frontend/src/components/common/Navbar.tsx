import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { useCategories, parseCategoryChildren } from '../../context/CategoriesContext'
import type { CategoryChild } from '../../types'
import AuthModal from './AuthModal'
import UserMenu from './UserMenu'
import './Navbar.css'

export default function Navbar() {
  const { totalItems, openCart } = useCart()
  const { isAuthenticated, user } = useAuth()
  const { categories } = useCategories()
  const navigate = useNavigate()

  const [productosOpen, setProductosOpen] = useState(false)
  const [mobileOpen, setMobileOpen]       = useState(false)
  const [hoveredCatSlug, setHoveredCatSlug] = useState<string | null>(null)
  const [hoveredSubId,   setHoveredSubId]   = useState<string | null>(null)

  const [authOpen,     setAuthOpen]     = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userBtnRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProductosOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const openDropdown = () => {
    setProductosOpen(true)
    setHoveredCatSlug(prev => prev ?? (categories[0]?.slug ?? null))
  }
  const closeDropdown = () => {
    setProductosOpen(false)
    setHoveredCatSlug(null)
    setHoveredSubId(null)
  }

  const goTo = (catSlug: string, sub?: string) => {
    const p = new URLSearchParams({ cat: catSlug })
    if (sub) p.set('sub', sub)
    navigate(`/products?${p.toString()}`)
    closeDropdown()
    setMobileOpen(false)
  }

  // Derive current hovered data
  const hoveredCat       = categories.find(c => c.slug === hoveredCatSlug) ?? null
  const hoveredChildren: CategoryChild[] = hoveredCat ? parseCategoryChildren(hoveredCat.children) : []
  const hoveredSub: CategoryChild | null = hoveredSubId ? (hoveredChildren.find(s => s.id === hoveredSubId) ?? null) : null
  const hasSubSub = !!(hoveredSub?.children?.length)

  return (
    <>
      <header className="navbar-header bg-white/80 dark:bg-slate-950/80 backdrop-blur-2xl sticky top-0 z-50 border-b border-purple-500/20 shadow-[0_4px_20px_-5px_rgba(138,43,226,0.3)]">
        <div className="flex justify-between items-center px-4 md:px-8 py-3 max-w-screen-2xl mx-auto">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-xs">
            <span className="text-2xl font-black italic text-purple-600 dark:text-purple-400 drop-shadow-[0_0_10px_rgba(138,43,226,0.6)] font-['Plus_Jakarta_Sans'] tracking-tight">
              Cryptogamer
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-md font-['Plus_Jakarta_Sans'] font-semibold tracking-tight">

            {/* Productos — label navigates, chevron toggles dropdown */}
            <div ref={dropdownRef} className="relative flex items-center">
              <Link
                to="/products"
                onMouseEnter={openDropdown}
                className="text-slate-600 dark:text-slate-300 hover:text-cyan-400 transition-all duration-300">
                Productos
              </Link>
              <button
                onMouseEnter={openDropdown}
                onClick={() => setProductosOpen(p => !p)}
                aria-haspopup="true"
                aria-expanded={productosOpen}
                className="ml-0.5 text-slate-600 dark:text-slate-300 hover:text-cyan-400 transition-all duration-300 cursor-pointer">
                <span className={`material-symbols-outlined text-sm transition-transform duration-200 ${productosOpen ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>

              {/* Mega dropdown */}
              <div
                className={`productos-dropdown absolute left-1/2 -translate-x-1/2 top-full mt-2 rounded-xl border border-purple-500/20 shadow-[0_8px_40px_rgba(0,0,0,0.6)] transition-all duration-200 overflow-hidden ${
                  productosOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2 pointer-events-none'
                }`}
                onMouseLeave={closeDropdown}>
                <div className="flex">
                  {/* Left col: categories */}
                  <div className="w-[185px] border-r border-white/8 p-sm space-y-0.5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant px-xs mb-xs">Categorías</p>
                    {categories.map(cat => {
                      const catChildren = parseCategoryChildren(cat.children)
                      return (
                        <button
                          key={cat.id}
                          onMouseEnter={() => { setHoveredCatSlug(cat.slug); setHoveredSubId(null) }}
                          onClick={() => goTo(cat.slug)}
                          className={`w-full flex items-center gap-2 px-xs py-2 rounded-lg text-sm transition-all duration-150 cursor-pointer ${
                            hoveredCatSlug === cat.slug ? 'bg-white/10 text-on-surface' : 'text-on-surface-variant hover:bg-white/5 hover:text-on-surface'
                          }`}>
                          <span className={`material-symbols-outlined text-base flex-shrink-0 ${hoveredCatSlug === cat.slug ? 'text-primary-container' : 'text-on-surface-variant'}`}>
                            {cat.icon}
                          </span>
                          <span className="flex-1 text-left font-medium">{cat.name}</span>
                          {catChildren.length > 0 && (
                            <span className={`material-symbols-outlined text-xs flex-shrink-0 ${hoveredCatSlug === cat.slug ? 'text-on-surface-variant' : 'text-on-surface-variant/30'}`}>
                              chevron_right
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>

                  {/* Middle col: sub-categories */}
                  <div className={`w-[185px] border-r border-white/8 p-sm space-y-0.5 transition-opacity duration-150 ${hoveredChildren.length > 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    {hoveredChildren.length > 0 && hoveredCat && (
                      <>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-primary-container px-xs mb-xs">
                          {hoveredCat.name}
                        </p>
                        {hoveredChildren.map(sub => (
                          <button
                            key={sub.id}
                            onMouseEnter={() => setHoveredSubId(sub.id)}
                            onClick={() => (sub.children?.length ?? 0) > 0 ? undefined : goTo(hoveredCatSlug!, sub.id)}
                            className={`w-full flex items-center gap-2 px-xs py-2 rounded-lg text-sm transition-all duration-150 cursor-pointer ${
                              hoveredSubId === sub.id ? 'bg-white/10 text-cyan-400' : 'text-on-surface-variant hover:bg-white/5 hover:text-cyan-400'
                            }`}>
                            <span className="flex-1 text-left">{sub.label}</span>
                            {(sub.children?.length ?? 0) > 0 && (
                              <span className={`material-symbols-outlined text-xs flex-shrink-0 ${hoveredSubId === sub.id ? 'text-cyan-400' : 'text-on-surface-variant/40'}`}>
                                chevron_right
                              </span>
                            )}
                          </button>
                        ))}
                      </>
                    )}
                  </div>

                  {/* Right col: sub-sub-categories */}
                  <div className={`w-[160px] p-sm space-y-0.5 transition-opacity duration-150 ${hasSubSub ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    {hasSubSub && hoveredSub && (
                      <>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 px-xs mb-xs">
                          {hoveredSub.label}
                        </p>
                        {hoveredSub.children!.map(ssub => (
                          <button
                            key={ssub.id}
                            onClick={() => goTo(hoveredCatSlug!, ssub.id)}
                            className="w-full flex items-center gap-2 px-xs py-2 rounded-lg text-sm text-on-surface-variant hover:text-cyan-400 hover:bg-white/5 transition-all duration-150 cursor-pointer">
                            <span className="material-symbols-outlined text-xs text-cyan-400/60">chevron_right</span>
                            {ssub.label}
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Ofertas */}
            <NavLink
              to="/ofertas"
              className={({ isActive }) =>
                isActive
                  ? 'text-cyan-500 dark:text-cyan-400 font-bold border-b-2 border-cyan-400 transition-all duration-300'
                  : 'text-slate-600 dark:text-slate-300 hover:text-cyan-400 hover:scale-105 transition-all duration-300'
              }>
              Ofertas
            </NavLink>

            {/* Contacto */}
            <NavLink
              to="/contacto"
              className={({ isActive }) =>
                isActive
                  ? 'text-cyan-500 dark:text-cyan-400 font-bold border-b-2 border-cyan-400 transition-all duration-300'
                  : 'text-slate-600 dark:text-slate-300 hover:text-cyan-400 hover:scale-105 transition-all duration-300'
              }>
              Contacto
            </NavLink>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-sm">
            <button
              onClick={openCart}
              className="relative text-slate-300 p-2 hover:text-primary-container transition-colors active:scale-95 cursor-pointer"
              aria-label="Abrir carrito">
              <span className="material-symbols-outlined">shopping_cart</span>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-secondary-container text-on-secondary text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                  {totalItems}
                </span>
              )}
            </button>

            {/* User button */}
            <div ref={userBtnRef} className="relative">
              <button
                onClick={() => isAuthenticated ? setUserMenuOpen(p => !p) : setAuthOpen(true)}
                className="text-slate-300 p-2 hover:text-purple-400 transition-colors active:scale-95 cursor-pointer relative"
                aria-label={isAuthenticated ? 'Mi cuenta' : 'Iniciar sesión'}>
                {isAuthenticated ? (
                  <div className="w-7 h-7 rounded-full bg-purple-600/40 border border-purple-500/50 flex items-center justify-center text-[10px] font-black text-purple-300">
                    {(user?.name ?? user?.email ?? 'U').charAt(0).toUpperCase()}
                  </div>
                ) : (
                  <span className="material-symbols-outlined">person</span>
                )}
              </button>
              {userMenuOpen && isAuthenticated && (
                <UserMenu onClose={() => setUserMenuOpen(false)} />
              )}
            </div>

            <button
              className="md:hidden text-slate-300 p-2 hover:text-cyan-400 transition-colors cursor-pointer"
              onClick={() => setMobileOpen(p => !p)}
              aria-label="Menú">
              <span className="material-symbols-outlined">{mobileOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-slate-950/95 border-t border-purple-500/20 px-4 py-md space-y-xs">
            <p className="text-xs text-on-surface-variant uppercase tracking-widest mb-xs">Categorías</p>
            {categories.map(cat => {
              const children = parseCategoryChildren(cat.children)
              return (
                <div key={cat.id}>
                  <button
                    onClick={() => goTo(cat.slug)}
                    className="w-full flex items-center gap-xs px-sm py-xs text-sm text-on-surface-variant hover:text-cyan-400 transition-colors cursor-pointer border-l border-white/10">
                    <span className="material-symbols-outlined text-sm">{cat.icon}</span>
                    {cat.name}
                  </button>
                  {children.length > 0 && (
                    <div className="ml-sm pl-sm border-l border-white/5 space-y-0.5 mb-xs">
                      {children.map(sub => (
                        <div key={sub.id}>
                          <button
                            onClick={() => (sub.children?.length ?? 0) > 0 ? undefined : goTo(cat.slug, sub.id)}
                            className="w-full text-left text-xs text-on-surface-variant hover:text-cyan-400 py-1 cursor-pointer transition-colors">
                            {sub.label}
                          </button>
                          {sub.children && (
                            <div className="ml-sm pl-sm border-l border-white/5">
                              {sub.children.map(ssub => (
                                <button
                                  key={ssub.id}
                                  onClick={() => goTo(cat.slug, ssub.id)}
                                  className="w-full text-left text-xs text-on-surface-variant/70 hover:text-cyan-400 py-0.5 cursor-pointer transition-colors">
                                  › {ssub.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
            <div className="border-t border-white/10 pt-sm space-y-sm">
              <Link to="/ofertas" onClick={() => setMobileOpen(false)} className="block text-slate-300 hover:text-cyan-400 font-semibold text-sm">Ofertas</Link>
              <Link to="/contacto" onClick={() => setMobileOpen(false)} className="block text-slate-300 hover:text-cyan-400 font-semibold text-sm">Contacto</Link>
            </div>
          </div>
        )}
      </header>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  )
}
