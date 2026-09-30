'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { getCurrentAdmin } from '../../lib/auth'

export default function AdminCustomersPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const a = getCurrentAdmin()
    if (!a) {
      router.push('/login')
      return
    }
    loadCustomers()
  }, [router])

  async function loadCustomers() {
    setLoading(true)

    // جلب الطلبات
    const { data: orders } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (orders) {
      // تجميع العملاء حسب رقم التليفون
      const customersMap = new Map()

      orders.forEach((order) => {
        const key = order.phone
        if (!customersMap.has(key)) {
          customersMap.set(key, {
            name: order.customer_name,
            phone: order.phone,
            orders: [],
            totalSpent: 0,
            lastOrder: order.created_at,
          })
        }
        const c = customersMap.get(key)
        c.orders.push(order)
        c.totalSpent += Number(order.total_price) || 0
      })

      const customersList = Array.from(customersMap.values())
      setCustomers(customersList)
    }
    setLoading(false)
  }

  const filteredCustomers = customers.filter((c) => {
    if (search === '') return true
    return (
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
    )
  })

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
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#E86B2F] rounded-full flex items-center justify-center font-black">
              ←
            </div>
            <span className="editorial-title text-xl font-bold">العملاء</span>
          </Link>
          <div className="text-sm font-bold">{customers.length} عميل</div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 ابحث بالاسم أو رقم التليفون..."
          className="w-full border-2 border-[#D9A98F] focus:border-[#E86B2F] rounded-2xl bg-[#FFF9F1] text-[#4A2418] px-4 py-3 focus:outline-none transition mb-6"
        />

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#FFF9F1] rounded-3xl p-5 border-2 border-[#D9A98F]">
            <div className="text-3xl mb-2">👥</div>
            <div className="editorial-title text-3xl font-bold text-[#4A2418]">
              {customers.length}
            </div>
            <div className="text-sm text-[#704B3A] font-bold">إجمالي العملاء</div>
          </div>

          <div className="bg-[#FFF9F1] rounded-3xl p-5 border-2 border-[#D9A98F]">
            <div className="text-3xl mb-2">📦</div>
            <div className="editorial-title text-3xl font-bold text-[#4A2418]">
              {customers.reduce((sum, c) => sum + c.orders.length, 0)}
            </div>
            <div className="text-sm text-[#704B3A] font-bold">إجمالي الطلبات</div>
          </div>

          <div className="bg-[#FFF9F1] rounded-3xl p-5 border-2 border-[#D9A98F]">
            <div className="text-3xl mb-2">💰</div>
            <div className="editorial-title text-3xl font-bold text-[#4A2418]">
              {customers.reduce((sum, c) => sum + c.totalSpent, 0).toFixed(0)}
            </div>
            <div className="text-sm text-[#704B3A] font-bold">إجمالي المبيعات</div>
          </div>
        </div>

        {/* Customers List */}
        {filteredCustomers.length === 0 ? (
          <div className="bg-[#FFF9F1] rounded-3xl border-2 border-[#D9A98F] p-12 text-center">
            <div className="text-6xl mb-4">👥</div>
            <p className="text-[#704B3A] font-bold text-lg">
              {search ? 'مفيش نتائج للبحث' : 'مفيش عملاء لسه'}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {filteredCustomers.map((customer) => (
              <div
                key={customer.phone}
                className="bg-[#FFF9F1] rounded-3xl border-2 border-[#D9A98F] p-5 hover:border-[#E86B2F] transition-all"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-[#4A2418] text-[#F4E7D6] rounded-2xl flex items-center justify-center editorial-title text-2xl font-bold">
                    {customer.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="font-black text-lg text-[#4A2418]">
                      {customer.name}
                    </div>
                    <a
                      href={`tel:${customer.phone}`}
                      className="text-[#704B3A] font-bold text-sm hover:text-[#E86B2F]"
                      dir="ltr"
                    >
                      📱 {customer.phone}
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-3 border-t-2 border-[#D9A98F]">
                  <div className="text-center">
                    <div className="text-2xl font-black text-[#E86B2F]">
                      {customer.orders.length}
                    </div>
                    <div className="text-xs text-[#704B3A] font-bold">طلب</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-black text-[#E86B2F]">
                      {customer.totalSpent.toFixed(0)}
                    </div>
                    <div className="text-xs text-[#704B3A] font-bold">جنيه</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-black text-[#E86B2F]">
                      {new Date(customer.lastOrder).toLocaleDateString('ar-EG')}
                    </div>
                    <div className="text-xs text-[#704B3A] font-bold">آخر طلب</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}