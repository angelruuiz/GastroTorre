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
        if (data[0].created_at) {
          const ageMs = Date.now() - new Date(data[0].created_at).getTime();
          if (ageMs > 10 * 60 * 1000) {
            return null; // Expired after 10 minutes
          }
        }
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
  const addPattern = /^(?:hola(?:\s+[a-záéíóúñ]+)?|buenas|por\s+favor|porfa|oye)?[\s,:\-]*(?:quiero\s+añadir|quiero\s+poner|quiero\s+meter|quiero\s+crear|añad(?:e|ir|eme|irme|enos)?|agreg(?:a|ar|ame|arnos)?|crea(?:r|nos)?|met(?:e|er|ernos)?|pon(?:er)?\s+nuevo\s+plato|pon(?:er)?(?:\s+en\s+la\s+carta|\s+a\s+la\s+carta)?|sub(?:e|ir)\s+nuevo\s+plato|nuevo\s+plato|plato\s+nuevo|incluy(?:e|ir))\s+(?:(?:un|una|el|la|los|las)\s+)?(?:nuevo\s+plato|plato\s+nuevo|plato\s+de\s+|plato)?\s*[:=\-]?\s*([a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-&]+?)(?:\s+a\s+la\s+carta|\s+en\s+la\s+carta|\s+al\s+men[úu]|\s+en\s+el\s+men[úu]|\s+a\s+nuestra\s+carta|\s+por\s+favor|\s+gracias)?$/i;

  const match = clean.match(addPattern);
  if (match) {
    const raw = match[1];
    const cleaned = cleanDishName(raw);
    const nonDishWords = ['carta', 'menu', 'plato', 'nuevo', 'nuevo plato', 'precio', 'horario', 'cartel', 'foto', 'carne', 'pescado', 'stock'];
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
      const start = Math.max(0, m.index - 30);
      const prefix = lower.substring(start, m.index);
      if (!/sin\s+|libre\s+de\s+|no\s+lleva\s+|no\s+contiene\s+|ni\s+|apto\s+(?:para\s+)?cel[ií]acos/i.test(prefix)) {
        return true;
      }
    }
    return false;
  };

  if (hasAllergen(/gluten|trigo|harina|pan|centeno|cebada|avena|espelta|kamut|pasta|rebozad|croqueta|panko|hojaldre|tempura|cerveza/i)) detected.add('gluten');
  if (hasAllergen(/l[aá]cteo|lactosa|leche|queso|mantequilla|nata|yogur|parmesano|mozzarella|burrata|gorgonzola|manchego|bechamel|cuajada|helado/i)) {
    detected.add('lacteos');
    detected.add('lactosa');
  }
  if (hasAllergen(/huevo|huevos|yema|clara|mayonesa|alioli|tortilla|revuelto|pochado|merengue/i)) detected.add('huevo');
  if (hasAllergen(/pescado|at[uú]n|merluza|bacalao|salm[oó]n|anchoa|boquer[oó]n|lubina|dorada|corvina|rodaballo|pez\s+espada|rape|sardina/i)) detected.add('pescado');
  if (hasAllergen(/crust[aá]ceo|marisco|gamba|langostino|camar[oó]n|bogavante|cigala|carabinero|cangrejo|centollo|n[eé]cora/i)) detected.add('crustaceos');
  if (hasAllergen(/molusco|pulpo|calamar|chipir[oó]n|sepia|mejill[oó]n|almeja|berberecho|zamburiña|ostra|navaja|vieira|caracol/i)) detected.add('moluscos');
  if (hasAllergen(/fruto.*seco|almendra|nuez|nueces|pistacho|avellana|anacardo|piñ[oó]n|pacana|pralin[eé]|mazap[aá]n/i)) detected.add('frutos-secos');
  if (hasAllergen(/cacahuete|man[ií]/i)) detected.add('cacahuetes');
  if (hasAllergen(/soja|soya|tofu|edamame|tamari|miso|tempeh/i)) detected.add('soja');
  if (hasAllergen(/apio/i)) detected.add('apio');
  if (hasAllergen(/mostaza|dijon/i)) detected.add('mostaza');
  if (hasAllergen(/s[eé]samo|ajonjol[ií]|tahini/i)) detected.add('sesamo');
  if (hasAllergen(/sulfito|vino|cava|sidra|vinagre/i)) detected.add('sulfitos');
  if (hasAllergen(/altramuz|altramuces|chocho/i)) detected.add('altramuces');

  return Array.from(detected);
}

