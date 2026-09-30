export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + 'fakra_customer_salt_2024')
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export interface Customer {
  id: number
  name: string
  email: string
  phone: string
  address: string | null
}

export function getCurrentCustomer(): Customer | null {
  if (typeof window === 'undefined') return null
  const stored = localStorage.getItem('customer')
  if (!stored) return null
  try {
    return JSON.parse(stored)
  } catch {
    return null
  }
}

export function setCurrentCustomer(customer: Customer) {
  localStorage.setItem('customer', JSON.stringify(customer))
}

export function logoutCustomer() {
  localStorage.removeItem('customer')
}