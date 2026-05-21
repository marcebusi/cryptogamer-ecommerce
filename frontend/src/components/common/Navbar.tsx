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

  // Desktop dropdown
  const [productosOpen, setProductosOpen] = useState(false)
  const [hoveredCatSlug, setHoveredCatSlug] = useState<string | null>(null)
  const [hoveredSubId,   setHoveredSubId]   = useState<string | null>(null)

  // Mobile drawer
  const [mobileOpen, setMobileOpen]         = useState(false)
  const [expandedCatSlug, setExpandedCatSlug] = useState<string | null>(null)
  const [mobileSearchQuery, setMobileSearchQuery] = useState('')

  // Auth / user menu
  const [authOpen,     setAuthOpen]     = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userBtnRef  = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Desktop live search
  const [searchQuery,   setSearchQuery]   = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchOpen,    setSearchOpen]    = useState(false)
  const searchRef   = useRef<HTMLDivElement>(null)
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  // Close dropdown/search on outside click
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

  const goToSearch = (q: string = searchQuery) => {
    if (!q.trim()) return
    navigate(`/products?search=${encodeURIComponent(q)}`)
    setSearchOpen(false)
    setSearchQuery('')
    setMobileOpen(false)
    setMobileSearchQuery('')
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

  const hoveredCat      = categories.find(c => c.slug === hoveredCatSlug) ?? null
  const hoveredChildren: CategoryChild[] = hoveredCat ? parseCategoryChildren(hoveredCat.children) : []
  const hoveredSub: CategoryChild | null = hoveredSubId
    ? (hoveredChildren.find(s => s.id === hoveredSubId) ?? null)
    : null
  const hasSubSub = !!(hoveredSub?.children?.length)

  return (
    <>
      <header className="navbar-header sticky top-0 z-50">
        <div className="flex justify-between items-center px-4 md:px-8 h-[58px] max-w-screen-2xl mx-auto gap-4">

          {/* ── Logo ─────────────────────────────── */}
          <Link to="/" className="navbar-logo-glow flex items-center gap-2 flex-shrink-0">
            <div className="navbar-logo-icon w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0">
              <i className="fa-solid fa-gamepad text-white text-sm" />
            </div>
            <span className="navbar-logo-text font-black italic font-['Plus_Jakarta_Sans'] tracking-tight text-lg leading-none">
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
          <div className="flex items-center gap-1.5 md:gap-2">

            {/* Desktop Live Search */}
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
                        className="w-10 h-10 object-contain rounded-lg product-img-bg flex-shrink-0"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-on-surface font-semibold truncate">{p.name}</p>
                        <p className="text-xs text-purple-400 font-bold">${p.price?.toFixed(0)}</p>
                      </div>
                    </Link>
                  ))}
                  <button
                    onClick={() => goToSearch()}
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

            {/* Theme toggle — desktop only */}
            <button
              onClick={toggleTheme}
              className="hidden md:flex navbar-icon-btn cursor-pointer"
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

            {/* User — desktop only */}
            <div ref={userBtnRef} className="relative hidden md:block">
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
              aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}>
              <span className="material-symbols-outlined" style={{fontSize:'20px'}}>
                {mobileOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Drawer Overlay ─────────────────────────── */}
      <div
        className={`mobile-drawer-overlay md:hidden fixed inset-0 z-[60] transition-opacity duration-300 ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      {/* ── Mobile Drawer ────────────────────────────────── */}
      <div
        className={`mobile-drawer md:hidden fixed top-0 right-0 h-full z-[70] flex flex-col transition-transform duration-300 ease-out ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-4 h-[58px] flex-shrink-0 border-b border-white/8">
          <Link
            to="/"
            onClick={() => setMobileOpen(false)}
            className="navbar-logo-glow flex items-center gap-2">
            <div className="navbar-logo-icon w-7 h-7 rounded-xl flex items-center justify-center">
              <i className="fa-solid fa-gamepad text-white text-xs" />
            </div>
            <span className="navbar-logo-text font-black italic font-['Plus_Jakarta_Sans'] tracking-tight text-base leading-none">
              Crypto<span className="text-purple-400">gamer</span>
            </span>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="navbar-icon-btn cursor-pointer"
            aria-label="Cerrar menú">
            <span className="material-symbols-outlined" style={{fontSize:'20px'}}>close</span>
          </button>
        </div>

        {/* Search bar */}
        <div className="px-4 py-3 flex-shrink-0 border-b border-white/8">
          <div className="navbar-search w-full">
            <span className="material-symbols-outlined text-on-surface-variant" style={{fontSize:'16px'}}>search</span>
            <input
              type="search"
              value={mobileSearchQuery}
              onChange={e => setMobileSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && goToSearch(mobileSearchQuery)}
              placeholder="Buscar productos..."
              className="bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none flex-1 min-w-0"
              autoComplete="off"
            />
            {mobileSearchQuery.trim() && (
              <button
                onClick={() => goToSearch(mobileSearchQuery)}
                className="text-purple-400 text-xs font-bold whitespace-nowrap cursor-pointer transition-opacity hover:opacity-80">
                Buscar
              </button>
            )}
          </div>
        </div>

        {/* Quick nav links */}
        <div className="px-4 py-3 flex-shrink-0 border-b border-white/8 flex gap-2">
          <NavLink
            to="/ofertas"
            onClick={() => setMobileOpen(false)}
            className="drawer-nav-chip flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-full text-sm font-semibold transition-all cursor-pointer">
            <i className="fa-solid fa-bolt text-yellow-400 text-xs" />
            Ofertas
          </NavLink>
          <NavLink
            to="/contacto"
            onClick={() => setMobileOpen(false)}
            className="drawer-nav-chip flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-full text-sm font-semibold transition-all cursor-pointer">
            <span className="material-symbols-outlined text-sm">mail</span>
            Contacto
          </NavLink>
        </div>

        {/* Categories accordion — scrollable */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2 px-1">Categorías</p>
          <div className="space-y-0.5">
            {categories.map(cat => {
              const children = parseCategoryChildren(cat.children)
              const isExpanded = expandedCatSlug === cat.slug

              return (
                <div key={cat.id}>
                  <button
                    onClick={() => {
                      if (children.length > 0) {
                        setExpandedCatSlug(isExpanded ? null : cat.slug)
                      } else {
                        goTo(cat.slug)
                      }
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer ${
                      isExpanded
                        ? 'bg-purple-600/12 text-on-surface'
                        : 'text-on-surface-variant hover:bg-white/5 hover:text-on-surface'
                    }`}>
                    <span className={`material-symbols-outlined text-base flex-shrink-0 ${isExpanded ? 'text-purple-400' : 'text-on-surface-variant'}`}>
                      {cat.icon}
                    </span>
                    <span className="flex-1 text-left">{cat.name}</span>
                    {children.length > 0 ? (
                      <span className={`material-symbols-outlined text-sm flex-shrink-0 transition-transform duration-200 ${
                        isExpanded ? 'rotate-180 text-purple-400' : 'text-on-surface-variant/40'
                      }`}>
                        expand_more
                      </span>
                    ) : (
                      <span className="material-symbols-outlined text-sm flex-shrink-0 text-on-surface-variant/30">
                        chevron_right
                      </span>
                    )}
                  </button>

                  {/* Subcategories */}
                  {isExpanded && children.length > 0 && (
                    <div className="ml-3 pl-4 border-l border-purple-500/20 space-y-0.5 mb-2">
                      <button
                        onClick={() => goTo(cat.slug)}
                        className="w-full text-left text-xs px-3 py-2 rounded-lg text-on-surface-variant hover:text-purple-300 hover:bg-white/5 transition-all cursor-pointer font-semibold">
                        Ver todos
                      </button>
                      {children.map(sub => (
                        <div key={sub.id}>
                          <button
                            onClick={() => {
                              if (!(sub.children?.length)) goTo(cat.slug, sub.id)
                              else setExpandedCatSlug(sub.id) // won't conflict — just a visual toggle
                            }}
                            className="w-full text-left text-xs px-3 py-2 rounded-lg text-on-surface-variant hover:text-purple-300 hover:bg-white/5 transition-all cursor-pointer">
                            {sub.label}
                          </button>
                          {sub.children?.map(ssub => (
                            <button
                              key={ssub.id}
                              onClick={() => goTo(cat.slug, ssub.id)}
                              className="w-full text-left text-xs px-3 py-1.5 rounded-lg text-on-surface-variant/60 hover:text-purple-300 hover:bg-white/5 transition-all cursor-pointer pl-6">
                              › {ssub.label}
                            </button>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Drawer footer */}
        <div className="px-4 pb-6 pt-3 flex-shrink-0 border-t border-white/8 space-y-2">
          {/* User account */}
          {isAuthenticated ? (
            <button
              onClick={() => { navigate('/profile'); setMobileOpen(false) }}
              className="w-full drawer-footer-btn flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-purple-600/30 flex items-center justify-center text-purple-300 text-xs font-black flex-shrink-0">
                {(user?.name ?? user?.email ?? 'U').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-on-surface text-sm font-semibold truncate">{user?.name ?? user?.email}</p>
                <p className="text-on-surface-variant text-xs">Mi cuenta</p>
              </div>
              <span className="material-symbols-outlined text-sm text-on-surface-variant/50 flex-shrink-0">chevron_right</span>
            </button>
          ) : (
            <button
              onClick={() => { setAuthOpen(true); setMobileOpen(false) }}
              className="w-full drawer-footer-btn-primary flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer">
              <span className="material-symbols-outlined text-sm">person</span>
              Iniciar sesión
            </button>
          )}

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="w-full drawer-footer-btn flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer">
            <span className="material-symbols-outlined text-base">
              {isDark ? 'light_mode' : 'dark_mode'}
            </span>
            {isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          </button>
        </div>
      </div>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  )
}
