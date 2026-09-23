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

// --------------------------------------------------------------------------
// Conversational Dish Wizard & Allergen Extraction Helpers
// --------------------------------------------------------------------------

async function getRestaurantCategories(restaurantUuid: string): Promise<Array<{ id: string; name: string }>> {
  try {
    const catUrl = `${SUPABASE_URL}/rest/v1/menu_categories?restaurant_id=eq.${restaurantUuid}&order=order_index.asc`;
    const catRes = await fetch(catUrl, {
      headers: {
        'apikey': SUPABASE_SECRET_KEY,
        'Authorization': `Bearer ${SUPABASE_SECRET_KEY}`,
      },
    });
    if (catRes.ok) {
      const data = await catRes.json();
      if (data && data.length > 0) {
        return data.map((c: any) => ({ id: c.id, name: c.name }));
      }
    }
  } catch (e) {
    console.warn('Error fetching menu categories:', e);
  }
  return [];
}

async function getPendingDishWizard(chatId: string): Promise<{ dishName: string; price: number; restaurantSlug: string; step: 'awaiting_price' | 'awaiting_category' | 'awaiting_details'; categoryId?: string; categoryName?: string } | null> {
  try {
    const url = `${SUPABASE_URL}/rest/v1/analytics_events?event_type=eq.pending_dish_wizard&user_agent=like.wizard:${encodeURIComponent(chatId)}:*&order=created_at.desc&limit=1`;
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
        if (parts.length >= 5) {
          const restaurantSlug = parts[2];
          const dishName = decodeURIComponent(parts[3]);
          const price = parseFloat(parts[4]);
          const step = (parts[5] as 'awaiting_price' | 'awaiting_category' | 'awaiting_details') || (isNaN(price) || price <= 0 ? 'awaiting_price' : 'awaiting_details');
          const categoryId = parts[6] || undefined;
          const categoryName = parts[7] ? decodeURIComponent(parts[7]) : undefined;
          return { dishName, price: isNaN(price) ? 0 : price, restaurantSlug, step, categoryId, categoryName };
        }
      }
    }
  } catch (e) {
    console.warn('Error fetching pending wizard:', e);
  }
  return null;
}

async function savePendingDishWizard(
  chatId: string,
  restaurantSlug: string,
  dishName: string,
  price: number,
  step: 'awaiting_price' | 'awaiting_category' | 'awaiting_details' = 'awaiting_details',
  categoryId?: string,
  categoryName?: string
) {
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
        event_type: 'pending_dish_wizard',
        user_agent: `wizard:${chatId}:${restaurantSlug}:${encodeURIComponent(dishName)}:${price}:${step}:${categoryId || ''}:${encodeURIComponent(categoryName || '')}`,
      }),
    });
  } catch (e) {
    console.warn('Error saving pending wizard:', e);
  }
}

async function sendCategorySelectionPrompt(chatId: string, restaurantSlug: string, dishName: string, price: number) {
  const restaurantUuid = RESTAURANT_CONFIG[restaurantSlug]?.uuid || 'a1000000-0000-0000-0000-000000000001';
  const categories = await getRestaurantCategories(restaurantUuid);

  await savePendingDishWizard(chatId, restaurantSlug, dishName, price, 'awaiting_category');

  if (categories.length > 0) {
    const keyboardRows: any[] = [];
    let currentRow: any[] = [];

    let textPrompt = `📂 *¿En qué sección de la carta quieres añadirlo?*\n━━━━━━━━━━━━━━━━━━━━\n🍽️ *Plato:* *${dishName}* (${price.toFixed(2)} €)\n\n👉 *Pulsa un botón o escribe el número/nombre:*`;

    categories.forEach((cat, index) => {
      textPrompt += `\n${index + 1}️⃣ *${cat.name}*`;
      currentRow.push({
        text: `${index + 1}. ${cat.name}`,
        callback_data: `selcat_${index}`,
      });
      if (currentRow.length === 2) {
        keyboardRows.push(currentRow);
        currentRow = [];
      }
    });

    if (currentRow.length > 0) {
      keyboardRows.push(currentRow);
    }

    await sendMessage(chatId, textPrompt, { inline_keyboard: keyboardRows });
  } else {
    await sendMessage(
      chatId,
      `📂 *¿En qué sección de la carta quieres añadirlo?*\n━━━━━━━━━━━━━━━━━━━━\n🍽️ *Plato:* *${dishName}* (${price.toFixed(2)} €)\n\n✍️ _Escribe el nombre de la sección (ej: Postres, Carnes, Entrantes, etc.):_`
    );
  }
}

