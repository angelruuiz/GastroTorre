'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { Restaurant } from '@/data/restaurants';
import { X, Dices, Sparkles, Star, MapPin, ArrowRight, RotateCw } from 'lucide-react';

interface RandomPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurants: Restaurant[];
}

export const RandomPickerModal: React.FC<RandomPickerModalProps> = ({
  isOpen,
  onClose,
  restaurants,
}) => {
  const [selected, setSelected] = useState<Restaurant | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  if (!isOpen) return null;

  const spinRoulette = () => {
    if (restaurants.length === 0) return;
    setIsSpinning(true);

    let counter = 0;
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * restaurants.length);
      setSelected(restaurants[randomIndex]);
      counter++;
      if (counter > 12) {
        clearInterval(interval);
        setIsSpinning(false);
        try {
          confetti({
            particleCount: 70,
            spread: 60,
            origin: { y: 0.6 },
          });
        } catch (e) {
          // fallback
        }
      }
    }, 80);
  };

  // If no restaurant selected yet, spin once
  if (!selected && restaurants.length > 0 && !isSpinning) {
    spinRoulette();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 animate-scaleUp">
        {/* Header */}
        <div className="bg-torre-700 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-white/20">
              <Dices className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-oro-200 tracking-wider">
                Ruleta Gastronómica
              </span>
              <h3 className="text-base font-black">¿Dónde comemos hoy?</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 text-center space-y-4">
          <p className="text-xs text-slate-500">
            Descubre un rincón único de Torrelodones elegido por el azar.
          </p>

          {selected && (
            <div className={`p-4 rounded-2xl bg-gradient-to-b from-blue-50/60 to-amber-50/40 border border-torre-200 shadow-sm transition-all ${isSpinning ? 'scale-95 blur-[1px]' : 'scale-100'}`}>
              <div className="relative h-32 w-full rounded-xl overflow-hidden bg-slate-100 mb-3 shadow-sm">
                <img
                  src={selected.coverImage}
                  alt={selected.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/70 text-white text-[10px] font-black flex items-center gap-1">
                  <Star className="w-3 h-3 text-oro-400 fill-amber-400" />
                  <span>{selected.rating}</span>
                </div>
              </div>

              <span className="text-[10px] font-bold text-torre-700 uppercase tracking-wider">
                {selected.cuisine}
              </span>
              <h4 className="text-base font-black text-slate-900 leading-tight mt-0.5">
                {selected.name}
              </h4>
              <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                {selected.tagline}
              </p>

              <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500 mt-2">
                <MapPin className="w-3.5 h-3.5 text-torre-600" />
                <span>{selected.zone}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={spinRoulette}
              disabled={isSpinning}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all active:scale-95 disabled:opacity-50"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isSpinning ? 'animate-spin' : ''}`} />
              <span>Girar Otra Vez</span>
            </button>

            {selected && (
              <Link
                href={`/restaurante/${selected.slug}`}
                onClick={onClose}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-torre-600 hover:bg-torre-700 text-white text-xs font-black shadow-md shadow-blue-500/20 active:scale-95 transition-all text-center"
              >
                <span>Ver su Carta</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
