'use client';

import React from 'react';
import { X, Printer, CheckCircle2, QrCode, Smartphone, Zap, TrendingUp, ShieldCheck } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-scaleUp max-h-[92vh] overflow-y-auto">
        {/* Top bar */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <span className="text-xs font-bold text-oro-400">Dossier Comercial Imprimible</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1 rounded-xl bg-torre-600 hover:bg-torre-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / Guardar PDF</span>
            </button>
            <button onClick={onClose} className="p-1 rounded-lg bg-white/10 text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable One-Pager Content */}
        <div className="p-6 space-y-5 bg-white text-slate-900">
          {/* Header */}
          <div className="border-b-2 border-torre-600 pb-4 text-center space-y-1">
            <span className="text-xs uppercase font-black tracking-widest text-torre-700">
              Guía Oficial de Hostelería de Torrelodones
            </span>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              Gastro<span className="text-torre-600">Torre</span>
            </h2>
            <p className="text-xs text-slate-600 font-medium">
              Digitalización de cartas, códigos QR inmutables y visibilidad local en 24 horas.
            </p>
          </div>

          {/* Value Props 4 Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-torre-50/80 border border-torre-200 space-y-1">
              <div className="flex items-center gap-1.5 font-black text-torre-950">
                <Zap className="w-4 h-4 text-torre-600 shrink-0" />
                <span>Carga en &lt; 1 seg</span>
              </div>
              <p className="text-[11px] text-slate-600">
                Sin PDFs pesados ni apps que descargar. Tus clientes ven la carta al instante.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-torre-50/80 border border-torre-200 space-y-1">
              <div className="flex items-center gap-1.5 font-black text-torre-950">
                <QrCode className="w-4 h-4 text-torre-600 shrink-0" />
                <span>QR Inmutable</span>
              </div>
              <p className="text-[11px] text-slate-600">
                El código QR de tus mesas <strong>nunca cambia</strong> aunque modifiques precios o platos.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-torre-50/80 border border-torre-200 space-y-1">
              <div className="flex items-center gap-1.5 font-black text-torre-950">
                <Smartphone className="w-4 h-4 text-torre-600 shrink-0" />
                <span>Autogestión Fácil</span>
              </div>
              <p className="text-[11px] text-slate-600">
                Marca platos como &quot;Agotados&quot; o cambia precios en 3 segundos desde tu móvil.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-torre-50/80 border border-torre-200 space-y-1">
              <div className="flex items-center gap-1.5 font-black text-torre-950">
                <TrendingUp className="w-4 h-4 text-torre-600 shrink-0" />
                <span>Reservas Directas</span>
              </div>
              <p className="text-[11px] text-slate-600">
                Sin comisiones intermedias: botón directo a tu llamada o WhatsApp.
              </p>
            </div>
          </div>

          {/* Pack Launch Promo */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-sm text-oro-400">Pack Hostelería Torrelodones</h4>
              <span className="text-[11px] font-bold bg-torre-600 text-white px-2 py-0.5 rounded-full">
                Sin permanencia
              </span>
            </div>
            <ul className="text-xs space-y-1 text-slate-200">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Digitalización y montaje completo de tu carta en 24h.</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Archivos vectorizados del QR listos para imprimir en mesas.</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Panel privado con métricas de lecturas y control de stock.</span>
              </li>
            </ul>
          </div>

          {/* Contact footer */}
          <div className="border-t border-slate-200 pt-3 text-center space-y-1 text-xs">
            <p className="font-black text-slate-900">¿Quieres tu restaurante en GastroTorre?</p>
            <p className="text-slate-600">WhatsApp / Teléfono: <strong className="font-bold text-torre-700">+34 612 34 56 78</strong></p>
            <p className="text-[11px] text-slate-400">www.gastrotorre.es • Torrelodones (Madrid)</p>
          </div>
        </div>
      </div>
    </div>
  );
};
