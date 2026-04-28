import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { latestProducts } from '../../data/products'
import StarRating from './StarRating'
import './LatestArrivals.css'

const badgeClasses: Record<string, string> = {
  primary: 'bg-primary-container text-on-primary',
  secondary: 'bg-secondary-container text-on-secondary',
  tertiary: 'bg-tertiary-container text-on-tertiary-container',
}

export default function LatestArrivals() {
  const { addToCart } = useCart()

  return (
    <section className="max-w-7xl mx-auto px-margin py-xl bg-surface-container-lowest rounded-[2rem] border border-white/5 mb-xl">
      {/* Header */}
      <div className="flex justify-between items-end mb-lg">
        <div>
          <h2 className="font-h2-headline text-h2-headline text-on-background">Latest Arrivals</h2>
          <p className="text-on-surface-variant font-body-md">Fresh gear straight from the manufacturing lines.</p>
        </div>
        <Link
          to="/products"
          className="text-primary-container font-button-text text-button-text hover:underline underline-offset-8"
        >
          VIEW ALL GEAR
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
        {latestProducts.map(product => (
          <div key={product.id} className="group">
            <Link to={`/products/${product.id}`}>
              <div className="relative rounded-xl overflow-hidden aspect-square mb-sm bg-surface-container-high border border-white/5 scanline cursor-pointer">
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  src={product.image}
                  alt={product.name}
                />

                {/* Badge */}
                {product.badge && (
                  <div
                    className={`absolute top-xs right-xs px-xs py-1 rounded font-label-caps text-[10px] ${
                      badgeClasses[product.badgeColor ?? 'primary']
                    }`}
                  >
                    {product.badge}
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-sm">
                  <button
                    onClick={e => {
                      e.preventDefault()
                      addToCart(product)
                    }}
                    className="p-3 bg-primary-container text-on-primary rounded-full hover:scale-110 transition-transform cursor-pointer"
                    aria-label="Add to cart"
                  >
                    <span className="material-symbols-outlined">add_shopping_cart</span>
                  </button>
                  <button
                    onClick={e => e.preventDefault()}
                    className="p-3 bg-white/10 backdrop-blur-md rounded-full hover:scale-110 transition-transform cursor-pointer"
                    aria-label="Add to wishlist"
                  >
                    <span className="material-symbols-outlined">favorite</span>
                  </button>
                </div>
              </div>
            </Link>

            <h4 className="font-body-lg text-body-md text-on-background group-hover:text-primary-container transition-colors">
              {product.name}
            </h4>
            <div className="flex justify-between items-center mt-base">
              <span className="text-primary-fixed-dim font-h3-title text-sm">
                ${product.price.toFixed(2)}
              </span>
              <StarRating rating={product.rating} />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
