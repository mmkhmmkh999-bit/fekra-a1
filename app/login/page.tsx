'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import { hashPassword, setCurrentAdmin } from '../lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const input = username.trim().toLowerCase()
    const hash = await hashPassword(password)

    const { data: admin } = await supabase
      .from('admins')
      .select('*')
      .eq('username', input)
      .eq('is_active', true)
      .maybeSingle()

    if (!admin) {
      // تنبيه أمني
      fetch('/api/security-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'محاولة دخول فاشلة',
          urgency: 'warning',
          details: {
            'اسم المستخدم': input,
            'نوع الحساب': 'أدمن',
            'السبب': 'اسم مستخدم غير موجود',
          },
        }),
      }).catch(() => {})

      setError('اسم المستخدم أو كلمة السر غلط')
      setLoading(false)
      return
    }

    const isValid =
      admin.password_hash === hash || admin.password_hash === password

    if (!isValid) {
      // تنبيه أمني
      fetch('/api/security-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'محاولة دخول فاشلة',
          urgency: 'warning',
          details: {
            'اسم المستخدم': input,
            'نوع الحساب': 'أدمن',
            'السبب': 'كلمة سر خاطئة',
          },
        }),
      }).catch(() => {})

      setError('اسم المستخدم أو كلمة السر غلط')
      setLoading(false)
      return
    }

    await supabase
      .from('admins')
      .update({ last_login: new Date().toISOString() })
      .eq('id', admin.id)

    setCurrentAdmin({
      id: admin.id,
      username: admin.username,
      full_name: admin.full_name,
      email: admin.email,
      role: admin.role,
      is_active: admin.is_active,
    })

    router.push('/admin')
  }

  return (
    <div className="min-h-screen bg-[#F4E7D6] flex items-center justify-center p-6" dir="rtl">
      <div className="bg-[#FFF9F1] rounded-3xl shadow-2xl p-8 w-full max-w-md border-2 border-[#D9A98F]">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-[#4A2418] rounded-full flex items-center justify-center text-[#F4E7D6] font-black text-3xl mx-auto mb-4">
            ✦
          </div>
          <h1 className="editorial-title text-3xl font-bold text-[#4A2418] mb-2">
            دخول الأدمن
          </h1>
          <p className="text-[#704B3A] italic text-sm">FAKRA BY YASMIN</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block mb-2 font-bold text-[#4A2418] text-sm">
              اسم المستخدم
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border-2 border-[#D9A98F] focus:border-[#E86B2F] rounded-2xl bg-[#F4E7D6] text-[#4A2418] px-4 py-3 focus:outline-none transition"
              placeholder="admin"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-bold text-[#4A2418] text-sm">
              كلمة السر
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-2 border-[#D9A98F] focus:border-[#E86B2F] rounded-2xl bg-[#F4E7D6] text-[#4A2418] px-4 py-3 focus:outline-none transition pl-12"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-xl"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-300 text-red-700 p-3 rounded-2xl font-bold text-sm">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !username || !password}
            className="w-full bg-[#E86B2F] hover:bg-[#d15c22] text-white font-black py-4 rounded-2xl transition-all shadow-lg disabled:opacity-50"
          >
            {loading ? 'جاري التحقق...' : '→ دخول'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t-2 border-[#D9A98F] text-center">
          <Link href="/" className="text-[#704B3A] hover:text-[#E86B2F] font-bold text-sm">
            → الرجوع للرئيسية
          </Link>
        </div>
      </div>
    </div>
  )
}