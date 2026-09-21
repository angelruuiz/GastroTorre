'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Restaurant } from '@/data/restaurants';
import { getWeeklyRestaurant } from '@/utils/schedule';
import { Sparkles, Star, MapPin, ArrowRight, Dices, Flame } from 'lucide-react';
import { RandomPickerModal } from './RandomPickerModal';

interface FeaturedWeeklyBannerProps {
  restaurants: Restaurant[];
}

export const FeaturedWeeklyBanner: React.FC<FeaturedWeeklyBannerProps> = ({ restaurants }) => {
  const [featured, setFeatured] = useState<Restaurant | null>(null);
  const [isRouletteOpen, setIsRouletteOpen] = useState(false);

  useEffect(() => {
    if (restaurants.length > 0) {
      setFeatured(getWeeklyRestaurant(restaurants));
    }
  }, [restaurants]);

  if (!featured) return null;

  // Find a signature specialty dish
  const specialtyDish = featured.menu
    .flatMap((cat) => cat.dishes)
    .find((d) => d.isSpecialty) || featured.menu[0]?.dishes[0];

  return (
    <>
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-torre-950 via-slate-950 to-amber-950 text-white p-4 shadow-float border border-oro-400/30">
        {/* Background ambient lighting */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-torre-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-oro-500/15 rounded-full blur-2xl pointer-events-none"></div>

        {/* Top Header Tag */}
        <div className="flex items-center justify-between gap-2 mb-3 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-torre-600 text-white text-[11px] font-black uppercase tracking-wider shadow-sm">
            <Flame className="w-3.5 h-3.5 text-oro-400 fill-oro-400" />
            <span>Recomendación de la Semana</span>
          </div>

          <button
            onClick={() => setIsRouletteOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-amber-200 text-[11px] font-bold border border-white/10 transition-all active:scale-95"
            title="Girar ruleta aleatoria"
          >
            <Dices className="w-3.5 h-3.5 text-oro-400" />
            <span>Sorpréndeme 🎲</span>
          </button>
        </div>

        {/* Card Body */}
        <div className="relative z-10 space-y-3">
          {/* Main info row */}
          <div className="flex gap-3 items-center">
            <Link
              href={`/restaurante/${featured.slug}`}
              className="relative w-24 h-24 rounded-2xl overflow-hidden bg-slate-800 shrink-0 border border-oro-400/30 shadow-md group/img cursor-pointer"
            >
              <img
                src={featured.coverImage}
                alt={featured.name}
                className="w-full h-full object-cover group-hover/img:scale-105 transition-transform"
              />
              <div className="absolute bottom-1 right-1 px-1.5 py-0.2 rounded-md bg-black/80 text-[10px] font-black text-oro-400 flex items-center gap-0.5">
                <Star className="w-2.5 h-2.5 fill-amber-400" />
                <span>{featured.rating}</span>
              </div>
            </Link>

            <div className="flex-1 min-w-0 space-y-1">
              <span className="text-[10px] font-bold text-oro-400 uppercase tracking-wide">
                {featured.cuisine}
              </span>
              <Link href={`/restaurante/${featured.slug}`} className="block">
                <h3 className="text-base font-black text-white leading-tight truncate hover:text-oro-300 transition-colors">
                  {featured.name}
                </h3>
              </Link>
              <p className="text-[11px] text-slate-300 line-clamp-2 leading-snug">
                {featured.tagline}
              </p>
              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                <MapPin className="w-3 h-3 text-oro-400 shrink-0" />
                <span className="truncate">{featured.zone}</span>
              </div>
            </div>
          </div>

          {/* Specialty Dish Highlight Pill */}
          {specialtyDish && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 truncate pr-2">
                <span className="text-oro-400 text-sm">⭐</span>
                <div className="truncate">
                  <p className="text-[10px] font-bold uppercase text-oro-300">Plato Imprescindible:</p>
                  <p className="text-[11px] font-bold text-white truncate">{specialtyDish.name}</p>
                </div>
              </div>
              <span className="text-xs font-black text-oro-300 bg-oro-500/20 px-2 py-0.5 rounded-lg border border-oro-500/30 shrink-0">
                {specialtyDish.price.toFixed(2)}€
              </span>
            </div>
          )}

          {/* CTA Button */}
          <Link
            href={`/restaurante/${featured.slug}`}
            className="w-full py-2.5 px-4 rounded-xl bg-torre-600 hover:bg-torre-700 text-white text-xs font-black shadow-md shadow-blue-600/30 flex items-center justify-center gap-1.5 transition-all active:scale-98 text-center"
          >
            <span>Ver Carta Completa de {featured.name.split(' ')[0]}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Random Roulette Picker Modal */}
      <RandomPickerModal
        isOpen={isRouletteOpen}
        onClose={() => setIsRouletteOpen(false)}
        restaurants={restaurants}
      />
    </>
  );
};
