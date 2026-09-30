import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { eventType, urgency = 'info', details = {} } = body

    const adminEmail = process.env.ADMIN_EMAIL || ''

    if (!adminEmail) {
      return NextResponse.json({ error: 'Admin email not set' }, { status: 400 })
    }

    const urgencyColors: Record<string, string> = {
      critical: '#dc2626',
      warning: '#d97706',
      info: '#E86B2F',
    }

    const urgencyIcons: Record<string, string> = {
      critical: '🚨',
      warning: '⚠️',
      info: 'ℹ️',
    }

    const color = urgencyColors[urgency] || urgencyColors.info
    const icon = urgencyIcons[urgency] || urgencyIcons.info

    const detailsHtml = Object.entries(details)
      .map(
        ([key, val]) =>
          `<tr><td style="padding: 8px 0; color: #6b7280; width: 140px; font-weight: bold;">${key}:</td><td style="padding: 8px 0; color: #1f2937;">${String(val)}</td></tr>`
      )
      .join('')

    const htmlContent = `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: ${color}; color: white; padding: 25px; border-radius: 12px 12px 0 0; text-align: center;">
          <div style="font-size: 48px;">${icon}</div>
          <h1 style="margin: 0; font-size: 22px;">${eventType}</h1>
        </div>
        <div style="background: white; padding: 20px; border: 1px solid #e5e7eb;">
          <table style="width: 100%; font-size: 14px;">${detailsHtml}</table>
        </div>
        <div style="background: #4A2418; padding: 15px; text-align: center; border-radius: 0 0 12px 12px; color: #F4E7D6; font-size: 12px;">
          FAKRA BY YASMIN
        </div>
      </div>
    `

    const { error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: adminEmail,
      subject: `${icon} تنبيه أمني: ${eventType}`,
      html: htmlContent,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}