'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type CartItem = {
  variant_id: string  // Berubah: Keranjang kini melacak spesifik SKU/Varian
  book_id: string
  title: string
  author: string
  format: string      // Format (Paperback, Hardcover, dll)
  price: number
  cover_image_url: string
  quantity: number
}

type CartContextType = {
  items: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (variant_id: string) => void
  updateQuantity: (variant_id: string, quantity: number) => void
  clearCart: () => void
  isLoaded: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('saintifiks-cart')
    if (saved) {
      try { setItems(JSON.parse(saved)) } catch (e) { console.error(e) }
    }
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (isLoaded) localStorage.setItem('saintifiks-cart', JSON.stringify(items))
  }, [items, isLoaded])

  const addToCart = (newItem: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.variant_id === newItem.variant_id)
      if (existing) {
        return prev.map((i) =>
          i.variant_id === newItem.variant_id
            ? { ...i, quantity: i.quantity + newItem.quantity }
            : i
        )
      }
      return [...prev, newItem]
    })
  }

  const removeFromCart = (variant_id: string) => setItems((prev) => prev.filter((i) => i.variant_id !== variant_id))
  const updateQuantity = (variant_id: string, quantity: number) => {
    if (quantity < 1) return removeFromCart(variant_id)
    setItems((prev) => prev.map((i) => (i.variant_id === variant_id ? { ...i, quantity } : i)))
  }
  const clearCart = () => setItems([])

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, isLoaded }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart harus digunakan di dalam CartProvider')
  return context
}