function detectCategoryFromText(text: string, categories: Array<{ id: string; name: string }>): { id: string; name: string } | null {
  if (!text || categories.length === 0) return null;
  const normText = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // 1. Coincidencia explícita con nombres de categoría existentes en el restaurante
  for (const cat of categories) {
    const catNorm = cat.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const catWords = catNorm.split(/\s+/).filter(w => w.length >= 4 && !['nuestras', 'nuestros', 'para', 'casa'].includes(w));
    for (const cw of catWords) {
      const cwRegex = new RegExp(`(?:en\\s+(?:la\\s+secci[óo]n\\s+(?:de\\s+)?)?|a\\s+(?:la\\s+secci[óo]n\\s+(?:de\\s+)?)?|secci[óo]n\\s*[:\\-]?\\s*|categor[ií]a\\s*[:\\-]?\\s*)?${cw}`, 'i');
      if (cwRegex.test(normText)) {
        return cat;
      }
    }
  }

  // 2. Mapeo semántico de términos habituales en restauración
  const categoryKeywords: Array<{ keywords: string[]; matchCategoryNames: string[] }> = [
    { keywords: ['entrante', 'entrantes', 'huerta', 'picar', 'raciones', 'ensalada', 'tapa', 'tapas', 'primero', 'primeros'], matchCategoryNames: ['entrantes', 'huerta', 'primeros', 'tapas'] },
    { keywords: ['carne', 'carnes', 'brasa', 'brasas', 'asador', 'chulet', 'ternera', 'buey', 'cordero', 'cochinillo', 'solomillo', 'costillar', 'segundo', 'segundos'], matchCategoryNames: ['carnes', 'brasa', 'asador', 'brasas', 'segundos'] },
    { keywords: ['pescado', 'pescados', 'salvaje', 'salvajes', 'marisco', 'mariscos', 'mar'], matchCategoryNames: ['pescados', 'mariscos', 'mar', 'salvajes'] },
    { keywords: ['postre', 'postres', 'dulce', 'dulces', 'tarta', 'tartas', 'helado', 'helados', 'reposteria', 'caseros', 'artesanos'], matchCategoryNames: ['postres', 'dulces', 'artesanos', 'caseros'] },
    { keywords: ['burger', 'burgers', 'hamburguesa', 'hamburguesas', 'smash'], matchCategoryNames: ['burgers', 'hamburguesas', 'smash'] },
    { keywords: ['pizza', 'pizzas', 'pasta', 'pastas', 'italiana'], matchCategoryNames: ['pizzas', 'pastas', 'italiana'] },
    { keywords: ['brunch', 'desayuno', 'desayunos', 'tosta', 'tostas', 'cafe', 'cafes', 'bowls'], matchCategoryNames: ['brunch', 'desayunos', 'tostas', 'cafes'] },
  ];

  for (const group of categoryKeywords) {
    const hasKw = group.keywords.some(kw => {
      const kwRegex = new RegExp(`\\b(?:en\\s+|a\\s+|secci[óo]n\\s+|categor[ií]a\\s+)?${kw}\\b`, 'i');
      return kwRegex.test(normText);
    });
    if (hasKw) {
      for (const catNameMatch of group.matchCategoryNames) {
        const found = categories.find(c => {
          const cNorm = c.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          return cNorm.includes(catNameMatch);
        });
        if (found) return found;
      }
    }
  }

  return null;
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
      const getUrl = `${SUPABASE_URL}/rest/v1/dishes?restaurant_id=eq.${restaurantUuid}&name=ilike.${q}&select=id,name,price,description,allergens,is_available&limit=1`;
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

async function findAllMatchingDishes(restaurantUuid: string, dishSearch: string): Promise<Array<any>> {
  const stopWords = new Set([
    'de', 'del', 'la', 'el', 'las', 'los', 'con', 'y', 'en', 'sobre', 'al', 'a', 'para',
    'nuestro', 'nuestros', 'nuestra', 'nuestras', 'casa', 'especial',
    'poner', 'pon', 'sube', 'subir', 'bajar', 'cambiar', 'cambia', 'hola', 'favor', 'porfa', 'nuevo', 'precio'
  ]);

  let words = dishSearch
    .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ ]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !stopWords.has(w.toLowerCase()));

  if (words.length === 0) {
    words = dishSearch
      .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ ]/g, ' ')
      .trim()
      .split(/\s+/)
      .filter((w) => w.length >= 3);
  }

  if (words.length === 0) return [];

  // 1. If compound search (e.g. "Solomillo Ternera") yields multiple matches
  if (words.length >= 2) {
    try {
      const compoundUrl = `${SUPABASE_URL}/rest/v1/dishes?restaurant_id=eq.${restaurantUuid}&name=ilike.*${encodeURIComponent(words[0])}*${encodeURIComponent(words[1])}*&select=id,name,price,description,allergens,is_available&limit=6`;
      const cRes = await fetch(compoundUrl, {
        headers: { apikey: SUPABASE_SECRET_KEY, Authorization: `Bearer ${SUPABASE_SECRET_KEY}` },
      });
      if (cRes.ok) {
        const cList = await cRes.json();
        if (cList && cList.length >= 2) {
          return cList;
        }
      }
    } catch {}
  }

  // 2. Primary keyword search (e.g. "Tarta", "Solomillo", "Cordero")
  const primaryWord = words[0];
  try {
    const primaryUrl = `${SUPABASE_URL}/rest/v1/dishes?restaurant_id=eq.${restaurantUuid}&name=ilike.*${encodeURIComponent(primaryWord)}*&select=id,name,price,description,allergens,is_available&limit=6`;
    const pRes = await fetch(primaryUrl, {
      headers: { apikey: SUPABASE_SECRET_KEY, Authorization: `Bearer ${SUPABASE_SECRET_KEY}` },
    });
    if (pRes.ok) {
      const pList = await pRes.json();
      if (pList && pList.length >= 2) {
        return pList;
      }
    }
  } catch {}

  return [];
}

async function downloadAndUploadTelegramPhoto(fileId: string, restaurantSlug: string): Promise<string | null> {
  try {
    const fileInfo = await apiCall('getFile', { file_id: fileId });
    if (!fileInfo.ok || !fileInfo.result?.file_path) {
      console.warn('Could not get file path for file_id:', fileId);
      return null;
    }

    const filePath = fileInfo.result.file_path;
    const directUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`;

    const imgRes = await fetch(directUrl);
    if (!imgRes.ok) return null;

    const arrayBuffer = await imgRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const storagePath = `${restaurantSlug}/${Date.now()}_${fileId.slice(-8)}.jpg`;

    const uploadRes = await fetch(`${SUPABASE_URL}/storage/v1/object/dishes/${storagePath}`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SECRET_KEY,
        'Authorization': `Bearer ${SUPABASE_SECRET_KEY}`,
        'Content-Type': 'image/jpeg',
      },
      body: buffer,
    });

    if (uploadRes.ok) {
      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/dishes/${storagePath}`;
      console.log('✅ [Supabase Storage] Photo uploaded successfully:', publicUrl);
      return publicUrl;
    }
  } catch (err: any) {
    console.warn('Exception uploading photo to Supabase:', err?.message);
  }
  return null;
}

