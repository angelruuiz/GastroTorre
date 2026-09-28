'use client';

import React from 'react';
import { Star, ShieldCheck, TrendingUp } from 'lucide-react';

interface RatingHeaderProps {
  rating: number;
  reviewsCount: number;
  isVerified?: boolean;
  googleMapsUrl?: string | null;
  onOpenReviews?: () => void;
}

export const RatingHeader: React.FC<RatingHeaderProps> = ({
  rating,
  reviewsCount,
  isVerified = true,
  googleMapsUrl,
  onOpenReviews
}) => {
  const formattedRating = Number(rating || 4.8).toFixed(1);
  const formattedCount = Number(reviewsCount || 0).toLocaleString('es-ES');

  return (
    <div className="flex flex-wrap items-center gap-2 pt-1 pb-2">
      {/* Live Reputation Pill */}
      <button
        onClick={onOpenReviews}
        type="button"
        className="group inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/20 dark:border-amber-400/20 hover:bg-amber-500/20 transition-all duration-200 text-amber-700 dark:text-amber-300 text-xs font-bold shadow-sm"
        title="Ver opiniones y valorar experiencia"
      >
        <div className="flex items-center gap-0.5 text-amber-500 dark:text-amber-400">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
        </div>
        <span className="font-extrabold text-slate-900 dark:text-white">{formattedRating}</span>
        <span className="text-slate-500 dark:text-slate-400 font-medium">({formattedCount} opiniones)</span>
        <TrendingUp className="w-3 h-3 text-emerald-500 ml-0.5 opacity-80 group-hover:scale-110 transition-transform" />
      </button>

      {/* Verified Local Badge */}
      {isVerified && (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-400/10 border border-emerald-500/20 dark:border-emerald-400/20 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold">
          <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          <span>Verificado Torrelodones</span>
        </span>
      )}
    </div>
  );
};
