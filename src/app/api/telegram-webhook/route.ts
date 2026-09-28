import { NextRequest, NextResponse } from 'next/server';
import { processHosteleroCommand, getRestaurantIdentity } from '@/lib/ai/agent_restaurant';
import { supabaseAdmin } from '@/lib/supabase/admin';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Mensaje de texto estándar o nota de voz
    const message = body.message || body.edited_message;
    if (!message) {
      return NextResponse.json({ ok: true, note: 'No message payload' });
    }

    const chatId = message.chat?.id?.toString();
    const text = message.text || message.caption || '';
    const voice = message.voice || message.audio;

    if (!chatId) {
      return NextResponse.json({ ok: true });
    }

    // 2. Transcripción si es nota de voz o extracción de texto
    let commandText = text;
    if (voice && !commandText) {
      // Mensaje de nota de voz recibido
      commandText = 'Nota de voz recibida para actualización de carta';
    }

    if (!commandText) {
      await sendTelegramMessage(chatId, 'Hola. Por favor envíame un mensaje de texto o nota de voz con el cambio que necesitas en tu carta.');
      return NextResponse.json({ ok: true });
    }

    // 3. Identificar restaurante vinculado al chat_id o usar Jarales por defecto para la demo
    let targetRestaurant = 'asador-los-jarales';
    
    // Buscar binding en base de datos
    const { data: binding } = await supabaseAdmin
      .from('analytics_events')
      .select('restaurant_id, event_value')
      .eq('event_type', 'telegram_binding')
      .eq('event_value', chatId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (binding && binding.restaurant_id) {
      targetRestaurant = binding.restaurant_id;
    }

    // 4. Ejecutar el Agente Especializado
    const result = await processHosteleroCommand(targetRestaurant, commandText);

    // 5. Responder al hostelero por Telegram
    await sendTelegramMessage(chatId, result.message, result.dishAffected ? {
      inline_keyboard: [
        [
          { text: '↩️ Deshacer este cambio', callback_data: `revert_${result.dishAffected.id}` }
        ]
      ]
    } : undefined);

    return NextResponse.json({
      ok: true,
      result
    });

  } catch (err: any) {
    console.error('[Telegram Webhook Error]:', err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'online',
    service: 'GastroTorre Serverless Telegram Agent',
    timestamp: new Date().toISOString()
  });
}

async function sendTelegramMessage(chatId: string, text: string, replyMarkup?: any) {
  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
        reply_markup: replyMarkup
      })
    });
  } catch (e) {
    console.error('[sendTelegramMessage Error]:', e);
  }
}
