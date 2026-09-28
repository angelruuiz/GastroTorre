'use client';

import React, { useState, useEffect } from 'react';
import { Star, CheckCircle2, Sparkles, HeartHandshake, Lock } from 'lucide-react';

interface RatingFooterProps {
  restaurantId: string;
  restaurantName: string;
  onRatingSubmitted?: (rating: number) => void;
  onOpenReviewGate?: (score: number) => void;
}

export const RatingFooter: React.FC<RatingFooterProps> = ({
  restaurantId,
  restaurantName,
  onRatingSubmitted,
  onOpenReviewGate
}) => {
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [hasVoted, setHasVoted] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && restaurantId) {
      const stored = localStorage.getItem(`has_rated_${restaurantId}`);
      if (stored) {
        setUserRating(Number(stored));
        setHasVoted(true);
      }
    }
  }, [restaurantId]);

  const handleRate = async (score: number) => {
    // Si ya ha votado, está completamente bloqueado (inmutable)
    if (hasVoted || isSubmitting) return;

    setIsSubmitting(true);
    setUserRating(score);
    setHasVoted(true);

    // 1. Guardar voto inmutable en localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(`has_rated_${restaurantId}`, String(score));
    }

    try {
      // 2. Enviar a Supabase telemetría y recalcular nota
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurant_id: restaurantId,
          event_type: 'RATING_SUBMIT',
          event_value: String(score),
          rating: score
        })
      });

      if (onRatingSubmitted) {
        onRatingSubmitted(score);
      }

      // 3. Abrir ReviewGateModal de forma directa e inmutable
      if (onOpenReviewGate) {
        setTimeout(() => {
          onOpenReviewGate(score);
        }, 400);
      }
    } catch (e) {
      console.warn('Rating submission error:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="my-8 p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 text-white shadow-xl border border-slate-700/50 text-center relative overflow-hidden">
      {/* Glow ambient background */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

      {!hasVoted ? (
        <div className="space-y-3 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Valoración de la Experiencia</span>
          </div>

          <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-100">
            ¿Cómo ha sido tu comida en {restaurantName}?
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Toca una estrella para registrar tu opinión en directo:
          </p>

          {/* Interactive 1-5 Star selector */}
          <div className="flex items-center justify-center gap-2 pt-2">
            {[1, 2, 3, 4, 5].map((star) => {
              const isFilled = (hoverRating || userRating || 0) >= star;
              return (
                <button
                  key={star}
                  type="button"
                  disabled={isSubmitting}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => handleRate(star)}
                  className="p-1.5 sm:p-2 rounded-xl transition-all duration-150 hover:scale-125 active:scale-95 focus:outline-none cursor-pointer"
                  aria-label={`Valorar con ${star} estrellas`}
                >
                  <Star
                    className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                      isFilled
                        ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                        : 'text-slate-600 hover:text-slate-400'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          <div className="text-[11px] text-slate-400 pt-1">
            {hoverRating === 5 && '🌟 ¡Experiencia Inolvidable!'}
            {hoverRating === 4 && '👍 Muy Buena'}
            {hoverRating === 3 && '👌 Aceptable'}
            {hoverRating === 2 && '👎 Mejorable'}
            {hoverRating === 1 && '⚠️ Mala Experiencia'}
            {!hoverRating && 'Tu valoración es única y no se puede modificar tras enviarla'}
          </div>
        </div>
      ) : (
        /* ESTADO INMUTABLE: Ya ha votado, no puede cambiar la reseña */
        <div className="py-2 space-y-2.5 relative z-10 animate-fade-in">
          <div className="w-10 h-10 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-white">
            ¡Has valorado {restaurantName} con {userRating} ⭐!
          </h4>
          
          {/* Estrellas fijas / bloqueadas (sin hover ni click) */}
          <div className="flex justify-center gap-1.5 text-amber-400 pointer-events-none py-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-5 h-5 ${
                  s <= (userRating || 5) ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                }`}
              />
            ))}
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-400 text-[11px] font-medium border border-slate-700">
            <Lock className="w-3 h-3 text-slate-400" />
            <span>Valoración registrada y confirmada</span>
          </div>
        </div>
      )}
    </div>
  );
};
