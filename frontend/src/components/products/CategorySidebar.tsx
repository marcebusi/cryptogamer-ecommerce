import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useCategories, parseCategoryChildren } from '../../context/CategoriesContext'
import './CategorySidebar.css'

const CONDITIONS = [
  { value: 'new',       label: 'Nuevo' },
  { value: 'like-new',  label: 'Como Nuevo' },
  { value: 'excellent', label: 'Excelente' },
  { value: 'good',      label: 'Bueno' },
]

interface Props {
  mobileOpen?: boolean
  onMobileClose?: () => void
  sliderMax?: number
  onSliderMaxChange?: (v: number) => void
  selectedConditions?: string[]
  onConditionToggle?: (c: string) => void
}

export default function CategorySidebar({ mobileOpen, onMobileClose, sliderMax = 2000, onSliderMaxChange, selectedConditions = [], onConditionToggle }: Props) {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { categories } = useCategories()

  const activeCat = searchParams.get('cat') ?? ''
  const activeSub = searchParams.get('sub') ?? ''

  const [expanded, setExpanded] = useState<Set<string>>(() =>
    activeCat ? new Set([activeCat]) : new Set()
  )

  useEffect(() => {
    if (activeCat) setExpanded(prev => new Set([...prev, activeCat]))
  }, [activeCat])

  const goTo = (catSlug: string, sub?: string) => {
    const p = new URLSearchParams({ cat: catSlug })
    if (sub) p.set('sub', sub)
    navigate(`/products?${p.toString()}`)
    onMobileClose?.()
  }

  const toggleExpand = (slug: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(slug) ? next.delete(slug) : next.add(slug)
      return next
    })
  }

  const content = (
    <div className="space-y-md">
      {/* ── Categories ─────────────────── */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-sm font-['Plus_Jakarta_Sans']">
          Categorías
        </h3>
        <ul className="space-y-0.5">
          <li>
            <button
              onClick={() => { navigate('/products'); onMobileClose?.() }}
              className={`w-full flex items-center gap-xs px-sm py-xs rounded-lg text-sm transition-all duration-150 cursor-pointer ${
                !activeCat
                  ? 'bg-surface-container-high text-on-surface border-l-4 border-primary-container shadow-[0_0_12px_rgba(57,255,20,0.08)]'
                  : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
              }`}>
              <span className={`material-symbols-outlined text-sm ${!activeCat ? 'text-primary-container' : ''}`}>apps</span>
              <span className="flex-1 text-left font-medium">Todos los productos</span>
            </button>
          </li>

          {categories.map(cat => {
            const children  = parseCategoryChildren(cat.children)
            const isActive  = activeCat === cat.slug
            const isExpanded = expanded.has(cat.slug)

            return (
              <li key={cat.id}>
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={() => goTo(cat.slug)}
                    className={`flex-1 flex items-center gap-xs px-sm py-xs rounded-lg text-sm transition-all duration-150 cursor-pointer ${
                      isActive
                        ? 'bg-surface-container-high text-on-surface border-l-4 border-primary-container shadow-[0_0_12px_rgba(57,255,20,0.08)]'
                        : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                    }`}>
                    <span className={`material-symbols-outlined text-sm flex-shrink-0 ${isActive ? 'text-primary-container' : ''}`}>
                      {cat.icon}
                    </span>
                    <span className="flex-1 text-left font-medium">{cat.name}</span>
                  </button>

                  {children.length > 0 && (
                    <button
                      onClick={() => toggleExpand(cat.slug)}
                      className="p-1.5 rounded-md text-on-surface-variant hover:text-cyan-400 hover:bg-white/5 transition-all cursor-pointer flex-shrink-0"
                      aria-label={isExpanded ? 'Colapsar' : 'Expandir'}>
                      <span className={`material-symbols-outlined text-xs transition-transform duration-200 block ${isExpanded ? 'rotate-90' : ''}`}>
                        chevron_right
                      </span>
                    </button>
                  )}
                </div>

                {children.length > 0 && isExpanded && (
                  <ul className="mt-0.5 ml-sm border-l border-white/10 pl-sm space-y-0.5">
                    {children.map(sub => {
                      const subChildren = sub.children ?? []
                      const isSubHighlighted =
                        activeSub === sub.id ||
                        subChildren.some(ss => ss.id === activeSub)
                      const showSubSub = subChildren.length > 0 && (
                        activeSub === sub.id || subChildren.some(ss => ss.id === activeSub)
                      )

                      return (
                        <li key={sub.id}>
                          <button
                            onClick={() => goTo(cat.slug, sub.id)}
                            className={`w-full flex items-center gap-xs px-xs py-1.5 rounded-lg text-sm transition-colors duration-150 cursor-pointer ${
                              isSubHighlighted
                                ? 'text-cyan-400 font-semibold bg-cyan-400/5'
                                : 'text-on-surface-variant hover:text-cyan-400 hover:bg-white/5'
                            }`}>
                            <span className={`material-symbols-outlined text-xs flex-shrink-0 ${isSubHighlighted ? 'text-cyan-400 opacity-100' : 'opacity-40'}`}>
                              chevron_right
                            </span>
                            <span className="flex-1 text-left">{sub.label}</span>
                            {subChildren.length > 0 && (
                              <span className={`material-symbols-outlined text-xs flex-shrink-0 ${showSubSub ? 'text-cyan-400/70' : 'text-on-surface-variant/30'}`}>
                                {showSubSub ? 'expand_less' : 'expand_more'}
                              </span>
                            )}
                          </button>

                          {showSubSub && (
                            <ul className="mt-0.5 ml-sm border-l border-cyan-400/15 pl-xs space-y-0.5 pb-1">
                              {subChildren.map(ssub => (
                                <li key={ssub.id}>
                                  <button
                                    onClick={() => goTo(cat.slug, ssub.id)}
                                    className={`w-full flex items-center gap-xs px-xs py-1 rounded-md text-xs transition-colors cursor-pointer ${
                                      activeSub === ssub.id
                                        ? 'text-cyan-400 font-semibold bg-cyan-400/8'
                                        : 'text-on-surface-variant hover:text-cyan-400 hover:bg-white/5'
                                    }`}>
                                    <span className={`material-symbols-outlined text-xs flex-shrink-0 ${activeSub === ssub.id ? 'text-cyan-400' : 'opacity-30'}`}>
                                      arrow_right
                                    </span>
                                    {ssub.label}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                )}
              </li>
            )
          })}
        </ul>
      </div>

      {/* ── Filters ─────────────────────── */}
      <div className="pt-sm border-t border-outline-variant">
        <h3 className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-sm font-['Plus_Jakarta_Sans']">Filtros</h3>
        <div className="space-y-md">
          <div>
            <label className="block text-xs text-on-surface-variant mb-xs uppercase tracking-wider">Precio máximo</label>
            <input
              type="range"
              min={0}
              max={2000}
              step={50}
              value={sliderMax}
              onChange={e => onSliderMaxChange?.(Number(e.target.value))}
              className="w-full h-1 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary-container"
            />
            <div className="flex justify-between mt-1.5 text-xs text-on-surface-variant">
              <span>$0</span>
              <span className={sliderMax < 2000 ? 'text-primary-container font-semibold' : ''}>
                {sliderMax < 2000 ? `$${sliderMax}` : '$2000+'}
              </span>
            </div>
          </div>
          <div>
            <label className="block text-xs text-on-surface-variant mb-sm uppercase tracking-wider">Condición</label>
            <div className="space-y-xs">
              {CONDITIONS.map(({ value, label }) => {
                const checked = selectedConditions.includes(value)
                return (
                  <label key={value} className="flex items-center gap-xs cursor-pointer group" onClick={() => onConditionToggle?.(value)}>
                    <div className={`w-4 h-4 border rounded flex items-center justify-center transition-colors flex-shrink-0 ${checked ? 'bg-primary-container border-primary-container' : 'border-outline group-hover:border-tertiary-container'}`}>
                      {checked && <span className="material-symbols-outlined text-[10px] text-black font-bold leading-none">check</span>}
                    </div>
                    <span className={`text-sm transition-colors ${checked ? 'text-on-surface font-medium' : 'text-on-surface-variant group-hover:text-on-surface'}`}>{label}</span>
                  </label>
                )
              })}
            </div>
            {selectedConditions.length > 0 && (
              <button
                onClick={() => CONDITIONS.forEach(c => selectedConditions.includes(c.value) && onConditionToggle?.(c.value))}
                className="mt-xs text-xs text-error hover:text-error/80 transition-colors cursor-pointer">
                Limpiar condición
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:block w-60 flex-shrink-0">
        {content}
      </aside>

      {/* Mobile overlay drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-[55] flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onMobileClose} />
          <aside className="relative w-72 max-w-[85vw] h-full bg-background border-r border-purple-500/20 overflow-y-auto p-md shadow-[4px_0_40px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between mb-lg">
              <span className="text-sm font-bold text-on-surface uppercase tracking-widest">Explorar</span>
              <button onClick={onMobileClose} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center cursor-pointer transition-colors">
                <span className="material-symbols-outlined text-on-surface-variant">close</span>
              </button>
            </div>
            {content}
          </aside>
        </div>
      )}
    </>
  )
}
