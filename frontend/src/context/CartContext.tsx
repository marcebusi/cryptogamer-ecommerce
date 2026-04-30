import { createContext, useContext, useState, type ReactNode } from 'react'
import { toast } from 'react-hot-toast'
import type { CartItem, Product } from '../types'

interface CartContextType {
  items: CartItem[]
  addToCart: (product: Product) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  totalItems: number
  totalPrice: number
  clearCart: () => void
  isCartOpen: boolean
  openCart: () => void
  closeCart: () => void
  isCheckoutOpen: boolean
  openCheckout: () => void
  closeCheckout: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const local = localStorage.getItem('cart_items')
      return local ? JSON.parse(local) : []
    } catch {
      return []
    }
  })
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

  const openCart = () => setIsCartOpen(true)
  const closeCart = () => setIsCartOpen(false)
  const openCheckout = () => { setIsCartOpen(false); setIsCheckoutOpen(true) }
  const closeCheckout = () => setIsCheckoutOpen(false)

  const addToCart = (product: Product) => {
    if (!product.inStock) {
      toast.error('Este producto está sin stock')
      return
    }

    setItems(prev => {
      const existing = prev.find(i => i.product.id === product.id)
      const next = existing
        ? prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
        : [...prev, { product, quantity: 1 }]
      localStorage.setItem('cart_items', JSON.stringify(next))
      return next
    })
    
    toast.success('Agregado al carrito')
  }

  const removeFromCart = (productId: string) => {
    setItems(prev => {
      const next = prev.filter(i => i.product.id !== productId)
      localStorage.setItem('cart_items', JSON.stringify(next))
      return next
    })
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) return removeFromCart(productId)
    setItems(prev => {
      const next = prev.map(i => (i.product.id === productId ? { ...i, quantity } : i))
      localStorage.setItem('cart_items', JSON.stringify(next))
      return next
    })
  }

  const clearCart = () => {
    setItems([])
    localStorage.removeItem('cart_items')
  }

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items, addToCart, removeFromCart, updateQuantity,
        totalItems, totalPrice, clearCart,
        isCartOpen, openCart, closeCart,
        isCheckoutOpen, openCheckout, closeCheckout,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
