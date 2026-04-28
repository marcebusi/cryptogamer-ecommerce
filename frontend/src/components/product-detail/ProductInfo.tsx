import { useCart } from '../../context/CartContext'
import type { Product, ProductCondition } from '../../types'
import SpecsGrid from './SpecsGrid'
import StarRating from '../home/StarRating'
import './ProductInfo.css'

interface ProductInfoProps {
  product: Product
}

const conditionLabels: Record<ProductCondition, string> = {
  'new': 'Nuevo',
  'like-new': 'Como Nuevo',
  'excellent': 'Excelente',
  'good': 'Bueno',
  'fair': 'Aceptable',
}

const conditionColors: Record<ProductCondition, { bar: string; text: string; glow: string }> = {
  'new':       { bar: 'bg-primary-container',  text: 'text-primary-container',  glow: 'shadow-[0_0_8px_rgba(57,255,20,0.5)]' },
  'like-new':  { bar: 'bg-tertiary-container', text: 'text-tertiary-container', glow: 'shadow-[0_0_8px_rgba(58,244,255,0.5)]' },
  'excellent': { bar: 'bg-tertiary-container', text: 'text-tertiary-container', glow: 'shadow-[0_0_8px_rgba(58,244,255,0.5)]' },
  'good':      { bar: 'bg-yellow-400',         text: 'text-yellow-400',         glow: 'shadow-[0_0_8px_rgba(250,204,21,0.5)]' },
  'fair':      { bar: 'bg-secondary-container',text: 'text-secondary-container',glow: 'shadow-[0_0_8px_rgba(255,74,141,0.5)]' },
}

export default function ProductInfo({ product }: ProductInfoProps) {
  const { addToCart, openCart } = useCart()

  const cond = product.condition
  const condColors = cond ? conditionColors[cond] : null
  const condLabel  = cond ? conditionLabels[cond] : null
  const score      = product.conditionScore ?? 100

  const handleAddToCart = () => {
    addToCart(product)
    openCart()
  }

  return (
    <div className="lg:col-span-5 flex flex-col gap-md">

      {/* Badge + title */}
      <div>
        {cond && cond !== 'new' && (
          <span className="inline-block mb-sm px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest bg-purple-600/20 text-purple-300 border border-purple-500/30">
            Pre-owned
          </span>
        )}

        <h1 className="text-h1-display font-h1-display text-on-background leading-tight">
          {product.name.split(' ').slice(0, -1).join(' ')}
          <br />
          <span className="text-purple-400 italic">
            {product.name.split(' ').slice(-1)[0]}
          </span>
        </h1>

        {/* Rating */}
        <div className="flex items-center gap-xs mt-sm">
          <StarRating rating={product.rating} />
          {product.reviewCount && (
            <span className="text-sm text-on-surface-variant">
              ({product.reviewCount} Reviews)
            </span>
          )}
        </div>
      </div>

      {/* Price block */}
      <div className="flex items-center gap-sm flex-wrap">
        <span className="text-4xl font-black text-primary-container drop-shadow-[0_0_8px_rgba(57,255,20,0.5)]">
          ${product.price.toFixed(2)}
        </span>
        {product.originalPrice && (
          <>
            <span className="text-on-surface-variant line-through text-lg">
              ${product.originalPrice.toFixed(2)}
            </span>
            <span className="px-2 py-0.5 bg-tertiary-container text-on-tertiary-container text-xs font-bold rounded-full">
              AHORRAR ${(product.originalPrice - product.price).toFixed(0)}
            </span>
          </>
        )}
      </div>

      {/* Condition card — main feature */}
      {cond && (
        <div className="condition-card rounded-xl border border-white/10 p-md space-y-sm">
          {/* Header row */}
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-on-surface text-sm">
              Condición: <span className={condColors?.text}>{condLabel}</span>
            </h4>
          </div>

          {/* Description */}
          <p className="text-sm text-on-surface-variant leading-relaxed">
            {product.conditionDescription ??
              'Esta unidad ha sido inspeccionada y certificada por nuestros técnicos. Desgaste cosmético mínimo. Incluye todos los accesorios originales.'}
          </p>

          {/* Progress bar */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-on-surface-variant">Estado</span>
              <span className={`text-xs font-bold ${condColors?.text}`}>{score}% Condición</span>
            </div>
            <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${condColors?.bar} ${condColors?.glow}`}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>

          {/* Tags */}
          {product.conditionTags && product.conditionTags.length > 0 && (
            <div className="flex gap-xs flex-wrap">
              {product.conditionTags.map(tag => (
                <span
                  key={tag}
                  className="px-sm py-1 bg-surface-container-high text-on-surface-variant text-xs rounded-full border border-white/10"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CTA buttons */}
      <div className="space-y-sm">
        <button
          onClick={handleAddToCart}
          className="w-full bg-primary-container text-on-primary py-4 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-xs hover:shadow-[0_0_24px_rgba(57,255,20,0.6)] hover:brightness-110 transition-all active:scale-95 cursor-pointer"
        >
          <span className="material-symbols-outlined">shopping_bag</span>
          Agregar al Carrito
        </button>

        <button className="w-full bg-transparent border border-secondary text-secondary py-4 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-xs hover:bg-secondary/10 transition-all active:scale-95 cursor-pointer">
          <span className="material-symbols-outlined">sell</span>
          Vender el tuyo por ${product.originalPrice ? (product.price * 0.65).toFixed(2) : (product.price * 0.6).toFixed(2)}
        </button>
      </div>

      {/* Shipping guarantees */}
      <div className="grid grid-cols-2 gap-sm">
        <div className="flex items-start gap-xs p-sm bg-surface-container rounded-xl border border-white/5">
          <span className="material-symbols-outlined text-tertiary-container text-2xl flex-shrink-0">local_shipping</span>
          <div>
            <p className="text-xs font-bold text-on-surface">Envío Gratis</p>
            <p className="text-[11px] text-on-surface-variant">Llega en 2–3 días</p>
          </div>
        </div>
        <div className="flex items-start gap-xs p-sm bg-surface-container rounded-xl border border-white/5">
          <span className="material-symbols-outlined text-tertiary-container text-2xl flex-shrink-0">workspace_premium</span>
          <div>
            <p className="text-xs font-bold text-on-surface">Garantía 90 días</p>
            <p className="text-[11px] text-on-surface-variant">Protección total de la tienda</p>
          </div>
        </div>
      </div>

      {/* Specs */}
      {product.specs && <SpecsGrid specs={product.specs} />}
    </div>
  )
}
