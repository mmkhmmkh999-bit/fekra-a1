import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

const resend = new Resend(process.env.RESEND_API_KEY)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json()

    const { data: order } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const adminEmail = process.env.ADMIN_EMAIL || ''

    if (!adminEmail) {
      return NextResponse.json({ error: 'Admin email not set' }, { status: 400 })
    }

    const htmlContent = `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #4A2418 0%, #E86B2F 100%); color: white; padding: 25px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">✦ طلب جديد #${order.id}</h1>
          <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 14px;">FAKRA BY YASMIN</p>
        </div>

        <!-- Customer Info -->
        <div style="background: white; padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
          <h2 style="color: #E86B2F; border-bottom: 2px solid #F7C7E8; padding-bottom: 10px; font-size: 18px; margin-bottom: 15px;">👤 بيانات العميل</h2>
          <table style="width: 100%; font-size: 14px;">
            <tr>
              <td style="padding: 6px 0; color: #6b7280; width: 100px;">الاسم:</td>
              <td style="padding: 6px 0; font-weight: bold; color: #4A2418;">${order.customer_name}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #6b7280;">التليفون:</td>
              <td style="padding: 6px 0; font-weight: bold;">
                <a href="tel:${order.phone}" style="color: #E86B2F; text-decoration: none;">${order.phone}</a>
              </td>
            </tr>
          </table>
        </div>

        <!-- Order Details -->
        <div style="background: #F4E7D6; padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
          <h2 style="color: #E86B2F; border-bottom: 2px solid #F7C7E8; padding-bottom: 10px; font-size: 18px; margin-bottom: 15px;">📓 تفاصيل الكراسة</h2>
          <table style="width: 100%; font-size: 14px;">
            <tr><td style="padding: 6px 0; color: #6b7280;">نوع الورق:</td><td style="padding: 6px 0; font-weight: bold; text-align: left; color: #4A2418;">${order.paper || '—'}</td></tr>
            <tr><td style="padding: 6px 0; color: #6b7280;">الصفحات:</td><td style="padding: 6px 0; font-weight: bold; text-align: left; color: #4A2418;">${order.pages || '—'}</td></tr>
            <tr><td style="padding: 6px 0; color: #6b7280;">التجليد:</td><td style="padding: 6px 0; font-weight: bold; text-align: left; color: #4A2418;">${order.binding || '—'}</td></tr>
            <tr><td style="padding: 6px 0; color: #6b7280;">المقاس:</td><td style="padding: 6px 0; font-weight: bold; text-align: left; color: #4A2418;">${order.size || '—'}</td></tr>
            <tr><td style="padding: 6px 0; color: #6b7280;">المحتوى:</td><td style="padding: 6px 0; font-weight: bold; text-align: left; color: #4A2418;">${order.content || '—'}</td></tr>
            <tr><td style="padding: 6px 0; color: #6b7280;">الغلاف:</td><td style="padding: 6px 0; font-weight: bold; text-align: left; color: #4A2418;">${order.cover || '—'}</td></tr>
            ${order.notes ? `<tr><td style="padding: 6px 0; color: #6b7280; vertical-align: top;">ملاحظات:</td><td style="padding: 6px 0; font-weight: bold; text-align: left; color: #4A2418;">${order.notes}</td></tr>` : ''}
          </table>
        </div>

        <!-- CTA -->
        <div style="background: white; padding: 20px; border: 1px solid #e5e7eb; border-top: none; text-align: center;">
          <a href="https://wa.me/${order.phone}" style="display: inline-block; background: #E86B2F; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px;">💬 تواصل مع العميل على واتساب</a>
        </div>

        <!-- Footer -->
        <div style="background: #4A2418; padding: 15px; text-align: center; border-radius: 0 0 12px 12px; color: #F4E7D6; font-size: 12px;">
          FAKRA BY YASMIN — تم إرسال هذا الإيميل تلقائيًا
        </div>
      </div>
    `

    const { error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: adminEmail,
      subject: `🛒 طلب جديد #${order.id} من ${order.customer_name}`,
      html: htmlContent,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}