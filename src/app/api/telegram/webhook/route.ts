import { NextRequest, NextResponse } from 'next/server';

// Environment & Cloud Credentials (100% Serverless Cloud Execution)
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8593229981:AAE4L5cd9nwZHwYgDo6PdSNRPv3V4294_cA';
const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID || '1305542862';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vhqridneswcapjsuicfn.supabase.co';
// Guaranteed Service Role access for serverless background updates without local daemons
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 
  process.env.SUPABASE_SECRET_KEY || 
  Buffer.from('c2Jfc2VjcmV0X0NLeF9wYVIzUlN4V1ZLRnY5TFR0ZkFfOG9BZXltdV8=', 'base64').toString('utf8');

// Configuración de Restaurantes Autorizados y Pines
const RESTAURANT_CONFIG: Record<string, { name: string; pin: string; token: string; slug: string; uuid: string }> = {
  'asador-los-jarales': {
    name: 'Asador Los Jarales',
    pin: 'JARALES-7482',
    token: 'gt_jarales_89a3f2c1',
    slug: 'asador-los-jarales',
    uuid: 'a1000000-0000-0000-0000-000000000001',
  },
  'la-tavola': {
    name: 'La Tavola di Torrelodones',
    pin: 'TAVOLA-3910',
    token: 'gt_tavola_77b4d9e0',
    slug: 'la-tavola',
    uuid: 'a2000000-0000-0000-0000-000000000002',
  },
  'el-olivo-bistro': {
    name: 'Bistró El Olivo',
    pin: 'OLIVO-5521',
    token: 'gt_olivo_52c8a1f6',
    slug: 'el-olivo-bistro',
    uuid: 'a3000000-0000-0000-0000-000000000003',
  },
  'torre-smash': {
    name: 'Torre Smash & Brew',
    pin: 'SMASH-9184',
    token: 'gt_smash_33e1b7d4',
    slug: 'torre-smash',
    uuid: 'a4000000-0000-0000-0000-000000000004',
  },
  'la-huerta-brunch': {
    name: 'Café & Brunch La Huerta',
    pin: 'HUERTA-4412',
    token: 'gt_huerta_94f0c8a2',
    slug: 'la-huerta-brunch',
    uuid: 'a5000000-0000-0000-0000-000000000005',
  },
};

// In-memory bindings fallback for warm serverless instances
const warmBindings: Map<string, { restaurantSlug: string; restaurantName: string; senderName: string }> = new Map();

// Persistent session management using Supabase Cloud (Never lost across cold starts)
async function getPersistentBinding(chatId: string): Promise<{ restaurantSlug: string; restaurantName: string; senderName: string } | null> {
  const warm = warmBindings.get(chatId);
  if (warm) return warm;

  try {
    const url = `${SUPABASE_URL}/rest/v1/analytics_events?event_type=eq.telegram_binding&user_agent=like.chat:${encodeURIComponent(chatId)}:*&order=created_at.desc&limit=1`;
    const res = await fetch(url, {
      headers: {
        'apikey': SUPABASE_SECRET_KEY,
        'Authorization': `Bearer ${SUPABASE_SECRET_KEY}`,
      },
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.length > 0) {
        const parts = (data[0].user_agent || '').split(':');
        if (parts.length >= 4) {
          const slug = parts[2];
          const name = parts.slice(3).join(':');
          const found = { restaurantSlug: slug, restaurantName: name, senderName: 'Hostelero' };
          warmBindings.set(chatId, found);
          return found;
        }
      }
    }
  } catch (e) {
    console.warn('Error fetching persistent binding:', e);
  }
  return null;
}

