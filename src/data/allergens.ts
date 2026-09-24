export interface AllergenInfo {
  id: string;
  name: string;
  shortName: string;
  badgeLabel: string;
  icon: string;
  emoji: string;
  color: string;
  bg: string;
  border: string;
  description: string;
}

export const OFFICIAL_ALLERGENS: AllergenInfo[] = [
  {
    id: 'gluten',
    name: 'Cereales con Gluten (Trigo, Cebada, Centeno)',
    shortName: 'Gluten',
    badgeLabel: 'Contiene Gluten',
    icon: 'Wheat',
    emoji: '🌾',
    color: 'text-slate-900 dark:text-amber-100',
    bg: 'bg-amber-100 dark:bg-amber-950/80',
    border: 'border-amber-300 dark:border-amber-700',
    description: 'Trigo, centeno, cebada, avena, espelta, kamut o sus variedades híbridas.',
  },
  {
    id: 'lactosa',
    name: 'Leche y Lácteos (incluida lactosa)',
    shortName: 'Lácteos',
    badgeLabel: 'Contiene Lácteos',
    icon: 'Milk',
    emoji: '🥛',
    color: 'text-slate-900 dark:text-sky-100',
    bg: 'bg-sky-100 dark:bg-sky-950/80',
    border: 'border-sky-300 dark:border-sky-700',
    description: 'Leche, queso, mantequilla, nata, yogur y derivados lácteos.',
  },
  {
    id: 'huevo',
    name: 'Huevos y productos a base de huevo',
    shortName: 'Huevo',
    badgeLabel: 'Contiene Huevo',
    icon: 'Egg',
    emoji: '🥚',
    color: 'text-slate-900 dark:text-yellow-100',
    bg: 'bg-yellow-100 dark:bg-yellow-950/80',
    border: 'border-yellow-300 dark:border-yellow-700',
    description: 'Tortillas, mayonesas, rebozados, salsas y pastas al huevo.',
  },
  {
    id: 'pescado',
    name: 'Pescado y productos derivados',
    shortName: 'Pescado',
    badgeLabel: 'Contiene Pescado',
    icon: 'Fish',
    emoji: '🐟',
    color: 'text-slate-900 dark:text-cyan-100',
    bg: 'bg-cyan-100 dark:bg-cyan-950/80',
    border: 'border-cyan-300 dark:border-cyan-700',
    description: 'Pescados frescos, caldos de pescado, salsas con extracto de pescado.',
  },
  {
    id: 'crustaceos',
    name: 'Crustáceos y derivados',
    shortName: 'Crustáceos',
    badgeLabel: 'Contiene Crustáceos',
    icon: 'Shell',
    emoji: '🦐',
    color: 'text-slate-900 dark:text-rose-100',
    bg: 'bg-rose-100 dark:bg-rose-950/80',
    border: 'border-rose-300 dark:border-rose-700',
    description: 'Gambas, langostinos, cangrejos, bogavantes, cigalas y caldos de marisco.',
  },
  {
    id: 'moluscos',
    name: 'Moluscos y productos a base de molusco',
    shortName: 'Moluscos',
    badgeLabel: 'Contiene Moluscos',
    icon: 'Shell',
    emoji: '🦪',
    color: 'text-slate-900 dark:text-purple-100',
    bg: 'bg-purple-100 dark:bg-purple-950/80',
    border: 'border-purple-300 dark:border-purple-700',
    description: 'Mejillones, almejas, pulpo, calamares, chipirones y caracoles.',
  },
  {
    id: 'frutos-secos',
    name: 'Frutos de Cáscara (Almendras, Nueces, etc.)',
    shortName: 'Frutos secos',
    badgeLabel: 'Contiene Frutos Secos',
    icon: 'Nut',
    emoji: '🌰',
    color: 'text-slate-900 dark:text-orange-100',
    bg: 'bg-orange-100 dark:bg-orange-950/80',
    border: 'border-orange-300 dark:border-orange-700',
    description: 'Almendras, avellanas, nueces, anacardos, pacanas, pistachos.',
  },
  {
    id: 'cacahuetes',
    name: 'Cacahuetes y productos derivados',
    shortName: 'Cacahuetes',
    badgeLabel: 'Contiene Cacahuetes',
    icon: 'Nut',
    emoji: '🥜',
    color: 'text-slate-900 dark:text-amber-100',
    bg: 'bg-amber-100 dark:bg-amber-950/80',
    border: 'border-amber-300 dark:border-amber-700',
    description: 'Mantequilla de cacahuete, aceites de cacahuete, aperitivos.',
  },
  {
    id: 'soja',
    name: 'Soja y productos a base de soja',
    shortName: 'Soja',
    badgeLabel: 'Contiene Soja',
    icon: 'Leaf',
    emoji: '🌱',
    color: 'text-slate-900 dark:text-emerald-100',
    bg: 'bg-emerald-100 dark:bg-emerald-950/80',
    border: 'border-emerald-300 dark:border-emerald-700',
    description: 'Tofu, salsa de soja, lecitina de soja, edamames.',
  },
  {
    id: 'apio',
    name: 'Apio y productos derivados',
    shortName: 'Apio',
    badgeLabel: 'Contiene Apio',
    icon: 'Leaf',
    emoji: '🥬',
    color: 'text-slate-900 dark:text-lime-100',
    bg: 'bg-lime-100 dark:bg-lime-950/80',
    border: 'border-lime-300 dark:border-lime-700',
    description: 'Caldos de verduras, sofritos, sal de apio, ensaladas.',
  },
  {
    id: 'mostaza',
    name: 'Mostaza y derivados',
    shortName: 'Mostaza',
    badgeLabel: 'Contiene Mostaza',
    icon: 'Sparkles',
    emoji: '🟡',
    color: 'text-slate-900 dark:text-yellow-100',
    bg: 'bg-yellow-100 dark:bg-yellow-950/80',
    border: 'border-yellow-300 dark:border-yellow-700',
    description: 'Salsas de mostaza, vinagretas, adobos y embutidos.',
  },
  {
    id: 'sesamo',
    name: 'Granos de Sésamo y derivados',
    shortName: 'Sésamo',
    badgeLabel: 'Contiene Sésamo',
    icon: 'Sparkles',
    emoji: '🥯',
    color: 'text-slate-900 dark:text-zinc-100',
    bg: 'bg-zinc-100 dark:bg-zinc-800',
    border: 'border-zinc-300 dark:border-zinc-700',
    description: 'Panes de hamburguesa, hummus con tahini, aceites de sésamo.',
  },
  {
    id: 'sulfitos',
    name: 'Dióxido de Azufre y Sulfitos',
    shortName: 'Sulfitos',
    badgeLabel: 'Contiene Sulfitos',
    icon: 'Sparkles',
    emoji: '🍷',
    color: 'text-slate-900 dark:text-fuchsia-100',
    bg: 'bg-fuchsia-100 dark:bg-fuchsia-950/80',
    border: 'border-fuchsia-300 dark:border-fuchsia-700',
    description: 'Vinos, cervezas, frutas desecadas, vinagres y conservas.',
  },
  {
    id: 'altramuces',
    name: 'Altramuces y derivados',
    shortName: 'Altramuces',
    badgeLabel: 'Contiene Altramuces',
    icon: 'Sparkles',
    emoji: '🫘',
    color: 'text-slate-900 dark:text-teal-100',
    bg: 'bg-teal-100 dark:bg-teal-950/80',
    border: 'border-teal-300 dark:border-teal-700',
    description: 'Aperitivos de altramuz, harinas para panadería sin gluten.',
  },
];

