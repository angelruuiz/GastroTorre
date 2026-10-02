'use client';

import React from 'react';
import { X, Printer, CheckCircle2, QrCode, Smartphone, Zap, TrendingUp } from 'lucide-react';

interface DossierModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DossierModal: React.FC<DossierModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-white dark:bg-[#111111] rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-[#232323] animate-scaleUp max-h-[92vh] overflow-y-auto">
        {/* Top bar */}
        <div className="p-4 bg-[#111111] text-white flex items-center justify-between print:hidden border-b border-[#232323]">
          <span className="text-xs font-bold text-[#FFCC00]">Dossier Comercial GastroTorre 2026</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-[#FFCC00] hover:bg-[#e6b800] text-[#111111] text-xs font-black flex items-center gap-1 shadow-md shadow-[#FFCC00]/20"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / PDF</span>
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg bg-white/10 text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable One-Pager Content */}
        <div className="p-6 space-y-5 bg-white dark:bg-[#111111] text-slate-900 dark:text-white">
          {/* Header */}
          <div className="border-b-2 border-[#FFCC00] pb-4 text-center space-y-1 relative">
            <div className="w-12 h-12 rounded-2xl bg-[#FFCC00] flex items-center justify-center p-1.5 mx-auto mb-2 shadow-md">
              <img src="/gastrotorre_logo_negro.png" alt="GastroTorre" className="w-full h-full object-contain" />
            </div>
            <span className="text-[10px] uppercase font-black tracking-widest text-[#111111] dark:text-[#FFCC00] bg-[#FFCC00]/20 px-2 py-0.5 rounded-full border border-[#FFCC00]/30 inline-block">
              Guía Oficial de Hostelería de Torrelodones
            </span>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              GASTRO<span className="text-[#FFCC00]">TORRE</span>
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
              Cartas digitales por QR, ficha centralizada, gestión por Telegram con IA y 0% comisiones.
            </p>
          </div>

          {/* Value Props 4 Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-[#F4F4F2] dark:bg-[#232323] border border-slate-200 dark:border-[#232323] space-y-1">
              <div className="flex items-center gap-1.5 font-black text-slate-900 dark:text-white">
                <Zap className="w-4 h-4 text-[#FFCC00] shrink-0 fill-[#FFCC00]" />
                <span>Carga en &lt; 1 seg</span>
              </div>
              <p className="text-[11px] text-[#555555] dark:text-slate-400">
                Sin PDFs pesados ni descargas. Tus clientes ven la carta al instante en su móvil.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-[#F4F4F2] dark:bg-[#232323] border border-slate-200 dark:border-[#232323] space-y-1">
              <div className="flex items-center gap-1.5 font-black text-slate-900 dark:text-white">
                <QrCode className="w-4 h-4 text-[#FFCC00] shrink-0" />
                <span>QR Inmutable</span>
              </div>
              <p className="text-[11px] text-[#555555] dark:text-slate-400">
                El código QR de tus mesas <strong>nunca cambia</strong> aunque modifiques precios o platos.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-[#F4F4F2] dark:bg-[#232323] border border-slate-200 dark:border-[#232323] space-y-1">
              <div className="flex items-center gap-1.5 font-black text-slate-900 dark:text-white">
                <Smartphone className="w-4 h-4 text-[#FFCC00] shrink-0" />
                <span>Gestión Telegram IA</span>
              </div>
              <p className="text-[11px] text-[#555555] dark:text-slate-400">
                Envía un audio por Telegram y tu carta se actualiza en tiempo real sin paneles raros.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-[#F4F4F2] dark:bg-[#232323] border border-slate-200 dark:border-[#232323] space-y-1">
              <div className="flex items-center gap-1.5 font-black text-slate-900 dark:text-white">
                <TrendingUp className="w-4 h-4 text-[#FFCC00] shrink-0" />
                <span>0% Comisiones</span>
              </div>
              <p className="text-[11px] text-[#555555] dark:text-slate-400">
                Cuota fija mensual. El 100% del beneficio va directo a la caja de tu restaurante.
              </p>
            </div>
          </div>

          {/* Planes Oficiales */}
          <div className="p-4 rounded-2xl bg-[#111111] text-white space-y-2 border border-[#FFCC00]/40">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-sm text-[#FFCC00]">Tarifas Oficiales GastroTorre</h4>
              <span className="text-[10px] font-bold bg-[#FFCC00] text-[#111111] px-2 py-0.5 rounded-full">
                Alta en 48h
              </span>
            </div>
            <ul className="text-xs space-y-1.5 text-slate-200 pt-1">
              <li className="flex items-center justify-between">
                <span>• Plan Esencial (Carta QR):</span>
                <strong className="text-[#FFCC00]">35 €/mes + IVA</strong>
              </li>
              <li className="flex items-center justify-between font-bold text-white bg-[#232323] p-1.5 rounded-xl border border-[#FFCC00]/30">
                <span>⭐ Plan Pro Hostelero (Recomendado):</span>
                <strong className="text-[#FFCC00]">59 €/mes + IVA</strong>
              </li>
              <li className="flex items-center justify-between">
                <span>• Servicio VIP Completo (Premium 360):</span>
                <strong className="text-[#FFCC00]">89 €/mes + IVA</strong>
              </li>
            </ul>
          </div>

          {/* Contact footer */}
          <div className="border-t border-slate-200 dark:border-[#232323] pt-3 text-center space-y-1 text-xs">
            <p className="font-black text-slate-900 dark:text-white">Ángel Ruiz — CEO de GastroTorre</p>
            <p className="text-[#555555] dark:text-slate-400">Contacto: <strong className="font-bold text-[#FFCC00]">+34 600 000 000</strong></p>
            <p className="text-[11px] text-[#888888]">www.gastrotorre.es • Torrelodones (Madrid)</p>
          </div>
        </div>
      </div>
    </div>
  );
};
