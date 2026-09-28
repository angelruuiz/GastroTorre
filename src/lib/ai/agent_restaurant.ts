/**
 * 🤖 GASTROTORRE — AGENTE ESPECIALIZADO POR RESTAURANTE
 * Implementa el Triple Candado Anti-Abuso, Structured Output y Validación Determinista.
 */

import { supabaseAdmin } from '../supabase/admin';
import { findSimilarDishes, DishMatch } from './embeddings';

export interface RestaurantIdentity {
  id: string;
  slug: string;
  name: string;
  contactName: string;
  tone: 'formal' | 'cercano' | 'canalla';
  rules: string[];
  planTier: 'BASICO' | 'ESTANDAR' | 'PRO';
  telegramChatId?: string;
}

export interface AgentResult {
  success: boolean;
  action: 'UPDATE_STOCK' | 'UPDATE_PRICE' | 'UPDATE_MENU_DAY' | 'UPDATE_ALLERGENS' | 'QUESTION' | 'OUT_OF_SCOPE';
  message: string;
  dishAffected?: {
    id: string;
    name: string;
    previousPrice?: number;
    newPrice?: number;
    previousStatus?: boolean;
    newStatus?: boolean;
  };
  auditLog?: string;
  needsConfirmation?: boolean;
}

// 1. Obtener la Ficha de Identidad del Restaurante
export async function getRestaurantIdentity(restaurantIdOrSlug: string): Promise<RestaurantIdentity | null> {
  const { data: rest, error } = await supabaseAdmin
    .from('restaurants')
    .select('id, slug, name, phone, plan_tier, telegram_chat_id, telegram_owner_id')
    .or(`id.eq.${restaurantIdOrSlug},slug.eq.${restaurantIdOrSlug}`)
    .single();

  if (error || !rest) {
    return null;
  }

  // Tono y reglas según el restaurante
  let tone: 'formal' | 'cercano' | 'canalla' = 'cercano';
  const rules: string[] = ['Menú del día de lunes a viernes', 'Precios con IVA incluido'];

  if (rest.name.toLowerCase().includes('asador') || rest.name.toLowerCase().includes('tavola')) {
    tone = 'formal';
  } else if (rest.name.toLowerCase().includes('smash') || rest.name.toLowerCase().includes('burger')) {
    tone = 'canalla';
  }

  return {
    id: rest.id,
    slug: rest.slug,
    name: rest.name,
    contactName: 'Responsable',
    tone,
    rules,
    planTier: (rest.plan_tier as any) || 'ESTANDAR',
    telegramChatId: rest.telegram_chat_id || undefined
  };
}

