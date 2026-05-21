import { useRef, useEffect, useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import type { Product } from '../../types'
import './ProductCarousel.css'

const ARS = (n: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)

interface Props { products: Product[] }

export default function ProductCarousel({ products }: Props) {
  const { addToCart }  = useCart()
  const trackRef       = useRef<HTMLDivElement>(null)
  const isJumping      = useRef(false)
  const [activeArrow, setActiveArrow] = useState<'left' | 'right' | null>(null)

  /* Triple the list for seamless infinite loop */
  const tripled = [...products, ...products, ...products]

  /* Snap to the middle copy after mount / products change */
  const snapToMiddle = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    isJumping.current = true
    el.scrollLeft = el.scrollWidth / 3
    requestAnimationFrame(() => { isJumping.current = false })
  }, [])

  useEffect(() => { snapToMiddle() }, [products, snapToMiddle])

  /* Infinite: jump back/forward when near edge */
  const handleScroll = useCallback(() => {
    const el = trackRef.current
    if (!el || isJumping.current) return
    const third = el.scrollWidth / 3
    if (el.scrollLeft < third * 0.15) {
      isJumping.current = true
      el.scrollTo({ left: el.scrollLeft + third, behavior: 'instant' as ScrollBehavior })
      // Double RAF: wait two frames so the browser paints before re-enabling
      requestAnimationFrame(() => requestAnimationFrame(() => { isJumping.current = false }))
    } else if (el.scrollLeft > third * 1.85) {
      isJumping.current = true
      el.scrollTo({ left: el.scrollLeft - third, behavior: 'instant' as ScrollBehavior })
      requestAnimationFrame(() => requestAnimationFrame(() => { isJumping.current = false }))
    }
  }, [])

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  const scroll = (dir: 'left' | 'right') => {
    const el = trackRef.current
    if (!el) return
    setActiveArrow(dir)
    setTimeout(() => setActiveArrow(null), 350)
    el.scrollBy({ left: dir === 'left' ? -290 : 290, behavior: 'smooth' })
  }

  if (!products.length) return null

  return (
    <div className="pc-root">
      {/* Left arrow */}
      <button
        onClick={() => scroll('left')}
        aria-label="Anterior"
        className={`pc-arrow pc-arrow-left ${activeArrow === 'left' ? 'pc-arrow-active' : ''}`}>
        <span className={`material-symbols-outlined text-xl transition-transform duration-150 ${activeArrow === 'left' ? '-translate-x-0.5' : ''}`}>
          chevron_left
        </span>
      </button>

      {/* Right arrow */}
      <button
        onClick={() => scroll('right')}
        aria-label="Siguiente"
        className={`pc-arrow pc-arrow-right ${activeArrow === 'right' ? 'pc-arrow-active' : ''}`}>
        <span className={`material-symbols-outlined text-xl transition-transform duration-150 ${activeArrow === 'right' ? 'translate-x-0.5' : ''}`}>
          chevron_right
        </span>
      </button>

      {/* Track */}
      <div ref={trackRef} className="pc-track">
        {tripled.map((product, idx) => (
          <div key={`${product.id}-${idx}`} className="pc-card">
            <div className="pc-card-inner">

              {/* Image area */}
              <div className="pc-img-area">
                <img
                  src={product.image}
                  alt={product.name}
                  loading="lazy"
                  onError={e => {
                    (e.target as HTMLImageElement).src =
                      'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAyNTAgMjUwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMTExMTIwIi8+PC9zdmc+'
                  }}
                />

                {/* Discount badge */}
                {product.originalPrice && (
                  <div className="pc-badge">
                    -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                  </div>
                )}

                {/* Hover overlay — quick add */}
                <Link to={`/products/${product.id}`} className="pc-overlay">
                  <button
                    onClick={e => { e.stopPropagation(); e.preventDefault(); addToCart(product) }}
                    disabled={!product.inStock}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#ff4a8d] text-white rounded-full text-xs font-bold shadow-[0_0_20px_rgba(255,74,141,0.6)] hover:brightness-110 transition-all active:scale-90 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="Agregar al carrito"
                  >
                    <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
                    Agregar
                  </button>
                </Link>
              </div>

              {/* Info */}
              <Link to={`/products/${product.id}`} className="block pc-info">
                <p className="pc-name">{product.name}</p>
                <div className="pc-prices">
                  {product.inStock ? (
                    <>
                      <span className="pc-price">{ARS(product.price)}</span>
                      {product.originalPrice && (
                        <span className="pc-price-original">{ARS(product.originalPrice)}</span>
                      )}
                    </>
                  ) : (
                    <span className="pc-no-stock">Sin stock</span>
                  )}
                </div>
              </Link>

            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
