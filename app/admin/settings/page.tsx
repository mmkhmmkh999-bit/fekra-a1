'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { getCurrentAdmin, logoutAdmin, hashPassword } from '../../lib/auth'

type Setting = {
  key: string
  value: string
  label: string
}

export default function AdminSettingsPage() {
  const router = useRouter()
  const [admin, setAdmin] = useState<any>(null)
  const [settings, setSettings] = useState<Setting[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  // تغيير كلمة سر الأدمن الحالي
  const [currentPass, setCurrentPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [changing, setChanging] = useState(false)
  const [showPass, setShowPass] = useState(false)

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
    const { data } = await supabase.from('settings').select('*')
    setSettings((data as any) || [])
    setLoading(false)
  }

  function showMsg(text: string) {
    setMessage(text)
    setTimeout(() => setMessage(''), 3000)
  }

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

  async function changeMyPassword() {
    if (!currentPass) {
      showMsg('❌ ادخل كلمة السر الحالية')
      return
    }
    if (!newPass || newPass.length < 6) {
      showMsg('❌ كلمة السر الجديدة 6 أحرف على الأقل')
      return
    }
    if (newPass !== confirmPass) {
      showMsg('❌ الكلمتين مش متطابقتين')
      return
    }

    setChanging(true)

    const { data: adminData } = await supabase
      .from('admins')
      .select('*')
      .eq('id', admin.id)
      .single()

    if (!adminData) {
      showMsg('❌ حدث خطأ')
      setChanging(false)
      return
    }

    const currentHash = await hashPassword(currentPass)
    const isValid =
      adminData.password_hash === currentHash ||
      adminData.password_hash === currentPass

    if (!isValid) {
      showMsg('❌ كلمة السر الحالية غلط')
      setChanging(false)
      return
    }

    const newHash = await hashPassword(newPass)
    const { error } = await supabase
      .from('admins')
      .update({ password_hash: newHash })
      .eq('id', admin.id)

    setChanging(false)

    if (error) {
      showMsg('❌ حدث خطأ')
      return
    }

    // تنبيه أمني
    fetch('/api/security-alert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType: 'تغيير كلمة سر الأدمن',
        urgency: 'critical',
        details: {
          'اسم المستخدم': admin?.username,
          'الاسم': admin?.full_name || 'غير محدد',
        },
      }),
    }).catch(() => {})

    showMsg('✅ تم تغيير كلمة السر، هتخرج دلوقتي...')
    setCurrentPass('')
    setNewPass('')
    setConfirmPass('')

    setTimeout(() => {
      logoutAdmin()
      router.push('/login')
    }, 2000)
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
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center flex-wrap gap-3">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#E86B2F] rounded-full flex items-center justify-center font-black">
              ←
            </div>
            <span className="editorial-title text-xl font-bold">⚙️ الإعدادات</span>
          </Link>
          <div className="flex gap-2 text-sm">
            <Link href="/admin" className="px-3 py-2 rounded-full hover:bg-[#E86B2F] transition">🏠</Link>
            <Link href="/admin/orders" className="px-3 py-2 rounded-full hover:bg-[#E86B2F] transition">📦</Link>
            <Link href="/admin/customers" className="px-3 py-2 rounded-full hover:bg-[#E86B2F] transition">👥</Link>
            <Link href="/admin/options" className="px-3 py-2 rounded-full hover:bg-[#E86B2F] transition">🎛️</Link>
            <Link href="/admin/pricing" className="px-3 py-2 rounded-full hover:bg-[#E86B2F] transition">💰</Link>
            <Link href="/admin/coupons" className="px-3 py-2 rounded-full hover:bg-[#E86B2F] transition">🎟️</Link>
            <Link href="/admin/admins" className="px-3 py-2 rounded-full hover:bg-[#E86B2F] transition">🛡️</Link>
            <Link href="/admin/settings" className="px-3 py-2 rounded-full bg-[#E86B2F] font-bold">⚙️</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="editorial-title text-3xl md:text-4xl font-bold text-[#4A2418] mb-2">
            ⚙️ الإعدادات
          </h1>
          <p className="text-[#704B3A] font-bold">تحكم في بيانات الموقع وحسابك</p>
        </div>

        {message && (
          <div className="bg-[#FFF9F1] border-2 border-[#D9A98F] rounded-2xl p-4 mb-6 text-center font-bold text-[#4A2418]">
            {message}
          </div>
        )}

        {/* Current Admin Info */}
        <div className="bg-gradient-to-br from-[#F7C7E8] to-[#B485F6] rounded-3xl border-2 border-[#D9A98F] p-5 mb-6">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="w-14 h-14 bg-[#4A2418] rounded-2xl flex items-center justify-center text-3xl text-[#F4E7D6]">
              👤
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-[#4A2418]/70">إنت داخل باسم</p>
              <p className="editorial-title text-xl font-bold text-[#4A2418]">
                {admin?.full_name || admin?.username}
              </p>
              <p className="text-xs text-[#4A2418]/70 font-bold" dir="ltr">
                @{admin?.username}
              </p>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-[#FFF9F1] rounded-3xl border-2 border-[#D9A98F] p-6 mb-6">
          <h2 className="editorial-title text-2xl font-bold text-[#4A2418] mb-4 flex items-center gap-2">
            🔐 تغيير كلمة السر
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-[#4A2418] mb-2">
                كلمة السر الحالية
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  className="w-full border-2 border-[#D9A98F] focus:border-[#E86B2F] rounded-2xl bg-[#F4E7D6] text-[#4A2418] px-4 py-3 focus:outline-none pl-12"
                  placeholder="••••••••"
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

            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-bold text-[#4A2418] mb-2">
                  كلمة السر الجديدة
                </label>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className="w-full border-2 border-[#D9A98F] focus:border-[#E86B2F] rounded-2xl bg-[#F4E7D6] text-[#4A2418] px-4 py-3 focus:outline-none"
                  placeholder="6 أحرف على الأقل"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#4A2418] mb-2">
                  تأكيد كلمة السر
                </label>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  className="w-full border-2 border-[#D9A98F] focus:border-[#E86B2F] rounded-2xl bg-[#F4E7D6] text-[#4A2418] px-4 py-3 focus:outline-none"
                  placeholder="اكتبها تاني"
                />
              </div>
            </div>

            {confirmPass && newPass && confirmPass === newPass && (
              <p className="text-green-600 font-bold text-sm">✓ الكلمتين متطابقتين</p>
            )}
            {confirmPass && newPass && confirmPass !== newPass && (
              <p className="text-red-600 font-bold text-sm">⚠️ الكلمتين مش متطابقتين</p>
            )}

            <button
              onClick={changeMyPassword}
              disabled={changing || !currentPass || !newPass || !confirmPass}
              className="w-full bg-[#E86B2F] hover:bg-[#d15c22] text-white font-black py-4 rounded-2xl transition shadow-lg disabled:opacity-50"
            >
              {changing ? 'جاري التغيير...' : '🔐 تغيير كلمة السر'}
            </button>
            <p className="text-xs text-[#704B3A] text-center font-bold">
              ⚠️ هتخرج من اللوحة وتدخل بالباسورد الجديد
            </p>
          </div>
        </div>

        {/* Site Settings */}
        <div className="bg-[#FFF9F1] rounded-3xl border-2 border-[#D9A98F] p-6 mb-6">
          <h2 className="editorial-title text-2xl font-bold text-[#4A2418] mb-4 flex items-center gap-2">
            🛠️ إعدادات الموقع
          </h2>

          <div className="space-y-4">
            {settings.map((s, i) => (
              <div key={s.key}>
                <label className="block text-sm font-bold text-[#4A2418] mb-2">
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
                  className="w-full border-2 border-[#D9A98F] focus:border-[#E86B2F] rounded-2xl bg-[#F4E7D6] text-[#4A2418] px-4 py-3 focus:outline-none font-bold"
                  dir={
                    s.key.includes('url') ||
                    s.key.includes('email') ||
                    s.key.includes('number')
                      ? 'ltr'
                      : 'rtl'
                  }
                />
              </div>
            ))}
          </div>

          <button
            onClick={saveSettings}
            disabled={saving}
            className="w-full mt-6 bg-[#E86B2F] hover:bg-[#d15c22] text-white font-black py-4 rounded-2xl transition shadow-lg disabled:opacity-50"
          >
            {saving ? 'جاري الحفظ...' : '💾 حفظ الإعدادات'}
          </button>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 border-2 border-red-300 rounded-3xl p-6">
          <h3 className="editorial-title text-xl font-bold text-red-800 mb-2 flex items-center gap-2">
            ⚠️ منطقة الخطر
          </h3>
          <p className="text-red-700 font-bold text-sm mb-4">
            تسجيل الخروج من اللوحة
          </p>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-black px-6 py-3 rounded-2xl transition shadow-lg"
          >
            🚪 تسجيل الخروج
          </button>
        </div>
      </div>
    </div>
  )
}