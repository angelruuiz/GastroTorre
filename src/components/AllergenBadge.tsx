'use client';

import React, { useState, useRef, useEffect } from 'react';
import { getAllergenInfo } from '@/data/allergens';
import { Info, X, ShieldAlert } from 'lucide-react';

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
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const allergen = getAllergenInfo(type);
  const labelText = prefix
    ? allergen.badgeLabel || `Contiene ${allergen.shortName}`
    : allergen.shortName;

  // Handle tap outside to close popover safely on touch devices
  useEffect(() => {
    if (!isOpen) return;

    const handleTouchOrClickOutside = (event: MouseEvent | TouchEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleTouchOrClickOutside);
    document.addEventListener('touchstart', handleTouchOrClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleTouchOrClickOutside);
      document.removeEventListener('touchstart', handleTouchOrClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block" ref={popoverRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        aria-expanded={isOpen}
        aria-label={`Ver información sobre alérgeno ${allergen.name}`}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold tracking-tight border ${allergen.bg} ${allergen.color} ${allergen.border} transition-all active:scale-95 hover:brightness-95 cursor-pointer shadow-xs select-none`}
      >
        <span className="text-sm shrink-0 leading-none">{allergen.emoji}</span>
        {showText && (
          <span className="leading-tight text-slate-900 dark:text-white font-bold whitespace-nowrap">
            {labelText}
          </span>
        )}
        <Info className="w-3 h-3 opacity-60 ml-0.5 shrink-0" />
      </button>

      {/* Touch-Friendly Accessible Popover */}
      {isOpen && (
        <div 
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 max-w-[85vw] p-3.5 bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-300 dark:border-slate-700 shadow-2xl animate-fadeIn text-left space-y-2"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-xl p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">{allergen.emoji}</span>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 block flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" />
                  Alérgeno Oficial UE
                </span>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  {allergen.name}
                </h4>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            {allergen.description}
          </p>

          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl p-2 text-[10px] text-amber-800 dark:text-amber-300 font-medium">
            ⚠️ Si tienes alergia severa, avisa siempre al camarero antes de ordenar.
          </div>
        </div>
      )}
    </div>
  );
};
