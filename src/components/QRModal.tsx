'use client';

import React, { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Download, Share2, Sparkles, Check, Printer } from 'lucide-react';
import { Restaurant } from '@/data/restaurants';

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurant: Restaurant;
}

export const QRModal: React.FC<QRModalProps> = ({ isOpen, onClose, restaurant }) => {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://gastrotorre.vercel.app';
  const targetUrl = `${baseUrl}/restaurante/${restaurant.slug}?src=qr_mesa`;

  const handleCopy = () => {
    navigator.clipboard.writeText(targetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPNG = () => {
    try {
      setDownloading(true);
      const svgElement = qrRef.current?.querySelector('svg');
      if (!svgElement) return;

      const svgData = new XMLSerializer().serializeToString(svgElement);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      canvas.width = 600;
      canvas.height = 780;

      img.onload = () => {
        if (!ctx) return;
        // Background card
        ctx.fillStyle = '#ffffff';
        ctx.roundRect(0, 0, 600, 780, 30);
        ctx.fill();

        // Top Header - GastroTorre Black
        ctx.fillStyle = '#111111';
        ctx.fillRect(0, 0, 600, 140);

        // Header Title
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 30px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(restaurant.name.toUpperCase(), 300, 65);

        ctx.font = 'bold 16px sans-serif';
        ctx.fillStyle = '#FFCC00'; // GastroTorre Yellow Oficial
        ctx.fillText('GASTROTORRE • CARTA DIGITAL OFICIAL', 300, 105);

        // Subtitle
        ctx.fillStyle = '#111111';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText('Escanea para ver la Carta 📖', 300, 195);

        // Draw QR
        ctx.drawImage(img, 150, 225, 300, 300);

        // Under QR Branding
        ctx.fillStyle = '#111111';
        ctx.font = 'bold 22px sans-serif';
        ctx.fillText('Proporcionado por GastroTorre', 300, 565);

        ctx.fillStyle = '#555555';
        ctx.font = '16px sans-serif';
        ctx.fillText('Cartas Digitales de Torrelodones • Sin descargas', 300, 595);

        // Bottom border bar
        ctx.fillStyle = '#FFCC00';
        ctx.fillRect(40, 635, 520, 3);

        // Website footer
        ctx.fillStyle = '#111111';
        ctx.font = 'bold 17px sans-serif';
        ctx.fillText('www.gastrotorre.es', 300, 675);

        // Export PNG
        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `QR-${restaurant.slug}-GastroTorre.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        setDownloading(false);
      };

      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    } catch (e) {
      console.error('Error downloading PNG QR', e);
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 animate-scaleUp">
        {/* Header */}
        <div className="bg-[#111111] p-5 text-white flex items-center justify-between border-b border-[#FFCC00]/40">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#FFCC00]">
              Código QR Oficial
            </span>
            <h3 className="text-lg font-black">{restaurant.name}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content & QR Mockup Card */}
        <div className="p-6 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Coloca este código QR en las mesas o escaparate. El QR nunca cambia aunque modifiques la carta.
          </p>

          {/* Standee Preview */}
          <div
            ref={qrRef}
            className="relative mx-auto bg-gradient-to-b from-amber-50/60 to-slate-50/40 dark:from-slate-800 dark:to-slate-850 p-6 rounded-2xl border-2 border-dashed border-[#FFCC00]/50 dark:border-[#FFCC00]/40 shadow-inner flex flex-col items-center"
          >
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-xs font-black text-slate-900 dark:text-white tracking-tight">GASTROTORRE</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFCC00]"></span>
              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Carta Digital</span>
            </div>

            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">
              Escanea para ver la Carta 📖
            </h4>

            {/* QR SVG */}
            <div className="p-3 bg-white rounded-xl shadow-md border border-slate-100">
              <QRCodeSVG
                value={targetUrl}
                size={170}
                level="H"
                includeMargin={false}
              />
            </div>

            {/* PROPORCIONADO POR GASTROTORRE BRANDING */}
            <div className="mt-3.5 flex flex-col items-center gap-0.5">
              <div className="flex items-center gap-1 text-xs font-black text-slate-800 dark:text-slate-200">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFCC00]"></span>
                <span>Proporcionado por GastroTorre</span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                Cartas Digitales de Torrelodones
              </span>
            </div>

            <div className="mt-2.5 flex items-center gap-1 text-[10px] font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
              <Sparkles className="w-3 h-3 text-[#FFCC00]" />
              <span>Sin apps • Carga al instante</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-5 grid grid-cols-3 gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center justify-center gap-1 py-2.5 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all active:scale-95"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-slate-600" />}
              <span>{copied ? '¡Listo!' : 'Copiar'}</span>
            </button>

            <button
              onClick={handleDownloadPNG}
              disabled={downloading}
              className="flex items-center justify-center gap-1 py-2.5 px-2 rounded-xl bg-[#FFCC00]/15 hover:bg-[#FFCC00]/25 dark:bg-[#FFCC00]/15 dark:hover:bg-[#FFCC00]/25 text-[#111111] dark:text-white text-xs font-black transition-all active:scale-95 border border-[#FFCC00]/40"
              title="Descargar imagen PNG para imprimir"
            >
              <Download className="w-3.5 h-3.5 text-[#111111] dark:text-[#FFCC00]" />
              <span>{downloading ? 'Generando...' : 'Descargar'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-1 py-2.5 px-2 rounded-xl bg-[#FFCC00] hover:bg-[#e6b800] text-[#111111] text-xs font-black transition-all shadow-md active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
