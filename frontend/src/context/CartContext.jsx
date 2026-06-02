import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { api } from '../services/api'

const CartContext = createContext({ cartCount: 0, wishlistCount: 0 })

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [cartCount,     setCartCount]     = useState(0)
  const [wishlistCount, setWishlistCount] = useState(0)

  const refreshCounts = useCallback(async () => {
    if (!user) { setCartCount(0); setWishlistCount(0); return }
    try {
      const [cart, wl] = await Promise.all([
        api.get('/users/cart/'),
        api.get('/users/wishlist/'),
      ])
      setCartCount(cart?.reduce((s, i) => s + (i.quantity || 1), 0) ?? 0)
      setWishlistCount(wl?.length ?? 0)
    } catch { /* ignore */ }
  }, [user])

  useEffect(() => { refreshCounts() }, [refreshCounts])

  const addToCart = useCallback(async (product, qty = 1) => {
    if (!user) return false
    await api.post('/users/cart/', {
      product_id:       product.id,
      product_name:     product.name,
      product_price:    product.price,
      product_emoji:    product.emoji,
      product_category: product.category,
      quantity:         qty,
    })
    await refreshCounts()
    return true
  }, [user, refreshCounts])

  const addToWishlist = useCallback(async (product) => {
    if (!user) return false
    try {
      await api.post('/users/wishlist/', {
        product_id:             product.id,
        product_name:           product.name,
        product_price:          product.price,
        product_original_price: product.originalPrice,
        product_emoji:          product.emoji,
        product_category:       product.category,
        in_stock:               product.inStock ?? true,
      })
      await refreshCounts()
      return true
    } catch { return false }
  }, [user, refreshCounts])

  return (
    <CartContext.Provider value={{ cartCount, wishlistCount, refreshCounts, addToCart, addToWishlist }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
