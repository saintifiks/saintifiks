'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type CartItem = {
  book_id: string
  title: string
  author: string
  price: number
  cover_image_url: string
  quantity: number
}

type CartContextType = {
  items: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (book_id: string) => void
  updateQuantity: (book_id: string, quantity: number) => void
  clearCart: () => void
  isLoaded: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Hydration dari localStorage
  useEffect(() => {
    const saved = localStorage.getItem('saintifiks-cart')
    if (saved) {
      try {
        setItems(JSON.parse(saved))
      } catch (e) {
        console.error('Gagal membaca data keranjang:', e)
      }
    }
    setIsLoaded(true)
  }, [])

  // Persistensi ke localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('saintifiks-cart', JSON.stringify(items))
    }
  }, [items, isLoaded])

  const addToCart = (newItem: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.book_id === newItem.book_id)
      if (existing) {
        return prev.map((i) =>
          i.book_id === newItem.book_id
            ? { ...i, quantity: i.quantity + newItem.quantity }
            : i
        )
      }
      return [...prev, newItem]
    })
  }

  const removeFromCart = (book_id: string) => {
    setItems((prev) => prev.filter((i) => i.book_id !== book_id))
  }

  const updateQuantity = (book_id: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(book_id)
      return
    }
    setItems((prev) =>
      prev.map((i) => (i.book_id === book_id ? { ...i, quantity } : i))
    )
  }

  const clearCart = () => setItems([])

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, isLoaded }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart harus digunakan di dalam CartProvider')
  }
  return context
}