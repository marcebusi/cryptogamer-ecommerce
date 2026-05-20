import { useEffect } from 'react'
import { useCart } from '../../context/CartContext'
import './CartDrawer.css'

export default function CartDrawer() {
  const { items, isCartOpen, closeCart, openCheckout, removeFromCart, updateQuantity, totalPrice } = useCart()

  const ars = (n: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)

  /* Lock body scroll when cart is open */
  useEffect(() => {
    document.body.style.overflow = isCartOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isCartOpen])

  /* Close on Escape */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeCart() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [closeCart])

  if (!isCartOpen) return null

  return (
    <div className="fixed inset-0 z-[60] flex justify-end" role="dialog" aria-modal="true" aria-label="Carrito de compras">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-[3px]"
        onClick={closeCart}
      />

      {/* Panel */}
      <div className="cart-panel relative w-full max-w-md h-full flex flex-col shadow-[0_0_60px_rgba(57,255,20,0.08),_0_0_40px_rgba(138,43,226,0.15)] border-l border-purple-500/20">

        {/* Header */}
        <div className="flex justify-between items-center px-md py-sm border-b border-white/10">
          <div className="flex items-center gap-xs">
            <span className="material-symbols-outlined text-primary-container text-3xl">shopping_basket</span>
            <div>
              <h2 className="font-bold text-lg text-on-surface font-['Plus_Jakarta_Sans']">Tu Loot</h2>
              <p className="text-xs text-on-surface-variant">{items.length} {items.length === 1 ? 'item' : 'items'}</p>
            </div>
          </div>
          <button
            onClick={closeCart}
            className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Cerrar carrito"
          >
            <span className="material-symbols-outlined text-on-surface-variant">close</span>
          </button>
        </div>

        {/* Items list */}
        <div className="flex-1 overflow-y-auto p-md space-y-md">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-md text-on-surface-variant">
              <span className="material-symbols-outlined text-6xl opacity-30">shopping_cart</span>
              <p className="text-sm">Tu carrito está vacío</p>
              <button
                onClick={closeCart}
                className="text-xs text-primary-container border border-primary-container/30 px-sm py-xs rounded-lg hover:bg-primary-container/10 transition-colors cursor-pointer"
              >
                Seguir comprando
              </button>
            </div>
          ) : (
            <>
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="cart-item flex gap-sm group">
                  {/* Thumbnail */}
                  <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 border border-white/10 bg-surface-container-high">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div className="flex justify-between items-start gap-xs">
                      <h4 className="text-sm font-semibold text-on-surface leading-tight line-clamp-2">
                        {product.name}
                      </h4>
                      <button
                        onClick={() => removeFromCart(product.id)}
                        className="text-on-surface-variant hover:text-error transition-colors flex-shrink-0 cursor-pointer"
                        aria-label="Eliminar"
                      >
                        <span className="material-symbols-outlined text-xl">delete</span>
                      </button>
                    </div>

                    {product.condition && (
                      <p className="text-[11px] text-on-surface-variant capitalize">
                        Estado: {product.condition}
                      </p>
                    )}

                    <div className="flex justify-between items-center mt-xs">
                      {/* Qty controls */}
                      <div className="flex items-center gap-sm bg-surface-container-high rounded-full px-sm py-1 border border-white/10">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="text-on-surface-variant hover:text-primary-container transition-colors font-bold cursor-pointer w-4 text-center"
                          aria-label="Reducir cantidad"
                        >
                          −
                        </button>
                        <span className="text-sm font-bold text-on-surface w-4 text-center">{quantity}</span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          className="text-on-surface-variant hover:text-primary-container transition-colors font-bold cursor-pointer w-4 text-center"
                          aria-label="Aumentar cantidad"
                        >
                          +
                        </button>
                      </div>

                      <span className="text-primary-container font-bold text-base">
                        {ars(product.price * quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

            </>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-md space-y-sm border-t border-white/10 bg-surface-container-lowest">
            {/* Summary */}
            <div className="space-y-xs">
              <div className="flex justify-between text-sm text-on-surface-variant">
                <span>Subtotal</span>
                <span className="font-semibold text-on-surface">{ars(totalPrice)}</span>
              </div>
              <div className="flex justify-between items-center pt-xs border-t border-white/10">
                <span className="font-bold text-base uppercase tracking-wider text-on-surface">Total</span>
                <span className="text-xl font-black text-primary-container drop-shadow-[0_0_8px_rgba(57,255,20,0.4)]">
                  {ars(totalPrice)}
                </span>
              </div>
            </div>

            {/* Checkout button */}
            <button
              onClick={openCheckout}
              className="w-full bg-primary-container text-on-primary py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-xs hover:shadow-[0_0_24px_rgba(57,255,20,0.5)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined">shopping_cart_checkout</span>
              Finalizar Compra
            </button>

            <p className="text-center text-on-surface-variant text-[11px] flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-xs text-primary-container">lock</span>
              Pago 100% seguro · Coordinás directo con el vendedor
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
