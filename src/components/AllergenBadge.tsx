import React from 'react';
import { getAllergenInfo } from '@/data/allergens';

interface AllergenBadgeProps {
  type: string;
  showText?: boolean;
  prefix?: boolean;
}

export const AllergenBadge: React.FC<AllergenBadgeProps> = ({
  type,
  showText = true,
  prefix = true,
}) => {
  const allergen = getAllergenInfo(type);
  const labelText = prefix
    ? allergen.badgeLabel || `Contiene ${allergen.shortName}`
    : allergen.shortName;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold tracking-tight border ${allergen.bg} ${allergen.color} ${allergen.border} transition-all shadow-2xs`}
      title={`Alérgeno: ${allergen.name}. ${allergen.description}`}
    >
      <span className="text-sm shrink-0 leading-none">{allergen.emoji}</span>
      {showText && <span className="leading-tight text-slate-900 dark:text-white font-bold">{labelText}</span>}
    </span>
  );
};



