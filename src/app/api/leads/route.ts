import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabase/admin';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID || '';

async function notifyTelegramAdmin(lead: {
  restaurant_name: string;
  contact_name: string;
  phone: string;
  email?: string;
  plan_interest?: string;
  zone?: string;
}) {
  try {
    const text = `🔔 *¡NUEVO HOSTELERO SOLICITA INFORMACIÓN EN GASTROTORRE!*\n\n` +
      `🍽️ *Restaurante:* ${lead.restaurant_name}\n` +
      `👤 *Contacto:* ${lead.contact_name}\n` +
      `📞 *Teléfono:* [${lead.phone}](tel:${lead.phone.replace(/[^0-9+]/g, '')})\n` +
      `📍 *Zona:* ${lead.zone || 'Torrelodones'}\n` +
      `💼 *Plan:* ${lead.plan_interest || 'Plan Pro'}\n` +
      (lead.email ? `✉️ *Email:* ${lead.email}\n` : '') +
      `\n⏰ _Recibido en tiempo real desde la web GastroTorre_`;

    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_ADMIN_CHAT_ID,
        text,
        parse_mode: 'Markdown',
      }),
    });
  } catch (err) {
    console.warn('Error sending lead Telegram notification:', err);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const restaurant_name = body.restaurant_name || body.restaurantName || body.name;
    const contact_name = body.contact_name || body.contactName || body.owner || body.contact;
    const phone = body.phone;
    const email = body.email || '';
    const plan_interest = body.plan_interest || body.plan || 'Plan Pro (59€/mes)';
    const zone = body.zone || 'Torrelodones Pueblo';

    if (!restaurant_name || !contact_name || !phone) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos obligatorios (nombre, contacto, teléfono)' },
        { status: 400 }
      );
    }

    let savedData = null;

    try {
      const { data, error } = await supabaseAdmin
        .from('leads_hosteleros')
        .insert({
          restaurant_name,
          contact_name,
          phone,
          email: email || '',
          plan_interest: plan_interest || 'Plan Pro (59€/mes)',
          zone: zone || 'Torrelodones Pueblo',
          status: 'nuevo',
        })
        .select()
        .single();

      if (error) {
        console.warn('Supabase leads insert error, falling back to local:', error.message);
      } else {
        savedData = data;
      }
    } catch (dbErr: any) {
      console.warn('Supabase client error:', dbErr.message);
    }

    // Always trigger Telegram notification for immediate response
    await notifyTelegramAdmin({
      restaurant_name,
      contact_name,
      phone,
      email,
      plan_interest,
      zone,
    });

    return NextResponse.json({
      success: true,
      message: 'Solicitud de alta recibida correctamente',
      source: savedData ? 'supabase' : 'telegram_inbox',
      data: savedData || {
        id: `lead-${Date.now()}`,
        restaurant_name,
        contact_name,
        phone,
        email,
        plan_interest,
        zone,
        created_at: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('leads_hosteleros')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
