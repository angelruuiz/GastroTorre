import { NextRequest, NextResponse } from 'next/server';

const ADMIN_BOT_TOKEN = process.env.TELEGRAM_ADMIN_BOT_TOKEN || 
  Buffer.from('ODcxNzk2Mjk1ODpBQUZxeVJ2b20zeXlKcHhwb0VHQWwtQ0lYVnhDRnFpNzlDOA==', 'base64').toString('utf8');
const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID || '1305542862';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 
  Buffer.from('QVEuQWI4Uk42Sk8yT2JEZU9uTnJHclBSdHIyNHZ5dXR3RFlwUzdnalpXWC1ZSlVHWXQ2T0E=', 'base64').toString('utf8');
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vhqridneswcapjsuicfn.supabase.co';
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 
  process.env.SUPABASE_SECRET_KEY || 
  Buffer.from('c2Jfc2VjcmV0X0NLeF9wYVIzUlN4V1ZLRnY5TFR0ZkFfOG9BZXltdV8=', 'base64').toString('utf8');



const RESTAURANT_CONFIG: Record<string, { name: string; pin: string; token: string; slug: string; uuid: string }> = {
  'asador-los-jarales': { name: 'Asador Los Jarales', pin: 'JARALES-7482', token: 'gt_jarales_89a3f2c1', slug: 'asador-los-jarales', uuid: 'a1000000-0000-0000-0000-000000000001' },
  'la-tavola': { name: 'La Tavola di Torrelodones', pin: 'TAVOLA-3910', token: 'gt_tavola_77b4d9e0', slug: 'la-tavola', uuid: 'a2000000-0000-0000-0000-000000000002' },
  'el-olivo-bistro': { name: 'Bistró El Olivo', pin: 'OLIVO-5521', token: 'gt_olivo_52c8a1f6', slug: 'el-olivo-bistro', uuid: 'a3000000-0000-0000-0000-000000000003' },
  'torre-smash': { name: 'Torre Smash & Brew', pin: 'SMASH-9184', token: 'gt_smash_33e1b7d4', slug: 'torre-smash', uuid: 'a4000000-0000-0000-0000-000000000004' },
  'la-huerta-brunch': { name: 'Café & Brunch La Huerta', pin: 'HUERTA-4412', token: 'gt_huerta_94f0c8a2', slug: 'la-huerta-brunch', uuid: 'a5000000-0000-0000-0000-000000000005' },
};

async function supabaseQuery(table: string, queryParams: string = ''): Promise<any[]> {
  try {
    const url = `${SUPABASE_URL}/rest/v1/${table}${queryParams ? '?' + queryParams : ''}`;
    const res = await fetch(url, {
      headers: {
        'apikey': SUPABASE_SECRET_KEY,
        'Authorization': `Bearer ${SUPABASE_SECRET_KEY}`,
      },
    });
    if (res.ok) return await res.json();
    return [];
  } catch { return []; }
}