async function savePersistentBinding(chatId: string, restaurantSlug: string, restaurantName: string, senderName: string) {
  warmBindings.set(chatId, { restaurantSlug, restaurantName, senderName });
  try {
    const restaurantUuid = RESTAURANT_CONFIG[restaurantSlug]?.uuid || 'a1000000-0000-0000-0000-000000000001';
    await fetch(`${SUPABASE_URL}/rest/v1/analytics_events`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SECRET_KEY,
        'Authorization': `Bearer ${SUPABASE_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        restaurant_id: restaurantUuid,
        event_type: 'telegram_binding',
        user_agent: `chat:${chatId}:${restaurantSlug}:${restaurantName}`,
      }),
    });
  } catch (e) {
    console.warn('Error saving persistent binding:', e);
  }
}

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

    const genericWords = new Set([
      'tosta', 'tostas', 'pizza', 'pizzas', 'burger', 'burgers', 'ensalada', 'ensaladas',
      'tarta', 'tartas', 'arroz', 'arroces', 'plato', 'platos', 'racion', 'raciones',
      'de', 'del', 'la', 'el', 'las', 'los', 'con', 'y', 'en', 'sobre', 'al', 'a', 'para',
      'nuestro', 'nuestros', 'nuestra', 'nuestras', 'casa', 'especial'
    ]);

    const words = dishNameSearch
      .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ ]/g, ' ')
      .trim()
      .split(/\s+/)
      .filter((w) => w.length >= 3 && !genericWords.has(w.toLowerCase()));

    // Try multiple search strategies from most specific to broader
    const searchQueries: string[] = [];

    // 1. Compound: top 2 distinctive words (*Avocado*Toast* or *Salmón*Ahumado*)
    if (words.length >= 2) {
      searchQueries.push(`*${encodeURIComponent(words[0])}*${encodeURIComponent(words[1])}*`);
    }
    // 2. Single most distinctive word (e.g. *Avocado*, *Salmón*, *Bogavante*, *Tartar*, *Diavola*)
    if (words.length >= 1) {
      searchQueries.push(`*${encodeURIComponent(words[0])}*`);
    }
    // 3. First non-empty word fallback
    const firstWord = dishNameSearch.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ ]/g, '').trim().split(/\s+/)[0];
    if (firstWord && !searchQueries.some(q => q.includes(encodeURIComponent(firstWord)))) {
      searchQueries.push(`*${encodeURIComponent(firstWord)}*`);
    }

    let matched = false;
    for (const q of searchQueries) {
      const queryUrl = `${SUPABASE_URL}/rest/v1/dishes?name=ilike.${q}`;
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

      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          console.log(`✅ [Supabase Cloud] Actualizadas ${data.length} filas con query "${q}":`, data.map((d: any) => d.name));
          matched = true;
          break;
        }
      }
    }

    return matched;
  } catch (err: any) {
    console.error('[Supabase Cloud Exception]:', err?.message);
    return false;
  }
}

// Extractor resiliente multilínea de cambios desde el mensaje de Superadmin (Stateless Serverless)
function extractChangesFromMessage(text: string): Array<{ dishName: string; updates: { price?: number; isAvailable?: boolean; photo_url?: string } }> {
  const changes: Array<{ dishName: string; updates: { price?: number; isAvailable?: boolean; photo_url?: string } }> = [];
  const lines = text.split('\n');

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    // A. Extracción de precio: e.g., "• 💰 Croquetas de Jamón: 14.50 €" o "Croquetas a 14.50"
    const priceMatch = line.match(/(?:•\s*💰\s*|Precio:\s*|a\s+)?([a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-&]+?)(?::\s*|\s+a\s+|\s*->\s*)(\d+[\.,]?\d*)\s*(?:€|euros?|EUR)/i);
    if (priceMatch) {
      const dishName = priceMatch[1].replace(/^[•\s💰\-]+/, '').trim();
      const priceVal = parseFloat(priceMatch[2].replace(',', '.'));
      if (dishName && !isNaN(priceVal) && priceVal > 0) {
        changes.push({
          dishName,
          updates: { price: priceVal }
        });
        continue;
      }
    }

    // B. Extracción de plato agotado / disponible
    const agotadoMatch = line.match(/(?:•\s*🚫\s*|Agotar:\s*|Marcar agotado:\s*)([a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-&]+)/i) ||
      line.match(/(?:agotar|agotado|sin stock|no queda|terminado)\s+(?:de\s+)?([a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-&]+)/i);
    if (agotadoMatch) {
      const dishName = agotadoMatch[1].replace(/^[•\s🚫\-]+/, '').trim();
      if (dishName) {
        changes.push({
          dishName,
          updates: { isAvailable: false }
        });
        continue;
      }
    }

    const disponibleMatch = line.match(/(?:•\s*✅\s*|Disponible:\s*|Activar:\s*)([a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-&]+)/i) ||
      line.match(/(?:disponible|activar|reponer|hay stock)\s+(?:de\s+)?([a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-&]+)/i);
    if (disponibleMatch) {
      const dishName = disponibleMatch[1].replace(/^[•\s✅\-]+/, '').trim();
      if (dishName) {
        changes.push({
          dishName,
          updates: { isAvailable: true }
        });
        continue;
      }
    }
  }

  return changes;
}

function renderPinesMenu(): string {
  let text = '🔐 *DIRECTORIO DE PINES Y TOKENS GASTROTORRE:*\n━━━━━━━━━━━━━━━━━━━━\n\n';
  for (const [slug, cfg] of Object.entries(RESTAURANT_CONFIG)) {
    text += `🏠 *${cfg.name}*\n`;
    text += `  • *PIN:* \`${cfg.pin}\`\n`;
    text += `  • *Magic Link:* \`https://t.me/GastroTorreTicketsBot?start=${cfg.token}\`\n`;
    text += `  • *Web:* \`https://gastrotorre.vercel.app/restaurante/${slug}\`\n\n`;
  }
  text += '💡 _Comparte el PIN o el enlace con el hostelero para vincular su cuenta._';
  return text;
}

export async function POST(req: NextRequest) {
  try {
    const update = await req.json();

    // 1. GESTIÓN DE CALLBACK QUERIES (Botones Interactivos del Superadmin)
    if (update.callback_query) {
      const callback = update.callback_query;
      const data = callback.data as string;
      const fromChatId = callback.message?.chat?.id || ADMIN_CHAT_ID;
      const messageId = callback.message?.message_id;
      const messageText = callback.message?.text || '';

      // --- APROBAR TICKET ---
      if (data.startsWith('app_') || data.startsWith('approve_')) {
        const ticketId = data.replace('app_', '').replace('approve_', '');

        if (messageText.includes('ESTE SITIO NO ESTÁ ALOJADO')) {
          await answerCallbackQuery(callback.id, '⛔ Sitio no alojado en GastroTorre');
          await editMessageText(
            fromChatId,
            messageId,
            `${messageText}\n\n━━━━━━━━━━━━━━━━━━━━\n⛔ *ESTE SITIO NO ESTÁ ALOJADO EN NUESTRA WEB*\n⚠️ Acción bloqueada por seguridad. No se modificó la BDD.`
          );
          return NextResponse.json({ ok: true, status: 'blocked_unhosted' });
        }

        // Apply changes to Supabase Cloud
        const extracted = extractChangesFromMessage(messageText);
        console.log(`⚡ [Cloud Webhook] Extracted ${extracted.length} changes from message:`, extracted);

        let updatedCount = 0;
        for (const item of extracted) {
          const success = await applyDishChangeToSupabase(item.dishName, item.updates);
          if (success) updatedCount++;
        }

        await answerCallbackQuery(callback.id, `✅ ¡${updatedCount} cambios aplicados y publicados en vivo!`);

        const viewMenuMarkup = {
          inline_keyboard: [
            [
              { text: '👀 Ver Carta en Vivo', url: 'https://gastrotorre.vercel.app' }
            ]
          ]
        };

        await editMessageText(
          fromChatId,
          messageId,
          `${messageText}\n\n━━━━━━━━━━━━━━━━━━━━\n✅ *ESTADO: APROBADO Y PUBLICADO EN VIVO EN LA NUBE*\n🕒 ${new Date().toLocaleTimeString('es-ES')} • ☁️ Sincronizado en Supabase Cloud`,
          viewMenuMarkup
        );

        return NextResponse.json({ ok: true, status: 'approved', changes: updatedCount });
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
      const chatId = String(msg.chat.id);
      const text = (msg.text || msg.caption || '').trim();
      const senderName = msg.from?.first_name || 'Usuario';
      const username = msg.from?.username ? `@${msg.from.username}` : senderName;
      const isSuperAdmin = chatId === String(ADMIN_CHAT_ID);

      // Comando /pines para Superadmin
      if (isSuperAdmin && text.startsWith('/pines')) {
        const menuText = renderPinesMenu();
        await sendMessage(chatId, menuText);
        return NextResponse.json({ ok: true });
      }

      // Comando /ayuda para el hostelero
      if (text.startsWith('/ayuda') || text.toLowerCase() === 'ayuda') {
        const helpText = 
`📖 *GUÍA RÁPIDA DE GASTROTORRE:*
━━━━━━━━━━━━━━━━━━━━
Puedes enviarme mensajes directos como si hablaras con un asistente:

1️⃣ *Cambiar precios:*
👉 _"Poner Chuletón de Vaca a 75€"_
👉 _"Subir las Croquetas a 14.50€"_

2️⃣ *Marcar plato agotado o reponer:*
👉 _"Marcar Tarta de Queso como agotada hoy"_
👉 _"Volvemos a tener Tarta de Queso"_

3️⃣ *Consultar tu carta actual:*
👉 Escribe \`/carta\` para ver tus platos y precios al instante.

4️⃣ *Añadir fotos:*
👉 Envía una foto del plato con el nombre en el pie de foto.

⚡ _Todo se publica automáticamente en tu carta digital 24/7._`;
        await sendMessage(chatId, helpText);
        return NextResponse.json({ ok: true });
      }

      // Magic Link /start <token>
      if (text.startsWith('/start')) {
        const parts = text.split(' ');
        if (parts.length > 1) {
          const token = parts[1].trim();
          for (const [slug, cfg] of Object.entries(RESTAURANT_CONFIG)) {
            if (cfg.token === token) {
              await savePersistentBinding(chatId, slug, cfg.name, senderName);

              await sendMessage(
                chatId,
                `✅ *¡Bienvenido, ${senderName}! Tu cuenta está vinculada a ${cfg.name}.*\n\nPuedes enviarme mensajes de texto con los cambios que necesites (ej: _"Sube las croquetas a 14.50€"_) o escribir \`/carta\` para ver tu menú actual.`
              );
              return NextResponse.json({ ok: true });
            }
          }
        }

        // Check if already bound
        const existingBinding = await getPersistentBinding(chatId);
        if (existingBinding) {
          await sendMessage(
            chatId,
            `👋 *¡Hola de nuevo, ${senderName}!* Tu cuenta está vinculada a *${existingBinding.restaurantName}*.\n\nEscribe el cambio que necesitas o escribe \`/ayuda\` para ver ejemplos.`
          );
          return NextResponse.json({ ok: true });
        }

        await sendMessage(
          chatId,
          `👋 *¡Hola, ${senderName}! Bienvenido a GastroTorre 24/7.*\n\nIntroduce el **PIN de tu restaurante** (ej: \`JARALES-7482\`) para vincular tu cuenta.`
        );
        return NextResponse.json({ ok: true });
      }

      // Comprobación de PIN manual
      const upperText = text.toUpperCase().replace(/\s+/g, '');
      for (const [slug, cfg] of Object.entries(RESTAURANT_CONFIG)) {
        if (upperText === cfg.pin || upperText === cfg.pin.replace('-', '')) {
          await savePersistentBinding(chatId, slug, cfg.name, senderName);

          await sendMessage(
            chatId,
            `🔑 *¡PIN Correcto!*\n\nTu Telegram ha quedado vinculado permanentemente a *${cfg.name}*.\n\nYa puedes enviarme cambios de precios, platos agotados o fotos en cualquier momento sin volver a introducir el PIN.`
          );
          return NextResponse.json({ ok: true });
        }
      }

      // Rechazar Notas de Voz de forma proactiva para evitar errores por ruido ambiental
      if (msg.voice || msg.audio) {
        await sendMessage(
          chatId,
          `✍️ *Por favor, envía tu solicitud por mensaje de texto escrito o foto.*\n\nPara garantizar la **máxima precisión y exactitud en los precios de tu carta** (evitando errores causados por ruido de cocina o interferencias), procesamos las solicitudes en formato texto.\n\n💡 *Ejemplo fácil:* _"Sube el chuletón a 75€ y marca la tarta de queso como agotada hoy"_.`
        );
        return NextResponse.json({ ok: true });
      }

      // Buscar vinculación existente persistente en Supabase Cloud
      let binding = await getPersistentBinding(chatId);
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

      // Comando /carta: Listar carta actual para el hostelero
      if (text.startsWith('/carta')) {
        try {
          const restaurantUuid = RESTAURANT_CONFIG[binding.restaurantSlug]?.uuid;
          const queryUrl = restaurantUuid 
            ? `${SUPABASE_URL}/rest/v1/dishes?restaurant_id=eq.${restaurantUuid}&select=name,price,is_available&order=name.asc`
            : `${SUPABASE_URL}/rest/v1/dishes?select=name,price,is_available&limit=15`;
          
          const res = await fetch(queryUrl, {
            headers: {
              'apikey': SUPABASE_SECRET_KEY,
              'Authorization': `Bearer ${SUPABASE_SECRET_KEY}`,
            },
          });
          if (res.ok) {
            const dishes = await res.json();
            let cartaText = `📋 *CARTA ACTUAL DE ${binding.restaurantName.toUpperCase()}:*\n━━━━━━━━━━━━━━━━━━━━\n\n`;
            for (const d of dishes.slice(0, 20)) {
              const statusIcon = d.is_available !== false ? '✅' : '🚫 Agotado';
              cartaText += `• *${d.name}:* ${Number(d.price).toFixed(2)} € (${statusIcon})\n`;
            }
            cartaText += `\n🔗 *Ver completa en web:* https://gastrotorre.vercel.app/restaurante/${binding.restaurantSlug}\n`;
            cartaText += `💡 _Para cambiar cualquier precio, solo escribe: "Poner [Plato] a [Precio]€"_`;
            
            await sendMessage(chatId, cartaText);
            return NextResponse.json({ ok: true });
          }
        } catch (e) {
          console.warn('Error fetching dishes for /carta:', e);
        }
      }

      const ticketId = `TCK-${Math.floor(1000 + Math.random() * 9000)}`;
      const summary = `• 💬 *Petición:* "${text || '📸 Foto adjunta'}"`;

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
_${text || '📸 [Foto enviada por hostelero]'}_

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

    return NextResponse.json({ ok: true, ignored: true });
  } catch (err: any) {
    console.error('Error handling Telegram webhook:', err?.message);
    return NextResponse.json({ ok: false, error: err?.message }, { status: 500 });
  }
}
