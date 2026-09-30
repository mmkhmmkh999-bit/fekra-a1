export type CartItem = {
  id: string
  paper: string
  pages: string
  binding: string
  size: string
  content: string
  cover: string
  notes: string
  designImageUrl: string
  quantity: number
  addedAt: number
}

const CART_KEY = 'fakra_cart'

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(CART_KEY)
  if (!stored) return []
  try {
    return JSON.parse(stored)
  } catch {
    return []
  }
}

export function saveCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items))
  window.dispatchEvent(new Event('cart-updated'))
}

export function addToCart(item: Omit<CartItem, 'id' | 'addedAt'>) {
  const cart = getCart()
  const newItem: CartItem = {
    ...item,
    id: Date.now().toString() + Math.random().toString(36).slice(2),
    addedAt: Date.now(),
  }
  cart.push(newItem)
  saveCart(cart)
  return newItem
}

export function removeFromCart(id: string) {
  const cart = getCart().filter((item) => item.id !== id)
  saveCart(cart)
}

export function clearCart() {
  localStorage.removeItem(CART_KEY)
  window.dispatchEvent(new Event('cart-updated'))
}

export function getCartCount(): number {
  return getCart().length
}