async function apiCall(method: string, body: Record<string, any> = {}) {
  try {
    const res = await fetch(`https://api.telegram.org/bot${ADMIN_BOT_TOKEN}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return await res.json();
  } catch (err: any) {
    return { ok: false, error: err?.message };
  }
}

async function sendMessage(chatId: string | number, text: string) {
  return apiCall('sendMessage', { chat_id: chatId, text, parse_mode: 'Markdown' });
}

async function sendTypingAction(chatId: string | number) {
  return apiCall('sendChatAction', { chat_id: chatId, action: 'typing' });
}

async function gatherAnalytics(period: 'today' | 'week' | 'month' = 'today'): Promise<string> {
  const now = new Date();
  let since: string;
  if (period === 'today') {
    since = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  } else if (period === 'week') {
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    since = weekAgo.toISOString();
  } else {
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    since = monthAgo.toISOString();
  }
  
  const events = await supabaseQuery('analytics_events', `created_at=gte.${since}&select=event_type,restaurant_id,created_at&order=created_at.desc&limit=500`);
  
  if (!events.length) return `No hay eventos registrados en el período (${period}).`;
  
  // Aggregate by type
  const byType: Record<string, number> = {};
  const byRestaurant: Record<string, number> = {};
  for (const e of events) {
    byType[e.event_type] = (byType[e.event_type] || 0) + 1;
    // Map UUID to name
    const name = Object.values(RESTAURANT_CONFIG).find(r => r.uuid === e.restaurant_id)?.name || e.restaurant_id;
    byRestaurant[name] = (byRestaurant[name] || 0) + 1;
  }
  
  let summary = `📊 Analítica (${period}):\n`;
  summary += `Total eventos: ${events.length}\n\n`;
  summary += `Por tipo:\n`;
  for (const [type, count] of Object.entries(byType).sort((a, b) => b[1] - a[1])) {
    summary += `- ${type}: ${count}\n`;
  }
  summary += `\nPor restaurante:\n`;
  for (const [name, count] of Object.entries(byRestaurant).sort((a, b) => b[1] - a[1])) {
    summary += `- ${name}: ${count}\n`;
  }
  return summary;
}

async function gatherAllMenus(): Promise<string> {
  const dishes = await supabaseQuery('dishes', 'select=name,price,is_available,restaurant_id&order=name.asc&limit=200');
  if (!dishes.length) return 'No hay platos en la base de datos.';
  
  let text = '';
  for (const [slug, cfg] of Object.entries(RESTAURANT_CONFIG)) {
    const restaurantDishes = dishes.filter(d => d.restaurant_id === cfg.uuid);
    if (restaurantDishes.length > 0) {
      text += `\n🏠 ${cfg.name}:\n`;
      for (const d of restaurantDishes) {
        text += `  - ${d.name}: ${Number(d.price).toFixed(2)}€ ${d.is_available !== false ? '✅' : '🚫 Agotado'}\n`;
      }
    }
  }
  return text || 'No hay platos cargados.';
}

function getPinesDirectory(): string {
  let text = '🔐 Directorio de PINes y Tokens:\n\n';
  for (const [slug, cfg] of Object.entries(RESTAURANT_CONFIG)) {
    text += `🏠 ${cfg.name}:\n`;
    text += `  PIN: ${cfg.pin}\n`;
    text += `  Token: ${cfg.token}\n`;
    text += `  Magic Link: https://t.me/GastroTorreTicketsBot?start=${cfg.token}\n`;
    text += `  Web: https://gastrotorre.vercel.app/restaurante/${slug}\n\n`;
  }
  return text;
}

async function askGemini(userMessage: string, context: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    return '⚠️ No se ha configurado GEMINI_API_KEY. Configura la variable de entorno para activar las respuestas con IA.';
  }
  
  const systemPrompt = `Eres el Asistente Inteligente de GastroTorre, el copiloto privado de Ángel Ruiz (fundador y superadmin de la plataforma GastroTorre — Guía Gastronómica y Cartas Digitales de Torrelodones, Madrid).

Responde SIEMPRE en español, de forma clara, concisa y con emojis relevantes.

CONTEXTO ACTUAL DE LA PLATAFORMA:
${context}

CAPACIDADES:
- Puedes consultar y reportar datos de analítica (visitas, escaneos QR, clics en WhatsApp, llamadas, reservas)
- Puedes consultar precios y disponibilidad de platos de todos los restaurantes
- Puedes explicar cómo dar de alta un nuevo restaurante (crear PIN, token, añadir al RESTAURANT_CONFIG, insertar en Supabase)
- Puedes listar los PINes y tokens de acceso de los restaurantes
- Puedes ayudar con dudas técnicas sobre la plataforma

IMPORTANTE:
- Los datos que se te proporcionan son EN TIEMPO REAL de la base de datos Supabase
- Si te preguntan por precios o platos, busca en los datos proporcionados
- Si te preguntan cómo crear un nuevo PIN: explica que hay que añadir una entrada al RESTAURANT_CONFIG en el código del bot (/api/telegram/webhook/route.ts) con: name, pin (formato NOMBRE-4digits), token (formato gt_nombre_8chars), slug y uuid. Luego insertar el restaurante en Supabase.
- Si detectas que un plato NO pertenece al restaurante que se menciona, avisa claramente
- Formato: usa Markdown compatible con Telegram (negrita con *, cursiva con _, código con backticks)`;

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ parts: [{ text: userMessage }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1500,
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[Gemini API Error]:', errText);
      return `⚠️ Error al consultar la IA: ${res.status}`;
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return text || '🤔 No he podido generar una respuesta. Intenta reformular tu pregunta.';
  } catch (err: any) {
    console.error('[Gemini Exception]:', err?.message);
    return `⚠️ Error de conexión con la IA: ${err?.message}`;
  }
}

export async function POST(req: NextRequest) {
  try {
    const update = await req.json();
    
    if (!update.message) {
      return NextResponse.json({ ok: true, ignored: true });
    }
    
    const msg = update.message;
    const chatId = String(msg.chat.id);
    const text = (msg.text || '').trim();
    
    // STRICT SECURITY: Only respond to the admin
    if (chatId !== String(ADMIN_CHAT_ID)) {
      return NextResponse.json({ ok: true, unauthorized: true });
    }
    
    // Handle /start command
    if (text === '/start') {
      await sendMessage(chatId, `🤖 *¡Hola, Ángel! Soy tu Asistente GastroTorre con IA.*\n\nPregúntame lo que quieras en lenguaje natural:\n\n📊 _"¿Cuánta gente ha entrado hoy?"_\n💰 _"¿A qué precio está el chuletón?"_\n🔑 _"Muéstrame los PINes"_\n🏠 _"¿Cómo doy de alta un restaurante nuevo?"_\n📈 _"Dame las métricas de esta semana"_\n\n¡Escríbeme lo que necesites!`);
      return NextResponse.json({ ok: true });
    }
    
    // Show typing indicator while processing
    await sendTypingAction(chatId);
    
    // Gather real-time context from Supabase
    const [analyticsToday, analyticsWeek, menus, pines] = await Promise.all([
      gatherAnalytics('today'),
      gatherAnalytics('week'),
      gatherAllMenus(),
      Promise.resolve(getPinesDirectory()),
    ]);
    
    const fullContext = [
      analyticsToday,
      '---',
      analyticsWeek,
      '---',
      'CARTAS Y PLATOS ACTUALES:',
      menus,
      '---',
      pines,
    ].join('\\n');
    
    // Ask Gemini with full context
    const aiResponse = await askGemini(text, fullContext);
    
    // Send response (split if too long for Telegram's 4096 char limit)
    if (aiResponse.length <= 4000) {
      await sendMessage(chatId, aiResponse);
    } else {
      // Split into chunks
      const chunks = aiResponse.match(/[\\s\\S]{1,4000}/g) || [aiResponse];
      for (const chunk of chunks) {
        await sendMessage(chatId, chunk);
      }
    }
    
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[Admin Bot Error]:', err?.message);
    return NextResponse.json({ ok: false, error: err?.message }, { status: 500 });
  }
}
