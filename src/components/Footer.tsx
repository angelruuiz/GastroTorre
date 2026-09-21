'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, MapPin, Store, UserPlus } from 'lucide-react';
import { JoinGastroTorreModal } from './JoinGastroTorreModal';

export const Footer: React.FC = () => {
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const pathname = usePathname();

  const isAdminPage = pathname?.startsWith('/admin');

  return (
    <>
      <footer className="bg-slate-950 text-white mt-12 border-t border-slate-800">
        <div className="max-w-md mx-auto px-4 py-8 text-center space-y-6">
          {/* Pitch for new restaurants - Hidden inside Admin Panel */}
          {!isAdminPage && (
            <div className="p-5 rounded-3xl bg-gradient-to-br from-torre-950 via-slate-900 to-slate-800 border border-slate-700/80 shadow-lg text-left space-y-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-torre-500/20 text-oro-400">
                  <Store className="w-5 h-5" />
                </span>
                <div>
                  <h4 className="text-sm font-black text-white">¿Tienes un restaurante en Torrelodones?</h4>
                  <p className="text-[10px] text-oro-300 font-bold uppercase tracking-wider">
                    Digitalización en 24h • Sin Permanencias
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Consigue tu código QR inmutable para mesas, actualiza precios al instante y atrae a miles de vecinos y visitantes.
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => setIsJoinOpen(true)}
                  className="py-2.5 px-3 rounded-xl bg-torre-600 hover:bg-torre-700 text-white text-xs font-black shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 text-center"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Solicitar Alta ✨</span>
                </button>

                <Link
                  href="/admin"
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all text-center flex items-center justify-center"
                >
                  Acceso Panel 🎛️
                </Link>
              </div>
            </div>
          )}

          {/* Local Torrelodones Badge */}
          <div className="flex flex-col items-center justify-center space-y-2 text-xs text-slate-400">
            <div className="flex items-center gap-1.5 text-slate-300 font-medium">
              <MapPin className="w-4 h-4 text-torre-400" />
              <span>Torrelodones Pueblo & Torrelodones Colonia (Madrid)</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Impulsando el comercio y la hostelería local con tecnología rápida y accesible.
            </p>
          </div>

          {/* Copyright */}
          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-center gap-1">
            <span>Hecho con</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" />
            <span>para la hostelería de Torrelodones © {new Date().getFullYear()}</span>
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