function parseDailyMenu(text: string): { price: number; primeros: string[]; segundos: string[]; postres: string[]; includes: string } | null {
  if (!/men[úu]|primeros?|segundos?/i.test(text)) {
    return null;
  }

  const priceMatch = text.match(/(\d+[\.,]?\d*)\s*(?:€|euros?|EUR)/i) || text.match(/precio\s*[:=]?\s*(\d+[\.,]?\d*)/i);
  const price = priceMatch ? parseFloat(priceMatch[1].replace(',', '.')) : 14.50;

  const cleanText = text.replace(/[*_`]/g, '');

  const primerosMatch = cleanText.match(/(?:primeros?|1[ºoª\.]|primer\s+plato)\s*[:\-]?\s*(.+?)(?=(?:segundos?|2[ºoª\.]|segundo\s+plato|postres?|3[ºoª\.]|postre|precio|incluye|$))/i);
  const segundosMatch = cleanText.match(/(?:segundos?|2[ºoª\.]|segundo\s+plato)\s*[:\-]?\s*(.+?)(?=(?:postres?|3[ºoª\.]|postre|precio|incluye|\d+[\.,]?\d*\s*(?:€|euros?)|$))/i);
  const postresMatch = cleanText.match(/(?:postres?|3[ºoª\.]|postre)\s*[:\-]?\s*(.+?)(?=(?:precio|incluye|pan|\d+[\.,]?\d*\s*(?:€|euros?)|$))/i);
  const includesMatch = cleanText.match(/(?:incluye|con)\s*[:\-]?\s*([^,\n\r.]+?(?:vino|bebida|agua|pan|postre|caf[ée])[^\n\r.]*)/i) || cleanText.match(/incluye\s*[:\-]?\s*([^\n\r.]+)/i);

  const splitItems = (str: string | undefined) => {
    if (!str) return [];
    return str
      .split(/\s+(?:o|y|e)\s+|\s*[,;•\n\r]\s*/i)
      .map(s => s.trim())
      .filter(s => s.length >= 3 && !/^(?:primeros?|segundos?|postres?|incluye|precio|1[ºoª\.]|2[ºoª\.]|3[ºoª\.])$/i.test(s));
  };

  const primeros = splitItems(primerosMatch?.[1]);
  const segundos = splitItems(segundosMatch?.[1]);
  const postres = splitItems(postresMatch?.[1]);
  const includes = includesMatch?.[1]?.trim() || 'Pan, bebida y postre o café';

  if (primeros.length > 0 || segundos.length > 0) {
    return {
      price,
      primeros: primeros.length > 0 ? primeros : ['Plato de cuchara o ensalada'],
      segundos: segundos.length > 0 ? segundos : ['Carne a la brasa o pescado fresco'],
      postres: postres.length > 0 ? postres : ['Postre casero o café'],
      includes,
    };
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
            } else {
              const matchCat = detectCategoryFromText((updates as any).category_name, cats);
              if (matchCat) {
                categoryId = matchCat.id;
              }
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
  const prefixRegex = /^(?:hola(?:\s+[a-záéíóúñ]+)?|buenas|oye|por\s+favor|porfa|quiero\s+que\s+pongas|pon(?:er)?|sub(?:e|ir)|baj(?:a|ar)|cambi(?:a|ar)(?:\s+el\s+precio\s+(?:de\s+|del\s+|de\s+la\s+)?)?|pas(?:a|ar)|añad(?:e|ir)(?:\s+nuevo\s+plato)?|crea(?:r)?(?:\s+nuevo\s+plato)?|marcar(?:\s+como)?|nuevo\s+plato|plato\s+nuevo|plato|precio\s+de|precio\s+del|precio|ya\s+no\s+(?:nos\s+)?quedan?|no\s+(?:nos\s+)?quedan?|no\s+(?:nos\s+)?quedan?\s+nada\s+de|se\s+(?:nos\s+)?ha\s+(?:terminado|acabado|agotado)|hemos\s+(?:terminado|acabado|agotado|vendido\s+tod[ao]s?)|ya\s+no\s+hay|no\s+hay|no\s+tenemos|desactivar|quitar|eliminar|agotad[oa]s?|disponibles?|repuest[oa]s?|fuera\s+de\s+carta(?:\s+en|\s+a)?|en\s+(?:la\s+secci[óo]n\s+(?:de\s+)?)?[a-záéíóúñ\s]+:|a\s+(?:la\s+secci[óo]n\s+(?:de\s+)?)?[a-záéíóúñ\s]+:|del|de\s+la|de\s+los|de\s+las|de|el|la|los|las|un|una|unos|unas)[\s,:\-]+/i;
  
  while (prefixRegex.test(name)) {
    name = name.replace(prefixRegex, '').trim();
  }
  
  // 2. Strip section prefixes like "Entrantes: ", "Postres: ", "Carnes: "
  name = name.replace(/^(?:entrantes?|carnes?|pescados?|postres?|bebidas?|principales?|primeros?|segundos?|ensaladas?|raciones?|burgers?|pizzas?|pastas?|brunch|caf[ée]s?)[\s,:\-]+/i, '').trim();

  // 3. Strip trailing context words (e.g. ": Marcar Agotado", "como agotada hoy", "para el fin de semana", etc.)
  const suffixRegex = /(?:[\s,:\-]+(?:(?:como\s+)?(?:agotad[oa]s?|disponibles?)(?:\s+(?:hoy|mañana|esta\s+noche|para\s+el\s+servicio))?|marcar\s+(?:como\s+)?(?:agotad[oa]s?|disponibles?)|para\s+(?:el\s+)?(?:servicio|fin\s+de\s+semana|hoy|mañana|este\s+fin\s+de\s+semana).*|de\s+la\s+carta|en\s+carta|por\s+ración|la\s+ración|en\s+el\s+menú|del\s+menú|por\s+favor|gracias|hoy|mañana|esta\s+noche|agotad[oa]s?|sin\s+stock|terminad[oa]s?|acabad[oa]s?))$/i;
  while (suffixRegex.test(name)) {
    name = name.replace(suffixRegex, '').trim();
  }

  // 4. Remove trailing standalone modifier words
  name = name.replace(/\s+(?:agotad[oa]s?|disponibles?|repuest[oa]s?|activad[oa]s?|hoy|mañana|sin\s+stock)$/i, '').trim();

  // 5. Remove leading articles and prepositions again if any remain
  name = name.replace(/^(?:el|la|los|las|un|una|unos|unas|del|de\s+la|de\s+los|de\s+las|de)\s+/i, '').trim();

  // 6. Filter isolated non-dish generic words
  const lowerName = name.toLowerCase();
  const genericNonDishes = ['carne', 'carnes', 'pescado', 'pescados', 'comida', 'bebida', 'bebidas', 'stock', 'género', 'genero', 'producto', 'productos', 'mesa', 'cuenta', 'servicio'];
  if (genericNonDishes.includes(lowerName)) {
    return '';
  }

  // 7. Capitalize first letter properly
  if (name.length > 0) {
    name = name.charAt(0).toUpperCase() + name.slice(1);
  }

  return name;
}

function extractChangesFromMessage(text: string): Array<{ dishName: string; updates: { price?: number; isAvailable?: boolean; photo_url?: string; description?: string; allergens?: string[]; category_id?: string; category_name?: string } }> {
  const changes: Array<{ dishName: string; updates: { price?: number; isAvailable?: boolean; photo_url?: string; description?: string; allergens?: string[]; category_id?: string; category_name?: string } }> = [];

  // Check if it's a rich new dish ticket card
  const platoMatch = text.match(/[•\s]*🍽️\s*\*?(?:Nombre|Plato)\*?:\*?\s*([^\n\r]+)/i);
  const descMatch = text.match(/[•\s]*📝\s*\*?Descripci[óo]n\*?:\*?\s*([^\n\r]+)/i);
  const alergMatch = text.match(/[•\s]*🏷️\s*\*?Al[ée]rgenos\*?:\*?\s*([^\n\r]+)/i);
  const newPriceMatch = text.match(/[•\s]*💰\s*\*?Precio\*?:\*?\s*([\d\.,]+)\s*€/i);
  const sectionMatch = text.match(/[•\s]*📂\s*\*?Secci[óo]n\*?:\*?\s*([^\n\r]+)/i);

  if (platoMatch) {
    let rawDish = platoMatch[1].replace(/[*_`]/g, '').trim();
    const priceFromDishMatch = rawDish.match(/\(([\d\.,]+)\s*€\)/);
    const priceStr = priceFromDishMatch ? priceFromDishMatch[1] : (newPriceMatch ? newPriceMatch[1] : null);
    rawDish = rawDish.replace(/\([\d\.,]+\s*€\)/, '').trim();
    const dishName = cleanDishName(rawDish);

    const priceVal = priceStr ? parseFloat(priceStr.replace(',', '.')) : undefined;
    const desc = descMatch ? cleanDescription(descMatch[1]) : undefined;
    const allergens = alergMatch ? parseAllergens(alergMatch[1]) : undefined;
    const categoryName = sectionMatch ? sectionMatch[1].replace(/[*_`]/g, '').trim() : undefined;

    if (dishName && (priceVal !== undefined || desc || allergens || categoryName)) {
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
    if (line.includes('💰') && !line.includes('Precio Actual') && !line.includes('Pagar')) {
      const stripped = line.replace(/[*_`•💰]/g, '').trim();
      const m = stripped.match(/^([^:\n]+?)\s*:\s*(\d+[\.,]?\d*)\s*(?:€|euros?|EUR)/i);
      if (m) {
        const dish = cleanDishName(m[1]);
        const price = parseFloat(m[2].replace(',', '.'));
        if (dish && !isNaN(price)) {
          changes.push({ dishName: dish, updates: { price } });
          continue;
        }
      }
    }

    if (line.includes('🚫')) {
      const stripped = line.replace(/[*_`•🚫]/g, '').trim();
      const m = stripped.match(/^([^:\n]+?)\s*:\s*(?:Marcar\s+)?Agotad/i) ||
                stripped.match(/^([^:\n]+?)\s+Agotad/i);
      if (m) {
        const dish = cleanDishName(m[1]);
        if (dish) {
          changes.push({ dishName: dish, updates: { isAvailable: false } });
          continue;
        }
      }
    }

    if (line.includes('✅') && !line.includes('Oficial') && !line.includes('ESTADO') && !line.includes('Sincronizado')) {
      const stripped = line.replace(/[*_`•✅]/g, '').trim();
      const m = stripped.match(/^([^:\n]+?)\s*:\s*(?:Marcar\s+)?Disponible/i) ||
                stripped.match(/^([^:\n]+?)\s+Disponible/i);
      if (m) {
        const dish = cleanDishName(m[1]);
        if (dish) {
          changes.push({ dishName: dish, updates: { isAvailable: true } });
          continue;
        }
      }
    }

    // 2. Conversational clauses in raw message text
    const clauses = line.split(/(?:\s+(?:y|e|además|tambien|también)\s+|\s*[,;]\s*)/i);
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
        clause.match(/(?:^|\s*)(?:ya\s+no\s+(?:nos\s+)?quedan?|no\s+(?:nos\s+)?quedan?(?:\s+nada\s+de)?|se\s+(?:nos\s+)?ha\s+(?:terminado|acabado|agotado)|hemos\s+(?:terminado|acabado|agotado|vendido\s+tod[ao]s?)|ya\s+no\s+hay|no\s+hay|no\s+tenemos|sin\s+stock\s+de|quitar|desactivar|marcar\s+(?:como\s+)?agotad[oa]|agotad[oa]s?)\s+(?:de\s+|el\s+|la\s+|los\s+|las\s+|nuestr[ao]s?\s+)?([a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-&]+)/i) ||
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
        clause.match(/(?:^|\s*)(?:ya\s+(?:nos\s+)?ha\s+llegado|volvemos\s+a\s+tener|ya\s+tenemos|vuelve\s+a\s+haber|hemos\s+repuesto|activar|reponer|marcar\s+(?:como\s+)?disponible|disponibles?)\s+(?:de\s+|el\s+|la\s+|los\s+|las\s+|nuestr[ao]s?\s+)?([a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-&]+)/i) ||
        clause.match(/([a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-&]+?)\s+(?:como\s+)?(?:disponible|disponibles|activad[oa]|repuest[oa]|de\s+vuelta)/i);

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
  if (/cartel.*cerrad|cerrad[oa]s?|cerrar|cerramos|cierre|vacaciones|descanso|cerrar hoy|estamos cerrad|bajar.*persiana|bajamos.*persiana|no abrimos|hoy no abrimos|cerrar el local|cerrar el restaurante/i.test(lower)) {
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

      // --- DESAMBIGUACIÓN DE PLATO POR BOTÓN HOSTELERO ---
      if (data.startsWith('amb_')) {
        const parts = data.split('_');
        const dishId = parts[1];
        const action = parts[2]; // 'p', 'out', 'in'
        const val = parts[3]; // price if action === 'p'

        await answerCallbackQuery(callback.id, '✅ Plato seleccionado');

        const fromChatId = String(callback.message?.chat?.id || ADMIN_CHAT_ID);
        const messageId = callback.message?.message_id;

        const dishRes = await fetch(`${SUPABASE_URL}/rest/v1/dishes?id=eq.${dishId}&select=id,name,price,restaurant_id`, {
          headers: { apikey: SUPABASE_SECRET_KEY, Authorization: `Bearer ${SUPABASE_SECRET_KEY}` },
        });
        const dishData = await dishRes.json();
        const selectedDish = dishData?.[0];

        if (selectedDish) {
          const ticketId = `TCK-${Math.floor(1000 + Math.random() * 9000)}`;
          let actionLabel = 'Modificación de Carta';
          let changesSummary = '';

          if (action === 'p' && val) {
            const newPrice = parseFloat(val);
            actionLabel = 'Cambio de Precio';
            changesSummary = `• 💰 *${selectedDish.name}:* ${newPrice.toFixed(2)} € (Precio anterior: ${Number(selectedDish.price).toFixed(2)} €)`;
          } else if (action === 'out') {
            actionLabel = 'Disponibilidad de Plato';
            changesSummary = `• 🚫 *${selectedDish.name}:* Marcar Agotado`;
          } else {
            actionLabel = 'Disponibilidad de Plato';
            changesSummary = `• ✅ *${selectedDish.name}:* Marcar Disponible`;
          }

          if (messageId) {
            await editMessageText(
              fromChatId,
              messageId,
              `✅ *Plato confirmado:* *${selectedDish.name}*\n\n${changesSummary}\n\n⏳ Solicitud enviada al Superadmin (#${ticketId}).`
            );
          } else {
            await sendMessage(
              fromChatId,
              `✅ *Plato confirmado:* *${selectedDish.name}*\n\n${changesSummary}\n\n⏳ Solicitud enviada al Superadmin (#${ticketId}).`
            );
          }

          const adminNotificationText = 
`🎫 *TICKET CLOUD #${ticketId} — Asador Los Jarales*
━━━━━━━━━━━━━━━━━━━━
🏠 *Restaurante:* Asador Los Jarales (✅ *Oficial*)
👤 *Hostelero:* ${callback.from?.first_name || 'Hostelero'} (ID: \`${fromChatId}\`)
🔄 *Categoría:* ${actionLabel}
💬 *Mensaje:*
_Plato seleccionado tras desambiguación: ${selectedDish.name}_

🤖 *Cambios detectados:*
• 🔄 *Tipo:* ${actionLabel}
${changesSummary}
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
          return NextResponse.json({ ok: true, status: 'disambiguated_ticket_created', ticketId });
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

        const phoneMatch = messageText.match(/(?:tel[ée]fono|tlf|contacto|reservas)[^0-9+]*?([+\d\s]{9,15})/i);
        if (phoneMatch) {
          restUpdates.phone = phoneMatch[1].replace(/\s+/g, ' ').trim();
        }
        const whatsappMatch = messageText.match(/(?:whatsapp|wasap|wsp)[^0-9+]*?([+\d\s]{9,15})/i);
        if (whatsappMatch) {
          restUpdates.whatsapp = whatsappMatch[1].replace(/\s+/g, ' ').trim();
        }

        const taglineMatch = messageText.match(/(?:eslogan|tagline|lema|subt[ií]tulo)[\s:]*["“]?([^"\n\r]{5,100})["”]?/i);
        if (taglineMatch) {
          let tag = taglineMatch[1].trim();
          tag = tag.replace(/^(?:a|en)\b\s*[:\-]?\s*/i, '').trim();
          restUpdates.tagline = tag;
        }

        const aforoMatch = messageText.match(/(?:aforo|capacidad|plazas|comensales)[^0-9]*?(\d+)/i);
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

        // Si el ticket incluye Menú del Día, actualizar opening_hours.daily_menu
        const dailyMenuParsed = parseDailyMenu(messageText);
        if (dailyMenuParsed) {
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

          await applyRestaurantChangeToSupabase(restaurantUuid, {
            opening_hours: {
              ...existingHours,
              daily_menu: {
                date: new Date().toISOString().split('T')[0],
                price: dailyMenuParsed.price,
                primeros: dailyMenuParsed.primeros,
                segundos: dailyMenuParsed.segundos,
                postres: dailyMenuParsed.postres,
                includes: dailyMenuParsed.includes,
              },
            },
          });
          restaurantSignUpdated = true;
          signStatusLabel = signStatusLabel ? `${signStatusLabel} • Menú del día publicado` : '🍴 Menú del día publicado';
          console.log(`🍴 [Supabase Cloud] Menú del día actualizado para ${restaurantUuid}`);
        }

        // Si el ticket incluye URL de foto de plato
        const photoUrlMatch = messageText.match(/https:\/\/[^\s\n\r"']+\/storage\/v1\/object\/public\/dishes\/[^\s\n\r"']+/i);
        if (photoUrlMatch) {
          const photoUrl = photoUrlMatch[0];
          const dishMatch = messageText.match(/• 🍽️ \*Plato:\* \*([^*]+)\*/i) || messageText.match(/• 📸 \*Plato:\* \*([^*]+)\*/i);
          if (dishMatch) {
            const dName = dishMatch[1].trim();
            const photoApplied = await applyDishChangeToSupabase(restaurantUuid, dName, { photo_url: photoUrl });
            if (photoApplied.success) {
              restaurantSignUpdated = true;
              signStatusLabel = signStatusLabel ? `${signStatusLabel} • Foto de ${dName} actualizada` : `📸 Foto de ${dName} actualizada`;
              console.log(`📸 [Supabase Cloud] Photo URL applied to dish ${dName}: ${photoUrl}`);
            }
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

      // GESTIÓN DE FOTOGRAFÍAS DE PLATOS (Compresión y almacenamiento optimizado en Supabase Storage)
      if (msg.photo && Array.isArray(msg.photo) && msg.photo.length > 0) {
        // Seleccionamos resolución balanceada (~800px / <150KB) para optimizar almacenamiento y velocidad web
        const bestPhoto = msg.photo[Math.min(msg.photo.length - 1, 2)];
        const photoUrl = await downloadAndUploadTelegramPhoto(bestPhoto.file_id, binding.restaurantSlug);

        const caption = (msg.caption || text || '').trim();
        let matchedDishName = cleanDishName(caption.replace(/(?:foto|plato|para|de|del|imagen)\s*/gi, '').trim());

        if (matchedDishName) {
          const existing = await findExistingDish(restaurantUuid, matchedDishName);
          if (existing) {
            matchedDishName = existing.name;
          }
        }

        if (!matchedDishName && caption.length > 2) {
          matchedDishName = caption;
        }

        if (matchedDishName && photoUrl) {
          const ticketId = `TCK-${Math.floor(1000 + Math.random() * 9000)}`;
          const summary = `• 📸 *Tipo:* Fotografía de Plato\n• 🍽️ *Plato:* *${matchedDishName}*\n• 🖼️ *Foto:* [Ver Imagen](${photoUrl})\n• 🔗 *URL:* ${photoUrl}`;

          await sendMessage(
            chatId,
            `📸 *¡Fotografía procesada y optimizada con éxito!*\n\n🍽️ *Plato:* *${matchedDishName}*\n\n⏳ Solicitud enviada al Superadmin para publicar la foto en tu carta digital (#${ticketId}).`
          );

          const adminNotificationText = 
`🎫 *TICKET CLOUD #${ticketId} — ${binding.restaurantName}*
━━━━━━━━━━━━━━━━━━━━
🏠 *Restaurante:* ${binding.restaurantName} (✅ *Oficial*)
👤 *Hostelero:* ${username} (ID: \`${chatId}\`)
📸 *Categoría:* Foto de Plato
💬 *Pie de foto:*
_${caption || '[Sin texto]'}_

🤖 *Detalles de la Foto:*
${summary.trim()}
━━━━━━━━━━━━━━━━━━━━
☁️ *Servidor:* Vercel Serverless (0€ / 24h)`;

          const keyboard = {
            inline_keyboard: [
              [
                { text: '✅ Aprobar y Publicar Foto', callback_data: `app_${ticketId}` },
                { text: '❌ Rechazar Solicitud', callback_data: `rej_${ticketId}` },
              ],
            ],
          };

          await sendMessage(ADMIN_CHAT_ID, adminNotificationText, keyboard);
          return NextResponse.json({ ok: true, status: 'photo_ticket_created', photoUrl, ticketId, dish: matchedDishName });
        } else if (photoUrl) {
          await sendMessage(
            chatId,
            `📸 *¡Foto recibida y optimizada correctamente en la nube!*\n\n¿A qué plato de tu carta deseas asignarla? Responde escribiendo el nombre del plato (ej: _"Foto para Chuletón de Vaca"_).`
          );
          return NextResponse.json({ ok: true, status: 'photo_uploaded_awaiting_dish', photoUrl });
        }
      }

      // Si el mensaje es un comando explícito o una petición clara, no atrapar en un wizard previo
      const isExplicitNewCommand = 
        text.startsWith('/') ||
        detectAddDishWithoutPrice(text) !== null ||
        parseDailyMenu(text) !== null ||
        /^(?:sube|subir|baja|bajar|cambia|cambiar|poner|pon|marcar|quitar|cerrar|abrir|cerramos|abrimos|reabrimos)\b/i.test(text) ||
        /^(?:¿\s*)?(?:cu[aá]l\s+es|cu[aá]nto\s+vale|a\s+cu[aá]nto|horario|visitas|m[eé]tricas)/i.test(text);

      if (isExplicitNewCommand) {
        await clearPendingDishWizard(chatId);
      }

      // 1. GESTIÓN DE WIZARD ACTIVO (El hostelero está respondiendo precio, sección, descripción o alérgenos de un nuevo plato)
      const pendingWizard = isExplicitNewCommand ? null : await getPendingDishWizard(chatId);
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

      // Menú del Día: Detección y creación de Ticket de Menú Diario
      const dailyMenu = parseDailyMenu(text);
      if (dailyMenu && !text.startsWith('/menudeldia') && !/(?:cu[aá]l\s+es|qu[eé]\s+hay|qu[eé]\s+tenemos|consultar|ver)/i.test(text)) {
        const ticketId = `TCK-${Math.floor(1000 + Math.random() * 9000)}`;
        const summary = 
`• 🍴 *Tipo:* Menú del Día Diario
• 💰 *Precio:* ${dailyMenu.price.toFixed(2)} €
• 🥗 *Primeros:* ${dailyMenu.primeros.join(', ')}
• 🥩 *Segundos:* ${dailyMenu.segundos.join(', ')}
• 🍮 *Postres:* ${dailyMenu.postres.join(', ')}
• 🍷 *Incluye:* ${dailyMenu.includes}`;

        await sendMessage(
          chatId,
          `🍴 *¡Menú del día recibido y formateado!* (#${ticketId})\n\n💰 *Precio:* ${dailyMenu.price.toFixed(2)} €\n🥗 *Primeros:* ${dailyMenu.primeros.join(', ')}\n🥩 *Segundos:* ${dailyMenu.segundos.join(', ')}\n🍮 *Postres:* ${dailyMenu.postres.join(', ')}\n🍷 *Incluye:* ${dailyMenu.includes}\n\n⏳ Solicitud enviada al Superadmin para publicar en vivo en tu carta digital.`
        );

        const adminNotificationText = 
`🎫 *TICKET CLOUD #${ticketId} — ${binding.restaurantName}*
━━━━━━━━━━━━━━━━━━━━
🏠 *Restaurante:* ${binding.restaurantName} (✅ *Oficial*)
👤 *Hostelero:* ${username} (ID: \`${chatId}\`)
🍴 *Categoría:* Menú del Día Diario
💬 *Mensaje:*
_${text}_

🤖 *Estructura del Menú:*
${summary.trim()}
━━━━━━━━━━━━━━━━━━━━
☁️ *Servidor:* Vercel Serverless (0€ / 24h)`;

        const keyboard = {
          inline_keyboard: [
            [
              { text: '✅ Aprobar y Publicar Menú', callback_data: `app_${ticketId}` },
              { text: '❌ Rechazar Solicitud', callback_data: `rej_${ticketId}` },
            ],
          ],
        };

        await sendMessage(ADMIN_CHAT_ID, adminNotificationText, keyboard);
        return NextResponse.json({ ok: true, status: 'daily_menu_ticket_created', ticketId, dailyMenu });
      }

      // Consulta de Menú del Día (/menudeldia, "¿cuál es el menú del día?", "¿cuál es el menú de hoy?", "¿qué tenemos de menú?", "ver menú del día", etc.)
      if (text.startsWith('/menudeldia') || /^(?:¿\s*)?(?:cu[aá]l\s+es\s+el\s+men[úu]|qu[eé]\s+(?:hay|tenemos)\s+de\s+men[úu]|men[úu]\s+(?:del\s+d[ií]a|de\s+hoy|diario)|ver\s+men[úu]|consultar\s+men[úu]|men[úu])(?:\s+[a-záéíóúñ\s]+)?(?:\s*\?)?$/i.test(text)) {
        try {
          const restRes = await fetch(`${SUPABASE_URL}/rest/v1/restaurants?id=eq.${restaurantUuid}&select=name,opening_hours`, {
            headers: { 'apikey': SUPABASE_SECRET_KEY, 'Authorization': `Bearer ${SUPABASE_SECRET_KEY}` },
          });
          if (restRes.ok) {
            const rData = await restRes.json();
            const dm = rData?.[0]?.opening_hours?.daily_menu;
            if (dm && dm.primeros && dm.primeros.length > 0) {
              let dmText = `🍴 *MENÚ DEL DÍA — ${binding.restaurantName.toUpperCase()}*\n━━━━━━━━━━━━━━━━━━━━\n💶 *Precio:* *${Number(dm.price).toFixed(2)} €*\n\n`;
              dmText += `🥗 *Primeros:* ${Array.isArray(dm.primeros) ? dm.primeros.join(', ') : dm.primeros}\n`;
              dmText += `🥩 *Segundos:* ${Array.isArray(dm.segundos) ? dm.segundos.join(', ') : dm.segundos}\n`;
              dmText += `🍮 *Postres:* ${Array.isArray(dm.postres) ? dm.postres.join(', ') : dm.postres}\n`;
              dmText += `🍷 *Incluye:* ${dm.includes || 'Pan, bebida y postre'}\n`;
              dmText += `\n💡 _Para actualizarlo, escribe: "Menú de hoy: primeros ..., segundos ..., postre ..., 14.50€"_`;
              await sendMessage(chatId, dmText);
              return NextResponse.json({ ok: true, query: 'daily_menu', daily_menu: dm });
            } else {
              await sendMessage(
                chatId,
                `🍴 *Menú del Día de ${binding.restaurantName}:*\n\nActualmente no hay ningún menú del día cargado para hoy.\n\n💡 *Para publicarlo:* Escribe _"Menú de hoy: primeros sopa y ensalada, segundos entrecot y salmón, postre tarta, 14.50€"_`
              );
              return NextResponse.json({ ok: true, query: 'daily_menu_empty' });
            }
          }
        } catch (e) {
          console.warn('Error fetching daily menu:', e);
        }
      }

      // Comando /carta: Listar carta actual para el hostelero
      if (text.startsWith('/carta') || text.toLowerCase() === 'carta' || text.toLowerCase() === 'ver carta') {
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
            return NextResponse.json({ ok: true, query: 'carta' });
          }
        } catch (e) {
          console.warn('Error fetching dishes for /carta:', e);
        }
      }

      // Consultas de Precio (ej: "¿Cuánto vale el chuletón?", "¿A cuánto están las croquetas?", "¿Qué precio tienen?")
      const priceQueryMatch = text.match(/^(?:¿\s*)?(?:a\s+cu[aá]nto\s+(?:est[aá]n?|tenemos|tienen?|vale[n]?|sale[n]?)|cu[aá]nto\s+(?:vale[n]?|cuesta[n]?|sale[n]?|est[aá]n?|tenemos|tienen?)|precio\s+(?:de\s+|del\s+|de\s+la\s+|de\s+los\s+|de\s+las\s+)?|qu[eé]\s+precio\s+tienen?)\s+([a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-&]+?)(?:\s*\?)?$/i);
      if (priceQueryMatch && !/\d+[\.,]?\d*\s*(?:€|euros?|EUR)/i.test(text)) {
        const dishSearch = cleanDishName(priceQueryMatch[1]);
        if (dishSearch) {
          const found = await findExistingDish(restaurantUuid, dishSearch);
          if (found) {
            const statusLabel = found.is_available !== false ? '✅ Disponible' : '🚫 Agotado temporalmente';
            await sendMessage(
              chatId,
              `💰 *Precio Actual en tu Carta Digital:*\n━━━━━━━━━━━━━━━━━━━━\n🍽️ *Plato:* *${found.name}*\n💶 *Precio:* *${Number(found.price).toFixed(2)} €*\n📊 *Estado:* ${statusLabel}\n\n💡 _Para cambiarlo, solo escribe: "Poner ${found.name} a [nuevo precio]€"_`
            );
            return NextResponse.json({ ok: true, query: 'dish_price', dish: found.name, price: found.price });
          } else {
            await sendMessage(
              chatId,
              `🔍 No he encontrado ningún plato llamado *"${dishSearch}"* en la carta de *${binding.restaurantName}*.\n\nEscribe \`/carta\` para ver todos tus platos disponibles o _"Añadir ${dishSearch} a [precio]€"_ para crearlo.`
            );
            return NextResponse.json({ ok: true, query: 'dish_not_found' });
          }
        }
      }

      // Consultas de Horario (ej: "¿A qué hora cerramos hoy?", "¿Cuál es nuestro horario?", "horario")
      if (/(?:a\s+qu[eé]\s+hora|cu[aá]l\s+es\s+nuestro\s+horario|qu[eé]\s+horario|horarios?|cuando\s+abrimos|cuando\s+cerramos)/i.test(text) && !/(?:nuevo\s+horario|cambia.*horario|cambiar.*horario)/i.test(text)) {
        try {
          const restRes = await fetch(`${SUPABASE_URL}/rest/v1/restaurants?id=eq.${restaurantUuid}&select=name,opening_hours`, {
            headers: { 'apikey': SUPABASE_SECRET_KEY, 'Authorization': `Bearer ${SUPABASE_SECRET_KEY}` },
          });
          if (restRes.ok) {
            const rData = await restRes.json();
            const rest = rData?.[0];
            const hours = rest?.opening_hours || {};
            const isClosed = hours?.isTemporarilyClosed;
            const statusSign = isClosed ? '🚨 *CERRADO TEMPORALMENTE*' : '🟢 *ABIERTO AL PÚBLICO*';
            
            let hoursText = `🕐 *HORARIOS Y ESTADO DEL LOCAL:*\n━━━━━━━━━━━━━━━━━━━━\n🏠 *Restaurante:* *${binding.restaurantName}*\nCartel web: ${statusSign}\n\n`;
            if (hours && typeof hours === 'object' && !Array.isArray(hours)) {
              for (const [day, h] of Object.entries(hours)) {
                if (day !== 'isTemporarilyClosed' && day !== 'closedReason') {
                  const dayName = day.charAt(0).toUpperCase() + day.slice(1);
                  hoursText += `• *${dayName}:* ${h}\n`;
                }
              }
            } else {
              hoursText += `• *Servicio:* Mar-Dom: 13:00 - 16:30 | 20:30 - 23:30 (Lunes cerrado)\n`;
            }
            hoursText += `\n💡 _Para cambiar el horario, escribe: "Nuevo horario: Mar a Dom de 13:00 a 16:30"_`;
            await sendMessage(chatId, hoursText);
            return NextResponse.json({ ok: true, query: 'schedule' });
          }
        } catch (e) {
          console.warn('Error fetching schedule:', e);
        }
      }

      // Consultas de Contacto (ej: "¿Qué teléfono tenemos puesto?", "nuestro whatsapp", "contacto")
      const normContactText = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (/(?:telefono|whatsapp|contacto|datos\s+del\s+local|direccion|ubicacion|eslogan)/i.test(normContactText) && !/(?:nuevo|cambia|actualiza|poner|modificar|\d{3}\s*\d{2,3})/i.test(normContactText)) {
        try {
          const restRes = await fetch(`${SUPABASE_URL}/rest/v1/restaurants?id=eq.${restaurantUuid}&select=name,phone,whatsapp,address,tagline`, {
            headers: { 'apikey': SUPABASE_SECRET_KEY, 'Authorization': `Bearer ${SUPABASE_SECRET_KEY}` },
          });
          if (restRes.ok) {
            const rData = await restRes.json();
            const rest = rData?.[0];
            let contactText = `📞 *INFORMACIÓN DE CONTACTO DE ${binding.restaurantName.toUpperCase()}:*\n━━━━━━━━━━━━━━━━━━━━\n`;
            contactText += `• 📞 *Teléfono:* ${rest?.phone || 'No configurado'}\n`;
            contactText += `• 💬 *WhatsApp:* ${rest?.whatsapp || 'No configurado'}\n`;
            contactText += `• 📍 *Dirección:* ${rest?.address || 'Torrelodones, Madrid'}\n`;
            if (rest?.tagline) contactText += `• 📝 *Eslogan:* _"${rest.tagline}"_\n`;
            contactText += `\n💡 _Para actualizar cualquier dato, escribe: "Nuevo teléfono: 918 59 00 00"_`;
            await sendMessage(chatId, contactText);
            return NextResponse.json({ ok: true, query: 'contact_info' });
          }
        } catch (e) {
          console.warn('Error fetching contact info:', e);
        }
      }

      // Consultas de Métricas para el Hostelero (/metricas, /stats, "métricas", "¿cuántas visitas llevamos?")
      if (text.startsWith('/metricas') || text.startsWith('/stats') || /visitas|m[eé]tricas|estad[ií]sticas/i.test(text)) {
        try {
          const eventsRes = await fetch(`${SUPABASE_URL}/rest/v1/analytics_events?restaurant_id=eq.${restaurantUuid}&select=event_type,created_at&limit=300`, {
            headers: { 'apikey': SUPABASE_SECRET_KEY, 'Authorization': `Bearer ${SUPABASE_SECRET_KEY}` },
          });
          let qrScans = 0;
          let webViews = 0;
          let whatsappClicks = 0;
          let callClicks = 0;
          let mapsClicks = 0;

          if (eventsRes.ok) {
            const evs = await eventsRes.json();
            for (const ev of evs) {
              if (ev.event_type === 'qr_scan') qrScans++;
              else if (ev.event_type === 'page_view') webViews++;
              else if (ev.event_type === 'whatsapp_click') whatsappClicks++;
              else if (ev.event_type === 'call_click') callClicks++;
              else if (ev.event_type === 'map_click') mapsClicks++;
            }
          }

          const totalVisits = qrScans + webViews;
          let statsText = `📊 *MÉTRICAS EN VIVO DE ${binding.restaurantName.toUpperCase()}:*\n━━━━━━━━━━━━━━━━━━━━\n`;
          statsText += `• 📲 *Escaneos de QR en Mesa:* *${qrScans}*\n`;
          statsText += `• 🌐 *Visitas Web a la Carta:* *${webViews}*\n`;
          statsText += `• 💬 *Clics a tu WhatsApp:* *${whatsappClicks}*\n`;
          statsText += `• 📞 *Clics a Llamada de Reserva:* *${callClicks}*\n`;
          statsText += `• 🗺️ *Clics a "Cómo Llegar":* *${mapsClicks}*\n`;
          statsText += `\n⚡ _Datos sincronizados en tiempo real con Supabase Cloud._\n🔗 *Ver panel completo:* https://gastrotorre.vercel.app/admin`;
          
          await sendMessage(chatId, statsText);
          return NextResponse.json({ ok: true, query: 'metrics', totalVisits });
        } catch (e) {
          console.warn('Error fetching metrics for hostelero:', e);
        }
      }

      const ticketId = `TCK-${Math.floor(1000 + Math.random() * 9000)}`;
      const ticketType = classifyTicketType(text);
      const detected = extractChangesFromMessage(text);

      // Desambiguación Interactiva para Platos Similares (Fuzzy Disambiguation)
      if (detected.length === 1 && !/añad|crea|agreg|meter|incluy|nuevo\s+plato/i.test(text)) {
        const singleItem = detected[0];
        const matches = await findAllMatchingDishes(restaurantUuid, singleItem.dishName);
        if (matches.length >= 2) {
          const exact = matches.find(m => m.name.toLowerCase().trim() === singleItem.dishName.toLowerCase().trim());
          if (!exact) {
            const actionType = singleItem.updates.price !== undefined ? 'p' : (singleItem.updates.isAvailable === false ? 'out' : 'in');
            const paramVal = singleItem.updates.price !== undefined ? singleItem.updates.price : '';
            
            const buttons = matches.slice(0, 4).map(m => [
              {
                text: `🍽️ ${m.name} (${Number(m.price).toFixed(2)} €)`,
                callback_data: `amb_${m.id}_${actionType}_${paramVal}`,
              }
            ]);

            await sendMessage(
              chatId,
              `🔍 *Hemos encontrado varios platos similares a "${singleItem.dishName}":*\n\n¿A cuál de ellos te refieres? Toca una opción:`,
              { inline_keyboard: buttons }
            );
            return NextResponse.json({ ok: true, status: 'disambiguation_prompt_sent', matches: matches.map(m => m.name) });
          }
        }
      }

      // 2. DETECCIÓN PROACTIVA DE NUEVO PLATO NO EXISTENTE EN CARTA
      // Si el hostelero pide añadir un plato que NO está en su menú, comprobar sección, descripción y alérgenos
      if (detected.length > 0) {
        const categories = await getRestaurantCategories(restaurantUuid);
        for (const item of detected) {
          if (item.updates.price !== undefined) {
            const existingDish = await findExistingDish(restaurantUuid, item.dishName);
            if (!existingDish) {
              // Es un plato nuevo
              const detectedCat = detectCategoryFromText(text, categories);
              if (detectedCat) {
                item.updates.category_id = detectedCat.id;
                item.updates.category_name = detectedCat.name;
              }

              const hasExplicitDetails = /al[ée]rgenos?|alergias?|ingredientes?|descripci[óo]n|con base de|elaborad[oa]|preparad[oa]|lleva|contiene/i.test(text) || text.length >= 70;
              
              if (!detectedCat && !hasExplicitDetails) {
                // Activar wizard pidiendo sección primero con botones interactivos
                await sendCategorySelectionPrompt(chatId, binding.restaurantSlug, item.dishName, item.updates.price);
                return NextResponse.json({ ok: true, status: 'awaiting_category' });
              } else {
                // Ya incluyó los detalles o categoría en el mismo mensaje
                item.updates.description = cleanDescription(text) || 'Especialidad de la casa elaborada con ingredientes seleccionados.';
                item.updates.allergens = parseAllergens(text);
                if (!item.updates.category_name && categories.length > 0) {
                  item.updates.category_name = categories[0].name;
                  item.updates.category_id = categories[0].id;
                }
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
          if (item.updates.description || item.updates.allergens || item.updates.category_name) {
            summary += `• 🍽️ *Plato:* *${item.dishName}*\n`;
            if (item.updates.price !== undefined) {
              summary += `• 💰 *Precio:* ${Number(item.updates.price).toFixed(2)} €\n`;
            }
            if (item.updates.category_name) {
              summary += `• 📂 *Sección:* ${item.updates.category_name}\n`;
            }
            summary += `• 📝 *Descripción:* ${item.updates.description || 'Especialidad de la casa'}\n`;
            summary += `• 🏷️ *Alérgenos:* ${item.updates.allergens && item.updates.allergens.length > 0 ? item.updates.allergens.map(a => a.charAt(0).toUpperCase() + a.slice(1)).join(', ') : 'Ninguno declarado'}\n`;
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
