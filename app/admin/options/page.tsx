'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { getCurrentAdmin } from '../../lib/auth'

type OptionValue = {
  id: number
  option_id: number
  value: string
  price_add: number
  is_active: boolean
  display_order: number
}

type Option = {
  id: number
  name: string
  icon: string
  description: string
  display_type: string
  is_required: boolean
  is_active: boolean
  display_order: number
  option_values: OptionValue[]
}

export default function AdminOptionsPage() {
  const router = useRouter()
  const [admin, setAdmin] = useState<any>(null)
  const [options, setOptions] = useState<Option[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedOption, setExpandedOption] = useState<number | null>(null)
  const [showAddOption, setShowAddOption] = useState(false)
  const [message, setMessage] = useState('')

  const [newName, setNewName] = useState('')
  const [newIcon, setNewIcon] = useState('📝')
  const [newDesc, setNewDesc] = useState('')
  const [newType, setNewType] = useState('buttons')

  useEffect(() => {
    const a = getCurrentAdmin()
    if (!a) {
      router.push('/login')
      return
    }
    setAdmin(a)
    loadOptions()
  }, [router])

  async function loadOptions() {
    setLoading(true)
    const { data } = await supabase
      .from('options')
      .select('*, option_values(*)')
      .order('display_order')
    setOptions((data as any) || [])
    setLoading(false)
  }

  function showMsg(text: string) {
    setMessage(text)
    setTimeout(() => setMessage(''), 3000)
  }

  async function addOption() {
    if (!newName) {
      showMsg('❌ اكتب اسم الخيار')
      return
    }
    const { error } = await supabase.from('options').insert({
      name: newName,
      icon: newIcon,
      description: newDesc,
      display_type: newType,
      is_active: true,
      is_required: true,
      display_order: options.length + 1,
    })
    if (!error) {
      showMsg('✅ تم إضافة الخيار')
      setNewName('')
      setNewIcon('📝')
      setNewDesc('')
      setNewType('buttons')
      setShowAddOption(false)
      loadOptions()
    } else {
      showMsg('❌ حدث خطأ')
    }
  }

  async function updateOption(id: number, updates: Partial<Option>) {
    await supabase.from('options').update(updates).eq('id', id)
  }

  async function deleteOption(id: number, name: string) {
    if (!confirm(`متأكد من حذف الخيار "${name}"؟ هيتم حذف كل قيمه أيضاً.`)) return
    await supabase.from('options').delete().eq('id', id)
    showMsg('✅ تم الحذف')
    loadOptions()
  }

  async function addValue(optionId: number, value: string, price: string) {
    if (!value) {
      showMsg('❌ اكتب اسم القيمة')
      return
    }
    await supabase.from('option_values').insert({
      option_id: optionId,
      value,
      price_add: Number(price) || 0,
      is_active: true,
    })
    loadOptions()
  }

  async function updateValue(id: number, updates: Partial<OptionValue>) {
    await supabase.from('option_values').update(updates).eq('id', id)
  }

  async function deleteValue(id: number) {
    if (!confirm('متأكد من حذف القيمة؟')) return
    await supabase.from('option_values').delete().eq('id', id)
    loadOptions()
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
            <span className="editorial-title text-xl font-bold">🎛️ إدارة الخيارات</span>
          </Link>
          <div className="flex gap-2 text-sm">
            <Link href="/admin" className="px-3 py-2 rounded-full hover:bg-[#E86B2F] transition">🏠</Link>
            <Link href="/admin/orders" className="px-3 py-2 rounded-full hover:bg-[#E86B2F] transition">📦</Link>
            <Link href="/admin/customers" className="px-3 py-2 rounded-full hover:bg-[#E86B2F] transition">👥</Link>
            <Link href="/admin/options" className="px-3 py-2 rounded-full bg-[#E86B2F] font-bold">🎛️</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6">
        {/* Message */}
        {message && (
          <div className="bg-[#FFF9F1] border-2 border-[#D9A98F] rounded-2xl p-4 mb-6 text-center font-bold text-[#4A2418]">
            {message}
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="editorial-title text-3xl md:text-4xl font-bold text-[#4A2418] mb-2">
            🎛️ إدارة الخيارات
          </h1>
          <p className="text-[#704B3A] font-bold">
            أضف وعدّل الخيارات اللي العميل يشوفها في صفحة التخصيص
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-[#FFF9F1] rounded-3xl p-4 border-2 border-[#D9A98F] text-center">
            <div className="editorial-title text-3xl font-bold text-[#4A2418]">{options.length}</div>
            <div className="text-xs text-[#704B3A] font-bold">خيار</div>
          </div>
          <div className="bg-[#FFF9F1] rounded-3xl p-4 border-2 border-[#D9A98F] text-center">
            <div className="editorial-title text-3xl font-bold text-[#4A2418]">
              {options.filter(o => o.is_active).length}
            </div>
            <div className="text-xs text-[#704B3A] font-bold">مُفعّل</div>
          </div>
          <div className="bg-[#FFF9F1] rounded-3xl p-4 border-2 border-[#D9A98F] text-center">
            <div className="editorial-title text-3xl font-bold text-[#4A2418]">
              {options.reduce((sum, o) => sum + (o.option_values?.length || 0), 0)}
            </div>
            <div className="text-xs text-[#704B3A] font-bold">قيمة</div>
          </div>
        </div>

        {/* Add New Option */}
        {!showAddOption ? (
          <button
            onClick={() => setShowAddOption(true)}
            className="w-full bg-[#FFF9F1] hover:bg-[#F7C7E8] border-2 border-dashed border-[#D9A98F] hover:border-[#E86B2F] text-[#E86B2F] font-black py-5 rounded-3xl transition-all flex items-center justify-center gap-3 mb-6"
          >
            <span className="w-10 h-10 bg-[#E86B2F] text-white rounded-full flex items-center justify-center text-2xl">
              +
            </span>
            إضافة خيار جديد
          </button>
        ) : (
          <div className="bg-[#FFF9F1] rounded-3xl border-2 border-[#D9A98F] p-6 mb-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="editorial-title text-xl font-bold text-[#4A2418]">
                ✨ خيار جديد
              </h2>
              <button
                onClick={() => setShowAddOption(false)}
                className="w-8 h-8 bg-[#F7C7E8] rounded-full font-black text-[#4A2418] hover:bg-[#E25A9C] hover:text-white transition"
              >
                ✕
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-sm font-bold text-[#4A2418] mb-2">اسم الخيار</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="مثلاً: نوع الغلاف"
                  className="w-full border-2 border-[#D9A98F] focus:border-[#E86B2F] rounded-2xl bg-[#F4E7D6] text-[#4A2418] px-4 py-3 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#4A2418] mb-2">الأيقونة</label>
                <input
                  type="text"
                  value={newIcon}
                  onChange={(e) => setNewIcon(e.target.value)}
                  className="w-full border-2 border-[#D9A98F] focus:border-[#E86B2F] rounded-2xl bg-[#F4E7D6] text-[#4A2418] px-4 py-3 focus:outline-none text-center text-xl"
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-sm font-bold text-[#4A2418] mb-2">وصف (اختياري)</label>
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="مثلاً: اختار نوع الغلاف المناسب"
                className="w-full border-2 border-[#D9A98F] focus:border-[#E86B2F] rounded-2xl bg-[#F4E7D6] text-[#4A2418] px-4 py-3 focus:outline-none"
              />
            </div>

            <div className="mb-5">
              <label className="block text-sm font-bold text-[#4A2418] mb-2">طريقة العرض</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { val: 'buttons', label: 'أزرار', icon: '🔘' },
                  { val: 'dropdown', label: 'قائمة', icon: '📋' },
                  { val: 'number', label: 'رقم', icon: '🔢' },
                ].map((t) => (
                  <button
                    key={t.val}
                    onClick={() => setNewType(t.val)}
                    className={`p-3 rounded-2xl font-bold text-sm transition border-2 ${
                      newType === t.val
                        ? 'bg-[#E86B2F] text-white border-[#E86B2F]'
                        : 'bg-[#F4E7D6] text-[#4A2418] border-[#D9A98F]'
                    }`}
                  >
                    <div className="text-xl mb-1">{t.icon}</div>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={addOption}
              className="w-full bg-[#E86B2F] hover:bg-[#d15c22] text-white font-black py-4 rounded-2xl transition shadow-lg"
            >
              ✅ إضافة الخيار
            </button>
          </div>
        )}

        {/* Options List */}
        {options.length === 0 ? (
          <div className="bg-[#FFF9F1] rounded-3xl border-2 border-[#D9A98F] p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-[#704B3A] font-bold">مفيش خيارات، ابدأ بإضافة أول خيار</p>
          </div>
        ) : (
          <div className="space-y-3">
            {options.map((opt, idx) => (
              <div
                key={opt.id}
                className="bg-[#FFF9F1] rounded-3xl border-2 border-[#D9A98F] overflow-hidden hover:border-[#E86B2F] transition-all"
              >
                <div className="p-5 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="relative">
                      <div className="w-14 h-14 bg-[#F7C7E8] rounded-2xl flex items-center justify-center text-3xl border-2 border-[#D9A98F]">
                        {opt.icon}
                      </div>
                      <span className="absolute -top-1 -right-1 w-6 h-6 bg-[#E86B2F] text-white rounded-full flex items-center justify-center text-xs font-black">
                        {idx + 1}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={opt.name}
                        onChange={(e) => updateOption(opt.id, { name: e.target.value })}
                        onBlur={() => loadOptions()}
                        className="font-black text-lg text-[#4A2418] bg-transparent border-b-2 border-transparent hover:border-[#D9A98F] focus:border-[#E86B2F] focus:outline-none w-full transition"
                      />
                      {opt.description && (
                        <p className="text-xs text-[#704B3A] font-bold mt-0.5">{opt.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs px-3 py-1 rounded-full bg-[#F7C7E8] text-[#4A2418] font-bold border border-[#D9A98F]">
                      {opt.option_values?.length || 0} قيمة
                    </span>

                    <button
                      onClick={() => updateOption(opt.id, { is_active: !opt.is_active })}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                        opt.is_active
                          ? 'bg-green-100 text-green-800 border border-green-300'
                          : 'bg-gray-200 text-gray-700 border border-gray-300'
                      }`}
                    >
                      {opt.is_active ? '✓ مُفعّل' : '✕ مُعطّل'}
                    </button>

                    <button
                      onClick={() => updateOption(opt.id, { is_required: !opt.is_required })}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                        opt.is_required
                          ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                          : 'bg-gray-200 text-gray-700 border border-gray-300'
                      }`}
                    >
                      {opt.is_required ? '⚠️ إجباري' : '⚪ اختياري'}
                    </button>

                    <button
                      onClick={() => setExpandedOption(expandedOption === opt.id ? null : opt.id)}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
                        expandedOption === opt.id
                          ? 'bg-[#E86B2F] text-white'
                          : 'bg-[#F7C7E8] text-[#4A2418] border border-[#D9A98F]'
                      }`}
                    >
                      {expandedOption === opt.id ? '▼' : '▶'} تعديل القيم
                    </button>

                    <button
                      onClick={() => deleteOption(opt.id, opt.name)}
                      className="w-9 h-9 rounded-full bg-red-100 hover:bg-red-200 text-red-600 transition flex items-center justify-center"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {expandedOption === opt.id && (
                  <div className="border-t-2 border-[#D9A98F] p-5 bg-[#F4E7D6]">
                    <ValueEditor
                      optionId={opt.id}
                      values={opt.option_values || []}
                      onAdd={addValue}
                      onUpdate={updateValue}
                      onDelete={deleteValue}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ValueEditor({
  optionId,
  values,
  onAdd,
  onUpdate,
  onDelete,
}: {
  optionId: number
  values: OptionValue[]
  onAdd: (optId: number, value: string, price: string) => void
  onUpdate: (id: number, updates: Partial<OptionValue>) => void
  onDelete: (id: number) => void
}) {
  const [newVal, setNewVal] = useState('')
  const [newPrice, setNewPrice] = useState('')

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4 p-4 bg-[#FFF9F1] rounded-2xl border-2 border-dashed border-[#E86B2F]">
        <input
          type="text"
          placeholder="اسم القيمة (مثلاً: سلك)"
          value={newVal}
          onChange={(e) => setNewVal(e.target.value)}
          className="flex-1 min-w-[150px] border-2 border-[#D9A98F] focus:border-[#E86B2F] rounded-xl bg-[#F4E7D6] text-[#4A2418] px-4 py-2 focus:outline-none font-bold"
        />
        <input
          type="number"
          placeholder="السعر الإضافي"
          value={newPrice}
          onChange={(e) => setNewPrice(e.target.value)}
          className="w-32 border-2 border-[#D9A98F] focus:border-[#E86B2F] rounded-xl bg-[#F4E7D6] text-[#4A2418] px-4 py-2 focus:outline-none font-bold"
        />
        <button
          onClick={() => {
            onAdd(optionId, newVal, newPrice)
            setNewVal('')
            setNewPrice('')
          }}
          className="bg-[#E86B2F] hover:bg-[#d15c22] text-white font-black px-5 py-2 rounded-xl transition"
        >
          ➕ إضافة
        </button>
      </div>

      {values.length === 0 ? (
        <div className="text-center py-8 text-[#704B3A] font-bold">
          <div className="text-4xl mb-2">📝</div>
          مفيش قيم، ابدأ بإضافة واحدة
        </div>
      ) : (
        <div className="space-y-2">
          {values.sort((a, b) => a.id - b.id).map((v) => (
            <div
              key={v.id}
              className="flex items-center gap-3 flex-wrap bg-[#FFF9F1] rounded-2xl p-3 border-2 border-[#D9A98F] hover:border-[#E86B2F] transition"
            >
              <div className={`w-2 h-8 rounded-full ${v.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />

              <input
                type="text"
                value={v.value}
                onChange={(e) => onUpdate(v.id, { value: e.target.value })}
                className="flex-1 min-w-[150px] border-b-2 border-transparent hover:border-[#D9A98F] focus:border-[#E86B2F] focus:outline-none bg-transparent text-[#4A2418] font-bold py-1"
              />

              <div className="flex items-center gap-1 bg-[#F7C7E8] rounded-xl px-3 py-1.5 border border-[#D9A98F]">
                <span className="text-[#E86B2F] font-black">+</span>
                <input
                  type="number"
                  value={v.price_add}
                  onChange={(e) => onUpdate(v.id, { price_add: Number(e.target.value) })}
                  className="w-20 bg-transparent text-center text-[#4A2418] font-black focus:outline-none"
                />
                <span className="text-[#E86B2F] font-black">ج</span>
              </div>

              <button
                onClick={() => onUpdate(v.id, { is_active: !v.is_active })}
                className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                  v.is_active
                    ? 'bg-green-100 text-green-800 border border-green-300'
                    : 'bg-gray-200 text-gray-700 border border-gray-300'
                }`}
              >
                {v.is_active ? 'مُفعّل' : 'مُعطّل'}
              </button>

              <button
                onClick={() => onDelete(v.id)}
                className="w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 text-red-600 transition flex items-center justify-center"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}