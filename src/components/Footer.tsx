'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Heart, MapPin, Store, UserPlus } from 'lucide-react';
import { JoinGastroTorreModal } from './JoinGastroTorreModal';

export const Footer: React.FC = () => {
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const pathname = usePathname();

  const isAdminPage = pathname?.startsWith('/admin');

  return (
    <>
      <footer className="bg-[#111111] text-white mt-12 border-t border-[#232323]">
        <div className="max-w-md mx-auto px-4 py-8 text-center space-y-6">
          {/* Pitch for new restaurants */}
          {!isAdminPage && (
            <div className="p-5 rounded-3xl bg-[#232323] border border-[#FFCC00]/30 shadow-xl text-left space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#FFCC00] flex items-center justify-center p-1 shrink-0 shadow-md">
                  <img src="/gastrotorre_logo_negro.png" alt="GastroTorre" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">¿Tienes un bar o restaurante en Torrelodones?</h4>
                  <p className="text-[10px] text-[#FFCC00] font-bold uppercase tracking-wider">
                    Digitalización en 48h • 0% Comisiones
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Cartas digitales por QR, ficha centralizada en el buscador del pueblo y gestión automática por Telegram con IA.
              </p>

              <div className="pt-1">
                <button
                  onClick={() => setIsJoinOpen(true)}
                  className="w-full py-3 px-4 rounded-2xl bg-[#FFCC00] hover:bg-[#e6b800] text-[#111111] text-xs font-black shadow-lg shadow-[#FFCC00]/25 transition-all active:scale-95 flex items-center justify-center gap-2 text-center"
                >
                  <UserPlus className="w-4 h-4 text-[#111111]" />
                  <span>Unir mi Restaurante a GastroTorre ✨</span>
                </button>
              </div>
            </div>
          )}

          {/* Local Torrelodones Badge */}
          <div className="flex flex-col items-center justify-center space-y-2 text-xs text-slate-400">
            <div className="flex items-center gap-1.5 text-slate-200 font-bold">
              <MapPin className="w-4 h-4 text-[#FFCC00]" />
              <span>Digitalizando y uniendo la hostelería de Torrelodones</span>
            </div>
            <p className="text-[11px] text-[#888888]">
              Un pueblo, un buscador. Toda la oferta gastronómica de Torrelodones bajo un mismo techo digital.
            </p>
          </div>

          {/* Copyright */}
          <div className="pt-4 border-t border-[#232323] text-[11px] text-[#888888] flex items-center justify-center gap-1">
            <span>Hecho con</span>
            <Heart className="w-3.5 h-3.5 text-[#FFCC00] fill-[#FFCC00] inline" />
            <span>para los hosteleros de Torrelodones © 2026</span>
          </div>
        </div>
      </footer>

      {/* Onboarding Modal */}
      {isJoinOpen && (
        <JoinGastroTorreModal
          isOpen={isJoinOpen}
          onClose={() => setIsJoinOpen(false)}
        />
      )}
    </>
  );
};
