'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { getCurrentAdmin } from '../../lib/auth'

type Setting = {
  key: string
  value: string
  label: string
}

type ShippingZone = {
  id: number
  name: string
  cost: number
  is_active: boolean
  display_order: number
}

export default function AdminPricingPage() {
  const router = useRouter()
  const [admin, setAdmin] = useState<any>(null)
  const [settings, setSettings] = useState<Setting[]>([])
  const [zones, setZones] = useState<ShippingZone[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingZones, setSavingZones] = useState(false)
  const [message, setMessage] = useState('')
  const [zoneMessage, setZoneMessage] = useState('')

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

    const { data: s } = await supabase.from('settings').select('*')
    setSettings((s as any) || [])

    const { data: z } = await supabase
      .from('shipping_zones')
      .select('*')
      .order('display_order')
    setZones(z || [])

    setLoading(false)
  }

  function showMsg(text: string) {
    setMessage(text)
    setTimeout(() => setMessage(''), 3000)
  }

  function showZoneMsg(text: string) {
    setZoneMessage(text)
    setTimeout(() => setZoneMessage(''), 3000)
  }

  // ===== حفظ الإعدادات =====
  async function saveSettings() {
    setSaving(true)
    setMessage('')
    for (const s of settings) {
      await supabase
        .from('settings')
        .update({ value: s.value, updated_at: new Date().toISOString() })
        .eq('key', s.key)
    }
    setSaving(false)
    showMsg('✅ تم حفظ الإعدادات')
  }

  // ===== حفظ أسعار الشحن =====
  async function saveAllZones() {
    setSavingZones(true)
    setZoneMessage('')
    for (const z of zones) {
      await supabase
        .from('shipping_zones')
        .update({ cost: z.cost, is_active: z.is_active })
        .eq('id', z.id)
    }
    setSavingZones(false)
    showZoneMsg('✅ تم حفظ أسعار الشحن')
  }

  async function updateZone(id: number, updates: Partial<ShippingZone>) {
    await supabase.from('shipping_zones').update(updates).eq('id', id)
  }

  function applyToAll(cost: number) {
    if (!confirm(`هتحط ${cost} ج لكل المحافظات. متأكد؟`)) return
    setZones(zones.map((z) => ({ ...z, cost })))
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
            <span className="editorial-title text-xl font-bold">💰 الأسعار والشحن</span>
          </Link>
          <div className="flex gap-2 text-sm">
            <Link href="/admin" className="px-3 py-2 rounded-full hover:bg-[#E86B2F] transition">🏠</Link>
            <Link href="/admin/orders" className="px-3 py-2 rounded-full hover:bg-[#E86B2F] transition">📦</Link>
            <Link href="/admin/customers" className="px-3 py-2 rounded-full hover:bg-[#E86B2F] transition">👥</Link>
            <Link href="/admin/options" className="px-3 py-2 rounded-full hover:bg-[#E86B2F] transition">🎛️</Link>
            <Link href="/admin/pricing" className="px-3 py-2 rounded-full bg-[#E86B2F] font-bold">💰</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="editorial-title text-3xl md:text-4xl font-bold text-[#4A2418] mb-2">
            💰 الأسعار والشحن
          </h1>
          <p className="text-[#704B3A] font-bold">
            تحكم في أسعار الشحن والإعدادات العامة
          </p>
        </div>

        {/* ═══ الشحن ═══ */}
        <div className="bg-[#FFF9F1] rounded-3xl border-2 border-[#D9A98F] p-6 mb-6">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <h2 className="editorial-title text-2xl font-bold text-[#4A2418] flex items-center gap-2">
              🚚 أسعار الشحن ({zones.length} محافظة)
            </h2>
            <div className="flex items-center gap-2">
              {zoneMessage && (
                <span className="text-green-600 font-bold text-sm">{zoneMessage}</span>
              )}
              <button
                onClick={saveAllZones}
                disabled={savingZones}
                className="bg-[#E86B2F] hover:bg-[#d15c22] text-white font-black px-6 py-2.5 rounded-2xl disabled:opacity-50 transition shadow-lg text-sm"
              >
                {savingZones ? 'جاري الحفظ...' : '💾 حفظ الأسعار'}
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 mb-5 p-4 bg-[#F7C7E8] rounded-2xl border-2 border-dashed border-[#D9A98F]">
            <span className="text-[#4A2418] font-bold text-sm self-center">
              إجراءات سريعة:
            </span>
            {[30, 45, 60, 75].map((price) => (
              <button
                key={price}
                onClick={() => applyToAll(price)}
                className="px-4 py-2 rounded-xl bg-[#FFF9F1] hover:bg-[#E86B2F] hover:text-white text-[#4A2418] font-bold text-sm transition border border-[#D9A98F]"
              >
                كلهم {price} ج
              </button>
            ))}
            <button
              onClick={() => applyToAll(0)}
              className="px-4 py-2 rounded-xl bg-[#FFF9F1] hover:bg-red-100 text-red-600 font-bold text-sm transition border border-red-300"
            >
              تصفير
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            {zones.map((z) => (
              <div
                key={z.id}
                className="flex items-center gap-3 bg-[#F4E7D6] rounded-2xl p-3 border-2 border-[#D9A98F] hover:border-[#E86B2F] transition"
              >
                <div
                  className={`w-2 h-10 rounded-full ${
                    z.is_active ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />

                <div className="flex-1 min-w-[100px]">
                  <p className="font-black text-[#4A2418]">{z.name}</p>
                </div>

                <div className="flex items-center gap-1 bg-[#F7C7E8] rounded-xl px-3 py-1.5 border border-[#D9A98F]">
                  <input
                    type="number"
                    value={z.cost}
                    onChange={(e) => {
                      setZones(
                        zones.map((zz) =>
                          zz.id === z.id
                            ? { ...zz, cost: Number(e.target.value) }
                            : zz
                        )
                      )
                    }}
                    className="w-20 bg-transparent text-center text-[#4A2418] font-black focus:outline-none"
                  />
                  <span className="text-[#E86B2F] font-black text-sm">ج</span>
                </div>

                <button
                  onClick={() => {
                    const updated = !z.is_active
                    setZones(
                      zones.map((zz) =>
                        zz.id === z.id ? { ...zz, is_active: updated } : zz
                      )
                    )
                    updateZone(z.id, { is_active: updated })
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                    z.is_active
                      ? 'bg-green-100 text-green-800 border border-green-300'
                      : 'bg-gray-200 text-gray-700 border border-gray-300'
                  }`}
                >
                  {z.is_active ? 'مُفعّل' : 'مُعطّل'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ الإعدادات العامة ═══ */}
        <div className="bg-[#FFF9F1] rounded-3xl border-2 border-[#D9A98F] p-6">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <h2 className="editorial-title text-2xl font-bold text-[#4A2418] flex items-center gap-2">
              ⚙️ الإعدادات العامة
            </h2>
            <div className="flex items-center gap-2">
              {message && (
                <span className="text-green-600 font-bold text-sm">{message}</span>
              )}
              <button
                onClick={saveSettings}
                disabled={saving}
                className="bg-[#E86B2F] hover:bg-[#d15c22] text-white font-black px-6 py-2.5 rounded-2xl disabled:opacity-50 transition shadow-lg text-sm"
              >
                {saving ? 'جاري الحفظ...' : '💾 حفظ الإعدادات'}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {settings.map((s, i) => (
              <div key={s.key} className="flex items-center gap-4 flex-wrap">
                <label className="w-full md:w-56 font-bold text-[#4A2418] text-sm">
                  {s.label || s.key}
                </label>
                <input
                  type="text"
                  value={s.value}
                  onChange={(e) => {
                    const arr = [...settings]
                    arr[i].value = e.target.value
                    setSettings(arr)
                  }}
                  className="flex-1 min-w-[200px] border-2 border-[#D9A98F] focus:border-[#E86B2F] rounded-xl bg-[#F4E7D6] text-[#4A2418] px-4 py-3 focus:outline-none font-bold"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}