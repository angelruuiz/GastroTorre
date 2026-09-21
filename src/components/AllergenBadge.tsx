import React from 'react';
import { OFFICIAL_ALLERGENS } from '@/data/allergens';

interface AllergenBadgeProps {
  type: string;
  showText?: boolean;
}

export const AllergenBadge: React.FC<AllergenBadgeProps> = ({ type, showText = true }) => {
  const normalized = type.toLowerCase().trim();
  const allergen = OFFICIAL_ALLERGENS.find(
    (a) => a.id === normalized || a.name.toLowerCase().includes(normalized) || a.shortName.toLowerCase() === normalized
  );

  if (!allergen) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
        ⚠️ {type}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${allergen.bg} ${allergen.color} ${allergen.border} transition-all shadow-2xs`}
      title={`Contiene ${allergen.name} — ${allergen.description}`}
    >
      <span>{allergen.emoji}</span>
      {showText && <span>{allergen.shortName}</span>}
    </span>
  );
};
