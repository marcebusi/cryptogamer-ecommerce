import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { relatedProducts } from '../../data/products'

const categoryLabels: Record<string, string> = {
  accessories: 'ACCESSORY',
  audio: 'AUDIO',
  consoles: 'CONSOLE',
  mobile: 'MOBILE',
  games: 'GAME',
}

export default function RelatedProducts() {
  const { addToCart } = useCart()

  return (
    <section className="mt-xl">
      <div className="flex items-center justify-between mb-lg">
        <h2 className="text-h2-headline font-h2-headline text-on-background">
          Complete Your <span className="text-cyan-400">Setup</span>
        </h2>
        <Link
          to="/products"
          className="text-secondary font-label-caps text-label-caps hover:underline"
        >
          VIEW ALL ACCESSORIES
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
        {relatedProducts.map(product => (
          <div
            key={product.id}
            className="bg-surface-container-low rounded-xl border border-white/5 overflow-hidden group hover:border-cyan-400/50 transition-all hover:-translate-y-2"
          >
            <div className="relative aspect-square bg-black p-8">
              <div className="scanline-overlay absolute inset-0 opacity-10 pointer-events-none" />
              <img
                alt={product.name}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                src={product.image}
              />
            </div>
            <div className="p-md">
              <p className="text-[10px] text-label-caps text-on-surface-variant mb-1">
                {categoryLabels[product.category] ?? product.category.toUpperCase()}
              </p>
              <h4 className="font-bold text-lg mb-2 text-on-surface">{product.name}</h4>
              <div className="flex items-center justify-between">
                <span className="text-xl font-black text-primary-container">
                  ${product.price.toFixed(2)}
                </span>
                <button
                  onClick={() => addToCart(product)}
                  className="material-symbols-outlined text-on-surface-variant hover:text-cyan-400 transition-colors cursor-pointer"
                  aria-label="Add to cart"
                >
                  add_shopping_cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
