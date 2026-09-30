'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import { getCurrentCustomer, logoutCustomer } from '../lib/customer-auth'

const STATUS_LABELS: Record<string, { label: string; bg: string; color: string }> = {
  pending: { label: 'قيد المراجعة', bg: 'bg-yellow-100', color: 'text-yellow-800' },
  processing: { label: 'قيد التنفيذ', bg: 'bg-blue-100', color: 'text-blue-800' },
  shipped: { label: 'تم الشحن', bg: 'bg-purple-100', color: 'text-purple-800' },
  completed: { label: 'مكتمل', bg: 'bg-green-100', color: 'text-green-800' },
  cancelled: { label: 'ملغي', bg: 'bg-red-100', color: 'text-red-800' },
}

export default function AccountPage() {
  const router = useRouter()
  const [customer, setCustomer] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const c = getCurrentCustomer()
    if (!c) {
      router.push('/customer-login')
      return
    }
    setCustomer(c)
    loadOrders(c.phone)
  }, [router])

  async function loadOrders(phone: string) {
    setLoading(true)
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('phone', phone)
      .order('created_at', { ascending: false })
    setOrders(data || [])
    setLoading(false)
  }

  function handleLogout() {
    if (!confirm('متأكد من تسجيل الخروج؟')) return
    logoutCustomer()
    router.push('/')
  }

  if (!customer) return null

  return (
    <div className="min-h-screen bg-[#F4E7D6]" dir="rtl">
      <nav className="bg-[#FFF9F1]/95 backdrop-blur-xl border-b-2 border-[#D9A98F] py-4 px-6 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-[#704B3A] hover:text-[#E86B2F] font-black transition">
            ← الرئيسية
          </Link>
          <span className="editorial-title text-lg font-bold text-[#4A2418]">
            👤 حسابي
          </span>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto p-6">
        {/* Welcome */}
        <div className="bg-gradient-to-br from-[#F7C7E8] to-[#B485F6] rounded-3xl border-2 border-[#D9A98F] p-6 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="w-20 h-20 bg-[#4A2418] rounded-3xl flex items-center justify-center editorial-title text-4xl font-bold text-[#F4E7D6]">
              {customer.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-[200px]">
              <h1 className="editorial-title text-3xl font-bold text-[#4A2418] mb-1">
                أهلاً، {customer.name} 👋
              </h1>
              <p className="text-[#4A2418]/80 font-bold text-sm" dir="ltr">
                📧 {customer.email}
              </p>
              <p className="text-[#4A2418]/80 font-bold text-sm" dir="ltr">
                📱 {customer.phone}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-[#FFF9F1] hover:bg-red-100 text-[#4A2418] hover:text-red-700 font-black px-6 py-3 rounded-2xl border-2 border-[#D9A98F] transition"
            >
              🚪 خروج
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <Link
            href="/customize"
            className="bg-[#FFF9F1] rounded-3xl p-6 border-2 border-[#D9A98F] hover:border-[#E86B2F] hover:shadow-lg transition-all"
          >
            <div className="w-14 h-14 bg-[#E86B2F] rounded-2xl flex items-center justify-center text-3xl mb-4">
              🎨
            </div>
            <div className="editorial-title text-lg font-bold text-[#4A2418] mb-1">
              صمّم كراسة
            </div>
            <div className="text-xs text-[#704B3A] font-bold">
              اطلب كراسة جديدة
            </div>
          </Link>

          <Link
            href="/"
            className="bg-[#FFF9F1] rounded-3xl p-6 border-2 border-[#D9A98F] hover:border-[#E86B2F] hover:shadow-lg transition-all"
          >
            <div className="w-14 h-14 bg-[#B485F6] rounded-2xl flex items-center justify-center text-3xl mb-4">
              🏠
            </div>
            <div className="editorial-title text-lg font-bold text-[#4A2418] mb-1">
              الرئيسية
            </div>
            <div className="text-xs text-[#704B3A] font-bold">
              الرجوع للموقع
            </div>
          </Link>

          <Link
            href="/customize"
            className="bg-[#FFF9F1] rounded-3xl p-6 border-2 border-[#D9A98F] hover:border-[#E86B2F] hover:shadow-lg transition-all"
          >
            <div className="w-14 h-14 bg-[#E25A9C] rounded-2xl flex items-center justify-center text-3xl mb-4">
              📦
            </div>
            <div className="editorial-title text-lg font-bold text-[#4A2418] mb-1">
              طلب جديد
            </div>
            <div className="text-xs text-[#704B3A] font-bold">
              ابدأ من جديد
            </div>
          </Link>
        </div>

        {/* Orders */}
        <div className="bg-[#FFF9F1] rounded-3xl border-2 border-[#D9A98F] p-6">
          <h2 className="editorial-title text-2xl font-bold text-[#4A2418] mb-6 flex items-center gap-2">
            📦 طلباتي ({orders.length})
          </h2>

          {loading ? (
            <div className="text-center py-10">
              <div className="w-12 h-12 border-4 border-[#E86B2F] border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-[#704B3A] font-bold text-lg mb-2">
                مفيش طلبات لسه
              </p>
              <p className="text-[#704B3A] text-sm mb-6">
                ابدأ أول طلب ليك دلوقتي
              </p>
              <Link
                href="/customize"
                className="inline-block bg-[#E86B2F] hover:bg-[#d15c22] text-white font-black px-8 py-3 rounded-2xl shadow-lg transition"
              >
                🎨 صمّم كراستك
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => {
                const status = STATUS_LABELS[order.status] || STATUS_LABELS.pending
                return (
                  <div
                    key={order.id}
                    className="bg-[#F4E7D6] rounded-2xl p-5 border-2 border-[#D9A98F]"
                  >
                    <div className="flex justify-between items-start flex-wrap gap-3">
                      <div>
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <span className="font-black text-lg text-[#4A2418] bg-[#FFF9F1] px-3 py-1 rounded-xl">
                            #{order.id}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${status.bg} ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                        <p className="text-[#704B3A] text-xs font-bold">
                          {new Date(order.created_at).toLocaleString('ar-EG')}
                        </p>
                        <div className="mt-2 text-sm text-[#4A2418] font-bold">
                          {order.paper && <span>📄 {order.paper} • </span>}
                          {order.pages && <span>📖 {order.pages} • </span>}
                          {order.size && <span>📐 {order.size}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}