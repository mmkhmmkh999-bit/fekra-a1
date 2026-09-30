export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + 'fakra_salt_2024')
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export interface Admin {
  id: number
  username: string
  full_name: string | null
  email: string | null
  role: string
  is_active: boolean
}

export function getCurrentAdmin(): Admin | null {
  if (typeof window === 'undefined') return null
  const stored = localStorage.getItem('admin')
  if (!stored) return null
  try {
    return JSON.parse(stored)
  } catch {
    return null
  }
}

export function setCurrentAdmin(admin: Admin) {
  localStorage.setItem('admin', JSON.stringify(admin))
}

export function logoutAdmin() {
  localStorage.removeItem('admin')
}