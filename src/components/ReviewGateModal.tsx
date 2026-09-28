'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Star, 
  X, 
  ExternalLink, 
  Send, 
  Heart, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  Lock 
} from 'lucide-react';

interface ReviewGateModalProps {
  restaurantId: string;
  restaurantName: string;
  googleMapsUrl?: string | null;
  googlePlaceId?: string | null;
  isOpenExplicitly?: boolean;
  initialScore?: number | null;
  onClose?: () => void;
}

export const ReviewGateModal: React.FC<ReviewGateModalProps> = ({
  restaurantId,
  restaurantName,
  googleMapsUrl,
  googlePlaceId,
  isOpenExplicitly = false,
  initialScore = null,
  onClose
}) => {
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedScore, setSelectedScore] = useState<number>(initialScore || 5);
  const [step, setStep] = useState<'rate' | 'positive_google' | 'private_feedback' | 'feedback_sent'>('rate');
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Robust check for demo mode in Next.js
  const isDemo = 
    searchParams?.get('demo') === 'true' || 
    searchParams?.get('demo') === '1' || 
    searchParams?.get('test_modal') === '1' ||
    (typeof window !== 'undefined' && (
      window.location.search.includes('demo=true') || 
      window.location.search.includes('demo=1') ||
      window.location.search.includes('test_modal=1')
    ));

  useEffect(() => {
    // 1. Apertura explícita (al pulsar RatingHeader o RatingFooter)
    if (isOpenExplicitly) {
      if (initialScore) {
        setSelectedScore(initialScore);
        setStep(initialScore >= 4 ? 'positive_google' : 'private_feedback');
      } else {
        setStep('rate');
      }
      setIsOpen(true);
      return;
    }

    if (typeof window === 'undefined' || !restaurantId) return;

    // 2. Modo Demostración (?demo=true) -> Salta a los 2.5 segundos siempre
    if (isDemo) {
      console.log('🚀 [ReviewGate] Modo Demo Detectado: Disparando modal en 2.5 segundos...');
      // Limpiar bloqueos previos para la demo
      sessionStorage.removeItem(`dismissed_review_gate_${restaurantId}`);
      localStorage.removeItem(`completed_review_gate_${restaurantId}`);

      const demoTimer = setTimeout(() => {
        setIsOpen(true);
        fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            restaurant_id: restaurantId,
            event_type: 'REVIEW_GATE_OPEN',
            event_value: 'DEMO_TRIGGER'
          })
        }).catch(() => {});
      }, 2500);

      return () => clearTimeout(demoTimer);
    }

    // 3. Modo Normal (90 minutos)
    const isDismissed = sessionStorage.getItem(`dismissed_review_gate_${restaurantId}`);
    if (isDismissed) return;

    const isCompleted = localStorage.getItem(`completed_review_gate_${restaurantId}`);
    if (isCompleted) return;

    const visitKey = `first_visit_timestamp_${restaurantId}`;
    let firstVisit = localStorage.getItem(visitKey);
    if (!firstVisit) {
      firstVisit = String(Date.now());
      localStorage.setItem(visitKey, firstVisit);
    }

    const elapsedMs = Date.now() - Number(firstVisit);
    const ninetyMinutesMs = 90 * 60 * 1000;

    if (elapsedMs >= ninetyMinutesMs) {
      setIsOpen(true);
    } else {
      const remaining = ninetyMinutesMs - elapsedMs;
      const normalTimer = setTimeout(() => {
        setIsOpen(true);
      }, remaining);
      return () => clearTimeout(normalTimer);
    }
  }, [restaurantId, isOpenExplicitly, initialScore, isDemo]);

  const handleClose = () => {
    setIsOpen(false);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(`dismissed_review_gate_${restaurantId}`, 'true');
    }
    if (onClose) onClose();
  };

  const handleSelectScore = async (score: number) => {
    setSelectedScore(score);

    // Guardar voto inmutable en localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(`has_rated_${restaurantId}`, String(score));
    }

    // Enviar evento de rating
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        restaurant_id: restaurantId,
        event_type: 'RATING_SUBMIT',
        event_value: String(score),
        rating: score
      })
    }).catch(() => {});

    // Bifurcación inmutable
    if (score >= 4) {
      setStep('positive_google');
    } else {
      setStep('private_feedback');
    }
  };

  const handleGoogleRedirect = () => {
    let reviewUrl = googleMapsUrl;
    if (!reviewUrl && googlePlaceId) {
      reviewUrl = `https://search.google.com/local/writereview?placeid=${googlePlaceId}`;
    }
    if (!reviewUrl) {
      reviewUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurantName + ' Torrelodones')}`;
    }

    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        restaurant_id: restaurantId,
        event_type: 'REVIEW_GATE_GOOGLE_CLICK',
        event_value: String(selectedScore),
        rating: selectedScore
      })
    }).catch(() => {});

    if (typeof window !== 'undefined') {
      localStorage.setItem(`completed_review_gate_${restaurantId}`, 'google_maps');
      window.open(reviewUrl, '_blank', 'noopener,noreferrer');
    }

    handleClose();
  };

  const handlePrivateFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurant_id: restaurantId,
          event_type: 'REVIEW_GATE_FEEDBACK_SUBMIT',
          event_value: String(selectedScore),
          rating: selectedScore,
          feedback_text: feedbackText || 'Comentario sin texto detallado'
        })
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem(`completed_review_gate_${restaurantId}`, 'private_feedback');
      }

      setStep('feedback_sent');
      setTimeout(() => {
        handleClose();
      }, 2500);
    } catch (err) {
      console.warn('Feedback submit error:', err);
      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Close button */}
        <button
          onClick={handleClose}
          type="button"
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* STEP 1: INITIAL STAR SELECTION (SI NO VIENE YA VOTADO) */}
        {step === 'rate' && (
          <div className="text-center space-y-4 pt-2">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                ¿Qué tal tu sobremesa en {restaurantName}?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                Tu valoración es directa e inmutable. Elige tu puntuación:
              </p>
            </div>

            {/* Stars */}
            <div className="flex justify-center gap-2 py-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleSelectScore(star)}
                  className="p-1.5 sm:p-2 rounded-xl transition-all duration-150 hover:scale-125 active:scale-95 focus:outline-none cursor-pointer"
                >
                  <Star
                    className={`w-8 h-8 sm:w-9 sm:h-9 transition-colors ${
                      selectedScore >= star
                        ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                        : 'text-slate-300 dark:text-slate-700 hover:text-slate-400'
                    }`}
                  />
                </button>
              ))}
            </div>

            <button
              onClick={handleClose}
              type="button"
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium transition-colors pt-2"
            >
              Ahora no, gracias
            </button>
          </div>
        )}

        {/* STEP 2A: POSITIVE RATING (4-5 STARS) -> GOOGLE MAPS DIRECT */}
        {step === 'positive_google' && (
          <div className="text-center space-y-5 pt-2 animate-fade-in">
            <div className="w-14 h-14 mx-auto rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center shadow-inner">
              <Heart className="w-7 h-7 fill-amber-400 text-amber-500 animate-pulse" />
            </div>

            <div className="space-y-1.5">
              {/* Estrellas bloqueadas (sin cambio de voto) */}
              <div className="flex justify-center gap-1 text-amber-400 pb-1 pointer-events-none">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${
                      s <= selectedScore ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'
                    }`}
                  />
                ))}
              </div>

              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                <Lock className="w-3 h-3" />
                <span>Valoración de {selectedScore} ⭐ registrada</span>
              </div>

              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white pt-1">
                ¡Nos alegra que hayas disfrutado!
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-sm mx-auto leading-relaxed">
                Tu reseña en Google apoya directamente al comercio local de Torrelodones. ¿Nos ayudas publicándola en Google Maps?
              </p>
            </div>

            {/* Prominent Google Maps CTA */}
            <div className="pt-2 space-y-2.5">
              <button
                onClick={handleGoogleRedirect}
                type="button"
                className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transform active:scale-98 transition-all cursor-pointer"
              >
                <span>⭐ Publicar Reseña en Google Maps</span>
                <ExternalLink className="w-4 h-4" />
              </button>

              <button
                onClick={handleClose}
                type="button"
                className="w-full py-2.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-semibold transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}

        {/* STEP 2B: CONSTRUCTIVE RATING (1-3 STARS) -> PRIVATE FEEDBACK ONLY */}
        {step === 'private_feedback' && (
          <form onSubmit={handlePrivateFeedbackSubmit} className="space-y-4 pt-1 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  Queremos mejorar tu experiencia
                </h3>
                <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                  <Lock className="w-3 h-3 text-slate-400" />
                  <span>Mensaje 100% privado directo a la gerencia</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Lamentamos que tu comida no haya sido perfecta ({selectedScore} ⭐). Cuéntanos qué ha fallado para solucionarlo de inmediato:
            </p>

            <textarea
              rows={3}
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Escribe aquí tu sugerencia o queja en privado..."
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              required
            />

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleClose}
                className="w-1/3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-2/3 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold flex items-center justify-center gap-1.5 shadow-md hover:bg-slate-800 dark:hover:bg-slate-100 transition-all disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Enviando...' : 'Enviar en Privado'}</span>
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: PRIVATE FEEDBACK SENT CONFIRMATION */}
        {step === 'feedback_sent' && (
          <div className="text-center space-y-3 py-6 animate-fade-in">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              Comentario recibido en privado
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              Se ha notificado directamente a la dirección de {restaurantName}. ¡Gracias por ayudarnos a perfeccionar nuestro servicio!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
