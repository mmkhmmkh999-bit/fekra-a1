'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import { getCurrentAdmin, logoutAdmin } from '../lib/auth'

export default function AdminHomePage() {
  const router = useRouter()
  const [admin, setAdmin] = useState<any>(null)
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    todayOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0,
  })
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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
      .order('created_at', { ascending: false })

    if (orders) {
      const today = new Date().toDateString()
      const todayOrders = orders.filter(
        (o) => new Date(o.created_at).toDateString() === today
      )
      const validOrders = orders.filter((o) => o.status !== 'cancelled')

      const uniquePhones = new Set(orders.map((o) => o.phone))

      setStats({
        totalOrders: orders.length,
        pendingOrders: orders.filter((o) => o.status === 'pending').length,
        completedOrders: orders.filter((o) => o.status === 'completed').length,
        todayOrders: todayOrders.length,
        totalCustomers: uniquePhones.size,
        totalRevenue: validOrders.reduce(
          (sum, o) => sum + Number(o.total_price || 0),
          0
        ),
      })

      setRecentOrders(orders.slice(0, 5))
    }
    setLoading(false)
  }

  function handleLogout() {
    if (!confirm('متأكد من تسجيل الخروج؟')) return
    logoutAdmin()
    router.push('/login')
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
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#E86B2F] rounded-full flex items-center justify-center font-black">
              ✦
            </div>
            <span className="editorial-title text-xl font-bold">لوحة التحكم</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-sm font-bold hover:text-[#E86B2F] transition"
            >
              🏠 الموقع
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-[#E86B2F] hover:bg-[#d15c22] text-white rounded-full font-bold text-sm transition"
            >
              🚪 خروج
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="editorial-title text-3xl md:text-4xl font-bold text-[#4A2418] mb-2">
            أهلاً، {admin?.full_name || admin?.username} 👋
          </h1>
          <p className="text-[#704B3A] font-bold">ملخص المتجر</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              icon: '📦',
              title: 'إجمالي الطلبات',
              value: stats.totalOrders,
              color: 'bg-[#F7C7E8]',
            },
            {
              icon: '⏰',
              title: 'قيد المراجعة',
              value: stats.pendingOrders,
              color: 'bg-[#F7C7E8]',
            },
            {
              icon: '✅',
              title: 'مكتملة',
              value: stats.completedOrders,
              color: 'bg-[#F7C7E8]',
            },
            {
              icon: '📅',
              title: 'اليوم',
              value: stats.todayOrders,
              color: 'bg-[#F7C7E8]',
            },
          ].map((s, i) => (
            <div
              key={i}
              className="bg-[#FFF9F1] rounded-3xl p-5 border-2 border-[#D9A98F] shadow-sm"
            >
              <div
                className={`w-12 h-12 ${s.color} rounded-2xl flex items-center justify-center text-2xl mb-3 border-2 border-[#D9A98F]`}
              >
                {s.icon}
              </div>
              <div className="editorial-title text-3xl font-bold text-[#4A2418]">
                {s.value}
              </div>
              <div className="text-sm text-[#704B3A] font-bold">{s.title}</div>
            </div>
          ))}
        </div>

        {/* Extra Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-gradient-to-br from-[#F7C7E8] to-[#B485F6] rounded-3xl p-6 border-2 border-[#D9A98F]">
            <div className="text-4xl mb-2">💰</div>
            <div className="editorial-title text-3xl font-bold text-[#4A2418]">
              {stats.totalRevenue.toFixed(0)} <span className="text-xl">ج</span>
            </div>
            <div className="text-sm text-[#4A2418] font-bold">
              إجمالي الإيرادات
            </div>
          </div>
          <div className="bg-gradient-to-br from-[#F7C7E8] to-[#E86B2F] rounded-3xl p-6 border-2 border-[#D9A98F]">
            <div className="text-4xl mb-2">👥</div>
            <div className="editorial-title text-3xl font-bold text-[#4A2418]">
              {stats.totalCustomers}
            </div>
            <div className="text-sm text-[#4A2418] font-bold">
              إجمالي العملاء
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="editorial-title text-2xl font-bold text-[#4A2418] mb-4">
            ⚡ إجراءات سريعة
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* الطلبات */}
            <Link
              href="/admin/orders"
              className="bg-[#FFF9F1] rounded-3xl p-6 border-2 border-[#D9A98F] hover:border-[#E86B2F] hover:shadow-lg transition-all"
            >
              <div className="w-14 h-14 bg-[#E86B2F] rounded-2xl flex items-center justify-center text-3xl mb-4">
                📦
              </div>
              <div className="editorial-title text-lg font-bold text-[#4A2418] mb-1">
                الطلبات
              </div>
              <div className="text-xs text-[#704B3A] font-bold">
                {stats.totalOrders} طلب
              </div>
            </Link>

            {/* العملاء */}
            <Link
              href="/admin/customers"
              className="bg-[#FFF9F1] rounded-3xl p-6 border-2 border-[#D9A98F] hover:border-[#E86B2F] hover:shadow-lg transition-all"
            >
              <div className="w-14 h-14 bg-[#B485F6] rounded-2xl flex items-center justify-center text-3xl mb-4">
                👥
              </div>
              <div className="editorial-title text-lg font-bold text-[#4A2418] mb-1">
                العملاء
              </div>
              <div className="text-xs text-[#704B3A] font-bold">
                {stats.totalCustomers} عميل
              </div>
            </Link>

            {/* الخيارات */}
            <Link
              href="/admin/options"
              className="bg-[#FFF9F1] rounded-3xl p-6 border-2 border-[#D9A98F] hover:border-[#E86B2F] hover:shadow-lg transition-all"
            >
              <div className="w-14 h-14 bg-[#E25A9C] rounded-2xl flex items-center justify-center text-3xl mb-4">
                🎛️
              </div>
              <div className="editorial-title text-lg font-bold text-[#4A2418] mb-1">
                الخيارات
              </div>
              <div className="text-xs text-[#704B3A] font-bold">
                إدارة خيارات التخصيص
              </div>
            </Link>

            {/* الأسعار */}
            <Link
              href="/admin/pricing"
              className="bg-[#FFF9F1] rounded-3xl p-6 border-2 border-[#D9A98F] hover:border-[#E86B2F] hover:shadow-lg transition-all"
            >
              <div className="w-14 h-14 bg-[#4A2418] rounded-2xl flex items-center justify-center text-3xl mb-4">
                💰
              </div>
              <div className="editorial-title text-lg font-bold text-[#4A2418] mb-1">
                الأسعار
              </div>
              <div className="text-xs text-[#704B3A] font-bold">
                تعديل الأسعار والشحن
              </div>
            </Link>

            {/* الكوبونات */}
            <Link
              href="/admin/coupons"
              className="bg-[#FFF9F1] rounded-3xl p-6 border-2 border-[#D9A98F] hover:border-[#E86B2F] hover:shadow-lg transition-all"
            >
              <div className="w-14 h-14 bg-[#E86B2F] rounded-2xl flex items-center justify-center text-3xl mb-4">
                🎟️
              </div>
              <div className="editorial-title text-lg font-bold text-[#4A2418] mb-1">
                الكوبونات
              </div>
              <div className="text-xs text-[#704B3A] font-bold">
                أكواد الخصم
              </div>
            </Link>

            {/* الأدمنز */}
            <Link
              href="/admin/admins"
              className="bg-[#FFF9F1] rounded-3xl p-6 border-2 border-[#D9A98F] hover:border-[#E86B2F] hover:shadow-lg transition-all"
            >
              <div className="w-14 h-14 bg-[#B485F6] rounded-2xl flex items-center justify-center text-3xl mb-4">
                🛡️
              </div>
              <div className="editorial-title text-lg font-bold text-[#4A2418] mb-1">
                الأدمنز
              </div>
              <div className="text-xs text-[#704B3A] font-bold">
                إدارة الأدمنز
              </div>
            </Link>

            {/* الإحصائيات — جديد */}
            <Link
              href="/admin/stats"
              className="bg-[#FFF9F1] rounded-3xl p-6 border-2 border-[#D9A98F] hover:border-[#E86B2F] hover:shadow-lg transition-all"
            >
              <div className="w-14 h-14 bg-[#E86B2F] rounded-2xl flex items-center justify-center text-3xl mb-4">
                📊
              </div>
              <div className="editorial-title text-lg font-bold text-[#4A2418] mb-1">
                الإحصائيات
              </div>
              <div className="text-xs text-[#704B3A] font-bold">
                تحليل مفصل
              </div>
            </Link>

            {/* الإعدادات */}
            <Link
              href="/admin/settings"
              className="bg-[#FFF9F1] rounded-3xl p-6 border-2 border-[#D9A98F] hover:border-[#E86B2F] hover:shadow-lg transition-all"
            >
              <div className="w-14 h-14 bg-[#E25A9C] rounded-2xl flex items-center justify-center text-3xl mb-4">
                ⚙️
              </div>
              <div className="editorial-title text-lg font-bold text-[#4A2418] mb-1">
                الإعدادات
              </div>
              <div className="text-xs text-[#704B3A] font-bold">
                إعدادات الموقع
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-[#FFF9F1] rounded-3xl border-2 border-[#D9A98F] p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="editorial-title text-2xl font-bold text-[#4A2418]">
              🕐 آخر الطلبات
            </h2>
            <Link
              href="/admin/orders"
              className="text-[#E86B2F] hover:text-[#d15c22] font-bold text-sm"
            >
              عرض الكل ←
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-3">📭</div>
              <p className="text-[#704B3A] font-bold">مفيش طلبات لسه</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href="/admin/orders"
                  className="flex items-center gap-4 p-4 rounded-2xl hover:bg-[#F4E7D6] transition border-2 border-[#D9A98F]"
                >
                  <div className="w-12 h-12 bg-[#E86B2F] text-white rounded-2xl flex items-center justify-center font-black">
                    #{order.id}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-[#4A2418]">
                      {order.customer_name}
                    </div>
                    <div className="text-xs text-[#704B3A] font-bold">
                      📱 {order.phone}
                    </div>
                  </div>
                  <div className="text-sm text-[#704B3A] font-bold">
                    {new Date(order.created_at).toLocaleDateString('ar-EG')}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}