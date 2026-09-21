import { NextRequest, NextResponse } from 'next/server';

// Environment & Cloud Credentials
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8593229981:AAE4L5cd9nwZHwYgDo6PdSNRPv3V4294_cA';
const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID || '1305542862';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vhqridneswcapjsuicfn.supabase.co';
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Configuración de Restaurantes Autorizados y Pines
const RESTAURANT_CONFIG: Record<string, { name: string; pin: string; token: string; slug: string }> = {
  'asador-los-jarales': {
    name: 'Asador Los Jarales',
    pin: 'JARALES-7482',
    token: 'gt_jarales_89a3f2c1',
    slug: 'asador-los-jarales',
  },
  'la-tavola': {
    name: 'La Tavola di Torrelodones',
    pin: 'TAVOLA-3910',
    token: 'gt_tavola_77b4d9e0',
    slug: 'la-tavola',
  },
  'el-olivo-bistro': {
    name: 'Bistró El Olivo',
    pin: 'OLIVO-5521',
    token: 'gt_olivo_52c8a1f6',
    slug: 'el-olivo-bistro',
  },
  'torre-smash': {
    name: 'Torre Smash & Brew',
    pin: 'SMASH-9184',
    token: 'gt_smash_33e1b7d4',
    slug: 'torre-smash',
  },
  'la-huerta-brunch': {
    name: 'Café & Brunch La Huerta',
    pin: 'HUERTA-4412',
    token: 'gt_huerta_94f0c8a2',
    slug: 'la-huerta-brunch',
  },
};

// In-memory bindings fallback for warm serverless instances
const warmBindings: Map<string, { restaurantSlug: string; restaurantName: string; senderName: string }> = new Map();

// Helper to call Telegram API
async function apiCall(method: string, body: Record<string, any> = {}) {
  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return await res.json();
  } catch (err: any) {
    console.error(`[Telegram Webhook API Error] ${method}:`, err?.message);
    return { ok: false, error: err?.message };
  }
}

async function sendMessage(chatId: string | number, text: string, replyMarkup: any = null) {
  return apiCall('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'Markdown',
    reply_markup: replyMarkup || undefined,
  });
}

async function answerCallbackQuery(callbackQueryId: string, text = '') {
  return apiCall('answerCallbackQuery', {
    callback_query_id: callbackQueryId,
    text,
  });
}

async function editMessageText(chatId: string | number, messageId: number, text: string, replyMarkup: any = null) {
  return apiCall('editMessageText', {
    chat_id: chatId,
    message_id: messageId,
    text,
    parse_mode: 'Markdown',
    reply_markup: replyMarkup || undefined,
  });
}

// Actualizar en Supabase PostgreSQL en tiempo real (Cloud Serverless)
async function applyDishChangeToSupabase(dishNameSearch: string, updates: { price?: number; isAvailable?: boolean; photo_url?: string }) {
  try {
    const payload: any = {};
    if (updates.price !== undefined) payload.price = Number(updates.price);
    if (updates.isAvailable !== undefined) payload.is_available = updates.isAvailable;
    if (updates.photo_url !== undefined) payload.photo_url = updates.photo_url;
    payload.updated_at = new Date().toISOString();

    const cleanWord = dishNameSearch.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ ]/g, '').trim().split(' ')[0];
    const queryUrl = `${SUPABASE_URL}/rest/v1/dishes?name=ilike.*${encodeURIComponent(cleanWord)}*`;

    const res = await fetch(queryUrl, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_SECRET_KEY,
        'Authorization': `Bearer ${SUPABASE_SECRET_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[Supabase Cloud Error]: HTTP ${res.status}:`, errText);
      return false;
    }

    const data = await res.json();
    console.log(`✅ [Supabase Cloud] Actualizadas ${data?.length || 0} filas para "${cleanWord}":`, data);
    return true;
  } catch (err: any) {
    console.error('[Supabase Cloud Exception]:', err?.message);
    return false;
  }
}

// Extractor resiliente de cambios desde el mensaje de Superadmin (Stateless Fallback)
function extractChangesFromMessage(messageText: string) {
  const changes: { dishName: string; updates: { price?: number; isAvailable?: boolean } }[] = [];
  const lines = messageText.split('\n');

  for (const line of lines) {
    // Price change pattern: "• Dish: ~old~ ➔ 14.50€" or "➔ 14.50€"
    const priceMatch = line.match(/(?:•|\*)\s*(.*?):\s*.*?➔\s*\*?([0-9]+[.,]?[0-9]*)\s*€/i);
    if (priceMatch) {
      const dish = priceMatch[1].replace(/[*_~]/g, '').trim();
      const price = Number(priceMatch[2].replace(',', '.'));
      if (dish && !isNaN(price)) {
        changes.push({ dishName: dish, updates: { price } });
      }
      continue;
    }

    // Availability pattern: "• Dish: ~Agotado~ ➔ Disponible" or "➔ AGOTADO"
    if (line.includes('AGOTADO') || line.includes('Agotado')) {
      const nameMatch = line.match(/(?:•|\*)\s*(.*?):/);
      if (nameMatch) {
        changes.push({ dishName: nameMatch[1].replace(/[*_~]/g, '').trim(), updates: { isAvailable: false } });
      }
    } else if (line.includes('DISPONIBLE') || line.includes('Disponible')) {
      const nameMatch = line.match(/(?:•|\*)\s*(.*?):/);
      if (nameMatch) {
        changes.push({ dishName: nameMatch[1].replace(/[*_~]/g, '').trim(), updates: { isAvailable: true } });
      }
    }
  }

  return changes;
}

