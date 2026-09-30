'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import { hashPassword, setCurrentCustomer } from '../lib/customer-auth'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('كلمة السر لازم 6 أحرف على الأقل')
      return
    }
    if (password !== confirm) {
      setError('الكلمتين مش متطابقتين')
      return
    }

    setLoading(true)

    // تحقق من الإيميل
    const { data: existing } = await supabase
      .from('customers')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle()

    if (existing) {
      setError('الإيميل مستخدم بالفعل')
      setLoading(false)
      return
    }

    const hash = await hashPassword(password)

    const { data, error: dbError } = await supabase
      .from('customers')
      .insert({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        address: address.trim() || null,
        password_hash: hash,
      })
      .select()
      .single()

    if (dbError || !data) {
      setError('حدث خطأ، حاول تاني')
      setLoading(false)
      return
    }

    setCurrentCustomer({
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
    })

    // تنبيه أمني — عميل جديد
    fetch('/api/security-alert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType: 'عميل جديد سجّل',
        urgency: 'info',
        details: {
          'الاسم': data.name,
          'الإيميل': data.email,
          'التليفون': data.phone,
        },
      }),
    }).catch(() => {})

    router.push('/account')
  }

  return (
    <div className="min-h-screen bg-[#F4E7D6] flex items-center justify-center p-6" dir="rtl">
      <div className="bg-[#FFF9F1] rounded-3xl shadow-2xl p-8 w-full max-w-md border-2 border-[#D9A98F] my-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-[#E86B2F] rounded-full flex items-center justify-center text-4xl mx-auto mb-4 shadow-lg text-white">
            ✨
          </div>
          <h1 className="editorial-title text-3xl font-bold text-[#4A2418] mb-2">
            حساب جديد
          </h1>
          <p className="text-[#704B3A] text-sm font-bold">
            سجّل بياناتك واستمتع بالمزايا
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block mb-2 font-bold text-[#4A2418] text-sm">
              الاسم الكامل
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border-2 border-[#D9A98F] focus:border-[#E86B2F] rounded-2xl bg-[#F4E7D6] text-[#4A2418] px-4 py-3 focus:outline-none"
              placeholder="اكتب اسمك"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block mb-2 font-bold text-[#4A2418] text-sm">
              الإيميل
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-2 border-[#D9A98F] focus:border-[#E86B2F] rounded-2xl bg-[#F4E7D6] text-[#4A2418] px-4 py-3 focus:outline-none"
              placeholder="your@email.com"
              dir="ltr"
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-bold text-[#4A2418] text-sm">
              رقم التليفون
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border-2 border-[#D9A98F] focus:border-[#E86B2F] rounded-2xl bg-[#F4E7D6] text-[#4A2418] px-4 py-3 focus:outline-none"
              placeholder="01xxxxxxxxx"
              dir="ltr"
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-bold text-[#4A2418] text-sm">
              العنوان (اختياري)
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={2}
              className="w-full border-2 border-[#D9A98F] focus:border-[#E86B2F] rounded-2xl bg-[#F4E7D6] text-[#4A2418] px-4 py-3 focus:outline-none resize-none"
              placeholder="المحافظة، المدينة، الشارع"
            />
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
                className="w-full border-2 border-[#D9A98F] focus:border-[#E86B2F] rounded-2xl bg-[#F4E7D6] text-[#4A2418] px-4 py-3 focus:outline-none pl-12"
                placeholder="6 أحرف على الأقل"
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

          <div>
            <label className="block mb-2 font-bold text-[#4A2418] text-sm">
              تأكيد كلمة السر
            </label>
            <input
              type={showPass ? 'text' : 'password'}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full border-2 border-[#D9A98F] focus:border-[#E86B2F] rounded-2xl bg-[#F4E7D6] text-[#4A2418] px-4 py-3 focus:outline-none"
              placeholder="اكتبها تاني"
              required
            />
            {confirm && password && confirm === password && (
              <p className="text-green-600 font-bold text-xs mt-2">✓ متطابقة</p>
            )}
            {confirm && password && confirm !== password && (
              <p className="text-red-600 font-bold text-xs mt-2">⚠️ مش متطابقة</p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-300 text-red-700 p-3 rounded-2xl font-bold text-sm">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#E86B2F] hover:bg-[#d15c22] text-white font-black py-4 rounded-2xl transition-all shadow-lg disabled:opacity-50"
          >
            {loading ? 'جاري التسجيل...' : '✨ إنشاء الحساب'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t-2 border-[#D9A98F] text-center">
          <p className="text-[#4A2418] font-bold text-sm mb-3">عندك حساب؟</p>
          <Link
            href="/customer-login"
            className="block w-full bg-[#F7C7E8] hover:bg-[#E25A9C] text-[#4A2418] hover:text-white font-black py-3 rounded-2xl border-2 border-[#D9A98F] transition text-center"
          >
            🔓 تسجيل الدخول
          </Link>
        </div>

        <div className="mt-4 text-center">
          <Link href="/" className="text-[#704B3A] hover:text-[#E86B2F] font-bold text-sm">
            ← الرجوع للرئيسية
          </Link>
        </div>
      </div>
    </div>
  )
}