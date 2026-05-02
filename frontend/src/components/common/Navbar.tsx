import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { useCategories, parseCategoryChildren } from '../../context/CategoriesContext'
import type { CategoryChild } from '../../types'
import AuthModal from './AuthModal'
import UserMenu from './UserMenu'
import { useTheme } from '../../context/ThemeContext'
import './Navbar.css'

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

export default function Navbar() {
  const { totalItems, openCart } = useCart()
  const { isAuthenticated, user } = useAuth()
  const { isDark, toggleTheme } = useTheme()
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

  // Live search
  const [searchQuery, setSearchQuery]       = useState('')
  const [searchResults, setSearchResults]   = useState<any[]>([])
  const [searchLoading, setSearchLoading]   = useState(false)
  const [searchOpen, setSearchOpen]         = useState(false)
  const searchRef   = useRef<HTMLDivElement>(null)
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProductosOpen(false)
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSearch = (q: string) => {
    setSearchQuery(q)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    if (!q.trim()) { setSearchResults([]); setSearchOpen(false); return }
    setSearchLoading(true)
    searchTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`${BASE}/api/products?search=${encodeURIComponent(q)}&pageSize=6`)
        const data = await res.json()
        setSearchResults(data.data ?? [])
        setSearchOpen(true)
      } catch { setSearchResults([]) }
      finally { setSearchLoading(false) }
    }, 300)
  }

  const goToSearch = () => {
    if (!searchQuery.trim()) return
    navigate(`/products?search=${encodeURIComponent(searchQuery)}`)
    setSearchOpen(false)
    setSearchQuery('')
  }

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
      <header className="navbar-header sticky top-0 z-50">
        <div className="flex justify-between items-center px-4 md:px-8 h-[58px] max-w-screen-2xl mx-auto gap-4">

          {/* ── Logo ─────────────────────────────── */}
          <Link to="/" className="navbar-logo-glow flex items-center gap-2 flex-shrink-0">
            {/* Gamepad icon */}
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-purple-900 flex items-center justify-center shadow-[0_0_12px_rgba(138,43,226,0.5)] flex-shrink-0">
              <i className="fa-solid fa-gamepad text-white text-sm" />
            </div>
            <span className="font-black italic text-white font-['Plus_Jakarta_Sans'] tracking-tight text-lg leading-none">
              Crypto<span className="text-purple-400">gamer</span>
              <span className="text-purple-300">'s</span>
            </span>
          </Link>

          {/* ── Desktop nav ──────────────────────── */}
          <nav className="hidden md:flex items-center gap-1 font-['Plus_Jakarta_Sans']">

            {/* Productos */}
            <div ref={dropdownRef} className="relative flex items-center">
              <Link
                to="/products"
                onMouseEnter={openDropdown}
                className="nav-pill flex items-center gap-0.5">
                Productos
              </Link>
              <button
                onMouseEnter={openDropdown}
                onClick={() => setProductosOpen(p => !p)}
                aria-haspopup="true"
                aria-expanded={productosOpen}
                className="nav-pill !px-1.5 cursor-pointer">
                <span className={`material-symbols-outlined text-sm transition-transform duration-200 ${productosOpen ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>

              {/* Mega dropdown */}
              <div
                className={`productos-dropdown absolute left-1/2 -translate-x-1/2 top-full mt-3 transition-all duration-200 ${
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
                            hoveredCatSlug === cat.slug ? 'bg-purple-600/15 text-on-surface' : 'text-on-surface-variant hover:bg-white/5 hover:text-on-surface'
                          }`}>
                          <span className={`material-symbols-outlined text-base flex-shrink-0 ${hoveredCatSlug === cat.slug ? 'text-purple-400' : 'text-on-surface-variant'}`}>
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
                  <div className={`w-[195px] border-r border-white/8 p-sm space-y-0.5 transition-opacity duration-150 ${hoveredChildren.length > 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    {hoveredChildren.length > 0 && hoveredCat && (
                      <>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-purple-400 px-xs mb-xs">
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
                            <span className="flex-1 text-left whitespace-nowrap">{sub.label}</span>
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
                  <div className={`w-[210px] p-sm space-y-0.5 transition-opacity duration-150 ${hasSubSub ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
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
                            <span className="material-symbols-outlined text-xs text-cyan-400/60 flex-shrink-0">chevron_right</span>
                            <span className="whitespace-nowrap">{ssub.label}</span>
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
              className={({ isActive }) => `nav-pill ${isActive ? 'active-pill' : ''}`}>
              <i className="fa-solid fa-bolt text-xs mr-1 text-yellow-400" />
              Ofertas
            </NavLink>

            {/* Contacto */}
            <NavLink
              to="/contacto"
              className={({ isActive }) => `nav-pill ${isActive ? 'active-pill' : ''}`}>
              Contacto
            </NavLink>
          </nav>

          {/* ── Actions ──────────────────────────── */}
          <div className="flex items-center gap-2">

            {/* Live Search */}
            <div ref={searchRef} className="relative hidden md:block">
              <div className="navbar-search">
                <span className="material-symbols-outlined text-on-surface-variant" style={{fontSize:'16px'}}>search</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => handleSearch(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && goToSearch()}
                  placeholder="Buscar productos..."
                  className="bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none w-36 lg:w-48"
                />
                {searchLoading && <span className="material-symbols-outlined text-on-surface-variant animate-spin" style={{fontSize:'14px'}}>progress_activity</span>}
              </div>

              {/* Results dropdown */}
              {searchOpen && searchResults.length > 0 && (
                <div className="search-dropdown absolute top-full mt-2 left-0 w-80 z-50">
                  {searchResults.map((p: any) => (
                    <Link
                      key={p.id}
                      to={`/products/${p.id}`}
                      onClick={() => { setSearchOpen(false); setSearchQuery('') }}
                      className="search-dropdown-item flex items-center gap-3 px-4 py-3"
                    >
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-10 h-10 object-contain rounded-lg bg-[#0b0c12] flex-shrink-0"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-on-surface font-semibold truncate">{p.name}</p>
                        <p className="text-xs text-purple-400 font-bold">${p.price?.toFixed(0)}</p>
                      </div>
                    </Link>
                  ))}
                  <button
                    onClick={goToSearch}
                    className="w-full px-4 py-3 text-xs text-center text-purple-400 hover:bg-white/5 border-t border-white/8 transition-colors font-semibold"
                  >
                    Ver todos los resultados para "{searchQuery}"
                  </button>
                </div>
              )}

              {searchOpen && !searchLoading && searchResults.length === 0 && searchQuery.trim() && (
                <div className="search-dropdown absolute top-full mt-2 left-0 w-72 p-4 text-sm text-on-surface-variant text-center z-50">
                  Sin resultados para "{searchQuery}"
                </div>
              )}
            </div>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="navbar-icon-btn cursor-pointer"
              aria-label={isDark ? 'Modo claro' : 'Modo oscuro'}
              title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                {isDark ? 'light_mode' : 'dark_mode'}
              </span>
            </button>

            {/* Cart */}
            <button
              onClick={openCart}
              className="navbar-icon-btn cursor-pointer"
              aria-label="Abrir carrito">
              <span className="material-symbols-outlined" style={{fontSize:'20px'}}>shopping_cart</span>
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-purple-600 text-white text-[10px] font-black rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-[0_0_8px_rgba(138,43,226,0.7)]">
                  {totalItems}
                </span>
              )}
            </button>

            {/* User */}
            <div ref={userBtnRef} className="relative">
              <button
                onClick={() => isAuthenticated ? setUserMenuOpen(p => !p) : setAuthOpen(true)}
                className="navbar-icon-btn cursor-pointer"
                aria-label={isAuthenticated ? 'Mi cuenta' : 'Iniciar sesión'}>
                {isAuthenticated ? (
                  <span className="text-[11px] font-black text-purple-300">
                    {(user?.name ?? user?.email ?? 'U').charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <span className="material-symbols-outlined" style={{fontSize:'20px'}}>person</span>
                )}
              </button>
              {userMenuOpen && isAuthenticated && (
                <UserMenu onClose={() => setUserMenuOpen(false)} />
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden navbar-icon-btn cursor-pointer"
              onClick={() => setMobileOpen(p => !p)}
              aria-label="Menú">
              <span className="material-symbols-outlined" style={{fontSize:'20px'}}>{mobileOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-purple-500/15 px-4 py-md space-y-xs" style={{background:'rgba(8,6,18,0.97)'}}>
            <p className="text-xs text-on-surface-variant uppercase tracking-widest mb-xs font-semibold">Categorías</p>
            {categories.map(cat => {
              const children = parseCategoryChildren(cat.children)
              return (
                <div key={cat.id}>
                  <button
                    onClick={() => goTo(cat.slug)}
                    className="w-full flex items-center gap-xs px-sm py-xs text-sm text-on-surface-variant hover:text-purple-300 transition-colors cursor-pointer border-l border-purple-500/20">
                    <span className="material-symbols-outlined text-sm">{cat.icon}</span>
                    {cat.name}
                  </button>
                  {children.length > 0 && (
                    <div className="ml-sm pl-sm border-l border-white/5 space-y-0.5 mb-xs">
                      {children.map(sub => (
                        <div key={sub.id}>
                          <button
                            onClick={() => (sub.children?.length ?? 0) > 0 ? undefined : goTo(cat.slug, sub.id)}
                            className="w-full text-left text-xs text-on-surface-variant hover:text-purple-300 py-1 cursor-pointer transition-colors">
                            {sub.label}
                          </button>
                          {sub.children && (
                            <div className="ml-sm pl-sm border-l border-white/5">
                              {sub.children.map(ssub => (
                                <button
                                  key={ssub.id}
                                  onClick={() => goTo(cat.slug, ssub.id)}
                                  className="w-full text-left text-xs text-on-surface-variant/70 hover:text-purple-300 py-0.5 cursor-pointer transition-colors">
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
            <div className="border-t border-white/8 pt-sm space-y-sm">
              <Link to="/ofertas" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 text-on-surface-variant hover:text-purple-300 font-semibold text-sm transition-colors">
                <i className="fa-solid fa-bolt text-yellow-400 text-xs" />Ofertas
              </Link>
              <Link to="/contacto" onClick={() => setMobileOpen(false)} className="block text-on-surface-variant hover:text-purple-300 font-semibold text-sm transition-colors">Contacto</Link>
            </div>
          </div>
        )}
      </header>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  )
}

