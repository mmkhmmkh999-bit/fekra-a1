'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabase'
import { addToCart } from '../lib/cart'

type Selections = {
  paper: string
  pages: string
  customPages: string
  binding: string
  size: string
  content: string[]
  cover: string
  notes: string
  fullName: string
  phone: string
}

export default function CustomizePage() {
  const [sel, setSel] = useState<Selections>({
    paper: '',
    pages: '',
    customPages: '',
    binding: '',
    size: '',
    content: [],
    cover: '',
    notes: '',
    fullName: '',
    phone: '',
  })

  const [designImage, setDesignImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [addedToCart, setAddedToCart] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  function choose(field: keyof Selections, value: string) {
    setSel((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  function toggleContent(value: string) {
    setSel((prev) => ({
      ...prev,
      content: prev.content.includes(value)
        ? prev.content.filter((c) => c !== value)
        : [...prev.content, value],
    }))
    setErrors((prev) => ({ ...prev, content: '' }))
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null
    setDesignImage(file)
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result as string)
      reader.readAsDataURL(file)
    } else {
      setImagePreview('')
    }
  }

  function removeImage() {
    setDesignImage(null)
    setImagePreview('')
  }

  function validate() {
    const newErrors: Record<string, string> = {}
    if (!sel.paper) newErrors.paper = 'اختار نوع الورق'
    if (!sel.pages) newErrors.pages = 'اختار عدد الصفحات'
    if (sel.pages === 'Custom' && !sel.customPages)
      newErrors.customPages = 'اكتب عدد الصفحات'
    if (!sel.binding) newErrors.binding = 'اختار نوع التجليد'
    if (!sel.size) newErrors.size = 'اختار المقاس'
    if (sel.content.length === 0) newErrors.content = 'اختار محتوى واحد على الأقل'
    if (!sel.cover) newErrors.cover = 'اختار نوع الغلاف'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()

    if (!validate()) {
      const firstError = document.querySelector('.has-error')
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return
    }

    setSubmitting(true)

    const pagesText =
      sel.pages === 'Custom' ? `${sel.customPages} صفحة (مخصص)` : sel.pages

    // رفع الصورة لو موجودة
    let imageUrl = ''
    if (designImage) {
      const fileName = `${Date.now()}-${designImage.name.replace(/\s/g, '-')}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('designs')
        .upload(fileName, designImage)

      if (!uploadError && uploadData) {
        const { data: urlData } = supabase.storage
          .from('designs')
          .getPublicUrl(uploadData.path)
        imageUrl = urlData.publicUrl
      }
    }

    // إضافة للسلة (من غير حفظ في قاعدة البيانات)
    addToCart({
      paper: sel.paper,
      pages: pagesText,
      binding: sel.binding,
      size: sel.size,
      content: sel.content.join(', '),
      cover: sel.cover,
      notes: sel.notes,
      designImageUrl: imageUrl,
      quantity: 1,
    })

    setSubmitting(false)
    setAddedToCart(true)

    // إعادة تعيين النموذج بعد ثانيتين
    setTimeout(() => {
      setAddedToCart(false)
      setSel({
        paper: '',
        pages: '',
        customPages: '',
        binding: '',
        size: '',
        content: [],
        cover: '',
        notes: '',
        fullName: '',
        phone: '',
      })
      setDesignImage(null)
      setImagePreview('')
    }, 2000)
  }

  const paperOptions = ['Basic', 'Premium', 'Luxury']
  const pagesOptions = ['50 Pages', '100 Pages', '150 Pages', '200 Pages', 'Custom']
  const bindingOptions = ['Spiral / Wire', 'No Wire']
  const sizeOptions = ['A5', 'A4', 'Mini']
  const contentOptions = [
    'Notes',
    'Daily Planner',
    'Weekly Planner',
    'Monthly Planner',
    'To Do List',
    'Habit Tracker',
    'Budget',
    'Reflection',
    'Brain Dump',
    'Custom Content',
  ]
  const coverOptions = ['Existing FAKRA Design', 'Custom Design']

  return (
    <div className="min-h-screen bg-[#F4E7D6]" dir="rtl">
      <nav className="sticky top-0 z-50 bg-[#FFF9F1]/95 backdrop-blur-xl border-b-2 border-[#D9A98F]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link
            href="/"
            className="text-[#704B3A] hover:text-[#E86B2F] font-black transition flex items-center gap-2"
          >
            → الرجوع
          </Link>
          <span className="editorial-title text-lg font-bold text-[#4A2418]">
            ✦ FAKRA BY YASMIN
          </span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <header className="text-center mb-10">
          <p className="text-xs font-bold tracking-[0.23em] uppercase text-[#704B3A] mb-3">
            ✦ PERSONAL PAPER GOODS ✦
          </p>
          <h1 className="editorial-title text-4xl md:text-5xl font-bold text-[#4A2418] mb-3">
            صمّم كراستك
          </h1>
          <p className="text-[#704B3A] italic">Create Your Own Notebook</p>
        </header>

        <form onSubmit={submit} className="space-y-8" noValidate>
          {/* 1. Paper Quality */}
          <section className={errors.paper ? 'has-error' : ''}>
            <h2 className="editorial-title text-2xl font-bold text-[#4A2418] mb-4">
              1. نوع الورق
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {paperOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => choose('paper', opt)}
                  className={`choice-card ${
                    sel.paper === opt
                      ? '!bg-[#E25A9C] !text-white !border-[#E86B2F] font-bold shadow-lg'
                      : ''
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
            {errors.paper && (
              <p className="text-[#a32d20] text-sm font-semibold mt-2">{errors.paper}</p>
            )}
          </section>

          {/* 2. Binding */}
          <section className={errors.binding ? 'has-error' : ''}>
            <h2 className="editorial-title text-2xl font-bold text-[#4A2418] mb-4">
              2. التجليد
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {bindingOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => choose('binding', opt)}
                  className={`choice-card ${
                    sel.binding === opt
                      ? '!bg-[#E25A9C] !text-white !border-[#E86B2F] font-bold shadow-lg'
                      : ''
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
            {errors.binding && (
              <p className="text-[#a32d20] text-sm font-semibold mt-2">{errors.binding}</p>
            )}
          </section>

          {/* 3. Size */}
          <section className={errors.size ? 'has-error' : ''}>
            <h2 className="editorial-title text-2xl font-bold text-[#4A2418] mb-4">
              3. المقاس
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {sizeOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => choose('size', opt)}
                  className={`choice-card ${
                    sel.size === opt
                      ? '!bg-[#E25A9C] !text-white !border-[#E86B2F] font-bold shadow-lg'
                      : ''
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
            {errors.size && (
              <p className="text-[#a32d20] text-sm font-semibold mt-2">{errors.size}</p>
            )}
          </section>

          {/* 4. Pages */}
          <section className={errors.pages || errors.customPages ? 'has-error' : ''}>
            <h2 className="editorial-title text-2xl font-bold text-[#4A2418] mb-4">
              4. عدد الصفحات
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {pagesOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => choose('pages', opt)}
                  className={`choice-card ${
                    sel.pages === opt
                      ? '!bg-[#E25A9C] !text-white !border-[#E86B2F] font-bold shadow-lg'
                      : ''
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            {sel.pages === 'Custom' && (
              <div className="mt-4">
                <label className="block text-sm font-bold text-[#4A2418] mb-2">
                  اكتب عدد الصفحات
                </label>
                <input
                  type="number"
                  min="1"
                  value={sel.customPages}
                  onChange={(e) => choose('customPages', e.target.value)}
                  className="w-full border-2 border-[#D9A98F] focus:border-[#E86B2F] rounded-2xl bg-[#FFF9F1] text-[#4A2418] px-4 py-3 focus:outline-none transition"
                  placeholder="مثال: 80"
                />
                {errors.customPages && (
                  <p className="text-[#a32d20] text-sm font-semibold mt-2">
                    {errors.customPages}
                  </p>
                )}
              </div>
            )}

            {errors.pages && (
              <p className="text-[#a32d20] text-sm font-semibold mt-2">{errors.pages}</p>
            )}
          </section>

          {/* 5. Content */}
          <section className={errors.content ? 'has-error' : ''}>
            <h2 className="editorial-title text-2xl font-bold text-[#4A2418] mb-4">
              5. محتوى الكراسة
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {contentOptions.map((opt) => {
                const isSelected = sel.content.includes(opt)
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggleContent(opt)}
                    className={`choice-card !justify-start gap-2 ${
                      isSelected
                        ? '!bg-[#E25A9C] !text-white !border-[#E86B2F] font-bold shadow-lg'
                        : ''
                    }`}
                  >
                    <span
                      className={`w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                        isSelected
                          ? 'bg-[#E86B2F] border-[#E86B2F] text-white'
                          : 'border-[#9B6F5A] text-transparent'
                      }`}
                    >
                      ✓
                    </span>
                    <span>{opt}</span>
                  </button>
                )
              })}
            </div>
            {errors.content && (
              <p className="text-[#a32d20] text-sm font-semibold mt-2">{errors.content}</p>
            )}
          </section>

          {/* 6. Cover */}
          <section className={errors.cover ? 'has-error' : ''}>
            <h2 className="editorial-title text-2xl font-bold text-[#4A2418] mb-4">
              6. نوع الغلاف
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {coverOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => choose('cover', opt)}
                  className={`choice-card ${
                    sel.cover === opt
                      ? '!bg-[#E25A9C] !text-white !border-[#E86B2F] font-bold shadow-lg'
                      : ''
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
            {errors.cover && (
              <p className="text-[#a32d20] text-sm font-semibold mt-2">{errors.cover}</p>
            )}
          </section>

          {/* 7. Design Image */}
          <section>
            <h2 className="editorial-title text-2xl font-bold text-[#4A2418] mb-4">
              7. ارفع تصميمك (اختياري)
            </h2>
            <div className="bg-[#FFF9F1] rounded-3xl border-2 border-dashed border-[#D9A98F] p-6 text-center">
              {!imagePreview ? (
                <label className="cursor-pointer block">
                  <div className="text-6xl mb-3">📸</div>
                  <p className="font-bold text-[#4A2418] mb-2">
                    اضغط لاختيار صورة
                  </p>
                  <p className="text-xs text-[#704B3A] mb-4">
                    JPG, PNG — الحجم الأقصى 5MB
                  </p>
                  <span className="inline-block bg-[#E86B2F] hover:bg-[#d15c22] text-white font-black px-6 py-3 rounded-2xl transition">
                    اختار صورة
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              ) : (
                <div>
                  <img
                    src={imagePreview}
                    alt="Design preview"
                    className="max-h-64 mx-auto rounded-2xl border-2 border-[#D9A98F] mb-4"
                  />
                  <p className="text-sm font-bold text-[#4A2418] mb-4">
                    ✓ {designImage?.name}
                  </p>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="bg-red-500 hover:bg-red-600 text-white font-black px-6 py-3 rounded-2xl transition"
                  >
                    🗑️ حذف الصورة
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* 8. Notes */}
          <section>
            <h2 className="editorial-title text-2xl font-bold text-[#4A2418] mb-4">
              8. ملاحظات إضافية (اختياري)
            </h2>
            <textarea
              value={sel.notes}
              onChange={(e) => setSel((prev) => ({ ...prev, notes: e.target.value }))}
              rows={4}
              className="w-full border-2 border-[#D9A98F] focus:border-[#E86B2F] rounded-2xl bg-[#FFF9F1] text-[#4A2418] px-4 py-3 focus:outline-none transition resize-none"
              placeholder="أي تفاصيل إضافية..."
            />
          </section>

          {/* Order Summary */}
          <aside className="bg-[#B485F6] rounded-3xl border-2 border-[#D9A98F] p-6">
            <h2 className="editorial-title text-2xl font-bold text-[#4A2418] mb-4 flex items-center gap-2">
              ملخص الكراسة <span>✦</span>
            </h2>
            <div className="space-y-2 text-sm">
              <SummaryRow label="نوع الورق" value={sel.paper} />
              <SummaryRow label="التجليد" value={sel.binding} />
              <SummaryRow label="المقاس" value={sel.size} />
              <SummaryRow
                label="الصفحات"
                value={
                  sel.pages === 'Custom' && sel.customPages
                    ? `${sel.customPages} (مخصص)`
                    : sel.pages
                }
              />
              <SummaryRow label="المحتوى" value={sel.content.join('، ')} />
              <SummaryRow label="الغلاف" value={sel.cover} />
              {designImage && (
                <SummaryRow label="صورة التصميم" value="✓ مرفوعة" />
              )}
            </div>
          </aside>

          {/* Submit Buttons */}
          <div className="space-y-3">
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#E86B2F] hover:bg-[#d15c22] text-white font-black py-5 rounded-2xl shadow-xl hover:shadow-2xl transition-all text-base tracking-wide transform hover:-translate-y-1 disabled:opacity-50 disabled:transform-none"
            >
              {submitting
                ? 'جاري الإضافة...'
                : addedToCart
                ? '✓ تم الإضافة للسلة'
                : '🛒 أضف للسلة'}
            </button>
            <Link
              href="/cart"
              className="block w-full bg-[#4A2418] hover:bg-[#301F17] text-[#F4E7D6] font-black py-5 rounded-2xl shadow-xl transition-all text-center"
            >
              ← إتمام الطلب
            </Link>
          </div>

          <p className="text-center text-xs text-[#704B3A] italic">
            Made thoughtfully, just for you. ✦
          </p>
        </form>
      </div>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[112px_1fr] gap-3 py-2 border-b border-[#E8CDBA] last:border-0">
      <span className="text-[#704B3A] font-medium">{label}</span>
      <span className="text-end font-bold text-[#4A2418] break-words">
        {value || '—'}
      </span>
    </div>
  )
}