import { useState, useRef } from 'react'
import { imgUrl, imgPosition, imgZoom } from '../../types'
import type { Product } from '../../types'
import './ImageGallery.css'

interface ImageGalleryProps {
  product: Product
}

const VISIBLE = 4 // thumbnails shown at once

export default function ImageGallery({ product }: ImageGalleryProps) {
  const rawImgs = product.images && product.images.length > 0 ? product.images : [product.image]
  const thumbs  = rawImgs

  const [activeIdx,  setActiveIdx]  = useState(0)
  const [thumbStart, setThumbStart] = useState(0) // carousel offset

  // Touch swipe tracking
  const touchStartX = useRef<number>(0)

  const activePos  = imgPosition(thumbs[activeIdx])
  const activeZoom = imgZoom(thumbs[activeIdx])

  const canPrev = thumbStart > 0
  const canNext = thumbStart + VISIBLE < thumbs.length

  const handlePrev = () => setThumbStart(s => Math.max(0, s - 1))
  const handleNext = () => setThumbStart(s => Math.min(thumbs.length - VISIBLE, s + 1))

  // When clicking a thumb, also scroll the carousel window to include it
  const handleThumbClick = (i: number) => {
    setActiveIdx(i)
    if (i < thumbStart) setThumbStart(i)
    else if (i >= thumbStart + VISIBLE) setThumbStart(i - VISIBLE + 1)
  }

  const visibleThumbs = thumbs.slice(thumbStart, thumbStart + VISIBLE)

  return (
    <div className="lg:col-span-5 space-y-md">
      {/* Main image */}
      <div
        className="gallery-main relative rounded-xl overflow-hidden border border-white/5 shadow-2xl group"
        onTouchStart={e => { touchStartX.current = e.touches[0].clientX }}
        onTouchEnd={e => {
          const dx = e.changedTouches[0].clientX - touchStartX.current
          if (Math.abs(dx) > 40) {
            if (dx < 0) handleThumbClick((activeIdx + 1) % thumbs.length)
            else handleThumbClick((activeIdx - 1 + thumbs.length) % thumbs.length)
          }
        }}
      >
        <div className="gallery-bg absolute inset-0" />

        <img
          alt={product.name}
          className="gallery-img relative z-[5] w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          src={imgUrl(thumbs[activeIdx])}
          style={{ objectPosition: activePos }}
          onError={e => { (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAyNTAgMjUwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMWYyMTI4Ii8+PC9zdmc+' }}
        />

        {/* Condition badge */}
        {product.condition && product.condition !== 'new' && (
          <div className="absolute top-4 left-4 z-20">
            <span className="condition-badge-preowned px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest">
              Pre-owned
            </span>
          </div>
        )}

        {/* Spec pills — only shown if the product has specs */}
        {product.specs && product.specs.length > 0 && (
          <div className="absolute bottom-4 right-4 flex flex-wrap gap-1.5 z-20 max-w-[60%] justify-end">
            {product.specs.slice(0, 2).map(s => (
              <span key={s.label}
                className="bg-surface-container-highest/70 backdrop-blur-md px-3 py-1 rounded-full text-label-caps text-[10px] text-on-surface">
                {s.label}
              </span>
            ))}
          </div>
        )}

        {/* Arrow nav on main image if multiple — always visible on mobile, hover-only on desktop */}
        {thumbs.length > 1 && (
          <>
            <button type="button"
              onClick={() => handleThumbClick((activeIdx - 1 + thumbs.length) % thumbs.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/60 border border-white/20 flex items-center justify-center hover:bg-black/80 transition-all cursor-pointer md:opacity-0 md:group-hover:opacity-100 active:scale-90">
              <span className="material-symbols-outlined text-white text-base">chevron_left</span>
            </button>
            <button type="button"
              onClick={() => handleThumbClick((activeIdx + 1) % thumbs.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/60 border border-white/20 flex items-center justify-center hover:bg-black/80 transition-all cursor-pointer md:opacity-0 md:group-hover:opacity-100 active:scale-90">
              <span className="material-symbols-outlined text-white text-base">chevron_right</span>
            </button>
            {/* Dot indicators on mobile */}
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-20 md:hidden">
              {thumbs.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleThumbClick(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${
                    activeIdx === i ? 'bg-white w-4' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails — only render if more than 1 image */}
      {thumbs.length > 1 && (
        <div className="flex items-center gap-2">
          {/* Prev arrow */}
          {thumbs.length > VISIBLE && (
            <button type="button" onClick={handlePrev} disabled={!canPrev}
              className="w-7 h-7 rounded-full border border-white/10 flex items-center justify-center flex-shrink-0 transition-all cursor-pointer disabled:opacity-20 disabled:cursor-default hover:bg-white/10">
              <span className="material-symbols-outlined text-white/70 text-sm">chevron_left</span>
            </button>
          )}

          {/* Thumb strip */}
          <div className="flex gap-2 flex-1">
            {visibleThumbs.map((src, vi) => {
              const i = thumbStart + vi
              const isActive = activeIdx === i
              return (
                <button key={i} type="button" onClick={() => handleThumbClick(i)}
                  className={`flex-1 aspect-square rounded-lg overflow-hidden transition-all cursor-pointer ${
                    isActive
                      ? 'border-2 border-purple-500 shadow-[0_0_12px_rgba(138,43,226,0.4)]'
                      : 'border border-white/10 hover:border-purple-400/50'
                  }`}>
                  <div className="relative w-full h-full">
                    <img
                      alt={`${product.name} vista ${i + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                      src={imgUrl(src)}
                    />
                  </div>
                </button>
              )
            })}
          </div>

          {/* Next arrow */}
          {thumbs.length > VISIBLE && (
            <button type="button" onClick={handleNext} disabled={!canNext}
              className="w-7 h-7 rounded-full border border-white/10 flex items-center justify-center flex-shrink-0 transition-all cursor-pointer disabled:opacity-20 disabled:cursor-default hover:bg-white/10">
              <span className="material-symbols-outlined text-white/70 text-sm">chevron_right</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