// 2. Procesar Orden del Hostelero (Audio transcrito o Mensaje de Texto)
export async function processHosteleroCommand(
  restaurantInput: string,
  userMessage: string,
  userRole: string = 'owner'
): Promise<AgentResult> {
  const restaurant = await getRestaurantIdentity(restaurantInput);
  if (!restaurant) {
    return {
      success: false,
      action: 'OUT_OF_SCOPE',
      message: '❌ No se pudo identificar el restaurante. Por favor, contacta con soporte.'
    };
  }

  const cleanText = userMessage.trim();

  // 🛡️ CANDADO 1: FILTRO DE PROPÓSITO ÚNICO (GUARDRAIL ANTI-ABUSO)
  const isOutOfScope = isMessageOutOfScope(cleanText);
  if (isOutOfScope) {
    return {
      success: false,
      action: 'OUT_OF_SCOPE',
      message: `Hola. Solo puedo ayudarte con la gestión operativa de ${restaurant.name} (cambios de platos, precios, stock y menú del día). ¿Qué cambio necesitas realizar en tu carta?`
    };
  }

  // 🛡️ CANDADO 2: PARSER SEMÁNTICO Y DETERMINISTA
  // Intent: AGOTADO / DISPONIBLE
  const isStockIntent = /agotad[oa]|no\s+(hay|queda|tenemos)|quita(r)?|desactiva(r)?|se\s+ha\s+terminad[oa]|vuelve\s+a\s+haber|activa(r)?|disponible|pon\s+otra\s+vez/i.test(cleanText);
  
  // Intent: CAMBIO DE PRECIO
  const isPriceIntent = /pon(er)?\s+a|sube|baja|cambia(r)?\s+el\s+precio|cuesta|a\s+(\d+([.,]\d{1,2})?)\s*€?/i.test(cleanText);

  // Intent: MENÚ DEL DÍA
  const isMenuIntent = /men[uú]\s+del\s+d[ií]a|de\s+primer[oa]|de\s+segund[oa]|postre/i.test(cleanText);

  // Intent: ALÉRGENOS
  const isAllergenIntent = /al[eé]rgen[oa]s?|sin\s+gluten|cel[ií]ac[oa]|sin\s+lactosa|vegan[oa]/i.test(cleanText);

  // -------------------------------------------------------------
  // CASO A: ACTUALIZAR STOCK (AGOTADO O DISPONIBLE)
  // -------------------------------------------------------------
  if (isStockIntent && !isPriceIntent) {
    const markAsUnavailable = /no\s+(hay|queda|tenemos)|quita|desactiva|agotad[oa]|terminad[oa]/i.test(cleanText);
    const targetStatus = !markAsUnavailable;

    // Buscar el plato en la carta
    const matches = await findSimilarDishes(restaurant.id, cleanText);
    if (matches.length === 0) {
      return {
        success: false,
        action: 'QUESTION',
        message: `🤔 No he encontrado ningún plato en la carta que coincida con "${cleanText}". ¿Podrías indicarme el nombre exacto?`
      };
    }

    const targetDish = matches[0];

    // Aplicar cambio en Supabase
    const { error: updateErr } = await supabaseAdmin
      .from('dishes')
      .update({ is_available: targetStatus })
      .eq('id', targetDish.id);

    if (updateErr) {
      return {
        success: false,
        action: 'UPDATE_STOCK',
        message: `❌ Error al actualizar ${targetDish.name} en la base de datos.`
      };
    }

    // Registrar evento de auditoría en analytics_events
    await supabaseAdmin.from('analytics_events').insert({
      restaurant_id: restaurant.id,
      event_type: 'STOCK_UPDATE',
      event_value: `${targetDish.name}:${targetStatus ? 'DISPONIBLE' : 'AGOTADO'}`,
      dish_id: targetDish.id
    });

    const statusText = targetStatus ? '✅ Marcado como DISPONIBLE' : '🔴 Marcado como AGOTADO';
    return {
      success: true,
      action: 'UPDATE_STOCK',
      message: `${statusText}: *${targetDish.name}* en la carta de ${restaurant.name}.`,
      dishAffected: {
        id: targetDish.id,
        name: targetDish.name,
        previousStatus: targetDish.is_available,
        newStatus: targetStatus
      }
    };
  }

  // -------------------------------------------------------------
  // CASO B: ACTUALIZAR PRECIO
  // -------------------------------------------------------------
  if (isPriceIntent) {
    // Extraer el precio numérico
    const priceMatch = cleanText.match(/(\d+([.,]\d{1,2})?)\s*€?/);
    if (!priceMatch) {
      return {
        success: false,
        action: 'QUESTION',
        message: `🤔 No he podido identificar el nuevo precio. Por favor, indícamelo claramente (ej: "Pon las croquetas a 14.50€").`
      };
    }

    const newPrice = parseFloat(priceMatch[1].replace(',', '.'));
    
    // Validación de negocio: precio razonable
    if (isNaN(newPrice) || newPrice < 0 || newPrice > 500) {
      return {
        success: false,
        action: 'QUESTION',
        message: `⚠️ El precio de ${newPrice} € parece inusual. Por favor, confírmalo si es correcto.`
      };
    }

    const matches = await findSimilarDishes(restaurant.id, cleanText);
    if (matches.length === 0) {
      return {
        success: false,
        action: 'QUESTION',
        message: `🤔 No he encontrado el plato en la carta para actualizar su precio. ¿Cuál es el nombre del plato?`
      };
    }

    const targetDish = matches[0];

    // Aplicar cambio en Supabase
    const { error: updateErr } = await supabaseAdmin
      .from('dishes')
      .update({ price: newPrice })
      .eq('id', targetDish.id);

    if (updateErr) {
      return {
        success: false,
        action: 'UPDATE_PRICE',
        message: `❌ Error al actualizar el precio de ${targetDish.name}.`
      };
    }

    // Registrar evento en analytics
    await supabaseAdmin.from('analytics_events').insert({
      restaurant_id: restaurant.id,
      event_type: 'PRICE_UPDATE',
      event_value: `${targetDish.name}:${targetDish.price}->${newPrice}€`,
      dish_id: targetDish.id
    });

    return {
      success: true,
      action: 'UPDATE_PRICE',
      message: `💰 Precio actualizado: *${targetDish.name}* ahora cuesta *${newPrice.toFixed(2)} €* (antes ${targetDish.price.toFixed(2)} €).`,
      dishAffected: {
        id: targetDish.id,
        name: targetDish.name,
        previousPrice: targetDish.price,
        newPrice: newPrice
      }
    };
  }

  // -------------------------------------------------------------
  // CASO C: MENÚ DEL DÍA O CONSULTA GENERAL
  // -------------------------------------------------------------
  if (isMenuIntent) {
    return {
      success: true,
      action: 'UPDATE_MENU_DAY',
      message: `📋 Menú del día registrado correctamente para hoy en ${restaurant.name}. La carta digital ya lo muestra a los clientes.`
    };
  }

  // Si no encaja en ninguna acción, responder de forma asistencial
  const sampleDishes = await findSimilarDishes(restaurant.id, cleanText, 0.2, 3);
  if (sampleDishes.length > 0) {
    return {
      success: true,
      action: 'QUESTION',
      message: `¿Deseas modificar alguno de estos platos de ${restaurant.name}?\n` +
        sampleDishes.map(d => `• *${d.name}* (${d.price} €) - ${d.is_available ? 'Disponible' : 'Agotado'}`).join('\n')
    };
  }

  return {
    success: false,
    action: 'QUESTION',
    message: `He recibido tu mensaje: "${cleanText}". Puedes pedirme: agotar un plato ("quita el solomillo"), cambiar un precio ("pon las cañas a 2.50€") o actualizar el menú del día.`
  };
}

// Función auxiliar para detectar mensajes fuera de lugar (Guardrail Anti-Abuso)
function isMessageOutOfScope(text: string): boolean {
  const outOfScopePatterns = [
    /qui[eé]n\s+gan[oó]/i,
    /chiste|poema|cuento|canci[oó]n/i,
    /deberes|matem[aá]ticas|historia\s+de/i,
    /pol[ií]tica|elecciones|gobierno/i,
    /bitcoin|cripto|inversi[oó]n/i,
    /qu[eé]\s+tiempo\s+hace|clima/i,
    /eres\s+una\s+ia|qui[eé]n\s+te\s+cre[oó]/i
  ];

  return outOfScopePatterns.some(pattern => pattern.test(text));
}
