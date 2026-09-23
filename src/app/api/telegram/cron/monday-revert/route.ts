import { NextRequest, NextResponse } from 'next/server';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8593229981:AAE4L5cd9nwZHwYgDo6PdSNRPv3V4294_cA';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vhqridneswcapjsuicfn.supabase.co';
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 
  process.env.SUPABASE_SECRET_KEY || 
  Buffer.from('c2Jfc2VjcmV0X0NLeF9wYVIzUlN4V1ZLRnY5TFR0ZkFfOG9BZXltdV8=', 'base64').toString('utf8');

async function sendTelegramMessage(chatId: string | number, text: string, replyMarkup: any = null) {
  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
        reply_markup: replyMarkup || undefined,
      }),
    });
    return await res.json();
  } catch (err: any) {
    console.error('[Monday Cron Telegram Error]:', err?.message);
    return { ok: false, error: err?.message };
  }
}

async function processMondayPrompts() {
  try {
    // 1. Fetch all pending temporal price changes
    const url = `${SUPABASE_URL}/rest/v1/analytics_events?event_type=eq.temporal_price_pending&select=id,restaurant_id,user_agent`;
    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_SECRET_KEY,
        Authorization: `Bearer ${SUPABASE_SECRET_KEY}`,
      },
    });

    if (!res.ok) {
      return { success: false, error: 'Failed to fetch pending temporal events' };
    }

    const events = await res.json();
    if (!events || events.length === 0) {
      return { success: true, message: 'No hay cambios temporales pendientes de revisar hoy.', processed: 0 };
    }

    let processedCount = 0;
    for (const ev of events) {
      const parts = (ev.user_agent || '').split(':');
      // Format: temp:${hosteleroChatId}:${dishId}:${dishName}:${previousPrice}:${newPrice}:${date}
      if (parts.length >= 6 && parts[0] === 'temp') {
        const hosteleroChatId = parts[1];
        const dishId = parts[2];
        const dishName = decodeURIComponent(parts[3]);
        const previousPrice = parseFloat(parts[4]);
        const newPrice = parseFloat(parts[5]);

        const text = 
`🔔 *¡Hola! Ha terminado el fin de semana.*
━━━━━━━━━━━━━━━━━━━━
¿Quieres volver *${dishName}* a su precio habitual de *${previousPrice.toFixed(2)} €* o prefieres mantenerlo en *${newPrice.toFixed(2)} €* como precio permanente?`;

        const keyboard = {
          inline_keyboard: [
            [
              { text: `🔄 Restaurar a ${previousPrice.toFixed(2)} €`, callback_data: `rev_${dishId}_${previousPrice}` },
              { text: `✨ Mantener a ${newPrice.toFixed(2)} €`, callback_data: `keep_${dishId}_${newPrice}` },
            ],
          ],
        };

        const sent = await sendTelegramMessage(hosteleroChatId, text, keyboard);
        if (sent?.ok) {
          processedCount++;

          // Mark event as prompted to prevent duplicate notifications
          await fetch(`${SUPABASE_URL}/rest/v1/analytics_events?id=eq.${ev.id}`, {
            method: 'PATCH',
            headers: {
              apikey: SUPABASE_SECRET_KEY,
              Authorization: `Bearer ${SUPABASE_SECRET_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ event_type: 'temporal_price_prompted' }),
          });
        }
      }
    }

    return { success: true, processed: processedCount, total: events.length };
  } catch (err: any) {
    console.error('[Monday Cron Error]:', err?.message);
    return { success: false, error: err?.message };
  }
}

export async function GET(req: NextRequest) {
  const result = await processMondayPrompts();
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const result = await processMondayPrompts();
  return NextResponse.json(result);
}
