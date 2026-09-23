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

function extractRestaurantFromMessage(text: string): { slug: string; uuid: string; name: string } | null {
  for (const [slug, cfg] of Object.entries(RESTAURANT_CONFIG)) {
    if (text.includes(cfg.name)) {
      return { slug, uuid: cfg.uuid, name: cfg.name };
    }
  }
  return null;
}

// Actualizar en Supabase PostgreSQL en tiempo real (Cloud Serverless)
async function applyDishChangeToSupabase(
  restaurantUuid: string,
  dishNameSearch: string,
  updates: { price?: number; isAvailable?: boolean; photo_url?: string }
): Promise<{ success: boolean; dishId?: string; dishName?: string; previousPrice?: number; newPrice?: number; isNew?: boolean }> {
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
      'nuestro', 'nuestros', 'nuestra', 'nuestras', 'casa', 'especial',
      'poner', 'pon', 'sube', 'subir', 'bajar', 'cambiar', 'cambia', 'hola', 'favor', 'porfa', 'nuevo', 'precio'
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

    for (const q of searchQueries) {
      // First fetch existing to capture previousPrice
      const getUrl = `${SUPABASE_URL}/rest/v1/dishes?restaurant_id=eq.${restaurantUuid}&name=ilike.${q}&select=id,name,price&limit=1`;
      const getRes = await fetch(getUrl, {
        headers: {
          'apikey': SUPABASE_SECRET_KEY,
          'Authorization': `Bearer ${SUPABASE_SECRET_KEY}`,
        },
      });

      if (getRes.ok) {
        const found = await getRes.json();
        if (found && found.length > 0) {
          const existing = found[0];
          const previousPrice = Number(existing.price);

          const patchUrl = `${SUPABASE_URL}/rest/v1/dishes?id=eq.${existing.id}`;
          const patchRes = await fetch(patchUrl, {
            method: 'PATCH',
            headers: {
              'apikey': SUPABASE_SECRET_KEY,
              'Authorization': `Bearer ${SUPABASE_SECRET_KEY}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation',
            },
            body: JSON.stringify(payload),
          });

          if (patchRes.ok) {
            console.log(`✅ [Supabase Cloud] Actualizado plato "${existing.name}" (precio anterior: ${previousPrice}€, nuevo: ${updates.price}€)`);
            return {
              success: true,
              dishId: existing.id,
              dishName: existing.name,
              previousPrice,
              newPrice: updates.price !== undefined ? Number(updates.price) : undefined,
              isNew: false,
            };
          }
        }
      }
    }

    if (updates.price !== undefined) {
      try {
        // Fetch first category for this restaurant to assign the new dish
        const catUrl = `${SUPABASE_URL}/rest/v1/menu_categories?restaurant_id=eq.${restaurantUuid}&order=order_index.asc&limit=1`;
        const catRes = await fetch(catUrl, {
          headers: {
            'apikey': SUPABASE_SECRET_KEY,
            'Authorization': `Bearer ${SUPABASE_SECRET_KEY}`,
          },
        });
        let categoryId: string | null = null;
        if (catRes.ok) {
          const catData = await catRes.json();
          if (catData && catData.length > 0) {
            categoryId = catData[0].id;
          }
        }

        const cleanName = cleanDishName(dishNameSearch);
        const insertPayload: any = {
          restaurant_id: restaurantUuid,
          name: cleanName || dishNameSearch,
          price: Number(updates.price),
          is_available: updates.isAvailable !== false,
          is_featured: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        if (categoryId) {
          insertPayload.category_id = categoryId;
        }

        const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/dishes`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_SECRET_KEY,
            'Authorization': `Bearer ${SUPABASE_SECRET_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          },
          body: JSON.stringify(insertPayload),
        });

        if (insertRes.ok) {
          const inserted = await insertRes.json();
          const newDish = inserted?.[0];
          console.log(`✨ [Supabase Cloud] Creado nuevo plato automagicamente:`, newDish);
          return {
            success: true,
            dishId: newDish?.id,
            dishName: newDish?.name,
            newPrice: Number(updates.price),
            isNew: true,
          };
        }
      } catch (insertErr: any) {
        console.warn('Error auto-creating new dish:', insertErr);
      }
    }

    return { success: false };
  } catch (err: any) {
    console.error('[Supabase Cloud Exception]:', err?.message);
    return { success: false };
  }
}

async function applyRestaurantChangeToSupabase(
  restaurantUuid: string,
  updates: Record<string, any>
): Promise<boolean> {
  try {
    const payload: Record<string, any> = { ...updates, updated_at: new Date().toISOString() };
    const queryUrl = `${SUPABASE_URL}/rest/v1/restaurants?id=eq.${restaurantUuid}`;
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
      return data && data.length > 0;
    }
    return false;
  } catch (err: any) {
    console.error('[Supabase Restaurant Update Error]:', err?.message);
    return false;
  }
}

function cleanDishName(raw: string): string {
  if (!raw) return '';
  let name = raw.trim();

  // Remove markdown, emojis and symbols
  name = name.replace(/[*_~`•💰✅🚫\n\r]/g, ' ').trim();
  
  // 1. Strip leading conversational phrases & verbs repeatedly
  const prefixRegex = /^(?:hola(?:\s+[a-záéíóúñ]+)?|buenas|oye|por\s+favor|porfa|quiero\s+que\s+pongas|pon(?:er)?|sub(?:e|ir)|baj(?:a|ar)|cambi(?:a|ar)(?:\s+el\s+precio\s+de)?|pas(?:a|ar)|añad(?:e|ir)(?:\s+nuevo\s+plato)?|crea(?:r)?(?:\s+nuevo\s+plato)?|marcar|nuevo\s+plato|plato|precio\s+de|precio|de|el|la|los|las|un|una|unos|unas)[\s,:\-]+/i;
  
  while (prefixRegex.test(name)) {
    name = name.replace(prefixRegex, '').trim();
  }
  
  // 2. Strip trailing context words (e.g. "como agotada hoy", "para el fin de semana", "a la venta", etc.)
  const suffixRegex = /(?:\s+(?:como\s+(?:agotad[oa]|disponible)|para\s+(?:el\s+)?(?:servicio|fin\s+de\s+semana|hoy|mañana|este\s+fin\s+de\s+semana).*|de\s+la\s+carta|en\s+carta|por\s+ración|la\s+ración|en\s+el\s+menú|del\s+menú|por\s+favor|gracias|hoy|mañana|esta\s+noche))$/i;
  name = name.replace(suffixRegex, '').trim();

  // 3. Remove leading articles again if any remain
  name = name.replace(/^(?:el|la|los|las|un|una|unos|unas)\s+/i, '').trim();

  // 4. Capitalize first letter properly
  if (name.length > 0) {
    name = name.charAt(0).toUpperCase() + name.slice(1);
  }

  return name;
}

// Extractor resiliente multilínea y conversacional de cambios
function extractChangesFromMessage(text: string): Array<{ dishName: string; updates: { price?: number; isAvailable?: boolean; photo_url?: string } }> {
  const changes: Array<{ dishName: string; updates: { price?: number; isAvailable?: boolean; photo_url?: string } }> = [];
  const lines = text.split('\n');

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    // Split on connectors like " y ", " e ", ",", ";"
    const clauses = line.split(/\s+(?:y|e|además|tambien|también|,|;)\s+/i);
    for (const clause of clauses) {
      // A. Extracción de precio
      const priceMatch = clause.match(/(?:•\s*💰\s*|Precio:\s*|a\s+)?([a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-&]+?)(?::\s*|\s+a\s+|\s*->\s*)(\d+[\.,]?\d*)\s*(?:€|euros?|EUR)/i);
      if (priceMatch) {
        const rawDish = priceMatch[1];
        const cleaned = cleanDishName(rawDish);
        const priceVal = parseFloat(priceMatch[2].replace(',', '.'));
        if (cleaned && !isNaN(priceVal) && priceVal > 0) {
          changes.push({
            dishName: cleaned,
            updates: { price: priceVal }
          });
          continue;
        }
      }

      // B. Extracción de plato agotado
      const agotadoMatch = clause.match(/(?:marcar\s+)?([a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-&]+?)\s+(?:como\s+)?(?:agotad[oa]|sin\s+stock|no\s+queda|terminad[oa])/i) ||
        clause.match(/(?:•\s*🚫\s*|agotar|agotad[oa]|sin\s+stock|no\s+queda|terminad[oa])\s+(?:de\s+|el\s+|la\s+|los\s+|las\s+)?([a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-&]+)/i);
      if (agotadoMatch) {
        const cleaned = cleanDishName(agotadoMatch[1]);
        if (cleaned) {
          changes.push({
            dishName: cleaned,
            updates: { isAvailable: false }
          });
          continue;
        }
      }

      // C. Extracción de plato disponible
      const disponibleMatch = clause.match(/(?:marcar\s+)?([a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-&]+?)\s+(?:como\s+)?(?:disponible|activad[oa]|repuest[oa])/i) ||
        clause.match(/(?:•\s*✅\s*|disponible|activar|reponer|hay\s+stock|volver\s+a\s+tener)\s+(?:de\s+|el\s+|la\s+|los\s+|las\s+)?([a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-&]+)/i);
      if (disponibleMatch) {
        const cleaned = cleanDishName(disponibleMatch[1]);
        if (cleaned) {
          changes.push({
            dishName: cleaned,
            updates: { isAvailable: true }
          });
          continue;
        }
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

function classifyTicketType(text: string): { type: string; emoji: string; label: string } {
  const lower = text.toLowerCase();
  
  // Schedule/hours changes
  if (/horario|hora de apertura|hora de cierre|abrimos|cerramos a las|turno|servicio de/i.test(lower)) {
    return { type: 'SCHEDULE', emoji: '🕐', label: 'Cambio de Horario' };
  }
  // Daily menu
  if (/men[úu] del d[ií]a|men[úu] de hoy|primeros?.*segundos?|plato del d[ií]a/i.test(lower)) {
    return { type: 'DAILY_MENU', emoji: '🍽️', label: 'Menú del Día' };
  }
  // Temporary closure
  if (/cerr(amos|ar|ado)\s*(por|esta|la|el|hasta)|vacaciones|cierre temporal|cerrado por/i.test(lower)) {
    return { type: 'CLOSURE', emoji: '🚨', label: 'Cierre Temporal' };
  }
  // Capacity/aforo
  if (/aforo|capacidad|comensales|plazas|mesas/i.test(lower)) {
    return { type: 'CAPACITY', emoji: '👥', label: 'Cambio de Aforo' };
  }
  // Contact changes
  if (/tel[ée]fono|whatsapp|n[úu]mero|contacto|email|correo/i.test(lower)) {
    return { type: 'CONTACT', emoji: '📞', label: 'Cambio de Contacto' };
  }
  // Tagline/slogan
  if (/eslogan|tagline|lema|descripci[óo]n|subt[ií]tulo/i.test(lower)) {
    return { type: 'TAGLINE', emoji: '📝', label: 'Cambio de Eslogan' };
  }
  // Features
  if (/terraza|parking|wifi|pet friendly|accesible|cel[ií]aco|vegano|caracter[ií]stica/i.test(lower)) {
    return { type: 'FEATURES', emoji: '🏷️', label: 'Características del Local' };
  }
  // Price changes (default dish-level)
  if (/precio|€|euro|subir|bajar|cambiar? a|poner? a/i.test(lower)) {
    return { type: 'PRICE', emoji: '💰', label: 'Cambio de Precio' };
  }
  // Availability
  if (/agotad[oa]|disponible|reponer|sin stock|terminad[oa]/i.test(lower)) {
    return { type: 'AVAILABILITY', emoji: '🔄', label: 'Disponibilidad de Plato' };
  }
  // Generic
  return { type: 'GENERAL', emoji: '💬', label: 'Solicitud General' };
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

        // Responde de inmediato a Telegram para quitar el spinner del botón
        await answerCallbackQuery(callback.id, '⏳ Publicando cambios en la carta...');

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
        console.log(`⚡ [Cloud Webhook] Extracted ${extracted.length} changes from message:`, extracted);

        const restaurantInfo = extractRestaurantFromMessage(messageText);
        const restaurantUuid = restaurantInfo?.uuid || 'a1000000-0000-0000-0000-000000000001';
        const isTemporal = /fin\s+de\s+semana|este\s+finde|finde|solo\s+este\s+fin|temporal|hasta\s+el\s+lunes/i.test(messageText);

        const chatIdMatch = messageText.match(/ID:\s*`(\d+)`/);
        const hosteleroChatId = chatIdMatch?.[1];

        let updatedCount = 0;
        for (const item of extracted) {
          const res = await applyDishChangeToSupabase(restaurantUuid, item.dishName, item.updates);
          if (res.success) {
            updatedCount++;

            // Si es cambio temporal de precio para el fin de semana, registrar evento para preguntar el lunes
            if (isTemporal && hosteleroChatId && res.dishId && res.previousPrice !== undefined && res.newPrice !== undefined && res.previousPrice !== res.newPrice) {
              try {
                await fetch(`${SUPABASE_URL}/rest/v1/analytics_events`, {
                  method: 'POST',
                  headers: {
                    'apikey': SUPABASE_SECRET_KEY,
                    'Authorization': `Bearer ${SUPABASE_SECRET_KEY}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    restaurant_id: restaurantUuid,
                    event_type: 'temporal_price_pending',
                    user_agent: `temp:${hosteleroChatId}:${res.dishId}:${encodeURIComponent(res.dishName || item.dishName)}:${res.previousPrice}:${res.newPrice}:${new Date().toISOString()}`,
                  }),
                });
                console.log(`🕒 [Temporal Pricing] Registrado cambio pendiente de reversión para lunes: ${res.dishName} (${res.previousPrice}€ -> ${res.newPrice}€)`);
              } catch (tempErr) {
                console.warn('Error recording temporal price change:', tempErr);
              }
            }
          }
        }

        if (hosteleroChatId) {
          const temporalNotice = isTemporal 
            ? `\n\n🕒 _Nota: Hemos anotado que este cambio es para el fin de semana. El lunes te preguntaremos con 1 clic si deseas restaurar el precio anterior o mantenerlo._`
            : '';
          await sendMessage(
            hosteleroChatId,
            `✅ *¡Cambios publicados!*\n\nTu solicitud ha sido aprobada y los cambios ya están visibles en tu carta digital en vivo.${temporalNotice}\n\n🔗 https://gastrotorre.vercel.app`
          );
        }

        const viewMenuMarkup = {
          inline_keyboard: [
            [
              { text: '👀 Ver Carta en Vivo', url: 'https://gastrotorre.vercel.app' }
            ]
          ]
        };

        const temporalTag = isTemporal ? ' • 🕒 Pregunta de Reversión Programada (Lunes)' : '';
        await editMessageText(
          fromChatId,
          messageId,
          `${messageText}\n\n━━━━━━━━━━━━━━━━━━━━\n✅ *ESTADO: APROBADO Y PUBLICADO EN VIVO EN LA NUBE*\n🕒 ${new Date().toLocaleTimeString('es-ES')} • ☁️ Sincronizado en Supabase Cloud (${updatedCount} platos)${temporalTag}`,
          viewMenuMarkup
        );

        return NextResponse.json({ ok: true, status: 'approved', changes: updatedCount });
      }

      // --- RESTAURAR PRECIO TRAS FIN DE SEMANA (BOTÓN HOSTELERO) ---
      if (data.startsWith('rev_')) {
        const parts = data.split('_');
        const dishId = parts[1];
        const targetPrice = parseFloat(parts[2]);

        await answerCallbackQuery(callback.id, '⏳ Restaurando precio en tu carta...');

        // Actualizar precio en Supabase
        const queryUrl = `${SUPABASE_URL}/rest/v1/dishes?id=eq.${dishId}`;
        const res = await fetch(queryUrl, {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_SECRET_KEY,
            'Authorization': `Bearer ${SUPABASE_SECRET_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          },
          body: JSON.stringify({ price: targetPrice, updated_at: new Date().toISOString() }),
        });

        let dishName = 'Plato';
        if (res.ok) {
          const updated = await res.json();
          if (updated && updated.length > 0) {
            dishName = updated[0].name;
          }
        }

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
          `${messageText}\n\n━━━━━━━━━━━━━━━━━━━━\n🔄 *PRECIO RESTAURADO A ${targetPrice.toFixed(2)} €*\n🕒 ${new Date().toLocaleTimeString('es-ES')} • Publicado en vivo en tu carta digital.`,
          viewMenuMarkup
        );

        await sendMessage(ADMIN_CHAT_ID, `ℹ️ *Reversión de Fin de Semana:* El hostelero ha restaurado *${dishName}* a ${targetPrice.toFixed(2)} € en su carta.`);
        return NextResponse.json({ ok: true, status: 'reverted' });
      }

      // --- MANTENER PRECIO TRAS FIN DE SEMANA (BOTÓN HOSTELERO) ---
      if (data.startsWith('keep_')) {
        const parts = data.split('_');
        const dishId = parts[1];
        const currentPrice = parseFloat(parts[2]);

        await answerCallbackQuery(callback.id, '✨ Precio confirmado como permanente');

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
          `${messageText}\n\n━━━━━━━━━━━━━━━━━━━━\n✨ *PRECIO CONFIRMADO A ${currentPrice.toFixed(2)} € (PERMANENTE)*\n🕒 ${new Date().toLocaleTimeString('es-ES')} • Se mantiene como precio oficial en tu carta.`,
          viewMenuMarkup
        );

        return NextResponse.json({ ok: true, status: 'kept' });
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

        const chatIdMatch = messageText.match(/ID:\s*`(\d+)`/);
        const hosteleroChatId = chatIdMatch?.[1];
        if (hosteleroChatId) {
          await sendMessage(hosteleroChatId, `ℹ️ *Solicitud revisada*\n\nTu petición ha sido revisada pero no se han aplicado cambios en esta ocasión. Si necesitas ayuda, envía un nuevo mensaje con más detalle.`);
        }

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

5️⃣ *Cambiar horarios:*
👉 _"La semana que viene abrimos de 13:00 a 16:00 solo almuerzos"_

6️⃣ *Menú del día:*
👉 _"Menú de hoy: primeros sopa y ensalada, segundos pollo y merluza, postre flan, 14.50€"_

7️⃣ *Cierre temporal:*
👉 _"Cerramos del 1 al 7 de octubre por vacaciones"_

8️⃣ *Cambiar aforo, eslogan o contacto:*
👉 _"Nuevo WhatsApp: 612 345 678"_
👉 _"Cambia nuestro eslogan a: La mejor carne de la Sierra"_

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
      const ticketType = classifyTicketType(text);
      
      const detected = extractChangesFromMessage(text);
      let summary = `• ${ticketType.emoji} *Tipo:* ${ticketType.label}\n`;
      if (detected.length > 0) {
        for (const item of detected) {
          if (item.updates.price !== undefined) {
            summary += `• 💰 *${item.dishName}:* ${Number(item.updates.price).toFixed(2)} €\n`;
          }
          if (item.updates.isAvailable === false) {
            summary += `• 🚫 *${item.dishName}:* Marcar Agotado\n`;
          }
          if (item.updates.isAvailable === true) {
            summary += `• ✅ *${item.dishName}:* Marcar Disponible\n`;
          }
        }
      } else {
        summary += `• 💬 *Petición:* "${text || '📸 Foto adjunta'}"\n`;
      }

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
${ticketType.emoji} *Categoría:* ${ticketType.label}
💬 *Mensaje:*
_${text || '📸 [Foto enviada por hostelero]'}_

🤖 *Cambios detectados:*
${summary.trim()}
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
