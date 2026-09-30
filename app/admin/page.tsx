'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import { getCurrentAdmin } from '../lib/auth'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const COLORS = ['#E86B2F', '#E25A9C', '#B485F6', '#4A2418', '#F7C7E8']

export default function AdminStatsPage() {
  const router = useRouter()
  const [admin, setAdmin] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'all'>('month')

  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    avgOrder: 0,
    completionRate: 0,
    totalCustomers: 0,
    totalProducts: 0,
    pendingOrders: 0,
    completedOrders: 0,
  })

  const [dailyData, setDailyData] = useState<any[]>([])
  const [statusData, setStatusData] = useState<any[]>([])
  const [paperData, setPaperData] = useState<any[]>([])
  const [sizeData, setSizeData] = useState<any[]>([])
  const [topCustomers, setTopCustomers] = useState<any[]>([])

  useEffect(() => {
    const a = getCurrentAdmin()
    if (!a) {
      router.push('/login')
      return
    }
    setAdmin(a)
    loadData()
  }, [router, period])

  async function loadData() {
    setLoading(true)

    const { data: orders } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (!orders || orders.length === 0) {
      setLoading(false)
      return
    }

    const now = new Date()
    let filtered = orders
    if (period === 'today') {
      const today = now.toDateString()
      filtered = orders.filter(
        (o) => new Date(o.created_at).toDateString() === today
      )
    } else if (period === 'week') {
      const weekAgo = new Date()
      weekAgo.setDate(now.getDate() - 7)
      filtered = orders.filter((o) => new Date(o.created_at) >= weekAgo)
    } else if (period === 'month') {
      const monthAgo = new Date()
      monthAgo.setDate(now.getDate() - 30)
      filtered = orders.filter((o) => new Date(o.created_at) >= monthAgo)
    }

    const validOrders = filtered.filter((o) => o.status !== 'cancelled')
    const totalRevenue = validOrders.reduce(
      (sum, o) => sum + Number(o.total_price || 0),
      0
    )

    setStats({
      totalOrders: filtered.length,
      totalRevenue,
      avgOrder: validOrders.length > 0 ? totalRevenue / validOrders.length : 0,
      completionRate:
        filtered.length > 0
          ? (filtered.filter((o) => o.status === 'completed').length /
              filtered.length) *
            100
          : 0,
      totalCustomers: new Set(filtered.map((o) => o.phone)).size,
      totalProducts: validOrders.reduce((sum, o) => sum + 1, 0),
      pendingOrders: filtered.filter((o) => o.status === 'pending').length,
      completedOrders: filtered.filter((o) => o.status === 'completed').length,
    })

    // بيانات يومية (آخر 14 يوم)
    const last14Days: any[] = []
    for (let i = 13; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dayStr = date.toDateString()
      const dayOrders = orders.filter(
        (o) => new Date(o.created_at).toDateString() === dayStr
      )
      last14Days.push({
        date: date.toLocaleDateString('ar-EG', {
          day: 'numeric',
          month: 'short',
        }),
        orders: dayOrders.length,
        revenue: dayOrders
          .filter((o) => o.status !== 'cancelled')
          .reduce((sum, o) => sum + Number(o.total_price || 0), 0),
      })
    }
    setDailyData(last14Days)

    // توزيع الحالات
    const statusCounts: Record<string, number> = {}
    filtered.forEach((o) => {
      statusCounts[o.status] = (statusCounts[o.status] || 0) + 1
    })
    const statusLabels: Record<string, string> = {
      pending: 'قيد المراجعة',
      processing: 'قيد التنفيذ',
      shipped: 'تم الشحن',
      completed: 'مكتمل',
      cancelled: 'ملغي',
    }
    setStatusData(
      Object.entries(statusCounts).map(([key, value]) => ({
        name: statusLabels[key] || key,
        value,
      }))
    )

    // توزيع نوع الورق
    const paperCounts: Record<string, number> = {}
    filtered.forEach((o) => {
      if (o.paper) paperCounts[o.paper] = (paperCounts[o.paper] || 0) + 1
    })
    setPaperData(
      Object.entries(paperCounts).map(([name, value]) => ({ name, value }))
    )

    // توزيع المقاس
    const sizeCounts: Record<string, number> = {}
    filtered.forEach((o) => {
      if (o.size) sizeCounts[o.size] = (sizeCounts[o.size] || 0) + 1
    })
    setSizeData(
      Object.entries(sizeCounts).map(([name, value]) => ({ name, value }))
    )

    // أفضل العملاء
    const customerStats: Record<
      string,
      { name: string; orders: number; total: number }
    > = {}
    validOrders.forEach((o) => {
      if (!customerStats[o.phone]) {
        customerStats[o.phone] = {
          name: o.customer_name,
          orders: 0,
          total: 0,
        }
      }
      customerStats[o.phone].orders += 1
      customerStats[o.phone].total += Number(o.total_price || 0)
    })
    const topC = Object.entries(customerStats)
      .map(([phone, data]) => ({ phone, ...data }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
    setTopCustomers(topC)

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
            <Link href="/admin/options" className="px-3 py-2 rounded-full hover:bg-[#E86B2F] transition">🎛️</Link>
            <Link href="/admin/pricing" className="px-3 py-2 rounded-full hover:bg-[#E86B2F] transition">💰</Link>
            <Link href="/admin/coupons" className="px-3 py-2 rounded-full hover:bg-[#E86B2F] transition">🎟️</Link>
            <Link href="/admin/admins" className="px-3 py-2 rounded-full hover:bg-[#E86B2F] transition">🛡️</Link>
            <Link href="/admin/settings" className="px-3 py-2 rounded-full hover:bg-[#E86B2F] transition">⚙️</Link>
            <Link href="/admin/stats" className="px-3 py-2 rounded-full bg-[#E86B2F] font-bold">📊</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="editorial-title text-3xl md:text-4xl font-bold text-[#4A2418] mb-2">
            📊 الإحصائيات المتقدمة
          </h1>
          <p className="text-[#704B3A] font-bold">تحليل مفصل لأداء المتجر</p>
        </div>

        {/* Period Selector */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: 'today', label: 'اليوم', icon: '📅' },
            { key: 'week', label: 'الأسبوع', icon: '📆' },
            { key: 'month', label: 'الشهر', icon: '🗓️' },
            { key: 'all', label: 'الكل', icon: '♾️' },
          ].map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key as any)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold transition ${
                period === p.key
                  ? 'bg-[#E86B2F] text-white shadow-lg'
                  : 'bg-[#FFF9F1] text-[#704B3A] border-2 border-[#D9A98F] hover:border-[#E86B2F]'
              }`}
            >
              {p.icon} {p.label}
            </button>
          ))}
        </div>

        {/* Top Stats */}
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

        {/* Secondary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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

          <div className="bg-[#FFF9F1] rounded-3xl border-2 border-[#D9A98F] p-5 text-center">
            <div className="text-2xl mb-2">📚</div>
            <div className="editorial-title text-2xl font-bold text-[#4A2418]">
              {stats.totalProducts}
            </div>
            <div className="text-xs text-[#704B3A] font-bold">كراسة</div>
          </div>
        </div>

        {/* Daily Chart */}
        <div className="bg-[#FFF9F1] rounded-3xl border-2 border-[#D9A98F] p-6 mb-6">
          <h2 className="editorial-title text-2xl font-bold text-[#4A2418] mb-4">
            📅 الطلبات اليومية (آخر 14 يوم)
          </h2>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#D9A98F" />
                <XAxis dataKey="date" tick={{ fill: '#4A2418', fontSize: 12 }} />
                <YAxis tick={{ fill: '#4A2418', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: '#FFF9F1',
                    border: '2px solid #D9A98F',
                    borderRadius: 12,
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="#E86B2F"
                  strokeWidth={3}
                  name="طلبات"
                  dot={{ fill: '#E86B2F', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-[#FFF9F1] rounded-3xl border-2 border-[#D9A98F] p-6 mb-6">
          <h2 className="editorial-title text-2xl font-bold text-[#4A2418] mb-4">
            💰 الإيرادات اليومية (آخر 14 يوم)
          </h2>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#D9A98F" />
                <XAxis dataKey="date" tick={{ fill: '#4A2418', fontSize: 12 }} />
                <YAxis tick={{ fill: '#4A2418', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: '#FFF9F1',
                    border: '2px solid #D9A98F',
                    borderRadius: 12,
                  }}
                />
                <Legend />
                <Bar
                  dataKey="revenue"
                  fill="#E25A9C"
                  name="إيرادات (ج)"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Two Pies */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-[#FFF9F1] rounded-3xl border-2 border-[#D9A98F] p-6">
            <h2 className="editorial-title text-xl font-bold text-[#4A2418] mb-4">
              📊 توزيع حالات الطلبات
            </h2>
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                label={({ name, percent }: any) =>
  `${name}: ${((percent || 0) * 100).toFixed(0)}%`
}
                    outerRadius={90}
                    fill="#E86B2F"
                    dataKey="value"
                  >
                    {statusData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: '#FFF9F1',
                      border: '2px solid #D9A98F',
                      borderRadius: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[#FFF9F1] rounded-3xl border-2 border-[#D9A98F] p-6">
            <h2 className="editorial-title text-xl font-bold text-[#4A2418] mb-4">
              📄 توزيع نوع الورق
            </h2>
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={paperData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) =>
  `${name}: ${((percent || 0) * 100).toFixed(0)}%`
}
                    outerRadius={90}
                    fill="#B485F6"
                    dataKey="value"
                  >
                    {paperData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: '#FFF9F1',
                      border: '2px solid #D9A98F',
                      borderRadius: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Size Chart */}
        <div className="bg-[#FFF9F1] rounded-3xl border-2 border-[#D9A98F] p-6 mb-6">
          <h2 className="editorial-title text-2xl font-bold text-[#4A2418] mb-4">
            📐 توزيع المقاسات
          </h2>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
              <BarChart data={sizeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#D9A98F" />
                <XAxis type="number" tick={{ fill: '#4A2418', fontSize: 12 }} />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fill: '#4A2418', fontSize: 14, fontWeight: 'bold' }}
                />
                <Tooltip
                  contentStyle={{
                    background: '#FFF9F1',
                    border: '2px solid #D9A98F',
                    borderRadius: 12,
                  }}
                />
                <Bar
                  dataKey="value"
                  fill="#E86B2F"
                  name="عدد"
                  radius={[0, 8, 8, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Customers */}
        <div className="bg-[#FFF9F1] rounded-3xl border-2 border-[#D9A98F] p-6">
          <h2 className="editorial-title text-2xl font-bold text-[#4A2418] mb-4">
            🏆 أفضل 5 عملاء
          </h2>

          {topCustomers.length === 0 ? (
            <div className="text-center py-8 text-[#704B3A] font-bold">
              مفيش بيانات
            </div>
          ) : (
            <div className="space-y-3">
              {topCustomers.map((c, idx) => (
                <div
                  key={c.phone}
                  className="flex items-center gap-4 bg-[#F4E7D6] rounded-2xl p-4 border-2 border-[#D9A98F]"
                >
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black ${
                      idx === 0
                        ? 'bg-yellow-400 text-yellow-900'
                        : idx === 1
                        ? 'bg-gray-300 text-gray-700'
                        : idx === 2
                        ? 'bg-orange-300 text-orange-900'
                        : 'bg-[#F7C7E8] text-[#4A2418]'
                    }`}
                  >
                    #{idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-[#4A2418]">{c.name}</p>
                    <p
                      className="text-xs text-[#704B3A] font-bold"
                      dir="ltr"
                    >
                      📱 {c.phone}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="editorial-title text-xl font-bold text-[#E86B2F]">
                      {c.orders}
                    </p>
                    <p className="text-xs text-[#704B3A] font-bold">طلب</p>
                  </div>
                  <div className="text-center">
                    <p className="editorial-title text-xl font-bold text-green-600">
                      {c.total.toFixed(0)}
                    </p>
                    <p className="text-xs text-[#704B3A] font-bold">جنيه</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}