async function clearPendingDishWizard(chatId: string) {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/analytics_events?event_type=eq.pending_dish_wizard&user_agent=like.wizard:${encodeURIComponent(chatId)}:*`, {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_SECRET_KEY,
        'Authorization': `Bearer ${SUPABASE_SECRET_KEY}`,
      },
    });
  } catch (e) {
    console.warn('Error clearing pending wizard:', e);
  }
}

function detectAddDishWithoutPrice(text: string): string | null {
  if (!text) return null;
  const clean = text.trim();
  
  // Check if text already has an explicit price specification (e.g. 12€, 12.50 euros, precio: 12, a 12€)
  const hasExplicitPrice = 
    /\d+[\.,]?\d*\s*(?:€|euros?|EUR)\b/i.test(clean) || 
    /\b(?:precio|cuesta|vale)\s*[:=]?\s*\d+/i.test(clean) ||
    /\b(?:a|pasa\s+a)\s+\d+(?:[\.,]\d{1,2})?\s*(?:€|euros?|EUR)?\s*$/i.test(clean);

  if (hasExplicitPrice) {
    return null;
  }

  // Common phrases for adding / creating a dish
  const addPattern = /^(?:hola(?:\s+[a-záéíóúñ]+)?|buenas|por\s+favor|porfa|oye)?[\s,:\-]*(?:quiero\s+añadir|quiero\s+poner|quiero\s+meter|quiero\s+crear|añad(?:e|ir|eme|irme|enos)?|agreg(?:a|ar|ame|arnos)?|crea(?:r|nos)?|met(?:e|er|ernos)?|pon(?:er)?\s+nuevo\s+plato|pon(?:er)?(?:\s+en\s+la\s+carta|\s+a\s+la\s+carta)?|sub(?:e|ir)\s+nuevo\s+plato|nuevo\s+plato|plato\s+nuevo|incluy(?:e|ir))\s+(?:un|una|el|la|los|las|nuevo\s+plato\s+de\s+|nuevo\s+plato\s+)?([a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-&]+?)(?:\s+a\s+la\s+carta|\s+en\s+la\s+carta|\s+al\s+men[úu]|\s+en\s+el\s+men[úu]|\s+a\s+nuestra\s+carta|\s+por\s+favor|\s+gracias)?$/i;

  const match = clean.match(addPattern);
  if (match) {
    const raw = match[1];
    const cleaned = cleanDishName(raw);
    const nonDishWords = ['carta', 'menu', 'plato', 'nuevo', 'nuevo plato', 'precio', 'horario', 'cartel', 'foto'];
    if (cleaned && cleaned.length >= 2 && !nonDishWords.includes(cleaned.toLowerCase())) {
      return cleaned;
    }
  }

  return null;
}

function parseAllergens(text: string): string[] {
  if (!text) return [];
  const lower = text.toLowerCase();
  const detected = new Set<string>();

  const hasAllergen = (regex: RegExp) => {
    const globalRegex = new RegExp(regex.source, 'gi');
    let m: RegExpExecArray | null;
    while ((m = globalRegex.exec(lower)) !== null) {
      const start = Math.max(0, m.index - 25);
      const prefix = lower.substring(start, m.index);
      if (!/sin\s+|libre\s+de\s+|no\s+lleva\s+|no\s+contiene\s+|apto\s+para\s+cel[ií]acos/i.test(prefix)) {
        return true;
      }
    }
    return false;
  };

  if (hasAllergen(/gluten|trigo|harina|pan|centeno|cebada|avena|espelta|pasta|rebozad|croqueta|panko/i)) detected.add('gluten');
  if (hasAllergen(/l[aá]cteo|lactosa|leche|queso|mantequilla|nata|yogur|parmesano|mozzarella|gorgonzola/i)) detected.add('lactosa');
  if (hasAllergen(/huevo|huevos|yema|clara|mayonesa|alioli|tortilla/i)) detected.add('huevo');
  if (hasAllergen(/pescado|at[uú]n|merluza|bacalao|salm[oó]n|anchoa|lubina|dorada|bonito/i)) detected.add('pescado');
  if (hasAllergen(/crust[aá]ceo|marisco|gamba|langostino|camar[oó]n|bogavante|cigala|carabinero|cangrejo/i)) detected.add('crustaceos');
  if (hasAllergen(/molusco|pulpo|calamar|chipir[oó]n|sepia|mejill[oó]n|almeja|berberecho|zamburiña|ostra/i)) detected.add('moluscos');
  if (hasAllergen(/fruto.*seco|almendra|nuez|nueces|pistacho|avellana|anacardo|piñ[oó]n/i)) detected.add('frutos-secos');
  if (hasAllergen(/cacahuete|man[ií]/i)) detected.add('cacahuetes');
  if (hasAllergen(/soja|tofu|edamame/i)) detected.add('soja');
  if (hasAllergen(/apio/i)) detected.add('apio');
  if (hasAllergen(/mostaza|dijon/i)) detected.add('mostaza');
  if (hasAllergen(/s[eé]samo|ajonjol[ií]|tahini/i)) detected.add('sesamo');
  if (hasAllergen(/sulfito|vino|vinagre/i)) detected.add('sulfitos');
  if (hasAllergen(/altramuz|altramuces/i)) detected.add('altramuces');

  return Array.from(detected);
}

function cleanDescription(text: string): string {
  if (!text) return '';
  let desc = text.trim();
  desc = desc.replace(/[*_~`]/g, '').trim();
  desc = desc.replace(/(?:al[ée]rgenos?|alergias?|contiene\s+al[ée]rgenos?|lleva\s+al[ée]rgenos?)\s*[:\-].*$/i, '').trim();
  desc = desc.replace(/^(?:1[.)\-:]\s*|\bdescripci[óo]n\s*[:\-]\s*)/i, '').trim();
  desc = desc.replace(/[,;\-]+$/, '').trim();
  if (desc.length > 0) {
    desc = desc.charAt(0).toUpperCase() + desc.slice(1);
  }
  return desc;
}

