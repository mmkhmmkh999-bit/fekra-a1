'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { getCurrentAdmin, hashPassword } from '../../lib/auth'

type Admin = {
  id: number
  username: string
  full_name: string | null
  email: string | null
  role: string
  is_active: boolean
  last_login: string | null
  created_at: string
}

const ROLE_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  super_admin: { label: 'مدير رئيسي', icon: '👑', color: 'bg-yellow-100 text-yellow-800' },
  admin: { label: 'مدير', icon: '🛡️', color: 'bg-pink-100 text-pink-800' },
  manager: { label: 'مشرف', icon: '📋', color: 'bg-blue-100 text-blue-800' },
  viewer: { label: 'مشاهد', icon: '👁️', color: 'bg-gray-100 text-gray-800' },
}

export default function AdminAdminsPage() {
  const router = useRouter()
  const [currentAdmin, setCurrentAdmin] = useState<any>(null)
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [message, setMessage] = useState('')

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('admin')
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    const a = getCurrentAdmin()
    if (!a) {
      router.push('/login')
      return
    }
    setCurrentAdmin(a)
    load()
  }, [router])

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('admins').select('*').order('id')
    setAdmins(data || [])
    setLoading(false)
  }

  function showMsg(text: string) {
    setMessage(text)
    setTimeout(() => setMessage(''), 3000)
  }

  function resetForm() {
    setUsername('')
    setPassword('')
    setFullName('')
    setEmail('')
    setRole('admin')
    setIsActive(true)
    setEditingId(null)
    setShowAdd(false)
  }

  function startEdit(admin: Admin) {
    setUsername(admin.username)
    setFullName(admin.full_name || '')
    setEmail(admin.email || '')
    setRole(admin.role)
    setIsActive(admin.is_active)
    setPassword('')
    setEditingId(admin.id)
    setShowAdd(true)
  }

  async function saveAdmin() {
    if (!username.trim()) {
      showMsg('❌ اكتب اسم المستخدم')
      return
    }

    const { data: existing } = await supabase
      .from('admins')
      .select('id')
      .eq('username', username.toLowerCase().trim())
      .neq('id', editingId || 0)
      .maybeSingle()

    if (existing) {
      showMsg('❌ اسم المستخدم مستخدم بالفعل')
      return
    }

    if (editingId) {
      const updates: any = {
        username: username.toLowerCase().trim(),
        full_name: fullName.trim() || null,
        email: email.trim() || null,
        role,
        is_active: isActive,
      }
      if (password.trim()) {
        if (password.length < 6) {
          showMsg('❌ كلمة السر 6 أحرف على الأقل')
          return
        }
        updates.password_hash = await hashPassword(password)
      }
      const { error } = await supabase.from('admins').update(updates).eq('id', editingId)
      if (error) {
        showMsg('❌ حدث خطأ')
        return
      }
      showMsg('✅ تم التحديث')
    } else {
      if (!password.trim() || password.length < 6) {
        showMsg('❌ كلمة السر 6 أحرف على الأقل')
        return
      }
      const hash = await hashPassword(password)
      const { error } = await supabase.from('admins').insert({
        username: username.toLowerCase().trim(),
        password_hash: hash,
        full_name: fullName.trim() || null,
        email: email.trim() || null,
        role,
        is_active: isActive,
      })
      if (error) {
        showMsg('❌ حدث خطأ')
        return
      }
      showMsg('✅ تم الإضافة')
    }

    resetForm()
    load()
  }

  async function deleteAdmin(id: number, name: string) {
    if (currentAdmin?.id === id) {
      showMsg('❌ مينفعش تحذف نفسك!')
      return
    }
    if (!confirm(`متأكد من حذف "${name}"؟`)) return
    await supabase.from('admins').delete().eq('id', id)
    showMsg('✅ تم الحذف')
    load()
  }

  async function toggleActive(id: number, current: boolean) {
    if (currentAdmin?.id === id) {
      showMsg('❌ مينفعش تعطّل نفسك!')
      return
    }
    await supabase.from('admins').update({ is_active: !current }).eq('id', id)
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
            <span className="editorial-title text-xl font-bold">🛡️ الأدمنز</span>
          </Link>
          <div className="flex gap-2 text-sm">
            <Link href="/admin" className="px-3 py-2 rounded-full hover:bg-[#E86B2F] transition">🏠</Link>
            <Link href="/admin/orders" className="px-3 py-2 rounded-full hover:bg-[#E86B2F] transition">📦</Link>
            <Link href="/admin/customers" className="px-3 py-2 rounded-full hover:bg-[#E86B2F] transition">👥</Link>
            <Link href="/admin/options" className="px-3 py-2 rounded-full hover:bg-[#E86B2F] transition">🎛️</Link>
            <Link href="/admin/pricing" className="px-3 py-2 rounded-full hover:bg-[#E86B2F] transition">💰</Link>
            <Link href="/admin/coupons" className="px-3 py-2 rounded-full hover:bg-[#E86B2F] transition">🎟️</Link>
            <Link href="/admin/admins" className="px-3 py-2 rounded-full bg-[#E86B2F] font-bold">🛡️</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="editorial-title text-3xl md:text-4xl font-bold text-[#4A2418] mb-2">
            🛡️ إدارة الأدمنز
          </h1>
          <p className="text-[#704B3A] font-bold">
            أضف وعدّل حسابات الأدمن
          </p>
        </div>

        {message && (
          <div className="bg-[#FFF9F1] border-2 border-[#D9A98F] rounded-2xl p-4 mb-6 text-center font-bold text-[#4A2418]">
            {message}
          </div>
        )}

        {/* Current Admin */}
        <div className="bg-gradient-to-br from-[#F7C7E8] to-[#B485F6] rounded-3xl border-2 border-[#D9A98F] p-5 mb-6">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="w-14 h-14 bg-[#4A2418] rounded-2xl flex items-center justify-center text-3xl text-[#F4E7D6]">
              {ROLE_LABELS[currentAdmin?.role]?.icon || '👤'}
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-[#4A2418]/70">إنت داخل باسم</p>
              <p className="editorial-title text-xl font-bold text-[#4A2418]">
                {currentAdmin?.full_name || currentAdmin?.username}
              </p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-bold ${ROLE_LABELS[currentAdmin?.role]?.color || 'bg-gray-100'}`}>
              {ROLE_LABELS[currentAdmin?.role]?.label || currentAdmin?.role}
            </span>
          </div>
        </div>

        {/* Add Button */}
        {!showAdd && (
          <button
            onClick={() => setShowAdd(true)}
            className="w-full bg-[#FFF9F1] hover:bg-[#F7C7E8] border-2 border-dashed border-[#D9A98F] hover:border-[#E86B2F] text-[#E86B2F] font-black py-5 rounded-3xl transition-all flex items-center justify-center gap-3 mb-6"
          >
            <span className="w-10 h-10 bg-[#E86B2F] text-white rounded-full flex items-center justify-center text-2xl">
              +
            </span>
            إضافة أدمن جديد
          </button>
        )}

        {/* Add/Edit Form */}
        {showAdd && (
          <div className="bg-[#FFF9F1] rounded-3xl border-2 border-[#D9A98F] p-6 mb-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="editorial-title text-xl font-bold text-[#4A2418]">
                {editingId ? '✏️ تعديل الأدمن' : '✨ أدمن جديد'}
              </h2>
              <button
                onClick={resetForm}
                className="w-8 h-8 bg-[#F7C7E8] rounded-full font-black text-[#4A2418] hover:bg-[#E25A9C] hover:text-white transition"
              >
                ✕
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-sm font-bold text-[#4A2418] mb-2">الاسم الكامل</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="أحمد محمد"
                  className="w-full border-2 border-[#D9A98F] focus:border-[#E86B2F] rounded-2xl bg-[#F4E7D6] text-[#4A2418] px-4 py-3 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#4A2418] mb-2">الإيميل (اختياري)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  dir="ltr"
                  className="w-full border-2 border-[#D9A98F] focus:border-[#E86B2F] rounded-2xl bg-[#F4E7D6] text-[#4A2418] px-4 py-3 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-sm font-bold text-[#4A2418] mb-2">اسم المستخدم</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  placeholder="username"
                  dir="ltr"
                  className="w-full border-2 border-[#D9A98F] focus:border-[#E86B2F] rounded-2xl bg-[#F4E7D6] text-[#4A2418] px-4 py-3 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#4A2418] mb-2">
                  كلمة السر {editingId && <span className="text-xs">(سيبه فاضي لو مش هتغيرها)</span>}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border-2 border-[#D9A98F] focus:border-[#E86B2F] rounded-2xl bg-[#F4E7D6] text-[#4A2418] px-4 py-3 focus:outline-none"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-bold text-[#4A2418] mb-2">الصلاحية</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.entries(ROLE_LABELS).map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => setRole(key)}
                    className={`p-3 rounded-2xl font-bold text-sm transition border-2 ${
                      role === key
                        ? 'bg-[#E86B2F] text-white border-[#E86B2F]'
                        : 'bg-[#F4E7D6] text-[#4A2418] border-[#D9A98F]'
                    }`}
                  >
                    <div className="text-xl mb-1">{val.icon}</div>
                    <div className="text-xs">{val.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 mb-4 p-3 bg-[#F4E7D6] rounded-2xl">
              <button
                onClick={() => setIsActive(!isActive)}
                className={`relative w-14 h-8 rounded-full transition ${
                  isActive ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-all ${
                    isActive ? 'right-1' : 'right-7'
                  }`}
                />
              </button>
              <span className="font-bold text-[#4A2418] text-sm">
                {isActive ? '✓ مُفعّل' : '✕ مُعطّل'}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={saveAdmin}
                className="flex-1 bg-[#E86B2F] hover:bg-[#d15c22] text-white font-black py-3 rounded-2xl transition shadow-lg"
              >
                {editingId ? '💾 حفظ التعديلات' : '✅ إضافة الأدمن'}
              </button>
              <button
                onClick={resetForm}
                className="px-6 bg-[#F4E7D6] hover:bg-[#F7C7E8] text-[#4A2418] font-black rounded-2xl transition border-2 border-[#D9A98F]"
              >
                إلغاء
              </button>
            </div>
          </div>
        )}

        {/* Admins List */}
        <div className="space-y-3">
          {admins.map((a) => {
            const isMe = currentAdmin?.id === a.id
            const roleInfo = ROLE_LABELS[a.role] || ROLE_LABELS.admin
            return (
              <div
                key={a.id}
                className={`bg-[#FFF9F1] rounded-3xl border-2 p-5 flex items-center gap-4 flex-wrap transition-all ${
                  isMe
                    ? 'border-[#E86B2F] shadow-lg'
                    : 'border-[#D9A98F] hover:border-[#E86B2F]'
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl ${
                    a.is_active ? 'bg-[#F7C7E8]' : 'bg-gray-200'
                  } border-2 border-[#D9A98F]`}
                >
                  {roleInfo.icon}
                </div>

                <div className="flex-1 min-w-[180px]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-black text-lg text-[#4A2418]">
                      {a.full_name || a.username}
                    </p>
                    {isMe && (
                      <span className="text-xs bg-[#E86B2F] text-white px-2 py-1 rounded-full font-bold">
                        أنت
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[#704B3A] font-bold" dir="ltr">
                    @{a.username}
                  </p>
                  {a.email && (
                    <p className="text-xs text-[#704B3A]" dir="ltr">
                      📧 {a.email}
                    </p>
                  )}
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-bold ${roleInfo.color}`}>
                  {roleInfo.label}
                </span>

                <button
                  onClick={() => toggleActive(a.id, a.is_active)}
                  disabled={isMe}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition disabled:opacity-50 ${
                    a.is_active
                      ? 'bg-green-100 text-green-800 border border-green-300'
                      : 'bg-gray-200 text-gray-700 border border-gray-300'
                  }`}
                >
                  {a.is_active ? '✓ مُفعّل' : '✕ مُعطّل'}
                </button>

                <button
                  onClick={() => startEdit(a)}
                  className="w-10 h-10 rounded-2xl bg-[#F7C7E8] hover:bg-[#E25A9C] hover:text-white text-[#4A2418] flex items-center justify-center transition"
                  title="تعديل"
                >
                  ✏️
                </button>

                <button
                  onClick={() => deleteAdmin(a.id, a.full_name || a.username)}
                  disabled={isMe}
                  className="w-10 h-10 rounded-2xl bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center transition disabled:opacity-30"
                  title={isMe ? 'مينفعش تحذف نفسك' : 'حذف'}
                >
                  🗑️
                </button>
              </div>
            )
          })}
        </div>

        {admins.length === 0 && (
          <div className="bg-[#FFF9F1] rounded-3xl border-2 border-[#D9A98F] p-12 text-center">
            <div className="text-6xl mb-4">👥</div>
            <p className="text-[#704B3A] font-bold">مفيش أدمنز لسه</p>
          </div>
        )}
      </div>
    </div>
  )
}