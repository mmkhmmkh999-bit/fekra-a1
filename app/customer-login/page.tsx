'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CustomerLoginRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/login')
  }, [router])

  return (
    <div className="min-h-screen bg-[#F4E7D6] flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-[#E86B2F] border-t-transparent rounded-full animate-spin" />
    </div>
  )
}