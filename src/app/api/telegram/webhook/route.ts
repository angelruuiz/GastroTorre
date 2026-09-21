import { NextRequest, NextResponse } from 'next/server';

// Environment variables
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Helper to send messages via Telegram API
async function sendTelegramMessage(chatId: string | number, text: string, replyMarkup?: any) {
  if (!BOT_TOKEN) {
    console.warn('[Telegram Webhook] TELEGRAM_BOT_TOKEN is not configured.');
    return null;
  }

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  const body: any = {
    chat_id: chatId,
    text,
    parse_mode: 'Markdown',
  };

  if (replyMarkup) {
    body.reply_markup = replyMarkup;
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  return res.json();
}

// Helper to answer callback query (removes loading spinner in Telegram)
async function answerCallbackQuery(callbackQueryId: string, text?: string) {
  if (!BOT_TOKEN) return;
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callback_query_id: callbackQueryId, text }),
  });
}

// In-memory or temporary pending tickets storage (can also be stored in Supabase)
interface PendingTicket {
  id: string;
  hosteleroChatId: number | string;
  senderName: string;
  originalText: string;
  proposedChanges: string;
  structuredData?: any;
  createdAt: number;
}

const pendingTickets: Map<string, PendingTicket> = new Map();

export async function POST(req: NextRequest) {
  try {
    const update = await req.json();

    // 1. Handle Callback Query (Approval / Rejection by Admin)
    if (update.callback_query) {
      const callback = update.callback_query;
      const data = callback.data as string;
      const adminChatId = callback.message?.chat?.id;
      const messageId = callback.message?.message_id;

      if (data.startsWith('approve_')) {
        const ticketId = data.replace('approve_', '');
        await answerCallbackQuery(callback.id, '✅ Ticket aprobado correctamente');

        // Update message in admin chat
        if (BOT_TOKEN && adminChatId && messageId) {
          await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/editMessageText`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: adminChatId,
              message_id: messageId,
              text: `${callback.message.text}\n\n━━━━━━━━━━━━━━━\n✅ *ESTADO: APROBADO Y APLICADO POR SUPERADMIN*`,
              parse_mode: 'Markdown',
            }),
          });
        }

        // Notify hostelero
        const ticket = pendingTickets.get(ticketId);
        if (ticket) {
          await sendTelegramMessage(
            ticket.hosteleroChatId,
            `🎉 *¡Tus cambios han sido aprobados!*\n\nTu carta digital en GastroTorre ya está actualizada con los cambios solicitados.`
          );
        }

        return NextResponse.json({ ok: true, status: 'approved' });
      }

      if (data.startsWith('reject_')) {
        const ticketId = data.replace('reject_', '');
        await answerCallbackQuery(callback.id, '❌ Ticket rechazado');

        if (BOT_TOKEN && adminChatId && messageId) {
          await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/editMessageText`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: adminChatId,
              message_id: messageId,
              text: `${callback.message.text}\n\n━━━━━━━━━━━━━━━\n❌ *ESTADO: RECHAZADO POR SUPERADMIN*`,
              parse_mode: 'Markdown',
            }),
          });
        }

        const ticket = pendingTickets.get(ticketId);
        if (ticket) {
          await sendTelegramMessage(
            ticket.hosteleroChatId,
            `ℹ️ *Aviso sobre tu solicitud:*\n\nTu solicitud de cambio no ha podido ser aplicada. Si tienes dudas, contáctanos por este mismo canal.`
          );
        }

        return NextResponse.json({ ok: true, status: 'rejected' });
      }
    }

    // 2. Handle Incoming Message from Hostelero
    if (update.message && update.message.text) {
      const message = update.message;
      const chatId = message.chat.id;
      const text = message.text;
      const senderName = message.from?.first_name || 'Hostelero';

      // Ignore standard bot commands
      if (text === '/start') {
        await sendTelegramMessage(
          chatId,
          `👋 *¡Hola, ${senderName}! Bienvenido al Canal de Soporte de GastroTorre.*\n\nPuedes enviarme por aquí cualquier cambio que necesites en tu carta digital:\n\n• *Cambios de precios* (ej: _"Sube el chuletón a 72€"_)\n• *Platos agotados* (ej: _"Tarta de queso agotada hoy"_)\n• *Nuevos platos o sugerencias del chef*\n\nAnalizaremos tu petición al instante y te confirmaremos en cuanto quede publicada.`
        );
        return NextResponse.json({ ok: true });
      }

      // Generate ticket ID
      const ticketId = `TCK-${Math.floor(1000 + Math.random() * 9000)}`;

      // Acknowledge receipt to hostelero
      await sendTelegramMessage(
        chatId,
        `📥 *Petición recibida (#${ticketId})*\n\nEstamos procesando los cambios solicitados con el equipo de GastroTorre. Te avisaremos aquí mismo cuando estén aplicados.`
      );

      // AI interpretation fallback if Gemini is not set or structured preview
      let proposedChanges = `• Analizar texto del hostelero: "${text}"\n• Validar plato y restaurante asignado.`;

      // Save ticket in memory
      pendingTickets.set(ticketId, {
        id: ticketId,
        hosteleroChatId: chatId,
        senderName,
        originalText: text,
        proposedChanges,
        createdAt: Date.now(),
      });

      // Forward proposal to Admin with interactive buttons
      if (ADMIN_CHAT_ID) {
        const adminNotificationText = 
`🎫 *NUEVO TICKET DE HOSTELERO — #${ticketId}*
━━━━━━━━━━━━━━━━━━━━
👤 *Hostelero:* ${senderName} (Chat ID: \`${chatId}\`)
💬 *Mensaje original:*
_"${text}"_

🤖 *Propuesta interpretada:*
${proposedChanges}
━━━━━━━━━━━━━━━━━━━━
¿Deseas aplicar estos cambios a la carta digital?`;

        const keyboard = {
          inline_keyboard: [
            [
              { text: '✅ Aprobar y Publicar', callback_data: `approve_${ticketId}` },
              { text: '❌ Rechazar', callback_data: `reject_${ticketId}` },
            ],
          ],
        };

        await sendTelegramMessage(ADMIN_CHAT_ID, adminNotificationText, keyboard);
      }

      return NextResponse.json({ ok: true, ticketId });
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('[Telegram Webhook Error]:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
