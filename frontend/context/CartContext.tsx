import React, { createContext, useState, useContext, ReactNode } from 'react'

export interface Product {
  id: string
  name: string
  price: string
  image: string
  description: string
}

export interface CartItem {
  product: Product
  quantity: number
  parsedPrice: number
}

interface CartContextType {
  cartItems: Map<string, CartItem>
  addToCart: (product: Product) => void
  removeFromCart: (productId: string) => void
  clearCart: () => void
  getCartCount: () => number
  getCartTotal: () => number
}

// Create the context
const CartContext = createContext<CartContextType | undefined>(undefined)

// Create the Provider component
export const CartProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [cartItems, setCartItems] = useState(new Map<string, CartItem>())

  const addToCart = (product: Product) => {
    if (!product) return

    const priceAsNumber = parseFloat(product.price)
    if (isNaN(priceAsNumber)) {
      console.error('Invalid product price:', product)
      return // Don't add item with invalid price
    }

    setCartItems((prevItems) => {
      const newItems = new Map(prevItems)
      // Use product.id as the key
      const existingItem = newItems.get(product.id)

      if (existingItem) {
        // If item exists, increment quantity
        newItems.set(product.id, {
          ...existingItem,
          quantity: existingItem.quantity + 1,
        })
      } else {
        // If item doesn't exist, add it
        newItems.set(product.id, {
          product,
          quantity: 1,
          parsedPrice: priceAsNumber,
        })
      }

      console.log('Cart updated:', newItems)
      return newItems
    })
  }

  const removeFromCart = (productId: string) => {
    setCartItems((prevItems) => {
      const newItems = new Map(prevItems)
      const existingItem = newItems.get(productId)

      if (existingItem) {
        if (existingItem.quantity > 1) {
          // If quantity > 1, decrement quantity
          newItems.set(productId, {
            ...existingItem,
            quantity: existingItem.quantity - 1,
          })
        } else {
          // If quantity is 1, remove the item
          newItems.delete(productId)
        }
      }

      console.log('Cart updated:', newItems)
      return newItems
    })
  }

  const clearCart = () => {
    setCartItems(new Map<string, CartItem>())
    console.log('Cart cleared')
  }

  const getCartCount = () => {
    let count = 0
    for (const item of cartItems.values()) {
      count += item.quantity
    }
    return count
  }

  const getCartTotal = () => {
    let total = 0
    for (const item of cartItems.values()) {
      total += item.parsedPrice * item.quantity
    }
    return total
  }

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    clearCart,
    getCartCount,
    getCartTotal,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
