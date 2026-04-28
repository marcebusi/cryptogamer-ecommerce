import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { navCategories, categoryById } from '../../data/categories'
import './Navbar.css'

export default function Navbar() {
  const { totalItems, openCart } = useCart()
  const navigate = useNavigate()
  const [productosOpen, setProductosOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [hoveredCat, setHoveredCat] = useState<string | null>(null)
  const [hoveredSub, setHoveredSub] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProductosOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const openDropdown = () => {
    setProductosOpen(true)
    setHoveredCat(prev => prev ?? navCategories[0].id)
  }

  const closeDropdown = () => {
    setProductosOpen(false)
    setHoveredCat(null)
    setHoveredSub(null)
  }

  const goTo = (cat: string, sub?: string) => {
    const p = new URLSearchParams({ cat })
    if (sub) p.set('sub', sub)
    navigate(`/products?${p.toString()}`)
    closeDropdown()
    setMobileOpen(false)
  }

  const hoveredCatDef = hoveredCat ? categoryById[hoveredCat] : null
  const hoveredSubDef = hoveredSub
    ? hoveredCatDef?.children?.find(s => s.id === hoveredSub) ?? null
    : null
  const hasSubSub = !!(hoveredSubDef?.children?.length)

  return (
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

          {/* Productos mega-dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              className="flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-cyan-400 transition-all duration-300 cursor-pointer"
              onMouseEnter={openDropdown}
              onClick={() => setProductosOpen(p => !p)}
              aria-haspopup="true"
              aria-expanded={productosOpen}
            >
              Productos
              <span className={`material-symbols-outlined text-sm transition-transform duration-200 ${productosOpen ? 'rotate-180' : ''}`}>
                expand_more
              </span>
            </button>

            {/* Mega dropdown panel */}
            <div
              className={`productos-dropdown absolute left-1/2 -translate-x-1/2 top-full mt-2 rounded-xl border border-purple-500/20 shadow-[0_8px_40px_rgba(0,0,0,0.6)] transition-all duration-200 overflow-hidden ${
                productosOpen
                  ? 'opacity-100 visible translate-y-0'
                  : 'opacity-0 invisible -translate-y-2 pointer-events-none'
              }`}
              onMouseLeave={closeDropdown}
            >
              <div className="flex">
                {/* Left col: all categories */}
                <div className="w-[185px] border-r border-white/8 p-sm space-y-0.5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant px-xs mb-xs">
                    Categorías
                  </p>
                  {navCategories.map(cat => (
                    <button
                      key={cat.id}
                      onMouseEnter={() => { setHoveredCat(cat.id); setHoveredSub(null) }}
                      onClick={() => goTo(cat.id)}
                      className={`w-full flex items-center gap-2 px-xs py-2 rounded-lg text-sm transition-all duration-150 cursor-pointer ${
                        hoveredCat === cat.id
                          ? 'bg-white/10 text-on-surface'
                          : 'text-on-surface-variant hover:bg-white/5 hover:text-on-surface'
                      }`}
                    >
                      <span className={`material-symbols-outlined text-base flex-shrink-0 ${hoveredCat === cat.id ? 'text-primary-container' : 'text-on-surface-variant'}`}>
                        {cat.icon}
                      </span>
                      <span className="flex-1 text-left font-medium">{cat.label}</span>
                      {cat.children && (
                        <span className={`material-symbols-outlined text-xs flex-shrink-0 transition-colors ${hoveredCat === cat.id ? 'text-on-surface-variant' : 'text-on-surface-variant/30'}`}>
                          chevron_right
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Middle col: sub-categories */}
                <div className={`w-[185px] border-r border-white/8 p-sm space-y-0.5 transition-opacity duration-150 ${hoveredCatDef?.children ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                  {hoveredCatDef?.children && (
                    <>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-primary-container px-xs mb-xs">
                        {hoveredCatDef.label}
                      </p>
                      {hoveredCatDef.children.map(sub => (
                        <button
                          key={sub.id}
                          onMouseEnter={() => setHoveredSub(sub.id)}
                          onClick={() => sub.children ? undefined : goTo(hoveredCat!, sub.id)}
                          className={`w-full flex items-center gap-2 px-xs py-2 rounded-lg text-sm transition-all duration-150 cursor-pointer ${
                            hoveredSub === sub.id
                              ? 'bg-white/10 text-cyan-400'
                              : 'text-on-surface-variant hover:bg-white/5 hover:text-cyan-400'
                          }`}
                        >
                          <span className="flex-1 text-left">{sub.label}</span>
                          {sub.children && (
                            <span className={`material-symbols-outlined text-xs flex-shrink-0 transition-colors ${hoveredSub === sub.id ? 'text-cyan-400' : 'text-on-surface-variant/40'}`}>
                              chevron_right
                            </span>
                          )}
                        </button>
                      ))}
                    </>
                  )}
                </div>

                {/* Right col: sub-sub-categories (Joysticks flyout) */}
                <div className={`w-[160px] p-sm space-y-0.5 transition-opacity duration-150 ${hasSubSub ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                  {hasSubSub && hoveredSubDef && (
                    <>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 px-xs mb-xs">
                        {hoveredSubDef.label}
                      </p>
                      {hoveredSubDef.children!.map(ssub => (
                        <button
                          key={ssub.id}
                          onClick={() => goTo(hoveredCat!, ssub.id)}
                          className="w-full flex items-center gap-2 px-xs py-2 rounded-lg text-sm text-on-surface-variant hover:text-cyan-400 hover:bg-white/5 transition-all duration-150 cursor-pointer"
                        >
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
            to="/products"
            className={({ isActive }) =>
              isActive
                ? 'text-cyan-500 dark:text-cyan-400 font-bold border-b-2 border-cyan-400 transition-all duration-300'
                : 'text-slate-600 dark:text-slate-300 hover:text-cyan-400 hover:scale-105 transition-all duration-300'
            }
          >
            Ofertas
          </NavLink>

          {/* Contacto */}
          <a
            href="#footer"
            className="text-slate-600 dark:text-slate-300 hover:text-cyan-400 hover:scale-105 transition-all duration-300"
          >
            Contacto
          </a>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-sm">
          {/* Cart */}
          <button
            onClick={openCart}
            className="relative text-slate-300 p-2 hover:text-primary-container transition-colors active:scale-95 cursor-pointer"
            aria-label="Abrir carrito"
          >
            <span className="material-symbols-outlined">shopping_cart</span>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-secondary-container text-on-secondary text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                {totalItems}
              </span>
            )}
          </button>

          {/* Profile */}
          <button
            className="text-slate-300 p-2 hover:text-purple-400 transition-colors active:scale-95 cursor-pointer"
            aria-label="Perfil"
          >
            <span className="material-symbols-outlined">person</span>
          </button>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-slate-300 p-2 hover:text-cyan-400 transition-colors cursor-pointer"
            onClick={() => setMobileOpen(p => !p)}
            aria-label="Menú"
          >
            <span className="material-symbols-outlined">{mobileOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-slate-950/95 border-t border-purple-500/20 px-4 py-md space-y-xs">
          <p className="text-xs text-on-surface-variant uppercase tracking-widest mb-xs">Categorías</p>
          {navCategories.map(cat => (
            <div key={cat.id}>
              <button
                onClick={() => goTo(cat.id)}
                className="w-full flex items-center gap-xs px-sm py-xs text-sm text-on-surface-variant hover:text-cyan-400 transition-colors cursor-pointer border-l border-white/10"
              >
                <span className="material-symbols-outlined text-sm">{cat.icon}</span>
                {cat.label}
              </button>
              {cat.children && (
                <div className="ml-sm pl-sm border-l border-white/5 space-y-0.5 mb-xs">
                  {cat.children.map(sub => (
                    <div key={sub.id}>
                      <button
                        onClick={() => sub.children ? undefined : goTo(cat.id, sub.id)}
                        className="w-full text-left text-xs text-on-surface-variant hover:text-cyan-400 py-1 cursor-pointer transition-colors"
                      >
                        {sub.label}
                      </button>
                      {sub.children && (
                        <div className="ml-sm pl-sm border-l border-white/5">
                          {sub.children.map(ssub => (
                            <button
                              key={ssub.id}
                              onClick={() => goTo(cat.id, ssub.id)}
                              className="w-full text-left text-xs text-on-surface-variant/70 hover:text-cyan-400 py-0.5 cursor-pointer transition-colors"
                            >
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
          ))}
          <div className="border-t border-white/10 pt-sm space-y-sm">
            <Link to="/products" onClick={() => setMobileOpen(false)} className="block text-slate-300 hover:text-cyan-400 font-semibold text-sm">
              Ofertas
            </Link>
            <a href="#footer" onClick={() => setMobileOpen(false)} className="block text-slate-300 hover:text-cyan-400 font-semibold text-sm">
              Contacto
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
