'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from './lib/supabase'
import { getCurrentCustomer } from './lib/customer-auth'
import { getCartCount } from './lib/cart'

export default function HomePage() {
  const [customer, setCustomer] = useState<any>(null)
  const [cartCount, setCartCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [siteSettings, setSiteSettings] = useState<Record<string, string>>({})

  useEffect(() => {
    // تحميل بيانات العميل (اختياري)
    setCustomer(getCurrentCustomer())

    // تحميل عدد السلة
    setCartCount(getCartCount())

    // استمع لتحديثات السلة
    const cartHandler = () => setCartCount(getCartCount())
    window.addEventListener('cart-updated', cartHandler)

    async function loadSettings() {
      const { data } = await supabase.from('settings').select('*')
      const obj: Record<string, string> = {}
      data?.forEach((s) => {
        obj[s.key] = String(s.value)
      })
      setSiteSettings(obj)
      setLoading(false)
    }
    loadSettings()

    return () => {
      window.removeEventListener('cart-updated', cartHandler)
    }
  }, [])

  const siteTitle = siteSettings.site_title || 'FAKRA BY YASMIN'
  const siteDesc =
    siteSettings.site_description || 'صمّم كراستك المخصصة بأسلوب فاخر'
  const whatsapp = siteSettings.whatsapp_number || '201026560174'

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4E7D6] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#E86B2F] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F4E7D6]" dir="rtl">
      {/* Announcement Bar */}
      <div className="bg-[#4A2418] text-[#F4E7D6] text-sm font-bold py-3 overflow-hidden">
        <div
          className="flex gap-12 animate-marquee whitespace-nowrap"
          style={{ width: 'fit-content' }}
        >
          {[...Array(2)].map((_, k) => (
            <div key={k} className="flex gap-12">
              <span>✦ PERSONAL PAPER GOODS ✦</span>
              <span>✧ تصميم فاخر لكل عميل ✧</span>
              <span>✦ توصيل لكل محافظات مصر ✦</span>
              <span>✧ جودة بريميوم مضمونة ✧</span>
            </div>
          ))}
        </div>
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-[#FFF9F1]/95 backdrop-blur-xl border-b-2 border-[#D9A98F]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center gap-3">
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div className="w-12 h-12 bg-[#4A2418] rounded-full flex items-center justify-center text-[#F4E7D6] font-black text-2xl shadow-lg">
              ✦
            </div>
            <span className="editorial-title text-xl font-bold text-[#4A2418] hidden sm:block">
              {siteTitle}
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            <a
              href="#features"
              className="px-4 py-2 text-sm font-bold text-[#704B3A] hover:text-[#E86B2F] hover:bg-[#F7C7E8] rounded-full transition-all"
            >
              المميزات
            </a>
            <a
              href="#how"
              className="px-4 py-2 text-sm font-bold text-[#704B3A] hover:text-[#E86B2F] hover:bg-[#F7C7E8] rounded-full transition-all"
            >
              الخطوات
            </a>
            <a
              href="#faq"
              className="px-4 py-2 text-sm font-bold text-[#704B3A] hover:text-[#E86B2F] hover:bg-[#F7C7E8] rounded-full transition-all"
            >
              أسئلة
            </a>
          </div>

          <div className="flex items-center gap-2">
            {/* أيقونة السلة */}
            <Link
              href="/cart"
              className="relative w-10 h-10 bg-[#FFF9F1] hover:bg-[#F7C7E8] text-[#4A2418] rounded-full flex items-center justify-center transition-all border-2 border-[#D9A98F] text-lg"
              title="السلة"
            >
              🛒
              {cartCount > 0 && (
                <span className="absolute -top-1 -left-1 w-5 h-5 bg-[#E86B2F] text-white rounded-full flex items-center justify-center text-xs font-black">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* زر حسابي / دخول */}
            {customer ? (
              <Link
                href="/account"
                className="flex items-center gap-2 bg-[#FFF9F1] hover:bg-[#F7C7E8] text-[#4A2418] font-black px-4 py-2.5 rounded-full transition-all text-sm border-2 border-[#D9A98F]"
              >
                <div className="w-7 h-7 bg-[#E86B2F] rounded-full flex items-center justify-center text-white text-xs font-black">
                  {customer.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden md:inline">
                  {customer.name.split(' ')[0]}
                </span>
              </Link>
            ) : (
              <Link
                href="/customer-login"
                className="hidden sm:flex items-center gap-1.5 bg-[#FFF9F1] hover:bg-[#F7C7E8] text-[#4A2418] font-black px-4 py-2.5 rounded-full transition-all text-sm border-2 border-[#D9A98F]"
              >
                👤 <span className="hidden md:inline">دخول</span>
              </Link>
            )}

            {/* زر ابدأ الآن */}
            <Link
              href="/customize"
              className="bg-[#E86B2F] hover:bg-[#d15c22] text-white font-black px-5 py-2.5 rounded-full transition-all text-sm shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              ابدأ الآن ←
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-20 pb-20 px-6 overflow-hidden">
        <div className="absolute top-32 right-0 w-96 h-96 bg-[#F7C7E8] rounded-full filter blur-3xl animate-float opacity-60" />
        <div
          className="absolute top-60 left-0 w-96 h-96 bg-[#B485F6] rounded-full filter blur-3xl animate-float opacity-40"
          style={{ animationDelay: '2s' }}
        />

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative">
          <div className="animate-fadeInUp">
            <div className="inline-flex items-center gap-2 bg-[#FFF9F1] border-2 border-[#D9A98F] text-[#704B3A] font-bold px-4 py-2 rounded-full text-xs mb-6 shadow-sm tracking-wider">
              <span className="text-[#E86B2F]">✦</span> PERSONAL PAPER GOODS
            </div>

            <h1 className="editorial-title text-5xl md:text-7xl font-bold text-[#4A2418] leading-[1.05] mb-6 tracking-tight">
              {siteTitle}
            </h1>
            <p className="editorial-title text-2xl md:text-3xl text-[#704B3A] italic mb-8">
              Create Your Own Notebook
            </p>

            <p className="text-lg text-[#704B3A] mb-10 leading-relaxed max-w-xl font-medium">
              {siteDesc}. اختار نوع الورق، عدد الصفحات، التجليد، والتصميم —
              واحنا نعملهولك بإيدينا.
            </p>

            <div className="flex flex-wrap gap-4 mb-12">
              <Link
                href="/customize"
                className="group bg-[#E86B2F] hover:bg-[#d15c22] text-white font-black px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 flex items-center gap-3"
              >
                <span>🎨 صمّم كراستك</span>
                <span className="group-hover:-translate-x-1 transition-transform">
                  ←
                </span>
              </Link>
              <a
                href="#how"
                className="bg-[#FFF9F1] text-[#4A2418] font-black px-8 py-4 rounded-2xl border-2 border-[#D9A98F] hover:border-[#E86B2F] hover:text-[#E86B2F] transition-all"
              >
                إزاي بيشتغل؟
              </a>
            </div>

            <div className="flex items-center gap-6 flex-wrap">
              <div>
                <div className="editorial-title text-3xl font-bold text-[#4A2418]">
                  100%
                </div>
                <div className="text-sm text-[#704B3A] font-bold">يدوي الصنع</div>
              </div>
              <div className="w-px h-12 bg-[#D9A98F]" />
              <div>
                <div className="editorial-title text-3xl font-bold text-[#4A2418]">
                  27
                </div>
                <div className="text-sm text-[#704B3A] font-bold">محافظة</div>
              </div>
              <div className="w-px h-12 bg-[#D9A98F]" />
              <div>
                <div className="editorial-title text-3xl font-bold text-[#4A2418]">
                  ⭐ 5
                </div>
                <div className="text-sm text-[#704B3A] font-bold">تقييم</div>
              </div>
            </div>
          </div>

          <div
            className="relative animate-fadeInUp"
            style={{ animationDelay: '0.3s' }}
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-tr from-[#F7C7E8] via-[#B485F6] to-[#E86B2F] rounded-[2rem] blur-2xl opacity-50" />
              <div className="relative bg-[#FFF9F1] rounded-[2rem] shadow-2xl overflow-hidden border-8 border-[#FFF9F1]">
                <img
                  src="https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=800&q=80"
                  alt="كراسة"
                  className="w-full h-[500px] object-cover"
                />
                <div className="absolute top-6 right-6 bg-[#FFF9F1]/95 backdrop-blur-lg rounded-2xl shadow-xl p-3 flex items-center gap-2 border-2 border-[#D9A98F]">
                  <div className="w-10 h-10 bg-[#E86B2F] rounded-xl flex items-center justify-center text-white">
                    ✓
                  </div>
                  <div>
                    <p className="font-black text-[#4A2418] text-sm">
                      جودة فاخرة
                    </p>
                    <p className="text-xs text-[#704B3A] font-bold">
                      ورق بريميوم
                    </p>
                  </div>
                </div>
                <div className="absolute bottom-6 left-6 bg-[#FFF9F1]/95 backdrop-blur-lg rounded-2xl shadow-xl p-3 flex items-center gap-2 border-2 border-[#D9A98F]">
                  <div className="w-10 h-10 bg-[#B485F6] rounded-xl flex items-center justify-center text-white">
                    🚚
                  </div>
                  <div>
                    <p className="font-black text-[#4A2418] text-sm">
                      توصيل سريع
                    </p>
                    <p className="text-xs text-[#704B3A] font-bold">2-4 أيام</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-14 px-6 bg-[#FFF9F1]/60">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: '🛡️', title: 'دفع آمن', desc: 'حماية كاملة' },
            { icon: '⏰', title: 'توصيل سريع', desc: '2-4 أيام' },
            { icon: '💎', title: 'جودة مضمونة', desc: 'أو استرداد' },
            { icon: '🎨', title: 'تصميم مخصص', desc: 'على مزاجك' },
          ].map((badge, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#F7C7E8] rounded-xl flex items-center justify-center text-2xl border-2 border-[#D9A98F]">
                {badge.icon}
              </div>
              <div>
                <div className="font-black text-[#4A2418]">{badge.title}</div>
                <div className="text-sm text-[#704B3A] font-bold">
                  {badge.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-xs font-black text-[#E86B2F] bg-[#F7C7E8] px-4 py-2 rounded-full mb-4 border-2 border-[#D9A98F] tracking-widest">
              ✦ المميزات ✦
            </div>
            <h2 className="editorial-title text-4xl md:text-5xl font-bold text-[#4A2418] mb-4">
              ليه تختارنا؟
            </h2>
            <p className="text-lg text-[#704B3A] max-w-2xl mx-auto">
              كل تفصيلة بتتصمم على مزاجك بإيدينا
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: '📐',
                title: 'تصميم مخصص',
                desc: 'اختار نوع الورق، عدد الصفحات، والتجليد اللي يناسبك',
              },
              {
                icon: '🎨',
                title: 'غلاف بتصميمك',
                desc: 'ارفع صورة أو اكتب وصف للتصميم اللي عايزه',
              },
              {
                icon: '🚚',
                title: 'توصيل سريع',
                desc: 'لكل محافظات مصر بأقل تكلفة ووقت قصير',
              },
            ].map((f, i) => (
              <div
                key={i}
                className="group relative bg-[#FFF9F1] rounded-3xl p-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-2 border-[#D9A98F]"
              >
                <div className="w-16 h-16 bg-[#F7C7E8] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-3xl border-2 border-[#D9A98F]">
                  {f.icon}
                </div>
                <h3 className="editorial-title text-2xl font-bold text-[#4A2418] mb-3">
                  {f.title}
                </h3>
                <p className="text-[#704B3A] leading-relaxed font-medium">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-24 px-6 bg-[#4A2418]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-xs font-black text-[#4A2418] bg-[#F7C7E8] px-4 py-2 rounded-full mb-4 tracking-widest">
              ✧ خطوة بخطوة ✧
            </div>
            <h2 className="editorial-title text-4xl md:text-5xl font-bold text-[#F4E7D6] mb-4">
              3 خطوات بس
            </h2>
            <p className="text-lg text-[#F4E7D6]/70">وكراستك في إيدك</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                num: '01',
                title: 'اختر المواصفات',
                desc: 'نوع الورق، الصفحات، والتجليد',
              },
              {
                num: '02',
                title: 'ارفع تصميمك',
                desc: 'صورة أو وصف للتصميم اللي تحبه',
              },
              {
                num: '03',
                title: 'استلم كراستك',
                desc: 'توصيل سريع لباب البيت',
              },
            ].map((step, i) => (
              <div
                key={i}
                className="bg-[#F4E7D6] rounded-3xl p-8 border-2 border-[#D9A98F]"
              >
                <div className="text-6xl font-black text-[#E86B2F] mb-4 editorial-title">
                  {step.num}
                </div>
                <h3 className="editorial-title text-2xl font-bold text-[#4A2418] mb-3">
                  {step.title}
                </h3>
                <p className="text-[#704B3A] font-medium">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <Link
              href="/customize"
              className="inline-flex items-center gap-3 bg-[#E86B2F] hover:bg-[#d15c22] text-white font-black px-10 py-5 rounded-2xl shadow-xl transition-all transform hover:-translate-y-1 text-lg"
            >
              ابدأ تصميمك الآن ←
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="relative bg-[#FFF9F1] rounded-3xl p-12 md:p-16 overflow-hidden border-4 border-[#D9A98F] shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#B485F6]/30 rounded-full filter blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#F7C7E8]/50 rounded-full filter blur-3xl" />
            <div className="relative text-center">
              <div className="text-6xl mb-6">✦</div>
              <h2 className="editorial-title text-3xl md:text-5xl font-bold text-[#4A2418] mb-6">
                جاهز تصمم كراستك؟
              </h2>
              <p className="text-xl text-[#704B3A] mb-8 max-w-2xl mx-auto font-medium">
                3 خطوات بس وهتوصلك كراستك المخصصة لباب البيت
              </p>
              <Link
                href="/customize"
                className="inline-flex items-center gap-3 bg-[#E86B2F] hover:bg-[#d15c22] text-white font-black px-10 py-5 rounded-2xl transition-all transform hover:-translate-y-1 shadow-xl text-lg"
              >
                ابدأ دلوقتي ←
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-6 bg-[#FFF9F1]/60">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-xs font-black text-[#E86B2F] bg-[#F7C7E8] px-4 py-2 rounded-full mb-4 border-2 border-[#D9A98F] tracking-widest">
              ✦ أسئلة شائعة ✦
            </div>
            <h2 className="editorial-title text-4xl md:text-5xl font-bold text-[#4A2418] mb-4">
              عندك سؤال؟
            </h2>
          </div>

          <div className="space-y-3">
            {[
              {
                q: 'إيه أقل كمية ممكن أطلبها؟',
                a: 'مفيش حد أدنى، تقدر تطلب كراسة واحدة أو ألف.',
              },
              {
                q: 'بياخد قد إيه لحد ما توصل؟',
                a: 'من 2 لـ 4 أيام عمل حسب المحافظة.',
              },
              {
                q: 'ممكن أرفع صورة تصميمي؟',
                a: 'أيوه، ترفع صورة جاهزة، أو تكتب وصف واحنا نصممهولك.',
              },
              {
                q: 'طرق الدفع إيه؟',
                a: 'الدفع عند الاستلام، فيزا، محافظ إلكترونية.',
              },
              {
                q: 'فيه ضمان؟',
                a: 'أيوه، لو الجودة مش زي ما اتفقنا، تقدر ترجع الطلب.',
              },
            ].map((item, i) => (
              <details
                key={i}
                className="bg-[#FFF9F1] rounded-2xl border-2 border-[#D9A98F] hover:border-[#E86B2F] transition-all overflow-hidden group"
              >
                <summary className="p-6 cursor-pointer font-black text-[#4A2418] flex justify-between items-center list-none">
                  <span>{item.q}</span>
                  <span className="text-2xl text-[#E86B2F] transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <div className="px-6 pb-6">
                  <p className="text-[#704B3A] leading-relaxed font-medium">
                    {item.a}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-24 px-6 bg-[#B485F6]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="editorial-title text-4xl md:text-6xl font-bold mb-6 leading-tight text-[#4A2418]">
            عندك أي سؤال؟
            <br />
            <span className="italic">احنا في خدمتك</span>
          </h2>
          <p className="text-xl text-[#4A2418]/80 mb-12 max-w-2xl mx-auto font-medium">
            تواصل معانا على أي منصة
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-[#FFF9F1] hover:bg-[#F7C7E8] text-[#4A2418] font-black px-6 py-4 rounded-2xl shadow-lg transition-all transform hover:-translate-y-1 border-2 border-[#D9A98F]"
              >
                💬 واتساب
              </a>
            )}
            {siteSettings.instagram_url && (
              <a
                href={siteSettings.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-[#FFF9F1] hover:bg-[#F7C7E8] text-[#4A2418] font-black px-6 py-4 rounded-2xl shadow-lg transition-all transform hover:-translate-y-1 border-2 border-[#D9A98F]"
              >
                📷 إنستجرام
              </a>
            )}
            {siteSettings.facebook_url && (
              <a
                href={siteSettings.facebook_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-[#FFF9F1] hover:bg-[#F7C7E8] text-[#4A2418] font-black px-6 py-4 rounded-2xl shadow-lg transition-all transform hover:-translate-y-1 border-2 border-[#D9A98F]"
              >
                📘 فيسبوك
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#4A2418] text-[#F4E7D6] py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-[#E86B2F] rounded-full flex items-center justify-center text-[#F4E7D6] font-black">
                ✦
              </div>
              <span className="editorial-title font-bold">{siteTitle}</span>
            </div>
            <p className="text-sm text-[#F4E7D6]/70 font-bold">
              © {new Date().getFullYear()} {siteTitle} — Made thoughtfully, just
              for you.
            </p>
            <Link
              href="/login"
              className="text-xs text-[#F4E7D6]/40 hover:text-[#E86B2F] font-bold"
            >
              لوحة الإدارة
            </Link>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp */}
      {whatsapp && (
        <a
          href={`https://wa.me/${whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 left-6 z-40 w-14 h-14 bg-[#E86B2F] hover:bg-[#d15c22] rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-110 transition-all pulse-ring"
          aria-label="تواصل واتساب"
        >
          💬
        </a>
      )}
    </div>
  )
}