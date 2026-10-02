'use client';

import React, { useState } from 'react';
import { X, Store, Check, MessageCircle, Send, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { DatabaseService } from '@/lib/database/dbService';

interface JoinGastroTorreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JoinGastroTorreModal: React.FC<JoinGastroTorreModalProps> = ({ isOpen, onClose }) => {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [owner, setOwner] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [zone, setZone] = useState('Torrelodones Pueblo');
  const [selectedPlan, setSelectedPlan] = useState('Plan Pro Hostelero (59€/mes)');
  const [cuisine, setCuisine] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await DatabaseService.createLead({
        restaurantName: name,
        contactName: owner,
        phone,
        email: email || `${phone.replace(/\s+/g, '')}@lead.gastrotorre.es`,
        plan: selectedPlan,
        zone,
      });

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFCC00', '#111111', '#10b981']
      });
    } catch (err) {
      console.warn('Error saving lead to database:', err);
    } finally {
      setSubmitted(true);
    }
  };

  const handleWhatsAppDirect = () => {
    const text = `¡Hola GastroTorre! Quiero dar de alta mi restaurante en la plataforma:\n\n• *Restaurante:* ${name || 'Mi Restaurante'}\n• *Contacto:* ${owner || 'Encargado'}\n• *Teléfono:* ${phone || 'Móvil'}\n• *Zona:* ${zone}\n• *Plan:* ${selectedPlan}\n• *Cocina:* ${cuisine || 'Especialidades'}\n\n¿Cuáles son los siguientes pasos?`;
    window.open(`https://wa.me/34612345678?text=${encodeURIComponent(text)}`, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-sm bg-white dark:bg-[#111111] rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-[#232323] animate-scaleUp max-h-[92vh] overflow-y-auto">
        {/* Header con círculo amarillo oficial */}
        <div className="bg-[#111111] p-5 text-white relative border-b border-[#232323]">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-xl bg-[#FFCC00] flex items-center justify-center p-1 shrink-0">
              <img src="/gastrotorre_logo_negro.png" alt="GastroTorre" className="w-full h-full object-contain" />
            </div>
            <span className="text-[10px] uppercase font-bold text-[#FFCC00] tracking-wider">
              Hostelería de Torrelodones
            </span>
          </div>

          <h3 className="text-lg font-black text-white leading-tight">
            Digitaliza tu Restaurante en <span className="text-[#FFCC00]">48 Horas</span>
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            Cero esfuerzo para el hostelero: nosotros hacemos el trabajo técnico; tú solo cocinas.
          </p>
        </div>

        {/* Form or Confirmation */}
        <div className="p-5 space-y-4">
          {submitted ? (
            <div className="text-center py-4 space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <Check className="w-8 h-8" />
              </div>
              <h4 className="text-base font-black text-slate-900 dark:text-white">¡Solicitud Recibida con Éxito!</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-xs mx-auto">
                Nos pondremos en contacto contigo en menos de 48h para digitalizar tu carta y entregarte tus códigos QR oficiales.
              </p>
              <button
                onClick={handleWhatsAppDirect}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Hablar ahora por WhatsApp</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Promo badge */}
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FFCC00]/15 border border-[#FFCC00]/30 text-xs font-bold text-[#111111] dark:text-[#FFCC00]">
                <Zap className="w-4 h-4 text-[#FFCC00] shrink-0 fill-[#FFCC00]" />
                <span>🎁 0% Comisiones sobre ventas • Cuota plana fija</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nombre del Bar / Restaurante *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Mesón El Guadarrama"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#232323] border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FFCC00]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nombre de Contacto (Dueño/Encargado) *</label>
                <input
                  type="text"
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  placeholder="Ej: Carlos Gómez"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#232323] border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FFCC00]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Teléfono / WhatsApp *</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="612 34 56 78"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#232323] border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FFCC00]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Plan de Interés</label>
                  <select
                    value={selectedPlan}
                    onChange={(e) => setSelectedPlan(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#232323] border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-[#FFCC00] focus:outline-none focus:ring-2 focus:ring-[#FFCC00]"
                  >
                    <option value="Plan Pro Hostelero (59€/mes)">Plan Pro (59€/m) ⭐</option>
                    <option value="Plan Esencial (35€/mes)">Plan Esencial (35€/m)</option>
                    <option value="Servicio VIP Completo (89€/mes)">Servicio VIP (89€/m)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Zona</label>
                <select
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#232323] border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FFCC00]"
                >
                  <option value="Torrelodones Pueblo">Torrelodones Pueblo</option>
                  <option value="Torrelodones Colonia">Torrelodones Colonia</option>
                </select>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-[#FFCC00] hover:bg-[#e6b800] text-[#111111] text-xs font-black shadow-lg shadow-[#FFCC00]/25 transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar Solicitud de Alta</span>
                </button>

                <button
                  type="button"
                  onClick={handleWhatsAppDirect}
                  className="w-full py-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Solicitar directo por WhatsApp</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
