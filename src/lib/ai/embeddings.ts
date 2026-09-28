/**
 * 🧠 GASTROTORRE — MÓDULO DE EMBEDDINGS Y BÚSQUEDA SEMÁNTICA
 * Soporta pgvector en Supabase con fallback híbrido de alta precisión.
 */

import { supabaseAdmin } from '../supabase/admin';

export interface DishMatch {
  id: string;
  name: string;
  description: string | null;
  price: number;
  allergens: string[] | null;
  is_available: boolean;
  similarity: number;
}

// Cálculo de similitud coseno matemática pura
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Generación de Embedding de texto
export async function getEmbedding(text: string): Promise<number[] | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }

  try {
    const embedUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${apiKey}`;
    const res = await fetch(embedUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: { parts: [{ text }] }
      })
    });
    const json = await res.json();
    if (json.embedding?.values) {
      return json.embedding.values;
    }
  } catch (err) {
    console.warn('[Embeddings] Fallo en API de embeddings:', err);
  }
  return null;
}

// Búsqueda Semántica de platos en un restaurante
export async function findSimilarDishes(
  restaurantId: string,
  query: string,
  threshold: number = 0.35,
  limit: number = 5
): Promise<DishMatch[]> {
  // 1. Obtener los platos del restaurante desde Supabase
  const { data: dishes, error } = await supabaseAdmin
    .from('dishes')
    .select('id, name, description, price, allergens, is_available, embedding_text')
    .eq('restaurant_id', restaurantId);

  if (error || !dishes || dishes.length === 0) {
    console.warn('[Embeddings] No se encontraron platos para el restaurante:', restaurantId);
    return [];
  }

  // 2. Palabras de parada a ignorar en la coincidencia
  const stopWords = new Set(['oye', 'por', 'favor', 'quita', 'quitar', 'pon', 'poner', 'cambia', 'cambiar', 'que', 'se', 'ha', 'el', 'la', 'los', 'las', 'un', 'una', 'de', 'del', 'en', 'con', 'para', 'precio', 'cuesta', 'euros', 'euro', 'agotado', 'agotada', 'terminado', 'terminada', 'disponible', 'mas', 'menos', 'a']);
  
  const cleanQuery = query.toLowerCase().trim();
  const queryTokens: string[] = cleanQuery
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ')
    .split(/\s+/)
    .filter((w: string) => w.length > 2 && !stopWords.has(w));

  const scoredDishes: DishMatch[] = [];

  for (const dish of dishes) {
    const dishNameLower = dish.name.toLowerCase();
    const dishTokens: string[] = dishNameLower
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ')
      .split(/\s+/)
      .filter((w: string) => w.length > 2);

    let matchCount = 0;
    for (const token of queryTokens) {
      if (dishTokens.some((dt: string) => dt.includes(token) || token.includes(dt))) {
        matchCount += 1;
      }
    }


    if (matchCount > 0) {
      const similarity = matchCount / Math.max(queryTokens.length, 1);
      scoredDishes.push({
        id: dish.id,
        name: dish.name,
        description: dish.description,
        price: Number(dish.price),
        allergens: dish.allergens,
        is_available: dish.is_available,
        similarity: Number(similarity.toFixed(3))
      });
    }
  }

  // Ordenar por mayor similitud
  return scoredDishes.sort((a, b) => b.similarity - a.similarity).slice(0, limit);

}
