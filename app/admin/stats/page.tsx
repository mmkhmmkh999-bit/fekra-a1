'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { getCurrentAdmin } from '../../lib/auth'

export default function AdminStatsPage() {
  const router = useRouter()
  const [admin, setAdmin] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    avgOrder: 0,
    completionRate: 0,
    totalCustomers: 0,
    pendingOrders: 0,
    completedOrders: 0,
  })

  useEffect(() => {
    const a = getCurrentAdmin()
    if (!a) {
      router.push('/login')
      return
    }
    setAdmin(a)
    loadData()
  }, [router])

  async function loadData() {
    setLoading(true)

    const { data: orders } = await supabase
      .from('orders')
      .select('*')

    if (orders) {
      const validOrders = orders.filter((o) => o.status !== 'cancelled')
      const totalRevenue = validOrders.reduce(
        (sum, o) => sum + Number(o.total_price || 0),
        0
      )

      setStats({
        totalOrders: orders.length,
        totalRevenue,
        avgOrder: validOrders.length > 0 ? totalRevenue / validOrders.length : 0,
        completionRate:
          orders.length > 0
            ? (orders.filter((o) => o.status === 'completed').length /
                orders.length) *
              100
            : 0,
        totalCustomers: new Set(orders.map((o) => o.phone)).size,
        pendingOrders: orders.filter((o) => o.status === 'pending').length,
        completedOrders: orders.filter((o) => o.status === 'completed').length,
      })
    }
    setLoading(false)
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
      <nav className="bg-[#4A2418] text-[#F4E7D6] sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center flex-wrap gap-3">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#E86B2F] rounded-full flex items-center justify-center font-black">
              ←
            </div>
            <span className="editorial-title text-xl font-bold">📊 الإحصائيات</span>
          </Link>
          <div className="flex gap-2 text-sm flex-wrap">
            <Link href="/admin" className="px-3 py-2 rounded-full hover:bg-[#E86B2F] transition">🏠</Link>
            <Link href="/admin/orders" className="px-3 py-2 rounded-full hover:bg-[#E86B2F] transition">📦</Link>
            <Link href="/admin/customers" className="px-3 py-2 rounded-full hover:bg-[#E86B2F] transition">👥</Link>
            <Link href="/admin/stats" className="px-3 py-2 rounded-full bg-[#E86B2F] font-bold">📊</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="editorial-title text-3xl md:text-4xl font-bold text-[#4A2418] mb-2">
            📊 الإحصائيات
          </h1>
          <p className="text-[#704B3A] font-bold">ملخص أداء المتجر</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#FFF9F1] rounded-3xl border-2 border-[#D9A98F] p-5">
            <div className="text-3xl mb-2">📦</div>
            <div className="editorial-title text-3xl font-bold text-[#4A2418]">
              {stats.totalOrders}
            </div>
            <div className="text-sm text-[#704B3A] font-bold">إجمالي الطلبات</div>
          </div>

          <div className="bg-gradient-to-br from-[#F7C7E8] to-[#B485F6] rounded-3xl border-2 border-[#D9A98F] p-5">
            <div className="text-3xl mb-2">💰</div>
            <div className="editorial-title text-2xl font-bold text-[#4A2418]">
              {stats.totalRevenue.toFixed(0)}
            </div>
            <div className="text-sm text-[#4A2418] font-bold">الإيرادات (ج)</div>
          </div>

          <div className="bg-[#FFF9F1] rounded-3xl border-2 border-[#D9A98F] p-5">
            <div className="text-3xl mb-2">📈</div>
            <div className="editorial-title text-3xl font-bold text-[#4A2418]">
              {stats.avgOrder.toFixed(0)}
            </div>
            <div className="text-sm text-[#704B3A] font-bold">متوسط الطلب (ج)</div>
          </div>

          <div className="bg-[#FFF9F1] rounded-3xl border-2 border-[#D9A98F] p-5">
            <div className="text-3xl mb-2">✅</div>
            <div className="editorial-title text-3xl font-bold text-green-600">
              {stats.completionRate.toFixed(0)}%
            </div>
            <div className="text-sm text-[#704B3A] font-bold">نسبة الإتمام</div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-[#FFF9F1] rounded-3xl border-2 border-[#D9A98F] p-5 text-center">
            <div className="text-2xl mb-2">👥</div>
            <div className="editorial-title text-2xl font-bold text-[#4A2418]">
              {stats.totalCustomers}
            </div>
            <div className="text-xs text-[#704B3A] font-bold">عملاء</div>
          </div>

          <div className="bg-[#FFF9F1] rounded-3xl border-2 border-[#D9A98F] p-5 text-center">
            <div className="text-2xl mb-2">⏰</div>
            <div className="editorial-title text-2xl font-bold text-yellow-600">
              {stats.pendingOrders}
            </div>
            <div className="text-xs text-[#704B3A] font-bold">قيد المراجعة</div>
          </div>

          <div className="bg-[#FFF9F1] rounded-3xl border-2 border-[#D9A98F] p-5 text-center">
            <div className="text-2xl mb-2">✅</div>
            <div className="editorial-title text-2xl font-bold text-green-600">
              {stats.completedOrders}
            </div>
            <div className="text-xs text-[#704B3A] font-bold">مكتملة</div>
          </div>
        </div>
      </div>
    </div>
  )
}