// Menú interactivo de /pines para Superadmin
function renderPinesMenu() {
  const list = Object.entries(RESTAURANT_CONFIG)
    .map(([slug, c], i) => `*${i + 1}. ${c.name}*\n🔑 *PIN:* \`${c.pin}\`\n🔗 *Magic Link:* \`https://t.me/GastroTorreTicketsBot?start=${c.token}\``)
    .join('\n\n');

  return `☁️ *PANEL EN LA NUBE 24/7 (VERCEL SERVERLESS)*\n━━━━━━━━━━━━━━━━━━━━\n${list}\n━━━━━━━━━━━━━━━━━━━━\n⚡ *Estado:* Servidor en la nube 100% activo sin necesidad de portátil encendido.`;
}

export async function POST(req: NextRequest) {
  try {
    const update = await req.json();

    // 1. GESTIÓN DE CALLBACK QUERIES (Botones APROBAR / RECHAZAR del Superadmin)
    if (update.callback_query) {
      const callback = update.callback_query;
      const data = callback.data as string;
      const fromChatId = callback.message?.chat?.id || ADMIN_CHAT_ID;
      const messageId = callback.message?.message_id;
      const messageText = callback.message?.text || '';

      // --- APROBAR TICKET ---
      if (data.startsWith('app_') || data.startsWith('approve_')) {
        const ticketId = data.replace('app_', '').replace('approve_', '');
        await answerCallbackQuery(callback.id, '✅ ¡Ticket APROBADO y publicado en Supabase Cloud!');

        // Check if message says "ESTE SITIO NO ESTÁ ALOJADO"
        if (messageText.includes('ESTE SITIO NO ESTÁ ALOJADO')) {
          await editMessageText(
            fromChatId,
            messageId,
            `${messageText}\n\n━━━━━━━━━━━━━━━━━━━━\n⛔ *ESTE SITIO NO ESTÁ ALOJADO EN NUESTRA WEB*\n⚠️ Acción bloqueada por seguridad. No se modificó la BDD.`
          );
          return NextResponse.json({ ok: true, status: 'blocked_unhosted' });
        }

        // Apply changes to Supabase Cloud
        const extracted = extractChangesFromMessage(messageText);
        console.log(`⚡ [Cloud Webhook] Aplicando ${extracted.length} cambios a Supabase:`, extracted);

        for (const item of extracted) {
          await applyDishChangeToSupabase(item.dishName, item.updates);
        }

        await editMessageText(
          fromChatId,
          messageId,
          `${messageText}\n\n━━━━━━━━━━━━━━━━━━━━\n✅ *ESTADO: APROBADO Y PUBLICADO EN VIVO EN LA NUBE*\n🕒 ${new Date().toLocaleTimeString('es-ES')}`
        );

        return NextResponse.json({ ok: true, status: 'approved', changes: extracted.length });
      }

      // --- RECHAZAR TICKET ---
      if (data.startsWith('rej_') || data.startsWith('reject_')) {
        const ticketId = data.replace('rej_', '').replace('reject_', '');
        await answerCallbackQuery(callback.id, '❌ Ticket RECHAZADO');

        await editMessageText(
          fromChatId,
          messageId,
          `${messageText}\n\n━━━━━━━━━━━━━━━━━━━━\n❌ *ESTADO: RECHAZADO POR SUPERADMIN*\n🕒 ${new Date().toLocaleTimeString('es-ES')}`
        );

        return NextResponse.json({ ok: true, status: 'rejected' });
      }
    }

    // 2. GESTIÓN DE MENSAJES (Texto, Fotos, Audios/Voces)
    if (update.message) {
      const msg = update.message;
      const chatId = msg.chat.id;
      const text = (msg.text || msg.caption || '').trim();
      const senderName = msg.from?.first_name || 'Usuario';
      const username = msg.from?.username ? `@${msg.from.username}` : senderName;
      const isSuperAdmin = String(chatId) === String(ADMIN_CHAT_ID);

      // Comando /pines para Superadmin
      if (isSuperAdmin && text.startsWith('/pines')) {
        const menuText = renderPinesMenu();
        await sendMessage(chatId, menuText);
        return NextResponse.json({ ok: true });
      }

      // Magic Link /start <token>
      if (text.startsWith('/start')) {
        const parts = text.split(' ');
        if (parts.length > 1) {
          const token = parts[1].trim();
          for (const [slug, cfg] of Object.entries(RESTAURANT_CONFIG)) {
            if (cfg.token === token) {
              warmBindings.set(String(chatId), {
                restaurantSlug: slug,
                restaurantName: cfg.name,
                senderName,
              });

              await sendMessage(
                chatId,
                `✅ *¡Bienvenido, ${senderName}! Tu cuenta está vinculada a ${cfg.name}.*\n\nPuedes enviarme notas de voz, mensajes de texto o fotos de tus platos en cualquier momento. El servicio funciona 24/7 en la nube.`
              );
              return NextResponse.json({ ok: true });
            }
          }
        }

        await sendMessage(
          chatId,
          `👋 *¡Hola, ${senderName}! Bienvenido a GastroTorre 24/7.*\n\nIntroduce el **PIN de tu restaurante** o haz clic en el Magic Link que te proporcionó el administrador para comenzar.`
        );
        return NextResponse.json({ ok: true });
      }

      // Comprobación de PIN manual
      const upperText = text.toUpperCase().replace(/\s+/g, '');
      for (const [slug, cfg] of Object.entries(RESTAURANT_CONFIG)) {
        if (upperText === cfg.pin || upperText === cfg.pin.replace('-', '')) {
          warmBindings.set(String(chatId), {
            restaurantSlug: slug,
            restaurantName: cfg.name,
            senderName,
          });

          await sendMessage(
            chatId,
            `🔑 *¡PIN Correcto!*\n\nTu Telegram ha quedado vinculado con éxito a *${cfg.name}*.\n\nYa puedes enviarme cambios de precios, platos agotados o fotos en cualquier momento.`
          );
          return NextResponse.json({ ok: true });
        }
      }

      // Detección de Nota de Voz
      let voiceNoteDuration = 0;
      if (msg.voice || msg.audio) {
        voiceNoteDuration = (msg.voice || msg.audio)?.duration || 0;
      }

      // Buscar vinculación existente o fallback para admin
      let binding = warmBindings.get(String(chatId));
      if (!binding && isSuperAdmin) {
        binding = {
          restaurantSlug: 'asador-los-jarales',
          restaurantName: 'Asador Los Jarales',
          senderName: 'SuperAdmin Test',
        };
      }

      if (!binding) {
        await sendMessage(
          chatId,
          `👋 Gracias por contactar con GastroTorre. Para vincular tu restaurante, escribe el **PIN de tu local** (ej: \`JARALES-7482\`).`
        );
        return NextResponse.json({ ok: true });
      }

      const ticketId = `TCK-${Math.floor(1000 + Math.random() * 9000)}`;
      const summary = voiceNoteDuration > 0
        ? `• 🎙️ *Nota de Voz del Hostelero:* (${voiceNoteDuration} segundos)\n• 💬 _Solicitud de actualización recibida por audio_`
        : `• 💬 *Petición:* "${text || '📸 Foto adjunta'}"`;

      // Avisar al hostelero
      await sendMessage(
        chatId,
        `📥 *Petición recibida para ${binding.restaurantName} (#${ticketId})*\n\nEstamos procesando tu solicitud 24/7 en la nube. Te avisaremos aquí en cuanto el Superadmin valide la publicación.`
      );

      // Notificar al Superadmin con botones interactivos
      const adminNotificationText = 
`🎫 *TICKET CLOUD #${ticketId} — ${binding.restaurantName}*
━━━━━━━━━━━━━━━━━━━━
🏠 *Restaurante:* ${binding.restaurantName} (✅ *Oficial*)
👤 *Hostelero:* ${username} (ID: \`${chatId}\`)
💬 *Mensaje:*
_${text || (voiceNoteDuration > 0 ? `🎙️ [Nota de voz de ${voiceNoteDuration}s]` : '📸 [Foto enviada]')}_

🤖 *Cambios a aplicar en tiempo real:*
${summary}
━━━━━━━━━━━━━━━━━━━━
☁️ *Servidor:* Vercel Serverless (0€ / 24h)`;

      const keyboard = {
        inline_keyboard: [
          [
            { text: '✅ Aprobar y Publicar en Web', callback_data: `app_${ticketId}` },
            { text: '❌ Rechazar Solicitud', callback_data: `rej_${ticketId}` },
          ],
        ],
      };

      await sendMessage(ADMIN_CHAT_ID, adminNotificationText, keyboard);
      return NextResponse.json({ ok: true, ticketId });
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('[Telegram Webhook Error]:', error);
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}
