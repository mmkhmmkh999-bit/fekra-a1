'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { getCurrentAdmin } from '../../lib/auth'

type Coupon = {
  id: number
  code: string
  discount_type: string
  discount_value: number
  min_order: number
  max_uses: number
  uses_count: number
  expires_at: string | null
  is_active: boolean
  created_at: string
}

export default function AdminCouponsPage() {
  const router = useRouter()
  const [admin, setAdmin] = useState<any>(null)
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [message, setMessage] = useState('')

  const [code, setCode] = useState('')
  const [type, setType] = useState('percentage')
  const [value, setValue] = useState('')
  const [minOrder, setMinOrder] = useState('')
  const [maxUses, setMaxUses] = useState('100')
  const [expiresAt, setExpiresAt] = useState('')

  useEffect(() => {
    const a = getCurrentAdmin()
    if (!a) {
      router.push('/login')
      return
    }
    setAdmin(a)
    load()
  }, [router])

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false })
    setCoupons(data || [])
    setLoading(false)
  }

  function showMsg(text: string) {
    setMessage(text)
    setTimeout(() => setMessage(''), 3000)
  }

  async function addCoupon() {
    if (!code || !value) {
      showMsg('❌ اكتب الكود والقيمة')
      return
    }
    const { error } = await supabase.from('coupons').insert({
      code: code.toUpperCase().trim(),
      discount_type: type,
      discount_value: Number(value),
      min_order: Number(minOrder) || 0,
      max_uses: Number(maxUses) || 100,
      expires_at: expiresAt || null,
      is_active: true,
    })
    if (error) {
      showMsg('❌ الكود موجود بالفعل!')
    } else {
      showMsg('✅ تم إضافة الكوبون')
      setCode('')
      setValue('')
      setMinOrder('')
      setMaxUses('100')
      setExpiresAt('')
      setShowAdd(false)
      load()
    }
  }

  async function toggleActive(id: number, current: boolean) {
    await supabase.from('coupons').update({ is_active: !current }).eq('id', id)
    showMsg(current ? '✕ تم التعطيل' : '✓ تم التفعيل')
    load()
  }

  async function deleteCoupon(id: number, code: string) {
    if (!confirm(`متأكد من حذف الكوبون "${code}"؟`)) return
    await supabase.from('coupons').delete().eq('id', id)
    showMsg('✅ تم الحذف')
    load()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4E7D6] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#E86B2F] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F4E7D6]" dir="rtl">
      {/* Navbar */}
      <nav className="bg-[#4A2418] text-[#F4E7D6] sticky top-0 z-50 shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center flex-wrap gap-3">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#E86B2F] rounded-full flex items-center justify-center font-black">
              ←
            </div>
            <span className="editorial-title text-xl font-bold">🎟️ الكوبونات</span>
          </Link>
          <div className="flex gap-2 text-sm">
            <Link href="/admin" className="px-3 py-2 rounded-full hover:bg-[#E86B2F] transition">🏠</Link>
            <Link href="/admin/orders" className="px-3 py-2 rounded-full hover:bg-[#E86B2F] transition">📦</Link>
            <Link href="/admin/customers" className="px-3 py-2 rounded-full hover:bg-[#E86B2F] transition">👥</Link>
            <Link href="/admin/options" className="px-3 py-2 rounded-full hover:bg-[#E86B2F] transition">🎛️</Link>
            <Link href="/admin/pricing" className="px-3 py-2 rounded-full hover:bg-[#E86B2F] transition">💰</Link>
            <Link href="/admin/coupons" className="px-3 py-2 rounded-full bg-[#E86B2F] font-bold">🎟️</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="editorial-title text-3xl md:text-4xl font-bold text-[#4A2418] mb-2">
            🎟️ الكوبونات
          </h1>
          <p className="text-[#704B3A] font-bold">
            أنشئ أكواد خصم للعملاء
          </p>
        </div>

        {message && (
          <div className="bg-[#FFF9F1] border-2 border-[#D9A98F] rounded-2xl p-4 mb-6 text-center font-bold text-[#4A2418]">
            {message}
          </div>
        )}

        {/* Add New Coupon */}
        {!showAdd ? (
          <button
            onClick={() => setShowAdd(true)}
            className="w-full bg-[#FFF9F1] hover:bg-[#F7C7E8] border-2 border-dashed border-[#D9A98F] hover:border-[#E86B2F] text-[#E86B2F] font-black py-5 rounded-3xl transition-all flex items-center justify-center gap-3 mb-6"
          >
            <span className="w-10 h-10 bg-[#E86B2F] text-white rounded-full flex items-center justify-center text-2xl">
              +
            </span>
            إضافة كوبون جديد
          </button>
        ) : (
          <div className="bg-[#FFF9F1] rounded-3xl border-2 border-[#D9A98F] p-6 mb-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="editorial-title text-xl font-bold text-[#4A2418]">
                🎟️ كوبون جديد
              </h2>
              <button
                onClick={() => setShowAdd(false)}
                className="w-8 h-8 bg-[#F7C7E8] rounded-full font-black text-[#4A2418] hover:bg-[#E25A9C] hover:text-white transition"
              >
                ✕
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-sm font-bold text-[#4A2418] mb-2">
                  كود الخصم
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="مثلاً: WELCOME10"
                  className="w-full border-2 border-[#D9A98F] focus:border-[#E86B2F] rounded-2xl bg-[#F4E7D6] text-[#4A2418] px-4 py-3 focus:outline-none font-black tracking-widest"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#4A2418] mb-2">
                  النوع
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setType('percentage')}
                    className={`p-3 rounded-2xl font-bold text-sm transition ${
                      type === 'percentage'
                        ? 'bg-[#E86B2F] text-white'
                        : 'bg-[#F4E7D6] text-[#4A2418] border-2 border-[#D9A98F]'
                    }`}
                  >
                    % نسبة
                  </button>
                  <button
                    onClick={() => setType('fixed')}
                    className={`p-3 rounded-2xl font-bold text-sm transition ${
                      type === 'fixed'
                        ? 'bg-[#E86B2F] text-white'
                        : 'bg-[#F4E7D6] text-[#4A2418] border-2 border-[#D9A98F]'
                    }`}
                  >
                    💰 مبلغ ثابت
                  </button>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-3 mb-3">
              <div>
                <label className="block text-sm font-bold text-[#4A2418] mb-2">
                  القيمة
                </label>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={type === 'percentage' ? '10' : '50'}
                  className="w-full border-2 border-[#D9A98F] focus:border-[#E86B2F] rounded-2xl bg-[#F4E7D6] text-[#4A2418] px-4 py-3 focus:outline-none font-bold"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#4A2418] mb-2">
                  أقل مبلغ للطلب
                </label>
                <input
                  type="number"
                  value={minOrder}
                  onChange={(e) => setMinOrder(e.target.value)}
                  placeholder="0"
                  className="w-full border-2 border-[#D9A98F] focus:border-[#E86B2F] rounded-2xl bg-[#F4E7D6] text-[#4A2418] px-4 py-3 focus:outline-none font-bold"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#4A2418] mb-2">
                  أقصى استخدام
                </label>
                <input
                  type="number"
                  value={maxUses}
                  onChange={(e) => setMaxUses(e.target.value)}
                  placeholder="100"
                  className="w-full border-2 border-[#D9A98F] focus:border-[#E86B2F] rounded-2xl bg-[#F4E7D6] text-[#4A2418] px-4 py-3 focus:outline-none font-bold"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-bold text-[#4A2418] mb-2">
                تاريخ الانتهاء (اختياري)
              </label>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full border-2 border-[#D9A98F] focus:border-[#E86B2F] rounded-2xl bg-[#F4E7D6] text-[#4A2418] px-4 py-3 focus:outline-none font-bold"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={addCoupon}
                className="flex-1 bg-[#E86B2F] hover:bg-[#d15c22] text-white font-black py-3 rounded-2xl transition shadow-lg"
              >
                ✅ إضافة
              </button>
              <button
                onClick={() => setShowAdd(false)}
                className="px-6 bg-[#F4E7D6] hover:bg-[#F7C7E8] text-[#4A2418] font-black rounded-2xl transition border-2 border-[#D9A98F]"
              >
                إلغاء
              </button>
            </div>
          </div>
        )}

        {/* Coupons List */}
        {coupons.length === 0 ? (
          <div className="bg-[#FFF9F1] rounded-3xl border-2 border-[#D9A98F] p-12 text-center">
            <div className="text-6xl mb-4">🎟️</div>
            <p className="text-[#704B3A] font-bold">مفيش كوبونات لسه</p>
          </div>
        ) : (
          <div className="space-y-3">
            {coupons.map((c) => (
              <div
                key={c.id}
                className="bg-[#FFF9F1] rounded-3xl border-2 border-[#D9A98F] p-5 hover:border-[#E86B2F] transition-all flex items-center gap-4 flex-wrap"
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${
                    c.is_active
                      ? 'bg-green-100 border-2 border-green-300'
                      : 'bg-gray-200 border-2 border-gray-300'
                  }`}
                >
                  🎟️
                </div>

                <div className="flex-1 min-w-[150px]">
                  <div className="font-black text-xl text-[#4A2418] tracking-widest">
                    {c.code}
                  </div>
                  <div className="text-sm text-[#704B3A] font-bold">
                    {c.discount_type === 'percentage'
                      ? `${c.discount_value}% خصم`
                      : `${c.discount_value} ج خصم`}
                    {c.min_order > 0 && ` • أقل طلب ${c.min_order} ج`}
                  </div>
                  {c.expires_at && (
                    <div className="text-xs text-[#704B3A] font-bold mt-1">
                      ⏰ ينتهي: {new Date(c.expires_at).toLocaleDateString('ar-EG')}
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <div className="editorial-title text-2xl font-bold text-[#E86B2F]">
                    {c.uses_count}/{c.max_uses}
                  </div>
                  <div className="text-xs text-[#704B3A] font-bold">استخدام</div>
                </div>

                <button
                  onClick={() => toggleActive(c.id, c.is_active)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition ${
                    c.is_active
                      ? 'bg-green-100 text-green-800 border border-green-300'
                      : 'bg-gray-200 text-gray-700 border border-gray-300'
                  }`}
                >
                  {c.is_active ? '✓ مُفعّل' : '✕ مُعطّل'}
                </button>

                <button
                  onClick={() => deleteCoupon(c.id, c.code)}
                  className="w-9 h-9 rounded-full bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center transition"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}