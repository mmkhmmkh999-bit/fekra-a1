'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { getCurrentAdmin } from '../../lib/auth'

const STATUS_LABELS: Record<string, { label: string; bg: string; color: string }> = {
  pending: { label: 'قيد المراجعة', bg: 'bg-yellow-100', color: 'text-yellow-800' },
  processing: { label: 'قيد التنفيذ', bg: 'bg-blue-100', color: 'text-blue-800' },
  shipped: { label: 'تم الشحن', bg: 'bg-purple-100', color: 'text-purple-800' },
  completed: { label: 'مكتمل', bg: 'bg-green-100', color: 'text-green-800' },
  cancelled: { label: 'ملغي', bg: 'bg-red-100', color: 'text-red-800' },
}

export default function AdminOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<any>(null)

  useEffect(() => {
    const a = getCurrentAdmin()
    if (!a) {
      router.push('/login')
      return
    }
    loadOrders()
  }, [router])

  async function loadOrders() {
    setLoading(true)
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    setOrders(data || [])
    setLoading(false)
  }

  async function updateStatus(id: number, status: string) {
    await supabase.from('orders').update({ status }).eq('id', id)
    loadOrders()
    if (selectedOrder?.id === id) {
      setSelectedOrder({ ...selectedOrder, status })
    }
  }

  async function deleteOrder(id: number) {
    if (!confirm(`متأكد من حذف الطلب #${id}؟`)) return

    // تنبيه أمني
    fetch('/api/security-alert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType: 'حذف طلب',
        urgency: 'critical',
        details: {
          'رقم الطلب': id,
        },
      }),
    }).catch(() => {})

    await supabase.from('orders').delete().eq('id', id)
    setSelectedOrder(null)
    loadOrders()
  }

  const filteredOrders = orders.filter((o) => {
    const matchFilter = filter === 'all' || o.status === filter
    const matchSearch =
      search === '' ||
      o.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.phone?.includes(search) ||
      String(o.id).includes(search)
    return matchFilter && matchSearch
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
            <span className="editorial-title text-xl font-bold">الطلبات</span>
          </Link>
          <div className="text-sm font-bold">{orders.length} طلب</div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 ابحث برقم الطلب، اسم العميل، أو التليفون..."
          className="w-full border-2 border-[#D9A98F] focus:border-[#E86B2F] rounded-2xl bg-[#FFF9F1] text-[#4A2418] px-4 py-3 focus:outline-none transition mb-4"
        />

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-bold transition ${
              filter === 'all'
                ? 'bg-[#E86B2F] text-white'
                : 'bg-[#FFF9F1] text-[#704B3A] border-2 border-[#D9A98F]'
            }`}
          >
            الكل ({orders.length})
          </button>
          {Object.entries(STATUS_LABELS).map(([key, val]) => {
            const count = orders.filter((o) => o.status === key).length
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition ${
                  filter === key
                    ? 'bg-[#E86B2F] text-white'
                    : 'bg-[#FFF9F1] text-[#704B3A] border-2 border-[#D9A98F]'
                }`}
              >
                {val.label} ({count})
              </button>
            )
          })}
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-[#FFF9F1] rounded-3xl border-2 border-[#D9A98F] p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-[#704B3A] font-bold text-lg">مفيش طلبات</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => {
              const status = STATUS_LABELS[order.status] || STATUS_LABELS.pending
              return (
                <div
                  key={order.id}
                  className="bg-[#FFF9F1] rounded-3xl border-2 border-[#D9A98F] p-5 hover:border-[#E86B2F] transition-all"
                >
                  <div className="flex justify-between items-start flex-wrap gap-3">
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className="font-black text-lg text-[#4A2418] bg-[#F7C7E8] px-3 py-1 rounded-xl">
                          #{order.id}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${status.bg} ${status.color}`}>
                          {status.label}
                        </span>
                        {order.design_image_url && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
                            🖼️ تصميم
                          </span>
                        )}
                      </div>
                      <p className="text-[#4A2418] font-bold">
                        👤 {order.customer_name}
                      </p>
                      <p className="text-[#704B3A] text-sm font-bold">
                        📱 {order.phone}
                      </p>
                      <p className="text-[#704B3A] text-xs font-bold mt-1">
                        {new Date(order.created_at).toLocaleString('ar-EG')}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-4 py-2 bg-[#E86B2F] text-white rounded-xl font-bold text-sm hover:bg-[#d15c22] transition"
                      >
                        عرض
                      </button>
                      <button
                        onClick={() => deleteOrder(order.id)}
                        className="px-3 py-2 bg-red-100 text-red-700 rounded-xl font-bold text-sm hover:bg-red-200 transition"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FFF9F1] rounded-3xl max-w-2xl w-full my-8 border-4 border-[#D9A98F]">
            <div className="bg-[#4A2418] text-[#F4E7D6] p-5 rounded-t-3xl flex justify-between items-center">
              <h2 className="editorial-title text-2xl font-bold">
                الطلب #{selectedOrder.id}
              </h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-10 h-10 bg-[#E86B2F] rounded-full font-black text-xl hover:bg-[#d15c22]"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Customer Info */}
              <div className="bg-[#F7C7E8] rounded-2xl p-4 border-2 border-[#D9A98F]">
                <h3 className="font-black text-[#4A2418] mb-3">👤 بيانات العميل</h3>
                <p className="text-[#4A2418] font-bold">الاسم: {selectedOrder.customer_name}</p>
                <p className="text-[#4A2418] font-bold">التليفون: {selectedOrder.phone}</p>
              </div>

              {/* Order Details */}
              <div className="bg-[#F4E7D6] rounded-2xl p-4 border-2 border-[#D9A98F]">
                <h3 className="font-black text-[#4A2418] mb-3">📓 تفاصيل الكراسة</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>نوع الورق:</strong> {selectedOrder.paper || '—'}</p>
                  <p><strong>الصفحات:</strong> {selectedOrder.pages || '—'}</p>
                  <p><strong>التجليد:</strong> {selectedOrder.binding || '—'}</p>
                  <p><strong>المقاس:</strong> {selectedOrder.size || '—'}</p>
                  <p><strong>المحتوى:</strong> {selectedOrder.content || '—'}</p>
                  <p><strong>الغلاف:</strong> {selectedOrder.cover || '—'}</p>

                  {selectedOrder.design_image_url && (
                    <div className="mt-3 pt-3 border-t border-[#D9A98F]">
                      <p className="mb-2"><strong>🖼️ صورة التصميم:</strong></p>
                      <a
                        href={selectedOrder.design_image_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <img
                          src={selectedOrder.design_image_url}
                          alt="تصميم"
                          className="max-w-xs rounded-2xl border-2 border-[#D9A98F] hover:border-[#E86B2F] transition cursor-pointer"
                        />
                      </a>
                    </div>
                  )}

                  {selectedOrder.notes && (
                    <p className="mt-3 pt-3 border-t border-[#D9A98F]">
                      <strong>ملاحظات:</strong> {selectedOrder.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block font-black text-[#4A2418] mb-2">
                  حالة الطلب
                </label>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => updateStatus(selectedOrder.id, e.target.value)}
                  className="w-full border-2 border-[#D9A98F] focus:border-[#E86B2F] rounded-2xl bg-[#FFF9F1] text-[#4A2418] px-4 py-3 focus:outline-none transition font-bold"
                >
                  {Object.entries(STATUS_LABELS).map(([key, val]) => (
                    <option key={key} value={key}>
                      {val.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}