'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import { hashPassword, setCurrentAdmin } from '../lib/auth'
import { setCurrentCustomer } from '../lib/customer-auth'

export default function LoginPage() {
  const router = useRouter()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const input = identifier.trim().toLowerCase()
    const isEmail = input.includes('@')
    const hash = await hashPassword(password)

    // ═══ 1) لو مش إيميل — نجرب الأدمن الأول ═══
    if (!isEmail) {
      const { data: admin } = await supabase
        .from('admins')
        .select('*')
        .eq('username', input)
        .eq('is_active', true)
        .maybeSingle()

      if (admin) {
        const isValid =
          admin.password_hash === hash || admin.password_hash === password

        if (!isValid) {
          setError('كلمة السر غلط')
          setLoading(false)
          return
        }

        await supabase
          .from('admins')
          .update({ last_login: new Date().toISOString() })
          .eq('id', admin.id)

        // ✅ الأدمن — نخزنه ويروح للوحة
        setCurrentAdmin({
          id: admin.id,
          username: admin.username,
          full_name: admin.full_name,
          email: admin.email,
          role: admin.role,
          is_active: admin.is_active,
        })

        router.push('/admin')
        return
      }
    }

    // ═══ 2) لو إيميل — نجرب العميل ═══
    if (isEmail) {
      const { data: customer } = await supabase
        .from('customers')
        .select('*')
        .eq('email', input)
        .maybeSingle()

      if (customer) {
        const isValid =
          customer.password_hash === hash || customer.password_hash === password

        if (!isValid) {
          setError('كلمة السر غلط')
          setLoading(false)
          return
        }

        setCurrentCustomer({
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          address: customer.address,
        })

        router.push('/')
        return
      }
    }

    // مفيش حاجة اتطابقت
    setError('البيانات غلط — تأكد من اليوزر أو الإيميل وكلمة السر')
    setLoading(false)
  }

  return (
    <div
      className="min-h-screen bg-[#F4E7D6] flex items-center justify-center p-6"
      dir="rtl"
    >
      <div className="bg-[#FFF9F1] rounded-3xl shadow-2xl p-8 w-full max-w-md border-2 border-[#D9A98F]">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-[#4A2418] rounded-full flex items-center justify-center text-[#F4E7D6] font-black text-4xl mx-auto mb-4">
            ✦
          </div>
          <h1 className="editorial-title text-3xl font-bold text-[#4A2418] mb-2">
            تسجيل الدخول
          </h1>
          <p className="text-[#704B3A] text-sm font-bold">
            FAKRA BY YASMIN
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block mb-2 font-bold text-[#4A2418] text-sm">
              اسم المستخدم أو الإيميل
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full border-2 border-[#D9A98F] focus:border-[#E86B2F] rounded-2xl bg-[#F4E7D6] text-[#4A2418] px-4 py-3 focus:outline-none transition"
              placeholder="admin أو your@email.com"
              autoFocus
              required
            />
            <p className="text-xs text-[#704B3A] mt-2 font-bold">
              💡 الأدمن بيدخل بـ username — العميل بالإيميل
            </p>
          </div>

          <div>
            <label className="block mb-2 font-bold text-[#4A2418] text-sm">
              كلمة السر
            </label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-2 border-[#D9A98F] focus:border-[#E86B2F] rounded-2xl bg-[#F4E7D6] text-[#4A2418] px-4 py-3 focus:outline-none transition pl-12"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-xl"
              >
                {showPass ? '🙈' : '👁️'}
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
            disabled={loading || !identifier || !password}
            className="w-full bg-[#E86B2F] hover:bg-[#d15c22] text-white font-black py-4 rounded-2xl transition-all shadow-lg disabled:opacity-50"
          >
            {loading ? 'جاري التحقق...' : '🔓 دخول'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t-2 border-[#D9A98F] text-center">
          <p className="text-[#4A2418] font-bold text-sm mb-3">
            معندكش حساب؟
          </p>
          <Link
            href="/register"
            className="block w-full bg-[#F7C7E8] hover:bg-[#E25A9C] text-[#4A2418] hover:text-white font-black py-3 rounded-2xl border-2 border-[#D9A98F] transition text-center"
          >
            📝 إنشاء حساب جديد
          </Link>
        </div>

        <div className="mt-4 text-center">
          <Link
            href="/"
            className="text-[#704B3A] hover:text-[#E86B2F] font-bold text-sm"
          >
            ← الرجوع للرئيسية
          </Link>
        </div>
      </div>
    </div>
  )
}