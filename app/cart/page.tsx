'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import { getCart, removeFromCart, clearCart, CartItem } from '../lib/cart'
import { getCurrentCustomer } from '../lib/customer-auth'

export default function CartPage() {
  const router = useRouter()
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [orderIds, setOrderIds] = useState<number[]>([])

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    setCart(getCart())

    // auto-fill من حساب العميل
    const c = getCurrentCustomer()
    if (c) {
      setFullName(c.name)
      setPhone(c.phone)
    }

    setLoading(false)

    // استمع لتحديثات السلة
    const handler = () => setCart(getCart())
    window.addEventListener('cart-updated', handler)
    return () => window.removeEventListener('cart-updated', handler)
  }, [])

  function handleRemove(id: string) {
    if (!confirm('متأكد من حذف الكراسة دي من السلة؟')) return
    removeFromCart(id)
    setCart(getCart())
  }

  function handleClearAll() {
    if (!confirm('متأكد من حذف كل السلة؟')) return
    clearCart()
    setCart([])
  }

  async function submitAll() {
    if (!fullName.trim() || !phone.trim()) {
      setErrors({
        fullName: !fullName.trim() ? 'اكتب اسمك' : '',
        phone: !phone.trim() ? 'اكتب رقم تليفونك' : '',
      })
      return
    }
    if (cart.length === 0) return

    setSubmitting(true)
    const ids: number[] = []

    // حفظ كل كراسة كطلب منفصل
    for (const item of cart) {
      const { data, error } = await supabase
        .from('orders')
        .insert({
          customer_name: fullName.trim(),
          phone: phone.trim(),
          paper: item.paper,
          pages: item.pages,
          binding: item.binding,
          size: item.size,
          content: item.content,
          cover: item.cover,
          notes: (item.notes + (notes ? '\n' + notes : '')).trim(),
          design_image_url: item.designImageUrl || null,
          status: 'pending',
        })
        .select()
        .single()

      if (data) ids.push(data.id)
    }

    // إرسال إيميل لكل طلب
    for (const id of ids) {
      fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: id }),
      }).catch(() => {})
    }

    clearCart()
    setOrderIds(ids)
    setSuccess(true)
    setSubmitting(false)

    // فتح واتساب مع كل الطلبات
    const ordersText = cart
      .map(
        (item, i) =>
          `\n── كراسة ${i + 1} ──\n📄 ${item.paper} • 📖 ${item.pages} • 🔗 ${item.binding} • 📐 ${item.size} • 🎨 ${item.cover}`
      )
      .join('\n')

    const message = `✦ FAKRA BY YASMIN ✦

طلب جديد (${cart.length} كراسة)

👤 الاسم: ${fullName.trim()}
📱 التليفون: ${phone.trim()}
${ordersText}
${notes ? `\n📌 ملاحظات: ${notes}` : ''}

شكرًا! ✦`

    window.open(
      `https://wa.me/201026560174?text=${encodeURIComponent(message)}`,
      '_blank',
      'noopener'
    )
  }

  // شاشة النجاح
  if (success) {
    return (
      <div className="min-h-screen bg-[#F4E7D6] flex items-center justify-center p-6" dir="rtl">
        <div className="max-w-md w-full bg-[#FFF9F1] rounded-3xl border-4 border-[#D9A98F] shadow-2xl p-10 text-center">
          <div className="text-7xl mb-6">🎉</div>
          <h1 className="editorial-title text-3xl font-bold text-[#4A2418] mb-4">
            تم استلام طلبك!
          </h1>
          <p className="text-[#704B3A] font-bold mb-6">
            عدد الكراسات: <span className="text-[#E86B2F]">{orderIds.length}</span>
          </p>
          <div className="bg-[#F7C7E8] rounded-2xl p-4 mb-6">
            <p className="text-sm text-[#4A2418] font-bold mb-2">أرقام الطلبات:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {orderIds.map((id) => (
                <span
                  key={id}
                  className="bg-[#FFF9F1] px-3 py-1 rounded-xl font-black text-[#E86B2F]"
                >
                  #{id}
                </span>
              ))}
            </div>
          </div>
          <Link
            href="/"
            className="block bg-[#E86B2F] hover:bg-[#d15c22] text-white font-black py-4 rounded-2xl transition-all shadow-lg"
          >
            → الرجوع للرئيسية
          </Link>
        </div>
      </div>
    )
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
      <nav className="sticky top-0 z-50 bg-[#FFF9F1]/95 backdrop-blur-xl border-b-2 border-[#D9A98F]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link
            href="/customize"
            className="text-[#704B3A] hover:text-[#E86B2F] font-black transition flex items-center gap-2"
          >
            → كمّل تسوق
          </Link>
          <span className="editorial-title text-lg font-bold text-[#4A2418]">
            🛒 سلة الطلبات
          </span>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {cart.length === 0 ? (
          <div className="bg-[#FFF9F1] rounded-3xl border-4 border-[#D9A98F] p-12 text-center">
            <div className="text-7xl mb-6">🛒</div>
            <h1 className="editorial-title text-3xl font-bold text-[#4A2418] mb-4">
              السلة فاضية
            </h1>
            <p className="text-[#704B3A] font-bold mb-8">
              ابدأ بإضافة كراسة للسلة
            </p>
            <Link
              href="/customize"
              className="inline-block bg-[#E86B2F] hover:bg-[#d15c22] text-white font-black px-8 py-4 rounded-2xl shadow-lg transition"
            >
              🎨 صمّم كراسة
            </Link>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
              <h1 className="editorial-title text-3xl md:text-4xl font-bold text-[#4A2418]">
                🛒 السلة ({cart.length} كراسة)
              </h1>
              <button
                onClick={handleClearAll}
                className="bg-red-100 hover:bg-red-200 text-red-700 font-bold px-4 py-2 rounded-2xl transition text-sm"
              >
                🗑️ حذف الكل
              </button>
            </div>

            {/* Cart Items */}
            <div className="space-y-3 mb-6">
              {cart.map((item, idx) => (
                <div
                  key={item.id}
                  className="bg-[#FFF9F1] rounded-3xl border-2 border-[#D9A98F] p-5 hover:border-[#E86B2F] transition-all"
                >
                  <div className="flex items-start gap-4 flex-wrap">
                    {item.designImageUrl ? (
                      <img
                        src={item.designImageUrl}
                        alt="تصميم"
                        className="w-20 h-20 rounded-2xl object-cover border-2 border-[#D9A98F]"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-[#F7C7E8] border-2 border-[#D9A98F] flex items-center justify-center text-3xl">
                        📓
                      </div>
                    )}

                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="font-black text-[#4A2418] bg-[#F7C7E8] px-3 py-1 rounded-xl">
                          كراسة #{idx + 1}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <p className="text-[#704B3A] font-bold">
                          📄 {item.paper}
                        </p>
                        <p className="text-[#704B3A] font-bold">
                          📖 {item.pages}
                        </p>
                        <p className="text-[#704B3A] font-bold">
                          🔗 {item.binding}
                        </p>
                        <p className="text-[#704B3A] font-bold">
                          📐 {item.size}
                        </p>
                        <p className="text-[#704B3A] font-bold col-span-2">
                          🎨 {item.cover}
                        </p>
                        {item.content && (
                          <p className="text-[#704B3A] font-bold col-span-2">
                            📝 {item.content}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemove(item.id)}
                      className="w-10 h-10 bg-red-100 hover:bg-red-200 text-red-600 rounded-2xl flex items-center justify-center transition"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Customer Info */}
            <div className="bg-[#F7C7E8] rounded-3xl border-2 border-[#D9A98F] p-6 mb-6">
              <h2 className="editorial-title text-2xl font-bold text-[#4A2418] mb-5">
                👤 بياناتك
              </h2>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-[#4A2418] mb-2">
                    الاسم الكامل
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value)
                      setErrors({ ...errors, fullName: '' })
                    }}
                    className="w-full border-2 border-[#D9A98F] focus:border-[#E86B2F] rounded-2xl bg-[#FFF9F1] text-[#4A2418] px-4 py-3 focus:outline-none transition"
                    placeholder="اكتب اسمك"
                  />
                  {errors.fullName && (
                    <p className="text-red-600 text-sm font-bold mt-1">
                      {errors.fullName}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#4A2418] mb-2">
                    رقم التليفون
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value)
                      setErrors({ ...errors, phone: '' })
                    }}
                    className="w-full border-2 border-[#D9A98F] focus:border-[#E86B2F] rounded-2xl bg-[#FFF9F1] text-[#4A2418] px-4 py-3 focus:outline-none transition"
                    placeholder="01xxxxxxxxx"
                    dir="ltr"
                  />
                  {errors.phone && (
                    <p className="text-red-600 text-sm font-bold mt-1">
                      {errors.phone}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-5">
                <label className="block text-sm font-bold text-[#4A2418] mb-2">
                  ملاحظات عامة (اختياري)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full border-2 border-[#D9A98F] focus:border-[#E86B2F] rounded-2xl bg-[#FFF9F1] text-[#4A2418] px-4 py-3 focus:outline-none transition resize-none"
                  placeholder="أي تفاصيل إضافية..."
                />
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={submitAll}
              disabled={submitting}
              className="w-full bg-[#E86B2F] hover:bg-[#d15c22] text-white font-black py-5 rounded-2xl shadow-xl hover:shadow-2xl transition-all text-base transform hover:-translate-y-1 disabled:opacity-50 disabled:transform-none"
            >
              {submitting
                ? 'جاري إرسال الطلبات...'
                : `إرسال ${cart.length} طلب ←`}
            </button>
          </>
        )}
      </div>
    </div>
  )
}