async function findExistingDish(restaurantUuid: string, dishName: string): Promise<any | null> {
  const genericWords = new Set([
    'tosta', 'tostas', 'pizza', 'pizzas', 'burger', 'burgers', 'ensalada', 'ensaladas',
    'tarta', 'tartas', 'arroz', 'arroces', 'plato', 'platos', 'racion', 'raciones',
    'de', 'del', 'la', 'el', 'las', 'los', 'con', 'y', 'en', 'sobre', 'al', 'a', 'para',
    'nuestro', 'nuestros', 'nuestra', 'nuestras', 'casa', 'especial',
    'poner', 'pon', 'sube', 'subir', 'bajar', 'cambiar', 'cambia', 'hola', 'favor', 'porfa', 'nuevo', 'precio'
  ]);

  const words = dishName
    .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ ]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !genericWords.has(w.toLowerCase()));

  const singularize = (w: string) => {
    if (w.toLowerCase().endsWith('es') && w.length > 4) return w.slice(0, -2);
    if (w.toLowerCase().endsWith('s') && w.length > 3) return w.slice(0, -1);
    return w;
  };

  const searchQueries: string[] = [];
  if (words.length >= 2) {
    searchQueries.push(`*${encodeURIComponent(words[0])}*${encodeURIComponent(words[1])}*`);
    const s0 = singularize(words[0]);
    const s1 = singularize(words[1]);
    if (s0 !== words[0] || s1 !== words[1]) {
      searchQueries.push(`*${encodeURIComponent(s0)}*${encodeURIComponent(s1)}*`);
    }
  }

  for (const w of words) {
    searchQueries.push(`*${encodeURIComponent(w)}*`);
    const s = singularize(w);
    if (s !== w) searchQueries.push(`*${encodeURIComponent(s)}*`);
  }

  for (const q of searchQueries) {
    try {
      const getUrl = `${SUPABASE_URL}/rest/v1/dishes?restaurant_id=eq.${restaurantUuid}&name=ilike.${q}&select=id,name,price,description,allergens&limit=1`;
      const getRes = await fetch(getUrl, {
        headers: {
          'apikey': SUPABASE_SECRET_KEY,
          'Authorization': `Bearer ${SUPABASE_SECRET_KEY}`,
        },
      });
      if (getRes.ok) {
        const found = await getRes.json();
        if (found && found.length > 0) {
          return found[0];
        }
      }
    } catch {}
  }

  return null;
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
  const res = await apiCall('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'Markdown',
    reply_markup: replyMarkup || undefined,
  });
  if (!res.ok && (res.description?.includes("can't parse entities") || res.error?.includes("entities"))) {
    return apiCall('sendMessage', {
      chat_id: chatId,
      text: text.replace(/[*_`]/g, ''),
      reply_markup: replyMarkup || undefined,
    });
  }
  return res;
}

async function answerCallbackQuery(callbackQueryId: string, text = '') {
  return apiCall('answerCallbackQuery', {
    callback_query_id: callbackQueryId,
    text,
  });
}

async function editMessageText(chatId: string | number, messageId: number, text: string, replyMarkup: any = null) {
  const res = await apiCall('editMessageText', {
    chat_id: chatId,
    message_id: messageId,
    text,
    parse_mode: 'Markdown',
    reply_markup: replyMarkup || undefined,
  });
  if (!res.ok && (res.description?.includes("can't parse entities") || res.error?.includes("entities"))) {
    return apiCall('editMessageText', {
      chat_id: chatId,
      message_id: messageId,
      text: text.replace(/[*_`]/g, ''),
      reply_markup: replyMarkup || undefined,
    });
  }
  return res;
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
  updates: { price?: number; isAvailable?: boolean; photo_url?: string; description?: string; allergens?: string[]; category_id?: string; category_name?: string }
): Promise<{ success: boolean; dishId?: string; dishName?: string; previousPrice?: number; newPrice?: number; isNew?: boolean }> {
  try {
    const payload: any = {};
    if (updates.price !== undefined) payload.price = Number(updates.price);
    if (updates.isAvailable !== undefined) payload.is_available = updates.isAvailable;
    if (updates.photo_url !== undefined) payload.photo_url = updates.photo_url;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.allergens !== undefined) payload.allergens = updates.allergens;
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

    const singularize = (w: string) => {
      if (w.toLowerCase().endsWith('es') && w.length > 4) return w.slice(0, -2);
      if (w.toLowerCase().endsWith('s') && w.length > 3) return w.slice(0, -1);
      return w;
    };

    // Try multiple search strategies from most specific to broader
    const searchQueries: string[] = [];

    // 1. Compound: top 2 distinctive words (*Avocado*Toast* or *Salmón*Ahumado*)
    if (words.length >= 2) {
      searchQueries.push(`*${encodeURIComponent(words[0])}*${encodeURIComponent(words[1])}*`);
      const s0 = singularize(words[0]);
      const s1 = singularize(words[1]);
      if (s0 !== words[0] || s1 !== words[1]) {
        searchQueries.push(`*${encodeURIComponent(s0)}*${encodeURIComponent(s1)}*`);
      }
    }

    // 2. Individual words and their singular forms (e.g. *Botellas* -> *Botella*)
    for (const w of words) {
      searchQueries.push(`*${encodeURIComponent(w)}*`);
      const s = singularize(w);
      if (s !== w) {
        searchQueries.push(`*${encodeURIComponent(s)}*`);
      }
    }

    // 3. First non-empty word fallback (only if not generic)
    const firstWord = dishNameSearch.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ ]/g, '').trim().split(/\s+/)[0];
    if (firstWord && !genericWords.has(firstWord.toLowerCase()) && !searchQueries.some(q => q.includes(encodeURIComponent(firstWord)))) {
      searchQueries.push(`*${encodeURIComponent(firstWord)}*`);
      const sFirst = singularize(firstWord);
      if (sFirst !== firstWord) searchQueries.push(`*${encodeURIComponent(sFirst)}*`);
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
        let categoryId: string | null = updates.category_id || null;
        if (!categoryId && (updates as any).category_name) {
          try {
            const cats = await getRestaurantCategories(restaurantUuid);
            const targetNorm = ((updates as any).category_name || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const found = cats.find(c => {
              const cNorm = c.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
              return targetNorm.includes(cNorm) || cNorm.includes(targetNorm);
            });
            if (found) {
              categoryId = found.id;
            }
          } catch {}
        }

        if (!categoryId) {
          const cats = await getRestaurantCategories(restaurantUuid);
          if (cats.length > 0) {
            categoryId = cats[0].id;
          }
        }

        const cleanName = cleanDishName(dishNameSearch);
        const insertPayload: any = {
          restaurant_id: restaurantUuid,
          name: cleanName || dishNameSearch,
          price: Number(updates.price),
          description: updates.description || 'Especialidad de la casa elaborada con ingredientes seleccionados.',
          allergens: updates.allergens || [],
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
  const prefixRegex = /^(?:hola(?:\s+[a-záéíóúñ]+)?|buenas|oye|por\s+favor|porfa|quiero\s+que\s+pongas|pon(?:er)?|sub(?:e|ir)|baj(?:a|ar)|cambi(?:a|ar)(?:\s+el\s+precio\s+de)?|pas(?:a|ar)|añad(?:e|ir)(?:\s+nuevo\s+plato)?|crea(?:r)?(?:\s+nuevo\s+plato)?|marcar|nuevo\s+plato|plato|precio\s+de|precio|ya\s+no\s+(?:nos\s+)?quedan?|no\s+(?:nos\s+)?quedan?|no\s+(?:nos\s+)?quedan?\s+nada\s+de|se\s+(?:nos\s+)?ha\s+(?:terminado|acabado|agotado)|hemos\s+(?:terminado|acabado|agotado|vendido\s+tod[ao]s?)|ya\s+no\s+hay|no\s+hay|no\s+tenemos|desactivar|quitar|eliminar|de|el|la|los|las|un|una|unos|unas)[\s,:\-]+/i;
  
  while (prefixRegex.test(name)) {
    name = name.replace(prefixRegex, '').trim();
  }
  
  // 2. Strip trailing context words (e.g. ": Marcar Agotado", "como agotada hoy", "para el fin de semana", etc.)
  const suffixRegex = /(?:[\s,:\-]+(?:como\s+(?:agotad[oa]s?|disponible)|marcar\s+(?:como\s+)?(?:agotad[oa]s?|disponible)|para\s+(?:el\s+)?(?:servicio|fin\s+de\s+semana|hoy|mañana|este\s+fin\s+de\s+semana).*|de\s+la\s+carta|en\s+carta|por\s+ración|la\s+ración|en\s+el\s+menú|del\s+menú|por\s+favor|gracias|hoy|mañana|esta\s+noche|agotad[oa]s?|sin\s+stock|terminad[oa]s?|acabad[oa]s?))$/i;
  name = name.replace(suffixRegex, '').trim();

  // 3. Remove leading articles again if any remain
  name = name.replace(/^(?:el|la|los|las|un|una|unos|unas)\s+/i, '').trim();

  // 4. Capitalize first letter properly
  if (name.length > 0) {
    name = name.charAt(0).toUpperCase() + name.slice(1);
  }

  return name;
}

function extractChangesFromMessage(text: string): Array<{ dishName: string; updates: { price?: number; isAvailable?: boolean; photo_url?: string; description?: string; allergens?: string[]; category_id?: string; category_name?: string } }> {
  const changes: Array<{ dishName: string; updates: { price?: number; isAvailable?: boolean; photo_url?: string; description?: string; allergens?: string[]; category_id?: string; category_name?: string } }> = [];

  // Check if it's a rich new dish ticket card
  const platoMatch = text.match(/[•\s]*🍽️\s*\*?(?:Nombre|Plato)\*?:\s*\*?([^*\n]+?)\*?(?:\s*\(([\d\.,]+)\s*€\))?(?:\n|$)/i);
  const descMatch = text.match(/[•\s]*📝\s*\*?Descripci[óo]n\*?:\s*([^\n]+)/i);
  const alergMatch = text.match(/[•\s]*🏷️\s*\*?Al[ée]rgenos\*?:\s*([^\n]+)/i);
  const newPriceMatch = text.match(/[•\s]*💰\s*\*?Precio\*?:\s*([\d\.,]+)\s*€/i);
  const sectionMatch = text.match(/[•\s]*📂\s*\*?Secci[óo]n\*?:\s*([^\n]+)/i);

  if (platoMatch) {
    const dishName = cleanDishName(platoMatch[1]);
    const priceStr = platoMatch[2] || (newPriceMatch ? newPriceMatch[1] : null);
    const priceVal = priceStr ? parseFloat(priceStr.replace(',', '.')) : undefined;
    const desc = descMatch ? cleanDescription(descMatch[1]) : undefined;
    const allergens = alergMatch ? parseAllergens(alergMatch[1]) : undefined;
    const categoryName = sectionMatch ? sectionMatch[1].replace(/[*_`]/g, '').trim() : undefined;

    if (dishName) {
      changes.push({
        dishName,
        updates: {
          price: priceVal,
          description: desc,
          allergens: allergens,
          category_name: categoryName,
          isAvailable: true,
        },
      });
      return changes;
    }
  }

  const lines = text.split('\n');

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    // 1. Structured summary lines (High priority when approving from Admin card)
    if (line.includes('💰')) {
      const m = line.match(/💰\s*\*?([^*:\n]+?)\*?:\s*(\d+[\.,]?\d*)\s*(?:€|euros?|EUR)/i);
      if (m) {
        changes.push({ dishName: cleanDishName(m[1]), updates: { price: parseFloat(m[2].replace(',', '.')) } });
        continue;
      }
    }

    if (line.includes('🚫')) {
      const m = line.match(/🚫\s*\*?([^*:\n]+?)\*?(?::|\s+Marcar|\s+Agotad)/i);
      if (m) {
        changes.push({ dishName: cleanDishName(m[1]), updates: { isAvailable: false } });
        continue;
      }
    }

    if (line.includes('✅') && !line.includes('Oficial') && !line.includes('ESTADO') && !line.includes('Sincronizado')) {
      const m = line.match(/✅\s*\*?([^*:\n]+?)\*?(?::|\s+Marcar|\s+Disponible)/i);
      if (m) {
        changes.push({ dishName: cleanDishName(m[1]), updates: { isAvailable: true } });
        continue;
      }
    }

    // 2. Conversational clauses in raw message text
    const clauses = line.split(/\s+(?:y|e|además|tambien|también|,|;)\s+/i);
    for (const clause of clauses) {
      // A. Extracción de precio
      const priceMatch = clause.match(/(?:Precio:\s*|a\s+)?([a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-&]+?)(?::\s*|\s+a\s+|\s*->\s*|\s+pasa\s+a\s+(?:costar\s+)?)(\d+[\.,]?\d*)\s*(?:€|euros?|EUR)/i);
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

      // B. Extracción de plato/producto agotado (Frases coloquiales y directas)
      const agotadoMatch = 
        clause.match(/(?:ya\s+no\s+(?:nos\s+)?quedan?|no\s+(?:nos\s+)?quedan?(?:\s+nada\s+de)?|se\s+(?:nos\s+)?ha\s+(?:terminado|acabado|agotado)|hemos\s+(?:terminado|acabado|agotado|vendido\s+tod[ao]s?)|ya\s+no\s+hay|no\s+hay|no\s+tenemos|sin\s+stock\s+de|quitar|desactivar|marcar\s+como\s+agotad[oa])\s+(?:de\s+|el\s+|la\s+|los\s+|las\s+|nuestr[ao]s?\s+)?([a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-&]+)/i) ||
        clause.match(/([a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-&]+?)\s+(?:como\s+)?(?:agotad[oa]s?|sin\s+stock|no\s+queda|no\s+quedan|terminad[oa]s?|acabad[oa]s?)/i);

      if (agotadoMatch) {
        const target = agotadoMatch[1] || agotadoMatch[2];
        const cleaned = cleanDishName(target);
        if (cleaned && cleaned.length >= 2) {
          changes.push({
            dishName: cleaned,
            updates: { isAvailable: false }
          });
          continue;
        }
      }

      // C. Extracción de plato/producto disponible o repuesto
      const disponibleMatch = 
        clause.match(/(?:ya\s+(?:nos\s+)?ha\s+llegado|volvemos\s+a\s+tener|ya\s+tenemos|vuelve\s+a\s+haber|hemos\s+repuesto|activar|reponer|marcar\s+como\s+disponible)\s+(?:de\s+|el\s+|la\s+|los\s+|las\s+|nuestr[ao]s?\s+)?([a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-&]+)/i) ||
        clause.match(/([a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-&]+?)\s+(?:como\s+)?(?:disponible|activad[oa]|repuest[oa]|de\s+vuelta)/i);

      if (disponibleMatch) {
        const target = disponibleMatch[1] || disponibleMatch[2];
        const cleaned = cleanDishName(target);
        if (cleaned && cleaned.length >= 2) {
          changes.push({
            dishName: cleaned,
            updates: { isAvailable: true }
          });
          continue;
        }
      }
    }
  }

  // Deduplicar cambios por nombre de plato
  const uniqueMap = new Map<string, { dishName: string; updates: { price?: number; isAvailable?: boolean; photo_url?: string; description?: string; allergens?: string[]; category_id?: string; category_name?: string } }>();
  for (const c of changes) {
    if (!uniqueMap.has(c.dishName)) {
      uniqueMap.set(c.dishName, c);
    }
  }

  return Array.from(uniqueMap.values());
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
  
  // Temporary closure / Cartel cerrado
  if (/cartel.*cerrad|cerrad[oa]s?|cerrar|cerramos|cierre|vacaciones|descanso|cerrar hoy|estamos cerrad|bajar la persiana|no abrimos|hoy no abrimos|cerrar el local|cerrar el restaurante/i.test(lower)) {
    return { type: 'CLOSURE', emoji: '🚨', label: 'Cierre Temporal / Cartel Cerrado' };
  }
  // Reopening / Cartel abierto
  if (/cartel.*abiert|abiert[oa]s?|abrir|abrimos|reapertura|volver a abrir|estamos abiert|abrimos hoy|ya abrimos|abrir el local|abrir el restaurante/i.test(lower)) {
    return { type: 'OPENING', emoji: '🟢', label: 'Reapertura / Cartel Abierto' };
  }
  // Schedule/hours changes
  if (/horario|hora de apertura|hora de cierre|turno|servicio de/i.test(lower)) {
    return { type: 'SCHEDULE', emoji: '🕐', label: 'Cambio de Horario' };
  }
  // Daily menu
  if (/men[úu] del d[ií]a|men[úu] de hoy|primeros?.*segundos?|plato del d[ií]a/i.test(lower)) {
    return { type: 'DAILY_MENU', emoji: '🍽️', label: 'Menú del Día' };
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

      // --- SELECCIÓN DE SECCIÓN / CATEGORÍA POR HOSTELERO ---
      if (data.startsWith('selcat_')) {
        const catIdxStr = data.replace('selcat_', '');
        const fromChatId = String(callback.message?.chat?.id || ADMIN_CHAT_ID);
        const messageId = callback.message?.message_id;

        await answerCallbackQuery(callback.id, '✅ Sección seleccionada');

        const pending = await getPendingDishWizard(fromChatId);
        if (pending) {
          const restaurantUuid = RESTAURANT_CONFIG[pending.restaurantSlug]?.uuid || 'a1000000-0000-0000-0000-000000000001';
          const categories = await getRestaurantCategories(restaurantUuid);
          
          let selectedCat: { id: string; name: string } | null = null;
          const idx = parseInt(catIdxStr, 10);
          if (!isNaN(idx) && idx >= 0 && idx < categories.length) {
            selectedCat = categories[idx];
          } else {
            selectedCat = categories.find(c => c.id === catIdxStr || c.id.startsWith(catIdxStr)) || null;
          }

          const catId = selectedCat?.id || (categories.length > 0 ? categories[0].id : '');
          const catName = selectedCat?.name || 'Sección General';

          await savePendingDishWizard(fromChatId, pending.restaurantSlug, pending.dishName, pending.price, 'awaiting_details', catId, catName);

          const promptText = `📂 *Sección elegida:* *${catName}*\n━━━━━━━━━━━━━━━━━━━━\nPara mantener la estética limpia de tu carta y cumplir con la **Normativa de Alérgenos (Reglamento UE 1169/2011)**, por favor indícanos:\n\n1️⃣ *Descripción / ingredientes:* (ej: _"Corte selecto a la brasa de encina con patatas"_)\n2️⃣ *Alérgenos que contiene:* (ej: _"Gluten, lácteos, huevo"_ o escribe _"Ninguno"_)\n\n✍️ _Responde a este mensaje con los detalles._`;

          if (messageId) {
            await editMessageText(fromChatId, messageId, promptText);
          } else {
            await sendMessage(fromChatId, promptText);
          }
          return NextResponse.json({ ok: true, status: 'awaiting_details' });
        }
      }

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

        // Check if message contains closure or opening request for the restaurant sign
        const isClosure = /Cartel del Local.*CERRADO|Cierre Temporal|cambia.*cartel.*cerrad|cerrar hoy|marcar.*cerrad|estamos cerrad|bajar la persiana|no abrimos/i.test(messageText);
        const isOpening = /Cartel del Local.*ABIERTO|Reapertura|cambia.*cartel.*abiert|abrir hoy|marcar.*abiert|estamos abiert|abrimos hoy/i.test(messageText);

        let restaurantSignUpdated = false;
        let signStatusLabel = '';

        if (isClosure) {
          let existingHours: any = {};
          try {
            const hRes = await fetch(`${SUPABASE_URL}/rest/v1/restaurants?id=eq.${restaurantUuid}&select=opening_hours`, {
              headers: { 'apikey': SUPABASE_SECRET_KEY, 'Authorization': `Bearer ${SUPABASE_SECRET_KEY}` },
            });
            if (hRes.ok) {
              const hData = await hRes.json();
              if (hData && hData[0]?.opening_hours && typeof hData[0].opening_hours === 'object') {
                existingHours = hData[0].opening_hours;
              }
            }
          } catch {}

          const restRes = await applyRestaurantChangeToSupabase(restaurantUuid, {
            is_active: true,
            opening_hours: {
              ...existingHours,
              isTemporarilyClosed: true,
              closedReason: 'Cerrado temporalmente',
            },
          });
          if (restRes) {
            restaurantSignUpdated = true;
            signStatusLabel = '🚨 Cartel: CERRADO temporalmente';
            console.log(`🚨 [Supabase Cloud] Restaurante ${restaurantUuid} marcado como CERRADO (isTemporarilyClosed: true)`);
          }
        } else if (isOpening) {
          let existingHours: any = {};
          try {
            const hRes = await fetch(`${SUPABASE_URL}/rest/v1/restaurants?id=eq.${restaurantUuid}&select=opening_hours`, {
              headers: { 'apikey': SUPABASE_SECRET_KEY, 'Authorization': `Bearer ${SUPABASE_SECRET_KEY}` },
            });
            if (hRes.ok) {
              const hData = await hRes.json();
              if (hData && hData[0]?.opening_hours && typeof hData[0].opening_hours === 'object') {
                existingHours = hData[0].opening_hours;
              }
            }
          } catch {}

          const restRes = await applyRestaurantChangeToSupabase(restaurantUuid, {
            is_active: true,
            opening_hours: {
              ...existingHours,
              isTemporarilyClosed: false,
              closedReason: null,
            },
          });
          if (restRes) {
            restaurantSignUpdated = true;
            signStatusLabel = '🟢 Cartel: ABIERTO al público';
            console.log(`🟢 [Supabase Cloud] Restaurante ${restaurantUuid} marcado como ABIERTO (isTemporarilyClosed: false)`);
          }
        }

        // Extraer y aplicar cambios de información del restaurante (Teléfono, WhatsApp, Eslogan, Aforo, Horario)
        const restUpdates: Record<string, any> = {};

        const phoneMatch = messageText.match(/(?:tel[ée]fono|tlf|contacto|reservas)[\s:]*([+\d\s]{9,15})/i);
        if (phoneMatch) {
          restUpdates.phone = phoneMatch[1].replace(/\s+/g, ' ').trim();
        }
        const whatsappMatch = messageText.match(/(?:whatsapp|wasap|wsp)[\s:]*([+\d\s]{9,15})/i);
        if (whatsappMatch) {
          restUpdates.whatsapp = whatsappMatch[1].replace(/\s+/g, ' ').trim();
        }

        const taglineMatch = messageText.match(/(?:eslogan|tagline|lema|subt[ií]tulo)[\s:]*["“]?([^"\n\r]{5,100})["”]?/i);
        if (taglineMatch) {
          restUpdates.tagline = taglineMatch[1].trim();
        }

        const aforoMatch = messageText.match(/(?:aforo|capacidad|plazas|comensales)[\s:]*(\d+)/i);
        if (aforoMatch) {
          restUpdates.capacity = parseInt(aforoMatch[1], 10);
        }

        if (Object.keys(restUpdates).length > 0) {
          const restOk = await applyRestaurantChangeToSupabase(restaurantUuid, restUpdates);
          if (restOk) {
            restaurantSignUpdated = true;
            signStatusLabel = signStatusLabel ? `${signStatusLabel} • Datos del local actualizados` : 'ℹ️ Información del restaurante actualizada';
            console.log(`🏠 [Supabase Cloud] Actualizada info de restaurante ${restaurantUuid}:`, restUpdates);
          }
        }

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
          const customHosteleroMsg = restaurantSignUpdated
            ? `✅ *¡Estado de tu restaurante actualizado!*\n\n${signStatusLabel}\n\nLos cambios ya están reflejados en directo en la web.\n\n🔗 https://gastrotorre.vercel.app`
            : `✅ *¡Cambios publicados!*\n\nTu solicitud ha sido aprobada y los cambios ya están visibles en tu carta digital en vivo.${temporalNotice}\n\n🔗 https://gastrotorre.vercel.app`;
          await sendMessage(hosteleroChatId, customHosteleroMsg);
        }

        const viewMenuMarkup = {
          inline_keyboard: [
            [
              { text: '👀 Ver Carta en Vivo', url: 'https://gastrotorre.vercel.app' }
            ]
          ]
        };

        const temporalTag = isTemporal ? ' • 🕒 Pregunta de Reversión Programada (Lunes)' : '';
        const summaryChangesDesc = restaurantSignUpdated 
          ? (updatedCount > 0 ? `${signStatusLabel} + ${updatedCount} platos` : signStatusLabel)
          : `${updatedCount} platos`;

        await editMessageText(
          fromChatId,
          messageId,
          `${messageText}\n\n━━━━━━━━━━━━━━━━━━━━\n✅ *ESTADO: APROBADO Y PUBLICADO EN VIVO EN LA NUBE*\n🕒 ${new Date().toLocaleTimeString('es-ES')} • ☁️ Sincronizado en Supabase Cloud (${summaryChangesDesc})${temporalTag}`,
          viewMenuMarkup
        );

        return NextResponse.json({ ok: true, status: 'approved', changes: updatedCount, restaurantSignUpdated });
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

      // Comprobación dinámica en Supabase para restaurantes nuevos creados desde /admin
      try {
        const pinParts = text.toUpperCase().trim().replace(/^PIN\s*[:=]?\s*/i, '').split(/[-_ ]+/);
        const keyword = pinParts[0]?.toLowerCase().replace(/[^a-z0-9áéíóúñ]/g, '') || '';
        if (keyword.length >= 3 && !['HOLA', 'QUIERO', 'PORFA', 'BUENAS', 'CAMBIAR', 'SUBIR'].includes(keyword.toUpperCase())) {
          const dynRes = await fetch(`${SUPABASE_URL}/rest/v1/restaurants?or=(slug.ilike.*${encodeURIComponent(keyword)}*,name.ilike.*${encodeURIComponent(keyword)}*)&select=id,slug,name&limit=1`, {
            headers: {
              'apikey': SUPABASE_SECRET_KEY,
              'Authorization': `Bearer ${SUPABASE_SECRET_KEY}`,
            },
          });
          if (dynRes.ok) {
            const dynList = await dynRes.json();
            if (dynList && dynList.length > 0) {
              const found = dynList[0];
              await savePersistentBinding(chatId, found.slug, found.name, senderName);
              await sendMessage(
                chatId,
                `🔑 *¡PIN Reconocido Correctamente!*\n\nTu Telegram ha quedado vinculado a *${found.name}*.\n\nYa puedes enviarme cambios de precios (ej: _"Sube las bravas a 8.50€"_), platos agotados o fotos en cualquier momento.`
              );
              return NextResponse.json({ ok: true });
            }
          }
        }
      } catch (dynErr) {
        console.warn('Error dynamic pin check:', dynErr);
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

      const restaurantUuid = RESTAURANT_CONFIG[binding.restaurantSlug]?.uuid || 'a1000000-0000-0000-0000-000000000001';

      // Comando /cancel o cancelar
      if (text.startsWith('/cancel') || text.toLowerCase() === 'cancelar') {
        await clearPendingDishWizard(chatId);
        await sendMessage(chatId, '❌ *Operación cancelada.*\nPuedes enviarme cualquier cambio o consulta cuando quieras.');
        return NextResponse.json({ ok: true });
      }

      // 1. GESTIÓN DE WIZARD ACTIVO (El hostelero está respondiendo precio, sección, descripción o alérgenos de un nuevo plato)
      const pendingWizard = await getPendingDishWizard(chatId);
      if (pendingWizard) {
        if (pendingWizard.step === 'awaiting_price') {
          // Extraer precio del mensaje
          const priceMatch = text.match(/(\d+[\.,]?\d*)\s*(?:€|euros?|EUR)?/i);
          const parsedPrice = priceMatch ? parseFloat(priceMatch[1].replace(',', '.')) : null;

          if (!parsedPrice || isNaN(parsedPrice) || parsedPrice <= 0) {
            await sendMessage(
              chatId,
              `💰 *Por favor, indica un precio válido en euros* para *${pendingWizard.dishName}*.\n\n👉 _Ejemplo:_ \`14.50€\` o \`14.50\`\n\n_(Escribe /cancelar para anular esta solicitud)_`
            );
            return NextResponse.json({ ok: true, status: 'awaiting_valid_price' });
          }

          // Pasar a preguntar la sección/categoría
          await sendCategorySelectionPrompt(chatId, pendingWizard.restaurantSlug, pendingWizard.dishName, parsedPrice);
          return NextResponse.json({ ok: true, status: 'awaiting_category' });
        }

        if (pendingWizard.step === 'awaiting_category') {
          const restaurantUuid = RESTAURANT_CONFIG[pendingWizard.restaurantSlug]?.uuid || 'a1000000-0000-0000-0000-000000000001';
          const categories = await getRestaurantCategories(restaurantUuid);

          let selectedCat: { id: string; name: string } | null = null;
          const numMatch = text.match(/^(\d+)/);
          if (numMatch) {
            const idx = parseInt(numMatch[1], 10) - 1;
            if (idx >= 0 && idx < categories.length) {
              selectedCat = categories[idx];
            }
          }

          if (!selectedCat) {
            const textLower = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            selectedCat = categories.find(c => {
              const cLower = c.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
              return textLower.includes(cLower) || cLower.includes(textLower);
            }) || null;
          }

          const catId = selectedCat?.id || (categories.length > 0 ? categories[0].id : undefined);
          const catName = selectedCat?.name || text.trim();

          await savePendingDishWizard(chatId, pendingWizard.restaurantSlug, pendingWizard.dishName, pendingWizard.price, 'awaiting_details', catId, catName);

          await sendMessage(
            chatId,
            `📂 *Sección elegida:* *${catName}*\n━━━━━━━━━━━━━━━━━━━━\nPara mantener la estética limpia de tu carta y cumplir con la **Normativa de Alérgenos (Reglamento UE 1169/2011)**, por favor indícanos:\n\n1️⃣ *Descripción / ingredientes:* (ej: _"Tarta artesanal de tres chocolates con base de galleta"_)\n2️⃣ *Alérgenos que contiene:* (ej: _"Gluten, lácteos, huevo, soja"_ o escribe _"Ninguno"_)\n\n✍️ _Responde a este mensaje con los detalles._`
          );
          return NextResponse.json({ ok: true, status: 'awaiting_details' });
        }

        // pendingWizard.step === 'awaiting_details'
        await clearPendingDishWizard(chatId);

        const allergens = parseAllergens(text);
        const description = cleanDescription(text) || 'Especialidad de la casa elaborada con ingredientes seleccionados.';
        const ticketId = `TCK-${Math.floor(1000 + Math.random() * 9000)}`;

        const allergensLabel = allergens.length > 0
          ? allergens.map((a) => a.charAt(0).toUpperCase() + a.slice(1)).join(', ')
          : 'Ninguno declarado';

        const summary = 
`• ✨ *Tipo:* Alta de Nuevo Plato (Ficha Completa)
• 🍽️ *Plato:* *${pendingWizard.dishName}*
• 💰 *Precio:* ${pendingWizard.price.toFixed(2)} €
• 📂 *Sección:* ${pendingWizard.categoryName || 'General'}
• 📝 *Descripción:* ${description}
• 🏷️ *Alérgenos:* ${allergensLabel}`;

        await sendMessage(
          chatId,
          `✅ *¡Ficha completada para tu nuevo plato!* (#${ticketId})\n\n🍽️ *Plato:* *${pendingWizard.dishName}* (${pendingWizard.price.toFixed(2)} €)\n📂 *Sección:* *${pendingWizard.categoryName || 'General'}*\n📝 *Descripción:* _${description}_\n🏷️ *Alérgenos:* ${allergensLabel}\n\n⏳ Tu solicitud ha sido enviada al Superadmin para su validación y publicación en directo en tu carta digital.`
        );

        const adminNotificationText = 
`🎫 *TICKET CLOUD #${ticketId} — ${binding.restaurantName}*
━━━━━━━━━━━━━━━━━━━━
🏠 *Restaurante:* ${binding.restaurantName} (✅ *Oficial*)
👤 *Hostelero:* ${username} (ID: \`${chatId}\`)
✨ *Categoría:* Alta de Nuevo Plato (Ficha Completa)
💬 *Mensaje Original:*
_${text}_

🤖 *Detalles del Nuevo Plato:*
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

      // 2. DETECCIÓN PROACTIVA DE PETICIÓN DE AÑADIR PLATO SIN PRECIO
      const addWithoutPriceDish = detectAddDishWithoutPrice(text);
      if (addWithoutPriceDish) {
        // Guardar estado inicial para esperar el precio
        await savePendingDishWizard(chatId, binding.restaurantSlug, addWithoutPriceDish, 0, 'awaiting_price');
        await sendMessage(
          chatId,
          `✨ *¡Nuevo plato detectado!*\n━━━━━━━━━━━━━━━━━━━━\n🍽️ *Plato:* *${addWithoutPriceDish}*\n\n💰 *Por favor, indica el precio* que tendrá en la carta (ej: _14.50€_ o simplemente _14.50_):`
        );
        return NextResponse.json({ ok: true, status: 'awaiting_dish_price' });
      }

      // Comando /carta: Listar carta actual para el hostelero
      if (text.startsWith('/carta')) {
        try {
          const queryUrl = `${SUPABASE_URL}/rest/v1/dishes?restaurant_id=eq.${restaurantUuid}&select=name,price,is_available&order=name.asc`;
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

      // 2. DETECCIÓN PROACTIVA DE NUEVO PLATO NO EXISTENTE EN CARTA
      // Si el hostelero pide añadir un plato que NO está en su menú, preguntar por sección, descripción y alérgenos
      if (detected.length > 0) {
        for (const item of detected) {
          if (item.updates.price !== undefined) {
            const existingDish = await findExistingDish(restaurantUuid, item.dishName);
            if (!existingDish) {
              // Es un plato nuevo
              const hasExplicitDetails = /al[ée]rgenos?|alergias?|ingredientes?|descripci[óo]n|con base de|elaborad[oa]|preparad[oa]/i.test(text) || text.length >= 80;
              if (!hasExplicitDetails) {
                // Activar wizard pidiendo sección primero
                await sendCategorySelectionPrompt(chatId, binding.restaurantSlug, item.dishName, item.updates.price);
                return NextResponse.json({ ok: true, status: 'awaiting_category' });
              } else {
                // Ya incluyó los detalles en el mismo mensaje
                item.updates.description = cleanDescription(text);
                item.updates.allergens = parseAllergens(text);
              }
            }
          }
        }
      }

      let summary = `• ${ticketType.emoji} *Tipo:* ${ticketType.label}\n`;

      if (ticketType.type === 'CLOSURE') {
        summary += `• 🚨 *Cartel del Local:* Cambiar estado a CERRADO (Cierre temporal)\n`;
      } else if (ticketType.type === 'OPENING') {
        summary += `• 🟢 *Cartel del Local:* Cambiar estado a ABIERTO (Reapertura al público)\n`;
      }

      if (detected.length > 0) {
        for (const item of detected) {
          if (item.updates.description || item.updates.allergens) {
            summary += `• 🍽️ *Plato:* *${item.dishName}*\n`;
            if (item.updates.price !== undefined) {
              summary += `• 💰 *Precio:* ${Number(item.updates.price).toFixed(2)} €\n`;
            }
            summary += `• 📝 *Descripción:* ${item.updates.description || 'Especialidad de la casa'}\n`;
            summary += `• 🏷️ *Alérgenos:* ${item.updates.allergens && item.updates.allergens.length > 0 ? item.updates.allergens.join(', ') : 'Ninguno declarado'}\n`;
          } else {
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
        }
      } else if (ticketType.type !== 'CLOSURE' && ticketType.type !== 'OPENING') {
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
