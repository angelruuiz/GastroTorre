'use client';

import React, { useState } from 'react';
import { Star, MessageCircle, ExternalLink, Heart, Sparkles, CheckCircle2, RotateCcw } from 'lucide-react';
import { Restaurant } from '@/data/restaurants';

interface GoogleReviewsBoosterProps {
  restaurant: Restaurant;
}

export const GoogleReviewsBooster: React.FC<GoogleReviewsBoosterProps> = ({ restaurant }) => {
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  // Construct WhatsApp fallback message for 1-3 stars
  const feedbackMessage = encodeURIComponent(
    `Hola, acabo de estar en ${restaurant.name} y me gustaría comentaros una sugerencia sobre mi visita para ayudaros a mejorar:`
  );
  const whatsappUrl = `https://wa.me/${restaurant.whatsapp.replace(/[^0-9]/g, '')}?text=${feedbackMessage}`;

  return (
    <div className="bg-gradient-to-br from-white via-slate-50 to-blue-50/40 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-soft space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-oro-100 dark:bg-oro-900/40 text-oro-600 flex items-center justify-center">
            <Star className="w-4 h-4 fill-oro-500 text-oro-500" />
          </div>
          <div>
            <h4 className="text-xs uppercase font-bold text-oro-600 dark:text-oro-400 tracking-wider">
              Tu Opinión Cuenta
            </h4>
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              ¿Qué tal tu experiencia hoy?
            </h3>
          </div>
        </div>

        {selectedRating !== null && (
          <button
            onClick={() => setSelectedRating(null)}
            className="text-[10px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Cambiar</span>
          </button>
        )}
      </div>

      {/* Initial State: Star Rating Selector */}
      {selectedRating === null && (
        <div className="space-y-3">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Toca las estrellas para calificar tu visita en <strong className="font-bold text-slate-900 dark:text-white">{restaurant.name}</strong>:
          </p>

          <div className="flex items-center justify-center gap-2.5 py-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(null)}
                onClick={() => setSelectedRating(star)}
                className="p-2 rounded-2xl hover:scale-115 active:scale-95 transition-all bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs hover:border-oro-400 hover:shadow-md group"
                title={`${star} de 5 estrellas`}
              >
                <Star
                  className={`w-7 h-7 transition-colors ${
                    (hoverRating !== null ? star <= hoverRating : false)
                      ? 'fill-amber-400 text-amber-500'
                      : 'text-slate-300 dark:text-slate-600'
                  }`}
                />
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 px-4">
            <span>A mejorar</span>
            <span>¡Excelente! ⭐</span>
          </div>
        </div>
      )}

      {/* 4 or 5 STARS STATE: REDIRECT TO GOOGLE MAPS */}
      {selectedRating !== null && selectedRating >= 4 && (
        <div className="bg-gradient-to-br from-amber-500/10 via-emerald-500/10 to-blue-500/10 p-4 rounded-2xl border border-amber-300/40 dark:border-amber-500/30 space-y-3 animate-fadeIn">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-oro-500 animate-bounce" />
            <span className="text-xs font-black text-slate-900 dark:text-white">
              ¡Nos alegra muchísimo que hayas disfrutado! 🎉
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Tu opinión ayuda a que más vecinos y visitantes de Torrelodones conozcan <strong className="font-bold text-slate-900 dark:text-white">{restaurant.name}</strong>. ¿Nos dejas tu reseña en Google? Solo te llevará 15 segundos.
          </p>

          <a
            href={restaurant.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-torre-600 hover:bg-torre-700 text-white text-xs font-black shadow-md shadow-blue-600/20 transition-all active:scale-98"
          >
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>Publicar Reseña en Google Maps ⭐⭐⭐⭐⭐</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {/* 1, 2 or 3 STARS STATE: PRIVATE FEEDBACK CHANNEL */}
      {selectedRating !== null && selectedRating <= 3 && (
        <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-2xl border border-amber-200 dark:border-amber-800/40 space-y-3 animate-fadeIn">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="text-xs font-black text-amber-950 dark:text-amber-200">
              Sentimos que no haya sido una experiencia de 10 🙏
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Queremos mejorar día a día. Cuéntanos qué ha fallado directamente al responsable antes de salir para solucionarlo de inmediato:
          </p>

          {restaurant.whatsapp && restaurant.whatsapp.trim().length > 0 ? (
            <a
              href={`https://wa.me/${restaurant.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola, acabo de estar en ${restaurant.name} y me gustaría comentaros una sugerencia sobre mi visita para ayudaros a mejorar:`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all active:scale-98"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Comentar al Encargado por WhatsApp</span>
            </a>
          ) : restaurant.phone && restaurant.phone.trim().length > 0 ? (
            <a
              href={`tel:${restaurant.phone.replace(/[^0-9+]/g, '')}`}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold shadow-md transition-all active:scale-98"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Llamar al Responsable del Local</span>
            </a>
          ) : (
            <div className="p-3 bg-white/80 dark:bg-slate-800 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 text-center">
              Por favor, pide hablar con el responsable de sala para que podamos atenderte en persona.
            </div>
          )}
        </div>
      )}

      <div className="pt-1 text-center">
        <span className="text-[10px] text-slate-400 font-medium">
          Multiplicador de Calidad · GastroTorre Torrelodones
        </span>
      </div>
    </div>
  );
};
