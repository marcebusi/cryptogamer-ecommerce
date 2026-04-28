import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { navCategories } from '../../data/categories'
import './CategorySidebar.css'

export default function CategorySidebar() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const activeCat = searchParams.get('cat') ?? ''
  const activeSub = searchParams.get('sub') ?? ''

  const [expandedCat, setExpandedCat] = useState<string | null>(activeCat || null)

  useEffect(() => {
    if (activeCat) setExpandedCat(activeCat)
  }, [activeCat])

  const goTo = (cat: string, sub?: string) => {
    const p = new URLSearchParams({ cat })
    if (sub) p.set('sub', sub)
    navigate(`/products?${p.toString()}`)
  }

  const toggleCat = (catId: string, hasChildren: boolean) => {
    if (hasChildren) {
      setExpandedCat(prev => prev === catId ? null : catId)
    }
    goTo(catId)
  }

  return (
    <aside className="w-full md:w-60 flex-shrink-0 space-y-md">
      {/* Categories */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-sm font-['Plus_Jakarta_Sans']">
          Categorías
        </h3>
        <ul className="space-y-0.5">
          {/* All products */}
          <li>
            <button
              onClick={() => navigate('/products')}
              className={`w-full flex items-center gap-xs px-sm py-xs rounded-lg text-sm transition-all duration-150 cursor-pointer ${
                !activeCat
                  ? 'bg-surface-container-high text-on-surface border-l-4 border-primary-container shadow-[0_0_12px_rgba(57,255,20,0.08)]'
                  : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
              }`}
            >
              <span className={`material-symbols-outlined text-sm ${!activeCat ? 'text-primary-container' : ''}`}>
                apps
              </span>
              <span className="flex-1 text-left font-medium">Todos los productos</span>
            </button>
          </li>

          {navCategories.map(cat => (
            <li key={cat.id}>
              <button
                onClick={() => toggleCat(cat.id, !!cat.children)}
                className={`w-full flex items-center gap-xs px-sm py-xs rounded-lg text-sm transition-all duration-150 cursor-pointer ${
                  activeCat === cat.id
                    ? 'bg-surface-container-high text-on-surface border-l-4 border-primary-container shadow-[0_0_12px_rgba(57,255,20,0.08)]'
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                }`}
              >
                <span className={`material-symbols-outlined text-sm ${activeCat === cat.id ? 'text-primary-container' : ''}`}>
                  {cat.icon}
                </span>
                <span className="flex-1 text-left font-medium">{cat.label}</span>
                {cat.children && (
                  <span className={`material-symbols-outlined text-xs transition-transform duration-200 ${expandedCat === cat.id ? 'rotate-90' : ''}`}>
                    chevron_right
                  </span>
                )}
              </button>

              {/* Sub-items */}
              {cat.children && expandedCat === cat.id && (
                <ul className="mt-0.5 ml-sm border-l border-white/10 pl-sm space-y-0.5">
                  {cat.children.map(sub => (
                    <li key={sub.id}>
                      <button
                        onClick={() => goTo(cat.id, sub.id)}
                        className={`w-full flex items-center gap-xs px-xs py-1 rounded-lg text-sm transition-colors duration-150 cursor-pointer ${
                          activeSub === sub.id
                            ? 'text-cyan-400 font-semibold'
                            : 'text-on-surface-variant hover:text-cyan-400'
                        }`}
                      >
                        <span className="material-symbols-outlined text-xs opacity-60">chevron_right</span>
                        <span className="flex-1 text-left">{sub.label}</span>
                        {sub.children && (
                          <span className="material-symbols-outlined text-xs opacity-40">expand_more</span>
                        )}
                      </button>

                      {/* Sub-sub-items (Joysticks) */}
                      {sub.children && activeSub === sub.id && (
                        <ul className="mt-0.5 ml-sm border-l border-white/10 pl-xs space-y-0.5">
                          {sub.children.map(ssub => (
                            <li key={ssub.id}>
                              <button
                                onClick={() => goTo(cat.id, ssub.id)}
                                className="w-full flex items-center gap-xs px-xs py-0.5 text-xs text-on-surface-variant hover:text-cyan-400 transition-colors cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-xs opacity-50">arrow_right</span>
                                {ssub.label}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Filters */}
      <div className="pt-sm border-t border-outline-variant">
        <h3 className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-sm font-['Plus_Jakarta_Sans']">
          Filtros
        </h3>

        <div className="space-y-md">
          {/* Price range */}
          <div>
            <label className="block text-xs text-on-surface-variant mb-xs uppercase tracking-wider">
              Rango de precio
            </label>
            <input
              type="range"
              className="w-full h-1 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary-container"
            />
            <div className="flex justify-between mt-2 text-xs text-on-surface-variant">
              <span>$0</span>
              <span>$2000+</span>
            </div>
          </div>

          {/* Condition */}
          <div>
            <label className="block text-xs text-on-surface-variant mb-sm uppercase tracking-wider">
              Condición
            </label>
            <div className="space-y-xs">
              {[
                { id: 'new', label: 'Nuevo' },
                { id: 'like-new', label: 'Como Nuevo' },
                { id: 'excellent', label: 'Excelente' },
                { id: 'good', label: 'Bueno' },
              ].map(({ id, label }) => (
                <label key={id} className="flex items-center gap-xs cursor-pointer group">
                  <div className="w-4 h-4 border border-outline rounded flex items-center justify-center group-hover:border-tertiary-container transition-colors">
                  </div>
                  <span className="text-sm text-on-surface group-hover:text-on-surface transition-colors">{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
