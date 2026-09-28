'use client';

import React, { useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Check, 
  Share2, 
  ShieldCheck, 
  Info, 
  UtensilsCrossed, 
  Flame,
  AlertCircle
} from 'lucide-react';
import { Dish } from '@/data/restaurants';
import { AllergenBadge } from '@/components/AllergenBadge';
import { OFFICIAL_ALLERGENS } from '@/data/allergens';

interface DishDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  dish: Dish | null;
  categoryName?: string;
  restaurantName?: string;
  restaurantSlug?: string;
}

export const DishDetailModal: React.FC<DishDetailModalProps> = ({
  isOpen,
  onClose,
  dish,
  categoryName,
  restaurantName,
  restaurantSlug
}) => {
  useEffect(() => {
    if (isOpen && dish) {
      // Prevent body scroll when modal is open
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';

      // Keyboard ESC listener
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = originalStyle;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, dish, onClose]);

  if (!isOpen || !dish) return null;

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: `${dish.name} - ${restaurantName || 'GastroTorre'}`,
        text: `Descubre ${dish.name} (${dish.price.toFixed(2)}€) en ${restaurantName || 'Torrelodones'}`,
        url: window.location.href,
      }).catch(() => {});
    } else if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      alert('¡Enlace del plato copiado al portapapeles!');
    }
  };

  const hasAllergens = dish.allergens && dish.allergens.length > 0;
  const dishImg = dish.image || (dish as any).photo_url;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 my-auto animate-scaleUp flex flex-col max-h-[92vh]">
        
        {/* Top Floating Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2 rounded-full bg-black/70 hover:bg-black/90 text-white backdrop-blur-md transition-all active:scale-95 shadow-lg border border-white/20"
          aria-label="Cerrar detalle"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Photo / Header Image */}
        <div className="relative w-full h-56 sm:h-64 bg-slate-950 shrink-0 overflow-hidden">
          {dishImg ? (
            <img
              src={dishImg}
              alt={dish.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950 text-slate-500">
              <UtensilsCrossed className="w-12 h-12 mb-2 text-slate-600" />
              <span className="text-xs font-semibold">Foto en preparación</span>
            </div>
          )}

          {/* Gradient Scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />

          {/* Badges Over Image */}
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 flex-wrap">
              {dish.isSpecialty && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500 text-white text-[11px] font-black uppercase tracking-wider shadow-lg shadow-amber-500/30">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                  Especialidad
                </span>
              )}

              {!dish.isAvailable && (
                <span className="px-2.5 py-1 rounded-xl bg-rose-600 text-white text-[11px] font-black uppercase tracking-wider shadow-lg shadow-rose-600/30">
                  Agotado Hoy
                </span>
              )}

              {dish.isGlutenFree && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-600 text-white text-[11px] font-black uppercase tracking-wider shadow-lg shadow-emerald-600/30">
                  🌾 Sin Gluten
                </span>
              )}

              {dish.isVegan && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-green-600 text-white text-[11px] font-black uppercase tracking-wider shadow-lg shadow-green-600/30">
                  🌱 Vegano
                </span>
              )}

              {dish.isVegetarian && !dish.isVegan && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-teal-600 text-white text-[11px] font-black uppercase tracking-wider shadow-lg shadow-teal-600/30">
                  🥗 Vegetariano
                </span>
              )}
            </div>

            {categoryName && (
              <span className="text-[11px] font-bold text-slate-300 bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-lg border border-white/10">
                {categoryName}
              </span>
            )}
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-slate-900 dark:text-slate-100">
          
          {/* Title and Price Header */}
          <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="space-y-0.5 flex-1">
              {restaurantName && (
                <span className="text-[10px] font-black text-torre-600 dark:text-torre-400 uppercase tracking-widest block">
                  {restaurantName}
                </span>
              )}
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-tight">
                {dish.name}
              </h2>
            </div>

            <div className="text-right shrink-0">
              <span className="text-xl sm:text-2xl font-black text-torre-700 dark:text-torre-400 bg-torre-50 dark:bg-torre-950/80 px-3.5 py-1 rounded-2xl border border-torre-200 dark:border-torre-800 shadow-xs inline-block">
                {dish.price.toFixed(2)} €
              </span>
              <span className="text-[10px] text-slate-400 block font-medium mt-0.5">IVA incluido</span>
            </div>
          </div>

          {/* Detailed Description */}
          <div className="space-y-1.5">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400 block">
              Descripción & Elaboración
            </span>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
              {dish.description || 'Elaborado artesanalmente con ingredientes frescos de primera calidad y según la receta de la casa.'}
            </p>
          </div>

          {/* Allergens & Dietary Breakdown */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Información de Alérgenos
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                Reglamento (UE) 1169/2011
              </span>
            </div>

            {hasAllergens ? (
              <div className="p-3.5 bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/30 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  <span>Este plato contiene los siguientes alérgenos declarados:</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {dish.allergens.map((alg, idx) => (
                    <AllergenBadge key={idx} type={alg} showText={true} prefix={true} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-emerald-500/10 dark:bg-emerald-950/30 border border-emerald-500/30 rounded-2xl flex items-center gap-2.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                <span className="text-base">✅</span>
                <span>Plato sin alérgenos de declaración obligatoria añadidos. Consulta con sala ante intolerancias severas.</span>
              </div>
            )}
          </div>

          {/* Social Proof / Interest Badge */}
          <div className="p-3 rounded-2xl bg-torre-50/70 dark:bg-slate-800/70 border border-torre-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Flame className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="text-[11px] font-medium">
                Plato popular consultado frecuentemente por comensales en mesa.
              </span>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 shrink-0">
          <button
            onClick={handleShare}
            className="px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Share2 className="w-4 h-4 text-torre-600" />
            <span>Compartir</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-torre-600 hover:bg-torre-700 text-white text-xs font-black shadow-md shadow-blue-500/20 transition-all active:scale-95 flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Volver a la Carta</span>
          </button>
        </div>

      </div>
    </div>
  );
};