export function normalizeStr(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

const ALLERGEN_SYNONYMS: Record<string, string> = {
  // Lactosa / Lácteos
  'lactosa': 'lactosa',
  'lacteo': 'lactosa',
  'lacteos': 'lactosa',
  'lactico': 'lactosa',
  'lacticos': 'lactosa',
  'leche': 'lactosa',
  'dairy': 'lactosa',
  'milk': 'lactosa',
  'queso': 'lactosa',
  'mantequilla': 'lactosa',
  'nata': 'lactosa',
  'yogur': 'lactosa',
  'yogurt': 'lactosa',

  // Gluten
  'gluten': 'gluten',
  'trigo': 'gluten',
  'cebada': 'gluten',
  'centeno': 'gluten',
  'avena': 'gluten',
  'espelta': 'gluten',
  'kamut': 'gluten',
  'harina': 'gluten',
  'cereales': 'gluten',
  'cereales con gluten': 'gluten',
  'wheat': 'gluten',

  // Huevo
  'huevo': 'huevo',
  'huevos': 'huevo',
  'egg': 'huevo',
  'eggs': 'huevo',
  'yema': 'huevo',
  'clara': 'huevo',
  'claras': 'huevo',
  'mayonesa': 'huevo',

  // Pescado
  'pescado': 'pescado',
  'pescados': 'pescado',
  'fish': 'pescado',
  'atun': 'pescado',
  'salmon': 'pescado',
  'merluza': 'pescado',
  'bacalao': 'pescado',
  'anchoa': 'pescado',
  'anchoas': 'pescado',

  // Crustáceos
  'crustaceo': 'crustaceos',
  'crustaceos': 'crustaceos',
  'marisco': 'crustaceos',
  'mariscos': 'crustaceos',
  'shellfish': 'crustaceos',
  'gamba': 'crustaceos',
  'gambas': 'crustaceos',
  'langostino': 'crustaceos',
  'langostinos': 'crustaceos',
  'bogavante': 'crustaceos',
  'cigala': 'crustaceos',
  'cigalas': 'crustaceos',
  'cangrejo': 'crustaceos',
  'shrimp': 'crustaceos',
  'lobster': 'crustaceos',

  // Moluscos
  'molusco': 'moluscos',
  'moluscos': 'moluscos',
  'mejillon': 'moluscos',
  'mejillones': 'moluscos',
  'almeja': 'moluscos',
  'almejas': 'moluscos',
  'pulpo': 'moluscos',
  'calamar': 'moluscos',
  'calamares': 'moluscos',
  'sepia': 'moluscos',
  'chipiron': 'moluscos',
  'chipirones': 'moluscos',
  'ostra': 'moluscos',
  'ostras': 'moluscos',
  'molluscs': 'moluscos',

  // Frutos Secos
  'fruto seco': 'frutos-secos',
  'frutos secos': 'frutos-secos',
  'fruto-seco': 'frutos-secos',
  'frutos-secos': 'frutos-secos',
  'fruto_seco': 'frutos-secos',
  'frutos_secos': 'frutos-secos',
  'frutos de cascara': 'frutos-secos',
  'nuts': 'frutos-secos',
  'nut': 'frutos-secos',
  'nuez': 'frutos-secos',
  'nueces': 'frutos-secos',
  'almendra': 'frutos-secos',
  'almendras': 'frutos-secos',
  'avellana': 'frutos-secos',
  'avellanas': 'frutos-secos',
  'anacardo': 'frutos-secos',
  'anacardos': 'frutos-secos',
  'pistacho': 'frutos-secos',
  'pistachos': 'frutos-secos',
  'pacana': 'frutos-secos',
  'pacanas': 'frutos-secos',

  // Cacahuetes
  'cacahuete': 'cacahuetes',
  'cacahuetes': 'cacahuetes',
  'cacahuate': 'cacahuetes',
  'cacahuates': 'cacahuetes',
  'mani': 'cacahuetes',
  'manis': 'cacahuetes',
  'peanut': 'cacahuetes',
  'peanuts': 'cacahuetes',

  // Soja
  'soja': 'soja',
  'soya': 'soja',
  'soy': 'soja',
  'tofu': 'soja',
  'edamame': 'soja',
  'edamames': 'soja',

  // Apio
  'apio': 'apio',
  'celery': 'apio',

  // Mostaza
  'mostaza': 'mostaza',
  'mustard': 'mostaza',

  // Sésamo
  'sesamo': 'sesamo',
  'ajonjoli': 'sesamo',
  'sesame': 'sesamo',

  // Sulfitos
  'sulfito': 'sulfitos',
  'sulfitos': 'sulfitos',
  'sulfite': 'sulfitos',
  'sulfites': 'sulfitos',
  'dioxido de azufre': 'sulfitos',
  'so2': 'sulfitos',
  'vino': 'sulfitos',

  // Altramuces
  'altramuz': 'altramuces',
  'altramuces': 'altramuces',
  'lupin': 'altramuces',
  'lupino': 'altramuces',
  'lupinos': 'altramuces',
};

export function getAllergenId(type: string): string {
  const norm = normalizeStr(type);
  if (ALLERGEN_SYNONYMS[norm]) {
    return ALLERGEN_SYNONYMS[norm];
  }
  for (const [key, val] of Object.entries(ALLERGEN_SYNONYMS)) {
    if (norm.includes(key) || key.includes(norm)) {
      return val;
    }
  }
  return norm;
}

export function getAllergenInfo(type: string): AllergenInfo {
  const targetId = getAllergenId(type);
  const found = OFFICIAL_ALLERGENS.find((a) => a.id === targetId);
  if (found) return found;

  const norm = normalizeStr(type);
  const directMatch = OFFICIAL_ALLERGENS.find(
    (a) =>
      normalizeStr(a.name).includes(norm) ||
      normalizeStr(a.shortName).includes(norm) ||
      norm.includes(normalizeStr(a.shortName))
  );
  if (directMatch) return directMatch;

  // Fallback safe info
  return {
    id: norm,
    name: type,
    shortName: type,
    badgeLabel: `Contiene ${type}`,
    icon: 'Sparkles',
    emoji: '🍽️',
    color: 'text-slate-900 dark:text-slate-100',
    bg: 'bg-slate-100 dark:bg-slate-800',
    border: 'border-slate-300 dark:border-slate-700',
    description: `Alérgeno o ingrediente: ${type}`,
  };
}

export const DIET_FILTERS = [
  {
    id: 'gluten-free',
    name: 'Apto Celíacos (Sin Gluten)',
    shortName: 'Sin Gluten',
    badgeText: 'Sin Gluten',
    emoji: '🌾',
    iconType: 'check',
    allergenId: 'gluten',
    check: (dish: any) => {
      if (dish.isGlutenFree) return true;
      const ids = (dish.allergens || []).map((a: string) => getAllergenId(a));
      return !ids.includes('gluten');
    },
  },
  {
    id: 'dairy-free',
    name: 'Sin Lactosa / Sin Lácteos',
    shortName: 'Sin Lactosa',
    badgeText: 'Sin Lactosa',
    emoji: '🥛',
    iconType: 'no',
    allergenId: 'lactosa',
    check: (dish: any) => {
      const ids = (dish.allergens || []).map((a: string) => getAllergenId(a));
      return !ids.includes('lactosa');
    },
  },
  {
    id: 'egg-free',
    name: 'Sin Huevo',
    shortName: 'Sin Huevo',
    badgeText: 'Sin Huevo',
    emoji: '🥚',
    iconType: 'no',
    allergenId: 'huevo',
    check: (dish: any) => {
      const ids = (dish.allergens || []).map((a: string) => getAllergenId(a));
      return !ids.includes('huevo');
    },
  },
  {
    id: 'nut-free',
    name: 'Sin Frutos Secos',
    shortName: 'Sin Frutos Secos',
    badgeText: 'Sin Frutos Secos',
    emoji: '🌰',
    iconType: 'no',
    allergenId: 'frutos-secos',
    check: (dish: any) => {
      const ids = (dish.allergens || []).map((a: string) => getAllergenId(a));
      return !ids.includes('frutos-secos') && !ids.includes('cacahuetes');
    },
  },
  {
    id: 'fish-free',
    name: 'Sin Pescado',
    shortName: 'Sin Pescado',
    badgeText: 'Sin Pescado',
    emoji: '🐟',
    iconType: 'no',
    allergenId: 'pescado',
    check: (dish: any) => {
      const ids = (dish.allergens || []).map((a: string) => getAllergenId(a));
      return !ids.includes('pescado');
    },
  },
  {
    id: 'crustaceans-free',
    name: 'Sin Crustáceos / Marisco',
    shortName: 'Sin Crustáceos',
    badgeText: 'Sin Crustáceos',
    emoji: '🦐',
    iconType: 'no',
    allergenId: 'crustaceos',
    check: (dish: any) => {
      const ids = (dish.allergens || []).map((a: string) => getAllergenId(a));
      return !ids.includes('crustaceos');
    },
  },
  {
    id: 'molluscs-free',
    name: 'Sin Moluscos',
    shortName: 'Sin Moluscos',
    badgeText: 'Sin Moluscos',
    emoji: '🦪',
    iconType: 'no',
    allergenId: 'moluscos',
    check: (dish: any) => {
      const ids = (dish.allergens || []).map((a: string) => getAllergenId(a));
      return !ids.includes('moluscos');
    },
  },
  {
    id: 'soy-free',
    name: 'Sin Soja',
    shortName: 'Sin Soja',
    badgeText: 'Sin Soja',
    emoji: '🌱',
    iconType: 'no',
    allergenId: 'soja',
    check: (dish: any) => {
      const ids = (dish.allergens || []).map((a: string) => getAllergenId(a));
      return !ids.includes('soja');
    },
  },
  {
    id: 'mustard-free',
    name: 'Sin Mostaza',
    shortName: 'Sin Mostaza',
    badgeText: 'Sin Mostaza',
    emoji: '🟡',
    iconType: 'no',
    allergenId: 'mostaza',
    check: (dish: any) => {
      const ids = (dish.allergens || []).map((a: string) => getAllergenId(a));
      return !ids.includes('mostaza');
    },
  },
  {
    id: 'sesame-free',
    name: 'Sin Sésamo',
    shortName: 'Sin Sésamo',
    badgeText: 'Sin Sésamo',
    emoji: '🥯',
    iconType: 'no',
    allergenId: 'sesamo',
    check: (dish: any) => {
      const ids = (dish.allergens || []).map((a: string) => getAllergenId(a));
      return !ids.includes('sesamo');
    },
  },
  {
    id: 'celery-free',
    name: 'Sin Apio',
    shortName: 'Sin Apio',
    badgeText: 'Sin Apio',
    emoji: '🥬',
    iconType: 'no',
    allergenId: 'apio',
    check: (dish: any) => {
      const ids = (dish.allergens || []).map((a: string) => getAllergenId(a));
      return !ids.includes('apio');
    },
  },
  {
    id: 'sulfites-free',
    name: 'Sin Sulfitos',
    shortName: 'Sin Sulfitos',
    badgeText: 'Sin Sulfitos',
    emoji: '🍷',
    iconType: 'no',
    allergenId: 'sulfitos',
    check: (dish: any) => {
      const ids = (dish.allergens || []).map((a: string) => getAllergenId(a));
      return !ids.includes('sulfitos');
    },
  },
  {
    id: 'lupin-free',
    name: 'Sin Altramuces',
    shortName: 'Sin Altramuces',
    badgeText: 'Sin Altramuces',
    emoji: '🫘',
    iconType: 'no',
    allergenId: 'altramuces',
    check: (dish: any) => {
      const ids = (dish.allergens || []).map((a: string) => getAllergenId(a));
      return !ids.includes('altramuces');
    },
  },
  {
    id: 'peanut-free',
    name: 'Sin Cacahuetes',
    shortName: 'Sin Cacahuetes',
    badgeText: 'Sin Cacahuetes',
    emoji: '🥜',
    iconType: 'no',
    allergenId: 'cacahuetes',
    check: (dish: any) => {
      const ids = (dish.allergens || []).map((a: string) => getAllergenId(a));
      return !ids.includes('cacahuetes');
    },
  },
];

export function parseAllergensFromText(text: string): string[] {
  if (!text) return [];
  const lower = text.toLowerCase();
  const detected = new Set<string>();

  const hasAllergen = (regex: RegExp) => {
    const globalRegex = new RegExp(regex.source, 'gi');
    let m: RegExpExecArray | null;
    while ((m = globalRegex.exec(lower)) !== null) {
      const start = Math.max(0, m.index - 25);
      const prefix = lower.substring(start, m.index);
      if (!/sin\s+|libre\s+de\s+|no\s+lleva\s+|no\s+contiene\s+|apto\s+(?:para\s+)?cel[ií]acos/i.test(prefix)) {
        return true;
      }
    }
    return false;
  };

  if (hasAllergen(/gluten|trigo|harina|pan|centeno|cebada|avena|espelta|kamut|pasta|rebozad|croqueta|panko|hojaldre|tempura|cerveza/i)) detected.add('gluten');
  if (hasAllergen(/l[aá]cteo|lactosa|leche|queso|mantequilla|nata|yogur|parmesano|mozzarella|burrata|gorgonzola|manchego|bechamel|cuajada|helado/i)) detected.add('lactosa');
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


